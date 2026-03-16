module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0f1923',
        paper: '#f7f4ef',
        cream: '#ede9e1',
        gold: '#c9933a',
        'gold-light': '#e8b96a',
        teal: '#1a6b6b',
        'teal-light': '#2a9090',
        red: '#c0392b',
        green: '#1e7e4a',
        muted: '#6b7280',
        border: '#d4cfc6',
      },
      fontFamily: {
        'sans': ['DM Sans', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
        'mono': ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}