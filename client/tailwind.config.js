/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'vibrant-red': '#FF0033',
                'metallic-silver': '#C0C0C0',
                'deep-red': '#8B0000',
                'toxic-green': '#00FF00',
                'void-purple': '#800080',
            },
            fontFamily: {
                sans: ['"Share Tech Mono"', 'monospace'],
                heading: ['"Oswald"', 'sans-serif'],
                metal: ['"Metal Mania"', 'cursive'],
                creep: ['"Creepster"', 'cursive'],
            },
            letterSpacing: {
                tighter: '-0.05em',
                tight: '-0.02em',
                widest: '0.2em',
            },
        },
    },
    plugins: [],
}
