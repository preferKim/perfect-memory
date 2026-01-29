export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: { // Celestial Blue
          light: '#a7d8ff',
          DEFAULT: '#4dabf7',
          dark: '#339af0',
        },
        normal: { // Minty Teal
          light: '#a6e9d5',
          DEFAULT: '#63e6be',
          dark: '#38d9a9',
        },
        speed: { // Lemon Sorbet
          light: '#fff0a6',
          DEFAULT: '#ffd43b',
          dark: '#fcc419',
        },
        connect: { // Grapefruit Glow
          light: '#ffc0b3',
          DEFAULT: '#ff8787',
          dark: '#fa5252',
        },
        success: { // Lime Fizz
          light: '#d8f5a2',
          DEFAULT: '#a9e34b',
          dark: '#94d82d',
        },
        danger: { // Watermelon Pop
          light: '#ffb3d1',
          DEFAULT: '#f783ac',
          dark: '#f06595',
        },
        warning: {
          light: '#ffe0b2',
          DEFAULT: '#ff9800',
          dark: '#ef6c00',
        },
        google: {
          DEFAULT: '#ffffff',
          dark: '#e0e0e0',
        },
        aurora: {
          // A nice deep purple
          100: '#5f4b8b',
          // A vibrant pink
          200: '#e661ac',
          // A rich blue
          300: '#3d5af1',
          // A bright teal
          400: '#00bfa5',
        },
      },
      keyframes: {
        aurora: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'card-appear': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        'success-glow': {
          '0%, 100%': { boxShadow: '0 0 8px theme(colors.success.light / 0)' },
          '50%': { boxShadow: '0 0 12px 6px theme(colors.success.light / 0.7)' },
        },
        'draw-line': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        aurora: 'aurora 20s ease infinite',
        'card-appear': 'card-appear 0.5s ease-out forwards',
        shake: 'shake 0.5s ease-in-out',
        'success-glow': 'success-glow 0.8s ease-in-out',
        'draw-line': 'draw-line 1s ease-out forwards',
      }
    },
  },
  plugins: [],
}