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
import { getThemeConfig } from "@/theme";

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

  useEffect(() => {
    if (isMounted) {
      const request = async () => {
        try {
          Cookies.set("theme", mode, { expires: 365 });
        } catch (error) {
          console.error("Cookie set failed", error);
        }
      };

      request();
    }
  }, [ mode, isMounted ]);

  const setColorMode = () => {
    if (mode === "light") {
      setMode("dark");
    } else {
      setMode("light");
    }
  };

  const themeConfig = getThemeConfig(mode as "light" | "dark");

  return (
    <ColorModeContext.Provider
      value={{
        setMode: setColorMode,
        mode,
      }}
    >
      <style jsx global>{`
        body {
          background-color: ${themeConfig.token?.colorBgBase};
          color: ${themeConfig.token?.colorText};
          transition: background-color 0.3s, color 0.3s;
        }
        /* Layout overrides to ensure gapless theming */
        .ant-layout {
            background: ${themeConfig.token?.colorBgBase} !important;
        }
        /* FORCE Dark Mode Buttons */
        ${mode === 'dark' ? `
            .ant-btn-default:not(:disabled):not(.ant-btn-primary) {
                background-color: #313244 !important; /* Surface0 */
                border-color: #45475a !important;     /* Surface1 */
                color: #cdd6f4 !important;           /* Text */
            }
            .ant-btn-default:not(:disabled):not(.ant-btn-primary):hover {
                background-color: #45475a !important;
                border-color: #89b4fa !important;
                color: #89b4fa !important;
            }
            /* Table Row Actions specifically often use default buttons */
            .ant-table-wrapper .ant-btn {
                 background-color: #313244;
                 border-color: #45475a;
                 color: #cdd6f4;
            }
        ` : ''}
      `}</style>
      <ConfigProvider
        theme={themeConfig}
      >
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </ColorModeContext.Provider>
  );
};
