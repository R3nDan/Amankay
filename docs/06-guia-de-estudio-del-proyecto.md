# Guía integral de estudio y sustentación de Amankay

**Revisión: 23-11-2026.** Esta guía explica el producto, el alcance, las decisiones, la arquitectura, los módulos y los archivos principales. También resume cómo preparar los datos para probarlo y qué se ha verificado. Está escrita como material de repaso para una sustentación académica.

> La guía separa las reglas aprobadas, la implementación que aparece en el código, las comprobaciones registradas y los aspectos pendientes. Que exista una pantalla o ruta de API no significa por sí solo que todo el flujo esté comprobado de extremo a extremo.

## 1. Qué es Amankay

Amankay es un sistema web para apoyar las operaciones de un negocio de alimentos con varias sucursales. Tiene un sitio público para los clientes y un panel privado para el personal. El sitio permite conocer el negocio, consultar productos y sucursales, iniciar pedidos y solicitar desde una mesa habilitada mediante QR. El panel centraliza la atención, inventario, pagos, reposiciones, entregas, usuarios y reportes.

Es una aplicación **full stack**: la interfaz está construida con Next.js, React y TypeScript; las reglas de negocio y la API están en Java con Spring Boot; los datos persistentes se guardan en PostgreSQL. El backend sigue una arquitectura de **monolito modular**: es una sola aplicación desplegable con módulos separados por dominio, no varios microservicios.

## 2. Problema y objetivo

En un negocio con más de una sede, distintos canales de pedido y tareas operativas relacionadas, los datos pueden quedar repartidos entre conversaciones y controles separados. Amankay busca reunir la consulta del catálogo y el seguimiento de las operaciones que ocurren después de una solicitud: confirmación, preparación, cobro, inventario, reposición de productos entre sedes y entrega.

El objetivo es que el cliente tenga una forma clara de conocer los productos y hacer una solicitud, mientras que el personal pueda atender una cola común, aplicar permisos por rol y sucursal, y conservar un historial de las operaciones que afectan existencias o dinero.

## 3. Alcance del MVP

Incluye catálogo público; sedes y horarios; pedidos para recoger o recibir a domicilio; pedidos de mesa mediante QR; seguimiento con código; cola de atención; aceptación, rechazo y cancelación autorizada; inventario de productos terminados; solicitudes, despachos y recepciones de reposición; pagos en efectivo o transferencia con verificación manual; entregas; conciliación del efectivo declarado por repartidores; usuarios, roles, sedes, catálogo; y reportes de ventas, pedidos, inventario y reposiciones.

WhatsApp es un canal externo, no una integración automática: el sistema guarda la solicitud web antes de abrir la conversación. Si el cliente escribió directamente al negocio, el trabajador registra el pedido manualmente en el panel. El MVP no automatiza WhatsApp.

También quedan fuera: personalizaciones de productos, asignación automática de repartidores, productos más vendidos en reportes, gestión formal de devoluciones y reincorporación automática de productos retornados. Los reembolsos son totales y manuales; cada intento de pago debe cubrir el saldo completo. El sistema controla productos terminados, no materias primas. No se incorporan microservicios ni servicios que requieran un costo obligatorio.

## 4. Roles

- **Cliente:** consulta el sitio y crea solicitudes sin una cuenta. Para pedir desde una mesa necesita un QR temporal válido.
- **ATENCION:** gestiona la cola, acepta/rechaza pedidos, decide cancelaciones permitidas, registra pedidos recibidos directamente por WhatsApp, opera mesas, pagos y asignaciones de repartidor.
- **INVENTARIO:** registra existencias, ajustes y mermas con motivo, y trabaja las reposiciones de las sedes asignadas.
- **ADMINISTRADOR:** administra usuarios, roles, sedes, horarios y catálogo. Este rol no concede automáticamente permisos operativos de atención o inventario.
- **REPARTIDOR:** consulta y actualiza únicamente entregas asignadas a su usuario; registra incidencias y efectivo declarado.

Un usuario puede tener más de un rol y estar asignado a varias sucursales. El panel tiene un selector de sucursal; el backend vuelve a validar el rol y la sucursal para cada operación.

## 5. Flujos principales

### Pedido web

