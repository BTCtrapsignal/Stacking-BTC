/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'Courier New', 'monospace'],
      },
      colors: {
        // Dark theme base
        bg:      '#0b0c0e',
        surface: '#141619',
        card:    '#1c1f28',
        border:  '#252830',
        // Text
        primary:   '#eceef3',
        secondary: '#b8bcc8',
        muted:     '#686e7d',
        // Brand
        btc:    '#f7931a',
        green:  '#22c55e',
        red:    '#ef4444',
        yellow: '#facc15',  // WARNING: never change — used for highlighted text
        orange: '#f59e0b',
        blue:   '#60a5fa',
        purple: '#a78bfa',
        // Soft variants
        'green-soft':  'rgba(34,197,94,0.12)',
        'red-soft':    'rgba(239,68,68,0.12)',
        'btc-soft':    'rgba(247,147,26,0.12)',
        'yellow-soft': 'rgba(250,204,21,0.15)',
        'blue-soft':   'rgba(96,165,250,0.12)',
        'orange-soft': 'rgba(245,158,11,0.12)',
      },
      borderRadius: {
        card: '16px',
        chip: '999px',
      },
    },
  },
  plugins: [],
}
