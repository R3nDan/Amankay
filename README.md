# Amankay

Amankay es el sistema web para atender pedidos y organizar la operación de un negocio de alimentos con varias sucursales. Este repositorio es la fuente principal del proyecto.

## Estado

Estamos consolidando análisis y diseño. Los chats compartidos sirven como fuente histórica; los acuerdos depurados, su estado y su trazabilidad están documentados en `docs/`. No se debe programar, crear la base de datos ni implementar funcionalidades hasta que el usuario cierre las fases de análisis y diseño.

La carpeta contiene el logo y `AnteProyecto_PW.docx`, pero aún no el código fuente de la aplicación.

## Orden de trabajo acordado

1. Consolidar el SRS y las reglas de negocio.
2. Cerrar los diagramas UML y sus relaciones.
3. Completar y aprobar el MER.
4. Definir arquitectura y decisiones técnicas.
5. Diseñar UI/UX antes del desarrollo.
6. Iniciar desarrollo únicamente cuando el usuario dé esa indicación.

## Documentación central

- `docs/01-requisitos/SRS.md`: alcance, requisitos, prioridades, decisiones y pendientes.
- `docs/02-modelado/UML.md`: actores, casos de uso, reglas y clases UML.
- `docs/02-modelado/MER.md`: avance, reglas y trabajo pendiente del modelo entidad-relación.
- `docs/03-arquitectura/stack-tecnologico.md`: stack seleccionado y alternativas evaluadas.
- `docs/03-arquitectura/arquitectura-general.md`: responsabilidades de alto nivel.
- `docs/03-arquitectura/decisiones-tecnicas.md`: acuerdos, justificaciones, cambios y temas abiertos.
- `docs/04-diseno-ui-ux/README.md`: alcance de la futura fase UI/UX.
- `docs/05-desarrollo/README.md`: puerta de entrada a la futura fase de desarrollo.

## Archivos recibidos

- `Amankay_Logo.svg` y `Amankay_Logo.png`: logo proporcionado.
- `AnteProyecto_PW.docx`: anteproyecto que describe un aplicativo para El Alambique, pedidos mediante QR, información de sedes y coordinación de productos entre sucursales. La relación entre el nombre del negocio y el nombre Amankay se deja pendiente de confirmación. Los datos personales del formato no se reproducen en la documentación.

## Fuentes históricas

Los once enlaces consultados y la trazabilidad de sus decisiones se registran en `docs/03-arquitectura/decisiones-tecnicas.md`. Los chats no sustituyen este conjunto documental: las decisiones futuras deben actualizar el documento dueño del tema y, si cambian una regla, registrar qué acuerdo reemplazan.
