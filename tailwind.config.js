/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f5ead7',
        wood: '#c89b6a',
        woodDark: '#8a6240',
        accent: '#e8b86d',
        ink: '#3a2f25',
      },
      fontFamily: {
        display: ['"Quicksand"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
