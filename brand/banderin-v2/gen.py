import math,cairosvg
from PIL import Image,ImageDraw,ImageFont
CEL,NAV,GOLD,RED,WH='#3CBEEF','#1B265C','#F1AA19','#D10F21','#FFFFFF'
def star(cx,cy,R,ratio=0.382,rot=0):
    pts=[]
    for i in range(10):
        r=R if i%2==0 else R*ratio;a=math.radians(-90+rot+36*i)
        pts.append(f'{cx+r*math.cos(a):.2f},{cy+r*math.sin(a):.2f}')
    return 'M'+' L'.join(pts)+'Z'
BODY='M160 130 H680 V600 L420 790 L160 600 Z'
INNER='M215 185 H625 V572 L420 722 L215 572 Z'
def svg(name,stars,ratio=0.382,outline=False,stripe='band'):
    s=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="90 30 660 790" width="660" height="790"><title>Sebiche Celeste — banderín v2 {name}</title>']
    if stripe=='rod':
        s+=[f'<rect x="110" y="50" width="207" height="56" fill="{RED}"/><rect x="317" y="50" width="206" height="56" fill="{WH}" stroke="{CEL}" stroke-width="0"/><rect x="523" y="50" width="207" height="56" fill="{RED}"/>']
    else:
        s+=[f'<rect x="110" y="50" width="620" height="56" rx="28" fill="{CEL}"/>']
    s+=[f'<path d="{BODY}" fill="{CEL}"/>',f'<path d="{INNER}" fill="none" stroke="{WH}" stroke-width="22" stroke-linejoin="miter"/>']
    if stripe=='band':
        s+=[f'<clipPath id="c"><path d="{INNER}"/></clipPath><g clip-path="url(#c)"><rect x="200" y="196" width="440" height="24" fill="{RED}"/><rect x="200" y="220" width="440" height="20" fill="{WH}"/><rect x="200" y="240" width="440" height="24" fill="{RED}"/></g>']
    for (x,y,R) in stars:
        d=star(x,y,R,ratio)
        if outline: s.append(f'<path d="{d}" fill="{GOLD}" stroke="{NAV}" stroke-width="{max(6,R*0.09):.1f}" stroke-linejoin="round" paint-order="stroke"/>')
        else: s.append(f'<path d="{d}" fill="{GOLD}"/>')
    s.append('</svg>');open(f'{name}.svg','w').write(''.join(s))
    cairosvg.svg2png(url=f'{name}.svg',write_to=f'{name}.png',output_width=660,output_height=790)
opts={
 'opcion-a-columna':dict(stars=[(420,315,44),(420,440,78),(420,575,44)],stripe='band'),
 'opcion-b-fila':dict(stars=[(290,430,50),(420,410,92),(550,430,50)],stripe='band'),
 'opcion-c-arco-contorno':dict(stars=[(285,455,52),(420,395,96),(555,455,52)],ratio=0.45,outline=True,stripe='band'),
 'opcion-d-barra-tricolor':dict(stars=[(285,370,52),(420,420,96),(555,370,52)],stripe='rod'),
}
for k,v in opts.items(): svg(k,**v)
# comparison
old=Image.open('../../public/pennant-source.png').convert('RGBA')
cols=[('actual',old.resize((330,330),Image.NEAREST))]+[(k,Image.open(k+'.png').convert('RGBA')) for k in opts]
W=360;sheet=Image.new('RGB',(W*5,640),'#0B1230');d=ImageDraw.Draw(sheet)
try:f=ImageFont.truetype('../fonts/IBMPlexMono-Medium.ttf',16)
except:f=None
for i,(n,im) in enumerate(cols):
    x=i*W;big=im.copy();big.thumbnail((330,395));sheet.paste(big,(x+(W-big.width)//2,20),big)
    for j,sz in enumerate((64,32,16)):
        sm=im.copy();sm.thumbnail((sz,sz),Image.LANCZOS)
        for k,bg in enumerate(('#0B1230','#F7FAFB')):
            bx=x+20+j*110;by=440+k*80;d.rectangle([bx,by,bx+72,by+72],fill=bg);sheet.paste(sm,(bx+(72-sm.width)//2,by+(72-sm.height)//2),sm)
    d.text((x+20,605),n,fill='#F7FAFB',font=f)
sheet.save('comparacion-banderin-v2.png')
