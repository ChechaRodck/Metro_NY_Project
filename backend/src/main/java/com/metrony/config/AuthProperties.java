package com.metrony.config;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.ConfigurationProperties;
import java.time.Duration;

@ConfigurationProperties("app.auth")
public class AuthProperties {
    private int bcryptCost = 12;
    private int usernameMaxAttempts = 5;
    private int clientMaxAttempts = 20;
    private Duration loginWindow = Duration.ofMinutes(15);
    private Duration lockDuration = Duration.ofMinutes(15);
    private int limiterMaxEntries = 10000;
    private Bootstrap bootstrap = new Bootstrap();

    @PostConstruct
    void validate() {
        if (bcryptCost != 12 || usernameMaxAttempts != 5 || clientMaxAttempts != 20
                || !Duration.ofMinutes(15).equals(loginWindow)
                || !Duration.ofMinutes(15).equals(lockDuration)
                || limiterMaxEntries < 100) {
            throw new IllegalStateException("La configuracion de proteccion de autenticacion no es valida");
        }
    }

    public int getBcryptCost() { return bcryptCost; }
    public void setBcryptCost(int value) { bcryptCost = value; }
    public int getUsernameMaxAttempts() { return usernameMaxAttempts; }
    public void setUsernameMaxAttempts(int value) { usernameMaxAttempts = value; }
    public int getClientMaxAttempts() { return clientMaxAttempts; }
    public void setClientMaxAttempts(int value) { clientMaxAttempts = value; }
    public Duration getLoginWindow() { return loginWindow; }
    public void setLoginWindow(Duration value) { loginWindow = value; }
    public Duration getLockDuration() { return lockDuration; }
    public void setLockDuration(Duration value) { lockDuration = value; }
    public int getLimiterMaxEntries() { return limiterMaxEntries; }
    public void setLimiterMaxEntries(int value) { limiterMaxEntries = value; }
    public Bootstrap getBootstrap() { return bootstrap; }
    public void setBootstrap(Bootstrap value) { bootstrap = value; }

    public static class Bootstrap {
        private boolean enabled;
        private String username = "";
        private String password = "";
        private String displayName = "";
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean value) { enabled = value; }
        public String getUsername() { return username; }
        public void setUsername(String value) { username = value; }
        public String getPassword() { return password; }
        public void setPassword(String value) { password = value; }
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String value) { displayName = value; }
    }
}
