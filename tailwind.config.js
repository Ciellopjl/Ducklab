/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores da marca Ducklab
        marca: {
          primaria: '#00EB69', // Verde Neon Ducklab
          secundaria: '#1A1A1A', // Preto
          acento: '#00EB69', // Verde Neon
          verde: '#00EB69', // Verde Neon
          fundo: '#020403', // Preto profundo Ducklab
          texto: '#FFFFFF',
          cinza: '#1C1917',
          cinzaClaro: '#44403C',
        },
        // Sobrescrevendo o orange (laranja) para o tema verde Ducklab
        orange: {
          50: '#eefdf4',
          100: '#d5fbe2',
          200: '#aff7c7',
          300: '#75eea1',
          400: '#38dc72',
          500: '#00EB69', // Cor Base Verde Neon
          600: '#00c354', // Tom médio
          700: '#009d43',
          800: '#007c35',
          900: '#005c27',
          950: '#003b19',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
