# Stack tecnológico

## Decisión de dirección técnica

Dirección aprobada para el MVP por el usuario el 22-11-2026.

| Capa | Tecnología | Estado |
| --- | --- | --- |
| Web | Next.js, React, TypeScript | Aceptado como dirección técnica |
| Estilos | Tailwind CSS | Aceptado |
| Componentes | Componentes propios de React | Vigente; no se usa un kit de componentes externo. |
| Iconos | Lucide React | Propuesto/seleccionado |
| Animación | Motion | Instalado y utilizado en animaciones de interfaz. GSAP fue retirado al comprobar que no tenía usos. |
| Backend | Java con Spring Boot, monolito modular | Aprobado |
| API | Servicios web REST bajo /api/v1 | Aprobada |
| Base de datos | PostgreSQL; local para desarrollo y una instancia Render separada para la presentación pública | Aprobada como destino de demostración; nunca reutilizar `amankay_test` |
| Persistencia | Spring Data JPA/Hibernate; único ORM propietario de las tablas | Aprobada |
| Migraciones | Flyway, con `flyway-database-postgresql` para el motor PostgreSQL | Aprobado |
| Construcción | Maven Wrapper; no se requiere Maven global | Aprobada |
| Documentación API/código | Springdoc/OpenAPI con Swagger UI y JavaDocs | Aprobada |
| Seguridad | Spring Security | Aprobada |
| Persistencia desde frontend | Ninguna; Next.js consume la API Java | Vigente; sin ORM ni driver PostgreSQL de Node. |
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
- Three.js, React Three Fiber, Drei y PixiJS quedan como opciones futuras, no instaladas: no hay escenas que las utilicen y los adornos actuales son SVG/CSS.
- MapLibre solo si se confirma una necesidad de mapas; no es central en el MVP.

## Comparación de base de datos

PostgreSQL se mantiene como base de datos del MVP. El desarrollo local utiliza su instancia local; la presentación pública está desplegada en Render con una base independiente llamada `amankay_render`. Flyway evoluciona el esquema; Hibernate valida y accede a él sin crearlo o cambiarlo automáticamente. El frontend no se conecta directamente a PostgreSQL: la persistencia se realiza en Java con JPA/Hibernate.

## Restricción de costos

El usuario eligió Render para presentar el ecosistema al profesor. La configuración desplegada usa planes gratuitos y no exige pagos. Esta aprobación cubre una demostración académica, no un servicio productivo ni la aceptación de un plan de pago. Los límites materiales que se deben considerar son: los servicios web Free se duermen tras 15 minutos sin tráfico y pueden tardar cerca de un minuto en reactivarse; PostgreSQL Free expira 30 días después de crearse, tiene 1 GB y no cuenta con copias de seguridad. Revisar los límites vigentes antes de prolongar el uso; no pasar a planes pagos sin nueva autorización.

La idea histórica de Render + Neon no quedó aprobada como combinación. La decisión posterior del usuario el 23-11-2026 fue desplegar frontend, API y una base PostgreSQL separada en Render; Neon no forma parte del despliegue vigente. La configuración usa `render.yaml` y debe revisarse si cambian los planes o límites del proveedor.

## No incorporar por defecto

Redis, Docker, microservicios, Express separado, OAuth, JWT, Rive, GSAP, PixiJS, herramientas 3D y nuevos servicios pagados. JWT u OAuth se incorporarían solo si una rúbrica o decisión funcional concreta lo exige. Las librerías visuales adicionales pueden añadirse cuando exista un uso concreto; las animaciones actuales usan Motion y CSS.
