// uso: node shot.js <file.html|svg> <out.png> <w> <h> [scale]
const { chromium } = require('playwright');
(async()=>{const [f,o,w,h,s]=process.argv.slice(2);const b=await chromium.launch();const p=await b.newPage({viewport:{width:+w,height:+h},deviceScaleFactor:+(s||1)});
await p.goto('file://'+require('path').resolve(f));await p.waitForTimeout(300);await p.screenshot({path:o,omitBackground:true});await b.close();})();
