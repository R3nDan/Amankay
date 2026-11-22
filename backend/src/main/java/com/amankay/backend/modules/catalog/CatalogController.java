package com.amankay.backend.modules.catalog;

import com.amankay.backend.modules.common.DomainException;
import com.amankay.backend.modules.domain.model.Categoria;
import com.amankay.backend.modules.domain.model.ConfiguracionDomicilio;
import com.amankay.backend.modules.domain.model.HorarioSucursal;
import com.amankay.backend.modules.domain.model.Producto;
import com.amankay.backend.modules.domain.model.Sucursal;
import com.amankay.backend.modules.domain.repository.CategoriaRepository;
import com.amankay.backend.modules.domain.repository.ConfiguracionDomicilioRepository;
import com.amankay.backend.modules.domain.repository.HorarioSucursalRepository;
import com.amankay.backend.modules.domain.repository.ProductoRepository;
import com.amankay.backend.modules.domain.repository.SucursalRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.ArrayList;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CatalogController {
    private final CategoriaRepository categories;
    private final ProductoRepository products;
    private final SucursalRepository branches;
    private final HorarioSucursalRepository schedules;
    private final ConfiguracionDomicilioRepository deliveryConfig;

    public CatalogController(CategoriaRepository categories, ProductoRepository products, SucursalRepository branches,
            HorarioSucursalRepository schedules, ConfiguracionDomicilioRepository deliveryConfig) {
        this.categories = categories; this.products = products; this.branches = branches;
        this.schedules = schedules; this.deliveryConfig = deliveryConfig;
    }

    @GetMapping("/api/v1/catalog/categories")
    public List<CategoryView> categories() {
        return categories.findByActivaTrueOrderByNombreAsc().stream()
                .map(category -> new CategoryView(category.getId(), category.getNombre(), category.getDescripcion())).toList();
    }

    @GetMapping("/api/v1/catalog/products")
    public List<ProductView> products(@RequestParam(required = false) UUID categoryId) {
        List<Producto> rows = categoryId == null ? products.findByActivoTrueOrderByNombreAsc()
                : products.findByActivoTrueAndCategoriaIdOrderByNombreAsc(categoryId);
        return rows.stream().map(product -> new ProductView(product.getId(), product.getCategoriaId(), product.getNombre(),
                product.getDescripcion(), product.getImagen(), product.getPrecio())).toList();
    }

    @GetMapping("/api/v1/branches")
    public List<BranchView> branches() {
        return branches.findByActivaTrueOrderByNombreAsc().stream().map(branch -> new BranchView(
                branch.getId(), branch.getNombre(), branch.getDireccion(), branch.getTelefono(),
                schedules.findBySucursalIdOrderByDiaSemanaAsc(branch.getId()).stream()
                        .map(schedule -> new ScheduleView(schedule.getDiaSemana(), schedule.getHoraApertura(), schedule.getHoraCierre(), schedule.getActivo())).toList()))
                .toList();
    }

    @GetMapping("/api/v1/admin/branches")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public List<BranchView> allBranches() {
        return branches.findAll().stream().map(branch -> new BranchView(branch.getId(), branch.getNombre(), branch.getDireccion(), branch.getTelefono(),
                schedules.findBySucursalIdOrderByDiaSemanaAsc(branch.getId()).stream()
                        .map(schedule -> new ScheduleView(schedule.getDiaSemana(), schedule.getHoraApertura(), schedule.getHoraCierre(), schedule.getActivo())).toList())).toList();
    }

    @PostMapping("/api/v1/admin/branches")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public BranchView createBranch(@Valid @RequestBody BranchRequest body) {
        validateCoordinates(body.latitud(), body.longitud());
        if (!List.of("PRINCIPAL", "SECUNDARIA").contains(body.tipo())) throw new IllegalArgumentException("Tipo de sucursal inválido.");
        if ("PRINCIPAL".equals(body.tipo()) && branches.findAll().stream().anyMatch(row -> "PRINCIPAL".equals(row.getTipo())))
            throw com.amankay.backend.modules.common.DomainException.conflict("Ya existe una sucursal principal.");
        Sucursal row = new Sucursal(); apply(row, body); row.setActiva(true); row.setFechaCreacion(Instant.now());
        row = branches.save(row);
        return new BranchView(row.getId(), row.getNombre(), row.getDireccion(), row.getTelefono(), List.of());
    }

    @PutMapping("/api/v1/admin/branches/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public BranchView updateBranch(@PathVariable UUID id, @Valid @RequestBody BranchRequest body) {
        validateCoordinates(body.latitud(), body.longitud());
        Sucursal row = branches.findById(id).orElseThrow(() -> DomainException.notFound("No se encontró la sucursal."));
        apply(row, body); row = branches.save(row);
        return new BranchView(row.getId(), row.getNombre(), row.getDireccion(), row.getTelefono(), schedules.findBySucursalIdOrderByDiaSemanaAsc(id).stream()
                .map(schedule -> new ScheduleView(schedule.getDiaSemana(), schedule.getHoraApertura(), schedule.getHoraCierre(), schedule.getActivo())).toList());
    }

    @PatchMapping("/api/v1/admin/branches/{id}/deactivate")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public void deactivateBranch(@PathVariable UUID id) {
        Sucursal row = branches.findById(id).orElseThrow(() -> DomainException.notFound("No se encontró la sucursal."));
        row.setActiva(false); branches.save(row);
    }

    @PutMapping("/api/v1/admin/branches/{id}/schedules")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Transactional
    public List<ScheduleView> replaceSchedules(@PathVariable UUID id, @Valid @RequestBody ScheduleList body) {
        branches.findById(id).orElseThrow(() -> DomainException.notFound("No se encontró la sucursal."));
        List<HorarioSucursal> current = schedules.findBySucursalIdOrderByDiaSemanaAsc(id);
        for (ScheduleInput input : body.horarios()) {
            HorarioSucursal row = current.stream().filter(existing -> existing.getDiaSemana().equals(input.dia())).findFirst().orElseGet(HorarioSucursal::new);
            row.setSucursalId(id); row.setDiaSemana(input.dia()); row.setHoraApertura(input.apertura()); row.setHoraCierre(input.cierre()); row.setActivo(input.activo());
            if (input.activo() && !input.cierre().isAfter(input.apertura())) throw new IllegalArgumentException("La hora de cierre debe ser posterior a la apertura.");
            schedules.save(row);
        }
        return schedules.findBySucursalIdOrderByDiaSemanaAsc(id).stream()
                .map(schedule -> new ScheduleView(schedule.getDiaSemana(), schedule.getHoraApertura(), schedule.getHoraCierre(), schedule.getActivo())).toList();
    }

    @GetMapping("/api/v1/delivery/config")
    public DeliveryConfigView delivery() {
        ConfiguracionDomicilio config = deliveryConfig.findFirstByActivoTrue()
                .orElseThrow(() -> DomainException.notFound("No hay una configuración de domicilio activa."));
        return new DeliveryConfigView(config.getTarifa(), "Neiva");
    }

    @PostMapping("/api/v1/admin/categories")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public CategoryView createCategory(@Valid @RequestBody CategoryRequest body) {
        Categoria row = new Categoria(); row.setNombre(body.nombre().trim()); row.setDescripcion(body.descripcion()); row.setActiva(true);
        row = categories.save(row);
        return new CategoryView(row.getId(), row.getNombre(), row.getDescripcion());
    }

    @PutMapping("/api/v1/admin/categories/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public CategoryView updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryRequest body) {
        Categoria row = categories.findById(id).orElseThrow(() -> DomainException.notFound("No se encontró la categoría."));
        row.setNombre(body.nombre().trim()); row.setDescripcion(body.descripcion());
        row = categories.save(row);
        return new CategoryView(row.getId(), row.getNombre(), row.getDescripcion());
    }

    @PatchMapping("/api/v1/admin/categories/{id}/deactivate")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public void deactivateCategory(@PathVariable UUID id) {
        Categoria row = categories.findById(id).orElseThrow(() -> DomainException.notFound("No se encontró la categoría."));
        row.setActiva(false); categories.save(row);
    }

    @PostMapping("/api/v1/admin/products")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ProductView createProduct(@Valid @RequestBody ProductRequest body) {
        categories.findById(body.categoriaId()).orElseThrow(() -> DomainException.notFound("No se encontró la categoría."));
        Producto row = new Producto(); apply(row, body); row.setActivo(true); row.setFechaCreacion(Instant.now());
        row.setFechaActualizacion(Instant.now()); row = products.save(row);
        return view(row);
    }

    @PutMapping("/api/v1/admin/products/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ProductView updateProduct(@PathVariable UUID id, @Valid @RequestBody ProductRequest body) {
        categories.findById(body.categoriaId()).orElseThrow(() -> DomainException.notFound("No se encontró la categoría."));
        Producto row = products.findById(id).orElseThrow(() -> DomainException.notFound("No se encontró el producto."));
        apply(row, body); row.setFechaActualizacion(Instant.now());
        return view(products.save(row));
    }

    @PatchMapping("/api/v1/admin/products/{id}/deactivate")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public void deactivateProduct(@PathVariable UUID id) {
        Producto row = products.findById(id).orElseThrow(() -> DomainException.notFound("No se encontró el producto."));
        row.setActivo(false); row.setFechaActualizacion(Instant.now()); products.save(row);
    }

    @PutMapping("/api/v1/admin/delivery/config")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Transactional
    public DeliveryConfigView updateDeliveryConfig(@Valid @RequestBody DeliveryConfigRequest body) {
        ConfiguracionDomicilio current = deliveryConfig.findFirstByActivoTrue()
                .orElseThrow(() -> DomainException.notFound("No hay una configuración de domicilio activa."));
        current.setActivo(false); deliveryConfig.save(current);
        ConfiguracionDomicilio next = new ConfiguracionDomicilio(); next.setActivo(true); next.setTarifa(body.tarifa()); next.setFechaActualizacion(Instant.now());
        deliveryConfig.save(next);
        return new DeliveryConfigView(next.getTarifa(), "Neiva");
    }

    private void apply(Producto row, ProductRequest body) {
        row.setCategoriaId(body.categoriaId()); row.setNombre(body.nombre().trim()); row.setDescripcion(body.descripcion());
        row.setImagen(body.imagen()); row.setPrecio(body.precio());
    }
    private void apply(Sucursal row, BranchRequest body) {
        row.setNombre(body.nombre().trim()); row.setDireccion(body.direccion().trim()); row.setTelefono(body.telefono());
        row.setTipo(body.tipo()); row.setLatitud(body.latitud()); row.setLongitud(body.longitud());
    }
    private void validateCoordinates(BigDecimal latitude, BigDecimal longitude) {
        if ((latitude == null) != (longitude == null)) throw new IllegalArgumentException("La latitud y longitud deben indicarse juntas.");
        if (latitude != null && (latitude.compareTo(new BigDecimal("-90")) < 0 || latitude.compareTo(new BigDecimal("90")) > 0
                || longitude.compareTo(new BigDecimal("-180")) < 0 || longitude.compareTo(new BigDecimal("180")) > 0))
            throw new IllegalArgumentException("Las coordenadas están fuera de rango.");
    }
    private ProductView view(Producto row) {
        return new ProductView(row.getId(), row.getCategoriaId(), row.getNombre(), row.getDescripcion(), row.getImagen(), row.getPrecio());
    }

    public record CategoryView(UUID id, String nombre, String descripcion) {}
    public record ProductView(UUID id, UUID categoriaId, String nombre, String descripcion, String imagen, BigDecimal precio) {}
    public record BranchView(UUID id, String nombre, String direccion, String telefono, List<ScheduleView> horarios) {}
    public record ScheduleView(String dia, java.time.LocalTime apertura, java.time.LocalTime cierre, Boolean abierto) {}
    public record BranchRequest(@NotBlank @Size(max = 100) String nombre, @NotBlank @Size(max = 240) String direccion,
            @Size(max = 30) String telefono, @NotBlank String tipo, BigDecimal latitud, BigDecimal longitud) {}
    public record ScheduleInput(@NotBlank String dia, @NotNull java.time.LocalTime apertura, @NotNull java.time.LocalTime cierre, @NotNull Boolean activo) {}
    public record ScheduleList(@jakarta.validation.constraints.NotEmpty List<@Valid ScheduleInput> horarios) {}
    public record DeliveryConfigView(BigDecimal tarifa, String cobertura) {}
    public record CategoryRequest(@NotBlank @Size(max = 100) String nombre, @Size(max = 300) String descripcion) {}
    public record ProductRequest(@NotNull UUID categoriaId, @NotBlank @Size(max = 120) String nombre,
            @Size(max = 500) String descripcion, @Size(max = 500) String imagen,
            @NotNull @DecimalMin("0.00") BigDecimal precio) {}
    public record DeliveryConfigRequest(@NotNull @DecimalMin("0.00") BigDecimal tarifa) {}
}
