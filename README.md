# Amankay

Amankay es el sistema web para atender pedidos y organizar la operación de un negocio de alimentos con varias sucursales. Este repositorio es la fuente principal del proyecto.

## Estado

Aplicación web con Next.js App Router, React, TypeScript, Tailwind CSS y Lucide React. Incluye inicio público, catálogo y sus tres categorías (Panadería, Fritos, Bebidas), sucursales y el proceso del pan.

Las dos sedes están disponibles como opciones para recoger pedidos, con horarios y teléfonos de contacto. El sitio público conserva su experiencia visual existente. La integración para consumir la API Java queda pendiente.

La arquitectura aprobada conserva Next.js, React y TypeScript como frontend, y usa un backend Java 25 LTS con Spring Boot 4.2.0, monolito modular y API REST bajo `/api/v1`. `backend/` ya contiene entidades JPA para las 26 tablas aprobadas, migraciones Flyway, seguridad de personal, catálogo, pedidos, mesas/QR, pagos, inventario, reposiciones, entregas y reportes. PostgreSQL local todavía no tiene nombre, esquema ni credenciales de conexión confirmados. Por seguridad, Flyway sigue deshabilitado y no se ha ejecutado ninguna migración. Temurin JDK 25.0.5.1 está instalado y configurado como `JAVA_HOME` del usuario; Java 27 permanece instalado, pero Maven Wrapper se verificó con JDK 25. No hay Maven global; se usa Maven Wrapper. Prisma permanece instalado, pero no administra las tablas de la aplicación.

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

1. Análisis, diseño, arquitectura y MER de 26 entidades: completados y aprobados.
2. Esquema físico PostgreSQL, migraciones y módulos iniciales del backend: implementados en `backend/`.
3. Configurar JDK 25 y definir explícitamente una base/esquema de prueba local.
4. Revisar las migraciones y autorizar expresamente su ejecución contra ese destino aislado.
5. Completar pruebas con PostgreSQL autorizado e integrar Next.js con la API Java.

## Documentación central

- `docs/01-requisitos/SRS.md`: alcance, requisitos, prioridades, decisiones y pendientes.
- `docs/02-modelado/UML.md`: actores, casos de uso, reglas y clases UML.
- `docs/02-modelado/MER.md`: MER aprobado de 26 entidades y reglas de integridad.
- `docs/02-modelado/modelo-fisico-postgresql.md`: tipos, restricciones y esquema físico.
- `docs/03-arquitectura/stack-tecnologico.md`: stack seleccionado y alternativas evaluadas.
- `docs/03-arquitectura/arquitectura-general.md`: responsabilidades de alto nivel.
- `docs/03-arquitectura/decisiones-tecnicas.md`: acuerdos, justificaciones, cambios y temas abiertos.
- `docs/04-diseno-ui-ux/README.md`: dirección visual, wireframes y ajustes de la primera implementación.
- `docs/05-desarrollo/README.md`: estado, verificaciones y próximos pasos de implementación.
- `backend/README.md`: configuración, ejecución, API y límites de verificación del backend.

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
