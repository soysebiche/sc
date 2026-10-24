"""Banderín v2 (aprobado 24 oct 2026): dibujado a mano, sin calco. Fuente: banderin-v2/opcion-d-final.svg."""
import math
CEL,GOLD,RED,WH='#3CBEEF','#F1AA19','#D10F21','#FFFFFF'
PVB=(140,40,560,760)
BODY='M160 130 H680 V600 L420 790 L160 600 Z'
INNER='M215 185 H625 V572 L420 722 L215 572 Z'
STARS=[(285,370,52),(420,420,96),(555,370,52)]
SEG=520/3
def star(cx,cy,R,ratio=0.382):
    return 'M'+' L'.join(f'{cx+(R if i%2==0 else R*ratio)*math.cos(math.radians(-90+36*i)):.2f},{cy+(R if i%2==0 else R*ratio)*math.sin(math.radians(-90+36*i)):.2f}' for i in range(10))+'Z'
def bar(fills):
    return ''.join(f'<rect x="{160+i*SEG:.3f}" y="50" width="{SEG:.3f}" height="56" fill="{f}"/>' for i,f in enumerate(fills) if f)
def groups(mode='color',mid='p',sw=22):
    stars=''.join(f'<path d="{star(*s)}"/>' for s in STARS)
    if mode=='color':
        return bar([RED,WH,RED])+f'<path d="{BODY}" fill="{CEL}"/><path d="{INNER}" fill="none" stroke="{WH}" stroke-width="{sw}"/><g fill="{GOLD}">{stars}</g>'
    ink='#1B265C' if mode=='tinta' else WH
    # una tinta: franja blanca, filete y estrellas = papel (calado)
    return (bar([ink,None,ink])+f'<mask id="k{mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="900"><rect width="900" height="900" fill="#fff"/>'
            f'<path d="{INNER}" fill="none" stroke="#000" stroke-width="{sw}"/><g fill="#000">{stars}</g></mask><path d="{BODY}" fill="{ink}" mask="url(#k{mid})"/>')
