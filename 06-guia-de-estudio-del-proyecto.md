# Guía integral de estudio y sustentación de Amankay

**Fecha de revisión del repositorio: 23-11-2026.** Esta guía resume el producto, sus decisiones, su estructura y la implementación que aparece en el código y en la documentación vigente. Está pensada para repasar el proyecto y explicar sus decisiones en una sustentación académica.

> **Criterio de lectura:** aquí se distingue entre la arquitectura y reglas aprobadas, lo que el código ya contiene, lo que se ha verificado y lo que aún está pendiente. La existencia de una pantalla o endpoint no demuestra por sí sola que todos sus flujos se hayan probado de extremo a extremo.

## 1. ¿Qué es Amankay?

Amankay es un sistema web para apoyar la operación de un negocio de alimentos con varias sucursales. Reúne dos experiencias conectadas:

1. **Sitio público**, para que el cliente conozca el negocio, explore categorías y productos, consulte las sedes y solicite pedidos.
2. **Sistema interno**, para que el personal reciba y gestione pedidos, administre las mesas con QR, revise pagos, controle inventario, coordine reposiciones, organice entregas y consulte reportes.

Técnicamente es una aplicación **full stack**: tiene una interfaz web en Next.js/React, una API REST en Java/Spring Boot y una base de datos PostgreSQL. El backend se organiza como un **monolito modular**: todos los módulos del negocio viven en una aplicación Java desplegable, comparten reglas e infraestructura y se comunican internamente; no son microservicios independientes.

El sistema atiende más de un canal. Los pedidos pueden iniciarse desde la web, desde una mesa habilitada por QR o ser registrados por el trabajador cuando el cliente escribe directamente por WhatsApp. WhatsApp sigue siendo externo al sistema: no hay bot ni conexión automática con su API.

## 2. Problema que atiende y objetivo

Con varias sedes, canales y tareas operativas, la información puede quedar repartida entre conversaciones, notas y controles separados. Amankay busca centralizar la consulta del catálogo y los procesos que siguen a una solicitud: decisión de aceptación, preparación, pago, inventario, traslado de productos entre sedes y entrega.

El proyecto pretende que:

- el cliente encuentre los productos y la sede apropiada;
- el personal vea una cola común de solicitudes y no pierda de vista pedidos pendientes;
- las decisiones que afectan dinero o existencias queden registradas;
- la segunda sucursal pueda solicitar productos a la principal y dejar evidencia de lo que se despachó y recibió;
- los repartos y el efectivo recaudado puedan seguirse hasta su conciliación;
- los permisos se limiten por rol y por sucursal.

La aplicación organiza estos procesos, pero no reemplaza la confirmación humana de pedidos web, pagos por transferencia, asignación de repartidores ni ciertos domicilios sin GPS.

## 3. Alcance del MVP

### Funciones consideradas dentro del MVP

- Consulta pública de Panadería, Fritos y Bebidas, productos, precios y sucursales.
- Solicitudes web para recoger o recibir a domicilio.
- Consulta de estado mediante un código de seguimiento.
- Registro manual, por parte del personal, de pedidos recibidos directamente por WhatsApp.
- Pedidos desde mesas mediante sesiones temporales de QR activadas por el personal.
- Cola de atención, aceptación o rechazo, preparación y cancelaciones autorizadas.
- Inventario de productos terminados por sucursal, con saldos, ajustes, mermas e historial.
- Solicitudes de reposición entre sucursales, con varios despachos y recepciones parciales.
- Pagos en efectivo y por transferencia, con verificación manual y comprobantes privados.
- Asignación manual de repartidores, estados de entrega e incidencias.
- Conciliación del efectivo que declara el repartidor y que recibe el personal.
- Administración de usuarios, roles, productos, categorías, sucursales y horarios.
- Reportes de ventas, pedidos, inventario, movimientos y reposiciones.
- Auditoría de acciones administrativas importantes.

### Exclusiones y simplificaciones aprobadas

- No se automatizan conversaciones de WhatsApp. El empleado registra manualmente en el panel los pedidos recibidos por ese canal.
- No se permiten personalizaciones de productos en el MVP.
- La asignación de repartidores es manual.
- Los pagos por intento cubren el saldo completo; no hay pagos parciales ni sobrepagos. Los reembolsos son manuales y totales.
- No se administran materias primas; se controlan productos terminados.
- No se implementa una gestión formal de devoluciones ni inspección de productos retornados. Lo que regrese físicamente no vuelve automáticamente al inventario disponible.
- No se incluyen productos más vendidos en reportes.
- No se incluyen Redis, microservicios, OAuth, un servidor Express separado ni servicios que exijan un pago obligatorio.
- Se aprobaron librerías visuales 2D/3D para posibles escenas públicas puntuales. Su instalación no significa que formen parte de los flujos transaccionales.

## 4. Personas, roles y permisos

### Cliente

Consulta el catálogo sin crear una cuenta. Puede iniciar una solicitud externa, consultar su seguimiento y pedir desde una mesa cuando el personal haya abierto una sesión QR válida.

### Atención

Gestiona pedidos web y pedidos registrados manualmente desde WhatsApp. Revisa la cola, acepta o rechaza, registra razones cuando corresponde, decide solicitudes de cancelación antes de preparación, abre y cierra sesiones de mesa, registra pagos en efectivo y asigna repartidores. La asignación a una sede y el permiso del trabajador se comprueban en Java.

