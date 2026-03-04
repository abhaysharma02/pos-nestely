package com.nestely.pos.dto;

import com.nestely.pos.model.Subscription;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class SubscriptionResponseDto {
    private String planType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private boolean isActive;
    private long daysRemaining;

    public static SubscriptionResponseDto fromEntity(Subscription subscription) {
        long remaining = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), subscription.getEndDate());
        
        return SubscriptionResponseDto.builder()
                .planType(subscription.getPlanType())
                .startDate(subscription.getStartDate())
                .endDate(subscription.getEndDate())
                .status(subscription.getStatus())
                .isActive("ACTIVE".equalsIgnoreCase(subscription.getStatus()) && !LocalDate.now().isAfter(subscription.getEndDate()))
                .daysRemaining(Math.max(0, remaining))
                .build();
    }
}
