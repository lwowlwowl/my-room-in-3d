// ============================================================================
// RESUME CONTENT — edit these placeholders with your own info.
// Each `id` maps to a 3D object in the room (see src/components/objects).
// ============================================================================

export const content = {
  about: {
    id: 'about',
    label: 'About Me',
    title: 'About Me',
    icon: '🛏️',
    color: '#e8b86d',
    body: [
      "Hi! I'm Your Name, a front-end engineer who loves crafting delightful, interactive web experiences.",
      'I care about the little details — the micro-interactions, the performance, the feel of a product.',
    ],
    meta: [
      { k: 'Location', v: 'City, Country' },
      { k: 'Role', v: 'Front-End Engineer' },
      { k: 'Experience', v: '5+ years' },
    ],
  },

  projects: {
    id: 'projects',
    label: 'Projects',
    title: 'Projects & Work',
    icon: '💻',
    color: '#7fb7c9',
    body: ['A selection of things I have designed, built, or contributed to.'],
    list: [
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

  skills: {
    id: 'skills',
    label: 'Skills',
    title: 'Skills & Tools',
    icon: '🚪',
    color: '#c89b6a',
    body: ['Technologies I reach for day to day.'],
    groups: [
      {
        name: 'Frontend',
        items: ['React', 'TypeScript', 'Three.js / R3F', 'Tailwind CSS', 'Vite'],
      },
      {
        name: 'Backend',
        items: ['Node.js', 'Express', 'PostgreSQL'],
      },
      {
        name: 'Tools',
        items: ['Git', 'Figma', 'GSAP', 'Docker'],
      },
    ],
  },

  experience: {
    id: 'experience',
    label: 'Experience',
    title: 'Experience',
    icon: '🪟',
    color: '#9bb5a6',
    body: ['Where I have worked and what I focused on.'],
    timeline: [
      {
        role: 'Senior Front-End Engineer',
        company: 'Company A',
        period: '2023 — Present',
        desc: 'Led the interactive UI platform and mentored two engineers.',
      },
      {
        role: 'Front-End Engineer',
        company: 'Company B',
        period: '2020 — 2023',
        desc: 'Built data-viz dashboards and design-system components.',
      },
      {
        role: 'Junior Developer',
        company: 'Company C',
        period: '2019 — 2020',
        desc: 'Shipped marketing sites and learned the ropes.',
      },
    ],
  },

  hobbies: {
    id: 'hobbies',
    label: 'Hobbies',
    title: 'Hobbies',
    icon: '💊',
    color: '#d98a8a',
    body: ['When I am away from the keyboard.'],
    list: ['🎮 Game design', '📷 Photography', '🎹 Music', '🥾 Hiking'],
  },

  contact: {
    id: 'contact',
    label: 'Contact',
    title: 'Get in Touch',
    icon: '📬',
    color: '#b39bc8',
    body: ['I am always happy to chat about interesting projects.'],
    links: [
      { k: 'Email', v: 'you@example.com', href: 'mailto:you@example.com' },
      { k: 'GitHub', v: 'github.com/yourname', href: '#' },
      { k: 'LinkedIn', v: 'linkedin.com/in/yourname', href: '#' },
      { k: 'Twitter', v: '@yourhandle', href: '#' },
    ],
  },
}

// Ordered list of objects that are interactive, with camera focus anchors.
// anchor = the [x,y,z] the camera moves toward; target = what it looks at.
export const focusSpots = {
  about: { camera: [-5.2, 3.2, 3.8], target: [-4.6, 0.9, -1.2] },
  projects: { camera: [0.5, 2.8, 3.5], target: [0, 1.2, -1.2] },
  skills: { camera: [4.8, 3.0, 4.0], target: [4.4, 1.6, -1.5] },
  experience: { camera: [4.5, 2.6, 5.6], target: [5.8, 2.6, -3.6] },
  hobbies: { camera: [-2.4, 2.4, -2.0], target: [-2.5, 1.95, -5.05] },
  contact: { camera: [1.0, 2.2, 2.5], target: [1.0, 1.0, -1.0] },
}

export const defaultCamera = { camera: [8.5, 10, 9], target: [0, 1.1, 0] }
