/* ====== Password Gate ====== */
(function passwordGate() {
  const gate = document.getElementById('passwordGate');
  const form = document.getElementById('gateForm');
  const input = document.getElementById('gateInput');
  const errorEl = document.getElementById('gateError');
  const mainCard = document.getElementById('mainCard');

  // Simple hash so the plaintext password isn't sitting in source.
  // Note: client-side gating is not real security, it's a casual lock.
  const PASSWORD_HASH = -641218737;

  function simpleHash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return h;
  }

  // Remember unlock for the session so she doesn't re-enter on refresh
  const UNLOCKED_KEY = 'sheefa_bday_unlocked';

  function unlock() {
    gate.classList.add('hidden');
    mainCard.classList.remove('hidden');
    try { sessionStorage.setItem(UNLOCKED_KEY, '1'); } catch (e) {}
    setTimeout(() => gate.remove(), 700);
    // Music was already started synchronously in the submit handler
    // (required for iOS autoplay compatibility).
  }

  // Auto-unlock if already entered this session
  try {
    if (sessionStorage.getItem(UNLOCKED_KEY) === '1') {
      gate.style.display = 'none';
      mainCard.classList.remove('hidden');
      // On refresh there's no user gesture, so we can't force-play with sound.
      // Instead, show a little nudge asking to click the music button.
      return;
    }
  } catch (e) {}

  // Focus the input so typing starts immediately
  setTimeout(() => input.focus(), 400);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value.trim().toLowerCase();

    if (simpleHash(value) === PASSWORD_HASH) {
      errorEl.classList.remove('show');
      errorEl.textContent = "That's you 💖 Welcome…";
      errorEl.style.color = '#b91d3a';
      errorEl.style.opacity = '1';

      // CRITICAL for iOS: start the audio RIGHT NOW, synchronously inside
      // the submit handler (still within the user gesture context).
      // If we wait for setTimeout, iOS treats the gesture as expired and blocks audio.
      // Play in the background without showing the player panel.
      if (typeof window.__startMusicSilently === 'function') {
        window.__startMusicSilently();
      }

      // Visual unlock runs after a brief delay so the "Welcome" message is seen
      setTimeout(unlock, 700);
    } else {
      errorEl.textContent = "Hmm, that's not it. Try again 💔";
      errorEl.classList.remove('show');
      // Force reflow to restart the shake animation
      void errorEl.offsetWidth;
      errorEl.classList.add('show');
      input.value = '';
      input.focus();
    }
  });

  // Soft floating hearts and petals on the gate screen
  const gateHearts = gate.querySelector('.gate-hearts');
  const gatePetals = gate.querySelector('.gate-petals');
  const gateButterflies = gate.querySelector('.gate-butterflies');
  const gateSparkles = gate.querySelector('.gate-sparkles');

  const isGateMobile =
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    window.innerWidth < 768;

  const GATE_PETALS = ['🌸', '🌹', '🌷', '🌺', '🌼', '💐'];
  const GATE_BUTTERFLIES = ['🦋'];

  function spawnGateHeart() {
    if (gate.classList.contains('hidden')) return;
    const el = document.createElement('span');
    el.className = 'heart';
    el.style.left = Math.random() * 100 + 'vw';
    const dur = 8 + Math.random() * 8;
    el.style.animationDuration = dur + 's';
    gateHearts.appendChild(el);
    setTimeout(() => el.remove(), (dur + 2) * 1000);
  }

  function spawnGatePetal() {
    if (gate.classList.contains('hidden')) return;
    const el = document.createElement('span');
    el.className = 'gate-petal';
    el.textContent = GATE_PETALS[Math.floor(Math.random() * GATE_PETALS.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (1.2 + Math.random() * 1) + 'rem';
    const dur = 10 + Math.random() * 10;
    el.style.animationDuration = dur + 's';
    gatePetals.appendChild(el);
    setTimeout(() => el.remove(), (dur + 2) * 1000);
  }

  function spawnGateButterfly() {
    if (gate.classList.contains('hidden')) return;
    const el = document.createElement('span');
    el.className = 'gate-butterfly';
    el.textContent = GATE_BUTTERFLIES[Math.floor(Math.random() * GATE_BUTTERFLIES.length)];
    el.style.top = (10 + Math.random() * 70) + 'vh';
    el.style.fontSize = (1.5 + Math.random() * 0.8) + 'rem';
    const dur = 15 + Math.random() * 8;
    el.style.animationDuration = dur + 's';
    gateButterflies.appendChild(el);
    setTimeout(() => el.remove(), (dur + 2) * 1000);
  }

  function spawnGateSparkle() {
    if (gate.classList.contains('hidden')) return;
    const el = document.createElement('span');
    el.className = 'gate-sparkle';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top = Math.random() * 100 + 'vh';
    el.style.animationDelay = (Math.random() * 1) + 's';
    el.style.animationDuration = (2 + Math.random() * 2) + 's';
    gateSparkles.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }

  // Initial burst to make the gate feel alive immediately
  for (let i = 0; i < 8; i++) {
    setTimeout(spawnGateHeart, i * 200);
    setTimeout(spawnGatePetal, i * 250);
    setTimeout(spawnGateSparkle, i * 150);
  }
  setTimeout(spawnGateButterfly, 500);
  setTimeout(spawnGateButterfly, 3000);

  // Ongoing intervals — lighter on mobile
  const gateIntervals = isGateMobile
    ? { hearts: 1200, petals: 900, butterflies: 6000, sparkles: 800 }
    : { hearts: 700, petals: 500, butterflies: 4000, sparkles: 400 };

  const gateHeartInterval = setInterval(spawnGateHeart, gateIntervals.hearts);
  const gatePetalInterval = setInterval(spawnGatePetal, gateIntervals.petals);
  const gateButterflyInterval = setInterval(spawnGateButterfly, gateIntervals.butterflies);
  const gateSparkleInterval = setInterval(spawnGateSparkle, gateIntervals.sparkles);

  // Clean up intervals once the gate closes so they don't run forever
  const stopGateAnimations = () => {
    if (gate.classList.contains('hidden') || !document.body.contains(gate)) {
      clearInterval(gateHeartInterval);
      clearInterval(gatePetalInterval);
      clearInterval(gateButterflyInterval);
      clearInterval(gateSparkleInterval);
      clearInterval(cleanupCheck);
    }
  };
  const cleanupCheck = setInterval(stopGateAnimations, 1000);
})();

