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

// Helper Function for recursive menu rendering
const renderMenuItems = (items: any[], go: any): any[] => {
    return items.map((item) => {
        // If the item has children (Submenu)
        if (item.children && item.children.length > 0) {
            return {
                key: item.key,
                icon: item.icon,
                label: item.label,
                children: renderMenuItems(item.children, go), // Recursion
            };
        }
        // Normal Item
        return {
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: () => go({ to: item.route ?? "" }),
        };
    });
};

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

    // Use the recursive helper to build the AntD menu items
    const items = renderMenuItems(menuItems, go);

    // If sticky is desired but without overlapping content, we should rely on Layout structure.
    // However, if the user complains it lies OVER the content, we should remove 'fixed' positioning.
    // If they want it sticky (stays when scrolling) but correctly placed, standard Sider behavior 
    // inside a Layout handles this if avoiding absolute/fixed CSS.
    // We will use standard Sider styling.

    return (
        <Sider
            {...siderProps}
            width={240} // Etwas breiter für modernen Look
            collapsible
            breakpoint="lg"
            theme={mode === "dark" ? "dark" : "light"}
            style={{
                ...siderProps.style,
                borderRight: `1px solid ${token.colorBorderSecondary}`,
                height: "100vh",
                position: "sticky",
                top: 0,
                left: 0,
                zIndex: 999,
                backgroundColor: token.colorBgContainer, // Nutzung von Token
                overflow: "hidden" // Keine Scrollbar am Sider selbst
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
                {/* 1. Logo Area (Optional, falls gewünscht, ansonsten Platzhalter) */}
                <div style={{ height: "64px", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
                    <div style={{ fontSize: "20px", fontWeight: "bold", color: token.colorPrimary }}>SHE</div>
                </div>

                {/* 2. Main Menu */}
                <div style={{
                    flex: 1,
                    overflowY: "auto",
                    paddingTop: "10px",
                    scrollbarWidth: "none", // Firefox
                    msOverflowStyle: "none" // IE 10+
                }}>
                    <style jsx>{`
                        div::-webkit-scrollbar {
                            display: none; /* Chrome/Safari/Webkit */
                        }
                    `}</style>
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

                {/* 3. Profile / User Area */}
                <div
                    style={{
                        borderTop: `1px solid ${token.colorBorderSecondary}`,
                        padding: "4px 0"
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
