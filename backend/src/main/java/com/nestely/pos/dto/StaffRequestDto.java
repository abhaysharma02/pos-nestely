package com.nestely.pos.dto;

import com.nestely.pos.model.Role;
import lombok.Data;

@Data
public class StaffRequestDto {
    private String name;
    private String email;
    private String password; // Optional on update
    private Role role; // ADMIN, BILLING, KITCHEN
}
