package com.amankay.backend.modules.payments;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/payments")
@PreAuthorize("hasRole('ATENCION')")
public class PaymentController {
    private final PaymentService service;
    public PaymentController(PaymentService service) { this.service = service; }

    @PostMapping("/orders/{orderId}/attempts")
    public PaymentService.PaymentView orderAttempt(@PathVariable UUID orderId, @Valid @RequestBody AttemptRequest request) {
        return service.createForOrder(orderId, request.metodo());
    }
    @GetMapping("/orders/{orderId}")
    public List<PaymentService.PaymentView> orderAttempts(@PathVariable UUID orderId) { return service.orderAttempts(orderId); }
    @PostMapping("/accounts/{accountId}/attempts")
    public PaymentService.PaymentView accountAttempt(@PathVariable UUID accountId, @Valid @RequestBody AttemptRequest request) {
        return service.createForTableAccount(accountId, request.metodo());
    }
    @PostMapping("/{paymentId}/confirm-cash")
    public PaymentService.PaymentView confirmCash(@PathVariable UUID paymentId) { return service.confirmCash(paymentId); }
    @PostMapping("/{paymentId}/verification")
    public PaymentService.PaymentView verify(@PathVariable UUID paymentId, @Valid @RequestBody VerificationRequest request) {
        return service.verify(paymentId, request.aprobar(), request.motivo());
    }

    @PostMapping(value = "/{paymentId}/receipt", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PaymentService.PaymentView uploadReceipt(@PathVariable UUID paymentId, @RequestParam("archivo") MultipartFile archivo) {
        return service.uploadReceipt(paymentId, archivo);
    }

    @GetMapping("/{paymentId}/receipt")
    public ResponseEntity<byte[]> receipt(@PathVariable UUID paymentId) {
        PrivateReceiptStorage.Download file = service.receipt(paymentId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(file.fileName()).build().toString())
                .body(file.bytes());
    }
    @PostMapping("/{paymentId}/refund")
    public PaymentService.PaymentView refund(@PathVariable UUID paymentId, @Valid @RequestBody ReasonRequest request) {
        return service.refund(paymentId, request.motivo());
    }

    public record AttemptRequest(@NotBlank String metodo) {}
    public record VerificationRequest(boolean aprobar, String motivo) {}
    public record ReasonRequest(@NotBlank String motivo) {}
}
