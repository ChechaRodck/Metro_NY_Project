package com.metrony.controller;

import com.metrony.auth.AuthDtos.AdminUserResponse;
import com.metrony.auth.AuthDtos.ChangePasswordRequest;
import com.metrony.auth.AuthDtos.ChangeUserStateRequest;
import com.metrony.auth.AuthDtos.CreateUserRequest;
import com.metrony.auth.AuthDtos.ReplaceRolesRequest;
import com.metrony.auth.AuthDtos.RoleResponse;
import com.metrony.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminUserController {
    private final AdminUserService service;
    public AdminUserController(AdminUserService service) { this.service = service; }

    @GetMapping("/usuarios") public List<AdminUserResponse> users() { return service.listUsers(); }
    @GetMapping("/roles") public List<RoleResponse> roles() { return service.listRoles(); }

    @PostMapping("/usuarios")
    public ResponseEntity<AdminUserResponse> create(@Valid @RequestBody CreateUserRequest request,
                                                    Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, authentication.getName()));
    }

    @PatchMapping("/usuarios/{username}/estado")
    public AdminUserResponse state(@PathVariable String username, @Valid @RequestBody ChangeUserStateRequest request,
                                   Authentication authentication) {
        return service.changeState(username, request, authentication.getName());
    }

    @PutMapping("/usuarios/{username}/roles")
    public AdminUserResponse roles(@PathVariable String username, @Valid @RequestBody ReplaceRolesRequest request,
                                   Authentication authentication) {
        return service.replaceRoles(username, request, authentication.getName());
    }

    @PostMapping("/usuarios/{username}/password")
    public ResponseEntity<Void> password(@PathVariable String username, @Valid @RequestBody ChangePasswordRequest request,
                                         Authentication authentication) {
        service.changePassword(username, request, authentication.getName()); return ResponseEntity.noContent().build();
    }
}
