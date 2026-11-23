from pathlib import Path
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import RGBColor
ROOT=Path(__file__).resolve().parents[1]
path=ROOT/'Copia_documentacion_final.docx'
d=Document(path)
for idx,p in enumerate(d.paragraphs):
    if p.style.name=='Caption':
        p.paragraph_format.keep_with_next=True
        p.paragraph_format.keep_together=True
        if idx and d.paragraphs[idx-1]._p.xpath('.//w:drawing'):
            d.paragraphs[idx-1].paragraph_format.keep_with_next=True
    if p.text.startswith('En internacionalización, el producto está localizado'):
        p.text='La experiencia pública y QR permiten consultar contenidos en español e inglés. La navegación común del panel también ofrece controles compartidos traducidos; los módulos operativos conservan su vocabulario en español.'
for t in d.tables:
    if len(t.rows)==0:continue
    for i,row in enumerate(t.rows):
        trPr=row._tr.get_or_add_trPr()
        no=OxmlElement('w:cantSplit');trPr.append(no)
        if i==0 and len(t.rows)>2:
            h=OxmlElement('w:tblHeader');h.set(qn('w:val'),'true');trPr.append(h)
            if t.cell(0,0).text.strip() not in ('','Fase'):
                for cell in row.cells:
                    sh=cell._tc.get_or_add_tcPr().find(qn('w:shd'))
                    if sh is not None:sh.set(qn('w:fill'),'6B3F2A')
        for cell in row.cells:
            if cell.text.strip()=='Localización regional; no multidioma.':cell.text='Español e inglés en sitio público y QR; panel operativo en español.'
            if cell.text.strip()=='Localización Colombia; sin varios idiomas.':cell.text='Español e inglés en sitio público y QR; panel operativo en español.'
            for p in cell.paragraphs:
                p.paragraph_format.keep_together=True
    # Keep compact tables together; long tables may span pages at row boundaries.
    if 3<=len(t.rows)<=7:
        for row in t.rows[:-1]:
            for cell in row.cells:
                for p in cell.paragraphs:p.paragraph_format.keep_with_next=True
d.save(path)
