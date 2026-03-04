package com.nestely.pos.repository;

import com.nestely.pos.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByTenantId(Long tenantId);
    Optional<Customer> findByPhoneAndTenantId(String phone, Long tenantId);
}
