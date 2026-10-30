import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read = file => readFileSync(file, 'utf8');
const index = read('index.html');
const css = read('site.css');
const signup = read('cadastro.html');
const signupJS = read('cadastro.js');
const login = read('login.html');
const plans = read('planos.html');
const privacy = read('privacidade.html');
const problems = [];
function check(label, fn) {
  try { fn(); console.log('OK: ' + label); }
  catch (error) { console.error('FALHA: ' + label + ': ' + error.message); problems.push(label); }
}
check('Arquivos essenciais presentes', () => {
  for (const file of ['site.js','site.css','config.js','index.html','login.html','cadastro.html','cadastro.js','painel.html','planos.html','privacidade.html','assets/brasao.png','assets/favicon.png'])
    assert.ok(existsSync(file), file);
});
check('IDs da página inicial sem repetição', () => {
  const ids = [...index.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size);
});
check('Navegação interna com destino', () => {
  for (const [fragment] of [...index.matchAll(/href="#([^"]+)"/g)].map(m => [m[1]]))
    assert.ok(index.includes('id="' + fragment + '"'), '#' + fragment);
  for (const match of index.matchAll(/href="planos\.html#([^"]+)"/g))
    assert.ok(plans.includes('id="' + match[1] + '"'), match[1]);
});
check('Cadastro acessível e formulário completo', () => {
  assert.ok(index.includes('href="cadastro.html"'));
  assert.ok(login.includes('href="cadastro.html"'));
  for (const id of ['name','email','kind','grade','password','confirm','adult','privacy','signup-btn','message'])
    assert.ok(signup.includes('id="' + id + '"'), id);
});
check('Cadastro sem matrícula automática nem papel privilegiado', () => {
  assert.ok(signupJS.includes('auth.signUp('));
  assert.ok(!signupJS.includes('grade_enrollments'));
  assert.ok(!signupJS.includes('service_role'));
  assert.ok(!/role\s*:\s*['"](?:admin|teacher)/.test(signupJS));
  assert.ok(privacy.includes('responsáveis legais'));
});
check('Slideshow sem repetições de mesmo brasão', () => {
  assert.equal((index.match(/class="slide(?: is-active)?"/g) || []).length, 1);
  assert.ok(!index.includes('id="prev-slide"'));
});
check('CSS atualizado e principais componentes estilizados', () => {
  assert.ok(index.includes('site.css?v=7436'));
  for (const selector of ['.access-link','.float-card','.footer-grid','.grades-count','.live-dot','.stage-index','.small-square','.header-signup'])
    assert.ok(css.includes(selector), selector);
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g,'');
  assert.equal((cleaned.match(/{/g)||[]).length, (cleaned.match(/}/g)||[]).length);
});
check('Todos os links locais da página inicial existem', () => {
  for (const match of index.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1].split(/[?#]/)[0];
    if (!target || /^(?:https?:|mailto:|tel:|\/)/.test(target)) continue;
    assert.ok(existsSync(target), target);
  }
});
if (problems.length) { console.error('Auditoria falhou em ' + problems.length + ' verificações.'); process.exitCode = 1; }
else console.log('Auditoria estrutural concluída com sucesso.');
