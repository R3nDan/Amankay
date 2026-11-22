# Plan de desarrollo de Amankay

## Estado y puerta de inicio

El usuario aprobó el MER lógico de 26 entidades y la arquitectura Java el 22-11-2026. La base Next.js y el sitio público están implementados: inicio, catálogo, Panadería/Fritos/Bebidas, sucursales, proceso del pan y bolsa local con cantidades, modalidad, datos básicos y solicitud por WhatsApp. Las dos sedes están habilitadas como opciones de recogida. El pedido aún no está persistido, no valida inventario ni genera seguimiento. PostgreSQL está instalado localmente según el usuario. El backend Java todavía no existe. Prisma permanece instalado, pero no administrará ni modificará las tablas.

La versión objetivo aprobada es JDK 25 LTS para compilación y ejecución, Spring Boot 4.2.0 y Springdoc 3.2.1. La matriz oficial de Springdoc confirma su compatibilidad con Boot 4.2.0. Aunque el equipo tiene JDK 27, el proyecto se configurará para JDK 25; Maven global no está disponible y se usará Maven Wrapper. Flyway usará también `flyway-database-postgresql`. Las dependencias administradas por el BOM de Spring Boot prevalecen sobre versiones fijadas manualmente, salvo justificación. Esta actualización es documental: no se instaló ni configuró nada.

## Secuencia propuesta

| Fase | Trabajo | Estado | Dependencias / salida |
|---|---|---|---|
| 0. Cierre de preparación | SRS, UML, arquitectura, UI/UX y MER. | **Completada** | MER aprobado el 22-11-2026; decisiones abiertas permanecen registradas por módulo. |
| 1. Entorno y base de proyecto | PostgreSQL local, Next.js App Router, TypeScript y Tailwind. | **Completada según avance reportado** | Codex debe verificar el estado real del repositorio y la conexión PostgreSQL. |
| 2. Sistema visual y sitio público | Inicio, catálogo, sucursales, tarjetas y experiencia responsive. | **Implementada como frontend** | Integrar datos persistentes cuando el backend esté listo. |
| 3. Navegación base | Estructura de navegación pública y rutas iniciales. | **Completada según avance reportado** | No rehacer; ajustar solo si la integración lo requiere. |
| 4. Persistencia inicial | Resolver trazabilidad y bloqueos físicos; implementar Flyway/JPA y conexión PostgreSQL local. | Pendiente de aprobación de los bloqueos | Conservar las 26 entidades aprobadas. No generar migración hasta cerrar los bloqueos documentados. |
| 5. Identidad y autorización | Sesión de personal, roles/sucursales y vistas protegidas. | Pendiente | Definir mecanismo concreto de autenticación; no confundirlo con sesión QR. |
| 6. Catálogo y administración básica | Productos, categorías, precios, sucursales y horarios persistidos. | Pendiente | Persistencia y autorización. |
| 7. Pedidos y pagos | Pedidos externos/QR, aceptación, inventario transaccional, intentos y comprobantes. | Pendiente | Persistencia, autorización y decisiones de pago pendientes. |
| 8. Mesas y QR | Sesión temporal, pedidos QR y cuenta. | Pendiente | Identidad del personal; duración técnica del token pendiente. |
| 9. Inventario y reposiciones | Stock, movimientos, solicitudes, despachos y recepciones. | Pendiente | Resolver origen de movimientos y operaciones transaccionales. |
| 10. Entregas | Asignación, estados, incidencias y conciliación de recaudo. | Pendiente | Pedidos a domicilio, usuarios y pagos. |
| 11. Reportes e integración | Reportes aprobados, auditoría y recorridos completos. | Pendiente | Datos persistidos y criterios de aceptación aprobados. |

## Dependencias y trabajo paralelo

- Sistema visual, shell público y shell del panel pueden prepararse en paralelo con prototipos, una vez aprobada la dirección UI/UX.
- Catálogo y navegación no necesitan autenticación; paneles con datos reales sí dependen de identidad y autorización.
- Pedidos y pagos dependen del catálogo y persistencia. QR comparte catálogo y lógica de pedido, pero requiere sesión/cuenta.
- Reposición depende de inventario, sucursales, roles y restricciones de cantidades; implementar el flujo después de estabilizar la capa transaccional.
- Entregas depende de pedido domicilio y asignación de usuario/repartidor.
- Reportes dependen de los módulos que producen los datos y deben limitarse a los reportes del SRS.

## Estrategia de entrega

Construir rebanadas verticales funcionales: interfaz, validación, caso de uso y persistencia para una tarea completa, con datos de demostración controlados. Priorizar sitio público/catálogo, pedido completo y operación mínima del personal antes de módulos menos centrales. Mantener integraciones externas no esenciales fuera del MVP y ejecución local sin costo obligatorio.

## Verificación de cada fase

Al iniciar desarrollo, definir criterios de aceptación concretos por flujo según SRS. Revisar accesibilidad de teclado/contraste, móvil, manejo de estados de carga/vacío/error/éxito y consistencia en servidor. No considerar terminado un módulo solo por renderizar su interfaz; los flujos críticos necesitan persistencia y autorización verificables.

El MER lógico está aprobado y el proyecto raíz contiene el frontend Next.js. El estado verificado de Java es JDK 27; Maven global no está disponible. La configuración objetivo exige JDK 25 y Maven Wrapper al crear el backend. Prisma está instalado, pero no se utilizará para la persistencia. PostgreSQL local está instalado según el usuario; la autenticación y conexión de aplicación aún no se han confirmado. La trazabilidad de MovimientoInventario, nulabilidad, estados, unicidades y tipos físicos siguen como bloqueos documentales previos a la migración. No se ha creado el backend ni una migración.
