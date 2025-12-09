"use client";

import React, { useContext } from "react";
import { ThemedSider } from "@refinedev/antd";
import { useGo } from "@refinedev/core";
import { UserOutlined } from "@ant-design/icons";
import { Menu, theme } from "antd";
import { usePathname } from "next/navigation";
import { ColorModeContext } from "@contexts/color-mode";

export const AppSidebar = (props: React.ComponentProps<typeof ThemedSider>) => {
    const go = useGo();
    const pathname = usePathname();
    const { token } = theme.useToken();
    const { mode } = useContext(ColorModeContext); // Hook für den Dark/Light Mode

    // Determine the selected key for the profile menu
    const selectedKeys = pathname === "/profiles" ? [ "profiles" ] : [];

    return (
        <ThemedSider
            {...props}
            fixed
            render={({ items, logout, collapsed }) => {
                return (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            height: "100%",
                        }}
                    >
                        {/* 1. Das Menü (nimmt den verfügbaren Platz ein) */}
                        <div style={{ flex: 1, overflowY: "auto" }}>
                            {items}
                        </div>

                        {/* 2. Der User-Bereich + Logout (klebt unten) */}
                        <div
                            style={{
                                borderTop: `1px solid ${token.colorBorderSecondary}`,
                            }}
                        >
                            {/* Wir nutzen hier ein echtes Ant Design Menu, 
                                damit es EXAKT gleich aussieht wie das Hauptmenü */}
                            <Menu
                                mode="inline"
                                theme={mode === "dark" ? "dark" : "light"} // Automatische Anpassung
                                selectedKeys={selectedKeys}
                                style={{
                                    marginBottom: 0,
                                    border: "none",
                                    backgroundColor: "transparent" // Wichtig, damit es sich in den Sider integriert
                                }}
                                items={[
                                    {
                                        key: "profiles",
                                        icon: <UserOutlined />,
                                        label: "Mein Profil",
                                        onClick: () => go({ to: "/profiles" }),
                                    }
                                ]}
                            />

                            {/* Logout rendern wir direkt, meistens ist das ein Button oder eigenes Element */}
                            {logout && (
                                <div style={{ padding: collapsed ? "8px" : "16px" }}>
                                    {logout}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }}
        />
    );
};
