/* Motor de Políticas Públicas — Instituto EnsinoMeu.
 * Sem bibliotecas externas, sem login e sem gravação de dados pessoais.
 * Simulados: correção imediata. Avaliações: correção após o envio.
 */
(()=>{
'use strict';
const bank=window.POLITICAS_BANCO||{},modes=window.POLITICAS_MODOS||[];
const qs=new URLSearchParams(location.search);
const mode=modes.find(m=>m.id===qs.get('tipo'))||modes.find(m=>m.id==='fundamentos');
if(!mode)return;
const questions=bank[mode.id]||[];
const $=id=>document.getElementById(id),app=$('app'),soundBtn=$('som');
const draftKey='ensinomeu_pp_rascunho_'+mode.id,histKey='ensinomeu_pp_hist_'+mode.id;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const load=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}};
const save=(key,obj)=>{try{localStorage.setItem(key,JSON.stringify(obj))}catch{}};
let sound=load('ensinomeu_pp_sound',true),ctx=null,stage='home',order=[],alts=[],answers=[],current=0,started=0,seconds=0,finishedRecord=null;
let history=load(histKey,[]);if(!Array.isArray(history))history=[];
let draft=load(draftKey,null);
document.title=mode.title+' | Instituto EnsinoMeu';

function validateBank(){
 if(questions.length!==mode.count){app.innerHTML='<div class="panel note">Esta atividade está em manutenção. Volte ao catálogo.</div>';return false}
 return questions.every(q=>Array.isArray(q)&&q.length===6&&Array.isArray(q[3])&&q[3].length===4&&Number.isInteger(q[4])&&q[4]>=0&&q[4]<4);
}
if(!validateBank())return;

function initNew(){
 order=shuffle([...questions.keys()]);alts=order.map(()=>shuffle([0,1,2,3]));
 answers=Array(questions.length).fill(null);current=0;seconds=0;started=Date.now();finishedRecord=null;stage='quiz';saveDraft();render();
}
function canResume(v){
 return v&&Array.isArray(v.order)&&v.order.length===questions.length&&new Set(v.order).size===questions.length&&v.order.every(i=>Number.isInteger(i)&&i>=0&&i<questions.length)&&Array.isArray(v.alts)&&v.alts.length===questions.length&&v.alts.every(a=>Array.isArray(a)&&a.length===4&&new Set(a).size===4&&a.every(x=>Number.isInteger(x)&&x>=0&&x<4))&&Array.isArray(v.answers)&&v.answers.length===questions.length&&v.answers.every(x=>x===null||(Number.isInteger(x)&&x>=0&&x<4));
}
function resume(){if(!canResume(draft))return initNew();order=draft.order;alts=draft.alts;answers=draft.answers;current=Math.max(0,Math.min(questions.length-1,Number(draft.current)||0));started=Number(draft.started)||Date.now();stage='quiz';render()}
function saveDraft(){save(draftKey,{order,alts,answers,current,started})}
function clearDraft(){try{localStorage.removeItem(draftKey)}catch{}draft=null}
function fmtTime(){let n=Math.max(0,Math.floor((Date.now()-started)/1000));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')}
function score(){return answers.reduce((n,a,i)=>n+Number(a===questions[order[i]][4]),0)}
function stopSpeech(){if('speechSynthesis' in window)try{window.speechSynthesis.cancel()}catch{}}
function preferredVoice(){const voices=window.speechSynthesis.getVoices();const pt=voices.filter(v=>/^pt[-_]BR$/i.test(v.lang));return pt.find(v=>/Fernanda|Francisca|Luciana|Maria|Bianca|Camila|Let[ií]cia|Helena/i.test(v.name))||pt[0]||voices.find(v=>/^pt/i.test(v.lang))||null}
function narrate(kind){
 if(!('speechSynthesis' in window)){alert('A leitura por voz não está disponível neste navegador.');return}
 stopSpeech();const q=questions[order[current]];
 const content=kind==='explain'?('Explicação pedagógica. '+q[5]):(q[1]+'. '+q[2]+'. '+alts[current].map((opt,i)=>'Alternativa '+('ABCD'[i])+'. '+q[3][opt]+'.').join(' '));
 const u=new SpeechSynthesisUtterance(content);u.lang='pt-BR';u.rate=.95;u.pitch=1;u.volume=1;const voice=preferredVoice();if(voice)u.voice=voice;
 try{window.speechSynthesis.speak(u)}catch{alert('Não foi possível reproduzir a leitura. Confira a voz instalada no dispositivo.')}
}
function beep(ok){
 if(!sound)return;
 try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;ctx=ctx||new A();if(ctx.state==='suspended')ctx.resume().catch(()=>{});
 const notes=ok?[523.25,659.25,783.99]:[310,232];notes.forEach((hz,i)=>{const start=ctx.currentTime+i*.095,o=ctx.createOscillator(),g=ctx.createGain();o.type=ok?'sine':'triangle';o.frequency.setValueAtTime(hz,start);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(.08,start+.018);g.gain.exponentialRampToValueAtTime(.0001,start+.19);o.connect(g);g.connect(ctx.destination);o.start(start);o.stop(start+.20)})
 }catch{}
}
function updateSound(){soundBtn.textContent=sound?'🔊 Sons ligados':'🔇 Sons desligados';soundBtn.setAttribute('aria-pressed',String(sound))}
soundBtn.addEventListener('click',()=>{sound=!sound;save('ensinomeu_pp_sound',sound);updateSound();if(!sound)stopSpeech();else beep(true)});updateSound();

