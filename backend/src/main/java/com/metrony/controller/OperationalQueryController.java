package com.metrony.controller;

import com.metrony.dto.OperationalResponses.CardSummaryResponse;
import com.metrony.dto.OperationalResponses.CertificationSummaryResponse;
import com.metrony.dto.OperationalResponses.DashboardSummaryResponse;
import com.metrony.dto.OperationalResponses.HorarioSummaryResponse;
import com.metrony.dto.OperationalResponses.EmployeeOptionResponse;
import com.metrony.dto.OperationalResponses.RechargeSummaryResponse;
import com.metrony.service.OperationalQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class OperationalQueryController {

    private final OperationalQueryService queries;

    public OperationalQueryController(OperationalQueryService queries) {
        this.queries = queries;
    }

    @GetMapping("/dashboard/resumen")
    public DashboardSummaryResponse dashboardSummary() {
        return queries.dashboardSummary();
    }

    @GetMapping("/horarios")
    public List<HorarioSummaryResponse> schedules() {
        return queries.schedules();
    }

    @GetMapping("/certificaciones")
    public List<CertificationSummaryResponse> certifications() {
        return queries.certifications();
    }

    @GetMapping("/empleados/opciones")
    public List<EmployeeOptionResponse> employeeOptions() {
        return queries.employeeOptions();
    }

    @GetMapping("/tarjetas")
    public List<CardSummaryResponse> cards() {
        return queries.cards();
    }

    @GetMapping("/recargas")
    public List<RechargeSummaryResponse> recharges() {
        return queries.recharges();
    }
}
