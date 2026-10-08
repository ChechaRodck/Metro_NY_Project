package com.metrony.config;

import com.metrony.auth.PasswordPolicy;
import com.metrony.auth.UserStatus;
import com.metrony.repository.AuthRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
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
    private final Environment environment;

    public AdminBootstrapRunner(AuthProperties properties, AuthRepository repository,
                                PasswordPolicy passwordPolicy, PasswordEncoder passwordEncoder,
                                Environment environment) {
        this.properties = properties; this.repository = repository;
        this.passwordPolicy = passwordPolicy; this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        AuthProperties.Bootstrap bootstrap = properties.getBootstrap();
        if (!bootstrap.isEnabled()) return;
        boolean demoProfile = environment.matchesProfiles("demo");
        if (!demoProfile && repository.countUsers() > 0) {
            log.info("Bootstrap administrativo omitido: ya existen usuarios."); return;
        }
        String username = passwordPolicy.validateUsername(bootstrap.getUsername());
        passwordPolicy.validateNewPassword(bootstrap.getPassword(), username);
        if (bootstrap.getDisplayName() == null || bootstrap.getDisplayName().isBlank()
                || bootstrap.getDisplayName().length() > 120) {
            throw new IllegalStateException("APP_AUTH_BOOTSTRAP_DISPLAY_NAME es obligatorio y admite hasta 120 caracteres");
        }
        String passwordHash = passwordEncoder.encode(bootstrap.getPassword());
        AuthRepository.BootstrapResult result = repository.bootstrapAdmin(username,
                bootstrap.getDisplayName().trim(), passwordHash,
                demoProfile ? "BOOTSTRAP_DEMO" : "BOOTSTRAP");
        if (demoProfile && !result.created()) {
            repository.changePassword(username, passwordHash, "BOOTSTRAP_DEMO");
            repository.changeState(username, UserStatus.ACTIVO, "BOOTSTRAP_DEMO");
        }
        log.info(result.created() ? "Bootstrap administrativo completado."
                : demoProfile ? "Bootstrap administrativo demo sincronizado."
                : "Bootstrap administrativo omitido: la cuenta ya esta disponible.");
    }
}
