from pathlib import Path
from docx import Document
from pypdf import PdfReader
import re
ROOT=Path(__file__).resolve().parents[1]
path=ROOT/'Copia_documentacion_final.docx'
pdf=ROOT/'.doc_work/preview.pdf'
d=Document(path)
toc=[p for p in d.paragraphs if p.style.name.startswith('toc ')]
ann=next(p for p in toc if p.text.split('\t')[0]=='Anexos')
if not any('Anexo A. Arquitectura' in p.text for p in toc):
    last=ann
    titles=['Anexos técnicos integrados','Anexo A. Arquitectura y flujo de datos','Anexo B. Actores, permisos y responsabilidades','Anexo C. Modelo de datos resumido','Anexo D. Diccionario de datos resumido','Anexo E. Trazabilidad entre necesidades y solución','Anexo F. Matriz de pruebas y evidencias','Anexo G. Glosario','Anexo H. Evidencias visuales para la entrega']
    for title in titles:
        q=d.add_paragraph(title+'\t[PAGE]',style='toc 2');last._p.addnext(q._p);last=q
    d.save(path)
    print('toc extended; export again')
else:
    pages=[(p.extract_text() or '') for p in PdfReader(pdf).pages]
    def find(title):
        clean=re.sub(r'\s+',' ',title).strip().rstrip('.')
        for i,text in enumerate(pages[7:],start=8):
            t=re.sub(r'\s+',' ',text)
            if clean in t:return i-1
        return None
    for p in d.paragraphs:
        if p.style.name.startswith('toc '):
            title=p.text.split('\t')[0]
            n=find(title)
            if n is not None:p.text=title+'\t'+str(n)
        elif p.style.name=='table of figures' and p.text.startswith(('Tabla ','Figura ')):
            title=p.text.split('\t')[0]
            n=find(title)
            if n is not None:p.text=title+'\t'+str(n)
    d.save(path)
    print('page numbers written')
