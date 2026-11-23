# Backend Java de Amankay

API REST del MVP en Java 25, Spring Boot 4.2.0 y Springdoc 3.2.1. Es un monolito modular bajo `/api/v1`; Spring Data JPA/Hibernate es el único ORM. PostgreSQL es el almacenamiento objetivo y Flyway versiona el esquema. Prisma permanece en el repositorio frontend sin uso para persistir datos de la aplicación.

## Estado implementado

- Modelo JPA para las 26 tablas aprobadas (24 entidades de dominio y 2 asociativas).
- Migraciones acumulativas `V1` y `V2`; se prepararon, pero no se han ejecutado.
- Seguridad de personal con sesión HTTP, BCrypt, CSRF, roles y alcance por sucursal.
- Módulos REST para autenticación, catálogo/administración, pedidos externos y de mesa, QR, cuentas, pagos, inventario, reposiciones, entregas y reportes.
- Carga de comprobantes privados fuera de la raíz pública, activada solo al configurar `AMANKAY_PRIVATE_FILES_DIR`.
- Datos iniciales limitados a roles, sucursales, horarios, catálogo y tarifa aprobados. No se crean usuarios/contraseñas, existencias ni coordenadas inventadas.

El frontend Next.js se encuentra en `../frontend/` y consume estos endpoints mediante las rutas `/api/v1`. La configuración de PostgreSQL y el estado de Flyway se describen en las secciones siguientes.

## Requisitos y comandos

Java 25 es el objetivo de compilación y ejecución. Temurin JDK 25.0.5.1 está instalado y `JAVA_HOME` del usuario apunta a esa versión; JDK 27 permanece instalado, pero no es el JDK de este proyecto. Maven Wrapper usa Maven 3.10.2 sin requerir instalación global. Para validar localmente en PowerShell desde esta carpeta:

```powershell
.\mvnw.cmd -version
.\mvnw.cmd validate
.\mvnw.cmd test
.\mvnw.cmd package
```

La compilación declara `--release 25`. `mvnw -version`, `validate`, `test` y `package` se comprobaron con Temurin 25.0.5.1.

## Configuración local

Spring Boot lee variables del entorno del proceso; `.env.example` es solo una plantilla y no se carga automáticamente. No se fijó un nombre de base, esquema ni credenciales.

| Variable | Uso |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME` | Ubicación de la base PostgreSQL autorizada. |
| `DB_USERNAME`, `DB_PASSWORD` | Credenciales locales; nunca deben guardarse en Git. |
| `DB_SSL_MODE` | Modo TLS PostgreSQL; por defecto `disable` localmente. Render usa `require`. |
| `SERVER_ADDRESS` | Dirección de escucha; por defecto `127.0.0.1`. Render usa `0.0.0.0`. |
| `PORT` | Puerto HTTP; por defecto `8081`. Render proporciona este valor al servicio. |
| `AMANKAY_QR_SESSION_TTL` | Vigencia del token QR; predeterminado `PT8H`. |
| `AMANKAY_PRIVATE_FILES_DIR` | Directorio privado local para comprobantes; si falta, la carga responde como no disponible. |
| `AMANKAY_FRONTEND_ORIGIN` | Origen permitido para el frontend; predeterminado `http://localhost:3000`. |
| `AMANKAY_SESSION_COOKIE_SECURE` | Marca Secure de cookie; debe activarse detrás de HTTPS. |

No se debe iniciar la aplicación hasta confirmar que las variables de DB apuntan al destino elegido. El servidor escucha por defecto en `127.0.0.1:8081`; solo el despliegue Render fija explícitamente `SERVER_ADDRESS=0.0.0.0` y usa el `PORT` asignado por la plataforma.

## Administrador inicial (comando local de una sola vez)

El bootstrap se ejecuta solo con el argumento explícito `--amankay.bootstrap-admin=true`; no hay endpoint de registro ni se aceptan credenciales por variables de entorno. Requiere una terminal interactiva real. Solicita nombre, apellido, teléfono, correo, sucursal activa y contraseña (oculta, con confirmación). La contraseña usa el `PasswordEncoder` BCrypt de Spring Security y no se imprime ni se guarda en archivos. El comando falla si ya hay cualquier usuario asignado al rol `ADMINISTRADOR`, si el correo ya existe, si falta el rol o si no hay sucursales activas. Usuario, relación `UsuarioRol` y relación `UsuarioSucursal` se guardan en una transacción. Flyway sigue desactivado y Hibernate no genera esquema.

