package com.example.lostfound.controller;

import com.example.lostfound.config.JwtUtil;
import com.example.lostfound.entity.Notice;
import com.example.lostfound.service.NoticeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/notices")
public class NoticeController {
    @Autowired
    private NoticeService noticeService;

    @Autowired
    private JwtUtil jwtUtil;

    // 获取所有公告（公开）
    @GetMapping
    public ResponseEntity<?> getNotices() {
        return ResponseEntity.ok(noticeService.getActiveNotices());
    }

    // 创建公告（管理员）
    @PostMapping
    public ResponseEntity<?> createNotice(@RequestBody Notice notice,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String role = jwtUtil.getClaimsFromToken(token).get("role", String.class);
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.status(403).body(Map.of("message", "需要管理员权限"));
            }
            return ResponseEntity.ok(noticeService.create(notice));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "请先登录"));
        }
    }

    // 更新公告（管理员）
    @PutMapping("/{id}")
    public ResponseEntity<?> updateNotice(@PathVariable Long id,
                                        @RequestBody Notice notice,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String role = jwtUtil.getClaimsFromToken(token).get("role", String.class);
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.status(403).body(Map.of("message", "需要管理员权限"));
            }
            Notice updated = noticeService.update(id, notice);
            if (updated == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "请先登录"));
        }
    }

    // 删除公告（管理员）
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotice(@PathVariable Long id,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String role = jwtUtil.getClaimsFromToken(token).get("role", String.class);
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.status(403).body(Map.of("message", "需要管理员权限"));
            }
            noticeService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "请先登录"));
        }
    }
}
