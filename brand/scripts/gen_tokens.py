"""tokens.json -> tokens.css + tailwind.preset.cjs + contrast-report.md (WCAG 2.x)."""
import json
B='/workspace/sc-research/brand/tokens'
color=[
 # marca (solo para el logo/banderín)
 ("brand.banderin.celeste","#3CBEEF","Relleno del banderín. Solo en el símbolo y como acento grande."),
 ("brand.banderin.red","#D10F21","Franja roja-blanca-roja del banderín (igual a la del logo)."),
 ("brand.banderin.white","#FFFFFF","Filete interior y franja blanca del banderín."),
 ("brand.banderin.gold","#F1AA19","Tres estrellas del banderín (igual a las del logo)."),
 ("brand.logo.celeste","#5CE0E5","Palabra CELESTE del logo. No usar como texto de interfaz."),
 ("brand.logo.white","#F7FAFB","SEBICHE del logo."),
 ("brand.logo.red","#D10F21","Franja roja del logo."),
 ("brand.logo.gold","#F1AA19","Estrellas del logo."),
 # escala propia
 ("celeste.50","#EEF9FE","Fondos de selección suaves (claro)."),
 ("celeste.100","#D3F0FC","Hover suave, chips (claro)."),
 ("celeste.300","#7ED4F5","Acento en oscuro: bordes, iconos."),
 ("celeste.400","#3CBEEF","Acento principal en oscuro (texto AA sobre noche)."),
 ("celeste.600","#0A7FA8","Botón primario (claro) con texto blanco."),
 ("celeste.700","#086A8C","Texto de enlace/acento sobre papel (AA)."),
 ("celeste.900","#063A4F","Texto sobre celeste.100."),
 ("noche.950","#0B1230","Fondo base oscuro."),
 ("noche.900","#111A40","Superficie oscura."),
 ("noche.800","#1B265C","Superficie elevada oscura / header. Igual al navy del banderín."),
 ("noche.700","#2A3878","Bordes en oscuro."),
 ("papel.50","#F7FAFB","Fondo base claro (blanco del logo)."),
 ("papel.100","#EDF2F5","Superficie claro."),
 ("papel.200","#DCE4EA","Bordes en claro."),
 ("tinta.900","#121A3A","Texto principal en claro."),
 ("tinta.600","#46506E","Texto secundario en claro."),
 ("niebla.300","#C9D3E6","Texto secundario en oscuro."),
 ("oro.400","#F1AA19","Destacado/hitos (estrellas). En oscuro como texto; en claro solo relleno."),
 ("oro.800","#7A4E00","Texto de hito sobre papel."),
 ("rojo.600","#D10F21","Franja/alertas de marca, no para derrota."),
 ("result.win.light","#04724F","Victoria (claro)."),("result.win.dark","#3DDC97","Victoria (oscuro)."),
 ("result.draw.light","#8A4B00","Empate (claro)."),("result.draw.dark","#F6C344","Empate (oscuro)."),
 ("result.loss.light","#B4232C","Derrota (claro), letra P."),("result.loss.dark","#FF8A8A","Derrota (oscuro), letra P."),
]
C=dict((n,v) for n,v,_ in color)
themes={
 "light":{"bg":"papel.50","surface":"papel.100","border":"papel.200","text":"tinta.900","text-muted":"tinta.600","accent":"celeste.700","accent-strong":"celeste.600","on-accent":"#FFFFFF","highlight":"oro.800","win":"result.win.light","draw":"result.draw.light","loss":"result.loss.light","focus":"celeste.600","header":"noche.800"},
 "dark":{"bg":"noche.950","surface":"noche.900","border":"noche.700","text":"papel.50","text-muted":"niebla.300","accent":"celeste.400","accent-strong":"celeste.400","on-accent":"noche.950","highlight":"oro.400","win":"result.win.dark","draw":"result.draw.dark","loss":"result.loss.dark","focus":"celeste.300","header":"noche.800"},
}
res=lambda v:C.get(v,v)
def lum(h):
    h=h.lstrip('#');r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c:c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
    return .2126*f(r)+.7152*f(g)+.0722*f(b)
def cr(a,b):
    la,lb=sorted([lum(a),lum(b)],reverse=True);return (la+.05)/(lb+.05)
checks=[]
for t,m in themes.items():
    for fg,bg,need in [("text","bg",4.5),("text","surface",4.5),("text-muted","bg",4.5),("text-muted","surface",4.5),("accent","bg",4.5),("accent","surface",4.5),("on-accent","accent-strong",4.5),("highlight","bg",4.5),("win","bg",4.5),("draw","bg",4.5),("loss","bg",4.5),("win","surface",4.5),("draw","surface",4.5),("loss","surface",4.5),("focus","bg",3.0),("text","header",4.5) if t=='dark' else ("papel.50","header",4.5)]:
        a=res(m.get(fg,fg)); b=res(m[bg]); r=cr(a,b); checks.append((t,fg,bg,a,b,round(r,2),need,r>=need))
