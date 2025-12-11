
import React from 'react';
import { Card, Typography, theme } from 'antd';

const { Text } = Typography;

interface StatWidgetProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
}

export const StatWidget: React.FC<StatWidgetProps> = ({ title, value, icon, color }) => {
    const { token } = theme.useToken();
    return (
        <Card styles={{ body: { padding: 12 } }} style={{ height: "100%", border: `1px solid ${token.colorBorderSecondary}` }} variant="borderless">
            <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between" }}>
                <div>
                    <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 600 }}>{title}</Text>
                    <div style={{ fontSize: 16, fontWeight: "bold", marginTop: 4, color: token.colorTextHeading }}>{value}</div>
                </div>
                <div style={{
                    color: color,
                    background: color ? `${color}15` : token.colorFillSecondary,
                    borderRadius: "50%",
                    width: 32, height: 32,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16
                }}>
                    {icon}
                </div>
            </div>
        </Card>
    );
};
