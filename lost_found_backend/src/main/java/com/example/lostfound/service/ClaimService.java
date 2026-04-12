package com.example.lostfound.service;

import com.example.lostfound.entity.Claim;
import com.example.lostfound.entity.Message;
import com.example.lostfound.repository.ClaimRepository;
import com.example.lostfound.repository.ItemRepository;
import com.example.lostfound.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class ClaimService {
    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private MessageRepository messageRepository;

    public Claim createClaim(Claim claim) {
        return claimRepository.save(claim);
    }

    public List<Claim> findByItemId(Long itemId) {
        return claimRepository.findByItemId(itemId);
    }

    public List<Claim> findByUserId(Long userId) {
        return claimRepository.findByUserId(userId);
    }

    public Optional<Claim> findById(Long id) {
        return claimRepository.findById(id);
    }

    @Transactional
    public Claim approveClaim(Long claimId) {
        Claim claim = claimRepository.findById(claimId).orElse(null);
        if (claim == null) return null;

        claim.setStatus(Claim.ClaimStatus.APPROVED);
        claimRepository.save(claim);

        // 标记物品为已解决
        itemRepository.findById(claim.getItemId()).ifPresent(item -> {
            item.setIsResolved(true);
            itemRepository.save(item);
        });

        // 发送消息给申请人
        Message msg = new Message();
        msg.setUserId(claim.getUserId());
        msg.setType("CLAIM_RESULT");
        msg.setContent("恭喜！您的认领申请已通过，请联系发布人交接物品。");
        msg.setRelatedId(claim.getItemId());
        messageRepository.save(msg);

        return claim;
    }

    @Transactional
    public Claim rejectClaim(Long claimId, String reason) {
        Claim claim = claimRepository.findById(claimId).orElse(null);
        if (claim == null) return null;

        claim.setStatus(Claim.ClaimStatus.REJECTED);
        claim.setRejectReason(reason);
        claimRepository.save(claim);

        // 发送消息给申请人
        Message msg = new Message();
        msg.setUserId(claim.getUserId());
        msg.setType("CLAIM_RESULT");
        msg.setContent("很抱歉，您的认领申请未通过。原因：" + reason);
        msg.setRelatedId(claim.getItemId());
        messageRepository.save(msg);

        return claim;
    }

    public boolean hasUserApplied(Long itemId, Long userId) {
        return !claimRepository.findByItemIdAndUserId(itemId, userId).isEmpty();
    }
}
