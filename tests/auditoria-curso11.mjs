import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';

const dir='cursos-ia/11-avaliacoes-e-simulados-com-ia/';
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
 assert.ok(q.options.every(o=>o.length>45),'Distrator curto: '+q.id);
}
const html=read(dir+'index.html');
const data=html.match(/<script id="quiz-data" type="application\/json">([\s\S]*?)<\/script>/);
assert.ok(data,'Banco ausente na arena');
assert.equal(JSON.parse(data[1]).questions.length,60);
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].filter(m=>!m[0].includes('application/json'));
for(const s of scripts)new vm.Script(s[1]);
const pdf=dir+'apostila_avaliacoes_e_simulados_com_ia_20h.pdf';
assert.ok(existsSync(pdf));
assert.equal(Number(execFileSync('pdfinfo',[pdf],{encoding:'utf8'}).match(/^Pages:\s+(\d+)/m)?.[1]),46);
for(const p of ['cursos-ia/index.html','catalogo-gratuito.html','sitemap.xml']){
 assert.ok(read(p).includes('11-avaliacoes-e-simulados-com-ia'),p+' não integrado');
}
assert.ok(Number(read('index.html').match(/Nova escola gratuita de IA: (\d+) cursos completos/)?.[1])>=11,
          'O portal deve incluir pelo menos onze cursos');
console.log('OK Curso 11: 30 lições, 60 itens únicos, gabarito 15 por letra, PDF 46 páginas e catálogo.');
