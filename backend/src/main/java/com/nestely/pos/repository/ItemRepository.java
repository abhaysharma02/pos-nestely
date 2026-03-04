package com.nestely.pos.repository;

import com.nestely.pos.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByTenantIdAndActiveTrue(Long tenantId);
    List<Item> findByTenantIdAndCategoryIdAndActiveTrue(Long tenantId, Long categoryId);
    Optional<Item> findByIdAndTenantId(Long id, Long tenantId);
}
