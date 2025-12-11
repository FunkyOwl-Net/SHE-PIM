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
            // --- CATPPUCCIN LATTE (LIGHT) ---
            colorPrimary: "#1e66f5", // Blue
            colorBgBase: "#eff1f5", // Base
            colorText: "#4c4f69", // Text
            colorTextSecondary: "#5c5f77", // Subtext1
            colorTextTertiary: "#6c6f85", // Subtext0
            colorBorder: "#bcc0cc", // Surface1
            colorSplit: "#ccd0da", // Surface0
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            borderRadius: 8,
          } : {
            // --- CATPPUCCIN MOCHA (DARK) ---
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
              bodyBg: mode === "light" ? "#dce0e8" : "#11111b",
              headerBg: mode === "light" ? "#e6e9ef" : "#181825",
              triggerBg: mode === "light" ? "#e6e9ef" : "#181825",
              // Sider Background - usually handled by Layout.Sider but good to have fallback
              siderBg: mode === "light" ? "#e6e9ef" : "#181825",
            },
            Menu: {
              // Latte: Mantle (#e6e9ef) | Mocha: Mantle (#181825)
              colorBgContainer: mode === "light" ? "#e6e9ef" : "#181825",

              // Submenu Background (Recessed depth in Dark Mode)
              subMenuItemBg: mode === "light" ? "transparent" : "#11111b", // Dark: Crust

              // Standard Item Styles
              itemColor: mode === "light" ? "#4c4f69" : "#cdd6f4",
              itemHoverBg: mode === "light" ? "#ccd0da" : "#313244", // Surface0
              itemHoverColor: mode === "light" ? "#1e66f5" : "#89b4fa", // Primary on hover

              // Selected Item - Solid "Pill" Look (Clean & Premium)
              // Dark Mode: Surface1 (#45475a) provides better contrast than Surface0 against the dark backgrounds
              itemSelectedBg: mode === "light" ? "#ffffff" : "#45475a",
              itemSelectedColor: mode === "light" ? "#1e66f5" : "#89b4fa", // Primary Color

              // Shape
              itemBorderRadius: 8,
              itemMarginInline: 8, // Floating effect
            },
            Card: {
              colorBgContainer: mode === "light" ? "#eff1f5" : "#1e1e2e",
              borderRadiusLG: 12,
              headerBg: mode === "light" ? "#eff1f5" : "#1e1e2e", // Match Container
            },
            Table: {
              colorBgContainer: mode === "light" ? "#eff1f5" : "#1e1e2e",
              headerBg: mode === "light" ? "#e6e9ef" : "#181825",
              borderColor: mode === "light" ? "#bcc0cc" : "#45475a",
            },
            Button: {
              controlHeight: 38,
              borderRadius: 6,
              defaultBg: mode === "light" ? "#ffffff" : "#313244", // Surface0 for dark buttons
              defaultBorderColor: mode === "light" ? "#bcc0cc" : "#45475a",
            },
            Input: {
              colorBgContainer: mode === "light" ? "#ffffff" : "#181825",
              colorBorder: mode === "light" ? "#bcc0cc" : "#45475a",
            },
            Typography: {
              colorTextHeading: mode === "light" ? "#4c4f69" : "#cdd6f4",
            }
          }
        }}
      >
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </ColorModeContext.Provider>
  );
};