/* ====== Floating hearts, petals, roses, sakura, sparkles ====== */
(function spawnFloaties() {
  const heartsContainer = document.querySelector('.hearts');
  const petalsContainer = document.querySelector('.petals');
  const rosesContainer = document.querySelector('.roses');
  const sakuraContainer = document.querySelector('.sakura');
  const sparklesContainer = document.querySelector('.sparkles');
  const butterfliesContainer = document.querySelector('.butterflies');
  const bigHeartsContainer = document.querySelector('.big-hearts');

  const ROSES = ['🌹', '🌷', '🌺', '🌸', '🌼', '💐'];
  const BUTTERFLIES = ['🦋', '🦋', '🦋'];
  const BIG_HEARTS = ['💖', '💕', '❤️', '💗', '💝', '🌹'];

  // Detect mobile / low-power devices so we reduce element count
  const isMobile =
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    window.innerWidth < 768;

  // Respect reduced-motion preference
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) return;

  // Scale intervals based on device capability
  const intervals = isMobile
    ? { hearts: 1400, petals: 1800, roses: 3500, sakura: 1600, sparkle: 900, butterfly: 8000, bigHeart: 2500 }
    : { hearts: 500, petals: 700, roses: 1200, sakura: 600, sparkle: 400, butterfly: 3500, bigHeart: 900 };

  function spawn(container, className, opts = {}) {
    const el = document.createElement('span');
    el.className = className;
    el.style.left = Math.random() * 100 + 'vw';
    const size = opts.minSize + Math.random() * (opts.maxSize - opts.minSize);
    if (opts.useTransformScale !== false) {
      el.style.transform = (el.style.transform || '') + ` scale(${(size / opts.baseSize).toFixed(2)})`;
    }
    const duration = opts.minDur + Math.random() * (opts.maxDur - opts.minDur);
    el.style.animationDuration = duration + 's';
    el.style.animationDelay = (Math.random() * (opts.maxDelay || 4)) + 's';
    if (opts.text) el.textContent = opts.text;
    container.appendChild(el);
    setTimeout(() => el.remove(), (duration + 5) * 1000);
    return el;
  }

  // Hearts
  setInterval(() => spawn(heartsContainer, 'heart', {
    minSize: 12, maxSize: 30, baseSize: 20, minDur: 8, maxDur: 18
  }), intervals.hearts);

  // Petals
  setInterval(() => spawn(petalsContainer, 'petal', {
    minSize: 14, maxSize: 28, baseSize: 20, minDur: 9, maxDur: 19
  }), intervals.petals);

  // Floating roses and flower emojis
  setInterval(() => {
    const rose = spawn(rosesContainer, 'rose-item', {
      minSize: 1.2, maxSize: 2.4, baseSize: 1.6,
      minDur: 12, maxDur: 22, useTransformScale: false,
      text: ROSES[Math.floor(Math.random() * ROSES.length)]
    });
    rose.style.fontSize = (1.2 + Math.random() * 1.4) + 'rem';
  }, intervals.roses);

  // Sakura petals drifting down
  setInterval(() => spawn(sakuraContainer, 'sakura-petal', {
    minSize: 12, maxSize: 22, baseSize: 18, minDur: 10, maxDur: 20
  }), intervals.sakura);

  // Sparkles twinkling (desktop only — hidden via CSS on mobile)
  if (!isMobile) {
    function spawnSparkle() {
      const el = document.createElement('span');
      el.className = 'sparkle';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top = Math.random() * 100 + 'vh';
      el.style.animationDelay = (Math.random() * 2) + 's';
      el.style.animationDuration = (2 + Math.random() * 2) + 's';
      sparklesContainer.appendChild(el);
      setTimeout(() => el.remove(), 5000);
    }
    setInterval(spawnSparkle, intervals.sparkle);
  }

  // Butterflies fluttering across the screen (desktop mainly)
  if (!isMobile || window.innerWidth > 600) {
    function spawnButterfly() {
      const el = document.createElement('span');
      el.className = 'butterfly';
      el.textContent = BUTTERFLIES[Math.floor(Math.random() * BUTTERFLIES.length)];
      el.style.top = (10 + Math.random() * 70) + 'vh';
      el.style.animationDuration = (12 + Math.random() * 8) + 's';
      el.style.animationDelay = (Math.random() * 2) + 's';
      el.style.fontSize = (1.4 + Math.random() * 0.8) + 'rem';
      butterfliesContainer.appendChild(el);
      setTimeout(() => el.remove(), 22000);
    }
    setInterval(spawnButterfly, intervals.butterfly);
    // Start one immediately
    setTimeout(spawnButterfly, 1000);
  }

  // Big floating hearts
  function spawnBigHeart() {
    const el = document.createElement('span');
    el.className = 'big-heart';
    el.textContent = BIG_HEARTS[Math.floor(Math.random() * BIG_HEARTS.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (1.4 + Math.random() * 1.2) + 'rem';
    el.style.animationDuration = (10 + Math.random() * 8) + 's';
    el.style.animationDelay = (Math.random() * 2) + 's';
    bigHeartsContainer.appendChild(el);
    setTimeout(() => el.remove(), 20000);
  }
  setInterval(spawnBigHeart, intervals.bigHeart);

  // Initial burst (smaller on mobile)
  const burstCount = isMobile ? 5 : 15;
  for (let i = 0; i < burstCount; i++) {
    setTimeout(() => spawn(heartsContainer, 'heart', {
      minSize: 12, maxSize: 30, baseSize: 20, minDur: 8, maxDur: 18
    }), i * 150);
    setTimeout(() => spawn(petalsContainer, 'petal', {
      minSize: 14, maxSize: 28, baseSize: 20, minDur: 9, maxDur: 19
    }), i * 180);
    setTimeout(() => spawn(sakuraContainer, 'sakura-petal', {
      minSize: 12, maxSize: 22, baseSize: 18, minDur: 10, maxDur: 20
    }), i * 200);
  }

  window.__heartsContainer = heartsContainer;
})();

/* ====== Birthday state helper ====== */
// Everything is calculated in Qatar time (Asia/Qatar, UTC+3, no DST)
// so the countdown hits zero at midnight in Doha regardless of where the
// visitor is located.
const QATAR_TZ = 'Asia/Qatar';

function nowInQatar() {
  // Returns a Date object whose local fields (year/month/date/hour/etc.)
  // reflect the current time in Qatar, regardless of the viewer's timezone.
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: QATAR_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).formatToParts(new Date());
  const get = (t) => parseInt(parts.find(p => p.type === t).value, 10);
  return {
    year: get('year'),
    month: get('month'), // 1-12
    day: get('day'),
    hour: get('hour') === 24 ? 0 : get('hour'),
    minute: get('minute'),
    second: get('second')
  };
}

