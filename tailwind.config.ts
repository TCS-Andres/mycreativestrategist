import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '960px',
        xl: '1080px',
        '2xl': '1200px',
      },
    },
    extend: {
      colors: {
        brand: {
          orange: '#F28D3D',
          'orange-deep': '#E8843C',
          navy: '#1C192A',
          black: '#1A1A1A',
          yellow: '#FCDF09',
          blue: '#2B69D8',
          cream: '#FAF7F2',
          gray: '#E8E4DD',
        },
        background: '#FAF7F2',
        foreground: '#1C192A',
        muted: {
          DEFAULT: '#F2EEE7',
          foreground: '#5A5566',
        },
        border: '#E8E4DD',
        input: '#E8E4DD',
        ring: '#F28D3D',
        destructive: {
          DEFAULT: '#C03A2B',
          foreground: '#FAF7F2',
        },
      },
      fontFamily: {
        heading: ['var(--font-quicksand)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        eyebrow: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.18em' }],
      },
      borderRadius: {
        lg: '14px',
        md: '10px',
        sm: '6px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(28, 25, 42, 0.04), 0 8px 24px -12px rgba(28, 25, 42, 0.12)',
        ring: '0 0 0 4px rgba(242, 141, 61, 0.18)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 280ms ease-out both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
