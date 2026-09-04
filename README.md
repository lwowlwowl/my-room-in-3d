# My Room in 3D — Interactive Resume / 我的 3D 房间 — 交互式简历

**[English](#english)** · **[中文](#中文)**

---

<a id="english"></a>

## English

An open cottagecore 3D diorama you can explore. Drag to rotate, scroll to zoom, click the signpost boards to open forest-themed modals. Toggle day/night (top-right button, or click the desk lamp easter egg) — at night the lamp glows, the signpost labels light up, and the vine bulbs flicker.

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

All text lives in **`src/content.js`** — the `boards` object holds the three
signpost sections (`work` / `about` / `contact`). Replace the placeholders
with your own info; no 3D code needs to change.

## Customising the scene

- **Furniture & shell** — everything loads from one Draco+WebP compressed GLB
  (`public/models/cottagecore-web.glb`), authored in `blender/`.
- **Lighting & post-processing** — `src/components/Scene.jsx` (day/night rigs,
  Bloom, vignette, film grain).
- **Interactions & night glow** — `src/components/Cottage.jsx`:
  - `LAMP_HEAD` — bulb sphere position (its point light is a child, so the
    light pool follows)
  - `BOARD_LABELS` — signpost glowing labels, with per-board `h` (height) and
    `dx`/`dy`/`dz` offsets
  - `SIGNPOST_TF` — the signpost's baked transform

## Interaction model

- **Hover** a signpost board or the lamp → floating label appears.
- **Click a board** → GSAP tweens the camera to the signpost, a forest modal
  opens.
- **Click the desk lamp** → day/night easter egg toggle.
- **Click empty space / ✕ / Esc** → back to overview.

Hover labels are written to the DOM every frame via a ref (not React state), so
they track smoothly without re-rendering the tree.

## Performance

- `PerformanceMonitor` adapts DPR between 1–2× under load.
- High-poly Tripo meshes have CPU raycast disabled; interaction uses invisible
  low-poly hit proxies.
- Single shadow-casting light with a 2048² map.

## Project structure

```
src/
├── App.jsx              # HTML overlay + Canvas mount + day/night toggle
├── content.js           # ← edit your resume here (boards: work/about/contact)
├── store.js             # zustand store (active/hovered/night/board) + label ref
├── index.css            # Tailwind layers + overlay styles
└── components/
    ├── Scene.jsx        # lighting rigs, camera tween, OrbitControls, post FX
    ├── Cottage.jsx      # GLB loading, hit proxies, lamp glow, signpost labels
    ├── ForestModal.jsx  # signpost content modal
    ├── Loader.jsx       # fade-out loading veil
    └── ErrorBoundary.jsx # WebGL failure fallback
```

## Tech stack

- React 18 + Vite 5
- @react-three/fiber + @react-three/drei + three
- @react-three/postprocessing (Bloom, Vignette, Noise)
- gsap (camera tweens, label fade-in)
- zustand (scene ↔ overlay state)
- tailwindcss (overlay UI)

## License

MIT — use it for your own resume.

---

<a id="中文"></a>

## 中文

一个可以探索的开放式田园风（cottagecore）3D 小屋场景。拖拽旋转、滚轮缩放，点击路牌的板子打开森林风模态框。右上角按钮（或点击台灯彩蛋）切换日/夜——夜晚台灯亮起、路牌文字发光、藤蔓灯泡闪烁。

基于 **React Three Fiber**、**GSAP**、**Tailwind CSS** 和 **Vite** 构建。

## 致谢 / 启发

- [Saad-Hisham/3d-room-portfolio](https://github.com/Saad-Hisham/3d-room-portfolio) — 开场"房间生长"逐件入场动画、自适应 DPR 方案
- [andrewwoan/sooahs-room-folio](https://github.com/andrewwoan/sooahs-room-folio) — 田园风场景布局与参考尺寸

## 快速开始

```bash
npm install
npm run dev
```

打开终端输出的地址（默认 http://localhost:5173）。

### 生产构建

```bash
npm run build
npm run preview
```

## 修改你的内容

所有文字都在 **`src/content.js`** —— `boards` 对象包含路牌三个板块
（`work` / `about` / `contact`）。替换占位内容即可，无需改动 3D 代码。

## 定制场景

- **家具与房屋** — 全部来自一个 Draco+WebP 压缩的 GLB
  （`public/models/cottagecore-web.glb`），在 `blender/` 中制作。
- **灯光与后期** — `src/components/Scene.jsx`（日/夜灯光组、Bloom、暗角、胶片颗粒）。
- **交互与夜晚发光** — `src/components/Cottage.jsx`：
  - `LAMP_HEAD` — 灯泡光球位置（点光源是它的子节点，光照自动跟随）
  - `BOARD_LABELS` — 路牌发光文字，每块板可调 `h`（高度）和
    `dx`/`dy`/`dz` 偏移
  - `SIGNPOST_TF` — 路牌的烘焙变换

## 交互模型

- **悬停** 路牌板子或台灯 → 出现浮动标签。
- **点击板子** → GSAP 镜头飞向路牌，打开森林风模态框。
- **点击台灯** → 日/夜切换彩蛋。
- **点击空白处 / ✕ / Esc** → 回到全景。

悬停标签通过 ref 每帧直接写 DOM（不走 React state），平滑追踪且不触发重渲染。

## 性能

- `PerformanceMonitor` 根据负载在 1–2× 之间自适应 DPR。
- 高面数 Tripo 网格禁用了 CPU 射线检测，交互使用不可见的低面数热区代理。
- 单一投影光源 + 2048² 阴影贴图。

## 项目结构

```
src/
├── App.jsx              # HTML 覆盖层 + Canvas 挂载 + 日/夜切换按钮
├── content.js           # ← 在这里编辑你的简历（boards: work/about/contact）
├── store.js             # zustand store（active/hovered/night/board）+ 标签 ref
├── index.css            # Tailwind 层 + 覆盖层样式
└── components/
    ├── Scene.jsx        # 灯光组、镜头补间、OrbitControls、后期特效
    ├── Cottage.jsx      # GLB 加载、热区代理、台灯光球、路牌发光文字
    ├── ForestModal.jsx  # 路牌内容模态框
    ├── Loader.jsx       # 淡出加载幕布
    └── ErrorBoundary.jsx # WebGL 失败兜底
```

## 技术栈

- React 18 + Vite 5
- @react-three/fiber + @react-three/drei + three
- @react-three/postprocessing（Bloom、暗角、噪点）
- gsap（镜头补间、标签淡入）
- zustand（场景 ↔ 覆盖层状态）
- tailwindcss（覆盖层 UI）

## 许可

MIT — 可用于你自己的简历。
