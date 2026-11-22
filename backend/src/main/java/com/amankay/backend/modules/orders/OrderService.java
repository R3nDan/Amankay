package com.amankay.backend.modules.orders;

import com.amankay.backend.modules.common.DomainException;
import com.amankay.backend.modules.domain.model.ConfiguracionDomicilio;
import com.amankay.backend.modules.domain.model.DetallePedido;
import com.amankay.backend.modules.domain.model.InventarioSucursal;
import com.amankay.backend.modules.domain.model.MovimientoInventario;
import com.amankay.backend.modules.domain.model.Pedido;
import com.amankay.backend.modules.domain.model.Producto;
import com.amankay.backend.modules.domain.model.RegistroAuditoria;
import com.amankay.backend.modules.domain.model.Sucursal;
import com.amankay.backend.modules.domain.model.Usuario;
import com.amankay.backend.modules.domain.repository.ConfiguracionDomicilioRepository;
import com.amankay.backend.modules.domain.repository.DetallePedidoRepository;
import com.amankay.backend.modules.domain.repository.InventarioSucursalRepository;
import com.amankay.backend.modules.domain.repository.MovimientoInventarioRepository;
import com.amankay.backend.modules.domain.repository.PedidoRepository;
import com.amankay.backend.modules.domain.repository.ProductoRepository;
import com.amankay.backend.modules.domain.repository.RegistroAuditoriaRepository;
import com.amankay.backend.modules.domain.repository.SucursalRepository;
import com.amankay.backend.modules.security.StaffAccess;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
    private static final String PENDING = "PENDIENTE_CONFIRMACION";
    private final PedidoRepository orders;
    private final DetallePedidoRepository lines;
    private final ProductoRepository products;
    private final SucursalRepository branches;
    private final ConfiguracionDomicilioRepository deliveryConfigs;
    private final InventarioSucursalRepository stockRows;
    private final MovimientoInventarioRepository movements;
    private final RegistroAuditoriaRepository audit;
    private final StaffAccess access;

    public OrderService(PedidoRepository orders, DetallePedidoRepository lines, ProductoRepository products,
            SucursalRepository branches, ConfiguracionDomicilioRepository deliveryConfigs,
            InventarioSucursalRepository stockRows, MovimientoInventarioRepository movements,
            RegistroAuditoriaRepository audit, StaffAccess access) {
        this.orders = orders; this.lines = lines; this.products = products; this.branches = branches;
        this.deliveryConfigs = deliveryConfigs; this.stockRows = stockRows; this.movements = movements;
        this.audit = audit; this.access = access;
    }

    @Transactional
    public OrderCreated createWeb(WebOrderRequest request) {
        return createExternalOrder(request, "WEB", false);
    }

    @Transactional
    public OrderCreated createManualWhatsApp(WebOrderRequest request) {
        return createExternalOrder(request, "WHATSAPP", true);
    }

    private OrderCreated createExternalOrder(WebOrderRequest request, String channel, boolean recordedByStaff) {
        Map<UUID, Integer> quantities = quantities(request.items());
        List<ProductLine> productLines = loadProducts(quantities);
        String mode = request.modalidad().toUpperCase(Locale.ROOT);
        if (!List.of("RECOGER", "DOMICILIO").contains(mode)) throw invalid("Modalidad de entrega inválida.");
        UUID branchId;
        if ("RECOGER".equals(mode)) {
            if (Boolean.TRUE.equals(request.ubicacionConsentida()) || request.latitud() != null || request.longitud() != null)
                throw invalid("La ubicación GPS solo se usa para pedidos a domicilio.");
            if (request.sucursalId() == null) throw invalid("Selecciona una sucursal para recoger.");
            Sucursal branch = activeBranch(request.sucursalId());
            requireAvailable(branch.getId(), quantities);
            branchId = branch.getId();
        } else {
            if (Boolean.TRUE.equals(request.ubicacionConsentida())) {
                if (request.latitud() == null || request.longitud() == null) throw invalid("Comparte una ubicación válida junto con tu consentimiento.");
                if (request.latitud().compareTo(new BigDecimal("-90")) < 0 || request.latitud().compareTo(new BigDecimal("90")) > 0
                        || request.longitud().compareTo(new BigDecimal("-180")) < 0 || request.longitud().compareTo(new BigDecimal("180")) > 0)
                    throw invalid("La ubicación compartida está fuera de rango.");
                branchId = nearestAvailableBranch(request.latitud(), request.longitud(), quantities);
            } else {
                if (request.latitud() != null || request.longitud() != null)
                    throw invalid("La ubicación GPS requiere tu consentimiento.");
                if (request.direccion() == null || request.direccion().isBlank() || request.barrio() == null || request.barrio().isBlank())
                    throw invalid("Para el domicilio indica dirección y barrio, o comparte tu ubicación con consentimiento.");
                if (recordedByStaff) {
                    if (request.sucursalId() == null) throw invalid("Selecciona la sucursal que atenderá el domicilio.");
                    Sucursal branch = activeBranch(request.sucursalId());
                    requireAvailable(branch.getId(), quantities);
                    branchId = branch.getId();
                } else {
                    branchId = null;
                }
            }
        }
        if (recordedByStaff) access.requireRoleAtBranch("ATENCION", branchId);

        Instant createdAt = Instant.now();
        BigDecimal subtotal = productLines.stream().map(line -> line.product().getPrecio().multiply(BigDecimal.valueOf(line.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal deliveryFee = "DOMICILIO".equals(mode) ? currentDeliveryFee() : BigDecimal.ZERO;
        Pedido order = new Pedido();
        order.setCodigoSeguimiento(UUID.randomUUID().toString().replace("-", "").toUpperCase());
        order.setTipo("EXTERNO"); order.setCanalOrigen(channel); order.setModalidadEntrega(mode);
        order.setEstado(PENDING); order.setFechaCreacion(createdAt);
        order.setFechaVencimiento("WEB".equals(channel) ? createdAt.plus(Duration.ofMinutes(30)) : null);
        order.setTotal(subtotal.add(deliveryFee).setScale(2, RoundingMode.HALF_UP));
        order.setCostoDomicilioHistorico("DOMICILIO".equals(mode) ? deliveryFee : null);
        order.setSucursalId(branchId); order.setCuentaMesaId(null);
        order.setNombreCliente(request.nombre().trim()); order.setTelefonoCliente(request.telefono().trim());
        order.setDireccionEntrega("DOMICILIO".equals(mode) && request.direccion() != null && !request.direccion().isBlank() ? request.direccion().trim() : null);
        order.setBarrio("DOMICILIO".equals(mode) && request.barrio() != null && !request.barrio().isBlank() ? request.barrio().trim() : null);
        order.setReferenciaDireccion(request.referencia() == null ? null : request.referencia().trim());
        boolean locationConsented = "DOMICILIO".equals(mode) && Boolean.TRUE.equals(request.ubicacionConsentida());
        order.setUbicacionConsentida(locationConsented);
        order.setLatitudEntrega(locationConsented ? request.latitud() : null);
        order.setLongitudEntrega(locationConsented ? request.longitud() : null);
        order.setNombreDestinatario(request.nombreDestinatario() == null || request.nombreDestinatario().isBlank() ? request.nombre().trim() : request.nombreDestinatario().trim());
        order.setTelefonoDestinatario(request.telefonoDestinatario() == null || request.telefonoDestinatario().isBlank() ? request.telefono().trim() : request.telefonoDestinatario().trim());
        order = orders.save(order);
        for (ProductLine line : productLines) {
            DetallePedido detail = new DetallePedido(); detail.setPedidoId(order.getId()); detail.setProductoId(line.product().getId());
            detail.setCantidad(line.quantity()); detail.setPrecioUnitarioHistorico(line.product().getPrecio());
            detail.setNombreProductoHistorico(line.product().getNombre()); lines.save(detail);
        }
        if (recordedByStaff) {
            Usuario staff = access.currentUser();
            audit(order.getId(), "PEDIDO_WHATSAPP_REGISTRADO", "USUARIO", staff.getId(), null, PENDING,
                    "Pedido recibido y registrado manualmente desde WhatsApp.");
        } else {
            audit(order.getId(), "PEDIDO_WEB_CREADO", "SISTEMA", null, null, PENDING, "Solicitud web guardada antes de abrir WhatsApp.");
        }
        return new OrderCreated(order.getId(), order.getCodigoSeguimiento(), order.getEstado(), order.getTotal(),
                order.getFechaVencimiento(), branchId,
                recordedByStaff ? "Pedido registrado; queda pendiente de confirmación del flujo de atención."
                        : "Abre WhatsApp para enviar la solicitud; el personal debe confirmarla.");
    }

    @Transactional
    public OrderCreated createTableOrder(UUID sessionId, UUID accountId, UUID branchId, List<OrderItem> items) {
        Map<UUID, Integer> quantities = quantities(items);
        List<ProductLine> productLines = loadProducts(quantities);
        Instant createdAt = Instant.now();
        BigDecimal total = productLines.stream().map(line -> line.product().getPrecio().multiply(BigDecimal.valueOf(line.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2, RoundingMode.HALF_UP);
        Pedido order = new Pedido(); order.setCodigoSeguimiento(UUID.randomUUID().toString().replace("-", "").toUpperCase());
        order.setTipo("MESA"); order.setCanalOrigen("QR"); order.setModalidadEntrega("MESA");
        order.setEstado(PENDING); order.setFechaCreacion(createdAt); order.setTotal(total);
        order.setSucursalId(branchId); order.setCuentaMesaId(accountId);
        order = orders.save(order);
        for (ProductLine line : productLines) {
            DetallePedido detail = new DetallePedido(); detail.setPedidoId(order.getId()); detail.setProductoId(line.product().getId());
            detail.setCantidad(line.quantity()); detail.setPrecioUnitarioHistorico(line.product().getPrecio());
            detail.setNombreProductoHistorico(line.product().getNombre()); lines.save(detail);
        }
        audit(order.getId(), "PEDIDO_QR_CREADO", "SISTEMA", null, null, PENDING, "Pedido de mesa asociado a una sesión QR activa.");
        return new OrderCreated(order.getId(), order.getCodigoSeguimiento(), order.getEstado(), order.getTotal(), null, branchId,
                "El personal debe confirmar este pedido para agregarlo a la cuenta.");
    }

    @Transactional(readOnly = true)
    public OrderTracking track(String code) {
        Pedido order = orders.findByCodigoSeguimiento(code).orElseThrow(() -> DomainException.notFound("No se encontró el pedido."));
        List<OrderLineView> items = lines.findByPedidoIdOrderById(order.getId()).stream()
                .map(line -> new OrderLineView(line.getNombreProductoHistorico(), line.getCantidad(), line.getPrecioUnitarioHistorico())).toList();
        List<StatusEvent> history = audit.findByEntidadAndEntidadIdOrderByFechaHoraAsc("Pedido", order.getId()).stream()
                .map(row -> new StatusEvent(row.getFechaHora(), row.getOperacion(), row.getDescripcion())).toList();
        return new OrderTracking(order.getCodigoSeguimiento(), order.getEstado(), order.getFechaCreacion(),
                order.getTotal(), order.getSucursalId(), items, history);
    }

    @Transactional(readOnly = true)
    public List<OrderSummary> pending(UUID branchId) {
        access.requireRoleAtBranch("ATENCION", branchId);
        List<Pedido> rows = orders.findBySucursalIdAndEstadoOrderByFechaCreacionAsc(branchId, PENDING);
        return rows.stream().map(this::summary).toList();
    }

    @Transactional(readOnly = true)
    public List<OrderSummary> unassignedPending() {
        access.requireRoleWithAnyBranch("ATENCION");
        return orders.findBySucursalIdIsNullAndEstadoOrderByFechaCreacionAsc(PENDING).stream().map(this::summary).toList();
    }

    @Transactional
    public OrderSummary assignBranch(UUID orderId, UUID branchId) {
        access.requireRoleAtBranch("ATENCION", branchId);
        Pedido order = lockedOrder(orderId);
        requirePending(order);
        if (!"DOMICILIO".equals(order.getModalidadEntrega()) || order.getSucursalId() != null)
            throw DomainException.conflict("Solo se asigna manualmente un domicilio que aún no tenga sucursal.");
        activeBranch(branchId);
        requireAvailable(branchId, quantityMap(order));
        order.setSucursalId(branchId);
        order = orders.save(order);
        statusAudit(order, PENDING, PENDING, "Sucursal asignada manualmente.", access.currentUser());
        return summary(order);
    }

    @Transactional
    public OrderSummary accept(UUID orderId) {
        Pedido order = lockedOrder(orderId);
        if (order.getSucursalId() == null) throw DomainException.conflict("Asigna primero una sucursal con disponibilidad para todo el pedido.");
        access.requireRoleAtBranch("ATENCION", order.getSucursalId());
        requirePending(order);
        if (order.getFechaVencimiento() != null && !order.getFechaVencimiento().isAfter(Instant.now())) {
            // The scheduled expiry sweep persists the terminal state. Do not save it here and
            // then throw: the transaction rollback would silently undo that state change.
            throw DomainException.conflict("El pedido ya venció y no puede aceptarse.");
        }
        List<DetallePedido> details = lines.findByPedidoIdOrderById(orderId);
        for (DetallePedido line : details) {
            InventarioSucursal stock = stockRows.lockByBranchAndProduct(order.getSucursalId(), line.getProductoId())
                    .orElseThrow(() -> DomainException.conflict("Una sucursal no tiene inventario inicial para completar el pedido."));
            if (stock.getStockDisponible() < line.getCantidad()) throw DomainException.conflict("La sucursal ya no tiene unidades suficientes para todo el pedido.");
            int before = stock.getStockDisponible(); int after = before - line.getCantidad();
            stock.setStockDisponible(after); stock.setFechaActualizacion(Instant.now()); stockRows.save(stock);
            saveMovement(stock.getId(), access.currentUserId(), "VENTA", line.getCantidad(), before, after,
                    "Descuento por aceptación del pedido " + order.getCodigoSeguimiento(), "DETALLE_PEDIDO", line.getId(), null);
        }
        String old = order.getEstado(); order.setEstado("ACEPTADO"); order = orders.save(order);
        statusAudit(order, old, order.getEstado(), "Pedido aceptado y existencias descontadas.", access.currentUser());
        return summary(order);
    }

    @Transactional
    public OrderSummary reject(UUID orderId, String reason) {
        Pedido order = lockedOrder(orderId);
        if (order.getSucursalId() != null) access.requireRoleAtBranch("ATENCION", order.getSucursalId());
        else access.requireRole("ATENCION");
        requirePending(order);
        if (reason == null || reason.isBlank()) throw invalid("Indica el motivo del rechazo.");
        String old = order.getEstado(); order.setEstado("RECHAZADO"); order = orders.save(order);
        statusAudit(order, old, order.getEstado(), "Rechazo: " + reason.trim(), access.currentUser());
        return summary(order);
    }

    @Transactional
    public OrderSummary transition(UUID orderId, String nextState) {
        Pedido order = lockedOrder(orderId);
        access.requireRoleAtBranch("ATENCION", order.getSucursalId());
        Map<String, List<String>> allowed = Map.of(
                "ACEPTADO", List.of("EN_PREPARACION"),
                "EN_PREPARACION", List.of("LISTO"),
                "LISTO", List.of("COMPLETADO"));
        if (!allowed.getOrDefault(order.getEstado(), List.of()).contains(nextState)) throw DomainException.conflict("La transición de estado no está permitida.");
        String old = order.getEstado(); order.setEstado(nextState); order = orders.save(order);
        statusAudit(order, old, nextState, "Cambio de estado del pedido.", access.currentUser());
        return summary(order);
    }

    @Transactional
    public OrderSummary requestCancellation(String code) {
        Pedido order = orders.findByCodigoSeguimiento(code).flatMap(found -> orders.lockById(found.getId()))
                .orElseThrow(() -> DomainException.notFound("No se encontró el pedido."));
        if (!"EXTERNO".equals(order.getTipo()) || !List.of(PENDING, "ACEPTADO").contains(order.getEstado()))
            throw DomainException.conflict("La cancelación solo puede solicitarse antes de iniciar la preparación.");
        String old = order.getEstado(); order.setEstado("CANCELACION_SOLICITADA"); order = orders.save(order);
        statusAudit(order, old, order.getEstado(), "El cliente solicitó cancelar el pedido.", null);
        return summary(order);
    }

    @Transactional
    public OrderSummary decideCancellation(UUID orderId, boolean approve, String reason) {
        Pedido order = lockedOrder(orderId);
        if (order.getSucursalId() == null) access.requireRoleWithAnyBranch("ATENCION");
        else access.requireRoleAtBranch("ATENCION", order.getSucursalId());
        if (!"CANCELACION_SOLICITADA".equals(order.getEstado())) throw DomainException.conflict("El pedido no tiene una cancelación pendiente.");
        if (reason == null || reason.isBlank()) throw invalid("Indica el motivo de la decisión.");
        String old = order.getEstado();
        String previousOrderState = cancellationPreviousState(orderId);
        if (!approve) {
            order.setEstado(previousOrderState); order = orders.save(order);
            statusAudit(order, old, order.getEstado(), "Solicitud de cancelación no aprobada: " + reason.trim(), access.currentUser());
            return summary(order);
        }
        if ("ACEPTADO".equals(previousOrderState)) {
            for (DetallePedido line : lines.findByPedidoIdOrderById(orderId)) {
                MovimientoInventario original = movements.findByTipoOrigenAndIdOrigen("DETALLE_PEDIDO", line.getId())
                        .orElseThrow(() -> DomainException.conflict("No se encontró el movimiento original para devolver el stock."));
                compensateSale(original, "Cancelación aprobada: " + reason.trim());
            }
        }
        order.setEstado("CANCELADO"); order = orders.save(order);
        statusAudit(order, old, order.getEstado(), "Cancelación aprobada: " + reason.trim(), access.currentUser());
        return summary(order);
    }

    @Transactional
    @Scheduled(fixedDelayString = "${amankay.orders.expiry-sweep-ms:60000}")
    public void expirePendingWebOrders() {
        Instant now = Instant.now();
        for (Pedido order : orders.findByEstadoAndFechaVencimientoBefore(PENDING, now)) {
            Pedido locked = orders.lockById(order.getId()).orElse(null);
            if (locked != null && PENDING.equals(locked.getEstado()) && locked.getFechaVencimiento() != null && !locked.getFechaVencimiento().isAfter(now)) {
                locked.setEstado("VENCIDO"); orders.save(locked);
                statusAudit(locked, PENDING, "VENCIDO", "La solicitud web venció sin confirmación en 30 minutos.", null);
            }
        }
    }

    private Pedido lockedOrder(UUID id) { return orders.lockById(id).orElseThrow(() -> DomainException.notFound("No se encontró el pedido.")); }
    private String cancellationPreviousState(UUID orderId) {
        RegistroAuditoria request = audit.findByEntidadAndEntidadIdOrderByFechaHoraAsc("Pedido", orderId).stream()
                .filter(row -> "CAMBIO_ESTADO".equals(row.getOperacion()))
                .filter(row -> "{\"estado\":\"CANCELACION_SOLICITADA\"}".equals(row.getValorNuevo()))
                .reduce((first, second) -> second)
                .orElseThrow(() -> DomainException.conflict("No se encontró el historial de la solicitud de cancelación."));
        if ("{\"estado\":\"PENDIENTE_CONFIRMACION\"}".equals(request.getValorAnterior())) return PENDING;
        if ("{\"estado\":\"ACEPTADO\"}".equals(request.getValorAnterior())) return "ACEPTADO";
        throw DomainException.conflict("El estado previo del pedido no admite esta cancelación.");
    }
    private void requirePending(Pedido order) { if (!PENDING.equals(order.getEstado())) throw DomainException.conflict("El pedido ya no está pendiente de confirmación."); }
    private Sucursal activeBranch(UUID id) { return branches.findById(id).filter(row -> Boolean.TRUE.equals(row.getActiva())).orElseThrow(() -> DomainException.notFound("No se encontró una sucursal activa.")); }
    private BigDecimal currentDeliveryFee() { return deliveryConfigs.findFirstByActivoTrue().map(ConfiguracionDomicilio::getTarifa).orElse(new BigDecimal("2000.00")); }

    private Map<UUID, Integer> quantities(List<OrderItem> requested) {
        if (requested == null || requested.isEmpty()) throw invalid("Agrega al menos un producto.");
        Map<UUID, Integer> result = new LinkedHashMap<>();
        for (OrderItem item : requested) {
            if (item == null || item.productoId() == null || item.cantidad() == null || item.cantidad() < 1 || item.cantidad() > 100)
                throw invalid("La cantidad de cada producto debe estar entre 1 y 100.");
            result.merge(item.productoId(), item.cantidad(), Integer::sum);
        }
        if (result.values().stream().anyMatch(quantity -> quantity > 100)) throw invalid("La cantidad máxima por producto es 100.");
        return result;
    }

    private List<ProductLine> loadProducts(Map<UUID, Integer> quantities) {
        List<ProductLine> result = new ArrayList<>();
        for (var entry : quantities.entrySet()) {
            Producto product = products.findById(entry.getKey()).filter(row -> Boolean.TRUE.equals(row.getActivo()))
                    .orElseThrow(() -> DomainException.notFound("Uno de los productos no está disponible."));
            result.add(new ProductLine(product, entry.getValue()));
        }
        return result;
    }

    private void requireAvailable(UUID branchId, Map<UUID, Integer> quantities) {
        for (var entry : quantities.entrySet()) {
            int available = stockRows.findBySucursalIdAndProductoId(branchId, entry.getKey())
                    .map(InventarioSucursal::getStockDisponible).orElse(0);
            if (available < entry.getValue()) throw DomainException.conflict("La sucursal no puede completar el carrito actual; no se divide el pedido.");
        }
    }

    private UUID nearestAvailableBranch(BigDecimal latitude, BigDecimal longitude, Map<UUID, Integer> quantities) {
        List<Sucursal> candidates = branches.findByActivaTrueOrderByNombreAsc().stream()
                .filter(branch -> branch.getLatitud() != null && branch.getLongitud() != null)
                .filter(branch -> hasAllStock(branch.getId(), quantities))
                .sorted((left, right) -> Double.compare(distance(latitude.doubleValue(), longitude.doubleValue(), left), distance(latitude.doubleValue(), longitude.doubleValue(), right)))
                .toList();
        if (candidates.isEmpty()) throw DomainException.conflict("No hay una sucursal configurada y disponible que complete el pedido. El domicilio no se puede aceptar.");
        return candidates.getFirst().getId();
    }

    private boolean hasAllStock(UUID branchId, Map<UUID, Integer> quantities) {
        return quantities.entrySet().stream().allMatch(entry -> stockRows.findBySucursalIdAndProductoId(branchId, entry.getKey())
                .map(stock -> stock.getStockDisponible() >= entry.getValue()).orElse(false));
    }

    private double distance(double lat, double lon, Sucursal branch) {
        double lat2 = branch.getLatitud().doubleValue(), lon2 = branch.getLongitud().doubleValue();
        double dLat = Math.toRadians(lat2 - lat), dLon = Math.toRadians(lon2 - lon);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(Math.toRadians(lat)) * Math.cos(Math.toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private Map<UUID, Integer> quantityMap(Pedido order) {
        Map<UUID, Integer> result = new LinkedHashMap<>();
        lines.findByPedidoIdOrderById(order.getId()).forEach(line -> result.merge(line.getProductoId(), line.getCantidad(), Integer::sum));
        return result;
    }

    private void compensateSale(MovimientoInventario original, String reason) {
        if (!"VENTA".equals(original.getTipo()) || original.getMovimientoCompensadoId() != null || movements.existsByMovimientoCompensadoId(original.getId()))
            throw DomainException.conflict("El movimiento no se puede compensar nuevamente.");
        InventarioSucursal stock = stockRows.findById(original.getInventarioSucursalId()).orElseThrow(() -> DomainException.conflict("El saldo de inventario no existe."));
        InventarioSucursal locked = stockRows.lockByBranchAndProduct(stock.getSucursalId(), stock.getProductoId()).orElseThrow();
        int before = locked.getStockDisponible(); int after = before + original.getCantidad();
        locked.setStockDisponible(after); locked.setFechaActualizacion(Instant.now()); stockRows.save(locked);
        saveMovement(locked.getId(), access.currentUserId(), "COMPENSACION", original.getCantidad(), before, after,
                reason, "MOVIMIENTO_COMPENSADO", original.getId(), original.getId());
    }

    private MovimientoInventario saveMovement(UUID inventoryId, UUID userId, String type, int quantity, int before, int after,
            String reason, String originType, UUID originId, UUID compensatedId) {
        MovimientoInventario movement = new MovimientoInventario(); movement.setInventarioSucursalId(inventoryId); movement.setUsuarioId(userId);
        movement.setTipo(type); movement.setCantidad(quantity); movement.setStockAnterior(before); movement.setStockResultante(after);
        movement.setFechaHora(Instant.now()); movement.setMotivo(reason); movement.setTipoOrigen(originType); movement.setIdOrigen(originId);
        movement.setMovimientoCompensadoId(compensatedId);
        return movements.save(movement);
    }

    private void audit(UUID entityId, String operation, String actorType, UUID userId, String oldState, String newState, String description) {
        RegistroAuditoria row = new RegistroAuditoria(); row.setFechaHora(Instant.now()); row.setOperacion(operation); row.setEntidad("Pedido");
        row.setEntidadId(entityId); row.setTipoActor(actorType); row.setUsuarioId(userId); row.setDescripcion(description);
        row.setValorAnterior(oldState == null ? null : "{\"estado\":\"" + oldState + "\"}");
        row.setValorNuevo(newState == null ? null : "{\"estado\":\"" + newState + "\"}"); audit.save(row);
    }
    private void statusAudit(Pedido order, String oldState, String newState, String description, Usuario user) {
        audit(order.getId(), "CAMBIO_ESTADO", user == null ? "SISTEMA" : "USUARIO", user == null ? null : user.getId(), oldState, newState, description);
    }
    private OrderSummary summary(Pedido order) {
        return new OrderSummary(order.getId(), order.getCodigoSeguimiento(), order.getEstado(), order.getModalidadEntrega(), order.getFechaCreacion(), order.getFechaVencimiento(), order.getTotal(), order.getSucursalId());
    }
    private DomainException invalid(String message) { return new DomainException(HttpStatus.BAD_REQUEST, message); }
    private record ProductLine(Producto product, int quantity) {}

    public record OrderItem(@NotNull UUID productoId, @NotNull @Min(1) @Max(100) Integer cantidad) {}
    public record WebOrderRequest(@NotBlank String modalidad, UUID sucursalId,
            @NotBlank @Size(max = 160) String nombre,
            @NotBlank @Pattern(regexp = "^[+0-9][0-9 +()\\-]{5,29}$", message = "Indica un teléfono válido.") String telefono,
            @Size(max = 240) String direccion, @Size(max = 120) String barrio, @Size(max = 240) String referencia,
            @Size(max = 160) String nombreDestinatario,
            @Pattern(regexp = "^$|^[+0-9][0-9 +()\\-]{5,29}$", message = "Indica un teléfono válido.") String telefonoDestinatario,
            Boolean ubicacionConsentida, BigDecimal latitud, BigDecimal longitud,
            @NotEmpty List<@Valid OrderItem> items) {}
    public record OrderCreated(UUID id, String codigoSeguimiento, String estado, BigDecimal total,
            Instant venceEn, UUID sucursalId, String siguientePaso) {}
    public record OrderLineView(String producto, int cantidad, BigDecimal precioUnitario) {}
    public record StatusEvent(Instant fecha, String evento, String descripcion) {}
    public record OrderTracking(String codigoSeguimiento, String estado, Instant creadoEn, BigDecimal total,
            UUID sucursalId, List<OrderLineView> items, List<StatusEvent> historial) {}
    public record OrderSummary(UUID id, String codigoSeguimiento, String estado, String modalidad,
            Instant creadoEn, Instant venceEn, BigDecimal total, UUID sucursalId) {}
}
