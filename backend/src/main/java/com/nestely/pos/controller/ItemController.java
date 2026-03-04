package com.nestely.pos.controller;

import com.nestely.pos.dto.ApiResponse;
import com.nestely.pos.dto.ItemRequest;
import com.nestely.pos.dto.ItemResponse;
import com.nestely.pos.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vendor/item")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @PostMapping
    public ResponseEntity<ApiResponse<ItemResponse>> createItem(@RequestBody ItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Item created", itemService.createItem(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getAllItems() {
        return ResponseEntity.ok(ApiResponse.success("Success", itemService.getAllItems()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> updateItem(@PathVariable Long id, @RequestBody ItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Item updated", itemService.updateItem(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.ok(ApiResponse.success("Item deactivated", null));
    }
}
