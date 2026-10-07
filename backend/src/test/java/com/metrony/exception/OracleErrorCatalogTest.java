package com.metrony.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;

class OracleErrorCatalogTest {

    private final OracleErrorCatalog catalog = new OracleErrorCatalog();

    @Test
    void mapsKnownOracleConstraintCodesWithoutOracleDetails() {
        assertMapping(1, HttpStatus.CONFLICT, "DUPLICATE_RESOURCE");
        assertMapping(2292, HttpStatus.CONFLICT, "RESOURCE_IN_USE");
        assertMapping(2291, HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_REFERENCE");
        assertMapping(1722, HttpStatus.BAD_REQUEST, "INVALID_DATA_FORMAT");
    }

    @Test
    void mapsKnownApplicationCodesByHttpSemantics() {
        assertMapping(20001, HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND");
        assertMapping(20026, HttpStatus.CONFLICT, "RESOURCE_CONFLICT");
        assertMapping(20100, HttpStatus.CONFLICT, "INVALID_STATE_TRANSITION");
        assertMapping(20070, HttpStatus.UNPROCESSABLE_ENTITY, "BUSINESS_RULE_VIOLATION");
    }

    @Test
    void doesNotTreatAnUnknownApplicationRangeCodeAsKnown() {
        assertThat(catalog.find(20999)).isEmpty();
    }

    private void assertMapping(int oracleCode, HttpStatus status, String applicationCode) {
        OracleErrorCatalog.OracleError error = catalog.find(oracleCode).orElseThrow();

        assertThat(error.status()).isEqualTo(status);
        assertThat(error.applicationCode()).isEqualTo(applicationCode);
        assertThat(error.message())
                .doesNotContain("ORA-")
                .doesNotContain("SELECT")
                .doesNotContain("CONSTRAINT");
    }
}
