package com.nestely.pos.dto;

import com.nestely.pos.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String tenantName; // the name of the new restaurant/tenant
    private Role role; // typically ADMIN for first registration
}
