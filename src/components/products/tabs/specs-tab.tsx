"use client";

import React from "react";
import { Form, Input, Button, Card, Row, Col } from "antd";
import { PlusOutlined, MinusCircleOutlined, TableOutlined, UnorderedListOutlined } from "@ant-design/icons";

export const SpecsTab = () => {
    return (
        <div style={{ padding: "20px 0" }}>
            <Row gutter={[ 24, 24 ]}>

                {/* --- SEKTION 1: TECHNISCHE DATEN --- */}
                <Col xs={24} xl={14}>
                    <Card title={<><TableOutlined /> Technische Daten</>} variant="borderless">
                        <Form.List name="specs_items">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        // WICHTIG: 'key' muss hier am Row-Element stehen
                                        <Row key={key} gutter={8} style={{ marginBottom: 8 }} align="middle">
                                            <Col span={8}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[ name, 'key' ]}
                                                    rules={[ { required: true, message: 'Fehlt' } ]}
                                                    noStyle
                                                >
                                                    <Input placeholder="Merkmal" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[ name, 'value' ]}
                                                    rules={[ { required: true, message: 'Fehlt' } ]}
                                                    noStyle
                                                >
                                                    <Input placeholder="Wert" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[ name, 'unit' ]}
                                                    noStyle
                                                >
                                                    <Input placeholder="Einheit" style={{ color: "#666" }} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={2} style={{ textAlign: "center" }}>
                                                <MinusCircleOutlined
                                                    onClick={() => remove(name)}
                                                    style={{ color: "red", fontSize: "16px", cursor: "pointer" }}
                                                />
                                            </Col>
                                        </Row>
                                    ))}
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Merkmal hinzufügen
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Card>
                </Col>

                {/* --- SEKTION 2: FEATURES --- */}
                <Col xs={24} xl={10}>
                    <Card title={<><UnorderedListOutlined /> Features</>} variant="borderless">
                        <Form.List name="features_items">
                            {(fields, { add, remove }) => (
                                <>
                                    {/* KORREKTUR HIER:
                                        Wir nehmen 'key' aus dem Feld-Objekt und setzen es explizit an das div.
                                        Der Rest (...restField) geht an Form.Item.
                                    */}
                                    {fields.map(({ key, name, ...restField }) => (
                                        <div key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'flex-start' }}>
                                            <Form.Item
                                                {...restField} // Enthält KEIN 'key' mehr
                                                name={name} // Wichtig: Bei einfachen Arrays ist name der Index
                                                validateTrigger={[ 'onChange', 'onBlur' ]}
                                                rules={[ { required: true, message: "Bitte Text eingeben" } ]}
                                                noStyle
                                            >
                                                <Input.TextArea
                                                    placeholder="Feature Beschreibung..."
                                                    autoSize={{ minRows: 1, maxRows: 3 }}
                                                    style={{ width: '100%', marginRight: 8 }}
                                                />
                                            </Form.Item>
                                            <MinusCircleOutlined
                                                onClick={() => remove(name)}
                                                style={{ color: "red", marginLeft: 8, marginTop: 8, fontSize: "16px", cursor: "pointer" }}
                                            />
                                        </div>
                                    ))}
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Feature hinzufügen
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};