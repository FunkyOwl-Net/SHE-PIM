"use client";

import { RefineThemes } from "@refinedev/antd";
import { App as AntdApp, ConfigProvider, theme } from "antd";
import Cookies from "js-cookie";
import React, {
  type PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from "react";

type ColorModeContextType = {
  mode: string;
  setMode: (mode: string) => void;
};

export const ColorModeContext = createContext<ColorModeContextType>(
  {} as ColorModeContextType
);

type ColorModeContextProviderProps = {
  defaultMode?: string;
};

export const ColorModeContextProvider: React.FC<
  PropsWithChildren<ColorModeContextProviderProps>
> = ({ children, defaultMode }) => {
  const [ isMounted, setIsMounted ] = useState(false);
  const [ mode, setMode ] = useState(defaultMode || "light");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const theme = Cookies.get("theme") || "light";
      setMode(theme);
    }
  }, [ isMounted ]);

  const setColorMode = () => {
    if (mode === "light") {
      setMode("dark");
      Cookies.set("theme", "dark");
    } else {
      setMode("light");
      Cookies.set("theme", "light");
    }
  };

  const { darkAlgorithm, defaultAlgorithm } = theme;

  return (
    <ColorModeContext.Provider
      value={{
        setMode: setColorMode,
        mode,
      }}
    >
      <ConfigProvider
        theme={{
          token: mode === "light" ? {
            // --- MODERN CAPPUCCINO & SAND (LIGHT) ---
            // Adjusted: Warm Cream Cards & Tables (Not Sterile White)
            colorPrimary: "#a07855", // Cappuccino Bronze
            colorBgBase: "#fffdf9", // Warm Cream Base (No longer pure white)
            colorBgLayout: "#f7f3ef", // Deeper Sand Background
            colorText: "#4a3b32", // Deep Coffee
            colorTextSecondary: "#8c7b70", // Latte Gray
            colorTextTertiary: "#baaca5", // Pale Taupe
            colorBorder: "#e6dbcf", // Warm Taupe Border
            colorSplit: "#ede2d6", // Light Beige Split
            fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            borderRadius: 12,
          } : {
            // --- CATPPUCCIN MOCHA (DARK - UNTOUCHED) ---
            colorPrimary: "#2bb9dcff", // Blue
            colorBgBase: "#1e1e2e", // Base
            colorText: "#cdd6f4", // Text
            colorTextSecondary: "#bac2de", // Subtext1
            colorTextTertiary: "#a6adc8", // Subtext0
            colorBorder: "#45475a", // Surface1
            colorSplit: "#3f3f47ff", // Surface0
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            borderRadius: 8,
          },
          algorithm: mode === "light" ? defaultAlgorithm : darkAlgorithm,
          components: {
            Layout: {
              bodyBg: mode === "light" ? "#f7f3ef" : "#11111b",
              headerBg: mode === "light" ? "#fffdf9" : "#181825",
              triggerBg: mode === "light" ? "#fffdf9" : "#181825",
              siderBg: mode === "light" ? "linear-gradient(180deg, #fffdf9 0%, #f7f3ef 100%)" : "#181825",
            },
            Menu: {
              colorBgContainer: mode === "light" ? "transparent" : "#181825",
              subMenuItemBg: mode === "light" ? "transparent" : "#11111b",

              // Warm Text
              itemColor: mode === "light" ? "#6d5d53" : "#cdd6f4",
              itemHoverBg: mode === "light" ? "#ede2d6" : "#313244", // Darker Cream
              itemHoverColor: mode === "light" ? "#a07855" : "#89b4fa",

              // Active State: Soft Sand Pill
              itemSelectedBg: mode === "light" ? "#ede2d6" : "#45475a",
              itemSelectedColor: mode === "light" ? "#5d4037" : "#89b4fa", // Darker Coffee

              itemBorderRadius: 12,
              itemMarginInline: 8,
            },
            Card: {
              colorBgContainer: mode === "light" ? "#fffdf9" : "#1e1e2e", // Match Base
              borderRadiusLG: 16, // Very Soft
              headerBg: mode === "light" ? "#fffdf9" : "#1e1e2e",
              boxShadowTertiary: mode === "light" ? "0 4px 24px rgba(160, 120, 85, 0.08)" : "none", // Warmer Shadow
            },
            Table: {
              colorBgContainer: mode === "light" ? "#fffdf9" : "#1e1e2e",
              headerBg: mode === "light" ? "#f0e5da" : "#181825", // Distinct Latte Foam Header
              borderColor: mode === "light" ? "#e6dbcf" : "#45475a",
              rowHoverBg: mode === "light" ? "#faf5f0" : "#313244",
            },
            Button: {
              controlHeight: 40,
              borderRadius: 8,
              defaultBg: mode === "light" ? "#fffdf9" : "#313244",
              defaultBorderColor: mode === "light" ? "#dcd3ca" : "#45475a",
              defaultColor: mode === "light" ? "#6d5d53" : "#cdd6f4",
            },
            Input: {
              colorBgContainer: mode === "light" ? "#fffdf9" : "#181825",
              colorBorder: mode === "light" ? "#e0d6ce" : "#45475a",
              activeBorderColor: mode === "light" ? "#a07855" : "#2bb9dcff",
            },
            Typography: {
              colorTextHeading: mode === "light" ? "#3e2b22" : "#cdd6f4",
              colorTextDescription: mode === "light" ? "#8c7b70" : "#a6adc8",
            }
          }
        }}
      >
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </ColorModeContext.Provider>
  );
};
