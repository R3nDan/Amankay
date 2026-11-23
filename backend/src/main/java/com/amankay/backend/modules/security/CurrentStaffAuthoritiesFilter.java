package com.amankay.backend.modules.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.filter.OncePerRequestFilter;

/** Reconsulta el estado y los roles del personal en cada petición autenticada. */
public class CurrentStaffAuthoritiesFilter extends OncePerRequestFilter {
    private final UserDetailsService staffDetails;

    public CurrentStaffAuthoritiesFilter(UserDetailsService staffDetails) {
        this.staffDetails = staffDetails;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Authentication previous = SecurityContextHolder.getContext().getAuthentication();
        if (previous != null && previous.isAuthenticated()
                && previous.getPrincipal() instanceof UserDetails) {
            try {
                UserDetails current = staffDetails.loadUserByUsername(previous.getName());
                if (!current.isEnabled() || !current.isAccountNonLocked()) {
                    SecurityContextHolder.clearContext();
                } else {
                    UsernamePasswordAuthenticationToken refreshed = new UsernamePasswordAuthenticationToken(
                            current, null, current.getAuthorities());
                    refreshed.setDetails(previous.getDetails());
                    SecurityContextHolder.getContext().setAuthentication(refreshed);
                }
            } catch (UsernameNotFoundException exception) {
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(request, response);
    }
}
