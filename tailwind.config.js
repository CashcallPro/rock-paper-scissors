module.exports = {
  content: [ /* ... your content paths ... */ ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'], // Assuming Roboto for body text
        display: ['"Lilita One"', 'cursive'], // 'cursive' is a generic fallback
        // Or make Lilita One your default if you want:
        // sans: ['"Lilita One"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
