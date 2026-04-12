package com.example.lostfound.service;

import com.example.lostfound.entity.Message;
import com.example.lostfound.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MessageService {
    @Autowired
    private MessageRepository messageRepository;

    public List<Message> getUserMessages(Long userId) {
        return messageRepository.findByUserIdOrderByCreatedTimeDesc(userId);
    }

    public List<Message> getUnreadMessages(Long userId) {
        return messageRepository.findByUserIdAndIsReadOrderByCreatedTimeDesc(userId, false);
    }

    public int getUnreadCount(Long userId) {
        return getUnreadMessages(userId).size();
    }

    public Message markAsRead(Long messageId) {
        messageRepository.findById(messageId).ifPresent(msg -> {
            msg.setIsRead(true);
            messageRepository.save(msg);
        });
        return null;
    }

    public Message createMessage(Message message) {
        return messageRepository.save(message);
    }
}
