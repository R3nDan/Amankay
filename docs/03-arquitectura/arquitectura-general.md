# Arquitectura general de Amankay

## Estado

Arquitectura aprobada para el MVP el 22-11-2026 y stack actualizado por decisión posterior del mismo día. La aplicación pública y la navegación base están implementadas. El backend Java y la persistencia de la aplicación todavía no están creados. Java 25 LTS es la versión objetivo de compilación y ejecución, aunque el equipo tenga JDK 27; se usará Maven Wrapper y no Maven global. Prisma permanece instalado, pero no administrará ni modificará las tablas de PostgreSQL.

## Producto

Amankay será una sola aplicación web integral para operar un negocio de comidas con varias sucursales. Incluirá tres experiencias dentro del mismo sistema:

1. **Sitio público:** presentación, catálogo, sucursales, carrito, pedidos para recoger o domicilio y seguimiento.
2. **Interfaz QR:** experiencia móvil que usa la mesa y su sesión activa para consultar catálogo, pedir y consultar estados.
3. **Panel administrativo y operativo:** pedidos, mesas/cuentas, pagos, inventario/reposiciones, entregas y administración.

No es solo un sitio informativo ni una aplicación móvil nativa. No se automatiza WhatsApp; los pedidos recibidos por ese medio se registran desde el panel. El usuario confirmó Amankay como nombre comercial.

## Dirección tecnológica

| Capa | Tecnología | Uso previsto |
|---|---|---|
| Frontend | Next.js App Router, React, TypeScript | Sitio público, interfaz QR y panel web; consume la API Java. No contiene las reglas de negocio propietarias ni escritura directa en PostgreSQL. |
| Estilos y componentes | Tailwind CSS, shadcn/ui | Sistema responsive y componentes reutilizables. |
| Iconos y movimiento | Lucide React, Motion, GSAP | Iconografía, transiciones UI y secuencias puntuales. |
| Backend | Java 25 LTS, Spring Boot 4.2.0 | Monolito modular con API REST bajo /api/v1. |
| Seguridad | Spring Security | Autenticación del personal y autorización según roles y sucursales asignadas. Los clientes externos no requieren iniciar sesión. |
| Persistencia | PostgreSQL local, Spring Data JPA/Hibernate | Único ORM de la aplicación y responsable exclusivo de las escrituras. |
| Migraciones | Flyway + `flyway-database-postgresql` | Fuente versionada de cambios de esquema; el módulo PostgreSQL permite a Flyway operar con esta base. JPA valida el esquema, no lo genera. |
| Construcción | Maven Wrapper | El repositorio llevará su Wrapper; Maven global no está disponible en el equipo. |
| Documentación | JavaDocs, Springdoc/OpenAPI 3.2.1 y Swagger UI | JavaDocs para el código Java; Springdoc 3.2.1 es compatible con Boot 4.2.0 según su matriz oficial; OpenAPI documenta los endpoints REST. |
| Formularios/validación frontend | React Hook Form cuando aporte valor, Zod | Validación de interfaz complementaria a la validación autoritativa del backend. |

La combinación vigente es Java 25, Spring Boot 4.2.0 y Springdoc 3.2.1. Boot 4.2 admite Java 17–27 y Springdoc registra 3.2.1 para Boot 4.2.x. Java 25 se fija como versión de compilación y ejecución para obtener una configuración reproducible y alineada con la LTS aprobada. Spring Data JPA, Hibernate, Spring Security, Flyway y el driver PostgreSQL deben usar las versiones administradas por el BOM de Boot salvo excepción justificada. Flyway requiere incluir `flyway-database-postgresql` para esta base. Volver a verificar la matriz y los artefactos al iniciar el backend.

Three.js/React Three Fiber/Drei están instalados para escenas promocionales 3D concretas, con carga diferida y alternativa estática si el rendimiento se afecta. PixiJS queda disponible para visuales 2D interactivos. Se mantienen fuera de los paneles operativos y de flujos críticos. No añadir Express separado, microservicios, Redis, colas o infraestructura pagada para el MVP.

