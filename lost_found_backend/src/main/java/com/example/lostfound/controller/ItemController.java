package com.example.lostfound.controller;

import com.example.lostfound.config.JwtUtil;
import com.example.lostfound.entity.Item;
import com.example.lostfound.entity.User;
import com.example.lostfound.service.ItemService;
import com.example.lostfound.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
public class ItemController {
    @Autowired
    private ItemService itemService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @GetMapping
    public List<Item> getAllItems() {
        return itemService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        return itemService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{type}")
    public List<Item> getItemsByType(@PathVariable String type) {
        return itemService.findByType(Item.ItemType.valueOf(type.toUpperCase()));
    }

    @GetMapping("/search")
    public List<Item> searchItems(@RequestParam String name) {
        return itemService.searchByName(name);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyItems(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.getUserIdFromToken(token);
            return ResponseEntity.ok(itemService.findByUserId(userId));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "请先登录"));
        }
    }

    @PostMapping
    public ResponseEntity<?> createItem(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                       @Valid @RequestBody Item item) {
        try {
            if (authHeader == null) {
                return ResponseEntity.status(401).body(Map.of("message", "请先登录"));
            }
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.getUserIdFromToken(token);
            item.setUserId(userId);
            return ResponseEntity.ok(itemService.save(item));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "请先登录"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Long id,
                                       @RequestHeader(value = "Authorization", required = false) String authHeader,
                                       @RequestBody Item item) {
        try {
            if (authHeader == null) {
                return ResponseEntity.status(401).body(Map.of("message", "请先登录"));
            }
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.getUserIdFromToken(token);
            String role = jwtUtil.getClaimsFromToken(token).get("role", String.class);

            return itemService.findById(id).map(existing -> {
                // 非管理员只能修改自己的物品
                if (!"ADMIN".equals(role) && !existing.getUserId().equals(userId)) {
                    return ResponseEntity.status(403).<Item>body(null);
                }
                existing.setName(item.getName());
                existing.setDescription(item.getDescription());
                existing.setType(item.getType());
                existing.setLocation(item.getLocation());
                existing.setContactInfo(item.getContactInfo());
                existing.setFoundTime(item.getFoundTime());
                existing.setIsResolved(item.getIsResolved());
                existing.setCategory(item.getCategory());
                existing.setStorageLocation(item.getStorageLocation());
                existing.setImages(item.getImages());
                return ResponseEntity.ok(itemService.save(existing));
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "无效的token"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id,
                                        @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null) {
                return ResponseEntity.status(401).body(Map.of("message", "请先登录"));
            }
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.getUserIdFromToken(token);
            String role = jwtUtil.getClaimsFromToken(token).get("role", String.class);

            return itemService.findById(id).map(existing -> {
                if (!"ADMIN".equals(role) && !existing.getUserId().equals(userId)) {
                    return ResponseEntity.status(403).<Void>body(null);
                }
                itemService.deleteById(id);
                return ResponseEntity.noContent().<Void>build();
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "无效的token"));
        }
    }
}
