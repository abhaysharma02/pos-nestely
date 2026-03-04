package com.nestely.pos.service;

import com.nestely.pos.config.TenantContext;
import com.nestely.pos.dto.SubscriptionResponseDto;
import com.nestely.pos.model.Subscription;
import com.nestely.pos.model.Tenant;
import com.nestely.pos.repository.SubscriptionRepository;
import com.nestely.pos.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final TenantRepository tenantRepository;

    public void createTrialSubscription(Tenant tenant) {
        Subscription subscription = Subscription.builder()
                .tenant(tenant)
                .planType("TRIAL")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(14)) // 14 day trial
                .status("ACTIVE")
                .build();
        subscriptionRepository.save(subscription);
    }

    public SubscriptionResponseDto getCurrentSubscription() {
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            throw new IllegalStateException("No active tenant context.");
        }

        Subscription sub = subscriptionRepository.findTopByTenantIdOrderByEndDateDesc(tenantId)
                .orElseThrow(() -> new IllegalStateException("No subscription found for this tenant."));
        
        return SubscriptionResponseDto.fromEntity(sub);
    }

    public boolean isSubscriptionActive(Long tenantId) {
        return subscriptionRepository.findTopByTenantIdOrderByEndDateDesc(tenantId)
                .map(sub -> "ACTIVE".equalsIgnoreCase(sub.getStatus()) && !LocalDate.now().isAfter(sub.getEndDate()))
                .orElse(false);
    }
}
