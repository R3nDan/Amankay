package com.amankay.backend.modules.reports;

import com.amankay.backend.modules.common.DomainException;
import com.amankay.backend.modules.domain.model.Pedido;
import com.amankay.backend.modules.domain.model.MovimientoInventario;
import com.amankay.backend.modules.domain.model.Producto;
import com.amankay.backend.modules.domain.model.RegistroAuditoria;
import com.amankay.backend.modules.domain.model.SolicitudReposicion;
import com.amankay.backend.modules.domain.repository.PedidoRepository;
import com.amankay.backend.modules.domain.repository.MovimientoInventarioRepository;
import com.amankay.backend.modules.domain.repository.ProductoRepository;
import com.amankay.backend.modules.domain.repository.RegistroAuditoriaRepository;
import com.amankay.backend.modules.domain.repository.SolicitudReposicionRepository;
import com.amankay.backend.modules.inventory.InventoryService;
import com.amankay.backend.modules.orders.OrderService;
import com.amankay.backend.modules.security.StaffAccess;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {
    private final PedidoRepository orders;
    private final SolicitudReposicionRepository replenishments;
    private final InventoryService inventory;
    private final StaffAccess access;
    private final RegistroAuditoriaRepository audit;
    private final MovimientoInventarioRepository movements;
    private final ProductoRepository products;

    public ReportController(PedidoRepository orders, SolicitudReposicionRepository replenishments,
            InventoryService inventory, StaffAccess access, RegistroAuditoriaRepository audit,
            MovimientoInventarioRepository movements, ProductoRepository products) {
        this.orders = orders; this.replenishments = replenishments; this.inventory = inventory; this.access = access;
        this.audit = audit; this.movements = movements; this.products = products;
    }

    @GetMapping("/sales")
    @PreAuthorize("hasAnyRole('ATENCION','ADMINISTRADOR')")
    public SalesReport sales(@RequestParam UUID sucursalId, @RequestParam Instant desde, @RequestParam Instant hasta) {
        access.requireRoleAtBranchOrAdmin("ATENCION", sucursalId); validateRange(desde, hasta);
        List<UUID> completedIds = audit.findByEntidadAndOperacionAndFechaHoraBetweenOrderByFechaHoraDesc(
                "Pedido", "CAMBIO_ESTADO", desde, hasta).stream()
                .filter(row -> "{\"estado\":\"COMPLETADO\"}".equals(row.getValorNuevo()))
                .map(RegistroAuditoria::getEntidadId).distinct().toList();
        List<Pedido> completed = orders.findAllById(completedIds).stream()
                .filter(row -> sucursalId.equals(row.getSucursalId()) && "COMPLETADO".equals(row.getEstado())).toList();
        BigDecimal total = completed.stream().map(Pedido::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new SalesReport(sucursalId, desde, hasta, completed.size(), total);
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('ATENCION','ADMINISTRADOR')")
    public List<OrderService.OrderSummary> orderHistory(@RequestParam UUID sucursalId, @RequestParam Instant desde, @RequestParam Instant hasta) {
        access.requireRoleAtBranchOrAdmin("ATENCION", sucursalId); validateRange(desde, hasta);
        return orders.findBySucursalIdAndFechaCreacionBetweenOrderByFechaCreacionDesc(sucursalId, desde, hasta).stream()
                .map(order -> new OrderService.OrderSummary(order.getId(), order.getCodigoSeguimiento(), order.getEstado(),
                        order.getModalidadEntrega(), order.getFechaCreacion(), order.getFechaVencimiento(), order.getTotal(), order.getSucursalId(), order.getTipo())).toList();
    }

    @GetMapping("/inventory")
    @PreAuthorize("hasAnyRole('INVENTARIO','ADMINISTRADOR')")
    public List<StockReport> inventory(@RequestParam UUID sucursalId) {
        List<InventoryService.StockView> rows = inventory.stockForReport(sucursalId);
        Map<UUID, Producto> names = products.findAllById(rows.stream().map(InventoryService.StockView::productoId).toList())
                .stream().collect(Collectors.toMap(Producto::getId, Function.identity()));
        return rows.stream().map(row -> new StockReport(row.id(), row.productoId(),
                names.containsKey(row.productoId()) ? names.get(row.productoId()).getNombre() : "Producto no disponible",
                row.disponible(), row.actualizadoEn())).toList();
    }

    @GetMapping("/inventory/movements")
    @PreAuthorize("hasAnyRole('INVENTARIO','ADMINISTRADOR')")
    public List<MovementReport> inventoryMovements(@RequestParam UUID sucursalId) {
        List<StockReport> stock = inventory(sucursalId);
        if (stock.isEmpty()) return List.of();
        Map<UUID, String> names = stock.stream().collect(Collectors.toMap(StockReport::id, StockReport::producto));
        return movements.findByInventarioSucursalIdInOrderByFechaHoraDesc(stock.stream().map(StockReport::id).toList())
                .stream().map(row -> new MovementReport(row.getId(), names.get(row.getInventarioSucursalId()),
                        row.getTipo(), row.getCantidad(), row.getStockAnterior(), row.getStockResultante(),
                        row.getFechaHora(), row.getMotivo(), row.getTipoOrigen(), row.getIdOrigen())).toList();
    }

    @GetMapping("/replenishments")
    @PreAuthorize("hasAnyRole('INVENTARIO','ADMINISTRADOR')")
    public List<ReplenishmentSummary> replenishment(@RequestParam UUID sucursalId) {
        access.requireRoleAtBranchOrAdmin("INVENTARIO", sucursalId);
        return replenishments.findBySucursalSolicitanteIdOrSucursalProveedoraIdOrderByFechaSolicitudDesc(sucursalId, sucursalId).stream()
                .map(row -> new ReplenishmentSummary(row.getId(), row.getEstado(), row.getFechaSolicitud(), row.getSucursalProveedoraId())).toList();
    }

    private void validateRange(Instant from, Instant to) {
        if (from == null || to == null || from.isAfter(to)) throw new DomainException(org.springframework.http.HttpStatus.BAD_REQUEST, "El intervalo de fechas no es válido.");
    }
    public record SalesReport(UUID sucursalId, Instant desde, Instant hasta, long pedidosCompletados, BigDecimal ventasCOP) {}
    public record StockReport(UUID id, UUID productoId, String producto, int disponible, Instant actualizadoEn) {}
    public record MovementReport(UUID id, String producto, String tipo, int cantidad, int stockAnterior,
            int stockResultante, Instant fecha, String motivo, String tipoOrigen, UUID idOrigen) {}
    public record ReplenishmentSummary(UUID id, String estado, Instant fecha, UUID sucursalProveedoraId) {}
}
