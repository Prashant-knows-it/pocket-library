package com.example.PocketBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StreakResponse {
    private Integer currentStreak;
    private Integer highestStreak;
}
