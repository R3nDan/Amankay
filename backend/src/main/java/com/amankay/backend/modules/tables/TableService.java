package com.amankay.backend.modules.tables;

import com.amankay.backend.modules.common.DomainException;
import com.amankay.backend.modules.domain.model.CuentaMesa;
import com.amankay.backend.modules.domain.model.Mesa;
import com.amankay.backend.modules.domain.model.Pago;
import com.amankay.backend.modules.domain.model.Pedido;
import com.amankay.backend.modules.domain.model.SesionMesa;
import com.amankay.backend.modules.domain.repository.CuentaMesaRepository;
import com.amankay.backend.modules.domain.repository.MesaRepository;
import com.amankay.backend.modules.domain.repository.PagoRepository;
import com.amankay.backend.modules.domain.repository.PedidoRepository;
import com.amankay.backend.modules.domain.repository.SesionMesaRepository;
import com.amankay.backend.modules.orders.OrderService;
import com.amankay.backend.modules.security.StaffAccess;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TableService {
    private final MesaRepository tables;
    private final SesionMesaRepository sessions;
    private final CuentaMesaRepository accounts;
    private final PedidoRepository orders;
    private final PagoRepository payments;
    private final OrderService orderService;
    private final StaffAccess access;
    private final Duration sessionTtl;
    private final SecureRandom random = new SecureRandom();
    private final TemporaryQr temporaryQr;
    private final String frontendOrigin;

    public TableService(MesaRepository tables, SesionMesaRepository sessions, CuentaMesaRepository accounts,
            PedidoRepository orders, PagoRepository payments, OrderService orderService, StaffAccess access,
            @Value("${amankay.qr.session-ttl:PT8H}") Duration sessionTtl,
            @Value("${amankay.frontend-origin:http://localhost:3000}") String frontendOrigin,
            TemporaryQr temporaryQr) {
        this.tables = tables; this.sessions = sessions; this.accounts = accounts; this.orders = orders; this.payments = payments;
        this.orderService = orderService; this.access = access; this.sessionTtl = sessionTtl;
        this.frontendOrigin = frontendOrigin; this.temporaryQr = temporaryQr;
    }

    @Transactional
    public OpenSessionResponse open(UUID tableId) {
        Mesa table = tables.lockById(tableId).filter(row -> Boolean.TRUE.equals(row.getActiva()))
                .orElseThrow(() -> DomainException.notFound("No se encontró una mesa activa."));
        access.requireRoleAtBranch("ATENCION", table.getSucursalId());
        if (!sessions.findByMesaIdAndEstado(tableId, "ACTIVA").isEmpty()) throw DomainException.conflict("La mesa ya tiene una sesión QR activa.");
        for (CuentaMesa account : accounts.findByEstado("ABIERTA")) {
            SesionMesa existing = sessions.findById(account.getSesionMesaId()).orElse(null);
            if (existing != null && existing.getMesaId().equals(tableId)) throw DomainException.conflict("La cuenta anterior sigue abierta; ciérrala antes de abrir otra sesión.");
        }
        byte[] tokenBytes = new byte[32]; random.nextBytes(tokenBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
        Instant now = Instant.now();
        SesionMesa session = new SesionMesa(); session.setMesaId(tableId); session.setTokenSeguro(hash(rawToken));
        session.setFechaApertura(now); session.setEstado("ACTIVA"); session.setAbiertaPor(access.currentUserId());
        session = sessions.save(session);
        CuentaMesa account = new CuentaMesa(); account.setSesionMesaId(session.getId()); account.setFechaApertura(now); account.setEstado("ABIERTA");
        accounts.save(account);
        String accessUrl = frontendOrigin.replaceAll("/+$", "") + "/mesa/" + table.getIdentificadorQr() + "#t=" + rawToken;
        return new OpenSessionResponse(session.getId(), rawToken, now.plus(sessionTtl), account.getId(), temporaryQr.svg(accessUrl));
    }

    @Transactional
    public SessionStatus validate(String rawToken) {
        SesionMesa session = sessions.findByTokenSeguro(hash(rawToken)).orElseThrow(() -> DomainException.notFound("El QR no corresponde a una sesión activa."));
        if (!isValid(session)) throw DomainException.conflict("La sesión QR expiró o fue cerrada.");
        return statusView(session);
    }

    @Transactional(readOnly = true)
    public List<TableOverview> branchTables(UUID branchId) {
        access.requireRoleAtBranch("ATENCION", branchId);
        return tables.findBySucursalIdOrderByIdentificadorAsc(branchId).stream().map(table -> {
            SesionMesa latest = sessions.findByMesaIdOrderByFechaAperturaDesc(table.getId()).stream().findFirst().orElse(null);
            CuentaMesa account = latest == null ? null : accounts.findBySesionMesaId(latest.getId()).orElse(null);
            return new TableOverview(table.getId(), table.getIdentificador(), table.getIdentificadorQr(),
                    table.getActiva(), latest == null ? null : latest.getId(),
                    latest == null ? null : latest.getEstado(), account == null ? null : account.getId(),
                    account == null ? null : account.getEstado());
        }).toList();
    }

    @Transactional(readOnly = true)
    public SessionStatus staffStatus(UUID sessionId) {
        SesionMesa session = sessions.findById(sessionId).orElseThrow(() -> DomainException.notFound("No se encontró la sesión QR."));
        Mesa table = tables.findById(session.getMesaId()).orElseThrow();
        access.requireRoleAtBranch("ATENCION", table.getSucursalId());
        return statusView(session);
    }

    @Transactional
    public void close(UUID sessionId) {
        SesionMesa session = sessions.findById(sessionId).orElseThrow(() -> DomainException.notFound("No se encontró la sesión QR."));
        Mesa table = tables.findById(session.getMesaId()).orElseThrow();
        access.requireRoleAtBranch("ATENCION", table.getSucursalId());
        if (!"ACTIVA".equals(session.getEstado())) throw DomainException.conflict("La sesión ya no está activa.");
        session.setEstado("CERRADA"); session.setFechaCierre(Instant.now()); session.setCerradaPor(access.currentUserId());
        sessions.save(session);
    }

    @Transactional
    public OrderService.OrderCreated createOrder(String rawToken, List<OrderService.OrderItem> items) {
        SesionMesa session = sessions.findByTokenSeguro(hash(rawToken)).orElseThrow(() -> DomainException.notFound("El QR no corresponde a una sesión activa."));
        if (!isValid(session)) throw DomainException.conflict("La sesión QR expiró o fue cerrada.");
        CuentaMesa account = accounts.findBySesionMesaId(session.getId()).orElseThrow(() -> DomainException.conflict("La sesión no tiene cuenta asociada."));
        if (!"ABIERTA".equals(account.getEstado())) throw DomainException.conflict("La cuenta está cerrada.");
        Mesa table = tables.findById(session.getMesaId()).orElseThrow();
        return orderService.createTableOrder(session.getId(), account.getId(), table.getSucursalId(), items);
    }

    @Transactional
    @Scheduled(fixedDelayString = "${amankay.qr.expiry-sweep-ms:60000}")
    public void expireSessions() {
        Instant cutoff = Instant.now().minus(sessionTtl);
        for (SesionMesa session : sessions.findByEstadoAndFechaAperturaBefore("ACTIVA", cutoff)) {
            if ("ACTIVA".equals(session.getEstado()) && expired(session)) {
                session.setEstado("EXPIRADA"); session.setFechaCierre(Instant.now()); sessions.save(session);
            }
        }
    }

    @Transactional
    public AccountView closeAccount(UUID accountId) {
        CuentaMesa account = accounts.lockById(accountId).orElseThrow(() -> DomainException.notFound("No se encontró la cuenta."));
        SesionMesa session = sessions.findById(account.getSesionMesaId()).orElseThrow();
        Mesa table = tables.findById(session.getMesaId()).orElseThrow();
        access.requireRoleAtBranch("ATENCION", table.getSucursalId());
        if (!"ABIERTA".equals(account.getEstado())) throw DomainException.conflict("La cuenta ya está cerrada.");
        List<Pago> paymentRows = payments.findByCuentaMesaIdOrderByFechaCreacionDesc(accountId);
        BigDecimal paid = paymentRows.stream().filter(row -> "CONFIRMADO".equals(row.getEstado())).map(Pago::getImporte).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal total = orders.findByCuentaMesaId(accountId).stream().filter(row -> List.of("ACEPTADO", "EN_PREPARACION", "LISTO", "COMPLETADO").contains(row.getEstado()))
                .map(Pedido::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (paid.compareTo(total) < 0) throw DomainException.conflict("No se puede cerrar la cuenta hasta cubrir el saldo pendiente completo.");
        account.setEstado("CERRADA"); account.setFechaCierre(Instant.now()); accounts.save(account);
        return new AccountView(account.getId(), account.getEstado(), total, paid);
    }

    private boolean isValid(SesionMesa session) {
        if ("ACTIVA".equals(session.getEstado()) && expired(session)) {
            session.setEstado("EXPIRADA"); session.setFechaCierre(Instant.now()); sessions.save(session);
            return false;
        }
        return "ACTIVA".equals(session.getEstado());
    }
    private boolean expired(SesionMesa session) { return !session.getFechaApertura().plus(sessionTtl).isAfter(Instant.now()); }
    private SessionStatus statusView(SesionMesa session) {
        Mesa table = tables.findById(session.getMesaId()).orElseThrow();
        CuentaMesa account = accounts.findBySesionMesaId(session.getId()).orElseThrow();
        List<OrderService.OrderSummary> summaries = orders.findByCuentaMesaId(account.getId()).stream().map(order ->
                new OrderService.OrderSummary(order.getId(), order.getCodigoSeguimiento(), order.getEstado(), order.getModalidadEntrega(),
                        order.getFechaCreacion(), order.getFechaVencimiento(), order.getTotal(), order.getSucursalId(), order.getTipo())).toList();
        return new SessionStatus(session.getId(), table.getId(), table.getIdentificador(), table.getIdentificadorQr(), table.getSucursalId(), session.getEstado(),
                session.getFechaApertura().plus(sessionTtl), account.getId(), account.getEstado(), summaries);
    }
    private String hash(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) throw new DomainException(HttpStatus.BAD_REQUEST, "Falta el token QR.");
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(rawToken.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception exception) { throw new IllegalStateException("No se pudo validar el token.", exception); }
    }

    public record OpenSessionResponse(UUID sesionId, String tokenTemporal, Instant expiraEn, UUID cuentaId, String qrSvg) {}
    public record TableOverview(UUID id, String identificador, String identificadorQr, Boolean activa,
            UUID sesionId, String estadoSesion, UUID cuentaId, String estadoCuenta) {}
    public record SessionStatus(UUID sesionId, UUID mesaId, String mesa, String codigoQrMesa, UUID sucursalId, String estadoSesion,
            Instant expiraEn, UUID cuentaId, String estadoCuenta, List<OrderService.OrderSummary> pedidos) {}
    public record AccountView(UUID id, String estado, BigDecimal total, BigDecimal pagado) {}
}
