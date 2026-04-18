/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        'bg': '#f4efe6',
        'bg-strong': '#eadac8',
        'card': 'rgba(255, 250, 245, 0.88)',
        'line': 'rgba(93, 61, 42, 0.16)',
        'text': '#24160f',
        'muted': '#755847',
        'accent': '#c25b33',
        'accent-dark': '#8f3f22',
        'success': '#276749',
        'error': '#c53030',
      },
      fontFamily: {
        'serif': ['Georgia', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        'custom': '0 24px 80px rgba(63, 34, 20, 0.12)',
      },
      backdropBlur: {
        '8': '8px',
      },
    },
  },
  plugins: [],
}