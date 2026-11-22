# Plan de desarrollo de Amankay

## Estado y puerta de inicio

El usuario autorizó iniciar la primera entrega visual. La base Next.js y el sitio público ya están implementados: inicio, catálogo, Panadería/Fritos/Bebidas, acceso a sucursales, tarjeta de fotos del proceso con transición temporizada y video del pan en bucle sin controles. Las fotografías de panadería recibidas se integran como recursos optimizados. Precios, disponibilidad, fotografías de las otras categorías y datos de sucursales siguen pendientes. No se ha conectado persistencia ni implementado reglas operativas.

## Secuencia propuesta

| Fase | Trabajo | Dependencias / salida |
|---|---|---|
| 0. Cierre de preparación | Aprobación de MER; validar pendientes funcionales que bloqueen rutas/estados; confirmar autenticación, archivos y responsables de operación. | Requisitos/modelos consolidados. No requiere código. |
| 1. Arquitectura y base de proyecto | Elegir versiones compatibles; crear Next.js App Router con TypeScript/Tailwind; configurar lint/format, variables locales y scripts; definir layout y gestión de errores. | Aprobación de arquitectura y autorización para iniciar implementación. |
| 2. Sistema visual y cimientos UI | Tokens, tipografía, botones, campos, tarjetas, diálogo, badges, navegación y patrones de carga/vacío/error/éxito. | Diseño UI/UX; se puede avanzar en paralelo a preparar modelos visuales sin base conectada. |
| 3. Sitio público y catálogo | Inicio, menú, sucursales, navegación responsive y componentes de producto; conectar datos de catálogo cuando persistencia esté lista. | Componentes visuales; categorías/productos. |
| 4. Identidad y autorización | Sesión de usuario, roles/sucursales en servidor y layouts protegidos; controles de acceso por módulo. | Modelo de usuarios/roles y decisión del mecanismo de autenticación. Bloquea panel operativo real. |
| 5. Pedidos públicos | Carrito, recogida/domicilio, validaciones, creación y seguimiento con código seguro. | Catálogo, persistencia, reglas de selección/sucursal y pagos del SRS. |
| 6. Operación de pedidos y pagos | Cola, detalle, aceptar/rechazar/preparar, intents de pago, comprobante, verificación y reembolso total. | Autorización, modelo pedido/pago e inventario transaccional. |
| 7. Mesas y QR | Apertura conjunta de sesión/cuenta, token temporal, pedidos QR, cierre independiente y bloqueo por cuenta abierta. | Pedidos, cuenta/pago, autenticación del trabajador y reglas de sesión. Puede avanzar con UI paralela a catálogo público. |
| 8. Inventario y reposiciones | Existencias/movimientos; solicitud, revisión, despachos, recepciones parciales, cierres/reversas por línea y anulaciones seguras. | Persistencia, roles por sucursal y reglas aprobadas del MER; transacciones antes de usar datos reales. |
| 9. Entregas | Asignación de repartidor, cambios de estado, incidencia, recaudo/conciliación. | Pedidos domicilio, usuarios y pagos. |
| 10. Administración y reportes | Productos/categorías, horarios/sucursales/configuración, usuarios y reportes/auditoría del MVP. | Autorización y datos operativos de los módulos relacionados. |
| 11. Integración y verificación | Recorridos completos, límites de permisos, concurrencia de inventario/pagos, errores, responsive y accesibilidad. | Funcionalidades integradas; criterios de aceptación SRS. |

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

La aplicación Next.js está creada. Prisma, migraciones y base de datos permanecen fuera de esta entrega visual.
