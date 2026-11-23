# Estado documental y técnico de Amankay

**Actualizado el 23-11-2026.** Resume qué documentos rigen el proyecto, cuál es el estado de implementación y qué validaciones siguen pendientes. Para estudiar el sistema completo, consultar también la [guía de estudio](06-guia-de-estudio-del-proyecto.md).

## Documentos dueños

- Requisitos y alcance: `01-requisitos/SRS.md`.
- Entidades y relaciones: `02-modelado/MER.md`.
- Esquema físico PostgreSQL: `02-modelado/modelo-fisico-postgresql.md`.
- Actores y casos de uso UML: `02-modelado/UML.md`.
- Arquitectura: `03-arquitectura/arquitectura-general.md`.
- Tecnologías, versiones y costos: `03-arquitectura/stack-tecnologico.md`.
- Justificación y trazabilidad de decisiones: `03-arquitectura/decisiones-tecnicas.md`.
- Pendientes de datos y configuración: `03-arquitectura/pendientes-y-decisiones.md`.
- Dirección visual y pantallas: `04-diseno-ui-ux/README.md`.
- Estado y comprobaciones: `05-desarrollo/README.md`.
- Ejecución y configuración del API: `../backend/README.md`.
- Repaso integral para sustentación: `06-guia-de-estudio-del-proyecto.md`.

## Dirección técnica vigente

Frontend Next.js, React y TypeScript; backend Java 25 con Spring Boot 4.2.0, Spring Security, Spring Data JPA/Hibernate, API REST `/api/v1` y PostgreSQL. Es un monolito modular. Flyway versiona el esquema; Hibernate no genera tablas. Springdoc/OpenAPI documenta el API. Maven Wrapper evita depender de Maven global. El frontend consume la API y no contiene ORM ni driver de PostgreSQL. Las dependencias de Prisma y otros paquetes frontend sin uso fueron retiradas el 23-11-2026.

El MER aprobado conserva 24 entidades de dominio y dos asociativas: 26 entidades/tablas.

## Reglas funcionales vigentes

- Pedido web persistido en Java antes de abrir WhatsApp, con confirmación manual y vencimiento a los 30 minutos; no se integra la API de WhatsApp.
- Pedidos recibidos directamente por WhatsApp se registran manualmente en el panel y no heredan el vencimiento de las solicitudes web.
- Cada intento de pago cubre el saldo pendiente completo; no hay pagos parciales ni sobrepagos. Los reembolsos son totales y manuales.
- Cancelaciones antes de preparación requieren decisión de personal autorizado.
- Inventario controla productos terminados. Las altas iniciales, ajustes y mermas requieren autorización y motivo.
- Los movimientos originales de inventario son inmutables; se permite como máximo una compensación total por movimiento, sin cadenas.
- La sesión QR tiene expiración configurable de ocho horas; el cierre manual invalida el token y la cuenta permanece independiente.
- GPS para domicilio es voluntario y consentido. Una sola sucursal debe poder completar el pedido completo. Sin GPS, la dirección y el barrio requieren asignación manual.
- La cobertura aprobada es Neiva y la tarifa inicial es 2.000 COP; las coordenadas reales y el límite geográfico aún se deben configurar.
- Las devoluciones e inspecciones formales de entregas fallidas están fuera del MVP; retornos físicos no vuelven automáticamente al inventario.

## Implementación y verificación

El backend incluye 26 entidades JPA, scripts Flyway V1/V2 y módulos REST de seguridad, catálogo, pedidos, mesas/QR/cuentas, pagos, inventario, reposiciones, entregas y reportes. V1/V2 se aplicaron a `amankay_test` y a la base independiente `amankay_render`. La configuración local mantiene Flyway deshabilitado por defecto.

El sitio público, panel administrativo y experiencia QR Next.js consumen la API bajo `/api/v1`. El flujo público persiste la solicitud antes de abrir WhatsApp; la confirmación permanece manual. El estado detallado y las limitaciones de las verificaciones están en `05-desarrollo/README.md`; se registran lint/build del frontend y 14 pruebas Java aprobadas en la entrega anterior, junto con integración PostgreSQL comprobada en la base de prueba.

El frontend y la API están desplegados en Render; `amankay_render` es su base exclusiva y permanece separada de `amankay_test`. El endpoint de salud respondió `UP`, y los logs confirmaron Spring/JPA y Flyway V1/V2. La pantalla de acceso carga, pero el último intento reportado devolvió 403. La existencia y el estado de una cuenta administrativa en `amankay_render` deben confirmarse antes de la prueba completa de sesión y QR.

## Pendientes para la demostración

1. Completar las pruebas manuales del login administrativo, sesión, permisos y QR en Render.
2. Confirmar la cuenta administrativa disponible en la base remota y usar el bootstrap seguro solo si aún hace falta crearla.
3. Probar manualmente en navegador los flujos de pedidos, pagos, QR/cuentas, inventario, reposiciones, entregas, permisos y reportes.
4. Resolver almacenamiento privado persistente para comprobantes si se deben conservar durante la demo.
5. Cargar datos operativos reales autorizados: coordenadas/límite de cobertura y existencias iniciales.
6. Definir y ejecutar el protocolo académico de usabilidad (P-18).

No guardar credenciales, contraseñas, tokens ni otros secretos en Git, documentación o mensajes. No reproducir datos personales del anteproyecto en materiales públicos o de demostración.


