#!/usr/bin/env python3
"""Gera arquivos públicos do Curso 10 a partir de lições e questões revisadas."""
from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "cursos-ia" / "10-planos-de-aula-com-ia"
TEMPLATE = ROOT / "cursos-ia" / "09-ia-para-professores-iniciantes" / "index.html"
PDF_NAME = "apostila_planos_de_aula_com_ia_20h.pdf"
FONT_DIR = Path("/usr/share/fonts/truetype/dejavu")
pdfmetrics.registerFont(TTFont("DejaVu", str(FONT_DIR / "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("DejaVu-Bold", str(FONT_DIR / "DejaVuSans-Bold.ttf")))
W, H = A4
NAVY = colors.HexColor("#10243B")
GREEN = colors.HexColor("#137B73")
CYAN = colors.HexColor("#00CDB6")
PALE = colors.HexColor("#EAF6F4")
INK = colors.HexColor("#193049")
MUTED = colors.HexColor("#465C70")
GOLD = colors.HexColor("#F7C766")
MODULE_COLORS = ["#0C8C87", "#215FA7", "#7545AD", "#AA6A1B", "#147B62", "#9B4E83"]
MISSIONS = [
    {"title": "Planejamento com dados mínimos", "task": "Elabore uma ficha anônima de uma turma fictícia com recursos e pré-requisitos; crie objetivo verificável, três rotas de apoio e questão de saída.", "deliverable": "Ficha, plano de 50 minutos, evidência individual e revisão do material."},
    {"title": "Currículo validado e acesso garantido", "task": "Escolha uma habilidade consultada no documento oficial; formule três perguntas diagnósticas, uma rubrica de três critérios e rota de contingência sem internet.", "deliverable": "Fonte curricular, roteiro impresso e rubrica aplicada a resposta fictícia."},
    {"title": "Prompt testado e corrigido", "task": "Compare uma instrução genérica com um pedido completo, solicite alternativas, teste afirmações e documente duas iterações de qualidade.", "deliverable": "Prompt V1/V2/V3, rubrica de comparação e lista de fontes verificadas."},
    {"title": "Investigação de problema local", "task": "Planeje atividade com dados simulados sobre água, horta ou solo, com previsão inicial, papéis de equipe, fonte e tarefa de transferência.", "deliverable": "Sequência, ficha de investigação, resposta esperada e plano B de tempo."},
    {"title": "Instrumento inclusivo e formativo", "task": "Revisar gráfico e enunciado para acesso por diferentes meios; criar questão com três distratores plausíveis e devolutiva respeitosa.", "deliverable": "Descrição acessível, item auditado e feedback a três respostas fictícias."},
    {"title": "Portfólio de planejamento responsável", "task": "Entregue plano de 50 minutos, sequência de três encontros, auditoria por pares, ficha de autoria e relatório de piloto hipotético sem promessas de impacto.", "deliverable": "Plano final, referências, checklist de segurança e reflexão fundamentada."},
]

LESSONS = json.loads((DEST / "licoes_30.json").read_text("utf-8"))
SOURCE = json.loads((DEST / "questoes_originais.json").read_text("utf-8"))


def make_bank() -> dict:
    questions = []
    for idx, row in enumerate(SOURCE["items"]):
        assert len(row["options"]) == 4 and len(set(row["options"])) == 4, idx
        assert 0 <= row["correct"] < 4
        # Gabarito equilibrado no arquivo; na arena, ordem é embaralhada a cada início.
        desired_index = idx % 4
        rotation = (desired_index - row["correct"]) % 4
        opts = row["options"][-rotation:] + row["options"][:-rotation] if rotation else row["options"][:]
        questions.append({
            "id": idx + 1, "module": row["module"], "question": row["question"],
            "options": opts, "correct": desired_index, "explanation": row["explanation"]
        })
    assert len(questions) == 60
    assert Counter(q["module"] for q in questions) == Counter({i: 10 for i in range(1, 7)})
    assert Counter(q["correct"] for q in questions) == Counter({i: 15 for i in range(4)})
    assert len(set(q["question"] for q in questions)) == 60
    assert len(set(tuple(q["options"]) for q in questions)) == 60
    data = {"course": SOURCE["course"], "hours_planned": 20, "bank_version": SOURCE["version"],
            "editorial_method": "60 situações distintas; 6 módulos; gabarito balanceado; revisão humana obrigatória; sem certificação automática",
            "questions": questions}
    (DEST / "banco_60_questoes.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", "utf-8")
    return data


def make_html(bank: dict) -> None:
    html = TEMPLATE.read_text("utf-8")
    course_title = "Planos de Aula com Inteligência Artificial"
    html = html.replace("IA para Professores Iniciantes", course_title)
    html = html.replace("CURSO 09 · TOTALMENTE GRATUITO", "CURSO 10 · TOTALMENTE GRATUITO")
    html = html.replace("ENSINE <span class=\"accent\">COM IA</span> E RESPONSABILIDADE.",
                        "PLANEJE <span class=\"accent\">AULAS COM IA</span> E CRITÉRIO.")
    html = html.replace("Aprenda a usar IA no cotidiano escolar com mediação humana, currículo, inclusão, avaliação e proteção dos estudantes. São 60 desafios comentados e seis missões práticas.",
                        "Construa planos de aula viáveis, alinhados ao currículo e à realidade da turma. Explore 30 lições aplicadas, 60 situações-problema e seis missões práticas.")
    html = html.replace("apostila_ia_para_professores_iniciantes_20h.pdf", PDF_NAME)
    html = html.replace("ensinomeu_curso09_ia_para_professores_iniciantes_v1_20261113",
                        "ensinomeu_curso10_planos_de_aula_com_ia_v1_20261113")
    modules = [m["title"] for m in LESSONS["modules"]]
    html = re.sub(r"const MODULES=\[.*?\];", "const MODULES=" + json.dumps(modules, ensure_ascii=False, separators=(",", ":")) + ";", html, count=1)
    html = re.sub(r"const MISSIONS=\[.*?\];", "const MISSIONS=" + json.dumps([
        {"title": m["title"], "task": m["task"], "hint": m["deliverable"]} for m in MISSIONS
    ], ensure_ascii=False, separators=(",", ":")) + ";", html, count=1)
    html = re.sub(r'(<script id="quiz-data" type="application/json">).*?(</script>)',
                  lambda match: match.group(1) + json.dumps(bank, ensure_ascii=False, separators=(",", ":")) + match.group(2),
                  html, count=1, flags=re.S)
    html = html.replace("30 lições ilustradas", "30 lições ilustradas")
    html = html.replace("DOCÊNCIA + CURRÍCULO + INCLUSÃO + ÉTICA",
                        "DIAGNÓSTICO + CURRÍCULO + AVALIAÇÃO + INCLUSÃO")
    html = html.replace("práticas docentes, aprendizagem e verificação com IA",
                        "planejamento docente, aprendizagem e verificação com IA")
    html = html.replace("IA para professores iniciantes:", "planos de aula com IA:")
    html = html.replace("IA para professores iniciantes", "planos de aula com IA")
    # Não manter nome da faixa anterior na tag de descrição.
    html = re.sub(r'<meta name="description" content="[^"]+">',
        '<meta name="description" content="Curso 10 gratuito de Planos de Aula com IA: apostila PDF de 46 páginas, 30 lições autorais, 60 questões comentadas e seis missões, sem narração.">', html, count=1)
    (DEST / "index.html").write_text(html, "utf-8")
    (DEST / "LEIA-ME.txt").write_text(
        "INSTITUTO ENSINOMEU · CURSO 10 · PLANOS DE AULA COM IA\n\n"
        "Apostila: 46 páginas A4, 30 lições, 6 missões. Carga de estudo estimada: 20 horas.\n"
        "Arena: 60 itens contextualizados, quatro opções e gabarito comentado, com treino por módulo, "
        "revisão dos erros, progresso local, música e efeitos opcionais (sem narração).\n"
        "Não há emissão automática de certificado ou comprovação de horas. Verifique a BNCC e os documentos "
        "curriculares oficiais vigentes e proteja dados pessoais de estudantes.\n"
        "Entrada pública: index.html\n",
        "utf-8"
    )
    (DEST / "NOTA_TECNICA_AVALIACAO.md").write_text(
        "# Auditoria pedagógica — Curso 10\n\n"
        "- 60 questões distintas; 10 por módulo; distribuição do gabarito: 15 por letra no arquivo.\n"
        "- Cenários, alternativas plausíveis, respostas e justificativas preparados para revisão humana.\n"
        "- A ordem das alternativas é embaralhada em cada treino.\n"
        "- A arena registra progresso apenas no navegador, sem cadastro e sem narração.\n"
        "- Missões são autodeclaradas, não certificados.\n"
        "- Conteúdo curricular deve ser conferido em fonte oficial pela rede que for usar o material.\n",
        "utf-8"
    )


STYLE = {
    "small": ParagraphStyle("small", fontName="DejaVu", fontSize=8.6, leading=13, textColor=INK),
    "body": ParagraphStyle("body", fontName="DejaVu", fontSize=10.2, leading=16, textColor=INK),
    "lead": ParagraphStyle("lead", fontName="DejaVu", fontSize=11.5, leading=19, textColor=INK),
    "title": ParagraphStyle("title", fontName="DejaVu-Bold", fontSize=23, leading=32, textColor=NAVY),
    "sub": ParagraphStyle("sub", fontName="DejaVu-Bold", fontSize=13, leading=19, textColor=NAVY),
    "sub-white": ParagraphStyle("sub-white", fontName="DejaVu-Bold", fontSize=13, leading=19, textColor=colors.white),
}


def pdraw(c: Canvas, text: str, x: float, top: float, width: float, style="body") -> float:
    safe = (text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
    p = Paragraph(safe, STYLE[style])
    _, height = p.wrap(width, 900)
    p.drawOn(c, x, top - height)
    return top - height


def label(c: Canvas, txt: str, x: float, y: float, color=GREEN, size=10):
    c.setFillColor(color)
    c.setFont("DejaVu-Bold", size)
    c.drawString(x, y, txt.upper())


def base(c: Canvas, number: int, chapter: str):
    c.setFillColor(colors.white)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.rect(0, H - 34, W, 34, fill=1, stroke=0)
    c.setFont("DejaVu-Bold", 9)
    c.setFillColor(colors.white)
    c.drawString(36, H - 22, "INSTITUTO ENSINOMEU  /  CURSO 10")
    c.setFont("DejaVu", 8)
    c.drawRightString(W - 36, H - 22, "PLANEJAMENTO DOCENTE + IA")
    c.setStrokeColor(colors.HexColor("#D5E1E8"))
    c.line(36, 45, W - 36, 45)
    c.setFillColor(MUTED)
    c.setFont("DejaVu", 7.5)
    c.drawString(36, 29, "Carga planejada: 20h · Material de estudo gratuito · Sem certificação automática")
    c.drawRightString(W - 36, 29, f"{number:02d} / 46")


def banner(c: Canvas, y: float, text: str, bg=PALE, text_color=INK, maxheight=70):
    x, width = 40, W - 80
    para = Paragraph(text.replace("&", "&amp;"), STYLE["body"])
    _, ht = para.wrap(width - 28, 200)
    boxheight = min(maxheight, ht + 22)
    c.setFillColor(bg)
    c.roundRect(x, y - boxheight, width, boxheight, 10, fill=1, stroke=0)
    para.drawOn(c, x + 14, y - 10 - ht)
    return y - boxheight - 13


def cover(c: Canvas):
    c.setFillColor(NAVY)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    for i in range(8):
        c.setStrokeColor(colors.HexColor("#295D70"))
        c.setLineWidth(1.5)
        c.circle(W * .82, H * .42, 60 + i * 26, stroke=1, fill=0)
    c.setFillColor(CYAN)
    c.roundRect(42, H - 115, 252, 27, 12, fill=1, stroke=0)
    label(c, "CURSO 10 · FORMAÇÃO GRATUITA", 57, H - 107, NAVY, 10)
    c.setFillColor(colors.white)
    c.setFont("DejaVu-Bold", 37)
    for n, s in enumerate(["PLANOS", "DE AULA", "COM IA"]):
        c.drawString(42, H - 235 - n * 56, s)
    c.setFillColor(GOLD)
    c.setFont("DejaVu", 14)
    c.drawString(44, H - 435, "Planejar, verificar, adaptar e avaliar")
    for i, (a, b) in enumerate([("30", "lições aplicadas"), ("60", "questões comentadas"), ("06", "missões autorais")]):
        x = 43 + i * 178
        c.setFillColor(colors.HexColor("#1B3B56"))
        c.roundRect(x, 170, 162, 99, 12, fill=1, stroke=0)
        c.setFillColor(CYAN)
        c.setFont("DejaVu-Bold", 29)
        c.drawString(x + 13, 220, a)
        c.setFillColor(colors.white)
        c.setFont("DejaVu", 9.3)
        c.drawString(x + 13, 196, b)
    c.setFillColor(colors.white)
    c.setFont("DejaVu", 10)
    c.drawString(44, 80, "20 horas de estudo planejadas · Apostila A4 ilustrada · 2026")
    c.drawString(44, 58, "Coordenação editorial: Prof. Carlos Tavares")
    c.showPage()


def introduction(c: Canvas, page: int, title: str, blocks: list[tuple[str, str]]):
    base(c, page, title)
    y = H - 90
    y = pdraw(c, title, 40, y, W - 80, "title") - 22
    for heading, body in blocks:
        label(c, heading, 43, y, GREEN, 10)
        y -= 16
        y = pdraw(c, body, 43, y, W - 86, "lead") - 26
    c.showPage()


def module_intro(c: Canvas, page: int, module_index: int, module: dict):
    base(c, page, "Módulo")
    col = colors.HexColor(MODULE_COLORS[module_index])
    c.setFillColor(col)
    c.roundRect(42, 650, W - 84, 98, 17, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("DejaVu-Bold", 44)
    c.drawString(66, 682, f"{module_index + 1:02d}")
    label(c, "MÓDULO DE APRENDIZAGEM", 146, 713, colors.white, 11)
    pdraw(c, module["title"], 145, 700, W - 215, "sub-white")
    pdraw(c, module["subtitle"], 44, 610, W - 88, "lead")
    y = 548
    label(c, "Cinco lições, uma missão e uma evidência", 43, y, col, 11)
    y -= 27
    for j, lesson in enumerate(module["lessons"]):
        c.setFillColor(PALE)
        c.roundRect(43, y - 45, W - 86, 49, 8, fill=1, stroke=0)
        c.setFillColor(col)
        c.setFont("DejaVu-Bold", 14)
        c.drawString(56, y - 27, f"{module_index * 5 + j + 1:02d}")
        pdraw(c, lesson["title"], 91, y - 7, W - 165, "body")
        y -= 68
    label(c, "Ritmo sugerido: 5 × 33 min + missão de 35 min = 3h20", 43, 122, col, 8)
    c.showPage()


def lesson_page(c: Canvas, page: int, module_index: int, lesson_index: int, lesson: dict):
    base(c, page, "Lição")
    col = colors.HexColor(MODULE_COLORS[module_index])
    label(c, f"MÓDULO {module_index + 1:02d} / LIÇÃO {module_index * 5 + lesson_index + 1:02d}", 42, H - 67, col, 9)
    top = pdraw(c, lesson["title"], 40, H - 80, W - 80, "title") - 14
    top = banner(c, top, f"<b>OBJETIVO VERIFICÁVEL</b><br/>{lesson['goal']}") - 2
    for name, field in [
        ("SITUAÇÃO DE SALA DE AULA", "case"),
        ("PROCEDIMENTO ORIENTADO", "steps"),
        ("COMANDO DE IA PARA TESTAR", "prompt"),
        ("CRITÉRIO DE QUALIDADE", "check"),
        ("DESAFIO PRÁTICO", "challenge"),
    ]:
        label(c, name, 42, top, col, 9)
        top -= 13
        if field == "prompt":
            top = banner(c, top, lesson[field], colors.HexColor("#EDF3FF"), maxheight=108)
        else:
            top = pdraw(c, lesson[field], 44, top, W - 88, "body") - 19
    if top < 105:
        raise ValueError(f"Conteúdo cortado na lição {module_index * 5 + lesson_index + 1} (y={top:.1f})")
    c.setStrokeColor(colors.HexColor("#B8CDD6"))
    for i in range(2):
        c.line(43, max(74, top - 16 - i * 20), W - 43, max(74, top - 16 - i * 20))
    c.showPage()


def mission_page(c: Canvas, page: int, index: int, mission: dict):
    base(c, page, "Missão")
    col = colors.HexColor(MODULE_COLORS[index])
    label(c, f"MISSÃO {index + 1:02d} · 35 MINUTOS", 43, H - 72, col, 10)
    y = pdraw(c, mission["title"], 42, H - 91, W - 84, "title") - 20
    y = banner(c, y, mission["task"], PALE, maxheight=125) - 10
    label(c, "ENTREGA ESPERADA", 43, y, col)
    y = pdraw(c, mission["deliverable"], 43, y - 15, W - 86, "lead") - 24
    label(c, "RUBRICA DE AUTOAVALIAÇÃO (0 A 2 POR CRITÉRIO)", 43, y, col, 9)
    y -= 28
    for n, txt in enumerate([
        "Objetivo e evidências alinhados", "Recursos e duração viáveis",
        "Acessibilidade e alternativas", "Verificação de dados, fontes e autoria",
        "Revisão crítica da sugestão da IA",
    ]):
        c.setFillColor(colors.HexColor("#EDF5F8") if n % 2 == 0 else colors.white)
        c.rect(42, y - 35, W - 84, 36, fill=1, stroke=0)
        pdraw(c, f"{n+1}. {txt}", 52, y - 7, 425, "body")
        c.setFillColor(MUTED)
        c.setFont("DejaVu-Bold", 8)
        c.drawRightString(W - 54, y - 20, "0   1   2")
        y -= 45
    label(c, "ANOTAÇÕES DE REVISÃO E PRÓXIMA AÇÃO", 43, y - 12, col, 9)
    for n in range(3):
        c.setStrokeColor(colors.HexColor("#B9CFD8"))
        c.line(43, y - 45 - n * 29, W - 43, y - 45 - n * 29)
    c.showPage()


def make_pdf():
    c = Canvas(str(DEST / PDF_NAME), pagesize=A4, pageCompression=1,
               invariant=1, title="Curso 10 - Planos de Aula com IA | Instituto EnsinoMeu",
               author="Instituto EnsinoMeu - Prof. Carlos Tavares")
    cover(c)
    introduction(c, 2, "Carta ao educador", [
        ("Propósito", "Este curso transforma respostas de IA em decisões pedagógicas verificáveis. A ferramenta sugere; o professor seleciona, adapta, comprova fontes e considera a realidade da turma."),
        ("O que você vai construir", "Trinta pequenas produções, seis missões avaliáveis com rubrica e um plano final de 50 minutos. Trabalhe com cenários fictícios ou dados da turma previamente anonimizados conforme as regras da instituição."),
        ("O que este material não promete", "As 20 horas são percurso sugerido; não há frequência registrada ou certificado automático. A apostila não substitui formação docente, documentos curriculares oficiais ou atendimento especializado."),
        ("Ética e cuidado", "Não informe nomes, fotografias, laudos, notas individualizadas ou informações que identifiquem estudantes a serviços externos sem base adequada. Verifique licenças, qualidade e acessibilidade do que for divulgar.")
    ])
    introduction(c, 3, "Como estudar e testar", [
        ("Roteiro de 20 horas", "Cada módulo tem cinco lições com 33 minutos sugeridos (leitura, teste e revisão) e uma missão de 35 minutos. Seis módulos somam 1.200 minutos, equivalentes a 20 horas planejadas."),
        ("Três registros essenciais", "Guarde o prompt usado, o que a IA sugeriu e sua revisão fundamentada. Anote o que estava incorreto, inadequado para a turma ou dependente de tecnologia indisponível."),
        ("Prática com segurança", "Use dados didáticos fictícios, confirme códigos e redações curriculares nos documentos oficiais e faça os cálculos de forma independente antes de aplicá-los."),
        ("Arena e missões", "O simulado contém 60 situações contextualizadas, dez por módulo, com comentários. O desempenho é salvo neste navegador. As missões são autodeclaradas e exigem revisão por pessoa responsável para qualquer comprovação formal.")
    ])
    page = 4
    for i, module in enumerate(LESSONS["modules"]):
        module_intro(c, page, i, module)
        page += 1
        for j, lesson in enumerate(module["lessons"]):
            lesson_page(c, page, i, j, lesson)
            page += 1
        mission_page(c, page, i, MISSIONS[i])
        page += 1
    assert page == 46, page
    introduction(c, 46, "Fontes e conferência final", [
        ("Currículo", "Para código, redação e etapa, consulte a Base Nacional Comum Curricular no portal oficial do Ministério da Educação e o currículo vigente de sua rede. A IA não constitui fonte primária para validar uma habilidade."),
        ("Proteção de dados", "Consulte a Lei 13.709/2018 (LGPD), orientações da ANPD e as regras de sua rede. Atividades de planejamento pedagógico não justificam expor dados identificáveis de estudantes sem avaliação de finalidade e proteção."),
        ("Acessibilidade", "Consulte orientações de acessibilidade na educação, critérios WCAG do W3C para recursos digitais e necessidades reais dos participantes. Alternativas textuais, contraste e apoio de leitura requerem testes, não apenas promessa da IA."),
        ("Checklist antes da aula", "Verifique: objetivo observável; documento curricular; duração; materiais; tarefa offline; acesso; evidência; gabarito; fontes; licenças; dados pessoais; revisão humana. Registre a versão final e o que mudou.")
    ])
    c.save()
    print("PDF gerado: 46 páginas A4")


if __name__ == "__main__":
    assert len(LESSONS["modules"]) == 6 and all(len(m["lessons"]) == 5 for m in LESSONS["modules"])
    bank = make_bank()
    make_html(bank)
    make_pdf()
    print("Arena gerada: 60 questões, 15 gabaritos por letra, 6 missões")