### Inventario

Registra saldos iniciales, movimientos y mermas con motivo obligatorio. Participa en el circuito de reposiciones. La sede secundaria solicita y recibe; la sede principal revisa, aprueba y despacha.

### Administrador

Administra usuarios, roles, sedes, horarios, catálogo y parámetros generales. Ser administrador no concede automáticamente permisos operativos de atención o inventario; esos roles se asignan de manera explícita.

### Repartidor

Consulta únicamente las entregas asignadas a su usuario, actualiza sus estados y registra incidencias o el dinero que declara haber recaudado. No decide por su cuenta reintentos operativos ni puede consultar entregas ajenas.

Los roles se relacionan con usuarios y sucursales mediante relaciones muchos-a-muchos. En el modelo se materializan con `UsuarioRol` y `UsuarioSucursal`.

## 5. Flujos importantes explicados paso a paso

### 5.1 Pedido externo desde la web

1. El cliente explora los productos y arma una bolsa en el sitio.
2. Elige recogida o domicilio e introduce la información solicitada para esa modalidad.
3. El frontend envía la solicitud a `POST /api/v1/orders/web`.
4. Java valida el pedido, fija el precio histórico y registra la solicitud antes de abrir WhatsApp.
5. El pedido queda pendiente de confirmación humana durante 30 minutos. Mientras está pendiente no reserva inventario.
6. El navegador abre WhatsApp con el mensaje preparado. El cliente conversa fuera del sistema.
7. El trabajador confirma o rechaza el pedido desde el panel. Al aceptarlo se vuelve a verificar el inventario; la aceptación y el descuento de existencias se procesan como una operación atómica.
8. El cliente puede consultar el estado con el código de seguimiento. La página de seguimiento evita exponer dirección completa, teléfono y otra información privada.

Un pedido de WhatsApp que el cliente haya iniciado directamente se ingresa manualmente en el panel. A ese registro manual no se le aplica el vencimiento de 30 minutos propio de la solicitud web.

### 5.2 Pedido para recoger

El cliente escoge una sede. La disponibilidad se evalúa para el carrito completo. Si esa sede no tiene todo, el sistema debe informar los productos faltantes y recomendar una sede que sí pueda completar el carrito entero. No se parte un pedido entre sucursales.

### 5.3 Pedido a domicilio

El cliente puede compartir GPS de manera voluntaria y con consentimiento. Si lo hace, la sede se determina entre las que tengan todos los productos disponibles, usando la cercanía a las coordenadas configuradas. Si no comparte GPS, indica dirección y barrio; el pedido espera asignación manual por personal autorizado. La cobertura aprobada es Neiva y la tarifa configurada para el MVP es de **2.000 COP**. Para validar automáticamente la cobertura todavía hacen falta el límite geográfico acordado y las coordenadas operativas reales de las sucursales.

### 5.4 Pedido desde una mesa con QR

El QR permanente identifica una mesa y su sede, pero **no** concede acceso por sí solo. Un empleado habilitado abre la sesión desde el panel. Java crea un token aleatorio y temporal, con vigencia configurable de ocho horas. El cliente escanea ese QR temporal y la web valida el token con la API.

Los pedidos aceptados durante una sesión se acumulan en una `CuentaMesa`. Cada pedido puede revisarse por separado, mientras que el saldo de la cuenta se cobra junto. Cerrar la sesión invalida el token inmediatamente, pero la cuenta puede seguir abierta hasta terminar el cobro. La web consulta los cambios mediante peticiones REST periódicas (sondeo), no mediante una conexión permanente.

### 5.5 Pago

Cada intento se registra en `Pago`. El cliente puede usar efectivo o transferencia. La transferencia requiere que se cargue un comprobante y que personal autorizado lo revise manualmente. Cada intento debe cubrir el saldo pendiente completo. Se conservan los intentos anteriores si se rechaza alguno; no se permite parcialidad ni sobrepago. Un reembolso, cuando corresponda, es total y queda asociado al pago original.

Los archivos de comprobante se guardan fuera de la carpeta pública, con nombre no predecible y límites de tamaño y tipo. La carpeta privada se configura por entorno y no está preconfigurada en Render Free.

### 5.6 Inventario y reposiciones

El inventario se registra por producto y sucursal. Los movimientos conservan su origen, por ejemplo una aceptación de pedido, una recepción de reposición o un ajuste autorizado. Un movimiento original no se edita ni elimina; una corrección genera un nuevo movimiento compensatorio total, como máximo uno por original y sin encadenar compensaciones. El código del backend usa transacciones y bloqueos al cambiar existencias para reducir el riesgo de descontar dos veces el mismo stock o dejarlo negativo ante solicitudes concurrentes.

La sucursal secundaria crea una solicitud con productos y cantidades. La principal la revisa, decide cantidades y registra uno o más despachos. La secundaria registra una o más recepciones parciales vinculadas a cada despacho y distingue cantidades aptas y dañadas. Se conserva el historial: una corrección no borra el despacho o la recepción originales.

### 5.7 Entrega y conciliación

El empleado asigna manualmente un pedido a un repartidor. Este actualiza los estados de sus entregas propias: asignada, recogida, en camino, entregada o no entregada. Si no se completa, registra la incidencia; el personal autorizado decide el reintento o la resolución. En pagos en efectivo contra entrega, el repartidor declara lo recaudado y el empleado registra lo recibido. Una diferencia requiere motivo y las rectificaciones se auditan.

