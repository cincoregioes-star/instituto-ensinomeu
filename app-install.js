/* Instalação PWA do Instituto EnsinoMeu: navegador Android, iOS e desktop. */
(() => {
  'use strict';
  if (window.__ensinoMeuAppReady) return;
  window.__ensinoMeuAppReady = true;

  const current = document.currentScript;
  const base = new URL('.', current && current.src ? current.src : location.href);
  if (!location.pathname.startsWith(base.pathname)) return;
  const asset = (name) => new URL(name, base).href;

  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = asset('manifest.webmanifest');
    document.head.appendChild(link);
  }
  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    const link = document.createElement('link');
    link.rel = 'apple-touch-icon';
    link.href = asset('assets/apple-touch-icon.png');
    document.head.appendChild(link);
  }
  const mobileMeta = [
    ['apple-mobile-web-app-capable', 'yes'],
    ['apple-mobile-web-app-status-bar-style', 'black-translucent'],
    ['apple-mobile-web-app-title', 'EnsinoMeu']
  ];
  mobileMeta.forEach(([name, content]) => {
    if (document.querySelector(`meta[name="${name}"]`)) return;
    const meta = document.createElement('meta');
    meta.name = name;
    meta.content = content;
    document.head.appendChild(meta);
  });

  if ('serviceWorker' in navigator && window.isSecureContext) {
    const registerApp = () => {
      navigator.serviceWorker.register(asset('service-worker.js'), { scope: base.pathname })
        .catch((error) => console.warn('EnsinoMeu: instalação offline indisponível', error));
    };
    if (document.readyState === 'complete') registerApp();
    else window.addEventListener('load', registerApp, { once: true });
  }

  const installButton = document.getElementById('instalar-app');
  if (!installButton) return;
  const installed = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (installed()) { installButton.hidden = true; return; }

  let promptEvent = null;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    promptEvent = event;
  });
  window.addEventListener('appinstalled', () => {
    promptEvent = null;
    installButton.hidden = true;
    document.getElementById('em-install-help')?.remove();
  });

  function showHelp() {
    document.getElementById('em-install-help')?.remove();
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const android = /android/i.test(navigator.userAgent);
    const instructions = ios
      ? 'Abra este site no Safari, toque em Compartilhar (quadrado com seta) e escolha “Adicionar à Tela de Início”.'
      : android
        ? 'Abra este site no Google Chrome, toque no menu ⋮ e escolha “Instalar app” ou “Adicionar à tela inicial”.'
        : 'No Chrome ou Edge, abra o menu do navegador e escolha “Instalar Instituto EnsinoMeu”. Você também pode usar o ícone de instalação na barra de endereço.';
    const dialog = document.createElement('dialog');
    dialog.id = 'em-install-help';
    dialog.setAttribute('aria-labelledby', 'em-install-heading');
    dialog.style.cssText = 'border:1px solid #c9e1e8;border-radius:19px;max-width:min(92vw,460px);padding:26px 25px 23px;box-shadow:0 20px 70px #001c3366;color:#123b51;font:15px/1.6 system-ui,sans-serif;background:#fff';
    dialog.innerHTML = '<h2 id="em-install-heading" style="margin:0 0 8px;font-size:24px;line-height:1.2;color:#062d4a">📲 Instale o EnsinoMeu</h2>' +
      '<p style="margin:0 0 12px">' + instructions + '</p>' +
      '<p style="font-size:13px;color:#4f6d7b">A instalação é gratuita. O aplicativo utiliza o mesmo conteúdo do site; aulas e arquivos maiores precisam de internet.</p>' +
      '<button type="button" style="min-height:44px;border:0;border-radius:10px;padding:11px 21px;background:#06745b;color:#fff;font:800 15px system-ui,sans-serif;cursor:pointer">Entendi</button>';
    document.body.appendChild(dialog);
    dialog.querySelector('button').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => dialog.remove());
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  installButton.addEventListener('click', async () => {
    if (!promptEvent) { showHelp(); return; }
    const availablePrompt = promptEvent;
    promptEvent = null;
    try {
      await availablePrompt.prompt();
      const decision = await availablePrompt.userChoice;
      if (decision?.outcome === 'accepted') installButton.hidden = true;
    } catch (_) {
      showHelp();
    }
  });
})();
