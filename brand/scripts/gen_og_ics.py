"""OG 1200x630 por sección + gráfico .ics 1200x630 + ícono .ics."""
import sys; sys.path.insert(0,'/workspace/sc-research/brand/scripts')
from lib import *
CSS='''.o{position:absolute;inset:0;padding:64px 72px 52px;display:flex;flex-direction:column}
.o .lock{height:64px;width:auto;align-self:flex-start;flex-shrink:0}.o h1{font-family:var(--sc-font-display);font-weight:800;text-transform:uppercase;font-size:118px;line-height:.88;margin:26px 0 10px}
.o p{font-size:28px;margin:0;color:var(--sc-niebla-300);max-width:780px;line-height:1.3}
.o .bot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end}
.o .disc{font-size:14px;max-width:560px}.o .url{white-space:nowrap;font-family:var(--sc-font-mono);font-size:18px;color:var(--sc-celeste-300)}
.side{position:absolute;right:72px;top:150px;text-align:right}.side .n{font-family:var(--sc-font-display);font-weight:800;font-size:150px;line-height:.85;color:var(--sc-oro-400)}.side .l{font-family:var(--sc-font-mono);font-size:18px;color:var(--sc-niebla-300);letter-spacing:.1em;text-transform:uppercase}'''
OG={'efemerides':('Efemérides','¿Qué jugó Sporting Cristal un día como hoy? Partidos, goles y torneos de cada fecha desde 1956.','1956','primer registro'),
    'rivales':('Rivales','Historial completo contra cada rival: partidos, victorias, empates y derrotas.','140','partidos ante Alianza Lima'),
    'anio':('Año a año','Cada temporada en cifras: rendimiento, goleadores y partidos clave.','71','temporadas')}
jobs=[]
for k,(t,d,n,l) in OG.items():
    body=f'''<div class="stripe" style="--st:10px"><i></i><i></i><i></i></div><div class="o grid-bg" style="top:10px">{svg_inline("lockup-horizontal-color","lock")}
<div class="kick" style="margin-top:44px">Sebiche Celeste · Archivo</div><h1>{t}</h1><p>{d}</p>
<div class="side"><div class="n">{n}</div><div class="l">{l}</div></div>
<div class="bot"><span class="disc">{DISC}</span><span class="url">celeste.sebiche.com</span></div></div>'''
    f=f'{B}/og/og-{k}.html'; open(f,'w').write(page(body,1200,630,CSS)); jobs.append({'src':f,'out':f'{B}/og/og-{k}-1200x630.png','w':1200,'h':630,'wait':300})
# .ics
ICS_CSS=CSS+'''.cal{position:absolute;right:84px;top:118px;width:300px;border:2px solid var(--sc-celeste-400);border-radius:8px;overflow:hidden;background:var(--sc-noche-900)}
.cal .h{background:var(--sc-celeste-400);color:var(--sc-noche-950);font-family:var(--sc-font-mono);font-weight:500;font-size:20px;padding:10px 18px;letter-spacing:.12em}
.cal .d{font-family:var(--sc-font-display);font-weight:800;font-size:150px;text-align:center;line-height:1.05;padding:8px 0 0}
.cal .s{font-family:var(--sc-font-mono);font-size:17px;text-align:center;padding:0 0 18px;color:var(--sc-niebla-300)}'''
body=f'''<div class="stripe" style="--st:10px"><i></i><i></i><i></i></div><div class="o grid-bg" style="top:10px">{svg_inline("lockup-horizontal-color","lock")}
<div class="kick" style="margin-top:44px">Calendario suscribible · .ics</div><h1 style="font-size:92px">Todos los<br>partidos en<br>tu calendario</h1>
<p style="max-width:640px">Se actualiza solo cada 6 horas. Google, Apple y Outlook.</p>
<div class="cal"><div class="h">OCT · 2026</div><div class="d">29</div><div class="s">SC vs Alianza Lima · 15:30</div></div>
<div class="bot"><span class="disc">{DISC}</span><span class="url">celeste.sebiche.com/sporting-cristal.ics</span></div></div>'''
f=f'{B}/ics/ics-subscribe.html'; open(f,'w').write(page(body,1200,630,ICS_CSS)); jobs.append({'src':f,'out':f'{B}/ics/ics-subscribe-1200x630.png','w':1200,'h':630,'wait':300})
icon='''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><title>Suscribirse al calendario</title>
<rect x="6" y="10" width="52" height="48" rx="6" fill="#0B1230" stroke="#3CBEEF" stroke-width="4"/><rect x="6" y="10" width="52" height="14" rx="6" fill="#3CBEEF"/><rect x="6" y="18" width="52" height="6" fill="#3CBEEF"/>
<rect x="18" y="4" width="5" height="12" rx="2" fill="#7ED4F5"/><rect x="41" y="4" width="5" height="12" rx="2" fill="#7ED4F5"/>
<path d="M32 30v18M23 39h18" stroke="#F1AA19" stroke-width="5" stroke-linecap="round"/></svg>'''
open(f'{B}/ics/ics-icon.svg','w').write(icon)
for s in (64,128,256): jobs.append({'src':f'{B}/ics/ics-icon.svg','out':f'{B}/ics/ics-icon-{s}.png','w':64,'h':64,'scale':s/64})
render(jobs); print('ok')