## 6. Arquitectura técnica

```text
Navegador
   │
   ▼
Next.js / React / TypeScript
   │  llamadas same-origin a /api/v1
   │  proxy/rewrite de Next.js hacia la URL de Java
   ▼
API REST / Spring Boot (Java 25, monolito modular)
   │
   ├── controllers: reciben HTTP y validan entrada
   ├── services: reglas y transacciones del negocio
   ├── repositories: acceso a datos con Spring Data JPA
   └── entities/model: mapeo de entidades de dominio
   ▼
PostgreSQL

Flyway ── aplica migraciones SQL versionadas V1 y V2
```

El frontend muestra datos y recoge acciones. Java es el dueño de las reglas de negocio, de la autorización y de la persistencia. La base de datos aporta restricciones, claves foráneas, unicidades e índices. Hibernate consulta y valida el esquema existente, pero `ddl-auto=none` evita que cree o cambie tablas por su cuenta. Flyway es el mecanismo versionado para modificar el esquema.

En la configuración local, Next.js reescribe `/api/v1/...` hacia el backend en `127.0.0.1:8081`. La configuración agregada para Render cambia el origen usando `AMANKAY_API_ORIGIN`. El navegador conserva una ruta del mismo origen; el servidor Next.js actúa como proxy para la llamada al backend.

## 7. Aplicación frontend: páginas y archivos

### Rutas públicas

- `frontend/src/app/page.tsx`: entrada de Inicio; compone `HomeContent`.
- `frontend/src/app/layout.tsx`: layout raíz, idioma español de Colombia, metadatos y marco público.
- `frontend/src/app/globals.css`: estilos globales, sistema visual, responsive, fondos y animaciones CSS.
- `frontend/src/app/menu/page.tsx`: vista general del catálogo.
- `frontend/src/app/menu/[categoria]/page.tsx`: página de una categoría seleccionada.
- `frontend/src/app/sucursales/page.tsx`: información y tarjetas de sedes.
- `frontend/src/app/mesa/[codigoMesa]/page.tsx`: interfaz de mesa QR, validación de token, catálogo, bolsa y envío de pedido.

### Rutas administrativas

- `/admin/login`: inicio de sesión del personal.
- `/admin`: inicio del panel y resumen según rol.
- `/admin/pedidos`: cola de pedidos y registro manual de solicitudes recibidas por WhatsApp.
- `/admin/mesas`: mesas, activación de sesiones y generación del QR temporal.
- `/admin/pagos`: intentos, confirmación de efectivo, revisión de transferencias y reembolsos.
- `/admin/conciliaciones`: conciliaciones de efectivo de entregas.
- `/admin/inventario`: existencias, ajustes y movimientos.
- `/admin/reposiciones`: solicitudes, despachos y recepciones.
- `/admin/entregas`: asignación y seguimiento de entregas.
- `/admin/catalogo`: categorías, productos y precios.
- `/admin/usuarios`: personal, roles y sucursales asignadas.
- `/admin/sucursales`: sedes y configuración relacionada.
- `/admin/reportes`: reportes operativos.

### Componentes y utilidades compartidas

- `frontend/src/components/app-chrome.tsx` y `site-shell.tsx`: estructura visual compartida del sitio público.
- `home-content.tsx`, `home-hero.tsx`, `home-intro.tsx`: portada y contenido editorial del Inicio.
- `category-index.tsx`, `category-nav.tsx`, `category-content.tsx`, `product-grid.tsx`: navegación entre categorías y catálogo.
- `order-experience.tsx`: bolsa, modalidad, datos del pedido, solicitud REST y apertura de WhatsApp.
- `branch-list.tsx`: tarjetas/listado de sucursales.
- `bread-process.tsx`, `use-process-frame.ts`, `wheat-drawing.tsx`: recorrido visual del proceso del pan y recursos asociados.
- `route-transition.tsx`, `reveal-sections.tsx`: transiciones y revelado de secciones.
- `components/ui/`: piezas visuales pequeñas y reutilizables, algunas dibujadas en SVG.
- `components/admin/admin-shell.tsx`: marco del panel, comprobación de identidad y navegación según permisos visibles.
- `components/admin/manual-order-form.tsx`: formulario de captura manual de pedidos.
- `frontend/src/lib/api.ts`: cliente HTTP, tratamiento de errores, envío de cookies y preparación del token CSRF.
- `frontend/src/lib/currency.ts`: formato de importes.
- `frontend/src/data/bakery.ts` y `branches.ts`: datos de presentación del catálogo/sedes usados en la interfaz pública.

Los datos de presentación del catálogo no equivalen a existencias comerciales. El backend controla la disponibilidad transaccional. No se deben inventar existencias ni recetas.

## 8. Backend: capas y módulos

Raíz de código Java: `backend/src/main/java/com/amankay/backend/`.

