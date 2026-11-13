#!/usr/bin/env python3
"""Geração reprodutível do Curso 13: apostila, banco e arena sem narração."""
import json
import re
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen.canvas import Canvas

import conteudo_curso13 as content
import gerar_curso12 as previous

core = previous.core
ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "cursos-ia" / "13-ia-para-pequenos-negocios-e-empreendedores"
PDF_NAME = "apostila_ia_pequenos_negocios_empreendedores_20h.pdf"
TITLE = "Inteligência Artificial para Pequenos Negócios e Empreendedores"
MISSIONS = [
    {"title": "Mapa de oportunidade local", "task": "Escolha um serviço ou produto simples, descreva um problema concreto, três públicos por situação e cinco hipóteses verificáveis, sem assumir demanda inexistente.", "hint": "Mapa problema–cliente–evidência, perguntas de escuta e teste de baixo risco."},
    {"title": "Protótipo de oferta transparente", "task": "Entreviste perfis fictícios sem perguntas tendenciosas; desenhe dois pacotes com escopo e limites; estabeleça indicadores antes do piloto.", "hint": "Questionário neutro, quadro de pacotes, limites de entrega e critérios de decisão."},
    {"title": "Campanha responsável de divulgação", "task": "Planeje sete posts variados com propostas reais, imagens fiéis e links a verificar; revise promessas, urgência e acessibilidade.", "hint": "Calendário, três textos, dois briefings visuais, checklist de alegações e teste de link."},
    {"title": "Atendimento e pedidos rastreáveis", "task": "Monte FAQ para pequeno serviço com dados confirmados e saída para atendimento humano. Organize dez pedidos fictícios por etapa e prazo.", "hint": "Fluxograma, respostas aprovadas, planilha com estados e protocolo de reclamação."},
    {"title": "Laboratório de custos e capacidade", "task": "Com dados fictícios, classifique seis custos, calcule sobra por unidade, capacidade de produção e três cenários sem promessa de retorno.", "hint": "Tabela de cálculo conferido, premissas, unidades, capacidade e limites da projeção."},
    {"title": "Plano de piloto e portfólio", "task": "Projete quatro semanas de teste reversível, com coleta mínima, comunicação honesta e indicadores de operação. Documente correções e próximos passos.", "hint": "Plano de trinta dias, ficha de privacidade, painel fictício e portfólio auditável."},
]


def setup():
    DEST.mkdir(parents=True, exist_ok=True)
    for m in MISSIONS:
        m["deliverable"] = m["hint"]
    lessons = {"course": TITLE, "hours_planned": 20,
               "method": "30 lições de 33 minutos e 6 missões de 35 minutos, sem certificação automática",
               "modules": content.MODULES}
    source = {"course": TITLE, "version": "2026-11-13-curso13-v1", "items": content.QUESTIONS}
    (DEST / "licoes_30.json").write_text(json.dumps(lessons, ensure_ascii=False, indent=2) + "\n", "utf-8")
    (DEST / "questoes_originais.json").write_text(json.dumps(source, ensure_ascii=False, indent=2) + "\n", "utf-8")
    core.DEST = DEST
    core.PDF_NAME = PDF_NAME
    core.COURSE_NO = 13
    core.COVER_LINES = ["IA PARA", "PEQUENOS", "NEGÓCIOS"]
    core.COVER_TAG = "CURSO 13 · FORMAÇÃO GRATUITA"
    core.COVER_SUBTITLE = "Pesquisar, testar, atender e melhorar"
    core.HEADER_TAG = "EMPREENDEDORISMO COM IA"
    core.LESSONS = lessons
    core.SOURCE = source
    core.MISSIONS = MISSIONS
    previous.core11.FLOW_STEPS = [
        ("PROBLEMA", "PÚBLICO", "TESTE"),
        ("ESCUTA", "OFERTA", "VALIDAÇÃO"),
        ("MENSAGEM", "PROVA", "ACESSO"),
        ("ATENDIMENTO", "PEDIDO", "RETORNO"),
        ("CUSTO", "CAPACIDADE", "CENÁRIO"),
        ("PILOTO", "EVIDÊNCIA", "REVISÃO"),
    ]


