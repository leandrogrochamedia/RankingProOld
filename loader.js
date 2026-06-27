// ============================================================
// Ranking Pro — LOADER CANÔNICO (raiz · Opção A · Fase 2+)
// Subpastas qr/avaliar/p usam scripts ../ diretos.
// js/loader.js está DEPRECATED — use ./loader.js na raiz.
// ============================================================

(function () {
  'use strict';

  const page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

  const CORE = [
    './config.js',
    './shark-mode.js',
    './utils.js',
    './api.js',
    './session.js',
    './flow-registry.js',
    './profile-selector.js',
    './confirm-modal.js'
  ];

  const OPTIONAL = [];
  const isCliente = page.includes('cliente');
  const needsUser = /^(login|cadastro-cliente|meu-perfil|admin|selecionar-perfil|minhas-avaliacoes)/.test(page)
    || isCliente || page.startsWith('onboarding-') || page.startsWith('selecionar-')
    || /^dashboard-(profissional|estabelecimento)/.test(page);
  const needsReviews = isCliente || /^(perfil-page|minhas-avaliacoes|meu-perfil)/.test(page);
  const sharkOn = typeof SHARK_MODE !== 'undefined' && SHARK_MODE;
  const sharkDev = sharkOn && (
    (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) ||
    (typeof PROOFLY_DEV_MENU !== 'undefined' && PROOFLY_DEV_MENU)
  );
  const needsMarketplace = !sharkOn || sharkDev;

  if (needsUser) OPTIONAL.push('./user-service.js');
  if (page === 'meu-perfil.html') OPTIONAL.push('./meu-perfil.js');
  if (needsReviews) OPTIONAL.push('./reviews-service.js');
  if (needsMarketplace && /^(estabelecimento-marketplace|relatorio-contratante|admin)/.test(page)) {
    OPTIONAL.push('./talent-market.js', './hiring-service.js');
  }
  if (needsMarketplace && /^(estabelecimento-marketplace|perfil-page|dashboard-estabelecimento|dashboard-profissional)/.test(page)) {
    if (!OPTIONAL.includes('./hiring-service.js')) OPTIONAL.push('./hiring-service.js');
  }
  if (!sharkOn || sharkDev) {
    if (isCliente && !OPTIONAL.includes('./talent-market.js')) OPTIONAL.push('./talent-market.js');
  }

  const scripts = CORE.concat(OPTIONAL);
  const CACHE_BUST = '20260627-unified';
  let loaded = 0;

  function loadNext() {
    if (loaded >= scripts.length) {
      window.PROOFLY_SCRIPTS_READY = true;
      document.dispatchEvent(new Event('scriptsLoaded'));
      return;
    }

    const src = scripts[loaded];
    const script = document.createElement('script');
    script.src = src + (src.indexOf('?') >= 0 ? '&' : '?') + 'v=' + CACHE_BUST;
    script.async = false;
    script.onload = function () { loaded++; loadNext(); };
    script.onerror = function () {
      console.error('Erro ao carregar:', src);
      loaded++;
      loadNext();
    };
    document.head.appendChild(script);
  }

  loadNext();
})();