- `config/`: configuración de Spring, CORS/orígenes, seguridad y aspectos generales.
- `modules/domain/model/`: entidades JPA, enumeraciones y clases base.
- `modules/domain/repository/`: interfaces Spring Data para consultar y guardar entidades.
- `modules/common/`: respuestas de error y utilidades compartidas.
- `modules/security/`: login/logout, sesión de personal, CSRF, authorities, usuarios y creación inicial opcional de administrador.
- `modules/catalog/`: consulta pública y administración de catálogo, sucursales, horarios y configuración de domicilio.
- `modules/orders/`: creación y seguimiento de pedidos, cola, aceptación/rechazo, sucursal, estados y cancelaciones.
- `modules/tables/`: mesas, sesiones temporales, códigos QR, pedidos QR y cuentas.
- `modules/payments/`: intentos, comprobantes privados, verificación de transferencias, efectivo y reembolsos.
- `modules/inventory/`: saldos y movimientos de inventario, ajustes y compensaciones.
- `modules/replenishments/`: solicitudes de reposición, revisión, despachos, recepciones y correcciones trazables.
- `modules/deliveries/`: asignaciones, estados, incidencias, reintentos y conciliación del efectivo.
- `modules/reports/`: consultas de reportes.
- `modules/health/`: endpoint de salud del proceso; por sí solo no demuestra que toda la base esté disponible.

Dentro de cada módulo, un controller traduce HTTP a operaciones de servicio; un service aplica validaciones y reglas; un repository encapsula acceso JPA. Esa separación evita que el navegador ejecute SQL o decida por su cuenta valores sensibles.

## 9. API REST: mapa de rutas

Las rutas viven bajo `/api/v1`.

| Grupo | Prefijos y ejemplos | Función |
|---|---|---|
| Salud | `GET /health` | Comprueba que el proceso responde. No sustituye una prueba integral de JPA y PostgreSQL. |
| Sesión | `/auth/csrf`, `/auth/login`, `/auth/me`, `/auth/logout` | Protege acciones del personal con sesión y CSRF. |
| Público/catálogo | `/catalog/categories`, `/catalog/products`, `/branches`, `/delivery/config` | Consulta categorías, productos, sedes y datos públicos de domicilio. |
| Pedidos | `POST /orders/web`, `/orders/track/{code}`, `/staff/orders/...` | Crea/consulta pedidos y gestiona la cola con permisos de personal. |
| Mesas | `/tables/...`, `/admin/tables/...` | Consulta mesa/sesión, abre/cierra sesión, valida token y registra pedidos QR. |
| Pagos | `/payments/...` | Crea intentos, consulta pagos, carga/consulta comprobantes, verifica y reembolsa. |
| Inventario | `/inventory/...` | Consulta existencias, inicia saldos, lista movimientos y registra ajustes/compensaciones. |
| Reposiciones | `/replenishments/...` | Solicita, revisa, despacha, recibe y corrige reposiciones. |
| Entregas | `/driver/...`, `/staff/deliveries/...` | Separa las operaciones del repartidor y del personal interno. |
| Administración | `/admin/users`, `/admin/products`, `/admin/categories`, `/admin/branches` | Gestiona usuarios, catálogo y sedes. |
| Reportes | `/reports/sales`, `/reports/orders`, `/reports/inventory`, `/reports/replenishments` | Presenta métricas del MVP. |

Springdoc publica el contrato OpenAPI y Swagger UI cuando la aplicación está iniciada. Su generación en un arranque integral debe confirmarse en el entorno de demostración.

## 10. Modelo de datos: 26 entidades/tablas

El MER aprobado contiene 24 entidades de dominio y dos asociativas, implementadas como 26 tablas. No se agrega una tabla por cada estado o enum; los estados son valores de atributos.

### Personas, roles y sedes

1. `Usuario`: cuenta de un empleado, administrador o repartidor.
2. `Rol`: rol operativo asignable a personal.
3. `UsuarioRol`: tabla asociativa usuario–rol (muchos a muchos).
4. `Sucursal`: sede del negocio.
5. `UsuarioSucursal`: asignación de usuario a una o varias sedes.
6. `HorarioSucursal`: horario por día para cada sede.

### Catálogo e inventario

7. `Categoria`: agrupación de productos, como Panadería, Fritos o Bebidas.
8. `Producto`: producto, precio, descripción e información de imagen.
9. `InventarioSucursal`: saldo actual de un producto en una sede.
10. `MovimientoInventario`: historial de entradas/salidas y correcciones trazables.

### Mesas y pedidos

11. `Mesa`: mesa física asociada a una sede y a un identificador QR permanente.
12. `SesionMesa`: periodo temporal de acceso por QR y responsables de apertura/cierre.
13. `CuentaMesa`: estado de cobro de una sesión; se relaciona uno a uno con ella.
14. `Pedido`: solicitud externa o de mesa, canal, estado, datos históricos, modalidad y total.
15. `DetallePedido`: producto y cantidad del pedido, guardando nombre y precio históricos.

### Pagos y entregas

16. `Pago`: intento de pago, estado, método, datos de comprobante, verificación y eventual reembolso. Cada registro pertenece a un pedido externo o a una cuenta de mesa, nunca a ambos.
17. `Entrega`: seguimiento del domicilio, estado, repartidor y observaciones.
18. `ConciliacionEfectivo`: monto declarado y recibido por una entrega, con motivo si existe diferencia.
19. `ConfiguracionDomicilio`: tarifa y configuración general del servicio de domicilio.

### Reposición entre sedes

