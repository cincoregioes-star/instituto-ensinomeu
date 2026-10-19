import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.75.1/+esm';
const cfg=window.ENSINOMEU_CONFIG||{};
const $=id=>document.getElementById(id);
const sb=createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
const api=cfg.supabaseUrl+'/functions/v1/ensino-api';
const stages=[...Array.from({length:5},(_,i)=>({id:'fi-'+(i+1),name:(i+1)+'º ano • Fundamental I'})),...Array.from({length:4},(_,i)=>({id:'fii-'+(i+6),name:(i+6)+'º ano • Fundamental II'})),...Array.from({length:3},(_,i)=>({id:'em-'+(i+1),name:(i+1)+'ª série • Ensino Médio'}))];
const roleNames={admin:'Administrador',teacher:'Diretor / Professor',guardian:'Responsável',student:'Estudante'};
let all=[];
function message(msg,error=false){$('feedback').textContent=msg;$('feedback').classList.toggle('error',error)}
async function request(path,options={}){
const {data,error}=await sb.auth.getSession();if(error||!data?.session?.access_token)throw Error('Sessão não disponível. Entre novamente.');
const res=await fetch(api+path,{...options,headers:{'Content-Type':'application/json','apikey':cfg.supabasePublishableKey,'Authorization':'Bearer '+data.session.access_token,...options.headers}});
const body=await res.json().catch(()=>({detail:'Resposta inválida do servidor'}));if(!res.ok)throw Error(res.status===403?'Permissão insuficiente para esta operação.':body.detail||'Falha na API');return body;
}
function make(tag,cls,txt){const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=String(txt);return el}
function render(){
const role=$('filter').value,records=all.filter(u=>role==='all'||u.perfil===role);
$('total-users').textContent=all.length;
$('total-students').textContent=all.filter(u=>u.perfil==='student').length;
$('total-enrollments').textContent=all.flatMap(u=>u.matriculas||[]).filter(x=>x.situacao==='active').length;
const list=$('users');list.replaceChildren();
if(!records.length){list.append(make('p','empty','Nenhum perfil nessa categoria.'));return}
for(const u of records){
const card=make('article','user-card');
const summary=make('div');
summary.append(make('div','role',roleNames[u.perfil]||u.perfil),make('h3','',u.nome||'Sem nome'),make('p','',u.email||'E-mail não disponível'));
summary.append(make('p','muted',u.email_confirmado?'E-mail confirmado':'E-mail ainda não confirmado'));
const enroll=make('div');
enroll.append(make('h3','','Matrículas'));
const badges=make('div','enrollments');
for(const e of u.matriculas||[]){
const label=stages.find(x=>x.id===e.plano)?.name||e.plano;
badges.append(make('span','tag'+(e.situacao==='active'?'':' suspended'),label+' · '+e.situacao+' · '+e.origem));
}
if(!(u.matriculas||[]).length)badges.append(make('span','muted','Nenhuma matrícula'));
enroll.append(badges);
card.append(summary,enroll);
if(u.perfil==='student'){
const controls=make('div','controls');
const label=make('label','', 'Plano de teste');
const select=make('select');select.setAttribute('aria-label','Escolher plano para '+u.nome);
for(const plan of stages){const option=make('option','',plan.name);option.value=plan.id;select.append(option)}
select.value=(u.matriculas||[]).find(e=>e.situacao==='active'&&e.origem==='complimentary')?.plano||'fi-1';
label.append(select);controls.append(label);
const actions=make('div','actions');
const grant=make('button','btn primary','Liberar teste');
const suspend=make('button','btn secondary','Suspender teste');
grant.type=suspend.type='button';
const act=async action=>{
const plan=select.value,labelName=stages.find(s=>s.id===plan)?.name||plan;
const verb=action==='grant'?'liberar':'suspender';
if(!window.confirm('Confirmar '+verb+' o plano '+labelName+' para '+(u.nome||u.email)+'?'))return;
grant.disabled=suspend.disabled=true;
try{const outcome=await request('/admin/matriculas',{method:'POST',body:JSON.stringify({estudante_id:u.id,plano:plan,acao:action})});
if(!outcome.registro_auditoria)throw Error('Servidor não confirmou registro da alteração.');
message('Operação registrada. Atualizando matrículas…');
await load();
}catch(err){message(err.message||'Falha na operação.',true)}finally{grant.disabled=suspend.disabled=false}
};
grant.addEventListener('click',()=>act('grant'));suspend.addEventListener('click',()=>act('suspend'));
actions.append(grant,suspend);controls.append(actions);card.append(controls);
}else{card.append(make('div','muted','Permissões deste perfil não são alteradas nesta versão.'))}
list.append(card);
}
}
async function load(){
message('Carregando os perfis autorizados…');
const data=await request('/admin/usuarios');if(!Array.isArray(data.usuarios))throw Error('Dados administrativos inválidos');
all=data.usuarios;$('administration').hidden=false;render();message('Consulta protegida concluída. '+all.length+' usuários encontrados.');
}
async function init(){
try{const {data,error}=await sb.auth.getUser();if(error||!data?.user)throw Error('Faça login antes de acessar a administração.');
const me=await request('/me');if(me.perfil!=='admin'){message('Esta área está disponível apenas ao administrador.',true);return}
await load();
}catch(err){message(err.message||'Falha ao carregar a administração.',true)}
}
$('filter').addEventListener('change',render);
$('refresh').addEventListener('click',()=>load().catch(e=>message(e.message,true)));
$('logout').addEventListener('click',async()=>{await sb.auth.signOut();location.replace('login.html')});
init();