function isBirthdayNow() {
  const q = nowInQatar();
  return q.month === 5 && q.day === 10;
}

/* ====== Countdown to Sheefa's birthday: May 10, Qatar time ====== */
(function countdown() {
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const msgEl = document.getElementById('countdownMsg');
  const lockCountdownEl = document.getElementById('lockCountdown');
  const btnReveal = document.getElementById('btnReveal');
  const messageSection = document.getElementById('messageSection');

  // Qatar is UTC+3 with no DST. Target is midnight May 10 in Doha,
  // which is May 9 at 21:00 UTC.
  function getTargetUTC() {
    const q = nowInQatar();
    let year = q.year;
    // If we're past end of May 10 in Qatar, roll to next year
    const pastBirthday =
      q.month > 5 || (q.month === 5 && q.day > 10);
    if (pastBirthday) year += 1;
    // Midnight May 10 in Qatar = May 9 21:00 UTC
    return Date.UTC(year, 4, 9, 21, 0, 0, 0);
  }

  // "Now" as a UTC timestamp using the browser's real clock
  function nowUTC() {
    return Date.now();
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function unlockButton() {
    btnReveal.disabled = false;
    btnReveal.classList.add('unlocked');
    btnReveal.querySelector('.btn-icon').textContent = '🎉';
    btnReveal.querySelector('.btn-text').textContent = 'Open Your Birthday Message';
  }

  function tick() {
    const target = getTargetUTC();
    const diff = target - nowUTC();

    // Show the live Qatar time for context
    const q = nowInQatar();
    const qatarClockEl = document.getElementById('qatarClock');
    if (qatarClockEl) {
      qatarClockEl.textContent = `${pad(q.hour)}:${pad(q.minute)}:${pad(q.second)}`;
    }

    if (isBirthdayNow()) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      msgEl.textContent = "🎉 It's your day, Sheefa! Happy Birthday 🎂";
      msgEl.style.fontSize = '1.5rem';
      lockCountdownEl.textContent = "Your message is ready — click the button below 💖";
      unlockButton();
      return;
    }

    if (diff <= 0) {
      msgEl.textContent = "🎉 Happy Birthday, Sheefa! 🎂";
      unlockButton();
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);

    if (days === 0) {
      msgEl.textContent = "Almost there… your day is so close 💖";
    } else if (days <= 7) {
      msgEl.textContent = `Just ${days} day${days > 1 ? 's' : ''} until your birthday 🌹`;
    } else {
      msgEl.textContent = "Every second closer to celebrating you 💕";
    }

    lockCountdownEl.textContent =
      `Unlocks in ${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s · Qatar time 🇶🇦`;
  }

  tick();
  setInterval(tick, 1000);
})();

