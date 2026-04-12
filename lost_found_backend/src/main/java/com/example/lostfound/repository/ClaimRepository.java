package com.example.lostfound.repository;

import com.example.lostfound.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByItemId(Long itemId);
    List<Claim> findByUserId(Long userId);
    List<Claim> findByStatus(Claim.ClaimStatus status);
    List<Claim> findByItemIdAndUserId(Long itemId, Long userId);
}