Desde PowerShell, en `backend/`, con `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME` y `DB_PASSWORD` configuradas únicamente en esa sesión de PowerShell:

```powershell
.\mvnw.cmd -DskipTests package
java -jar .\target\amankay-backend-0.1.0-SNAPSHOT.jar --amankay.bootstrap-admin=true --spring.main.web-application-type=none
```

En la segunda orden, introduce los datos solicitados en la terminal. La contraseña del administrador se escribe en modo oculto. No pongas contraseñas en argumentos, variables persistentes, archivos ni mensajes. Ejecuta el bootstrap solo contra la base local autorizada `amankay_test`; no cambia contraseñas ni registros existentes. Si el comando se interrumpe o falla, revisa el mensaje y verifica el estado antes de intentarlo de nuevo.

Si el bootstrap informa que ya existe `ADMINISTRADOR` y confirmas en pgAdmin que es la cuenta dedicada `integration-admin@…` sin sucursal asignada, puedes convertir esa misma cuenta (conserva su ID y rol) desde PowerShell con `java -jar .\target\amankay-backend-0.1.0-SNAPSHOT.jar --amankay.claim-integration-admin=true --spring.main.web-application-type=none`. El comando pide el correo actual exacto y comprueba que empiece por `integration-admin@`, que tenga rol administrador y que aún no tenga sucursal. Aborta si alguna comprobación no coincide, si el nuevo correo pertenece a otra cuenta o si no hay sucursal activa. Nunca elimina usuarios ni restablece otras cuentas.

## Flyway y PostgreSQL

V1 crea las 26 tablas, restricciones, índices y el trigger append-only de `MovimientoInventario`. V2 carga los datos iniciales confirmados. V1/V2 se ejecutaron en la base local autorizada `amankay_test`. Flyway permanece deshabilitado en `application.yml` y `application-local.yml`; Hibernate usa `ddl-auto=none`, la inicialización SQL está desactivada y `clean` está bloqueado.

Una propiedad externa puede sobrescribir la configuración. Habilitar `spring.flyway.enabled` provoca que Spring Boot ejecute migraciones al arrancar. En Render se activa mediante `SPRING_FLYWAY_ENABLED=true` solo para la base nueva y exclusiva `amankay_render` creada por el Blueprint. No se usa ni modifica `amankay_test` durante el despliegue. En el primer arranque Render deberá registrar V1/V2 en la base remota; inspecciona sus logs y la salud del backend antes de continuar.

## Despliegue académico en Render

La definición está en `../render.yaml`. Crea tres recursos en Ohio: `amankay-frontend` (Next.js), `amankay-api` (Java 25 en Docker) y `amankay-postgres` (PostgreSQL). Las referencias del Blueprint llevan las credenciales generadas de la base directamente al proceso API; no hay claves ni contraseñas guardadas en Git. La API usa el host interno de PostgreSQL, TLS requerido y la base bloquea conexiones externas por defecto. El proxy `/api/v1` usa el hostname de la API desde Render; CORS y los QR usan `https://amankay-frontend.onrender.com`. Si Render muestra otro hostname, actualiza la variable de origen correspondiente antes de probar las mesas.

El administrador no se crea con una cuenta de demostración. Créalo después del despliegue con el comando bootstrap existente, desde una terminal local y contra la base Render. Como el acceso externo de PostgreSQL se bloquea por defecto, permite temporalmente la IP pública de tu equipo en la lista de acceso del servicio de base, utiliza los datos externos solo en variables del proceso y vuelve a bloquear el acceso externo al terminar. No uses los datos de `amankay_test` ni compartas la contraseña en mensajes.

El plan gratuito es solo para demostración: los servicios web se duermen tras 15 minutos sin tráfico; el primer acceso puede tardar cerca de un minuto. PostgreSQL Free expira a los 30 días, queda limitado a 1 GB y no incluye backups. El sistema de comprobantes necesita almacenamiento privado persistente y no está disponible en este plan; no se configuró almacenamiento efímero que pudiera perder archivos.

## Rutas principales

Todas las rutas están bajo `/api/v1`. La lista completa y los esquemas se publican en OpenAPI al iniciar la API.

