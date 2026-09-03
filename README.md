# My Room in 3D — Interactive Resume

An open isometric 3D room you can explore. Hover furniture to see labels, click to fly the camera in and open a content panel, drag to rotate, scroll to zoom. Inspired by Bruno Simon's "my-room-in-3d".

Built with **React Three Fiber**, **GSAP**, **Tailwind CSS**, and **Vite**.

## Room map

| Object | Section | Edit in |
|---|---|---|
| 🛏️ Bed | About Me | `src/content.js` → `about` |
| 💻 Computer | Projects | `src/content.js` → `projects` |
| 🚪 Wardrobe | Skills | `src/content.js` → `skills` |
| 🪟 Window | Experience | `src/content.js` → `experience` |
| 💊 Medicine box | Hobbies (easter egg) | `src/content.js` → `hobbies` |
| 📬 Desk mailbox | Contact | `src/content.js` → `contact` |

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

All text lives in **`src/content.js`** — each section is a plain object with
`title`, `body`, and a section-specific field (`meta`, `list`, `groups`,
`timeline`, `links`). Replace the placeholders with your own info; no 3D code
needs to change.

Camera focus anchors (where the camera flies when you click an object) live in
the `focusSpots` object in the same file — tweak `camera` and `target` arrays if
you move furniture around.

## Customising the room

- **Furniture** — each object is a self-contained component in
  `src/components/objects/`. Edit geometry/materials there.
- **Room shell** (floor, walls, rug) — `src/components/Room.jsx`.
- **Lighting** — `src/components/Scene.jsx` (warm key + cool window fill).
- **Colours / theme** — `tailwind.config.js` and the `content[id].color` values.

## Interaction model

- **Hover** an object → it glows (emissive boost) and a floating label appears.
- **Click** an object → GSAP tweens the camera + OrbitControls target to a focus
  spot, and an HTML panel slides in from the right.
- **Click empty space / ✕ Back / Esc** → camera returns to the overview.

Hover labels are written to the DOM every frame via a ref (not React state), so
they track smoothly without re-rendering the tree.

## Performance

- Shadows from a single shadow-casting directional light with a 2048² map.
- `AdaptiveDpr` lowers pixel ratio under load; capped at 2× on fast devices.
- `enablePan` disabled, azimuth/polar clamped to keep the open-front view.
- Materials are low-poly `meshStandardMaterial` with flat shading where apt.

## Project structure

```
src/
  App.jsx              # HTML overlay + Canvas mount
  content.js           # ← edit your resume here
  store.js             # zustand store (active/hovered) + label ref
  index.css            # Tailwind layers + overlay styles
  components/
    Scene.jsx          # lighting, camera tween, OrbitControls
    Room.jsx           # floor + walls + rug
    Interactive.jsx    # hover/click/label wrapper + highlight context
    ContentPanel.jsx   # right-side HTML panel
    Loader.jsx         # fade-out loading veil
    objects/
      Bed.jsx          Desk.jsx      Computer.jsx
      Wardrobe.jsx     Window.jsx    MedicineCabinet.jsx
      DeskTrinket.jsx
```

## Tech stack

- React 18 + Vite 5
- @react-three/fiber + @react-three/drei + three
- gsap (camera tweens, panel entrance)
- zustand (scene ↔ overlay state)
- tailwindcss (overlay UI)

## License

MIT — use it for your own resume.
