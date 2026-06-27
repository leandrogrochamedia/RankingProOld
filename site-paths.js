// Ranking Pro — paths relativos à root do site (funciona em preview/iframe/file)

(function (global) {
  'use strict';

  function siteDepth() {
    const parts = global.location.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || '';
    if (/\.html?$/i.test(last)) parts.pop();
    return parts.length;
  }

  function prefix() {
    const d = siteDepth();
    return d ? '../'.repeat(d) : './';
  }

  function siteUrl(pathFromRoot) {
    const clean = String(pathFromRoot || '').replace(/^\//, '');
    return prefix() + clean;
  }

  function sitePathFromLocation() {
    const p = global.location.pathname || '/';
    const file = p.split('/').pop() || '';
    if (file === 'index.html' || file === '') {
      return '/' + (global.location.search || '') + (global.location.hash || '');
    }
    const dir = p.replace(/\/[^/]*$/, '') || '';
    const rel = dir ? dir + '/' + file : '/' + file;
    const normalized = rel.replace(/\/+/g, '/');
    return normalized + (global.location.search || '') + (global.location.hash || '');
  }

  global.RankingProPaths = {
    prefix,
    siteUrl,
    sitePathFromLocation
  };
})(window);