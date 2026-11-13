#!/usr/bin/env python3
"""Gera PDF A4, banco auditável e arena gamer do Curso 12 do Instituto EnsinoMeu."""
import json
import re
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen.canvas import Canvas

import conteudo_curso12 as content
import gerar_curso11 as core11

core = core11.core
ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "cursos-ia" / "12-videoaulas-slides-audios-com-ia"
PDF_NAME = "apostila_videoaulas_slides_audios_com_ia_20h.pdf"
TITLE = "Criação de Videoaulas, Slides e Áudios com Inteligência Artificial"
MISSIONS = [
    {"title": "Roteiro pedagógico de dez minutos", "task": "Defina objetivo observável, selecione um problema real e crie storyboard de quarenta cenas com frase-chave, evidência e tempo estimado.", "hint": "Mapa de cenas, roteiro revisado, estimativa com amostra de leitura e pergunta de transferência."},
    {"title": "Laboratório de design de slides", "task": "Produza seis slides acessíveis sobre um tema científico ou histórico, com escala fiel, títulos legíveis, imagens coerentes e zonas seguras.", "hint": "Seis layouts, tabela de revisão de fontes, contraste e análise de cortes na proporção 16:9."},
    {"title": "Áudio narrado e sincronizado", "task": "Crie trecho de locução em português brasileiro com nomes e números testados, marque as entradas de oito cenas e revise legendas.", "hint": "Texto para voz, amostra ou roteiro, mapa de tempos e legenda SRT conferida."},
    {"title": "Auditoria de autoria e inclusão", "task": "Verifique licenças, representações, direitos de imagem, transcrição e alternativa de baixo consumo para material audiovisual fictício.", "hint": "Checklist de direitos e acessibilidade, com correções justificadas e plano offline."},
    {"title": "Exportação com controle de qualidade", "task": "Compare dois perfis de exportação em demonstração curta, examine quadros críticos, áudio, legenda, tamanho e reprodução móvel.", "hint": "Tabela técnica, defeitos identificados, ações e evidência de reteste."},
    {"title": "Publicação e portfólio final", "task": "Monte a entrega de uma videoaula de dez minutos com roteiro, storyboard, imagens, locução, transcrição, fontes, checklist e links verificados.", "hint": "Portfólio auditável com versão, testes, créditos, materiais acessíveis e plano de atualização."},
]


def setup():
    DEST.mkdir(parents=True, exist_ok=True)
    for mission in MISSIONS:
        mission["deliverable"] = mission["hint"]
    lessons = {"course": TITLE, "hours_planned": 20,
               "method": "30 lições de 33 minutos e 6 missões de 35 minutos; sem certificado automático",
               "modules": content.MODULES}
    source = {"course": TITLE, "version": "2026-11-13-curso12-v1", "items": content.QUESTIONS}
    (DEST / "licoes_30.json").write_text(json.dumps(lessons, ensure_ascii=False, indent=2) + "\n", "utf-8")
    (DEST / "questoes_originais.json").write_text(json.dumps(source, ensure_ascii=False, indent=2) + "\n", "utf-8")
    core.DEST = DEST
    core.PDF_NAME = PDF_NAME
    core.COURSE_NO = 12
    core.COVER_LINES = ["VIDEOAULAS", "SLIDES E ÁUDIOS", "COM IA"]
    core.COVER_TAG = "CURSO 12 · FORMAÇÃO GRATUITA"
    core.COVER_SUBTITLE = "Criar, narrar, sincronizar e publicar"
    core.HEADER_TAG = "PRODUÇÃO AUDIOVISUAL + IA"
    core.LESSONS = lessons
    core.SOURCE = source
    core.MISSIONS = MISSIONS
    core11.FLOW_STEPS = [
        ("OBJETIVO", "ROTEIRO", "EVIDÊNCIA"),
        ("MENSAGEM", "IMAGEM", "LEITURA"),
        ("TEXTO", "NARRAÇÃO", "SINCRONIA"),
        ("AUTORIA", "DIREITOS", "ACESSO"),
        ("MONTAGEM", "TESTE", "EXPORTAÇÃO"),
        ("PUBLICAÇÃO", "FEEDBACK", "REVISÃO"),
    ]


