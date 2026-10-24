import markdown,subprocess,json,pathlib
B=pathlib.Path('/workspace/sc-research/brand')
CSS="""body{font-family:Inter,sans-serif;color:#121A3A;max-width:820px;margin:0 auto;padding:40px;font-size:14px;line-height:1.55}
h1,h2{font-family:'Barlow Condensed';text-transform:uppercase;line-height:.95}h1{font-size:46px;border-top:6px solid #D10F21;padding-top:16px}h2{font-size:28px;color:#086A8C;margin-top:34px;break-after:avoid}
img{max-width:100%;border:1px solid #dde;break-inside:avoid}table{border-collapse:collapse;width:100%;break-inside:avoid}td,th{border-bottom:1px solid #dde;padding:6px;text-align:left}th{font-family:'IBM Plex Mono';font-size:11px;text-transform:uppercase}
blockquote{background:#0B1230;color:#F7FAFB;margin:0;padding:14px 18px;border-left:6px solid #3CBEEF}code{font-family:'IBM Plex Mono';font-size:12px}"""
def build(md,html,title,hero=''):
    body=markdown.markdown(md.read_text(),extensions=['tables'])
    html.write_text(f'<!doctype html><html lang="es"><head><meta charset="utf-8"><title>{title}</title><link rel="stylesheet" href="../fonts/fonts.css"><style>{CSS}</style></head><body>{hero}{body}</body></html>')
hero='<div style="background:#0B1230;padding:40px;text-align:center"><img style="border:0;width:70%" src="../logo/svg/sebiche-celeste-lockup-horizontal-color.svg"></div>'
build(B/'guide/GUIA_DE_MARCA.md',B/'guide/guia-de-marca.html','Guía de marca Sebiche Celeste',hero)
build(B/'press/PRESS_KIT.md',B/'press/press-kit.html','Press kit Sebiche Celeste',hero)
