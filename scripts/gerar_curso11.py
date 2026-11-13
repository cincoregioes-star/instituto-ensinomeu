#!/usr/bin/env python3
"""Publica os artefatos do Curso 11 a partir do conteúdo editorial autoral."""
import json
import re
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen.canvas import Canvas
import gerar_curso10 as core

DEST = core.ROOT / "cursos-ia" / "11-avaliacoes-e-simulados-com-ia"
PDF_NAME = "apostila_avaliacoes_e_simulados_com_ia_20h.pdf"
TITLE = "Criação de Avaliações e Simulados com Inteligência Artificial"
core.DEST = DEST
core.PDF_NAME = PDF_NAME
core.COURSE_NO = 11
core.COVER_LINES = ["AVALIAÇÕES", "E SIMULADOS", "COM IA"]
core.COVER_TAG = "CURSO 11 · FORMAÇÃO GRATUITA"
core.COVER_SUBTITLE = "Projetar, testar, corrigir e acompanhar"
core.LESSONS = json.loads((DEST / "licoes_30.json").read_text("utf-8"))
core.SOURCE = json.loads((DEST / "questoes_originais.json").read_text("utf-8"))
core.MISSIONS = [
    {"title":"Diagnóstico com matriz clara",
     "task":"Monte um microinstrumento com objetivo, matriz de especificações, quatro itens progressivos e plano de retomada baseado em erros fictícios.",
     "deliverable":"Objetivos, matriz, questões, soluções e duas decisões pedagógicas justificadas."},
    {"title":"Oficina de distratores profissionais",
     "task":"Escreva seis itens contextualizados com quatro alternativas plausíveis, uma resposta única e mapa de erros para cada distrator; passe por revisão de ambiguidade.",
     "deliverable":"Seis enunciados, gabaritos, justificativas e notas de correção por opção."},
    {"title":"Banco auditado e comentado",
     "task":"Organize dez itens por habilidade, confira soluções sem ajuda do modelo, revise comentários e registre versão e distribuição dos gabaritos.",
     "deliverable":"Banco de dez questões com matriz, três níveis de rubrica e changelog."},
    {"title":"Protótipo gamer acessível",
     "task":"Desenhe telas de quiz, resposta, feedback e resultado em celular e desktop, com foco visível, som opcional e retomada de progresso.",
     "deliverable":"Wireframes, fluxo de navegação e relatório de testes em três larguras."},
    {"title":"Painel de resultados honestos",
     "task":"Analise dados fictícios de dois grupos, com percentuais por habilidade, tamanho da amostra, itens discrepantes e proposta de intervenção.",
     "deliverable":"Tabela agregada, limitações, mensagens de devolutiva e item novo de verificação."},
    {"title":"Projeto integrador de avaliação",
     "task":"Entregue micro-simulado com dez itens, matriz, gabaritos independentes, feedback dos distratores, acessibilidade, ficha de fontes e revisão humana.",
     "deliverable":"Portfólio final com material, checklist editorial e plano de correção de versões."},
]


def make_html(bank):
    html = (core.ROOT / "cursos-ia" / "10-planos-de-aula-com-ia" / "index.html").read_text("utf-8")
    html = html.replace("Planos de Aula com Inteligência Artificial", TITLE)
    html = html.replace("CURSO 10 · TOTALMENTE GRATUITO", "CURSO 11 · TOTALMENTE GRATUITO")
    html = html.replace("PLANEJE <span class=\"accent\">AULAS COM IA</span> E CRITÉRIO.",
                        "CRIE <span class=\"accent\">SIMULADOS COM IA</span> DE VERDADE.")
    html = html.replace(
        "Construa planos de aula viáveis, alinhados ao currículo e à realidade da turma. Explore 30 lições aplicadas, 60 situações-problema e seis missões práticas.",
        "Desenvolva avaliações válidas, simulados gamers acessíveis e gabaritos verificáveis. São 30 lições aplicadas, 60 casos comentados e seis missões práticas.")
    html = html.replace(
        "DIAGNÓSTICO + CURRÍCULO + AVALIAÇÃO + INCLUSÃO",
        "MATRIZ + QUESTÕES + GABARITO + ACESSIBILIDADE")
    html = html.replace(
        "planejamento docente, aprendizagem e verificação com IA",
        "construção de avaliações, feedback e análise com IA")
    html = html.replace("ensinomeu_curso10_planos_de_aula_com_ia_v1_20261113",
                        "ensinomeu_curso11_avaliacoes_e_simulados_v1_20261113")
    html = html.replace("apostila_planos_de_aula_com_ia_20h.pdf", PDF_NAME)
    html = re.sub(r'(<meta name="description" content=")[^"]+(">)',
                  r'\g<1>Curso 11 gratuito: Criação de Avaliações e Simulados com IA. Apostila A4 de 46 páginas, 30 lições, 60 questões, seis missões e arena gamer sem narração.\2',
                  html, count=1)
    modules = [m["title"] for m in core.LESSONS["modules"]]
    html = re.sub(r'const MODULES=\[.*?\];',
                  'const MODULES=' + json.dumps(modules, ensure_ascii=False, separators=(",", ":")) + ';', html, count=1)
    html = re.sub(r'const MISSIONS=\[.*?\];',
                  'const MISSIONS=' + json.dumps(core.MISSIONS, ensure_ascii=False, separators=(",", ":")) + ';', html, count=1)
    html = re.sub(r'(<script id="quiz-data" type="application/json">).*?(</script>)',
                  lambda m: m.group(1) + json.dumps(bank, ensure_ascii=False, separators=(",", ":")) + m.group(2),
                  html, count=1, flags=re.S)
    (DEST / "index.html").write_text(html, "utf-8")
    (DEST / "LEIA-ME.txt").write_text(
        "INSTITUTO ENSINOMEU · CURSO 11 · CRIAÇÃO DE AVALIAÇÕES E SIMULADOS COM IA\n\n"
        "Conteúdo: 30 lições, 6 missões, PDF ilustrado A4 de 46 páginas e 60 questões comentadas.\n"
        "Percurso de estudo estimado: 20 horas, sem certificado ou comprovação automática.\n"
        "A arena disponibiliza treino por módulo, resultado por habilidade, revisão de erros,\n"
        "progresso salvo somente no navegador e música/efeitos opcionais, sem narração.\n"
        "Orientação: verificar fontes, gabaritos, documentos curriculares e proteção de dados.\n"
        "Entrada pública: index.html\n", "utf-8")
    (DEST / "NOTA_TECNICA_AVALIACAO.md").write_text(
        "# Curso 11 — Registro de produção e critérios de revisão\n\n"
        "60 situações-problema autorais, dez por módulo e 15 respostas por letra no arquivo.\n"
        "O app embaralha as alternativas ao iniciar, mantém feedback e permite revisão de erros.\n"
        "O material não representa avaliação oficial nem certificado automático.\n"
        "Validar matriz, clareza, plausibilidade, gabaritos e acessibilidade no contexto da escola.\n", "utf-8")


