import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const root = process.cwd();
const dir = path.join(root, 'cursos-ia/10-planos-de-aula-com-ia');
const bank = JSON.parse(readFileSync(path.join(dir, 'banco_60_questoes.json'), 'utf8'));
const lessons = JSON.parse(readFileSync(path.join(dir, 'licoes_30.json'), 'utf8'));
const source = JSON.parse(readFileSync(path.join(dir, 'questoes_originais.json'), 'utf8'));
assert.equal(bank.questions.length, 60);
assert.equal(lessons.modules.length, 6);
assert.equal(lessons.modules.reduce((n, m) => n + m.lessons.length, 0), 30);
assert.equal(source.items.length, 60);
assert.equal(new Set(bank.questions.map(q => q.question)).size, 60);
assert.equal(new Set(bank.questions.map(q => JSON.stringify(q.options))).size, 60);
for (let m = 1; m <= 6; m++) assert.equal(bank.questions.filter(q => q.module === m).length, 10);
for (let i = 0; i < 4; i++) assert.equal(bank.questions.filter(q => q.correct === i).length, 15);
for (const q of bank.questions) {
  assert.equal(q.options.length, 4);
  assert.equal(new Set(q.options).size, 4);
  assert.ok(q.question.length >= 78);
  assert.ok(q.explanation.length >= 95);
  assert.ok(q.correct >= 0 && q.correct <= 3);
}
const total = Number(execFileSync('pdfinfo', [path.join(dir, 'apostila_planos_de_aula_com_ia_20h.pdf')], { encoding: 'utf8' }).match(/^Pages:\s+(\d+)/m)?.[1]);
assert.equal(total, 46);
for (const file of ['catalogo-gratuito.html', 'cursos-ia/index.html', 'sitemap.xml']) {
  const src = readFileSync(path.join(root, file), 'utf8');
  assert.ok(src.includes('10-planos-de-aula-com-ia'), file + ' sem curso 10');
}
assert.ok(readFileSync(path.join(root, 'index.html'), 'utf8').includes('10 cursos completos'));
for (const file of ['index.html', 'banco_60_questoes.json', 'licoes_30.json', 'apostila_planos_de_aula_com_ia_20h.pdf']) {
  assert.ok(existsSync(path.join(dir, file)), file);
}
console.log('Auditoria estática aprovada: 30 lições, 60 questões distintas, 46 páginas, catálogo e sitemap.');
if (process.env.TEST_BROWSER !== '1') process.exit(0);

const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
try {
  for (const [width, height] of [[1366, 768], [768, 960], [360, 720], [360, 640]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    await page.goto(pathToFileURL(path.join(dir, 'index.html')).href);
    await page.getByRole('button', { name: /Iniciar 60 questões/ }).click();
    const question = await page.locator('#question').textContent();
    assert.ok(question?.length > 75);
    assert.equal(await page.locator('#answers .answer').count(), 4);
    const metrics = await page.evaluate(() => {
      const bounds = selectors => Array.from(document.querySelectorAll(selectors)).map(el => {
        const b = el.getBoundingClientRect();
        return { top: b.top, bottom: b.bottom, left: b.left, right: b.right };
      });
      return {
        viewport: { w: innerWidth, h: innerHeight },
        documentWidth: document.documentElement.scrollWidth,
        question: bounds('#question'),
        answers: bounds('#answers .answer'),
        next: bounds('#next'),
      };
    });
    assert.ok(metrics.documentWidth <= width + 2, 'rolagem horizontal em ' + width);
    for (const a of [...metrics.answers, ...metrics.next]) {
      assert.ok(a.left >= 0 && a.right <= width + 2, 'elemento lateral cortado em ' + width);
      assert.ok(a.bottom <= height + 2, 'elemento vertical cortado em ' + width + 'x' + height + ': ' + JSON.stringify(metrics));
    }
    await page.locator('#answers .answer').first().click();
    assert.ok(await page.locator('#feedback').isVisible(), 'feedback deve aparecer');
    const after = await page.locator('#next').boundingBox();
    assert.ok(after && after.y + after.height <= height + 2, 'botão seguinte cortado após feedback em ' + width + 'x' + height);
    if (width === 1366) {
      for (let q = 1; q < 60; q++) {
        await page.locator('#next').click();
        assert.equal(await page.locator('#answers .answer').count(), 4, 'questão ' + (q + 1));
        await page.locator('#answers .answer').first().click();
      }
      await page.locator('#next').click();
      assert.ok(await page.locator('#result-percent').isVisible());
      const correct = Number(await page.locator('#r-correct').textContent());
      const wrong = Number(await page.locator('#r-wrong').textContent());
      assert.equal(correct + wrong, 60);
      await page.getByRole('button', { name: /Revisão/ }).first().click();
      assert.ok(await page.locator('#review-list').textContent());
    }
    await page.close();
    console.log('OK ' + width + 'x' + height + ': 4 alternativas, feedback e botão dentro da tela.');
  }
} finally {
  await browser.close();
}
console.log('CURSO 10 aprovado: 30 lições, PDF 46 páginas, 60 itens, navegação e catálogo.');
