// uso: node render_many.js jobs.json  -> [{src,out,w,h,scale}]
const { chromium } = require('playwright');const path=require('path');
(async()=>{const jobs=require(path.resolve(process.argv[2]));const b=await chromium.launch();
for(const j of jobs){const p=await b.newPage({viewport:{width:j.w,height:j.h},deviceScaleFactor:j.scale||1});
await p.goto('file://'+path.resolve(j.src));await p.waitForTimeout(j.wait||150);await p.screenshot({path:j.out,omitBackground:true,fullPage:!!j.full});await p.close();}
await b.close();})();
