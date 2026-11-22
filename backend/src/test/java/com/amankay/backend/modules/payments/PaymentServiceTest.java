package com.amankay.backend.modules.payments;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

import com.amankay.backend.modules.common.DomainException;
import com.amankay.backend.modules.domain.model.Pedido;
import com.amankay.backend.modules.domain.repository.CuentaMesaRepository;
import com.amankay.backend.modules.domain.repository.PagoRepository;
import com.amankay.backend.modules.domain.repository.PedidoRepository;
import com.amankay.backend.modules.security.StaffAccess;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

class PaymentServiceTest {
    private PagoRepository payments;
    private PedidoRepository orders;
    private CuentaMesaRepository accounts;
    private StaffAccess access;
    private PrivateReceiptStorage storage;
    private PaymentService service;

    @BeforeEach
    void setUp() {
        payments = org.mockito.Mockito.mock(PagoRepository.class);
        orders = org.mockito.Mockito.mock(PedidoRepository.class);
        accounts = org.mockito.Mockito.mock(CuentaMesaRepository.class);
        access = org.mockito.Mockito.mock(StaffAccess.class);
        storage = org.mockito.Mockito.mock(PrivateReceiptStorage.class);
        service = new PaymentService(payments, orders, accounts, access, storage);
    }

    @Test
    void createsAttemptForTheWholeOutstandingOrderBalance() {
        UUID orderId = UUID.randomUUID();
        UUID branchId = UUID.randomUUID();
        Pedido order = new Pedido();
        order.setId(orderId);
        order.setSucursalId(branchId);
        order.setEstado("ACEPTADO");
        order.setTotal(new BigDecimal("8500.00"));
        when(orders.lockById(orderId)).thenReturn(Optional.of(order));
        when(payments.findByPedidoIdOrderByFechaCreacionDesc(orderId)).thenReturn(List.of());
        when(payments.save(org.mockito.ArgumentMatchers.any())).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentService.PaymentView result = service.createForOrder(orderId, "TRANSFERENCIA");

        assertEquals(new BigDecimal("8500.00"), result.importe());
        verify(access).requireRoleAtBranch("ATENCION", branchId);
    }

    @Test
    void preventsAnotherAttemptWhileOneIsUnresolved() {
        UUID orderId = UUID.randomUUID();
        Pedido order = new Pedido();
        order.setId(orderId);
        order.setSucursalId(UUID.randomUUID());
        order.setEstado("ACEPTADO");
        order.setTotal(new BigDecimal("8500.00"));
        var pending = new com.amankay.backend.modules.domain.model.Pago();
        pending.setEstado("PENDIENTE_VERIFICACION");
        when(orders.lockById(orderId)).thenReturn(Optional.of(order));
        when(payments.findByPedidoIdOrderByFechaCreacionDesc(orderId)).thenReturn(List.of(pending));

        assertThrows(DomainException.class, () -> service.createForOrder(orderId, "TRANSFERENCIA"));
    }

    @Test
    void doesNotStartPaymentBeforeOrderConfirmationOrWhileCancellationIsPending() {
        UUID orderId = UUID.randomUUID();
        Pedido order = new Pedido();
        order.setId(orderId);
        order.setSucursalId(UUID.randomUUID());
        order.setTotal(new BigDecimal("8500.00"));
        for (String state : List.of("PENDIENTE_CONFIRMACION", "CANCELACION_SOLICITADA", "CANCELADO", "RECHAZADO", "VENCIDO")) {
            order.setEstado(state);
            when(orders.lockById(orderId)).thenReturn(Optional.of(order));
            assertThrows(DomainException.class, () -> service.createForOrder(orderId, "TRANSFERENCIA"), state);
        }
        verify(payments, never()).save(org.mockito.ArgumentMatchers.any());
    }
}
