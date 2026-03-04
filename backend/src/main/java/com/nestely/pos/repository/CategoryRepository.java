package com.nestely.pos.repository;

import com.nestely.pos.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByTenantIdAndActiveTrue(Long tenantId);
    Optional<Category> findByIdAndTenantId(Long id, Long tenantId);
}