def make_html(bank):
    html = (ROOT / "cursos-ia" / "11-avaliacoes-e-simulados-com-ia" / "index.html").read_text("utf-8")
    html = html.replace("Criação de Avaliações e Simulados com Inteligência Artificial", TITLE)
    html = html.replace("CURSO 11 · TOTALMENTE GRATUITO", "CURSO 12 · TOTALMENTE GRATUITO")
    html = html.replace('CRIE <span class="accent">SIMULADOS COM IA</span> DE VERDADE.',
                        'PRODUZA <span class="accent">VIDEOAULAS COM IA</span> PROFISSIONAIS.')
    html = html.replace(
        "Desenvolva avaliações válidas, simulados gamers acessíveis e gabaritos verificáveis. São 30 lições aplicadas, 60 casos comentados e seis missões práticas.",
        "Aprenda a produzir videoaulas com roteiro, 40 slides, narração em português, legendas e testes de qualidade. São 30 lições, 60 casos comentados e seis missões práticas.")
    html = html.replace("MATRIZ + QUESTÕES + GABARITO + ACESSIBILIDADE",
                        "ROTEIRO + SLIDES + NARRAÇÃO + REVISÃO")
    html = html.replace("construção de avaliações, feedback e análise com IA",
                        "roteiro, produção audiovisual e inclusão com IA")
    html = html.replace("ensinomeu_curso11_avaliacoes_e_simulados_v1_20261113",
                        "ensinomeu_curso12_videoaulas_slides_audios_v1_20261113")
    html = html.replace("apostila_avaliacoes_e_simulados_com_ia_20h.pdf", PDF_NAME)
    html = re.sub(r'(<meta name="description" content=")[^"]+("\s*/?>)',
                  r'\g<1>Curso 12 gratuito: Criação de Videoaulas, Slides e Áudios com IA. Apostila de 46 páginas A4, 30 lições, 60 questões e seis missões, sem narração no simulado.\2',
                  html, count=1)
    modules = [m["title"] for m in content.MODULES]
    html = re.sub(r'const MODULES=\[.*?\];',
                  'const MODULES=' + json.dumps(modules, ensure_ascii=False, separators=(",", ":")) + ';', html, count=1)
    html = re.sub(r'const MISSIONS=\[.*?\];',
                  'const MISSIONS=' + json.dumps(MISSIONS, ensure_ascii=False, separators=(",", ":")) + ';', html, count=1)
    html = re.sub(r'(<script id="quiz-data" type="application/json">).*?(</script>)',
                  lambda m: m.group(1) + json.dumps(bank, ensure_ascii=False, separators=(",", ":")) + m.group(2),
                  html, count=1, flags=re.S)
    (DEST / "index.html").write_text(html, "utf-8")
    (DEST / "LEIA-ME.txt").write_text(
        "INSTITUTO ENSINOMEU · CURSO 12 · CRIAÇÃO DE VIDEOAULAS, SLIDES E ÁUDIOS COM IA\n\n"
        "Apostila vetorial A4: 46 páginas, 30 lições e 6 missões. Duração planejada de estudo: 20h.\n"
        "Arena: 60 questões contextualizadas, quatro alternativas, feedback individual, desafios por módulo,\n"
        "música e efeitos opcionais, sem narração. Progresso local do navegador.\n"
        "A criação de vídeo/áudio é tema do curso; não há geração automática de MP4 nem certificado.\n"
        "Verifique fontes, licenças, direitos de imagem, conteúdo, sincronismo e acessibilidade.\n"
        "Entrada pública: index.html\n", "utf-8")
    (DEST / "NOTA_TECNICA_AVALIACAO.md").write_text(
        "# Curso 12 — Critérios editoriais\n\n"
        "30 lições autorais, 6 fluxos visuais por módulo e 60 situações de avaliação distintas.\n"
        "Dez questões por módulo; distribuição do gabarito 15 por alternativa antes do embaralhamento.\n"
        "O simulado não narra as perguntas. Avaliação é formativa, sem emissão automática de certificado.\n"
        "Imagens, voz, fontes e formatos de vídeo tratados como problemas reais de produção.\n", "utf-8")


