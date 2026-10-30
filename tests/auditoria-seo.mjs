import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path,'utf8');
const base = 'https://cincoregioes-star.github.io/instituto-ensinomeu/';
const publicPages = ['index.html','planos.html','privacidade.html'];
const restrictedPages = ['login.html','cadastro.html','painel.html','admin.html','apostilas.html','trilha.html','prova.html'];
const sitemap = read('sitemap.xml');

for (const file of publicPages) {
  const content=read(file);
  const canonical = file === 'index.html' ? base : base+file;
  assert.ok(content.includes('rel="canonical"'),file+' canonical ausente');
  assert.ok(content.includes('href="'+canonical+'"'),file+' canonical incorreta');
  assert.ok(content.includes('property="og:url"'),file+' Open Graph incompleto');
  assert.ok(content.includes('property="og:image"'),file+' imagem Open Graph ausente');
  assert.ok(!/name="robots"[^>]*noindex/i.test(content),file+' marcado noindex');
  assert.ok(sitemap.includes('<loc>'+canonical+'</loc>'),file+' ausente no sitemap');
  console.log('OK indexável: '+canonical);
}
for(const file of restrictedPages){
  const content=read(file);
  assert.ok(/name="robots"[^>]*noindex/i.test(content),file+' deveria ser noindex');
  assert.ok(!sitemap.includes('<loc>'+base+file+'</loc>'),file+' página restrita no sitemap');
}
const home=read('index.html');
const structured=home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert.ok(structured,'dados estruturados não encontrados');
const json=JSON.parse(structured[1]);
assert.equal(json['@context'],'https://schema.org');
assert.ok(json['@graph'].some(e=>e['@type']==='EducationalOrganization' && e.url===base));
assert.ok(json['@graph'].some(e=>e['@type']==='WebSite' && e.url===base));
assert.ok(!sitemap.includes('login.html')&&!sitemap.includes('admin.html'));
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(urls.length,publicPages.length,'sitemap deve conter somente páginas públicas');
assert.equal(new Set(urls).size,urls.length,'URLs duplicadas no sitemap');
console.log('Auditoria de SEO e indexabilidade aprovada.');
