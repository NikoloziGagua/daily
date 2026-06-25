/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ios: {
          bg: '#F2F2F7',
          card: '#FFFFFF',
          blue: '#007AFF',
          green: '#34C759',
          orange: '#FF9500',
          red: '#FF3B30',
          gray: '#8E8E93',
          gray6: '#F2F2F7',
          label: '#000000',
          secondary: '#6E6E73',
          tertiary: '#C7C7CC',
          separator: 'rgba(60, 60, 67, 0.12)',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'Inter', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'ios-sm': '0 1px 2px rgba(0,0,0,0.04)',
        'ios-md': '0 4px 14px rgba(0,0,0,0.10)',
        'ios-lg': '0 12px 32px rgba(0,0,0,0.14)',
      },
      borderRadius: { ios: '12px', sheet: '32px' },
    },
  },
  plugins: [],
}
