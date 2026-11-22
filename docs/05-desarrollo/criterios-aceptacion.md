# Criterios de aceptación del MVP

Propuesta documental para revisión. Los criterios describen resultados observables; no son una suite de pruebas técnicas ni autorizan a implementar todavía. Los límites marcados **por definir** requieren acuerdo antes de cerrar el diseño.

| Área | Criterio de aceptación observable |
| --- | --- |
| Acceso y permisos | Cada persona con rol interno ve las opciones correspondientes a su rol; el repartidor solo ve sus entregas. Los clientes pueden consultar catálogo sin sesión; para pedir en mesa sí se necesita una sesión QR válida. Recuperación de contraseña y política de bloqueo: por definir. |
| Productos | Una persona administradora autorizada puede crear/editar/desactivar producto y precio global; producto desactivado no aparece como disponible para nuevos pedidos. |
| Inventario | Una aceptación descuenta una vez las cantidades pedidas en la sucursal responsable; si no hay stock suficiente, la operación no deja saldo negativo ni pedido aceptado. Los ajustes y mermas se registran con trazabilidad; los permisos y motivos obligatorios concretos siguen pendientes. |
| Recogida | Si la sede elegida no puede completar el carrito, el cliente ve los productos que faltan y una recomendación que sí cubre el carrito completo; no se genera un pedido incompleto silenciosamente. |
| Domicilio | La sucursal se asigna con stock del pedido completo y proximidad, sin fraccionar. Si ninguna sede puede completar el pedido, no se asigna ni acepta; el mensaje y las alternativas que verá el cliente se definirán en UX. Para el prototipo se muestra cobertura solo en Neiva y un recargo de 2.000 COP por solicitud. |
| Pedido externo | Un pedido puede aceptarse/rechazarse por personal; cliente puede consultar estado e historial con un código impredecible. La página pública no muestra dirección completa ni teléfono. |
| WhatsApp | Desde un enlace se abre conversación con el negocio; no se usa API. Personal registra manualmente el pedido en el panel y luego sigue el flujo común. |
| Pedido QR | QR identifica sucursal y mesa; sin sesión activa no permite enviar pedido. El personal inicia/cierra sesión; al cierre se invalida el acceso. Varios dispositivos pueden pedir durante sesión. |
| Cuenta de mesa | Varios pedidos aceptados de la sesión se reflejan en una cuenta derivada de dichos pedidos; no existe entidad DetalleCuenta. Cerrar la sesión invalida el token QR; la cuenta se cierra por separado. No se permite abrir otra sesión mientras la cuenta anterior siga abierta. El importe permitido por intento (pago total o parcial del saldo) sigue pendiente; no asumir pagos mixtos. |
| Pagos | Transferencia requiere comprobante y verificación manual; efectivo se registra desde el panel. Se permiten varios intentos, no se recibe más del saldo pendiente, un pago se vincula a pedido externo o cuenta de mesa, nunca a ambos. El reembolso manual es exclusivamente total, como máximo uno por `Pago` confirmado; no existe reembolso parcial. |
| Repartos | Atención asigna manualmente repartidor; solo ese repartidor accede a la entrega. No puede marcarla entregada sin transición de recogida. Un fallo queda registrado en `Entrega` mediante estado `NO_ENTREGADA` y observaciones; la autorización de reintento/retorno corresponde a un flujo aún pendiente. |
| Entrega fallida | Se registra la incidencia en Entrega. La gestión formal de devoluciones e inspecciones queda fuera del MVP; productos que regresen físicamente no se reincorporan automáticamente al inventario disponible. |
| Reposición | Sucursal secundaria solicita; principal revisa y despacha; secundaria registra recepción y diferencias. Se permiten múltiples despachos y recepciones parciales por solicitud, sin límite funcional fijo; cada recepción referencia el despacho concreto. |
| Administración | Horarios configurables por sede; catálogo y precios globales; la configuración general de domicilio aplica la cobertura inicial Neiva y tarifa configurable de 2.000 COP; la sucursal se asigna por disponibilidad del pedido completo y proximidad. Reportes muestran ventas, pedidos, inventario y reposiciones; no productos más vendidos. |
| Usabilidad | Representantes de roles completan tareas principales sin asistencia y valoran facilidad de uso. Tamaño de muestra, tareas, escala y umbral de éxito: por definir con objetivo académico. |

Estos criterios deben revisarse contra el SRS y la matriz de [pendientes](../03-arquitectura/pendientes-y-decisiones.md), y aprobarse antes de diseñar una batería de pruebas.