| Área | Endpoints principales | Acceso |
|---|---|---|
| Salud y OpenAPI | `GET /health`, `/v3/api-docs`, `/swagger-ui.html` | Público; salud no verifica la base. |
| Personal | `/auth/csrf`, `/auth/login`, `/auth/me`, `/auth/logout`; `/admin/users` | Sesión para personal; administración de usuarios limitada. |
| Catálogo | `GET /catalog/categories`, `GET /catalog/products`, `GET /branches`, `GET /delivery/config` | Consultas públicas; cambios de catálogo/configuración protegidos. |
| Pedidos | `POST /api/v1/orders/web`, `POST /api/v1/staff/orders/whatsapp`, `GET /api/v1/orders/track/{code}`, endpoints `/api/v1/staff/orders/*` | Creación web/seguimiento públicos; registro manual de WhatsApp, cola y decisiones de personal protegidos. |
| Mesas y QR | `/tables/*`, `/admin/tables` | Token temporal para operaciones del cliente; personal abre/cierra sesiones y administra mesas. |
| Pagos | `/payments/*` | Atención autorizada; comprobantes privados requieren sesión. |
| Inventario | `/inventory/*` | Personal autorizado de inventario y sucursal asignada. |
| Reposiciones | `/replenishments/*` | Personal autorizado según sucursal y operación. |
| Entregas | `/api/v1/driver/deliveries/*`, `/api/v1/staff/deliveries/*` | Repartidor solo modifica asignaciones propias; atención administra reintentos, conciliación y rectificación auditada. |
| Reportes | `/reports/*` | Personal autorizado por alcance. |

## Reglas que aplica el backend

- Pedido web: guarda pedido e importes históricos antes de que el cliente continúe a WhatsApp; requiere confirmación manual y vence a los 30 minutos. No integra la API de WhatsApp ni reserva inventario antes de aceptar.
- Pedido iniciado por WhatsApp: atención registra el pedido manualmente en la misma cola; no integra la API ni le aplica el vencimiento de 30 minutos reservado al pedido web.
- Domicilio: GPS voluntario y requiere consentimiento; si se comparte, las coordenadas se guardan en el pedido y el personal/repartidor las ve en la vista protegida. Sin GPS se exige dirección y barrio y el personal asigna la sucursal. El pedido completo debe poder salir de una sola sede.
- QR: al abrir una sesión, Java genera un token aleatorio y devuelve un SVG QR temporal únicamente al personal autorizado. El QR contiene la ruta de mesa y el token en el fragmento de la URL; el QR físico permanente solo identifica la mesa. TTL configurable de ocho horas, cierre manual inmediato y sondeo REST; la cuenta puede seguir abierta después de expirar la sesión. Configurar `AMANKAY_FRONTEND_ORIGIN` con la dirección que alcance el teléfono del cliente al hacer una demostración en red local.
- Pago: cada intento cubre todo el saldo restante; varios intentos históricos, sin parcialidad ni sobrepago; reembolso manual total.
- Inventario: existencias iniciales, ajustes y mermas requieren autorización; todo ajuste exige motivo. Los movimientos son inmutables, con origen `tipoOrigen`/`idOrigen` y una compensación total como máximo, sin encadenamiento.
- Devoluciones de entregas fallidas e inspección formal quedan fuera del MVP; lo que regrese no se reincorpora automáticamente.

## Límites conocidos

- JDK 25 y un destino PostgreSQL de prueba aún deben configurarse explícitamente.
- Las migraciones fueron ejecutadas en `amankay_test`; el despliegue Render usa una base independiente donde V1/V2 se ejecutarán al primer arranque.
- La integración Next.js/API y las vistas de panel/QR ya están implementadas; la validación manual de extremo a extremo y el despliegue Render permanecen pendientes.
- Se debe cargar stock inicial real desde el módulo inventario antes de que una sucursal pueda aceptar pedidos con verificación de disponibilidad.
- Para domicilios en Neiva se debe configurar el límite geográfico aprobado y las coordenadas reales de sucursales; sin ellos, el backend no puede garantizar la cobertura GPS. Sin ubicación GPS se usa dirección/barrio y asignación manual.
- JavaDocs, OpenAPI generado en ejecución y seguridad HTTP con el frontend no se han verificado en un arranque integral.
