/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            colors: {
                // Dark Theme Colors (Existing + Refined)
                dark: {
                    900: '#0f172a', // Main BG
                    800: '#1e293b', // Card BG
                    700: '#334155', // Borders
                },
                // Light Theme Colors (Cream / Skin Tone)
                light: {
                    900: '#FDFBF7', // Main BG (Warm Off-White)
                    800: '#FFFFFF', // Card BG (White)
                    700: '#E7E5E4', // Borders (Warm Gray)
                    600: '#D6D3D1', // Text Secondary
                    text: '#292524', // Main Text (Warm Black)
                },
                primary: {
                    500: '#3b82f6',
                    600: '#2563eb',
                    // Add maybe a specific accent for light mode?
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'spin-slow': 'spin 12s linear infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'scroll': 'scroll 25s linear infinite',
                'gradient-x': 'gradient-x 15s ease infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scroll: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                'gradient-x': {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'left center',
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center',
                    },
                },
            },
        },
    },
    plugins: [],
}
