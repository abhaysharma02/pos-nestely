package com.nestely.pos.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nestely.pos.config.TenantContext;
import com.nestely.pos.dto.CreateOrderRequest;
import com.nestely.pos.dto.CreateOrderResponse;
import com.nestely.pos.model.Item;
import com.nestely.pos.model.Order;
import com.nestely.pos.model.OrderItem;
import com.nestely.pos.model.Payment;
import com.nestely.pos.model.Tenant;
import com.nestely.pos.model.User;
import com.nestely.pos.repository.ItemRepository;
import com.nestely.pos.repository.OrderRepository;
import com.nestely.pos.repository.TenantRepository;
import com.nestely.pos.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final PaymentService paymentService;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public CreateOrderResponse createOrder(CreateOrderRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new SecurityException("Tenant Context Invalid"));

        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmailAndTenantId(userEmail, tenantId)
                .orElseThrow(() -> new SecurityException("User Context Invalid"));

        // Create Order mapping
        Order order = Order.builder()
                .tenant(tenant)
                .user(currentUser)
                .tokenNumber(generateToken())
                .subtotal(request.getSubtotal())
                .taxAmount(request.getTaxAmount())
                .discountAmount(request.getDiscountAmount())
                .totalAmount(request.getTotalAmount())
                .paymentMethod(request.getPaymentMethod())
                .status("INITIATED")
                .build();

        // Process Items securely fetching by Tenant matches
        List<OrderItem> items = request.getItems().stream().map(dto -> {
            Item item = itemRepository.findByIdAndTenantId(dto.getItemId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Item " + dto.getItemId() + " not found or access denied"));
            
            return OrderItem.builder()
                    .order(order)
                    .item(item)
                    .quantity(dto.getQuantity())
                    .unitPrice(dto.getUnitPrice())
                    .totalPrice(dto.getTotalPrice())
                    .build();
        }).collect(Collectors.toList());

        order.setItems(items);
        orderRepository.save(order);

        CreateOrderResponse response = CreateOrderResponse.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .build();

        // Integrate with Razorpay if applicable online payment logic
        if (!"Cash".equalsIgnoreCase(request.getPaymentMethod())) {
            Payment payment = paymentService.createRazorpayOrder(order);
            response.setRazorpayOrderId(payment.getRazorpayOrderId());
        } else {
            // Cash orders immediately confirmed
            order.setStatus("CONFIRMED");
            orderRepository.save(order);
            messagingTemplate.convertAndSend("/topic/kitchen/" + tenantId, order);
            response.setStatus("CONFIRMED");
        }

        return response;
    }

    private String generateToken() {
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    public com.nestely.pos.dto.PaginatedResponse<com.nestely.pos.dto.OrderResponseDto> getOrderHistory(
            int page, int size, String status, String startDate, String endDate) {

        Long tenantId = TenantContext.getCurrentTenant();

        Specification<Order> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("tenant").get("id"), tenantId));

            if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (startDate != null && !startDate.isEmpty()) {
                LocalDateTime start = LocalDateTime.parse(startDate + "T00:00:00");
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            }
            if (endDate != null && !endDate.isEmpty()) {
                LocalDateTime end = LocalDateTime.parse(endDate + "T23:59:59");
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage = orderRepository.findAll(spec, pageable);

        List<com.nestely.pos.dto.OrderResponseDto> dtoList = orderPage.getContent().stream()
                .map(com.nestely.pos.dto.OrderResponseDto::fromEntity)
                .collect(Collectors.toList());

        return com.nestely.pos.dto.PaginatedResponse.from(orderPage, dtoList);
    }
}
