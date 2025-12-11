
import React from 'react';
import { Card, Row, Col, Typography, Statistic, Divider, theme } from 'antd';
import { InboxOutlined, AppstoreOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface LogisticsTabProps {
    logistics: any;
}

export const LogisticsDisplayTab: React.FC<LogisticsTabProps> = ({ logistics }) => {
    const { token } = theme.useToken();

    if (!logistics) {
        return (
            <Card variant="borderless">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <span style={{ color: token.colorPrimary, fontSize: 18 }}><InboxOutlined /></span>
                    <Title level={4} style={{ margin: 0, fontSize: 18 }}>Logistik & Verpackung</Title>
                </div>
                <Text type="secondary" italic>Keine Logistikdaten vorhanden.</Text>
            </Card>
        );
    }

    return (
        <Card variant="borderless">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ color: token.colorPrimary, fontSize: 18 }}><InboxOutlined /></span>
                <Title level={4} style={{ margin: 0, fontSize: 18 }}>Logistik & Verpackung</Title>
            </div>

            <Row gutter={[ 24, 24 ]}>
                <Col xs={24} md={8}>
                    <Card title="Netto (Produkt)" size="small" type="inner">
                        <Statistic title="Länge" value={logistics.net_length_mm} suffix="mm" />
                        <Statistic title="Breite" value={logistics.net_width_mm} suffix="mm" />
                        <Statistic title="Höhe" value={logistics.net_height_mm} suffix="mm" />
                        <Divider style={{ margin: "12px 0" }} />
                        <Statistic title="Gewicht" value={logistics.net_weight_kg} suffix="kg" valueStyle={{ color: token.colorPrimary }} />
                    </Card>
                </Col>
                {logistics.has_master_carton && (
                    <Col xs={24} md={8}>
                        <Card title={`Master Karton (${logistics.master_quantity} Stk.)`} size="small" type="inner">
                            <Statistic title="Länge" value={logistics.master_length_mm} suffix="mm" />
                            <Statistic title="Breite" value={logistics.master_width_mm} suffix="mm" />
                            <Statistic title="Höhe" value={logistics.master_height_mm} suffix="mm" />
                            <Divider style={{ margin: "12px 0" }} />
                            <Statistic title="Gewicht" value={logistics.master_weight_kg} suffix="kg" />
                        </Card>
                    </Col>
                )}
                <Col xs={24} md={8}>
                    <Card title="Paletten Daten" size="small" type="inner">
                        <Statistic title="Stück pro Palette" value={logistics.items_per_pallet} prefix={<AppstoreOutlined />} />
                        <Statistic title="Palettenhöhe" value={logistics.pallet_height_mm} suffix="mm" style={{ marginTop: 16 }} />
                    </Card>
                </Col>
            </Row>
        </Card>
    );
};
