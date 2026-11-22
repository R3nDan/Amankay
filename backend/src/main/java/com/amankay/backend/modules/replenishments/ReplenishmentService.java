package com.amankay.backend.modules.replenishments;

import com.amankay.backend.modules.common.DomainException;
import com.amankay.backend.modules.domain.model.DetalleDespachoReposicion;
import com.amankay.backend.modules.domain.model.DetalleRecepcionReposicion;
import com.amankay.backend.modules.domain.model.DetalleSolicitudReposicion;
import com.amankay.backend.modules.domain.model.DespachoReposicion;
import com.amankay.backend.modules.domain.model.InventarioSucursal;
import com.amankay.backend.modules.domain.model.MovimientoInventario;
import com.amankay.backend.modules.domain.model.Producto;
import com.amankay.backend.modules.domain.model.RecepcionReposicion;
import com.amankay.backend.modules.domain.model.SolicitudReposicion;
import com.amankay.backend.modules.domain.model.Sucursal;
import com.amankay.backend.modules.domain.repository.DetalleDespachoReposicionRepository;
import com.amankay.backend.modules.domain.repository.DetalleRecepcionReposicionRepository;
import com.amankay.backend.modules.domain.repository.DetalleSolicitudReposicionRepository;
import com.amankay.backend.modules.domain.repository.DespachoReposicionRepository;
import com.amankay.backend.modules.domain.repository.InventarioSucursalRepository;
import com.amankay.backend.modules.domain.repository.MovimientoInventarioRepository;
import com.amankay.backend.modules.domain.repository.ProductoRepository;
import com.amankay.backend.modules.domain.repository.RecepcionReposicionRepository;
import com.amankay.backend.modules.domain.repository.SolicitudReposicionRepository;
import com.amankay.backend.modules.domain.repository.SucursalRepository;
import com.amankay.backend.modules.security.StaffAccess;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReplenishmentService {
    private final SolicitudReposicionRepository requests;
    private final DetalleSolicitudReposicionRepository requestLines;
    private final DespachoReposicionRepository dispatches;
    private final DetalleDespachoReposicionRepository dispatchLines;
    private final RecepcionReposicionRepository receipts;
    private final DetalleRecepcionReposicionRepository receiptLines;
    private final ProductoRepository products;
    private final SucursalRepository branches;
    private final InventarioSucursalRepository stockRows;
    private final MovimientoInventarioRepository movements;
    private final StaffAccess access;

    public ReplenishmentService(SolicitudReposicionRepository requests, DetalleSolicitudReposicionRepository requestLines,
            DespachoReposicionRepository dispatches, DetalleDespachoReposicionRepository dispatchLines,
            RecepcionReposicionRepository receipts, DetalleRecepcionReposicionRepository receiptLines,
            ProductoRepository products, SucursalRepository branches, InventarioSucursalRepository stockRows,
            MovimientoInventarioRepository movements, StaffAccess access) {
        this.requests = requests; this.requestLines = requestLines; this.dispatches = dispatches; this.dispatchLines = dispatchLines;
        this.receipts = receipts; this.receiptLines = receiptLines; this.products = products; this.branches = branches;
        this.stockRows = stockRows; this.movements = movements; this.access = access;
    }

    @Transactional(readOnly = true)
    public List<RequestView> list(UUID branchId) {
        access.requireRoleAtBranch("INVENTARIO", branchId);
        return requests.findBySucursalSolicitanteIdOrderByFechaSolicitudDesc(branchId).stream().map(this::view).toList();
    }

    @Transactional(readOnly = true)
    public List<RequestView> reviewQueue(UUID providerBranchId) {
        access.requireRoleAtBranch("INVENTARIO", providerBranchId);
        return requests.findBySucursalProveedoraIdAndEstadoOrderByFechaSolicitudAsc(providerBranchId, "PENDIENTE_REVISION")
                .stream().map(this::view).toList();
    }

    @Transactional
    public RequestView create(CreateRequest body) {
        Sucursal requester = branch(body.sucursalSolicitanteId());
        Sucursal provider = branch(body.sucursalProveedoraId());
        access.requireRoleAtBranch("INVENTARIO", requester.getId());
        if (!"SECUNDARIA".equals(requester.getTipo()) || !"PRINCIPAL".equals(provider.getTipo()))
            throw DomainException.conflict("La sucursal secundaria solicita reposición a la principal.");
        if (requester.getId().equals(provider.getId())) throw invalid("Las sucursales deben ser distintas.");
        Map<UUID, Integer> items = quantities(body.items());
        SolicitudReposicion request = new SolicitudReposicion(); request.setSucursalSolicitanteId(requester.getId());
        request.setSucursalProveedoraId(provider.getId()); request.setSolicitadaPor(access.currentUserId());
        request.setEstado("PENDIENTE_REVISION"); request.setFechaSolicitud(Instant.now()); request.setObservaciones(body.observaciones());
        request = requests.save(request);
        for (var item : items.entrySet()) {
            if (products.findById(item.getKey()).filter(Producto::getActivo).isEmpty()) throw DomainException.notFound("Uno de los productos no está activo.");
            DetalleSolicitudReposicion line = new DetalleSolicitudReposicion(); line.setSolicitudId(request.getId()); line.setProductoId(item.getKey());
            line.setCantidadSolicitada(item.getValue()); requestLines.save(line);
        }
        return view(request);
    }

    @Transactional
    public RequestView review(UUID requestId, ReviewRequest body) {
        SolicitudReposicion request = lockedRequest(requestId);
        access.requireRoleAtBranch("INVENTARIO", request.getSucursalProveedoraId());
        if (!"PENDIENTE_REVISION".equals(request.getEstado())) throw DomainException.conflict("La solicitud ya fue revisada.");
        if (!body.aprobar()) {
            if (body.motivo() == null || body.motivo().isBlank()) throw invalid("Indica el motivo del rechazo.");
            request.setEstado("RECHAZADA"); request.setMotivoRechazo(body.motivo().trim());
        } else {
            Map<UUID, Integer> approved = body.cantidadesAprobadas() == null ? Map.of() : body.cantidadesAprobadas();
            List<DetalleSolicitudReposicion> lines = requestLines.findBySolicitudIdOrderById(requestId);
            if (lines.stream().anyMatch(line -> !approved.containsKey(line.getId()))) throw invalid("Indica la cantidad aprobada de cada producto.");
            for (DetalleSolicitudReposicion line : lines) {
                Integer quantity = approved.get(line.getId());
                if (quantity == null || quantity < 1 || quantity > line.getCantidadSolicitada()) throw invalid("La cantidad aprobada debe estar entre uno y lo solicitado; rechaza la solicitud si no se despachará.");
                line.setCantidadAprobada(quantity); requestLines.save(line);
            }
            request.setEstado("EN_PROCESO");
        }
        request.setRevisadaPor(access.currentUserId()); request.setFechaRevision(Instant.now());
        return view(requests.save(request));
    }

    @Transactional
    public DispatchView dispatch(UUID requestId, DispatchRequest body) {
        SolicitudReposicion request = lockedRequest(requestId);
        access.requireRoleAtBranch("INVENTARIO", request.getSucursalProveedoraId());
        if (!"EN_PROCESO".equals(request.getEstado())) throw DomainException.conflict("La solicitud debe estar aprobada para despachar.");
        Map<UUID, Integer> quantities = quantitiesByLine(body.items());
        DespachoReposicion dispatch = new DespachoReposicion(); dispatch.setSolicitudId(requestId); dispatch.setDespachadoPor(access.currentUserId());
        dispatch.setFechaDespacho(Instant.now()); dispatch.setObservaciones(body.observaciones()); dispatch = dispatches.save(dispatch);
        for (var item : quantities.entrySet()) {
            DetalleSolicitudReposicion requested = requestLines.lockById(item.getKey()).orElseThrow(() -> DomainException.notFound("No se encontró la línea solicitada."));
            if (!requestId.equals(requested.getSolicitudId())) throw invalid("La línea no pertenece a esta solicitud.");
            int pending = requested.getCantidadAprobada() - dispatchedTotal(requested.getId()) - activePreDispatchClosure(requested);
            if (item.getValue() > pending) throw DomainException.conflict("La cantidad enviada supera el saldo aprobado pendiente.");
            InventarioSucursal stock = stockRows.lockByBranchAndProduct(request.getSucursalProveedoraId(), requested.getProductoId())
                    .orElseThrow(() -> DomainException.conflict("No hay saldo de inventario registrado en la sucursal proveedora."));
            int before = stock.getStockDisponible(); int after = before - item.getValue();
            if (after < 0) throw DomainException.conflict("La sucursal proveedora no tiene existencias suficientes.");
            stock.setStockDisponible(after); stock.setFechaActualizacion(Instant.now()); stockRows.save(stock);
            DetalleDespachoReposicion line = new DetalleDespachoReposicion(); line.setDespachoId(dispatch.getId());
            line.setDetalleSolicitudId(requested.getId()); line.setCantidadEnviada(item.getValue()); line = dispatchLines.save(line);
            createMovement(stock.getId(), "DESPACHO_REPOSICION", item.getValue(), before, after,
                    "Despacho de reposición " + dispatch.getId(), "DETALLE_DESPACHO_REPOSICION", line.getId());
        }
        return dispatchView(dispatch);
    }

    @Transactional
    public ReceiptView receive(UUID dispatchId, ReceiptRequest body) {
        DespachoReposicion dispatch = dispatches.lockById(dispatchId).orElseThrow(() -> DomainException.notFound("No se encontró el despacho."));
        SolicitudReposicion request = lockedRequest(dispatch.getSolicitudId());
        access.requireRoleAtBranch("INVENTARIO", request.getSucursalSolicitanteId());
        if (dispatch.getAnuladoEn() != null) throw DomainException.conflict("No se reciben líneas de un despacho anulado.");
        Map<UUID, ReceiptQuantity> quantities = receiptQuantities(body.items());
        RecepcionReposicion receipt = new RecepcionReposicion(); receipt.setDespachoId(dispatchId); receipt.setResponsableId(access.currentUserId());
        receipt.setFechaRecepcion(Instant.now()); receipt.setObservaciones(body.observaciones()); receipt = receipts.save(receipt);
        for (var item : quantities.entrySet()) {
            DetalleDespachoReposicion dispatched = dispatchLines.lockById(item.getKey()).orElseThrow(() -> DomainException.notFound("No se encontró la línea despachada."));
            if (!dispatchId.equals(dispatched.getDespachoId())) throw invalid("La línea no pertenece a este despacho.");
            ReceiptQuantity qty = item.getValue();
            int received = receivedTotal(dispatched.getId());
            int pending = dispatched.getCantidadEnviada() - received - activePostDispatchClosure(dispatched);
            if (qty.aptas() + qty.danadas() <= 0 || qty.aptas() + qty.danadas() > pending)
                throw DomainException.conflict("La recepción supera el saldo pendiente del despacho.");
            DetalleRecepcionReposicion line = new DetalleRecepcionReposicion(); line.setRecepcionId(receipt.getId());
            line.setDetalleDespachoId(dispatched.getId()); line.setCantidadApta(qty.aptas()); line.setCantidadDanada(qty.danadas());
            line = receiptLines.save(line);
            if (qty.aptas() > 0) {
                DetalleSolicitudReposicion requested = requestLines.findById(dispatched.getDetalleSolicitudId()).orElseThrow();
                InventarioSucursal stock = stockRows.lockByBranchAndProduct(request.getSucursalSolicitanteId(), requested.getProductoId()).orElseGet(() -> {
                    InventarioSucursal created = new InventarioSucursal(); created.setSucursalId(request.getSucursalSolicitanteId());
                    created.setProductoId(requested.getProductoId()); created.setStockDisponible(0); created.setFechaActualizacion(Instant.now());
                    return stockRows.saveAndFlush(created);
                });
                int before = stock.getStockDisponible(), after = before + qty.aptas();
                stock.setStockDisponible(after); stock.setFechaActualizacion(Instant.now()); stockRows.save(stock);
                createMovement(stock.getId(), "RECEPCION_REPOSICION", qty.aptas(), before, after,
                        "Recepción de reposición " + receipt.getId(), "DETALLE_RECEPCION_REPOSICION", line.getId());
            }
        }
        completeIfReady(request);
        return receiptView(receipt);
    }

    @Transactional
    public RequestLineView closeBeforeDispatch(UUID lineId, String reason) {
        DetalleSolicitudReposicion line = requestLines.lockById(lineId).orElseThrow(() -> DomainException.notFound("No se encontró la línea solicitada."));
        SolicitudReposicion request = lockedRequest(line.getSolicitudId());
        access.requireRoleAtBranch("INVENTARIO", request.getSucursalProveedoraId());
        if (!"EN_PROCESO".equals(request.getEstado())) throw DomainException.conflict("La solicitud no está en proceso.");
        if (reason == null || reason.isBlank()) throw invalid("Indica el motivo del cierre de faltante.");
        if (line.getCantidadFaltanteCerrada() != null || line.getFechaReversa() != null)
            throw DomainException.conflict("Esta línea ya tuvo su único cierre o reversa permitidos.");
        int pending = line.getCantidadAprobada() - dispatchedTotal(lineId);
        if (pending <= 0) throw DomainException.conflict("La línea no tiene un faltante pendiente por cerrar.");
        close(line, pending, reason.trim());
        requestLines.save(line);
        completeIfReady(request);
        return requestLineView(line);
    }

    @Transactional
    public RequestLineView reverseBeforeDispatchClosure(UUID lineId, String reason) {
        DetalleSolicitudReposicion line = requestLines.lockById(lineId).orElseThrow(() -> DomainException.notFound("No se encontró la línea solicitada."));
        SolicitudReposicion request = lockedRequest(line.getSolicitudId());
        access.requireRoleAtBranch("INVENTARIO", request.getSucursalProveedoraId());
        if (line.getCantidadFaltanteCerrada() == null || line.getFechaReversa() != null)
            throw DomainException.conflict("No hay un cierre previo vigente que pueda reversarse.");
        reverse(line, reason);
        requestLines.save(line);
        request.setEstado("EN_PROCESO"); requests.save(request);
        return requestLineView(line);
    }

    @Transactional
    public DispatchLineView closeAfterDispatch(UUID lineId, String reason) {
        DetalleDespachoReposicion line = dispatchLines.lockById(lineId).orElseThrow(() -> DomainException.notFound("No se encontró la línea despachada."));
        DespachoReposicion dispatch = dispatches.lockById(line.getDespachoId()).orElseThrow(() -> DomainException.notFound("No se encontró el despacho."));
        SolicitudReposicion request = lockedRequest(dispatch.getSolicitudId());
        access.requireRoleAtBranch("INVENTARIO", request.getSucursalSolicitanteId());
        if (dispatch.getAnuladoEn() != null) throw DomainException.conflict("No se cierra faltante de un despacho anulado.");
        if (reason == null || reason.isBlank()) throw invalid("Indica el motivo del cierre de faltante.");
        if (line.getCantidadFaltanteCerrada() != null || line.getFechaReversa() != null)
            throw DomainException.conflict("Esta línea ya tuvo su único cierre o reversa permitidos.");
        int pending = line.getCantidadEnviada() - receivedTotal(lineId);
        if (pending <= 0) throw DomainException.conflict("La línea no tiene una recepción pendiente por cerrar.");
        close(line, pending, reason.trim());
        dispatchLines.save(line);
        completeIfReady(request);
        return dispatchLineView(line);
    }

    @Transactional
    public DispatchLineView reverseAfterDispatchClosure(UUID lineId, String reason) {
        DetalleDespachoReposicion line = dispatchLines.lockById(lineId).orElseThrow(() -> DomainException.notFound("No se encontró la línea despachada."));
        DespachoReposicion dispatch = dispatches.lockById(line.getDespachoId()).orElseThrow(() -> DomainException.notFound("No se encontró el despacho."));
        SolicitudReposicion request = lockedRequest(dispatch.getSolicitudId());
        access.requireRoleAtBranch("INVENTARIO", request.getSucursalSolicitanteId());
        if (line.getCantidadFaltanteCerrada() == null || line.getFechaReversa() != null)
            throw DomainException.conflict("No hay un cierre previo vigente que pueda reversarse.");
        reverse(line, reason);
        dispatchLines.save(line);
        request.setEstado("EN_PROCESO"); requests.save(request);
        return dispatchLineView(line);
    }

    @Transactional
    public DispatchView annulDispatch(UUID dispatchId, String reason) {
        DespachoReposicion dispatch = dispatches.lockById(dispatchId).orElseThrow(() -> DomainException.notFound("No se encontró el despacho."));
        SolicitudReposicion request = lockedRequest(dispatch.getSolicitudId());
        access.requireRoleAtBranch("INVENTARIO", request.getSucursalProveedoraId());
        requireReason(reason);
        if (dispatch.getAnuladoEn() != null) throw DomainException.conflict("El despacho ya está anulado.");
        if (receipts.findByDespachoIdOrderByFechaRecepcionAsc(dispatchId).stream().anyMatch(receipt -> receipt.getAnuladoEn() == null))
            throw DomainException.conflict("Anula primero todas las recepciones activas del despacho.");
        for (DetalleDespachoReposicion line : dispatchLines.findByDespachoIdOrderById(dispatchId)) {
            MovimientoInventario movement = movements.findByTipoOrigenAndIdOrigen("DETALLE_DESPACHO_REPOSICION", line.getId())
                    .orElseThrow(() -> DomainException.conflict("No se encontró el movimiento del despacho."));
            compensateMovement(movement, "Anulación de despacho: " + reason.trim());
        }
        dispatch.setAnuladoEn(Instant.now()); dispatch.setAnuladoPor(access.currentUserId()); dispatch.setMotivoAnulacion(reason.trim());
        dispatch = dispatches.save(dispatch);
        request.setEstado("EN_PROCESO"); requests.save(request);
        return dispatchView(dispatch);
    }

    @Transactional
    public ReceiptView annulReceipt(UUID receiptId, String reason) {
        RecepcionReposicion receipt = receipts.lockById(receiptId).orElseThrow(() -> DomainException.notFound("No se encontró la recepción."));
        DespachoReposicion dispatch = dispatches.lockById(receipt.getDespachoId()).orElseThrow(() -> DomainException.notFound("No se encontró el despacho."));
        SolicitudReposicion request = lockedRequest(dispatch.getSolicitudId());
        access.requireRoleAtBranch("INVENTARIO", request.getSucursalSolicitanteId());
        requireReason(reason);
        if (receipt.getAnuladoEn() != null) throw DomainException.conflict("La recepción ya está anulada.");
        if (dispatch.getAnuladoEn() != null) throw DomainException.conflict("No se modifica una recepción cuyo despacho fue anulado.");
        for (DetalleRecepcionReposicion line : receiptLines.findByRecepcionIdOrderById(receiptId)) {
            if (line.getCantidadApta() == 0) continue;
            MovimientoInventario movement = movements.findByTipoOrigenAndIdOrigen("DETALLE_RECEPCION_REPOSICION", line.getId())
                    .orElseThrow(() -> DomainException.conflict("No se encontró el movimiento de recepción."));
            compensateMovement(movement, "Anulación de recepción: " + reason.trim());
        }
        receipt.setAnuladoEn(Instant.now()); receipt.setAnuladoPor(access.currentUserId()); receipt.setMotivoAnulacion(reason.trim());
        receipt = receipts.save(receipt);
        request.setEstado("EN_PROCESO"); requests.save(request);
        return receiptView(receipt);
    }

    private void completeIfReady(SolicitudReposicion request) {
        for (DetalleSolicitudReposicion detail : requestLines.findBySolicitudIdOrderById(request.getId())) {
            int approved = detail.getCantidadAprobada() == null ? 0 : detail.getCantidadAprobada();
            if (dispatchedTotal(detail.getId()) + activePreDispatchClosure(detail) < approved) return;
            for (DetalleDespachoReposicion dispatched : dispatchLines.findByDetalleSolicitudIdOrderById(detail.getId())) {
                if (!dispatches.findById(dispatched.getDespachoId()).map(d -> d.getAnuladoEn() != null).orElse(true)
                        && receivedTotal(dispatched.getId()) + activePostDispatchClosure(dispatched) < dispatched.getCantidadEnviada()) return;
            }
        }
        request.setEstado("COMPLETADA"); requests.save(request);
    }

    private int dispatchedTotal(UUID requestLineId) {
        return dispatchLines.findByDetalleSolicitudIdOrderById(requestLineId).stream()
                .filter(line -> dispatches.findById(line.getDespachoId()).map(row -> row.getAnuladoEn() == null).orElse(false))
                .mapToInt(DetalleDespachoReposicion::getCantidadEnviada).sum();
    }
    private int activePreDispatchClosure(DetalleSolicitudReposicion line) {
        return line.getCantidadFaltanteCerrada() != null && line.getFechaReversa() == null ? line.getCantidadFaltanteCerrada() : 0;
    }
    private int activePostDispatchClosure(DetalleDespachoReposicion line) {
        return line.getCantidadFaltanteCerrada() != null && line.getFechaReversa() == null ? line.getCantidadFaltanteCerrada() : 0;
    }
    private int receivedTotal(UUID dispatchLineId) {
        return receiptLines.findByDetalleDespachoIdOrderById(dispatchLineId).stream()
                .filter(line -> receipts.findById(line.getRecepcionId()).map(row -> row.getAnuladoEn() == null).orElse(false))
                .mapToInt(line -> line.getCantidadApta() + line.getCantidadDanada()).sum();
    }
    private void compensateMovement(MovimientoInventario original, String reason) {
        if ("COMPENSACION".equals(original.getTipo()) || original.getMovimientoCompensadoId() != null
                || movements.existsByMovimientoCompensadoId(original.getId()))
            throw DomainException.conflict("El movimiento ya fue compensado o no puede encadenarse.");
        InventarioSucursal row = stockRows.findById(original.getInventarioSucursalId())
                .orElseThrow(() -> DomainException.conflict("No existe el saldo de inventario del movimiento."));
        InventarioSucursal stock = stockRows.lockByBranchAndProduct(row.getSucursalId(), row.getProductoId()).orElseThrow();
        boolean laterOutbound = movements.findByInventarioSucursalIdOrderByFechaHoraDesc(stock.getId()).stream()
                .anyMatch(movement -> !movement.getId().equals(original.getId())
                        && movement.getFechaHora().isAfter(original.getFechaHora())
                        && movement.getStockResultante() < movement.getStockAnterior());
        if (laterOutbound) throw DomainException.conflict("Hay salidas posteriores al movimiento; se requiere revisión antes de compensarlo.");
        int delta = original.getStockResultante() - original.getStockAnterior();
        int before = stock.getStockDisponible(), after = before - delta;
        if (after < 0) throw DomainException.conflict("El producto pudo haberse consumido; requiere revisión antes de anular el evento.");
        stock.setStockDisponible(after); stock.setFechaActualizacion(Instant.now()); stockRows.save(stock);
        createMovement(stock.getId(), "COMPENSACION", original.getCantidad(), before, after, reason,
                "MOVIMIENTO_COMPENSADO", original.getId());
    }
    private void createMovement(UUID inventoryId, String type, int quantity, int before, int after, String reason,
            String originType, UUID originId) {
        MovimientoInventario movement = new MovimientoInventario(); movement.setInventarioSucursalId(inventoryId);
        movement.setUsuarioId(access.currentUserId()); movement.setTipo(type); movement.setCantidad(quantity);
        movement.setStockAnterior(before); movement.setStockResultante(after); movement.setFechaHora(Instant.now());
        movement.setMotivo(reason); movement.setTipoOrigen(originType); movement.setIdOrigen(originId);
        if ("MOVIMIENTO_COMPENSADO".equals(originType)) movement.setMovimientoCompensadoId(originId);
        movements.save(movement);
    }
    private void close(DetalleSolicitudReposicion line, int quantity, String reason) {
        line.setCantidadFaltanteCerrada(quantity); line.setMotivoCierre(reason); line.setFechaCierre(Instant.now()); line.setCerradoPor(access.currentUserId());
    }
    private void close(DetalleDespachoReposicion line, int quantity, String reason) {
        line.setCantidadFaltanteCerrada(quantity); line.setMotivoCierre(reason); line.setFechaCierre(Instant.now()); line.setCerradoPor(access.currentUserId());
    }
    private void reverse(DetalleSolicitudReposicion line, String reason) {
        requireReason(reason); line.setFechaReversa(Instant.now()); line.setRevertidoPor(access.currentUserId()); line.setMotivoReversa(reason.trim());
    }
    private void reverse(DetalleDespachoReposicion line, String reason) {
        requireReason(reason); line.setFechaReversa(Instant.now()); line.setRevertidoPor(access.currentUserId()); line.setMotivoReversa(reason.trim());
    }
    private void requireReason(String reason) { if (reason == null || reason.isBlank()) throw invalid("Indica el motivo de la operación."); }
    private SolicitudReposicion lockedRequest(UUID id) {
        return requests.lockById(id).orElseThrow(() -> DomainException.notFound("No se encontró la solicitud."));
    }
    private Sucursal branch(UUID id) { return branches.findById(id).filter(row -> Boolean.TRUE.equals(row.getActiva())).orElseThrow(() -> DomainException.notFound("No se encontró una sucursal activa.")); }
    private Map<UUID, Integer> quantities(List<ProductQuantity> list) {
        if (list == null || list.isEmpty()) throw invalid("Incluye al menos un producto.");
        Map<UUID, Integer> result = new LinkedHashMap<>();
        for (ProductQuantity row : list) { if (row.cantidad() == null || row.cantidad() <= 0) throw invalid("La cantidad debe ser positiva."); result.merge(row.productoId(), row.cantidad(), Integer::sum); }
        return result;
    }
    private Map<UUID, Integer> quantitiesByLine(List<LineQuantity> list) {
        if (list == null || list.isEmpty()) throw invalid("Incluye las cantidades que vas a despachar.");
        Map<UUID, Integer> map = new LinkedHashMap<>();
        for (LineQuantity row : list) { if (row.cantidad() == null || row.cantidad() <= 0 || map.putIfAbsent(row.detalleSolicitudId(), row.cantidad()) != null) throw invalid("Cada línea debe aparecer una vez con cantidad positiva."); }
        return map;
    }
    private Map<UUID, ReceiptQuantity> receiptQuantities(List<ReceiptLineQuantity> list) {
        if (list == null || list.isEmpty()) throw invalid("Incluye las cantidades recibidas.");
        Map<UUID, ReceiptQuantity> map = new LinkedHashMap<>();
        for (ReceiptLineQuantity row : list) { if (row.cantidadApta() == null || row.cantidadDanada() == null || row.cantidadApta() < 0 || row.cantidadDanada() < 0 || map.putIfAbsent(row.detalleDespachoId(), new ReceiptQuantity(row.cantidadApta(), row.cantidadDanada())) != null) throw invalid("Cada línea debe aparecer una vez con cantidades no negativas."); }
        return map;
    }
    private RequestView view(SolicitudReposicion row) {
        List<RequestLineView> detail = requestLines.findBySolicitudIdOrderById(row.getId()).stream()
                .map(this::requestLineView).toList();
        return new RequestView(row.getId(), row.getSucursalSolicitanteId(), row.getSucursalProveedoraId(), row.getEstado(), row.getFechaSolicitud(), detail);
    }
    private RequestLineView requestLineView(DetalleSolicitudReposicion line) {
        int pending = line.getCantidadAprobada() == null ? 0 : Math.max(0, line.getCantidadAprobada() - dispatchedTotal(line.getId()) - activePreDispatchClosure(line));
        return new RequestLineView(line.getId(), line.getProductoId(), line.getCantidadSolicitada(), line.getCantidadAprobada(),
                dispatchedTotal(line.getId()), pending, line.getCantidadFaltanteCerrada(), line.getFechaReversa());
    }
    private DispatchLineView dispatchLineView(DetalleDespachoReposicion line) {
        int received = receivedTotal(line.getId());
        int pending = Math.max(0, line.getCantidadEnviada() - received - activePostDispatchClosure(line));
        return new DispatchLineView(line.getId(), line.getDetalleSolicitudId(), line.getCantidadEnviada(), received,
                pending, line.getCantidadFaltanteCerrada(), line.getFechaReversa());
    }
    private DispatchView dispatchView(DespachoReposicion row) {
        return new DispatchView(row.getId(), row.getSolicitudId(), row.getFechaDespacho(), row.getAnuladoEn() != null,
                row.getMotivoAnulacion(), dispatchLines.findByDespachoIdOrderById(row.getId()).stream().map(this::dispatchLineView).toList());
    }
    private ReceiptView receiptView(RecepcionReposicion row) {
        return new ReceiptView(row.getId(), row.getDespachoId(), row.getFechaRecepcion(), row.getAnuladoEn() != null,
                row.getMotivoAnulacion(), receiptLines.findByRecepcionIdOrderById(row.getId()).stream().map(line ->
                new ReceiptLineView(line.getId(), line.getDetalleDespachoId(), line.getCantidadApta(), line.getCantidadDanada())).toList());
    }
    private DomainException invalid(String message) { return new DomainException(HttpStatus.BAD_REQUEST, message); }
    private record ReceiptQuantity(int aptas, int danadas) {}

    public record ProductQuantity(UUID productoId, Integer cantidad) {}
    public record LineQuantity(UUID detalleSolicitudId, Integer cantidad) {}
    public record ReceiptLineQuantity(UUID detalleDespachoId, Integer cantidadApta, Integer cantidadDanada) {}
    public record CreateRequest(UUID sucursalSolicitanteId, UUID sucursalProveedoraId, String observaciones, List<ProductQuantity> items) {}
    public record ReviewRequest(boolean aprobar, String motivo, Map<UUID, Integer> cantidadesAprobadas) {}
    public record DispatchRequest(String observaciones, List<LineQuantity> items) {}
    public record ReceiptRequest(String observaciones, List<ReceiptLineQuantity> items) {}
    public record RequestLineView(UUID id, UUID productoId, int solicitada, Integer aprobada, int enviada,
            int pendienteEnvio, Integer faltanteCerrado, Instant reversaCierreEn) {}
    public record RequestView(UUID id, UUID sucursalSolicitanteId, UUID sucursalProveedoraId, String estado, Instant fecha, List<RequestLineView> items) {}
    public record DispatchLineView(UUID id, UUID detalleSolicitudId, int enviada, int recibida, int pendienteRecepcion,
            Integer faltanteCerrado, Instant reversaCierreEn) {}
    public record DispatchView(UUID id, UUID solicitudId, Instant fecha, boolean anulado, String motivoAnulacion, List<DispatchLineView> items) {}
    public record ReceiptLineView(UUID id, UUID detalleDespachoId, int aptas, int danadas) {}
    public record ReceiptView(UUID id, UUID despachoId, Instant fecha, boolean anulado, String motivoAnulacion, List<ReceiptLineView> items) {}
}