1. El cliente elige productos, modalidad y datos necesarios.
2. Next.js envía la solicitud a `POST /api/v1/orders/web`.
3. Java valida y persiste el pedido y los precios históricos antes de abrir WhatsApp.
4. El pedido queda pendiente de confirmación manual hasta 30 minutos; durante ese tiempo no reserva existencias.
5. Atención lo acepta o rechaza desde la cola. Al aceptar, Java revalida la disponibilidad y descuenta el inventario dentro de una operación transaccional.
6. El cliente consulta el estado usando el código de seguimiento. La vista pública omite información sensible como la dirección completa.

Los pedidos que el personal introduce después de recibirlos por WhatsApp directamente siguen el flujo común, pero no tienen el vencimiento de 30 minutos de las solicitudes web.

### Recogida y domicilio

La disponibilidad se calcula para el carrito completo. El sistema no divide un pedido entre sucursales. Si la sede de recogida no puede completarlo, debe mostrarse una alternativa que sí lo cubra. Para domicilio, GPS es opcional y requiere consentimiento. Con GPS, Java selecciona una sede disponible según distancia; sin GPS, el cliente aporta dirección y barrio y el personal asigna una sede manualmente. La cobertura inicial aprobada es Neiva y la tarifa configurada es **2.000 COP**. Para validación geográfica automática siguen pendientes las coordenadas reales y el límite de cobertura.

### Mesa QR

El QR permanente identifica la mesa, pero no autoriza a pedir. Atención abre una sesión y Java emite un token temporal, de duración configurable y ocho horas por defecto. El cliente valida ese token, consulta productos y envía pedidos. Los pedidos aceptados de una misma sesión se acumulan en una cuenta común, aunque cada pedido conserva su revisión individual. Cerrar la sesión invalida el QR; la cuenta puede seguir abierta hasta completar el cobro. El cliente ve cambios mediante sondeo REST periódico.

### Pagos

Cada fila `Pago` representa un intento. Efectivo se confirma desde el panel; transferencia requiere comprobante y verificación humana. Se permiten reintentos, pero no pagos parciales ni sobrepagos. Los reembolsos son totales. El comprobante se almacena fuera del directorio público, con límite de tamaño y comprobación del formato; el almacenamiento persistente debe configurarse para el entorno utilizado.

### Inventario y reposiciones

El saldo se registra por combinación de producto y sucursal. La existencia inicial establece el primer saldo de esa combinación. Los cambios posteriores se hacen como ajustes positivos, negativos o mermas, siempre con motivo. Los movimientos originales son inmutables; una corrección produce un movimiento compensatorio total, como máximo una vez y sin cadenas.

La sucursal secundaria solicita productos; la principal revisa y aprueba cantidades, y registra uno o más despachos. La secundaria registra recepciones parciales vinculadas al despacho concreto y distingue cantidades aptas y dañadas. Se conserva el historial en lugar de borrar los eventos anteriores.

### Entrega y conciliación

Atención asigna un pedido a un repartidor. El repartidor cambia estados en secuencia y reporta incidencias propias. Operaciones decide reintentos. Cuando hay recaudo en efectivo, el repartidor declara la cantidad y un trabajador registra la recibida; cualquier diferencia requiere motivo y las rectificaciones se auditan.

## 6. Arquitectura

```text
Navegador → Next.js / React / TypeScript → REST /api/v1
          → Java / Spring Boot: controllers → services → repositories
          → Spring Data JPA / Hibernate → PostgreSQL

Flyway aplica las migraciones SQL V1 y V2.
```

Next.js presenta la interfaz y realiza solicitudes HTTP. El archivo `frontend/next.config.mjs` reescribe `/api/v1/...` al origen Java configurado. Así el navegador llama una ruta del mismo origen y Next.js reenvía la solicitud a la API.

Java conserva las reglas transaccionales y la autorización; el navegador no decide saldos, permisos, precios finales ni transiciones válidas. Los repositorios JPA leen y persisten entidades. PostgreSQL conserva datos y restricciones. Flyway versiona cambios de esquema; Hibernate utiliza el esquema y tiene `ddl-auto=none`, por lo que no crea tablas automáticamente.

## 7. Frontend: las tres experiencias, rutas y archivos clave

Amankay comparte identidad visual y componentes, pero atiende tres contextos de uso distintos. El sitio público prioriza exploración y pedido; el panel requiere sesión de personal y prioriza operaciones; la experiencia QR parte de una sesión de mesa activa y está diseñada primero para teléfono. Las rutas son vistas de Next.js: las reglas y escrituras siguen en la API Java.

### 7.1 Sitio público

