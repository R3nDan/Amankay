package com.amankay.backend.modules.deliveries;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.amankay.backend.modules.domain.model.Entrega;
import com.amankay.backend.modules.domain.model.ConciliacionEfectivo;
import com.amankay.backend.modules.domain.model.Pedido;
import com.amankay.backend.modules.domain.model.Usuario;
import com.amankay.backend.modules.common.DomainException;
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
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DeliveryServiceTest {
    private EntregaRepository deliveries;
    private PedidoRepository orders;
    private ConciliacionEfectivoRepository reconciliations;
    private RegistroAuditoriaRepository audit;
    private StaffAccess access;
    private DeliveryService service;
    private UUID deliveryId;
    private UUID orderId;
    private UUID branchId;
    private Entrega delivery;
    private Usuario driver;

    @BeforeEach
    void setUp() {
        deliveries = mock(EntregaRepository.class);
        orders = mock(PedidoRepository.class);
        reconciliations = mock(ConciliacionEfectivoRepository.class);
        audit = mock(RegistroAuditoriaRepository.class);
        access = mock(StaffAccess.class);
        service = new DeliveryService(deliveries, orders, mock(UsuarioRepository.class),
                mock(UsuarioRolRepository.class), mock(RolRepository.class), reconciliations,
                mock(DetallePedidoRepository.class), audit, mock(UsuarioSucursalRepository.class), access);
        deliveryId = UUID.randomUUID();
        orderId = UUID.randomUUID();
        branchId = UUID.randomUUID();
        delivery = new Entrega();
        delivery.setId(deliveryId);
        delivery.setRepartidorId(UUID.randomUUID());
        delivery.setEstado("ENTREGADA");
        driver = new Usuario();
        driver.setId(delivery.getRepartidorId());
        when(access.currentUser()).thenReturn(driver);
        when(access.currentUserId()).thenReturn(driver.getId());
        when(deliveries.findById(deliveryId)).thenReturn(Optional.of(delivery));
        when(deliveries.save(delivery)).thenReturn(delivery);
    }

    @Test
    void storesDeclaredCashAsStructuredDeliveryDataAndAuditsTheEvent() {
        service.declareCash(deliveryId, new BigDecimal("12500"));

        assertEquals(new BigDecimal("12500.00"), delivery.getMontoEfectivoDeclarado());
        verify(deliveries).save(delivery);
        verify(audit).save(org.mockito.ArgumentMatchers.argThat(row -> "EFECTIVO_DECLARADO".equals(row.getOperacion())));
    }

    @Test
    void keepsCashRedclarationsAuditedAndUsesTheLatestStructuredAmount() {
        service.declareCash(deliveryId, new BigDecimal("12500.00"));

        service.declareCash(deliveryId, new BigDecimal("12000"));

        assertEquals(new BigDecimal("12000.00"), delivery.getMontoEfectivoDeclarado());
        verify(audit, times(2)).save(org.mockito.ArgumentMatchers.argThat(row -> "EFECTIVO_DECLARADO".equals(row.getOperacion())));
    }

    @Test
    void rectifiesReconciliationAndPreservesThePreviousAmountsInAudit() {
        delivery.setPedidoId(orderId);
        Pedido order = new Pedido();
        order.setSucursalId(branchId);
        when(orders.findById(orderId)).thenReturn(Optional.of(order));
        ConciliacionEfectivo row = new ConciliacionEfectivo();
        row.setId(UUID.randomUUID());
        row.setEntregaId(deliveryId);
        row.setMontoDeclarado(new BigDecimal("12500.00"));
        row.setMontoRecibido(new BigDecimal("12000.00"));
        row.setMotivoDiferencia("Diferencia inicial");
        when(reconciliations.findByEntregaId(deliveryId)).thenReturn(Optional.of(row));
        when(reconciliations.save(row)).thenReturn(row);

        var result = service.rectifyReconciliation(deliveryId, new BigDecimal("12500"), new BigDecimal("12500"), "Se verificó el recibo.");

        assertEquals(new BigDecimal("12500.00"), result.declarado());
        assertEquals(new BigDecimal("12500.00"), result.recibido());
        assertEquals(null, result.motivo());
        verify(audit).save(org.mockito.ArgumentMatchers.argThat(event ->
                "CONCILIACION_EFECTIVO_RECTIFICADA".equals(event.getOperacion())
                        && event.getValorAnterior().contains("12000.00")
                        && event.getValorNuevo().contains("12500.00")));
    }

    @Test
    void requiresAReasonToRectifyReconciliation() {
        delivery.setPedidoId(orderId);
        Pedido order = new Pedido();
        order.setSucursalId(branchId);
        when(orders.findById(orderId)).thenReturn(Optional.of(order));
        ConciliacionEfectivo row = new ConciliacionEfectivo();
        row.setMontoDeclarado(new BigDecimal("100.00"));
        row.setMontoRecibido(new BigDecimal("100.00"));
        when(reconciliations.findByEntregaId(deliveryId)).thenReturn(Optional.of(row));

        assertThrows(DomainException.class, () -> service.rectifyReconciliation(deliveryId,
                new BigDecimal("100"), new BigDecimal("100"), " "));
    }
}
