package com.metrony.exception;

/** Excepcion sin detalles para impedir enumeracion de cuentas. */
public class AuthenticationFailedException extends RuntimeException {
    public AuthenticationFailedException() {
        super("Authentication failed");
    }
}
