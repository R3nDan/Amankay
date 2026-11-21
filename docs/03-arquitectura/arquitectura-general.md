# Arquitectura general de Amankay

## Estado

Documento de arquitectura y preparación del MVP. El proyecto actual contiene documentación, materiales gráficos y el anteproyecto; aún no contiene una aplicación web implementada. No crear código, esquema de base de datos ni migraciones hasta cerrar arquitectura/UI/UX y recibir autorización expresa para desarrollar.

## Producto

Amankay será una sola aplicación web integral para operar un negocio de comidas con varias sucursales. Incluirá tres experiencias dentro del mismo sistema:

1. **Sitio público:** presentación, catálogo, sucursales, carrito, pedidos para recoger o domicilio y seguimiento.
2. **Interfaz QR:** experiencia móvil que usa la mesa y su sesión activa para consultar catálogo, pedir y consultar estados.
3. **Panel administrativo y operativo:** pedidos, mesas/cuentas, pagos, inventario/reposiciones, entregas y administración.

No es solo un sitio informativo ni una aplicación móvil nativa. No se automatiza WhatsApp; los pedidos recibidos por ese medio se registran desde el panel. El nombre comercial definitivo y su relación con Amankay siguen pendientes según SRS.

## Dirección tecnológica

| Capa | Tecnología | Uso previsto |
|---|---|---|
| Aplicación web | Next.js App Router, React, TypeScript | Rutas, vistas públicas y privadas, endpoints del servidor. |
| Estilos y componentes | Tailwind CSS, shadcn/ui | Sistema responsive y componentes reutilizables. |
| Iconos y movimiento | Lucide React, Motion | Iconografía y animaciones puntuales. |
| Formularios/validación | React Hook Form cuando aporte valor, Zod | Formularios del cliente y panel; validación en servidor. |
| Persistencia | PostgreSQL local y Prisma | Base relacional; se incorpora después de aprobar modelo y autorizar implementación. |

Three.js/React Three Fiber/Drei se reservan para una pieza promocional concreta si UI/UX demuestra que aporta valor y no afecta rendimiento. No incluirlos en paneles operativos. No añadir Express separado, microservicios, Redis, colas o infraestructura pagada para el MVP.

## Arquitectura lógica

```text
Navegador
  ├── sitio público
  ├── interfaz QR
  └── panel operativo
          │ Server Components / formularios / fetch
          ▼
Next.js (Route Handlers y Server Actions cuando convenga)
          ▼
Servicios de aplicación (casos de uso y reglas del dominio)
          ▼
Repositorios/adaptadores Prisma
          ▼
PostgreSQL local
```

Mantener una aplicación modular monolítica. Las vistas no implementan reglas críticas; pasan solicitudes al servidor. Los servicios de dominio coordinan autorización, validación y transacciones; el acceso a datos queda detrás de funciones/repositorios Prisma para que no se disperse por componentes. No se separan procesos o servicios en red sin necesidad funcional.

### Módulos funcionales

- `catalogo`: productos, categorías y disponibilidad visible.
- `sucursales`: información, horarios y configuración de domicilio.
- `pedidos`: carrito, recepción, validación, preparación, cancelación y seguimiento.
- `mesas`: sesión QR, pedidos asociados y cuenta.
- `pagos`: intentos, comprobante (máximo uno por intento), verificación y reembolso manual total.
- `inventario`: existencias y movimientos.
- `reposiciones`: solicitudes, despachos, recepciones parciales, cierres y anulaciones aprobadas.
- `entregas`: asignación/estado del repartidor, recaudo y conciliación simple por entrega.
- `administracion`: usuarios, roles, sucursales y parámetros.
- `reportes-auditoria`: consultas aprobadas e historial administrativo.

Los módulos comparten la base de datos, pero acceden a otros procesos a través de servicios, no importando componentes de interfaz entre sí. Esta organización es una guía lógica, no implica crear un paquete independiente para cada módulo desde el inicio.

## Estructura de carpetas propuesta para el futuro

```text
src/
├── app/
│   ├── (publico)/
│   ├── mesa/[token]/
│   ├── seguimiento/[codigo]/
│   └── admin/
├── components/
│   ├── ui/                 # componentes base reutilizables
│   ├── public/             # presentación y catálogo
│   ├── ordering/           # carrito y flujo de pedido
│   ├── mesa/               # UI QR
│   └── admin/              # navegación, tablas y formularios
├── features/               # módulos verticales por dominio
├── server/
│   ├── auth/
│   ├── services/
│   ├── repositories/
│   └── db/                  # cliente Prisma únicamente en servidor
├── lib/                     # validación, utilidades y configuración
└── types/
prisma/                      # modelo/migraciones solo tras autorización
```

La estructura prioriza componentes y código del servidor separados sin obligar a crear abstracciones vacías. Las carpetas son una propuesta de arranque, no fueron creadas en esta etapa.

## Rutas

