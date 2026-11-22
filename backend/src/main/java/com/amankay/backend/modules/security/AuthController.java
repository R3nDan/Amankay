package com.amankay.backend.modules.security;

import com.amankay.backend.modules.common.DomainException;
import com.amankay.backend.modules.domain.model.Usuario;
import com.amankay.backend.modules.domain.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository users;
    private final HttpSessionSecurityContextRepository contextRepository = new HttpSessionSecurityContextRepository();

    public AuthController(AuthenticationManager authenticationManager, UsuarioRepository users) {
        this.authenticationManager = authenticationManager;
        this.users = users;
    }

    @GetMapping("/csrf")
    public CsrfResponse csrf(CsrfToken token) { return new CsrfResponse(token.getHeaderName(), token.getToken()); }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest body, HttpServletRequest request, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(body.email().trim().toLowerCase(), body.password()));
        Usuario user = users.findByCorreoIgnoreCase(authentication.getName())
                .orElseThrow(() -> DomainException.forbidden("Cuenta no disponible."));
        user.setUltimoAcceso(Instant.now());
        users.save(user);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        contextRepository.saveContext(context, request, response);
        return new AuthResponse(user.getId(), user.getNombre(), user.getApellido(), user.getCorreo());
    }

    @GetMapping("/me")
    public AuthResponse me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) throw new DomainException(HttpStatus.UNAUTHORIZED, "Inicia sesión para continuar.");
        Usuario user = users.findByCorreoIgnoreCase(authentication.getName())
                .orElseThrow(() -> DomainException.forbidden("Cuenta no disponible."));
        return new AuthResponse(user.getId(), user.getNombre(), user.getApellido(), user.getCorreo());
    }

    @PostMapping("/logout")
    public void logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
    }

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
    public record CsrfResponse(String headerName, String token) {}
    public record AuthResponse(java.util.UUID id, String nombre, String apellido, String correo) {}
}
