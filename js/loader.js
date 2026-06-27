// Ranking Pro — loader slim (Fase 2)

(function () {
  'use strict';

  const page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

  const CORE = [
    'config.js',
    'js/shark-mode.js',
    'js/utils.js',
    'js/api.js',
    'js/session.js',
    'js/flow-registry.js',
    'js/profile-selector.js',
    'js/confirm-modal.js'
  ];

  const OPTIONAL = [];
  const needsUser = /^(login|selecionar-perfil|selecionar-cliente|selecionar-profissional|selecionar-estabelecimento|cliente|dashboard-profissional|dashboard-estabelecimento)/.test(page);

  if (needsUser) OPTIONAL.push('js/user-service.js');

  const scripts = CORE.concat(OPTIONAL);
  const CACHE_BUST = '20260627-phase2';
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
    script.onload = function () {
      loaded++;
      loadNext();
    };
    script.onerror = function () {
      console.error('Erro ao carregar:', src);
      loaded++;
      loadNext();
    };
    document.head.appendChild(script);
  }

  loadNext();
})();