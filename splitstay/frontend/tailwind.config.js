/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        // Warm Premium Light Palette Tokens
        'surface': '#F7F4EE',
        'surface-card': '#FFFFFF',
        'surface-secondary': '#F2EEE7',
        'on-surface': '#172033',
        'on-surface-variant': '#687080',
        'border-warm': '#E5DED3',
        
        // Brand Warm Brown
        brand: {
          50: '#FAF6F0',
          100: '#F2EEE7',
          200: '#E5DED3',
          300: '#C5B5A3',
          400: '#A88D74',
          500: '#795538',
          600: '#5F402B', // Primary Dark Brown
          700: '#4A3120',
          800: '#352215',
          900: '#172033', // Primary Navy Text
        },
        navy: {
          900: '#172033',
          800: '#232D42',
          700: '#344059',
          600: '#4C5873',
          500: '#687080',
          400: '#94A3B8',
        },
        // Positive & Negative States
        positive: {
          50: '#E6F4ED',
          100: '#BBE3D0',
          600: '#2F9B70',
          700: '#227B57',
        },
        negative: {
          50: '#FDF0EF',
          100: '#F6CBC9',
          600: '#D65B57',
          700: '#B4423E',
        },
      },
      fontSize: {
        'display': ['56px', { lineHeight: '64px', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-mobile': ['38px', { lineHeight: '44px', letterSpacing: '-0.025em', fontWeight: '800' }],
        'headline-lg': ['40px', { lineHeight: '48px', letterSpacing: '-0.025em', fontWeight: '700' }],
        'headline-md': ['28px', { lineHeight: '36px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-sm': ['22px', { lineHeight: '30px', letterSpacing: '-0.015em', fontWeight: '600' }],
        'title-md': ['18px', { lineHeight: '26px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['15px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '20px', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '600' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '600' }],
        'numerical-balance': ['32px', { lineHeight: '38px', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      boxShadow: {
        'card': '0 2px 10px 0 rgba(23, 32, 51, 0.04)',
        'warm': '0 4px 14px 0 rgba(95, 64, 43, 0.16)',
      },
    },
  },
  plugins: [],
}
