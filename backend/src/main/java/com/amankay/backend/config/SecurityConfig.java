package com.amankay.backend.config;

import com.amankay.backend.modules.domain.model.Rol;
import com.amankay.backend.modules.domain.model.Usuario;
import com.amankay.backend.modules.domain.repository.RolRepository;
import com.amankay.backend.modules.domain.repository.UsuarioRepository;
import com.amankay.backend.modules.domain.repository.UsuarioRolRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    UserDetailsService staffDetailsService(UsuarioRepository users, UsuarioRolRepository userRoles, RolRepository roles) {
        return email -> {
            Usuario usuario = users.findByCorreoIgnoreCase(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Credenciales inválidas."));
            List<String> roleNames = roles.findAllById(userRoles.findRoleIdsByUserId(usuario.getId())).stream()
                    .map(Rol::getNombre).toList();
            return User.withUsername(usuario.getCorreo())
                    .password(usuario.getPasswordHash())
                    .roles(roleNames.toArray(String[]::new))
                    .disabled(!Boolean.TRUE.equals(usuario.getActivo()))
                    .build();
        };
    }

    @Bean
    PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(12); }

    @Bean
    DaoAuthenticationProvider authenticationProvider(UserDetailsService details, PasswordEncoder passwords) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(details);
        provider.setPasswordEncoder(passwords);
        return provider;
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    SecurityFilterChain apiSecurityFilterChain(HttpSecurity http, CorsConfigurationSource cors, AuthenticationProvider provider) throws Exception {
        CookieCsrfTokenRepository csrfRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfRepository.setHeaderName("X-XSRF-TOKEN");
        http
                .cors(config -> config.configurationSource(cors))
                .csrf(config -> config.csrfTokenRepository(csrfRepository))
                .authenticationProvider(provider)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.GET, "/api/v1/health", "/v3/api-docs", "/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**", "/api/v1/auth/csrf", "/api/v1/catalog/**", "/api/v1/branches", "/api/v1/delivery/config", "/api/v1/orders/track/**", "/api/v1/tables/sessions/status").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/login", "/api/v1/orders/web", "/api/v1/tables/sessions/validate", "/api/v1/tables/orders").permitAll()
                        .anyRequest().authenticated());
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value("${amankay.frontend-origin:http://localhost:3000}") String frontendOrigin) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(frontendOrigin));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Content-Type", "X-XSRF-TOKEN", "Authorization"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