20. `SolicitudReposicion`: encabezado y estado de la solicitud.
21. `DetalleSolicitudReposicion`: productos/cantidades solicitadas y aprobadas.
22. `DespachoReposicion`: evento de envío de la sede proveedora.
23. `DetalleDespachoReposicion`: cantidades enviadas por cada línea solicitada.
24. `RecepcionReposicion`: evento de recepción en la sede solicitante.
25. `DetalleRecepcionReposicion`: cantidades aptas y dañadas recibidas por línea despachada.

### Auditoría

26. `RegistroAuditoria`: evidencia de acciones administrativas importantes. Los eventos operativos que ya tienen su propio historial no se duplican innecesariamente aquí.

Las relaciones y restricciones detalladas están en [MER.md](docs/02-modelado/MER.md) y [modelo-fisico-postgresql.md](docs/02-modelado/modelo-fisico-postgresql.md). Ejemplos importantes son: un inventario único por producto y sede; pedido con varios detalles; sesión y cuenta de mesa 1:1; varios pedidos aceptados que se asocian a una cuenta; pagos con exactamente un origen; y recepciones enlazadas al despacho específico que las originó.

## 11. Migraciones y PostgreSQL

- `backend/src/main/resources/db/migration/V1__create_amankay_schema.sql`: crea el esquema base de las 26 tablas, relaciones, restricciones, índices y reglas SQL de inmutabilidad previstas.
- `backend/src/main/resources/db/migration/V2__seed_confirmed_catalog.sql`: inserta los datos iniciales del catálogo confirmados para el proyecto.
- `application.yml` y `application-local.yml`: configuración de conexión, JPA, Flyway y opciones por entorno.

Las migraciones V1/V2 se ejecutaron en la base local de pruebas `amankay_test` y en la base independiente de Render `amankay_render`. Los logs de Render registraron su aplicación y el inicio de JPA. En el perfil local Flyway permanece desactivado por defecto; la configuración Render lo habilitó únicamente para la base nueva de demostración.

El backend usa variables de entorno para host, puerto, base, usuario y contraseña. Las contraseñas no deben guardarse en Git ni incluirse en la guía. Hibernate tiene `ddl-auto=none`; Spring tampoco ejecuta inicialización automática de SQL. Así se evita que una aplicación arranque y altere inadvertidamente una base desconocida.

## 12. Tecnologías y dependencias

### Frontend

Versiones declaradas en `frontend/package.json` (las versiones efectivas exactas quedan fijadas también por `package-lock.json`):

| Paquete | Para qué está en el proyecto | Estado observado |
|---|---|---|
| `next` 16.4.6 | App Router, renderizado y servidor web. | Usado. |
| `react`, `react-dom` ^19.2.0 (resuelto 19.3.1) | Componentes e interfaz. | Usados. |
| `typescript` ^5.9.3 | Tipado y comprobación estática del frontend. | Usado. |
| `tailwindcss` ^4 y `@tailwindcss/postcss` ^4 | Herramientas de estilos. | Usadas junto con CSS propio. |
| `motion` ^14.14.0 | Animaciones y transiciones React actuales. | Usado desde `motion/react`. |
| `lucide-react` 1.77.0 | Iconos de interfaz. | Usado. |
| `eslint`, `eslint-config-next` | Revisión estática del código frontend. | Usados por `npm run lint`. |
| `@types/node`, `@types/react`, `@types/react-dom` | Tipos TypeScript de bibliotecas. | Usados como dependencias de desarrollo. |
| `postcss` | Procesamiento de CSS. | Usado en compilación. |

El 23-11-2026 se retiraron del frontend las dependencias directas sin imports ni configuración activa: Prisma y sus adaptadores/clientes, `pg` y sus tipos, GSAP, PixiJS, Three.js y sus bindings, y el CLI de shadcn. El árbol local reportó 368 paquetes retirados; `npm audit` quedó en cero vulnerabilidades. No se eliminaron herramientas del backend: Java y JPA/Hibernate siguen siendo el único camino de persistencia.

El `tsconfig.json` usa `strict`, `noEmit`, módulos ES y alias `@/*` hacia `src/*`. `next.config.mjs` configura la raíz Turbopack y el proxy de API.

### Backend

Versiones y dependencias de `backend/pom.xml`:

| Dependencia | Uso |
|---|---|
| Java 25 | Versión objetivo de compilación y ejecución; configurada como `maven.compiler.release`. |
| Spring Boot 4.2.0 | Plataforma que configura la aplicación y administra versiones compatibles de dependencias mediante su BOM. |
| `spring-boot-starter-webmvc` | Controladores y API HTTP REST. |
| `spring-boot-starter-data-jpa` | Persistencia relacional con repositorios JPA/Hibernate. |
| `spring-boot-starter-security` | Autenticación, sesiones, CSRF y autorización. |
| `spring-boot-starter-validation` | Validación declarativa de entradas. |
| `spring-boot-starter-flyway` y `flyway-database-postgresql` | Aplicación de migraciones en PostgreSQL. |
| `org.postgresql:postgresql` | Driver JDBC del motor PostgreSQL. |
| Springdoc OpenAPI 3.2.1 | Publicación del contrato API y Swagger UI. |
| ZXing Core 3.5.4 | Generación/lectura de códigos QR desde Java, según el flujo de mesas. |
| `spring-boot-starter-test`, `spring-boot-starter-webmvc-test` | JUnit/Mockito y soporte para pruebas del backend; solo alcance test. |
| Maven Wrapper (`mvnw`, `.mvn/`) | Ejecuta Maven con versión controlada sin requerir Maven global en el equipo. |

