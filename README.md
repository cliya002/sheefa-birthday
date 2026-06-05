

A small, lovingly hand-built single-page birthday site — a password-locked
greeting that opens into a countdown, a personal photo, an animated cake,
a floating music player, and on the morning of May 10th (Qatar time) a
blooming tree reveal with a typewriter message.

> Live: open `index.html` in any modern browser, or host it as a static site.

---

## ✨ What's inside

### Password gate
A soft-pink lock screen with floating petals, butterflies, and sparkles. Entering
the right password unlocks the main card. The unlock state is remembered in
`sessionStorage` so a refresh doesn't re-prompt.

The password isn't stored in plaintext — instead the site stores a
`simpleHash()` value of the lowercase password and compares hashes on submit.
This is a casual lock, not real security.

### Countdown
Counts down to **May 10th, midnight Qatar time** (Asia/Qatar, UTC+3, no DST),
regardless of where the visitor is in the world. Done by reading the current
time as Qatar wall-clock time using `Intl.DateTimeFormat`, then comparing the
real `Date.now()` against `Date.UTC(year, 4, 9, 21, 0, 0)` (midnight Qatar).

The "Open Your Birthday Message" button stays disabled until the day arrives.

### Floating music player (`song.mp3`)
A custom HTML5 audio player with a spinning floral album art, play/pause,
scrubbable progress bar, and volume slider. Music starts silently in the
background the moment the password is accepted (synchronously inside the
submit handler — needed to satisfy iOS Safari's autoplay policy).

There's also a "See song meaning" toggle that reveals an English translation
of the Tamil lyrics, formatted as a poem.

### Action buttons
Make a Wish · Send Love · Play Song · Why You're Special — small popups,
heart bursts, and a toggle for the floating music player.

### Cake interaction
Click the cake to "blow out" the candle (smoke animation, heart burst, popup),
then it relights itself a moment later.

### The unlocked message
On May 10th in Qatar, the unlock button reveals:

1. A **growing tree** — an SVG with a tapered trunk, curved branches, and
   detail twigs that draw themselves in stages
2. The canopy fills with **clustered leaves and flowers** (~20 foliage
   pockets along the actual branch paths so it looks natural), with hearts
   sprinkled through and 3–5 **butterflies drifting around it** on four
   different meandering flight paths
3. The **birthday message types itself out** line by line with a blinking
   cursor, with a deliberate longer pause before the heartfelt middle
   stanzas

### Ambient atmosphere
Always-on background layers: floating hearts, petals, sakura, roses, big
hearts, butterflies, sparkles, side vines, corner flower bouquets, and a
flowered border on the card. Counts adapt to mobile and to
`prefers-reduced-motion`.

---

## 🗂 Project structure

```
.
├── index.html      # All structure: gate, card, countdown, message, player
├── styles.css      # Everything visual — ~3700 lines, organized by section
├── script.js       # Behavior — gate, countdown, animations, music, etc.
├── song.mp3        # Background music (Poo Paadal · Sean Roldan · From 29)
├── preview.webp    # Photo shown inside the card
└── README.md       # This file
```

No build step, no package manager, no framework. Just three plain files.

---

## 🛠 How it was built

### Stack
- **HTML5** — semantic structure
- **CSS3** — gradients, blurs, keyframes, flexbox/grid, custom scrollbars,
  CSS variables for the rose / blush / cream / gold theme
- **Vanilla JavaScript** — no libraries, no bundler. Each feature is wrapped
  in its own IIFE so concerns don't leak

### Fonts
Loaded from Google Fonts: **Cormorant Garamond**, **Dancing Script**,
**Poppins**, **Great Vibes**, **Parisienne**.

### Animations & layered SVG
- The blooming tree is an inline SVG with `<linearGradient>` for the trunk,
  a `<radialGradient>` canopy glow, and a grass mound `<path>`. The
  trunk/branch/twig paths draw in via animated `stroke-dasharray` /
  `stroke-dashoffset`
- Flowers, leaves, and hearts are emoji `<span>`s positioned in % inside
  cluster "hotspots" with a Gaussian-ish distribution (biased toward the
  center) so foliage looks dense in the middle and sparser at the edges
- Each bloom gets a `bloomPop` entrance animation followed by a continuous
  `bloomSway` so the canopy breathes
- Butterflies drift on four distinct keyframe flight paths
  (`flightOne` … `flightFour`) with a `butterflyFlap` brightness pulse,
  and a random `hue-rotate` per butterfly so they feel unique

### The typewriter effect
Each `<p class="tw-line">` has a `data-text` attribute. A small JS function
clears the line, walks the text with `Array.from(text)` (so emoji surrogate
pairs and ZWJ sequences stay intact), inserts characters one by one with a
random ±15ms jitter, and a single `<span class="tw-cursor">` element moves
from line to line with a CSS blink animation.

Lines marked `.tw-pause` get an extra ~900ms pause before they start typing,
which is used to give the message emotional weight before the deeper stanzas.

### iOS / mobile compatibility
Several deliberate quirks worked around in CSS:
- `aspect-ratio` falls back to a `padding-top` hack
- `inset: 0` falls back to explicit `top/right/bottom/left: 0`
- `-webkit-backdrop-filter` paired with `backdrop-filter`
- `font-size: 16px` on the password input prevents iOS auto-zoom on focus
- `-webkit-tap-highlight-color: transparent` removes the gray tap flash
- `100svh` height for the gate to handle the iOS address bar squish
- `-webkit-mask-image: linear-gradient(black, black)` on floaty containers
  to stop trail artifacts on fixed layers

Animation counts are scaled down on mobile, and **everything respects
`prefers-reduced-motion`** — animations short-circuit, the typewriter shows
the full message instantly, and decorative floaties are hidden.

### Qatar-time countdown
`Intl.DateTimeFormat({ timeZone: 'Asia/Qatar', ... })` gets the current
Qatar wall-clock time, and the target is computed as
`Date.UTC(year, 4, 9, 21, 0, 0)` (midnight May 10th Qatar = 21:00 UTC May 9).
This way the countdown hits zero at midnight in Doha no matter where the
viewer is.

### Audio autoplay on iOS
iOS Safari blocks `audio.play()` unless it's called *synchronously* inside a
user-gesture handler. The unlock submit handler therefore calls a
`__startMusicSilently()` function on the global object **before** the
500ms unlock animation kicks in — no `setTimeout`, no awaits — so the
gesture context is still valid when `play()` runs.

---

## 💌 Customizing it for someone else

If you're forking this:

1. **Swap the photo** — replace `preview.webp`
2. **Swap the song** — replace `song.mp3` (or update the `<source>` tag)
3. **Update the password** — `script.js` stores a hash:
   ```js
   const PASSWORD_HASH = -641218737;
   ```
   Generate a new one in the browser console:
   ```js
   function simpleHash(str){let h=0;for(let i=0;i<str.length;i++){h=((h<<5)-h)+str.charCodeAt(i);h|=0;}return h;}
   simpleHash('your new password');
   ```
4. **Update the date** — the countdown is hard-coded to May 10th in
   `script.js` (`q.month === 5 && q.day === 10` and the
   `Date.UTC(year, 4, 9, 21, ...)` target). Change both.
5. **Update the message** — the typewriter lines are `<p class="tw-line"
   data-text="...">` inside `#typewriter` in `index.html`
6. **Update names / copy** — search for "Sheefa" and "Qatar" in the source
   and replace

---

## 🏃 Running locally

It's just static files, so any of these work:

```bash
# Python (built-in)
python -m http.server 8000

# Node
npx serve .

# Or just double-click index.html in your file browser
```

Visit `http://localhost:8000`.

> Note: opening `index.html` directly via `file://` works too, though some
> browsers throttle audio/animation behavior in that mode.

---

## 📜 License & credits

Made with 💖 — free to fork and adapt for your own loved ones.

- Music: *Poo Paadal* by **Sean Roldan**, from the Tamil film *29*
- Fonts via **Google Fonts**

---

*Forever & Always · 🌹💕🌹*
