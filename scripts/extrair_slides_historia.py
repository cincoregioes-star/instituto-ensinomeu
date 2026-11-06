#!/usr/bin/env python3
"""Extrai os 40 slides originais de História sem alterar vídeos ou narração."""
from __future__ import annotations
import hashlib
import json
import re
import subprocess
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path("videos/9ano/historia")
SRC = ROOT / "aula01-nascimento-republica.mp4"
REPORT = ROOT / "RELATORIO_PAUSAS.md"
OUT = ROOT / "slides_originais"
ZIP = ROOT / "slides_originais_historia_9ano.zip"
MANIFEST = OUT / "manifesto.json"

def get(cmd):
    return subprocess.check_output(cmd, text=True)

def main():
    if not SRC.is_file() or not REPORT.is_file():
        raise SystemExit("Arquivo original ou relatório de transições ausente.")
    metadata = json.loads(get(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(SRC)]))
    duration = float(metadata["format"]["duration"])
    videos = [s for s in metadata["streams"] if s["codec_type"] == "video"]
    if len(videos) != 1:
        raise SystemExit("Esperava um único fluxo de vídeo.")
    cuts = []
    for line in REPORT.read_text().splitlines():
        match = re.fullmatch(r"\|\s*(\d+)\s*\|\s*([\d.]+)\s*\|\s*[\d.]+\s*\|\s*[23]s\s*\|", line.strip())
        if match:
            cuts.append((int(match.group(1)),float(match.group(2))))
    if len(cuts) != 39 or [num for num,_ in cuts] != list(range(1,40)):
        raise SystemExit("Relatório não corresponde a 39 transições consecutivas.")
    boundaries=[0.0]+[t for _,t in cuts]+[duration]
    if not all(boundaries[i+1]-boundaries[i] >= 5 for i in range(40)):
        raise SystemExit("Duração atípica de algum slide.")
    OUT.mkdir(parents=True, exist_ok=True)
    slides=[]
    for idx in range(1,41):
        a,b=boundaries[idx-1:idx+1]
        stamp=(a+b)/2
        dest=OUT/f"slide-{idx:02d}.jpg"
        subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-nostdin","-y",
                        "-ss",f"{stamp:.3f}","-i",str(SRC),"-frames:v","1",
                        "-q:v","3",str(dest)],check=True)
        if not dest.exists() or dest.stat().st_size < 15000:
            raise SystemExit(f"Slide {idx:02d} não foi extraído corretamente.")
        slides.append({
            "slide":idx,
            "imagem":dest.name,
            "inicio_original_s":round(a,2),
            "fim_original_s":round(b,2),
            "captura_s":round(stamp,2),
            "tamanho_bytes":dest.stat().st_size,
            "sha256":hashlib.sha256(dest.read_bytes()).hexdigest()
        })
        print(f"Slide {idx:02d}/40: {dest.name} ({dest.stat().st_size:,} bytes)",flush=True)
    if len({s["sha256"] for s in slides}) != 40:
        raise SystemExit("Há imagens repetidas; revisar o original.")
    manifest={
        "aula":"História — 9º ano — Aula 01 — O nascimento da República Brasileira",
        "origem":"MP4 ORIGINAL sem pausas artificiais: "+str(SRC),
        "duracao_original_s":round(duration,2),
        "resolucao_video":f'{videos[0].get("width")}x{videos[0].get("height")}',
        "quantidade":len(slides),
        "total_pausas_artificiais_s":0,
        "voz_nova":"Prof. Matheus Silva — MP3s ainda pendentes",
        "divisao_roteiro":{"texto_1":"slides 01 a 22","texto_2":"slides 23 a 40"},
        "nota":"Captura visual dos slides no centro de seus intervalos; a montagem com a voz nova requer alinhar cada imagem à locução correspondente, sem desacelerar nem acrescentar silêncios artificiais.",
        "slides":slides
    }
    MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    with ZipFile(ZIP,"w",compression=ZIP_DEFLATED,compresslevel=8) as archive:
        for f in sorted(OUT.glob("slide-??.jpg")):
            archive.write(f,arcname=f.name)
        archive.write(MANIFEST,arcname="manifesto.json")
    print(f"VALIDADO: {len(slides)} imagens distintas; pacote {ZIP} ({ZIP.stat().st_size:,} bytes).")

if __name__ == "__main__":
    main()