No se construyó el sistema con Prisma, Express, Redis ni microservicios. El ORM de las tablas del negocio es JPA/Hibernate; Flyway administra cambios versionados del esquema.

## 13. Seguridad y privacidad

- El cliente público no necesita cuenta; el personal entra con autenticación de sesión.
- Las contraseñas del personal se procesan con BCrypt. La cookie de sesión se configura HttpOnly y SameSite; en HTTPS se activa `Secure`.
- Para operaciones que modifican datos, el frontend obtiene un token CSRF y lo envía en `X-XSRF-TOKEN`.
- La API vuelve a comprobar authorities, roles y sucursal. No confía en que el navegador envíe un rol o sede correctos.
- El token QR es aleatorio y temporal; el identificador permanente de la mesa no es una credencial.
- El código de seguimiento debe ser difícil de adivinar y la consulta pública oculta datos personales y la dirección completa.
- Los comprobantes se guardan fuera de `public`, se limitan a 5 MB y se comprueban por tipo/firma admitida.
- Secretos y credenciales llegan por el entorno del proceso. No deben aparecer en `.env` versionados, ejemplos reales, capturas o esta documentación.
- La ubicación GPS es voluntaria y se persiste solo con consentimiento para hacer posible la entrega.

## 14. Recursos visuales y experiencia de usuario

El sitio público conserva una identidad cálida basada en la marca proporcionada: logo, paleta crema/cacao/cobre, fotografías de productos, patrones decorativos en SVG y tarjetas con profundidad. Los originales se conservan en `frontend/assets/originales/`; las versiones publicadas se ubican en `frontend/public/imagenes/` y `frontend/public/videos/`.

La carpeta pública contiene el clip usado para el recorrido del pan. En la página se reproduce silenciado y en bucle, con un diseño editorial que lo acompaña. El panel de operación privilegia lectura y rapidez; las escenas 2D/3D decorativas no intervienen en autorización, pedidos o inventario.

Las vistas públicas y operativas deben respetar responsive, accesibilidad y preferencia de movimiento reducido según los componentes y estilos que correspondan.

## 15. Archivos clave del repositorio

```text
Amankay/
├── README.md                         # resumen, cómo ejecutar y enlaces de documentación
├── AGENTS.md                         # reglas permanentes del proyecto
├── render.yaml                       # Blueprint aplicado para el despliegue de demostración
├── backend/
│   ├── pom.xml                        # Java, Spring Boot y dependencias
│   ├── mvnw / .mvn/                   # Maven Wrapper
│   ├── Dockerfile                     # imagen de dos etapas para el servicio Java
│   ├── README.md                      # configuración, ejecución y límites conocidos
│   └── src/main/
│       ├── java/.../modules/          # seguridad y módulos funcionales
│       └── resources/                 # YAML y migraciones Flyway
├── frontend/
│   ├── package.json / package-lock.json # scripts, dependencias y resolución fija
│   ├── next.config.mjs                 # configuración Next y proxy de API
│   ├── eslint.config.mjs               # reglas ESLint
│   ├── postcss.config.mjs              # procesamiento CSS
│   ├── tsconfig.json                   # opciones TypeScript
│   ├── assets/originales/              # logo, fotos y video recibidos
│   ├── public/                         # archivos publicados por Next.js
│   └── src/app, components, data, lib/ # rutas, UI, datos y utilidades
├── docs/
│   ├── 01-requisitos/SRS.md            # alcance, requisitos y reglas
│   ├── 02-modelado/MER.md              # entidades y relaciones lógicas
│   ├── 02-modelado/modelo-fisico-postgresql.md # tablas y restricciones SQL
│   ├── 02-modelado/UML.md              # actores, casos de uso y clases
│   ├── 03-arquitectura/                # arquitectura, stack y decisiones
│   ├── 04-diseno-ui-ux/README.md       # dirección visual y pantallas
│   ├── 05-desarrollo/                 # plan, estado y criterios de aceptación
├── 06-guia-de-estudio-del-proyecto.md   # esta guía de repaso
```

### Archivos de configuración importantes

- `frontend/package.json`: scripts `dev`, `build`, `start`, `typecheck` y `lint`.
- `frontend/package-lock.json`: asegura que `npm ci` instale el árbol resuelto registrado.
- `frontend/next.config.mjs`: dirige `/api/v1` al origen Java configurado.
- `backend/pom.xml`: versión Java, starters, OpenAPI, ZXing y pruebas.
- `backend/src/main/resources/application.yml`: valores por defecto, PostgreSQL, JPA, Flyway, sesiones y límites de carga.
- `backend/src/main/resources/application-local.yml`: configuración local segura del backend.
- `backend/Dockerfile`: compilación con JDK 25 y ejecución con JRE 25.
- `render.yaml`: tres recursos de demo (frontend, API y base), variables internas y plan gratuito.
- `.gitignore`: excluye dependencias, `.next`, artefactos TypeScript y archivos `.env*`.

## 16. Ejecución local

### Frontend

Desde `frontend/`:

```bash
npm ci
npm run dev
```

Después se abre `http://localhost:3000`. Para comprobaciones del frontend existen:

