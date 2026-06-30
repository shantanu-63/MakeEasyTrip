/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/services/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-light': 'var(--color-bg-light)',
        'primary': 'var(--color-primary)',
        'primary-light': 'var(--color-primary-light)',
        'secondary': 'var(--color-secondary)',
        'secondary-hover': 'var(--color-secondary-hover)',
        'border': 'var(--color-border)',
        'text-main': 'var(--color-text-main)',
        'text-muted': 'var(--color-text-muted)',
      },
    },
  },
  corePlugins: {
    container: false,
  },
  plugins: [],
}
