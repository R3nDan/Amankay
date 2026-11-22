package com.amankay.backend.modules.inventory;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.amankay.backend.modules.domain.model.InventarioSucursal;
import com.amankay.backend.modules.domain.model.RegistroAuditoria;
import com.amankay.backend.modules.domain.repository.InventarioSucursalRepository;
import com.amankay.backend.modules.domain.repository.MovimientoInventarioRepository;
import com.amankay.backend.modules.domain.repository.RegistroAuditoriaRepository;
import com.amankay.backend.modules.security.StaffAccess;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class InventoryServiceTest {
    private InventarioSucursalRepository stocks;
    private MovimientoInventarioRepository movements;
    private RegistroAuditoriaRepository audit;
    private StaffAccess access;
    private InventoryService service;
    private InventarioSucursal stock;

    @BeforeEach
    void setUp() {
        stocks = mock(InventarioSucursalRepository.class);
        movements = mock(MovimientoInventarioRepository.class);
        audit = mock(RegistroAuditoriaRepository.class);
        access = mock(StaffAccess.class);
        service = new InventoryService(stocks, movements, audit, access);
        stock = new InventarioSucursal();
        stock.setId(UUID.randomUUID());
        stock.setSucursalId(UUID.randomUUID());
        stock.setProductoId(UUID.randomUUID());
        stock.setStockDisponible(9);
        stock.setFechaActualizacion(Instant.now());
        when(stocks.findById(stock.getId())).thenReturn(Optional.of(stock));
        when(stocks.lockByBranchAndProduct(stock.getSucursalId(), stock.getProductoId())).thenReturn(Optional.of(stock));
        var user = new com.amankay.backend.modules.domain.model.Usuario();
        user.setId(UUID.randomUUID());
        when(access.currentUser()).thenReturn(user);
        when(access.currentUserId()).thenReturn(user.getId());
        when(audit.save(any(RegistroAuditoria.class))).thenAnswer(invocation -> {
            RegistroAuditoria row = invocation.getArgument(0);
            row.setId(UUID.randomUUID());
            return row;
        });
        when(movements.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void recordsShrinkageAsAnExplicitDecreaseWithReason() {
        var result = service.adjust(stock.getId(), new InventoryService.AdjustmentRequest("MERMA", 2, "Producto dañado"));

        assertEquals("MERMA", result.tipo());
        assertEquals(9, result.stockAnterior());
        assertEquals(7, result.stockResultante());
        assertEquals("Producto dañado", result.motivo());
        assertEquals(7, stock.getStockDisponible());
        verify(access).requireRoleAtBranch("INVENTARIO", stock.getSucursalId());
    }
}
