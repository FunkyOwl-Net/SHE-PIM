
import React from 'react';
import { Card, Typography, theme } from 'antd';
import { RocketOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const SalesTab: React.FC = () => {
    const { token } = theme.useToken();
    return (
        <Card variant="borderless" style={{ textAlign: 'center', padding: 40 }}>
            <RocketOutlined style={{ fontSize: 48, color: token.colorTextTertiary, marginBottom: 16 }} />
            <Title level={4}>Vertriebsdaten</Title>
            <Text type="secondary">Preise, Verfügbarkeit und Vertriebskanäle werden hier bald verfügbar sein.</Text>
        </Card>
    );
};
