/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#FF4D00',
                    light: '#FF7A33',
                    dark: '#CC3D00',
                },
                secondary: {
                    DEFAULT: '#0F172A',
                    light: '#1E293B',
                },
                surface: {
                    DEFAULT: '#ffffff',
                    dim: '#f8fafc',
                    dark: '#e2e8f0',
                },
                text: {
                    main: '#0F172A',
                    muted: '#64748B',
                }
            },
            fontFamily: {
                body: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
                heading: ['Outfit', 'sans-serif'],
            },
            keyframes: {
                fadeIn: {
                    'from': { opacity: '0' },
                    'to': { opacity: '1' },
                },
                slideUp: {
                    'from': { opacity: '0', transform: 'translateY(20px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' },
                },
                slideRight: {
                    'from': { opacity: '0', transform: 'translateX(-20px)' },
                    'to': { opacity: '1', transform: 'translateX(0)' },
                },
                scaleIn: {
                    'from': { opacity: '0', transform: 'scale(0.9)' },
                    'to': { opacity: '1', transform: 'scale(1)' },
                }
            },
            animation: {
                fadeIn: 'fadeIn 0.8s ease-out forwards',
                slideUp: 'slideUp 0.8s ease-out forwards',
                slideRight: 'slideRight 0.6s ease-out forwards',
                scaleIn: 'scaleIn 0.5s ease-out forwards',
            }
        },
    },
    plugins: [],
}
