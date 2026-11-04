import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

const read=p=>readFileSync(p,'utf8');
const problems=[];
function check(title,fn){try{fn();console.log('OK: '+title)}catch(error){console.error('FALHA: '+title+': '+error.message);problems.push(title)}}
const home=read('index.html');
const login=read('login.html');
const signup=read('cadastro.html');
const panel=read('painel.html');
const admin=read('admin.html');
const studyJS=read('ensino-painel.js');
const authJS=read('ensino-auth.js');
const theme=read('ensino-cores-v8.css');
const panelTheme=read('ensino-painel-v8.css');
const plans=read('planos.html');
check('Arquivos da versão V8 presentes',()=>{
 for(const f of ['index.html','login.html','cadastro.html','painel.html','admin.html','config.js','ensino-auth.js','ensino-painel.js','ensino-admin.js','ensino-cores-v8.css','ensino-painel-v8.css','assets/brasao.png','assets/favicon.png','planos.html','privacidade.html','matematica-9ano.html','geografia-9ano.html','historia-9ano.html','portugues-9ano.html'])assert.ok(existsSync(f),f);
});
check('Título correto e acesso às aulas gravadas',()=>{
 assert.ok(home.includes('Aulas gravadas disponíveis'));
 assert.ok(home.includes('id="aulas-gravadas"'));
 assert.ok(!home.includes('<h2>Aulas disponíveis</h2>'));
 for(const f of ['matematica-9ano.html','geografia-9ano.html','historia-9ano.html','portugues-9ano.html'])assert.ok(home.includes('href="'+f+'"'),f);
});
check('E-books apresentados separadamente sem disponibilidade inventada',()=>{
 assert.ok(home.includes('id="ebooks"'));
 assert.ok(home.includes('309'));
 assert.ok(/revisão pedagógica/i.test(home));
 assert.ok(!/49\s+e-books de apoio/.test(home));
});
check('Navegação da vitrine com âncoras válidas e sem IDs duplicados',()=>{
 const ids=[...home.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
 for(const m of home.matchAll(/href="#([^"]+)"/g))assert.ok(home.includes('id="'+m[1]+'"'),m[1]);
 for(const m of home.matchAll(/href="planos\.html#([^"]+)"/g))assert.ok(plans.includes('id="'+m[1]+'"'),m[1]);
});
check('Menu lateral e atalhos funcionais no painel',()=>{
 assert.ok(panel.includes('class="app-sidebar"'));
 assert.ok(panel.includes('class="quick-grid"'));
 for(const a of ['grades','subjects','ebooks','exams','history'])assert.ok(panel.includes('data-action-side="'+a+'"'),a);
 assert.ok(studyJS.includes('async function openArea(action)'));
 assert.ok(studyJS.includes("FILTER_MODE==='pdf'"));
 assert.ok(studyJS.includes("FILTER_MODE==='simulado'"));
});
check('Login por usuário protegido pelo servidor',()=>{
 assert.ok(login.includes('id="username"')&&login.includes('id="password"'));
 assert.ok(authJS.includes('signInWithPassword('));
 assert.ok(authJS.includes('/functions/v1/ensino-api/me'));
 assert.ok(!authJS.includes('SUPABASE_SERVICE_ROLE_KEY'));
 assert.ok(!panel.includes('senha:1234qwer'));
});
check('Cadastro público pausado sem apagar acesso à conta',()=>{
 assert.ok(!signup.includes('<form'));
 assert.ok(signup.includes('href="login.html"'));
 assert.ok(!home.includes('href="cadastro.html"'));
});
check('Identidade visual com paleta viva e CSS válido',()=>{
 for(const x of ['#f5c136','#176cc1','#007a54'])assert.ok(home.includes(x),x);
 for(const x of ['.app-sidebar','.quick-card','.sidebar-links'])assert.ok(panelTheme.includes(x),x);
 for(const css of [theme,panelTheme]){
   const cleaned=css.replace(/\/\*[\s\S]*?\*\//g,'');
   assert.equal((cleaned.match(/{/g)||[]).length,(cleaned.match(/}/g)||[]).length);
 }
});
check('Links locais da página inicial existem',()=>{
 for(const m of home.matchAll(/(?:href|src)="([^"]+)"/g)){
   const target=m[1].split(/[?#]/)[0];
   if(!target||/^(?:https?:|mailto:|tel:|\/|data:)/.test(target))continue;
   assert.ok(existsSync(target),target);
 }
});
check('Administração mantém segregação de perfil',()=>{
 assert.ok(admin.includes('id="administration" hidden'));
 assert.ok(read('ensino-admin.js').includes("me.perfil!=='admin'"));
 assert.ok(read('ensino-admin.js').includes('/admin/usuarios'));
});
if(problems.length){console.error('Auditoria V8 falhou em '+problems.length+' verificações.');process.exitCode=1}
else console.log('Auditoria estrutural V8 aprovada.');
