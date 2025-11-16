package com.example.PocketBackend.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String displayName;
    private String email;
    private String password;
}