#!/usr/bin/env python3
"""Inclui curso de empreendedorismo com IA no catálogo gratuito oficial."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COURSE = "13-ia-para-pequenos-negocios-e-empreendedores"
PDF = "apostila_ia_pequenos_negocios_empreendedores_20h.pdf"
PREV = "12-videoaulas-slides-audios-com-ia"
PREV_PDF = "apostila_videoaulas_slides_audios_com_ia_20h.pdf"


def update(name, replacements):
    file = ROOT / name
    old = file.read_text("utf-8")
    new = old
    for before, after in replacements:
        if before in new:
            new = new.replace(before, after, 1)
        elif after not in new:
            raise ValueError(f"Âncora não encontrada em {name}: {before[:75]}")
    if old != new:
        file.write_text(new, "utf-8")
        print("Atualizado:", name)


card = (
    '<article class="course"><div class="cover"><span class="tag">CURSO 13 · EMPREENDEDORISMO</span>'
    '<h3>IA para Pequenos Negócios e Empreendedores</h3>'
    '<p>Pesquisa, comunicação, atendimento e gestão responsável</p></div>'
    '<div class="body"><p>Aprenda a investigar necessidades, testar ofertas com baixo risco, '
    'produzir conteúdo, organizar pedidos e conferir custos sem promessas de renda.</p>'
    '<div class="features"><span>20h planejadas</span><span>60 questões</span><span>6 missões</span></div>'
    '<div class="buttons"><a class="btn primary" href="' + COURSE + '/index.html">🎮 Iniciar simulado</a>'
    '<a class="btn secondary" href="' + COURSE + '/' + PDF + '" download>▤ Baixar apostila PDF</a>'
    '</div></div></article>'
)
update("cursos-ia/index.html", [
    ("Doze cursos progressivos", "Treze cursos progressivos"),
    ('aria-label="Resumo dos doze cursos"', 'aria-label="Resumo dos treze cursos"'),
    ('<b>12</b><span>CURSOS PUBLICADOS', '<b>13</b><span>CURSOS PUBLICADOS'),
    ('<b>720</b><span>QUESTÕES COMENTADAS', '<b>780</b><span>QUESTÕES COMENTADAS'),
    ('<b>240h</b><span>CARGA TOTAL PLANEJADA', '<b>260h</b><span>CARGA TOTAL PLANEJADA'),
    (PREV + '/' + PREV_PDF + '" download>▤ Baixar apostila PDF</a></div></div></article></div></section>',
     PREV + '/' + PREV_PDF + '" download>▤ Baixar apostila PDF</a></div></div></article>' + card + '</div></section>')
])

item = (
    '<article class="item" data-search="inteligência artificial pequenos negócios empreendedores marketing atendimento custos ofertas">'
    '<h3>13 · IA para Pequenos Negócios e Empreendedores</h3>'
    '<p>Pesquisa de necessidades, ofertas testáveis, conteúdo, atendimento, pedidos e números com decisões responsáveis.</p>'
    '<div class="actions"><a href="cursos-ia/' + COURSE + '/index.html">🎮 Simulado 60 questões ↗</a>'
    '<a href="cursos-ia/' + COURSE + '/' + PDF + '" download>▤ Apostila PDF ↗</a></div></article>'
)
update("catalogo-gratuito.html", [
    ("doze cursos completos e gratuitos", "treze cursos completos e gratuitos"),
    ('cursos-ia/' + PREV + '/' + PREV_PDF + '" download>▤ Apostila PDF ↗</a></div></article></div><p>',
     'cursos-ia/' + PREV + '/' + PREV_PDF + '" download>▤ Apostila PDF ↗</a></div></article>' + item + '</div><p>')
])
update("index.html", [
    ("Nova escola gratuita de IA: 12 cursos completos", "Nova escola gratuita de IA: 13 cursos completos"),
    ("Apostilas ilustradas, 720 questões comentadas e 72 missões práticas.",
     "Apostilas ilustradas, 780 questões comentadas e 78 missões práticas.")
])
url = "https://cincoregioes-star.github.io/instituto-ensinomeu/cursos-ia/" + COURSE + "/"
for name in ("sitemap.xml", "sitemap-urls.txt"):
    f = ROOT / name
    old = f.read_text("utf-8")
    if url not in old:
        if name.endswith(".xml"):
            new = old.replace("</urlset>", "  <url><loc>" + url + "</loc></url>\n</urlset>")
        else:
            new = old.rstrip() + "\n" + url + "\n"
        f.write_text(new, "utf-8")
        print("Atualizado:", name)
