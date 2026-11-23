package com.amankay.backend.modules.orders;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.amankay.backend.modules.domain.model.InventarioSucursal;
import com.amankay.backend.modules.domain.model.Pedido;
import com.amankay.backend.modules.domain.model.Pago;
import com.amankay.backend.modules.common.DomainException;
import com.amankay.backend.modules.domain.model.Producto;
import com.amankay.backend.modules.domain.model.Sucursal;
import com.amankay.backend.modules.domain.model.Usuario;
import com.amankay.backend.modules.domain.repository.ConfiguracionDomicilioRepository;
import com.amankay.backend.modules.domain.repository.DetallePedidoRepository;
import com.amankay.backend.modules.domain.repository.InventarioSucursalRepository;
import com.amankay.backend.modules.domain.repository.MovimientoInventarioRepository;
import com.amankay.backend.modules.domain.repository.PedidoRepository;
import com.amankay.backend.modules.domain.repository.PagoRepository;
import com.amankay.backend.modules.domain.repository.ProductoRepository;
import com.amankay.backend.modules.domain.repository.RegistroAuditoriaRepository;
import com.amankay.backend.modules.domain.repository.SucursalRepository;
import com.amankay.backend.modules.security.StaffAccess;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

class OrderServiceTest {
    private PedidoRepository orders;
    private ProductoRepository products;
    private SucursalRepository branches;
    private InventarioSucursalRepository stocks;
    private RegistroAuditoriaRepository audit;
    private PagoRepository payments;
    private StaffAccess access;
    private OrderService service;
    private UUID branchId;
    private UUID productId;
    private UUID orderId;
    private Producto product;

    @BeforeEach
    void setUp() {
        orders = mock(PedidoRepository.class);
        products = mock(ProductoRepository.class);
        branches = mock(SucursalRepository.class);
        stocks = mock(InventarioSucursalRepository.class);
        audit = mock(RegistroAuditoriaRepository.class);
        payments = mock(PagoRepository.class);
        access = mock(StaffAccess.class);
        service = new OrderService(orders, mock(DetallePedidoRepository.class), products, branches,
                mock(ConfiguracionDomicilioRepository.class), stocks, mock(MovimientoInventarioRepository.class), payments, audit, access);
        branchId = UUID.randomUUID();
        productId = UUID.randomUUID();
        orderId = UUID.randomUUID();
        product = new Producto();
        product.setId(productId);
        product.setNombre("Pan de queso");
        product.setActivo(true);
        product.setPrecio(new BigDecimal("2000.00"));
        Sucursal branch = new Sucursal();
        branch.setId(branchId);
        branch.setActiva(true);
        InventarioSucursal stock = new InventarioSucursal();
        stock.setStockDisponible(5);
        when(products.findById(productId)).thenReturn(Optional.of(product));
        when(branches.findById(branchId)).thenReturn(Optional.of(branch));
        when(stocks.findBySucursalIdAndProductoId(branchId, productId)).thenReturn(Optional.of(stock));
        when(orders.save(org.mockito.ArgumentMatchers.any())).thenAnswer(invocation -> {
            Pedido order = invocation.getArgument(0);
            order.setId(orderId);
            return order;
        });
        when(audit.save(org.mockito.ArgumentMatchers.any())).thenAnswer(invocation -> invocation.getArgument(0));
        Usuario staff = new Usuario();
        staff.setId(UUID.randomUUID());
        when(access.currentUser()).thenReturn(staff);
    }

    @Test
    void recordsWhatsAppOrderManuallyWithoutWebExpiry() {
        OrderService.WebOrderRequest request = new OrderService.WebOrderRequest("RECOGER", branchId,
                "Cliente", "3001234567", null, null, null, null, null, false, null, null,
                List.of(new OrderService.OrderItem(productId, 2)));

        OrderService.OrderCreated created = service.createManualWhatsApp(request);

        assertEquals("PENDIENTE_CONFIRMACION", created.estado());
        assertNull(created.venceEn());
        verify(access).requireRoleAtBranch("ATENCION", branchId);
        verify(audit).save(org.mockito.ArgumentMatchers.argThat(row ->
                "PEDIDO_WHATSAPP_REGISTRADO".equals(row.getOperacion()) && "USUARIO".equals(row.getTipoActor())));
    }

    @Test
    void keepsOperationalQueueInArrivalOrderAndChecksBranchAccess() {
        Pedido first = new Pedido();
        first.setId(UUID.randomUUID()); first.setEstado("PENDIENTE_CONFIRMACION");
        first.setFechaCreacion(Instant.parse("2026-11-22T10:00:00Z"));
        first.setSucursalId(branchId); first.setTotal(BigDecimal.ONE);
        Pedido second = new Pedido();
        second.setId(UUID.randomUUID()); second.setEstado("LISTO");
        second.setFechaCreacion(Instant.parse("2026-11-22T10:01:00Z"));
        second.setSucursalId(branchId); second.setTotal(BigDecimal.ONE);
        List<String> active = List.of("PENDIENTE_CONFIRMACION", "CANCELACION_SOLICITADA", "ACEPTADO", "EN_PREPARACION", "LISTO");
        when(orders.findBySucursalIdAndEstadoInOrderByFechaCreacionAsc(branchId, active))
                .thenReturn(List.of(first, second));

        List<OrderService.OrderSummary> queue = service.queue(branchId);

        assertEquals(List.of(first.getId(), second.getId()), queue.stream().map(OrderService.OrderSummary::id).toList());
        verify(access).requireRoleAtBranch("ATENCION", branchId);
    }

    @Test
    void limitsHistoryToThirtyTerminalOrdersAndChecksBranchAccess() {
        when(orders.findBySucursalIdAndEstadoInOrderByFechaCreacionDesc(branchId,
                List.of("COMPLETADO", "CANCELADO", "RECHAZADO", "VENCIDO"), PageRequest.of(0, 30)))
                .thenReturn(new PageImpl<>(List.of()));

        assertEquals(List.of(), service.recentHistory(branchId));
        verify(access).requireRoleAtBranch("ATENCION", branchId);
    }

    @Test
    void pendingTransferMustBeResolvedBeforeExternalPreparation() {
        Pedido order = new Pedido(); order.setId(orderId); order.setTipo("EXTERNO");
        order.setEstado("ACEPTADO"); order.setSucursalId(branchId);
        Pago payment = new Pago(); payment.setMetodo("TRANSFERENCIA"); payment.setEstado("PENDIENTE_VERIFICACION");
        when(orders.lockById(orderId)).thenReturn(Optional.of(order));
        when(payments.findByPedidoIdOrderByFechaCreacionDesc(orderId)).thenReturn(List.of(payment));

        assertThrows(DomainException.class, () -> service.transition(orderId, "EN_PREPARACION"));
        verify(access).requireRoleAtBranch("ATENCION", branchId);
    }
}
