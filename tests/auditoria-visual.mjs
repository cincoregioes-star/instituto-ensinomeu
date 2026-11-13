import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {join,extname,resolve,normalize} from 'node:path';
import {once} from 'node:events';

const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.mp4':'video/mp4'};
const server=createServer(async(req,res)=>{
 const requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const full=resolve(join(root,normalize(requested==='/'?'index.html':requested.slice(1))));
 if(!full.startsWith(root)){res.writeHead(403);res.end();return}
 try{const bytes=await readFile(full);res.setHeader('Content-Type',mime[extname(full)]||'application/octet-stream');res.end(bytes)}
 catch{res.writeHead(404);res.end('Não encontrado')}
});
server.listen(0,'127.0.0.1');await once(server,'listening');
const origin='http://127.0.0.1:'+server.address().port;
const executablePath=process.env.CHROME_PATH||(existsSync('/usr/bin/google-chrome')?'/usr/bin/google-chrome':'/usr/bin/chromium');
const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
const failures=[];
await mkdir('artifacts/screenshots',{recursive:true});
async function openPage(path,viewport){
 const page=await browser.newPage({viewport,deviceScaleFactor:1});
 await page.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(url.hostname==='127.0.0.1')return route.continue();
   return route.abort();
 });
 await page.goto(origin+'/'+path,{waitUntil:'domcontentloaded'});
 return page;
}
async function noOverflow(page,label){
 const d=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
 if(d.scroll>d.width+3)failures.push(label+': rolagem horizontal '+(d.scroll-d.width)+'px');
 return d;
}
try{
 for(const viewport of [{width:1440,height:900},{width:1280,height:800},{width:1024,height:768},{width:768,height:900},{width:390,height:844},{width:360,height:740}]){
  const page=await openPage('index.html',viewport);
  await page.locator('.lesson').first().waitFor({timeout:5000});
  const info=await noOverflow(page,'Início '+viewport.width);
  if(await page.locator('#ensino-voltar-global').isVisible())failures.push('Início '+viewport.width+': botão Voltar não deve aparecer na página inicial');
  const content=await page.evaluate(()=>({
    cards:document.querySelectorAll('.lesson').length,
    title:document.querySelector('#aulas-gravadas h2')?.textContent?.trim(),
    ebook:!!document.getElementById('ebooks'),
    cardColor:getComputedStyle(document.querySelector('.lesson.math')).backgroundImage,
    ingles8:!!document.getElementById('ingles8-video-card'),
    menu:!!document.querySelector('.top')
  }));
  if(content.cards<9)failures.push('Início: catálogo deve apresentar pelo menos nove videoaulas por disciplina e série');
  if(!content.ingles8)failures.push('Início: falta a videoaula de Inglês do 8º ano');
  if(content.title!=='Aulas gravadas disponíveis')failures.push('Título incorreto na seção de videoaulas');
  if(!content.ebook)failures.push('Seção de e-books ausente');
  if(!content.cardColor?.includes('gradient'))failures.push('Cards sem paleta colorida');
  if(viewport.width<=390){
    const menu=page.locator('.mobile summary');
    if(!(await menu.isVisible()))failures.push('Menu móvel não visível');
    else{await menu.click();if(!(await page.locator('.mobile-links a').first().isVisible()))failures.push('Menu móvel não abre')}
    if(viewport.width===390)await page.screenshot({path:'artifacts/screenshots/inicio-mobile.png',fullPage:true});
  }
  if(viewport.width===1440)await page.screenshot({path:'artifacts/screenshots/inicio-desktop.png',fullPage:true});
  console.log('Início '+viewport.width+'px '+JSON.stringify(info));
  await page.close();
 }
 for(const [file,viewport,shot] of [
   ['painel.html',{width:1440,height:900},'painel-desktop.png'],
   ['painel.html',{width:390,height:844},'painel-mobile.png'],
   ['admin.html',{width:1280,height:800},'admin-desktop.png'],
   ['login.html',{width:390,height:844},'login-mobile.png'],
   ['planos.html',{width:390,height:844},'planos-mobile.png']
 ]){
  const page=await openPage(file,viewport);
  await noOverflow(page,file+' '+viewport.width);
  if(!(await page.locator('#ensino-voltar-global').isVisible()))failures.push(file+': botão Voltar não está visível');
  if(file==='painel.html'){
    if(!(await page.locator('.app-sidebar').isVisible()))failures.push('Painel: menu lateral indisponível');
    if((await page.locator('.quick-card').count())!==6)failures.push('Painel: são esperados seis atalhos de acesso');
    if((await page.locator('a.quick-card[href="dashboard-aluno.html"]').count())!==1)failures.push('Painel: dashboard do aluno ausente');
    if((await page.locator('a#painel-controle-card[hidden]').count())!==1)failures.push('Painel: controle administrativo não está oculto antes da autenticação');
    if(!(await page.locator('[data-action-side="ebooks"]').first().isVisible()))failures.push('Painel: atalho de e-books invisível');
  }
  if(file==='admin.html' && !(await page.locator('.app-sidebar').isVisible()))failures.push('Administração: menu lateral indisponível');
  if(file==='login.html' && !(await page.locator('#username').isVisible()))failures.push('Login: nome de usuário invisível');
  if(file==='planos.html' && (await page.locator('.plan-card').count())!==12)failures.push('Planos: eram esperados 12 planos');
  await page.screenshot({path:'artifacts/screenshots/'+shot,fullPage:true});
  console.log('Layout '+file+' verificado em '+viewport.width+'px');
  await page.close();
 }
 for(const [file,expected] of [
   ['dashboard-aluno.html','painel.html'],
   ['painel-controle.html','painel.html'],
   ['trilha.html','painel.html'],
   ['simulados/geografia-9ano-aula02.html','geografia-9ano.html'],
   ['simulados/historia-9ano-aula01.html','historia-9ano.html']
 ]){
   const page=await openPage(file,{width:390,height:844});
   const back=page.locator('#ensino-voltar-global');
   if(!(await back.isVisible()))failures.push(file+': botão Voltar invisível');
   const target=await back.getAttribute('href');
   if(!target?.includes(expected))failures.push(file+': destino de retorno incorreto '+target);
   await page.close();
 }

 // Novas trilhas de IA e apostilas digitais sem dependência de autenticação.
 for(const [file,viewport] of [['ensino-ia.html?serie=fi-5',{width:390,height:844}],['apostila-ia.html?serie=fii-7',{width:390,height:844}],['ia-tutoria.html',{width:390,height:844}]]){
  const page=await openPage(file,viewport),name=file.split('?')[0];
  await noOverflow(page,'IA '+name+' '+viewport.width);
  if(!(await page.locator('#ensino-voltar-global').isVisible()))failures.push(name+': botão Voltar não disponível');
  if(name==='ensino-ia.html'){
   if((await page.locator('#grade-select option').count())!==8)failures.push('IA: faltam opções para as oito séries');
   await page.locator('#lesson-tabs button').nth(3).click();
   if(!(await page.locator('#quiz-form').isVisible()))failures.push('IA: autocorreção não abre');
   else{
    await page.locator('#quiz-form input[value="1"]').check();
    await page.locator('#quiz-form button').click();
    if(!(await page.locator('#quiz-feedback').isVisible()))failures.push('IA: autocorreção não apresenta retorno');
   }
   await page.locator('#grade-select').selectOption('em-3');
   const href=await page.locator('#book-link').getAttribute('href');
   if(!href?.includes('serie=em-3'))failures.push('IA: link da apostila não atualiza a série');
  }
  if(name==='apostila-ia.html'){
   await page.locator('#book .unit').first().waitFor({timeout:5000});
   if((await page.locator('#book .unit').count())!==4)failures.push('Apostila IA: três trimestres e conclusão não renderizados');
   const count=await page.locator('#book .vocab').count();
   if(count!==9)failures.push('Apostila IA: glossários incompletos '+count);
   await page.locator('#grade').selectOption('em-2');
   if(!(await page.locator('.cover h2').innerText()).includes('2ª'))failures.push('Apostila IA: troca de série não atualizou a capa');
  }
  if(name==='ia-tutoria.html'&&!await page.locator('#question').count())failures.push('Tutoria: formulário ausente');
  await page.close();
 }
 const fromDirect=await openPage('simulados/geografia-9ano-aula02.html',{width:1100,height:820});
 await fromDirect.locator('#ensino-voltar-global').click();
 try{await fromDirect.waitForURL('**/geografia-9ano.html#titulo-video-02',{timeout:4000})}
 catch{failures.push('Voltar após acesso direto ao simulado não abriu a videoaula de origem')}
 await fromDirect.close();
}finally{await browser.close();server.close()}
if(failures.length){for(const f of failures)console.error('FALHA '+f);process.exitCode=1}
else console.log('Auditoria visual V8 em Chromium aprovada nas resoluções selecionadas.');
