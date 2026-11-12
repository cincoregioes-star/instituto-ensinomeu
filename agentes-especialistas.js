/* Instituto EnsinoMeu — agentes temáticos com respostas pedagógicas fixas.
   Seis especialidades, dez tópicos por agente, três caminhos por tópico.
   Não usa API externa, não armazena nem coleta dados pessoais. */
(()=>{
"use strict";
const AGENTS=[
{id:"pedagogia",name:"Agente Pedagógico",icon:"📘",desc:"Séries, aulas, apostilas e dúvidas de aprendizagem.",topics:[
["Como escolher minha série?","Abra Educação Básica, encontre Fundamental I, Fundamental II ou Ensino Médio e selecione seu ano. Confira a programação da sua turma antes de começar.","Ver séries","planos.html"],
["Onde estão as videoaulas?","As videoaulas publicadas ficam na página principal, organizadas por disciplina e ano escolar. Algumas aulas ainda estão em preparação.","Ver videoaulas","index.html#aulas-gravadas"],
["Como encontrar as apostilas?","Na seção Material Didático, identifique a série, disciplina e trimestre antes de abrir a apostila.","Ver materiais","index.html#ebooks"],
["Por que uma aula não aparece?","O acervo é ampliado progressivamente. A ausência de uma aula não significa que foi concluída ou publicada; consulte os materiais já disponíveis.","Ver aulas publicadas","index.html#aulas-gravadas"],
["Como organizar meus estudos?","Estude períodos curtos, leia os objetivos da aula, faça anotações e pratique com questões. Revise os erros em outro momento.","Ver plano por série","planos.html"],
["Como melhorar a interpretação de texto?","Leia o enunciado com calma, identifique a ideia principal e destaque palavras-chave. Depois compare sua resposta com a explicação disponível.","Ver disciplinas","planos.html"],
["O que fazer quando não entendo Matemática?","Volte à habilidade anterior, acompanhe um exemplo resolvido e pratique questões graduais. Envie a questão exata se continuar difícil.","Ver aulas e planos","planos.html"],
["Como revisar para uma avaliação?","Priorize os temas em que errou, faça um resumo curto e refaça exercícios sem consultar a resposta imediatamente.","Ver simulados","simulados/9ano.html"],
["Como estudar Inteligência Artificial na escola?","Comece por conceitos básicos, uso responsável e exemplos reais. Verifique a informação antes de usar ferramentas automatizadas.","Estudar IA","ensino-ia.html"],
["Como pedir revisão pedagógica?","Informe série, disciplina, aula, questão e motivo da dúvida para que o conteúdo possa ser avaliado pela equipe.","Fale com o Instituto","central-atendimento.html"]
]},
{id:"gamer",name:"Tutor de Simulados Gamers",icon:"🎮",desc:"Questões, gabaritos, feedback e desempenho.",topics:[
["Como começar um simulado?","Escolha o ano e a disciplina. Leia as instruções e clique para iniciar quando estiver preparado.","Simulados 8º ano","simulados/8ano.html"],
["Onde vejo os simulados do 9º ano?","Abra a página de simulados do 9º ano para encontrar as atividades publicadas por disciplina.","Simulados 9º ano","simulados/9ano.html"],
["Como interpretar o gabarito?","Compare sua alternativa com a resposta indicada e leia a justificativa: o raciocínio é mais importante do que decorar letras.","Simulados disponíveis","simulados/9ano.html"],
["E se eu errar muitas questões?","Observe quais assuntos se repetem entre os erros e volte à aula correspondente. Errar na prática faz parte do aprendizado.","Ver aulas","index.html#aulas-gravadas"],
["Posso refazer o simulado?","Alguns simuladores oferecem botão de refazer ao final. Siga a opção disponível na própria atividade, sem presumir sincronização automática.","Ver simulados","simulados/8ano.html"],
["Meu resultado não apareceu.","Confira se concluiu todas as etapas. Se continuar ausente, informe o link, a disciplina e o que apareceu na tela.","Relatar problema","central-atendimento.html"],
["Como acompanhar meus acertos?","Consulte a tela de resultado do simulado. Alguns treinos guardam informações apenas no navegador e não no painel do aluno.","Ver área do estudante","painel.html"],
["O que é uma questão comentada?","É uma questão que explica por que uma alternativa faz sentido e as demais não. Use a explicação para revisar a habilidade.","Abrir simulados","simulados/9ano.html"],
["Como estudar antes de jogar?","Leia o resumo da aula e pratique primeiro questões simples. Retorne ao material após cada bloco de treino.","Ver apostilas","index.html#ebooks"],
["Achei um erro no simulado.","Envie a disciplina, ano, aula, número da questão, alternativa e justificativa do possível erro. Não envie dados pessoais.","Solicitar correção","central-atendimento.html"]
]},
{id:"tecnologia",name:"Agente de Tecnologia e IA",icon:"💻",desc:"Informática, inteligência artificial, dados e segurança digital.",topics:[
["Como começar a estudar informática?","Aprenda noções de arquivos, internet, edição de textos, planilhas e segurança básica antes de avançar para sistemas complexos.","Ver curso de Excel","conteudos-recuperados/excel-analise-dados/index.html"],
["Como aprender Excel?","Pratique tabelas, operações básicas, filtros e gráficos com dados fictícios; depois avance para funções de análise.","Estudar Excel","conteudos-recuperados/excel-analise-dados/index.html"],
["O que é inteligência artificial?","É uma família de técnicas computacionais que identifica padrões e produz resultados a partir de dados; suas respostas precisam de verificação humana.","Estudar IA","conteudos-recuperados/inteligencia-artificial-trabalho/index.html"],
["Como usar IA no trabalho?","A IA pode ajudar a revisar textos, organizar informações e criar rascunhos; mantenha responsabilidade, verificação e privacidade.","Ver material","conteudos-recuperados/inteligencia-artificial-trabalho/index.html"],
["O que é cibersegurança?","É a proteção de dispositivos, redes, contas e dados contra acessos indevidos, ataques e perdas.","Estudar segurança digital","conteudos-recuperados/ciberseguranca-lgpd/index.html"],
["Como proteger minhas senhas?","Use senhas diferentes, autenticação em duas etapas quando possível e não compartilhe códigos de acesso.","Ver segurança digital","conteudos-recuperados/ciberseguranca-lgpd/index.html"],
["O que é LGPD?","É a Lei Geral de Proteção de Dados Pessoais do Brasil, que estabelece regras para tratamento de dados e direitos dos titulares.","Ver material de LGPD","conteudos-recuperados/ciberseguranca-lgpd/index.html"],
["Como estudar redes e conectividade?","Comece por equipamentos, endereços de rede, tipos de conexão e testes básicos de comunicação.","Ver curso de redes","conteudos-recuperados/data-center-redes/index.html"],
["O que faz um operador de Data Center?","Monitora infraestrutura e procedimentos operacionais, seguindo padrões de segurança e continuidade de serviços.","Ver operações","conteudos-recuperados/data-center-operacao/index.html"],
["Como me preparar para uma vaga em tecnologia?","Monte portfólio de exercícios, descreva ferramentas que de fato utiliza e pratique entrevistas sem inventar experiências.","Preparar currículo","carreira-entrevistas.html"]
]},
{id:"administracao",name:"Agente de Administração e Atendimento",icon:"📋",desc:"Escritório, atendimento, vendas, planilhas e currículo.",topics:[
["O que faz um auxiliar administrativo?","Apoia organização de documentos, comunicação, agenda, controle de informações e rotinas de escritório.","Ver conteúdo","conteudos-recuperados/auxiliar-administrativo/index.html"],
["Como organizar documentos?","Classifique por assunto e data, use nomes padronizados e controle versões sem expor informações pessoais.","Estudar administração","conteudos-recuperados/auxiliar-administrativo/index.html"],
["Como atender bem uma pessoa?","Cumprimente, escute com atenção, explique com clareza e trate os dados do cliente com discrição.","Treinar atendimento","conteudos-recuperados/atendimento-vendas/index.html"],
["Como melhorar minha comunicação?","Pratique explicações curtas, escuta ativa, confirmação de entendimento e linguagem respeitosa.","Ver curso de atendimento","conteudos-recuperados/atendimento-vendas/index.html"],
["O que aprender sobre vendas?","Entenda necessidades, apresente informações verdadeiras e respeite o direito de escolha do cliente.","Estudar vendas","conteudos-recuperados/atendimento-vendas/index.html"],
["Como usar planilhas no escritório?","Crie listas, colunas, filtros, fórmulas básicas e gráficos para acompanhar informações e tarefas.","Ver Excel","conteudos-recuperados/excel-analise-dados/index.html"],
["O que são compras públicas?","São aquisições e contratações realizadas pelo poder público mediante regras legais, planejamento e fiscalização.","Ver material","conteudos-recuperados/compras-publicas/index.html"],
["Como trabalhar em equipe?","Defina responsabilidades, compartilhe informações essenciais e peça ajuda quando houver dúvidas.","Ver administração","conteudos-recuperados/auxiliar-administrativo/index.html"],
["Como montar currículo para escritório?","Destaque habilidades reais em informática, atendimento, organização, relatórios e comunicação.","Fazer currículo","carreira-entrevistas.html"],
["O que responder na entrevista?","Mostre exemplos verdadeiros de organização, atenção e relacionamento profissional. Treine sem decorar textos falsos.","Treinar entrevista","carreira-entrevistas.html"]
]},
{id:"logistica",name:"Agente de Logística e Operações",icon:"📦",desc:"Estoque, recebimento, distribuição e Data Center.",topics:[
["O que é logística?","É a organização dos fluxos de materiais, informações e operações, do recebimento à entrega.","Estudar logística","conteudos-recuperados/logistica-almoxarifado/index.html"],
["O que faz um almoxarife?","Ajuda no recebimento, armazenamento, organização, conferência e controle de materiais.","Ver almoxarifado","conteudos-recuperados/logistica-almoxarifado/index.html"],
["Como controlar o estoque?","Registre entradas, saídas, quantidade e localização dos itens. Faça conferências periódicas.","Praticar trilhas","conteudos-recuperados/logistica/index.html"],
["O que é inventário?","É a contagem e conferência física dos itens para comparar quantidades reais com os registros.","Treinar Logística","conteudos-recuperados/logistica/index.html"],
["O que é picking?","É a separação de produtos de acordo com pedidos, com atenção à identificação e às quantidades.","Treinar trilhas","conteudos-recuperados/logistica/index.html"],
["Como funciona recebimento de mercadorias?","Confira documentos, quantidades, condições e identificação dos itens segundo o procedimento da organização.","Ver curso","conteudos-recuperados/logistica-almoxarifado/index.html"],
["O que é last mile?","É a etapa final da entrega de uma encomenda ou produto ao destinatário.","Ver trilhas de logística","conteudos-recuperados/logistica/index.html"],
["Como evitar erros em armazenagem?","Use etiquetas, endereçamento, conferências, organização e procedimentos de segurança adequados.","Treinar logística","conteudos-recuperados/logistica/index.html"],
["Logística existe em Data Centers?","Sim. Inclui controle de peças, equipamentos, contratos e materiais técnicos usados na operação.","Ver Logística Data Center","conteudos-recuperados/data-center-logistica-almoxarifado/index.html"],
["Como me preparar para vaga em logística?","Destaque experiências reais com organização, contagem, prazos e atenção; pratique a entrevista.","Preparar entrevista","carreira-entrevistas.html"]
]},
{id:"social",name:"Agente de Cidadania, Cuidados e Segurança",icon:"🤝",desc:"Cidadania, assistência social, cuidado e prevenção.",topics:[
["O que é cidadania?","Envolve direitos, deveres, participação social, respeito à diversidade e convivência democrática.","Estudar cidadania","cidadania.html"],
["Como estudar direitos sociais?","Comece pelos direitos previstos em normas públicas e pelas políticas de educação, saúde e assistência social.","Ver cidadania","cidadania.html"],
["O que é SUAS?","É o Sistema Único de Assistência Social que organiza serviços e ações da política pública de assistência social no Brasil.","Ver material de SUAS","conteudos-recuperados/orientador-social-suas/index.html"],
["Qual a diferença entre CRAS e CREAS?","CRAS é referência da proteção social básica; CREAS atua na proteção social especial em situações de violação de direitos.","Estudar assistência social","conteudos-recuperados/orientador-social-suas/index.html"],
["O que faz o orientador social?","Apoia ações socioeducativas, atividades de convivência e fortalecimento de vínculos dentro das atribuições do serviço.","Ver Orientador Social","conteudos-recuperados/orientador-social-suas/index.html"],
["Como começar a estudar cuidados com idosos?","Aprenda respeito à autonomia, comunicação, prevenção de acidentes e apoio cotidiano; procedimentos de saúde exigem orientação habilitada.","Ver cuidados","conteudos-recuperados/cuidador-idosos/index.html"],
["Posso trabalhar como técnico de enfermagem só com apostila?","Não. Material de revisão não substitui formação técnica formal, requisitos legais ou registro profissional aplicável.","Ver revisão de enfermagem","conteudos-recuperados/tecnico-enfermagem/index.html"],
["O que é segurança do trabalho?","É a área que estuda prevenção de riscos, proteção de pessoas e melhoria das condições de trabalho.","Estudar prevenção","conteudos-recuperados/seguranca-do-trabalho/index.html"],
["Como prevenir acidentes no trabalho?","Observe riscos, siga procedimentos oficiais, use proteções exigidas e comunique situações inseguras ao responsável.","Ver segurança do trabalho","conteudos-recuperados/seguranca-do-trabalho/index.html"],
["Onde posso enviar uma sugestão para inclusão?","A Central de Atendimento recebe sugestões e críticas sobre acessibilidade, direitos e a experiência do usuário.","Enviar sugestão","central-atendimento.html"]
]}
];
const page=document.getElementById("agents-app");if(!page)return;
let agent=null,topic=null,mode=null;
const title=document.getElementById("agents-title"),description=document.getElementById("agents-description"),buttons=document.getElementById("agents-buttons"),back=document.getElementById("agents-back"),crumb=document.getElementById("agents-crumb");
function node(tag,cls,label){const e=document.createElement(tag);if(cls)e.className=cls;if(label!==undefined)e.textContent=label;return e;}
function add(label,fn){
 const b=node("button","car-choice");b.type="button";b.append(node("span","car-choice-num","›"),node("span","",label));
 b.addEventListener("click",fn);buttons.appendChild(b);
}
function linkButton(label,href){
 const a=node("a","car-btn gold",label+" →");a.href=href;a.style.marginTop="13px";buttons.appendChild(a);
}
function render(){
 buttons.replaceChildren();
 const answer=document.getElementById("agents-answer");answer.replaceChildren();
 answer.hidden=true;
 back.hidden=agent===null;crumb.textContent=agent===null?"Escolha um agente":topic===null?"Escolha um assunto":mode===null?"Escolha como prefere receber orientação":"Resposta guiada";
 if(agent===null){
   title.textContent="Qual agente pode ajudar você?";
   description.textContent="Escolha uma especialidade. Cada agente tem 10 assuntos com respostas verificáveis e links para estudar gratuitamente.";
   AGENTS.forEach((a,i)=>add(a.icon+" "+a.name,()=>{agent=i;render();}));
 }else if(topic===null){
   const a=AGENTS[agent];title.textContent=a.icon+" "+a.name;
   description.textContent=a.desc+" Selecione uma das 10 perguntas.";
   a.topics.forEach((t,i)=>add((i+1)+". "+t[0],()=>{topic=i;render();}));
 }else if(mode===null){
   const t=AGENTS[agent].topics[topic];title.textContent=t[0];
   description.textContent="Escolha uma forma de orientação para chegar à resposta adequada.";
   add("Quero uma explicação simples",()=>{mode=0;render();});
   add("Quero entender e abrir material para estudar",()=>{mode=1;render();});
   add("A explicação não resolveu minha dúvida",()=>{mode=2;render();});
 }else{
   const t=AGENTS[agent].topics[topic];
   title.textContent=t[0];description.textContent="Orientação educativa preparada pelo Instituto EnsinoMeu.";
   answer.hidden=false;answer.appendChild(node("h3","",mode===2?"Vamos encontrar outra forma de ajudar":"Resposta do agente"),node("p","",t[1]));
   if(mode===2)answer.appendChild(node("p","","Informe o tema e a sua dúvida específica à Central de Atendimento. Não envie documentos pessoais ou dados de outras pessoas."));
   linkButton(mode===2?"Enviar dúvida ao Instituto":t[2],mode===2?"central-atendimento.html":t[3]);
   add("Consultar outra pergunta deste agente",()=>{topic=null;mode=null;render();});
 }
}
back.addEventListener("click",()=>{if(mode!==null)mode=null;else if(topic!==null)topic=null;else agent=null;render();});
document.getElementById("agents-reset").addEventListener("click",()=>{agent=null;topic=null;mode=null;render();});
render();
})();