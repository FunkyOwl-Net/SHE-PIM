
import React from 'react';
import { Card, Typography, theme } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const MarketingTab: React.FC = () => {
    const { token } = theme.useToken();
    return (
        <Card variant="borderless" style={{ textAlign: 'center', padding: 40 }}>
            <GlobalOutlined style={{ fontSize: 48, color: token.colorTextTertiary, marginBottom: 16 }} />
            <Title level={4}>Marketing Assets</Title>
            <Text type="secondary">Kampagnen, SEO-Texte und Social Media Assets werden hier bald verfügbar sein.</Text>
        </Card>
    );
};
