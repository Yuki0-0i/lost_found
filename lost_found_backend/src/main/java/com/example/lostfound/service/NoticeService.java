package com.example.lostfound.service;

import com.example.lostfound.entity.Notice;
import com.example.lostfound.repository.NoticeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NoticeService {
    @Autowired
    private NoticeRepository noticeRepository;

    public List<Notice> getActiveNotices() {
        return noticeRepository.findByIsActiveTrueOrderByCreatedTimeDesc();
    }

    public Notice create(Notice notice) {
        return noticeRepository.save(notice);
    }

    public Notice update(Long id, Notice data) {
        return noticeRepository.findById(id).map(notice -> {
            if (data.getTitle() != null) notice.setTitle(data.getTitle());
            if (data.getContent() != null) notice.setContent(data.getContent());
            if (data.getIsActive() != null) notice.setIsActive(data.getIsActive());
            return noticeRepository.save(notice);
        }).orElse(null);
    }

    public void delete(Long id) {
        noticeRepository.deleteById(id);
    }
}
