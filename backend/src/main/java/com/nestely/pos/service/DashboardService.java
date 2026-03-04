package com.nestely.pos.service;

import com.nestely.pos.config.TenantContext;
import com.nestely.pos.dto.DashboardResponseDto;
import com.nestely.pos.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final OrderRepository orderRepository;

    public DashboardResponseDto getDashboardSummary() {
        Long tenantId = TenantContext.getCurrentTenant();
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime weekStart = LocalDate.now().minusDays(7).atStartOfDay();
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        return DashboardResponseDto.builder()
                .revenueToday(orderRepository.sumTotalAmountByTenantIdAndCreatedAtAfter(tenantId, todayStart))
                .revenueThisWeek(orderRepository.sumTotalAmountByTenantIdAndCreatedAtAfter(tenantId, weekStart))
                .revenueThisMonth(orderRepository.sumTotalAmountByTenantIdAndCreatedAtAfter(tenantId, monthStart))
                .totalOrdersToday(orderRepository.countByTenantIdAndCreatedAtAfter(tenantId, todayStart))
                .activeOrders(orderRepository.countByTenantIdAndStatusIn(tenantId, List.of("INITIATED", "PREPARING", "READY")))
                .topSellingItems(orderRepository.findTopSellingItems(tenantId, PageRequest.of(0, 5)))
                .build();
    }
}
