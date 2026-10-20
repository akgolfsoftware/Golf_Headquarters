const fs=require("fs"),path=require("path"),parser=require("@babel/parser");
if(process.argv.length!==4){console.error("Bruk: node precision-export-syntax.cjs eksportrot privat-resultat.json");process.exit(2)}
const root=process.argv[2],out=process.argv[3];let n=0,inline=0,bad=[];
function parse(code,file){n++;try{parser.parse(code,{sourceType:"unambiguous",plugins:["jsx","typescript"]})}catch(e){bad.push({file,error:e.message})}}
function walk(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,d.name),rel=path.relative(root,f);if(d.isDirectory()){if(!["arkiv","_kilde","_utenfor"].includes(d.name))walk(f);continue}if(/\.(js|jsx)$/.test(f))parse(fs.readFileSync(f,"utf8"),rel);else if(/\.html$/.test(f)){const txt=fs.readFileSync(f,"utf8");let i=0;for(const m of txt.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){i++;if(/\bsrc\s*=/.test(m[1])||!m[2].trim())continue;const type=(m[1].match(/\btype=["']([^"']+)["']/i)||[])[1];if(type&&!/javascript|babel|module/.test(type))continue;inline++;parse(m[2],rel+"#script"+i)}}}}
walk(root);const r={scripts:n,inline,inlineIncludedInScripts:true,syntax_errors:bad.length,errors:bad};fs.writeFileSync(out,JSON.stringify(r,null,2));console.log(JSON.stringify(r));

if(bad.length)process.exitCode=1;
