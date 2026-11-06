#!/usr/bin/env python3
"""Insere pausas didáticas em transições de slides detectadas no vídeo.
Não substitui o original. Aborta se os cortes não forem identificáveis com segurança.
"""
import json, os, re, subprocess, sys
from pathlib import Path

SRC = Path("videos/9ano/historia/aula01-nascimento-republica.mp4")
DST = Path("videos/9ano/historia/aula01-nascimento-republica-pausada.mp4")
REPORT = Path("videos/9ano/historia/RELATORIO_PAUSAS.md")
RATE = 0.85
EXPECTED_TRANSITIONS = 39

def cmd(args, capture=False):
    if capture:
        return subprocess.run(args, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).stdout
    subprocess.run(args, check=True)

def probe(path):
    return json.loads(cmd(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)], True))

def discover(duration):
    path = Path("/tmp/historia-scene-scores.txt")
    filtergraph = "fps=5,scale=480:-2,select='gt(scene,0.014)',metadata=print:key=lavfi.scene_score:file=" + str(path)
    cmd(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(SRC),"-vf",filtergraph,"-an","-f","null","-"])
    raw = path.read_text() if path.exists() else ""
    records = re.findall(r"pts_time:([0-9.]+)\s*\nlavfi.scene_score=([0-9.]+)", raw)
    candidates = [(float(t), float(score)) for t, score in records
                  if 4.0 < float(t) < duration - 4.0]
    clusters = []
    for t, score in candidates:
        if clusters and t - clusters[-1][-1][0] <= 1.8:
            clusters[-1].append((t,score))
        else:
            clusters.append([(t,score)])
    peaks = [max(g, key=lambda item:item[1]) for g in clusters]
    # Seleção conservadora: cortes visuais distintos, não movimentos internos.
    ranked = sorted(peaks, key=lambda x: x[1], reverse=True)
    picks = []
    for t, score in ranked:
        if score < 0.03 or any(abs(t - s) < 6.0 for s,_ in picks):
            continue
        picks.append((t,score))
        if len(picks) == EXPECTED_TRANSITIONS:
            break
    picks.sort()
    gaps = [y-x for x,y in zip([0.0]+[t for t,_ in picks],
                               [t for t,_ in picks]+[duration])]
    confidence = (len(picks) == EXPECTED_TRANSITIONS
                  and min(gaps) >= 5.5 and max(gaps) <= 37.0
                  and len(peaks) <= 95)
    return picks, peaks, confidence, gaps

def write_report(duration, picks, peaks, confidence, gaps, output=None):
    lines = [
        "# Auditoria automática de pausas — História 9º ano, aula 01",
        "",
        f"- Duração original: {duration:.2f} s.",
        f"- Candidatos de mudança visual: {len(peaks)}.",
        f"- Cortes selecionados: {len(picks)}/{EXPECTED_TRANSITIONS}.",
        f"- Intervalos mínimo/máximo: {min(gaps):.2f} s / {max(gaps):.2f} s.",
        f"- Detecção visual: {'aprovada preliminarmente' if confidence else 'inconclusiva — original preservado'}.",
        "- Pausa: 2s por corte e 3s após os blocos 10, 20 e 30 (substituindo os 2s).",
        "- Narração: 0,85x com altura tonal preservada (atempo).",
        "",
        "## Cortes estimados no original",
        "",
        "| Slide concluído | Tempo (s) | Score de mudança visual | Pausa |",
        "| ---: | ---: | ---: | ---: |",
    ]
    for i,(t,s) in enumerate(picks,1):
        pause = 3 if i in (10,20,30) else 2
        lines.append(f"| {i} | {t:.2f} | {s:.3f} | {pause}s |")
    if output:
        lines += ["", f"Arquivo gerado e validado pelo ffprobe: `{output}`."]
    lines += ["", "**Aviso:** detecção automática de transições não substitui revisão humana da coerência da locução. Se a voz estiver falando no corte, ajustar o projeto de edição antes da aprovação final."]
    REPORT.write_text("\n".join(lines)+"\n")

def main():
    if not SRC.is_file():
        sys.exit("MP4 de origem não localizado.")
    meta = probe(SRC)
    duration = float(meta["format"]["duration"])
    types = [s["codec_type"] for s in meta["streams"]]
    if "video" not in types or "audio" not in types:
        sys.exit("MP4 não contém vídeo e áudio.")
    picks, peaks, confidence, gaps = discover(duration)
    write_report(duration,picks,peaks,confidence,gaps)
    print(REPORT.read_text(), flush=True)
    if not confidence:
        sys.exit("Cortes automáticos insuficientemente confiáveis; não editar o MP4.")
    pauses = [(t, 3.0 if i in (10,20,30) else 2.0) for i,(t,_) in enumerate(picks,1)]
    # Setpts acrescenta lacunas na linha do tempo. FPS repete o quadro final;
    # aresample preenche as lacunas sonoras com silêncio real.
    ve = "(PTS-STARTPTS)/0.85" + "".join(f"+({p:g}/TB)*gte(T,{t:.3f})" for t,p in pauses)
    ae = "PTS-STARTPTS" + "".join(f"+({p:g}/TB)*gte(T,{t/RATE:.3f})" for t,p in pauses)
    graph = f"[0:v]setpts='{ve}',fps=30,format=yuv420p[v];[0:a]atempo={RATE},asetpts='{ae}',aresample=async=50000:first_pts=0[a]"
    temp = DST.with_name(DST.stem+"-gerando.mp4")
    cmd(["ffmpeg","-hide_banner","-nostdin","-loglevel","warning","-stats","-y",
         "-i",str(SRC),"-filter_complex",graph,"-map","[v]","-map","[a]",
         "-c:v","libx264","-preset","veryfast","-crf","24",
         "-c:a","aac","-b:a","160k","-movflags","+faststart",str(temp)])
    final = probe(temp)
    v = next(s for s in final["streams"] if s["codec_type"]=="video")
    a = next(s for s in final["streams"] if s["codec_type"]=="audio")
    expected = duration / RATE + sum(p for _,p in pauses)
    length = float(final["format"]["duration"])
    if not 0.0 < temp.stat().st_size < 95000000:
        sys.exit(f"Tamanho incompatível: {temp.stat().st_size} bytes")
    if v["codec_name"] != "h264" or a["codec_name"] != "aac" or abs(length-expected)>1.5:
        sys.exit(f"Falha de validação: codificações {v['codec_name']}/{a['codec_name']}; duração {length:.2f} vs {expected:.2f}.")
    temp.replace(DST)
    write_report(duration,picks,peaks,confidence,gaps,output=DST.name)
    print(f"Arquivo novo: {DST}, {DST.stat().st_size} bytes, {length:.2f}s; original intacto.")

if __name__ == "__main__":
    main()
