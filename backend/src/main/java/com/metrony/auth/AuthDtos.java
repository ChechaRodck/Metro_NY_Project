package com.metrony.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.Set;

public final class AuthDtos {
    private AuthDtos() { }

    public record LoginRequest(@NotBlank @Size(min = 3, max = 60) String username,
                               @NotBlank @Size(max = 128) String password) {
        @Override public String toString() { return "LoginRequest[username=" + username + ", password=[PROTECTED]]"; }
    }

    public record UserIdentityResponse(String username, String displayName, Set<AuthRole> roles) {
        public UserIdentityResponse { roles = Set.copyOf(roles); }
    }

    public record LoginResponse(String accessToken, String tokenType, Instant expiresAt, long expiresIn,
                                UserIdentityResponse user) {
        @Override public String toString() {
            return "LoginResponse[accessToken=[PROTECTED], tokenType=" + tokenType + ", expiresAt="
                    + expiresAt + ", expiresIn=" + expiresIn + ", user=" + user + "]";
        }
    }

    public record AdminUserResponse(long id, String username, String displayName, UserStatus status,
                                    int failedAttempts, Instant lockedUntil, Instant lastSuccessfulLogin,
                                    Instant credentialsUpdatedAt, Set<AuthRole> roles, long version) {
        public AdminUserResponse { roles = Set.copyOf(roles); }
    }

    public record RoleResponse(String code, String name) { }

    public record CreateUserRequest(@NotBlank @Size(max = 60) String username,
                                    @NotBlank @Size(max = 120) String displayName,
                                    @NotBlank @Size(max = 128) String password,
                                    @NotEmpty Set<@NotNull AuthRole> roles) {
        @Override public String toString() {
            return "CreateUserRequest[username=" + username + ", displayName=" + displayName
                    + ", password=[PROTECTED], roles=" + roles + "]";
        }
    }

    public record ChangeUserStateRequest(@NotNull UserStatus status) { }
    public record ReplaceRolesRequest(@NotEmpty Set<@NotNull AuthRole> roles) { }
    public record ChangePasswordRequest(@NotBlank @Size(max = 128) String newPassword) {
        @Override public String toString() { return "ChangePasswordRequest[newPassword=[PROTECTED]]"; }
    }
}