ref=[("Logo blanco sobre noche.950","#F7FAFB","#0B1230",3.0),("Banderín celeste sobre noche.950 (gráfico)","#3CBEEF","#0B1230",3.0),("Banderín celeste sobre papel.50 (gráfico)","#3CBEEF","#F7FAFB",3.0),("Estrellas oro sobre celeste del banderín (gráfico)","#F1AA19","#3CBEEF",3.0),("Franja roja del banderín sobre noche.950 (gráfico)","#D10F21","#0B1230",3.0),("Web actual --color-celeste claro #08769A sobre blanco","#08769A","#FFFFFF",4.5)]
for n,a,b,need in ref: checks.append(("ref",n,"",a,b,round(cr(a,b),2),need,cr(a,b)>=need))
tok={"$schema":"sebiche-celeste/tokens v1","meta":{"name":"Sebiche Celeste","version":"1.0.0","date":"2026-10-24","note":"Identidad autónoma. Sin escudo de Sporting Cristal ni respaldo SEBICHE."},
 "color":[{"name":n,"value":v,"usage":u} for n,v,u in color],
 "theme":{t:[{"name":k,"value":res(v),"ref":v if v in C else None,"usage":k} for k,v in m.items()] for t,m in themes.items()},
 "font":[{"name":"display","value":"'Barlow Condensed', 'Arial Narrow', sans-serif","usage":"Titulares, cifras, marcadores. 600–800, mayúsculas con tracking 0.02em."},
         {"name":"body","value":"'Inter', -apple-system, 'Segoe UI', sans-serif","usage":"Lectura y controles. 400–600."},
         {"name":"mono","value":"'IBM Plex Mono', ui-monospace, monospace","usage":"Fechas, marcadores tabulares, metadatos."}],
 "size":[{"name":k,"value":v,"usage":u} for k,v,u in [("xs","0.75rem","Metadatos"),("sm","0.875rem","Tabla, labels"),("base","1rem","Cuerpo"),("lg","1.25rem","Subtítulo"),("xl","1.75rem","Título de sección"),("2xl","2.5rem","Título de página"),("3xl","4rem","Cifra héroe")]],
 "space":[{"name":str(k),"value":f"{k*0.25}rem","usage":"Escala 4 px"} for k in [1,2,3,4,6,8,12,16,24]],
 "radius":[{"name":"none","value":"0","usage":"Tablas, franjas"},{"name":"sm","value":"4px","usage":"Badges, inputs"},{"name":"md","value":"8px","usage":"Cards"}],
 "border":[{"name":"hairline","value":"1px","usage":"Divisores de archivo"},{"name":"stripe","value":"4px","usage":"Franja de marca en cabeceras"}],
 "motion":[{"name":"fast","value":"120ms","usage":"Hover"},{"name":"base","value":"200ms","usage":"Entradas"}],
 "contrast":[{"theme":t,"fg":f,"bg":b,"fgValue":a,"bgValue":c,"ratio":r,"min":n,"pass":p} for t,f,b,a,c,r,n,p in checks]}
json.dump(tok,open(f'{B}/tokens.json','w'),indent=2,ensure_ascii=False)
var=lambda n:'--sc-'+n.replace('.','-')
css="/* Sebiche Celeste tokens v1 — generado por scripts/gen_tokens.py. No editar a mano. */\n:root{\n"+''.join(f"  {var(n)}: {v};\n" for n,v,_ in color)
css+=''.join(f"  --sc-font-{f['name']}: {f['value']};\n" for f in tok['font'])+''.join(f"  --sc-text-{s['name']}: {s['value']};\n" for s in tok['size'])+''.join(f"  --sc-space-{s['name']}: {s['value']};\n" for s in tok['space'])+''.join(f"  --sc-radius-{s['name']}: {s['value']};\n" for s in tok['radius'])+"}\n"
for t,sel in [("light",":root, [data-theme='light']"),("dark","[data-theme='dark']")]:
    css+=sel+"{\n"+''.join(f"  --sc-{k}: {('var('+var(v)+')') if v in C else v};\n" for k,v in themes[t].items())+f"  color-scheme: {t};\n}}\n"
css+="@media (prefers-color-scheme: dark){:root:not([data-theme='light']){\n"+''.join(f"  --sc-{k}: {('var('+var(v)+')') if v in C else v};\n" for k,v in themes['dark'].items())+"  color-scheme: dark;\n}}\n"
open(f'{B}/tokens.css','w').write(css)
tw={}
for n,v,_ in color:
    parts=n.split('.'); d=tw
    for p in parts[:-1]: d=d.setdefault(p,{})
    d[parts[-1]]=v
sem={k:f"var(--sc-{k})" for k in themes['light']}
open(f'{B}/tailwind.preset.cjs','w').write("/** Sebiche Celeste Tailwind preset — generado. */\nmodule.exports = {\n  darkMode: ['selector', \"[data-theme='dark']\"],\n  theme: { extend: {\n    colors: "+json.dumps({"sc":tw,**{"sc-"+k:v for k,v in sem.items()}},indent=2).replace('\n','\n    ')+",\n    fontFamily: { display: ['Barlow Condensed','Arial Narrow','sans-serif'], body: ['Inter','-apple-system','Segoe UI','sans-serif'], mono: ['IBM Plex Mono','ui-monospace','monospace'] },\n    borderRadius: { sm: '4px', md: '8px' },\n  } },\n};\n")
md="# Contraste WCAG — Sebiche Celeste\n\n| Tema | Primer plano | Fondo | Valores | Ratio | Mínimo | OK |\n|---|---|---|---|---|---|---|\n"+''.join(f"| {t} | {f} | {b} | {a} / {c} | {r} | {n} | {'✅' if p else '❌'} |\n" for t,f,b,a,c,r,n,p in checks)
open(f'{B}/contrast-report.md','w').write(md)
fails=[c for c in checks if not c[7]];print('checks',len(checks),'fails',fails)
