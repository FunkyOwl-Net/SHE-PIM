"use client";

import React from "react";
import { Card, Typography, theme } from "antd";

const { Text, Title } = Typography;

interface InfoCardProps {
    title: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
    color?: string; // Optional accent color
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, value, icon, color }) => {
    const { token } = theme.useToken();

    return (
        <Card
            variant="borderless"
            style={{
                height: "100%",
                minWidth: 220,
                background: token.colorBgContainer,
                borderRadius: token.borderRadiusLG,
                border: `1px solid ${token.colorBorderSecondary}`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}
            bodyStyle={{ padding: "16px" }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {icon && (
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: color ? `${color}20` : token.colorFillSecondary,
                            color: color || token.colorTextSecondary,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 18,
                            flexShrink: 0
                        }}
                    >
                        {icon}
                    </div>
                )}
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {title}
                    </Text>
                    <div style={{ fontSize: 16, fontWeight: 600, color: token.colorTextHeading }}>
                        {value}
                    </div>
                </div>
            </div>
        </Card>
    );
};
