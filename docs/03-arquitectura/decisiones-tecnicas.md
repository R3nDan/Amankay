# Decisiones técnicas y trazabilidad

## Cómo leer este registro

- **Aprobada:** decisión elegida o afirmada directamente por el usuario.
- **Aceptada por continuidad:** el usuario aprobó explícitamente una estructura o recomendación inmediatamente anterior.
- **Propuesta:** sugerencia del asistente sin aprobación explícita identificada.
- **Pendiente:** requiere confirmación o completar análisis.
- **Descartada/sustituida:** una decisión posterior la reemplazó.

## Actualización arquitectónica y funcional aprobada (22-11-2026; fotografía inicial)

Esta sección registra lo que se aprobó antes de varias confirmaciones posteriores del mismo día. Para el estado vigente usa la tabla “Estado técnico vigente después de la implementación” al final de este documento.

- **Arquitectura:** se conserva Next.js/React/TypeScript como frontend. El backend será Java con Spring Boot en un monolito modular, API REST bajo /api/v1, PostgreSQL local, Spring Data JPA/Hibernate como único ORM, Flyway, Maven Wrapper, Spring Security, JavaDocs y Springdoc/OpenAPI con Swagger UI. Prisma permanece instalado y no administrará ni modificará las tablas de PostgreSQL.
- **Selección inicial de versiones (sustituida posteriormente el 22-11-2026):** JDK 25 LTS, Spring Boot 3.5.16 y Springdoc 2.10.1. Fue la dirección aprobada inicialmente, antes de la evaluación final de versiones. No representa el stack vigente.
- **Devoluciones fallidas:** la decisión anterior de inspección obligatoria queda sustituida. La gestión formal de devoluciones está fuera del MVP y el producto que regrese físicamente no vuelve automáticamente al stock disponible.
- **Trazabilidad y compensaciones en esa fecha:** el MER conserva 26 entidades. Al registrarse esta fotografía, el origen y la política compensatoria seguían pendientes; el usuario los aprobó después el 22-11-2026. La decisión vigente usa `tipoOrigen` + `idOrigen` y una FK autorreferenciada opcional, única, total y no encadenable.
- **Alcance:** esta actualización es documental. No se creó backend, código Java, esquema ni migración y no se modificó la base de datos.

## Actualización definitiva del stack tecnológico aprobada (22-11-2026)

- **Stack vigente:** Java 25 LTS, Spring Boot 4.2.0, Springdoc 3.2.1, Next.js/React/TypeScript, PostgreSQL, Spring Data JPA/Hibernate, Flyway, Spring Security, Maven Wrapper, API REST bajo `/api/v1` y monolito modular. Prisma permanece instalado, pero no se utilizará como ORM ni para persistencia.
- **Java:** JDK 25 es la versión objetivo de compilación y ejecución. Temurin 25.0.5.1 quedó instalado el 22-11-2026 y `JAVA_HOME` de usuario se configuró a esa versión; JDK 27 permanece instalado, pero no se usa para este proyecto.
- **Compatibilidad documental:** la matriz oficial de Springdoc 3 confirma 3.2.1 para Spring Boot 4.2.x.
- **Flyway:** incluir `flyway-database-postgresql` además del módulo base correspondiente; el soporte PostgreSQL de Flyway está separado en un artefacto específico.
- **Versiones de dependencias:** prevalecen las versiones administradas por el BOM de Spring Boot. Fijar otra versión requiere justificación y verificación de compatibilidad.

## Trazabilidad de MovimientoInventario aprobada (origen; compensación confirmada después)

- Cada movimiento identifica la operación que lo origina mediante `tipoOrigen` (tipo de proceso) e `idOrigen` (registro concreto).
- Java valida que el registro exista y corresponda al tipo indicado. No se crearán múltiples claves foráneas opcionales para las entidades de origen.
- Los movimientos originales son inmutables. Los compensatorios conservan trazabilidad hacia el movimiento corregido.
- La creación de movimientos se realiza exclusivamente mediante servicios autorizados del backend; no se permiten escrituras que omitan las validaciones de Java.
- Se conservan las 26 entidades aprobadas. La cantidad y el encadenamiento de compensaciones quedaron resueltos después: como máximo una compensación total por original, sin cadenas ni parcialidad, mediante FK autorreferenciada opcional y única.
- **Alcance en la fecha de esta nota:** fue una actualización documental. La instrucción posterior del usuario autorizó la implementación; el estado actual y sus límites se registran al final del documento.

