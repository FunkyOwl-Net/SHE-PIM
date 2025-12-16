
import React from 'react';
import { Card, Row, Col, Typography, Statistic, Divider, theme, Badge } from 'antd';
import { InboxOutlined, AppstoreOutlined, DeploymentUnitOutlined } from '@ant-design/icons';
import { IProductLogistics } from '@/interfaces/productdata';

const { Title, Text } = Typography;

interface LogisticsTabProps {
    logistics: IProductLogistics[] | any; // Accept array or any for backward compatibility
}

export const LogisticsDisplayTab: React.FC<LogisticsTabProps> = ({ logistics }) => {
    const { token } = theme.useToken();

    // Helper: Ensure we have an array
    const logisticsList: IProductLogistics[] = Array.isArray(logistics)
        ? logistics
        : (logistics ? [ logistics ] : []); // Fallback for single object or empty

    if (logisticsList.length === 0) {
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {logisticsList.map((unit, index) => {
                    const isDefault = index === 0 || unit.is_default;
                    const variantTitle = unit.variant_name || (isDefault ? "Standard" : `Variante ${index + 1}`);

                    return (
                        <Card
                            key={unit.id || index}
                            type="inner"
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <DeploymentUnitOutlined />
                                    <span>{variantTitle}</span>
                                    {isDefault && <Badge count="Standard" style={{ backgroundColor: token.colorSuccess, fontSize: 10, lineHeight: '18px' }} />}
                                </div>
                            }
                            style={{ borderColor: token.colorBorderSecondary }}
                        >
                            <Row gutter={[ 24, 24 ]}>
                                <Col xs={24} md={8}>
                                    <Card title="Netto (Produkt)" size="small" type="inner" variant="borderless" style={{ background: token.colorBgLayout }}>
                                        <Statistic title="Länge" value={unit.net_length_mm} suffix="mm" />
                                        <Statistic title="Breite" value={unit.net_width_mm} suffix="mm" />
                                        <Statistic title="Höhe" value={unit.net_height_mm} suffix="mm" />
                                        <Divider style={{ margin: "12px 0" }} />
                                        <Statistic title="Gewicht" value={unit.net_weight_kg} suffix="kg" valueStyle={{ color: token.colorPrimary }} />
                                    </Card>
                                </Col>
                                {unit.has_master_carton && (
                                    <Col xs={24} md={8}>
                                        <Card title={`Master Karton (${unit.master_quantity || '-'} Stk.)`} size="small" type="inner" variant="borderless" style={{ background: token.colorBgLayout }}>
                                            <Statistic title="Länge" value={unit.master_length_mm} suffix="mm" />
                                            <Statistic title="Breite" value={unit.master_width_mm} suffix="mm" />
                                            <Statistic title="Höhe" value={unit.master_height_mm} suffix="mm" />
                                            <Divider style={{ margin: "12px 0" }} />
                                            <Statistic title="Gewicht" value={unit.master_weight_kg} suffix="kg" />
                                        </Card>
                                    </Col>
                                )}
                                <Col xs={24} md={8}>
                                    <Card title="Paletten Daten" size="small" type="inner" variant="borderless" style={{ background: token.colorBgLayout }}>
                                        <Statistic title="Stück pro Palette" value={unit.items_per_pallet} prefix={<AppstoreOutlined />} />
                                        <Statistic title="Palettenhöhe" value={unit.pallet_height_mm} suffix="mm" style={{ marginTop: 16 }} />
                                    </Card>
                                </Col>
                            </Row>
                        </Card>
                    );
                })}
            </div>
        </Card>
    );
};
