package com.example.lostfound.controller;

import com.example.lostfound.config.JwtUtil;
import com.example.lostfound.entity.Feedback;
import com.example.lostfound.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {
    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<?> createFeedback(@RequestBody Feedback feedback,
                                           @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.getUserIdFromToken(token);
            feedback.setUserId(userId);
            return ResponseEntity.ok(feedbackRepository.save(feedback));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "请先登录"));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllFeedbacks(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String role = jwtUtil.getClaimsFromToken(token).get("role", String.class);
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.status(403).body(Map.of("message", "需要管理员权限"));
            }
            return ResponseEntity.ok(feedbackRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "请先登录"));
        }
    }
}
