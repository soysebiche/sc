"""Calco fiel del banderín (pennant-source.png 84x84). Upscale x16, umbral por color, potrace. Colores exactos del raster."""
import numpy as np, subprocess, re
from PIL import Image
SRC='/workspace/sc-research/public/pennant-source.png'; OUT='/workspace/sc-research/brand/trace'; S=16
im=np.array(Image.open(SRC).convert('RGBA')).astype(float)
cols={'celeste':(60,190,239),'navy':(27,38,92),'gold':(254,219,1)}
def mask_for(c):
    d=np.sqrt(((im[...,:3]-c)**2).sum(-1)); w=(d<60)*im[...,3]
    return w
layers=[]
for n,c in cols.items():
    w=mask_for(c)
    if n=='celeste': w=im[...,3]  # silhouette total (navy/gold encima)
    up=np.array(Image.fromarray(w.astype('uint8')).resize((84*S,84*S),Image.BICUBIC))
    m=up>127
    p=f'{OUT}/pen-{n}.pbm'; Image.fromarray(((~m)*255).astype('uint8')).convert('1').save(p)
    subprocess.run(['potrace',p,'-s','-o',f'{OUT}/pen-{n}.svg','--turdsize','8','--alphamax','0.9','--opttolerance','0.2'],check=True)
    s=open(f'{OUT}/pen-{n}.svg').read(); g=re.search(r'<g transform="([^"]+)"[^>]*>(.*?)</g>',s,re.S)
    layers.append((n,'#%02X%02X%02X'%c,g.group(1),re.findall(r'd="([^"]+)"',g.group(2))))
import json; json.dump({'W':84*S,'H':84*S,'parts':layers},open(f'{OUT}/pennant-parts.json','w'))
body=''.join(f'<g id="{n}" transform="{t}" fill="{c}">'+''.join(f'<path d="{d}"/>' for d in ds)+'</g>' for n,c,t,ds in layers)
open('/workspace/sc-research/brand/logo/svg/sebiche-celeste-banderin-master.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {84*S} {84*S}" width="{84*S}" height="{84*S}"><title>Sebiche Celeste — banderín</title>{body}</svg>')