## Arquitectura lógica

Flujo aprobado:

Navegador → frontend Next.js → API REST Java/Spring Boot (/api/v1) → módulos de aplicación y dominio → repositorios Spring Data JPA/Hibernate → PostgreSQL local.

Flyway aplica migraciones versionadas y JPA valida el esquema. Next.js no escribe tablas ni ejecuta lógica de negocio como propietario alternativo. Prisma permanece instalado, pero no se emplea contra las tablas de la aplicación. Mantener un monolito modular; no separar servicios en red.

En desarrollo, el frontend Next.js y Spring Boot se ejecutan en puertos locales distintos. La opción preferida es enrutar /api/v1 al backend mediante un proxy de mismo origen; si el navegador llama directamente al backend, limitar CORS a los orígenes explícitos del entorno. La demostración local no requiere infraestructura pagada.

### Módulos funcionales

- `catalogo`: productos, categorías y disponibilidad visible.
- `sucursales`: información, horarios y configuración de domicilio.
- `pedidos`: carrito, recepción, validación, preparación, cancelación y seguimiento.
- `mesas`: sesión QR, pedidos asociados y cuenta.
- `pagos`: intentos, comprobante (máximo uno por intento), verificación y reembolso manual total.
- `inventario`: existencias y movimientos.
- `reposiciones`: solicitudes, despachos, recepciones parciales, cierres y anulaciones aprobadas.
- `entregas`: asignación/estado del repartidor, recaudo y conciliación simple por entrega.
- `administracion`: usuarios, roles, sucursales y parámetros.
- `reportes-auditoria`: consultas aprobadas e historial administrativo.

Los módulos comparten la base de datos, pero acceden a otros procesos a través de servicios, no importando componentes de interfaz entre sí. Esta organización es una guía lógica, no implica crear un paquete independiente para cada módulo desde el inicio.

## Estructura de carpetas propuesta para el futuro

Estructura propuesta, aún no creada:

- El proyecto raíz conserva el frontend Next.js y sus carpetas actuales src/app, src/components, src/data y src/lib.
- backend/ contendrá pom.xml, Maven Wrapper, src/main/java con la aplicación y paquetes modulares de configuración, seguridad, catálogo, sucursales, pedidos, pagos, inventario, reposiciones, entregas, mesas, reportes y auditoría.
- backend/src/main/resources contendrá la configuración de aplicación y db/migration con scripts Flyway.
- backend/src/test contendrá pruebas Java y de integración del backend.

La distribución interna de clases y módulos se refinará al crear el backend; esta guía no crea carpetas ni implica que todos deban implementarse en una sola entrega.

## Rutas

| Ruta | Propósito | Acceso |
|---|---|---|
| `/` | Inicio y presentación | Público |
| `/menu` | Catálogo, productos y categorías | Público |
| `/menu/[categoria]` | Vista de Panadería, Fritos o Bebidas (`panaderia`, `fritos`, `bebidas`) | Público |
| `/sucursales` | Ubicaciones e información | Público |
| `/pedido` | Carrito y selección/configuración de pedido | Público |
| `/seguimiento/[codigo]` | Estado del pedido con datos mínimos | Público con código no adivinable |
| `/mesa/[token]` | Catálogo y pedidos de una sesión QR activa | Token válido |
| `/admin` | Resumen operativo | Usuario autenticado y autorizado |
| `/admin/pedidos` | Atención, aceptación, preparación y estado | Rol/sucursal |
| `/admin/mesas` | Sesiones y cuentas | Rol/sucursal |
| `/admin/pagos` | Intentos, comprobantes y verificación | Rol/sucursal |
| `/admin/inventario` | Existencias y movimientos | Rol/sucursal |
| `/admin/reposiciones` | Solicitudes, despachos, recepciones y cierres | Rol/sucursal de operación |
| `/admin/entregas` | Asignaciones, estados y recaudo | Rol/sucursal; repartidor limitado a asignaciones propias |
| `/admin/productos` | Productos y categorías | Rol autorizado |
| `/admin/usuarios` | Usuarios y asociaciones | Administrador |
| `/admin/reportes` | Reportes del alcance aprobado | Rol autorizado |
| `/admin/configuracion` | Sucursales, horarios y configuración | Administrador |

