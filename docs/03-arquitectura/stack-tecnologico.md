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
| Base de datos | PostgreSQL local | Aprobada |
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
| Java | JDK 25 LTS | Versión objetivo tanto de compilación como de ejecución. Aunque el equipo tenga JDK 27, el proyecto se compilará y ejecutará con JDK 25. |
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

PostgreSQL se mantiene como base de datos del MVP, instalada localmente para desarrollo y demostración sin servicio administrado de pago obligatorio. Flyway será el mecanismo de evolución del esquema; JPA/Hibernate validará y accederá al esquema, sin crearlo ni cambiarlo automáticamente. Prisma queda excluido de la administración de esas tablas para evitar dos ORM con autoridad de escritura.

## Restricción de costos

No exigir despliegue en Vercel ni servicio de pago. Desarrollo/presentación en el equipo local con PostgreSQL local es el escenario aceptado. Un despliegue público se evaluará en otra fase y debe revisarse con precios y límites vigentes; no prometer gratuidad perpetua ni permitir cargos automáticos.

La idea de Render + Neon se formuló como solicitud dentro del cuadro de texto al final de una conversación compartida, no como decisión completada en la respuesta final. No queda aprobada como arquitectura de despliegue y además puede cambiar en precio/disponibilidad; no adoptarla sin nueva evaluación y autorización.

## No incorporar por defecto

Redis, Docker, microservicios, Express separado, OAuth, JWT, Rive y nuevos servicios pagados. JWT u OAuth se incorporarían solo si una rúbrica o decisión funcional concreta lo exige. GSAP, PixiJS y herramientas 3D fueron seleccionadas para piezas públicas puntuales; cargar escenas grandes bajo demanda y mantener los paneles de operación sin 3D.
