/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Explicitly point to the TS Tailwind config so Turbopack/PostCSS picks it up
    tailwindcss: { config: './tailwind.config.ts' },
    autoprefixer: {},
  },
};

export default config;
