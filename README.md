# Amankay

Amankay es el sistema web para atender pedidos y organizar la operación de un negocio de alimentos con varias sucursales. Este repositorio es la fuente principal del proyecto.

## Estado

Aplicación web con Next.js App Router, React, TypeScript, Tailwind CSS y Lucide React. Incluye inicio público, catálogo y sus tres categorías (Panadería, Fritos, Bebidas), sucursales y el proceso del pan.

Las dos sedes están disponibles como opciones para recoger pedidos, con horarios y teléfonos de contacto. El sitio público conserva su experiencia visual existente. El panel administrativo de Next.js ya consume la API Java para autenticación, mesas y QR temporal, pedidos, inventario, reposiciones, entregas, pagos, conciliaciones, catálogo, usuarios, sucursales y reportes. La bolsa pública registra el pedido en Java antes de abrir WhatsApp; la confirmación continúa siendo manual por el personal.

La arquitectura aprobada conserva Next.js, React y TypeScript como frontend, y usa un backend Java 25 LTS con Spring Boot 4.2.0, monolito modular y API REST bajo `/api/v1`. `backend/` contiene entidades JPA para las 26 tablas aprobadas, migraciones Flyway y módulos de seguridad, catálogo, pedidos, mesas/QR, pagos, inventario, reposiciones, entregas y reportes. La base de pruebas autorizada `amankay_test` recibió V1/V2 y permitió validar el arranque de Spring y JPA. Flyway continúa deshabilitado por defecto; las credenciales se introdujeron en una terminal local y no se guardaron en el repositorio. Temurin JDK 25.0.5.1 está instalado y configurado como `JAVA_HOME` del usuario; Java 27 permanece instalado, pero Maven Wrapper se verificó con JDK 25. No hay Maven global; se usa Maven Wrapper. Prisma permanece instalado, pero no administra las tablas de la aplicación.

### Ejecución local

El frontend vive en `frontend/`. Desde la raíz del repositorio:

```sh
cd frontend
npm ci
npm run dev
```

Abrir `http://localhost:3000`. Para usar otro puerto: `npm run dev -- --port 3100`. Comprobaciones: `npm run typecheck`, `npm run lint` y `npm run build`.

### Código

- `frontend/src/app/`: rutas y estilos globales.
- `frontend/src/components/`: cabecera, navegación, tarjetas, ilustraciones SVG originales, recorrido del pan y componentes de interfaz.
- `frontend/src/data/`: catálogo visual tipado con los precios indicados; disponibilidad por confirmar.
- `frontend/src/lib/`: utilidades compartidas.

## Orden de trabajo acordado

1. Análisis, diseño, arquitectura y MER de 26 entidades: completados y aprobados.
2. Esquema físico PostgreSQL, migraciones y módulos del backend: implementados en `backend/`.
3. Panel administrativo Next.js integrado a los contratos REST para los módulos operativos.
4. Lint, build de producción de Next.js y pruebas Java automatizadas aprobados en la última verificación local.
5. Completar el recorrido manual de login/QR con la cuenta del personal y teléfono; validar los módulos con sesión autenticada en el navegador.
6. Completar la validación manual del flujo público de pedidos en la base de pruebas y comprobar su aparición en la cola administrativa.

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

- `frontend/assets/originales/marca/Amankay_Logo.svg` y `frontend/assets/originales/marca/Amankay_Logo.png`: archivos originales del logo proporcionado.
- `AnteProyecto_PW.docx`: anteproyecto que describe pedidos mediante QR, información de sedes y coordinación de productos entre sucursales. Su nombre El Alambique es histórico; el usuario confirmó Amankay como nombre del negocio. Los datos personales del formato no se reproducen en la documentación.

## Recursos visuales de la aplicación

- `frontend/assets/originales/`: conserva los archivos recibidos sin optimizar. Los nuevos recursos originales se ubican aquí según su tipo y procedencia.
- `frontend/public/imagenes/marca/`: identidad visual que se muestra en la web.
- `frontend/public/imagenes/portada/`: imágenes principales de las páginas.
- `frontend/public/imagenes/productos/panaderia/` y `fritos/`: fotografías de producto optimizadas. Avena, Sevillana y Guarapo se sirven desde `frontend/public/imagenes/productos/Bebidas/`.
- `frontend/assets/originales/productos/panaderia/` y `fritos/`: fotografías originales recibidas, conservadas sin modificar.
- `frontend/public/videos/proceso/`: video del proceso del pan.
- `frontend/assets/originales/proceso/`: clip original recibido.

La aplicación utiliza versiones web de las imágenes desde `frontend/public/`. Las fotografías de referencia que se compartan para orientar el diseño se conservan en `frontend/assets/originales/referencias/` cuando se incorporen al repositorio; no se publican como fotografías de productos.

## Fuentes históricas

Los once enlaces consultados y la trazabilidad de sus decisiones se registran en `docs/03-arquitectura/decisiones-tecnicas.md`. Los chats no sustituyen este conjunto documental: las decisiones futuras deben actualizar el documento dueño del tema y, si cambian una regla, registrar qué acuerdo reemplazan.
