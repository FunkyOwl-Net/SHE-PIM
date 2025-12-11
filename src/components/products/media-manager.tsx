"use client";

import React, { useState } from "react";
import { Upload, Card, Input, Empty, Tooltip, App, List, Button, Image, Typography, Divider, theme, Popover, Menu, Checkbox, Space, Collapse } from "antd";
import {
    InboxOutlined, DeleteOutlined,
    FilePdfOutlined, VideoCameraOutlined, FileUnknownOutlined, FileImageOutlined,
    UserOutlined, ClockCircleOutlined, StarOutlined, StarFilled, DownloadOutlined, EditOutlined,
    SwapOutlined, CaretDownOutlined, CaretUpOutlined, CheckSquareOutlined, CloseOutlined, MoreOutlined
} from "@ant-design/icons";
import { IMediaItem } from "@/interfaces/productdata";
import { useProductUpload } from "@/hooks/useProductUpload";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { useSecureImage } from "@/hooks/useSecureImage";
import { useGetIdentity } from "@refinedev/core";

const { Text } = Typography;

// --- VORSCHAU KOMPONENTE ---
const MediaPreview = ({ item, type }: { item: IMediaItem, type: 'image' | 'video' | 'file' }) => {
    const { imageUrl, fullUrl, loading } = useSecureImage(item.file_path);
    const { token } = theme.useToken();

    // NOTE: Removed checkerboard pattern as per user request. 
    // Image container background is transparent, relying on the parent Card's background (Sand/Gray) 
    // to distinguish transparent images from white-background images.

    if (loading) {
        return (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: "transparent", borderBottom: `1px solid ${token.colorBorder}` }}>
                <div className="ant-image-placeholder">
                    <div style={{ width: 20, height: 20, border: `2px solid ${token.colorPrimary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (type === 'image') {
        const src = imageUrl || fullUrl;

        return (
            <div style={{ height: 160, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: "transparent", borderBottom: `1px solid ${token.colorBorder}` }}>
                {src ? (
                    <Image
                        src={src}
                        alt={item.file_name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        fallback="https://via.placeholder.com/150?text=Fehler"
                        preview={{
                            mask: 'Vorschau',
                            src: fullUrl || src
                        }}
                    />
                ) : (
                    <FileImageOutlined style={{ fontSize: 48, color: token.colorTextDisabled }} />
                )}
            </div>
        );
    }

    const Icon = type === 'video' ? VideoCameraOutlined : (item.file_name.endsWith('.pdf') ? FilePdfOutlined : FileUnknownOutlined);

    return (
        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: "transparent", borderBottom: `1px solid ${token.colorBorder}`, fontSize: 48, color: token.colorTextDescription }}>
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
    currentCategory: 'images' | 'content' | 'videos' | 'downloads';
    onRefresh: () => void;
    onSetPrimary?: (id: string) => void;
    onMove?: (ids: string[], targetCategory: string) => void;
}

export const MediaManager: React.FC<MediaManagerProps> = ({
    items = [], productId, tableName, bucketFolder, type, currentCategory, onRefresh, onSetPrimary, onMove
}) => {
    const { uploadImage, isUploading } = useProductUpload();
    const { notification, modal } = App.useApp();
    const { data: user } = useGetIdentity();
    const { token } = theme.useToken();

    // Selection & UI State
    const [ selectedIds, setSelectedIds ] = useState<Set<string>>(new Set());
    const [ expandedIds, setExpandedIds ] = useState<Set<string>>(new Set());

    // --- SELECTION HELPERS ---
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedIds(newSet);
    };

    const clearSelection = () => setSelectedIds(new Set());
    const selectAll = () => setSelectedIds(new Set(items.map(i => i.id)));

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

    // --- OTHER ACTIONS ---
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

    const handleDelete = async (ids: string[]) => {
        modal.confirm({
            title: `Wirklich ${ids.length} Dateien löschen?`,
            okText: "Löschen",
            okType: "danger",
            onOk: async () => {
                try {
                    await supabaseBrowserClient.schema('product').from(tableName).delete().in('id', ids);
                    notification.success({ message: "Gelöscht" });
                    clearSelection();
                    onRefresh();
                } catch (e) {
                    notification.error({ message: "Fehler beim Löschen" });
                }
            }
        });
    };

    // --- MENUS ---
    const availableCategories = [
        { key: 'images', label: 'Produktbilder' },
        { key: 'content', label: 'Content Bilder' },
        { key: 'videos', label: 'Videos' },
        { key: 'downloads', label: 'Downloads' }
    ].filter(c => c.key !== currentCategory);

    const getMoveMenu = (targetIds: string[]) => (
        <Menu
            onClick={({ key }) => {
                onMove?.(targetIds, key);
                clearSelection();
            }}
            items={availableCategories.map(cat => ({
                key: cat.key,
                label: cat.label,
                icon: <SwapOutlined />
            }))}
        />
    );

    return (
        <div style={{ paddingTop: 20, position: 'relative' }}>

            {/* BULK TOOLBAR (Sticky Top) */}
            {selectedIds.size > 0 && (
                <div style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    marginBottom: 16,
                    padding: '8px 16px',
                    background: token.colorBgContainer,
                    border: `1px solid ${token.colorPrimary}`,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <Space>
                        <span style={{ fontWeight: 600, color: token.colorPrimary }}>{selectedIds.size} Ausgewählt</span>
                        <Divider type="vertical" />
                        <Button size="small" type="text" onClick={selectAll}>Alle</Button>
                        <Button size="small" type="text" onClick={clearSelection}>Keine</Button>
                    </Space>
                    <Space>
                        {onMove && (
                            <Popover content={getMoveMenu(Array.from(selectedIds))} title="Verschieben nach" trigger="click">
                                <Button icon={<SwapOutlined />}>Verschieben</Button>
                            </Popover>
                        )}
                        <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(Array.from(selectedIds))}>Löschen</Button>
                    </Space>
                </div>
            )}

            {/* Upload Area */}
            <Upload.Dragger
                customRequest={handleUpload}
                showUploadList={false}
                multiple
                disabled={isUploading}
                style={{ marginBottom: 24, background: token.colorBgContainer, border: `2px dashed ${token.colorBorder}`, borderRadius: 8 }}
            >
                <div style={{ padding: 20 }}>
                    <p className="ant-upload-drag-icon" style={{ marginBottom: 8 }}><InboxOutlined style={{ fontSize: 32, color: token.colorPrimary }} /></p>
                    <p className="ant-upload-text" style={{ fontSize: 16, margin: 0, color: token.colorText }}>Dateien hier ablegen</p>
                </div>
            </Upload.Dragger>

            {/* GRID */}
            {items.length > 0 ? (
                <List
                    grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }}
                    dataSource={items}
                    renderItem={(item) => {
                        const isSelected = selectedIds.has(item.id);
                        const isExpanded = expandedIds.has(item.id);

                        return (
                            <List.Item>
                                <Card
                                    hoverable
                                    size="small"
                                    style={{
                                        border: isSelected ? `2px solid ${token.colorPrimary}` : (item.is_primary ? `2px solid ${token.colorWarning}` : `1px solid ${token.colorBorder}`),
                                        borderRadius: 8,
                                        overflow: "hidden",
                                        background: token.colorBgLayout, // Changed to Sand to contrast with white images
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                                        transition: 'all 0.2s'
                                    }}
                                    styles={{ body: { padding: 0 } }}
                                >
                                    {/* HEADER: IMAGE + CHECKBOX */}
                                    <div style={{ position: 'relative' }}>
                                        <MediaPreview item={item} type={type} />

                                        <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={() => toggleSelection(item.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>

                                        {item.is_primary && (
                                            <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
                                                <StarFilled style={{ color: token.colorWarning, fontSize: 18, filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }} />
                                            </div>
                                        )}
                                    </div>

                                    {/* MINI TOOLBAR */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '4px 8px',
                                        borderTop: `1px solid ${token.colorBorder}`,
                                        background: token.colorBgLayout
                                    }}>
                                        <Space size={4}>
                                            {/* Primary Toggle */}
                                            {onSetPrimary && (
                                                <Tooltip title="Hauptbild">
                                                    <Button
                                                        size="small"
                                                        type="text"
                                                        icon={item.is_primary ? <StarFilled style={{ color: token.colorWarning }} /> : <StarOutlined />}
                                                        onClick={() => onSetPrimary(item.id)}
                                                    />
                                                </Tooltip>
                                            )}

                                            {/* Move */}
                                            {onMove && (
                                                <Popover content={getMoveMenu([ item.id ])} title="Verschieben" trigger="click">
                                                    <Tooltip title="Verschieben">
                                                        <Button size="small" type="text" icon={<SwapOutlined />} />
                                                    </Tooltip>
                                                </Popover>
                                            )}
                                        </Space>

                                        <Space size={4}>
                                            <Tooltip title="Löschen">
                                                <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete([ item.id ])} />
                                            </Tooltip>
                                            <Tooltip title="Details bearbeiten">
                                                <Button
                                                    size="small"
                                                    type={isExpanded ? "primary" : "text"}
                                                    icon={isExpanded ? <CaretUpOutlined /> : <EditOutlined />}
                                                    onClick={() => toggleExpand(item.id)}
                                                />
                                            </Tooltip>
                                        </Space>
                                    </div>

                                    {/* COLLAPSIBLE DETAILS */}
                                    {isExpanded && (
                                        <div style={{ padding: 12, borderTop: `1px solid ${token.colorBorder}`, background: token.colorBgContainer }}>
                                            <div style={{ marginBottom: 8 }}>
                                                <Text type="secondary" style={{ fontSize: 10, textTransform: "uppercase" }}>Titel</Text>
                                                <Input
                                                    size="small"
                                                    defaultValue={item.display_name || item.file_name}
                                                    onBlur={(e) => handleUpdateField(item.id, 'display_name', e.target.value, item.display_name)}
                                                />
                                            </div>
                                            <div style={{ marginBottom: 8 }}>
                                                <Text type="secondary" style={{ fontSize: 10, textTransform: "uppercase" }}>Beschreibung</Text>
                                                <Input.TextArea
                                                    size="small"
                                                    defaultValue={item.description || ""}
                                                    onBlur={(e) => handleUpdateField(item.id, 'description', e.target.value, item.description)}
                                                    autoSize={{ minRows: 2, maxRows: 4 }}
                                                />
                                            </div>
                                            <div style={{ fontSize: 10, color: token.colorTextDescription }}>
                                                Upload von: {item.created_by_name?.split('@')[ 0 ] || 'System'} <br />
                                                am: {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </List.Item>
                        )
                    }}
                />
            ) : (
                <Empty description="Keine Dateien" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
        </div>
    );
};