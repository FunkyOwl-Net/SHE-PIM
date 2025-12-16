"use client";

import React, { useState, useEffect } from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Button, Table, Select, Divider } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { AVAILABLE_FIELDS, IMappingField } from "@/interfaces/import";
import { useRouter } from "next/navigation";

export default function EditTemplatePage() {
    const router = useRouter();
    const [ mappings, setMappings ] = useState<IMappingField[]>([]);

    const { formProps, saveButtonProps, query, formProps: { form } } = useForm({
        resource: "import_templates",
        meta: { schema: "product" },
        action: "edit",
        redirect: false // Wir navigieren manuell
    });

    // Daten laden und State setzen
    useEffect(() => {
        if (query?.data?.data) {
            const record = query.data.data;
            if (record.mapping_config) {
                setMappings(record.mapping_config as unknown as IMappingField[]);
            }
        }
    }, [ query?.data ]);

    // Manuelles Speichern
    const handleSave = async (values: any) => {
        const id = query?.data?.data?.id;
        if (!id) return;

        await supabaseBrowserClient.schema("product").from("import_templates").update({
            name: values.name,
            description: values.description,
            mapping_config: mappings
        }).eq("id", id);

        router.push("/admin/templates");
    };

    const addMapping = () => {
        setMappings([ ...mappings, { csvHeader: "", targetTable: "productData", targetField: "" } ]);
    };

    const updateMapping = (index: number, field: keyof IMappingField, value: any) => {
        const newMappings = [ ...mappings ];

        if (field === 'targetField') {
            const definition = AVAILABLE_FIELDS.find(f => f.value === value);
            if (definition) {
                newMappings[ index ].targetTable = definition.table as any;
                if (definition.isDynamic) {
                    newMappings[ index ].isSpecKey = true;
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
        <Edit title="Template Bearbeiten" saveButtonProps={{ ...saveButtonProps, onClick: form?.submit }}>
            <Form {...formProps} form={formProps.form} layout="vertical" onFinish={handleSave}>
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
            </Form>
        </Edit>
    );
}
