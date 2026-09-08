# My Room in 3D — Interactive Resume / 我的 3D 房间 — 交互式简历

**English** · **[中文](README_CN.md)**

<p align="center">
  <img src="docs/day.webp" alt="Day mode — the cottagecore room" width="48%" />
  <img src="docs/night.webp" alt="Night mode — lamp glow and moonlight" width="48%" />
</p>

A cottagecore 3D room that works as an interactive resume. Orbit the diorama, click the signpost boards, the computer screen, or the stump-cabinet drawer to explore the content. Toggle day/night and the whole scene crossfades between two lighting rigs — at night the desk lamp and stump orb throw real shadows, the signpost labels glow, and a synthesized breeze + BGM ambience plays. The in-screen "CottageOS" terminal even answers `day`/`night` commands.

**Live demo:** `<!-- TODO: add live demo link here -->`

---

An open cottagecore 3D diorama you can explore — a resume disguised as a tiny wooden room. Drag to rotate, scroll to zoom, then click around:

- **Signpost boards** (My Work / About / Contact) — GSAP camera fly-in, forest-themed modals.

  <p align="center">
    <img src="docs/modal-work.webp" alt="My Work — forest signpost modal" width="70%" />
  </p>

- **Computer screen** — lean-in dolly + FOV zoom, then a retro cream-white monitor running "CottageOS": a hello.txt terminal you can **really type into with your keyboard** — try `help`, `whoami`, `clear`, `day` and `night` (the last two flip the scene's lighting through the crossfade) — plus a click-to-plant garden toy and a music app.

  <p align="center">
    <img src="docs/screen-hello.webp" alt="CottageOS hello.txt terminal" width="48%" />
    <img src="docs/screen-music.webp" alt="CottageOS music app" width="48%" />
  </p>

- **Stump-cabinet drawer** — pulls out a wooden drawer with hobbies, keepsakes, and skill badges.

  <p align="center">
    <img src="docs/drawer-collection.webp" alt="My Collection — stump drawer" width="70%" />
  </p>

- **Day/night toggle** — the desk lamp easter egg or the top-right plank. The whole scene **crossfades** between the two lighting rigs (~1.6s): every light, background, fog, glowing signpost text, and the lamp bulb fade together. At night the lamp and the stump's glass orb cast real directional shadows.
- **Ambience** — synthesized breeze + looping BGM (two tracks). Mute from the wooden plank or the in-screen music app — both stay in sync.

Built with **React Three Fiber**, **GSAP**, **Tailwind CSS**, and **Vite**.

## Credits / Inspiration

- [Saad-Hisham/3d-room-portfolio](https://github.com/Saad-Hisham/3d-room-portfolio)
- [andrewwoan/sooahs-room-folio](https://github.com/andrewwoan/sooahs-room-folio)

## Getting started

```bash
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173).

### Build for production

```bash
npm run build
npm run preview
```

## Customising your content

All text lives in **`src/content.js`**:

- `boards` — the three signpost sections (`work` / `about` / `contact`)
- `collections` — the stump drawer (hobbies / keepsakes / skill badges)

Replace the placeholders with your own info; no 3D code needs to change.

## Customising the scene

- **Furniture & shell** — everything loads from one Draco+WebP compressed GLB (`public/models/cottagecore-web.glb`), authored in `blender/`.
- **Lighting & post-processing** — `src/components/Scene.jsx` (day/night rigs, Bloom, vignette, film grain).
- **Interactions & night glow** — `src/components/Cottage.jsx`:
  - `LAMP_HEAD` / `LAMP_LIGHT` — bulb sphere & shadow-casting light positions
  - `BOARD_LABELS` — signpost glowing labels, with per-board `h` (height) and `dx`/`dy`/`dz` offsets
  - `COMPUTER_HIT` / `STUMP_HIT` — hitboxes for the screen and drawer
  - `DEBUG_HOTBOXES` — paint all invisible hit proxies in color while tuning
  - `DEBUG_COORDS` — world axes + ground grid + live markers on every tunable landmark (hitboxes, lamp, Scene.jsx lights) while tuning
- **Day/night crossfade** — both light rigs stay mounted; `Scene.jsx` tweens a shared blend value (1.6s) that drives every light intensity, background/fog colors, and glow emissives. The `RIG` table maps each light's day/night intensities.
- **Terminal commands** — `src/components/ScreenModal.jsx` (`COMMANDS` map): `help` / `whoami` (reads `boards.about`) / `clear` / `day` / `night`.
- **Camera limits** — OrbitControls azimuth/polar clamps in `Scene.jsx`.
- **Audio** — `src/audio.js` (breeze synth, track list, mute sync).

## Interaction model

- **Hover** any interactive object → floating label appears.
- **Click** → GSAP tweens the camera to the object, then a themed modal opens (forest sign / monitor screen / wooden drawer).
- **Click the desk lamp** or the top-right plank → day/night crossfade (or type `day`/`night` inside CottageOS).
- **Click empty space / ✕ / Esc** → back to overview.

Hover labels are written to the DOM every frame via a ref (not React state), so they track smoothly without re-rendering the tree.

## Performance

- `PerformanceMonitor` adapts DPR between 1–2× under load.
- High-poly Tripo meshes have CPU raycast disabled; interaction uses invisible low-poly hit proxies.
- Shadow-casting lights: sun (day) + desk lamp, moon, stump orb (night), 2048²/1024² maps. Lights pinned to zero on one side of the crossfade are hidden so their shadow maps stop rendering.

## Project structure

```
src/
├── App.jsx               # HTML overlay + Canvas mount + toggle planks
├── content.js            # ← edit your resume here (boards, collections)
├── store.js              # zustand store (active/hovered/night/…) + label ref
├── audio.js              # ambience: breeze synth, BGM tracks, mute sync
├── index.css             # Tailwind layers + overlay styles
└── components/
    ├── Scene.jsx         # lighting rigs, camera tween, OrbitControls, post FX
    ├── Cottage.jsx       # GLB loading, hit proxies, lamp glow, signpost labels
    ├── ForestModal.jsx   # signpost content modal
    ├── ScreenModal.jsx   # CottageOS monitor (hello.txt / garden / music)
    ├── StumpDrawerModal.jsx # stump-cabinet collection drawer
    ├── Loader.jsx        # fade-out loading veil
    └── ErrorBoundary.jsx # WebGL failure fallback
```

## Tech stack

- React 18 + Vite 5
- @react-three/fiber + @react-three/drei + three
- @react-three/postprocessing (Bloom, Vignette, Noise)
- gsap (camera tweens, label fade-in)
- zustand (scene ↔ overlay state)
- tailwindcss (overlay UI)
