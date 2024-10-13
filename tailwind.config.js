/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
  	container: {
  		center: 'true',
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			text: {
  				'50': '#eef6f7',
  				'100': '#dcecef',
  				'200': '#b9d9df',
  				'300': '#96c6cf',
  				'400': '#73b3bf',
  				'500': '#50a1af',
  				'600': '#40808c',
  				'700': '#306069',
  				'800': '#204046',
  				'900': '#102023',
  				'950': '#081011'
  			},
  			background: {
  				'50': '#ecf6f8',
  				'100': '#daeef1',
  				'200': '#b4dde4',
  				'300': '#8fccd6',
  				'400': '#69bbc9',
  				'500': '#44a9bb',
  				'600': '#368896',
  				'700': '#296670',
  				'800': '#1b444b',
  				'900': '#0e2225',
  				'950': '#071113'
  			},
  			primary: {
  				'50': '#eaf7fb',
  				'100': '#d4eff7',
  				'200': '#aadfee',
  				'300': '#7fd0e6',
  				'400': '#55c0dd',
  				'500': '#2ab0d5',
  				'600': '#228daa',
  				'700': '#196a80',
  				'800': '#114655',
  				'900': '#08232b',
  				'950': '#041215'
  			},
  			secondary: {
  				'50': '#e8f8fd',
  				'100': '#d1f1fa',
  				'200': '#a2e4f6',
  				'300': '#74d6f1',
  				'400': '#45c8ed',
  				'500': '#17bbe8',
  				'600': '#1295ba',
  				'700': '#0e708b',
  				'800': '#094b5d',
  				'900': '#05252e',
  				'950': '#021317'
  			},
  			accent: {
  				'50': '#e6fafe',
  				'100': '#cdf4fe',
  				'200': '#9be9fd',
  				'300': '#69dffc',
  				'400': '#37d4fb',
  				'500': '#05c9fa',
  				'600': '#04a1c8',
  				'700': '#037996',
  				'800': '#025064',
  				'900': '#012832',
  				'950': '#011419'
  			}
  		},
  		screens: {
  			xs: '480px'
  		},
  		width: {
  			'420': '420px',
  			'465': '465px'
  		},
  		fontFamily: {
  			inter: ['Poppins', 'sans-serif']
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}