/* ====== Popup helper ====== */
const popup = {
  overlay: document.getElementById('popupOverlay'),
  title: document.getElementById('popupTitle'),
  message: document.getElementById('popupMessage'),
  closeBtn: document.getElementById('closePopup'),

  show(title, messageHtml) {
    this.title.textContent = title;
    this.message.innerHTML = messageHtml;
    this.overlay.classList.add('show');
  },

  hide() {
    this.overlay.classList.remove('show');
  }
};

popup.closeBtn.addEventListener('click', () => popup.hide());
popup.overlay.addEventListener('click', (e) => {
  if (e.target === popup.overlay) popup.hide();
});

/* ====== Heart burst helper ====== */
function heartBurst(count = 20) {
  const heartsContainer = document.querySelector('.hearts');
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('span');
      el.className = 'heart';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.animationDuration = (5 + Math.random() * 5) + 's';
      heartsContainer.appendChild(el);
      setTimeout(() => el.remove(), 10000);
    }, i * 40);
  }
}

/* ====== Reveal button ====== */
(function revealButton() {
  const btn = document.getElementById('btnReveal');
  const messageSection = document.getElementById('messageSection');

  btn.addEventListener('click', () => {
    if (btn.disabled) return;

    if (!isBirthdayNow()) {
      popup.show(
        "Not yet, my love 💕",
        "Your message is sealed until May 10th. Come back on your special day, Sheefa."
      );
      return;
    }

    messageSection.classList.remove('locked');
    messageSection.classList.add('unlocked');
    messageSection.setAttribute('aria-hidden', 'false');
    heartBurst(40);

    // Kick off the blooming tree + typewriter sequence
    startBloomTree();
    startTypewriter();

    // Scroll smoothly to the message
    setTimeout(() => {
      messageSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);

    btn.querySelector('.btn-text').textContent = 'Message Revealed 💖';
    btn.disabled = true;
    btn.style.cursor = 'default';
  });
})();

/* ====== Blooming tree animation ======
 * Draws the SVG trunk in, then fills the canopy with flowers, leaves,
 * and hearts clustered along the branches. Butterflies drift around
 * the whole tree so it feels alive.
 */
function startBloomTree() {
  const tree = document.getElementById('bloomTree');
  const layer = document.getElementById('bloomLayer');
  const butterflyLayer = document.getElementById('bloomButterflies');
  if (!tree || !layer) return;

  // Reveal the tree container (CSS fades it in and animates the trunk)
  tree.classList.add('growing');

  // Clear any previous run
  layer.innerHTML = '';
  if (butterflyLayer) butterflyLayer.innerHTML = '';

  const FLOWERS = ['🌸', '🌸', '🌹', '🌷', '🌺', '🌼', '💮', '🏵️'];
  const LEAVES  = ['🍃', '🌿', '🍀'];
  const HEARTS  = ['💖', '💕', '❤️', '💗', '💝'];
  const BUTTERFLIES = ['🦋'];

  // Foliage "clusters" — centers along real branches with a tight radius,
  // so blooms follow the branch shape instead of filling a vague blob.
  // Coordinates are in % of the stage (match the SVG branch endpoints).
  const clusters = [
    // Big left-side canopy cluster along the main left branch
    { x: 18, y: 52, r: 8, density: 1.2 },
    { x: 28, y: 60, r: 9, density: 1.1 },
    { x: 38, y: 68, r: 7, density: 0.9 },
    // Big right-side canopy cluster along the main right branch
    { x: 82, y: 52, r: 8, density: 1.2 },
    { x: 72, y: 60, r: 9, density: 1.1 },
    { x: 62, y: 68, r: 7, density: 0.9 },
    // Upper-left cluster (mid branch)
    { x: 22, y: 38, r: 7, density: 1.0 },
    { x: 30, y: 32, r: 6, density: 0.8 },
    // Upper-right cluster (mid branch)
    { x: 78, y: 38, r: 7, density: 1.0 },
    { x: 70, y: 32, r: 6, density: 0.8 },
    // Top spires
    { x: 36, y: 22, r: 7, density: 0.9 },
    { x: 64, y: 22, r: 7, density: 0.9 },
    { x: 50, y: 18, r: 8, density: 1.0 },
    // Central canopy filler
    { x: 50, y: 42, r: 10, density: 1.1 },
    { x: 44, y: 55, r: 8, density: 0.9 },
    { x: 56, y: 55, r: 8, density: 0.9 },
    // Outer tips — sparse blooms
    { x: 15, y: 42, r: 5, density: 0.6 },
    { x: 85, y: 42, r: 5, density: 0.6 },
    { x: 14, y: 66, r: 4, density: 0.5 },
    { x: 86, y: 66, r: 4, density: 0.5 },
  ];

  function randomSpotInCluster(cluster) {
    // Gaussian-ish distribution: pull toward center so clusters look natural
    const angle = Math.random() * Math.PI * 2;
    const r1 = Math.random();
    const r2 = Math.random();
    const dist = Math.min(r1, r2) * cluster.r; // bias toward center
    return {
      x: cluster.x + Math.cos(angle) * dist,
      y: cluster.y + Math.sin(angle) * dist
    };
  }

  function spawnBloom(kind, cluster) {
    const el = document.createElement('span');
    el.className = 'bloom-item bloom-' + kind;
    const pool = kind === 'flower' ? FLOWERS
               : kind === 'leaf'   ? LEAVES
               : kind === 'heart'  ? HEARTS
               : BUTTERFLIES;
    el.textContent = pool[Math.floor(Math.random() * pool.length)];

    const spot = cluster ? randomSpotInCluster(cluster) : { x: 50, y: 40 };
    el.style.left = spot.x + '%';
    el.style.top  = spot.y + '%';
    el.style.setProperty('--rot', (Math.random() * 50 - 25) + 'deg');
    el.style.setProperty('--scale', (0.7 + Math.random() * 0.6).toFixed(2));
    el.style.animationDelay = (Math.random() * 0.25) + 's';
    // Gentle sway offset so not every bloom wiggles in sync
    el.style.setProperty('--sway-delay', (Math.random() * 3) + 's');
    layer.appendChild(el);
  }

  // Spawn a butterfly that drifts around the tree on a random path
  function spawnTreeButterfly(delay) {
    if (!butterflyLayer) return;
    const el = document.createElement('span');
    el.className = 'bloom-tree-butterfly';
    el.textContent = BUTTERFLIES[Math.floor(Math.random() * BUTTERFLIES.length)];

    // Pick a unique flight path for each butterfly (4 preset variants)
    const pathIdx = Math.floor(Math.random() * 4) + 1;
    el.classList.add('flight-' + pathIdx);
    el.style.animationDelay = delay + 'ms';
    el.style.fontSize = (1.3 + Math.random() * 0.7) + 'rem';
    // Small per-butterfly hue wobble so they don't look identical
    el.style.filter = `drop-shadow(0 3px 8px rgba(230, 58, 90, ${0.3 + Math.random() * 0.2})) hue-rotate(${Math.floor(Math.random() * 60 - 30)}deg)`;
    butterflyLayer.appendChild(el);
  }

  // Detect mobile / reduced motion so we don't overwhelm low-end devices
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Per-cluster bloom budget — scales each cluster's density
  const baseFlowersPerCluster = prefersReducedMotion ? 3 : (isMobile ? 6 : 10);
  const baseLeavesPerCluster  = prefersReducedMotion ? 2 : (isMobile ? 3 : 5);
  const heartCount     = prefersReducedMotion ? 8  : (isMobile ? 16 : 24);
  const butterflyCount = prefersReducedMotion ? 2  : (isMobile ? 3  : 5);

  const trunkDrawTime = 900;

  // Leaves appear first (like new growth), then flowers bloom on top
  let spawnTimer = trunkDrawTime;
  clusters.forEach((cluster) => {
    const leafCount = Math.round(baseLeavesPerCluster * cluster.density);
    for (let i = 0; i < leafCount; i++) {
      setTimeout(() => spawnBloom('leaf', cluster), spawnTimer);
      spawnTimer += 18;
    }
  });

  // Flowers bloom on top of the leaves
  spawnTimer = trunkDrawTime + 400;
  clusters.forEach((cluster) => {
    const flowerCount = Math.round(baseFlowersPerCluster * cluster.density);
    for (let i = 0; i < flowerCount; i++) {
      setTimeout(() => spawnBloom('flower', cluster), spawnTimer);
      spawnTimer += 20;
    }
  });

  // Hearts sprinkled throughout for a loving vibe
  for (let i = 0; i < heartCount; i++) {
    const cluster = clusters[Math.floor(Math.random() * clusters.length)];
    setTimeout(() => spawnBloom('heart', cluster), trunkDrawTime + 1200 + i * 60);
  }

  // Butterflies drift in from the sides, staggered over several seconds
  for (let i = 0; i < butterflyCount; i++) {
    spawnTreeButterfly(trunkDrawTime + 1500 + i * 600);
  }
}

/* ====== Typewriter message ======
 * Reveals each line character-by-character to look like someone is typing
 * the birthday message live, line after line.
 */
function startTypewriter() {
  const container = document.getElementById('typewriter');
  if (!container || container.dataset.started === '1') return;
  container.dataset.started = '1';

  const lines = Array.from(container.querySelectorAll('.tw-line'));

  // Respect reduced-motion: just show the full text with no typing animation
  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    lines.forEach(line => {
      line.textContent = line.getAttribute('data-text') || '';
      line.classList.add('typed');
    });
    return;
  }

  // Slightly slower on the first line so it feels deliberate, then natural.
  const CHAR_DELAY = 38;      // ms per character (faster — message is longer now)
  const LINE_PAUSE = 300;     // ms between most lines
  const PAUSE_LINE_DELAY = 900; // extra pause before lines with .tw-pause
  const INITIAL_DELAY = 900;  // wait for tree to start blooming

  // Active cursor element — we move it line to line
  let cursor = document.createElement('span');
  cursor.className = 'tw-cursor';
  cursor.textContent = '|';

  function typeLine(line, done) {
    const text = line.getAttribute('data-text') || '';
    line.classList.add('typing');
    line.textContent = '';
    line.appendChild(cursor);

    // Split into characters, but handle emoji surrogate pairs / ZWJ sequences
    // as single "characters" so emojis don't get torn apart mid-typing.
    const chars = Array.from(text);
    let i = 0;

    function tick() {
      if (i >= chars.length) {
        line.classList.remove('typing');
        line.classList.add('typed');
        done();
        return;
      }
      // Insert character before the cursor
      line.insertBefore(document.createTextNode(chars[i]), cursor);
      i++;
      setTimeout(tick, CHAR_DELAY + (Math.random() * 30 - 15)); // slight jitter
    }
    tick();
  }

  function run(index) {
    if (index >= lines.length) {
      // Remove cursor once everything is typed
      if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
      return;
    }
    typeLine(lines[index], () => {
      const nextLine = lines[index + 1];
      const extra = (nextLine && nextLine.classList.contains('tw-pause'))
        ? PAUSE_LINE_DELAY
        : LINE_PAUSE;
      setTimeout(() => run(index + 1), extra);
    });
  }

  setTimeout(() => run(0), INITIAL_DELAY);
}

