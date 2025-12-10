"use client";

import React, { useState } from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Button, Table, Select, Card, Space, Divider } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { AVAILABLE_FIELDS, IMappingField } from "@/interfaces/import";

export default function CreateTemplatePage() {
    const [ mappings, setMappings ] = useState<IMappingField[]>([
        { csvHeader: "Artikelnummer", targetTable: "productData", targetField: "item_no" }
    ]);

    const { formProps, saveButtonProps } = useForm({
        resource: "import_templates",
        meta: { schema: "product" },
        redirect: "list"
    });

    // Manuelles Speichern, da wir das JSON bauen müssen
    const handleSave = async (values: any) => {
        await supabaseBrowserClient.schema("product").from("import_templates").insert({
            name: values.name,
            description: values.description,
            mapping_config: mappings // Das JSON Array
        });
        // Hier noch Redirect/Success Logik einbauen...
    };

    const addMapping = () => {
        setMappings([ ...mappings, { csvHeader: "", targetTable: "productData", targetField: "" } ]);
    };

    const updateMapping = (index: number, field: keyof IMappingField, value: any) => {
        const newMappings = [ ...mappings ];

        if (field === 'targetField') {
            // Wenn man das Zielfeld wählt, automatisch Tabelle setzen
            const definition = AVAILABLE_FIELDS.find(f => f.value === value);
            if (definition) {
                newMappings[ index ].targetTable = definition.table as any;
                // Spezialfall Specs: Hier ist targetField eigentlich der Key-Name
                if (definition.isDynamic) {
                    newMappings[ index ].isSpecKey = true;
                    // Reset targetField damit User es manuell eingeben kann (für JSON Key)
                    if (value !== 'json_spec') newMappings[ index ].targetField = value;
                } else {
                    newMappings[ index ].isSpecKey = false;
                    newMappings[ index ].targetField = value;
                }
            }
        } else {
            newMappings[ index ] = { ...newMappings[ index ], [ field ]: value };
        }
        setMappings(newMappings);
    };

    return (
        <Create title="Import/Export Template erstellen">
            <Form layout="vertical" onFinish={handleSave}>
                <Form.Item label="Template Name" name="name" rules={[ { required: true } ]}>
                    <Input placeholder="z.B. Lieferant Müller Import" />
                </Form.Item>
                <Form.Item label="Beschreibung" name="description">
                    <Input.TextArea />
                </Form.Item>

                <Divider>Spalten Mapping</Divider>

                <Table
                    dataSource={mappings}
                    pagination={false}
                    rowKey={(r, i) => i || 0}
                    columns={[
                        {
                            title: "CSV Spaltenname (Header)",
                            render: (_, record, index) => (
                                <Input
                                    value={record.csvHeader}
                                    onChange={e => updateMapping(index, 'csvHeader', e.target.value)}
                                    placeholder="z.B. Weight"
                                />
                            )
                        },
                        {
                            title: "Ziel in Datenbank",
                            render: (_, record, index) => (
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Select
                                        style={{ width: 200 }}
                                        options={AVAILABLE_FIELDS}
                                        onChange={val => updateMapping(index, 'targetField', val)}
                                        value={record.isSpecKey ? (record.targetTable === 'specifications' ? 'json_spec' : record.targetTable) : record.targetField}
                                    />
                                    {/* Wenn es ein JSON Feld ist, brauchen wir ein extra Feld für den Key */}
                                    {record.targetTable === 'specifications' && (
                                        <Input
                                            placeholder="Key (z.B. Watt)"
                                            value={record.targetField === 'json_spec' ? '' : record.targetField}
                                            onChange={e => updateMapping(index, 'targetField', e.target.value)}
                                        />
                                    )}
                                </div>
                            )
                        },
                        {
                            title: "",
                            render: (_, __, index) => (
                                <Button danger icon={<DeleteOutlined />} onClick={() => {
                                    const m = [ ...mappings ]; m.splice(index, 1); setMappings(m);
                                }} />
                            )
                        }
                    ]}
                />
                <Button type="dashed" onClick={addMapping} block icon={<PlusOutlined />} style={{ marginTop: 16 }}>
                    Spalte hinzufügen
                </Button>

                <div style={{ marginTop: 24, display: 'flex', justifySelf: 'end' }}>
                    <Button type="primary" htmlType="submit">Template Speichern</Button>
                </div>
            </Form>
        </Create>
    );
}