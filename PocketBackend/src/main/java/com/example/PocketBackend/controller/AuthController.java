package com.example.PocketBackend.controller;

import com.example.PocketBackend.dto.AuthResponse;
import com.example.PocketBackend.dto.LoginRequest;
import com.example.PocketBackend.dto.RegisterRequest;
import com.example.PocketBackend.entity.User;
import com.example.PocketBackend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(@AuthenticationPrincipal User user) {
        Map<String, Object> response = new HashMap<>();
        if (user != null) {
            response.put("valid", true);
            response.put("username", user.getDisplayName());
            response.put("email", user.getEmail());
            return ResponseEntity.ok(response);
        } else {
            response.put("valid", false);
            return ResponseEntity.status(401).body(response);
        }
    }
}