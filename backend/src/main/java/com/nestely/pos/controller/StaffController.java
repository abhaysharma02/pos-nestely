package com.nestely.pos.controller;

import com.nestely.pos.dto.ApiResponse;
import com.nestely.pos.dto.StaffRequestDto;
import com.nestely.pos.dto.StaffResponseDto;
import com.nestely.pos.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @PostMapping
    public ResponseEntity<ApiResponse<StaffResponseDto>> createStaff(@RequestBody StaffRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success("Staff member created successfully", staffService.createStaff(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StaffResponseDto>>> getAllStaff() {
        return ResponseEntity.ok(ApiResponse.success("Staff members fetched", staffService.getAllStaff()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StaffResponseDto>> updateStaff(@PathVariable Long id, @RequestBody StaffRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success("Staff member updated", staffService.updateStaff(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStaff(@PathVariable Long id) {
        staffService.deleteStaff(id);
        return ResponseEntity.ok(ApiResponse.success("Staff member deleted", null));
    }
}
