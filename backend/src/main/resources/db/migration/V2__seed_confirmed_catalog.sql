INSERT INTO rol (id, nombre, descripcion) VALUES
('40000000-0000-0000-0000-000000000001', 'ADMINISTRADOR', 'Administra usuarios y configuración.'),
('40000000-0000-0000-0000-000000000002', 'ATENCION', 'Gestiona pedidos, pagos y operaciones de atención.'),
('40000000-0000-0000-0000-000000000003', 'INVENTARIO', 'Gestiona existencias y reposiciones en sucursales asignadas.'),
('40000000-0000-0000-0000-000000000004', 'REPARTIDOR', 'Consulta y actualiza entregas asignadas.');

INSERT INTO sucursal (id, nombre, direccion, telefono, tipo, activa) VALUES
('20000000-0000-0000-0000-000000000001', 'Sede principal', 'Calle 4 # 5-55, Centro de Neiva', '312 586 4045', 'PRINCIPAL', TRUE),
('20000000-0000-0000-0000-000000000002', 'Sede secundaria', 'Carrera 7 # 19-20, Neiva', '312 586 4045', 'SECUNDARIA', TRUE);

INSERT INTO categoria (id, nombre, descripcion, activa) VALUES
('10000000-0000-0000-0000-000000000001', 'Panadería', 'Panes, croissants y mojicones.', TRUE),
('10000000-0000-0000-0000-000000000002', 'Fritos', 'Empanadas y pasteles.', TRUE),
('10000000-0000-0000-0000-000000000003', 'Bebidas', 'Avena, sevillana y guarapo.', TRUE);

INSERT INTO producto (id, categoria_id, nombre, descripcion, imagen, precio, activo) VALUES
('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Pan de queso','Miga tierna y dorado apetitoso: un clásico para disfrutar sin afán.','/imagenes/productos/panaderia/pan-queso.webp',2000,TRUE),
('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Croissant','Capas delicadas, exterior dorado y forma de media luna irresistible.','/imagenes/productos/panaderia/Croissant.jpeg',2000,TRUE),
('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','Mojicón de bocadillo','Suave por dentro, doradito por fuera y con el dulce sabor del bocadillo.','/imagenes/productos/panaderia/mojicon-bocadillo.webp',2000,TRUE),
('30000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','Pan hawaiano','Un pan suave y dorado, perfecto para darle un toque especial a la pausa.','/imagenes/productos/panaderia/pan-hawaiano.webp',2000,TRUE),
('30000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001','Pan de salchicha','Pan suave con salchicha: práctico, sabroso y listo para disfrutar.','/imagenes/productos/panaderia/pan-salchicha.webp',2000,TRUE),
('30000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000001','Pan agridulce','Un bocado de contraste entre notas dulces y saladas, con miga suave.','/imagenes/productos/panaderia/pan-agridulce.webp',2000,TRUE),
('30000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000001','Mojicón de queso','Mojicón dorado con queso: pequeño, suave y lleno de sabor.','/imagenes/productos/panaderia/mojicon-queso.webp',2000,TRUE),
('30000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000001','Mojicón de arequipe y queso','El encuentro del arequipe y el queso en un mojicón tierno y doradito.','/imagenes/productos/panaderia/mojicon-arequipe-queso.webp',2000,TRUE),
('30000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000002','Empanada','Masa crujiente, forma clásica y un relleno que invita a otro mordisco.','/imagenes/productos/fritos/empanada.webp',3500,TRUE),
('30000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000002','Arepa de huevo','Arepa dorada y crujiente, con huevo en el corazón de cada bocado.','/imagenes/productos/fritos/arepa-huevo.webp',3500,TRUE),
('30000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000002','Pastel de carne','Masa doradita y relleno de carne: un frito contundente para cualquier pausa.','/imagenes/productos/fritos/pastel-carne.webp',3500,TRUE),
('30000000-0000-0000-0000-000000000012','10000000-0000-0000-0000-000000000002','Pastel de chorizo','Crujiente por fuera y con el sabor intenso del chorizo en su interior.','/imagenes/productos/fritos/pastel-chorizo.webp',3500,TRUE),
('30000000-0000-0000-0000-000000000013','10000000-0000-0000-0000-000000000002','Pastel de huevo','Una cubierta dorada guarda un relleno sencillo y sabroso de huevo.','/imagenes/productos/fritos/pastel-huevo.webp',3500,TRUE),
('30000000-0000-0000-0000-000000000014','10000000-0000-0000-0000-000000000002','Pastel mixto','Una mezcla de sabores envuelta en masa crujiente, ideal para abrir el apetito.','/imagenes/productos/fritos/pastel-mixto.webp',3500,TRUE),
('30000000-0000-0000-0000-000000000015','10000000-0000-0000-0000-000000000002','Pastel de pollo','Pollo envuelto en una masa dorada y crujiente, perfecto para cualquier pausa.','/imagenes/productos/fritos/pastel-pollo.webp',3500,TRUE),
('30000000-0000-0000-0000-000000000016','10000000-0000-0000-0000-000000000003','Avena','Suave y refrescante, acompaña muy bien una pausa con pan o algo frito.','/imagenes/productos/Bebidas/Avena.jpeg',3500,TRUE),
('30000000-0000-0000-0000-000000000017','10000000-0000-0000-0000-000000000003','Sevillana','Una bebida tradicional, fresca y lista para acompañar tus antojos.','/imagenes/productos/Bebidas/Sevillana.jpeg',3500,TRUE),
('30000000-0000-0000-0000-000000000018','10000000-0000-0000-0000-000000000003','Guarapo','Fresco y sencillo: el compañero ideal para bajar el calor y seguir disfrutando.','/imagenes/productos/Bebidas/Gurapo.jpeg',3000,TRUE);

INSERT INTO horario_sucursal (id, sucursal_id, dia_semana, hora_apertura, hora_cierre, activo)
SELECT
    ('60000000-0000-0000-0000-' || LPAD((ROW_NUMBER() OVER (ORDER BY s.id, d.dia))::text, 12, '0'))::uuid,
    s.id, d.dia, d.apertura, d.cierre, d.activo
FROM sucursal s
CROSS JOIN (VALUES
    ('LUNES','06:30'::time,'18:30'::time,TRUE),
    ('MARTES','06:30'::time,'18:30'::time,TRUE),
    ('MIERCOLES','06:30'::time,'18:30'::time,TRUE),
    ('JUEVES','06:30'::time,'18:30'::time,TRUE),
    ('VIERNES','06:30'::time,'18:30'::time,TRUE),
    ('SABADO','06:30'::time,'13:00'::time,TRUE),
    ('DOMINGO','00:00'::time,'00:00'::time,FALSE)
) AS d(dia, apertura, cierre, activo);

INSERT INTO configuracion_domicilio (id, tarifa, activo)
VALUES ('50000000-0000-0000-0000-000000000001', 2000, TRUE);
