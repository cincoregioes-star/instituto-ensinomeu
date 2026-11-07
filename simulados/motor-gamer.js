
import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.75.1/+esm';
const Q=window.ENSINOMEU_QUIZ,C=window.ENSINOMEU_CONFIG||{};
const sb=createClient(C.supabaseUrl,C.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
const app=document.getElementById('app'),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const items=Q.questoes,storage='ensino_gamer_history_'+Q.slug;
let order=[],answers=[],current=0,seconds=0,timer=null,started=false,stage='welcome',muted=false,ctx=null,sent=false;
const song=document.getElementById('audio-bg'),yes=document.getElementById('audio-correct'),no=document.getElementById('audio-wrong');
song.volume=.06;yes.volume=.45;no.volume=.45;
document.getElementById('heading').textContent=Q.disciplina+' — Aula '+String(Q.aula).padStart(2,'0');
document.getElementById('subtitle').textContent='9º ano · '+Q.titulo;
document.getElementById('video').href=Q.video;if(Q.referencia==='apostila')document.getElementById('video').textContent='📘 Apostila no painel';
function past(){try{return JSON.parse(localStorage.getItem(storage)||'[]')||[]}catch{return []}}
function remember(record){try{localStorage.setItem(storage,JSON.stringify([record,...past()].slice(0,30)))}catch{}}
function shuffle(a){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function synth(ok){if(muted)return;try{ctx=ctx||new(window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=ok?700:250;g.gain.setValueAtTime(.001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.06,ctx.currentTime+.01);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.2);o.start();o.stop(ctx.currentTime+.22)}catch{}}
function play(ok){if(muted)return;const a=ok?yes:no;try{a.currentTime=0;a.play().catch(()=>synth(ok))}catch{synth(ok)}}
function toggleSound(){muted=!muted;document.getElementById('sound').textContent=muted?'🔇 Som':'🔊 Som';if(muted)song.pause();else if(started)song.play().catch(()=>{})}
function start(){current=0;seconds=0;answers=Array(items.length).fill(null);order=items.map(()=>shuffle([0,1,2,3]));stage='quiz';sent=false;started=true;clearInterval(timer);timer=setInterval(()=>{seconds++;const x=document.getElementById('clock');if(x)x.textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')},1000);if(!muted)song.play().catch(()=>{});render()}
function choose(idx){if(stage!=='quiz'||answers[current]!==null)return;answers[current]=idx;play(idx===items[current].correct);render()}
function next(){if(answers[current]===null)return;if(current+1<items.length){current++;render()}else finish()}
function finish(){if(stage!=='quiz')return;clearInterval(timer);song.pause();started=false;stage='result';const right=answers.filter((a,i)=>a===items[i].correct).length;const record={right,total:items.length,pct:Math.round(right*100/items.length),when:new Date().toISOString(),seconds};remember(record);render();saveOnline()}
async function saveOnline(){
 const target=document.getElementById('cloud-status');
 if(target)target.textContent='Registrando resultado na sua conta…';
 try{
  const ses=await sb.auth.getSession();const jwt=ses.data.session?.access_token;
  if(!jwt){if(target)target.textContent='Resultado salvo neste navegador. Para o dashboard online, entre na sua conta do Instituto.';return}
  const attempt=crypto.randomUUID();
  const res=await fetch(C.supabaseUrl+'/functions/v1/ensino-indicadores/enviar',{method:'POST',headers:{apikey:C.supabasePublishableKey,Authorization:'Bearer '+jwt,'Content-Type':'application/json'},body:JSON.stringify({slug:Q.slug,answers,seconds,tentativa:attempt})});
  const out=await res.json();
  if(!res.ok)throw Error(out.detail||'Servidor indisponível.');
  if(target)target.textContent='✓ Resultado registrado no dashboard do aluno e no Painel de Controle autorizado.';
  sent=true;
 }catch(e){if(target)target.textContent='Resultado salvo localmente; não foi possível sincronizar: '+e.message}
}
function topicStats(){
 const m=new Map();
 items.forEach((q,i)=>{let v=m.get(q.topic)||{topic:q.topic,total:0,right:0};v.total++;if(answers[i]===q.correct)v.right++;m.set(q.topic,v)});
 return [...m.values()].sort((a,b)=>a.right/a.total-b.right/b.total);
}
function renderWelcome(){
 const hist=past(),best=hist.length?Math.max(...hist.map(x=>x.pct))+'%':'—';
 return '<div class="welcome"><section class="panel" style="display:flex;flex-direction:column;justify-content:center"><div class="eyebrow">INSTITUTO ENSINOMEU · REFORÇO ESCOLAR BNCC</div><h2>'+esc(Q.titulo)+'</h2><p>Faça o simulado com 20 questões e comentários explicativos. As alternativas são embaralhadas a cada tentativa.</p><p><span class="pill">20 questões</span><span class="pill">Correção comentada</span><span class="pill">Gráfico pizza</span><span class="pill">Histórico e progresso</span></p><div class="btn-group"><button class="btn primary" data-act="start">▶ Iniciar simulado</button><a class="btn" href="../dashboard-aluno.html">▥ Meu dashboard</a></div></section><section class="panel" style="display:flex;flex-direction:column;justify-content:center"><div class="eyebrow">SEU PLACAR</div><div class="stats"><div class="stat"><b>'+(hist[0]?.pct??'—')+(hist.length?'%':'')+'</b><small>Último resultado</small></div><div class="stat"><b>'+best+'</b><small>Melhor resultado</small></div><div class="stat"><b>'+hist.length+'</b><small>Tentativas neste dispositivo</small></div></div><p class="note">Com login ativo, as novas tentativas também são registradas no banco de dados para o acompanhamento pedagógico.</p></section></div>';
}
function renderQuiz(){
 const q=items[current],chosen=answers[current],idx=order[current],done=chosen!==null,last=current+1===items.length;
 const options=idx.map((i,n)=>'<button class="option '+(done?(i===q.correct?'correct':i===chosen?'wrong':''):'')+'" data-answer="'+i+'" '+(done?'disabled':'')+'><span class="key">'+(i===q.correct&&done?'✓':i===chosen&&done?'✕':'ABCD'[n])+'</span>'+esc(q.options[i])+'</button>').join('');
 const feedback=done?'<div class="feedback"><b>'+(chosen===q.correct?'✓ Resposta correta.':'✕ Resposta incorreta.')+'</b><div>'+esc(q.explain)+'</div></div>':'<div class="note">Leia as alternativas e selecione uma resposta. A explicação aparecerá imediatamente.</div>';
 return '<div class="quiz"><div class="quizbar"><div class="quizmeta"><span>'+esc(Q.disciplina)+' · '+esc(q.topic)+'</span><span>Questão '+(current+1)+'/20</span><span>⏱ <span id="clock">'+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+'</span></span></div><div class="rail"><i class="fill" style="width:'+((current+1)/items.length*100)+'%"></i></div></div><div class="quizgrid"><section class="panel question"><div class="topic">'+esc(q.topic)+'</div><h2>'+esc(q.q)+'</h2><div class="context">'+esc(q.base||'Identifique a alternativa que melhor responde à situação proposta.')+'</div>'+feedback+'</section><section class="panel answers">'+options+'</section></div><div class="foot"><a class="small" href="'+esc(Q.video)+'">↩ Rever aula</a><small>Alternativas embaralhadas · Correção imediata</small><button class="btn primary" data-act="next" '+(done?'':'disabled')+'>'+(last?'Concluir ✓':'Próxima →')+'</button></div></div>';
}
function renderResult(){
 const score=answers.filter((a,i)=>a===items[i].correct).length,p=score/items.length*100,hist=past();
 const rows=topicStats().map(t=>{const r=t.right/t.total*100;return '<div class="topic-row"><b>'+esc(t.topic)+'</b><span class="note">'+t.right+'/'+t.total+' · '+Math.round(r)+'%'+(r<70?' — Revisar':' — Bom desempenho')+'</span><div class="bar"><i style="width:'+r+'%"></i></div></div>'}).join('');
 const weak=topicStats().filter(t=>t.right<t.total).slice(0,3).map(x=>x.topic).join(', ')||'Nenhum assunto com erro nesta tentativa.';
 return '<div class="finish"><section class="panel summary"><div class="eyebrow">AVALIAÇÃO CONCLUÍDA</div><h2>Seu desempenho</h2><div class="big">'+Math.round(p)+'% · '+score+'/20</div><div class="donut" role="img" aria-label="'+p+'% de acertos" style="background:conic-gradient(#39ff14 0% '+p+'%,#ff00e6 '+p+'% 100%)"><span>'+Math.round(p)+'%</span></div><div class="stats"><div class="stat"><b>'+Math.round((hist[0]?.pct??p))+'%</b><small>Último</small></div><div class="stat"><b>'+Math.max(...hist.map(x=>x.pct))+'%</b><small>Melhor</small></div><div class="stat"><b>'+(20-score)+'</b><small>Erros</small></div></div><div class="btn-group"><button class="btn primary" data-act="start">↻ Refazer</button><a class="btn" href="../dashboard-aluno.html">▤ Dashboard</a></div><p class="note" id="cloud-status">Conferindo sincronização…</p></section><section class="panel result-side"><h3>Diagnóstico por assunto</h3>'+rows+'<h3>O que estudar agora?</h3><p>'+esc(weak)+'</p><p class="note">Reassista aos trechos correspondentes, revise os comentários e tente novamente. A classificação considera esta tentativa, não substitui avaliação docente.</p><div class="btn-group"><button class="btn" data-act="review">📚 Gabarito comentado</button><a class="btn" href="'+esc(Q.video)+'">▶ Rever videoaula</a></div></section></div>';
}
function renderReview(){
 const q=items[current],given=answers[current];
 return '<div class="quiz"><div class="quizbar"><div class="quizmeta"><span>GABARITO COMENTADO · '+esc(q.topic)+'</span><span>'+(current+1)+'/20</span></div></div><div class="quizgrid"><section class="panel question"><h2>'+esc(q.q)+'</h2><div class="feedback"><b>Explicação pedagógica:</b> '+esc(q.explain)+'</div></section><section class="panel answers">'+order[current].map((i,j)=>'<div class="option '+(i===q.correct?'correct':i===given?'wrong':'')+'"><span class="key">'+(i===q.correct?'✓':i===given?'✕':'ABCD'[j])+'</span>'+esc(q.options[i])+'</div>').join('')+'</section></div><div class="foot"><button class="btn" data-act="prev" '+(current===0?'disabled':'')+'>← Anterior</button><small>Correta em verde · sua escolha errada em rosa</small><button class="btn primary" data-act="review-next">'+(current===19?'Ver resultado':'Próxima →')+'</button></div></div>';
}
function render(){app.innerHTML=stage==='welcome'?renderWelcome():stage==='quiz'?renderQuiz():stage==='result'?renderResult():renderReview()}
app.addEventListener('click',event=>{
 const answer=event.target.closest('[data-answer]');if(answer){choose(Number(answer.dataset.answer));return}
 const el=event.target.closest('[data-act]');if(!el)return;const act=el.dataset.act;
 if(act==='start')start();if(act==='next')next();
 if(act==='review'){stage='review';current=0;render()}
 if(act==='prev'){current=Math.max(0,current-1);render()}
 if(act==='review-next'){if(current===19){stage='result';render();const el=document.getElementById('cloud-status');if(el)el.textContent=sent?'✓ Resultado sincronizado.':'Verifique seu Dashboard para consultar os resultados sincronizados.'}else{current++;render()}}
});
document.getElementById('sound').addEventListener('click',toggleSound);
render();
