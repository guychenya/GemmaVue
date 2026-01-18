/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                // Enterprise Dark Theme Palette
                sidebar: '#0f172a', // Slate 900
                canvas: '#020617',  // Slate 950
                card: 'rgba(30, 41, 59, 0.7)', // Slate 800 with opacity
                primary: {
                    DEFAULT: '#3b82f6', // Blue 500
                    hover: '#2563eb',   // Blue 600
                    soft: 'rgba(59, 130, 246, 0.1)',
                },
                surface: {
                    DEFAULT: '#1e293b',
                    hover: '#334155'
                }
            },
            borderRadius: {
                'xl': '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem', // Reduced from 32px (2rem)
            },
            boxShadow: {
                'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            },
            backdropBlur: {
                'xs': '2px',
            }
        },
    },
    plugins: [],
}
