package com.amankay.backend.modules.payments;

import com.amankay.backend.modules.common.DomainException;
import com.amankay.backend.modules.domain.model.CuentaMesa;
import com.amankay.backend.modules.domain.model.Pago;
import com.amankay.backend.modules.domain.model.Pedido;
import com.amankay.backend.modules.domain.model.Usuario;
import com.amankay.backend.modules.domain.repository.CuentaMesaRepository;
import com.amankay.backend.modules.domain.repository.PagoRepository;
import com.amankay.backend.modules.domain.repository.PedidoRepository;
import com.amankay.backend.modules.security.StaffAccess;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PaymentService {
    private final PagoRepository payments;
    private final PedidoRepository orders;
    private final CuentaMesaRepository accounts;
    private final StaffAccess access;
    private final PrivateReceiptStorage receiptStorage;

    public PaymentService(PagoRepository payments, PedidoRepository orders, CuentaMesaRepository accounts, StaffAccess access,
            PrivateReceiptStorage receiptStorage) {
        this.payments = payments; this.orders = orders; this.accounts = accounts; this.access = access; this.receiptStorage = receiptStorage;
    }

    @Transactional
    public PaymentView createForOrder(UUID orderId, String method) {
        Pedido order = orders.lockById(orderId).orElseThrow(() -> DomainException.notFound("No se encontró el pedido."));
        access.requireRoleAtBranch("ATENCION", order.getSucursalId());
        if (!"EXTERNO".equals(order.getTipo())) throw DomainException.conflict("Los pedidos de mesa se cobran mediante su cuenta común.");
        if (!List.of("EFECTIVO", "TRANSFERENCIA").contains(method)) throw invalid("Método de pago no permitido.");
        if (!List.of("ACEPTADO", "EN_PREPARACION", "LISTO", "COMPLETADO").contains(order.getEstado()))
            throw DomainException.conflict("El pedido no admite pagos en su estado actual.");
        List<Pago> existing = payments.findByPedidoIdOrderByFechaCreacionDesc(orderId);
        ensureNoOpenAttempt(existing);
        BigDecimal due = order.getTotal().subtract(confirmedAmount(existing));
        if (due.signum() <= 0) throw DomainException.conflict("El pedido ya está pagado.");
        Pago payment = new Pago(); payment.setPedidoId(orderId); payment.setMetodo(method); payment.setEstado("PENDIENTE");
        payment.setImporte(due); payment.setFechaCreacion(Instant.now());
        return view(payments.save(payment));
    }

    @Transactional
    public PaymentView createForTableAccount(UUID accountId, String method) {
        CuentaMesa account = accounts.lockById(accountId).orElseThrow(() -> DomainException.notFound("No se encontró la cuenta de mesa."));
        UUID branchId = orders.findByCuentaMesaId(accountId).stream().map(Pedido::getSucursalId).filter(java.util.Objects::nonNull).findFirst()
                .orElseThrow(() -> DomainException.conflict("La cuenta aún no tiene pedidos asociados."));
        access.requireRoleAtBranch("ATENCION", branchId);
        if (!"ABIERTA".equals(account.getEstado())) throw DomainException.conflict("La cuenta ya está cerrada.");
        if (!List.of("EFECTIVO", "TRANSFERENCIA").contains(method)) throw invalid("Método de pago no permitido.");
        List<Pago> existing = payments.findByCuentaMesaIdOrderByFechaCreacionDesc(accountId);
        ensureNoOpenAttempt(existing);
        BigDecimal due = accountTotal(accountId).subtract(confirmedAmount(existing));
        if (due.signum() <= 0) throw DomainException.conflict("La cuenta ya está pagada.");
        Pago payment = new Pago(); payment.setCuentaMesaId(accountId); payment.setMetodo(method); payment.setEstado("PENDIENTE");
        payment.setImporte(due); payment.setFechaCreacion(Instant.now());
        return view(payments.save(payment));
    }

    @Transactional(readOnly = true)
    public List<PaymentView> orderAttempts(UUID orderId) {
        Pedido order = orders.findById(orderId).orElseThrow(() -> DomainException.notFound("No se encontró el pedido."));
        access.requireRoleAtBranch("ATENCION", order.getSucursalId());
        return payments.findByPedidoIdOrderByFechaCreacionDesc(orderId).stream().map(this::view).toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentView> accountAttempts(UUID accountId) {
        accounts.findById(accountId).orElseThrow(() -> DomainException.notFound("No se encontró la cuenta de mesa."));
        UUID branchId = orders.findByCuentaMesaId(accountId).stream().map(Pedido::getSucursalId)
                .filter(java.util.Objects::nonNull).findFirst()
                .orElseThrow(() -> DomainException.conflict("La cuenta aún no tiene pedidos asociados."));
        access.requireRoleAtBranch("ATENCION", branchId);
        return payments.findByCuentaMesaIdOrderByFechaCreacionDesc(accountId).stream().map(this::view).toList();
    }

    @Transactional
    public PaymentView verify(UUID paymentId, boolean approve, String reason) {
        Pago payment = payments.lockById(paymentId).orElseThrow(() -> DomainException.notFound("No se encontró el intento de pago."));
        lockAndAuthorizeOrigin(payment);
        if (!"TRANSFERENCIA".equals(payment.getMetodo()) || !"PENDIENTE_VERIFICACION".equals(payment.getEstado()))
            throw DomainException.conflict("Solo una transferencia pendiente de verificación puede resolverse aquí.");
        if (!approve) {
            if (reason == null || reason.isBlank()) throw invalid("Indica el motivo del rechazo.");
            String rejectedReceipt = payment.getArchivo();
            payment.setEstado("RECHAZADO"); payment.setMotivoRechazo(reason.trim()); payment.setVerificadoPor(access.currentUserId());
            payment.setFechaVerificacion(Instant.now());
            PaymentView result = view(payments.save(payment));
            deleteReceiptAfterCommit(rejectedReceipt);
            return result;
        }
        ensureAmountStillDue(payment);
        payment.setEstado("CONFIRMADO"); payment.setFechaConfirmacion(Instant.now());
        payment.setVerificadoPor(access.currentUserId()); payment.setFechaVerificacion(Instant.now());
        return view(payments.save(payment));
    }

    @Transactional
    public PaymentView uploadReceipt(UUID paymentId, MultipartFile file) {
        Pago payment = payments.lockById(paymentId).orElseThrow(() -> DomainException.notFound("No se encontró el intento de pago."));
        lockAndAuthorizeOrigin(payment);
        if (!"TRANSFERENCIA".equals(payment.getMetodo()) || !"PENDIENTE".equals(payment.getEstado()))
            throw DomainException.conflict("Solo un intento de transferencia pendiente admite comprobante.");
        if (payment.getArchivo() != null) throw DomainException.conflict("Este intento ya tiene un comprobante.");
        try {
            payment.setArchivo(receiptStorage.store(file));
            payment.setFechaCarga(Instant.now());
            payment.setEstado("PENDIENTE_VERIFICACION");
            return view(payments.save(payment));
        } catch (IOException exception) {
            throw new DomainException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo guardar el comprobante.");
        }
    }

    @Transactional(readOnly = true)
    public PrivateReceiptStorage.Download receipt(UUID paymentId) {
        Pago payment = payments.findById(paymentId).orElseThrow(() -> DomainException.notFound("No se encontró el intento de pago."));
        lockAndAuthorizeOrigin(payment);
        if (!"TRANSFERENCIA".equals(payment.getMetodo()) || payment.getArchivo() == null
                || !"PENDIENTE_VERIFICACION".equals(payment.getEstado()))
            throw DomainException.notFound("No se encontró el comprobante disponible para revisión.");
        try { return receiptStorage.load(payment.getArchivo()); }
        catch (IOException exception) { throw new DomainException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo leer el comprobante."); }
    }

    @Transactional
    public PaymentView confirmCash(UUID paymentId) {
        Pago payment = payments.lockById(paymentId).orElseThrow(() -> DomainException.notFound("No se encontró el intento de pago."));
        lockAndAuthorizeOrigin(payment);
        if (!"EFECTIVO".equals(payment.getMetodo()) || !"PENDIENTE".equals(payment.getEstado()))
            throw DomainException.conflict("Este intento no es un pago en efectivo pendiente.");
        ensureAmountStillDue(payment);
        payment.setEstado("CONFIRMADO"); payment.setFechaConfirmacion(Instant.now());
        payment.setVerificadoPor(access.currentUserId()); payment.setFechaVerificacion(Instant.now());
        return view(payments.save(payment));
    }

    @Transactional
    public PaymentView refund(UUID paymentId, String reason) {
        Pago payment = payments.lockById(paymentId).orElseThrow(() -> DomainException.notFound("No se encontró el intento de pago."));
        lockAndAuthorizeOrigin(payment);
        if (!"CONFIRMADO".equals(payment.getEstado()) || payment.getReembolsoFecha() != null)
            throw DomainException.conflict("Solo se puede reembolsar una vez un pago confirmado.");
        if (reason == null || reason.isBlank()) throw invalid("Indica el motivo del reembolso.");
        payment.setEstado("REEMBOLSADO"); payment.setReembolsoFecha(Instant.now()); payment.setReembolsoMotivo(reason.trim());
        payment.setReembolsoPor(access.currentUserId()); payment.setReembolsoEstado("REEMBOLSO_TOTAL_MANUAL");
        return view(payments.save(payment));
    }

    private void ensureNoOpenAttempt(List<Pago> existing) {
        if (existing.stream().anyMatch(p -> List.of("PENDIENTE", "PENDIENTE_VERIFICACION").contains(p.getEstado())))
            throw DomainException.conflict("Resuelve el intento de pago pendiente antes de crear otro.");
    }

    private void deleteReceiptAfterCommit(String receiptKey) {
        if (receiptKey == null || receiptKey.isBlank()) return;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                try {
                    receiptStorage.delete(receiptKey);
                } catch (IOException exception) {
                    System.getLogger(PaymentService.class.getName()).log(System.Logger.Level.ERROR,
                            "No se pudo eliminar un comprobante rechazado después de confirmar la transacción.", exception);
                }
            }
        });
    }

    private void ensureAmountStillDue(Pago payment) {
        BigDecimal due;
        if (payment.getPedidoId() != null) {
            Pedido order = orders.lockById(payment.getPedidoId()).orElseThrow();
            List<Pago> history = payments.findByPedidoIdOrderByFechaCreacionDesc(order.getId()).stream().filter(p -> !p.getId().equals(payment.getId())).toList();
            due = order.getTotal().subtract(confirmedAmount(history));
        } else {
            CuentaMesa account = accounts.lockById(payment.getCuentaMesaId()).orElseThrow();
            List<Pago> history = payments.findByCuentaMesaIdOrderByFechaCreacionDesc(account.getId()).stream().filter(p -> !p.getId().equals(payment.getId())).toList();
            due = accountTotal(account.getId()).subtract(confirmedAmount(history));
        }
        if (payment.getImporte().compareTo(due) != 0) throw DomainException.conflict("El saldo cambió; este intento ya no cubre el saldo pendiente completo.");
    }

    private void lockAndAuthorizeOrigin(Pago payment) {
        if (payment.getPedidoId() != null) {
            Pedido order = orders.lockById(payment.getPedidoId()).orElseThrow(() -> DomainException.notFound("No se encontró el pedido del pago."));
            access.requireRoleAtBranch("ATENCION", order.getSucursalId());
        } else {
            CuentaMesa account = accounts.lockById(payment.getCuentaMesaId()).orElseThrow(() -> DomainException.notFound("No se encontró la cuenta."));
            UUID branchId = orders.findByCuentaMesaId(account.getId()).stream().map(Pedido::getSucursalId).filter(java.util.Objects::nonNull).findFirst()
                    .orElseThrow(() -> DomainException.conflict("La cuenta no tiene sucursal asociada."));
            access.requireRoleAtBranch("ATENCION", branchId);
        }
    }

    private BigDecimal accountTotal(UUID accountId) {
        return orders.findByCuentaMesaId(accountId).stream().filter(order -> List.of("ACEPTADO", "EN_PREPARACION", "LISTO", "COMPLETADO").contains(order.getEstado()))
                .map(Pedido::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    private BigDecimal confirmedAmount(List<Pago> rows) {
        return rows.stream().filter(payment -> "CONFIRMADO".equals(payment.getEstado())).map(Pago::getImporte).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    private PaymentView view(Pago payment) {
        return new PaymentView(payment.getId(), payment.getPedidoId(), payment.getCuentaMesaId(), payment.getMetodo(), payment.getEstado(),
                payment.getImporte(), payment.getFechaCreacion(), payment.getFechaConfirmacion(), payment.getMotivoRechazo());
    }
    private DomainException invalid(String message) { return new DomainException(HttpStatus.BAD_REQUEST, message); }
    public record PaymentView(UUID id, UUID pedidoId, UUID cuentaMesaId, String metodo, String estado,
            BigDecimal importe, Instant creadoEn, Instant confirmadoEn, String motivoRechazo) {}
}