function home(){
 const best=history.length?Math.max(...history.map(r=>r.pct))+'%':'—';const last=history[0]?.pct;
 return `<div class="panel game-home"><div><div class="eyebrow">${mode.type==='avaliacao'?'AVALIAÇÃO PEDAGÓGICA':'SIMULADO GAMIFICADO'} · ${mode.count} QUESTÕES</div><h1>${esc(mode.title)}</h1><p>${esc(mode.subtitle)}</p><div class="pills"><span class="pill">Alternativas embaralhadas</span><span class="pill">${mode.immediate?'Feedback após cada resposta':'Gabarito após finalizar'}</span><span class="pill">Gráfico de acertos</span><span class="pill">Áudio opcional PT-BR</span></div><div class="buttons"><button class="btn primary" data-act="new">▶ ${draft&&canResume(draft)?'Iniciar nova tentativa':'Iniciar atividade'}</button>${draft&&canResume(draft)?'<button class="btn green" data-act="resume">↩ Continuar tentativa</button>':''}<a class="btn" href="index.html">← Ver todas as atividades</a></div><p class="silent">O resultado fica salvo somente neste dispositivo. Não há certificado automático nem sincronização com contas dos alunos.</p></div><div class="stats-wrap"><div class="eyebrow">SEU HISTÓRICO LOCAL</div><div class="statline"><div class="mini-stat"><b>${last===undefined?'—':last+'%'}</b><small>Último resultado</small></div><div class="mini-stat"><b>${best}</b><small>Melhor resultado</small></div><div class="mini-stat"><b>${history.length}</b><small>Tentativas</small></div></div><p class="note">${esc(mode.info)} ${mode.id==='diagnostica'?'Não é necessário atingir uma pontuação mínima.':mode.id==='final'?'Meta pedagógica sugerida: 70% de acertos.':'Revise a explicação após cada resposta para reforçar a aprendizagem.'}</p></div></div>`;
}
function quiz(){
 const q=questions[order[current]],chosen=answers[current],locked=mode.immediate&&chosen!==null,percent=Math.round((current+1)/questions.length*100);
 const btns=alts[current].map((opt,i)=>{
  let cls='';if(locked){cls=opt===q[4]?'correct':opt===chosen?'wrong':'dim'}else if(opt===chosen){cls='selected'}
  return `<button class="option ${cls}" type="button" data-choose="${opt}" ${locked?'disabled':''} aria-pressed="${String(chosen===opt)}"><span class="letter">${'ABCD'[i]}</span><span>${esc(q[3][opt])}</span></button>`
 }).join('');
 const footerAction=current===questions.length-1?(mode.immediate?'Ver resultado →':'Enviar avaliação →'):'Próxima questão →';
 const completed=answers.filter(x=>x!==null).length;
 const explanation=locked?`<div class="feedback ${chosen===q[4]?'ok':'no'}" role="status"><b>${chosen===q[4]?'✓ Acertou!':'✕ Resposta incorreta'}</b>${esc(q[5])}</div>`:'';
 return `<div class="quiz-area"><div class="quiz-progress"><strong>${esc(mode.title)} · ${current+1}/${questions.length}</strong><span><em id="timer">${fmtTime()}</em> · ${completed} respondidas</span><div class="rail"><i style="width:${percent}%"></i></div></div><div class="quiz-grid"><section class="panel question-panel"><div class="question-scroll"><div class="topic">${esc(q[0])} · ${mode.immediate?'Aprendizagem ativa':'Avaliação sem feedback imediato'}</div><div class="context">${esc(q[1])}</div><h2>${esc(q[2])}</h2>${explanation}</div><div class="voice"><button type="button" data-act="listen">🔊 Ouvir questão e alternativas</button>${locked?'<button type="button" data-act="explain">🔉 Ouvir explicação</button>':''}<button type="button" data-act="stop">■ Parar voz</button><small>Voz PT-BR do dispositivo · 0,95×</small></div></section><section class="panel answer-panel"><div class="answer-title">${locked?'Correção comentada':'Escolha uma alternativa'}</div><div class="answers">${btns}</div><div class="silent">${mode.immediate?'A correção aparece ao selecionar; não é possível trocar a resposta.':'É possível alterar respostas até enviar a avaliação.'}</div></section></div><div class="quiz-foot"><div class="foot-left"><button class="btn" data-act="prev" ${current===0?'disabled':''}>← Anterior</button></div><div class="help">${mode.immediate?'Verde = correta · Rosa = incorreta':'O gabarito completo será mostrado ao concluir'}</div><div class="foot-right"><button class="btn primary" data-act="next" ${mode.immediate&&chosen===null?'disabled':''}>${footerAction}</button></div></div></div>`;
}
function finish(){
 if(answers.some(a=>a===null)){
  const missing=answers.findIndex(a=>a===null);current=missing;saveDraft();render();alert('Responda as questões pendentes antes de enviar. Voltamos à primeira questão sem resposta.');return
 }
 stopSpeech();seconds=Math.max(0,Math.floor((Date.now()-started)/1000));const right=score(),pct=Math.round(right*100/questions.length);
 finishedRecord={right,pct,total:questions.length,seconds,when:new Date().toISOString()};history=[finishedRecord,...history].slice(0,30);save(histKey,history);clearDraft();stage='result';beep(pct>=70);render();
}
function result(){
 const right=finishedRecord?.right??score(),pct=finishedRecord?.pct??Math.round(100*right/questions.length);
 const incorrect=order.map((id,i)=>({q:questions[id],answer:answers[i],i})).filter(x=>x.answer!==x.q[4]);
 const needs=incorrect.slice(0,8).map(x=>`<span class="pill">${esc(x.q[0])}</span>`).join('')||'<span class="pill">Excelente! Revise para consolidar.</span>';
 const review=order.map((id,i)=>{const q=questions[id],ch=answers[i],ok=ch===q[4];return `<div class="review-item"><b>${i+1}. ${esc(q[0])} · ${ok?'✓ Correta':'✕ Incorreta'}</b><p>${esc(q[2])}</p><p class="${ok?'right':'wrong'}">Sua resposta: ${esc(ch===null?'Não respondida':q[3][ch])}</p><p class="right">Resposta correta: ${esc(q[3][q[4]])}</p><p>${esc(q[5])}</p></div>`}).join('');
 const previous=history.slice(0,5).map(r=>`<span class="pill">${r.pct}% · ${new Date(r.when).toLocaleDateString('pt-BR')}</span>`).join('');
 return `<div class="result-wrap"><section class="panel result-card"><div class="eyebrow">${mode.type==='avaliacao'?'AVALIAÇÃO CONCLUÍDA':'SIMULADO CONCLUÍDO'}</div><h2>Seu desempenho</h2><div class="score">${pct}%</div><p>${right} acertos de ${questions.length} questões · ${questions.length-right} respostas incorretas · ${Math.ceil((finishedRecord?.seconds||0)/60)} min.</p><div class="donut" style="--pct:${pct}%" role="img" aria-label="Gráfico de ${pct}% de acertos"><b>${pct}%</b></div><div class="buttons"><button class="btn primary" data-act="new">↻ Nova tentativa</button><a class="btn green" href="index.html">📚 Outras atividades</a></div><p class="silent">${mode.id==='diagnostica'?'Esse diagnóstico identifica o ponto de partida e não possui aprovação ou reprovação.':mode.id==='final'?(pct>=70?'Meta pedagógica sugerida de 70% alcançada.':'Meta pedagógica sugerida de 70% ainda não alcançada; revise e tente novamente.'):'Observe seus erros e refaça após estudar.'} Este resultado não é certificado de conclusão de curso.</p></section><section class="panel result-card"><div class="eyebrow">DIAGNÓSTICO DE APRENDIZAGEM</div><h2>O que revisar?</h2><div class="pills">${needs}</div><p class="silent">Últimas tentativas neste dispositivo:</p><div class="pills">${previous}</div><h3>Gabarito completo e comentado</h3><div class="result-review">${review}</div></section></div>`;
}
function render(){
 app.innerHTML=stage==='home'?home():stage==='quiz'?quiz():result();
 app.querySelectorAll('[data-act="new"]').forEach(btn=>btn.setAttribute('aria-label','Iniciar nova tentativa de '+mode.title));
}
app.addEventListener('click',event=>{
 const choice=event.target.closest('[data-choose]');if(choice&&stage==='quiz'){
  if(mode.immediate&&answers[current]!==null)return;
  const opt=Number(choice.dataset.choose);if(opt<0||opt>3)return;answers[current]=opt;const good=opt===questions[order[current]][4];if(mode.immediate)beep(good);saveDraft();stopSpeech();render();return;
 }
 const el=event.target.closest('[data-act]');if(!el)return;
 switch(el.dataset.act){
  case 'new':stopSpeech();initNew();break;
  case 'resume':stopSpeech();resume();break;
  case 'prev':if(stage==='quiz'&&current>0){stopSpeech();current--;saveDraft();render()}break;
  case 'next':if(stage==='quiz'){if(current===questions.length-1)finish();else{stopSpeech();current++;saveDraft();render()}}break;
  case 'listen':if(stage==='quiz')narrate('question');break;
  case 'explain':if(stage==='quiz'&&mode.immediate&&answers[current]!==null)narrate('explain');break;
  case 'stop':stopSpeech();break;
 }
});
setInterval(()=>{if(stage==='quiz'){const el=$('timer');if(el)el.textContent=fmtTime()}},1000);
window.addEventListener('pagehide',()=>{stopSpeech();if(stage==='quiz')saveDraft()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpeech()});
render();
})();
