# Arquitectura general de Amankay

## Estado vigente

El usuario aprobó la arquitectura Java, el MER de 26 entidades y las precisiones funcionales para continuar con la implementación. La base de datos y el backend tienen esquema físico, migraciones Flyway y módulos REST iniciales en `backend/`. No se ha conectado a PostgreSQL ni se han ejecutado migraciones porque todavía no se definió un destino local aislado.

La web Next.js ya existe, pero aún no consume la API Java. Temurin JDK 25.0.5.1 está instalado y configurado en `JAVA_HOME`; JDK 27 permanece disponible, pero el proyecto se ejecuta con JDK 25. No hay Maven global; se usa Maven Wrapper. Prisma permanece instalado y fuera del camino de persistencia.

## Producto y alcance

Amankay es una aplicación web para operar un negocio de alimentos con varias sucursales:

1. Sitio público: inicio, catálogo, sucursales, pedidos para recoger o domicilio y seguimiento.
2. Experiencia de mesa QR: catálogo, pedido y consulta de sesión/cuenta.
3. Panel administrativo: atención, mesas, pagos, productos, inventario, reposiciones, entregas, usuarios y reportes.

El backend implementa servicios REST para esos dominios; las vistas de panel, cliente QR y la integración del frontend con la API aún deben construirse. WhatsApp permanece como canal externo manual: Java guarda la solicitud web antes de abrir la conversación y atención puede registrar en la cola los pedidos recibidos directamente por WhatsApp. No utiliza la API de WhatsApp.

## Stack aprobado

| Capa | Tecnología | Responsabilidad |
|---|---|---|
| Frontend | Next.js, React, TypeScript | Experiencias web y consumo REST; no administra tablas. |
| Backend | Java 25, Spring Boot 4.2.0 | Monolito modular y reglas de negocio. |
| API | REST `/api/v1` | Contratos consumidos por web pública, QR y panel. |
| Persistencia | PostgreSQL, Spring Data JPA/Hibernate | Persistencia única desde Java; JPA valida, no crea esquema. |
| Migraciones | Flyway y `flyway-database-postgresql` | Esquema físico versionado; permanece deshabilitado al arrancar. |
| Seguridad | Spring Security, sesiones HTTP, BCrypt y CSRF | Autenticación del personal y autorización por roles/sucursal. |
| Documentación | JavaDocs, Springdoc 3.2.1 y Swagger UI | Documentación del código y contrato REST. |
| Construcción | Maven Wrapper | Versión de Maven reproducible sin instalación global. |

Spring Boot 4.2.0 administra las versiones de sus dependencias mediante su BOM. Springdoc 3.2.1 es la excepción fijada explícitamente por la compatibilidad aprobada. No se usa Prisma para leer o escribir las tablas de negocio.

## Flujo lógico

```text
Navegador → Next.js → API REST Java/Spring Boot → servicios modulares
          → repositorios Spring Data JPA/Hibernate → PostgreSQL
```

Flyway es el único medio versionado para cambiar el esquema. La configuración impide la generación automática de tablas por Hibernate y deshabilita migraciones Flyway durante el arranque. No habilitarlas contra una base desconocida. Desarrollo y demostración se mantienen locales y sin servicios obligatorios de pago.

## Módulos implementados en `backend/`

- `security`: inicio/cierre de sesión, identidad, carga inicial opcional de primer administrador y administración de usuarios/asignaciones.
- `catalog`: consulta pública de categorías, productos, sedes y tarifa; operaciones administrativas de catálogo y configuración.
- `orders`: solicitudes externas web/WhatsApp, seguimiento, cola de atención, asignación de sucursal, aceptación, rechazo, estados y cancelación.
- `tables`: administración de mesas, sesión QR temporal, pedidos y cuenta de mesa.
- `payments`: intentos completos de pago, comprobantes privados, verificación manual y reembolso total.
- `inventory`: saldos, existencias iniciales, ajustes con motivo, historial inmutable y compensaciones.
- `replenishments`: solicitudes, revisiones, despachos/recepciones parciales, cierres, reversas y anulaciones seguras.
- `deliveries`: asignaciones, estados propios del repartidor, reintentos operativos, conciliación y rectificación auditada del recaudo.
- `reports`: ventas, pedidos, inventario/movimientos y reposiciones dentro del SRS.
- `health`: estado técnico del proceso; no prueba conexión con PostgreSQL.

