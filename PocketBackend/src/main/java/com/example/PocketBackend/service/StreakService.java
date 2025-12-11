package com.example.PocketBackend.service;

import com.example.PocketBackend.dto.StreakResponse;
import com.example.PocketBackend.entity.UserStreak;
import com.example.PocketBackend.repository.UserStreakRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class StreakService {

    private final UserStreakRepository userStreakRepository;

    @Transactional
    public void updateStreak(Long userId) {
        LocalDate today = LocalDate.now();

        UserStreak streak = userStreakRepository.findByUserId(userId)
                .orElse(UserStreak.builder()
                        .userId(userId)
                        .currentStreak(0)
                        .highestStreak(0)
                        .lastLoginDate(today.minusDays(1)) // Set to yesterday so first login counts
                        .build());

        long daysSinceLastLogin = ChronoUnit.DAYS.between(streak.getLastLoginDate(), today);

        if (daysSinceLastLogin == 0) {
            // Same day login - no change
            return;
        } else if (daysSinceLastLogin == 1) {
            // Consecutive day - increment streak
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
        } else {
            // Gap in days - reset streak
            streak.setCurrentStreak(1);
        }

        // Update highest streak if current exceeds it
        if (streak.getCurrentStreak() > streak.getHighestStreak()) {
            streak.setHighestStreak(streak.getCurrentStreak());
        }

        streak.setLastLoginDate(today);
        userStreakRepository.save(streak);
    }

    public StreakResponse getStreakInfo(Long userId) {
        UserStreak streak = userStreakRepository.findByUserId(userId)
                .orElse(UserStreak.builder()
                        .currentStreak(0)
                        .highestStreak(0)
                        .build());

        return new StreakResponse(streak.getCurrentStreak(), streak.getHighestStreak());
    }
}
