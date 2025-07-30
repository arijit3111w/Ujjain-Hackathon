/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'kumbh-orange': '#b05302ff',
        'kumbh-light': '#F9A825',
        'kumbh-gold': '#FFD700',
        'kumbh-black': '#0D0D0D',
        'kumbh-accent': '#ef8503ff',
        'kumbh-text': '#fdaf4fff',
      },
    },
  },
  plugins: [],
};
