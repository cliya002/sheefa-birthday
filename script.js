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

    // Auto-play the love song as a welcome gift 🎵
    // (Works because the user just clicked Unlock — browser allows autoplay with sound)
    setTimeout(() => {
      if (typeof window.__openMusicPlayer === 'function') {
        window.__openMusicPlayer();
      }
    }, 900);
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

  // Soft floating hearts on the gate screen
  const gateHearts = gate.querySelector('.gate-hearts');
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
  for (let i = 0; i < 6; i++) setTimeout(spawnGateHeart, i * 300);
  const gateInterval = setInterval(() => {
    if (gate.classList.contains('hidden')) {
      clearInterval(gateInterval);
      return;
    }
    spawnGateHeart();
  }, 900);
})();

/* ====== Floating hearts & petals ====== */
(function spawnFloaties() {
  const heartsContainer = document.querySelector('.hearts');
  const petalsContainer = document.querySelector('.petals');

  function spawn(container, className) {
    const el = document.createElement('span');
    el.className = className;
    el.style.left = Math.random() * 100 + 'vw';
    const size = 12 + Math.random() * 18;
    el.style.transform += ` scale(${(size / 20).toFixed(2)})`;
    const duration = 8 + Math.random() * 10;
    el.style.animationDuration = duration + 's';
    el.style.animationDelay = (Math.random() * 4) + 's';
    container.appendChild(el);
    setTimeout(() => el.remove(), (duration + 5) * 1000);
  }

  setInterval(() => spawn(heartsContainer, 'heart'), 700);
  setInterval(() => spawn(petalsContainer, 'petal'), 900);

  for (let i = 0; i < 8; i++) {
    setTimeout(() => spawn(heartsContainer, 'heart'), i * 200);
    setTimeout(() => spawn(petalsContainer, 'petal'), i * 250);
  }
})();

/* ====== Birthday state helper ====== */
function isBirthdayNow() {
  const now = new Date();
  return now.getMonth() === 4 && now.getDate() === 10;
}

/* ====== Countdown to Sheefa's birthday: May 10 ====== */
(function countdown() {
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const msgEl = document.getElementById('countdownMsg');
  const lockCountdownEl = document.getElementById('lockCountdown');
  const btnReveal = document.getElementById('btnReveal');
  const messageSection = document.getElementById('messageSection');

  function getTarget() {
    const now = new Date();
    let year = now.getFullYear();
    let target = new Date(year, 4, 10, 0, 0, 0, 0);
    const endOfBirthday = new Date(year, 4, 10, 23, 59, 59, 999);
    if (now > endOfBirthday) {
      target = new Date(year + 1, 4, 10, 0, 0, 0, 0);
    }
    return target;
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function unlockButton() {
    btnReveal.disabled = false;
    btnReveal.classList.add('unlocked');
    btnReveal.querySelector('.btn-icon').textContent = '🎉';
    btnReveal.querySelector('.btn-text').textContent = 'Open Your Birthday Message';
  }

  function tick() {
    const now = new Date();
    const target = getTarget();
    const diff = target - now;

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
      `Unlocks in ${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
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

    // Scroll smoothly to the message
    setTimeout(() => {
      messageSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);

    btn.querySelector('.btn-text').textContent = 'Message Revealed 💖';
    btn.disabled = true;
    btn.style.cursor = 'default';
  });
})();

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

/* ====== Floating music player (Munbe Vaa — AR Rahman) ====== */
(function musicPlayer() {
  const toggle = document.getElementById('musicToggle');
  const panel = document.getElementById('musicPanel');
  const closeBtn = document.getElementById('musicClose');
  const embed = document.getElementById('musicEmbed');
  const songBtn = document.getElementById('btnSong');

  // Video ID from the YouTube embed snippet you provided
  const VIDEO_ID = 'hIFVPC3wHUM';
  const VIDEO_SI = 'tj-x9E7rsSX3SzId'; // session identifier that makes embed work
  const SONG_TITLE = 'Our Song 💕';
  const SONG_ARTIST = 'A Tamil love song, just for you';

  let loaded = false;

  function loadIframe(autoplay = true) {
    if (loaded) return;
    loaded = true;
    renderEmbed(autoplay);
  }

  function renderEmbed(autoplay) {
    // Use EXACTLY the iframe YouTube generated — proven to work.
    // We don't add autoplay to the URL because that can trigger Error 153
    // on some videos. Instead, the user clicks play inside the iframe.
    embed.innerHTML =
      `<iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/${VIDEO_ID}?si=${VIDEO_SI}"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen></iframe>`;
  }

  function renderFallback() {
    const thumb = `https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`;
    embed.innerHTML =
      `<a class="music-card" href="https://www.youtube.com/watch?v=${VIDEO_ID}" target="_blank" rel="noopener" style="background-image: url('${thumb}');">
         <div class="music-card-overlay">
           <div class="music-card-play">▶</div>
           <div class="music-card-text">
             <strong>${SONG_TITLE}</strong>
             <span>Tap to play on YouTube</span>
           </div>
         </div>
       </a>
       <p class="music-fallback-note">This video can only play on YouTube — but one tap and it opens ✨</p>`;
  }

  function unloadIframe() {
    embed.innerHTML = '';
    loaded = false;
  }

  function openPlayer() {
    loadIframe(true);
    panel.classList.add('open');
    toggle.classList.add('playing');
    if (songBtn) {
      songBtn.classList.add('active');
      songBtn.querySelector('.btn-text').textContent = 'Playing 🎶';
    }
  }

  function closePlayer() {
    panel.classList.remove('open');
    toggle.classList.remove('playing');
    // Stop playback by removing the iframe entirely
    unloadIframe();
    if (songBtn) {
      songBtn.classList.remove('active');
      songBtn.querySelector('.btn-text').textContent = 'Play Song';
    }
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

  // Expose so other modules (like the password gate) can auto-play
  window.__openMusicPlayer = openPlayer;
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
