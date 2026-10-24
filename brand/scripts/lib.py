import re, json, subprocess, os
B='/workspace/sc-research/brand'
def svg_inline(name, cls=''):
    s=open(f'{B}/logo/svg/sebiche-celeste-{name}.svg').read()
    return re.sub(r'<svg ([^>]*?)width="[^"]+" height="[^"]+"',lambda m:f'<svg class="{cls}" {m.group(1)}preserveAspectRatio="xMidYMid meet"',s,count=1)
DISC="Proyecto independiente de hinchas · Sin relación oficial con el Club Sporting Cristal"
def page(body,w,h,extra_css='',theme='dark',rel='..'):
    return f'''<!doctype html><html lang="es" data-theme="{theme}"><head><meta charset="utf-8">
<link rel="stylesheet" href="{rel}/fonts/fonts.css"><link rel="stylesheet" href="{rel}/tokens/tokens.css"><link rel="stylesheet" href="{rel}/scripts/templates.css">
<style>html,body{{margin:0;width:{w}px;height:{h}px;overflow:hidden}}{extra_css}</style></head><body>{body}</body></html>'''
def render(jobs):
    json.dump(jobs,open('/tmp/rj.json','w')); subprocess.run(['node',f'{B}/scripts/render_many.js','/tmp/rj.json'],check=True)
