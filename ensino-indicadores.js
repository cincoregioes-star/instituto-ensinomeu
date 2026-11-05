
import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.75.1/+esm';
const C=window.ENSINOMEU_CONFIG||{};
const db=createClient(C.supabaseUrl,C.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
const API=C.supabaseUrl+'/functions/v1/ensino-indicadores';
const $=id=>document.getElementById(id),escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const MODE=document.body.dataset.mode==='controle'?'controle':'me';
let DATA=null,SELECT={user:'all',subject:'all',period:'all',type:'all'},ALL=[];
function pct(n){return Number.isFinite(n)?Math.round(n)+'%':'—'}
function date(v){const d=new Date(v);return Number.isFinite(+d)?d.toLocaleDateString('pt-BR'):'—'}
function number(v){return Number.isFinite(v)?v.toLocaleString('pt-BR'):'—'}
async function load(){
 try{
  const {data:user,error}=await db.auth.getUser();
  if(error||!user?.user){$('notice').textContent='Faça login no Instituto EnsinoMeu para acessar este painel.';$('notice').hidden=false;return}
  $('who').textContent=user.user.email||'Usuário conectado';
  const {data:ses}=await db.auth.getSession();
  const jwt=ses?.session?.access_token;
  if(!jwt)throw Error('Sessão expirada. Faça login novamente.');
  const res=await fetch(API+'/'+MODE,{headers:{'apikey':C.supabasePublishableKey,'Authorization':'Bearer '+jwt},cache:'no-store'});
  const body=await res.json().catch(()=>({detail:'Falha na comunicação.'}));
  if(!res.ok)throw Error(body.detail||'Acesso indisponível');
  DATA=body;
  ALL=normalize(body);
  $('notice').hidden=true;$('content').hidden=false;
  $('who').textContent=body.usuario?.nome||'Usuário autenticado';
  render();
 }catch(e){
  const notice=$('notice');
  notice.textContent=e.message;notice.hidden=false;$('content').hidden=true;
  if(MODE==='controle' && /Painel exclusivo|Acesso exclusivo|não autorizado/i.test(e.message)){
   const explanation=document.createElement('p');explanation.textContent='Esta sessão não é de Administrador ou Diretor. Use o botão abaixo para trocar de conta, sem alterar seus dados.';
   const button=document.createElement('button');button.type='button';button.className='btn';button.textContent='Trocar para conta de Administrador ou Diretor';
   button.addEventListener('click',async()=>{button.disabled=true;try{const result=await db.auth.signOut();if(result.error)throw result.error;location.assign('login.html');}catch(err){button.disabled=false;notice.append(document.createTextNode(' Não foi possível sair: '+err.message));}});
   notice.append(explanation,button);
  }
 }
}
function normalize(d){
 const subjects=new Map((d.subjects||[]).map(x=>[x.id,x.name]));
 const catalog=new Map((d.catalog||[]).map(x=>[x.slug,x]));
 const out=[];
 const add=(r,kind,id,title,topic,seconds)=>{
  const total=Number(r.total_questions)||0,right=Number(r.correct_answers);
  if(total<=0||!Number.isFinite(right)||right<0||right>total)return;
  out.push({id:r.id,uid:r.user_id,kind,slug:r.slug||'',subject:id,title,topic:topic||[],seconds:seconds||0,right,total,pct:100*right/total,at:r.finished_at,stamp:new Date(r.finished_at).getTime()||0});
 };
 (d.gamer||[]).forEach(x=>{const c=catalog.get(x.slug);add(x,'Gamer',c?.disciplina||'Outros',c?.titulo||x.slug,x.topic_summary,x.seconds_used)});
 (d.practice||[]).forEach(x=>add(x,'Exercício',subjects.get(x.subject_id)||x.subject_id,'Aula '+x.lesson_number,[],0));
 (d.exams||[]).forEach(x=>add(x,'Simulado antigo',subjects.get(x.subject_id)||x.subject_id,'Trimestre '+x.term,[],0));
 (d.assess||[]).forEach(x=>add(x,x.assessment_type==='simulado'?'Simulado':'Avaliação',subjects.get(x.subject_id)||x.subject_id,'Trimestre '+x.term,[],0));
 return out.sort((a,b)=>b.stamp-a.stamp);
}
function scope(){
 const now=Date.now();
 return ALL.filter(x=>(SELECT.user==='all'||x.uid===SELECT.user)&&(SELECT.subject==='all'||x.subject===SELECT.subject)&&(SELECT.type==='all'||x.kind===SELECT.type)&&(SELECT.period==='all'||now-x.stamp<=Number(SELECT.period)*86400000));
}
function profileName(uid){return (DATA.students||[]).find(x=>x.user_id===uid)?.display_name|| (uid===DATA.usuario.id?DATA.usuario.nome:'Estudante')}
function group(xs,key){const m=new Map();for(const x of xs){const k=key(x);if(!m.has(k))m.set(k,[]);m.get(k).push(x)}return m}
function aggregate(xs){let right=0,total=0;xs.forEach(x=>{right+=x.right;total+=x.total});return total?100*right/total:NaN}
function ratio(xs){return xs.length?pct(aggregate(xs)):'—'}
function topicsOf(xs){const m=new Map();for(const x of xs){for(const t of x.topic||[]){const name=t.topic||'Revisão geral';if(!m.has(name))m.set(name,{name,total:0,correct:0});let v=m.get(name);v.total+=Number(t.total)||0;v.correct+=Number(t.correct)||0}}return [...m.values()].filter(x=>x.total>0).map(x=>({...x,pct:x.correct*100/x.total})).sort((a,b)=>a.pct-b.pct)}
function lineChart(xs){
 const v=xs.slice(0,12).reverse();
 if(v.length<2)return '<div class="empty">Após duas atividades, o gráfico mostrará sua evolução.</div>';
 const W=650,H=230,left=35,right=20,top=16,bottom=35;
 const x=i=>left+(i/(v.length-1))*(W-left-right),y=n=>top+(100-n)/100*(H-top-bottom);
 const guides=[0,25,50,75,100].map(n=>'<line x1="'+left+'" y1="'+y(n)+'" x2="'+(W-right)+'" y2="'+y(n)+'" stroke="#d9e8e6"/><text x="5" y="'+(y(n)+4)+'" fill="#55727b" font-size="12">'+n+'</text>').join('');
 const pts=v.map((a,i)=>x(i)+','+y(a.pct)).join(' ');
 const nodes=v.map((a,i)=>'<circle cx="'+x(i)+'" cy="'+y(a.pct)+'" r="5" fill="#0a8969"><title>'+escape(a.subject+' · '+pct(a.pct)+' · '+date(a.at))+'</title></circle>').join('');
 return '<svg class="trend" role="img" aria-label="Gráfico de evolução das últimas '+v.length+' atividades" viewBox="0 0 '+W+' '+H+'">'+guides+'<polyline points="'+pts+'" stroke="#087b60" fill="none" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>'+nodes+'<text x="'+left+'" y="'+(H-6)+'" fill="#55727b" font-size="12">'+date(v[0].at)+'</text><text x="'+(W-115)+'" y="'+(H-6)+'" fill="#55727b" font-size="12">'+date(v.at(-1).at)+'</text></svg>';
}
function bars(xs){
 const groups=[...group(xs,x=>x.subject).entries()].map(([name,items])=>({name,p:aggregate(items),n:items.length})).sort((a,b)=>b.p-a.p);
 if(!groups.length)return '<div class="empty">Ainda não há atividades registradas nesta seleção.</div>';
 return groups.map(g=>'<div class="progress-line"><strong>'+escape(g.name)+'</strong><div class="bar"><i style="width:'+Math.max(0,Math.min(100,g.p))+'%"></i></div><small>'+pct(g.p)+'</small></div>').join('');
}
function pie(xs){if(!xs.length)return '<div class="empty">O gráfico de acertos e erros aparecerá depois do primeiro simulado.</div>';const p=aggregate(xs);return '<div class="donut" role="img" aria-label="'+pct(p)+' de acertos e '+pct(100-p)+' de erros" style="background:conic-gradient(#087b60 0% '+p+'%,#edb551 '+p+'% 100%)"><span>'+pct(p)+'</span></div><div class="legend"><span><i class="dot" style="background:#087b60"></i>Acertos</span><span><i class="dot" style="background:#edb551"></i>Erros</span></div>'}
function recommendations(ts){
 if(!ts.length)return '<div class="empty">A análise por assunto ficará disponível após concluir um Simulado Gamer. Provas antigas mostram somente a nota geral.</div>';
 const needs=ts.filter(x=>x.pct<70).slice(0,5),goods=[...ts].reverse().filter(x=>x.pct>=70).slice(0,5);
 const make=(arr,good)=>arr.length?arr.map(t=>'<div class="topic'+(good?' good':'')+'"><b>'+escape(t.name)+'</b><small>'+t.correct+'/'+t.total+' acertos · '+pct(t.pct)+(good?' · Continue praticando':' · Reassista à aula e refaça questões deste tema')+'</small></div>').join(''):'<div class="empty">'+(good?'Os pontos fortes aparecerão conforme houver acertos registrados.':'Nenhum assunto abaixo de 70% na seleção atual.')+'</div>';
 return '<h3>Pontos a fortalecer</h3>'+make(needs,false)+'<h3>Pontos positivos</h3>'+make(goods,true);
}
function historyTable(xs){
 if(!xs.length)return '<div class="empty">Nenhuma atividade registrada para os filtros selecionados.</div>';
 return '<div class="tablewrap"><table><thead><tr><th>Data</th>'+(MODE==='controle'?'<th>Aluno</th>':'')+'<th>Disciplina / atividade</th><th>Resultado</th><th>Situação</th></tr></thead><tbody>'+xs.slice(0,40).map(x=>'<tr><td>'+date(x.at)+'</td>'+(MODE==='controle'?'<td>'+escape(profileName(x.uid))+'</td>':'')+'<td><b>'+escape(x.subject)+'</b><br>'+escape(x.kind+' · '+x.title)+'</td><td>'+x.right+'/'+x.total+' · <b>'+pct(x.pct)+'</b></td><td><span class="status '+(x.pct>=80?'good':x.pct<60?'bad':'')+'">'+(x.pct>=80?'Bom domínio':x.pct>=60?'Em evolução':'Revisar conteúdo')+'</span></td></tr>').join('')+'</tbody></table></div>';
}
function byStudent(xs){
 if(MODE!=='controle')return '';
 let profiles=(DATA.students||[]).filter(p=>p.role==='student'||p.role==='teacher');
 let rows=profiles.map(p=>{let list=xs.filter(x=>x.uid===p.user_id);return {id:p.user_id,name:p.display_name||'Estudante',n:list.length,avg:aggregate(list),last:list[0]?.pct,best:list.length?Math.max(...list.map(x=>x.pct)):NaN,active:p.account_active}});
 rows.sort((a,b)=>(Number.isFinite(a.avg)?a.avg:-1)-(Number.isFinite(b.avg)?b.avg:-1));
 return '<div class="panel"><h2>Visão por aluno · Priorização pedagógica</h2><p class="help">Ordenado pelo desempenho médio (alunos sem atividade aparecem primeiro). Clique no nome para filtrar o diagnóstico.</p><div class="tablewrap"><table><thead><tr><th>Aluno</th><th>Atividades</th><th>Último</th><th>Melhor</th><th>Média</th><th>Alerta</th></tr></thead><tbody>'+rows.map(r=>'<tr><td><button class="student-item select-student" data-uid="'+escape(r.id)+'"><b>'+escape(r.name)+'</b></button></td><td>'+r.n+'</td><td>'+pct(r.last)+'</td><td>'+pct(r.best)+'</td><td>'+pct(r.avg)+'</td><td><span class="status '+(r.n&&r.avg>=80?'good':r.n&&r.avg<60?'bad':'')+'">'+(!r.n?'Sem registros':r.avg<60?'Priorizar':r.avg>=80?'Bom avanço':'Acompanhar')+'</span></td></tr>').join('')+'</tbody></table></div></div>';
}
function render(){
 const xs=scope(),latest=xs[0],best=xs.length?Math.max(...xs.map(x=>x.pct)):NaN;
 const topics=topicsOf(xs);
 const subjects=[...new Set(ALL.map(x=>x.subject))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 const kinds=[...new Set(ALL.map(x=>x.kind))].sort();
 let options=(arr,value)=>arr.map(x=>'<option value="'+escape(x.id)+'" '+(value===x.id?'selected':'')+'>'+escape(x.label)+'</option>').join('');
 const students=(DATA.students||[]).filter(p=>p.account_active);
 let controls='<label>Disciplina<select id="subject-filter">'+options([{id:'all',label:'Todas as disciplinas'},...subjects.map(s=>({id:s,label:s}))],SELECT.subject)+'</select></label><label>Período<select id="period-filter">'+options([{id:'all',label:'Todo o histórico'},{id:'30',label:'Últimos 30 dias'},{id:'90',label:'Últimos 90 dias'}],SELECT.period)+'</select></label><label>Atividade<select id="type-filter">'+options([{id:'all',label:'Todos os tipos'},...kinds.map(s=>({id:s,label:s}))],SELECT.type)+'</select></label>';
 if(MODE==='controle')controls='<label>Aluno<select id="user-filter">'+options([{id:'all',label:'Todos os alunos'},...students.map(x=>({id:x.user_id,label:x.display_name||x.user_id}))],SELECT.user)+'</select></label>'+controls;
 const strong=xs.filter(x=>x.pct>=80).length;
 $('content').innerHTML='<div class="filters">'+controls+'</div>'+
 '<div class="kpis"><article class="kpi"><strong>'+xs.length+'</strong><span>Atividades concluídas</span></article><article class="kpi gold"><strong>'+pct(latest?.pct)+'</strong><span>Último resultado</span></article><article class="kpi blue"><strong>'+pct(best)+'</strong><span>Melhor resultado</span></article><article class="kpi"><strong>'+ratio(xs)+'</strong><span>Aproveitamento geral</span></article><article class="kpi gold"><strong>'+strong+'</strong><span>Atividades com 80% ou mais</span></article></div>'+
 '<div class="grid"><section class="panel"><h2>Acertos x erros</h2><p class="help">Proporção de todas as questões respondidas na seleção.</p>'+pie(xs)+'</section><section class="panel"><h2>Evolução nas últimas atividades</h2><p class="help">Percentual em cada atividade (não é nota oficial).</p>'+lineChart(xs)+'</section></div>'+
 '<div class="grid"><section class="panel"><h2>Resultados por disciplina</h2><p class="help">Aproveitamento acumulado por área.</p>'+bars(xs)+'</section><section class="panel"><h2>Diagnóstico por conteúdo</h2><p class="help">Pontos positivos e negativos, usando os erros reais dos Simulados Gamers.</p>'+recommendations(topics)+'</section></div>'+
 (MODE==='controle'?byStudent(xs):'')+
 '<section class="panel"><h2>Histórico de atividades</h2><p class="help">Até 40 registros mais recentes na tabela. Use filtros para analisar diferentes períodos.</p>'+historyTable(xs)+'</section>'+
 '<p class="footer-note">Fonte: Supabase EnsinoMeu. Indicadores baseados em exercícios, simulados e avaliações efetivamente registrados; resultados de testes pilotos não têm valor de prova oficial. Nenhum dado é inventado. Limite: 1.000 registros por fonte no carregamento.</p>';
 [['subject','subject'],['period','period'],['type','type'],['user','user']].forEach(([id,key])=>{let el=$(id+'-filter');if(el)el.addEventListener('change',()=>{SELECT[key]=el.value;render()})});
 document.querySelectorAll('.select-student').forEach(el=>el.addEventListener('click',()=>{SELECT.user=el.dataset.uid;render();window.scrollTo({top:0,behavior:'smooth'})}));
 $('csv').disabled=false;$('print').disabled=false;
 $('csv').onclick=()=>exportCsv(scope());
 $('print').onclick=()=>window.print();
}
function exportCsv(xs){
 if(!xs.length)return alert('Não há registros para exportar.');
 let lines=[['Data','Aluno','Tipo','Disciplina','Atividade','Acertos','Total','Percentual'].join(';')];
 const quote=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
 for(const x of xs){lines.push([date(x.at),profileName(x.uid),x.kind,x.subject,x.title,x.right,x.total,Math.round(x.pct)].map(quote).join(';'))}
 const blob=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'});
 const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='EnsinoMeu_Indicadores_'+new Date().toISOString().slice(0,10)+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);
}
load();
