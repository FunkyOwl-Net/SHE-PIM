
"use client";

import React, { useState } from "react";
import { Select, Upload, Button, Card, Progress, Typography, Alert, List } from "antd";
import { InboxOutlined, UploadOutlined, FileExcelOutlined } from "@ant-design/icons";
import { useSelect } from "@refinedev/core";
import { IImportTemplate } from "@/interfaces/import";
import { processImport } from "@/utils/import-engine";

export default function ImportPage() {
    const [ selectedTemplateId, setSelectedTemplateId ] = useState<string | null>(null);
    const [ file, setFile ] = useState<File | null>(null);
    const [ uploading, setUploading ] = useState(false);
    const [ logs, setLogs ] = useState<string[]>([]);

    // Templates laden mit useSelect (perfekt für Dropdowns)
    const { options, query } = useSelect({
        resource: "import_templates",
        meta: {
            schema: "product",
            select: "*" // Alles auswählen für die Import-Logik
        },
        optionLabel: "name",
        optionValue: "id",
    });

    const isLoading = query?.isLoading;
    const isError = query?.isError;
    // Helper um auf die vollen Daten zuzugreifen
    const templatesData = (query?.data?.data as unknown as IImportTemplate[]) || [];

    const handleDownload = (format: 'xlsx' | 'csv') => {
        if (!selectedTemplateId || !templatesData) return;
        const template = templatesData.find((t: any) => t.id === selectedTemplateId);
        if (template) {
            import("@/utils/export-engine").then(mod => {
                mod.downloadTemplateFile(template.mapping_config, format, template.name);
            });
        }
    };

    const handleImport = async () => {
        if (!file || !selectedTemplateId) return;

        const template = templatesData.find((t: any) => t.id === selectedTemplateId);
        if (!template) return;

        setUploading(true);
        setLogs([]);

        try {
            const result = await processImport(file, template.mapping_config);
            setLogs([ `Fertig! ${result.success} importiert, ${result.errors} Fehler.`, ...result.logs ]);
        } catch (e: any) {
            setLogs([ "Kritischer Fehler beim Import: " + e.message ]);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
            <Typography.Title level={2}>Produkt Import</Typography.Title>

            <Card title="1. Template wählen">
                {isError && <Alert type="error" message="Fehler beim Laden der Templates" showIcon style={{ marginBottom: 16 }} />}

                <Select
                    style={{ width: '100%' }}
                    placeholder={isLoading ? "Lade Vorlagen..." : "Wähle ein Schema..."}
                    loading={isLoading}
                    disabled={isLoading}
                    options={options}
                    onChange={setSelectedTemplateId}
                    value={selectedTemplateId}
                />

                {selectedTemplateId && (
                    <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Typography.Text type="secondary">Leere Vorlage herunterladen:</Typography.Text>
                        <Button size="small" icon={<FileExcelOutlined />} onClick={() => handleDownload('xlsx')}>Excel (.xlsx)</Button>
                        <Button size="small" icon={<FileExcelOutlined />} onClick={() => handleDownload('csv')}>CSV (.csv)</Button>
                    </div>
                )}
            </Card>

            <Card title="2. Datei hochladen" style={{ marginTop: 24 }}>
                <Upload.Dragger
                    beforeUpload={(f) => { setFile(f); return false; }}
                    maxCount={1}
                    accept=".csv,.xlsx"
                    showUploadList={{ showRemoveIcon: true }}
                    onRemove={() => setFile(null)}
                >
                    <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                    <p className="ant-upload-text">{file ? file.name : "Klicken oder Datei ablegen"}</p>
                </Upload.Dragger>
            </Card>

            <Button
                type="primary"
                size="large"
                block
                style={{ marginTop: 24 }}
                disabled={!file || !selectedTemplateId || uploading}
                loading={uploading}
                onClick={handleImport}
                icon={<UploadOutlined />}
            >
                Import Starten
            </Button>

            {logs.length > 0 && (
                <div style={{ marginTop: 24 }}>
                    <Alert message="Import Protokoll" type="info" />
                    <List
                        size="small"
                        bordered
                        dataSource={logs}
                        renderItem={item => <List.Item>{item}</List.Item>}
                        style={{ maxHeight: 300, overflow: 'auto', background: '#fff' }}
                    />
                </div>
            )}
        </div>
    );
}