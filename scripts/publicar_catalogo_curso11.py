#!/usr/bin/env python3
"""Integra o Curso 11 ao catálogo e à indexação do Instituto EnsinoMeu."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COURSE = "11-avaliacoes-e-simulados-com-ia"
PDF = "apostila_avaliacoes_e_simulados_com_ia_20h.pdf"
PREV = "10-planos-de-aula-com-ia"
PREV_PDF = "apostila_planos_de_aula_com_ia_20h.pdf"


def update(name, old_new):
    file = ROOT / name
    content = file.read_text("utf-8")
    new_content = content
    for old, new in old_new:
        if old in new_content:
            new_content = new_content.replace(old, new, 1)
        elif new not in new_content:
            raise ValueError(f"Âncora ausente em {name}: {old[:80]}")
    if new_content != content:
        file.write_text(new_content, "utf-8")
        print("Catálogo atualizado:", name)


card = (
    '<article class="course"><div class="cover"><span class="tag">CURSO 11 · AVALIAÇÕES E SIMULADOS</span>'
    '<h3>Criação de Avaliações e Simulados com IA</h3>'
    '<p>Matriz, gabaritos, questões gamer e análise de resultados</p></div>'
    '<div class="body"><p>Aprenda a escrever 60 situações-problema, auditar gabaritos, criar rubricas, '
    'testar acessibilidade e acompanhar a aprendizagem com critérios.</p>'
    '<div class="features"><span>20h planejadas</span><span>60 questões</span><span>6 missões</span></div>'
    '<div class="buttons"><a class="btn primary" href="' + COURSE + '/index.html">🎮 Iniciar simulado</a>'
    '<a class="btn secondary" href="' + COURSE + '/' + PDF + '" download>▤ Baixar apostila PDF</a>'
    '</div></div></article>'
)
update("cursos-ia/index.html", [
    ("Dez cursos progressivos", "Onze cursos progressivos"),
    ('aria-label="Resumo dos dez cursos"', 'aria-label="Resumo dos onze cursos"'),
    ('<b>10</b><span>CURSOS PUBLICADOS', '<b>11</b><span>CURSOS PUBLICADOS'),
    ('<b>600</b><span>QUESTÕES COMENTADAS', '<b>660</b><span>QUESTÕES COMENTADAS'),
    ('<b>200h</b><span>CARGA TOTAL PLANEJADA', '<b>220h</b><span>CARGA TOTAL PLANEJADA'),
    (PREV + '/' + PREV_PDF + '" download>▤ Baixar apostila PDF</a></div></div></article></div></section>',
     PREV + '/' + PREV_PDF + '" download>▤ Baixar apostila PDF</a></div></div></article>' + card + '</div></section>')
])

catalog_card = (
    '<article class="item" data-search="criação avaliações simulados gamificados com ia gabarito rubrica docente">'
    '<h3>11 · Criação de Avaliações e Simulados com IA</h3>'
    '<p>Matriz pedagógica, questões contextualizadas, gabaritos, acessibilidade, gamificação e indicadores de aprendizagem.</p>'
    '<div class="actions"><a href="cursos-ia/' + COURSE + '/index.html">🎮 Simulado 60 questões ↗</a>'
    '<a href="cursos-ia/' + COURSE + '/' + PDF + '" download>▤ Apostila PDF ↗</a></div></article>'
)
update("catalogo-gratuito.html", [
    ("dez cursos completos e gratuitos", "onze cursos completos e gratuitos"),
    ('cursos-ia/' + PREV + '/' + PREV_PDF + '" download>▤ Apostila PDF ↗</a></div></article></div><p>',
     'cursos-ia/' + PREV + '/' + PREV_PDF + '" download>▤ Apostila PDF ↗</a></div></article>' + catalog_card + '</div><p>')
])
update("index.html", [
    ("Nova escola gratuita de IA: 10 cursos completos", "Nova escola gratuita de IA: 11 cursos completos"),
    ("Apostilas ilustradas, 600 questões comentadas e 60 missões práticas.",
     "Apostilas ilustradas, 660 questões comentadas e 66 missões práticas.")
])
url = "https://cincoregioes-star.github.io/instituto-ensinomeu/cursos-ia/" + COURSE + "/"
for name in ["sitemap.xml", "sitemap-urls.txt"]:
    file = ROOT / name
    content = file.read_text("utf-8")
    if url not in content:
        if name.endswith(".xml"):
            content = content.replace("</urlset>", "  <url><loc>" + url + "</loc></url>\n</urlset>")
        else:
            content = content.rstrip() + "\n" + url + "\n"
        file.write_text(content, "utf-8")
        print("Sitemap atualizado:", name)
