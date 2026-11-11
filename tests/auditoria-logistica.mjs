// Auditoria automatizada dos 12 simulados de Logística
// Preserva 120 questões antigas e confere 90 novas em Estoque e Recebimento.
import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const html=fs.readFileSync("conteudos-recuperados/logistica/index.html","utf8");
const extra=fs.readFileSync("conteudos-recuperados/logistica/logistica-complementar.js","utf8");
const startTag='<script id="dados" type="application/json">';
const pos=html.indexOf(startTag);
assert.ok(pos>=0,"Bancos originais não encontrados");
const end=html.indexOf("</script>",pos+startTag.length);
assert.ok(end>pos,"JSON incompleto");
const base=JSON.parse(html.slice(pos+startTag.length,end));
const sandbox={window:{}};
vm.runInNewContext(extra,sandbox);
const ampl=sandbox.window.LOGISTICA_EXTRAS;
assert.ok(ampl && typeof ampl==="object");
assert.equal(base.tracks.length,12);
assert.deepEqual(Object.keys(ampl).sort(),["est","rec"]);
let totalBase=0,totalFinal=0;
const normalizar=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");

for(const trilha of base.tracks){
 const orig=base.banks[trilha.id];
 assert.ok(Array.isArray(orig));
 assert.equal(orig.length,10,"Trilha original alterada: "+trilha.id);
 totalBase+=orig.length;
 const novas=ampl[trilha.id]||[];
 const expected=["est","rec"].includes(trilha.id)?90:0;
 assert.equal(novas.length,expected,"Ampliação incompleta: "+trilha.id);
 const full=[...orig,...novas];
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
assert.match(html,/logistica-complementar\.js/);
assert.match(html,/\.\.\/\.\.\/voltar-global\.js/);
assert.ok(!/R\$\s*19|pay\.kiwify|https?:[^"\s]*kiwify|comprar acesso/i.test(html),"Referência comercial na página");
const jsPrefix="<script>'use strict';";
const jsStart=html.indexOf(jsPrefix);
assert.ok(jsStart>=0,"Script principal não encontrado");
const jsEnd=html.indexOf("</script>",jsStart+jsPrefix.length);
assert.ok(jsEnd>jsStart);
new Function("'use strict';"+html.slice(jsStart+jsPrefix.length,jsEnd));
console.log("OK Logística: 12 trilhas; 120 questões originais; 180 novas; 300 totais; 5 módulos de 20 para Estoque e Recebimento.");
