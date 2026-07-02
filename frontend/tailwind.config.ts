import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        whatsapp: { light: '#25D366', dark: '#128C7E', darker: '#075E54' },
      },
    },
  },
  plugins: [],
}
export default config
