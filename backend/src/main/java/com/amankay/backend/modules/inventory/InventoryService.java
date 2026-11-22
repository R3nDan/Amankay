package com.amankay.backend.modules.inventory;

import com.amankay.backend.modules.common.DomainException;
import com.amankay.backend.modules.domain.model.InventarioSucursal;
import com.amankay.backend.modules.domain.model.MovimientoInventario;
import com.amankay.backend.modules.domain.model.RegistroAuditoria;
import com.amankay.backend.modules.domain.model.Usuario;
import com.amankay.backend.modules.domain.repository.InventarioSucursalRepository;
import com.amankay.backend.modules.domain.repository.MovimientoInventarioRepository;
import com.amankay.backend.modules.domain.repository.RegistroAuditoriaRepository;
import com.amankay.backend.modules.security.StaffAccess;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {
    private final InventarioSucursalRepository stocks;
    private final MovimientoInventarioRepository movements;
    private final RegistroAuditoriaRepository audit;
    private final StaffAccess access;

    public InventoryService(InventarioSucursalRepository stocks, MovimientoInventarioRepository movements,
            RegistroAuditoriaRepository audit, StaffAccess access) {
        this.stocks = stocks; this.movements = movements; this.audit = audit; this.access = access;
    }

    @Transactional(readOnly = true)
    public List<StockView> stock(UUID branchId) {
        access.requireRoleAtBranch("INVENTARIO", branchId);
        return stocks.findBySucursalIdOrderByProductoId(branchId).stream()
                .map(row -> new StockView(row.getId(), row.getSucursalId(), row.getProductoId(), row.getStockDisponible(), row.getFechaActualizacion())).toList();
    }

    @Transactional(readOnly = true)
    public List<MovementView> history(UUID inventoryId) {
        InventarioSucursal stock = stocks.findById(inventoryId).orElseThrow(() -> DomainException.notFound("No se encontró el inventario."));
        access.requireRoleAtBranch("INVENTARIO", stock.getSucursalId());
        return movements.findByInventarioSucursalIdOrderByFechaHoraDesc(inventoryId).stream().map(this::view).toList();
    }

    @Transactional
    public MovementView initial(UUID branchId, UUID productId, int quantity, String reason) {
        access.requireRoleAtBranch("INVENTARIO", branchId);
        if (quantity <= 0) throw invalid("La existencia inicial debe ser mayor que cero.");
        if (reason == null || reason.isBlank()) throw invalid("Indica el motivo de la existencia inicial.");
        InventarioSucursal stock = stocks.findBySucursalIdAndProductoId(branchId, productId).orElse(null);
        if (stock != null) throw DomainException.conflict("Ya existe un saldo para ese producto y sucursal.");
        stock = new InventarioSucursal(); stock.setSucursalId(branchId); stock.setProductoId(productId); stock.setStockDisponible(0);
        stock.setFechaActualizacion(Instant.now()); stock = stocks.saveAndFlush(stock);
        return createAdjustment(stock, "ENTRADA_INICIAL", quantity, reason.trim());
    }

    @Transactional
    public MovementView adjust(UUID inventoryId, AdjustmentRequest request) {
        InventarioSucursal current = stocks.findById(inventoryId).orElseThrow(() -> DomainException.notFound("No se encontró el inventario."));
        access.requireRoleAtBranch("INVENTARIO", current.getSucursalId());
        if (request.cantidad() == null || request.cantidad() <= 0) throw invalid("La cantidad debe ser mayor que cero.");
        if (request.motivo() == null || request.motivo().isBlank()) throw invalid("Cada ajuste requiere un motivo.");
        if (request.tipo() == null || !List.of("AJUSTE_POSITIVO", "AJUSTE_NEGATIVO", "MERMA").contains(request.tipo()))
            throw invalid("Tipo de ajuste no permitido.");
        InventarioSucursal stock = stocks.lockByBranchAndProduct(current.getSucursalId(), current.getProductoId())
                .orElseThrow(() -> DomainException.notFound("No se encontró el inventario."));
        if ("ENTRADA_INICIAL".equals(request.tipo())) throw DomainException.conflict("La existencia inicial se registra por su operación específica.");
        int before = stock.getStockDisponible();
        int after = "AJUSTE_POSITIVO".equals(request.tipo()) ? before + request.cantidad() : before - request.cantidad();
        if (after < 0) throw DomainException.conflict("El ajuste no puede dejar existencias negativas.");
        stock.setStockDisponible(after); stock.setFechaActualizacion(Instant.now()); stocks.save(stock);
        return createMovement(stock.getId(), access.currentUserId(), request.tipo(), request.cantidad(), before, after,
                request.motivo().trim(), "REGISTRO_AUDITORIA", auditInventoryAction(stock.getId(), request.tipo(), request.motivo().trim()).getId(), null);
    }

    @Transactional
    public MovementView compensate(UUID originalId, String reason) {
        Usuario user = access.currentUser();
        MovimientoInventario original = movements.lockById(originalId).orElseThrow(() -> DomainException.notFound("No se encontró el movimiento original."));
        InventarioSucursal row = stocks.findById(original.getInventarioSucursalId()).orElseThrow(() -> DomainException.conflict("El saldo de inventario del movimiento no existe."));
        access.requireRoleAtBranch("INVENTARIO", row.getSucursalId());
        if (original.getMovimientoCompensadoId() != null || "COMPENSACION".equals(original.getTipo()) || movements.existsByMovimientoCompensadoId(originalId))
            throw DomainException.conflict("El movimiento ya fue compensado o no puede encadenarse.");
        if (reason == null || reason.isBlank()) throw invalid("Indica el motivo de la compensación.");
        InventarioSucursal stock = stocks.lockByBranchAndProduct(row.getSucursalId(), row.getProductoId()).orElseThrow();
        boolean laterOutbound = movements.findByInventarioSucursalIdOrderByFechaHoraDesc(stock.getId()).stream()
                .anyMatch(movement -> !movement.getId().equals(original.getId())
                        && movement.getFechaHora().isAfter(original.getFechaHora())
                        && movement.getStockResultante() < movement.getStockAnterior());
        if (laterOutbound) throw DomainException.conflict("Hay salidas posteriores al movimiento; se requiere revisión antes de compensarlo.");
        int before = stock.getStockDisponible();
        int delta = original.getStockResultante() - original.getStockAnterior();
        int after = before - delta;
        if (after < 0) throw DomainException.conflict("La compensación completa dejaría el stock negativo; se requiere revisión operativa.");
        stock.setStockDisponible(after); stock.setFechaActualizacion(Instant.now()); stocks.save(stock);
        return createMovement(stock.getId(), user.getId(), "COMPENSACION", original.getCantidad(), before, after,
                reason.trim(), "MOVIMIENTO_COMPENSADO", original.getId(), original.getId());
    }

    private MovementView createAdjustment(InventarioSucursal stock, String type, int quantity, String reason) {
        int before = stock.getStockDisponible(); int after = before + quantity;
        stock.setStockDisponible(after); stock.setFechaActualizacion(Instant.now()); stocks.save(stock);
        RegistroAuditoria origin = auditInventoryAction(stock.getId(), type, reason);
        return createMovement(stock.getId(), access.currentUserId(), type, quantity, before, after, reason, "REGISTRO_AUDITORIA", origin.getId(), null);
    }

    private RegistroAuditoria auditInventoryAction(UUID inventoryId, String operation, String description) {
        Usuario user = access.currentUser();
        RegistroAuditoria row = new RegistroAuditoria(); row.setFechaHora(Instant.now()); row.setOperacion(operation);
        row.setEntidad("InventarioSucursal"); row.setEntidadId(inventoryId); row.setTipoActor("USUARIO");
        row.setUsuarioId(user.getId()); row.setDescripcion(description);
        return audit.save(row);
    }

    private MovementView createMovement(UUID inventoryId, UUID userId, String type, int quantity, int before, int after,
            String reason, String originType, UUID originId, UUID compensates) {
        MovimientoInventario row = new MovimientoInventario(); row.setInventarioSucursalId(inventoryId); row.setUsuarioId(userId);
        row.setTipo(type); row.setCantidad(quantity); row.setStockAnterior(before); row.setStockResultante(after);
        row.setFechaHora(Instant.now()); row.setMotivo(reason); row.setTipoOrigen(originType); row.setIdOrigen(originId);
        row.setMovimientoCompensadoId(compensates);
        return view(movements.save(row));
    }

    private MovementView view(MovimientoInventario row) {
        return new MovementView(row.getId(), row.getInventarioSucursalId(), row.getUsuarioId(), row.getTipo(), row.getCantidad(),
                row.getStockAnterior(), row.getStockResultante(), row.getFechaHora(), row.getMotivo(), row.getTipoOrigen(), row.getIdOrigen(), row.getMovimientoCompensadoId());
    }
    private DomainException invalid(String message) { return new DomainException(HttpStatus.BAD_REQUEST, message); }

    public record AdjustmentRequest(String tipo, Integer cantidad, String motivo) {}
    public record StockView(UUID id, UUID sucursalId, UUID productoId, Integer disponible, Instant actualizadoEn) {}
    public record MovementView(UUID id, UUID inventarioSucursalId, UUID usuarioId, String tipo, Integer cantidad,
            Integer stockAnterior, Integer stockResultante, Instant fecha, String motivo, String tipoOrigen,
            UUID idOrigen, UUID movimientoCompensadoId) {}
}
