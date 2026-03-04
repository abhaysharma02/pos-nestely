package com.nestely.pos.repository;

import com.nestely.pos.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    
    // Get the most recent active subscription for a tenant
    Optional<Subscription> findTopByTenantIdOrderByEndDateDesc(Long tenantId);
    
    // Used to automatically mark expired ones
    List<Subscription> findByStatusAndEndDateBefore(String status, LocalDate date);
}
