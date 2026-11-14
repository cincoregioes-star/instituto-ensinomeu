"""Gera ícones PWA a partir do brasão oficial, sem alterar o original."""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
BRASAO = Image.open(ASSETS / "brasao.png").convert("RGBA")


def gerar(nome: str, tamanho: int, proporcao_brasao: float) -> None:
    icone = Image.new("RGB", (tamanho, tamanho), "#052d4c")
    pixels = icone.load()
    for y in range(tamanho):
        for x in range(tamanho):
            mistura = (x / tamanho * 0.22 + y / tamanho * 0.32)
            pixels[x, y] = (
                int(5 + 0 * mistura),
                int(37 + 50 * mistura),
                int(67 + 6 * mistura),
            )

    grafico = ImageDraw.Draw(icone)
    margem = round(tamanho * 0.06)
    grafico.rounded_rectangle(
        (margem, margem, tamanho - margem - 1, tamanho - margem - 1),
        radius=round(tamanho * 0.15),
        outline="#d9a93f",
        width=max(2, round(tamanho * 0.012)),
    )

    lado = round(tamanho * proporcao_brasao)
    brasao = BRASAO.resize((lado, lado), Image.Resampling.LANCZOS)
    result = icone.convert("RGBA")
    result.alpha_composite(brasao, ((tamanho - lado) // 2, (tamanho - lado) // 2))
    result.convert("RGB").save(ASSETS / nome, format="PNG", optimize=True)


if __name__ == "__main__":
    gerar("app-icon-192.png", 192, 0.82)
    gerar("app-icon-512.png", 512, 0.82)
    # Todo o desenho principal fica dentro da zona segura para ícones adaptáveis Android.
    gerar("app-icon-maskable-512.png", 512, 0.63)
    gerar("apple-touch-icon.png", 180, 0.82)
