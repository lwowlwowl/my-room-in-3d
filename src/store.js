import { create } from 'zustand'

// Shared store bridging the R3F scene and the HTML overlay.
// NOTE: `labelRef` is a plain mutable holder (NOT React state) so that the
// 3D loop can write screen coordinates to the label DOM node every frame
// without triggering a re-render. Only `hovered`/`active` go through state.
export const labelRef = { current: null }

export const useStore = create((set) => ({
  // id of the focused object, or null for overview
  active: null,
  // id of the hovered object, or null
  hovered: null,
  // whether the 3D scene has rendered its first frame (gates the loader)
  ready: false,
  // whether the loader veil has started opening (gates the furniture intro —
  // kept separate from `ready` so the intro plays when SEEN, not behind the veil)
  revealed: false,
  // day / night mode (toggled by the desk lamp easter egg or the top-right button)
  night: false,
  // which signpost board is open: 'work' | 'about' | 'contact' | null
  board: null,
  // whether the computer screen modal is open
  screen: false,
  // whether the stump-cabinet drawer modal is open
  drawer: false,

  setActive: (id) => set({ active: id }),
  setHovered: (id) => set({ hovered: id }),
  setReady: (ready) => set({ ready }),
  setRevealed: (revealed) => set({ revealed }),
  setNight: (night) => set({ night }),
  setBoard: (board) => set({ board }),
  setScreen: (screen) => set({ screen }),
  setDrawer: (drawer) => set({ drawer }),
}))

export const selectActive = (s) => s.active
export const selectHovered = (s) => s.hovered
