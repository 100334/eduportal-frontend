module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Blue & Ice White Theme
        ink: '#0a192f',           // Deep Navy
        paper: '#f0f4f8',         // Ice White background
        cream: '#e1e8f0',         // Soft Glacier for borders
        white: '#ffffff',         // Pure white for cards
        
        // Brand Colors - Azure
        azure: '#007fff',          // Primary Azure
        'azure-light': '#3399ff',  // Lighter Azure for hover
        'azure-dark': '#005bb5',   // Darker Azure for depth
        
        // UI Feedback
        red: '#e63946',            // Crisp Red
        green: '#2dce89',          // Vibrant Green
        muted: '#64748b',          // Slate Grey for subtle text
        border: '#cbd5e1',         // Cool Gray border
        
        // Legacy mappings (for backward compatibility)
        gold: '#007fff',            // Maps to azure
        'gold-light': '#3399ff',    // Maps to azure-light
        teal: '#1a6b6b',            // Keeping teal
        'teal-light': '#2a9090',    // Keeping teal-light
      },
      fontFamily: {
        // Consistent font stack across the entire app
        'sans': ['DM Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'serif': ['Playfair Display', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        'mono': ['DM Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        // Headings use serif, body uses sans - this creates nice hierarchy
        'heading': ['Playfair Display', 'serif'],
        'body': ['DM Sans', 'sans-serif'],
      },
      fontSize: {
        // Consistent type scale
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        black: '900',
      },
      boxShadow: {
        'azure': '0 4px 14px 0 rgba(0, 127, 255, 0.2)',
        'azure-lg': '0 8px 25px 0 rgba(0, 127, 255, 0.3)',
      },
      animation: {
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      },
    },
  },
  plugins: [],
}