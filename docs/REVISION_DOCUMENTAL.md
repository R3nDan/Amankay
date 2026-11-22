# Estado documental y técnico de Amankay

**Actualizado el 22-11-2026 después de aprobar las decisiones funcionales finales y preparar la base física/backend inicial.** Este índice identifica el dueño de cada decisión y distingue lo implementado de lo que aún no se ha verificado.

## Documentos fuente

- Requisitos: `01-requisitos/SRS.md`.
- Entidades, atributos y cardinalidades: `02-modelado/MER.md`.
- Diseño físico PostgreSQL y nulabilidad: `02-modelado/modelo-fisico-postgresql.md`.
- Actores/casos de uso/clases: `02-modelado/UML.md`.
- Stack y arquitectura: `03-arquitectura/stack-tecnologico.md` y `arquitectura-general.md`.
- Procedencia de decisiones: `03-arquitectura/decisiones-tecnicas.md`.
- Estado de los pendientes: `03-arquitectura/pendientes-y-decisiones.md`.
- Plan de desarrollo y verificaciones: `05-desarrollo/README.md`.
- Configuración y uso del backend: `../backend/README.md`.

## Dirección vigente aprobada

Frontend Next.js/React/TypeScript; backend Java 25, Spring Boot 4.2.0, Springdoc 3.2.1, Spring Security, Spring Data JPA/Hibernate como único ORM, PostgreSQL, Flyway con `flyway-database-postgresql`, Maven Wrapper y API REST `/api/v1`. Prisma permanece en el frontend y no administra las tablas. Temurin JDK 25.0.5.1 está instalado y configurado en `JAVA_HOME`; JDK 27 permanece en el equipo, pero el proyecto se verifica con JDK 25. No hay Maven global.

El MER conserva 24 entidades de dominio y 2 asociativas: 26 entidades/tablas. No se agregaron entidades al modelo físico.

## Decisiones funcionales incorporadas

- Pedido web guardado desde Java antes de abrir WhatsApp; confirmación manual y vencimiento de 30 minutos; no se integra la API WhatsApp.
- El personal puede registrar manualmente pedidos recibidos por WhatsApp en la cola común; no aplica vencimiento de pedido web.
- Intentos de pago por el saldo completo, sin parcialidad ni sobrepago; reembolsos exclusivamente totales.
- Atención autorizada resuelve cancelaciones antes de preparación. El repartidor gestiona solo sus asignaciones; operaciones decide reintentos y resolución.
- Inventario autorizado registra altas iniciales, ajustes y mermas con motivo obligatorio.
- Movimiento de inventario trazable con `tipoOrigen` + `idOrigen`; originales inmutables y máximo una compensación total con FK autorreferenciada, sin cadenas.
- QR temporal de ocho horas configurable, cierre manual inmediato, cuenta independiente y sondeo REST.
- GPS para domicilios es opcional/consentido, se conserva para la entrega y aparece solo en vista protegida; sin GPS, dirección y barrio habilitan asignación manual. Una sola sucursal atiende el carrito completo; si no puede, no se acepta. Falta configurar coordenadas reales y un límite geográfico de Neiva para validar cobertura automáticamente.
- Devoluciones formales e inspección por entrega fallida quedan aplazadas; retornos físicos no ingresan automáticamente al stock.

Las versiones iniciales de Boot 3.5/Springdoc 2, la propuesta de Prisma como backend, y la inspección obligatoria de devoluciones se conservan solo como historia donde corresponda. La última decisión explícita prevalece.

## Implementación y verificación

El directorio `backend/` tiene modelo JPA de 26 entidades, migraciones SQL V1/V2 y módulos REST de personal/seguridad, catálogo, pedidos, QR/mesas/cuentas, pagos, inventario, reposiciones, entregas y reportes. Flyway continúa deshabilitado por defecto. Hibernate no genera esquema. No se conocen los parámetros finales de PostgreSQL y no se ejecutaron migraciones ni DDL/DML.

Maven Wrapper resolvió dependencias; `validate`, `test` (14 pruebas aprobadas) y `package` se ejecutaron con Temurin JDK 25.0.5.1. No se inició el contexto completo que inicializa JPA, no hubo conexión PostgreSQL y no se probaron V1/V2 en una base real. El frontend todavía no consume la API. Ver `05-desarrollo/README.md` para estado detallado.

## Pendientes reales

1. Instalar/seleccionar JDK 25 y repetir la verificación con esa versión.
2. Elegir expresamente una base/esquema PostgreSQL de prueba; configurar variables de entorno sin versionar secretos.
3. Revisar V1/V2 y autorizar su ejecución solamente contra ese destino aislado.
4. Ejecutar integración con PostgreSQL, comprobar mapeos JPA, constraints, transacciones, seguridad y OpenAPI.
5. Configurar comprobantes privados, coordenadas/límite de cobertura y saldos reales cuando existan los datos operativos.
6. Integrar Next.js, construir panel y experiencia QR, y probar sus flujos con la API.
7. Completar el protocolo académico de usabilidad (P-18); no bloquea la implementación técnica.

Los nombres de base, esquema, contraseñas, coordenadas reales y existencias iniciales no se suponen ni aparecen en ejemplos. Las decisiones funcionales anteriores no se reabren.