## Primera base técnica del backend implementada (22-11-2026; snapshot sustituido)

Este apartado conserva el estado de la primera base técnica antes de crear entidades y módulos de dominio. La implementación posterior consta en “Estado técnico vigente después de la implementación”.

- **Estructura:** se creó backend/ como proyecto Maven independiente con paquete base com.amankay.backend, configuración, módulo técnico de salud, recursos y prueba MVC. El paquete inverso com.amankay se eligió como convención interna; no presupone titularidad de un dominio.
- **Versiones en el snapshot inicial:** pom.xml heredaba Spring Boot 4.2.0, fijaba Java release 25 y declaraba Springdoc 3.2.1. Maven Wrapper 3.3.4 descargaba Apache Maven 3.10.2. En ese momento JDK 25 no estaba instalado y las comprobaciones se hicieron con JDK 27 usando `--release 25`; este dato es histórico. El 22-11-2026 se instaló Temurin JDK 25.0.5.1 y las comprobaciones actuales se repitieron con esa versión.
- **Dependencias:** se verificó la resolución de MVC, Spring Data JPA/Hibernate, Spring Security, Validation, Flyway, PostgreSQL JDBC y Springdoc. El BOM administró las versiones de Boot, Spring, Hibernate, Flyway y PostgreSQL; solo Springdoc mantiene la versión aprobada fijada.
- **Configuración y protección:** la conexión se declara mediante DB_HOST, DB_PORT, DB_NAME, DB_USERNAME y DB_PASSWORD del entorno del proceso. backend/.env.example es solo plantilla y no se carga automáticamente. Hibernate usa ddl-auto=none y la inicialización SQL está desactivada.
- **Flyway:** starter y módulo PostgreSQL están en el classpath; la ubicación convencional está declarada. spring.flyway.enabled=false está en la configuración común y local, la creación de esquemas está desactivada y clean está bloqueado. La carpeta no contiene migraciones SQL.
- **Seguridad y API en esa primera entrega:** solo salud y documentación OpenAPI eran públicas; las demás rutas se denegaban. Entonces no existían usuarios ni autenticación de negocio. GET /api/v1/health informa el estado del proceso y no consulta PostgreSQL.
- **Límites de verificación:** se resolvieron dependencias, se validó Maven, se compilaron fuentes Java y pasaron pruebas MVC. No se inició el contexto completo que inicializa JPA, no se validó la conexión real y no se ejecutaron migraciones. La base, esquema y credenciales no están confirmados. No se hicieron operaciones DDL/DML ni cambios al MER o frontend.

## Implementación inicial y ajuste visual aprobado (21-11-2026)

Fuente: instrucciones directas del usuario en este chat, posteriores a la planificación UI/UX. No modifica las decisiones de modelado.

- **Herramientas visuales (21-11-2026):** a petición del usuario, se instalan GSAP, PixiJS/@pixi/react, Three.js/@react-three/fiber/@react-three/drei y shadcn CLI, además de Motion ya existente. Se usan solo donde aporten al sitio público. El adorno actual se implementa como SVG, el plano inclinado del clip con CSS 3D. Evitar cargar motores canvas/3D en toda ruta; dividir bajo demanda. `npm audit` reporta cuatro hallazgos moderados en la cadena de desarrollo de shadcn (sin vulnerabilidades en dependencias de producción).

- **Transiciones de navegación (21-11-2026):** Motion, aceptado en el stack, instalado y aplicado al indicador deslizante de categoría, la respuesta al toque y las transiciones de rutas públicas. El usuario pide una transición tipo tarjeta que se desliza y revela el apartado siguiente, con profundidad y dirección según el orden de la categoría. prefers-reduced-motion reduce la animación. No se altera el comportamiento del video scrub.
- **Portada y ornamentación (21-11-2026):** el usuario pidió un rediseño integral del Inicio con detalle 2D original, vídeo del proceso inclinado y bordado parcialmente con espigas, y menor cantidad de frases. La ilustración es SVG artesanal; perspectiva en CSS; sin inventar precios, horarios o afirmaciones comerciales.

