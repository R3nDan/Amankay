package com.amankay.backend.modules.inventory;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
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
@RequestMapping("/api/v1/inventory")
@PreAuthorize("hasRole('INVENTARIO')")
public class InventoryController {
    private final InventoryService service;
    public InventoryController(InventoryService service) { this.service = service; }

    @GetMapping
    public List<InventoryService.StockView> stock(@RequestParam UUID sucursalId) { return service.stock(sucursalId); }

    @PostMapping("/initial")
    public InventoryService.MovementView initial(@Valid @RequestBody InitialStockRequest request) {
        return service.initial(request.sucursalId(), request.productoId(), request.cantidad(), request.motivo());
    }

    @GetMapping("/{inventoryId}/movements")
    public List<InventoryService.MovementView> movements(@PathVariable UUID inventoryId) { return service.history(inventoryId); }

    @PostMapping("/{inventoryId}/adjustments")
    public InventoryService.MovementView adjust(@PathVariable UUID inventoryId, @Valid @RequestBody InventoryService.AdjustmentRequest request) {
        return service.adjust(inventoryId, request);
    }

    @PostMapping("/movements/{movementId}/compensation")
    public InventoryService.MovementView compensate(@PathVariable UUID movementId, @Valid @RequestBody ReasonRequest request) {
        return service.compensate(movementId, request.motivo());
    }

    public record InitialStockRequest(UUID sucursalId, UUID productoId, @Positive Integer cantidad, @NotBlank String motivo) {}
    public record ReasonRequest(@NotBlank String motivo) {}
}
