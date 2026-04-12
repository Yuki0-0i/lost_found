package com.example.lostfound.service;

import com.example.lostfound.entity.Item;
import com.example.lostfound.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ItemService {
    @Autowired
    private ItemRepository itemRepository;

    public List<Item> findAll() {
        return itemRepository.findAll();
    }

    public Optional<Item> findById(Long id) {
        return itemRepository.findById(id);
    }

    public List<Item> findByType(Item.ItemType type) {
        return itemRepository.findByType(type);
    }

    public Item save(Item item) {
        return itemRepository.save(item);
    }

    public void deleteById(Long id) {
        itemRepository.deleteById(id);
    }

    public List<Item> searchByName(String name) {
        return itemRepository.findByNameContaining(name);
    }

    public List<Item> findByUserId(Long userId) {
        return itemRepository.findByUserId(userId);
    }
}
