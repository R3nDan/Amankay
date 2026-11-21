# Modelo UML de Amankay

## Estado y alcance

Este documento consolida actores, casos de uso y clases conceptuales del MVP. Las decisiones listadas aquí fueron aprobadas conjuntamente; no implica aprobación final del MER ni autorización para programar o crear la base de datos. La descripción de entidades y cardinalidades se mantiene alineada con [MER.md](MER.md).

## Actores

- **Cliente:** consulta catálogo y sucursales, realiza pedidos y consulta su seguimiento; no se exige inicio de sesión.
- **Atención/caja:** gestiona mesas y pedidos, verifica pagos, registra pagos y recibe/coordina pedidos externos.
- **Encargado de inventario:** opera inventario y reposiciones según su asociación a la sucursal solicitante o proveedora.
- **Repartidor:** usuario con rol asignado; realiza entregas y declara el recaudo entregado a sucursal.
- **Empleado autorizado de sucursal:** registra el monto recibido del repartidor.
- **Administrador:** gestiona configuración y usuarios; interviene en anulaciones excepcionales. No obtiene permisos operativos automáticamente.

Los permisos se determinan por rol y sucursal con `UsuarioRol` y `UsuarioSucursal`. No existen permisos individuales ni doble autorización obligatoria por defecto. Una misma persona puede registrar y autorizar operaciones ordinarias.

## Casos de uso por módulo

| Módulo | Casos de uso principales |
| --- | --- |
| Catálogo y sucursales | Consultar productos, categorías, precios, disponibilidad y sucursales. |
| Pedidos | Crear pedido QR, externo, domicilio o recogida; revisar/aceptar/rechazar; consultar estado; cancelar conforme al flujo aprobado; registrar manualmente pedidos de WhatsApp. |
| Mesas | Abrir sesión y cuenta conjuntamente; aceptar pedidos QR en la sesión; cerrar sesión y cuenta independientemente; cobrar saldo pendiente. |
| Pagos | Registrar intentos en efectivo o transferencia, verificar/rechazar y gestionar reembolso manual total. Máximo un comprobante por intento; cada reintento es otro `Pago`. |
| Inventario | Consultar existencias y movimientos; registrar ajustes permitidos; impedir saldos negativos. |
| Reposición | Solicitar, revisar, aprobar/rechazar, despachar parcialmente y recibir parcial o totalmente; registrar apto/dañado y cierre final de faltante por línea. |
| Entregas | Asignar repartidor, actualizar estado, registrar entrega y conciliar una vez el recaudo por entrega en efectivo. |
| Administración | Gestionar usuarios, roles, sucursales, productos, horarios, mesas y configuración; consultar reportes y auditoría administrativa. |

## Diagrama general de casos de uso

```plantuml
@startuml
left to right direction
actor Cliente
actor "Atención / Caja" as Atencion
actor "Encargado de inventario" as Inventario
actor Repartidor
actor "Empleado receptor" as Receptor
actor Administrador
rectangle Amankay {
  usecase "Consultar catálogo y sucursales" as UC1
  usecase "Crear pedido" as UC2
  usecase "Consultar seguimiento" as UC3
  usecase "Gestionar pedidos y mesas" as UC4
  usecase "Abrir sesión y cuenta" as UC5
  usecase "Registrar / verificar pagos" as UC6
  usecase "Gestionar inventario" as UC7
  usecase "Gestionar reposiciones" as UC8
  usecase "Registrar entrega" as UC9
  usecase "Declarar recaudo" as UC10
  usecase "Registrar monto recibido" as UC11
  usecase "Administrar y auditar" as UC12
}
Cliente -- UC1
Cliente -- UC2
Cliente -- UC3
Atencion -- UC4
Atencion -- UC5
Atencion -- UC6
Inventario -- UC7
Inventario -- UC8
Repartidor -- UC9
Repartidor -- UC10
Receptor -- UC11
Administrador -- UC12
Administrador -- UC9 : anulaciones excepcionales
@enduml
```

## Modelo de clases conceptual

### Entidades principales y asociativas

`Usuario`, `Rol`, `Sucursal`, `UsuarioRol`, `UsuarioSucursal`, `Categoria`, `Producto`, `InventarioSucursal`, `MovimientoInventario`, `Pedido`, `DetallePedido`, `Mesa`, `SesionMesa`, `CuentaMesa`, `Pago`, `ConciliacionEfectivo`, `Entrega`, `ConfiguracionDomicilio`, `SolicitudReposicion`, `DetalleSolicitudReposicion`, `DespachoReposicion`, `DetalleDespachoReposicion`, `RecepcionReposicion`, `DetalleRecepcionReposicion`, `HorarioSucursal`, `RegistroAuditoria`.

`UsuarioRol` y `UsuarioSucursal` son asociaciones M:N con claves compuestas por sus dos FK. No se modelan clases separadas `ComprobantePago`, `Reembolso`, `MovimientoBancario`, `Repartidor`, `DetalleCuenta` ni `CierreFaltanteReposicion`.

### Relaciones y reglas de multiplicidad

