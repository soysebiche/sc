import cairosvg, io, numpy as np, sys, json
from PIL import Image
def render(svg,w,h): return Image.open(io.BytesIO(cairosvg.svg2png(url=svg,output_width=w,output_height=h))).convert('RGBA')
def compare(svg,src,out,label):
    s=Image.open(src).convert('RGBA'); r=render(svg,*s.size)
    A=np.array(s).astype(float); B=np.array(r).astype(float)
    pa=A[...,:3]*A[...,3:]/255+255*(1-A[...,3:]/255); pb=B[...,:3]*B[...,3:]/255+255*(1-B[...,3:]/255)
    diff=np.abs(pa-pb).max(-1)
    res={'label':label,'size':s.size,'mean_abs_diff':round(float(diff.mean()),3),'pct_px_diff_gt32':round(float((diff>32).mean()*100),4),'alpha_IoU':round(float(((A[...,3]>127)&(B[...,3]>127)).sum()/((A[...,3]>127)|(B[...,3]>127)).sum()),5)}
    ov=np.stack([np.clip(255-diff*3,0,255)]*3,-1); ov[diff>32]=[255,0,200]
    Image.fromarray(ov.astype('uint8')).save(out); print(res); return res
if __name__=='__main__':
    R=[]
    R.append(compare(sys.argv[1],'/workspace/sc-research/public/SebicheCeleste logo copy.png','/workspace/sc-research/brand/trace/diff-logo-6001.png','logo vs raster maestro 6001x2725'))
    R.append(compare(sys.argv[1],'/workspace/sc-research/public/sebiche-celeste-logo.webp','/workspace/sc-research/brand/trace/diff-logo-512.png','logo vs webp web 512x233'))
    if len(sys.argv)>2: R.append(compare(sys.argv[2],'/workspace/sc-research/public/pennant-source.png','/workspace/sc-research/brand/trace/diff-pennant-84.png','banderín vs pennant-source 84x84'))
    json.dump(R,open('/workspace/sc-research/brand/trace/diff-report.json','w'),indent=1)