- `/`: portada editorial con acceso al catálogo, presentación del proceso del pan e información de sucursales.
- `/menu` y `/menu/[categoria]`: catálogo de Panadería, Fritos y Bebidas. La interfaz conserva tarjetas, fotografías y navegación responsive. El contenido visual se obtiene de datos tipados del frontend; al enviar, el backend valida productos, precios vigentes, sucursal y disponibilidad.
- Bolsa: resumen de cantidades y modalidad de recogida o domicilio. La solicitud se persiste con `POST /api/v1/orders/web` antes de abrir WhatsApp. El cliente continúa la conversación fuera del sistema y el personal confirma manualmente desde Pedidos.
- `/sucursales`: direcciones, horarios y teléfonos publicados.
- `/seguimiento/[codigo]`: consulta pública del estado con información limitada para evitar exponer datos privados.

El envío desde la bolsa no equivale a aceptación. El pedido web permanece pendiente de confirmación manual, vence a los 30 minutos si nadie lo atiende y no reserva inventario antes de la aceptación.

### 7.2 Panel administrativo

- `/admin/login`: autentica personal con sesión HTTP del backend; no crea cuentas ni ofrece registro público.
- `/admin`: presenta accesos y resumen según los permisos recibidos.
- `/admin/pedidos`: consulta la cola por sucursal, revisa solicitudes web y pedidos registrados manualmente por WhatsApp, permite aceptar/rechazar y ejecutar transiciones autorizadas.
- `/admin/mesas`: administra mesas, abre/cierra sesiones temporales y presenta el QR que el personal comparte con el cliente. La cuenta de mesa tiene ciclo de cierre independiente.
- `/admin/inventario` y `/admin/reposiciones`: consulta saldos y movimientos, registra existencias iniciales/ajustes con motivo, y tramita solicitudes, despachos, recepciones y cierres previstos.
- `/admin/entregas`, `/admin/pagos` y `/admin/conciliaciones`: operaciones de entrega, intentos de pago, revisión manual de transferencias y conciliación del efectivo declarado/recibido.
- `/admin/catalogo`, `/admin/usuarios`, `/admin/sucursales` y `/admin/reportes`: mantienen datos de catálogo y accesos, consultan sucursales/configuración y generan reportes del MVP.

La navegación puede ocultar opciones que no corresponden al rol, pero esto es solo presentación. Java vuelve a comprobar rol, sucursal y relación del usuario con la entrega u operación solicitada. El rol `ADMINISTRADOR` no implica por sí solo permisos de atención o inventario.

### 7.3 Experiencia de mesa QR

- La ruta de cliente es `/mesa/[codigoMesa]`; abre catálogo, carrito, consulta de pedidos y estados asociados a la mesa.
- El QR físico permanente identifica mesa/sucursal y no da permiso para pedir. Personal autorizado abre sesión desde el panel; Java emite un QR temporal vinculado a esa sesión y mesa.
- El token tiene vigencia configurable de ocho horas por defecto. Java almacena su hash; el token original se entrega al personal para mostrar el QR temporal. El cierre manual invalida el acceso; la expiración por tiempo no cierra la cuenta.
- La página cliente recibe el token en el fragmento de la URL, lo valida con el backend y conserva el token en `sessionStorage` del navegador durante la sesión de esa pestaña. El fragmento se retira de la barra de direcciones después de procesarse. Esto no significa que el token no exista en el navegador: permanece acotado al almacenamiento de sesión y no se persiste en `localStorage`.
- La API vuelve a validar el token al consultar y enviar pedidos. La aplicación consulta cambios mediante sondeo REST periódico; no utiliza WebSocket.

La experiencia QR es mobile-first, con controles táctiles, resumen de pedidos y estados legibles. La representación visual puede cambiar sin modificar la validación de token ni las reglas transaccionales, que pertenecen al backend.

### 7.4 Internacionalización implementada en JavaScript

`frontend/src/lib/i18n.js` es la implementación activa. Utiliza un contexto React, diccionarios explícitos y las API nativas `Intl` de JavaScript; no depende de una biblioteca de internacionalización externa. Los códigos configurados son `es-CO` (español de Colombia), `en` (inglés) y `pt-BR` (portugués de Brasil). El selector existente cambia el idioma, actualiza `document.documentElement.lang` y guarda la preferencia en `localStorage`.

