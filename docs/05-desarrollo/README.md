# Plan y estado de desarrollo de Amankay

## Actualización del 22-11-2026: panel administrativo progresivo

El panel administrativo ahora integra Next.js con la API Java para pedidos y su cola cronológica, dashboard por rol, inventario, reposiciones, entregas, pagos, conciliaciones de efectivo, catálogo, usuarios, sucursales/configuración y reportes. La experiencia de mesas y QR temporal también está conectada. Se conserva el MER de 26 entidades y las migraciones V1/V2 ya aplicadas a `amankay_test` en la validación anterior.

Verificación local de esta entrega: `npm run lint`, `npm run build`, `backend\\mvnw.cmd -q test` con Temurin JDK 25 y `git diff --check` finalizaron correctamente. Los tests Java incluyen cobertura de la actualización de roles y desactivación sobre sesiones abiertas, además de los reportes de ventas. No se arrancó el backend ni se consultó PostgreSQL en esta ronda. Las pruebas manuales de login, persistencia, apertura/escaneo QR y uso real de pedidos con personal y teléfono siguen pendientes.

La integración pública de pedidos continúa pendiente. Reportes cubre ventas completadas, historial/estados, inventario actual y movimientos, y reposiciones; no incluye productos más vendidos, excluido del MVP.

## Actualización del 22-11-2026: integración frontend

Se autorizó y ejecutó Flyway V1/V2 únicamente en `amankay_test`; Spring Boot, JPA/Hibernate y diez flujos REST principales iniciaron y respondieron con PostgreSQL real. La suite Java existente aprobó 14 pruebas. El conteo SQL directo de todas las restricciones y los flujos de vencimiento y comprobantes HTTP siguen pendientes de verificación. Flyway permanece deshabilitado por defecto y no se conservaron credenciales en Git.

Se inició el panel administrativo de Next.js con rutas directas `/admin`, `/admin/login` y `/admin/mesas`, identidad visual heredada del sitio público y autenticación por sesión y CSRF del backend Java. El backend expone roles y sucursales asignadas en `/api/v1/auth/me` y una consulta operativa de mesas/sesiones restringida a Atención por sucursal. El usuario aprobó que Java genere un QR temporal al abrir la sesión para que el personal lo muestre al cliente; la ruta `/mesa/[codigoMesa]` valida el token y permite catálogo, carrito, pedido y sondeo de estados. El identificador permanente no autoriza el acceso. La verificación en ejecución de estas incorporaciones requiere reiniciar el backend con la configuración segura de PostgreSQL.

Las notas de estado anteriores a esta actualización se conservan abajo como historial y no describen el estado vigente de PostgreSQL ni de la integración inicial.

## Estado actual

Análisis y diseño concluidos; el MER lógico de 24 entidades de dominio y 2 asociativas está aprobado. El sitio público Next.js está implementado. Se autorizó e implementó una primera entrega integral del backend Java y el esquema físico en `backend/` y `docs/02-modelado/modelo-fisico-postgresql.md`.

El backend contiene 26 entidades JPA, migraciones SQL Flyway V1/V2 y módulos iniciales para seguridad, usuarios, catálogo/sucursales, pedidos, mesas/QR/cuentas, pagos, inventario, reposiciones, entregas y reportes. El frontend todavía no está integrado con esta API. PostgreSQL no se ha conectado ni modificado; las migraciones se prepararon pero permanecen sin ejecutar.

Stack: Java 25 objetivo, Spring Boot 4.2.0, Springdoc 3.2.1, Spring Data JPA/Hibernate, PostgreSQL, Flyway, Spring Security y Maven Wrapper. Temurin JDK 25.0.5.1 está instalado y configurado en `JAVA_HOME`; JDK 27 permanece instalado, pero no se usa para el proyecto. No hay Maven global. Prisma sigue instalado y no participa en persistencia.

## Decisiones funcionales ya cerradas

