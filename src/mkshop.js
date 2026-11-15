const fs=require('fs');const v=process.argv[2]||'';
let t=fs.readFileSync(__dirname+'/shop.template.html','utf8');
const sc=fs.readFileSync(__dirname+'/scenes.js','utf8');
const CAL=(new Function(sc+';return CAL;'))();
t=t.replace('/*CSS*/',CAL.CSS).replace('/*SCENES*/',()=>sc);
if(v)t=t.replace("venmo: ''","venmo: '"+v+"'");
fs.writeFileSync(process.argv[3]||'shop/index.html',t);