La cobertura vigente incluye sitio público, navegación compartida, flujo de bolsa/pedido, experiencia QR, acceso y elementos compartidos del inicio administrativo. Las pantallas de operación internas del panel siguen en español. La presentación de precios continúa en COP; algunos componentes operativos usan formato colombiano fijo, por lo que tres idiomas disponibles no significa que todas las vistas y formatos hayan sido traducidos ni probados integralmente en las tres variantes.

### Rutas públicas

- `frontend/src/app/page.tsx`: entrada de Inicio.
- `frontend/src/app/layout.tsx`: idioma, metadatos y marco raíz.
- `frontend/src/app/globals.css`: estilos globales, responsive, identidad visual y animaciones CSS.
- `frontend/src/app/menu/page.tsx`: portada del catálogo.
- `frontend/src/app/menu/[categoria]/page.tsx`: listado de una categoría.
- `frontend/src/app/sucursales/page.tsx`: información de sucursales.

### Rutas del panel

`/admin/login`, `/admin`, `/admin/pedidos`, `/admin/mesas`, `/admin/inventario`, `/admin/reposiciones`, `/admin/entregas`, `/admin/pagos`, `/admin/conciliaciones`, `/admin/catalogo`, `/admin/usuarios`, `/admin/sucursales` y `/admin/reportes`.

La vista de cliente QR es `/mesa/[codigoMesa]`, implementada en `frontend/src/app/mesa/[codigoMesa]/page.tsx` y sus estilos en `frontend/src/app/mesa/[codigoMesa]/table.css`.

### Componentes y utilidades

- `components/app-chrome.tsx` y `site-shell.tsx`: estructura visual pública.
- `home-content.tsx`, `home-hero.tsx`, `home-intro.tsx`: portada.
- `category-index.tsx`, `category-nav.tsx`, `category-content.tsx`, `product-grid.tsx`: navegación y productos.
- `order-experience.tsx`: carrito, modalidad, solicitud a Java y apertura de WhatsApp.
- `bread-process.tsx`, `use-process-frame.ts`, `wheat-drawing.tsx`: recorrido visual del pan.
- `route-transition.tsx`, `reveal-sections.tsx`: transiciones y aparición de secciones.
- `components/admin/admin-shell.tsx`: sesión, roles, sucursal seleccionada y navegación del panel.
- `components/admin/manual-order-form.tsx`: captura manual de pedidos.
- `frontend/src/lib/api.ts`: cliente HTTP, cookies de sesión, CSRF y errores.
- `frontend/src/lib/currency.ts`: formato de dinero.
- `frontend/src/data/bakery.ts` y `branches.ts`: contenido para presentar catálogo y sedes.

Los datos estáticos de presentación no reemplazan el inventario transaccional del backend. Las imágenes originales están en `frontend/assets/originales/`; las versiones utilizadas por el sitio están en `frontend/public/`.

## 8. Backend: estructura

Raíz Java: `backend/src/main/java/com/amankay/backend/`.

- `config/`: configuración de Spring, seguridad y origen permitido.
- `modules/domain/model/`: entidades JPA, enums y clases comunes.
- `modules/domain/repository/`: interfaces Spring Data.
- `modules/common/`: errores y utilidades comunes.
- `modules/security/`: autenticación, identidad, CSRF, usuarios y permisos.
- `modules/catalog/`: categorías, productos, sucursales, horarios y configuración.
- `modules/orders/`: creación, cola, seguimiento, aceptación, estados y cancelaciones.
- `modules/tables/`: mesas, sesiones temporales, tokens y cuentas.
- `modules/payments/`: intentos, comprobantes, verificaciones y reembolsos.
- `modules/inventory/`: saldo, movimientos, ajustes y compensaciones.
- `modules/replenishments/`: solicitudes, despachos, recepciones y correcciones.
- `modules/deliveries/`: asignaciones, estados, incidencias y recaudo.
- `modules/reports/`: consultas de reportes.
- `modules/health/`: respuesta de salud del proceso.

En cada módulo, controller recibe HTTP, service aplica reglas y transacciones, repository realiza consultas JPA. `backend/README.md` explica variables, ejecución y rutas.

## 9. API REST resumida

Todas las rutas usan el prefijo `/api/v1`:

