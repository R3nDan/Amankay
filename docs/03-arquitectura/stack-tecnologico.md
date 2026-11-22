# Stack tecnológico

## Decisión de dirección técnica

Stack recomendado en el chat final para el MVP:

| Capa | Tecnología | Estado |
| --- | --- | --- |
| Web | Next.js, React, TypeScript | Aceptado como dirección técnica |
| Estilos | Tailwind CSS | Aceptado |
| Componentes | shadcn/ui | CLI instalada; añadir componentes según necesidad y conservar el diseño de marca. |
| Iconos | Lucide React | Propuesto/seleccionado |
| Animación | Motion + GSAP | Instalados. Motion cubre transiciones de interfaz; GSAP queda disponible para secuencias puntuales. |
| Backend web | Route Handlers de Next.js y capa de servicios | Recomendado |
| Base de datos | PostgreSQL | Recomendado sobre MySQL; dirección aprobada junto con arquitectura |
| ORM | Prisma | Propuesto |
| Validación | Zod | Propuesto |

## Dependencias opcionales

- React Hook Form para formularios.
- TanStack Table para tablas complejas.
- Recharts para gráficos de reportes.
- Sonner para notificaciones visuales.
- Three.js + React Three Fiber + Drei instalados para piezas 3D puntuales; no se usan en paneles de operación.
- PixiJS + React bindings instalados para ilustraciones 2D en canvas si una escena interactiva lo requiere; los ornamentos decorativos estáticos se implementan como SVG vectorial accesible y liviano.
- MapLibre solo si se confirma una necesidad de mapas; no es central en el MVP.

## Comparación de base de datos

PostgreSQL fue recomendado frente a MySQL por flexibilidad de restricciones, transacciones y consultas complejas para consistencia de pagos e inventario. Ambos son compatibles con Prisma. La propuesta es ejecutar PostgreSQL localmente durante desarrollo y demostración, sin servicio administrado de pago.

## Restricción de costos

No exigir despliegue en Vercel ni servicio de pago. Desarrollo/presentación en el equipo local con PostgreSQL local es el escenario aceptado. Un despliegue público se evaluará en otra fase y debe revisarse con precios y límites vigentes; no prometer gratuidad perpetua ni permitir cargos automáticos.

La idea de Render + Neon se formuló como solicitud dentro del cuadro de texto al final de una conversación compartida, no como decisión completada en la respuesta final. No queda aprobada como arquitectura de despliegue y además puede cambiar en precio/disponibilidad; no adoptarla sin nueva evaluación y autorización.

## No incorporar por defecto

Redis, Docker, microservicios, Express separado y Rive. GSAP, PixiJS y herramientas 3D están instaladas por solicitud expresa del usuario del 21-11-2026; utilizarlas solo en piezas públicas concretas, cargar escenas grandes bajo demanda y mantener los paneles de operación sin 3D.
