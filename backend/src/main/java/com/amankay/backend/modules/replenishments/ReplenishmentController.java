package com.amankay.backend.modules.replenishments;

import jakarta.validation.Valid;
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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/v1/replenishments")
@PreAuthorize("hasRole('INVENTARIO')")
public class ReplenishmentController {
    private final ReplenishmentService service;
    public ReplenishmentController(ReplenishmentService service) { this.service = service; }

    @GetMapping
    public List<ReplenishmentService.RequestView> mine(@RequestParam UUID sucursalId) { return service.list(sucursalId); }
    @GetMapping("/provided")
    public List<ReplenishmentService.RequestView> provided(@RequestParam UUID sucursalId) { return service.listProvided(sucursalId); }
    @GetMapping("/review-queue")
    public List<ReplenishmentService.RequestView> queue(@RequestParam UUID sucursalProveedoraId) { return service.reviewQueue(sucursalProveedoraId); }
    @GetMapping("/{id}")
    public ReplenishmentService.RequestDetail detail(@PathVariable UUID id) { return service.detail(id); }
    @PostMapping
    public ReplenishmentService.RequestView create(@Valid @RequestBody ReplenishmentService.CreateRequest request) { return service.create(request); }
    @PostMapping("/{id}/review")
    public ReplenishmentService.RequestView review(@PathVariable UUID id, @RequestBody ReplenishmentService.ReviewRequest request) { return service.review(id, request); }
    @PostMapping("/{id}/dispatch")
    public ReplenishmentService.DispatchView dispatch(@PathVariable UUID id, @RequestBody ReplenishmentService.DispatchRequest request) { return service.dispatch(id, request); }
    @PostMapping("/dispatches/{id}/receive")
    public ReplenishmentService.ReceiptView receive(@PathVariable UUID id, @RequestBody ReplenishmentService.ReceiptRequest request) { return service.receive(id, request); }

    @PostMapping("/request-lines/{id}/close-before-dispatch")
    public ReplenishmentService.RequestLineView closeBeforeDispatch(@PathVariable UUID id, @Valid @RequestBody ReasonRequest request) {
        return service.closeBeforeDispatch(id, request.motivo());
    }

    @PostMapping("/request-lines/{id}/reverse-closure")
    public ReplenishmentService.RequestLineView reverseBeforeDispatchClosure(@PathVariable UUID id, @Valid @RequestBody ReasonRequest request) {
        return service.reverseBeforeDispatchClosure(id, request.motivo());
    }

    @PostMapping("/dispatch-lines/{id}/close-after-dispatch")
    public ReplenishmentService.DispatchLineView closeAfterDispatch(@PathVariable UUID id, @Valid @RequestBody ReasonRequest request) {
        return service.closeAfterDispatch(id, request.motivo());
    }

    @PostMapping("/dispatch-lines/{id}/reverse-closure")
    public ReplenishmentService.DispatchLineView reverseAfterDispatchClosure(@PathVariable UUID id, @Valid @RequestBody ReasonRequest request) {
        return service.reverseAfterDispatchClosure(id, request.motivo());
    }

    @PostMapping("/dispatches/{id}/annul")
    public ReplenishmentService.DispatchView annulDispatch(@PathVariable UUID id, @Valid @RequestBody ReasonRequest request) {
        return service.annulDispatch(id, request.motivo());
    }

    @PostMapping("/receipts/{id}/annul")
    public ReplenishmentService.ReceiptView annulReceipt(@PathVariable UUID id, @Valid @RequestBody ReasonRequest request) {
        return service.annulReceipt(id, request.motivo());
    }

    public record ReasonRequest(@NotBlank @Size(max = 500) String motivo) {}
}
