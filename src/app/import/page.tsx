"use client";

import React, { useState } from "react";
import { Select, Upload, Button, Card, Progress, Typography, Alert, List } from "antd";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import { useList } from "@refinedev/core";
import { processImport } from "@/utils/import-engine";

export default function ImportPage() {
    const [ selectedTemplateId, setSelectedTemplateId ] = useState<string | null>(null);
    const [ file, setFile ] = useState<File | null>(null);
    const [ uploading, setUploading ] = useState(false);
    const [ logs, setLogs ] = useState<string[]>([]);

    // Templates laden
    const { data: templates } = useList({
        resource: "import_templates",
        meta: { schema: "product" }
    });

    const handleImport = async () => {
        if (!file || !selectedTemplateId) return;

        const template = templates?.data.find(t => t.id === selectedTemplateId);
        if (!template) return;

        setUploading(true);
        setLogs([]);

        try {
            const result = await processImport(file, template.mapping_config);
            setLogs([ `Fertig! ${result.success} importiert, ${result.errors} Fehler.`, ...result.logs ]);
        } catch (e) {
            setLogs([ "Kritischer Fehler beim Import" ]);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
            <Typography.Title level={2}>Produkt Import</Typography.Title>

            <Card title="1. Template wählen">
                <Select
                    style={{ width: '100%' }}
                    placeholder="Wähle ein Schema..."
                    options={templates?.data.map(t => ({ label: t.name, value: t.id }))}
                    onChange={setSelectedTemplateId}
                />
            </Card>

            <Card title="2. Datei hochladen" style={{ marginTop: 24 }}>
                <Upload.Dragger
                    beforeUpload={(f) => { setFile(f); return false; }}
                    maxCount={1}
                    accept=".csv,.xlsx"
                >
                    <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                    <p className="ant-upload-text">Klicken oder Datei ablegen</p>
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