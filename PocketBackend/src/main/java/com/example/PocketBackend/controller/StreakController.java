package com.example.PocketBackend.controller;

import com.example.PocketBackend.dto.StreakResponse;
import com.example.PocketBackend.entity.User;
import com.example.PocketBackend.service.StreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/streak")
@RequiredArgsConstructor
public class StreakController {

    private final StreakService streakService;

    @GetMapping
    public ResponseEntity<StreakResponse> getStreak(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(streakService.getStreakInfo(user.getId()));
    }
}
