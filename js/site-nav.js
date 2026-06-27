// Ranking Pro — navegação compacta (root-relative)

(function (global) {
  'use strict';

  const P = () => global.RankingProPaths;

  function currentKey() {
    const path = global.location.pathname.toLowerCase();
    if (path.includes('/dev/')) return 'dev';
    if (path.includes('/p/')) return 'profile';
    if (path.includes('/avaliar/')) return 'avaliar';
    if (path.includes('/qr/')) return 'qr';
    return 'home';
  }

  function renderNav(host) {
    if (!host || !P()) return;
    const key = currentKey();
    const items = [
      { key: 'home', label: 'Início', href: P().siteUrl('index.html') },
      { key: 'dev', label: 'Gerar QR', href: P().siteUrl('dev/gerar-qr.html') },
      { key: 'profile', label: 'Perfil', href: P().siteUrl('p/'), id: 'nav-profile' }
    ];

    host.innerHTML =
      '<nav class="rp-site-nav" aria-label="Navegação">' +
      items.map(function (item) {
        const cls = item.key === key ? ' is-active' : '';
        const id = item.id ? ' id="' + item.id + '"' : '';
        return '<a class="rp-site-nav__link' + cls + '"' + id + ' href="' + item.href + '">' + item.label + '</a>';
      }).join('') +
      '</nav>';
  }

  function mount() {
    const host = document.getElementById('rp-site-nav');
    if (!host) return;
    renderNav(host);
    const params = new URLSearchParams(global.location.search);
    const profId = params.get('id');
    const navProfile = document.getElementById('nav-profile');
    if (profId && navProfile && P()) {
      navProfile.href = P().siteUrl('p/?id=' + encodeURIComponent(profId));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  global.RankingProNav = { renderNav, mount };
})(window);