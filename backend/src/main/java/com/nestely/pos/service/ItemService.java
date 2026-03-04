package com.nestely.pos.service;

import com.nestely.pos.config.TenantContext;
import com.nestely.pos.dto.ItemRequest;
import com.nestely.pos.dto.ItemResponse;
import com.nestely.pos.model.Category;
import com.nestely.pos.model.Item;
import com.nestely.pos.model.Tenant;
import com.nestely.pos.repository.CategoryRepository;
import com.nestely.pos.repository.ItemRepository;
import com.nestely.pos.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final TenantRepository tenantRepository;

    public ItemResponse createItem(ItemRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new SecurityException("Invalid Tenant"));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findByIdAndTenantId(request.getCategoryId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Category not found or access denied"));
        }

        Item item = Item.builder()
                .tenant(tenant)
                .category(category)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .active(request.isActive())
                .trackStock(request.isTrackStock())
                .stockQuantity(request.getStockQuantity())
                .build();

        return ItemResponse.fromEntity(itemRepository.save(item));
    }

    public ItemResponse updateItem(Long id, ItemRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        Item item = itemRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found or access denied"));

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndTenantId(request.getCategoryId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            item.setCategory(category);
        } else {
            item.setCategory(null);
        }

        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setImageUrl(request.getImageUrl());
        item.setActive(request.isActive());
        item.setTrackStock(request.isTrackStock());
        item.setStockQuantity(request.getStockQuantity());

        return ItemResponse.fromEntity(itemRepository.save(item));
    }

    public List<ItemResponse> getAllItems() {
        Long tenantId = TenantContext.getCurrentTenant();
        return itemRepository.findAll().stream()
                .filter(i -> i.getTenant().getId().equals(tenantId))
                .map(ItemResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public void deleteItem(Long id) {
        Long tenantId = TenantContext.getCurrentTenant();
        Item item = itemRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found or access denied"));

        item.setActive(false);
        itemRepository.save(item);
    }
}
