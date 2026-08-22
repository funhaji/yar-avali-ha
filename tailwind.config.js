/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IRANSans', 'Tahoma', 'sans-serif'],
      },
      colors: {
        'ink': 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        'cream': 'var(--cream)',
        'paper': 'var(--paper)',
        'tangerine': 'var(--tangerine)',
        'teal': {
          DEFAULT: 'var(--teal)',
          deep: 'var(--teal-deep)',
        },
        'sunflower': 'var(--sunflower)',
        'berry': 'var(--berry)',
        'line-soft': 'var(--line-soft)',
      },
    },
  },
  plugins: [],
}
