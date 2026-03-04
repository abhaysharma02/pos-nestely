package com.nestely.pos.controller;

import com.nestely.pos.dto.ApiResponse;
import com.nestely.pos.dto.DashboardResponseDto;
import com.nestely.pos.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardResponseDto>> getDashboardSummary() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics loaded", dashboardService.getDashboardSummary()));
    }
}