Los módulos comparten una única base. Las operaciones que cambian saldos usan transacciones y bloqueos pesimistas para reducir carreras concurrentes. Las validaciones entre varias filas permanecen en Java; claves foráneas, unicidades y restricciones locales se aplican también en SQL.

## Decisiones funcionales vigentes relevantes

- El pedido web se persiste antes de abrir WhatsApp, queda pendiente de confirmación manual y vence a los 30 minutos. No reserva stock antes de la aceptación y no hay integración con WhatsApp.
- Atención registra manualmente pedidos recibidos por WhatsApp en la cola común; no se les aplica expiración automática web.
- Cada intento de pago cubre el saldo pendiente completo. Se conservan reintentos; no hay pagos parciales, sobrepagos ni reembolsos parciales.
- Atención autorizada decide cancelaciones antes de iniciar preparación. Repartidores solo registran estados/incidencias de sus propias entregas; operaciones autorizadas decide reintentos y resolución.
- Inventario autorizado registra existencias iniciales, ajustes y mermas; exige motivo para cada ajuste.
- `MovimientoInventario` identifica origen con `tipoOrigen` + `idOrigen`; Java valida existencia/tipo. El original es inmutable. Una compensación total como máximo apunta al original con FK autorreferenciada; no hay parcialidad ni cadenas.
- Token QR configurable con ocho horas predeterminadas; cerrar sesión lo invalida inmediatamente. Expirar el token no cierra la cuenta. El cliente consulta por sondeo REST.
- GPS es voluntario; con consentimiento se guarda en el pedido y se incluye solo en la vista protegida de entrega. Sin consentimiento se exigen dirección y barrio y atención asigna una sede disponible. No se divide el carrito. La cobertura es Neiva, pero falta configurar límite geográfico y coordenadas reales para poder validarla automáticamente.
- Las devoluciones formales e inspecciones de pedidos fallidos están aplazadas. Lo que regrese físicamente no se incorpora automáticamente al stock.

## Seguridad y archivos

Las rutas se protegen por sesión de personal con BCrypt, CSRF y authorities derivadas de los roles y sucursales asignadas. Pedidos externos y catálogo público no requieren cuenta de cliente. Los permisos vuelven a comprobarse en Java; el backend no confía en roles, precios, saldo, inventario ni sucursal que envíe el navegador.

Los comprobantes de transferencia se almacenan fuera de la raíz pública con nombre opaco, tamaño máximo de 5 MB y validación de firma PNG/JPEG/PDF. La ruta depende de `AMANKAY_PRIVATE_FILES_DIR`; no está configurada por defecto. Se eliminan al rechazar el comprobante después de confirmar la transacción y se conserva el intento. Secrets provienen del entorno del proceso; `.env.example` es solo una plantilla.

## Configuración y protección de PostgreSQL

Se deben proporcionar `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME` y `DB_PASSWORD` en el entorno del proceso. Ningún nombre de base, esquema o secreto se inventó. El backend escucha por defecto en `127.0.0.1:8081`; no hay perfil público activo.

`spring.jpa.hibernate.ddl-auto=none`, SQL init `never`, Flyway `enabled=false`, `create-schemas=false` y `clean-disabled=true`. La propiedad se puede sobrescribir desde el entorno; habilitar Flyway ejecuta las migraciones al arrancar. La prueba real deberá usar una base/esquema aprobado y revisado, con autorización expresa.

## Verificación actual y próximos pasos

`mvnw validate`, `mvnw test` (14 pruebas aprobadas) y `mvnw package` se ejecutaron con Temurin JDK 25.0.5.1 y `--release 25`. Las migraciones V1/V2 son archivos preparados, pero no se han cargado ni ejecutado. No se verificaron el arranque completo de Spring/JPA ni la conexión real a PostgreSQL.

Antes de la validación de integración: determinar una base PostgreSQL de prueba, establecer variables seguras, revisar las migraciones y autorizar explícitamente ejecutarlas. Luego probar reglas de integridad, seguridad, transacciones y contratos OpenAPI; finalmente conectar el frontend sin duplicar las reglas Java.
