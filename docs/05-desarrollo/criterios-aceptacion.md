# Criterios de aceptación del MVP

Propuesta documental para revisión. Los criterios describen resultados observables; no son una suite de pruebas técnicas ni autorizan a implementar todavía. Los límites marcados **por definir** requieren acuerdo antes de cerrar el diseño.

| Área | Criterio de aceptación observable |
| --- | --- |
| Acceso y permisos | Cada persona con rol interno ve las opciones correspondientes a su rol; el repartidor solo ve sus entregas. Los clientes pueden consultar catálogo sin sesión; para pedir en mesa sí se necesita una sesión QR válida. Recuperación de contraseña y política de bloqueo: por definir. |
| Productos | Una persona administradora autorizada puede crear/editar/desactivar producto y precio global; producto desactivado no aparece como disponible para nuevos pedidos. |
| Inventario | Una aceptación descuenta una vez las cantidades pedidas en la sucursal responsable; si no hay stock suficiente, la operación no deja saldo negativo ni pedido aceptado. Ajustes exigen motivo (decisión reportada, por verificar). |
| Recogida | Si la sede elegida no puede completar el carrito, el cliente ve los productos que faltan y una recomendación que sí cubre el carrito completo; no se genera un pedido incompleto silenciosamente. |
| Domicilio | La sucursal se asigna con stock del pedido completo y proximidad, sin fraccionar. Si ninguna puede completar, se informa y no se confirma el pedido. Cobertura Neiva y tarifa de 4.000 COP se muestran de acuerdo con la configuración aprobada. |
| Pedido externo | Un pedido puede aceptarse/rechazarse por personal; cliente puede consultar estado e historial con un código impredecible. La página pública no muestra dirección completa ni teléfono. |
| WhatsApp | Desde un enlace se abre conversación con el negocio; no se usa API. Personal registra manualmente el pedido en el panel y luego sigue el flujo común. |
| Pedido QR | QR identifica sucursal y mesa; sin sesión activa no permite enviar pedido. El personal inicia/cierra sesión; al cierre se invalida el acceso. Varios dispositivos pueden pedir durante sesión. |
| Cuenta de mesa | Varios pedidos aceptados de la sesión se reflejan en una cuenta derivada de dichos pedidos; no existe entidad DetalleCuenta. Pago y cierre liberan mesa e invalidan sesión. Las reglas completas de pago mixto o pagos parciales quedan pendientes. |
| Pagos | Transferencia requiere comprobante y verificación manual; efectivo se registra desde el panel. Se permiten varios intentos, no se recibe más del saldo pendiente, un pago se vincula a pedido externo o cuenta de mesa, nunca a ambos. Reembolsos manuales parciales o totales no exceden lo recibido. |
| Repartos | Atención asigna manualmente repartidor; solo ese repartidor accede a la entrega. No puede marcarla entregada sin transición de recogida. Un fallo queda con estado y observación; decisión de reintento/retorno corresponde a flujo pendiente. |
| Devoluciones | Producto devuelto no aparece disponible hasta inspección. Unidad apta se reincorpora con movimiento; unidad no apta se registra como pérdida con motivo. |
| Reposición | Sucursal secundaria solicita; principal revisa y despacha; secundaria registra recepción y diferencias. La recepción parcial sigue siendo la decisión histórica aprobada. |
| Administración | Horarios configurables por sede; catálogo y precios globales; tarifa general de domicilio y alcance de sedes se validan cuando se confirme su cardinalidad. Reportes muestran ventas, pedidos, inventario y reposiciones; no productos más vendidos. |
| Usabilidad | Representantes de roles completan tareas principales sin asistencia y valoran facilidad de uso. Tamaño de muestra, tareas, escala y umbral de éxito: por definir con objetivo académico. |

Estos criterios deben revisarse contra el SRS y la matriz de [pendientes](../03-arquitectura/pendientes-y-decisiones.md), y aprobarse antes de diseñar una batería de pruebas.
