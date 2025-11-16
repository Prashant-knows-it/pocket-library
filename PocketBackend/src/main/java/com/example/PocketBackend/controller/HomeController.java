package com.example.PocketBackend.controller;

import com.example.PocketBackend.entity.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HomeController {

    @GetMapping("/home")
    public String home(@AuthenticationPrincipal User user) {
        if (user != null) {
            return "Welcome " + user.getDisplayName() + "!";
        }
        return "Welcome to homepage!";
    }
}