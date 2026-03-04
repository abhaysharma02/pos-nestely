package com.nestely.pos.security;

import com.nestely.pos.config.TenantContext;
import com.nestely.pos.service.SubscriptionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class SubscriptionInterceptor implements HandlerInterceptor {

    private final SubscriptionService subscriptionService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();

        // Allow Whitelisted paths
        if (path.startsWith("/api/v1/auth/") || 
            path.startsWith("/api/v1/payment/webhook") || 
            path.startsWith("/api/v1/subscription/") ||
            request.getMethod().equals("OPTIONS")) {
            return true;
        }

        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId != null) {
            boolean isActive = subscriptionService.isSubscriptionActive(tenantId);
            if (!isActive) {
                response.setStatus(HttpServletResponse.SC_PAYMENT_REQUIRED); // 402 HTTP Status
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"Your subscription has expired. Please renew to continue using the system.\",\"data\":null}");
                return false;
            }
        }
        
        return true;
    }
}
