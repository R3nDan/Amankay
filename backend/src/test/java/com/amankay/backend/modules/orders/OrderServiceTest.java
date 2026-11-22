package com.amankay.backend.modules.orders;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.amankay.backend.modules.domain.model.InventarioSucursal;
import com.amankay.backend.modules.domain.model.Pedido;
import com.amankay.backend.modules.domain.model.Producto;
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
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class OrderServiceTest {
    private PedidoRepository orders;
    private ProductoRepository products;
    private SucursalRepository branches;
    private InventarioSucursalRepository stocks;
    private RegistroAuditoriaRepository audit;
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
        access = mock(StaffAccess.class);
        service = new OrderService(orders, mock(DetallePedidoRepository.class), products, branches,
                mock(ConfiguracionDomicilioRepository.class), stocks, mock(MovimientoInventarioRepository.class), audit, access);
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
}
