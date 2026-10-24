"""Plantillas sociales (HTML editable + PNG). Datos reales del archivo (src/data)."""
import sys; sys.path.insert(0,'/workspace/sc-research/brand/scripts')
from lib import *
FORMATS={'post':(1080,1350),'story':(1080,1920),'x':(1600,900)}
C={
'efemeride':dict(kick='Efeméride · 24 de octubre',big='2021',line1='Alianza Lima <b class="score">1–3</b> Sporting Cristal',meta='Liga 1 · Fase 2 · Visita' ,detail="Riquelme 17' 80' · Ávila 21'",foot='Otros 24 de octubre en el archivo: <b>6 partidos · 5 victorias</b>',res='v'),
'previa':dict(kick='Previa · Clausura 2026 · Fecha 13',big='HOY',line1='Cusco FC <b class="score">vs</b> Sporting Cristal',meta='Sáb 24 oct · 15:15 hora de Lima · Inca Garcilaso de la Vega',detail='Historial ante Cusco FC: 13 PJ · 8 V · 2 E · 3 D',foot='Calendario actualizado: celeste.sebiche.com/sporting-cristal.ics',res=None),
'resultado':dict(kick='Resultado · Clausura 2026 · Fecha 12',big='FINAL',line1='Sporting Cristal <b class="score">4–2</b> Comerciantes Unidos',meta='Dom 18 oct 2026 · Lima',detail="Iberico 35' 64' · Barcos 71' 90+4'",foot='Ficha completa en celeste.sebiche.com',res='v'),
}
CSS='''
.f{position:absolute;inset:0;display:flex;flex-direction:column;padding:var(--p)}
.top{display:flex;align-items:center;justify-content:space-between;gap:24px}
.top .lock{height:var(--lh);width:auto;flex-shrink:0}
.main{flex:1;display:flex;flex-direction:column;justify-content:center;gap:var(--g)}
.big{font-size:var(--big);font-weight:800;color:var(--sc-celeste-400)}
.l1{font-family:var(--sc-font-display);font-weight:700;text-transform:uppercase;font-size:var(--l1);line-height:.95}
.l1 .score{color:var(--sc-oro-400);font-weight:800;white-space:nowrap}
.meta{font-family:var(--sc-font-mono);font-size:var(--m);color:var(--sc-niebla-300)}
.detail{font-size:var(--m);border-left:4px solid var(--sc-celeste-400);padding-left:18px}
.footer{display:flex;flex-direction:column;gap:14px;border-top:1px solid var(--sc-noche-700);padding-top:22px}
.footer .note{font-size:calc(var(--m)*.9)}
.footer .disc{font-size:calc(var(--m)*.62)}
.res{font-size:calc(var(--m)*1.1);padding:6px 14px}
.x .main{flex-direction:row;align-items:center;justify-content:space-between}
.x .big{font-size:calc(var(--big)*.9)}
'''
VARS={'post':'--p:80px;--lh:86px;--big:240px;--l1:92px;--m:30px;--g:28px;--k:24px','story':'--p:96px 80px 140px;--lh:96px;--big:300px;--l1:104px;--m:34px;--g:36px;--k:26px','x':'--p:64px 80px;--lh:72px;--big:250px;--l1:76px;--m:26px;--g:22px;--k:22px'}
jobs=[]
for kind,c in C.items():
    for fmt,(w,h) in FORMATS.items():
        res=f'<span class="res {c["res"]}">{"V" if c["res"]=="v" else ""}</span>' if c['res'] else ''
        text=f'<div class="kick">{c["kick"]}</div><div class="l1">{c["line1"]}</div><div class="meta">{c["meta"]}</div><div class="detail">{c["detail"]} {res}</div>'
        main=(f'<div style="display:flex;flex-direction:column;gap:var(--g);max-width:62%">{text}</div><div class="big disp">{c["big"]}</div>' if fmt=='x' else f'<div class="big disp">{c["big"]}</div>{text}')
        body=f'''<div class="stripe" style="--st:12px;position:absolute;top:0;left:0;right:0"><i></i><i></i><i></i></div>
<div class="f {fmt} grid-bg" style="{VARS[fmt]}"><div class="top">{svg_inline("lockup-horizontal-color","lock")}<span class="kick" style="color:var(--sc-niebla-300)">celeste.sebiche.com</span></div>
<div class="main">{main}</div>
<div class="footer"><div class="note">{c["foot"]}</div><div class="disc">{DISC}</div></div></div>
<!-- Plantilla editable: cambia los textos de arriba. No modifiques el logo ni el banderín. -->'''
        f=f'{B}/social/{kind}-{fmt}-{w}x{h}.html'; open(f,'w').write(page(body,w,h,CSS))
        jobs.append({'src':f,'out':f.replace('.html','.png'),'w':w,'h':h,'wait':300})
render(jobs); print(len(jobs))