def make_pdf():
    c = Canvas(str(DEST / PDF_NAME), pagesize=A4, pageCompression=1, invariant=1,
               title="Curso 11 - Avaliações e Simulados com IA | Instituto EnsinoMeu",
               author="Instituto EnsinoMeu - Prof. Carlos Tavares")
    core.cover(c)
    core.introduction(c, 2, "Carta ao educador", [
        ("Por que avaliar", "Um instrumento de qualidade revela o raciocínio do estudante e ajuda o professor a decidir o que ensinar. A IA pode sugerir enunciados, mas a validade de cada questão depende de objetivos, soluções e revisão humana."),
        ("O que você vai produzir", "Trinta pequenas entregas autorais, seis missões com critérios e um micro-simulado de dez questões no portfólio final. Cada item deve ter uma resposta justificável e distratores associados a erros plausíveis."),
        ("Qualidade e honestidade", "Cores e gamificação tornam a experiência interessante, mas não substituem matriz de especificações, acessibilidade, gabaritos corretos ou dados de aprendizagem. Não prometa aprovação nem certificado automático."),
        ("Proteção", "Use cenários fictícios ou dados agregados. Evite incluir identificadores, laudos, fotografias ou notas de estudantes em ferramentas externas sem avaliação institucional adequada.")
    ])
    core.introduction(c, 3, "Roteiro de 20 horas", [
        ("Tempo de estudo", "Em cada um dos seis módulos, faça cinco lições de 33 minutos e uma missão de 35 minutos. O percurso planejado soma 1.200 minutos, equivalentes a 20 horas de estudo autônomo."),
        ("Método de trabalho", "Defina o objetivo antes de pedir à IA. Produza enunciado e alternativas, resolva o item sem consultar o gabarito, teste respostas concorrentes e revise cada comentário antes de publicar."),
        ("Três camadas de verificação", "Primeira: alinhamento à matriz e ao currículo oficial. Segunda: cálculo, fontes, unicidade e distratores. Terceira: acessibilidade, interação no celular, retomada e resultados."),
        ("Arena e missões", "O simulado digital traz 60 questões comentadas, dez por módulo. Missões são autodeclaradas; progresso no navegador não equivale a avaliação formal nem comprovação de carga horária.")
    ])
    page = 4
    for i, module in enumerate(core.LESSONS["modules"]):
        core.module_intro(c, page, i, module)
        page += 1
        for j, lesson in enumerate(module["lessons"]):
            core.lesson_page(c, page, i, j, lesson)
            page += 1
        core.mission_page(c, page, i, core.MISSIONS[i])
        page += 1
    assert page == 46
    core.introduction(c, 46, "Fontes e auditoria final", [
        ("Currículo", "Confirme habilidades em documentos oficiais da BNCC e do currículo vigente da rede de ensino. Códigos produzidos pela IA são hipóteses a verificar, jamais evidência documental."),
        ("Acessibilidade", "Consulte critérios WCAG do W3C e orientações pedagógicas pertinentes. Verifique contraste, foco de teclado, descrição de gráficos, fonte legível e alternativas ao som. Testes reais continuam necessários."),
        ("Dados e privacidade", "Consulte a Lei nº 13.709/2018 (LGPD), orientações da ANPD e normas institucionais. Não exponha notas individualizadas e informações pessoais em relatórios públicos."),
        ("Checklist de publicação", "Matriz alinhada; 60 questões distintas; gabaritos resolvidos; distratores plausíveis; fonte verificada; alternativas acessíveis; comentários úteis; teste mobile; revisão por pares; registro de versões; resultados sem promessa não medida.")
    ])
    c.save()
    print("PDF do Curso 11: 46 páginas A4")


if __name__ == "__main__":
    assert len(core.LESSONS["modules"]) == 6
    assert all(len(m["lessons"]) == 5 for m in core.LESSONS["modules"])
    bank = core.make_bank()
    make_html(bank)
    make_pdf()
    print("Simulado do Curso 11: 60 questões, 6 módulos e 6 missões")
