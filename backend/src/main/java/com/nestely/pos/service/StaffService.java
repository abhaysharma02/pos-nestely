package com.nestely.pos.service;

import com.nestely.pos.config.TenantContext;
import com.nestely.pos.dto.StaffRequestDto;
import com.nestely.pos.dto.StaffResponseDto;
import com.nestely.pos.model.Role;
import com.nestely.pos.model.Tenant;
import com.nestely.pos.model.User;
import com.nestely.pos.repository.TenantRepository;
import com.nestely.pos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;

    private void verifyAdminAccess() {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmailAndTenantId(currentUserEmail, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new SecurityException("User not found"));
        
        if (currentUser.getRole() != Role.ADMIN) {
            throw new SecurityException("Only ADMIN users can manage staff");
        }
    }

    public StaffResponseDto createStaff(StaffRequestDto request) {
        verifyAdminAccess();
        Long tenantId = TenantContext.getCurrentTenant();
        Tenant tenant = tenantRepository.findById(tenantId).orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        if (userRepository.findByEmailAndTenantId(request.getEmail(), tenantId).isPresent()) {
            throw new IllegalArgumentException("Email already active for this tenant");
        }

        User newUser = User.builder()
                .tenant(tenant)
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        return StaffResponseDto.fromEntity(userRepository.save(newUser));
    }

    public List<StaffResponseDto> getAllStaff() {
        verifyAdminAccess();
        Long tenantId = TenantContext.getCurrentTenant();
        return userRepository.findAll().stream()
                .filter(u -> u.getTenant().getId().equals(tenantId))
                .map(StaffResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public StaffResponseDto updateStaff(Long id, StaffRequestDto request) {
        verifyAdminAccess();
        Long tenantId = TenantContext.getCurrentTenant();
        User user = userRepository.findById(id)
                .filter(u -> u.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return StaffResponseDto.fromEntity(userRepository.save(user));
    }

    public void deleteStaff(Long id) {
        verifyAdminAccess();
        Long tenantId = TenantContext.getCurrentTenant();
        User user = userRepository.findById(id)
                .filter(u -> u.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));
        
        // Cannot delete yourself
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (user.getEmail().equals(currentUserEmail)) {
            throw new IllegalArgumentException("Cannot delete your own admin account");
        }

        userRepository.delete(user);
    }
}
