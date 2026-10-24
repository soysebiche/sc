import math,cairosvg
from PIL import Image,ImageDraw,ImageFont
from gen import star,BODY,INNER,CEL,GOLD,RED,WH
def make(name,sw,vb):
    seg=520/3
    s=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"><title>Sebiche Celeste — banderín v2 (D final)</title>',
       f'<rect x="160" y="50" width="{seg:.3f}" height="56" fill="{RED}"/><rect x="{160+seg:.3f}" y="50" width="{seg:.3f}" height="56" fill="{WH}"/><rect x="{160+2*seg:.3f}" y="50" width="{seg:.3f}" height="56" fill="{RED}"/>',
       f'<path d="{BODY}" fill="{CEL}"/><path d="{INNER}" fill="none" stroke="{WH}" stroke-width="{sw}" stroke-linejoin="miter"/>']
    for x,y,R in [(285,370,52),(420,420,96),(555,370,52)]: s.append(f'<path d="{star(x,y,R)}" fill="{GOLD}"/>')
    open(name+'.svg','w').write(''.join(s)+'</svg>')
make('opcion-d-final',22,'140 40 560 760')
make('opcion-d-final-icon',34,'140 40 560 760')   # trazo blanco más grueso para 16–64 px
cairosvg.svg2png(url='opcion-d-final.svg',write_to='opcion-d-final.png',output_width=560,output_height=760)
W=1100;sh=Image.new('RGB',(W,560),'#5a6378');d=ImageDraw.Draw(sh)
f=ImageFont.truetype('../fonts/IBMPlexMono-Medium.ttf',15)
for k,bg in enumerate(('#0B1230','#F7FAFB')):
    d.rectangle([k*280+10,10,k*280+270,370],fill=bg)
    big=Image.open('opcion-d-final.png').convert('RGBA');big.thumbnail((240,340));sh.paste(big,(k*280+140-big.width//2,20),big)
    for j,sz in enumerate((64,32,16)):
        import io;png=cairosvg.svg2png(url='opcion-d-final-icon.svg',output_height=sz*4)
        im=Image.open(io.BytesIO(png)).convert('RGBA');im.thumbnail((sz,sz),Image.LANCZOS)
        bx=580+j*170;by=20+k*180;d.rectangle([bx,by,bx+150,by+150],fill=bg)
        up=im.resize((im.width*2,im.height*2),Image.NEAREST)
        sh.paste(im,(bx+10,by+10),im);sh.paste(up,(bx+75-up.width//2+30,by+75-up.height//2),up)
        d.text((bx+5,by+130),f'{sz}px (1x + zoom 2x)',fill='#888',font=f)
d.text((20,390),'Barra tricolor = x 160–680, igual al ancho del banderín (sin sobresalir).',fill='#fff',font=f)
d.text((20,415),'Grande: opcion-d-final.svg · Iconos 16–64: opcion-d-final-icon.svg (borde blanco más grueso)',fill='#fff',font=f)
sh.save('opcion-d-final-preview.png')
