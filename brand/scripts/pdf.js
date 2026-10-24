const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();
for(const [s,o] of JSON.parse(process.argv[2])){await p.goto('file://'+s,{waitUntil:'networkidle'});await p.waitForTimeout(300);await p.pdf({path:o,format:'A4',printBackground:true,margin:{top:'14mm',bottom:'14mm',left:'10mm',right:'10mm'}});}
await b.close()})();
