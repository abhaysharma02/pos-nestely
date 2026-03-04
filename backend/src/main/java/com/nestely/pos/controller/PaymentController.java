package com.nestely.pos.controller;

import com.nestely.pos.dto.ApiResponse;
import com.nestely.pos.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader("x-razorpay-signature") String signature) {
        
        // This endpoint MUST be accessible without JWT Token.
        paymentService.handleWebhook(payload, signature);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/config")
    public ResponseEntity<ApiResponse<Map<String, String>>> getPaymentConfig() {
        // Expose only the Public Key Id, never the secret.
        // We will fetch it dynamically or just let frontend handle injection if required.
        // For security, just send a success placeholder as the backend typically loads it.
        return ResponseEntity.ok(ApiResponse.success("Config Loaded", Map.of("enabled", "true")));
    }
}
