package com.example.lostfound.dto;

public class NotifyRequest {
    private Long userId;  // 接收消息的用户ID（发布者）
    private Long itemId;   // 物品ID
    private String foundLocation;  // 捡到地点
    private String foundTime;      // 捡到时间
    private String contactInfo;    // 联系方式
    private String message;       // 补充说明

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }
    public String getFoundLocation() { return foundLocation; }
    public void setFoundLocation(String foundLocation) { this.foundLocation = foundLocation; }
    public String getFoundTime() { return foundTime; }
    public void setFoundTime(String foundTime) { this.foundTime = foundTime; }
    public String getContactInfo() { return contactInfo; }
    public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
