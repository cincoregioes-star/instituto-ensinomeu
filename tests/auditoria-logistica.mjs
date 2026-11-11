// Auditoria técnica dos bancos do Gabarito Logística no EnsinoMeu.
// 12 trilhas com 10 questões originais cada; 10 trilhas ampliadas para 100.
import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const dir="conteudos-recuperados/logistica/";
const html=fs.readFileSync(dir+"index.html","utf8");
const marker='<script id="dados" type="application/json">';
const pos=html.indexOf(marker);
assert.ok(pos>=0,"Banco original não encontrado");
const end=html.indexOf("</script>",pos+marker.length);
assert.ok(end>pos,"JSON original incompleto");
const base=JSON.parse(html.slice(pos+marker.length,end));
const sandbox={window:{}};
for(const path of ["logistica-complementar.js","logistica-complementar-lote2.js","logistica-complementar-lote3.js","logistica-complementar-lote4.js","logistica-complementar-lote5.js"]){
 vm.runInNewContext(fs.readFileSync(dir+path,"utf8"),sandbox,{timeout:3000});
 assert.ok(html.includes('src="'+path+'"'),"Script não incluído na página: "+path);
}
const allExtras={...sandbox.window.LOGISTICA_EXTRAS,...sandbox.window.LOGISTICA_EXTRAS_LOTE2,...sandbox.window.LOGISTICA_EXTRAS_LOTE3,...sandbox.window.LOGISTICA_EXTRAS_LOTE4,...sandbox.window.LOGISTICA_EXTRAS_LOTE5};
const completeIds=["est","rec","pck","ops","sel","adm","mov","trp","seg","inv"];
assert.equal(base.tracks.length,12,"Trilhas incorretas");
assert.deepEqual(Object.keys(allExtras).sort(),completeIds.slice().sort(),"Bancos completos incorretos");
let initial=0,total=0,newCount=0;
const normalize=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9$]/g,"");
for(const track of base.tracks){
 const original=base.banks[track.id],added=allExtras[track.id]||[];
 assert.equal(original?.length,10,"O banco original foi alterado: "+track.id);
 const full=completeIds.includes(track.id);
 assert.equal(added.length,full?90:0,"Número incorreto de questões novas em "+track.id);
 const questions=[...original,...added];
 assert.equal(questions.length,full?100:10,"Total inválido da trilha "+track.id);
 assert.equal(questions.length/(full?20:5),full?5:2);
 const unique=new Set();
 questions.forEach((q,i)=>{
  assert.ok(typeof q.q==="string"&&q.q.trim().length>=18,"Enunciado incompleto "+track.id+":"+i);
  assert.ok(Array.isArray(q.o)&&q.o.length===4,"Quatro alternativas ausentes "+track.id+":"+i);
  assert.ok(q.o.every(a=>typeof a==="string"&&a.trim().length>=6),"Alternativa inválida "+track.id+":"+i);
  assert.equal(new Set(q.o.map(normalize)).size,4,"Alternativas duplicadas "+track.id+":"+i);
  assert.ok(Number.isInteger(q.a)&&q.a>=0&&q.a<4,"Gabarito fora do intervalo "+track.id+":"+i);
  assert.ok(typeof q.e==="string"&&q.e.length>=20,"Explicação ausente "+track.id+":"+i);
  const k=normalize(q.q);
  assert.ok(!unique.has(k),"Enunciado repetido "+track.id+":"+i);
  unique.add(k);
 });
 initial+=original.length;total+=questions.length;newCount+=added.length;
}
assert.equal(initial,120);
assert.equal(newCount,900);
assert.equal(total,1020);
assert.match(html,/\.\.\/\.\.\/voltar-global\.js/);
assert.doesNotMatch(html,/R\$\s*19|https?:[^"\s]*kiwify|comprar acesso/i);
const inlineTag="<script>'use strict';";
const jsStart=html.indexOf(inlineTag);
assert.ok(jsStart>=0,"Script da interface não encontrado");
const jsEnd=html.indexOf("</script>",jsStart+inlineTag.length);
assert.ok(jsEnd>jsStart);
new Function("'use strict';"+html.slice(jsStart+inlineTag.length,jsEnd));
const math=allExtras.adm.filter(q=>q.habilidade==="cálculo aplicado");
assert.equal(math.length,15,"Deverão existir 15 exercícios quantitativos de Excel");
const answers=["80 caixas","15 pedidos por turno","5% dos pedidos","15 pedidos/hora","29 pedidos","92% dos pedidos","8 dias","150 minutos","=C5*$B$2","3 ocorrências","R$ 75,00","85% da meta","465 pedidos","5% de devoluções","800 unidades"];
math.forEach((q,i)=>assert.equal(q.o[q.a],String(answers[i]),"Gabarito numérico inválido no cálculo "+(i+1)));
console.log("OK Logística: 12 trilhas, 120 questões preservadas, 900 adicionadas, 1020 totais; 10 trilhas completas com 5 módulos de 20.");
