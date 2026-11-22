package com.amankay.backend.modules.reports;

import com.amankay.backend.modules.common.DomainException;
import com.amankay.backend.modules.domain.model.Pedido;
import com.amankay.backend.modules.domain.model.SolicitudReposicion;
import com.amankay.backend.modules.domain.repository.PedidoRepository;
import com.amankay.backend.modules.domain.repository.SolicitudReposicionRepository;
import com.amankay.backend.modules.inventory.InventoryService;
import com.amankay.backend.modules.orders.OrderService;
import com.amankay.backend.modules.security.StaffAccess;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {
    private final PedidoRepository orders;
    private final SolicitudReposicionRepository replenishments;
    private final InventoryService inventory;
    private final StaffAccess access;

    public ReportController(PedidoRepository orders, SolicitudReposicionRepository replenishments,
            InventoryService inventory, StaffAccess access) {
        this.orders = orders; this.replenishments = replenishments; this.inventory = inventory; this.access = access;
    }

    @GetMapping("/sales")
    @PreAuthorize("hasRole('ATENCION')")
    public SalesReport sales(@RequestParam UUID sucursalId, @RequestParam Instant desde, @RequestParam Instant hasta) {
        access.requireRoleAtBranch("ATENCION", sucursalId); validateRange(desde, hasta);
        List<Pedido> completed = orders.findBySucursalIdAndFechaCreacionBetweenOrderByFechaCreacionDesc(sucursalId, desde, hasta).stream()
                .filter(row -> "COMPLETADO".equals(row.getEstado())).toList();
        BigDecimal total = completed.stream().map(Pedido::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new SalesReport(sucursalId, desde, hasta, completed.size(), total);
    }

    @GetMapping("/orders")
    @PreAuthorize("hasRole('ATENCION')")
    public List<OrderService.OrderSummary> orderHistory(@RequestParam UUID sucursalId, @RequestParam Instant desde, @RequestParam Instant hasta) {
        access.requireRoleAtBranch("ATENCION", sucursalId); validateRange(desde, hasta);
        return orders.findBySucursalIdAndFechaCreacionBetweenOrderByFechaCreacionDesc(sucursalId, desde, hasta).stream()
                .map(order -> new OrderService.OrderSummary(order.getId(), order.getCodigoSeguimiento(), order.getEstado(),
                        order.getModalidadEntrega(), order.getFechaCreacion(), order.getFechaVencimiento(), order.getTotal(), order.getSucursalId())).toList();
    }

    @GetMapping("/inventory")
    @PreAuthorize("hasRole('INVENTARIO')")
    public List<InventoryService.StockView> inventory(@RequestParam UUID sucursalId) { return inventory.stock(sucursalId); }

    @GetMapping("/replenishments")
    @PreAuthorize("hasRole('INVENTARIO')")
    public List<ReplenishmentSummary> replenishment(@RequestParam UUID sucursalId) {
        access.requireRoleAtBranch("INVENTARIO", sucursalId);
        return replenishments.findBySucursalSolicitanteIdOrderByFechaSolicitudDesc(sucursalId).stream()
                .map(row -> new ReplenishmentSummary(row.getId(), row.getEstado(), row.getFechaSolicitud(), row.getSucursalProveedoraId())).toList();
    }

    private void validateRange(Instant from, Instant to) {
        if (from == null || to == null || from.isAfter(to)) throw new DomainException(org.springframework.http.HttpStatus.BAD_REQUEST, "El intervalo de fechas no es válido.");
    }
    public record SalesReport(UUID sucursalId, Instant desde, Instant hasta, long pedidosCompletados, BigDecimal ventasCOP) {}
    public record ReplenishmentSummary(UUID id, String estado, Instant fecha, UUID sucursalProveedoraId) {}
}
