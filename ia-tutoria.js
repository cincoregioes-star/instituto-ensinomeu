import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.75.1/+esm';
const cfg=window.ENSINOMEU_CONFIG||{}, $=id=>document.getElementById(id);
const allowed=/^(fi-5|fii-[6-9]|em-[1-3])$/,apiUrl=cfg.supabaseUrl+'/functions/v1/ensino-api';
let client=null,claims=null,entries=[];
const text=(tag,value,cls)=>{const e=document.createElement(tag);e.textContent=String(value??'');if(cls)e.className=cls;return e};
function show(id,value,ok=false){const el=$(id);el.textContent=value;el.classList.toggle('ok',ok)}
async function request(path,body){
 if(!client)throw Error('A conexão com o cadastro não está disponível.');
 const result=await client.auth.getSession(),token=result.data?.session?.access_token;
 if(result.error||!token)throw Error('Sua sessão terminou. Faça login novamente.');
 const response=await fetch(apiUrl+path,{method:body?'POST':'GET',cache:'no-store',
  headers:{'Content-Type':'application/json',apikey:cfg.supabasePublishableKey,Authorization:'Bearer '+token},
  body:body?JSON.stringify(body):undefined});
 const parsed=await response.json().catch(()=>({detail:'Não foi possível ler a resposta do servidor'}));
 if(!response.ok)throw Error(parsed.detail||'Falha ao comunicar com a plataforma.');
 return parsed;
}
const dateString=v=>{try{return new Date(v).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}catch{return ''}};
function render(){
 const dest=$('list');dest.replaceChildren();
 const selected=$('filter').value;
 const rows=entries.filter(q=>selected==='all'||q.status===selected);
 if(!rows.length){dest.append(text('p',selected==='all'?'Nenhuma dúvida registrada.':'Nenhuma dúvida com esse estado.','empty'));return}
 for(const q of rows){
  const card=text('article','', 'question');card.dataset.state=q.status;
  const s=q.serie||'Série não informada',n=q.nome?' • '+q.nome:'';
  card.append(text('small',s+n+' • '+dateString(q.criada_em)));
  card.append(text('strong',q.status==='respondida'?'Respondida ✓':'Aguardando orientação'));
  card.append(text('p',q.pergunta));
  if(q.resposta){const answer=text('div',null,'answer');answer.append(text('b','Orientação pedagógica'),text('p',q.resposta),text('small','Respondido em '+dateString(q.respondida_em)));card.append(answer)}
  if(claims?.gestor&&q.status==='aberta'){
   const form=text('form',null,'reply');
   const lab=text('label','Resposta pedagógica');const id='resp-'+q.id;lab.htmlFor=id;
   const input=document.createElement('textarea');input.id=id;input.required=true;input.minLength=4;input.maxLength=2000;input.placeholder='Responda com orientação didática. Não solicite dados pessoais.';
   const button=text('button','Responder dúvida','btn');button.type='submit';
   const message=text('p','','status');message.setAttribute('role','status');
   form.append(lab,input,button,message);
   form.addEventListener('submit',async e=>{
    e.preventDefault();button.disabled=true;message.textContent='Enviando resposta…';
    try{await request('/ia-tutoria/responder',{id:q.id,resposta:input.value.trim()});message.textContent='Resposta enviada.';await load()}catch(err){message.textContent=err.message;button.disabled=false}
   });
   card.append(form);
  }
  dest.append(card);
 }
}
async function load(){
 try{show('load-status','Carregando dúvidas…');
  const result=await request('/ia-tutoria');
  entries=Array.isArray(result.duvidas)?result.duvidas:[];
  claims={gestor:Boolean(result.gestor)};
  $('list-title').textContent=claims.gestor?'Caixa da equipe pedagógica':'Minhas perguntas e respostas';
  $('list-intro').textContent=claims.gestor?'As dúvidas de estudantes de IA estão disponíveis para orientação manual.':'Somente suas próprias dúvidas e respostas aparecem nesta conta.';
  show('load-status',entries.length+' dúvida(s) localizada(s).',true);
  render();
 }catch(err){show('load-status',err.message);$('list').replaceChildren()}
}
async function init(){
 try{
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(cfg.supabaseUrl||'')||!/^sb_publishable_[\w.-]+$/.test(cfg.supabasePublishableKey||''))throw Error('Configuração de autenticação não disponível');
  client=createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
  const auth=await client.auth.getUser();
  if(auth.error||!auth.data.user){$('auth-error').hidden=false;return}
  const grades=await request('/series');
  const options=(grades.series||[]).filter(p=>allowed.test(p.id));
  if(!options.length)throw Error('Sua conta não possui nenhuma série autorizada para a disciplina de IA');
  const select=$('grade');select.replaceChildren();
  const chosen=new URLSearchParams(location.search).get('serie');
  for(const g of options){const o=text('option',g.serie+' — '+g.etapa);o.value=g.id;select.append(o)}
  if(chosen&&options.some(x=>x.id===chosen))select.value=chosen;
  $('content').hidden=false;await load();
 }catch(err){$('auth-error').hidden=false;$('auth-error').textContent=err.message+' — Entre na sua conta autorizada.'}
}
$('question').addEventListener('input',()=>{$('characters').textContent=$('question').value.length+'/1200'});
$('ask-form').addEventListener('submit',async e=>{
 e.preventDefault();const button=$('send');button.disabled=true;show('ask-status','Registrando sua dúvida…');
 try{
  const result=await request('/ia-tutoria',{serie:$('grade').value,pergunta:$('question').value.trim()});
  if(!result.ok)throw Error('O envio não foi confirmado');
  $('question').value='';$('characters').textContent='0/1200';
  show('ask-status','Sua dúvida foi registrada. Acompanhe a resposta nesta página.',true);
  await load();
 }catch(err){show('ask-status',err.message)}finally{button.disabled=false}
});
$('filter').addEventListener('change',render);
$('refresh').addEventListener('click',load);
init();