/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          pink: '#FF2D87',
          pinkSoft: '#FFD6E7',
          pinkDeep: '#C8186B',
          ink: '#0B0B0F',
          graphite: '#1A1A22',
          mist: '#F6F6F8',
        },
      },
      boxShadow: {
        pink: '0 10px 30px -10px rgba(255,45,135,0.45)',
        pinkLg: '0 20px 60px -15px rgba(255,45,135,0.55)',
        soft: '0 6px 24px -8px rgba(11,11,15,0.12)',
      },
    },
  },
  plugins: [],
}