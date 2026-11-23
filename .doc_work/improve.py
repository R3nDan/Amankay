from pathlib import Path
from io import BytesIO
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'Copia_documentacion_mejorada.docx'
OUT = ROOT / 'Copia_documentacion_final.docx'
ASSETS = ROOT / '.doc_work'
INK = '#30231D'; MARFIL = '#F7F4ED'; CACAO = '#6B3F2A'; CREMA = '#FAF0DD'
TRIGO = '#EDD2A5'; DURAZNO = '#E2B28A'; COBRE = '#C48359'; MUTED = '#746052'
BLUE = '#416FB9'

def font(n, bold=False):
    f = Path('C:/Windows/Fonts/arialbd.ttf' if bold else 'C:/Windows/Fonts/arial.ttf')
    return ImageFont.truetype(str(f), n)

def graphic(name, title, rows, kind='flow'):
    im = Image.new('RGB', (1400, 800), '#FFFFFF'); dr = ImageDraw.Draw(im)
    dr.text((700, 48), title, font=font(39, True), fill=INK, anchor='mm')
    if kind == 'flow':
        x0 = 95; y = 170; w = 230; gap = 35
        for i, (head, sub) in enumerate(rows):
            x = x0 + i * (w + gap)
            dr.rounded_rectangle((x,y,x+w,y+230),radius=24,fill=CREMA,outline=CACAO,width=4)
            dr.text((x+w/2,y+70),head,font=font(27,True),fill=CACAO,anchor='mm')
            for j,line in enumerate(sub.split('|')):
                dr.text((x+w/2,y+125+j*33),line,font=font(21),fill=INK,anchor='mm')
            if i < len(rows)-1:
                cy=y+115; dr.line((x+w+5,cy,x+w+gap-7,cy),fill=CACAO,width=5)
                dr.polygon([(x+w+gap-4,cy),(x+w+gap-18,cy-10),(x+w+gap-18,cy+10)],fill=CACAO)
        dr.rounded_rectangle((260,520,1140,675),radius=25,fill=MARFIL,outline=COBRE,width=3)
        dr.text((700,565),'Seguimiento transversal',font=font(27,True),fill=CACAO,anchor='mm')
        dr.text((700,615),'SRS · decisiones · Git · pruebas · revisión',font=font(22),fill=INK,anchor='mm')
    elif kind == 'arch':
        items=[('Cliente y personal',70,215,250,130),('Next.js / React',385,215,270,130),('API Java / Spring Boot',730,215,300,130),('PostgreSQL',1090,215,240,130)]
        for label,x,y,w,h in items:
            dr.rounded_rectangle((x,y,x+w,y+h),radius=20,fill=CREMA,outline=CACAO,width=4)
            dr.text((x+w/2,y+h/2),label,font=font(25,True),fill=INK,anchor='mm')
        for xa,xb in [(320,385),(655,730),(1030,1090)]:
            dr.line((xa+6,280,xb-15,280),fill=CACAO,width=5)
            dr.polygon([(xb-8,280),(xb-26,269),(xb-26,291)],fill=CACAO)
        dr.rounded_rectangle((620,490,1020,640),radius=22,fill=MARFIL,outline=COBRE,width=4)
        dr.text((820,550),'Spring Security · JPA',font=font(25,True),fill=CACAO,anchor='mm')
        dr.text((820,592),'Flyway · OpenAPI / Swagger',font=font(21),fill=INK,anchor='mm')
        dr.line((860,345,860,490),fill=CACAO,width=4)
    elif kind == 'model':
        groups=[('Organización','Usuario ↔ Rol / Sucursal'),('Catálogo','Categoría → Producto'),('Pedido','Pedido → DetallePedido'),('Mesa','Mesa → Sesión → Cuenta'),('Pago','Pedido o Cuenta → Pago'),('Inventario','Sucursal + Producto → Saldo'),('Reposición','Solicitud → Despacho → Recepción'),('Entrega','Pedido → Entrega')]
        for i,(h,s) in enumerate(groups):
            col=i%2;row=i//2;x=80+col*660;y=150+row*145
            dr.rounded_rectangle((x,y,x+590,y+112),radius=18,fill=CREMA if row%2==0 else MARFIL,outline=CACAO,width=3)
            dr.text((x+25,y+37),h,font=font(25,True),fill=CACAO,anchor='lm')
            dr.text((x+25,y+78),s,font=font(22),fill=INK,anchor='lm')
    elif kind == 'mock':
        dr.rounded_rectangle((125,125,1275,725),radius=25,fill=MARFIL,outline=CACAO,width=4)
        dr.rectangle((125,125,1275,210),fill=CREMA)
        dr.text((180,168),'AMANKAY',font=font(29,True),fill=CACAO,anchor='lm')
        dr.text((1200,168),rows[0][0],font=font(21),fill=INK,anchor='rm')
        dr.line((130,210,1270,210),fill=CACAO,width=3)
        for i,(head,sub) in enumerate(rows[1:]):
            x=175+(i%2)*540;y=260+(i//2)*185
            dr.rounded_rectangle((x,y,x+470,y+145),radius=16,fill=CREMA if i%2==0 else '#FFFFFF',outline=COBRE,width=3)
            dr.text((x+24,y+45),head,font=font(25,True),fill=CACAO,anchor='lm')
            dr.text((x+24,y+95),sub,font=font(20),fill=INK,anchor='lm')
    path=ASSETS / f'{name}.png'; im.save(path); return path

figs = {
 'process':graphic('process','Proceso de desarrollo de Amankay', [('Análisis','Actores|Requisitos'),('Diseño','UML / MER|Interfaces'),('Construcción','Web / API|PostgreSQL'),('Verificación','Pruebas|Despliegue')]),
 'arch':graphic('arch','Arquitectura lógica del sistema',[], 'arch'),
 'model':graphic('model','Modelo de datos por dominios',[], 'model'),
 'roles':graphic('roles','Actores y funciones', [('Cliente',''),('Atención','Pedidos y mesas'),('Inventario','Stock y reposición'),('Repartidor','Entregas propias'),('Administrador','Usuarios y configuración')], 'mock'),
 'public':graphic('public','Sitio público y pedido', [('Inicio · menú · sucursales',''),('Catálogo','Categorías y productos'),('Pedido','Recogida o domicilio'),('Seguimiento','Código y estado')], 'mock'),
 'qr':graphic('qr','Experiencia de mesa con QR', [('Mesa identificada · sesión activa',''),('Categorías','Catálogo disponible'),('Carrito','Cantidades y total'),('Pedido enviado','Estado por pedido'),('Acceso temporal','Cierre o expiración')], 'mock'),
 'admin':graphic('admin','Panel operativo por rol', [('Sucursal activa · navegación',''),('Pedidos','Cola y decisiones'),('Inventario','Existencias y movimientos'),('Reposiciones','Solicitud y recepción'),('Reportes','Ventas y estados')], 'mock')
 ,'orders':graphic('orders','Gestión de pedidos', [('Pedidos · sucursal activa',''),('Cola','Llegada y prioridad visual'),('Detalle','Líneas, total y pago'),('Decisión','Aceptar o rechazar'),('Estado','Preparación y entrega')], 'mock')
 ,'inventory':graphic('inventory','Control de inventario', [('Inventario · sucursal',''),('Existencias','Disponible por producto'),('Movimiento','Tipo, cantidad y motivo'),('Ajuste','Personal autorizado'),('Historial','Origen y compensación')], 'mock')
 ,'replenish':graphic('replenish','Reposiciones entre sedes', [('Solicitud · estado',''),('Revisión','Aprobación por línea'),('Despacho','Cantidades parciales'),('Recepción','Apto y dañado'),('Cierre','Pendientes y reversa')], 'mock')
 ,'deliver':graphic('deliver','Entregas y recaudo', [('Entrega · estado',''),('Asignación','Repartidor autorizado'),('Recorrido','Recogida y camino'),('Resultado','Entrega o incidencia'),('Recaudo','Declarado y recibido')], 'mock')
}

d=Document(SRC)
def match(prefix):
    return next(p for p in d.paragraphs if p.text.strip().startswith(prefix))
def setp(prefix,text): match(prefix).text=text
def after(anchor,text,style=None):
    q=d.add_paragraph(text,style=style); anchor._p.addnext(q._p); return q
def before(anchor,text,style=None): return anchor.insert_paragraph_before(text,style=style)
def insert_table_after(anchor, headers, rows, widths=None):
    t=d.add_table(rows=1,cols=len(headers));t.style='Table Grid';t.alignment=WD_TABLE_ALIGNMENT.CENTER
    for j,h in enumerate(headers):
        cell=t.rows[0].cells[j];cell.text=h
        sh=OxmlElement('w:shd');sh.set(qn('w:fill'),CACAO[1:]);cell._tc.get_or_add_tcPr().append(sh)
        for run in cell.paragraphs[0].runs:run.bold=True;run.font.color.rgb=RGBColor(255,255,255)
    for row in rows:
        cells=t.add_row().cells
        for j,x in enumerate(row):cells[j].text=str(x)
    anchor._p.addnext(t._tbl)
    return t
def caption_before_table(t,title):
    p=d.add_paragraph(title,style='Caption');t._tbl.addprevious(p._p);return p
def replace_figure(caption_prefix,path,caption):
    cap=match(caption_prefix); prev=cap._p.getprevious()
    if prev is not None and prev.tag==qn('w:p'):
        from docx.text.paragraph import Paragraph
        q=Paragraph(prev,cap._parent);q.clear();q.alignment=WD_ALIGN_PARAGRAPH.CENTER;q.add_run().add_picture(str(path),width=Inches(6.1))
    cap.text=caption;cap.style='Caption'

# Correct existing draft and remove stray template instruction.
setp('La interfaz contiene prácticas de accesibilidad:',
 'El sitio público y la experiencia QR ofrecen español de Colombia e inglés. El selector cambia el idioma del documento, conserva la preferencia local y adapta textos públicos, categorías, productos, estados y formatos monetarios. El acceso y la navegación común del panel también traducen sus controles; las pantallas operativas conservan español. La interfaz utiliza HTML semántico, enlace para saltar al contenido, foco visible, etiquetas y nombres accesibles, anuncios de estado y gestión del foco dentro de diálogos. La preferencia de movimiento reducido detiene animaciones automáticas y permite reproducir manualmente el video del proceso. La evaluación formal de usabilidad y la auditoría completa de accesibilidad se encuentran entre las actividades de validación académica.')
setp('Como trabajo futuro se propone ejecutar una evaluación de usabilidad',
 'La siguiente etapa de validación contempla una evaluación de usabilidad con tareas representativas y una auditoría completa de accesibilidad. Para ampliar la operación se podrán cargar existencias reales, configurar coordenadas y cobertura de domicilios, completar recorridos autenticados de pedidos y QR y habilitar almacenamiento privado persistente para comprobantes. Estas actividades completan la preparación de la plataforma para una eventual operación sostenida.')
for p in d.paragraphs:
    if p.text.startswith('Es recomendable que incluya también un resumen de las contribuciones'):
        p._element.getparent().remove(p._element)
    if p.text.startswith('Se recomienda incluir como anexos el diagrama de casos de uso'):
        p.text='Los anexos reúnen los diagramas, tablas, decisiones de interfaz y evidencias técnicas que complementan el desarrollo descrito en el capítulo 3.'
setp('Agregar capturas propias de Inicio',
 'Las figuras de baja fidelidad documentan la organización de las pantallas públicas, QR y administrativas. Para la sustentación pueden acompañarse de capturas de la versión desplegada con datos de demostración, sin información personal, y con su fecha y fuente.')
replace_figure('Figura 1. Proceso',figs['process'],'Figura 1. Fases del desarrollo de Amankay. Fuente: elaboración propia.')
replace_figure('Figura A.1.',figs['arch'],'Figura 5. Arquitectura lógica de Amankay. Fuente: elaboración propia.')
replace_figure('Figura B.1.',figs['roles'],'Figura 6. Actores y funciones principales. Fuente: elaboración propia a partir del UML.')
replace_figure('Figura C.1.',figs['model'],'Figura 7. Dominios y relaciones principales del modelo de datos. Fuente: elaboración propia a partir del MER aprobado.')
setp('El sistema se construyó en entregas:', 'El sistema se construyó en entregas: sitio público, backend REST, base de datos, panel administrativo y despliegue de demostración. La Figura 5 resume la arquitectura lógica. Los anexos reúnen modelos, tablas de trazabilidad y esquemas de interfaz que ayudan a comprender el funcionamiento de la aplicación.')
setp('La solución sigue una arquitectura web cliente-servidor', 'La solución sigue una arquitectura web cliente-servidor de tres capas lógicas. Next.js presenta la interfaz y reenvía solicitudes; Spring Boot concentra reglas, autenticación y API REST; PostgreSQL conserva la información. Los módulos Java separan seguridad, catálogo, pedidos, mesas, pagos, inventario, reposiciones, entregas y reportes. JPA/Hibernate accede a la base y Flyway aplica migraciones versionadas. La Figura 5 representa el recorrido lógico de una solicitud.')

# Fill the original empty phase table.
t=d.tables[1]
phase=[('Fase','Actividad e instrumento'),('Análisis','SRS, actores, requisitos y decisiones registradas.'),('Diseño','UML, MER, modelo físico y wireframes.'),('Construcción','Git, Next.js, Spring Boot, JPA y Flyway.'),('Verificación','TypeScript, ESLint, Maven, PostgreSQL y logs de Render.')]
while len(t.rows)<len(phase):t.add_row()
for i,row in enumerate(phase):
    for j,val in enumerate(row):t.cell(i,j).text=val
for c in t.rows[0].cells:
    sh=OxmlElement('w:shd');sh.set(qn('w:fill'),CACAO[1:]);c._tc.get_or_add_tcPr().append(sh)
    for p0 in c.paragraphs:
        for r in p0.runs:r.bold=True;r.font.color.rgb=RGBColor(255,255,255)

# Add informative tables to the owning sections, in document order.
pal=[('Tinta','#30231D','Texto principal'),('Marfil','#F7F4ED','Fondo público'),('Blanco','#FFFFFF','Superficies auxiliares'),('Cacao','#6B3F2A','Navegación y acciones'),('Crema','#FAF0DD','Fondos cálidos'),('Trigo','#EDD2A5','Acentos'),('Durazno','#E2B28A','Superficies de acento'),('Cobre','#C48359','Detalles decorativos'),('Texto secundario','#746052','Texto de apoyo'),('Rojo semántico','#B33A35','Errores y acciones destructivas')]
tbl=insert_table_after(match('La interfaz contiene prácticas de accesibilidad:') if any(p.text.startswith('La interfaz contiene prácticas de accesibilidad:') for p in d.paragraphs) else match('El sitio público y la experiencia QR ofrecen español'),['Token','Color','Uso'],pal)
caption_before_table(tbl,'Tabla 7. Paleta cromática de Amankay. Fuente: documentación UI/UX del proyecto.')
ui=[('Responsive','Sitio público y QR con prioridad móvil; panel adaptable a tablet y escritorio.'),('Navegación','HTML semántico, enlace de salto, foco visible y controles con nombres accesibles.'),('Contraste','Combinaciones principales documentadas con contraste AA para texto normal.'),('Movimiento','`prefers-reduced-motion` detiene desplazamientos y reproducción automática del video.'),('Imágenes','Tamaños reservados, optimización y texto alternativo según el propósito.'),('Idiomas','Español de Colombia e inglés en público/QR; panel operativo en español.')]
tbl=insert_table_after(match('El sitio público y la experiencia QR ofrecen español'),['Aspecto','Aplicación en Amankay'],ui);caption_before_table(tbl,'Tabla 8. Criterios de experiencia y accesibilidad. Fuente: documentación UI/UX y código del proyecto.')

public=[('Inicio /','Presentación, acceso al catálogo, proceso del pan y sucursales.'),('Menú /menu','Categorías, productos, precios y bolsa del cliente.'),('Categoría /menu/[categoria]','Listado filtrado de panadería, fritos o bebidas.'),('Sucursales /sucursales','Direcciones, horarios y contacto de las sedes.'),('Pedido desde la bolsa','Recogida o domicilio, datos y registro en Java antes de abrir WhatsApp.'),('Seguimiento por código','Estado e historial con datos personales limitados.')]
tbl=insert_table_after(match('El frontend tiene un sitio público'),['Pantalla o flujo','Objetivo y acciones actuales'],public);caption_before_table(tbl,'Tabla 3. Sitio público y recorrido del cliente. Fuente: documentación UI/UX y frontend.')
qr=[('Identificación de mesa','QR permanente identifica mesa y sucursal; atención abre sesión y muestra QR temporal.'),('Catálogo y carrito','Categorías, cantidad, productos y total en controles táctiles.'),('Envío y estados','El pedido queda asociado a la cuenta de mesa y sus estados se consultan por sondeo.'),('Sesión cerrada o expirada','El acceso temporal se invalida y se informa al cliente.')]
tbl=insert_table_after(match('El frontend tiene un sitio público'),['Pantalla o estado','Comportamiento'],qr);caption_before_table(tbl,'Tabla 4. Experiencia de pedidos por QR. Fuente: SRS, UML e interfaz.')
admin=[('Inicio y acceso','Resumen según rol y sucursal; autenticación del personal.'),('Pedidos','Cola cronológica, prioridad visual, aceptación, rechazo y cambios de estado.'),('Mesas','Sesión temporal, cuenta y QR gestionados por personal.'),('Pagos y conciliaciones','Efectivo, transferencias, comprobantes y recaudo de reparto.'),('Inventario y reposiciones','Existencias, movimientos, solicitudes, despachos y recepciones.'),('Entregas','Asignación, estados, incidencias y acceso del repartidor a entregas propias.'),('Catálogo, usuarios y sucursales','Administración de productos, roles, sedes, horarios y configuración.'),('Reportes','Ventas, pedidos, inventario, movimientos y reposiciones.')]
tbl=insert_table_after(match('El frontend tiene un sitio público'),['Área del panel','Acciones y alcance'],admin);caption_before_table(tbl,'Tabla 5. Panel administrativo y operativo. Fuente: SRS y frontend.')
tech=[('Next.js / React / TypeScript','Rutas y componentes de interfaz; contratos tipados.'),('Tailwind CSS / CSS','Estilos, paleta y adaptación de pantallas.'),('Java 25 / Spring Boot','API REST y reglas transaccionales.'),('Spring Security','Sesiones, BCrypt, CSRF y roles por sucursal.'),('PostgreSQL / JPA','Persistencia relacional de 26 tablas.'),('Flyway','Migraciones V1 y V2 versionadas.'),('Springdoc / Swagger','Contrato y exploración de la API.')]
tbl=insert_table_after(match('El frontend utiliza Next.js'),['Tecnología','Función en el proyecto'],tech);caption_before_table(tbl,'Tabla 2. Tecnologías y responsabilidades. Fuente: arquitectura del proyecto.')
security=[('Identidad','Inicio de sesión del personal y BCrypt para contraseñas.'),('Sesión y solicitudes','Cookie HTTP y token CSRF.'),('Autorización','Roles y sucursales comprobados por Java.'),('Transporte','HTTPS público en Render y SSL hacia PostgreSQL.'),('Datos','Claves y restricciones; trigger de inmutabilidad de movimientos.'),('Archivos','Comprobantes privados con validación de formato y tamaño cuando se configura almacenamiento.')]
tbl=insert_table_after(match('La seguridad combina Spring Security'),['Control','Aplicación'],security);caption_before_table(tbl,'Tabla 6. Controles de seguridad implementados. Fuente: backend y configuración.')

# Figure additions beside UI section.
anchor=match('El frontend tiene un sitio público')
for key,cap in [('public','Figura 2. Distribución de la experiencia pública. Fuente: elaboración propia.'),('qr','Figura 3. Recorrido de mesa con QR temporal. Fuente: elaboración propia.'),('admin','Figura 4. Panel operativo por rol. Fuente: elaboración propia.')]:
    q=after(anchor,'');q.alignment=WD_ALIGN_PARAGRAPH.CENTER;q.add_run().add_picture(str(figs[key]),width=Inches(6.0));anchor=q
    anchor=after(anchor,cap,'Caption')

# Captions for existing annex tables, in their current order after the two template tables.
existing_titles=[
 'Tabla 9. Actores y límites de acceso. Fuente: UML del proyecto.',
 'Tabla 10. Grupos del MER y reglas principales. Fuente: MER aprobado.',
 'Tabla 11. Diccionario resumido de datos. Fuente: modelo físico PostgreSQL.',
 'Tabla 12. Trazabilidad de necesidades. Fuente: SRS y arquitectura.',
 'Tabla 13. Verificaciones registradas. Fuente: plan de desarrollo.',
 'Tabla 14. Glosario técnico. Fuente: documentación del proyecto.'
]
old_tables=[]
for t in d.tables:
    if t.cell(0,0).text.strip() in ('Actor','Grupo','Entidad','Necesidad','Área','Término'):
        old_tables.append(t)
for t,title in zip(old_tables,existing_titles):caption_before_table(t,title)

anchor=match('Las figuras de baja fidelidad documentan')
for key,cap in [
 ('orders','Figura 8. Gestión de pedidos y cola. Fuente: elaboración propia a partir de los wireframes.'),
 ('inventory','Figura 9. Consulta de existencias y movimientos. Fuente: elaboración propia a partir de los wireframes.'),
 ('replenish','Figura 10. Reposiciones entre sucursales. Fuente: elaboración propia a partir de los wireframes.'),
 ('deliver','Figura 11. Entregas y recaudo. Fuente: elaboración propia a partir de los wireframes.')]:
    q=after(anchor,'');q.alignment=WD_ALIGN_PARAGRAPH.CENTER;q.add_run().add_picture(str(figs[key]),width=Inches(6.0));anchor=q
    anchor=after(anchor,cap,'Caption')

def order_captioned_tables(anchor, titles):
    node=anchor._p
    for title in titles:
        cap=match(title)
        cap_el=cap._p; table_el=cap_el.getnext()
        assert table_el.tag==qn('w:tbl'), title
        cap_el.getparent().remove(cap_el)
        table_el.getparent().remove(table_el)
        node.addnext(cap_el);cap_el.addnext(table_el);node=table_el

order_captioned_tables(match('El frontend tiene un sitio público'),[
 'Tabla 3. Sitio público', 'Tabla 4. Experiencia de pedidos por QR',
 'Tabla 5. Panel administrativo'])
order_captioned_tables(match('El sitio público y la experiencia QR ofrecen español'),[
 'Tabla 7. Paleta cromática', 'Tabla 8. Criterios de experiencia'])

# Keep numbering aligned with the physical reading order after inserting tables.
for kind in ('Tabla','Figura'):
    n=0
    for q in d.paragraphs:
        if q.style.name=='Caption' and q.text.startswith(kind+' '):
            n+=1
            q.text=re.sub(r'^'+kind+r'\s+[A-Z]?\.?\d+\.',f'{kind} {n}.',q.text)

# Replace stale front matter indexes with explicit, numbered entries; page numbers are filled after Word export.
for p0 in list(d.paragraphs):
    if p0.style.name=='table of figures' and ('Título de la' in p0.text or 'T�tulo de la' in p0.text):p0._element.getparent().remove(p0._element)
table_index=match('Índice de tablas') if any(p.text=='Índice de tablas' for p in d.paragraphs) else next(p for p in d.paragraphs if 'ndice de tablas' in p.text)
figure_index=match('Índice de figuras') if any(p.text=='Índice de figuras' for p in d.paragraphs) else next(p for p in d.paragraphs if 'ndice de figuras' in p.text)
captions=[p for p in d.paragraphs if p.style.name=='Caption' and p.text.startswith(('Tabla ','Figura '))]
for target,kind in [(table_index,'Tabla '),(figure_index,'Figura ')]:
    last=target
    for cap in [p for p in captions if p.text.startswith(kind)]:
        title=cap.text.split(' Fuente:')[0].rstrip('.')
        last=after(last,title+'\t[PAGE]','table of figures')

# Headings after bibliography should enter contents index on update.
settings=d.settings.element;upd=OxmlElement('w:updateFields');upd.set(qn('w:val'),'true');settings.append(upd)
d.save(OUT)
print(OUT)
