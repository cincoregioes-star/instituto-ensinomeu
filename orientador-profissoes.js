/* Instituto EnsinoMeu — Agente Orientador de Profissões.
 * 10 perguntas de autoconhecimento; indicação exploratória, não diagnóstico vocacional.
 * Sem coleta, envio ou armazenamento de respostas em servidores. */
(() => {
  "use strict";
  const AREAS = {
    tecnologia:{name:"Tecnologia, Informática e Dados",text:"Você pode gostar de resolver problemas digitais, estudar sistemas, planilhas, dados e segurança da informação.",courses:[["Excel e Análise de Dados","conteudos-recuperados/excel-analise-dados/index.html"],["Inteligência Artificial no Trabalho","conteudos-recuperados/inteligencia-artificial-trabalho/index.html"],["Cibersegurança e LGPD","conteudos-recuperados/ciberseguranca-lgpd/index.html"]]},
    administracao:{name:"Administração, Gestão e Escritório",text:"Você pode ter afinidade com organização, documentos, controles, rotinas administrativas e atendimento interno.",courses:[["Auxiliar Administrativo","conteudos-recuperados/auxiliar-administrativo/index.html"],["Excel e Análise de Dados","conteudos-recuperados/excel-analise-dados/index.html"],["Compras Públicas — Lei 14.133","conteudos-recuperados/compras-publicas/index.html"]]},
    logistica:{name:"Logística, Estoque e Distribuição",text:"Você pode gostar de planejar estoques, recebimento, compras, movimentação e organização de materiais.",courses:[["Logística e Almoxarifado","conteudos-recuperados/logistica-almoxarifado/index.html"],["Gabarito Logística — 12 trilhas","conteudos-recuperados/logistica/index.html"],["Data Center — Logística e Almoxarifado Técnico","conteudos-recuperados/data-center-logistica-almoxarifado/index.html"]]},
    saude:{name:"Saúde, Cuidados e Bem-Estar",text:"Você demonstrou interesse por acolhimento, cuidados e bem-estar. Comece por conteúdos introdutórios e conheça as exigências legais de cada profissão.",courses:[["Cuidador de Idosos — Fundamentos","conteudos-recuperados/cuidador-idosos/index.html"],["Técnico de Enfermagem — Revisão","conteudos-recuperados/tecnico-enfermagem/index.html"],["Segurança do Trabalho — Fundamentos","conteudos-recuperados/seguranca-do-trabalho/index.html"]]},
    social:{name:"Assistência Social e Serviço Público",text:"Você pode se identificar com cidadania, políticas públicas, acolhimento de pessoas e organização de serviços à comunidade.",courses:[["Orientador Social e SUAS","conteudos-recuperados/orientador-social-suas/index.html"],["Compras Públicas — Lei 14.133","conteudos-recuperados/compras-publicas/index.html"],["Auxiliar Administrativo","conteudos-recuperados/auxiliar-administrativo/index.html"]]},
    atendimento:{name:"Atendimento, Vendas e Comunicação",text:"Você pode se desenvolver em relacionamento com pessoas, comunicação, escuta, comércio e resolução de demandas.",courses:[["Atendimento, Vendas e Caixa","conteudos-recuperados/atendimento-vendas/index.html"],["Auxiliar Administrativo","conteudos-recuperados/auxiliar-administrativo/index.html"],["Inteligência Artificial no Trabalho","conteudos-recuperados/inteligencia-artificial-trabalho/index.html"]]},
    infraestrutura:{name:"Infraestrutura, Manutenção e Data Center",text:"Você pode gostar de observar equipamentos, investigar falhas e compreender como a infraestrutura técnica funciona.",courses:[["Manutenção Predial","conteudos-recuperados/manutencao-predial/index.html"],["Data Center — Operação e Monitoramento","conteudos-recuperados/data-center-operacao/index.html"],["Data Center — Refrigeração e HVAC","conteudos-recuperados/data-center-refrigeracao-hvac/index.html"]]},
    seguranca:{name:"Segurança, Qualidade e Prevenção",text:"Você pode se interessar por normas, prevenção de acidentes, análise de riscos, proteção de dados e qualidade.",courses:[["Segurança do Trabalho — Fundamentos","conteudos-recuperados/seguranca-do-trabalho/index.html"],["Cibersegurança e LGPD","conteudos-recuperados/ciberseguranca-lgpd/index.html"],["Data Center — Segurança, EHS e Qualidade","conteudos-recuperados/data-center-seguranca-ehs-qualidade/index.html"]]}
  };
  const Q = [
    {q:"Qual atividade desperta mais sua curiosidade?",a:[["Usar computadores e descobrir como a tecnologia funciona",["tecnologia","infraestrutura"]],["Organizar tarefas, documentos e números",["administracao","logistica"]],["Conversar, orientar e ajudar pessoas",["social","atendimento"]],["Mexer com equipamentos e descobrir falhas",["infraestrutura","seguranca"]],["Ainda não tenho uma preferência",[]]]},
    {q:"Em qual situação você se sentiria mais confortável?",a:[["Analisando informações e resolvendo desafios",["tecnologia","administracao"]],["Controlando entradas, saídas e prazos",["logistica","administracao"]],["Ouvindo alguém e encontrando uma solução",["social","saude"]],["Cumprindo procedimentos e verificando riscos",["seguranca","infraestrutura"]]]},
    {q:"O que mais gostaria de aprender primeiro?",a:[["Planilhas, IA e ferramentas digitais",["tecnologia","administracao"]],["Como funciona o comércio e o atendimento",["atendimento","administracao"]],["Cuidados com pessoas e bem-estar",["saude","social"]],["Estoque, transportes e distribuição",["logistica","infraestrutura"]]]},
    {q:"Qual ambiente de trabalho mais chama sua atenção?",a:[["Escritório, computador e organização",["administracao","tecnologia"]],["Loja, recepção e relacionamento com clientes",["atendimento","administracao"]],["Unidade comunitária ou espaço de cuidados",["social","saude"]],["Área técnica, manutenção ou operação",["infraestrutura","seguranca"]]]},
    {q:"Quando surge um problema, como prefere agir?",a:[["Pesquisar, testar soluções e comparar dados",["tecnologia","infraestrutura"]],["Criar listas, processos e acompanhar etapas",["administracao","logistica"]],["Conversar e buscar acordo entre as pessoas",["atendimento","social"]],["Verificar riscos e agir com prevenção",["seguranca","saude"]]]},
    {q:"Em qual assunto você gostaria de se aprofundar?",a:[["Redes, automação e sistemas digitais",["tecnologia","infraestrutura"]],["Organização de mercadorias e operações",["logistica","administracao"]],["Direitos sociais e cidadania",["social","atendimento"]],["Saúde, cuidado e prevenção",["saude","seguranca"]]]},
    {q:"Qual destas atividades você prefere realizar?",a:[["Criar relatórios ou apresentações",["administracao","tecnologia"]],["Receber, conferir e classificar materiais",["logistica","seguranca"]],["Explicar informações a outras pessoas",["atendimento","social"]],["Fazer inspeções e identificar falhas",["infraestrutura","seguranca"]]]},
    {q:"O que mais valoriza em uma rotina de trabalho?",a:[["Resolver desafios intelectuais diferentes",["tecnologia","administracao"]],["Ter processos e etapas bem organizados",["logistica","seguranca"]],["Trabalhar próximo de pessoas",["atendimento","saude"]],["Contribuir diretamente para a comunidade",["social","saude"]]]},
    {q:"Se pudesse participar de uma atividade prática, escolheria:",a:[["Montar uma planilha de controle",["administracao","tecnologia"]],["Planejar o estoque de um pequeno comércio",["logistica","atendimento"]],["Organizar uma atividade de acolhimento",["social","saude"]],["Examinar equipamentos e normas de segurança",["infraestrutura","seguranca"]]]},
    {q:"Por qual tema você começaria um curso gratuito hoje?",a:[["Informática, IA ou análise de dados",["tecnologia","administracao"]],["Administração, vendas ou logística",["administracao","atendimento","logistica"]],["Saúde, assistência social ou cuidado",["saude","social"]],["Manutenção, operações ou segurança",["infraestrutura","seguranca"]],["Prefiro explorar mais de uma área",[]]]}
  ];
  const quiz=document.getElementById("car-quiz");
  if(!quiz)return;
  const heading=document.getElementById("car-question");
  const sub=document.getElementById("car-help");
  const choices=document.getElementById("car-choices");
  const progress=document.getElementById("car-progress");
  const progressText=document.getElementById("car-count");
  const prev=document.getElementById("car-prev");
  const next=document.getElementById("car-next");
  const answerArray=Array(Q.length).fill(null);
  let step=0;
  function el(tag,cls,txt){const node=document.createElement(tag);if(cls)node.className=cls;if(txt!==undefined)node.textContent=txt;return node;}
  function render(){
    quiz.hidden=false;
    document.getElementById("car-results").hidden=true;
    const question=Q[step];
    heading.textContent=question.q;
    sub.textContent="Escolha a resposta mais próxima de sua preferência. Não existem respostas certas ou erradas.";
    progressText.textContent="Pergunta "+(step+1)+" de "+Q.length;
    progress.style.width=(((step+1)/Q.length)*100)+"%";
    choices.replaceChildren();
    question.a.forEach(([label],i)=>{
      const b=el("button","car-choice");b.type="button";b.setAttribute("aria-pressed",String(answerArray[step]===i));
      const n=el("span","car-choice-num",String.fromCharCode(65+i));b.append(n,el("span","",label));
      b.addEventListener("click",()=>{answerArray[step]=i;render();});
      choices.append(b);
    });
    prev.disabled=step===0;next.disabled=answerArray[step]===null;
    next.textContent=step===Q.length-1?"Ver minhas áreas sugeridas":"Próxima pergunta →";
  }
  function showResults(){
    quiz.hidden=true;
    const output=document.getElementById("car-results");
    output.hidden=false;
    const total=Object.fromEntries(Object.keys(AREAS).map(k=>[k,0]));
    for(let i=0;i<Q.length;i++){
      const a=Q[i].a[answerArray[i]];
      if(!a)continue;
      a[1].forEach((id,pos)=>{total[id]+=(pos===0?3:1);});
    }
    const ranks=Object.keys(AREAS).sort((a,b)=>total[b]-total[a]).slice(0,3);
    const hasInterest=Object.values(total).some(v=>v>0);
    const host=document.getElementById("car-result-cards");
    host.replaceChildren();
    ranks.forEach((id,i)=>{
      const area=AREAS[id];
      const card=el("article","car-result");
      card.append(el("span","car-badge",i===0?"ÁREA MAIS ALINHADA":"OUTRA POSSIBILIDADE "+(i+1)),el("h3","",area.name),el("p","",area.text));
      card.append(el("h4","","Materiais gratuitos para explorar"));
      area.courses.forEach(([name,url])=>{
        const r=el("div","car-course");const a=el("a","",name+" ↗");
        a.href=url;r.append(a);card.append(r);
      });
      host.append(card);
    });
    document.getElementById("car-result-explainer").textContent=hasInterest?
      "Essas áreas foram sugeridas pelas preferências escolhidas. Compare as três e experimente uma aula, apostila ou simulado antes de decidir.":
      "Você marcou preferências abertas. Explore as áreas sugeridas como ponto de partida; nenhum resultado é uma definição do seu perfil.";
    document.getElementById("car-employment").href="carreira-entrevistas.html";
    output.scrollIntoView({behavior:"smooth",block:"start"});
  }
  prev.addEventListener("click",()=>{if(step>0){step--;render();}});
  next.addEventListener("click",()=>{if(answerArray[step]===null)return;if(step===Q.length-1){showResults();}else{step++;render();}});
  document.getElementById("car-restart").addEventListener("click",()=>{answerArray.fill(null);step=0;render();quiz.scrollIntoView({behavior:"smooth",block:"start"});});
  render();
})();
