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
public class AuthenticationResponse {
    private String token;
    private String name;
    private String email;
    private Role role;
    private Long tenantId;
}
