#!/usr/bin/env python3
"""Integra curso 10 ao catálogo existente, preservando a navegação dos 1–9."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COURSE = "10-planos-de-aula-com-ia"
PDF = "apostila_planos_de_aula_com_ia_20h.pdf"


def change(path: str, replacements: list[tuple[str, str]]):
    file = ROOT / path
    source = file.read_text("utf-8")
    target = source
    for old, new in replacements:
        if old in target:
            target = target.replace(old, new, 1)
        elif new not in target:
            raise ValueError(f"Âncora não encontrada em {path}: {old[:75]}")
    if target != source:
        file.write_text(target, "utf-8")
        print("Atualizado", path)


course_card = (
    '<article class="course"><div class="cover"><span class="tag">CURSO 10 · PLANOS DE AULA</span>'
    '<h3>Planos de Aula com Inteligência Artificial</h3><p>Currículo, aula prática e avaliação responsável</p>'
    '</div><div class="body"><p>Desenvolva planos viáveis com objetivos observáveis, inclusão, '
    'curadoria curricular, 30 lições autorais e revisão humana das sugestões de IA.</p>'
    '<div class="features"><span>20h planejadas</span><span>60 questões</span><span>6 missões</span></div>'
    '<div class="buttons"><a class="btn primary" href="' + COURSE + '/index.html">🎮 Iniciar simulado</a>'
    '<a class="btn secondary" href="' + COURSE + '/' + PDF + '" download>▤ Baixar apostila PDF</a>'
    '</div></div></article>'
)
change("cursos-ia/index.html", [
    ("Nove cursos progressivos", "Dez cursos progressivos"),
    ('aria-label="Resumo dos nove cursos"', 'aria-label="Resumo dos dez cursos"'),
    ('<b>9</b><span>CURSOS PUBLICADOS', '<b>10</b><span>CURSOS PUBLICADOS'),
    ('<b>540</b><span>QUESTÕES COMENTADAS', '<b>600</b><span>QUESTÕES COMENTADAS'),
    ('<b>180h</b><span>CARGA TOTAL PLANEJADA', '<b>200h</b><span>CARGA TOTAL PLANEJADA'),
    ('09-ia-para-professores-iniciantes/apostila_ia_para_professores_iniciantes_20h.pdf" download>▤ Baixar apostila PDF</a></div></div></article></div></section>',
     '09-ia-para-professores-iniciantes/apostila_ia_para_professores_iniciantes_20h.pdf" download>▤ Baixar apostila PDF</a></div></div></article>' + course_card + '</div></section>')
])

catalog_card = (
    '<article class="item" data-search="planos aula com ia docencia professor currículo inclusão planejamento">'
    '<h3>10 · Planos de Aula com Inteligência Artificial</h3>'
    '<p>Trinta lições aplicadas, planejamento curricular, inclusão, evidências e revisão pedagógica de materiais de IA.</p>'
    '<div class="actions"><a href="cursos-ia/' + COURSE + '/index.html">🎮 Simulado 60 questões ↗</a>'
    '<a href="cursos-ia/' + COURSE + '/' + PDF + '" download>▤ Apostila PDF ↗</a></div></article>'
)
change("catalogo-gratuito.html", [
    ("nove cursos completos e gratuitos", "dez cursos completos e gratuitos"),
    ('09-ia-para-professores-iniciantes/apostila_ia_para_professores_iniciantes_20h.pdf" download>▤ Apostila PDF ↗</a></div></article></div><p>',
     '09-ia-para-professores-iniciantes/apostila_ia_para_professores_iniciantes_20h.pdf" download>▤ Apostila PDF ↗</a></div></article>' + catalog_card + '</div><p>')
])
change("index.html", [
    ("Nova escola gratuita de IA: 9 cursos completos", "Nova escola gratuita de IA: 10 cursos completos"),
    ("Apostilas ilustradas, 540 questões comentadas e 54 missões práticas.",
     "Apostilas ilustradas, 600 questões comentadas e 60 missões práticas.")
])

PREFIX = "https://cincoregioes-star.github.io/instituto-ensinomeu/cursos-ia/"
paths = [
    "04-automacao-ia-sem-programacao/", "05-ia-aplicada-aos-estudos/",
    "06-ia-para-matematica-e-ciencias/", "07-ia-para-pesquisas-e-redacoes/",
    "08-programacao-com-inteligencia-artificial/", "09-ia-para-professores-iniciantes/",
    COURSE + "/",
]
for file_name in ["sitemap.xml", "sitemap-urls.txt"]:
    file = ROOT / file_name
    current = file.read_text("utf-8")
    missing = [path for path in paths if PREFIX + path not in current]
    if not missing:
        continue
    additions = "".join(
        f"  <url><loc>{PREFIX}{path}</loc></url>\n" if file_name.endswith(".xml")
        else f"{PREFIX}{path}\n" for path in missing
    )
    if file_name.endswith(".xml"):
        current = current.replace("</urlset>", additions + "</urlset>")
    else:
        current = current.rstrip() + "\n" + additions
    file.write_text(current, "utf-8")
    print("Atualizado", file_name, "URLs adicionadas:", len(missing))
