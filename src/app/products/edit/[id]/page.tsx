"use client";

import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select, Checkbox, Row, Col, Card } from "antd";
import { IProductData } from "@/interfaces/productdata";

export default function ProductEditPage() {
    // 1. Der Hook, der alles macht: Laden, State, Speichern
    const { formProps, saveButtonProps, query } = useForm<IProductData>({
        resource: "productData",
        meta: {
            schema: "product", // WICHTIG: Wieder das Schema angeben
            select: "*", // Alles laden, damit das Formular gefüllt ist
        },
        // Optional: Nach dem Speichern zur Liste zurück
        redirect: "list",
    });

    // Lade-Status für die UX
    const productData = query?.data?.data;
    const isLoading = query?.isLoading;

    return (
        <Edit saveButtonProps={saveButtonProps} isLoading={isLoading}>
            <Form
                {...formProps}
                form={formProps.form}
                layout="vertical"
                // Initialwerte setzen, falls beim Laden etwas schief geht
                initialValues={{
                    active: true,
                    eol: false,
                    ...formProps.initialValues
                }}
            >
                {/* Wir nutzen ein Grid für besseres Layout */}
                <Row gutter={24}>

                    {/* LINKE SPALTE: Hauptdaten */}
                    <Col xs={24} lg={16}>
                        <Card title="Basisdaten" bordered={false}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Artikelnummer"
                                        name="item_no"
                                        rules={[ { required: true, message: 'Pflichtfeld' } ]}
                                    >
                                        <Input disabled={true} />
                                        {/* Oft darf man die Art.Nr. nicht mehr ändern */}
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="EAN"
                                        name="EAN"
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Produktbezeichnung"
                                name="name"
                                rules={[ { required: true } ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Beschreibung"
                                name="description"
                            >
                                <Input.TextArea rows={6} />
                            </Form.Item>
                        </Card>
                    </Col>

                    {/* RECHTE SPALTE: Einstellungen & Status */}
                    <Col xs={24} lg={8}>
                        <Card title="Status & Kategorie" bordered={false}>
                            <Form.Item
                                label="Marke"
                                name="brand"
                            >
                                <Input />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="active"
                                        valuePropName="checked"
                                        label="Sichtbarkeit"
                                    >
                                        <Checkbox>Aktiv</Checkbox>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="eol"
                                        valuePropName="checked"
                                        label="Lifecycle"
                                    >
                                        <Checkbox>End of Life</Checkbox>
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* Beispiel für Kategorien (als Textfeld vorerst) */}
                            <Form.Item label="Hauptkategorie" name="primaryCat">
                                <Input />
                            </Form.Item>
                            <Form.Item label="Unterkategorie" name="secondaryCat">
                                <Input />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </Edit>
    );
}