| Grupo | Rutas principales | Propósito |
|---|---|---|
| Salud | `GET /health` | Estado básico del proceso. |
| Sesión | `/auth/csrf`, `/auth/login`, `/auth/me`, `/auth/logout` | Inicio/cierre de sesión y token CSRF. |
| Catálogo | `/catalog/categories`, `/catalog/products`, `/branches` | Lectura pública. |
| Pedidos | `/orders/web`, `/orders/track/{code}`, `/staff/orders/...` | Crear, consultar y operar pedidos. |
| Mesas | `/tables/...`, `/admin/tables/...` | Abrir/cerrar sesiones, validar token y pedir por mesa. |
| Pagos | `/payments/...` | Intentos, comprobantes, verificación y reembolso. |
| Inventario | `/inventory/...` | Saldos, movimientos, ajustes y compensaciones. |
| Reposición | `/replenishments/...` | Solicitud, aprobación, despacho y recepción. |
| Entrega | `/driver/...`, `/staff/deliveries/...` | Operaciones propias del repartidor y del personal. |
| Administración | `/admin/users`, `/admin/products`, `/admin/categories`, `/admin/branches` | Gestión administrativa. |
| Reportes | `/reports/...` | Ventas, pedidos, inventario y reposiciones. |

Springdoc/OpenAPI y Swagger UI documentan los contratos cuando se inicia el backend.

## 10. Base de datos: 26 entidades

El modelo aprobado tiene 24 entidades de dominio y dos asociativas. Las asociaciones M:N de usuario–rol y usuario–sucursal se materializan con sus propias tablas.

1. **Usuarios y sedes:** `Usuario`, `Rol`, `UsuarioRol`, `Sucursal`, `UsuarioSucursal`, `HorarioSucursal`.
2. **Catálogo e inventario:** `Categoria`, `Producto`, `InventarioSucursal`, `MovimientoInventario`.
3. **Mesas y pedidos:** `Mesa`, `SesionMesa`, `CuentaMesa`, `Pedido`, `DetallePedido`.
4. **Cobro y entrega:** `Pago`, `Entrega`, `ConciliacionEfectivo`, `ConfiguracionDomicilio`.
5. **Reposición:** `SolicitudReposicion`, `DetalleSolicitudReposicion`, `DespachoReposicion`, `DetalleDespachoReposicion`, `RecepcionReposicion`, `DetalleRecepcionReposicion`.
6. **Auditoría:** `RegistroAuditoria`.

Relaciones importantes: producto y sucursal determinan un único saldo; pedido tiene varias líneas con precio histórico; sesión y cuenta se relacionan uno a uno; una cuenta agrupa pedidos de mesa aceptados; pago pertenece exactamente a un pedido externo o a una cuenta; entrega corresponde a un pedido de domicilio; recepción referencia el despacho que la originó. El MER y el modelo físico contienen atributos, tipos y restricciones detallados. En pgAdmin se observan 27 tablas físicas porque Flyway añade `flyway_schema_history`; las tablas de la aplicación siguen siendo las 26 aprobadas.

## 11. Tecnologías y dependencias actuales

### Frontend (`frontend/package.json`)

- `next` 16.4.6: App Router y servidor web.
- `react`, `react-dom` 19.2.0: interfaz por componentes.
- `typescript` ^5.9.3: tipado estático.
- `motion` ^14.14.0: transiciones/animaciones React efectivamente usadas.
- `lucide-react` 1.77.0: iconos usados en componentes.
- `tailwindcss` 4 y `@tailwindcss/postcss` 4: integración de utilidades/procesamiento CSS; el diseño también usa estilos CSS propios.
- Desarrollo: ESLint 9, configuración de Next, PostCSS y tipos de Node/React.

Prisma, su cliente/adapter, GSAP, PixiJS, Three.js y shadcn fueron retirados como dependencias directas no usadas antes del despliegue de Render. El frontend no mantiene conexión directa con PostgreSQL; Java es el único propietario de la persistencia.

### Backend (`backend/pom.xml`)

- Java 25 y Spring Boot 4.2.0: plataforma del backend.
- `spring-boot-starter-webmvc`: API HTTP.
- `spring-boot-starter-data-jpa`: persistencia con JPA/Hibernate.
- `spring-boot-starter-security`: autenticación/autorización.
- `spring-boot-starter-validation`: validación de solicitudes.
- `spring-boot-starter-flyway` y `flyway-database-postgresql`: migraciones.
- PostgreSQL JDBC: conexión al motor.
- Springdoc/OpenAPI 3.2.1: documentación de API.
- ZXing Core 3.5.4: generación del QR de mesa temporal.
- Spring Boot Test/WebMVC Test: dependencias de pruebas.
- Maven Wrapper (`mvnw`, `.mvn/`): versión de Maven sin instalación global.