def make_html(bank):
    html = (ROOT / "cursos-ia" / "12-videoaulas-slides-audios-com-ia" / "index.html").read_text("utf-8")
    html = html.replace("Criação de Videoaulas, Slides e Áudios com Inteligência Artificial", TITLE)
    html = html.replace("CURSO 12 · TOTALMENTE GRATUITO", "CURSO 13 · TOTALMENTE GRATUITO")
    html = html.replace('PRODUZA <span class="accent">VIDEOAULAS COM IA</span> PROFISSIONAIS.',
                        'DESENVOLVA <span class="accent">SEU NEGÓCIO COM IA</span> E CRITÉRIO.')
    html = html.replace(
        "Aprenda a produzir videoaulas com roteiro, 40 slides, narração em português, legendas e testes de qualidade. São 30 lições, 60 casos comentados e seis missões práticas.",
        "Aprenda a pesquisar necessidades, testar ofertas, comunicar serviços, atender clientes e analisar custos sem promessas de renda. São 30 lições, 60 casos comentados e seis missões práticas.")
    html = html.replace("ROTEIRO + SLIDES + NARRAÇÃO + REVISÃO",
                        "PESQUISA + OFERTA + ATENDIMENTO + RESULTADOS")
    html = html.replace("roteiro, produção audiovisual e inclusão com IA",
                        "negócios locais, comunicação responsável e evidências com IA")
    html = html.replace("ensinomeu_curso12_videoaulas_slides_audios_v1_20261113",
                        "ensinomeu_curso13_pequenos_negocios_v1_20261113")
    html = html.replace("apostila_videoaulas_slides_audios_com_ia_20h.pdf", PDF_NAME)
    html = re.sub(r'(<meta name="description" content=")[^"]+("\s*/?>)',
                  r'\g<1>Curso 13 gratuito: IA para Pequenos Negócios e Empreendedores. Apostila ilustrada A4 de 46 páginas, 30 lições, 60 questões contextualizadas e seis missões.\2',
                  html, count=1)
    html = re.sub(r'const MODULES=\[.*?\];',
                  'const MODULES=' + json.dumps([m["title"] for m in content.MODULES], ensure_ascii=False, separators=(",", ":")) + ';',
                  html, count=1)
    html = re.sub(r'const MISSIONS=\[.*?\];',
                  'const MISSIONS=' + json.dumps(MISSIONS, ensure_ascii=False, separators=(",", ":")) + ';', html, count=1)
    html = re.sub(r'(<script id="quiz-data" type="application/json">).*?(</script>)',
                  lambda m: m.group(1) + json.dumps(bank, ensure_ascii=False, separators=(",", ":")) + m.group(2),
                  html, count=1, flags=re.S)
    (DEST / "index.html").write_text(html, "utf-8")
    (DEST / "LEIA-ME.txt").write_text(
        "INSTITUTO ENSINOMEU · CURSO 13 · IA PARA PEQUENOS NEGÓCIOS E EMPREENDEDORES\n\n"
        "Apostila ilustrada A4: 46 páginas, 30 lições, 6 missões. Carga de estudo planejada: 20 horas.\n"
        "Arena gamer: 60 questões contextualizadas com explicações, seis níveis e progresso local.\n"
        "Sem narração de perguntas, sem assinatura e sem certificado automático.\n"
        "O curso oferece aprendizagem, não garante retorno financeiro ou abertura de negócio.\n"
        "Verifique fontes, custos, direitos, publicidade e privacidade com responsáveis.\n"
        "Entrada pública: index.html\n", "utf-8")
    (DEST / "NOTA_TECNICA_AVALIACAO.md").write_text(
        "# Curso 13 — Registro de produção\n\n"
        "30 lições originais, diagramas vetoriais, 6 missões autorais e 60 situações-problema.\n"
        "Gabarito técnico: dez itens por módulo, 15 respostas por letra antes do embaralhamento.\n"
        "Questões apresentam situações hipotéticas, quatro opções distintas e explicação específica.\n"
        "Não há recomendação financeira individual, garantia de renda ou certificado automático.\n", "utf-8")


