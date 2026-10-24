"""Genera variantes aprobables a partir de los calcos (sin redibujar). Solo cambia color en una tinta / reverso."""
import json, cairosvg, os
B='/workspace/sc-research/brand'; T=f'{B}/trace'
L=json.load(open(f'{T}/parts.json')); P=json.load(open(f'{T}/pennant-parts.json'))
LVB=(181,464,5565,2261); PVB=(192,80,960,1184)
INK='#1B265C'; WHITE='#FFFFFF'; PLATE='#0E1638'
def logo_groups(mode):
    out=''
    for n,c,t,ds in L['parts']:
        if mode=='color': fill=c
        else:
            ink=INK if mode=='tinta' else WHITE
            if n.startswith('stripe-white'): continue      # franja blanca = papel
            fill=ink
        out+=f'<g transform="{t}" fill="{fill}">'+''.join(f'<path d="{d}"/>' for d in ds)+'</g>'
    return out
def pen_groups(mode,mid):
    if mode=='color':
        return ''.join(f'<g transform="{t}" fill="{c}">'+''.join(f'<path d="{d}"/>' for d in ds)+'</g>' for n,c,t,ds in P['parts'])
    ink=INK if mode=='tinta' else WHITE
    g={n:(t,ds) for n,c,t,ds in P['parts']}
    pth=lambda n,f:f'<g transform="{g[n][0]}" fill="{f}">'+''.join(f'<path d="{d}"/>' for d in g[n][1])+'</g>'
    return (f'<mask id="k{mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="1344" height="1344"><rect width="1344" height="1344" fill="#fff"/>{pth("navy","#000")}</mask>'
            f'<g mask="url(#k{mid})">{pth("celeste",ink)}{pth("gold",ink)}</g>')
def svg(vb,inner,bg=None,title='Sebiche Celeste'):
    x,y,w,h=vb; b=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x} {y} {w} {h}" width="{w}" height="{h}"><title>{title}</title>{b}{inner}</svg>'
def lockup(mode,mid):
    # banderín a la altura total del logo; separación = ancho de la estrella chica (~ 300 u)
    lx,ly,lw,lh=LVB; px,py,pw,ph=PVB; s=lh/ph; gap=300
    pen=f'<svg x="0" y="0" width="{pw*s:.1f}" height="{lh}" viewBox="{px} {py} {pw} {ph}">{pen_groups(mode,mid)}</svg>'
    lg=f'<svg x="{pw*s+gap:.1f}" y="0" width="{lw}" height="{lh}" viewBox="{lx} {ly} {lw} {lh}">{logo_groups(mode)}</svg>'
    return (0,0,round(pw*s+gap+lw),lh),pen+lg
files={}
for m in ['color','tinta','reverso']:
    files[f'logo-{m}']=svg(LVB,logo_groups(m),title=f'Sebiche Celeste — logo ({m})')
    files[f'banderin-{m}']=svg(PVB,pen_groups(m,'b'+m),title=f'Sebiche Celeste — banderín ({m})')
    vb,inner=lockup(m,'l'+m); files[f'lockup-horizontal-{m}']=svg(vb,inner,title=f'Sebiche Celeste — lockup horizontal ({m})')
# versión en placa: el logo a color no se recolorea; sobre fondos claros se apoya en placa biscay
x,y,w,h=LVB; pad=300
files['logo-color-placa']=svg((x-pad,y-pad,w+2*pad,h+2*pad),logo_groups('color'),bg=PLATE,title='Sebiche Celeste — logo en placa')
vb,inner=lockup('color','lp'); X,Y,W,H=vb
files['lockup-horizontal-color-placa']=svg((X-pad,Y-pad,W+2*pad,H+2*pad),inner,bg=PLATE)
os.makedirs(f'{B}/logo/svg',exist_ok=True); os.makedirs(f'{B}/logo/png',exist_ok=True)
jobs=[]
for n,s in files.items():
    f=f'{B}/logo/svg/sebiche-celeste-{n}.svg'
    # tamaño intrínseco = ancho base para que Chrome escale el viewBox
    import re
    vw,vh=[float(v) for v in re.search(r'viewBox="[^ ]+ [^ ]+ ([^ ]+) ([^"]+)"',s).groups()]
    base=256 if n.startswith('banderin') else (1200 if 'lockup' in n else 800); h=round(base*vh/vw)
    s=re.sub(r'width="[^"]+" height="[^"]+"><title>',f'width="{base}" height="{h}"><title>',s,count=1)
    open(f,'w').write(s)
    for k in (1,2): jobs.append({'src':f,'out':f'{B}/logo/png/sebiche-celeste-{n}@{k}x.png','w':base,'h':h,'scale':k})
json.dump(jobs,open('/tmp/jobs.json','w'))
import subprocess; subprocess.run(['node',f'{B}/scripts/render_many.js','/tmp/jobs.json'],check=True)
print(sorted(files))
