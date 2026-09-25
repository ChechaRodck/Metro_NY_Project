package com.metrony.config;

import com.metrony.repository.PersonalRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Tareas que corren solas. Por ahora solo la revision diaria de vencimientos
 * (marca certificaciones y tarjetas vencidas; el trigger deja la alerta en la bitacora).
 */
@Component
public class TareasProgramadas {

    private static final Logger log = LoggerFactory.getLogger(TareasProgramadas.class);

    private final PersonalRepository personalRepository;

    public TareasProgramadas(PersonalRepository personalRepository) {
        this.personalRepository = personalRepository;
    }

    @Scheduled(cron = "${app.tareas.vencimientos}")
    public void revisarVencimientos() {
        try {
            Map<String, Object> r = personalRepository.revisarVencimientos();
            log.info("Revision de vencimientos: {}", r);
        } catch (Exception e) {
            log.error("No se pudo revisar vencimientos: {}", e.getMessage());
        }
    }
}