def make_pdf():
    c = Canvas(str(DEST / PDF_NAME), pagesize=A4, pageCompression=1, invariant=1,
               title="Curso 13 - IA para Pequenos Negócios e Empreendedores | Instituto EnsinoMeu",
               author="Instituto EnsinoMeu - Prof. Carlos Tavares")
    core.cover(c)
    core.introduction(c, 2, "Carta ao empreendedor", [
        ("Uma ferramenta, não uma promessa", "A IA pode ajudar a escrever, organizar, comparar e calcular. Ela não conhece automaticamente clientes, demanda, capacidade de entrega nem condições de mercado. Decisões concretas dependem de evidências e responsabilidade humana."),
        ("Aprender com baixo risco", "Este curso ensina a observar problemas, testar ofertas pequenas, criar comunicação honesta, organizar atendimentos e conferir cálculos de custos e capacidade sem depender de assinaturas de ferramentas."),
        ("O que será entregue", "São trinta lições, seis missões e sessenta situações comentadas. O portfólio final reúne hipóteses, entrevista, oferta, campanha, fluxo de atendimento, cenário fictício e relatório de piloto."),
        ("Ética e limites", "Não invente preços de concorrentes, depoimentos, renda futura ou demanda. Proteja dados pessoais e confirme informações operacionais e normas aplicáveis antes de comunicar decisões ao público.")
    ])
    core.introduction(c, 3, "Roteiro de estudo e aplicação", [
        ("Percurso de 20 horas", "Em cada módulo, estude cinco lições de 33 minutos e desenvolva uma missão de 35 minutos. O total planejado é de 1.200 minutos, sem comprovação de presença ou certificação automática."),
        ("Ciclo profissional", "Observe problema, faça pergunta neutra, construa oferta limitada, teste comunicação, organize atendimento, confira custos e resultados e atualize o plano com evidências."),
        ("Exercícios sem exposição", "Use casos fictícios na apostila e na arena. Não cole listas de clientes, CPF, endereços, documentos ou informações sensíveis em IA externa para testar prompts."),
        ("Transparência", "Vendas futuras não são garantidas por acertar simulados. A utilidade do curso depende de aplicação crítica, contexto real e acompanhamento dos próprios resultados.")
    ])
    page = 4
    for i, module in enumerate(content.MODULES):
        core.module_intro(c, page, i, module)
        page += 1
        for j, lesson in enumerate(module["lessons"]):
            previous.core11.illustrated_lesson_page(c, page, i, j, lesson)
            page += 1
        core.mission_page(c, page, i, MISSIONS[i])
        page += 1
    assert page == 46
    core.introduction(c, 46, "Fontes e auditoria final", [
        ("Pesquisa", "Confirme informações sobre estabelecimentos, serviços e preços em fontes reais e datadas. Uma resposta gerada por IA não constitui observação de mercado nem depoimento autêntico."),
        ("Dados", "Para atividades com informações pessoais, consulte orientações oficiais e regras aplicáveis. Use dados fictícios no teste e minimize a coleta conforme a finalidade do atendimento."),
        ("Cálculos", "Mantenha unidades e períodos comparáveis. Confira somas, margens, custos e capacidade independentemente. Cenários do curso são didáticos, não aconselhamento financeiro individual."),
        ("Antes de publicar", "Oferta comprovável, imagens fiéis, links abertos, respostas aprovadas, prazos revisados, fontes registradas, dados protegidos, indicadores reproduzíveis, versões e correções documentadas.")
    ])
    c.save()
    print("PDF do Curso 13: 46 páginas A4")


if __name__ == "__main__":
    setup()
    assert len(content.MODULES) == 6
    assert all(len(m["lessons"]) == 5 for m in content.MODULES)
    assert len(content.QUESTIONS) == 60
    bank = core.make_bank()
    make_html(bank)
    make_pdf()
    print("Simulado do Curso 13: 60 questões, 6 módulos e 6 missões")
