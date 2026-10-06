package com.metrony.auth;

import com.metrony.config.AuthProperties;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

class LoginAttemptLimiterTest {
    @Test void locksAtFiveFailuresExpiresAndSuccessResetsOnlyUsername() {
        AuthProperties properties = properties();
        MutableClock clock = new MutableClock(Instant.parse("2026-10-06T12:00:00Z"));
        LoginAttemptLimiter limiter = new LoginAttemptLimiter(properties, clock);
        for (int i = 0; i < 4; i++) assertThat(limiter.recordFailure("usuario", "10.0.0.1")).isEmpty();
        assertThat(limiter.recordFailure("usuario", "10.0.0.1")).hasValue(900);
        limiter.recordSuccess("usuario");
        assertThat(limiter.retryAfter("usuario", "10.0.0.1")).isEmpty();
        clock.advanceSeconds(901);
        assertThat(limiter.retryAfter("usuario", "10.0.0.1")).isEmpty();
    }

    @Test void directClientBucketIsIndependentAndAtomicUnderConcurrency() throws Exception {
        AuthProperties properties = properties(); properties.setUsernameMaxAttempts(100);
        LoginAttemptLimiter limiter = new LoginAttemptLimiter(properties,
                new MutableClock(Instant.parse("2026-10-06T12:00:00Z")));
        var executor = Executors.newFixedThreadPool(8);
        for (int i = 0; i < 20; i++) {
            int n = i; executor.submit(() -> limiter.recordFailure("usuario" + n, "10.0.0.9"));
        }
        executor.shutdown(); assertThat(executor.awaitTermination(5, TimeUnit.SECONDS)).isTrue();
        assertThat(limiter.retryAfter("nuevo", "10.0.0.9")).hasValue(900);
    }

    @Test void successDoesNotResetClientAddressBucket() {
        AuthProperties properties = properties(); properties.setClientMaxAttempts(2);
        LoginAttemptLimiter limiter = new LoginAttemptLimiter(properties,
                new MutableClock(Instant.parse("2026-10-06T12:00:00Z")));
        limiter.recordFailure("usuario-a", "10.0.0.4");
        limiter.recordSuccess("usuario-a");
        assertThat(limiter.recordFailure("usuario-b", "10.0.0.4")).hasValue(900);
    }

    private AuthProperties properties() {
        AuthProperties properties = new AuthProperties();
        properties.setUsernameMaxAttempts(5); properties.setClientMaxAttempts(20);
        return properties;
    }

    private static final class MutableClock extends Clock {
        private Instant instant;
        private MutableClock(Instant instant) { this.instant = instant; }
        void advanceSeconds(long seconds) { instant = instant.plusSeconds(seconds); }
        @Override public ZoneId getZone() { return ZoneId.of("UTC"); }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return instant; }
    }
}
