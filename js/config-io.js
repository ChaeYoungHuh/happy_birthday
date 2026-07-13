/** 정적 생일 페이지용 — 기본 설정만 로드 */
(function () {
  function resolveMediaUrl(src) {
    if (!src) return src;
    if (/^(data:|https?:|blob:)/i.test(src)) return src;
    // GitHub Pages 등에서도 동작하도록 상대 경로 유지
    return String(src).replace(/^\.\//, "");
  }

  function normalizeMediaPaths(cfg) {
    const out = structuredClone(cfg);
    Object.keys(out.images || {}).forEach((k) => {
      if (out.images[k] && out.images[k].src) {
        out.images[k].src = resolveMediaUrl(out.images[k].src);
      }
    });
    Object.keys(out.sounds || {}).forEach((k) => {
      out.sounds[k] = resolveMediaUrl(out.sounds[k]);
    });
    (out.slides || []).forEach((s) => {
      s.image = resolveMediaUrl(s.image);
      s.sound = resolveMediaUrl(s.sound);
      s.bottomImage = resolveMediaUrl(s.bottomImage);
    });
    return out;
  }

  async function loadConfig() {
    window.GYU_LOAD_ERROR = null;
    return normalizeMediaPaths(structuredClone(window.GYU_DEFAULT_CONFIG));
  }

  window.GYU_CONFIG_IO = {
    loadConfig,
    getPublishIdFromLocation: () => null,
    resolveMediaUrl,
    normalizeMediaPaths,
  };
})();
