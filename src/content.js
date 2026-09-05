// ============================================================================
// RESUME CONTENT — edit these placeholders with your own info.
// The signpost has three boards (MY WORK / ABOUT / CONTACT); each opens a
// forest-themed modal. Everything else in the room is decorative for now.
// ============================================================================

export const boards = {
  work: {
    id: 'work',
    board: 'My Work',
    title: 'My Work',
    carve: '~ projects & experiments ~',
    intro: 'A few things I have grown from seed to screen — replace with your own work.',
    projects: [
      {
        name: 'Project One',
        tag: 'Web App',
        desc: 'A short description of what this project does and the tech behind it.',
        link: '#',
      },
      {
        name: 'Project Two',
        tag: '3D / WebGL',
        desc: 'Another project line — replace with your own.',
        link: '#',
      },
      {
        name: 'Project Three',
        tag: 'Open Source',
        desc: 'A library or tool you maintain.',
        link: '#',
      },
    ],
  },

  about: {
    id: 'about',
    board: 'About',
    title: 'About Me',
    carve: '~ who lives here ~',
    intro: [
      "Hi! I'm Your Name, a front-end engineer who loves crafting delightful, interactive web experiences.",
      'I care about the little details — the micro-interactions, the performance, the feel of a product.',
    ],
    meta: [
      { k: 'Location', v: 'City, Country' },
      { k: 'Role', v: 'Front-End Engineer' },
      { k: 'Experience', v: '5+ years' },
    ],
  },

  contact: {
    id: 'contact',
    board: 'Contact',
    title: 'Say Hello!',
    carve: '~ send a letter ~',
    intro: "If you like engineering, nature, games, and food — let's connect!",
    links: [
      { k: 'Email', v: 'you@example.com', href: 'mailto:you@example.com', icon: 'mail' },
      { k: 'GitHub', v: 'github.com/yourname', href: '#', icon: 'github' },
      { k: 'LinkedIn', v: 'linkedin.com/in/yourname', href: '#', icon: 'linkedin' },
    ],
  },
}

// Ordered list of objects that are interactive, with camera focus anchors.
// anchor = the [x,y,z] the camera moves toward; target = what it looks at.
// Coordinates match the imported cottagecore GLB (floor at y=0, opening faces +Z).
export const focusSpots = {
  // signpost actually sits at world ≈ (4.4, 0, -3.6) — the GLB roots carry
  // their own baked transforms (rot -0.96, scale 3.6), so trust runtime coords
  contact: { camera: [7.4, 4.4, 2.2], target: [4.4, 1.8, -3.6] },
  // Green display glass on the left side of the C03 desk mesh, facing +X.
  computer: { camera: [0.75, 2.1, -2.05], target: [-3.86, 1.82, -2.14] },
}

export const defaultCamera = { camera: [12, 10, 18.5], target: [0, 1.2, 0] }
