import { createTheme } from '@mui/material';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#6C63FF', // Modern Purple
            light: '#8F89FF',
            dark: '#4B45B2',
        },
        secondary: {
            main: '#2EC4B6', // Teal/Cyan
            light: '#6FF7EA',
            dark: '#009387',
        },
        background: {
            default: '#F7F9FC', // Very light grey/blue
            paper: 'rgba(255, 255, 255, 0.8)', // Translucent for glassmorphism
        },
        text: {
            primary: '#2D3748',
            secondary: '#718096',
        },
    },
    typography: {
        fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
        borderRadius: 16, // More rounded corners
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundImage: 'linear-gradient(135deg, #F5F7FA 0%, #C3CFE2 100%)',
                    backgroundAttachment: 'fixed',
                    minHeight: '100vh',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(10px)', // The "Glass" effect
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 50, // Pill shaped buttons
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
                        transform: 'translateY(-1px)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(45deg, #6C63FF 30%, #4B45B2 90%)',
                },
                containedSecondary: {
                    background: 'linear-gradient(45deg, #2EC4B6 30%, #009387 90%)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    overflow: 'visible', // For hover effects that might pop out
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.25)',
                    },
                },
            },
        },
    },
});

export default theme;
