from PIL import Image,ImageDraw,ImageFont
import os
B='/workspace/sc-research/brand/'
items=['logo/png/sebiche-celeste-lockup-horizontal-color@2x.png','logo/png/sebiche-celeste-logo-color-placa@2x.png','logo/png/sebiche-celeste-banderin-tinta@2x.png','logo/png/sebiche-celeste-banderin-color@2x.png','icons/icon-maskable-512.png','ics/ics-subscribe-1200x630.png','og/og-efemerides-1200x630.png','og/og-rivales-1200x630.png','og/og-anio-1200x630.png','social/efemeride-post-1080x1350.png','social/previa-post-1080x1350.png','social/resultado-story-1080x1920.png','social/efemeride-x-1600x900.png','sheets/lamina-area-respeto-minimos.png','sheets/lamina-reglas-de-uso.png','ui-kit/showcase.png']
C,W,H=4,520,380;sheet=Image.new('RGB',(C*W,((len(items)+C-1)//C)*H+90),'#0B1230');d=ImageDraw.Draw(sheet)
f=ImageFont.truetype(B+'fonts/IBMPlexMono-Regular.ttf',14);F=ImageFont.truetype(B+'fonts/BarlowCondensed-ExtraBold.ttf',44)
d.text((20,20),'SEBICHE CELESTE — BRAND KIT v1.1 (banderín v2)',fill='#F7FAFB',font=F)
for i,p in enumerate(items):
    im=Image.open(B+p).convert('RGBA');im.thumbnail((W-30,H-50))
    x=(i%C)*W+15;y=90+(i//C)*H+10
    bg=Image.new('RGBA',(W-30,H-50),'#F7FAFB' if 'tinta' in p else '#141d45');bg.alpha_composite(im,((W-30-im.width)//2,(H-50-im.height)//2))
    sheet.paste(bg.convert('RGB'),(x,y));d.text((x,y+H-45),p,fill='#C9D3E6',font=f)
sheet.save(B+'preview-contact-sheet.png')
