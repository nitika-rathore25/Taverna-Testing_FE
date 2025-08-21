/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                primaryGradientStart: '#3A6482',
                primaryGradientEnd: '#3A78CA',
            },
            backgroundImage: {
                'primary-gradient': 'linear-gradient(to right, var(--tw-color-primaryGradientStart), var(--tw-color-primaryGradientEnd))',
            },


        },
    },
    plugins: [],
}