- Pedido web persistido antes de abrir WhatsApp; confirmación manual en 30 minutos; sin API WhatsApp ni reserva de inventario al crear.
- Atención registra manualmente los pedidos recibidos por WhatsApp mediante una ruta protegida; solo pedidos web vencen a los 30 minutos.
- Pagos completos por intento, con reintentos conservados, sin sobrepago y reembolso total solamente.
- Atención autorizada decide cancelaciones antes de preparación. Operaciones autoriza reintentos/resolución de entregas fallidas; el repartidor solo reporta las propias.
- Ajustes, existencias iniciales y mermas de inventario requieren personal autorizado y motivo.
- `MovimientoInventario` usa `tipoOrigen`/`idOrigen`, movimientos originales inmutables y una compensación total máxima mediante FK autorreferenciada, sin cadenas.
- Sesión QR con TTL configurable de ocho horas; cierre manual inmediato, cuenta independiente y sondeo REST.
- Domicilios con GPS voluntario y persistido con consentimiento para la entrega; sin GPS se exige dirección/barrio y se asigna manualmente. Una sola sucursal debe completar el pedido entero. Falta el límite geográfico de Neiva y geocodificación real para validar cobertura GPS.
- La gestión formal de devoluciones e inspecciones está fuera del MVP; productos retornados no se reincorporan automáticamente.

## Próximos pasos

| Orden | Trabajo | Estado / condición |
|---|---|---|
| 1 | Definir una base o esquema PostgreSQL local de prueba; aportar variables desde el entorno seguro. | Nombre/esquema/credenciales no confirmados; no conectar hasta esa definición. |
| 2 | Revisar V1/V2 y autorizar su ejecución solo contra el destino aislado. | Flyway está deshabilitado; no se ejecutó DDL/DML. |
| 3 | Ejecutar integración con PostgreSQL: migraciones, JPA, restricciones y transacciones. | Pendiente de los pasos 1–2. |
| 4 | Completar datos reales de catálogo, coordenadas/límite de cobertura de sucursales y existencias iniciales. | No inventar recetas, coordenadas, cobertura ni saldos. |
| 5 | Integrar Next.js con REST, construir panel administrativo y experiencia QR, manteniendo Java como fuente de reglas. | Frontend aún usa sus datos/flujo local. |
| 6 | Verificar seguridad, accesibilidad, pruebas de extremo a extremo, reportes y OpenAPI desde un arranque autorizado. | En espera de configuración integrada. |
| 7 | Definir protocolo académico de usabilidad con tareas, muestra y criterios medibles. | Pendiente en P-18; no bloquea construcción técnica. |

## Comprobaciones registradas

Las verificaciones separan los siguientes resultados:

- **Dependencias y Maven:** resolución y `mvnw validate` aprobados mediante Maven Wrapper con Temurin JDK 25.0.5.1. Maven informó respuestas 401 al consultar metadatos de dos feeds privados opcionales; las dependencias necesarias se resolvieron y los objetivos finalizaron correctamente.
- **Compilación y empaquetado:** `mvnw package` aprobó la compilación con `--release 25` y generó el JAR usando JDK 25.0.5.1.
- **Pruebas automatizadas:** `mvnw test` aprobó 14 pruebas (0 fallos, 0 errores), sin conexión a PostgreSQL. `HealthControllerTest` usa `@WebMvcTest`; no inicializa JPA ni demuestra el arranque integral.
- **Modelo físico estático:** 26 entidades JPA corresponden a 26 `CREATE TABLE` de V1; no hubo diferencias de nombres. La inspección no encontró instrucciones `DROP`, `TRUNCATE`, `DELETE FROM` ni `CREATE EXTENSION` en las migraciones.
- **Inicio completo de Spring/JPA:** no ejecutado; falta un destino PostgreSQL identificado y configurado.
- **Flyway:** dependencias y propiedades revisadas; permanece deshabilitado. V1/V2 no se ejecutaron.
- **Conexión a PostgreSQL, DDL/DML y migraciones:** no realizadas. Las variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME` y `DB_PASSWORD` no estaban definidas en el entorno de esta comprobación.
- **Integración Next.js/API:** no realizada.

No se declarará una funcionalidad de extremo a extremo hasta probar su flujo con un PostgreSQL de prueba autorizado.
