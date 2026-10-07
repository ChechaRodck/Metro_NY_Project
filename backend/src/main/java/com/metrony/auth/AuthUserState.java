package com.metrony.auth;

import java.time.Instant;
import java.util.Set;

public record AuthUserState(String username, UserStatus status, Instant lockedUntil,
                            Instant credentialsUpdatedAt, Set<AuthRole> roles) {
    public AuthUserState { roles = Set.copyOf(roles); }
}
