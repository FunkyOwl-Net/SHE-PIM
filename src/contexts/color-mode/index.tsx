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
        /* FORCE Dark Mode Buttons & Text */
        ${mode === 'dark' ? `
            /* Fix invisible headers */
            h1, h2, h3, h4, h5, h6, 
            .ant-typography,
            .ant-page-header-heading-title,
            .ant-pro-layout-content-header-title {
                color: #cdd6f4 !important;
            }
            
            /* Fix Buttons (Nuclear Option) */
            .ant-btn {
                color: #cdd6f4;
                border-color: #45475a;
            }
            
            /* Default buttons (Action Buttons) */
            .ant-btn-default, 
            .ant-btn-default:not(:disabled):not(.ant-btn-primary) {
                background-color: #313244 !important; /* Surface0 */
                border-color: #585b70 !important;     /* Surface2 */
                color: #cdd6f4 !important;
            }
            
            .ant-btn-default:hover, 
            .ant-btn-default:not(:disabled):not(.ant-btn-primary):hover {
                background-color: #45475a !important;
                border-color: #89b4fa !important;
                color: #89b4fa !important;
            }
            
            /* Icons in buttons */
            .ant-btn .anticon {
                color: inherit !important;
            }

            /* Table Row Actions specifically often use default buttons */
            .ant-table-wrapper .ant-btn {
                 background-color: #313244 !important;
                 border-color: #45475a !important;
                 color: #cdd6f4 !important;
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