def make_pdf():
    c = Canvas(str(DEST / PDF_NAME), pagesize=A4, pageCompression=1, invariant=1,
               title="Curso 12 - Criação de Videoaulas, Slides e Áudios com IA | Instituto EnsinoMeu",
               author="Instituto EnsinoMeu - Prof. Carlos Tavares")
    core.cover(c)
    core.introduction(c, 2, "Carta a quem produz aulas", [
        ("Finalidade", "Videoaulas de qualidade são projetos pedagógicos com roteiro, imagens corretas, voz inteligível, legendas e evidências de aprendizagem. A IA pode acelerar etapas, mas não verifica sozinha o resultado."),
        ("A produção que você fará", "Trinta atividades curtas, seis missões e um portfólio de videoaula com storyboard de quarenta cenas, roteiro, mapa de sincronização, controle de fontes, acessibilidade e testes documentados."),
        ("Critério de realidade", "Exportar MP4 não significa que a aula está pronta. Verifique duração real, legibilidade, cortes, dados, direitos de uso, voz, download e compatibilidade antes de afirmar que publicou."),
        ("Cuidado com recursos", "Não compre créditos antes de revisar roteiro e amostra de voz. Respeite licença de imagens, gravações de terceiros, autorização para uso de pessoas e alternativas de baixo consumo de dados.")
    ])
    core.introduction(c, 3, "Roteiro de estudo e entrega", [
        ("Percurso de 20 horas", "Em cada módulo, estude cinco lições de 33 minutos e desenvolva missão de 35 minutos. O total recomendado é 1.200 minutos. Esta é carga planejada, sem certificação automática."),
        ("Passo a passo", "Comece por objetivo verificável e roteiro. Desenhe slides úteis, audite fontes e direitos, faça amostra de locução, sincronize as cenas, gere legendas e valide exportação em dispositivos reais."),
        ("Material e acesso", "Há seis módulos, trinta lições vetoriais e sessenta casos comentados na arena sem narração. Um arquivo alternativo textual, legendas e transcrição podem permitir acesso quando o vídeo ou áudio não está disponível."),
        ("Controle final", "Guarde versões, registre problemas e correções e apresente evidências de teste. Não confunda visualizações ou tempo de reprodução com aprendizagem demonstrada em avaliação própria.")
    ])
    page = 4
    for i, module in enumerate(content.MODULES):
        core.module_intro(c, page, i, module)
        page += 1
        for j, lesson in enumerate(module["lessons"]):
            core11.illustrated_lesson_page(c, page, i, j, lesson)
            page += 1
        core.mission_page(c, page, i, MISSIONS[i])
        page += 1
    assert page == 46
    core.introduction(c, 46, "Fontes e checklist de publicação", [
        ("Pedagogia", "Consulte a BNCC e o currículo vigente da rede em fontes oficiais; não assuma que códigos criados por IA sejam reais. Avalie objetivos e evidências de aprendizagem de cada cena."),
        ("Acessibilidade", "Consulte orientações oficiais de acessibilidade digital, como as do W3C, e revise legibilidade, legendas, descrições, contraste e alternativas ao vídeo e ao áudio em dispositivos diferentes."),
        ("Autoria e direitos", "Verifique licenças e permissões específicas de fotografias, trilhas, vozes e rostos. Identifique reconstruções sintéticas e mantenha controle de origem e alterações."),
        ("Pronto para o público?", "Roteiro conferido; slides sem cortes; sincronismo validado; áudio íntegro; legendas revisadas; dados e fontes rastreáveis; alternativa de acesso; links e downloads públicos testados; versão registrada.")
    ])
    c.save()
    print("PDF do Curso 12: 46 páginas A4")


if __name__ == "__main__":
    setup()
    assert len(content.MODULES) == 6
    assert all(len(m["lessons"]) == 5 for m in content.MODULES)
    assert len(content.QUESTIONS) == 60
    bank = core.make_bank()
    make_html(bank)
    make_pdf()
    print("Simulado do Curso 12: 60 questões, 6 módulos e 6 missões")
