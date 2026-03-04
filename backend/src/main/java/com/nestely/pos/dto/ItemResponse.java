package com.nestely.pos.dto;

import com.nestely.pos.model.Item;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ItemResponse {
    private Long id;
    private Long tenantId;
    private Long categoryId;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private boolean active;
    private boolean trackStock;
    private Integer stockQuantity;

    public static ItemResponse fromEntity(Item item) {
        return ItemResponse.builder()
                .id(item.getId())
                .tenantId(item.getTenant().getId())
                .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .active(item.isActive())
                .trackStock(item.isTrackStock())
                .stockQuantity(item.getStockQuantity())
                .build();
    }
}
