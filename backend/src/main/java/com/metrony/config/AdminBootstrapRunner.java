package com.metrony.config;

import com.metrony.auth.PasswordPolicy;
import com.metrony.repository.AuthRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminBootstrapRunner implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);
    private final AuthProperties properties;
    private final AuthRepository repository;
    private final PasswordPolicy passwordPolicy;
    private final PasswordEncoder passwordEncoder;

    public AdminBootstrapRunner(AuthProperties properties, AuthRepository repository,
                                PasswordPolicy passwordPolicy, PasswordEncoder passwordEncoder) {
        this.properties = properties; this.repository = repository;
        this.passwordPolicy = passwordPolicy; this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        AuthProperties.Bootstrap bootstrap = properties.getBootstrap();
        if (!bootstrap.isEnabled()) return;
        if (repository.countUsers() > 0) {
            log.info("Bootstrap administrativo omitido: ya existen usuarios."); return;
        }
        String username = passwordPolicy.validateUsername(bootstrap.getUsername());
        passwordPolicy.validateNewPassword(bootstrap.getPassword(), username);
        if (bootstrap.getDisplayName() == null || bootstrap.getDisplayName().isBlank()
                || bootstrap.getDisplayName().length() > 120) {
            throw new IllegalStateException("APP_AUTH_BOOTSTRAP_DISPLAY_NAME es obligatorio y admite hasta 120 caracteres");
        }
        AuthRepository.BootstrapResult result = repository.bootstrapAdmin(username,
                bootstrap.getDisplayName().trim(), passwordEncoder.encode(bootstrap.getPassword()), "BOOTSTRAP");
        log.info(result.created() ? "Bootstrap administrativo completado." : "Bootstrap administrativo omitido por concurrencia.");
    }
}
