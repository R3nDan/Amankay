package com.amankay.backend.modules.deliveries;

import com.amankay.backend.modules.common.DomainException;
import com.amankay.backend.modules.domain.model.ConciliacionEfectivo;
import com.amankay.backend.modules.domain.model.Entrega;
import com.amankay.backend.modules.domain.model.Pedido;
import com.amankay.backend.modules.domain.model.RegistroAuditoria;
import com.amankay.backend.modules.domain.model.Rol;
import com.amankay.backend.modules.domain.model.Usuario;
import com.amankay.backend.modules.domain.repository.ConciliacionEfectivoRepository;
import com.amankay.backend.modules.domain.repository.DetallePedidoRepository;
import com.amankay.backend.modules.domain.repository.EntregaRepository;
import com.amankay.backend.modules.domain.repository.PedidoRepository;
import com.amankay.backend.modules.domain.repository.RegistroAuditoriaRepository;
import com.amankay.backend.modules.domain.repository.RolRepository;
import com.amankay.backend.modules.domain.repository.UsuarioRepository;
import com.amankay.backend.modules.domain.repository.UsuarioRolRepository;
import com.amankay.backend.modules.domain.repository.UsuarioSucursalRepository;
import com.amankay.backend.modules.security.StaffAccess;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DeliveryService {
    private final EntregaRepository deliveries;
    private final PedidoRepository orders;
    private final UsuarioRepository users;
    private final UsuarioRolRepository userRoles;
    private final UsuarioSucursalRepository userBranches;
    private final RolRepository roles;
    private final ConciliacionEfectivoRepository reconciliations;
    private final DetallePedidoRepository orderLines;
    private final RegistroAuditoriaRepository audit;
    private final StaffAccess access;

    public DeliveryService(EntregaRepository deliveries, PedidoRepository orders, UsuarioRepository users,
            UsuarioRolRepository userRoles, RolRepository roles, ConciliacionEfectivoRepository reconciliations,
            DetallePedidoRepository orderLines, RegistroAuditoriaRepository audit, UsuarioSucursalRepository userBranches, StaffAccess access) {
        this.deliveries = deliveries; this.orders = orders; this.users = users; this.userRoles = userRoles;
        this.roles = roles; this.reconciliations = reconciliations; this.orderLines = orderLines;
        this.audit = audit; this.userBranches = userBranches; this.access = access;
    }

    @Transactional
    public DeliveryView assign(UUID orderId, UUID driverId) {
        Pedido order = orders.lockById(orderId).orElseThrow(() -> DomainException.notFound("No se encontró el pedido."));
        if (order.getSucursalId() == null) throw DomainException.conflict("El pedido todavía no tiene sucursal asignada.");
        access.requireRoleAtBranch("ATENCION", order.getSucursalId());
        if (!"DOMICILIO".equals(order.getModalidadEntrega()) || !List.of("ACEPTADO", "EN_PREPARACION", "LISTO").contains(order.getEstado()))
            throw DomainException.conflict("Solo se asignan pedidos a domicilio aceptados.");
        if (deliveries.findByPedidoId(orderId).isPresent()) throw DomainException.conflict("El pedido ya tiene una entrega registrada.");
        Usuario driver = users.findById(driverId).filter(user -> Boolean.TRUE.equals(user.getActivo())).orElseThrow(() -> DomainException.notFound("No se encontró el repartidor activo."));
        if (!hasRole(driverId, "REPARTIDOR")) throw DomainException.forbidden("El usuario no tiene rol de repartidor.");
        if (!accessBranch(driverId, order.getSucursalId())) throw DomainException.forbidden("El repartidor no está asignado a la sucursal del pedido.");
        Entrega delivery = new Entrega(); delivery.setPedidoId(orderId); delivery.setRepartidorId(driverId); delivery.setEstado("ASIGNADA"); delivery.setFechaCreacion(Instant.now());
        delivery = deliveries.save(delivery);
        event(delivery, "ENTREGA_ASIGNADA", "Asignada por atención.", access.currentUser());
        return view(delivery);
    }

    @Transactional(readOnly = true)
    public List<DeliveryView> myDeliveries() {
        return deliveries.findByRepartidorIdOrderByFechaCreacionDesc(access.currentUserId()).stream().map(this::view).toList();
    }

    @Transactional(readOnly = true)
    public List<DeliveryView> branchDeliveries(UUID branchId) {
        access.requireRoleAtBranch("ATENCION", branchId);
        return deliveries.findBySucursalId(branchId).stream().map(this::view).toList();
    }

    @Transactional
    public DeliveryView driverUpdate(UUID deliveryId, String next, String observations) {
        Usuario driver = access.currentUser(); access.requireRole("REPARTIDOR");
        Entrega delivery = deliveries.findById(deliveryId).orElseThrow(() -> DomainException.notFound("No se encontró la entrega."));
        if (!driver.getId().equals(delivery.getRepartidorId())) throw DomainException.forbidden("Solo puedes actualizar tus entregas asignadas.");
        Pedido order = orders.findById(delivery.getPedidoId()).orElseThrow();
        if (!accessBranch(driver.getId(), order.getSucursalId())) throw DomainException.forbidden("La entrega no pertenece a una sucursal asignada.");
        String requiredNext = switch (delivery.getEstado()) {
            case "ASIGNADA" -> "RECOGIDA";
            case "RECOGIDA" -> "EN_CAMINO";
            case "EN_CAMINO" -> List.of("ENTREGADA", "NO_ENTREGADA").contains(next) ? next : null;
            default -> null;
        };
        if (!next.equals(requiredNext)) throw DomainException.conflict("El cambio de estado no es válido para esta entrega.");
        if ("NO_ENTREGADA".equals(next) && (observations == null || observations.isBlank())) throw invalid("Describe brevemente la incidencia.");
        Instant now = Instant.now();
        if ("RECOGIDA".equals(next)) delivery.setFechaRecogida(now);
        if ("EN_CAMINO".equals(next)) delivery.setFechaSalida(now);
        if ("ENTREGADA".equals(next)) delivery.setFechaEntrega(now);
        if (observations != null && !observations.isBlank()) delivery.setObservaciones(append(delivery.getObservaciones(), observations.trim()));
        String previous = delivery.getEstado(); delivery.setEstado(next); delivery = deliveries.save(delivery);
        event(delivery, "ESTADO_" + next, previous + " → " + next + (observations == null ? "" : ": " + observations.trim()), driver);
        return view(delivery);
    }

    @Transactional
    public DeliveryView retry(UUID deliveryId, UUID driverId, String reason) {
        Entrega delivery = deliveries.findById(deliveryId).orElseThrow(() -> DomainException.notFound("No se encontró la entrega."));
        Pedido order = orders.findById(delivery.getPedidoId()).orElseThrow();
        access.requireRoleAtBranch("ATENCION", order.getSucursalId());
        if (!"NO_ENTREGADA".equals(delivery.getEstado())) throw DomainException.conflict("Solo se puede programar otro intento para una entrega fallida.");
        UUID targetDriver = driverId == null ? delivery.getRepartidorId() : driverId;
        Usuario driver = users.findById(targetDriver).filter(user -> Boolean.TRUE.equals(user.getActivo())).orElseThrow(() -> DomainException.notFound("No se encontró el repartidor activo."));
        if (!hasRole(targetDriver, "REPARTIDOR") || !accessBranch(targetDriver, order.getSucursalId())) throw DomainException.forbidden("El repartidor no está habilitado para esta sucursal.");
        if (reason == null || reason.isBlank()) throw invalid("Indica el motivo del reintento.");
        String old = delivery.getEstado(); delivery.setRepartidorId(targetDriver); delivery.setEstado("ASIGNADA");
        delivery.setObservaciones(append(delivery.getObservaciones(), "Reintento autorizado: " + reason.trim()));
        delivery = deliveries.save(delivery);
        event(delivery, "REINTENTO_AUTORIZADO", old + " → ASIGNADA: " + reason.trim(), access.currentUser());
        return view(delivery);
    }

    @Transactional
    public void declareCash(UUID deliveryId, BigDecimal amount) {
        Usuario driver = access.currentUser(); access.requireRole("REPARTIDOR");
        Entrega delivery = deliveries.findById(deliveryId).orElseThrow(() -> DomainException.notFound("No se encontró la entrega."));
        if (!driver.getId().equals(delivery.getRepartidorId())) throw DomainException.forbidden("Solo puedes declarar el efectivo de tus entregas.");
        if (!"ENTREGADA".equals(delivery.getEstado())) throw DomainException.conflict("El efectivo se declara al completar la entrega.");
        if (amount == null || amount.signum() < 0) throw invalid("El monto declarado no puede ser negativo.");
        BigDecimal declared = amount.setScale(2, java.math.RoundingMode.HALF_UP);
        delivery.setMontoEfectivoDeclarado(declared);
        deliveries.save(delivery);
        event(delivery, "EFECTIVO_DECLARADO", "Monto declarado: " + declared.toPlainString(), driver);
    }

    @Transactional
    public ReconciliationView reconcile(UUID deliveryId, BigDecimal received, String reason) {
        Entrega delivery = deliveries.findById(deliveryId).orElseThrow(() -> DomainException.notFound("No se encontró la entrega."));
        Pedido order = orders.findById(delivery.getPedidoId()).orElseThrow();
        access.requireRoleAtBranch("ATENCION", order.getSucursalId());
        if (!"ENTREGADA".equals(delivery.getEstado())) throw DomainException.conflict("Solo se concilia una entrega completada.");
        if (reconciliations.findByEntregaId(deliveryId).isPresent()) throw DomainException.conflict("La entrega ya fue conciliada.");
        BigDecimal declared = delivery.getMontoEfectivoDeclarado();
        if (declared == null) throw DomainException.conflict("El repartidor aún no ha registrado el efectivo declarado.");
        if (received == null || received.signum() < 0) throw invalid("El monto recibido no puede ser negativo.");
        BigDecimal normalizedReceived = received.setScale(2, java.math.RoundingMode.HALF_UP);
        if (declared.compareTo(normalizedReceived) != 0 && (reason == null || reason.isBlank())) throw invalid("Una diferencia requiere motivo.");
        ConciliacionEfectivo row = new ConciliacionEfectivo(); row.setEntregaId(deliveryId); row.setMontoDeclarado(declared);
        row.setMontoRecibido(normalizedReceived); row.setFechaConciliacion(Instant.now()); row.setMotivoDiferencia(declared.compareTo(normalizedReceived) == 0 ? null : reason.trim());
        row.setDeclaradoPor(delivery.getRepartidorId()); row.setRecibidoPor(access.currentUserId());
        row = reconciliations.save(row);
        return new ReconciliationView(row.getId(), row.getMontoDeclarado(), row.getMontoRecibido(), row.getMotivoDiferencia(), row.getFechaConciliacion());
    }

    @Transactional
    public ReconciliationView rectifyReconciliation(UUID deliveryId, BigDecimal declared, BigDecimal received, String reason) {
        Entrega delivery = deliveries.findById(deliveryId).orElseThrow(() -> DomainException.notFound("No se encontró la entrega."));
        Pedido order = orders.findById(delivery.getPedidoId()).orElseThrow();
        access.requireRoleAtBranch("ATENCION", order.getSucursalId());
        ConciliacionEfectivo row = reconciliations.findByEntregaId(deliveryId)
                .orElseThrow(() -> DomainException.notFound("No existe una conciliación que se pueda rectificar."));
        if (declared == null || received == null || declared.signum() < 0 || received.signum() < 0)
            throw invalid("Los montos de la rectificación no pueden ser negativos ni estar vacíos.");
        if (reason == null || reason.isBlank()) throw invalid("Indica por qué se rectifica la conciliación.");

        BigDecimal normalizedDeclared = declared.setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal normalizedReceived = received.setScale(2, java.math.RoundingMode.HALF_UP);
        Instant rectifiedAt = Instant.now();
        UUID receiverId = access.currentUserId();
        String oldSnapshot = "{\"montoDeclarado\":" + row.getMontoDeclarado().toPlainString()
                + ",\"montoRecibido\":" + row.getMontoRecibido().toPlainString()
                + ",\"fechaConciliacion\":\"" + row.getFechaConciliacion() + "\""
                + ",\"motivoDiferencia\":" + (row.getMotivoDiferencia() == null ? "null" : "\"" + escapeJson(row.getMotivoDiferencia()) + "\"")
                + ",\"declaradoPor\":\"" + row.getDeclaradoPor() + "\",\"recibidoPor\":\"" + row.getRecibidoPor() + "\"}";
        String differenceReason = normalizedDeclared.compareTo(normalizedReceived) == 0 ? null : reason.trim();
        String newSnapshot = "{\"montoDeclarado\":" + normalizedDeclared.toPlainString()
                + ",\"montoRecibido\":" + normalizedReceived.toPlainString()
                + ",\"fechaConciliacion\":\"" + rectifiedAt + "\""
                + ",\"motivoDiferencia\":" + (differenceReason == null ? "null" : "\"" + escapeJson(differenceReason) + "\"")
                + ",\"declaradoPor\":\"" + row.getDeclaradoPor() + "\",\"recibidoPor\":\"" + receiverId + "\"}";

        row.setMontoDeclarado(normalizedDeclared);
        row.setMontoRecibido(normalizedReceived);
        row.setMotivoDiferencia(differenceReason);
        row.setFechaConciliacion(rectifiedAt);
        row.setRecibidoPor(receiverId);
        row = reconciliations.save(row);

        Usuario actor = access.currentUser();
        RegistroAuditoria history = new RegistroAuditoria();
        history.setFechaHora(Instant.now());
        history.setOperacion("CONCILIACION_EFECTIVO_RECTIFICADA");
        history.setEntidad("ConciliacionEfectivo");
        history.setEntidadId(row.getId());
        history.setValorAnterior(oldSnapshot);
        history.setValorNuevo(newSnapshot);
        history.setDescripcion(reason.trim());
        history.setTipoActor("USUARIO");
        history.setUsuarioId(actor.getId());
        audit.save(history);

        return new ReconciliationView(row.getId(), row.getMontoDeclarado(), row.getMontoRecibido(), row.getMotivoDiferencia(), row.getFechaConciliacion());
    }

    private boolean hasRole(UUID userId, String roleName) {
        List<UUID> ids = userRoles.findRoleIdsByUserId(userId);
        return roles.findAllById(ids).stream().anyMatch(role -> roleName.equalsIgnoreCase(role.getNombre()));
    }
    private boolean accessBranch(UUID userId, UUID branchId) {
        return userBranches.userHasBranch(userId, branchId);
    }
    private void event(Entrega delivery, String operation, String description, Usuario user) {
        RegistroAuditoria row = new RegistroAuditoria(); row.setFechaHora(Instant.now()); row.setOperacion(operation); row.setEntidad("Entrega");
        row.setEntidadId(delivery.getId()); row.setTipoActor(user == null ? "SISTEMA" : "USUARIO"); row.setUsuarioId(user == null ? null : user.getId());
        row.setDescripcion(description); audit.save(row);
    }
    private String append(String old, String next) { return old == null || old.isBlank() ? next : old + "\n" + next; }
    private String escapeJson(String value) { return value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r"); }
    private DeliveryView view(Entrega row) {
        Pedido order = orders.findById(row.getPedidoId()).orElseThrow(() -> DomainException.notFound("No se encontró el pedido de la entrega."));
        List<DeliveryLineView> products = orderLines.findByPedidoIdOrderById(order.getId()).stream()
                .map(line -> new DeliveryLineView(line.getNombreProductoHistorico(), line.getCantidad())).toList();
        return new DeliveryView(row.getId(), row.getPedidoId(), row.getRepartidorId(), row.getEstado(), row.getFechaCreacion(),
                row.getFechaRecogida(), row.getFechaSalida(), row.getFechaEntrega(), row.getObservaciones(), row.getMontoEfectivoDeclarado(),
                order.getNombreDestinatario(), order.getTelefonoDestinatario(), order.getDireccionEntrega(), order.getBarrio(),
                order.getReferenciaDireccion(), order.getLatitudEntrega(), order.getLongitudEntrega(), products);
    }
    private DomainException invalid(String message) { return new DomainException(HttpStatus.BAD_REQUEST, message); }

    public record DeliveryView(UUID id, UUID pedidoId, UUID repartidorId, String estado, Instant creadoEn,
            Instant recogidoEn, Instant enCaminoEn, Instant entregadoEn, String observaciones, BigDecimal montoEfectivoDeclarado,
            String destinatario, String telefono, String direccion, String barrio, String referencia,
            BigDecimal latitud, BigDecimal longitud, List<DeliveryLineView> productos) {}
    public record DeliveryLineView(String producto, Integer cantidad) {}
    public record ReconciliationView(UUID id, BigDecimal declarado, BigDecimal recibido, String motivo, Instant fecha) {}
}
