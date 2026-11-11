// Auditoria automática do acervo Gabarito Logística no EnsinoMeu.
// Preserva 120 questões originais; exige 90 complementares para est e rec.
import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
const html=fs.readFileSync("conteudos-recuperados/logistica/index.html","utf8");
const extra=fs.readFileSync("conteudos-recuperados/logistica/logistica-complementar.js","utf8");
const m=html.match(/<script id="dados" type="application\\/json">([\\s\\S]*?)<\\/script>/);
assert.ok(m,"Base original não encontrada no HTML");
const base=JSON.parse(m[1]);
const sandbox={window:{}};
vm.runInNewContext(extra,sandbox);
const ampl=sandbox.window.LOGISTICA_EXTRAS;
assert.ok(ampl && typeof ampl==="object");
assert.equal(base.tracks.length,12);
assert.deepEqual(Object.keys(ampl).sort(),["est","rec"]);
let totalBase=0,totalFinal=0;
const normalizar=s=>String(s).normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
for(const trilha of base.tracks){
 const original=base.banks[trilha.id];
 assert.ok(Array.isArray(original));
 assert.equal(original.length,10,"Trilha original alterada: "+trilha.id);
 totalBase+=original.length;
 const novas=ampl[trilha.id]||[];
 const expected=["est","rec"].includes(trilha.id)?90:0;
 assert.equal(novas.length,expected,"Ampliação incompleta: "+trilha.id);
 const full=[...original,...novas];
 const expectedFull=expected?100:10;
 assert.equal(full.length,expectedFull,"Contagem incorreta: "+trilha.id);
 const byModule=expectedFull===100?20:5;
 assert.equal(full.length%byModule,0);
 assert.equal(full.length/byModule,expectedFull===100?5:2);
 const seen=new Set();
 full.forEach((q,i)=>{
  assert.equal(typeof q.q,"string");assert.ok(q.q.trim().length>=18,trilha.id+" pergunta "+i);
  assert.ok(Array.isArray(q.o)&&q.o.length===4,trilha.id+" quatro alternativas "+i);
  assert.ok(q.o.every(v=>typeof v==="string"&&v.trim().length>=5),trilha.id+" alternativas preenchidas "+i);
  assert.equal(new Set(q.o.map(normalizar)).size,4,trilha.id+" alternativas repetidas "+i);
  assert.ok(Number.isInteger(q.a)&&q.a>=0&&q.a<=3,trilha.id+" gabarito "+i);
  assert.ok(q.e&&q.e.length>=20,trilha.id+" explicação "+i);
  const key=normalizar(q.q);assert.ok(!seen.has(key),"Pergunta duplicada: "+trilha.id+" "+i);seen.add(key);
 });
 totalFinal+=full.length;
}
assert.equal(totalBase,120);
assert.equal(totalFinal,300);
assert.match(html,/logistica-complementar\\.js/);
assert.match(html,/\\.\\.\\/\\.\\.\\/voltar-global\\.js/);
assert.ok(!/R\\$\\s*19|checkout|Kiwify|comprar acesso/i.test(html),"Referência comercial na página");
const js=html.match(/<script>'use strict';([\\s\\S]*?)<\\/script>/);
assert.ok(js,"Script principal não encontrado");
new Function("'use strict';"+js[1]);
console.log("OK Logística: 12 trilhas, 120 questões originais, 180 novas, 300 totais; 5 módulos de 20 em Estoque e Recebimento.");