| Tema | Decisión vigente y justificación | Estado |
|---|---|---|
| Desarrollo (fotografía histórica del diseño UI) | En ese corte aún no había persistencia ni módulos Java; una instrucción posterior autorizó e implementó el esquema físico y el backend inicial. | Estado sustituido; ver estado vigente al final del documento. |
| Catálogo | Panadería, Fritos y Bebidas. Para la implementación inicial, Fritos comprende empanadas y pasteles; las papas quedan aplazadas por petición posterior del usuario. Bebidas comprende avena y sevillana. Amplía el contenido visual más allá de panes, usando las categorías existentes. | Aprobada; papas futuras |
| Cabecera | SVG centrado, sin texto Amankay adicional, navegación inferior INICIO / PANADERÍA / FRITOS / BEBIDAS. Referencia de jerarquía: MASA. | Aprobada |
| Título y nombre | Amankay es el nombre confirmado por el usuario para el negocio y el título de pestaña de las páginas públicas. Sustituye la duda anterior sobre el nombre comercial del anteproyecto. | Aprobada, 22-11-2026 |
| Paleta | Retirar verde y usar cacao, crema, trigo, durazno y cobre del logo, conservando marfil. Contrastes y usos en UI/UX. Sustituye verde hoja/terracota/mostaza como dirección estética. | Aprobada |
| Accesos públicos | «Contáctanos» conduce a las sucursales dentro de Inicio, en el lugar antes ocupado por «Del horno». «Pide» queda a la derecha de la navbar como acceso al catálogo y, después, al flujo de pedidos. | Aprobada, 22-11-2026 |
| Datos de sucursales | Sede principal: Calle 4 # 5-55, Centro de Neiva. Sede secundaria: Carrera 7 # 19-20, Neiva. Ambas se habilitan como opciones de recogida, con horario compartido (lunes a viernes 6:30 a. m.–6:30 p. m.; sábados 6:30 a. m.–1:00 p. m.; domingos y festivos cerrado) y teléfono 312 586 4045. No mostrar numeración ni etiquetas auxiliares en sus tarjetas. | Actualización directa del usuario, 22-11-2026 |
| Proceso | Video proporcionado, con avance y retroceso mediante scroll. Sustituye las cuatro fotografías seleccionables. | Aprobada |
| Accesibilidad del clip | Movimiento reducido inicia con controles manuales; se puede activar scroll expresamente o saltar el recorrido. Seeks secuenciales, sin capturar desplazamiento; el clip se mantiene independiente de Motion. | Elección técnica dentro de la implementación autorizada |
| Recursos | Originales conservados; fotografías WebP para web, MP4 en carpeta de videos. No reutilizar imágenes de MASA. | Elección técnica dentro de la implementación autorizada |
| Datos comerciales | Fotos de Fritos/Bebidas, precios, recetas y disponibilidad siguen por confirmar. No inferirlos de la referencia. | Pendiente |

### Aprobación del MER e inicio del backend (22-11-2026; decisión vigente)

- **MER:** el usuario confirmó que el modelo lógico consolidado de `docs/02-modelado/MER.md` está aprobado. Se sustituye su estado anterior de «pendiente de aprobación»; no se repiten las etapas de análisis y diseño.
- **Desarrollo:** se aprobó la dirección Java/Spring Boot, la persistencia exclusiva por JPA/Flyway y, posteriormente, la implementación integral del esquema y backend. La recomendación anterior de Prisma como backend quedó sustituida.
- **Límites:** una solicitud posterior cerró reglas para pedidos web, pagos, cancelaciones, repartos, inventario, compensaciones, QR y domicilios. La base de datos real sigue sin configurarse y no se ha modificado.

## Desarrollo del pedido público (22-11-2026; snapshot del frontend anterior al backend)

