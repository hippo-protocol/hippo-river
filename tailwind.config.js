/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        yes: '#3fb68b',
        no: '#ff5353',
        info: '#00b2ff',
        main: 'var(--text-main)',
        secondary: 'var(--text-secondary)',
        active: 'var(--bg-active)',
        bg: '#2c3443',
        card: '#1e1f22',
        primary: '#00CF75',
        gray30: '#777',
      },
      backgroundImage: {
        'gra-dark': 'linear-gradient(100deg, #101114 23.52%, #131418 78.15%)',
        'gra-dark-button': 'linear-gradient(180deg, #303037 0%, #101010 100%)',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        dark: {
          primary: '#666cff',
          'base-100': '#2a334c',
          'base-200': '#252d37',
        },
      },
    ],
  },
};
