package com.amankay.backend.modules.tables;

import com.amankay.backend.modules.orders.OrderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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
@RequestMapping("/api/v1/tables")
public class TableController {
    private final TableService service;
    public TableController(TableService service) { this.service = service; }

    @PostMapping("/{tableId}/sessions")
    @PreAuthorize("hasRole('ATENCION')")
    public TableService.OpenSessionResponse open(@PathVariable UUID tableId) { return service.open(tableId); }

    @PostMapping("/sessions/validate")
    public TableService.SessionStatus validate(@Valid @RequestBody TokenRequest request) { return service.validate(request.token()); }

    @GetMapping("/sessions/status")
    public TableService.SessionStatus status(@RequestParam String token) { return service.status(token); }

    @PostMapping("/sessions/{sessionId}/close")
    @PreAuthorize("hasRole('ATENCION')")
    public void close(@PathVariable UUID sessionId) { service.close(sessionId); }

    @PostMapping("/orders")
    public OrderService.OrderCreated order(@Valid @RequestBody TableOrderRequest request) {
        return service.createOrder(request.token(), request.items());
    }

    @PostMapping("/accounts/{accountId}/close")
    @PreAuthorize("hasRole('ATENCION')")
    public TableService.AccountView closeAccount(@PathVariable UUID accountId) { return service.closeAccount(accountId); }

    public record TokenRequest(@NotBlank String token) {}
    public record TableOrderRequest(@NotBlank String token, @NotEmpty List<OrderService.OrderItem> items) {}
}
