"""Láminas: área de respeto y mínimos; reglas de uso con usos incorrectos."""
import sys; sys.path.insert(0,'/workspace/sc-research/brand/scripts')
from lib import *
CSS='''body{background:var(--sc-papel-50);color:var(--sc-tinta-900)}
.s{padding:56px 64px}.s h1{font-family:var(--sc-font-display);font-weight:800;text-transform:uppercase;font-size:64px;margin:6px 0 4px}
.s .sub{color:var(--sc-tinta-600);font-size:20px;margin:0 0 30px}.kick{color:var(--sc-celeste-700)}
.row{display:grid;gap:28px}.card{background:#fff;border:1px solid var(--sc-papel-200);border-radius:8px;padding:22px}
.card h3{font-family:var(--sc-font-display);font-weight:700;text-transform:uppercase;font-size:24px;margin:14px 0 4px}.card p{margin:0;font-size:15px;color:var(--sc-tinta-600);line-height:1.4}
.plate{background:var(--sc-noche-950);border-radius:4px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
.foot{position:absolute;left:64px;right:64px;bottom:28px;display:flex;justify-content:space-between;font-family:var(--sc-font-mono);font-size:13px;color:var(--sc-tinta-600)}
'''
# ---- área de respeto
cs=f'''<div class="stripe" style="--st:8px"><i></i><i></i><i></i></div><div class="s">
<div class="kick">Guía de marca · Lámina 02</div><h1>Área de respeto y tamaños mínimos</h1>
<p class="sub">Unidad <b>x</b> = ancho de la estrella pequeña del logo (≈ 5,4 % del ancho del logo). Nada entra en el área punteada.</p>
<div class="row" style="grid-template-columns:1.5fr 1fr">
 <div class="card"><div class="plate" style="height:420px"><div style="position:relative;padding:28px;outline:2px dashed var(--sc-celeste-300);outline-offset:-2px">
   {svg_inline("logo-color","l").replace('class="l"','class="l" style="width:520px;height:auto;display:block;outline:1px solid rgba(126,212,245,.6)"')}
   <span class="mono" style="position:absolute;top:4px;left:50%;transform:translateX(-50%);color:var(--sc-celeste-300);font-size:16px">x</span>
   <span class="mono" style="position:absolute;left:8px;top:50%;color:var(--sc-celeste-300);font-size:16px">x</span>
   <span class="mono" style="position:absolute;right:8px;top:50%;color:var(--sc-celeste-300);font-size:16px">x</span>
   <span class="mono" style="position:absolute;bottom:4px;left:50%;color:var(--sc-celeste-300);font-size:16px">x</span></div></div>
  <h3>Logo · respeto = 1x en los cuatro lados</h3><p>En el lockup horizontal la separación entre banderín y logo también es 1x. El banderín solo usa 1/4 de su ancho como respeto.</p></div>
 <div class="card"><h3 style="margin-top:0">Tamaños mínimos</h3>
  <table style="width:100%;border-collapse:collapse;font-size:16px;margin-top:10px">
   <tr style="text-align:left;color:var(--sc-tinta-600);font-family:var(--sc-font-mono);font-size:13px"><th>Pieza</th><th>Digital</th><th>Impreso</th></tr>
   <tr><td style="padding:10px 0;border-top:1px solid var(--sc-papel-200)">Logo</td><td>120 px ancho</td><td>30 mm</td></tr>
   <tr><td style="padding:10px 0;border-top:1px solid var(--sc-papel-200)">Lockup horizontal</td><td>160 px ancho</td><td>40 mm</td></tr>
   <tr><td style="padding:10px 0;border-top:1px solid var(--sc-papel-200)">Banderín</td><td>24 px alto</td><td>8 mm</td></tr>
   <tr><td style="padding:10px 0;border-top:1px solid var(--sc-papel-200)">Favicon</td><td>16 px (archivo propio)</td><td>—</td></tr></table>
  <div style="display:flex;gap:18px;align-items:flex-end;margin-top:26px">
   <div class="plate" style="padding:12px">{svg_inline("logo-color","m").replace('class="m"','class="m" style="width:120px;height:auto"')}</div>
   <div class="plate" style="padding:12px">{svg_inline("lockup-horizontal-color","m").replace('class="m"','class="m" style="width:160px;height:auto"')}</div>
   <div class="plate" style="padding:10px">{svg_inline("banderin-color","m").replace('class="m"','class="m" style="height:24px;width:auto"')}</div></div>
  <p style="margin-top:12px">Muestras a tamaño mínimo real (1×).</p>
  <h3>Fondos</h3><p>El logo a color lleva letras blancas: va sobre <b>noche</b> o fotos oscuras. En fondos claros usa la versión <b>una tinta</b> o la <b>placa</b>.</p></div>
</div></div><div class="foot"><span>Sebiche Celeste · Identidad autónoma</span><span>{DISC}</span></div>'''
# ---- reglas de uso
def bad(label,inner,why,style=''):
    return f'<div class="card"><div class="plate" style="height:190px;{style}">{inner}<svg viewBox="0 0 40 40" style="position:absolute;top:10px;right:10px;width:34px"><circle cx="20" cy="20" r="19" fill="#B4232C"/><path d="M13 13l14 14M27 13L13 27" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg></div><h3>{label}</h3><p>{why}</p></div>'
