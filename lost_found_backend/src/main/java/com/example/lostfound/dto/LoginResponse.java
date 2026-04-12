package com.example.lostfound.dto;

public class LoginResponse {
    private String token;
    private UserVO user;

    public LoginResponse(String token, UserVO user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public UserVO getUser() { return user; }
    public void setUser(UserVO user) { this.user = user; }

    public static class UserVO {
        private Long id;
        private String username;
        private String realName;
        private String college;
        private String phoneNumber;
        private String role;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getRealName() { return realName; }
        public void setRealName(String realName) { this.realName = realName; }
        public String getCollege() { return college; }
        public void setCollege(String college) { this.college = college; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}
