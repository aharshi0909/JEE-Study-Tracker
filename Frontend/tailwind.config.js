/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { DEFAULT: '#6366f1', dark: '#4f46e5', light: '#818cf8' },
        surface: { DEFAULT: '#0f172a', card: '#1e293b', input: '#0f172a' },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: { '0%': { boxShadow: '0 0 5px #6366f1' }, '100%': { boxShadow: '0 0 20px #6366f1, 0 0 40px #6366f155' } }
      }
    },
  },
  plugins: [],
}