/* ====== Make a Wish button ====== */
(function wishButton() {
  const btn = document.getElementById('btnWish');
  btn.addEventListener('click', () => {
    heartBurst(15);
    popup.show(
      "Make a wish, Sheefa 🌟",
      "Close your eyes and think of something beautiful…<br/><br/>Whatever you wished for — I hope the universe hears you and sends it right back ✨"
    );
  });
})();

/* ====== Send Love button ====== */
(function loveButton() {
  const btn = document.getElementById('btnHearts');
  btn.addEventListener('click', () => {
    heartBurst(60);
    popup.show(
      "Sending you all my love 💖",
      "A whole sky full of hearts — just for you, Sheefa."
    );
  });
})();

/* ====== Play Song button (opens floating music player with Tamil love song) ====== */
(function songButton() {
  const btn = document.getElementById('btnSong');
  btn.addEventListener('click', () => {
    // Trigger the floating music player
    const toggle = document.getElementById('musicToggle');
    const panel = document.getElementById('musicPanel');
    if (!panel.classList.contains('open')) {
      toggle.click();
    }
    // Scroll to bring the player into view on mobile
    document.getElementById('musicPlayer').scrollIntoView({ behavior: 'smooth', block: 'end' });
  });
})();

/* ====== Floating music player (MP3 — Kangal Edho) ====== */
(function musicPlayer() {
  const toggle = document.getElementById('musicToggle');
  const panel = document.getElementById('musicPanel');
  const closeBtn = document.getElementById('musicClose');
  const songBtn = document.getElementById('btnSong');

  const audio = document.getElementById('songAudio');
  const playBtn = document.getElementById('audioPlayBtn');
  const progress = document.getElementById('audioProgress');
  const progressFill = document.getElementById('audioProgressFill');
  const progressThumb = document.getElementById('audioProgressThumb');
  const currentEl = document.getElementById('audioCurrent');
  const durationEl = document.getElementById('audioDuration');
  const volumeSlider = document.getElementById('audioVolume');
  const audioArt = document.querySelector('.audio-art');

  // Set initial volume
  audio.volume = 0.7;

  function formatTime(seconds) {
    if (!isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function updateProgress() {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = pct + '%';
    progressThumb.style.left = pct + '%';
    currentEl.textContent = formatTime(audio.currentTime);
  }

  function setProgressFromEvent(e) {
    const rect = progress.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    if (audio.duration) {
      audio.currentTime = pct * audio.duration;
      updateProgress();
    }
  }

  // Play/pause handling
  function play() {
    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => { /* autoplay blocked — user can tap play */ });
    }
  }

  function pause() { audio.pause(); }

  function togglePlay() {
    if (audio.paused) play();
    else pause();
  }

  playBtn.addEventListener('click', togglePlay);
  audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
  });
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('ended', () => {
    // Loop the song so it keeps playing for her
    audio.currentTime = 0;
    play();
  });

  audio.addEventListener('play', () => {
    playBtn.classList.add('playing');
    audioArt.classList.add('spinning');
    toggle.classList.add('playing');
    if (songBtn) {
      songBtn.classList.add('active');
      songBtn.querySelector('.btn-text').textContent = 'Playing 🎶';
    }
  });

  audio.addEventListener('pause', () => {
    playBtn.classList.remove('playing');
    audioArt.classList.remove('spinning');
    toggle.classList.remove('playing');
    if (songBtn) {
      songBtn.classList.remove('active');
      songBtn.querySelector('.btn-text').textContent = 'Play Kangal Edho';
    }
  });

  // Progress bar scrubbing (click + drag, mouse + touch)
  let isDragging = false;
  progress.addEventListener('mousedown', (e) => {
    isDragging = true;
    setProgressFromEvent(e);
  });
  document.addEventListener('mousemove', (e) => {
    if (isDragging) setProgressFromEvent(e);
  });
  document.addEventListener('mouseup', () => { isDragging = false; });

  progress.addEventListener('touchstart', (e) => {
    isDragging = true;
    setProgressFromEvent(e);
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (isDragging) setProgressFromEvent(e);
  }, { passive: true });
  document.addEventListener('touchend', () => { isDragging = false; });

  // Volume slider
  volumeSlider.addEventListener('input', () => {
    audio.volume = parseFloat(volumeSlider.value);
  });

  // Panel show/hide
  // iOS Safari blocks audio.play() unless called SYNCHRONOUSLY inside
  // a user gesture handler. openPlayer gets called from exactly that
  // context (the Unlock button click and the music toggle click), so
  // we must call .play() immediately — no setTimeout, no async wait.
  function openPlayer() {
    panel.classList.add('open');
    // Start playback from the beginning of the song
    play();
  }

  // Start playback WITHOUT opening the panel — used on unlock so the
  // music plays in the background and the panel stays hidden.
  function startMusicSilently() {
    play();
  }

  function closePlayer() {
    panel.classList.remove('open');
    pause();
  }

  toggle.addEventListener('click', () => {
    if (panel.classList.contains('open')) {
      closePlayer();
    } else {
      openPlayer();
    }
  });

  closeBtn.addEventListener('click', closePlayer);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      closePlayer();
    }
  });

  // Expose so the password gate can auto-play after unlock
  window.__openMusicPlayer = openPlayer;
  window.__startMusicSilently = startMusicSilently;
})();

