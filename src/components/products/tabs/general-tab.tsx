"use client";

import React from "react";
import { Form, Input, Row, Col, Card, Checkbox, Space, Button } from "antd";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";

// Props für den State des "Schlosses"
interface GeneralTabProps {
    isLocked: boolean;
    onToggleLock: () => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ isLocked, onToggleLock }) => {
    return (
        <Row gutter={24}>
            <Col xs={24} lg={16}>
                <Card title="Basisdaten" variant="borderless">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Artikelnummer" required help={!isLocked ? "Vorsicht: Kritische Änderung!" : null}>
                                <Space.Compact style={{ width: '100%' }}>
                                    <Form.Item name="item_no" noStyle rules={[ { required: true } ]}>
                                        <Input disabled={isLocked} />
                                    </Form.Item>
                                    <Button
                                        icon={isLocked ? <LockOutlined /> : <UnlockOutlined style={{ color: "#faad14" }} />}
                                        onClick={onToggleLock}
                                    />
                                </Space.Compact>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="EAN" name="EAN"><Input /></Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="Produktbezeichnung" name="name" rules={[ { required: true } ]}><Input /></Form.Item>
                    <Form.Item label="Beschreibung" name="description"><Input.TextArea rows={6} /></Form.Item>
                </Card>
            </Col>
            <Col xs={24} lg={8}>
                <Card title="Status & Kategorie" variant="borderless">
                    <Form.Item label="Marke" name="brand"><Input /></Form.Item>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="active" valuePropName="checked" label="Sichtbarkeit"><Checkbox>Aktiv</Checkbox></Form.Item></Col>
                        <Col span={12}><Form.Item name="eol" valuePropName="checked" label="Lifecycle"><Checkbox>End of Life</Checkbox></Form.Item></Col>
                    </Row>
                    <Form.Item label="Hauptkategorie" name="primaryCat"><Input /></Form.Item>
                    <Form.Item label="Unterkategorie" name="secondCat"><Input /></Form.Item>
                </Card>
            </Col>
        </Row>
    );
};