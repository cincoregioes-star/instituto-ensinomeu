#!/usr/bin/env python3
"""Integra o Curso 12 à escola gratuita de IA e aos sitemaps do EnsinoMeu."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COURSE = "12-videoaulas-slides-audios-com-ia"
PDF = "apostila_videoaulas_slides_audios_com_ia_20h.pdf"
PREV = "11-avaliacoes-e-simulados-com-ia"
PREV_PDF = "apostila_avaliacoes_e_simulados_com_ia_20h.pdf"


def update(name, rules):
    file = ROOT / name
    data = file.read_text("utf-8")
    edited = data
    for before, after in rules:
        if before in edited:
            edited = edited.replace(before, after, 1)
        elif after not in edited:
            raise RuntimeError(f"Não foi encontrada âncora em {name}: {before[:90]}")
    if edited != data:
        file.write_text(edited, "utf-8")
        print("Atualizado", name)


card = (
    '<article class="course"><div class="cover"><span class="tag">CURSO 12 · VIDEOAULAS E ÁUDIOS</span>'
    '<h3>Criação de Videoaulas, Slides e Áudios com IA</h3>'
    '<p>Roteiro, narradores, imagens, sincronização e testes reais</p></div>'
    '<div class="body"><p>Aprenda a projetar aulas audiovisuais com 40 cenas, voz em português, '
    'slides legíveis, fontes verificadas, legendas e publicação acessível.</p>'
    '<div class="features"><span>20h planejadas</span><span>60 questões</span><span>6 missões</span></div>'
    '<div class="buttons"><a class="btn primary" href="' + COURSE + '/index.html">🎮 Iniciar simulado</a>'
    '<a class="btn secondary" href="' + COURSE + '/' + PDF + '" download>▤ Baixar apostila PDF</a>'
    '</div></div></article>'
)
update("cursos-ia/index.html", [
    ("Onze cursos progressivos", "Doze cursos progressivos"),
    ('aria-label="Resumo dos onze cursos"', 'aria-label="Resumo dos doze cursos"'),
    ('<b>11</b><span>CURSOS PUBLICADOS', '<b>12</b><span>CURSOS PUBLICADOS'),
    ('<b>660</b><span>QUESTÕES COMENTADAS', '<b>720</b><span>QUESTÕES COMENTADAS'),
    ('<b>220h</b><span>CARGA TOTAL PLANEJADA', '<b>240h</b><span>CARGA TOTAL PLANEJADA'),
    (PREV + '/' + PREV_PDF + '" download>▤ Baixar apostila PDF</a></div></div></article></div></section>',
     PREV + '/' + PREV_PDF + '" download>▤ Baixar apostila PDF</a></div></div></article>' + card + '</div></section>')
])

item = (
    '<article class="item" data-search="videoaulas slides narração áudio legendas edição com inteligência artificial">'
    '<h3>12 · Criação de Videoaulas, Slides e Áudios com IA</h3>'
    '<p>Storyboard, imagens de qualidade, voz PT-BR, acessibilidade, exportação, sincronismo e publicação.</p>'
    '<div class="actions"><a href="cursos-ia/' + COURSE + '/index.html">🎮 Simulado 60 questões ↗</a>'
    '<a href="cursos-ia/' + COURSE + '/' + PDF + '" download>▤ Apostila PDF ↗</a></div></article>'
)
update("catalogo-gratuito.html", [
    ("onze cursos completos e gratuitos", "doze cursos completos e gratuitos"),
    ('cursos-ia/' + PREV + '/' + PREV_PDF + '" download>▤ Apostila PDF ↗</a></div></article></div><p>',
     'cursos-ia/' + PREV + '/' + PREV_PDF + '" download>▤ Apostila PDF ↗</a></div></article>' + item + '</div><p>')
])
update("index.html", [
    ("Nova escola gratuita de IA: 11 cursos completos", "Nova escola gratuita de IA: 12 cursos completos"),
    ("Apostilas ilustradas, 660 questões comentadas e 66 missões práticas.",
     "Apostilas ilustradas, 720 questões comentadas e 72 missões práticas.")
])
url = "https://cincoregioes-star.github.io/instituto-ensinomeu/cursos-ia/" + COURSE + "/"
for name in ("sitemap.xml", "sitemap-urls.txt"):
    f = ROOT / name
    old = f.read_text("utf-8")
    if url not in old:
        if name == "sitemap.xml":
            new = old.replace("</urlset>", "  <url><loc>" + url + "</loc></url>\n</urlset>")
        else:
            new = old.rstrip() + "\n" + url + "\n"
        f.write_text(new, "utf-8")
        print("Atualizado", name)
