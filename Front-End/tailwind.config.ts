import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'museo-sans-rounded': ['Museo Sans Rounded', 'sans-serif'],
      },
      colors: {
        primary: { DEFAULT: `hsl(var(--primary))` },
        secondary: { DEFAULT: `hsl(var(--secondary))` },
        "gray": {
          'light': "#F1F2F4",
          'dark': "#B6BCC3"
        },
        green: {
          100: '#F0FFF4',
          200: '#6B7B6E',
          300: '#9AE6B4',
          400: '#68D391',
          500: '#48BB78',
          600: '#38A169',
          700: '#2F855A',
          800: '#276749',
          900: '#22543D',
          1000: '#184032',
        },
        background: {
          DEFAULT: `hsl(var(--background))`,
          light: `hsl(var(--accent-1))`,
          dark: `hsl(var(--accent-2))`,
        },
      },
    },
  },
  plugins: [],
};
export default config;