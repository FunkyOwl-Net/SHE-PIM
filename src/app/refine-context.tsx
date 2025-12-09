"use client";

import React from "react";
// 1. Hook für die URL-Prüfung importieren
import { usePathname } from "next/navigation";

import { Refine, GitHubBanner } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
// WICHTIG: Hier nutzen wir die Namen ohne "V2", wie vom Fehler vorgeschlagen
import { useNotificationProvider, ThemedLayout } from "@refinedev/antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ColorModeContextProvider } from "@contexts/color-mode";
import { DevtoolsProvider } from "@providers/devtools";
import { authProviderClient } from "@providers/auth-provider/auth-provider.client";
import { dataProvider } from "@providers/data-provider";
import routerProvider from "@refinedev/nextjs-router";
import "@refinedev/antd/dist/reset.css";
import {
    DashboardOutlined,
    ShoppingOutlined,
    UserOutlined,
    ImportOutlined
} from "@ant-design/icons";

import { Header } from "@/components/header";
import { AppSidebar } from "@/components/sidebar";

type RefineContextProps = {
    defaultMode: string;
    children: React.ReactNode;
};

export const RefineContext = ({ defaultMode, children }: RefineContextProps) => {
    // 2. Aktuellen Pfad abfragen
    const pathname = usePathname();

    // 3. Definieren, wo das Layout ausgeblendet werden soll
    // Wenn der Pfad "/login" ist, ist diese Variable true
    const isAuthPage = pathname === "/login";

    return (
        <RefineKbarProvider>
            <AntdRegistry>
                <ColorModeContextProvider defaultMode={defaultMode}>
                    <DevtoolsProvider>
                        <Refine
                            routerProvider={routerProvider}
                            authProvider={authProviderClient}
                            dataProvider={dataProvider}
                            notificationProvider={useNotificationProvider}
                            options={{
                                syncWithLocation: true,
                                warnWhenUnsavedChanges: true,
                                projectId: "yCevBC-d1a2ym-fkIPnA",
                            }}
                            resources={[
                                {
                                    name: "dashboard",
                                    list: "/", // Pfad für die Startseite
                                    meta: {
                                        label: "Dashboard",
                                        icon: <DashboardOutlined />,
                                    }
                                },
                                {
                                    name: "productData", // Name der Tabelle in Supabase
                                    list: "/products", // URL Pfad (Next.js Route)
                                    create: "/products/create", // URL für "Erstellen" Button
                                    edit: "/products/edit/:id", // URL für Bearbeiten
                                    show: "/products/show/:id", // URL für Detailansicht
                                    meta: {
                                        label: "Produkte",
                                        icon: <ShoppingOutlined />,
                                    }
                                },
                                {
                                    name: "import",
                                    list: "/import",
                                    meta: {
                                        label: "CSV Import",
                                        icon: <ImportOutlined />,
                                    }
                                },
                                {
                                    name: "profiles",
                                    list: "/profiles",
                                    meta: {
                                        label: "Benutzer",
                                        icon: <UserOutlined />,
                                        schema: "account", // Wie vorhin besprochen für das Schema
                                        hide: true
                                    }
                                }
                            ]}
                        >
                            {/* 4. Die Weiche: */}
                            {isAuthPage ? (
                                // A) Auf der Login-Seite: Nur den Inhalt (das Formular) rendern
                                <div style={{ height: "100vh" }}>
                                    {children}
                                </div>
                            ) : (
                                // B) Überall sonst: Das volle Layout mit Sidebar & Header
                                <ThemedLayout
                                    Header={Header}
                                    Sider={AppSidebar}
                                    initialSiderCollapsed={false}
                                >
                                    {children}
                                </ThemedLayout>
                            )}

                            <RefineKbar />
                        </Refine>
                    </DevtoolsProvider>
                </ColorModeContextProvider>
            </AntdRegistry>
        </RefineKbarProvider>
    );
};