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

      // Toggle Body Class for CSS targeting
      if (mode === "dark") {
        document.body.classList.add("dark");
        document.body.classList.remove("light");
      } else {
        document.body.classList.add("light");
        document.body.classList.remove("dark");
      }
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
      <ConfigProvider
        theme={themeConfig}
      >
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </ColorModeContext.Provider>
  );
};
