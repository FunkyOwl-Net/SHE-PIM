"use client";

import React, { useState } from "react";
import { Upload, Card, Input, Empty, Tooltip, App, List, Button, Image, Typography, Divider } from "antd";
import {
    InboxOutlined, DeleteOutlined,
    FilePdfOutlined, VideoCameraOutlined, FileUnknownOutlined,
    UserOutlined, ClockCircleOutlined, StarOutlined, StarFilled, DownloadOutlined, EditOutlined
} from "@ant-design/icons";
import { IMediaItem } from "@/interfaces/productdata";
import { useProductUpload } from "@/hooks/useProductUpload";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { useSecureImage } from "@/hooks/useSecureImage";
import { useGetIdentity } from "@refinedev/core";

const { Text } = Typography;

// --- VORSCHAU KOMPONENTE ---
const MediaPreview = ({ item, type }: { item: IMediaItem, type: 'image' | 'video' | 'file' }) => {
    const { imageUrl, loading } = useSecureImage(item.file_path);

    if (type === 'image') {
        return (
            <div style={{ height: 160, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', borderBottom: '1px solid #e8e8e8' }}>
                <Image
                    src={imageUrl || "error"}
                    alt={item.file_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    fallback="https://via.placeholder.com/150?text=Fehler"
                    preview={{ mask: 'Vorschau' }}
                />
            </div>
        );
    }

    const Icon = type === 'video' ? VideoCameraOutlined : (item.file_name.endsWith('.pdf') ? FilePdfOutlined : FileUnknownOutlined);

    return (
        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', borderBottom: '1px solid #e8e8e8', fontSize: 48, color: '#bfbfbf' }}>
            <Icon />
        </div>
    );
};

interface MediaManagerProps {
    items?: IMediaItem[];
    productId: string;
    tableName: string;
    bucketFolder: string;
    type: 'image' | 'video' | 'file';
    onRefresh: () => void;
    onSetPrimary?: (id: string) => void;
}

export const MediaManager: React.FC<MediaManagerProps> = ({
    items = [], productId, tableName, bucketFolder, type, onRefresh, onSetPrimary
}) => {
    const { uploadImage, isUploading } = useProductUpload();
    const { notification } = App.useApp();
    const { data: user } = useGetIdentity();

    // --- UPLOAD ---
    const handleUpload = async (options: any) => {
        const { onSuccess, onError, file } = options;
        const result = await uploadImage(file, productId);

        if (result) {
            try {
                const { error } = await supabaseBrowserClient
                    .schema('product')
                    .from(tableName)
                    .insert({
                        product_id: productId,
                        file_path: result.path,
                        file_name: result.name,
                        display_name: file.name,
                        created_by_name: user?.name || user?.email || "System"
                    });

                if (error) throw error;
                onSuccess("Ok");
                notification.success({ message: "Upload erfolgreich" });
                onRefresh();
            } catch (e: any) {
                onError(e);
                notification.error({ message: "DB Fehler", description: e.message });
            }
        }
    };

    // --- UPDATE ---
    const handleUpdateField = async (id: string, field: 'display_name' | 'description', value: string, oldValue?: string) => {
        if (value === oldValue) return;
        try {
            await supabaseBrowserClient
                .schema('product')
                .from(tableName)
                .update({ [ field ]: value })
                .eq('id', id);

            notification.success({ message: "Gespeichert" });
        } catch (e) {
            notification.error({ message: "Fehler beim Speichern" });
        }
    };

    // --- LÖSCHEN ---
    const handleDelete = async (id: string) => {
        try {
            await supabaseBrowserClient.schema('product').from(tableName).delete().eq('id', id);
            notification.success({ message: "Gelöscht" });
            onRefresh();
        } catch (e) {
            notification.error({ message: "Fehler beim Löschen" });
        }
    };

    return (
        <div style={{ paddingTop: 20 }}>
            {/* Upload Area */}
            <Upload.Dragger
                customRequest={handleUpload}
                showUploadList={false}
                multiple
                disabled={isUploading}
                style={{ marginBottom: 24, background: '#fafafa', border: '2px dashed #d9d9d9', borderRadius: 8 }}
            >
                <p className="ant-upload-drag-icon"><InboxOutlined style={{ fontSize: 32, color: '#1890ff' }} /></p>
                <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500 }}>
                    Klicken oder Datei hier ablegen
                </p>
                <p className="ant-upload-hint" style={{ color: '#888' }}>
                    Upload in: <b>{bucketFolder}</b>
                </p>
            </Upload.Dragger>

            {/* Liste der Dateien */}
            {items.length > 0 ? (
                <List
                    grid={{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 5 }}
                    dataSource={items}
                    renderItem={(item) => (
                        <List.Item>
                            <Card
                                hoverable
                                size="small"
                                style={{
                                    border: item.is_primary ? "2px solid #faad14" : "1px solid #f0f0f0",
                                    borderRadius: 8,
                                    overflow: "hidden"
                                }}
                                styles={{ body: { padding: "12px" } }}
                                cover={<MediaPreview item={item} type={type} />}
                                actions={[
                                    // Action Bar unten
                                    onSetPrimary && (
                                        <Tooltip title={item.is_primary ? "Ist Hauptbild" : "Als Hauptbild setzen"}>
                                            <Button
                                                type="text"
                                                block
                                                icon={item.is_primary ? <StarFilled style={{ color: "#faad14", fontSize: 18 }} /> : <StarOutlined style={{ fontSize: 18 }} />}
                                                onClick={() => onSetPrimary(item.id)}
                                            />
                                        </Tooltip>
                                    ),
                                    <Tooltip title="Löschen">
                                        <Button
                                            type="text"
                                            danger
                                            block
                                            icon={<DeleteOutlined style={{ fontSize: 18 }} />}
                                            onClick={() => handleDelete(item.id)}
                                        />
                                    </Tooltip>
                                ].filter(Boolean)}
                            >
                                {/* 1. DATEINAME / TITEL */}
                                <div style={{ marginBottom: 12 }}>
                                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Titel / Name</Text>
                                    <Input
                                        defaultValue={item.display_name || item.file_name}
                                        onBlur={(e) => handleUpdateField(item.id, 'display_name', e.target.value, item.display_name)}
                                        placeholder="Bildtitel eingeben..."
                                        style={{ marginTop: 4, fontWeight: 600 }}
                                    />
                                </div>

                                {/* 2. BESCHREIBUNG */}
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Beschreibung</Text>
                                        <EditOutlined style={{ fontSize: 10, color: '#ccc' }} />
                                    </div>
                                    <Input.TextArea
                                        defaultValue={item.description || ""}
                                        onBlur={(e) => handleUpdateField(item.id, 'description', e.target.value, item.description)}
                                        autoSize={{ minRows: 2, maxRows: 4 }}
                                        placeholder="Optionale Beschreibung..."
                                        style={{ marginTop: 4, fontSize: 13, backgroundColor: '#fafafa' }}
                                    />
                                </div>

                                {/* 3. META FOOTER */}
                                <div style={{
                                    fontSize: 11,
                                    color: '#999',
                                    paddingTop: 8,
                                    borderTop: '1px solid #f0f0f0',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <UserOutlined /> {item.created_by_name?.split('@')[ 0 ] || 'System'}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <ClockCircleOutlined /> {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                                    </span>
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
            ) : (
                <Empty
                    description={<span style={{ color: '#999' }}>Keine Dateien in diesem Bereich</span>}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ margin: '40px 0' }}
                />
            )}
        </div>
    );
};