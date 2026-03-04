package com.nestely.pos.dto;

import com.nestely.pos.model.Category;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryResponse {
    private Long id;
    private Long tenantId;
    private String name;
    private boolean active;

    public static CategoryResponse fromEntity(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .tenantId(category.getTenant().getId())
                .name(category.getName())
                .active(category.isActive())
                .build();
    }
}