## 12. Seguridad

El personal usa sesión HTTP con contraseñas procesadas con BCrypt. La cookie se configura HttpOnly/SameSite y Secure con HTTPS. Para acciones que modifican información, el cliente obtiene CSRF y lo envía en `X-XSRF-TOKEN`. Java valida el usuario, rol y sucursal en cada operación; la navegación que oculta opciones en el frontend no sustituye esa validación.

Los pedidos públicos no requieren cuenta. Los códigos de seguimiento evitan exponer datos privados. El QR fijo no es una credencial: el token temporal sí tiene vigencia y se invalida al cerrar la sesión. Los comprobantes deben quedar fuera del directorio público y los secretos llegan por variables de entorno, nunca por Git.

## 13. Migraciones y datos iniciales

`V1__create_amankay_schema.sql` crea las tablas, claves, restricciones, índices y controles de historial. `V2__seed_confirmed_catalog.sql` crea roles, sucursales, horarios, categorías, productos y configuración inicial de domicilio. **No crea usuarios, mesas ni existencias.**

V1/V2 se ejecutaron en `amankay_test` y en la base remota independiente `amankay_render`. La base de Render está enlazada al sitio/API publicados; los datos de `amankay_test` no se copian a Render. Hibernate no crea esquema (`ddl-auto=none`). Flyway permanece apagado por defecto localmente y se habilitó para la base remota nueva del despliegue.

## 14. Cómo preparar datos para empezar a probar

V2 ya carga cuatro roles, dos sucursales, horarios, tres categorías, 18 productos y la tarifa inicial de domicilio. Antes de crear datos, consulta lo existente en **Sucursales** y **Catálogo** para evitar duplicados. Los saldos por sucursal, usuarios y mesas sí deben cargarse o verificarse en el entorno en el que se harán las pruebas.

Flujo recomendado:

1. **Escoge el entorno:** local (`amankay_test`) o Render (`amankay_render`). Son bases distintas y los datos no se sincronizan.
2. **Verifica usuarios:** en **Usuarios**, confirma que cada cuenta esté activa, tenga el rol que se va a probar y esté asignada a la sucursal correcta. `ADMINISTRADOR` no hereda los roles `ATENCION` ni `INVENTARIO`; así que añade roles operativos a la cuenta solo si esa persona también va a ejecutar esas funciones.
3. **Revisa Sucursales:** confirma que las dos sedes iniciales y sus horarios están correctos. No crees una segunda copia. Coordenadas y límite geográfico para domicilios GPS aún deben completarse con datos reales antes de probar asignación automática por ubicación.
4. **Revisa Catálogo:** comprueba categorías y productos iniciales. Si un producto realmente falta, créalo allí primero; los productos son globales y luego se asigna saldo por sede. No registres como producto nuevo algo que ya está cargado.
5. **Crea mesas:** en **Mesas y QR**, agrega las mesas físicas que quieras probar en cada sucursal. V2 no carga mesas.
6. **Registra existencias:** con un usuario `INVENTARIO`, selecciona la sucursal arriba del panel. En **Inventario → Existencia inicial**, elige un producto con cero saldo en esa sucursal, registra la cantidad real/de prueba y escribe el motivo. Repite por cada producto y cada sucursal que necesite stock. La existencia es por sucursal, no global.
7. **Prueba reposición (opcional):** registra algo de stock en la sede principal; desde inventario de la secundaria crea una solicitud; principal revisa y aprueba; principal registra despacho; secundaria registra cantidades recibidas aptas/dañadas. El despacho y la recepción actualizan inventario con trazabilidad.
8. **Prueba pedido de recogida primero:** desde el sitio, arma una bolsa con productos que tengan stock suficiente en una sede. Envía la solicitud. En **Pedidos**, un usuario `ATENCION` acepta; confirma que se descuenten las unidades. Después actualiza preparación/listo/completado siguiendo las transiciones permitidas.
9. **Prueba pago:** empieza por efectivo para evitar depender de almacenamiento de comprobantes. Desde **Pagos**, crea el intento y confírmalo manualmente. Transferencia requiere comprobante; en Render Free los archivos locales no son persistentes, por eso no debe tratarse como almacenamiento de archivo permanente.
10. **Prueba QR de mesa:** desde **Mesas y QR**, Atención abre sesión y comparte el QR temporal; escanéalo desde otro teléfono o ventana. Envía un pedido, atiéndelo y revisa la cuenta agrupada. Cierra sesión QR y, luego, la cuenta por separado.
11. **Prueba domicilio y entrega después:** prueba primero sin GPS (dirección/barrio y asignación manual). Para GPS y asignación automática hacen falta coordenadas y cobertura configuradas. Atención asigna repartidor; el usuario `REPARTIDOR` actualiza solo sus entregas; Atención concilia efectivo si aplica.
12. **Consulta Reportes al final:** después de crear pedidos, pagos, movimientos, reposiciones y entregas, revisa los reportes para comprobar que reflejen esas operaciones.

