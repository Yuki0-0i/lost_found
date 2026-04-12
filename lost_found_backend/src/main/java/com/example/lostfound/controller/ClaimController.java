package com.example.lostfound.controller;

import com.example.lostfound.config.JwtUtil;
import com.example.lostfound.entity.Claim;
import com.example.lostfound.entity.Item;
import com.example.lostfound.service.ClaimService;
import com.example.lostfound.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {
    @Autowired
    private ClaimService claimService;

    @Autowired
    private ItemService itemService;

    @Autowired
    private JwtUtil jwtUtil;

    // 申请认领
    @PostMapping
    public ResponseEntity<?> createClaim(@RequestHeader("Authorization") String authHeader,
                                       @RequestBody Claim claim) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.getUserIdFromToken(token);
            claim.setUserId(userId);
            claim.setStatus(Claim.ClaimStatus.PENDING);
            return ResponseEntity.ok(claimService.createClaim(claim));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "请先登录"));
        }
    }

    // 获取物品的认领申请列表（发布者查看）
    @GetMapping("/item/{itemId}")
    public ResponseEntity<?> getClaimsByItem(@PathVariable Long itemId,
                                           @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.getUserIdFromToken(token);
            String role = jwtUtil.getClaimsFromToken(token).get("role", String.class);

            Item item = itemService.findById(itemId).orElse(null);
            if (item == null) {
                return ResponseEntity.notFound().build();
            }
            // 非管理员只能查看自己的物品的申请
            if (!"ADMIN".equals(role) && !item.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("message", "无权查看"));
            }
            return ResponseEntity.ok(claimService.findByItemId(itemId));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "请先登录"));
        }
    }

    // 获取我发起的认领申请
    @GetMapping("/my")
    public ResponseEntity<?> getMyClaims(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.getUserIdFromToken(token);
            return ResponseEntity.ok(claimService.findByUserId(userId));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "请先登录"));
        }
    }

    // 同意认领
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveClaim(@PathVariable Long id,
                                         @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.getUserIdFromToken(token);
            String role = jwtUtil.getClaimsFromToken(token).get("role", String.class);

            Claim claim = claimService.findById(id).orElse(null);
            if (claim == null) return ResponseEntity.notFound().build();

            Item item = itemService.findById(claim.getItemId()).orElse(null);
            if (item == null) return ResponseEntity.notFound().build();

            if (!"ADMIN".equals(role) && !item.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("message", "无权操作"));
            }

            return ResponseEntity.ok(claimService.approveClaim(id));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "请先登录"));
        }
    }

    // 拒绝认领
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectClaim(@PathVariable Long id,
                                        @RequestBody Map<String, String> body,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.getUserIdFromToken(token);
            String role = jwtUtil.getClaimsFromToken(token).get("role", String.class);

            Claim claim = claimService.findById(id).orElse(null);
            if (claim == null) return ResponseEntity.notFound().build();

            Item item = itemService.findById(claim.getItemId()).orElse(null);
            if (item == null) return ResponseEntity.notFound().build();

            if (!"ADMIN".equals(role) && !item.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("message", "无权操作"));
            }

            String reason = body.getOrDefault("reason", "不符合");
            return ResponseEntity.ok(claimService.rejectClaim(id, reason));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "请先登录"));
        }
    }
}
