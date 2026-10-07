package com.metrony.service;

import com.metrony.auth.AuthDtos.AdminUserResponse;
import com.metrony.auth.AuthDtos.ChangePasswordRequest;
import com.metrony.auth.AuthDtos.ChangeUserStateRequest;
import com.metrony.auth.AuthDtos.CreateUserRequest;
import com.metrony.auth.AuthDtos.ReplaceRolesRequest;
import com.metrony.auth.AuthDtos.RoleResponse;
import com.metrony.auth.PasswordPolicy;
import com.metrony.repository.AuthRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminUserService {
    private final AuthRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordPolicy passwordPolicy;

    public AdminUserService(AuthRepository repository, PasswordEncoder passwordEncoder, PasswordPolicy passwordPolicy) {
        this.repository = repository; this.passwordEncoder = passwordEncoder; this.passwordPolicy = passwordPolicy;
    }

    public List<AdminUserResponse> listUsers() { return repository.listUsers(); }
    public List<RoleResponse> listRoles() { return repository.listRoles(); }

    @Transactional
    public AdminUserResponse create(CreateUserRequest request, String actor) {
        String username = passwordPolicy.validateUsername(request.username());
        passwordPolicy.validateNewPassword(request.password(), username);
        long id = repository.createUser(username, request.displayName().trim(), passwordEncoder.encode(request.password()),
                request.roles().stream().map(Enum::name).sorted().collect(java.util.stream.Collectors.joining(",")), actor);
        return repository.findAdminUser(id);
    }

    @Transactional
    public AdminUserResponse changeState(String rawUsername, ChangeUserStateRequest request, String actor) {
        String username = passwordPolicy.validateUsername(rawUsername);
        repository.changeState(username, request.status(), actor); return repository.findAdminUser(username);
    }

    @Transactional
    public AdminUserResponse replaceRoles(String rawUsername, ReplaceRolesRequest request, String actor) {
        String username = passwordPolicy.validateUsername(rawUsername);
        repository.replaceRoles(username, request.roles(), actor); return repository.findAdminUser(username);
    }

    @Transactional
    public void changePassword(String rawUsername, ChangePasswordRequest request, String actor) {
        String username = passwordPolicy.validateUsername(rawUsername);
        AdminUserResponse user = repository.findAdminUser(username);
        passwordPolicy.validateNewPassword(request.newPassword(), user.username());
        repository.changePassword(username, passwordEncoder.encode(request.newPassword()), actor);
    }
}
