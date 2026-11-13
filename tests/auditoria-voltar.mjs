import {readFileSync,readdirSync} from 'node:fs';
import {join,relative} from 'node:path';
import assert from 'node:assert/strict';

const root=process.cwd();
function files(dir){
 return readdirSync(dir,{withFileTypes:true}).flatMap(item=>item.isDirectory()?files(join(dir,item.name)):[join(dir,item.name)]);
}
const htmlFiles=files(root).filter(file=>file.endsWith('.html') && !relative(root,file).startsWith('node_modules/')
 && !relative(root,file).startsWith('.git/') && !/^google[^/]*\.html$/i.test(relative(root,file)));
const backScript=readFileSync(join(root,'voltar-global.js'),'utf8');
assert.match(backScript,/document\.referrer/);
assert.match(backScript,/history\.back\(\)/);
assert.match(backScript,/location\.assign\(button\.href\)/);
assert.match(backScript,/aria-label/);
assert.match(backScript,/document\.currentScript/);
for(const file of htmlFiles){
 const name=relative(root,file).replaceAll('\\','/');
 const html=readFileSync(file,'utf8');
 const wanted='../'.repeat(name.split('/').length-1)+'voltar-global.js';
 const found=[...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']*voltar-global\.js[^"']*)["'][^>]*><\/script>/gi)];
 if(name==='mapa-do-site.html' && found.length===0 && html.includes('href="./">Início</a>')){
  console.log('OK navegação própria do mapa do site');
  continue;
 }
 if(name.startsWith('cursos-ia/') && found.length===0){
  const hasInternalHome=html.includes('id="btn-home"') && html.includes('Abrir EnsinoMeu');
  const hasCatalogBack=name==='cursos-ia/index.html' && html.includes('href="../index.html"');
  assert.ok(hasInternalHome||hasCatalogBack,name+' precisa de navegação de saída ou início');
  console.log('OK navegação própria do curso: '+name);
  continue;
 }
 assert.equal(found.length,1,name+' deve possuir exatamente um botão global');
 assert.ok(found[0][1].startsWith(wanted),name+' deve usar caminho correto do script');
 console.log('OK navegação Voltar: '+name);
}
assert.ok(htmlFiles.length>=39,'Número de páginas menor do que o inventário base: revisar inclusão de Voltar');
console.log('OK: botão Voltar em todas as '+htmlFiles.length+' telas, sem duplicatas.');
