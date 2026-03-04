package com.nestely.pos.service;

import com.nestely.pos.model.Order;
import com.nestely.pos.model.Payment;
import com.nestely.pos.repository.OrderRepository;
import com.nestely.pos.repository.PaymentRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Transactional
    public Payment createRazorpayOrder(Order order) {
        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            // Razorpay expects amount in paise (multiply by 100)
            int amountInPaise = order.getTotalAmount().multiply(new BigDecimal("100")).intValue();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + order.getId());

            com.razorpay.Order razorpayOrder = razorpay.orders.create(orderRequest);
            String rzpOrderId = razorpayOrder.get("id");

            Payment payment = Payment.builder()
                    .tenant(order.getTenant())
                    .order(order)
                    .amount(order.getTotalAmount())
                    .currency("INR")
                    .razorpayOrderId(rzpOrderId)
                    .status("CREATED")
                    .build();

            return paymentRepository.save(payment);

        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay Order", e);
            throw new RuntimeException("Payment Gateway Error: " + e.getMessage());
        }
    }

    @Transactional
    public void handleWebhook(String payload, String signature) {
        try {
            boolean isValid = Utils.verifyWebhookSignature(payload, signature, razorpayKeySecret);
            if (!isValid) {
                log.error("Invalid Webhook Signature!");
                return;
            }

            JSONObject json = new JSONObject(payload);
            String event = json.getString("event");
            JSONObject paymentEntity = json.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
            String rzpOrderId = paymentEntity.getString("order_id");
            String rzpPaymentId = paymentEntity.getString("id");

            Payment payment = paymentRepository.findByRazorpayOrderId(rzpOrderId)
                    .orElseThrow(() -> new IllegalArgumentException("Payment record not found"));

            Order order = payment.getOrder();
            Long tenantId = order.getTenant().getId();

            if ("payment.captured".equals(event)) {
                payment.setStatus("SUCCESS");
                payment.setRazorpayPaymentId(rzpPaymentId);
                paymentRepository.save(payment);

                order.setStatus("CONFIRMED");
                orderRepository.save(order);

                // Broadcast securely ONLY when confirmed
                messagingTemplate.convertAndSend("/topic/kitchen/" + tenantId, order);
                log.info("Order {} confirmed and sent to kitchen for tenant {}", order.getId(), tenantId);

            } else if ("payment.failed".equals(event)) {
                payment.setStatus("FAILED");
                paymentRepository.save(payment);

                order.setStatus("FAILED");
                orderRepository.save(order);
                log.info("Order {} failed", order.getId());
            }

        } catch (Exception e) {
            log.error("Error processing webhook", e);
        }
    }
}
