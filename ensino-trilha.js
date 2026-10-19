import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.75.1/+esm';
const C=window.ENSINOMEU_CONFIG||{}, $=id=>document.getElementById(id);
const sb=createClient(C.supabaseUrl,C.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
const endpoint=C.supabaseUrl+'/functions/v1/ensino-api',query=new URLSearchParams(location.search);
const sid=query.get('disciplina')||'',term=query.get('trimestre')||'';
const grade='fii-9';
let questions=[];
function message(msg,bad=false){$('feedback').textContent=msg;$('feedback').classList.toggle('error',bad)}
async function api(path,body){
 const {data,error}=await sb.auth.getSession();if(error||!data.session?.access_token)throw Error('Entre novamente na sua conta.');
 const response=await fetch(endpoint+path,{method:body?'POST':'GET',headers:{apikey:C.supabasePublishableKey,Authorization:'Bearer '+data.session.access_token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
 const r=await response.json().catch(()=>({detail:'Falha ao ler a resposta do servidor'}));if(!response.ok)throw Error(r.detail||'Operação indisponível');return r;
}
function make(tag,cls,value){const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=String(value);return e}
async function openPdf(){const w=window.open('about:blank','_blank');try{const r=await api('/material/'+encodeURIComponent(sid)+'/'+term);if(w)w.location.href=r.url;else location.assign(r.url)}catch(e){if(w)w.close();message(e.message,true)}}
async function launch(num){
 $('practice').hidden=false;questions=[];$('results').replaceChildren();$('questions').replaceChildren();$('grade').disabled=false;
 try{
 message('Carregando exercícios da aula '+num+'…');
 const d=await api('/trilha/'+encodeURIComponent(sid)+'/'+term+'/aula/'+num);
 $('practice-title').textContent='Aula '+num+' — '+d.titulo;questions=d.questoes;
 if(!questions.length){$('questions').append(make('p','help','Exercícios desta aula ainda serão criados.'));$('grade').disabled=true}
 questions.forEach((q,i)=>{
  const fs=make('fieldset'),legend=make('legend','',(i+1)+'. '+q.enunciado);fs.append(legend);
  q.opcoes.forEach((opt,j)=>{const label=make('label','option'),radio=document.createElement('input');radio.type='radio';radio.name='questao-'+i;radio.value=String(j);radio.required=true;label.append(radio,document.createTextNode(' '+String.fromCharCode(65+j)+'. '+opt));fs.append(label)});
  $('questions').append(fs);
 });
 $('practice').dataset.lesson=String(num);
 $('practice').scrollIntoView({behavior:'smooth'});message('Exercícios carregados. Responda e clique em Corrigir.');
 }catch(e){message(e.message,true);$('practice').hidden=true}
}
$('close-practice').addEventListener('click',()=>{$('practice').hidden=true;$('content').scrollIntoView({behavior:'smooth'})});
$('practice-form').addEventListener('submit',async e=>{
 e.preventDefault();if(!questions.length)return;
 const answers=questions.map((_,i)=>{const inp=$('questions').querySelector('input[name="questao-'+i+'"]:checked');return inp?Number(inp.value):-1});
 if(answers.includes(-1)){message('Responda todas as perguntas.',true);return}
 const lesson=Number($('practice').dataset.lesson);$('grade').disabled=true;
 try{
  const d=await api('/trilha/'+encodeURIComponent(sid)+'/'+term+'/aula/'+lesson+'/corrigir',{respostas:answers});
  $('results').replaceChildren(make('h3','', 'Resultado: '+d.acertos+' de '+d.total+' — '+d.percentual+'%'),make('p','help',d.comentario));
  d.revisao.forEach(x=>{const card=make('div','result-item '+(x.correta===x.marcada?'correct':'wrong'));card.append(make('strong','','Questão '+x.numero+': sua resposta '+String.fromCharCode(65+x.marcada)+' · correta '+String.fromCharCode(65+x.correta)),make('p','',x.explicacao));$('results').append(card)});
  message('Correção concluída e prática registrada no histórico.');$('results').scrollIntoView({behavior:'smooth'});
 }catch(ex){message(ex.message,true);$('grade').disabled=false}
});
$('pdf').addEventListener('click',openPdf);
async function init(){
 try{
 if(!/^fii-9-[a-z0-9-]+$/.test(sid)||!/^T[123]$/.test(term))throw Error('Escolha uma disciplina e trimestre no seu painel.');
 const {data}=await sb.auth.getUser();if(!data?.user)throw Error('Faça login novamente.');
 const d=await api('/trilha/'+encodeURIComponent(sid)+'/'+term);
 $('page-title').textContent=d.disciplina+' — '+d.trimestre+'º trimestre';
 $('count-lessons').textContent=d.aulas.length;$('count-practice').textContent=d.aulas.reduce((n,a)=>n+a.exercicios,0);$('count-videos').textContent=d.aulas.filter(a=>a.video_status==='published').length;
 $('back').href='painel.html?serie='+encodeURIComponent(grade);
 ['avaliacao','simulado'].forEach(k=>{$(k+'-link').href='prova.html?disciplina='+encodeURIComponent(sid)+'&trimestre='+term+'&tipo='+k});
 const list=$('lesson-list');list.replaceChildren();
 d.aulas.forEach(a=>{
  const card=make('article','lesson');card.append(make('span','pill','Aula '+String(a.numero).padStart(2,'0')),make('h3','',a.titulo),make('p','help','Apostila: página '+a.pagina_apostila));
  card.append(make('p','help',a.video_status==='published'?'Videoaula disponível':'Videoaula — produção futura'));
  const actions=make('div','actions'),btn=make('button','btn',a.exercicios?'Praticar ('+a.exercicios+' questões)':'Exercícios em preparação');
  btn.type='button';btn.disabled=!a.exercicios;btn.addEventListener('click',()=>launch(a.numero));actions.append(btn);card.append(actions);list.append(card);
 });
 $('content').hidden=false;message('Trilha carregada. Selecione uma aula para começar.');
 }catch(e){message(e.message,true)}
}
init();