package com.nestely.pos.dto;

import com.nestely.pos.model.Order;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class OrderResponseDto {
    private Long id;
    private String tokenNumber;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String status;
    private LocalDateTime createdAt;
    private String billedBy;
    private List<OrderItemResponseDto> items;

    @Data
    @Builder
    public static class OrderItemResponseDto {
        private Long id;
        private Long itemId;
        private String itemName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }

    public static OrderResponseDto fromEntity(Order order) {
        return OrderResponseDto.builder()
                .id(order.getId())
                .tokenNumber(order.getTokenNumber())
                .subtotal(order.getSubtotal())
                .taxAmount(order.getTaxAmount())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .billedBy(order.getUser() != null ? order.getUser().getName() : null)
                .items(order.getItems() != null ? order.getItems().stream().map(item -> OrderItemResponseDto.builder()
                        .id(item.getId())
                        .itemId(item.getItem().getId())
                        .itemName(item.getItem().getName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build()).collect(Collectors.toList()) : List.of())
                .build();
    }
}
