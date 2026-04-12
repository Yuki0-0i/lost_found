package com.example.lostfound.controller;

import com.example.lostfound.config.JwtUtil;
import com.example.lostfound.dto.NotifyRequest;
import com.example.lostfound.entity.Message;
import com.example.lostfound.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    @Autowired
    private MessageService messageService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<?> getMyMessages(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.getUserIdFromToken(token);
            return ResponseEntity.ok(messageService.getUserMessages(userId));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "请先登录"));
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.getUserIdFromToken(token);
            return ResponseEntity.ok(Map.of("count", messageService.getUnreadCount(userId)));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "请先登录"));
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id,
                                       @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            jwtUtil.getUserIdFromToken(token);
            return ResponseEntity.ok(messageService.markAsRead(id));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "请先登录"));
        }
    }

    // 寻物启事 - 通知发布者
    @PostMapping("/notify")
    public ResponseEntity<?> notifyPublisher(@RequestBody NotifyRequest request,
                                          @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long senderId = jwtUtil.getUserIdFromToken(token);

            String content = String.format("【有人捡到您的物品】\n地点：%s\n时间：%s\n联系方式：%s%s",
                request.getFoundLocation(),
                request.getFoundTime() != null ? request.getFoundTime().replace("T", " ").substring(0, 16) : "未填写",
                request.getContactInfo(),
                request.getMessage() != null && !request.getMessage().isEmpty() ? "\n说明：" + request.getMessage() : "");

            Message msg = new Message();
            msg.setUserId(request.getUserId());  // 发送给发布者
            msg.setType("FOUND_NOTIFY");  // 新类型：有人捡到了
            msg.setContent(content);
            msg.setRelatedId(request.getItemId());

            messageService.createMessage(msg);
            return ResponseEntity.ok(Map.of("message", "已发送通知"));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "请先登录"));
        }
    }
}
