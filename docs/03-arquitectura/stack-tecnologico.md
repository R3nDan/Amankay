# Stack tecnológico

## Decisión de dirección técnica

Dirección aprobada para el MVP por el usuario el 22-11-2026.

| Capa | Tecnología | Estado |
| --- | --- | --- |
| Web | Next.js, React, TypeScript | Aceptado como dirección técnica |
| Estilos | Tailwind CSS | Aceptado |
| Componentes | shadcn/ui | seleccionado; verificar instalación en el repositorio y añadir componentes según necesidad. |
| Iconos | Lucide React | Propuesto/seleccionado |
| Animación | Motion + GSAP | Seleccionados para usos puntuales; verificar qué paquetes están instalados realmente antes de modificar dependencias. |
| Backend | Java con Spring Boot, monolito modular | Aprobado |
| API | Servicios web REST bajo /api/v1 | Aprobada |
| Base de datos | PostgreSQL; local para desarrollo y una instancia Render separada para la presentación pública | Aprobada como destino de demostración; nunca reutilizar `amankay_test` |
| Persistencia | Spring Data JPA/Hibernate; único ORM propietario de las tablas | Aprobada |
| Migraciones | Flyway, con `flyway-database-postgresql` para el motor PostgreSQL | Aprobado |
| Construcción | Maven Wrapper; no se requiere Maven global | Aprobada |
| Documentación API/código | Springdoc/OpenAPI con Swagger UI y JavaDocs | Aprobada |
| Seguridad | Spring Security | Aprobada |
| Prisma | Permanece instalado; no se utilizará para administrar ni modificar las tablas PostgreSQL | Aprobado |
| Validación frontend | Zod | Propuesto |

## Versiones objetivo aprobadas

Combinación aprobada por el usuario el 22-11-2026 y verificada en la documentación oficial consultada en esa fecha:

| Componente | Objetivo | Compatibilidad / condición |
| --- | --- | --- |
| Java | JDK 25 LTS | Versión objetivo tanto de compilación como de ejecución. Temurin 25.0.5.1 está instalado y configurado en `JAVA_HOME`; JDK 27 permanece instalado, pero no se usa para este proyecto. |
| Spring Boot | 4.2.0 | Versión aprobada; Java 25 está dentro del rango compatible oficial de Java 17 a 27. |
| Springdoc/OpenAPI | 3.2.1 | Compatible con Spring Boot 4.2.0 según la matriz oficial de Springdoc. |
| Persistencia | Spring Data JPA + Hibernate | Único ORM; usar las versiones administradas por el BOM de Spring Boot. |
| Migraciones | Flyway + `flyway-database-postgresql` | El módulo específico de PostgreSQL es necesario para que Flyway opere con esta base. Preferir las versiones administradas por el BOM de Spring Boot. |
| Driver de base de datos | PostgreSQL JDBC | Preferir la versión administrada por el BOM de Spring Boot. |
| Maven | Maven Wrapper | Se usará Wrapper; no hay Maven global. El proyecto se configurará con JDK 25. |

Spring Boot administra versiones compatibles de sus dependencias mediante el BOM. Esas versiones prevalecen sobre versiones fijadas manualmente; una excepción debe justificarse y verificarse. La compatibilidad Boot 4.2.0/Springdoc 3.2.1 está confirmada por la matriz de Springdoc. Volver a comprobar versiones y compatibilidad al iniciar la construcción, porque las versiones estables pueden cambiar.

## Dependencias opcionales

- React Hook Form para formularios.
- TanStack Table para tablas complejas.
- Recharts para gráficos de reportes.
- Sonner para notificaciones visuales.
- Three.js + React Three Fiber + Drei seleccionados para piezas 3D puntuales; verificar instalación en el repositorio. No se usan en paneles de operación.
- PixiJS + React bindings seleccionados para ilustraciones 2D en canvas si una escena interactiva lo requiere; verificar instalación en el repositorio. los ornamentos decorativos estáticos se implementan como SVG vectorial accesible y liviano.
- MapLibre solo si se confirma una necesidad de mapas; no es central en el MVP.

## Comparación de base de datos

PostgreSQL se mantiene como base de datos del MVP. El desarrollo local utiliza su instancia local; la presentación pública aprobada se prepara en Render con una base independiente llamada `amankay_render`. Flyway evoluciona el esquema; Hibernate valida y accede a él sin crearlo o cambiarlo automáticamente. Prisma queda excluido de la administración de esas tablas para evitar dos ORM con autoridad de escritura.

## Restricción de costos

El usuario eligió Render para presentar el ecosistema al profesor. La configuración del repositorio usa planes gratuitos para no exigir pagos ni habilitar cargos. Esta aprobación cubre una demostración académica, no un servicio productivo ni la aceptación de un plan de pago. Los límites vigentes son materiales: los servicios web Free se duermen tras 15 minutos sin tráfico y pueden tardar cerca de un minuto en reactivarse; PostgreSQL Free expira 30 días después de crearse, tiene 1 GB y no cuenta con copias de seguridad. Confirmar esos límites en Render antes de crear recursos; no pasar a planes pagos sin nueva autorización.

La idea histórica de Render + Neon no quedó aprobada como combinación. La decisión posterior del usuario el 23-11-2026 es preparar Render para frontend, API y una base Render PostgreSQL separada; Neon no forma parte del despliegue vigente. La configuración usa `render.yaml` y debe revisarse si cambian los planes o límites del proveedor.

## No incorporar por defecto

Redis, Docker, microservicios, Express separado, OAuth, JWT, Rive y nuevos servicios pagados. JWT u OAuth se incorporarían solo si una rúbrica o decisión funcional concreta lo exige. GSAP, PixiJS y herramientas 3D fueron seleccionadas para piezas públicas puntuales; cargar escenas grandes bajo demanda y mantener los paneles de operación sin 3D.
