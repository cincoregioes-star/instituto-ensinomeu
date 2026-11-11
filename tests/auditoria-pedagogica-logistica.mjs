// Auditoria pedagógica incremental dos simulados Gabarito Logística.
// Este teste NÃO declara 1.200 questões validadas pedagogicamente.
// Exige rastreabilidade dos itens revistos e mede pendências de qualidade.
import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const root="conteudos-recuperados/logistica/";
const html=fs.readFileSync(root+"index.html","utf8");
const start='<script id="dados" type="application/json">';
const p=html.indexOf(start);
assert.ok(p>=0,"Banco original não localizado");
const end=html.indexOf("</script>",p+start.length);
assert.ok(end>p);
const base=JSON.parse(html.slice(p+start.length,end));
const extras={};
const scripts=[
 "logistica-complementar.js",
 "logistica-complementar-lote2.js",
 "logistica-complementar-lote3.js",
 "logistica-complementar-lote4.js",
 "logistica-complementar-lote5.js",
 "logistica-complementar-lote6.js"
];
for(const src of scripts){
 const sandbox={window:{}};
 vm.runInNewContext(fs.readFileSync(root+src,"utf8"),sandbox,{timeout:3000});
 const datasets=Object.values(sandbox.window).filter(x=>x&&typeof x==="object");
 assert.equal(datasets.length,1,"Arquivo de extensão inválido: "+src);
 for(const [id,items] of Object.entries(datasets[0])){
  assert.ok(!extras[id],"Trilha incluída mais de uma vez: "+id);
  extras[id]=items;
 }
}
const norm=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9$]/g,"");
let total=0,originais=0,adicionadas=0,revisadas=0,exemplosRevisados=0;
const revisoesEsperadas={seg:14,mov:9,adm:15,inv:10,sel:7,rec:9,est:10};
const porTrilha=[];
for(const track of base.tracks){
 const original=base.banks[track.id];
 const novos=extras[track.id];
 assert.equal(original.length,10);
 assert.equal(novos.length,90);
 const bank=[...original,...novos];
 assert.equal(bank.length,100);
 const enunciados=new Set();
 let reviewThis=0;
 for(const [i,q] of bank.entries()){
  assert.ok(q.q.length>=15,"Enunciado curto: "+track.id+":"+i);
  const k=norm(q.q);
  assert.ok(!enunciados.has(k),"Enunciado duplicado "+track.id+":"+i);
  enunciados.add(k);
  assert.equal(q.o.length,4);
  assert.equal(new Set(q.o.map(norm)).size,4,"Alternativas repetidas "+track.id+":"+i);
  assert.ok(q.o[q.a],"Gabarito fora da faixa "+track.id+":"+i);
  assert.ok(q.e&&q.e.trim().length>=20,"Justificativa ausente "+track.id+":"+i);
  if(q.revisao==="pedagogica-contextual-2026-11-11"){
   assert.ok(i>=10,"Não era permitido substituir questões originais");
   assert.ok(q.criterio?.includes("distratores pertinentes"),"Revisão sem critério");
   assert.ok(q.e.length>=105,"Revisão sem justificativa específica "+track.id+":"+i);
   reviewThis++;
   revisadas++;
   if(i===10||i===11)exemplosRevisados++;
  }
 }
 assert.equal(reviewThis,revisoesEsperadas[track.id]??2,"Número de revisões rastreadas inconsistente: "+track.id);
 porTrilha.push({id:track.id,total:bank.length,revisadas:reviewThis,pendentes:bank.length-reviewThis});
 total+=bank.length;originais+=original.length;adicionadas+=novos.length;
}
assert.equal(total,1200);
assert.equal(originais,120);
assert.equal(adicionadas,1080);
assert.equal(revisadas,84);
assert.equal(exemplosRevisados,24);

const fila=JSON.parse(fs.readFileSync(root+"PENDENCIAS-PEDAGOGICAS-PRIORITARIAS.json","utf8"));
assert.equal(fila.itens.length,120,"Fila histórica de prioridade alterada");
let sinalizadosResolvidos=0;
for(const item of fila.itens){
 const idx=item.indiceNoBancoComplementar;
 const validado=Number.isInteger(idx)&&extras[item.trilha]?.[idx]?.revisao==="pedagogica-contextual-2026-11-11";
 if(item.status==="revisado-individualmente"){
  assert.ok(validado,"Marcado como revisado mas sem alteração rastreada: "+item.trilha+":"+idx);
  sinalizadosResolvidos++;
 }else{
  assert.equal(item.status,"pendente-de-revisao-humana","Status de fila desconhecido");
  assert.ok(!validado,"Questão revisada não foi baixada da fila: "+item.trilha+":"+idx);
 }
}
assert.equal(sinalizadosResolvidos,60);
assert.equal(fila.totalRevisadasNaFila,60);
assert.equal(fila.totalPendentesNaFila,60);
assert.equal(fila.questoesRevisadasComMarcador,84);
assert.equal(fila.pendentesRevisaoIndividual,1116);

console.log("AUDITORIA PEDAGÓGICA INCREMENTAL:");
console.log(JSON.stringify({total,originais,adicionadas,revisadas,pendentes:total-revisadas,porTrilha},null,2));
console.log("AVISO: auditoria estrutural concluída; 1.116 questões ainda requerem revisão pedagógica individual.");
console.log("Fila prioritária: 60 itens revistos e 60 pendentes, conferidos contra os arquivos de questões.");
