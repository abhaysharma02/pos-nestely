package com.nestely.pos.controller;

import com.nestely.pos.dto.ApiResponse;
import com.nestely.pos.dto.SubscriptionResponseDto;
import com.nestely.pos.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<SubscriptionResponseDto>> getCurrentSubscription() {
        return ResponseEntity.ok(ApiResponse.success("Subscription details retrieved", subscriptionService.getCurrentSubscription()));
    }
}
