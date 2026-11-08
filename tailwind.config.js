/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* Deep Indigo Brand Tokens */
        brand: {
          50: '#EEF2FF',
          100: '#E0E1FA',
          500: '#6366F1',
          600: '#4F46E5',  /* primary buttons, links, active states */
          700: '#3730D9',  /* primary hover/pressed */
          900: '#1E1B6E',
          950: '#0B0F2E',
          dark: '#6366F1',
        },
        /* Semantic Accents */
        accent: {
          emerald: '#10B981', /* success / revenue growth */
          amber: '#F59E0B',   /* warnings / expiring subscriptions */
          rose: '#F43F5E',    /* critical / overdue */
          violet: '#A855F7',  /* active leads KPI card */
        },
        /* Canvas & Surfaces */
        canvas: {
          DEFAULT: '#F4F5FB',
          dark: '#0B0D24',
        },
        surface: {
          DEFAULT: "var(--surface)",
          alt: "var(--bg-surface-alt)",
          dark: '#14163A',
        },
        border: {
          subtle: "var(--border-subtle)",
          dark: '#262A5C',
        },
        /* Dark Sidebar Tokens */
        sidebar: {
          DEFAULT: '#14163A',
          bg: '#14163A',
          text: '#C7C9E8',
          'text-active': '#FFFFFF',
          active: '#4F46E5',
          icon: '#8B8DC4',
        },
        /* Status Badge Specific Tokens */
        badge: {
          'new-bg': 'var(--badge-new-bg)',
          'new-text': 'var(--badge-new-text)',
          'interested-bg': 'var(--badge-interested-bg)',
          'interested-text': 'var(--badge-interested-text)',
          'followup-bg': 'var(--badge-followup-bg)',
          'followup-text': 'var(--badge-followup-text)',
          'negotiation-bg': 'var(--badge-negotiation-bg)',
          'negotiation-text': 'var(--badge-negotiation-text)',
          'won-bg': 'var(--badge-won-bg)',
          'won-text': 'var(--badge-won-text)',
        },
        /* Semantic Dynamic CSS-Variable Colors */
        "surface-container-low": "var(--surface-container-low)",
        "on-tertiary-container": "var(--on-tertiary-container)",
        "primary-container": "var(--primary-container)",
        "on-surface-variant": "var(--on-surface-variant)",
        "on-primary": "var(--on-primary)",
        "on-surface": "var(--on-surface)",
        "secondary-container": "var(--secondary-container)",
        "on-tertiary": "var(--on-tertiary)",
        "surface-container-highest": "var(--surface-container-highest)",
        "tertiary-fixed-dim": "var(--tertiary-fixed-dim)",
        "on-primary-container": "var(--on-primary-container)",
        "on-secondary-fixed": "var(--on-secondary-fixed)",
        "secondary-fixed-dim": "var(--secondary-fixed-dim)",
        "tertiary": "var(--tertiary)",
        "tertiary-fixed": "var(--tertiary-fixed)",
        "on-primary-fixed": "var(--on-primary-fixed)",
        "secondary": "var(--secondary)",
        "surface-tint": "var(--surface-tint)",
        "on-secondary-fixed-variant": "var(--on-secondary-fixed-variant)",
        "error": "var(--error)",
        "background": "var(--background)",
        "outline": "var(--outline)",
        "on-tertiary-fixed": "var(--on-tertiary-fixed)",
        "primary-fixed-dim": "var(--primary-fixed-dim)",
        "outline-variant": "var(--outline-variant)",
        "surface-container": "var(--surface-container)",
        "primary": "var(--primary)",
        "on-error": "var(--on-error)",
        "on-secondary-container": "var(--on-secondary-container)",
        "on-tertiary-fixed-variant": "var(--on-tertiary-fixed-variant)",
        "on-background": "var(--on-background)",
        "surface-bright": "var(--surface-bright)",
        "surface-container-lowest": "var(--surface-container-lowest)",
        "surface-variant": "var(--surface-variant)",
        "inverse-surface": "var(--inverse-surface)",
        "inverse-on-surface": "var(--inverse-on-surface)",
        "surface-dim": "var(--surface-dim)",
        "secondary-fixed": "var(--secondary-fixed)",
        "on-error-container": "var(--on-error-container)",
        "error-container": "var(--error-container)",
        "tertiary-container": "var(--tertiary-container)",
        "inverse-primary": "var(--inverse-primary)",
        "primary-fixed": "var(--primary-fixed)",
        "on-primary-fixed-variant": "var(--on-primary-fixed-variant)",
        "surface-container-high": "var(--surface-container-high)",
        "on-secondary": "var(--on-secondary)"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "space-md": "1.5rem",
        "space-lg": "2rem",
        "margin-sm": "1rem",
        "space-xs": "0.5rem",
        "space-sm": "1rem",
        "gutter-sm": "1rem",
        "space-xl": "3rem",
        "margin": "2rem",
        "gutter": "1.5rem"
      },
      fontFamily: {
        "label-md": ["IBM Plex Sans", "IBM Plex Sans Arabic", "sans-serif"],
        "body-md": ["IBM Plex Sans", "IBM Plex Sans Arabic", "sans-serif"],
        "headline-sm": ["IBM Plex Sans", "IBM Plex Sans Arabic", "sans-serif"],
        "headline-lg-mobile": ["IBM Plex Sans", "IBM Plex Sans Arabic", "sans-serif"],
        "label-sm": ["IBM Plex Sans", "IBM Plex Sans Arabic", "sans-serif"],
        "body-lg": ["IBM Plex Sans", "IBM Plex Sans Arabic", "sans-serif"],
        "display": ["IBM Plex Sans", "IBM Plex Sans Arabic", "sans-serif"],
        "headline-lg": ["IBM Plex Sans", "IBM Plex Sans Arabic", "sans-serif"],
        "body-sm": ["IBM Plex Sans", "IBM Plex Sans Arabic", "sans-serif"],
        "headline-md": ["IBM Plex Sans", "IBM Plex Sans Arabic", "sans-serif"],
        "code-sm": ["JetBrains Mono", "monospace"]
      },
      fontSize: {
        "label-md": ["14px", {"lineHeight": "22px", "fontWeight": "500"}],
        "body-md": ["14px", {"lineHeight": "24px", "fontWeight": "400"}],
        "headline-sm": ["16px", {"lineHeight": "26px", "fontWeight": "600"}],
        "headline-lg-mobile": ["24px", {"lineHeight": "34px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
        "label-sm": ["12px", {"lineHeight": "18px", "fontWeight": "500"}],
        "body-lg": ["16px", {"lineHeight": "26px", "fontWeight": "400"}],
        "display": ["36px", {"lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "headline-lg": ["28px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
        "body-sm": ["12px", {"lineHeight": "20px", "fontWeight": "400"}],
        "headline-md": ["20px", {"lineHeight": "30px", "fontWeight": "600"}],
        "code-sm": ["12px", {"lineHeight": "18px", "fontWeight": "400"}]
      }
    },
  },
  plugins: [],
}