- `Usuario` M:N `Rol` por `UsuarioRol`; `Usuario` M:N `Sucursal` por `UsuarioSucursal`.
- `Sucursal` 1:N `Mesa`, `InventarioSucursal`, `HorarioSucursal` y movimientos asociados.
- `Pedido` 1:N `DetallePedido`; `Pedido` puede tener 0..1 `Entrega`, y `Entrega` pertenece a un pedido domiciliario. La sucursal responsable deriva del pedido.
- `SesionMesa` y `CuentaMesa` tienen relación obligatoria 1:1. Se crean juntas; sus cierres son independientes. No se abre otra sesión en la mesa mientras su cuenta siga abierta.
- `CuentaMesa` 1:N `Pedido` QR. `Pedido.cuentaMesaId` es obligatorio para `QR_MESA` y nulo para pedidos externos.
- `Pago` representa un intento y se relaciona con exactamente uno de `Pedido` externo o `CuentaMesa`. Contiene opcionalmente un comprobante; cada reintento es otro `Pago`.
- `Entrega` 0..1 `ConciliacionEfectivo`; conciliación tiene FK `entregaId` única. El repartidor declara el monto y el empleado autorizado de la sucursal registra lo recibido. Diferencia exige motivo; rectificación excepcional queda en `RegistroAuditoria`.
- `SolicitudReposicion` 1:N `DetalleSolicitudReposicion` y 1:N `DespachoReposicion`; despacho 1:N `DetalleDespachoReposicion`.
- `DespachoReposicion` 1:N `RecepcionReposicion`; recepción 1:N `DetalleRecepcionReposicion`. Cada detalle recibido referencia una línea despachada concreta.
- Se registra como máximo un cierre final por detalle de solicitud (antes del despacho) o detalle de despacho (después). Los datos del cierre y de una eventual reversa total se guardan en ese mismo detalle. La reversa conserva los datos originales y restaura solo el saldo que cerró; no hay entidad de cierre ni ciclos múltiples.

### Reposición, correcciones y cantidades

Estados de solicitud: `PENDIENTE_REVISION`, `RECHAZADA`, `EN_PROCESO`, `COMPLETADA`. `BORRADOR` solo se usa si el flujo requiere guardar sin enviar. Los pendientes se calculan a partir de cantidades; no se almacenan contadores duplicados.

Un despacho o recepción erróneos se corrigen mediante anulación completa cuando sus dependencias puedan gestionarse de forma segura, y registro nuevo. El evento original permanece. La anulación documental no modifica inventario automáticamente; un movimiento compensatorio es independiente y no puede generar stock negativo. Si el producto ya fue consumido, se deriva a revisión administrativa: no se reescriben ventas, ni se generan deudas, pérdidas automáticas o regularizaciones complejas.

Para `DetalleSolicitudReposicion`, pendiente de despacho = cantidad aprobada − suma enviada en despachos vigentes − cierre previo vigente. Para `DetalleDespachoReposicion`, pendiente de recepción = cantidad enviada vigente − suma recibida apta/dañada vigente − cierre posterior vigente. Un cierre revertido cuenta como cero y devuelve el saldo correspondiente; los dos tipos de cierre nunca reducen el mismo saldo.

El personal autorizado de inventario gestiona operaciones según la sucursal asociada. El administrador interviene en anulaciones excepcionales. No se exige doble autorización para operaciones ordinarias. El UML de clases resumido representa las entidades y asociaciones principales; los atributos de cierre/reversa están especificados en el MER y no introducen clase adicional.

### Diagrama de clases resumido

```plantuml
@startuml
class Usuario
class Rol
class Sucursal
class UsuarioRol
class UsuarioSucursal
class Pedido
class DetallePedido
class Mesa
class SesionMesa
class CuentaMesa
class Pago
class Entrega
class ConciliacionEfectivo
class SolicitudReposicion
class DetalleSolicitudReposicion
class DespachoReposicion
class DetalleDespachoReposicion
class RecepcionReposicion
class DetalleRecepcionReposicion
class InventarioSucursal
class MovimientoInventario
class RegistroAuditoria

Usuario "1" -- "0..*" UsuarioRol
Rol "1" -- "0..*" UsuarioRol
Usuario "1" -- "0..*" UsuarioSucursal
Sucursal "1" -- "0..*" UsuarioSucursal
SesionMesa "1" -- "1" CuentaMesa
CuentaMesa "1" -- "0..*" Pedido
Pedido "1" -- "1..*" DetallePedido
Pedido "1" -- "0..1" Entrega
Entrega "1" -- "0..1" ConciliacionEfectivo
Pedido "1" -- "0..*" Pago : externo XOR cuenta
CuentaMesa "1" -- "0..*" Pago
SolicitudReposicion "1" -- "1..*" DetalleSolicitudReposicion
SolicitudReposicion "1" -- "0..*" DespachoReposicion
DespachoReposicion "1" -- "1..*" DetalleDespachoReposicion
DespachoReposicion "1" -- "0..*" RecepcionReposicion
RecepcionReposicion "1" -- "1..*" DetalleRecepcionReposicion
DetalleDespachoReposicion "1" -- "0..*" DetalleRecepcionReposicion
Sucursal "1" -- "0..*" InventarioSucursal
InventarioSucursal "1" -- "0..*" MovimientoInventario
@enduml
```

El diagrama es conceptual: la regla XOR de origen de `Pago`, la obligatoriedad de la cuenta en pedidos QR y otros controles entre entidades requieren restricciones y validación descritas en el MER.

## Fuentes

Las decisiones consolidadas derivan del SRS y de las once conversaciones enlazadas en su sección de trazabilidad. Este documento y el MER deben actualizarse conjuntamente ante nuevas decisiones.
