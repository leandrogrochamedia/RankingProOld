// Ranking Pro — QR session validation & creation (Proofly qr_codes)

(function (global) {
  'use strict';

  const API = () => global.RankingProAPI;

  async function validateToken(token) {
    if (!token) return { status: 'invalid' };
    return API().rpc('validate_qr_token', { p_token: token });
  }

  async function createSession(professionalId, expiresHours = 2) {
    return API().rpc('create_qr_session', {
      p_professional_id: professionalId,
      p_expires_hours: expiresHours,
      p_app_base_url: global.location.origin
    });
  }

  function getTokenFromUrl() {
    const params = new URLSearchParams(global.location.search);
    return params.get('token') || params.get('qr_token') || null;
  }

  function getProfessionalIdFromUrl() {
    const params = new URLSearchParams(global.location.search);
    return params.get('professionalId') || params.get('professional_id') || null;
  }

  function buildQrUrl(token) {
    const base = global.location.origin + '/qr/';
    return base + '?token=' + encodeURIComponent(token);
  }

  function buildAvaliarUrl(token) {
    const base = global.location.origin + '/avaliar/';
    return base + '?token=' + encodeURIComponent(token);
  }

  function buildProfileUrl(professionalId) {
    return global.location.origin + '/p/?id=' + encodeURIComponent(professionalId);
  }

  function getProfessionalIdFromRpc(data) {
    return data?.professional_id || data?.professional_slug || null;
  }

  global.RankingProQR = {
    validateToken,
    createSession,
    getTokenFromUrl,
    getProfessionalIdFromUrl,
    buildQrUrl,
    buildAvaliarUrl,
    buildProfileUrl,
    getProfessionalIdFromRpc
  };
})(window);