"use client";

import React, { useContext } from "react";
// import { ThemedSider } from "@refinedev/antd"; // Removed to avoid warnings
import { useGo, useMenu, useLogout } from "@refinedev/core";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
// Replace ThemedSider with Layout.Sider to avoid "children deprecated" warning from Refine's internal Menu usage
import { Layout, Menu, theme } from "antd";
import { usePathname } from "next/navigation";
import { ColorModeContext } from "@contexts/color-mode";

const { Sider } = Layout;

export const AppSidebar = (props: any) => {
    // Destructure props to remove Refine/ThemedLayout specific props that shouldn't be passed to HTML elements
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { Title, RenderToTitle, Footer, RenderToFooter, fixed, width: _width, ...siderProps } = props;

    const { menuItems, selectedKey, defaultOpenKeys } = useMenu();
    const go = useGo();
    const { mutate: logout } = useLogout();
    const pathname = usePathname();
    const { token } = theme.useToken();
    const { mode } = useContext(ColorModeContext);

    // Determine the selected key for the profile menu
    const selectedProfileKeys = pathname === "/profiles" ? [ "profiles" ] : [];

    const items = menuItems.map((item) => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
        onClick: () => go({ to: item.route ?? "" }),
    }));

    // If sticky is desired but without overlapping content, we should rely on Layout structure.
    // However, if the user complains it lies OVER the content, we should remove 'fixed' positioning.
    // If they want it sticky (stays when scrolling) but correctly placed, standard Sider behavior 
    // inside a Layout handles this if avoiding absolute/fixed CSS.
    // We will use standard Sider styling.

    return (
        <Sider
            {...siderProps}
            width={200}
            theme={mode === "dark" ? "dark" : "light"}
            style={{
                ...siderProps.style,
                borderRight: `1px solid ${token.colorBorderSecondary}`,
                // Removed 'position: fixed' to fix overlap issue.
                // Allow parent Layout to manage flow.
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                }}
            >
                {/* 1. Main Menu */}
                <div style={{ flex: 1, overflowY: "auto", paddingTop: "64px" }}>
                    {/* Added paddingTop to avoid overlap with Logo/Header if it exists, 
                        though previously there was no logo rendered in sidebar. 
                        Adjust based on design. */}
                    <Menu
                        mode="inline"
                        theme={mode === "dark" ? "dark" : "light"}
                        selectedKeys={[ selectedKey ]}
                        defaultOpenKeys={defaultOpenKeys}
                        items={items}
                        style={{
                            border: "none",
                            backgroundColor: "transparent"
                        }}
                    />
                </div>

                {/* 2. Profile / User Area */}
                <div
                    style={{
                        borderTop: `1px solid ${token.colorBorderSecondary}`,
                    }}
                >
                    <Menu
                        mode="inline"
                        theme={mode === "dark" ? "dark" : "light"}
                        selectedKeys={selectedProfileKeys}
                        style={{
                            marginBottom: 0,
                            border: "none",
                            backgroundColor: "transparent"
                        }}
                        items={[
                            {
                                key: "profiles",
                                icon: <UserOutlined />,
                                label: "Mein Profil",
                                onClick: () => go({ to: "/profiles" }),
                            },
                            {
                                key: "logout",
                                icon: <LogoutOutlined />,
                                label: "Abmelden",
                                danger: true,
                                onClick: () => logout(),
                            }
                        ]}
                    />
                </div>
            </div>
        </Sider>
    );
};
