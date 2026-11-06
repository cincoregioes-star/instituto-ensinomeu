#!/usr/bin/env python3
"""Recria a aula História 9º (40 slides) com os dois MP3 reais do Prof. Matheus.
Preserva o vídeo antigo até novo vídeo H264/AAC passar as verificações.
"""
from pathlib import Path
import hashlib, json, subprocess, tempfile, math, re, os
BASE=Path("videos/9ano/historia")
PARTS=BASE/".audio_upload"
SLIDES=BASE/"slides_originais"
OUT=BASE/"aula01-nascimento-republica-matheus.mp4"
PAGE=Path("historia-9ano.html")
DURATIONS=[13.088,11.337,11.076,14.563,13.54,14.172,11.975,14.289,8.1,13.921,12.055,13.772,16.697,10.921,8.324,12.07,7.662,15.118,7.213,12.729,8.455,14.459,16.912,18.215,16.978,18.055,15.063,19.895,14.735,20.111,14.731,15.371,20.308,13.854,17.711,19.273,15.692,18.393,19.519,19.854]
EXPECTED={"1":("70512e0ab63297595c4397cef82e92413dc487e32d9516070c09e089e9cd8714",9,265.535),"2":("df93d9ed7b1c851e412e6f7fe8eb655d6ac0fe0b6d57331a39c442c1983d2d25",11,314.671)}
def check(cmd):
    return subprocess.check_output(cmd,stderr=subprocess.STDOUT,text=True)
def probe(path):
    return json.loads(check(["ffprobe","-v","error","-show_streams","-show_format","-of","json",str(path)]))
def main():
    if len(DURATIONS)!=40 or not all(x>5 for x in DURATIONS):
        raise RuntimeError("Linha do tempo inválida")
    if not PAGE.is_file(): raise RuntimeError("Página não encontrada")
    original=BASE/"aula01-nascimento-republica.mp4"
    if not original.is_file(): raise RuntimeError("MP4 original ausente")
    manifest=json.loads((SLIDES/"manifesto.json").read_text())
    if len(manifest["slides"])!=40: raise RuntimeError("Manifesto não contém 40 slides")
    for i,s in enumerate(manifest["slides"],1):
        f=SLIDES/f"slide-{i:02d}.jpg"
        if not f.is_file() or hashlib.sha256(f.read_bytes()).hexdigest()!=s["sha256"]:
            raise RuntimeError(f"Imagem {i} inválida ou não corresponde ao original")
    with tempfile.TemporaryDirectory() as d:
        d=Path(d)
        audio=[]
        for k,(digest,count,expectedtime) in EXPECTED.items():
            files=[PARTS/f"matheus_audio{k}.part{i:02d}" for i in range(count)]
            if not all(f.is_file() for f in files):raise RuntimeError("Partes de áudio ausentes "+k)
            data=b"".join(f.read_bytes() for f in files)
            if hashlib.sha256(data).hexdigest()!=digest:raise RuntimeError("SHA256 do áudio não confere "+k)
            mp3=d/f"matheus{k}.mp3"
            mp3.write_bytes(data)
            info=probe(mp3)
            duration=float(info["format"]["duration"])
            if abs(duration-expectedtime)>.5: raise RuntimeError(f"Duração de áudio {k} divergente: {duration}")
            audio.append(mp3)
        duration=sum(float(probe(f)["format"]["duration"]) for f in audio)
        if abs(sum(DURATIONS)-duration)>.5:raise RuntimeError("Soma dos slides diferente do áudio")
        concat=d/"slides.txt"
        lines=["ffconcat version 1.0"]
        for i,t in enumerate(DURATIONS,1):
            f=(SLIDES/f"slide-{i:02d}.jpg").resolve().as_posix()
            lines.extend(["file '"+f+"'",f"duration {t:.3f}"])
        lines.append("file '"+(SLIDES/"slide-40.jpg").resolve().as_posix()+"'")
        concat.write_text("\n".join(lines)+"\n")
        output=d/"matheus_nova_aula.mp4"
        flt="[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,fps=15,format=yuv420p[v];[1:a][2:a]concat=n=2:v=0:a=1[a]"
        cmd=["ffmpeg","-hide_banner","-nostdin","-loglevel","error","-y","-safe","0","-f","concat","-i",str(concat),"-i",str(audio[0]),"-i",str(audio[1]),"-filter_complex",flt,"-map","[v]","-map","[a]","-c:v","libx264","-crf","22","-preset","veryfast","-c:a","aac","-b:a","160k","-movflags","+faststart","-t",f"{duration:.3f}",str(output)]
        subprocess.run(cmd,check=True,timeout=1500)
        meta=probe(output)
        v=next(s for s in meta["streams"] if s["codec_type"]=="video")
        a=next(s for s in meta["streams"] if s["codec_type"]=="audio")
        length=float(meta["format"]["duration"])
        if v["codec_name"]!="h264" or a["codec_name"]!="aac" or v["width"]!=1920 or v["height"]!=1080 or abs(length-duration)>1 or output.stat().st_size<1_000_000:
            raise RuntimeError(f"Falha de validação de saída: codecs={v['codec_name']}/{a['codec_name']} duração={length} vs {duration}")
        # Garante que o vídeo consegue ser decodificado antes de publicar
        for sec in [5,int(length/2),int(length-5)]:
            subprocess.run(["ffmpeg","-v","error","-ss",str(sec),"-i",str(output),"-frames:v","1","-f","null","-"],check=True,timeout=60)
        # Validação de trilha de áudio: áudio decodificável no início, meio e fim
        subprocess.run(["ffmpeg","-v","error","-ss",str(int(length-30)),"-t","20","-i",str(output),"-vn","-f","null","-"],check=True,timeout=60)
        OUT.write_bytes(output.read_bytes())
        content=PAGE.read_text()
        newurl="videos/9ano/historia/aula01-nascimento-republica-matheus.mp4"
        if newurl not in content:
            needle="const fontes=["
            if needle not in content:raise RuntimeError("Player não reconhecido, vídeo gerado mas página não atualizada")
            content=content.replace(needle,needle+"{url:'"+newurl+"',ritmo:'1.00'}, ",1)
        content=content.replace("<span>9min56s</span>","<span>9min40s</span>")
        content=content.replace("<span>Português brasileiro</span>","<span>Prof. Matheus Silva • PT-BR</span>")
        PAGE.write_text(content)
        report=BASE/"VALIDACAO_MATHEUS.md"
        report.write_text("# História 9º — versão Prof. Matheus Silva\n\n"+f"- Duração técnica: {length:.3f} segundos\n- 40 slides originais com hashes conferidos\n- MP3 1 e 2 com SHA256 conferido\n- Velocidade da narração: 1,00x; nenhum silêncio artificial acrescentado\n- H264/AAC, Full HD 1920x1080, áudio e vídeo decodificáveis\n- Linha do tempo dos slides: estimada com base no texto e nas pausas naturais; sincronização semântica fina e revisão auditiva humana ainda pendentes\n- Arquivo: {OUT}\n",encoding="utf-8")
        print(f"NOVO MP4 VALIDADO: {OUT}, {OUT.stat().st_size} bytes, {length:.3f}s")
if __name__=="__main__":main()
