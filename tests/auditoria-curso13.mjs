import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';

const dir='cursos-ia/13-ia-para-pequenos-negocios-e-empreendedores/';
const read=p=>readFileSync(p,'utf8');
const lessons=JSON.parse(read(dir+'licoes_30.json'));
const bank=JSON.parse(read(dir+'banco_60_questoes.json'));
assert.equal(lessons.modules.length,6);
assert.equal(lessons.modules.reduce((n,m)=>n+m.lessons.length,0),30);
assert.equal(bank.questions.length,60);
assert.equal(new Set(bank.questions.map(q=>q.question)).size,60);
assert.equal(new Set(bank.questions.map(q=>q.options.join('|'))).size,60);
for(let n=1;n<=6;n++)assert.equal(bank.questions.filter(q=>q.module===n).length,10);
for(let n=0;n<4;n++)assert.equal(bank.questions.filter(q=>q.correct===n).length,15);
for(const q of bank.questions){
 assert.ok(q.question.length>=80,'Enunciado curto: '+q.id);
 assert.ok(q.explanation.length>=110,'Comentário curto: '+q.id);
 assert.equal(q.options.length,4);
 assert.equal(new Set(q.options).size,4);
 assert.ok(q.options.every(s=>s.length>45),'Distrator curto: '+q.id);
}
const html=read(dir+'index.html');
const payload=html.match(/<script id="quiz-data" type="application\/json">([\s\S]*?)<\/script>/);
assert.ok(payload,'Banco não integrado');
assert.equal(JSON.parse(payload[1]).questions.length,60);
for(const s of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].filter(m=>!m[0].includes('application/json'))){
 new vm.Script(s[1]);
}
const pdf=dir+'apostila_ia_pequenos_negocios_empreendedores_20h.pdf';
assert.ok(existsSync(pdf));
assert.equal(Number(execFileSync('pdfinfo',[pdf],{encoding:'utf8'}).match(/^Pages:\s+(\d+)/m)?.[1]),46);
for(const p of ['cursos-ia/index.html','catalogo-gratuito.html','sitemap.xml','sitemap-urls.txt']){
 assert.ok(read(p).includes('13-ia-para-pequenos-negocios-e-empreendedores'),p+' não integrado');
}
assert.ok(read('index.html').includes('13 cursos completos'));
assert.ok(!html.includes('Criação de Videoaulas, Slides e Áudios com Inteligência Artificial'));
console.log('OK Curso 13: 30 lições, 60 questões distintas, 15 respostas por letra, 46 páginas, catálogo e JavaScript.');
