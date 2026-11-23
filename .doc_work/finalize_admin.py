from pathlib import Path
from docx import Document
from pypdf import PdfReader
import re
root=Path(__file__).resolve().parents[1]
path=root/'Copia_documentacion_capturas_admin.docx'
pages=[re.sub(r'\s+',' ',p.extract_text() or '') for p in PdfReader(root/'.doc_work/admin_preview.pdf').pages]
d=Document(path)
for p in d.paragraphs:
    if p.style.name!='table of figures' or '[PAGE]' not in p.text:continue
    title=p.text.split('\t')[0]
    page=next((i for i,text in enumerate(pages) if i>=7 and title in text),None)
    assert page is not None,title
    p.text=title+'\t'+str(page)
d.save(path)
print(path)
