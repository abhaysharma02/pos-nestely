package com.nestely.pos.controller;

import com.nestely.pos.dto.ApiResponse;
import com.nestely.pos.dto.CreateOrderRequest;
import com.nestely.pos.dto.CreateOrderResponse;
import com.nestely.pos.dto.OrderResponseDto;
import com.nestely.pos.dto.PaginatedResponse;
import com.nestely.pos.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<CreateOrderResponse>> createOrder(@RequestBody CreateOrderRequest request) {
        CreateOrderResponse response = orderService.createOrder(request);
        return ResponseEntity.ok(ApiResponse.success("Order Created Successfully", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<PaginatedResponse<OrderResponseDto>>> getOrderHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        PaginatedResponse<OrderResponseDto> response = orderService.getOrderHistory(page, size, status, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Order history fetched", response));
    }
}
