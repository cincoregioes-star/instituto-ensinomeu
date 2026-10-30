import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, resolve, normalize } from 'node:path';
import { once } from 'node:events';

const root = process.cwd();
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml'};
const server = createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const local = resolve(join(root, normalize(p === '/' ? 'index.html' : p.slice(1))));
  if (!local.startsWith(root)) { res.writeHead(403);res.end();return; }
  try {const bytes=await readFile(local);res.setHeader('Content-Type',mime[extname(local)]||'application/octet-stream');res.end(bytes);}
  catch {res.writeHead(404);res.end('Não encontrado');}
});
server.listen(0,'127.0.0.1');await once(server,'listening');
const url='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || (existsSync('/usr/bin/google-chrome')?'/usr/bin/google-chrome':'/usr/bin/chromium'),args:['--no-sandbox']});
const failures=[];const sizes=[{width:1440,height:900},{width:1280,height:800},{width:1024,height:768},{width:768,height:900},{width:390,height:844},{width:360,height:740}];
await mkdir('artifacts/screenshots',{recursive:true});
try{
for (const viewport of sizes) {
 const page=await browser.newPage({viewport,deviceScaleFactor:1});
 await page.goto(url+'/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('.access-link').first().waitFor();
 const check=await page.evaluate(()=>{
  const rect=e=>{const r=e.getBoundingClientRect();return {top:r.top,left:r.left,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
  const pairs=[...document.querySelectorAll('.access-link')].map(card=>({strong:rect(card.querySelector('strong')),small:rect(card.querySelector('small'))}));
  const hero=document.querySelector('.float-card');const title=hero.querySelector('strong'),subtitle=hero.querySelector('small');
  const footer=document.querySelector('.footer-grid');
  const styles=getComputedStyle(footer);
  return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
   pairs,hero:{strong:rect(title),small:rect(subtitle)},
   footerColumns:styles.gridTemplateColumns.split(/\s+/).length,
   contentLoaded:getComputedStyle(document.querySelector('.access-link')).display==='flex',
   pictureCount:document.querySelectorAll('.slide').length
  };
 });
 if(check.scrollWidth>viewport.width+2)failures.push(viewport.width+'px: overflow horizontal de '+(check.scrollWidth-viewport.width)+'px');
 for (const [i,p] of check.pairs.entries())if(p.small.top<p.strong.bottom-2)failures.push(viewport.width+'px: sobreposição do card '+(i+1));
 if(check.hero.small.top<check.hero.strong.bottom-2)failures.push(viewport.width+'px: legenda sobreposta');
 if(viewport.width>=1280 && check.footerColumns!==4)failures.push(viewport.width+'px: rodapé com '+check.footerColumns+' colunas');
 if(viewport.width<=390 && check.footerColumns!==1)failures.push(viewport.width+'px: rodapé móvel com '+check.footerColumns+' colunas');
 if(!check.contentLoaded || check.pictureCount!==1)failures.push(viewport.width+'px: CSS ou imagem institucional incoerente');
 if(viewport.width===390){
  const menu=page.locator('#menu-toggle');
  if(!(await menu.isVisible()))failures.push('Menu móvel invisível');
  else {await menu.click();if(await menu.getAttribute('aria-expanded')!=='true')failures.push('Menu não abre pelo teclado/botão');}
  await page.screenshot({path:'artifacts/screenshots/inicio-mobile.png',fullPage:true});
 }
 if(viewport.width===1440)await page.screenshot({path:'artifacts/screenshots/inicio-desktop.png',fullPage:true});
 console.log('Viewport '+viewport.width+'px: '+JSON.stringify({scrollWidth:check.scrollWidth,footerColumns:check.footerColumns,pictures:check.pictureCount}));
 await page.close();
}
const signup=await browser.newPage({viewport:{width:390,height:844}});
await signup.goto(url+'/cadastro.html',{waitUntil:'domcontentloaded'});
for (const id of ['name','email','kind','grade','password','confirm','adult','privacy','signup-btn']){
 if(!(await signup.locator('#'+id).isVisible()))failures.push('Cadastro: campo oculto '+id);
}
await signup.screenshot({path:'artifacts/screenshots/cadastro-mobile.png',fullPage:true});
await signup.close();
} finally {await browser.close();server.close();}
if(failures.length){for(const error of failures)console.error('FALHA '+error);process.exitCode=1}
else console.log('Auditoria visual em Chromium: seis resoluções sem sobreposição detectada.');
