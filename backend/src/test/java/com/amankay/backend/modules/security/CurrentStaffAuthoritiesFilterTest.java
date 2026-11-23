package com.amankay.backend.modules.security;

import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CurrentStaffAuthoritiesFilterTest {
    private final UserDetailsService details = mock(UserDetailsService.class);
    private final CurrentStaffAuthoritiesFilter filter = new CurrentStaffAuthoritiesFilter(details);

    @AfterEach
    void clearContext() { SecurityContextHolder.clearContext(); }

    @Test
    void revokedAdministratorRoleCannotRemainActiveInAnOpenSession() throws Exception {
        authenticateAsAdministrator();
        when(details.loadUserByUsername("staff@amankay.test")).thenReturn(staff("ATENCION", false));
        AtomicReference<Authentication> seen = new AtomicReference<>();

        filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(),
                (request, response) -> seen.set(SecurityContextHolder.getContext().getAuthentication()));

        assertThat(seen.get().getAuthorities()).extracting("authority").containsExactly("ROLE_ATENCION");
    }

    @Test
    void deactivatedAccountLosesAccessOnTheNextRequest() throws Exception {
        authenticateAsAdministrator();
        when(details.loadUserByUsername("staff@amankay.test")).thenReturn(staff("ADMINISTRADOR", true));
        AtomicReference<Authentication> seen = new AtomicReference<>();

        filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(),
                (request, response) -> seen.set(SecurityContextHolder.getContext().getAuthentication()));

        assertThat(seen.get()).isNull();
    }

    private void authenticateAsAdministrator() {
        UserDetails old = staff("ADMINISTRADOR", false);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(old, null, old.getAuthorities()));
    }

    private UserDetails staff(String role, boolean disabled) {
        return User.withUsername("staff@amankay.test").password("irrelevant")
                .roles(role).disabled(disabled).build();
    }
}