Para pruebas, usa cantidades pequeñas identificadas como prueba y datos ficticios de clientes. No cargues datos personales reales ni tomes el sitio público como un entorno privado. Las operaciones quedan grabadas en la base seleccionada; no existe sincronización entre local y Render.

## 15. Estructura de archivos

```text
Amankay/
├── README.md                         # resumen y ejecución
├── AGENTS.md                         # reglas de trabajo/documentación del proyecto
├── render.yaml                       # recursos de demostración en Render
├── backend/
│   ├── pom.xml                        # dependencias y Java objetivo
│   ├── mvnw, .mvn/                    # Maven Wrapper
│   ├── Dockerfile                     # imagen del API para Render
│   ├── README.md                      # configuración, rutas y seguridad
│   └── src/main/java/.../modules/     # módulos del backend
│       └── domain/model, repository/  # entidades y acceso a datos
│   └── src/main/resources/            # YAML y db/migration/V1,V2
├── frontend/
│   ├── package.json, package-lock.json # scripts/dependencias
│   ├── next.config.mjs                # rewrites a la API
│   ├── eslint.config.mjs, tsconfig.json, postcss.config.mjs
│   ├── assets/originales/             # archivos originales
│   ├── public/                        # recursos servidos por Next
│   └── src/app, components, data, lib/ # rutas, interfaz, datos y utilidades
├── docs/
│   ├── 01-requisitos/SRS.md            # requisitos/alcance
│   ├── 02-modelado/MER.md, UML.md      # modelo y UML
│   ├── 02-modelado/modelo-fisico-postgresql.md
│   ├── 03-arquitectura/               # arquitectura, stack y decisiones
│   ├── 04-diseno-ui-ux/README.md       # diseño visual
│   ├── 05-desarrollo/README.md         # estado y verificaciones
│   └── 06-guia-de-estudio-del-proyecto.md
└── prisma/                             # no es el ORM activo
```

## 16. Ejecución local

En `frontend/`, instalar el árbol bloqueado con `npm ci`, iniciar con `npm run dev` y abrir `http://localhost:3000`. Los comandos registrados para revisión frontend son `npm run typecheck`, `npm run lint` y `npm run build`.

Para el backend se requiere JDK 25 y Maven Wrapper. Antes de iniciarlo localmente, sus variables PostgreSQL deben apuntar a un destino aprobado. El backend escucha localmente en `127.0.0.1:8081`. Consulta `backend/README.md` para comandos, bootstrap y variables. No pegues credenciales en el repositorio o en ejemplos.

## 17. Despliegue y estado de Render

El estado registrado el 23-11-2026 indica que Render creó `amankay-frontend`, `amankay-api` y `amankay-postgres` en plan Free. La web pública y la API figuran Live. El endpoint de salud respondió `UP` en API y a través del proxy Next.js; la API conectó con `amankay_render` y los logs confirmaron Flyway V1/V2 y JPA. El commit desplegado está registrado como `021bde7`.

La demostración está publicada, pero no equivale a producción de disponibilidad continua. El plan Free tiene límites de descanso/retorno del servicio, duración y capacidad de PostgreSQL, y no conserva archivos locales como almacenamiento privado persistente. El sistema de comprobantes requiere resolver almacenamiento persistente si se desea probar en serio la subida/consulta. No se autorizó plan pago.

El usuario informó que pudo entrar al panel remoto con su cuenta. Esto confirma el acceso inicial de esa cuenta en ese momento; no demuestra por sí solo persistencia tras recarga, cierre de sesión, autorización de todos los roles/sucursales ni recorrido completo de pedido/QR. Una cuenta local no aparece automáticamente en Render.

