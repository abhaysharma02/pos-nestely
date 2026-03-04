package com.nestely.pos.dto;

import lombok.Data;

@Data
public class CategoryRequest {
    private String name;
    private boolean active;
}
