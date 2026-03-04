package com.nestely.pos.dto;

import com.nestely.pos.model.Role;
import com.nestely.pos.model.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class StaffResponseDto {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private LocalDateTime createdAt;

    public static StaffResponseDto fromEntity(User user) {
        return StaffResponseDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
