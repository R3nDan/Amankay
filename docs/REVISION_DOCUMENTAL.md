# Revisión documental para implementación

**Revisión de la carpeta `docs/` recibida el 22-11-2026.** Este documento orienta la lectura del conjunto; no sustituye al SRS, UML ni MER y no autoriza a modificar decisiones aprobadas.

## Fuentes de verdad por tema

- Requisitos y reglas funcionales: `01-requisitos/SRS.md`.
- Entidades, atributos conceptuales, relaciones y restricciones: `02-modelado/MER.md`.
- Actores, casos de uso y representación conceptual: `02-modelado/UML.md`.
- Arquitectura y decisiones técnicas: `03-arquitectura/arquitectura-general.md` y `stack-tecnologico.md`.
- Decisiones, procedencia y conciliación histórica: `03-arquitectura/decisiones-tecnicas.md`.
- Lista operativa de pendientes: `03-arquitectura/pendientes-y-decisiones.md`.
- Criterios observables propuestos: `05-desarrollo/criterios-aceptacion.md`.

Si dos documentos parecen discrepar, no escoger una versión silenciosamente: aplicar la decisión posterior explícita registrada en `decisiones-tecnicas.md` y documentar la corrección en el archivo dueño.

## Estado confirmado

- El usuario aprobó el MER lógico el 22-11-2026: 24 entidades de dominio y 2 asociativas (`UsuarioRol`, `UsuarioSucursal`), total 26.
- El usuario autorizó avanzar a la fase de implementación y aprobó la arquitectura Java en la solicitud del 22-11-2026. Esta actualización solo autoriza cambios documentales; crear código o modificar la base de datos requiere una autorización posterior. No se debe volver a solicitar aprobación del MER ni rediseñar entidades/cardinalidades.
- Arquitectura aprobada y actualizada el 22-11-2026: Next.js/React/TypeScript como frontend; backend Java 25 con Spring Boot 4.2.0; API REST /api/v1; PostgreSQL local; Spring Data JPA/Hibernate como único ORM; Flyway con `flyway-database-postgresql`; Maven Wrapper; Spring Security; JavaDocs y Springdoc/OpenAPI 3.2.1 con Swagger UI. Prisma permanece instalado, pero no escribirá ni administrará las tablas de PostgreSQL.
- La matriz oficial de Springdoc confirma la compatibilidad de Springdoc 3.2.1 con Spring Boot 4.2.0. Java 25 es la versión objetivo de compilación y ejecución aunque el equipo tenga JDK 27. Maven global no está disponible; se usará Maven Wrapper. Las versiones administradas por el BOM de Boot prevalecen salvo excepción justificada.
- La decisión inicial del mismo día por Boot 3.5.16/Springdoc 2.10.1 fue sustituida posteriormente por Boot 4.2.0/Springdoc 3.2.1; se conserva en `decisiones-tecnicas.md` únicamente como historial.
- Las devoluciones formales de entregas fallidas están fuera del MVP. Los productos que regresen físicamente no se incorporan automáticamente al stock disponible.
- PostgreSQL local, la aplicación Next.js, la página principal y la navegación base constan como completados según el avance reportado por el usuario. Codex debe diagnosticar el repositorio antes de actuar.
- La tarifa inicial configurable de domicilio es 2.000 COP y la cobertura del prototipo es Neiva.
- La asignación de sede para domicilio considera disponibilidad del pedido completo y proximidad; no se divide el carrito.
- Los intentos de pago son registros separados; máximo un comprobante por intento; el reembolso manual es exclusivamente total.
- Las reposiciones admiten múltiples despachos y recepciones parciales; las correcciones conservan originales y se hacen por anulación completa más evento nuevo cuando sea seguro.
- La sesión QR y la cuenta de mesa se crean juntas y se cierran independientemente.

## Bloqueos que deben resolverse antes de la migración inicial

1. **Nulabilidad:** cerrar el significado físico de cada atributo opcional/provisional (`?`) del MER. Codex no debe decidirlo por conveniencia.
2. **Origen de `MovimientoInventario`:** mantener pendiente el diseño de trazabilidad y su aprobación. Evaluar registros de origen específicos y compensaciones sin agregar relaciones, atributos o cardinalidades al MER por cuenta propia; no duplicar FKs de producto/sucursal ni usar referencias polimórficas como solución sin aprobación.
3. **Estados de `Pedido` y `Pago`:** consolidar valores y transiciones antes de crear enums físicos.
4. **Unicidades pendientes:** definir unicidad de identificadores/QR de mesa, nombres de categorías/productos y la estrategia de configuración de domicilio.
5. **Tipos físicos:** acordar precisión monetaria, longitudes, defaults y política de borrado/desactivación.

Los detalles de rol para cancelaciones, resolución de incidencias, parcialidad de cada intento de pago, duración del token QR y almacenamiento de comprobantes pueden resolverse antes de implementar sus módulos, siempre que no se introduzcan columnas/enums que los presupongan en la migración inicial.

## Instrucción de trabajo para Codex

La dirección Java/Spring está aprobada, pero la creación de código y los cambios de base requieren la autorización correspondiente. No generar ni ejecutar una migración inicial hasta que los cinco bloqueos de esquema anteriores estén resueltos y reflejados en `MER.md`. No inventar entidades, estados, atributos, nulabilidad, relaciones ni reglas de negocio. Prisma no es el ORM del backend ni debe escribir en las tablas de la aplicación.