- **Autorización:** el usuario confirmó que ya concluyeron análisis y diseño y pidió implementar el apartado público de pedidos. Sustituye el límite de la primera entrega solo visual. La aprobación no inventa reglas aún pendientes ni equivale a aprobar el MER.
- **Precios aprobados:** Panadería 2.000 COP por producto, Fritos 3.500 COP, Avena y Sevillana 3.500 COP, Guarapo 3.000 COP. Sustituye la parte de «precios por confirmar» en la tabla de implementación inicial; recetas y existencias siguen pendientes.
- **Interacción aprobada:** toque en tarjeta para abrir detalle breve y selector de cantidad; símbolo del tipo de producto animado hacia «Pide» al agregar; bolsa con indicador, resumen y elección entre recogida y domicilio. Las páginas individuales de categoría quitan el título repetido de su franja texturizada y repiten esa franja al final.
- **Ajuste de la bolsa (22-11-2026):** el usuario sustituyó el icono genérico y su tapa animada por una bolsa de papel de pan. El símbolo del producto viaja reducido, espera un segundo sobre la abertura y entra cuando la bolsa se abre por sí misma; el punto de contenido no lleva contorno y queda más cerca de la esquina.
- **Límite de esa entrega:** la bolsa preparaba una solicitud en WhatsApp, sin persistencia ni confirmación del personal. La decisión posterior aprobó registrar el pedido desde Java antes de abrir WhatsApp, con confirmación manual y vencimiento a 30 minutos; el backend ya expone ese flujo y falta integrar el frontend.

## Decisiones aprobadas para el cierre del modelado (21-11-2026; historial complementario)

- Conservación de eventos originales de despacho y recepción. Corrección mediante anulación completa y registro nuevo cuando las dependencias lo permitan; anulación documental y movimientos compensatorios son operaciones separadas.
- Los movimientos de inventario pendientes no afectan el stock disponible. No se permiten existencias negativas. Si el producto ya fue consumido, se deriva a revisión administrativa sin reescribir ventas ni automatizar deuda, pérdida o regularización.
- Se mantiene un cierre final de faltantes por línea y una reversa total como máximo por cierre. No se admiten reversas parciales ni entidad de cierre independiente si los campos caben en la línea existente.
- Una conciliación por entrega. El repartidor declara el monto y el trabajador autorizado de sucursal registra lo recibido; cualquier rectificación conserva el original y queda vinculada a este.
- Como máximo un comprobante por intento de `Pago`; cada reintento es otro `Pago`.
- Permisos por rol y sucursal con asociaciones existentes. Sin permisos individuales configurables ni doble autorización obligatoria por defecto. El administrador no hereda permisos operativos. El empleado receptor es un trabajador autorizado, no un actor separado. Una persona puede registrar y autorizar operaciones ordinarias.
- Estados de solicitud de reposición: `PENDIENTE_REVISION`, `RECHAZADA`, `EN_PROCESO`, `COMPLETADA`; `BORRADOR` solo si se necesita guardar una solicitud sin enviar. Los saldos pendientes se calculan desde cantidades.

Estas decisiones sustituyen propuestas técnicas previas incompatibles de correcciones por delta, `CierreFaltanteReposicion`, aprobación doble, sesión/cuenta con cierre conjunto y múltiples comprobantes por intento.

Las once conversaciones compartidas se abrieron en navegador y se revisaron. Algunas respuestas estaban colapsadas en la vista; se revelaron con el control de copia y se cotejaron contra los mensajes de usuario posteriores. Se consultaron todas las fuentes siguientes:

