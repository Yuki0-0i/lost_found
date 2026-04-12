package com.example.lostfound.repository;

import com.example.lostfound.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByType(Item.ItemType type);
    List<Item> findByIsResolved(Boolean isResolved);
    List<Item> findByNameContaining(String name);
    List<Item> findByUserId(Long userId);
}
