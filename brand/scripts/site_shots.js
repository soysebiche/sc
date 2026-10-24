// node site_shots.js <baseURL> <outDir>
const {chromium}=require('playwright');const fs=require('fs');
const [base,out]=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const pages=[['efemerides','?view=efemerides'],['dashboard','?view=dashboard'],['partidos','?view=partidos&year=2025'],['anio','?view=analisis-anual']];
const vps=[['desktop',1440,1000],['mobile',390,844]];
(async()=>{const b=await chromium.launch();
for(const scheme of ['light','dark'])for(const [vn,w,h] of vps){
 const ctx=await b.newContext({viewport:{width:w,height:h},colorScheme:scheme,deviceScaleFactor:1});const p=await ctx.newPage();
 for(const [n,q] of pages){ if(scheme==='dark'&&vn==='mobile'&&n!=='partidos')continue;
  await p.goto(base+q,{waitUntil:'networkidle'});await p.waitForTimeout(700);
  await p.screenshot({path:`${out}/${n}-${vn}-${scheme}.png`,fullPage:false});}
 await ctx.close();}
await b.close()})();
