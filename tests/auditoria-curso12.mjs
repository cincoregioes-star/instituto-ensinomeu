import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';

const dir='cursos-ia/12-videoaulas-slides-audios-com-ia/';
const read=p=>readFileSync(p,'utf8');
const lessons=JSON.parse(read(dir+'licoes_30.json'));
const bank=JSON.parse(read(dir+'banco_60_questoes.json'));
assert.equal(lessons.modules.length,6);
assert.equal(lessons.modules.reduce((n,m)=>n+m.lessons.length,0),30);
assert.equal(bank.questions.length,60);
assert.equal(new Set(bank.questions.map(x=>x.question)).size,60);
assert.equal(new Set(bank.questions.map(x=>x.options.join('|'))).size,60);
for(let m=1;m<=6;m++)assert.equal(bank.questions.filter(x=>x.module===m).length,10);
for(let i=0;i<4;i++)assert.equal(bank.questions.filter(x=>x.correct===i).length,15);
for(const q of bank.questions){
 assert.ok(q.question.length>=80,'Enunciado muito curto: '+q.id);
 assert.ok(q.explanation.length>=110,'Comentário muito curto: '+q.id);
 assert.equal(q.options.length,4);
 assert.equal(new Set(q.options).size,4);
 assert.ok(q.options.every(o=>o.length>45),'Alternativa curta: '+q.id);
}
const html=read(dir+'index.html');
const data=html.match(/<script id="quiz-data" type="application\/json">([\s\S]*?)<\/script>/);
assert.ok(data,'Banco ausente na arena');
assert.equal(JSON.parse(data[1]).questions.length,60);
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].filter(m=>!m[0].includes('application/json'));
for(const s of scripts)new vm.Script(s[1]);
const pdf=dir+'apostila_videoaulas_slides_audios_com_ia_20h.pdf';
assert.ok(existsSync(pdf));
assert.equal(Number(execFileSync('pdfinfo',[pdf],{encoding:'utf8'}).match(/^Pages:\s+(\d+)/m)?.[1]),46);
for(const p of ['cursos-ia/index.html','catalogo-gratuito.html','sitemap.xml']){
 assert.ok(read(p).includes('12-videoaulas-slides-audios-com-ia'),p+' não integrado');
}
assert.ok(Number(read('index.html').match(/Nova escola gratuita de IA: (\d+) cursos completos/)?.[1])>=12,
          'O portal deve manter pelo menos doze cursos publicados');
assert.ok(!html.includes('Criação de Avaliações e Simulados com Inteligência Artificial'));
console.log('OK Curso 12: 30 lições, 60 casos distintos, gabarito equilibrado, PDF A4 de 46 páginas, catálogo e JavaScript válido.');
