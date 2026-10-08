package com.metrony.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.ConfigDataApplicationContextInitializer;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;

import static org.assertj.core.api.Assertions.assertThat;

class DemoAuthProfileTest {
    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withInitializer(new ConfigDataApplicationContextInitializer())
            .withUserConfiguration(TestConfiguration.class);

    @Test void demoProfileBindsTheSharedEvaluationAccount() {
        contextRunner.withPropertyValues("spring.profiles.active=demo").run(context -> {
            assertThat(context).hasNotFailed();
            AuthProperties.Bootstrap bootstrap = context.getBean(AuthProperties.class).getBootstrap();
            assertThat(bootstrap.isEnabled()).isTrue();
            assertThat(bootstrap.getUsername()).isEqualTo("demo_admin");
            assertThat(bootstrap.getPassword()).isEqualTo("TrenSeguro#2026!");
            assertThat(bootstrap.getDisplayName()).isEqualTo("Administrador Demo");
        });
    }

    @Test void defaultProfileDoesNotEnableTheDemoAccount() {
        contextRunner.run(context -> {
            assertThat(context).hasNotFailed();
            AuthProperties.Bootstrap bootstrap = context.getBean(AuthProperties.class).getBootstrap();
            assertThat(bootstrap.isEnabled()).isFalse();
            assertThat(bootstrap.getUsername()).isEmpty();
            assertThat(bootstrap.getPassword()).isEmpty();
            assertThat(bootstrap.getDisplayName()).isEmpty();
        });
    }

    @Configuration(proxyBeanMethods = false)
    @EnableConfigurationProperties(AuthProperties.class)
    static class TestConfiguration { }
}
