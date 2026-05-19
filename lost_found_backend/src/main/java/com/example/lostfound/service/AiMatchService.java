package com.example.lostfound.service;

import com.example.lostfound.entity.Item;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiMatchService {

    @Autowired
    private ItemService itemService;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> match(String query) {
        List<Item> items = itemService.findAll();

        List<Map<String, Object>> itemPayload = items.stream().map(item -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", item.getId());
            m.put("name", item.getName() != null ? item.getName() : "");
            m.put("description", item.getDescription() != null ? item.getDescription() : "");
            m.put("category", item.getCategory() != null ? item.getCategory() : "");
            m.put("location", item.getLocation() != null ? item.getLocation() : "");
            m.put("type", item.getType() != null ? item.getType().name() : "");
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> body = new HashMap<>();
        body.put("query", query);
        body.put("items", itemPayload);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    aiServiceUrl + "/match", body, Map.class);
            return response != null ? response : Map.of("results", List.of());
        } catch (Exception e) {
            return Map.of("results", List.of(), "error", "AI 服务不可用: " + e.getMessage());
        }
    }
}
