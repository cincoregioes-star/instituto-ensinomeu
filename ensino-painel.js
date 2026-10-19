import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.75.1/+esm';
const C=window.ENSINOMEU_CONFIG||{};
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sb=createClient(C.supabaseUrl,C.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const base=C.supabaseUrl+'/functions/v1/ensino-api';
let ME=null,GRADES=[],SELECTED=null,COURSES=[],HISTORY=[],EXAM=null;
async function request(path,opts={}){
 const session=await sb.auth.getSession();const jwt=session.data?.session?.access_token;if(!jwt)throw Error('Sessão expirada. Entre novamente.');
 const res=await fetch(base+path,{...opts,headers:{'Content-Type':'application/json','apikey':C.supabasePublishableKey,'Authorization':'Bearer '+jwt,...opts.headers}});
 const result=await res.json().catch(()=>({detail:'Falha de comunicação com o servidor'}));
 if(!res.ok)throw Error(result.detail||'Erro na operação');
 return result;
}
function status(message){$('grade-cards').textContent=message}
async function init(){
 try{
   const {data,error}=await sb.auth.getUser();if(error||!data?.user){location.replace('login.html');return}
   ME=await request('/me');
   $('user-name').textContent=ME.nome||ME.username;
   $('role').textContent=({student:'ÁREA DO ALUNO',teacher:'ÁREA DOCENTE',guardian:'ÁREA DA FAMÍLIA',admin:'ADMINISTRAÇÃO'})[ME.perfil]||'INSTITUTO ENSINOMEU';
   $('welcome').textContent='Bem-vindo(a), '+String(ME.nome||'estudante');
   const g=await request('/series');GRADES=g.series;
   const h=await request('/historico');HISTORY=h.resultados;
   $('series-count').textContent=GRADES.length;$('quiz-count').textContent=HISTORY.length;renderGrades();
   if(ME.perfil==='guardian')await renderFamily();
   if(ME.perfil==='admin'){$('admin-panel').classList.remove('hidden')}
   const chosen=new URLSearchParams(location.search).get('serie');
   if(chosen&&GRADES.some(g=>g.id===chosen))await chooseGrade(chosen);
   else if(GRADES.length===1)await chooseGrade(GRADES[0].id);
 }catch(err){status('Não foi possível carregar o painel: '+err.message);$('welcome').textContent='Erro ao carregar sua área';console.error(err)}
}
function renderGrades(){
 if(!GRADES.length){status('Não há planos ativos vinculados à sua conta. Entre em contato com a administração para receber sua série.');return}
 $('grade-cards').innerHTML=GRADES.map(g=>`<button class="grade-card" type="button" data-grade="${esc(g.id)}" data-stage="${esc(g.etapa)}"><span class="tag">${esc(g.etapa)}</span><span class="arrow" aria-hidden="true">↗</span><b>${esc(g.serie)}</b><small>${g.disciplinas} disciplinas • 3 trimestres</small><small style="margin-top:7px;color:#096955;font-weight:800">Entrar na minha série →</small></button>`).join('');
}
async function renderFamily(){
 const data=await request('/familia');
 $('family-panel').classList.remove('hidden');
 $('family-list').innerHTML=data.estudantes.length?data.estudantes.map(st=>`<article class="stat"><strong style="font-size:19px">${esc(st.nome)}</strong><span>${st.planos.filter(x=>x.status==='active').length} planos ativos • ${st.avaliacoes.length} avaliações recentes</span><p class="helper">Histórico individual protegido. O aluno utiliza a própria conta para estudar.</p></article>`).join(''):'<p>Não há estudantes com vínculos familiares verificados. A associação requer validação pela administração.</p>';
}
async function chooseGrade(id){
 const grade=GRADES.find(x=>x.id===id);if(!grade)return;
 SELECTED=grade;$('grade-home').classList.add('hidden');$('learning').classList.remove('hidden');
 $('stage-name').textContent=grade.etapa;$('selected-name').textContent=grade.serie;
 $('selected-subtitle').textContent=grade.disciplinas+' disciplinas • 3 trimestres';$('search').value='';
 $('courses').textContent='Carregando disciplinas…';
 try{const data=await request('/cursos?serie='+encodeURIComponent(id));COURSES=data.cursos;$('course-count').textContent=COURSES.length;renderCourses();renderHistory();history.replaceState(null,'','?serie='+encodeURIComponent(id))}
 catch(err){$('courses').textContent=err.message}
}
function renderCourses(){
 const query=$('search').value.toLocaleLowerCase('pt-BR');
 const items=COURSES.filter(x=>x.nome.toLocaleLowerCase('pt-BR').includes(query));
 $('courses').innerHTML=items.map(c=>`<details class="subject"><summary><span><b>${esc(c.nome)}</b><small>Plano anual • três trimestres</small></span></summary><div class="sub-body">${c.trimestres.map(t=>`<div class="trimester"><b>${esc(t.titulo)}</b><div class="actions"><button type="button" class="btn alt" data-action="pdf" data-course="${esc(c.id)}" data-term="${esc(t.id)}" ${t.pdf?'':'disabled'}>Abrir apostila PDF</button><button type="button" class="btn" data-action="quiz" data-course="${esc(c.id)}" data-term="${esc(t.id)}" ${t.simulado?'':'disabled'}>Fazer simulado</button><a class="btn alt" href="trilha.html?disciplina=${encodeURIComponent(c.id)}&trimestre=${encodeURIComponent(t.id)}" style="text-decoration:none">Aulas, vídeos e exercícios →</a></div></div>`).join('')}</div></details>`).join('')||'<p>Nenhuma disciplina encontrada.</p>';
}
function renderHistory(){
 const list=HISTORY.filter(h=>COURSES.some(c=>c.id===h.course_id));
 $('history').innerHTML=list.length?list.slice(0,25).map(h=>`<article><b>${esc(COURSES.find(c=>c.id===h.course_id)?.nome||h.course_id)}</b><div>${esc(h.term_id)} • ${h.correct}/${h.total} questões</div><small>${esc(new Date(h.done_at).toLocaleString('pt-BR'))}</small></article>`).join(''):'<p class="helper">Nenhuma avaliação registrada nesta série.</p>';
}
function renderQuestion(){const q=EXAM.questions[EXAM.index];$('quiz-step').textContent='Questão '+(EXAM.index+1)+' de '+EXAM.questions.length;$('quiz-question').textContent=q.pergunta;$('quiz-options').innerHTML=q.opcoes.map((v,i)=>`<button type="button" class="quiz-option" data-answer="${i}">${'ABCD'[i]}. ${esc(v)}</button>`).join('');$('quiz-next').textContent=EXAM.index+1===EXAM.questions.length?'Corrigir simulado':'Próxima questão';$('quiz-next').disabled=true;$('quiz-next').classList.remove('hidden');$('quiz-error').textContent=''}
$('grade-cards').addEventListener('click',e=>{const button=e.target.closest('button[data-grade]');if(button)chooseGrade(button.dataset.grade)});
$('back').addEventListener('click',()=>{SELECTED=null;COURSES=[];$('grade-home').classList.remove('hidden');$('learning').classList.add('hidden');history.replaceState(null,'',location.pathname)});
$('search').addEventListener('input',renderCourses);
$('expand-all').addEventListener('click',()=>{const list=[...document.querySelectorAll('.subject')],open=list.some(e=>!e.open);list.forEach(e=>e.open=open);$('expand-all').textContent=open?'Recolher disciplinas':'Expandir disciplinas'});
$('courses').addEventListener('click',async e=>{
 const b=e.target.closest('button[data-action]');if(!b)return;
 const cid=encodeURIComponent(b.dataset.course),term=encodeURIComponent(b.dataset.term);
 if(b.dataset.action==='pdf'){
  const win=window.open('about:blank','_blank');
  try{const result=await request('/material/'+cid+'/'+term);if(win)win.location.href=result.url;else location.assign(result.url)}catch(err){if(win)win.close();alert(err.message)}return;
 }
 try{const data=await request('/simulado/'+cid+'/'+term);EXAM={cid,term,questions:data.questoes,index:0,answers:[]};$('quiz-title').textContent=data.curso+' • '+data.trimestre;$('quiz-dialog').showModal();renderQuestion()}catch(err){alert(err.message)}
});
$('quiz-options').addEventListener('click',e=>{const b=e.target.closest('[data-answer]');if(!b||!EXAM)return;EXAM.answers[EXAM.index]=Number(b.dataset.answer);$('quiz-options').querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));$('quiz-next').disabled=false});
$('quiz-next').addEventListener('click',async()=>{
 if(!EXAM||EXAM.answers[EXAM.index]===undefined)return;
 if(EXAM.index<EXAM.questions.length-1){EXAM.index++;renderQuestion();return}
 try{
 const results=await request('/simulado/'+EXAM.cid+'/'+EXAM.term+'/corrigir',{method:'POST',body:JSON.stringify({answers:EXAM.answers})});
 $('quiz-step').textContent='Resultado: '+results.acertos+' de '+results.total+' — '+results.percentual+'%';$('quiz-question').textContent='Revisão comentada';
 $('quiz-options').innerHTML=results.revisao.map(r=>`<div class="review"><b>Questão ${r.numero}: correta ${'ABCD'[r.correta]} • marcada ${'ABCD'[r.marcada]}</b><p>${esc(r.explicacao)}</p></div>`).join('');
 $('quiz-next').classList.add('hidden');HISTORY=(await request('/historico')).resultados;$('quiz-count').textContent=HISTORY.length;renderHistory();
 }catch(err){$('quiz-error').textContent=err.message}
});
$('quiz-close').addEventListener('click',()=>{$('quiz-dialog').close();EXAM=null});
$('logout').addEventListener('click',async()=>{await sb.auth.signOut();location.replace('login.html')});
$('password-form').addEventListener('submit',async e=>{
 e.preventDefault();const message=$('password-message');message.textContent='Verificando…';
 try{
 const profile=await sb.auth.getUser();if(!profile.data?.user?.email)throw Error('Sessão inválida');
 const verify=await sb.auth.signInWithPassword({email:profile.data.user.email,password:$('current-pass').value});
 if(verify.error)throw Error('Senha atual incorreta');
 const pass=$('new-pass').value;if(pass.length<12)throw Error('Use ao menos 12 caracteres.');
 const update=await sb.auth.updateUser({password:pass});if(update.error)throw update.error;
 message.style.color='#096955';message.textContent='Senha alterada.';e.target.reset();
 }catch(err){message.style.color='#a4362d';message.textContent=err.message}
});
sb.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT')location.replace('login.html')});
init();
