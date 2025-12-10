"use client";

import React from "react";
import { Form, InputNumber, Card, Row, Col, Switch, Divider, Typography } from "antd";
import { DeploymentUnitOutlined, CodeSandboxOutlined, AppstoreAddOutlined, BorderOuterOutlined } from "@ant-design/icons";

const { Text } = Typography;

// Helper Komponente für Dimensionen (L x B x H)
const DimensionsRow = ({ prefix, label }: { prefix: string, label: string }) => (
    <div style={{ marginBottom: 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{label} (L x B x H)</Text>
        <Row gutter={16}>
            <Col span={8}>
                <Form.Item name={`${prefix}_length_mm`} noStyle>
                    <InputNumber placeholder="Länge" suffix="mm" style={{ width: '100%' }} min={0} />
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item name={`${prefix}_width_mm`} noStyle>
                    <InputNumber placeholder="Breite" suffix="mm" style={{ width: '100%' }} min={0} />
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item name={`${prefix}_height_mm`} noStyle>
                    <InputNumber placeholder="Höhe" suffix="mm" style={{ width: '100%' }} min={0} />
                </Form.Item>
            </Col>
        </Row>
    </div>
);

export const LogisticsTab = () => {
    // Wir nutzen useWatch, um den Switch für Master Carton zu überwachen
    const form = Form.useFormInstance();
    const hasMaster = Form.useWatch('has_master_carton', form);

    return (
        <div style={{ padding: "20px 0" }}>
            <Row gutter={[ 24, 24 ]}>

                {/* LINKE SPALTE: Einzelprodukt & Verpackung */}
                <Col xs={24} lg={12}>
                    <Card title={<><CodeSandboxOutlined /> Produkt & Verpackung</>} variant="borderless" style={{ height: '100%' }}>

                        {/* NETTO DATEN */}
                        <Divider orientation="left" style={{ marginTop: 0 }}>Netto (Produkt pur)</Divider>
                        <DimensionsRow prefix="net" label="Abmessungen" />
                        <Form.Item label="Nettogewicht" name="net_weight_kg">
                            <InputNumber suffix="kg" style={{ width: '100%' }} min={0} step="0.01" />
                        </Form.Item>

                        {/* BRUTTO DATEN */}
                        <Divider orientation="left">Brutto (Inkl. Verpackung)</Divider>
                        <DimensionsRow prefix="gross" label="Abmessungen Verpackung" />
                        <Form.Item label="Bruttogewicht" name="gross_weight_kg">
                            <InputNumber suffix="kg" style={{ width: '100%' }} min={0} step="0.01" />
                        </Form.Item>
                    </Card>
                </Col>

                {/* RECHTE SPALTE: Umkarton & Palette */}
                <Col xs={24} lg={12}>
                    <Card title={<><DeploymentUnitOutlined /> Logistik Einheiten</>} variant="borderless" style={{ height: '100%' }}>

                        {/* MASTER CARTON */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <span style={{ fontWeight: 600, fontSize: 16 }}><BorderOuterOutlined /> Umkarton / Master Carton</span>
                            <Form.Item name="has_master_carton" valuePropName="checked" noStyle>
                                <Switch checkedChildren="Ja" unCheckedChildren="Nein" />
                            </Form.Item>
                        </div>

                        {hasMaster && (
                            <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 24, border: '1px solid #f0f0f0' }}>
                                <DimensionsRow prefix="master" label="Abmessungen Umkarton" />
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="Gewicht" name="master_weight_kg">
                                            <InputNumber suffix="kg" style={{ width: '100%' }} min={0} step="0.01" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="Stück pro Karton" name="master_quantity">
                                            <InputNumber style={{ width: '100%' }} min={1} precision={0} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        )}

                        {/* PALETTE */}
                        <Divider orientation="left"><AppstoreAddOutlined /> Paletten Daten</Divider>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Stück pro Palette" name="items_per_pallet">
                                    <InputNumber style={{ width: '100%' }} min={0} precision={0} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Palettenhöhe" name="pallet_height_mm">
                                    <InputNumber suffix="mm" style={{ width: '100%' }} min={0} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};