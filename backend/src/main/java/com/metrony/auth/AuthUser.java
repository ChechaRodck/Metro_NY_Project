package com.metrony.auth;

import java.time.Instant;
import java.util.Set;

public record AuthUser(
        long id, String username, String displayName, String passwordHash, UserStatus status,
        int failedAttempts, Instant failureWindowStart, Instant lockedUntil,
        Instant lastSuccessfulLogin, Instant credentialsUpdatedAt, Set<AuthRole> roles, long version
) {
    public AuthUser { roles = Set.copyOf(roles); }
    @Override public String toString() {
        return "AuthUser[id=" + id + ", username=" + username + ", displayName=" + displayName
                + ", passwordHash=[PROTECTED], status=" + status + ", roles=" + roles + ", version=" + version + "]";
    }
}
