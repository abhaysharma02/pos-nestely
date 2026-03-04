package com.nestely.pos.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardResponseDto {
    private BigDecimal revenueToday;
    private BigDecimal revenueThisWeek;
    private BigDecimal revenueThisMonth;

    private Long totalOrdersToday;
    private Long activeOrders; // INITIATED/PREPARING/READY

    private List<TopItemDto> topSellingItems;
}
