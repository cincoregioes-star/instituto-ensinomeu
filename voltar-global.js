/* Instituto EnsinoMeu — Navegação global v1
   Retorna somente ao histórico interno do próprio Instituto.
   Abertura direta: destino contextual e seguro. */
(() => {
  'use strict';
  if (document.getElementById('ensino-voltar-global')) return;
  // Resolve o caminho pelo próprio script: funciona no GitHub Pages e no ambiente de testes.
  const scriptURL = document.currentScript?.src || location.href;
  const base = new URL('.',scriptURL).pathname;
  const pathname = location.pathname;
  if (!pathname.startsWith(base)) return;
  const relative = pathname.slice(base.length);
  const home = base + 'index.html';
  const panel = base + 'painel.html';
  const source = relative.toLowerCase();
  function fallback() {
    if (source.startsWith('simulados/')) {
      const name = source.split('/').pop() || '';
      const area = name.split('-9ano-')[0];
      const allowed = ['geografia','historia','matematica','portugues','ciencias'];
      if (allowed.includes(area)) {
        const hash = area === 'geografia' ? (name.includes('aula02') ? '#titulo-video-02' : '#titulo-video') : '';
        return base + area + '-9ano.html' + hash;
      }
      return panel;
    }
    if (['dashboard-aluno.html','painel-controle.html','admin.html','apostilas.html','prova.html','trilha.html'].includes(source)) return panel;
    if (/-9ano\.html$/.test(source)) return panel;
    if (source === 'painel.html') return home;
    if (source === 'index.html' || source === '') return panel;
    return home;
  }
  const button = document.createElement('a');
  button.id = 'ensino-voltar-global';
  button.href = fallback();
  button.className = 'ensino-voltar';
  button.textContent = '← Voltar';
  button.setAttribute('aria-label', 'Voltar para a tela anterior');
  button.title = 'Voltar à tela anterior do Instituto EnsinoMeu';
  button.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    let referrer = null;
    try { referrer = document.referrer ? new URL(document.referrer) : null; } catch (_) {}
    const validHistory = history.length > 1 && referrer
      && referrer.origin === location.origin
      && referrer.pathname.startsWith(base)
      && (referrer.pathname !== location.pathname || referrer.search !== location.search || referrer.hash !== location.hash);
    if (validHistory) {
      history.back();
    } else {
      location.assign(button.href);
    }
  });
  const style = document.createElement('style');
  style.id = 'ensino-voltar-estilo';
  style.textContent = `
    .ensino-voltar {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
      flex: 0 0 auto;
      padding: 9px 13px !important;
      border: 1px solid rgba(255,255,255,.45) !important;
      border-radius: 11px !important;
      background: linear-gradient(125deg,#075c4b,#0c7b70) !important;
      box-shadow: 0 6px 16px rgba(0,34,40,.22) !important;
      color: #fff !important;
      text-decoration: none !important;
      font: 800 13px/1.25 system-ui,Arial,sans-serif !important;
      white-space: nowrap !important;
      cursor: pointer !important;
      transition: transform .17s ease,box-shadow .17s ease,filter .17s ease !important;
      z-index: 10000;
    }
    .ensino-voltar:hover {filter:brightness(1.12); transform:translateY(-2px) scale(1.035);box-shadow:0 10px 23px rgba(0,38,47,.32) !important}
    .ensino-voltar:focus-visible {outline:3px solid #edbc56 !important;outline-offset:3px}
    .ensino-voltar--flutuante {
      position:fixed !important;
      left: max(12px,env(safe-area-inset-left)) !important;
      bottom: max(13px,env(safe-area-inset-bottom)) !important;
      background: linear-gradient(125deg,#063e59,#087563) !important;
    }
    @media(max-width:760px) {
      .ensino-voltar {
        position:fixed !important;
        left:max(10px,env(safe-area-inset-left)) !important;
        bottom:max(11px,env(safe-area-inset-bottom)) !important;
        padding: 11px 14px !important;
        font-size: 13px !important;
      }
    }
    @media(prefers-reduced-motion:reduce) {.ensino-voltar{transition:none!important}.ensino-voltar:hover{transform:none!important}}
    @media print {.ensino-voltar{display:none!important}}
  `;
  document.head.appendChild(style);
  const nav = document.querySelector('header nav');
  const actions = document.querySelector('header .top-actions, header .actions');
  const host = nav || actions;
  if (host) {
    host.insertBefore(button,host.firstChild);
  } else {
    button.classList.add('ensino-voltar--flutuante');
    document.body.appendChild(button);
  }
})();