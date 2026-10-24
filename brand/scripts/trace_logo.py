"""Calco fiel del logo Sebiche Celeste desde el raster maestro 6001x2725.
Separa por color de relleno, traza con potrace y apila contorno + relleno. Cero cambios de diseño."""
import numpy as np, subprocess, re, os
from PIL import Image
from scipy import ndimage as nd
SRC='/workspace/sc-research/public/SebicheCeleste logo copy.png'
OUT='/workspace/sc-research/brand/trace'
im=np.array(Image.open(SRC).convert('RGBA')).astype(int)
H,W=im.shape[:2]; rgb=im[...,:3]; a=im[...,3]
opq=a>127
fills={'white':(242,248,250),'cyan':(93,224,230),'red':(210,16,33),'gold':(243,172,29)}
names=list(fills); C=np.array([fills[n] for n in names])
d=((rgb[...,None,:]-C[None,None])**2).sum(-1)
lab=d.argmin(-1); close=d.min(-1)<45**2
def med(mask): return tuple(int(v) for v in np.median(rgb[mask&(a>250)],axis=0))
layers=[]
for i,n in enumerate(names):
    m=opq&close&(lab==i)
    m=nd.binary_opening(m,iterations=1)
    exact=med(m)
    ring=nd.binary_dilation(m,iterations=6)&opq&~close
    oc=med(ring) if ring.sum()>50 else None
    full=nd.binary_closing(m|ring,iterations=1)
    if n=='white':
        top=np.zeros_like(m); top[:590]=True
        layers.append(('stripe-white',full&top,oc,m&top,exact)); layers.append(('wordmark-white',full&~top,oc,m&~top,exact))
    else:
        layers.append({'red':'stripe-red','cyan':'wordmark-celeste','gold':'stars-gold'}[n:=n] and ({'red':'stripe-red','cyan':'wordmark-celeste','gold':'stars-gold'}[n],full,oc,m,exact))
    print(n,'fill',exact,'outline',oc,'ring px',int(ring.sum()))
def trace(mask,name):
    p=f'{OUT}/{name}.pbm'; Image.fromarray(((~mask)*255).astype('uint8')).convert('1').save(p)
    subprocess.run(['potrace',p,'-s','-o',f'{OUT}/{name}.svg','--turdsize','4','--alphamax','1.0','--opttolerance','0.1','-u','10'],check=True)
    s=open(f'{OUT}/{name}.svg').read()
    g=re.search(r'<g transform="([^"]+)"[^>]*>(.*?)</g>',s,re.S)
    return g.group(1),re.findall(r'd="([^"]+)"',g.group(2))
hexc=lambda c:'#%02X%02X%02X'%c
parts=[]
for n,full,oc,m,exact in layers:
    if oc:
        t,ds=trace(full,n+'-outline'); parts.append((n+'-outline',hexc(oc),t,ds))
    t,ds=trace(m,n); parts.append((n,hexc(exact),t,ds))
import json; json.dump({p[0]:p[1] for p in parts},open(f'{OUT}/colors.json','w'),indent=1)
def svg(parts,color_override=None,bg=None):
    body=''.join(f'<g id="{n}" transform="{t}" fill="{color_override(n,c) if color_override else c}" stroke="none">'+''.join(f'<path d="{d}"/>' for d in ds)+'</g>' for n,c,t,ds in parts)
    b=f'<rect width="{W}" height="{H}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><title>Sebiche Celeste</title>{b}{body}</svg>'
open(f'{OUT}/parts.json','w').write(json.dumps({'W':W,'H':H,'parts':parts}))
open('/workspace/sc-research/brand/logo/svg/sebiche-celeste-logo-master.svg','w').write(svg(parts))
