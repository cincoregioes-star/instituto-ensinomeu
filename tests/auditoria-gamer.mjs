import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const slugs=['geografia-9ano-aula02','historia-9ano-aula01','matematica-9ano-aula01','portugues-9ano-aula01','ciencias-9ano-aula01'];
for(const slug of slugs){
 const window={};
 vm.runInNewContext(read('simulados/bancos/'+slug+'.js'),{window},{timeout:1500});
 const q=window.ENSINOMEU_QUIZ;
 assert.ok(q&&q.slug===slug,slug+' slug incorreto');
 assert.equal(q.questoes.length,20,slug+' deve possuir 20 questões');
 assert.equal(new Set(q.questoes.map(x=>x.q)).size,20,slug+' contém questões duplicadas');
 q.questoes.forEach((x,i)=>{assert.equal(x.options.length,4,slug+' Q'+(i+1));assert.ok(Number.isInteger(x.correct)&&x.correct>=0&&x.correct<4);assert.ok(x.explain.length>=20,slug+' falta comentário');assert.ok(x.topic.length>=3)});
 const page=read('simulados/'+slug+'.html');
 assert.ok(page.includes('bancos/'+slug+'.js')&&page.includes('motor-gamer.js'),slug+' não aponta para o motor');
 console.log('OK '+slug+': 20 questões, explicações e motor');
}
assert.ok(read('simulados/geografia-9ano-aula01.html').includes('ensino-indicadores/enviar'),'Simulado antigo não sincroniza');
const routes=['dashboard-aluno.html','painel-controle.html','ensino-indicadores.js','indicadores.css','simulados/motor-gamer.css','simulados/motor-gamer.js'];
routes.forEach(p=>assert.ok(read(p).length>300,'Arquivo ausente: '+p));
assert.ok(read('painel.html').includes('id="painel-controle-card" hidden'),'Atalho administrativo não está oculto');
assert.ok(read('ensino-painel.js').includes("gestorPermitido"),'Filtro de menu ausente');
console.log('OK: Dashboard do aluno e Painel de Controle com proteção de menu e API declarada');
