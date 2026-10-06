package com.metrony.auth;

import com.metrony.config.AuthProperties;
import org.springframework.stereotype.Component;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.Map;
import java.util.OptionalLong;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginAttemptLimiter {
    private final Map<String, AttemptState> usernameAttempts = new ConcurrentHashMap<>();
    private final Map<String, AttemptState> clientAttempts = new ConcurrentHashMap<>();
    private final AuthProperties properties;
    private final Clock clock;

    public LoginAttemptLimiter(AuthProperties properties) { this(properties, Clock.systemUTC()); }
    LoginAttemptLimiter(AuthProperties properties, Clock clock) { this.properties = properties; this.clock = clock; }

    public OptionalLong retryAfter(String username, String clientAddress) {
        Instant now = clock.instant();
        long retry = Math.max(retrySeconds(usernameAttempts.get(username), now),
                retrySeconds(clientAttempts.get(clientAddress), now));
        return retry > 0 ? OptionalLong.of(retry) : OptionalLong.empty();
    }

    public OptionalLong recordFailure(String username, String clientAddress) {
        Instant now = clock.instant();
        record(usernameAttempts, username, properties.getUsernameMaxAttempts(), now);
        record(clientAttempts, clientAddress, properties.getClientMaxAttempts(), now);
        trimIfNeeded(now);
        return retryAfter(username, clientAddress);
    }

    public void recordSuccess(String username) { usernameAttempts.remove(username); }

    private void record(Map<String, AttemptState> attempts, String key, int maximum, Instant now) {
        attempts.compute(key, (ignored, existing) -> {
            AttemptState current = existing;
            if (current == null || !now.isBefore(current.windowStarted.plus(properties.getLoginWindow()))) {
                current = new AttemptState(0, now, null, now);
            }
            int failures = current.failures + 1;
            Instant blockedUntil = failures >= maximum ? now.plus(properties.getLockDuration()) : null;
            return new AttemptState(failures, current.windowStarted, blockedUntil, now);
        });
    }

    private long retrySeconds(AttemptState state, Instant now) {
        if (state == null || state.blockedUntil == null || !now.isBefore(state.blockedUntil)) return 0;
        return Math.max(1, Duration.between(now, state.blockedUntil).toSeconds());
    }

    private void trimIfNeeded(Instant now) {
        int maximum = properties.getLimiterMaxEntries();
        if (usernameAttempts.size() + clientAttempts.size() <= maximum) return;
        Instant staleBefore = now.minus(properties.getLoginWindow()).minus(properties.getLockDuration());
        usernameAttempts.entrySet().removeIf(entry -> entry.getValue().lastUpdated.isBefore(staleBefore));
        clientAttempts.entrySet().removeIf(entry -> entry.getValue().lastUpdated.isBefore(staleBefore));
        while (usernameAttempts.size() + clientAttempts.size() > maximum) {
            Map.Entry<String, AttemptState> oldest = usernameAttempts.entrySet().stream()
                    .min(Comparator.comparing(entry -> entry.getValue().lastUpdated)).orElse(null);
            if (oldest != null) usernameAttempts.remove(oldest.getKey(), oldest.getValue());
            else {
                Map.Entry<String, AttemptState> clientOldest = clientAttempts.entrySet().stream()
                        .min(Comparator.comparing(entry -> entry.getValue().lastUpdated)).orElse(null);
                if (clientOldest == null) return;
                clientAttempts.remove(clientOldest.getKey(), clientOldest.getValue());
            }
        }
    }

    private record AttemptState(int failures, Instant windowStarted, Instant blockedUntil, Instant lastUpdated) { }
}
