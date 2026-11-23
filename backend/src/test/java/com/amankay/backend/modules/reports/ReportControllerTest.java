package com.amankay.backend.modules.reports;

import com.amankay.backend.modules.domain.model.Pedido;
import com.amankay.backend.modules.domain.model.RegistroAuditoria;
import com.amankay.backend.modules.domain.repository.MovimientoInventarioRepository;
import com.amankay.backend.modules.domain.repository.PedidoRepository;
import com.amankay.backend.modules.domain.repository.ProductoRepository;
import com.amankay.backend.modules.domain.repository.RegistroAuditoriaRepository;
import com.amankay.backend.modules.domain.repository.SolicitudReposicionRepository;
import com.amankay.backend.modules.inventory.InventoryService;
import com.amankay.backend.modules.security.StaffAccess;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ReportControllerTest {
    private final PedidoRepository orders = mock(PedidoRepository.class);
    private final RegistroAuditoriaRepository audit = mock(RegistroAuditoriaRepository.class);
    private final StaffAccess access = mock(StaffAccess.class);
    private final ReportController reports = new ReportController(orders, mock(SolicitudReposicionRepository.class),
            mock(InventoryService.class), access, audit, mock(MovimientoInventarioRepository.class), mock(ProductoRepository.class));

    @Test
    void salesUseCompletionEventsInPeriodAndOnlyTheRequestedBranch() {
        UUID branchId = UUID.randomUUID();
        UUID completedId = UUID.randomUUID();
        UUID otherBranchOrderId = UUID.randomUUID();
        Instant from = Instant.parse("2026-11-01T00:00:00Z");
        Instant to = Instant.parse("2026-11-30T23:59:59Z");
        RegistroAuditoria completed = completion(completedId);
        RegistroAuditoria otherBranch = completion(otherBranchOrderId);
        RegistroAuditoria unrelated = new RegistroAuditoria();
        unrelated.setValorNuevo("{\"estado\":\"ACEPTADO\"}");
        when(audit.findByEntidadAndOperacionAndFechaHoraBetweenOrderByFechaHoraDesc("Pedido", "CAMBIO_ESTADO", from, to))
                .thenReturn(List.of(completed, otherBranch, unrelated));
        Pedido inBranch = order(completedId, branchId, "COMPLETADO", "5500");
        Pedido elsewhere = order(otherBranchOrderId, UUID.randomUUID(), "COMPLETADO", "8000");
        when(orders.findAllById(anyList())).thenReturn(List.of(inBranch, elsewhere));

        ReportController.SalesReport result = reports.sales(branchId, from, to);

        verify(access).requireRoleAtBranchOrAdmin("ATENCION", branchId);
        assertThat(result.pedidosCompletados()).isEqualTo(1);
        assertThat(result.ventasCOP()).isEqualByComparingTo("5500");
    }

    private RegistroAuditoria completion(UUID orderId) {
        RegistroAuditoria row = new RegistroAuditoria();
        row.setEntidadId(orderId);
        row.setValorNuevo("{\"estado\":\"COMPLETADO\"}");
        return row;
    }

    private Pedido order(UUID id, UUID branchId, String state, String total) {
        Pedido row = new Pedido();
        row.setId(id); row.setSucursalId(branchId); row.setEstado(state); row.setTotal(new BigDecimal(total));
        return row;
    }
}
