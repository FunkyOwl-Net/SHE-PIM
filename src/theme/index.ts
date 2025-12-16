import { ThemeConfig, theme } from "antd";

// Palettes
const lightPalette = {
    base: "#f7f3ef",
    surface: "#fffdf9",
    text: "#4a3b32",
    textSecondary: "#6c5d53",
    border: "#e6e1db",
    primary: "#1677ff", // Default Ant Blue or Custom
};

const darkPalette = {
    // Catppuccin Mocha Base
    base: "#1e1e2e",
    surface: "#181825", // Mantle (slightly darker) or different shade for cards
    surfaceHighlight: "#313244", // Surface0
    text: "#cdd6f4",
    textSecondary: "#bac2de",
    textTertiary: "#a6adc8",
    border: "#45475a", // Surface1
    primary: "#89b4fa", // Blue
};

export const getThemeConfig = (mode: "light" | "dark"): ThemeConfig => {
    const isDark = mode === "dark";
    const palette = isDark ? darkPalette : lightPalette;

    return {
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
            // Global Tokens
            colorBgBase: palette.base,
            colorBgContainer: palette.surface,
            colorText: palette.text,
            colorTextSecondary: palette.textSecondary,
            colorTextTertiary: isDark ? darkPalette.textTertiary : undefined,
            colorBorder: palette.border,
            colorPrimary: palette.primary,
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            borderRadius: 8,
        },
        components: {
            Layout: {
                bodyBg: palette.base,
                headerBg: palette.surface,
                siderBg: palette.surface,
                triggerBg: palette.surface,
            },
            Card: {
                colorBgContainer: palette.surface,
                colorBorderSecondary: palette.border,
            },
            Table: {
                colorBgContainer: palette.surface,
                headerBg: isDark ? "#11111b" : "#fafafa", // Darker header for tables in dark mode (Crust)
                rowHoverBg: isDark ? "#313244" : "#f5f5f5",
                borderColor: palette.border,
            },
            Button: {
                // Generelle Button Styles
                controlHeight: 38,
                borderRadius: 8,
                
                // LIGHT Mode Buttons
                // Primary is handled by global colorPrimary
                defaultBg: isDark ? "#313244" : "#ffffff", // Dark: Surface0, Light: Pure White
                defaultBorderColor: isDark ? "#45475a" : "#d9d9d9", // Dark: Surface1
                defaultColor: isDark ? "#cdd6f4" : "rgba(0, 0, 0, 0.88)",
                
                // Hover States
                defaultHoverBg: isDark ? "#45475a" : "#ffffff",
                defaultHoverBorderColor: isDark ? "#89b4fa" : "#1677ff",
                defaultHoverColor: isDark ? "#89b4fa" : "#1677ff",
            },
            Typography: {
                fontFamilyCode: "'Fira Code', monospace",
                colorText: palette.text,
                colorTextHeading: palette.text,
                colorTextDescription: palette.textSecondary,
                fontSize: 14,
            },
            Input: {
                colorBgContainer: isDark ? "#11111b" : "#ffffff", // Input fields distinct
                colorBorder: isDark ? "#45475a" : "#d9d9d9",
                hoverBorderColor: isDark ? "#89b4fa" : "#4096ff",
            },
            Select: {
                colorBgContainer: isDark ? "#11111b" : "#ffffff",
                colorBorder: isDark ? "#45475a" : "#d9d9d9",
                optionSelectedBg: isDark ? "#313244" : "#e6f7ff",
            },
            Modal: {
                contentBg: palette.surface,
                headerBg: palette.surface,
            },
            Tag: {
                 defaultBg: isDark ? "#313244" : "#fafafa",
                 defaultColor: palette.text,
            }
        },
    };
};
