package com.amankay.backend.modules.deliveries;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class DeliveryController {
    private final DeliveryService service;
    public DeliveryController(DeliveryService service) { this.service = service; }

    @PostMapping("/staff/orders/{orderId}/delivery")
    @PreAuthorize("hasRole('ATENCION')")
    public DeliveryService.DeliveryView assign(@PathVariable UUID orderId, @Valid @RequestBody AssignRequest request) {
        return service.assign(orderId, request.repartidorId());
    }
    @GetMapping("/driver/deliveries")
    @PreAuthorize("hasRole('REPARTIDOR')")
    public List<DeliveryService.DeliveryView> mine() { return service.myDeliveries(); }

    @GetMapping("/staff/deliveries")
    @PreAuthorize("hasRole('ATENCION')")
    public List<DeliveryService.DeliveryView> branchDeliveries(@RequestParam UUID sucursalId) { return service.branchDeliveries(sucursalId); }
    @PostMapping("/driver/deliveries/{deliveryId}/status")
    @PreAuthorize("hasRole('REPARTIDOR')")
    public DeliveryService.DeliveryView update(@PathVariable UUID deliveryId, @Valid @RequestBody StateRequest request) {
        return service.driverUpdate(deliveryId, request.estado(), request.observaciones());
    }
    @PostMapping("/driver/deliveries/{deliveryId}/cash-declaration")
    @PreAuthorize("hasRole('REPARTIDOR')")
    public void declareCash(@PathVariable UUID deliveryId, @Valid @RequestBody CashDeclaration request) {
        service.declareCash(deliveryId, request.monto());
    }
    @PostMapping("/staff/deliveries/{deliveryId}/retry")
    @PreAuthorize("hasRole('ATENCION')")
    public DeliveryService.DeliveryView retry(@PathVariable UUID deliveryId, @Valid @RequestBody RetryRequest request) {
        return service.retry(deliveryId, request.repartidorId(), request.motivo());
    }
    @PostMapping("/staff/deliveries/{deliveryId}/cash-reconciliation")
    @PreAuthorize("hasRole('ATENCION')")
    public DeliveryService.ReconciliationView reconcile(@PathVariable UUID deliveryId, @Valid @RequestBody ReconciliationRequest request) {
        return service.reconcile(deliveryId, request.montoRecibido(), request.motivo());
    }
    @PostMapping("/staff/deliveries/{deliveryId}/cash-reconciliation/rectification")
    @PreAuthorize("hasRole('ATENCION')")
    public DeliveryService.ReconciliationView rectifyReconciliation(@PathVariable UUID deliveryId,
            @Valid @RequestBody RectificationRequest request) {
        return service.rectifyReconciliation(deliveryId, request.montoDeclarado(), request.montoRecibido(), request.motivo());
    }

    public record AssignRequest(@NotNull UUID repartidorId) {}
    public record StateRequest(@NotBlank String estado, String observaciones) {}
    public record CashDeclaration(@NotNull @DecimalMin("0.00") BigDecimal monto) {}
    public record RetryRequest(UUID repartidorId, @NotBlank String motivo) {}
    public record ReconciliationRequest(@NotNull @DecimalMin("0.00") BigDecimal montoRecibido, String motivo) {}
    public record RectificationRequest(@NotNull @DecimalMin("0.00") BigDecimal montoDeclarado,
            @NotNull @DecimalMin("0.00") BigDecimal montoRecibido, @NotBlank String motivo) {}
}
