/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F3EA',
        paper2: '#ECE5D6',
        card: '#FFFFFF',
        ink: '#191917',
        sub: '#6E6E68',
        faint: '#A6A69E',
        line: 'rgba(25,25,23,0.07)',
        accent: '#9C7A57',
        accentSoft: 'rgba(156,122,87,0.12)',
        flame: '#C2683F',
        ok: '#5F9468',
        ios: {
          bg: '#F7F3EA',
          card: '#FFFFFF',
          blue: '#9C7A57',
          green: '#5F9468',
          orange: '#C2683F',
          red: '#FF3B30',
          gray: '#8E8E93',
          gray6: '#F1EBDD',
          label: '#191917',
          secondary: '#6E6E68',
          tertiary: '#C9C1B2',
          separator: 'rgba(25,25,23,0.07)',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'Inter', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'ios-sm': '0 1px 2px rgba(25,25,23,0.04), 0 4px 16px rgba(25,25,23,0.04)',
        'ios-md': '0 4px 14px rgba(25,25,23,0.08)',
        'ios-lg': '0 12px 32px rgba(25,25,23,0.12)',
        tile: '0 1px 2px rgba(25,25,23,0.04), 0 6px 22px rgba(25,25,23,0.05)',
        pop: '0 10px 34px rgba(25,25,23,0.12)',
      },
      borderRadius: { ios: '12px', tile: '24px', sheet: '32px' },
    },
  },
  plugins: [],
}
