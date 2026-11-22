package com.amankay.backend.modules.orders;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService service) { this.service = service; }

    @PostMapping("/orders/web")
    public OrderService.OrderCreated createWeb(@Valid @RequestBody OrderService.WebOrderRequest request) {
        return service.createWeb(request);
    }

    @PostMapping("/staff/orders/whatsapp")
    @PreAuthorize("hasRole('ATENCION')")
    public OrderService.OrderCreated recordWhatsApp(@Valid @RequestBody OrderService.WebOrderRequest request) {
        return service.createManualWhatsApp(request);
    }

    @GetMapping("/orders/track/{code}")
    public OrderService.OrderTracking track(@PathVariable String code) { return service.track(code); }

    @PostMapping("/orders/track/{code}/cancellation")
    public OrderService.OrderSummary requestCancellation(@PathVariable String code) { return service.requestCancellation(code); }

    @GetMapping("/staff/orders/pending")
    @PreAuthorize("hasRole('ATENCION')")
    public List<OrderService.OrderSummary> pending(@RequestParam UUID sucursalId) { return service.pending(sucursalId); }

    @GetMapping("/staff/orders/unassigned")
    @PreAuthorize("hasRole('ATENCION')")
    public List<OrderService.OrderSummary> unassignedPending() { return service.unassignedPending(); }

    @PostMapping("/staff/orders/{id}/branch")
    @PreAuthorize("hasRole('ATENCION')")
    public OrderService.OrderSummary assignBranch(@PathVariable UUID id, @RequestBody BranchRequest request) {
        return service.assignBranch(id, request.sucursalId());
    }

    @PostMapping("/staff/orders/{id}/accept")
    @PreAuthorize("hasRole('ATENCION')")
    public OrderService.OrderSummary accept(@PathVariable UUID id) { return service.accept(id); }

    @PostMapping("/staff/orders/{id}/reject")
    @PreAuthorize("hasRole('ATENCION')")
    public OrderService.OrderSummary reject(@PathVariable UUID id, @Valid @RequestBody ReasonRequest request) {
        return service.reject(id, request.motivo());
    }

    @PatchMapping("/staff/orders/{id}/status")
    @PreAuthorize("hasRole('ATENCION')")
    public OrderService.OrderSummary transition(@PathVariable UUID id, @Valid @RequestBody StateRequest request) {
        return service.transition(id, request.estado());
    }

    @PostMapping("/staff/orders/{id}/cancellation/decision")
    @PreAuthorize("hasRole('ATENCION')")
    public OrderService.OrderSummary cancellationDecision(@PathVariable UUID id, @Valid @RequestBody CancellationDecision request) {
        return service.decideCancellation(id, request.aprobar(), request.motivo());
    }

    public record BranchRequest(UUID sucursalId) {}
    public record ReasonRequest(@NotBlank String motivo) {}
    public record StateRequest(@NotBlank String estado) {}
    public record CancellationDecision(boolean aprobar, @NotBlank String motivo) {}
}