/* ====== Song meaning toggle (inside music player) ====== */
(function lyricsToggle() {
  const toggle = document.getElementById('lyricsToggle');
  const panel = document.getElementById('lyricsPanel');
  if (!toggle || !panel) return;

  const textEl = toggle.querySelector('.lyrics-toggle-text');

  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    textEl.textContent = isOpen ? 'Hide song meaning' : 'See song meaning';
  });
})();

/* ====== Why You're Special button ====== */
(function reasonsButton() {
  const btn = document.getElementById('btnReasons');
  const reasons = [
    "Your smile makes the whole room softer 💫",
    "You came into my life so unexpectedly, and yet so perfectly 🌷",
    "The way you care about the little things — it means everything 💖",
    "You make ordinary days feel extraordinary ✨",
    "Your heart is the kindest one I've ever known 🌸",
    "Just being around you feels like home 🏡",
    "You inspire me to be better, every single day 🌟",
    "You're my favorite thought, every single morning ☀️"
  ];

  btn.addEventListener('click', () => {
    const listHtml = '<ul>' + reasons.map(r => `<li>${r}</li>`).join('') + '</ul>';
    popup.show("Why you're so special, Sheefa 💌", listHtml);
  });
})();

/* ====== Cake interaction ====== */
(function cakeInteraction() {
  const cakeWrap = document.getElementById('cakeWrap');
  const cake = cakeWrap.querySelector('.cake');

  cakeWrap.addEventListener('click', () => {
    cake.classList.add('blown');
    heartBurst(25);

    setTimeout(() => {
      popup.show(
        "Make a wish, Sheefa 🌟",
        "Whatever you wished for… I hope it finds you."
      );
    }, 600);

    // Relight candle after popup closes
    const relight = () => {
      setTimeout(() => cake.classList.remove('blown'), 1500);
    };
    popup.closeBtn.addEventListener('click', relight, { once: true });
  });
})();
