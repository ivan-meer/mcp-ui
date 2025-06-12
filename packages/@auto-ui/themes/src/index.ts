// packages/@auto-ui/themes/src/index.ts
export interface ColorPalette {
  primary: string;
  secondary: string;
  background: string;
  surface: string; // For card backgrounds, etc.
  textPrimary: string;
  textSecondary: string;
  error: string;
  success: string;
  // ... more colors as needed
  [key: string]: string; // Allow for additional, arbitrary color names
}

export interface TypographyScale {
  fontSize: string;
  fontWeight?: string | number;
  lineHeight?: string | number;
  letterSpacing?: string;
}

export interface TypographyConfig {
  fontFamily?: string;
  h1: TypographyScale;
  h2: TypographyScale;
  h3: TypographyScale;
  body1: TypographyScale;
  body2: TypographyScale;
  caption?: TypographyScale;
  // ... more typography styles
}

export interface SpacingScale {
  xs: string | number; // e.g., 4px or 0.25rem
  sm: string | number; // e.g., 8px or 0.5rem
  md: string | number; // e.g., 16px or 1rem
  lg: string | number; // e.g., 24px or 1.5rem
  xl: string | number; // e.g., 32px or 2rem
  // ... more spacing units
  [key: string]: string | number;
}

export interface BorderRadiusScale {
  none: string | number;
  sm: string;
  md: string;
  lg: string;
  full: string;
  [key: string]: string | number;
}

export interface ShadowConfig {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    none: string;
    [key: string]: string;
}

export interface ThemeConfig {
  name: string;
  colors: ColorPalette;
  typography: TypographyConfig;
  spacing: SpacingScale;
  borderRadius: BorderRadiusScale;
  shadows: ShadowConfig;
  // Component-specific overrides can be added later
  // components?: {
  //   AutoCard?: { defaultProps?: Partial<any>, styleOverrides?: any };
  //   // ... other components
  // };
}

// Continuing in packages/@auto-ui/themes/src/index.ts

export const defaultLightTheme: ThemeConfig = {
  name: 'light',
  colors: {
    primary: '#007bff', // Blue
    secondary: '#6c757d', // Gray
    background: '#f8f9fa', // Light gray
    surface: '#ffffff',   // White
    textPrimary: '#212529', // Dark gray
    textSecondary: '#6c757d', // Gray
    error: '#dc3545',     // Red
    success: '#28a745',   // Green
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 'bold' },
    h2: { fontSize: '2rem', fontWeight: 'bold' },
    h3: { fontSize: '1.75rem', fontWeight: 'bold' },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.875rem' },
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
  },
  borderRadius: {
    none: '0',
    sm: '0.2rem',
    md: '0.375rem', // Tailwind's default rounded-md is 0.375rem (6px)
    lg: '0.5rem',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  }
};

// Continuing in packages/@auto-ui/themes/src/index.ts

export const defaultDarkTheme: ThemeConfig = {
  name: 'dark',
  colors: {
    primary: '#0d6efd',    // Brighter Blue for dark mode
    secondary: '#adb5bd',  // Lighter Gray
    background: '#121212', // Very dark gray (common dark mode background)
    surface: '#1e1e1e',    // Slightly lighter dark gray for cards
    textPrimary: '#e9ecef', // Light gray for text
    textSecondary: '#adb5bd',// Lighter Gray
    error: '#f44336',      // Material Design Red
    success: '#4caf50',    // Material Design Green
  },
  typography: { // Often same as light, but can be adjusted
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 'bold' },
    h2: { fontSize: '2rem', fontWeight: 'bold' },
    h3: { fontSize: '1.75rem', fontWeight: 'bold' },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.875rem' },
  },
  spacing: { // Usually same as light
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: { // Usually same as light
    none: '0',
    sm: '0.2rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
  shadows: { // Shadows might be more subtle or use different colors in dark mode
    none: 'none',
    sm: '0 1px 2px 0 rgb(255 255 255 / 0.05)', // Adjusted for dark
    md: '0 4px 6px -1px rgb(255 255 255 / 0.06), 0 2px 4px -2px rgb(255 255 255 / 0.06)',
    lg: '0 10px 15px -3px rgb(255 255 255 / 0.06), 0 4px 6px -4px rgb(255 255 255 / 0.06)',
    xl: '0 20px 25px -5px rgb(255 255 255 / 0.06), 0 8px 10px -6px rgb(255 255 255 / 0.06)',
  }
};

// For now, accessing themes is by direct import.
// A ThemeProvider context can be added later in @auto-ui/components or here.
