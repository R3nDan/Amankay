# Amankay

Amankay es el sistema web para atender pedidos y organizar la operación de un negocio de alimentos con varias sucursales. Este repositorio es la fuente principal del proyecto.

## Estado

Primera aplicación visual implementada con Next.js App Router, React, TypeScript, Tailwind CSS y Lucide React, tras autorización expresa del usuario. Incluye inicio público, catálogo y sus tres categorías (Panadería, Fritos, Bebidas), acceso a sucursales y una galería temporizada de imágenes del proceso del pan. El clip de proceso se reproduce silenciado en bucle y sin controles.

Las dos sedes están disponibles como opciones para recoger pedidos, con horarios y teléfonos de contacto. Los precios del catálogo fueron indicados por el usuario. El sitio incluye selección de productos y una bolsa que prepara la solicitud por WhatsApp; todavía no registra pedidos en una base de datos ni valida inventario, pagos o disponibilidad en tiempo real.

La arquitectura aprobada conserva Next.js, React y TypeScript como frontend, y define un backend Java 25 LTS con Spring Boot 4.2.0, monolito modular y API REST bajo `/api/v1`. Usa PostgreSQL local, Spring Data JPA/Hibernate, Flyway con `flyway-database-postgresql`, Spring Security, JavaDocs, Springdoc 3.2.1/Swagger UI y Maven Wrapper. Java 25 es la versión objetivo de compilación y ejecución aunque el equipo tenga JDK 27. El backend aún no está creado y Maven global no está disponible. Prisma permanece instalado, pero no administrará las tablas de la aplicación. Las versiones gestionadas por el BOM de Spring Boot prevalecen sobre versiones fijadas manualmente, salvo justificación. La documentación de docs/ conserva las decisiones y los pendientes.

### Ejecución local

```sh
npm install
npm run dev
```

Abrir `http://localhost:3000`. Para usar otro puerto: `npm run dev -- --port 3100`. Comprobaciones: `npm run typecheck`, `npm run lint` y `npm run build`.

### Código

- `src/app/`: rutas y estilos globales.
- `src/components/`: cabecera, navegación, tarjetas, ilustraciones SVG originales, recorrido del pan y componentes de interfaz.
- `src/data/`: catálogo visual tipado con los precios indicados; disponibilidad por confirmar.
- `src/lib/`: utilidades compartidas.

## Orden de trabajo acordado

1. Consolidar el SRS y las reglas de negocio.
2. Cerrar los diagramas UML y sus relaciones.
3. Completar y aprobar el MER.
4. Definir arquitectura y decisiones técnicas.
5. Diseñar UI/UX antes del desarrollo.
6. Implementar por etapas la arquitectura aprobada cuando el usuario autorice iniciar el código; las decisiones funcionales y de esquema que siguen pendientes no se presumen resueltas.

## Documentación central

- `docs/01-requisitos/SRS.md`: alcance, requisitos, prioridades, decisiones y pendientes.
- `docs/02-modelado/UML.md`: actores, casos de uso, reglas y clases UML.
- `docs/02-modelado/MER.md`: avance, reglas y trabajo pendiente del modelo entidad-relación.
- `docs/03-arquitectura/stack-tecnologico.md`: stack seleccionado y alternativas evaluadas.
- `docs/03-arquitectura/arquitectura-general.md`: responsabilidades de alto nivel.
- `docs/03-arquitectura/decisiones-tecnicas.md`: acuerdos, justificaciones, cambios y temas abiertos.
- `docs/04-diseno-ui-ux/README.md`: dirección visual, wireframes y ajustes de la primera implementación.
- `docs/05-desarrollo/README.md`: secuencia de construcción y alcance de la entrega actual.

## Archivos recibidos

- `assets/originales/marca/Amankay_Logo.svg` y `assets/originales/marca/Amankay_Logo.png`: archivos originales del logo proporcionado.
- `AnteProyecto_PW.docx`: anteproyecto que describe pedidos mediante QR, información de sedes y coordinación de productos entre sucursales. Su nombre El Alambique es histórico; el usuario confirmó Amankay como nombre del negocio. Los datos personales del formato no se reproducen en la documentación.

## Recursos visuales de la aplicación

- `assets/originales/`: conserva los archivos recibidos sin optimizar. Los nuevos recursos originales se ubican aquí según su tipo y procedencia.
- `public/imagenes/marca/`: identidad visual que se muestra en la web.
- `public/imagenes/portada/`: imágenes principales de las páginas.
- `public/imagenes/productos/panaderia/` y `fritos/`: fotografías de producto optimizadas. Avena, Sevillana y Guarapo se sirven desde `public/imagenes/productos/Bebidas/`.
- `assets/originales/productos/panaderia/` y `fritos/`: fotografías originales recibidas, conservadas sin modificar.
- `public/videos/proceso/`: video del proceso del pan.
- `assets/originales/proceso/`: clip original recibido.

La aplicación utiliza versiones web de las imágenes desde `public/`. Las fotografías de referencia que se compartan para orientar el diseño se conservan en `assets/originales/referencias/` cuando se incorporen al repositorio; no se publican como fotografías de productos.

## Fuentes históricas

Los once enlaces consultados y la trazabilidad de sus decisiones se registran en `docs/03-arquitectura/decisiones-tecnicas.md`. Los chats no sustituyen este conjunto documental: las decisiones futuras deben actualizar el documento dueño del tema y, si cambian una regla, registrar qué acuerdo reemplazan.