Los submódulos son rutas o vistas dentro de esta aplicación, no aplicaciones independientes. Las rutas exactas pueden consolidarse al elaborar navegación UI/UX; no agregar páginas para capacidades futuras.

## Autenticación, autorización y sucursales

- El servidor verifica identidad en cada operación protegida. La sesión de mesa por token QR no equivale a una cuenta de usuario.
- Autorización por rol y sucursal usando las asociaciones del dominio `UsuarioRol` y `UsuarioSucursal`; no hay permisos configurables por individuo.
- El administrador no hereda permisos operativos automáticamente. Una persona puede realizar y autorizar una operación ordinaria según su rol/sucursal; las anulaciones excepcionales pasan por administrador.
- El repartidor solo accede a entregas asignadas. La sucursal solicitante/proveedora determina el contexto de las operaciones de reposición.
- No se confía en `role`, sucursal, precio, saldo, inventario o estado enviado desde el navegador; el servidor vuelve a obtenerlos/verificarlos.

La tecnología concreta de autenticación se decidirá al preparar el proyecto según el stack seleccionado y las necesidades locales. Evitar diseñar un sistema de permisos genérico.

## Validación, errores y consistencia

- Validar entradas en servidor con esquemas Zod; validación del navegador mejora UX, pero no sustituye seguridad.
- Respuestas de error deben ser comprensibles y no filtrar stack traces, datos de pago o información personal.
- Errores esperados (validación, conflicto de estado, falta de autorización) se distinguen de fallos inesperados y se registran sin datos sensibles.
- Usar transacciones para aceptar pedidos y descontar stock, registrar recepción y actualizar inventario, cambios de estado concurrentes y operaciones de pago que requieran consistencia.
- Revalidar el saldo bajo concurrencia; nunca permitir existencias negativas.
- Eventos de despacho/recepción originales se conservan. La anulación documental no aplica automáticamente movimientos compensatorios; movimientos pendientes no cambian existencia disponible. Si el producto fue consumido, revisión administrativa.

## Archivos y datos sensibles

Comprobantes: máximo un archivo por intento de pago. Mantener acceso privado y guardar en la base metadatos/referencia, no el contenido binario grande si la solución local elegida permite guardarlo en almacenamiento privado. El mecanismo local concreto (directorio protegido u opción equivalente) se definirá antes de implementarlo; no exponer rutas de archivos ni servirlos públicamente. Si el comprobante se rechaza definitivamente, aplicar la decisión del SRS sobre eliminación del archivo y conservar trazabilidad del intento.

Minimizar datos personales expuestos en seguimiento, logs y reportes. Credenciales nunca se almacenan en texto plano. Secrets/configuración se mantienen fuera del repositorio.

## Ejecución local

Desarrollar y demostrar localmente con Node.js, Next.js y PostgreSQL local, sin servicios obligatorios de pago. La interfaz web puede abrirse desde otro equipo en la misma red local si se configura de forma segura. No decidir todavía el despliegue público ni prometer niveles gratuitos de terceros.

## Decisiones abiertas de arquitectura

- Mecanismo concreto de autenticación y manejo de sesión web.
- Ubicación local privada de comprobantes y política de respaldo/eliminación.
- Compatibilidad de dependencias externas que no gestione el BOM de Spring Boot y de bibliotecas opcionales al crear el backend.
- Necesidad de notificaciones casi en tiempo real; la primera versión puede usar actualización explícita o refresco razonable si satisface el SRS.

No bloquean el diseño de alto nivel ni justifican añadir infraestructura. Resolver antes del módulo correspondiente.
