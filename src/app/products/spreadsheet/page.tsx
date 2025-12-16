"use client";

import React, { useState, useEffect } from 'react';
import { Form, Table, Select, Button, Typography, message, Card, theme } from 'antd';
import { useTable, useSelect } from "@refinedev/antd";
import { useInvalidate } from "@refinedev/core";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { EditableCell } from "@/components/products/editable-cell";
import { IMappingField } from "@/interfaces/import";

export default function ProductSpreadsheetPage() {
    const { token } = theme.useToken();
    const [ form ] = Form.useForm();
    const [ selectedTemplateId, setSelectedTemplateId ] = useState<string | null>(null);
    const [ editingKey, setEditingKey ] = useState('');
    const [ isBulkEditing, setIsBulkEditing ] = useState(false);
    const invalidate = useInvalidate();

    // 1. Templates laden
    const { selectProps, query: templatesQuery } = useSelect({
        resource: "import_templates",
        meta: { schema: "product" },
        optionLabel: "name",
        optionValue: "id",
    });

    const currentTemplate = templatesQuery?.data?.data.find((t: any) => t.id === selectedTemplateId);

    // 2. Produkte laden (mit allen Relationen für maximale Flexibilität)
    const { tableProps } = useTable({
        resource: "productData",
        meta: {
            schema: "product",
            select: "*, logistics(*), specifications(*), features(*), tags(*)",
        },
        pagination: { pageSize: 50 }, // Mehr Zeilen wie in Excel
        queryOptions: {
            enabled: !!selectedTemplateId // Erst laden wenn Template gewählt
        }
    });

    // Helper: Ist diese Zeile gerade im Edit-Modus?
    const isEditing = (record: any) => isBulkEditing || record.id === editingKey;

    // --- BULK ACTION HANDLERS ---
    const startBulkEdit = () => {
        setIsBulkEditing(true);
        setEditingKey(''); // Clear individual key

        // Form für alle Rows füllen
        const dataSource = tableProps.dataSource || [];
        const formValues: any = {};

        dataSource.forEach((record: any) => {
            const logData = Array.isArray(record.logistics) ? record.logistics[ 0 ] : record.logistics;
            // Wir bauen ein Objekt { [id]: { ...fields } }
            formValues[ record.id ] = {
                ...record,
                ...logData
            };
        });

        form.setFieldsValue(formValues);
    };

    const cancelBulkEdit = () => {
        setIsBulkEditing(false);
        form.resetFields();
    };

    const saveAll = async () => {
        try {
            const allValues = await form.validateFields();
            // allValues ist { [id]: { field: val, ... }, [id2]: ... }

            // Wir iterieren über alle Keys im Form
            const updatePromises = Object.entries(allValues).map(async ([ key, row ]: [ string, any ]) => {
                if (!currentTemplate) return;

                for (const [ fieldKey, value ] of Object.entries(row)) {
                    // Mapping finden
                    const mapConfig = (currentTemplate as any).mapping_config.find((m: any) => m.targetField === fieldKey);

                    if (mapConfig && value !== undefined) {
                        // Update durchführen
                        await updateDatabase(key, mapConfig, value);
                    }
                }
            });

            await Promise.all(updatePromises);

            message.success("Alle Änderungen gespeichert");
            setIsBulkEditing(false);
            setEditingKey('');
            invalidate({ resource: "productData", invalidates: [ "list" ] });

        } catch (err) {
            console.log('Save all failed', err);
        }
    };

    // --- SPEICHERN LOGIK (INDIVIDUAL) ---
    const save = async (key: string) => {
        try {
            // Validate only data for this key? AntD Form doesn't easily support partial validate by path pattern without listing valid names.
            // Einfach alles validieren, aber nur den Key nutzen.
            const allValues = await form.validateFields();
            const row = allValues[ key ]; // Extract row data
            const newData = [ ...(tableProps.dataSource || []) ] as any[];
            const index = newData.findIndex((item) => key === item.id);

            if (index > -1) {
                const item = newData[ index ];

                // Wir müssen herausfinden, was geändert wurde und in welche DB-Tabelle es gehört
                // row enthält die flachen Keys aus dem Formular (z.B. "net_weight_kg" oder "name")

                if (!currentTemplate) return;

                // Wir iterieren durch die geänderten Felder
                for (const [ fieldKey, value ] of Object.entries(row)) {
                    // Mapping finden
                    const mapConfig = (currentTemplate as any).mapping_config.find((m: any) => m.targetField === fieldKey);

                    if (mapConfig && value !== undefined) {
                        // Update durchführen
                        await updateDatabase(item.id, mapConfig, value);
                    }
                }

                setEditingKey('');
                message.success("Zeile gespeichert");
                // Refresh der Tabelle
                invalidate({ resource: "productData", invalidates: [ "list" ] });
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    // --- DATABASE UPDATE HELPER ---
    const updateDatabase = async (productId: string, config: IMappingField, value: any) => {
        const { targetTable, targetField } = config;

        // Fall 1: Haupttabelle
        if (targetTable === 'productData') {
            await supabaseBrowserClient.schema('product').from('productData')
                .update({ [ targetField ]: value }).eq('id', productId);
        }
        // Fall 2: Logistik (1:1 Relation)
        else if (targetTable === 'logistics') {
            await supabaseBrowserClient.schema('product').from('logistics')
                .upsert({ product_id: productId, [ targetField ]: value }, { onConflict: 'product_id' });
        }
        // Fall 3: Specs/Features (Komplexer, da JSONB)
        // Das lassen wir für den Spreadsheet View erst mal "Read Only" oder als Textfeld, 
        // da JSON in einer Zelle schwer zu editieren ist.
    };

    // --- DYNAMISCHE SPALTEN BAUEN ---
    // --- DYNAMISCHE SPALTEN BAUEN ---
    const columns = [
        // Fixe Spalte: Artikelnummer (nicht editierbar zur Orientierung)
        {
            title: 'Artikel Nr.',
            dataIndex: 'item_no',
            width: 150,
            fixed: 'left' as const,
        },
        // Dynamische Spalten aus Template
        ...((currentTemplate as any)?.mapping_config
            .filter((field: IMappingField) => field.targetField !== 'item_no')
            .map((field: IMappingField) => {
                // Wir müssen den Pfad zu den Daten auflösen
                // productData -> direkt (z.B. 'name')
                // logistics -> array/objekt (z.B. ['logistics', 0, 'net_weight_kg'])

                let dataIndex: any = field.targetField;

                if (field.targetTable === 'logistics') {
                    // Supabase liefert logistics als Array oder Objekt. 
                    // AntD Table kommt mit Nested Paths klar, wenn die Datenstruktur stimmt.
                    // Wir nutzen hier einen render Hack, um es flach für das Formular zu machen.
                    dataIndex = field.targetField;
                }

                return {
                    title: field.csvHeader || field.targetField,
                    dataIndex: dataIndex,
                    editable: true, // Alle Template-Felder sind editierbar
                    width: 200,
                    // Custom Render für Relationen, um Werte anzuzeigen
                    render: (text: any, record: any) => {
                        if (field.targetTable === 'logistics') {
                            // Sicherstellen dass wir den Wert finden, egal ob Array oder Objekt
                            const logData = Array.isArray(record.logistics) ? record.logistics[ 0 ] : record.logistics;
                            return logData ? logData[ field.targetField ] : '-';
                        }
                        if (field.targetTable === 'productData') {
                            return text;
                        }
                        return <span style={{ color: '#ccc' }}>(Komplexer Typ)</span>;
                    }
                };
            }) || []),
        // Aktionen Spalte
        {
            title: 'Aktion',
            dataIndex: 'operation',
            fixed: 'right' as const,
            width: 100,
            render: (_: any, record: any) => {
                if (isBulkEditing) {
                    return <Typography.Text disabled>Bulk</Typography.Text>;
                }
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <Typography.Link onClick={() => save(record.id)} style={{ marginRight: 8 }}>
                            Save
                        </Typography.Link>
                        <Typography.Link onClick={() => setEditingKey('')} style={{ color: 'gray' }}>
                            Cancel
                        </Typography.Link>
                    </span>
                ) : (
                    <Typography.Link disabled={editingKey !== ''} onClick={() => {
                        // Beim Starten des Editierens müssen wir die verschachtelten Werte 
                        // "flach" ins Formular laden, damit die Inputs funktionieren
                        const logData = Array.isArray(record.logistics) ? record.logistics[ 0 ] : record.logistics;

                        form.setFieldsValue({
                            [ record.id ]: {
                                ...record,
                                ...logData
                            }
                        });
                        setEditingKey(record.id);
                    }}>
                        Edit
                    </Typography.Link>
                );
            },
        },
    ];

    // Spalten konfigurieren
    const mergedColumns = columns.map((col) => {
        if (!col.editable) return col;
        return {
            ...col,
            onCell: (record: any) => ({
                record,
                inputType: 'text', // Könnte man auch aus dem Template Typ ableiten
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    return (
        <div style={{ padding: 24 }}>
            <Form form={form} component={false}>
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography.Title level={3} style={{ margin: 0 }}>Massenbearbeitung (Spreadsheet)</Typography.Title>
                    <div style={{ display: 'flex', gap: 16 }}>
                        {selectedTemplateId && !isBulkEditing && (
                            <Button onClick={startBulkEdit} type="primary">
                                Alle Einträge bearbeiten
                            </Button>
                        )}
                        {isBulkEditing && (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Button onClick={cancelBulkEdit}>
                                    Abbrechen
                                </Button>
                                <Button onClick={saveAll} type="primary" loading={templatesQuery.isFetching}>
                                    Alle Speichern
                                </Button>
                            </div>
                        )}
                        <Select
                            style={{ width: 300 }}
                            placeholder="Vorlage auswählen zur Ansicht..."
                            loading={selectProps.loading}
                            options={selectProps.options}
                            onChange={setSelectedTemplateId}
                        />
                    </div>
                </div>

                {selectedTemplateId ? (
                    <Table
                        components={{ body: { cell: EditableCell } }}
                        bordered
                        dataSource={tableProps.dataSource}
                        columns={mergedColumns as any}
                        rowClassName="editable-row"
                        pagination={{ onChange: () => setEditingKey('') }}
                        loading={tableProps.loading}
                        scroll={{ x: 1000 }} // Horizontal scrollbar bei vielen Spalten
                        size="small" // Spreadsheet Look
                    />
                ) : (
                    <Card style={{ textAlign: 'center', marginTop: 50 }}>
                        <Typography.Text type="secondary">Bitte wähle oben eine Import-Vorlage aus, um die Spalten zu konfigurieren.</Typography.Text>
                    </Card>
                )}
            </Form>
        </div>
    );
}