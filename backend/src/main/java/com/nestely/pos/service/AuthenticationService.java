package com.nestely.pos.service;

import com.nestely.pos.dto.AuthenticationRequest;
import com.nestely.pos.dto.AuthenticationResponse;
import com.nestely.pos.dto.RegisterRequest;
import com.nestely.pos.model.Role;
import com.nestely.pos.model.Tenant;
import com.nestely.pos.model.User;
import com.nestely.pos.repository.TenantRepository;
import com.nestely.pos.repository.UserRepository;
import com.nestely.pos.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final SubscriptionService subscriptionService;

    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        // Create Tenant first
        var tenant = Tenant.builder()
                .name(request.getTenantName())
                .domain(request.getTenantName().toLowerCase().replace(" ", ""))
                .active(true)
                .build();
        tenantRepository.save(tenant);

        // Auto-generate 14 Day Trial
        subscriptionService.createTrialSubscription(tenant);

        // Create Admin User for this tenant
        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.ADMIN)
                .tenant(tenant)
                .build();
        repository.save(user);

        var jwtToken = jwtService.generateToken(user, tenant.getId());

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .tenantId(tenant.getId())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user, user.getTenant().getId());

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .tenantId(user.getTenant().getId())
                .build();
    }
}
