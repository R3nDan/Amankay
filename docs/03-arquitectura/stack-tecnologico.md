# Stack tecnológico

## Decisión de dirección técnica

Stack recomendado en el chat final para el MVP:

| Capa | Tecnología | Estado |
| --- | --- | --- |
| Web | Next.js, React, TypeScript | Aceptado como dirección técnica |
| Estilos | Tailwind CSS | Aceptado |
| Componentes | shadcn/ui | Propuesto como base |
| Iconos | Lucide React | Propuesto/seleccionado |
| Animación | Motion | Aceptado; usar con moderación |
| Backend web | Route Handlers de Next.js y capa de servicios | Recomendado |
| Base de datos | PostgreSQL | Recomendado sobre MySQL; dirección aprobada junto con arquitectura |
| ORM | Prisma | Propuesto |
| Validación | Zod | Propuesto |

El usuario pidió reutilizar herramientas del proyecto SpacesApps_2, usar Next.js y TypeScript, y dejar la decisión de despliegue al equipo. El `package.json` compartido se describió en el chat como Next.js 16.4.6, React 19.3.0, TypeScript 5.9.3, Tailwind CSS 4.3.3, Motion/Framer Motion, Three.js, React Three Fiber, Drei, Lucide React y MapLibre GL. Esos números reflejan el archivo compartido entonces; no son garantía de que sigan vigentes ni de que este directorio los tenga instalados.

## Dependencias opcionales

- React Hook Form para formularios.
- TanStack Table para tablas complejas.
- Recharts para gráficos de reportes.
- Sonner para notificaciones visuales.
- Three.js + React Three Fiber + Drei para piezas 3D puntuales, no paneles de operación.
- MapLibre solo si se confirma una necesidad de mapas; no es central en el MVP.

## Comparación de base de datos

PostgreSQL fue recomendado frente a MySQL por flexibilidad de restricciones, transacciones y consultas complejas para consistencia de pagos e inventario. Ambos son compatibles con Prisma. La propuesta es ejecutar PostgreSQL localmente durante desarrollo y demostración, sin servicio administrado de pago.

## Restricción de costos

No exigir despliegue en Vercel ni servicio de pago. Desarrollo/presentación en el equipo local con PostgreSQL local es el escenario aceptado. Un despliegue público se evaluará en otra fase y debe revisarse con precios y límites vigentes; no prometer gratuidad perpetua ni permitir cargos automáticos.

La idea de Render + Neon se formuló como solicitud dentro del cuadro de texto al final de una conversación compartida, no como decisión completada en la respuesta final. No queda aprobada como arquitectura de despliegue y además puede cambiar en precio/disponibilidad; no adoptarla sin nueva evaluación y autorización.

## No incorporar por defecto

Redis, Docker, microservicios, Express separado, GSAP, PixiJS, Rive o herramientas con suscripción. Cualquier inclusión posterior requiere necesidad concreta y revisión de costo.

## Fuentes

- [Stack y comparación PostgreSQL/MySQL](https://chatgpt.com/share/6b01d123-58a4-83e9-ba45-329495ddbd6d)
- [Arquitectura, costes y estrategia local](https://chatgpt.com/share/6b01d131-5274-83e9-938e-5488f72f99f5)
