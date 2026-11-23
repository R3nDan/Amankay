from pathlib import Path
from docx import Document
from docx.shared import Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from PIL import Image,ImageDraw,ImageFont

root=Path(__file__).resolve().parents[1]
path=root/'Copia_documentacion_final.docx'
output=root/'Copia_documentacion_capturas_admin.docx'
d=Document(path)
assert not any(p.text.startswith('Figura 12. Inicio del panel') for p in d.paragraphs)
fontpath='C:/Windows/Fonts/arial.ttf';boldpath='C:/Windows/Fonts/arialbd.ttf'
def font(n,b=False):return ImageFont.truetype(boldpath if b else fontpath,n)
entries=[
 ('Inicio del panel administrativo','/admin','Resumen, sucursal activa y accesos autorizados.'),
 ('Mesas y QR','/admin/mesas','Mesa, sesión temporal, QR y cuenta.'),
 ('Pagos','/admin/pagos','Intentos, método, importe y verificación.'),
 ('Conciliaciones','/admin/conciliaciones','Efectivo declarado y recibido por entrega.'),
 ('Catálogo','/admin/catalogo','Categorías, productos y precios.'),
 ('Usuarios','/admin/usuarios','Usuarios, roles y sucursales asignadas.'),
 ('Sucursales','/admin/sucursales','Información, horarios y configuración.'),
 ('Reportes','/admin/reportes','Ventas, pedidos, inventario y reposiciones.')]

h=d.add_heading('Capturas del panel administrativo',level=3)
d.add_paragraph('Los siguientes recuadros reservan el lugar de las capturas de cada módulo. Al preparar la entrega, sustituye cada imagen de referencia por una captura propia de la misma pantalla. Los pies de figura y el índice ya identifican el apartado correspondiente. Usa datos de demostración sin información personal.')
for i,(title,route,detail) in enumerate(entries,12):
    img=Image.new('RGB',(1400,650),'#FFFFFF');dr=ImageDraw.Draw(img)
    dr.rounded_rectangle((90,45,1310,605),radius=25,fill='#F7F4ED',outline='#6B3F2A',width=4)
    dr.rectangle((90,45,1310,150),fill='#FAF0DD')
    dr.text((140,98),'AMANKAY',font=font(30,True),fill='#6B3F2A',anchor='lm')
    dr.text((1245,98),route,font=font(25),fill='#746052',anchor='rm')
    dr.text((700,275),title,font=font(39,True),fill='#30231D',anchor='mm')
    dr.text((700,335),detail,font=font(25),fill='#746052',anchor='mm')
    dr.rounded_rectangle((375,405,1025,520),radius=16,fill='#FFFFFF',outline='#C48359',width=3)
    dr.text((700,462),'Sustituir por captura del sistema',font=font(28,True),fill='#6B3F2A',anchor='mm')
    imgpath=root/'.doc_work'/f'capture-slot-{i}.png';img.save(imgpath)
    p=d.add_paragraph();p.alignment=WD_ALIGN_PARAGRAPH.CENTER;p.paragraph_format.keep_with_next=True
    p.add_run().add_picture(str(imgpath),width=Inches(6.0))
    c=d.add_paragraph(f'Figura {i}. {title}. Fuente: captura propia del sistema.',style='Caption')
    c.paragraph_format.keep_with_next=False
    c.paragraph_format.keep_together=True

# Append to the manually maintained figure index, retaining its style.
last=next(p for p in d.paragraphs if p.style.name=='table of figures' and p.text.startswith('Figura 11.'))
for i,(title,_,_) in enumerate(entries,12):
    q=d.add_paragraph(f'Figura {i}. {title}\t[PAGE]',style='table of figures')
    last._p.addnext(q._p);last=q
d.save(output)
print(output)
