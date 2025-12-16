"use client";

import React from "react";
import { Form, InputNumber, Card, Row, Col, Switch, Divider, Typography, Button, Input, Space, theme } from "antd";
import { DeploymentUnitOutlined, CodeSandboxOutlined, AppstoreAddOutlined, BorderOuterOutlined, PlusOutlined, DeleteOutlined, InboxOutlined, CopyOutlined } from "@ant-design/icons";

const { Text } = Typography;

// Helper Komponente für Dimensionen (L x B x H)
// WICHTIG: Wir müssen den `name`-Pfad nun relativ zum List-Item field übergeben oder zusammensetzen.
// Da Form.List fields ein Array [name, fieldKey, ...] zurückgibt, passen wir die Props an.
const DimensionsRow = ({ fieldName, label }: { fieldName: number | string, label: string }) => (
    <div style={{ marginBottom: 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{label} (L x B x H)</Text>
        <Row gutter={16}>
            <Col span={8}>
                <Form.Item name={[ fieldName, "net_length_mm" ]} noStyle> {/* ACHTUNG: Hier war vorher prefix, das müssen wir anpassen wenn wir es nutzen */}
                    {/* Moment, die DimensionsRow wurde generisch genutzt für net, gross, master. 
                         Der alte Code hatte 'prefix' als string ("net" -> "net_length_mm").
                         Jetzt sind wir IN einer Form.List. Das 'fieldName' ist der Index (0, 1, 2...).
                         Wir müssen also den vollen Pfad bauen: [index, "net_length_mm"].
                         
                         ABER: DimensionsRow wurde so aufgerufen: <DimensionsRow prefix="net" ... />
                         Das funktioniert nicht mehr direkt mit simplem String-Concat wenn wir verschachtelt sind.
                         
                         Lösung: Wir übergeben das 'field' Objekt von Form.List oder den Index, 
                         und zusätzlich das Prefix ("net", "gross").
                      */}
                </Form.Item>
            </Col>
        </Row>
    </div>
);

// Bessere Helper Komponente, die mit Form.List Field funktioniert
const DimensionsRowListCompatible = ({ fieldName, prefix, label }: { fieldName: number | string, prefix: string, label: string }) => (
    <div style={{ marginBottom: 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{label} (L x B x H)</Text>
        <Row gutter={16}>
            <Col span={8}>
                <Form.Item name={[ fieldName, `${prefix}_length_mm` ]} noStyle>
                    <InputNumber placeholder="Länge" suffix="mm" style={{ width: '100%' }} min={0} />
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item name={[ fieldName, `${prefix}_width_mm` ]} noStyle>
                    <InputNumber placeholder="Breite" suffix="mm" style={{ width: '100%' }} min={0} />
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item name={[ fieldName, `${prefix}_height_mm` ]} noStyle>
                    <InputNumber placeholder="Höhe" suffix="mm" style={{ width: '100%' }} min={0} />
                </Form.Item>
            </Col>
        </Row>
    </div>
);


const LogisticsUnitCard = ({ field, index, remove, isDefault }: { field: any, index: number, remove: (index: number) => void, isDefault: boolean }) => {
    // Innerhalb einer Map müssen wir useWatch etwas anders nutzen oder auf Form dependencies setzen.
    // Form.Item mit 'dependencies' ist hier der saubere Weg für bedingtes Rendern (Master Carton).
    const { token } = theme.useToken();
    const cardBg = isDefault ? token.colorBgContainer : token.colorBgLayout;

    return (
        <Card
            style={{ marginBottom: 24, background: cardBg, borderColor: isDefault ? token.colorBorder : token.colorBorderSecondary }}
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                        {isDefault ? <DeploymentUnitOutlined /> : <CopyOutlined />}
                        {isDefault ? (
                            <span>Standard Einheit (Hauptdaten)</span>
                        ) : (
                            <Form.Item name={[ field.name, "variant_name" ]} noStyle rules={[ { required: true, message: 'Name benötigt' } ]}>
                                <Input placeholder="Name der Variante (z.B. Paket 2)" style={{ minWidth: 200 }} />
                            </Form.Item>
                        )}
                    </Space>
                    {!isDefault && (
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)}>
                            Entfernen
                        </Button>
                    )}
                </div>
            }
        >
            <Row gutter={[ 24, 24 ]}>
                {/* LINKE SPALTE: Einzelprodukt & Verpackung */}
                <Col xs={24} lg={12}>
                    <Card type="inner" title="Produkt & Verpackung" size="small">
                        {/* NETTO DATEN */}
                        <Divider style={{ marginTop: 0 }}>Netto (Produkt pur)</Divider>
                        <DimensionsRowListCompatible fieldName={field.name} prefix="net" label="Abmessungen" />
                        <Form.Item label="Nettogewicht" name={[ field.name, "net_weight_kg" ]}>
                            <InputNumber suffix="kg" style={{ width: '100%' }} min={0} step="0.01" />
                        </Form.Item>

                        {/* BRUTTO DATEN */}
                        <Divider>Brutto (Inkl. Verpackung)</Divider>
                        <DimensionsRowListCompatible fieldName={field.name} prefix="gross" label="Abmessungen Verp." />
                        <Form.Item label="Bruttogewicht" name={[ field.name, "gross_weight_kg" ]}>
                            <InputNumber suffix="kg" style={{ width: '100%' }} min={0} step="0.01" />
                        </Form.Item>
                    </Card>
                </Col>

                {/* RECHTE SPALTE: Umkarton & Palette */}
                <Col xs={24} lg={12}>
                    <Card type="inner" title="Logistik Einheiten" size="small">
                        {/* MASTER CARTON */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <span style={{ fontWeight: 600, fontSize: 16 }}><BorderOuterOutlined /> Umkarton / Master</span>
                            <Form.Item name={[ field.name, "has_master_carton" ]} valuePropName="checked" noStyle initialValue={false}>
                                <Switch checkedChildren="Ja" unCheckedChildren="Nein" />
                            </Form.Item>
                        </div>

                        <Form.Item noStyle shouldUpdate={(prev, curr) => {
                            // Helper access for nested fields is tricky. We rely on standard render prop pattern here.
                            // We need shouldUpdate to trigger re-render when 'has_master_carton' changes for THIS index.
                            // However, 'prev' and 'curr' are the WHOLE form values.
                            // We construct path: logistics[index].has_master_carton
                            const prevVal = prev.logistics?.[ field.name ]?.has_master_carton;
                            const currVal = curr.logistics?.[ field.name ]?.has_master_carton;
                            return prevVal !== currVal;
                        }}>
                            {({ getFieldValue }) => {
                                const hasMaster = getFieldValue([ 'logistics', field.name, 'has_master_carton' ]);
                                return hasMaster ? (
                                    <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 24, border: '1px solid #f0f0f0' }}>
                                        <DimensionsRowListCompatible fieldName={field.name} prefix="master" label="Abmessungen Umkarton" />
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item label="Gewicht" name={[ field.name, "master_weight_kg" ]}>
                                                    <InputNumber suffix="kg" style={{ width: '100%' }} min={0} step="0.01" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item label="Stück pro Karton" name={[ field.name, "master_quantity" ]}>
                                                    <InputNumber style={{ width: '100%' }} min={1} precision={0} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </div>
                                ) : null;
                            }}
                        </Form.Item>

                        {/* PALETTE */}
                        <Divider><AppstoreAddOutlined /> Paletten Daten</Divider>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Stück pro Palette" name={[ field.name, "items_per_pallet" ]}>
                                    <InputNumber style={{ width: '100%' }} min={0} precision={0} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Palettenhöhe" name={[ field.name, "pallet_height_mm" ]}>
                                    <InputNumber suffix="mm" style={{ width: '100%' }} min={0} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Card>
    );
}

export const LogisticsTab = () => {
    return (
        <div style={{ padding: "20px 0" }}>
            <Form.List name="logistics">
                {(fields, { add, remove }) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {fields.map((field, index) => (
                            <LogisticsUnitCard
                                key={field.key}
                                field={field}
                                index={index}
                                remove={remove}
                                isDefault={index === 0} // Die erste Einheit ist immer Standard
                            />
                        ))}

                        <Button type="dashed" onClick={() => add({ variant_name: 'Neue Variante', is_default: false })} block icon={<PlusOutlined />}>
                            Weitere Logistik-Einheit hinzufügen
                        </Button>
                    </div>
                )}
            </Form.List>
        </div>
    );
};