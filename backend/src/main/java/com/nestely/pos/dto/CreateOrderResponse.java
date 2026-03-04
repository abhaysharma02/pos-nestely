package com.nestely.pos.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreateOrderResponse {
    private Long orderId;
    private String razorpayOrderId;
    private String status;
}
