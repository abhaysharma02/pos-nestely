package com.nestely.pos.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ItemRequest {
    private Long categoryId;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private boolean active;
    private boolean trackStock;
    private Integer stockQuantity;
}
