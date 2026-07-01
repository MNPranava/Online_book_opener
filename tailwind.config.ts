import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#EDF2FF',
        muted: '#9BA7C7',
        panel: '#0E1525',
        panelSoft: '#121B2D',
        borderSoft: 'rgba(255,255,255,0.08)',
        accent: '#7C9CFF',
        accentWarm: '#C9A86A',
      },
      boxShadow: {
        glow: '0 16px 48px rgba(14, 21, 37, 0.45)',
        glass: '0 10px 30px rgba(0,0,0,0.25)',
      },
      backgroundImage: {
        'reader-bg': 'radial-gradient(circle at top, rgba(124, 156, 255, 0.16), transparent 32%), linear-gradient(180deg, #07101E 0%, #09111F 32%, #04080F 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', 'Georgia', 'serif'],
      },
      transitionTimingFunction: {
        'soft-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
