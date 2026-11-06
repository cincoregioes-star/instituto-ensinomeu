import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const base='https://cincoregioes-star.github.io/instituto-ensinomeu/';
const pages=['index.html','planos.html','privacidade.html','matematica-9ano.html','geografia-9ano.html','historia-9ano.html','portugues-9ano.html','ciencias-9ano.html','ensino-ia.html','apostila-ia.html'];
const protectedPages=['login.html','cadastro.html','painel.html','admin.html','apostilas.html','trilha.html','prova.html','ia-tutoria.html'];
const sitemap=read('sitemap.xml');
for(const file of pages){
 const text=read(file),url=file==='index.html'?base:base+file;
 assert.ok(text.includes('rel="canonical"'),file+' sem canonical');
 assert.ok(text.includes('href="'+url+'"'),file+' canonical divergente');
 assert.ok(text.includes('property="og:url"'),file+' sem og:url');
 assert.ok(text.includes('property="og:image"'),file+' sem imagem social');
 assert.ok(!/name="robots"[^>]*noindex/i.test(text),file+' indevidamente noindex');
 assert.ok(sitemap.includes('<loc>'+url+'</loc>'),file+' ausente no sitemap');
 console.log('OK público: '+file);
}
for(const file of protectedPages){
 const text=read(file);
 assert.ok(/name="robots"[^>]*noindex/i.test(text),file+' deve ser noindex');
 assert.ok(!sitemap.includes('<loc>'+base+file+'</loc>'),file+' não pode aparecer no sitemap');
}
const index=read('index.html'),m=index.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert.ok(m,'JSON-LD ausente');
const structured=JSON.parse(m[1]);assert.equal(structured['@context'],'https://schema.org');
assert.ok(structured['@graph'].some(x=>x['@type']==='EducationalOrganization'&&x.url===base));
assert.ok(structured['@graph'].some(x=>x['@type']==='WebSite'&&x.url===base));
const links=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
assert.equal(links.length,pages.length,'Sitemap deve incluir apenas páginas públicas enumeradas');
assert.equal(new Set(links).size,links.length,'URLs duplicadas');
console.log('Auditoria SEO V8 aprovada.');
