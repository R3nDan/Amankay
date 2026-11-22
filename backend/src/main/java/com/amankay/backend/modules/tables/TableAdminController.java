package com.amankay.backend.modules.tables;

import com.amankay.backend.modules.common.DomainException;
import com.amankay.backend.modules.domain.model.Mesa;
import com.amankay.backend.modules.domain.model.Sucursal;
import com.amankay.backend.modules.domain.repository.MesaRepository;
import com.amankay.backend.modules.domain.repository.SucursalRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/tables")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class TableAdminController {
    private final MesaRepository tables;
    private final SucursalRepository branches;
    public TableAdminController(MesaRepository tables, SucursalRepository branches) { this.tables = tables; this.branches = branches; }

    @GetMapping
    public List<TableView> list(@RequestParam UUID sucursalId) {
        return tables.findBySucursalIdOrderByIdentificadorAsc(sucursalId).stream().map(this::view).toList();
    }

    @PostMapping
    public TableView create(@Valid @RequestBody CreateTableRequest request) {
        Sucursal branch = branches.findById(request.sucursalId()).filter(row -> Boolean.TRUE.equals(row.getActiva()))
                .orElseThrow(() -> DomainException.notFound("No se encontró una sucursal activa."));
        if (tables.findBySucursalIdAndIdentificador(branch.getId(), request.identificador()).isPresent()) throw DomainException.conflict("Ya existe esa identificación de mesa en la sucursal.");
        Mesa table = new Mesa(); table.setSucursalId(branch.getId()); table.setIdentificador(request.identificador().trim());
        table.setIdentificadorQr("AMK-" + UUID.randomUUID()); table.setActiva(true);
        return view(tables.save(table));
    }

    @PatchMapping("/{id}/deactivate")
    public void deactivate(@PathVariable UUID id) {
        Mesa row = tables.findById(id).orElseThrow(() -> DomainException.notFound("No se encontró la mesa."));
        row.setActiva(false); tables.save(row);
    }

    private TableView view(Mesa row) { return new TableView(row.getId(), row.getSucursalId(), row.getIdentificador(), row.getIdentificadorQr(), row.getActiva()); }
    public record CreateTableRequest(@NotNull UUID sucursalId, @NotBlank @Size(max = 40) String identificador) {}
    public record TableView(UUID id, UUID sucursalId, String identificador, String identificadorQr, Boolean activa) {}
}