```bash
npm run typecheck
npm run lint
npm run build
```

### Backend

Se requiere JDK 25 y Maven Wrapper. Antes de iniciar el servicio, las variables de conexión PostgreSQL deben apuntar explícitamente al destino correcto. El backend local escucha por defecto en `127.0.0.1:8081`; no se debe arrancar con valores de base desconocidos. Los scripts exactos de ejecución y bootstrap están en [backend/README.md](backend/README.md).

No se debe copiar a la documentación una contraseña real ni guardar credenciales en Git.

## 17. Despliegue y estado real

El proyecto está desplegado para una demostración académica en Render:

- `render.yaml` define frontend Next.js, API en contenedor Docker y una base PostgreSQL independiente llamada `amankay_render`.
- `backend/Dockerfile` construye con Temurin JDK 25 y ejecuta con JRE 25.
- El API usa el host interno de la base, TLS requerido y las variables generadas por Render.
- Next.js recibe el host público de la API y hace el rewrite de `/api/v1`.
- La configuración de Render activó Flyway para V1/V2 en `amankay_render`; los logs registraron las migraciones, JPA y el descubrimiento de los repositorios.
- El sitio público está en [amankay-frontend.onrender.com](https://amankay-frontend.onrender.com) y la API en [amankay-api.onrender.com](https://amankay-api.onrender.com). La pantalla de acceso está en [amankay-frontend.onrender.com/admin/login](https://amankay-frontend.onrender.com/admin/login); `amankay-api.onrender.com` publica endpoints REST y no sirve la interfaz de login. La pantalla carga, pero el último intento reportado devolvió 403. V2 no crea usuarios, así que hay que confirmar la cuenta administrativa en `amankay_render` antes de completar el recorrido manual de sesión y QR.

La base `amankay_render` es independiente de `amankay_test`. La API respondió `UP` en su endpoint de salud y mediante el proxy de Next.js. La página de acceso carga, pero esto no demuestra por sí solo que el login, la sesión y el acceso QR hayan sido validados de extremo a extremo.

El plan gratuito de demostración tiene límites documentados: los servicios web pueden dormir después de inactividad y tardar en despertar; la base gratuita es temporal, de capacidad limitada y sin respaldos incluidos. No es una configuración de producción con disponibilidad garantizada. Los comprobantes requieren almacenamiento privado persistente, que no está resuelto por esta configuración gratuita. El primer arranque y las migraciones V1/V2 ya se confirmaron en los logs de Render; conviene revisar salud y logs después de futuros despliegues. No guardar ni enviar credenciales de Render en texto abierto.

## 18. Verificaciones: qué se probó y qué significa

La documentación de desarrollo registra para la entrega previa:

- `npm run lint` y `npm run build` completaron correctamente.
- `backend\\mvnw.cmd -q test` aprobó 14 pruebas Java con JDK 25.
- `git diff --check` terminó correctamente en aquella verificación.
- V1/V2 se aplicaron a `amankay_test`; Spring Boot, JPA/Hibernate y varios flujos REST respondieron con PostgreSQL real durante la prueba registrada.
- La comparación del modelo reportó 26 tablas alineadas con las 26 entidades JPA.

Estos resultados pertenecen a las revisiones indicadas en [05-desarrollo/README.md](docs/05-desarrollo/README.md). El despliegue de Render y la limpieza reciente de dependencias se verificaron por separado. Las comprobaciones de compilación no sustituyen la validación manual de extremo a extremo con navegador, sesión real, teléfono y base activa.

### Verificaciones que aún hacen falta para cerrar la demostración

- Verificar el login administrativo, la persistencia de sesión, permisos por rol/sucursal y el cierre de sesión en Render.
- Completar el recorrido manual de apertura de mesa, generación y escaneo del QR temporal, pedidos y cierre/invalidez de token.
- Confirmar si hay una cuenta administrativa en `amankay_render`; V2 no crea usuarios. Si aún no existe, crearla con el bootstrap seguro dirigido a esa base.
- Probar en navegador los flujos de pedidos, pagos, mesas/QR, inventario, reposición, entrega y reportes con roles autorizados.
- Confirmar si un pedido web guardado aparece una sola vez en la cola, verificar aceptación y descuento de stock, y comprobar el vencimiento de 30 minutos.
- Comprobar que la cuenta de mesa siga separada del cierre de sesión QR y que el token se invalide al cerrar.
- Revisar los comprobantes y su almacenamiento privado antes de afirmar que carga/descarga funcionará en el plan de presentación.
- Configurar las coordenadas y el límite de cobertura que faltan para domicilios por GPS; registrar saldos reales iniciales antes de probar disponibilidad.
- Completar el protocolo académico de usabilidad: participantes, tareas, medidas y criterios de éxito.

## 19. Pendientes de datos y operación

No son decisiones técnicas que deban inventarse durante la sustentación:

- cantidades iniciales reales de inventario;
- coordenadas de las sedes y límite geográfico verificable de cobertura;
- catálogo comercial final, recetas y disponibilidad real de productos;
- almacenamiento privado persistente para comprobantes si se requiere conservarlos en línea;
- protocolo de usabilidad y sus resultados.

En los ejemplos y documentación pública no se reproducen datos personales del anteproyecto. Los importes se expresan en COP.

## 20. Preguntas que podría hacer el profesor

### ¿Qué tipo de sistema es?

Es una aplicación web full stack para un negocio de alimentos con varias sucursales. Integra un sitio público, una experiencia de pedidos en mesas QR, un panel administrativo y un backend REST con PostgreSQL.

### ¿Por qué se llama monolito modular?

Porque el backend se despliega como una aplicación Spring Boot, pero su código está dividido en módulos de negocio (pedidos, catálogo, pagos, inventario, etc.). Así se mantiene una sola unidad de despliegue y, a la vez, se separan responsabilidades. No se agregan costos ni complejidad de microservicios.

### ¿Cómo se comunican frontend y backend?

El frontend llama endpoints REST bajo `/api/v1`. El rewrite de Next.js reenvía esas rutas al origen Java, de modo que el navegador usa su mismo origen. El JSON transporta solicitudes y respuestas; la cookie mantiene la sesión y CSRF protege las operaciones que modifican datos.

### ¿Para qué usar Java si la web ya usa TypeScript?

TypeScript construye la interfaz y coordina interacciones del navegador. Java concentra reglas transaccionales, permisos, stock, estados, pagos y acceso a la base. Separarlos evita que el navegador sea autoridad para decisiones críticas.

### ¿Qué herramienta se encarga de la persistencia?

Spring Data JPA/Hibernate es el único ORM y la API Java es la única que accede a PostgreSQL. Prisma, sus adaptadores, el cliente y el driver PostgreSQL de Node se retiraron del frontend porque no tenían uso.

### ¿Qué papel cumple Flyway?

Versiona los cambios del esquema en scripts SQL. V1 crea la estructura y V2 carga catálogo inicial confirmado. Hibernate trabaja con el esquema existente y no lo crea automáticamente. En local Flyway permanece deshabilitado por defecto; la configuración de Render lo activa solo para la base nueva de demostración.

### ¿Cómo evita el sistema aceptar más unidades de las que hay?

La disponibilidad se comprueba en Java y el cambio de estado con el descuento se hace en una transacción. El backend usa bloqueos al modificar saldos para reducir condiciones de carrera. La base complementa la regla con restricciones de integridad; no basta con que el botón del frontend oculte una opción.

### ¿WhatsApp está integrado?

No por API. El sistema registra el pedido web antes de abrir una conversación externa y guarda un estado pendiente. Si el pedido llegó directamente por WhatsApp, el empleado lo registra manualmente en el panel. La confirmación sigue bajo control del personal.

### ¿Por qué el QR de mesa es temporal?

El QR fijo identifica la mesa, pero no debe servir como credencial permanente. El personal abre la sesión y Java genera un token temporal; al cerrarla, el token se invalida. Esto limita el acceso y separa la sesión de acceso de la cuenta que queda pendiente de pago.

### ¿Por qué hay 26 tablas?

El diseño aprobado comprende 24 entidades de dominio y dos tablas asociativas para las relaciones muchos-a-muchos de usuario–rol y usuario–sucursal. Las tablas separan pedidos, detalles, pagos, sesiones/cuentas, inventario, movimientos y los eventos de cada etapa de reposición para conservar trazabilidad.

### ¿Qué se puede afirmar sobre las pruebas?

Que el registro de desarrollo reporta lint y build del frontend correctos, pruebas Java aprobadas y migraciones ejecutadas en `amankay_test` y `amankay_render`. El despliegue de demostración está activo; las pruebas manuales completas de login, sesión, permisos y QR en Render siguen pendientes, así que no se debe presentar el flujo como validado de extremo a extremo.

### ¿El sistema ya está publicado?

Sí. El frontend y la API están publicados en Render para la demostración académica. La plataforma está en plan Free y no equivale a una instalación productiva con disponibilidad continua. Las pruebas manuales completas de login y QR todavía deben cerrarse.

## 21. Documentación dueña de cada tema

- [SRS](docs/01-requisitos/SRS.md): propósito, alcance, actores, prioridades, requisitos y reglas.
- [MER](docs/02-modelado/MER.md): entidades, atributos conceptuales, cardinalidades y justificaciones.
- [Modelo físico PostgreSQL](docs/02-modelado/modelo-fisico-postgresql.md): tablas, tipos, nulabilidad, claves y restricciones.
- [UML](docs/02-modelado/UML.md): actores, casos de uso y clases.
- [Arquitectura general](docs/03-arquitectura/arquitectura-general.md): capas y responsabilidades.
- [Stack tecnológico](docs/03-arquitectura/stack-tecnologico.md): tecnologías, versiones, costos y exclusiones.
- [Decisiones técnicas](docs/03-arquitectura/decisiones-tecnicas.md): trazabilidad y cambios aprobados.
- [Pendientes](docs/03-arquitectura/pendientes-y-decisiones.md): datos y decisiones todavía abiertos.
- [Diseño UI/UX](docs/04-diseno-ui-ux/README.md): dirección visual, wireframes y ajustes implementados.
- [Desarrollo](docs/05-desarrollo/README.md): estado, comprobaciones y trabajo pendiente.
- [Backend](backend/README.md): configuración, rutas, ejecución y seguridad.

Esta guía sirve para estudiar y orientarse. Si se aprueba una nueva regla de negocio, el cambio debe registrarse en el documento dueño correspondiente y su trazabilidad actualizarse en `decisiones-tecnicas.md`.