## 18. Qué está verificado y qué falta

El registro de la entrega local indica `npm run lint`, `npm run build`, 14 pruebas Java aprobadas con JDK 25 y V1/V2 ejecutadas en `amankay_test`. Para Render se registró compilación de Next.js, estado Live de ambos servicios web, respuesta de salud `UP`, conexión Java a PostgreSQL remota, migraciones Flyway y carga de 26 repositorios. El usuario observó V1 y V2 con éxito en `flyway_schema_history` y 27 tablas físicas en pgAdmin: las 26 tablas de aplicación aprobadas más la tabla técnica de metadatos de Flyway.

Esto demuestra disponibilidad básica e integración técnica inicial. También quedó confirmado por el usuario que pudo ingresar al panel. No demuestra todos los recorridos manuales con varios roles y teléfono. Pendiente: persistencia/cierre de sesión, permisos por rol y sucursal, pedido público completo, token QR válido/inválido/cerrado, creación y cobro de pedido de mesa, pagos/archivos, inventario real, reposiciones, entregas, reportes, coordenadas/cobertura y protocolo académico de usabilidad.

## 19. Preguntas para defensa

**¿Qué tipo de proyecto es?** Una aplicación web full stack con sitio público, panel operativo, API REST y base relacional PostgreSQL.

**¿Por qué monolito modular?** Permite desplegar una sola aplicación Spring Boot y organizar el código por dominios sin el costo y la complejidad de operar microservicios.

**¿Cómo se comunica la web con Java?** Mediante HTTP/JSON bajo `/api/v1`. Next.js hace un rewrite al origen del backend; Java valida y aplica las reglas.

**¿Por qué Java si el frontend usa TypeScript?** TypeScript gestiona interacción/presentación. Java es la autoridad para permisos, reglas transaccionales, pagos, stock y acceso a la base.

**¿Prisma administra la base?** No. Dependencias no usadas se retiraron; Spring Data JPA/Hibernate es el único ORM propietario de las tablas.

**¿Para qué Flyway?** Aplica SQL versionado (V1 esquema, V2 datos iniciales) de forma controlada. Hibernate no modifica el esquema automáticamente.

**¿Cómo se evita vender más unidades que las disponibles?** Java verifica el carrito completo, y aceptación/descuento se realizan en transacción con bloqueo de saldo; PostgreSQL aplica restricciones complementarias.

**¿WhatsApp está integrado?** No mediante API. El sistema guarda la solicitud, abre el canal externo y el personal confirma. Los mensajes recibidos directamente se registran manualmente.

**¿Por qué QR temporal?** El QR permanente identifica mesa pero no autentica. Atención inicia sesión; Java emite token temporal, que se invalida al cerrar. La cuenta mantiene su ciclo de cobro independientemente.

**¿Qué está publicado?** El registro de desarrollo informa frontend y API Live en Render y base `amankay_render` inicializada. Las pruebas de salud no sustituyen validación funcional completa.

**¿Por qué existen dos bases de prueba?** `amankay_test` es local; `amankay_render` pertenece a la demo remota. Separarlas evita que la demostración altere la base local de verificación.

## 20. Documentos dueños

- [SRS](01-requisitos/SRS.md): requisitos, alcance, actores y reglas.
- [MER](02-modelado/MER.md): entidades y relaciones.
- [Modelo físico](02-modelado/modelo-fisico-postgresql.md): tablas, claves y restricciones.
- [UML](02-modelado/UML.md): actores, casos de uso y clases.
- [Arquitectura](03-arquitectura/arquitectura-general.md): capas y responsabilidades.
- [Stack](03-arquitectura/stack-tecnologico.md): tecnología, versiones y costos.
- [Decisiones técnicas](03-arquitectura/decisiones-tecnicas.md): justificación y trazabilidad.
- [Pendientes](03-arquitectura/pendientes-y-decisiones.md): datos o decisiones abiertas.
- [Diseño UI/UX](04-diseno-ui-ux/README.md): dirección visual y pantallas.
- [Estado de desarrollo](05-desarrollo/README.md): despliegue y comprobaciones.
- [Backend](../backend/README.md): configuración y API.

Si se aprueba una nueva regla, se actualiza el documento dueño y se deja trazabilidad en `decisiones-tecnicas.md`. No se inventan datos operativos faltantes ni se copian datos personales del anteproyecto en material público.
