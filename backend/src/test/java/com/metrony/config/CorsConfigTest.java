package com.metrony.config;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CorsConfigTest {

    @Test
    void trimsDiscardsEmptyAndDeduplicatesOrigins() {
        assertThat(CorsConfig.parseAllowedOrigins(
                " http://localhost:5173, ,https://console.example.test,http://localhost:5173 "
        )).containsExactly("http://localhost:5173", "https://console.example.test");
    }

    @Test
    void rejectsWildcardAndEmptyAllowlist() {
        assertThatThrownBy(() -> CorsConfig.parseAllowedOrigins("https://console.example.test,*"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> CorsConfig.parseAllowedOrigins(" , "))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> CorsConfig.parseAllowedOrigins(null))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
