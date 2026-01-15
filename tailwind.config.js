export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
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
        }
      },
    },
  },
  plugins: [],
}