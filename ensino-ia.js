'use strict';
(()=>{
 const data=window.ENSINOMEU_IA_DATA, $=id=>document.getElementById(id);
 if(!data||!data.series){$('chapter-title').textContent='Não foi possível carregar o currículo.';return}
 const grades=Object.keys(data.series),params=new URLSearchParams(location.search);
 let grade=grades.includes(params.get('serie'))?params.get('serie'):grades[0];
 let term=/^T[123]$/.test(params.get('trimestre')||'')?params.get('trimestre'):'T1';
 let aula=Math.min(4,Math.max(1,Number(params.get('aula'))||1));
 const progressKey=g=>'ensinoMeu:ia-roteiros:'+g;
 function getDone(g){try{let v=JSON.parse(localStorage.getItem(progressKey(g))||'[]');return Array.isArray(v)?v.filter(x=>/^T[123]-[1-4]$/.test(x)):[]}catch{return []}}
 function remember(){try{const set=new Set(getDone(grade));set.add(term+'-'+aula);localStorage.setItem(progressKey(grade),JSON.stringify([...set]))}catch{}updateProgress()}
 function updateProgress(){const done=new Set(getDone(grade));$('done-count').textContent=done.size+'/12';$('progress').value=done.size;$('complete').textContent=done.has(term+'-'+aula)?'Estudado ✓':'Marcar como estudado ✓'}
 function node(tag,text,cls){const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n}
 grades.forEach(g=>{const o=node('option',data.series[g].nome);o.value=g;$('grade-select').append(o)});
 function render(){
  const item=data.series[grade].trimestres[Number(term.slice(1))-1],body=$('chapter-body');
  $('grade-select').value=grade;$('term-select').value=term;
  const tabs=$('lesson-tabs');tabs.replaceChildren();
  item.aulas.forEach((name,i)=>{const n=node('button',name,'lesson-tab');n.type='button';n.setAttribute('aria-current',i+1===aula?'step':'false');n.addEventListener('click',()=>{aula=i+1;render()});tabs.append(n)});
  $('chapter-tag').textContent=data.series[grade].nome+' • '+term.replace('T','')+'º trimestre • Roteiro '+aula+'/4';
  $('chapter-title').textContent=item.aulas[aula-1];
  body.replaceChildren();$('quiz-form').hidden=true;$('quiz-feedback').hidden=true;
  const add=(tag,title,content,cls)=>{
   const block=node('div',null,cls);block.append(node(tag,title),node('p',content));body.append(block);
  };
  if(aula===1){
    add('h3','Objetivo do estudo',item.conteudo,'');
    add('h3','Pergunta para pensar','O que você já sabe sobre '+item.tema.toLowerCase()+'? Escreva duas ideias antes de avançar.','example');
  }else if(aula===2){
    add('h3','Entenda com um exemplo',item.exemplo,'example');
    add('h3','Observe e explique','Releia o exemplo e explique, com suas palavras, quais dados ou decisões humanas influenciam o resultado.','');
  }else if(aula===3){
    add('h3','Atividade prática',item.desafio,'activity');
    add('h3','Cuidados importantes','Use apenas exemplos fictícios, sem nomes, senhas, fotos pessoais ou dados privados. Registre o que funcionou e o que mudaria.','');
  }else{
    add('h3','Síntese','Revise o conceito, o exemplo e a atividade dos roteiros anteriores. Responda à questão abaixo e explique sua escolha.','');
    $('quiz-form').hidden=false;$('quiz-title').textContent=item.pergunta;const options=$('quiz-options');options.replaceChildren();
    item.opcoes.forEach((label,i)=>{const wrap=node('label',null,'option'),inp=document.createElement('input');inp.type='radio';inp.name='resposta';inp.value=String(i);inp.required=true;wrap.append(inp,document.createTextNode(' '+String.fromCharCode(65+i)+') '+label));options.append(wrap)});
  }
  $('prev').disabled=aula===1&&term==='T1';
  $('next').disabled=aula===4&&term==='T3';
  const url=new URL(location.href);url.searchParams.set('serie',grade);url.searchParams.set('trimestre',term);url.searchParams.set('aula',String(aula));history.replaceState(null,'',url);
  updateProgress();
 }
 $('grade-select').addEventListener('change',()=>{grade=$('grade-select').value;term='T1';aula=1;render()});
 $('term-select').addEventListener('change',()=>{term=$('term-select').value;aula=1;render()});
 $('prev').addEventListener('click',()=>{if(aula>1)aula--;else if(term!=='T1'){term='T'+(Number(term.slice(1))-1);aula=4}render()});
 $('next').addEventListener('click',()=>{if(aula<4)aula++;else if(term!=='T3'){term='T'+(Number(term.slice(1))+1);aula=1}render()});
 $('complete').addEventListener('click',remember);
 $('quiz-form').addEventListener('submit',e=>{e.preventDefault();const sel=$('quiz-form').querySelector('input[name=resposta]:checked');if(!sel)return;const item=data.series[grade].trimestres[Number(term.slice(1))-1],ok=Number(sel.value)===item.correta;const f=$('quiz-feedback');f.hidden=false;f.dataset.correct=String(ok);f.textContent=(ok?'Correto! ':'Ainda não. ')+'A resposta é '+String.fromCharCode(65+item.correta)+': '+item.opcoes[item.correta]+'. Revise os exemplos do trimestre.';if(ok)remember()});
 render();
})();