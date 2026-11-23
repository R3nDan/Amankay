package com.amankay.backend.modules.tables;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.amankay.backend.modules.common.DomainException;
import com.amankay.backend.modules.domain.model.CuentaMesa;
import com.amankay.backend.modules.domain.model.Mesa;
import com.amankay.backend.modules.domain.model.SesionMesa;
import com.amankay.backend.modules.domain.repository.CuentaMesaRepository;
import com.amankay.backend.modules.domain.repository.MesaRepository;
import com.amankay.backend.modules.domain.repository.PagoRepository;
import com.amankay.backend.modules.domain.repository.PedidoRepository;
import com.amankay.backend.modules.domain.repository.SesionMesaRepository;
import com.amankay.backend.modules.orders.OrderService;
import com.amankay.backend.modules.security.StaffAccess;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class TableServiceTest {
    private MesaRepository tables;
    private SesionMesaRepository sessions;
    private CuentaMesaRepository accounts;
    private StaffAccess access;
    private TableService service;

    @BeforeEach
    void setUp() {
        tables = mock(MesaRepository.class);
        sessions = mock(SesionMesaRepository.class);
        accounts = mock(CuentaMesaRepository.class);
        access = mock(StaffAccess.class);
        service = new TableService(tables, sessions, accounts, mock(PedidoRepository.class), mock(PagoRepository.class),
                mock(OrderService.class), access, Duration.ofHours(8), "http://localhost:3000", new TemporaryQr());
    }

    @Test
    void openingCreatesASeparateAccountAndAUniqueTemporaryQr() {
        UUID tableId = UUID.randomUUID();
        UUID branchId = UUID.randomUUID();
        Mesa table = new Mesa(); table.setId(tableId); table.setSucursalId(branchId);
        table.setIdentificador("Mesa 1"); table.setIdentificadorQr("AMK-1"); table.setActiva(true);
        when(tables.lockById(tableId)).thenReturn(Optional.of(table));
        when(sessions.findByMesaIdAndEstado(tableId, "ACTIVA")).thenReturn(List.of());
        when(accounts.findByEstado("ABIERTA")).thenReturn(List.of());
        when(sessions.save(any(SesionMesa.class))).thenAnswer(invocation -> {
            SesionMesa row = invocation.getArgument(0);
            row.setId(UUID.randomUUID());
            return row;
        });
        when(accounts.save(any(CuentaMesa.class))).thenAnswer(invocation -> {
            CuentaMesa row = invocation.getArgument(0);
            row.setId(UUID.randomUUID());
            return row;
        });

        TableService.OpenSessionResponse opened = service.open(tableId);

        verify(access).requireRoleAtBranch("ATENCION", branchId);
        assertNotNull(opened.sesionId());
        assertNotNull(opened.cuentaId());
        assertEquals(43, opened.tokenTemporal().length());
        assertNotNull(opened.qrSvg());
        ArgumentCaptor<SesionMesa> saved = ArgumentCaptor.forClass(SesionMesa.class);
        verify(sessions).save(saved.capture());
        org.junit.jupiter.api.Assertions.assertNotEquals(opened.tokenTemporal(), saved.getValue().getTokenSeguro());
    }

    @Test
    void closingASessionInvalidatesItsTokenWithoutClosingTheAccount() {
        SesionMesa session = new SesionMesa();
        UUID sessionId = UUID.randomUUID();
        UUID tableId = UUID.randomUUID();
        UUID branchId = UUID.randomUUID();
        session.setId(sessionId);
        session.setMesaId(tableId);
        session.setEstado("ACTIVA");
        session.setFechaApertura(Instant.now());
        Mesa table = new Mesa(); table.setId(tableId); table.setSucursalId(branchId);
        when(sessions.findById(sessionId)).thenReturn(Optional.of(session));
        when(tables.findById(tableId)).thenReturn(Optional.of(table));
        when(sessions.findByTokenSeguro(anyString())).thenReturn(Optional.of(session));

        service.close(sessionId);

        verify(access).requireRoleAtBranch("ATENCION", branchId);
        assertEquals("CERRADA", session.getEstado());
        assertThrows(DomainException.class, () -> service.validate("sample-token"));
        assertThrows(DomainException.class, () -> service.createOrder("sample-token", List.of()));
        verify(accounts, never()).save(any());
    }

    @Test
    void expiryInvalidatesTheTokenWithoutClosingTheAccount() {
        SesionMesa session = new SesionMesa();
        session.setId(UUID.randomUUID());
        session.setEstado("ACTIVA");
        session.setFechaApertura(Instant.now().minus(Duration.ofHours(9)));
        when(sessions.findByTokenSeguro(anyString())).thenReturn(Optional.of(session));
        when(sessions.save(any(SesionMesa.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThrows(DomainException.class, () -> service.validate("sample-token"));
        assertEquals("EXPIRADA", session.getEstado());
        verify(accounts, never()).save(any());
    }
}
