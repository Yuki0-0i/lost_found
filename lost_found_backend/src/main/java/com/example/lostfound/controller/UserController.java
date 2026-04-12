package com.example.lostfound.controller;

import com.example.lostfound.config.JwtUtil;
import com.example.lostfound.entity.User;
import com.example.lostfound.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader("Authorization") String authHeader,
                                            @RequestBody User updateData) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.getUserIdFromToken(token);

            return userService.findById(userId)
                    .map(user -> {
                        if (updateData.getRealName() != null) user.setRealName(updateData.getRealName());
                        if (updateData.getCollege() != null) user.setCollege(updateData.getCollege());
                        if (updateData.getPhoneNumber() != null) user.setPhoneNumber(updateData.getPhoneNumber());
                        if (updateData.getWxId() != null) user.setWxId(updateData.getWxId());

                        User saved = userService.update(user);
                        return ResponseEntity.ok(Map.of("message", "更新成功", "user", saved));
                    })
                    .orElse(ResponseEntity.status(404).body(Map.of("message", "用户不存在")));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "无效的token"));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestHeader("Authorization") String authHeader,
                                            @RequestBody Map<String, String> passwords) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.getUserIdFromToken(token);

            return userService.findById(userId)
                    .map(user -> {
                        if (!user.getPassword().equals(passwords.get("oldPassword"))) {
                            return ResponseEntity.status(400).body(Map.of("message", "原密码错误"));
                        }
                        user.setPassword(passwords.get("newPassword"));
                        userService.update(user);
                        return ResponseEntity.ok(Map.of("message", "密码修改成功"));
                    })
                    .orElse(ResponseEntity.status(404).body(Map.of("message", "用户不存在")));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "无效的token"));
        }
    }
}
