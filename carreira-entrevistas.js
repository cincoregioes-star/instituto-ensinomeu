/* Instituto EnsinoMeu — Oficina de Currículo e Entrevista
   Respostas locais, sem login obrigatório nem envio a servidores. */
(()=>{"use strict";
const form=document.getElementById("cv-form"),preview=document.getElementById("cv-preview");
if(!form||!preview)return;
const fields=["nome","cidade","contato","email","area","objetivo","formacao","experiencia","habilidades","cursos"];
const get=id=>(form.elements.namedItem(id)?.value||"").trim();
const put=(id,text)=>{const e=document.getElementById(id);if(e)e.textContent=text;};
function renderCV(){
  put("cv-nome",get("nome")||"SEU NOME COMPLETO");
  const contacts=[get("cidade"),get("contato"),get("email")].filter(Boolean);
  put("cv-contato",contacts.length?contacts.join(" • "):"Cidade • Telefone profissional • E-mail");
  put("cv-area",get("area")||"Área de interesse / Vaga pretendida");
  put("cv-objetivo",get("objetivo")||"Escreva de forma objetiva o tipo de vaga que procura e como pretende contribuir.");
  put("cv-formacao",get("formacao")||"Informe a escolaridade ou formação concluída / em andamento.");
  put("cv-experiencia",get("experiencia")||"Sem experiência profissional? Cite projetos escolares, trabalhos voluntários ou atividades relevantes de forma verdadeira.");
  put("cv-habilidades",get("habilidades")||"Ex.: organização, comunicação, informática básica, colaboração.");
  put("cv-cursos",get("cursos")||"Cite somente cursos realmente realizados, com instituição e ano quando possível.");
}
form.addEventListener("input",renderCV);renderCV();
document.getElementById("cv-print").addEventListener("click",()=>window.print());
document.getElementById("cv-txt").addEventListener("click",()=>{
 const body=[
   get("nome")||"SEU NOME COMPLETO",
   [get("cidade"),get("contato"),get("email")].filter(Boolean).join(" | "),
   "ÁREA PRETENDIDA\n"+get("area"),
   "OBJETIVO\n"+get("objetivo"),
   "FORMAÇÃO\n"+get("formacao"),
   "EXPERIÊNCIAS E PROJETOS\n"+get("experiencia"),
   "HABILIDADES\n"+get("habilidades"),
   "CURSOS COMPLEMENTARES\n"+get("cursos")
 ].join("\n\n");
 const blob=new Blob([body],{type:"text/plain;charset=utf-8"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");
 a.href=url;a.download="meu-curriculo-ensinomeu.txt";document.body.appendChild(a);a.click();a.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),1500);
});
const QUESTIONS=[
 {q:"Fale um pouco sobre você.",options:[
  "Conto minhas principais habilidades, estudos e interesse pela vaga em até um minuto.",
  "Descrevo detalhes da minha vida pessoal sem relação com o trabalho.",
  "Respondo apenas que não tenho nada a dizer."],best:0,
  tip:"Apresente quem você é profissionalmente, o que aprende ou já fez e por que a vaga combina com seu objetivo.",
  example:"Sou uma pessoa organizada, aprendo com facilidade e tenho interesse em atuar na área administrativa. Estou estudando ferramentas digitais e quero contribuir com responsabilidade."},
 {q:"Por que você deseja trabalhar nesta empresa?",options:[
  "Porque qualquer vaga serve e não pesquisei sobre a empresa.",
  "Porque conheci a atuação da empresa e vejo relação com minhas habilidades e objetivos.",
  "Apenas porque quero sair rapidamente do emprego atual."],best:1,
  tip:"Pesquise o que a empresa oferece e conecte ao que você realmente sabe fazer ou deseja aprender.",
  example:"Pesquisei a área em que vocês atuam e me identifiquei com as atividades. Acredito que posso aprender com a equipe e contribuir com organização e atenção."},
 {q:"Qual é seu principal ponto forte?",options:[
  "Digo que sou melhor que todas as outras pessoas.",
  "Respondo que não tenho nenhuma qualidade.",
  "Escolho uma habilidade verdadeira e dou um exemplo de quando a utilizei."],best:2,
  tip:"Prefira uma qualidade verificável, como pontualidade, comunicação, atenção ou responsabilidade.",
  example:"Meu ponto forte é organização. Quando preciso realizar várias tarefas, faço uma lista, defino prioridades e acompanho o que já concluí."},
 {q:"Qual ponto você está buscando melhorar?",options:[
  "Reconheço um aspecto real e explico o que estou fazendo para evoluir.",
  "Respondo que não tenho nenhum ponto a melhorar.",
  "Revelo algo grave e digo que não pretendo mudar."],best:0,
  tip:"Escolha uma melhoria real que não impeça as funções centrais da vaga e mostre uma ação concreta.",
  example:"Quero me comunicar com mais confiança em apresentações. Tenho praticado explicações curtas e buscado feedback para melhorar."},
 {q:"Como você lida com conflitos ou críticas?",options:[
  "Interrompo a conversa e culpo outras pessoas.",
  "Ouço com respeito, busco entender o problema e proponho uma solução.",
  "Finjo que não ouvi e nunca respondo."],best:1,
  tip:"Mostre escuta, respeito, capacidade de aprender com feedback e disposição para resolver problemas.",
  example:"Primeiro escuto o ponto de vista da pessoa, verifico os fatos e converso para encontrar um acordo que permita continuar o trabalho."},
 {q:"Você tem experiência profissional?",options:[
  "Invento uma experiência para parecer preparado.",
  "Desisto de responder se nunca tive emprego registrado.",
  "Falo com sinceridade sobre experiências, estudos, projetos e disposição para aprender."],best:2,
  tip:"Experiência pode incluir projetos, atividades voluntárias e responsabilidades reais; não invente cargos ou certificados.",
  example:"Ainda não atuei formalmente nessa função, mas desenvolvi organização e trabalho em equipe em atividades de estudo e projetos. Tenho interesse em aprender as rotinas."},
 {q:"Por que deveríamos contratar você?",options:[
  "Relaciono habilidades e atitudes minhas às necessidades da vaga, sem prometer o que não sei fazer.",
  "Digo que os outros candidatos são incompetentes.",
  "Respondo apenas que preciso muito do salário."],best:0,
  tip:"Explique como suas competências podem ajudar a equipe e destaque sua disponibilidade para aprender.",
  example:"Acredito que posso contribuir por ser cuidadoso com prazos, gostar de aprender e me comunicar com respeito. Quero desenvolver essas habilidades na função."},
 {q:"Qual é sua expectativa salarial?",options:[
  "Peço um valor aleatório sem considerar cargo ou região.",
  "Informo uma faixa fundamentada na vaga e no mercado, ou pergunto a faixa prevista pela empresa.",
  "Afirmo que trabalharia indefinidamente sem receber."],best:1,
  tip:"Pesquise a faixa praticada, considere jornada e benefícios e responda com flexibilidade respeitando seus limites.",
  example:"Gostaria de conhecer a faixa prevista para a função. Considerando as atividades e a jornada, podemos conversar sobre uma remuneração compatível."},
 {q:"O que pretende aprender nos próximos anos?",options:[
  "Digo que não preciso estudar mais.",
  "Invento um plano irreal apenas para impressionar.",
  "Apresento um objetivo possível de desenvolvimento ligado à área."],best:2,
  tip:"Foque em aprendizagem contínua e metas alcançáveis, sem exigir que sua vida siga um único caminho.",
  example:"Pretendo fortalecer minhas habilidades técnicas, continuar aprendendo ferramentas da área e assumir responsabilidades conforme minha experiência crescer."},
 {q:"Você gostaria de fazer alguma pergunta sobre a vaga?",options:[
  "Pergunto quais são as atividades, a integração e as próximas etapas do processo.",
  "Respondo que não importa o que farei no cargo.",
  "Pergunto apenas quando receberei uma promoção garantida."],best:0,
  tip:"Ao final, demonstre interesse genuíno pelas funções, treinamento, jornada e próximos passos.",
  example:"Quais seriam as principais atividades nos primeiros meses? Há treinamento para quem está começando? Quais são as próximas etapas da seleção?"}
];
let step=0,answers=Array(QUESTIONS.length).fill(null);
const quiz=document.getElementById("interview-quiz");
const head=document.getElementById("interview-question"),choices=document.getElementById("interview-options");
const num=document.getElementById("interview-count"),bar=document.getElementById("interview-progress");
const feedback=document.getElementById("interview-feedback");
const back=document.getElementById("interview-back"),next=document.getElementById("interview-next");
function e(tag,cls,txt){const v=document.createElement(tag);if(cls)v.className=cls;if(txt!==undefined)v.textContent=txt;return v;}
function render(){
  quiz.hidden=false;document.getElementById("interview-result").hidden=true;
  const q=QUESTIONS[step];head.textContent=q.q;
  num.textContent="Pergunta "+(step+1)+" de "+QUESTIONS.length;bar.style.width=(((step+1)/QUESTIONS.length)*100)+"%";
  choices.replaceChildren();
  q.options.forEach((txt,i)=>{
    const b=e("button","car-choice");b.type="button";b.setAttribute("aria-pressed",String(answers[step]===i));
    b.append(e("span","car-choice-num",String.fromCharCode(65+i)),e("span","",txt));
    b.addEventListener("click",()=>{answers[step]=i;render();});choices.append(b);
  });
  feedback.replaceChildren();feedback.hidden=answers[step]===null;
  if(answers[step]!==null){
    const best=answers[step]===q.best;feedback.className="car-choice-feedback"+(best?"":" wrong");
    feedback.append(e("strong","",best?"Boa escolha para esta situação.":"Existe uma alternativa mais adequada."),e("p","",q.tip),e("strong","","Exemplo de resposta:"),e("p","",q.example));
  }
  back.disabled=step===0;next.disabled=answers[step]===null;
  next.textContent=step===QUESTIONS.length-1?"Concluir minha prática":"Próxima pergunta →";
}
function show(){
  quiz.hidden=true;const r=document.getElementById("interview-result");r.hidden=false;
  const score=answers.reduce((n,v,i)=>n+(v===QUESTIONS[i].best?1:0),0);
  document.getElementById("interview-score").textContent=score+" de "+QUESTIONS.length+" escolhas alinhadas às boas práticas desta simulação.";
  document.getElementById("interview-summary").textContent=
    "O objetivo é praticar respostas profissionais, sinceras e claras. As escolhas não avaliam sua capacidade real e não garantem contratação.";
  const review=document.getElementById("interview-review");review.replaceChildren();
  QUESTIONS.forEach((q,i)=>{
    const details=e("details","car-accordion"),s=e("summary","",(i+1)+". "+q.q),box=e("div","car-accordion-content");
    box.append(e("p","",q.tip),e("strong","","Exemplo:"),e("p","",q.example));
    details.append(s,box);review.append(details);
  });
  r.scrollIntoView({behavior:"smooth",block:"start"});
}
back.addEventListener("click",()=>{if(step>0){step--;render();}});
next.addEventListener("click",()=>{if(answers[step]===null)return;if(step===QUESTIONS.length-1)show();else{step++;render();}});
document.getElementById("interview-again").addEventListener("click",()=>{answers.fill(null);step=0;render();quiz.scrollIntoView({behavior:"smooth",block:"start"});});
render();
})();