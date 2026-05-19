package com.example.lostfound.controller;

import com.example.lostfound.service.AiMatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiMatchController {

    @Autowired
    private AiMatchService aiMatchService;

    @GetMapping("/match")
    public Map<String, Object> match(@RequestParam String query) {
        return aiMatchService.match(query);
    }
}
