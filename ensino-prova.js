import{createClient}from'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.75.1/+esm';
const cfg=window.ENSINOMEU_CONFIG||{},sb=createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true}}),$=id=>document.getElementById(id),p=new URLSearchParams(location.search),sid=p.get('disciplina')||'',term=p.get('trimestre')||'',kind=p.get('tipo')||'';
let session=null,questions=[],deadline=0,ticker=null,sending=false;
const el=(tag,txt)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=String(txt);return n};
function show(msg){$('status').textContent=msg}
async function api(path,body){
 const {data,error}=await sb.auth.getSession();
 if(error||!data.session?.access_token)throw Error('Sua sessão terminou. Faça login novamente.');
 const r=await fetch(cfg.supabaseUrl+'/functions/v1/ensino-api'+path,{method:body?'POST':'GET',headers:{apikey:cfg.supabasePublishableKey,Authorization:'Bearer '+data.session.access_token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
 const obj=await r.json().catch(()=>({detail:'Falha na resposta do servidor'}));
 if(!r.ok)throw Error(obj.detail||'Operação indisponível');
 return obj;
}
const base=()=>'/prova/'+encodeURIComponent(sid)+'/'+term+'/'+kind;
const storageKey=()=>session?'ensinomeu-prova-respostas:'+session:null;
function currentAnswers(){
 return questions.map((_,i)=>{
  const radio=$('items').querySelector('input[name="q'+i+'"]:checked');
  return radio?Number(radio.value):-1;
 });
}
function saveProgress(){
 try{if(storageKey())sessionStorage.setItem(storageKey(),JSON.stringify(currentAnswers()))}catch(_e){}
}
function restoreProgress(){
 try{
  const a=JSON.parse(sessionStorage.getItem(storageKey())||'null');
  if(!Array.isArray(a)||a.length!==questions.length)return;
  a.forEach((v,i)=>{
   if(!Number.isInteger(v)||v<0||v>3)return;
   const input=$('items').querySelector('input[name="q'+i+'"][value="'+v+'"]');
   if(input)input.checked=true;
  });
 }catch(_e){}
}
async function init(){
 try{
  if(!/^fii-9-[a-z0-9-]+$/.test(sid)||!/^T[123]$/.test(term)||!['avaliacao','simulado'].includes(kind))throw Error('Escolha uma avaliação no painel do 9º ano.');
  const d=await api(base());
  $('back').href='trilha.html?disciplina='+encodeURIComponent(sid)+'&trimestre='+term;
  $('returnlink').href=$('back').href;
  const title=kind==='avaliacao'?'Avaliação trimestral':'Simulado trimestral';
  $('title').textContent=title+' — '+term.slice(1)+'º trimestre';
  $('name').textContent=title;
  $('details').textContent=d.quantidade+' questões • '+d.duracao_minutos+' minutos';
  if(!d.disponivel){show('Esta prova ainda está em preparação ou não está liberada para sua conta.');return}
  $('intro').hidden=false;
  show('Prova piloto disponível. Se já iniciou esta prova, poderá retomar a sessão ainda válida.');
 }catch(e){show(e.message)}
}
function renderQuestions(){
 $('items').replaceChildren();
 questions.forEach((q,i)=>{
  const field=el('fieldset');field.className='question';
  field.append(el('legend',(i+1)+'. '+q.enunciado));
  q.opcoes.forEach((v,j)=>{
   const label=el('label');label.className='choice';
   const input=document.createElement('input');input.type='radio';input.name='q'+i;input.value=String(j);
   label.append(input,document.createTextNode(' '+String.fromCharCode(65+j)+') '+v));
   field.append(label);
  });
  $('items').append(field);
 });
}
function showReport(d){
 clearInterval(ticker);ticker=null;
 $('taking').hidden=true;$('report').hidden=false;
 $('score').textContent=(d.tempo_esgotado?'Prazo encerrado — ':'Resultado: ')+d.acertos+' de '+d.total+' ('+d.percentual+'%)';
 const dest=$('review');dest.replaceChildren();
 for(const q of d.revisao||[]){
  const block=el('article');block.className='question';
  const marked=q.marcada===-1?'em branco':String.fromCharCode(65+q.marcada);
  block.append(el('b','Questão '+q.numero+' — sua resposta: '+marked+' • correta: '+String.fromCharCode(65+q.correta)),el('p',q.explicacao));
  dest.append(block);
 }
 try{if(storageKey())sessionStorage.removeItem(storageKey())}catch(_e){}
 show('Prova registrada no servidor. Resultado piloto sujeito à revisão pedagógica.');
}
async function sendAnswers(automatic=false){
 if(!session||sending)return;
 const answers=currentAnswers();
 if(!automatic&&answers.includes(-1)){show('Responda a todas as perguntas ou aguarde o término do tempo para entregar o que foi registrado.');return}
 sending=true;$('submit').disabled=true;
 try{
  saveProgress();
  const d=await api(base()+'/corrigir/'+encodeURIComponent(session),{respostas:answers});
  showReport(d);
 }catch(err){
  show('Não foi possível entregar a prova: '+err.message+'. Confira a conexão e tente novamente.');
  $('submit').disabled=false;
 }finally{sending=false}
}
function tick(){
 const rem=Math.max(0,Math.ceil((deadline-Date.now())/1000));
 $('timer').textContent=String(Math.floor(rem/60)).padStart(2,'0')+':'+String(rem%60).padStart(2,'0');
 if(rem===0){
  clearInterval(ticker);ticker=null;
  show('Tempo encerrado. Enviando automaticamente as respostas marcadas; questões em branco não pontuam.');
  void sendAnswers(true);
 }
}
$('start').addEventListener('click',async()=>{
 try{
  $('start').disabled=true;show('Verificando prova em andamento…');
  const d=await api(base()+'/iniciar',{});
  session=d.sessao;deadline=new Date(d.expira_em).getTime();questions=d.questoes;
  if(!Number.isFinite(deadline)||!Array.isArray(questions)||!questions.length)throw Error('Resposta da prova inválida');
  $('intro').hidden=true;$('taking').hidden=false;$('submit').disabled=false;
  renderQuestions();restoreProgress();
  if(ticker)clearInterval(ticker);
  ticker=setInterval(tick,1000);tick();
  if(ticker)show(d.retomada?'Prova retomada. O cronômetro original foi mantido.':'Prova iniciada. O tempo é controlado pelo servidor.');
 }catch(e){show(e.message);$('start').disabled=false}
});
$('items').addEventListener('change',saveProgress);
$('answers').addEventListener('submit',e=>{e.preventDefault();void sendAnswers(Date.now()>=deadline)});
init();
