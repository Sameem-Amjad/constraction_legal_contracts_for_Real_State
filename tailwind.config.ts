import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Lato', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'Montserrat', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Brand palette
        brand: {
          green: '#37ca37',
          blue: '#188bf6',
          navy: '#1e3a8a',
          orange: '#f97316',
          cobalt: '#155eef',
          smoke: '#f5f5f5',
          indigo: '#757BBD',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'brand-hero':
          'radial-gradient(circle at 20% 10%, rgba(21, 94, 239, 0.10), transparent 45%), radial-gradient(circle at 80% 70%, rgba(249, 115, 22, 0.08), transparent 45%), linear-gradient(135deg, #f8fafc 0%, #ffffff 60%, #eff6ff 100%)',
        'brand-cta':
          'linear-gradient(135deg, #1e3a8a 0%, #155eef 50%, #188bf6 100%)',
        'brand-stripe':
          'repeating-linear-gradient(135deg, rgba(21, 94, 239, 0.04) 0 12px, transparent 12px 24px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-up-fast': 'fade-in-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.6s ease-out both',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        float: 'float 4.5s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        'gradient-shift': 'gradient-shift 8s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        'slide-in-right':
          'slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(21, 94, 239, 0.12), 0 8px 30px -8px rgba(21, 94, 239, 0.45)',
        'glow-orange':
          '0 0 0 1px rgba(249, 115, 22, 0.12), 0 8px 30px -8px rgba(249, 115, 22, 0.5)',
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -8px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
