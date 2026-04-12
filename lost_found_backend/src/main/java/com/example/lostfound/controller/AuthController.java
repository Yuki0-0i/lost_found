package com.example.lostfound.controller;

import com.example.lostfound.config.JwtUtil;
import com.example.lostfound.dto.LoginRequest;
import com.example.lostfound.dto.LoginResponse;
import com.example.lostfound.dto.RegisterRequest;
import com.example.lostfound.entity.User;
import com.example.lostfound.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "两次密码不一致"));
        }

        try {
            User user = new User();
            user.setUsername(request.getUsername());
            user.setPassword(request.getPassword());
            user.setRealName(request.getRealName());
            user.setCollege(request.getCollege());
            user.setPhoneNumber(request.getPhoneNumber());

            User savedUser = userService.register(user);

            String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getUsername(), savedUser.getRole().name());
            LoginResponse.UserVO userVO = buildUserVO(savedUser);

            return ResponseEntity.ok(new LoginResponse(token, userVO));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.findByUsername(request.getUsername()).orElse(null);

        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "用户不存在"));
        }
        if (!user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "密码错误"));
        }
        if (!user.getIsActive()) {
            return ResponseEntity.status(403).body(Map.of("message", "账号已被禁用"));
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        LoginResponse.UserVO userVO = buildUserVO(user);

        return ResponseEntity.ok(new LoginResponse(token, userVO));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtUtil.getUserIdFromToken(token);

            User user = userService.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("message", "用户不存在"));
            }

            LoginResponse.UserVO userVO = buildUserVO(user);
            return ResponseEntity.ok(userVO);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "无效的token"));
        }
    }

    private LoginResponse.UserVO buildUserVO(User user) {
        LoginResponse.UserVO userVO = new LoginResponse.UserVO();
        userVO.setId(user.getId());
        userVO.setUsername(user.getUsername());
        userVO.setRealName(user.getRealName());
        userVO.setCollege(user.getCollege());
        userVO.setPhoneNumber(user.getPhoneNumber());
        userVO.setRole(user.getRole().name());
        return userVO;
    }
}
