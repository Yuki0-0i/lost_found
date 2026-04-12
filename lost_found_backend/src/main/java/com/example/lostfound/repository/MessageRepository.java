package com.example.lostfound.repository;

import com.example.lostfound.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByUserIdOrderByCreatedTimeDesc(Long userId);
    List<Message> findByUserIdAndIsReadOrderByCreatedTimeDesc(Long userId, Boolean isRead);
}
