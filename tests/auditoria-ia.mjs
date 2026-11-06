import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=x=>readFileSync(x,'utf8');
const scope={window:{}};
vm.runInNewContext(read('ensino-ia-dados.js'),scope,{timeout:500});
vm.runInNewContext(read('ensino-ia-aprofundamento.js'),scope,{timeout:500});
const data=scope.window.ENSINOMEU_IA_DATA,detail=scope.window.ENSINOMEU_IA_EXT;
const grades=['fi-5','fii-6','fii-7','fii-8','fii-9','em-1','em-2','em-3'];
assert.ok(data&&detail,'Currículo deve carregar');
assert.deepEqual(Object.keys(data.series).sort(),grades.slice().sort(),'Séries devem ser 8');
let lessons=0,modules=0;
for(const grade of grades){
 const row=data.series[grade],extra=detail.series[grade];
 assert.equal(row.trimestres.length,3,grade+' deve ter 3 trimestres');
 assert.equal(extra.length,3,grade+' deve ter 3 complementos');
 for(let n=0;n<3;n++){
  const t=row.trimestres[n],e=extra[n];
  assert.equal(t.id,'T'+(n+1),grade+' trimestre divergente');
  assert.equal(t.aulas.length,4,grade+' deve ter 4 aulas por trimestre');
  assert.ok(typeof t.conteudo==='string'&&t.conteudo.length>35,grade+' sem conteúdo mínimo');
  assert.ok(typeof t.desafio==='string'&&t.desafio.length>30,grade+' sem desafio');
  assert.ok(t.opcoes.length===4&&Number.isInteger(t.correta)&&t.correta>=0&&t.correta<4,grade+' autocorreção inválida');
  for(const key of ['objetivo','laboratorio','reflexao'])assert.ok(e[key].length>45,grade+' campo '+key+' insuficiente');
  assert.ok(e.explicacao.length===2&&e.explicacao.every(t=>t.length>130),grade+' aprofundamento insuficiente');
  assert.equal(e.vocabulario.length,3,grade+' glossário inconsistente');
  lessons+=4;modules++;
 }
}
assert.equal(modules,24);assert.equal(lessons,96);
const catalog=JSON.parse(read('planos-catalogo.json'));
for(const grade of grades){
 const p=catalog.planos.find(x=>x.id===grade);
 assert.ok(p,'plano ausente: '+grade);
 assert.ok(p.materias.includes('Inteligência Artificial e Cultura Digital'),grade+' sem IA');
 assert.equal(p.disciplinas,p.materias.length,grade+' contador incorreto');
 const publicPlans=read('planos.html'),block=publicPlans.slice(publicPlans.indexOf('id="plano-'+grade+'"'));
 assert.ok(block.includes('apostila-ia.html?serie='+grade),grade+' sem apostila no catálogo');
}
const book=read('apostila-ia.html'),tutor=read('ia-tutoria.html'),student=read('ensino-ia.html');
assert.ok(book.includes('@page{size:A4'),'Apostila sem configuração de impressão A4');
assert.ok(book.includes('apostila-ia.js'),'Apostila sem renderização');
assert.ok(student.includes('ensino-ia-aprofundamento.js'),'Aula sem aprofundamento');
assert.ok(student.includes('tutor-link'),'Aula sem suporte');
assert.ok(tutor.includes('name="robots" content="noindex,nofollow"'),'Tutoria não deve ser indexada');
assert.ok(tutor.includes('ia-tutoria.js'),'Tutoria sem integração');
const front=read('ia-tutoria.js');
assert.ok(front.includes("client.auth.getUser()"),'Tutoria deve conferir sessão do aluno');
assert.ok(front.includes('/ia-tutoria/responder'),'Tutoria deve oferecer resposta autorizada');
assert.ok(front.includes('textContent'),'Tutoria deve renderizar textos sem HTML livre');
assert.ok(!front.includes('SUPABASE_SERVICE_ROLE_KEY'),'Segredo não pode estar no cliente');
console.log('OK currículo IA: 8 séries, 24 trimestres e '+lessons+' roteiros; materiais imprimíveis e tutoria integrada.');
