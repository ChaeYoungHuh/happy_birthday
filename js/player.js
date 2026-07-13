(async function () {
  const cfg = await window.GYU_CONFIG_IO.loadConfig();
  window.GYU_RUNTIME_CONFIG = cfg;

  document.title = cfg.meta.title || "생일축하합니다";
  document.documentElement.style.setProperty("--gyu-bg", cfg.colors.bg);
  document.documentElement.style.setProperty("--gyu-yes-bg", cfg.colors.yesBg);
  document.body.style.background = cfg.colors.bg;

  const boom = document.getElementById("boom");
  const huh = document.getElementById("huh");
  const tuco = document.getElementById("tuco");
  const bgm = document.getElementById("bgm");
  const start = document.getElementById("start");
  const main = document.getElementById("main");
  const noModal = document.getElementById("no-modal");
  const kick = document.getElementById("kick");
  const feet = document.getElementById("feet");
  const star1 = document.getElementById("star-1");
  const star2 = document.getElementById("star-2");
  const btnHello = document.getElementById("btn-hello");
  const btnYes = document.getElementById("btn-yes");
  const btnNo = document.getElementById("btn-no");
  const btnWait = document.getElementById("btn-wait");
  const yesScene = document.getElementById("yes-scene");
  const yesPhoto = document.getElementById("yes-photo");
  const usagiLayer = document.getElementById("usagi-layer");
  const wander = document.getElementById("wander");
  const congrats = document.getElementById("congrats");
  const congratsPhoto = document.getElementById("congrats-photo");
  const congratsText = document.getElementById("congrats-text");
  const tearBottom = document.getElementById("tear-bottom");
  const fireworks = document.getElementById("fireworks");
  const photo = document.querySelector(".photo");
  const question = document.querySelector(".question");
  const modalPhoto = document.querySelector(".modal-photo");
  const modalText = document.querySelector(".modal-text");

  function applyDom() {
    boom.src = cfg.sounds.hello;
    huh.src = cfg.sounds.no;
    tuco.src = cfg.sounds.tuco;
    bgm.src = cfg.sounds.bgm;

    btnHello.textContent = cfg.texts.hello;
    question.textContent = cfg.texts.question;
    btnYes.textContent = cfg.texts.yes;
    btnNo.textContent = cfg.texts.no;
    modalText.textContent = cfg.texts.modal;
    btnWait.textContent = cfg.texts.wait;

    photo.src = cfg.images.main.src;
    photo.style.width = `${cfg.images.main.width}px`;
    photo.style.height = "auto";

    modalPhoto.src = cfg.images.modal.src;
    modalPhoto.style.width = `${cfg.images.modal.width}px`;

    feet.src = cfg.images.feet.src;
    feet.style.width = `${cfg.images.feet.width}px`;

    yesPhoto.src = cfg.images.yesHero.src;
    yesPhoto.style.maxWidth = `${cfg.images.yesHero.width}px`;

    wander.src = cfg.images.wander.src;
    wander.style.width = `${cfg.images.wander.width}px`;

    tearBottom.src = cfg.images.tearBottom.src;
    tearBottom.style.width = `min(88vw, ${cfg.images.tearBottom.width}px)`;
  }

  applyDom();

  let kickStarted = false;
  let pulseTimer = null;
  let peakTimer = null;
  let starTimers = [];
  let forceStars = false;
  let pulseCount = 0;
  let pulsing = false;
  let fireworkTimer = null;
  let usagiTimer = null;
  let usagiSpawnTimers = [];
  let congratsTimer = null;
  let slideTimers = [];
  let wanderRaf = null;
  let wandering = false;

  btnHello.addEventListener("click", () => {
    start.hidden = true;
    main.hidden = false;
    boom.currentTime = 0;
    boom.play().catch(() => {});
  });

  btnYes.addEventListener("click", () => startYesScene());

  btnNo.addEventListener("click", () => {
    huh.currentTime = 0;
    huh.play().catch(() => {});
    noModal.hidden = false;
    noModal.classList.remove("is-open");
    main.classList.remove("is-shaking");
    void noModal.offsetWidth;
    noModal.classList.add("is-open");
    main.classList.add("is-shaking");
    if (!kickStarted) {
      kickStarted = true;
      setTimeout(startKickScene, cfg.timing.kickDelayMs);
    }
  });

  btnWait.addEventListener("click", () => {
    new Audio(cfg.sounds.wait).play().catch(() => {});
    goHome();
  });

  function playPunch() {
    new Audio(cfg.sounds.punch).play().catch(() => {});
  }

  function playIntroEffectSound() {
    const src = cfg.sounds.nya;
    if (!src) return;
    let count = cfg.timing.nyaCount;
    if (count == null) count = cfg.features.nyaTwice === false ? 0 : 2;
    count = Math.max(0, Math.min(8, Number(count) || 0));
    if (count <= 0) return;

    const playOne = (left) => {
      if (left <= 0) return;
      const a = new Audio(src);
      a.play().catch(() => {});
      if (left > 1) {
        a.addEventListener("ended", () => playOne(left - 1), { once: true });
      }
    };
    playOne(count);
  }

  function setStar(el, on) {
    el.classList.toggle("is-on", on);
  }

  function showBothStars() {
    forceStars = true;
    setStar(star1, true);
    setStar(star2, true);
    setTimeout(() => {
      forceStars = false;
    }, 180);
  }

  function clearStarTimers() {
    starTimers.forEach(clearTimeout);
    starTimers = [];
  }

  function stopPulse() {
    pulsing = false;
    clearTimeout(pulseTimer);
    clearTimeout(peakTimer);
    pulseTimer = null;
    peakTimer = null;
    feet.classList.remove("is-pulsing");
  }

  function blinkStar(el, minMs, maxMs) {
    const tick = () => {
      if (!forceStars) setStar(el, Math.random() > 0.45);
      const id = setTimeout(tick, minMs + Math.random() * (maxMs - minMs));
      starTimers.push(id);
    };
    tick();
  }

  function randAngle(min, max) {
    return min + Math.random() * (max - min);
  }

  function startFootPulse() {
    const cycleMs = cfg.timing.footCycleMs;
    const peakAt = cycleMs / 2;
    pulsing = true;
    pulseCount = 0;
    const runCycle = () => {
      if (!pulsing) return;
      feet.style.setProperty("--rot-start", `${randAngle(-38, 38)}deg`);
      feet.style.setProperty("--rot-peak", `${randAngle(-48, 48)}deg`);
      feet.style.setProperty("--rot-end", `${randAngle(-38, 38)}deg`);
      feet.style.setProperty("--scale-peak", (1.2 + Math.random() * 0.35).toFixed(3));
      feet.classList.remove("is-pulsing");
      void feet.offsetWidth;
      feet.classList.add("is-pulsing");
      peakTimer = setTimeout(() => {
        if (!pulsing) return;
        playPunch();
        showBothStars();
        pulseCount += 1;
        if (pulseCount === cfg.timing.waitAfterPulses) btnWait.hidden = false;
      }, peakAt);
      pulseTimer = setTimeout(runCycle, cycleMs);
    };
    runCycle();
  }

  function startKickScene() {
    kick.hidden = false;
    btnWait.hidden = true;
    setStar(star1, false);
    setStar(star2, false);
    const beginPulse = () => {
      if (!kickStarted) return;
      blinkStar(star1, 120, 380);
      blinkStar(star2, 220, 620);
      startFootPulse();
    };
    tuco.currentTime = 0;
    tuco.play().catch(() => {});
    const onEnded = () => {
      tuco.removeEventListener("ended", onEnded);
      beginPulse();
    };
    tuco.addEventListener("ended", onEnded);
    setTimeout(() => {
      if (!feet.classList.contains("is-pulsing") && kickStarted) {
        tuco.removeEventListener("ended", onEnded);
        beginPulse();
      }
    }, 1600);
  }

  function goHome() {
    kickStarted = false;
    stopPulse();
    clearStarTimers();
    tuco.pause();
    tuco.currentTime = 0;
    huh.pause();
    huh.currentTime = 0;
    setStar(star1, false);
    setStar(star2, false);
    btnWait.hidden = true;
    kick.hidden = true;
    noModal.hidden = true;
    noModal.classList.remove("is-open");
    main.classList.remove("is-shaking");
    start.hidden = true;
    main.hidden = false;
  }

  function burstFirework(side) {
    const burst = document.createElement("div");
    burst.className = `fw-burst fw-${side}`;
    const along = 8 + Math.random() * 84;
    if (side === "top") {
      burst.style.left = `${along}%`;
      burst.style.top = "0%";
    } else if (side === "bottom") {
      burst.style.left = `${along}%`;
      burst.style.top = "100%";
    } else if (side === "left") {
      burst.style.left = "0%";
      burst.style.top = `${along}%`;
    } else {
      burst.style.left = "100%";
      burst.style.top = `${along}%`;
    }
    const colors = ["#ff4d6d", "#ffd166", "#fff", "#ff9f1c", "#ff70a6", "#ffe66d", "#ff6b6b"];
    const count = 14 + Math.floor(Math.random() * 10);
    for (let i = 0; i < count; i++) {
      const spark = document.createElement("span");
      spark.className = "fw-spark";
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const dist = 40 + Math.random() * 90;
      spark.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      spark.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
      spark.style.background = colors[Math.floor(Math.random() * colors.length)];
      spark.style.animationDuration = `${0.7 + Math.random() * 0.55}s`;
      burst.appendChild(spark);
    }
    fireworks.appendChild(burst);
    setTimeout(() => burst.remove(), 1400);
  }

  function startFireworks() {
    if (!cfg.features.fireworks) return;
    const sides = ["top", "bottom", "left", "right"];
    sides.forEach((side, i) => setTimeout(() => burstFirework(side), i * 180));
    const loop = () => {
      burstFirework(sides[Math.floor(Math.random() * sides.length)]);
      if (Math.random() > 0.55) burstFirework(sides[Math.floor(Math.random() * sides.length)]);
      fireworkTimer = setTimeout(loop, 380 + Math.random() * 420);
    };
    fireworkTimer = setTimeout(loop, 900);
  }

  function spawnUsagi(pathClass) {
    const img = document.createElement("img");
    img.className = `usagi ${pathClass}`;
    img.src = cfg.images.usagi.src;
    img.style.width = `${cfg.images.usagi.width}px`;
    img.alt = "";
    usagiLayer.appendChild(img);
    void img.offsetWidth;
    img.classList.add("is-fly");
    const soundSrc = cfg.sounds.usagi;
    if (soundSrc) {
      const a = new Audio(soundSrc);
      a.play().catch(() => {});
    }
    setTimeout(() => img.remove(), 2600);
  }

  function getUsagiCount() {
    if (cfg.timing.usagiCount != null) return Math.max(0, Math.min(8, Number(cfg.timing.usagiCount) || 0));
    return Math.max(0, (Number(cfg.timing.usagiExtraCount) || 0) + 1);
  }

  function spawnUsagiWave() {
    const paths = ["path-a", "path-b", "path-c"];
    const count = getUsagiCount();
    for (let i = 0; i < count; i++) {
      const delay = cfg.timing.usagiIntervalMs * i;
      const t = setTimeout(() => spawnUsagi(paths[i % paths.length]), delay);
      usagiSpawnTimers.push(t);
    }
  }

  function stopWander() {
    wandering = false;
    if (wanderRaf) cancelAnimationFrame(wanderRaf);
    wanderRaf = null;
    wander.classList.remove("is-bouncing");
  }

  function startWander() {
    if (!cfg.features.wander) return;
    stopWander();
    wander.hidden = false;
    wander.classList.add("is-bouncing");
    wandering = true;
    const scene = yesScene.getBoundingClientRect();
    const w = wander.offsetWidth || cfg.images.wander.width;
    const h = wander.offsetHeight || 140;
    let x = Math.random() * Math.max(0, scene.width - w);
    let y = Math.random() * Math.max(0, scene.height - h);
    let vx = (Math.random() > 0.5 ? 1 : -1) * (2.2 + Math.random() * 2.4);
    let vy = (Math.random() > 0.5 ? 1 : -1) * (2.0 + Math.random() * 2.2);
    let rot = Math.random() * 360;
    let vr = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3);
    let bounce = 0;
    wander.style.left = `${x}px`;
    wander.style.top = `${y}px`;
    const tick = () => {
      if (!wandering) return;
      const box = yesScene.getBoundingClientRect();
      const maxX = Math.max(0, box.width - wander.offsetWidth);
      const maxY = Math.max(0, box.height - wander.offsetHeight);
      bounce += 0.22;
      const bounceY = Math.abs(Math.sin(bounce)) * 18;
      x += vx;
      y += vy;
      rot += vr;
      if (x <= 0) {
        x = 0;
        vx = Math.abs(vx) * (1.05 + Math.random() * 0.15);
      } else if (x >= maxX) {
        x = maxX;
        vx = -Math.abs(vx) * (1.05 + Math.random() * 0.15);
      }
      if (y <= 0) {
        y = 0;
        vy = Math.abs(vy) * (1.05 + Math.random() * 0.15);
      } else if (y >= maxY) {
        y = maxY;
        vy = -Math.abs(vy) * (1.05 + Math.random() * 0.15);
      }
      const speed = Math.hypot(vx, vy);
      if (speed > 5.5) {
        vx *= 5.5 / speed;
        vy *= 5.5 / speed;
      }
      wander.style.left = `${x}px`;
      wander.style.top = `${y}px`;
      wander.style.transform = `translateY(${-bounceY}px) rotate(${rot}deg) scale(${1 + Math.sin(bounce) * 0.12})`;
      wanderRaf = requestAnimationFrame(tick);
    };
    wanderRaf = requestAnimationFrame(tick);
  }

  function clearSlideTimers() {
    slideTimers.forEach(clearTimeout);
    slideTimers = [];
    clearTimeout(congratsTimer);
    congratsTimer = null;
    slideGen += 1;
  }

  let slideGen = 0;

  function preloadImage(src) {
    return new Promise((resolve) => {
      if (!src) {
        resolve();
        return;
      }
      const img = new Image();
      const done = () => resolve();
      img.onload = done;
      img.onerror = done;
      img.src = src;
      if (img.complete) done();
    });
  }

  function resetCongratsVisual() {
    congrats.classList.remove("is-show", "is-fade", "is-boom", "is-love-more", "is-tear");
    yesScene.classList.remove("is-booming");
    congrats.style.opacity = "0";
    congrats.style.animation = "none";
    congrats.style.transform = "translate(-50%, -50%) scale(0.2)";
  }

  function applyTextStyle(slide) {
    congratsText.classList.remove(
      "is-hyper",
      "is-tear-text",
      "fx-none",
      "fx-soft",
      "fx-glow",
      "fx-shadow",
      "fx-stroke",
      "fx-hyper"
    );
    const effect = slide.textEffect || "glow";
    congratsText.classList.add(`fx-${effect}`);
    if (effect === "hyper") congratsText.classList.add("is-hyper");
    congratsText.style.fontSize = `${slide.fontSize || 28}px`;
    congratsText.style.color = slide.fontColor || "#ffffff";
  }

  async function showSlide(slide, opts = {}) {
    const gen = ++slideGen;
    resetCongratsVisual();
    congrats.hidden = false;

    if (!slide.bottomImage) {
      tearBottom.hidden = true;
      tearBottom.classList.remove("is-show");
    }

    await Promise.all([
      preloadImage(slide.image),
      slide.bottomImage ? preloadImage(slide.bottomImage) : Promise.resolve(),
    ]);
    if (gen !== slideGen) return;

    congratsPhoto.src = slide.image;
    const w = slide.width || 280;
    congratsPhoto.style.width = `${w}px`;
    congratsPhoto.style.maxWidth = `${w}px`;
    congratsText.textContent = slide.text;
    applyTextStyle(slide);

    const bg = slide.bgColor || cfg.colors.yesBg;
    document.body.style.background = bg;
    document.documentElement.style.background = bg;

    const anim = slide.anim || "spin";
    congrats.style.animation = "";
    congrats.style.opacity = "";
    congrats.style.transform = "";
    void congrats.offsetWidth;

    if (opts.staticPreview) {
      congrats.classList.add("is-fade");
      congrats.style.opacity = "1";
      congrats.style.animation = "none";
      congrats.style.transform = "translate(-50%, -50%) scale(1)";
    } else if (anim === "fade") {
      congrats.classList.add("is-fade");
    } else if (anim === "boom") {
      congrats.classList.add("is-boom");
      yesScene.classList.add("is-booming");
    } else if (anim === "hyper") {
      congrats.classList.add("is-love-more");
    } else if (anim === "tear") {
      congrats.classList.add("is-tear");
    } else {
      congrats.classList.add("is-show");
    }

    if (slide.bottomImage) {
      tearBottom.src = slide.bottomImage;
      tearBottom.hidden = false;
      const bw = slide.bottomWidth || 220;
      tearBottom.style.width = `${bw}px`;
      tearBottom.style.maxWidth = `${bw}px`;
      tearBottom.classList.remove("is-show");
      void tearBottom.offsetWidth;
      tearBottom.classList.add("is-show");
    }

    if (slide.sound && !opts.mute) new Audio(slide.sound).play().catch(() => {});

    if (opts.staticPreview || opts.reportBounds) {
      const delays = opts.staticPreview ? [80, 300] : [80, 700, 1300, 2000];
      requestAnimationFrame(() => reportBounds());
      delays.forEach((ms) => setTimeout(reportBounds, ms));
    }
  }

  function reportBounds() {
    if (window.parent === window) return;
    const root = document.documentElement.getBoundingClientRect();
    const toLocal = (el) => {
      if (!el || el.hidden) return null;
      const r = el.getBoundingClientRect();
      return {
        left: r.left - root.left,
        top: r.top - root.top,
        width: r.width,
        height: r.height,
      };
    };
    window.parent.postMessage(
      {
        type: "gyu-bounds",
        photo: toLocal(congratsPhoto),
        bottom: toLocal(tearBottom),
      },
      location.origin
    );
  }

  function slideDelayMs(slide) {
    if (slide && slide.delaySec != null) {
      const sec = Number(slide.delaySec);
      if (Number.isFinite(sec) && sec > 0) return Math.max(500, Math.min(60000, sec * 1000));
    }
    return cfg.timing.slideIntervalMs || 4000;
  }

  function startSlides() {
    const slides = cfg.slides || [];
    if (!slides.length) return;
    yesPhoto.classList.remove("is-show");
    yesPhoto.classList.add("is-fade-out");

    // preload upcoming frames so swaps don't flash the previous image
    slides.forEach((s) => {
      preloadImage(s.image);
      if (s.bottomImage) preloadImage(s.bottomImage);
    });

    showSlide(slides[0]);
    let acc = 0;
    for (let i = 0; i < slides.length - 1; i++) {
      acc += slideDelayMs(slides[i]);
      const idx = i + 1;
      const t = setTimeout(() => showSlide(slides[idx]), acc);
      slideTimers.push(t);
    }
  }

  function startYesScene() {
    kickStarted = false;
    stopPulse();
    clearStarTimers();
    clearSlideTimers();
    usagiSpawnTimers.forEach(clearTimeout);
    usagiSpawnTimers = [];
    clearTimeout(usagiTimer);
    stopWander();

    tuco.pause();
    tuco.currentTime = 0;
    huh.pause();
    huh.currentTime = 0;
    boom.pause();

    start.hidden = true;
    main.hidden = true;
    yesScene.hidden = false;
    document.body.classList.add("is-pink");
    document.documentElement.classList.add("is-pink");
    document.body.style.background = cfg.colors.yesBg;
    document.documentElement.style.background = cfg.colors.yesBg;

    yesPhoto.classList.remove("is-show", "is-fade-out");
    void yesPhoto.offsetWidth;
    yesPhoto.classList.add("is-show");
    yesPhoto.style.opacity = "";

    usagiLayer.innerHTML = "";
    wander.hidden = true;
    congrats.hidden = true;
    congrats.classList.remove("is-show", "is-fade", "is-boom", "is-love-more", "is-tear");
    tearBottom.hidden = true;
    tearBottom.classList.remove("is-show");

    playIntroEffectSound();
    bgm.currentTime = 0;
    bgm.play().catch(() => {});
    startFireworks();

    usagiTimer = setTimeout(() => {
      if (cfg.features.usagi) {
        spawnUsagiWave();
      }
      startWander();
      congratsTimer = setTimeout(() => startSlides(), cfg.timing.slideIntervalMs);
    }, cfg.timing.yesIntroDelayMs);
  }

  // Admin preview: jump to a specific slide frame
  const params = new URLSearchParams(location.search);
  const focusSlide = params.get("focusSlide");
  const focusCue = params.get("focusCue");
  const playCueSound = params.get("playSound") === "1";

  function hideAllScenes() {
    start.hidden = true;
    main.hidden = true;
    yesScene.hidden = true;
    noModal.hidden = true;
    kick.hidden = true;
    congrats.hidden = true;
    wander.hidden = true;
    tearBottom.hidden = true;
    btnWait.hidden = true;
  }

  function playCue(key) {
    const src = cfg.sounds[key];
    if (!src) return;
    if (key === "bgm") {
      bgm.src = src;
      bgm.currentTime = 0;
      bgm.play().catch(() => {});
      return;
    }
    new Audio(src).play().catch(() => {});
  }

  if (focusSlide != null && focusSlide !== "") {
    const idx = Number(focusSlide);
    const slide = cfg.slides[idx];
    if (slide) {
      hideAllScenes();
      yesScene.hidden = false;
      document.body.classList.add("is-pink");
      document.documentElement.classList.add("is-pink");
      yesPhoto.classList.add("is-fade-out");
      yesPhoto.style.opacity = "";
      fireworks.style.display = "none";
      // play selected intro animation in admin preview
      showSlide(slide, { mute: false, staticPreview: false, reportBounds: true });
    }
  } else if (focusCue) {
    hideAllScenes();
    document.body.style.background = cfg.colors.bg;
    if (focusCue === "hello") {
      // vine-boom plays as the main confirmation page appears
      start.hidden = true;
      main.hidden = false;
      if (playCueSound) playCue("hello");
    } else if (focusCue === "no") {
      main.hidden = false;
      noModal.hidden = false;
      noModal.classList.add("is-open");
      const box = noModal.querySelector(".modal-box");
      if (box) {
        box.style.opacity = "1";
        box.style.animation = "none";
        box.style.transform = "none";
      }
      if (playCueSound) playCue("no");
    } else if (focusCue === "tuco" || focusCue === "punch" || focusCue === "wait") {
      main.hidden = false;
      kick.hidden = false;
      if (focusCue === "wait") btnWait.hidden = false;
      if (focusCue === "punch") {
        feet.classList.add("is-pulsing");
      }
      if (playCueSound) playCue(focusCue);
    } else if (focusCue === "nya" || focusCue === "bgm" || focusCue === "usagi") {
      yesScene.hidden = false;
      document.body.classList.add("is-pink");
      document.body.style.background = cfg.colors.yesBg;
      yesPhoto.classList.add("is-show");
      yesPhoto.style.opacity = "1";
      if (focusCue === "usagi") {
        // preview all usagis with the configured sound
        spawnUsagiWave();
      } else if (playCueSound) {
        if (focusCue === "nya") playIntroEffectSound();
        else playCue(focusCue);
      }
    }
  }

  window.addEventListener("message", (e) => {
    if (e.origin !== location.origin) return;
    if (!e.data) return;
    if (e.data.type === "gyu-preview-slide") {
      const slide = e.data.slide;
      if (!slide) return;
      hideAllScenes();
      yesScene.hidden = false;
      document.body.classList.add("is-pink");
      yesPhoto.classList.add("is-fade-out");
      yesPhoto.style.opacity = "";
      fireworks.style.display = "none";
      wander.hidden = true;
      const playAnim = !!e.data.playAnim;
      showSlide(slide, {
        mute: !playAnim,
        staticPreview: !playAnim,
        reportBounds: true,
      });
      return;
    }
    if (e.data.type === "gyu-replay-anim") {
      const slide = e.data.slide;
      if (!slide) return;
      showSlide(slide, { mute: false, staticPreview: false, reportBounds: true });
    }
  });
})();