1. [Requisitos iniciales y decisiones del MVP](https://chatgpt.com/share/6b01d0a2-035c-83ea-aee5-39db38d3b578)
2. [Actores, casos de uso y validaciones](https://chatgpt.com/share/6b01d0bf-a34c-83ea-a330-a71f677250f8)
3. [Consolidación de casos de uso y reposición por sucursal](https://chatgpt.com/share/6b01d0b0-86d8-83e8-859a-dd93e89cd206)
4. [Recepción parcial y repartos](https://chatgpt.com/share/6b01d0d0-fd70-83e9-b681-8e1f6b1baf3b)
5. [Inspección de productos devueltos](https://chatgpt.com/share/6b01d0da-89f0-83e9-948c-4dd392481859)
6. [Pagos, comprobantes, reembolsos y conciliación](https://chatgpt.com/share/6b01d0e3-468c-83e9-82b3-22dcec98c569)
7. [Clases UML y correcciones de negocio](https://chatgpt.com/share/6b01d0f1-4d10-83e9-a5e7-6e075dedce85)
8. [Diagrama UML consolidado y cardinalidades MER](https://chatgpt.com/share/6b01d103-6fe8-83e9-953e-5403db925930)
9. [Secuencia de fases y aprobación de relaciones MER](https://chatgpt.com/share/6b01d114-7e04-83e9-bb40-c135412f6824)
10. [Stack y costes](https://chatgpt.com/share/6b01d123-58a4-83e9-ba45-329495ddbd6d)
11. [Arquitectura final y ejecución sin costo obligatorio](https://chatgpt.com/share/6b01d131-5274-83e9-953e-5403db925930)

El anteproyecto `AnteProyecto_PW.docx` también se revisó. Contiene datos personales de estudiantes que se omitieron deliberadamente; no son requisitos del sistema.

## Revisión por conversación

1. **Requisitos iniciales:** el usuario pidió documentar el proyecto en Markdown dentro de su carpeta. Definió recogida con sede elegida y recomendación de sede que complete todo el carrito; descuento al aceptar pedido; 30 minutos para pedidos pendientes de confirmación sin retener stock; WhatsApp directo manual; pidió pantalla de espera y una cola que no se bloquee. Después fijó como decisiones finales inventario de productos terminados, sin personalización, varios pedidos de mesa acumulados en la cuenta, cancelación antes de preparar y registro WhatsApp desde el panel. El asistente recomendó FIFO visible con escalamiento (3 minutos sugeridos), token QR temporal y seguimiento sin datos personales innecesarios.
2. **Actores/casos de uso:** el usuario validó cinco actores y casos de uso; indicó “Encargados: one”, “Atención: both”, “Repartidor: delivery”, “Cancelaciones: before”. Aprobó las funcionalidades del cliente. Aprobó opción B para que el administrador no herede de forma automática tareas operativas; permisos adicionales son asignables. El diagrama incluyó historial personal e incidencias del repartidor.
3. **Consolidación UML y reposiciones:** el usuario aprobó estructura general y pidió explicitar el flujo por sucursal: principal revisa/aprueba/prepara/despacha; secundaria solicita/recibe. El asistente dejó esa regla como permisos por sede de un actor único de inventario. También delimitó cancelación condicional, registro manual WhatsApp y descuento de inventario al aceptar.
4. **Recepción y repartos:** el usuario aprobó opción A para recepción parcial, cantidades pendientes y registro de diferencias. Luego pidió continuar con módulo de repartidores/entregas. El asistente recomendó entregar solo pedidos asignados, separación de estados pedido/entrega y revisión de incidencia por atención; la resolución final de incidencias no quedó seleccionada de forma inequívoca.
5. **Devoluciones (decisión histórica sustituida):** el usuario había elegido inspeccionar productos de entregas fallidas antes de reincorporarlos. El 22-11-2026 decidió aplazar la gestión formal de devoluciones fuera del MVP; un producto que regrese físicamente no se reincorpora automáticamente al stock. La regla anterior se conserva aquí solo como trazabilidad histórica.
6. **Pagos (historial y corrección vigente):** el chat de pagos respalda borrar el archivo de comprobante rechazado y exigir motivo cuando el efectivo declarado por repartidor difiere de lo recibido. La documentación anterior interpretó incorrectamente el reembolso como parcial; la instrucción directa más reciente corrige esa interpretación: reembolso manual, solo total, con datos dentro de `Pago`. Se mantiene el flujo simple de efectivo, separado del pago al cliente; no se incorpora conciliación avanzada.
7. **Clases y restricciones UML:** el usuario aprobó varias propuestas con respuestas “A”, aprobó recepción con pendientes calculados y cierre autorizado de faltantes, y aprobó `abiertaPor`/`cerradaPor` para sesiones. Aprobó la distinción `tipoActor` para auditoría humana o de sistema. El diagrama base de 20 clases necesitaba estos agregados y restricciones.
8. **Diagrama UML/MER:** se presentó el modelo de clases consolidado y se avanzó a identificar relaciones, PK/FK y multiplicidades. El chat contiene además una petición de continuar con el bloque de entregas/repartidores/incidencias; no convertir esa petición por sí sola en aprobación de cada detalle de diseño.
9. **Relaciones MER:** el usuario corrigió el intento de saltar directamente a crear la base de datos, pidió respetar la secuencia de fases ya acordada y aprobó el bloque 3 de relaciones/cardinalidades para continuar con entidades asociativas, FK y estructura lógica. El MER, por ello, continuaba abierto al terminar el chat.
10. **Stack:** el usuario pidió revisar las dependencias de SpacesApps_2, usar Next.js y TypeScript, comparar MySQL/PostgreSQL y evitar gastos. La idea de migración a Render + Neon aparece como texto redactado en el cuadro de entrada, no como mensaje enviado/decisión adoptada.
11. **Arquitectura/costos (propuesta histórica sustituida):** la dirección anterior recomendaba Next.js Route Handlers y Prisma como backend. La decisión del usuario del 22-11-2026 la sustituye por Java/Spring Boot con JPA/Flyway y conserva Next.js como frontend. Ningún despliegue público pagado queda como requisito.

## Estado técnico vigente después de la implementación (22-11-2026)

El usuario aprobó la dirección y precisiones funcionales siguientes. Se implementaron el modelo físico de 26 tablas, las entidades JPA, migraciones Flyway V1/V2 y módulos backend descritos en `backend/README.md`. Esta sección reemplaza las matrices de estado anteriores de este archivo; las secciones cronológicas previas se conservan como historia, no como especificación vigente.

| Área | Decisión vigente | Estado / límite |
|---|---|---|
| Arquitectura | Frontend Next.js/React/TypeScript; backend Java 25, Spring Boot 4.2.0, Springdoc 3.2.1, REST `/api/v1`, monolito modular; JPA/Hibernate como único ORM; PostgreSQL; Flyway; Spring Security; Maven Wrapper. | Implementado en parte. Temurin JDK 25.0.5.1 instalado y usado para validar; Prisma no participa en persistencia. |
| MER y esquema | 24 entidades de dominio y 2 asociativas, 26 en total. `tipoOrigen` + `idOrigen` identifica el origen de cada movimiento; FK autorreferenciada opcional identifica compensación. | Entidades y scripts preparados; no se altera el MER ni se ejecutaron scripts. |
| Pedido web/WhatsApp | Guardar desde Java antes de abrir WhatsApp; confirmación manual, vence a los 30 minutos, sin reserva de stock ni API WhatsApp. | Implementado en servicio REST; integración del frontend pendiente. |
| WhatsApp recibido por el negocio | Atención registra manualmente el pedido externo en la misma cola de confirmación; no vence automáticamente a los 30 minutos, regla exclusiva del pedido web. | Implementado en `POST /api/v1/staff/orders/whatsapp`; sin integración automática. |
| Pagos | Cada intento cubre el saldo completo. Reintentos conservados; sin pago parcial ni sobrepago; reembolso manual total. | Servicio Java transaccional implementado; requiere integración y prueba con PostgreSQL. |
| Cancelación | Atención autorizada aprueba cancelaciones antes de iniciar preparación. | Validación de estado y rol implementada. |
| Entrega fallida | Repartidor solo registra estados/incidencias propias; operaciones autorizadas decide reintentos y resolución. Devolución formal fuera del MVP y retorno físico no suma stock automáticamente. | Estados/observaciones y permisos implementados; no existe entidad de devolución. |
| Inventario | Personal autorizado registra existencias iniciales, ajustes y mermas; todo ajuste exige motivo. | Servicio con historial append-only y límites de saldo implementado. Stock real no se ha cargado. |
| Compensación | Una compensación total como máximo por original, sin parcialidad ni cadena; FK autorreferenciada y vínculo inverso. Original inmutable; Java valida delta/stock y motivo. | Aprobada por el usuario y reflejada en SQL/Java. La base aún no se ha ejecutado. |
| QR | El QR físico solo identifica mesa y sucursal. Al abrir la sesión, atención muestra un QR temporal generado por Java, vinculado a esa sesión y mesa. TTL configurable de ocho horas; cierre manual invalida el acceso al instante; expiración no cierra cuenta; sondeo REST. | Implementado en backend y vista móvil; pruebas unitarias aprobadas. El flujo completo con navegador, personal autenticado y PostgreSQL requiere verificación. |
| Domicilios | GPS voluntario con consentimiento; coordenadas conservadas en `Pedido` y visibles en la entrega protegida. Sin GPS, dirección/barrio y asignación manual de sede con disponibilidad del pedido entero. No dividir. La cobertura comercial es Neiva. | Lógica parcial: sin coordenadas reales de sucursales y un límite geográfico de Neiva no se garantiza la cobertura GPS. |
| Devoluciones | Inspección y gestión formal de devolución de entrega fallida aplazadas fuera del MVP. | Aprobada; sustituye la antigua regla histórica de inspección. |
| Efectivo de entrega | La declaración vigente del repartidor se almacena en `Entrega.montoEfectivoDeclarado` y se copia al crear `ConciliacionEfectivo`; las declaraciones quedan auditadas. La rectificación actualiza la fila operativa y deja su antes/después ligado a ella en auditoría. | Implementado en JPA/SQL sin agregar entidades ni duplicar la conciliación vigente. |
| Cancelación externa | Puede solicitarse en `PENDIENTE_CONFIRMACION` o `ACEPTADO`, siempre antes de preparación. La negativa restaura el estado anterior; aprobar un pendiente no genera compensación de inventario. | Implementado conforme al alcance aprobado; los pagos solo se pueden iniciar desde estados aceptados/activos del pedido. |
| Domicilio con GPS | Solo se reciben coordenadas con consentimiento explícito; se persisten en el pedido y se exponen en la vista protegida de la entrega. Sin GPS son obligatorios dirección y barrio. | Implementado en el modelo existente `Pedido`; la cobertura geográfica precisa de Neiva y coordenadas reales de sedes quedan pendientes de datos/configuración. |

## Pendientes técnicos reales y límites de verificación

- Elegir y autorizar una base/esquema PostgreSQL de prueba aislado; no se conocen DB_NAME, esquema ni credenciales y no se intentó conexión.
- Revisar V1/V2 y obtener aprobación expresa del destino antes de habilitar Flyway. El Flyway deshabilitado sigue siendo sobrescribible por configuración externa; no iniciar la aplicación con variables de DB no verificadas.
- Probar arranque completo de Spring/JPA, integración de constraints, bloqueos/transacciones y migraciones contra el destino autorizado.
- Configurar `AMANKAY_PRIVATE_FILES_DIR` para comprobantes; configurar coordenadas y stock real de sucursales/productos.
- Integrar frontend Next.js, panel operativo y QR con la API; probar seguridad desde ambos clientes.
- Definir el protocolo académico medible de usabilidad y aceptación (P-18); no bloquea este primer desarrollo.

No hay decisiones funcionales abiertas para los flujos aprobados en la solicitud del 22-11-2026. Los detalles reales del catálogo/stock y la configuración local son datos de puesta en marcha, no autorización para inventarlos.

## Cómo actualizar

Cuando el usuario tome una nueva decisión, actualizar el archivo dueño (`SRS.md`, `UML.md`, `MER.md` o documento de arquitectura), cambiar el estado y añadir una fila de cambio aquí que indique la regla anterior, la nueva regla, la fecha y la referencia de conversación si existe. Mantener intacta la historia necesaria para explicar por qué se cambió.


### 2026-11-22 — Selección en el reverso de la tarjeta

**Decisión aprobada:** por instrucción posterior del usuario, se sustituye la vista previa superpuesta por un giro 3D en la propia tarjeta. El frente coloca el precio junto al título; el reverso concentra descripción, símbolo, cantidad y acción de agregar. Agregar o volver restaura el frente. Los patrones usan un reloj compartido para mantener su recorrido al cambiar de apartado.

### 2026-11-22 — Acceso QR temporal de mesa

**Decisión aprobada:** el personal de atención abre una sesión y muestra al cliente un QR temporal generado por Java. El código físico permanente identifica la mesa y la sucursal, sin conceder acceso. El token aleatorio se conserva únicamente como hash en `SesionMesa`, está vinculado a esa sesión y mesa, dura ocho horas por defecto y deja de autorizar validaciones y pedidos al cerrar la sesión o expirar. La cuenta de mesa permanece independiente. El cliente consulta los estados mediante sondeo REST. Se reutilizan la entidad y los servicios existentes; no hay migración nueva.
