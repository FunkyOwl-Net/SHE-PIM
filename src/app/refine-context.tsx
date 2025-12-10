"use client";

import React from "react";
// 1. Hook für die URL-Prüfung importieren
import { usePathname } from "next/navigation";

import { Refine, GitHubBanner } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
// WICHTIG: Hier nutzen wir die Namen ohne "V2", wie vom Fehler vorgeschlagen
import { useNotificationProvider, ThemedLayout } from "@refinedev/antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App } from "antd";
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
    ImportOutlined,
    CrownOutlined,
    FileExcelOutlined
} from "@ant-design/icons";

import { Header } from "@/components/header";
import { AppSidebar } from "@/components/sidebar";
import { accessControlProvider } from "@providers/access-control";

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
                    <App>
                        <DevtoolsProvider>
                            <Refine
                                routerProvider={routerProvider}
                                authProvider={authProviderClient}
                                dataProvider={dataProvider}
                                notificationProvider={useNotificationProvider}
                                accessControlProvider={accessControlProvider}
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
                                    // 1. Das "Parent" Element (nur für das Menü)
                                    {
                                        name: "admin",
                                        meta: {
                                            label: "Administration",
                                            icon: <CrownOutlined />,
                                        }
                                    },
                                    // 2. Das Dashboard (Übersicht)
                                    {
                                        name: "admin_dashboard",
                                        list: "/admin", // Landingpage
                                        meta: {
                                            label: "Übersicht",
                                            icon: <DashboardOutlined />,
                                            parent: "admin" // <--- Macht es zum Unterpunkt
                                        }
                                    },
                                    // 3. Benutzerverwaltung (verschoben nach Admin)
                                    {
                                        name: "profiles",
                                        list: "/admin/users",
                                        create: "/admin/users/create",
                                        edit: "/admin/users/edit/:id",
                                        meta: {
                                            label: "Benutzer & Rollen",
                                            icon: <UserOutlined />,
                                            parent: "admin", // <--- Unterpunkt
                                            schema: "account"
                                        }
                                    },
                                    // NEU: Templates Verwaltung
                                    {
                                        name: "import_templates",
                                        list: "/admin/templates",        // Der Link zur Liste
                                        create: "/admin/templates/create", // Der Link zum Erstellen
                                        edit: "/admin/templates/edit/:id", // Der Link zum Bearbeiten
                                        meta: {
                                            label: "Import Vorlagen",
                                            icon: <FileExcelOutlined />,
                                            parent: "admin",             // WICHTIG: Unterpunkt von "Administration"
                                            schema: "product"            // Liegt im Schema 'product'
                                        }
                                    },
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
                    </App>
                </ColorModeContextProvider>
            </AntdRegistry>
        </RefineKbarProvider>
    );
};