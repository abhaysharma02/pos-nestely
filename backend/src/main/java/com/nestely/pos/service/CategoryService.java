package com.nestely.pos.service;

import com.nestely.pos.config.TenantContext;
import com.nestely.pos.dto.CategoryRequest;
import com.nestely.pos.dto.CategoryResponse;
import com.nestely.pos.model.Category;
import com.nestely.pos.model.Tenant;
import com.nestely.pos.repository.CategoryRepository;
import com.nestely.pos.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TenantRepository tenantRepository;

    public CategoryResponse createCategory(CategoryRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new SecurityException("Invalid Tenant"));

        Category category = Category.builder()
                .tenant(tenant)
                .name(request.getName())
                .active(request.isActive())
                .build();

        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        Category category = categoryRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found or access denied"));

        category.setName(request.getName());
        category.setActive(request.isActive());

        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }

    public List<CategoryResponse> getAllCategories() {
        Long tenantId = TenantContext.getCurrentTenant();
        // Since it's for vendor dashboard, return all including inactive ones
        // but bound strictly to their tenant.
        // Wait, the repository might only have findByTenantIdAndActiveTrue.
        // Let me just get all by tenantId. 
        // Need to check if findByTenantId exists, if not, I'll update the repo.
        return categoryRepository.findAll().stream()
                .filter(c -> c.getTenant().getId().equals(tenantId)) // Fallback if findByTenantId is not there
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public void deleteCategory(Long id) {
        Long tenantId = TenantContext.getCurrentTenant();
        Category category = categoryRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found or access denied"));

        // Soft delete
        category.setActive(false);
        categoryRepository.save(category);
    }
}