| Ruta | Propósito | Acceso |
|---|---|---|
| `/` | Inicio y presentación | Público |
| `/menu` | Catálogo, productos y categorías | Público |
| `/sucursales` | Ubicaciones e información | Público |
| `/pedido` | Carrito y selección/configuración de pedido | Público |
| `/seguimiento/[codigo]` | Estado del pedido con datos mínimos | Público con código no adivinable |
| `/mesa/[token]` | Catálogo y pedidos de una sesión QR activa | Token válido |
| `/admin` | Resumen operativo | Usuario autenticado y autorizado |
| `/admin/pedidos` | Atención, aceptación, preparación y estado | Rol/sucursal |
| `/admin/mesas` | Sesiones y cuentas | Rol/sucursal |
| `/admin/pagos` | Intentos, comprobantes y verificación | Rol/sucursal |
| `/admin/inventario` | Existencias y movimientos | Rol/sucursal |
| `/admin/reposiciones` | Solicitudes, despachos, recepciones y cierres | Rol/sucursal de operación |
| `/admin/entregas` | Asignaciones, estados y recaudo | Rol/sucursal; repartidor limitado a asignaciones propias |
| `/admin/productos` | Productos y categorías | Rol autorizado |
| `/admin/usuarios` | Usuarios y asociaciones | Administrador |
| `/admin/reportes` | Reportes del alcance aprobado | Rol autorizado |
| `/admin/configuracion` | Sucursales, horarios y configuración | Administrador |

Los submódulos son rutas o vistas dentro de esta aplicación, no aplicaciones independientes. Las rutas exactas pueden consolidarse al elaborar navegación UI/UX; no agregar páginas para capacidades futuras.

## Autenticación, autorización y sucursales

- El servidor verifica identidad en cada operación protegida. La sesión de mesa por token QR no equivale a una cuenta de usuario.
- Autorización por rol y sucursal usando las asociaciones del dominio `UsuarioRol` y `UsuarioSucursal`; no hay permisos configurables por individuo.
- El administrador no hereda permisos operativos automáticamente. Una persona puede realizar y autorizar una operación ordinaria según su rol/sucursal; las anulaciones excepcionales pasan por administrador.
- El repartidor solo accede a entregas asignadas. La sucursal solicitante/proveedora determina el contexto de las operaciones de reposición.
- No se confía en `role`, sucursal, precio, saldo, inventario o estado enviado desde el navegador; el servidor vuelve a obtenerlos/verificarlos.

La tecnología concreta de autenticación se decidirá al preparar el proyecto según el stack seleccionado y las necesidades locales. Evitar diseñar un sistema de permisos genérico.

## Validación, errores y consistencia

- Validar entradas en servidor con esquemas Zod; validación del navegador mejora UX, pero no sustituye seguridad.
- Respuestas de error deben ser comprensibles y no filtrar stack traces, datos de pago o información personal.
- Errores esperados (validación, conflicto de estado, falta de autorización) se distinguen de fallos inesperados y se registran sin datos sensibles.
- Usar transacciones para aceptar pedidos y descontar stock, registrar recepción y actualizar inventario, cambios de estado concurrentes y operaciones de pago que requieran consistencia.
- Revalidar el saldo bajo concurrencia; nunca permitir existencias negativas.
- Eventos de despacho/recepción originales se conservan. La anulación documental no aplica automáticamente movimientos compensatorios; movimientos pendientes no cambian existencia disponible. Si el producto fue consumido, revisión administrativa.

## Archivos y datos sensibles

Comprobantes: máximo un archivo por intento de pago. Mantener acceso privado y guardar en la base metadatos/referencia, no el contenido binario grande si la solución local elegida permite guardarlo en almacenamiento privado. El mecanismo local concreto (directorio protegido u opción equivalente) se definirá antes de implementarlo; no exponer rutas de archivos ni servirlos públicamente. Si el comprobante se rechaza definitivamente, aplicar la decisión del SRS sobre eliminación del archivo y conservar trazabilidad del intento.

Minimizar datos personales expuestos en seguimiento, logs y reportes. Credenciales nunca se almacenan en texto plano. Secrets/configuración se mantienen fuera del repositorio.

## Ejecución local

Desarrollar y demostrar localmente con Node.js, Next.js y PostgreSQL local, sin servicios obligatorios de pago. La interfaz web puede abrirse desde otro equipo en la misma red local si se configura de forma segura. No decidir todavía el despliegue público ni prometer niveles gratuitos de terceros.

## Decisiones abiertas de arquitectura

- Mecanismo concreto de autenticación y manejo de sesión web.
- Ubicación local privada de comprobantes y política de respaldo/eliminación.
- Versiones compatibles de dependencias al iniciar el repositorio de aplicación.
- Necesidad de notificaciones casi en tiempo real; la primera versión puede usar actualización explícita o refresco razonable si satisface el SRS.

No bloquean el diseño de alto nivel ni justifican añadir infraestructura. Resolver antes del módulo correspondiente.
