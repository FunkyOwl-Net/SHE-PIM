"use client";

import {
  DevtoolsPanel,
  DevtoolsProvider as DevtoolsProviderBase,
} from "@refinedev/devtools";
import React from "react";

export const DevtoolsProvider = (props: React.PropsWithChildren) => {
  // Production optimization: Don't render DevTools
  if (process.env.NODE_ENV === "production") {
    return <>{props.children}</>;
  }

  return (
    <DevtoolsProviderBase>
      {props.children}
      <DevtoolsPanel />
    </DevtoolsProviderBase>
  );
};
