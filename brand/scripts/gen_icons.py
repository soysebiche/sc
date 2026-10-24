"""Íconos de app/PWA desde el banderín calcado (sin modificarlo). Fondo noche.950."""
import json,re,subprocess
from PIL import Image
B='/workspace/sc-research/brand'; I=f'{B}/icons'
pen=open(f'{B}/logo/svg/sebiche-celeste-banderin-color.svg').read()
inner=re.search(r'<title>.*?</title>(.*)</svg>',pen,re.S).group(1)
def icon(size,frac,bg,rx=0):
    vw,vh=960,1184; h=size*frac; w=h*vw/vh
    b=f'<rect width="{size}" height="{size}" rx="{rx}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">{b}<svg x="{(size-w)/2:.2f}" y="{(size-h)/2:.2f}" width="{w:.2f}" height="{h:.2f}" viewBox="192 80 960 1184">{inner}</svg></svg>'
spec={'icon-any-512.svg':(512,.70,'#0B1230',0),'icon-maskable-512.svg':(512,.56,'#0B1230',0),'favicon.svg':(64,.94,None,0),'apple-touch-icon.svg':(180,.66,'#0B1230',0)}
jobs=[]
for n,(s,f,bg,rx) in spec.items(): open(f'{I}/{n}','w').write(icon(s,f,bg,rx))
for out,src,s in [('icon-192.png','icon-any-512.svg',192),('icon-512.png','icon-any-512.svg',512),('icon-maskable-192.png','icon-maskable-512.svg',192),('icon-maskable-512.png','icon-maskable-512.svg',512),('apple-touch-icon.png','apple-touch-icon.svg',180),('favicon-16.png','favicon.svg',16),('favicon-32.png','favicon.svg',32),('favicon-48.png','favicon.svg',48)]:
    vs=int(re.search(r'width="(\d+)"',open(f'{I}/{src}').read()).group(1))
    jobs.append({'src':f'{I}/{src}','out':f'{I}/{out}','w':vs,'h':vs,'scale':s/vs})
json.dump(jobs,open('/tmp/ij.json','w')); subprocess.run(['node',f'{B}/scripts/render_many.js','/tmp/ij.json'],check=True)
ims=[Image.open(f'{I}/favicon-{s}.png').convert('RGBA').resize((s,s),Image.LANCZOS) for s in (16,32,48)]
ims[2].save(f'{I}/favicon.ico',sizes=[(16,16),(32,32),(48,48)],append_images=ims[:2])
man={"name":"Sebiche Celeste","short_name":"Celeste","description":"Archivo independiente de hinchas: efemérides, rivales y temporadas de Sporting Cristal. Sin relación oficial con el club.","start_url":"/","display":"standalone","background_color":"#0B1230","theme_color":"#1B265C","lang":"es-PE",
"icons":[{"src":"/icons/icon-192.png","sizes":"192x192","type":"image/png","purpose":"any"},{"src":"/icons/icon-512.png","sizes":"512x512","type":"image/png","purpose":"any"},{"src":"/icons/icon-maskable-192.png","sizes":"192x192","type":"image/png","purpose":"maskable"},{"src":"/icons/icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"},{"src":"/icons/favicon.svg","sizes":"any","type":"image/svg+xml"}]}
json.dump(man,open(f'{I}/manifest.webmanifest','w'),indent=2,ensure_ascii=False)
for s in (16,32,48): 
    if s!=48: pass
print('ok')