L=lambda st:svg_inline("logo-color","b").replace('class="b"',f'class="b" style="width:300px;height:auto;{st}"')
ok=lambda inner,label,why,bg='var(--sc-noche-950)':f'<div class="card"><div class="plate" style="height:190px;background:{bg}">{inner}<svg viewBox="0 0 40 40" style="position:absolute;top:10px;right:10px;width:34px"><circle cx="20" cy="20" r="19" fill="#04724F"/><path d="M12 21l6 6 11-13" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></svg></div><h3>{label}</h3><p>{why}</p></div>'
items=[
 ok(L(''),'Color sobre noche','Versión principal.'),
 ok(svg_inline("logo-tinta","b").replace('class="b"','class="b" style="width:300px;height:auto"'),'Una tinta sobre claro','Franja blanca = papel.','var(--sc-papel-50)'),
 ok(svg_inline("banderin-color","b").replace('class="b"','class="b" style="height:150px;width:auto"'),'Banderín solo','Avatar, ícono, favicon.'),
 bad('No estirar',L('transform:scaleX(1.45)'),'Siempre proporcional.'),
 bad('No rotar',L('transform:rotate(-12deg)'),'Siempre horizontal.'),
 bad('No recolorear',L('filter:hue-rotate(140deg) saturate(1.6)'),'Solo color, una tinta o reverso aprobados.'),
 bad('Sin efectos',L('filter:drop-shadow(0 0 18px #3CBEEF) drop-shadow(6px 6px 0 #F1AA19)'),'Sin sombras, brillos ni degradados.'),
 bad('No recortar ni quitar piezas',L('clip-path:inset(22% 0 0 0)'),'La franja y las tres estrellas son parte del logo.'),
 bad('No sobre fondos que compiten',L(''),'Sin fotos ruidosas ni fondos claros con la versión a color.','background:repeating-linear-gradient(45deg,#3CBEEF 0 14px,#F7FAFB 14px 28px)'),
 bad('No junto al escudo del club','<div style="display:flex;gap:16px;align-items:center">'+L('width:200px')+'<div class="mono" style="width:90px;height:110px;border:2px dashed #C9D3E6;color:#C9D3E6;font-size:12px;display:flex;align-items:center;justify-content:center;text-align:center">escudo<br>oficial</div></div>','Nunca usar ni sugerir el escudo de Sporting Cristal.'),
 bad('Sin lockups ni respaldo SEBICHE','<div style="display:flex;gap:14px;align-items:center">'+L('width:190px')+'<span class="disp" style="font-size:26px;color:#C9D3E6">× SEBICHE</span></div>','Marca autónoma: no se combina con otras marcas.'),
 bad('No redibujar el banderín',svg_inline("banderin-color","b").replace('class="b"','class="b" style="height:150px;width:auto;border-radius:40%;filter:blur(1.2px)"'),'Usa siempre el SVG master; no lo suavices ni lo rehagas.'),
]
ur=f'''<div class="stripe" style="--st:8px"><i></i><i></i><i></i></div><div class="s">
<div class="kick">Guía de marca · Lámina 03</div><h1>Reglas de uso</h1><p class="sub">El logo y el banderín no se modifican. El sistema se construye a su alrededor.</p>
<div class="row" style="grid-template-columns:repeat(4,1fr);gap:20px">{''.join(items)}</div></div><div class="foot"><span>Sebiche Celeste · Identidad autónoma</span><span>{DISC}</span></div>'''
jobs=[]
for n,b,h in [('lamina-area-respeto-minimos',cs,860),('lamina-reglas-de-uso',ur,1300)]:
    f=f'{B}/sheets/{n}.html'; open(f,'w').write(page(b,1600,h,CSS,theme='light')); jobs.append({'src':f,'out':f'{B}/sheets/{n}.png','w':1600,'h':h,'wait':300})
render(jobs);print('ok')
