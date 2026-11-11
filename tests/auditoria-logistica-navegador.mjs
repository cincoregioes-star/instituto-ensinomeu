import {chromium} from "playwright";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,join,extname,normalize} from "node:path";
import {once} from "node:events";

const root=process.cwd();
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8"};
const server=createServer(async(req,res)=>{
 const path=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
 const full=resolve(join(root,normalize((path==="/"?"/index.html":path).slice(1))));
 if(!full.startsWith(root)){res.writeHead(403);res.end();return}
 try{
  const bytes=await readFile(full);
  res.writeHead(200,{"Content-Type":types[extname(full)]||"application/octet-stream"});
  res.end(bytes);
 }catch{res.writeHead(404);res.end("Arquivo não encontrado")}
});
server.listen(0,"127.0.0.1");
await once(server,"listening");
const origin="http://127.0.0.1:"+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||"/usr/bin/google-chrome",args:["--no-sandbox"]});
const fail=(message)=>{throw new Error(message)};
const errors=[];
try{
 for(const [track,expected] of [["est",100],["rec",100],["pck",100],["ops",100],["sel",100],["adm",100],["mov",100],["trp",100],["seg",100],["inv",100],["pak",10]]){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  page.on("pageerror",e=>errors.push(track+": "+e.message));
  const url=origin+"/conteudos-recuperados/logistica/index.html?trilha="+track;
  await page.goto(url,{waitUntil:"domcontentloaded"});
  await page.locator("#curso:not([hidden])").waitFor();
  const modules=await page.locator("#modulos .bloco").count();
  if(modules!== (expected===100?5:2))fail(track+": quantidade errada de módulos: "+modules);
  const text=await page.locator("#cursoResumo").textContent();
  if(!text.includes(expected+" questões"))fail(track+": contagem não aparece no curso");
  const width=await page.evaluate(()=>({body:document.documentElement.scrollWidth,screen:window.innerWidth}));
  if(width.body>width.screen+3)fail(track+": rolagem horizontal mobile "+JSON.stringify(width));
  const back=page.locator("#ensino-voltar-global");
  if(!(await back.isVisible()))fail(track+": botão Voltar não aparece");
  await page.locator("#modulos button").first().click();
  let num=expected===100?20:5;
  for(let j=0;j<num;j++){
   const current=await page.locator("#contador").textContent();
   if(!current.includes("Questão "+(j+1)+" de "+num))fail(track+": contador incorreto "+current);
   const a=await page.evaluate(({track,j})=>{
    const base=JSON.parse(document.getElementById("dados").textContent);
    const bank=[...base.banks[track],...(window.LOGISTICA_EXTRAS?.[track]||[]),...(window.LOGISTICA_EXTRAS_LOTE2?.[track]||[]),...(window.LOGISTICA_EXTRAS_LOTE3?.[track]||[]),...(window.LOGISTICA_EXTRAS_LOTE4?.[track]||[]),...(window.LOGISTICA_EXTRAS_LOTE5?.[track]||[])];
    return bank[j].a;
   },{track,j});
   await page.locator("#alternativas button").nth(a).click();
   if(!(await page.locator("#comentario").isVisible()))fail(track+": explicação não apareceu na questão "+(j+1));
   await page.locator("#avancar").click();
  }
  await page.locator("#resultado:not([hidden])").waitFor();
  const nota=await page.locator("#nota").textContent();
  if(nota!=="100%")fail(track+": nota esperada 100%, obtida "+nota);
  if((await page.locator("#revisao .revisao").count())!==num)fail(track+": revisão incompleta");
  if(expected===100){
   await page.locator("#voltarDepois").click();
   await page.locator("#modulos button").nth(4).click();
   if(!(await page.locator("#contador").textContent()).includes("de 20"))fail(track+": módulo 5 sem vinte questões");
  }
  await page.close();
  console.log("OK Chromium "+track+": "+modules+" módulos; avanço, correção, resultado, revisão e layout móvel.");
 }
 if(errors.length)fail("Erros JavaScript: "+errors.join("; "));
 console.log("OK: dez trilhas completas e uma parcial operacionais no navegador.");
}finally{
 await browser.close();server.close();
}
