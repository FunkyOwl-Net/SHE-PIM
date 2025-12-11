"use client";

import React, { useState } from "react";
import {
    Steps,
    Card,
    Button,
    Table,
    Input,
    Space,
    Upload,
    List,
    Typography,
    Select,
    message,
    Row,
    Col,
    Tag,
    Image as AntImage,
    Alert,
    Divider,
    theme,
    Progress
} from "antd";
import {
    SearchOutlined,
    InboxOutlined,
    FileOutlined,
    DeleteOutlined,
    SaveOutlined,
    CheckCircleOutlined
} from "@ant-design/icons";
import { useTable } from "@refinedev/antd";
import { IProductData } from "@/interfaces/productdata";
import { getPublicImageUrl } from "@/utils/product-images";
import { uploadAndLinkMedia, MediaCategory } from "@/utils/media-upload-helper";

const { Step } = Steps;
const { Dragger } = Upload;
const { Title, Text } = Typography;
const { Option } = Select;

// --- STEP 1: PRODUCT SELECTION ---
const StepProductSelection = ({
    selectedProducts,
    setSelectedProducts,
    onNext
}: {
    selectedProducts: IProductData[],
    setSelectedProducts: (products: IProductData[]) => void,
    onNext: () => void
}) => {
    const { tableProps, searchFormProps } = useTable<IProductData>({
        resource: "productData", // Using the Supabase table name
        meta: {
            select: "*, product_images(file_path, is_primary)",
        },
        sorters: {
            initial: [
                {
                    field: "item_no",
                    order: "asc",
                },
            ],
        },
        pagination: {
            pageSize: 10,
        },
    });

    const rowSelection = {
        selectedRowKeys: selectedProducts.map(p => p.id),
        onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
            setSelectedProducts(selectedRows);
        },
        preserveSelectedRowKeys: true,
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Title level={4}>1. Produkte auswählen</Title>
                <Space>
                    <Input
                        placeholder="Suche nach Artikelnummer..."
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                        onPressEnter={(e) => {
                            // Trigger Refine's search
                            searchFormProps.onFinish?.({ item_no: e.currentTarget.value });
                        }}
                    />
                </Space>
            </div>

            <Table
                {...tableProps}
                rowSelection={{
                    type: "checkbox",
                    ...rowSelection,
                }}
                rowKey="id"
                columns={[
                    {
                        title: "Bild",
                        dataIndex: "image",
                        render: (_, record) => {
                            const primary = record.product_images?.find((img: any) => img.is_primary) || record.product_images?.[ 0 ];
                            return (
                                <AntImage
                                    width={40}
                                    src={getPublicImageUrl(primary?.file_path)}
                                    fallback="https://placehold.co/40x40?text=..."
                                    style={{
                                        backgroundColor: "#f5f5f5", // Light Gray for contrast
                                        objectFit: "contain"
                                    }}
                                />
                            );
                        }
                    },
                    {
                        title: "Artikelnummer",
                        dataIndex: "item_no",
                        sorter: true,
                    },
                    {
                        title: "Name",
                        dataIndex: "name",
                        sorter: true,
                    },
                    {
                        title: "EAN",
                        dataIndex: "EAN",
                    }
                ]}
            />

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                    type="primary"
                    onClick={onNext}
                    disabled={selectedProducts.length === 0}
                >
                    Weiter ({selectedProducts.length} ausgewählt)
                </Button>
            </div>
        </div>
    );
};

// --- STEP 2: UPLOAD STAGE ---
const StepFileUpload = ({
    selectedProducts,
    files,
    setFiles,
    onNext,
    onBack
}: {
    selectedProducts: IProductData[],
    files: Record<string, any[]>,
    setFiles: any,
    onNext: () => void,
    onBack: () => void
}) => {

    // Mock upload handler - just stores in state
    const handleUpload = (productId: string, file: any) => {
        setFiles((prev: any) => {
            const currentFiles = prev[ productId ] || [];
            return {
                ...prev,
                [ productId ]: [ ...currentFiles, file ]
            };
        });
        return false; // Prevent auto upload
    };

    const removeFile = (productId: string, fileUid: string) => {
        setFiles((prev: any) => {
            const currentFiles = prev[ productId ] || [];
            return {
                ...prev,
                [ productId ]: currentFiles.filter((f: any) => f.uid !== fileUid)
            };
        });
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Title level={4}>2. Dateien hochladen</Title>
                <Text type="secondary">Ziehen Sie Ordner oder Dateien auf die entsprechenden Produkte.</Text>
            </div>

            <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={selectedProducts}
                renderItem={item => (
                    <List.Item>
                        <Card title={`${item.item_no} - ${item.name}`} size="small">
                            <Dragger
                                name="file"
                                multiple={true}
                                directory={true} // Allow folder upload
                                beforeUpload={(file) => handleUpload(item.id, file)}
                                fileList={files[ item.id ] || []}
                                onRemove={(file) => removeFile(item.id, file.uid)}
                                listType="picture"
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Dateien oder Ordner hierher ziehen</p>
                            </Dragger>
                        </Card>
                    </List.Item>
                )}
            />

            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Button onClick={onBack}>Zurück</Button>
                <Button type="primary" onClick={onNext}>
                    Weiter zum Mapping
                </Button>
            </div>
        </div>
    );
};

// --- HELPER: DETECT CATEGORY ---
const detectCategory = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if ([ 'jpg', 'jpeg', 'png', 'webp', 'gif' ].includes(ext || '')) return 'product_image';
    if ([ 'mp4', 'mov', 'avi', 'webm' ].includes(ext || '')) return 'product_video';
    if ([ 'pdf', 'doc', 'docx' ].includes(ext || '')) return 'manual'; // Default doc type
    return 'datasheet';
};

// --- HELPER: GET CATEGORY LABEL ---
const getCategoryLabel = (cat: string) => {
    switch (cat) {
        case 'product_image': return 'Produktbilder';
        case 'content': return 'Content / Lifestyle';
        case 'product_video': return 'Videos';
        case 'manual': return 'Bedienungsanleitungen';
        case 'datasheet': return 'Datenblätter';
        case 'declaration': return 'Konformitätserklärungen';
        default: return 'Sonstiges';
    }
};

interface FileMetadata {
    uid: string;
    productId: string;
    category: string;
    displayName: string;
    description: string;
    fileObj: any; // Original File object
}

// --- STEP 3: MAPPING & CONFIRMATION ---
const StepMapping = ({
    selectedProducts,
    files,
    onBack
}: {
    selectedProducts: IProductData[],
    files: Record<string, any[]>,
    onBack: () => void
}) => {
    const { token } = theme.useToken();
    // State: Map<FileUID, Metadata>
    const [ fileMetadata, setFileMetadata ] = useState<Record<string, FileMetadata>>({});
    const [ selectedFiles, setSelectedFiles ] = useState<Set<string>>(new Set());
    const [ saving, setSaving ] = useState(false);
    const [ progress, setProgress ] = useState(0);

    // Initialize Metadata on Mount
    React.useEffect(() => {
        const initialMetadata: Record<string, FileMetadata> = {};

        selectedProducts.forEach(product => {
            const productFiles = files[ product.id ] || [];
            productFiles.forEach(file => {
                // Determine initial category
                const detectedCat = detectCategory(file.name);
                // Clean filename for display name
                const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

                initialMetadata[ file.uid ] = {
                    uid: file.uid,
                    productId: product.id,
                    category: detectedCat,
                    displayName: cleanName,
                    description: "",
                    fileObj: file
                };
            });
        });

        setFileMetadata(prev => ({ ...initialMetadata, ...prev })); // Merge to keep existing edits if re-mounting
    }, []); // Run once on mount (or when files change? effectively once here)

    // HANDLE: Update Single Field
    const updateField = (uid: string, field: keyof FileMetadata, value: string) => {
        setFileMetadata(prev => ({
            ...prev,
            [ uid ]: { ...prev[ uid ], [ field ]: value }
        }));
    };

    // HANDLE: Toggle Selection
    const toggleSelection = (uid: string) => {
        const newSet = new Set(selectedFiles);
        if (newSet.has(uid)) newSet.delete(uid);
        else newSet.add(uid);
        setSelectedFiles(newSet);
    };

    // HANDLE: Bulk Category Change
    const handleBulkCategoryChange = (newCategory: string) => {
        if (selectedFiles.size === 0) return;

        setFileMetadata(prev => {
            const next = { ...prev };
            selectedFiles.forEach(uid => {
                if (next[ uid ]) {
                    next[ uid ] = { ...next[ uid ], category: newCategory };
                }
            });
            return next;
        });

        message.success(`${selectedFiles.size} Dateien verschoben.`);
        setSelectedFiles(new Set()); // Clear selection
    };

    // HANDLE: Save
    const handleSave = async () => {
        const filesToUpload = Object.values(fileMetadata);
        if (filesToUpload.length === 0) return;

        setSaving(true);
        setProgress(0);

        let successCount = 0;
        let failCount = 0;

        try {
            for (let i = 0; i < filesToUpload.length; i++) {
                const meta = filesToUpload[ i ];
                const res = await uploadAndLinkMedia(
                    meta.fileObj,
                    meta.productId,
                    meta.category as MediaCategory,
                    meta.displayName,
                    meta.description
                );

                if (res.success) {
                    successCount++;
                } else {
                    failCount++;
                    console.error(`Upload failed for ${meta.fileObj.name}:`, res.error);
                }

                // Update Progress
                setProgress(Math.round(((i + 1) / filesToUpload.length) * 100));
            }

            if (failCount === 0) {
                message.success(`${successCount} Dateien erfolgreich hochgeladen!`);
                // Optional: Navigate away or clear
            } else {
                message.warning(`${successCount} hochgeladen, ${failCount} fehlgeschlagen. Siehe Konsole für Details.`);
            }

        } catch (error) {
            console.error(error);
            message.error("Kritischer Fehler beim Upload-Prozess.");
        } finally {
            setSaving(false);
        }
    };

    // Derived Groups: Product -> Category -> Files
    const getGroupedFiles = (productId: string) => {
        const productFiles = Object.values(fileMetadata).filter(m => m.productId === productId);
        // Group by category
        const groups: Record<string, FileMetadata[]> = {};
        const categories = [ 'product_image', 'content', 'product_video', 'manual', 'datasheet', 'declaration', 'other' ];

        categories.forEach(cat => {
            const filesInCat = productFiles.filter(f => f.category === cat);
            if (filesInCat.length > 0) {
                groups[ cat ] = filesInCat;
            }
        });

        // Catch any leftovers (unlikely with our logic but safe)
        const knownCats = new Set(categories);
        const leftovers = productFiles.filter(f => !knownCats.has(f.category));
        if (leftovers.length > 0) groups[ 'other' ] = [ ...(groups[ 'other' ] || []), ...leftovers ];

        return groups;
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* TOOLBAR */}
            <Card size="small" style={{ position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Space>
                        <Text strong>{selectedFiles.size} ausgewählt</Text>
                        <Button size="small" onClick={() => setSelectedFiles(new Set())} disabled={selectedFiles.size === 0}>
                            Auswahl aufheben
                        </Button>
                    </Space>
                    <Space>
                        <Text>Auswahl verschieben zu:</Text>
                        <Select
                            style={{ width: 200 }}
                            placeholder="Kategorie..."
                            disabled={selectedFiles.size === 0}
                            onChange={handleBulkCategoryChange}
                        >
                            <Option value="product_image">Produktbild</Option>
                            <Option value="content">Content / Lifestyle</Option>
                            <Option value="product_video">Video</Option>
                            <Option value="manual">Bedienungsanleitung</Option>
                            <Option value="datasheet">Datenblatt</Option>
                            <Option value="declaration">Konformitätserklärung</Option>
                        </Select>
                    </Space>
                </div>
            </Card>

            {selectedProducts.map(product => {
                const groupedFiles = getGroupedFiles(product.id);
                if (Object.keys(groupedFiles).length === 0) return null;

                return (
                    <Card key={product.id} title={`${product.item_no} - ${product.name}`} style={{ marginBottom: 16 }}>

                        {Object.entries(groupedFiles).map(([ category, files ]) => (
                            <div key={category} style={{ marginBottom: 24 }}>
                                <Divider orientation="left" style={{ margin: "12px 0" }}>
                                    <Tag color="blue">{getCategoryLabel(category)}</Tag>
                                </Divider>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                                    {files.map(meta => {
                                        const isSelected = selectedFiles.has(meta.uid);
                                        const isImage = meta.category === 'product_image' || meta.category === 'content';

                                        return (
                                            <div
                                                key={meta.uid}
                                                style={{
                                                    border: isSelected ? `2px solid ${token.colorPrimary}` : `1px solid ${token.colorBorderSecondary}`,
                                                    borderRadius: 8,
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                    transition: 'all 0.2s',
                                                    backgroundColor: token.colorBgContainer
                                                }}
                                            >
                                                {/* Selection Checkbox Overlay */}
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        left: 8,
                                                        zIndex: 2,
                                                    }}
                                                    onClick={(e) => { e.stopPropagation(); toggleSelection(meta.uid); }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => { }} // Handle click on div
                                                        style={{ transform: 'scale(1.5)', cursor: 'pointer', accentColor: token.colorPrimary }}
                                                    />
                                                </div>

                                                {/* Preview Area */}
                                                <div
                                                    style={{
                                                        height: 120,
                                                        backgroundColor: token.colorFillTertiary, // Mapped Step for Contrast
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => toggleSelection(meta.uid)}
                                                >
                                                    {isImage ? (
                                                        <img
                                                            src={URL.createObjectURL(meta.fileObj)}
                                                            alt={meta.displayName}
                                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                        />
                                                    ) : (
                                                        <FileOutlined style={{ fontSize: 40, color: token.colorTextDescription }} />
                                                    )}
                                                </div>

                                                {/* Metadata Inputs */}
                                                <div style={{ padding: 8, background: token.colorBgContainer }}>
                                                    <Space direction="vertical" style={{ width: '100%' }} size={4}>
                                                        <Input
                                                            size="small"
                                                            placeholder="Anzeigename"
                                                            value={meta.displayName}
                                                            onChange={(e) => updateField(meta.uid, 'displayName', e.target.value)}
                                                        />
                                                        <Input
                                                            size="small"
                                                            placeholder="Beschreibung (optional)"
                                                            value={meta.description}
                                                            onChange={(e) => updateField(meta.uid, 'description', e.target.value)}
                                                        />
                                                        <div style={{ fontSize: 10, color: token.colorTextDescription, textAlign: 'right' }}>
                                                            {(meta.fileObj.size / 1024 / 1024).toFixed(2)} MB
                                                        </div>
                                                    </Space>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                    </Card>
                );
            })}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {saving && <Progress percent={progress} status="active" />}

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Button onClick={onBack} disabled={saving}>Zurück</Button>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                        loading={saving}
                    >
                        Speichern & Uploaden
                    </Button>
                </div>
            </div>
        </div>
    );
};


export default function MediaUploadPage() {
    const [ currentStep, setCurrentStep ] = useState(0);
    const [ selectedProducts, setSelectedProducts ] = useState<IProductData[]>([]);
    const [ files, setFiles ] = useState<Record<string, any[]>>({}); // Map: ProductID -> File[]

    const next = () => setCurrentStep(currentStep + 1);
    const prev = () => setCurrentStep(currentStep - 1);

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
            <Title level={2} style={{ marginBottom: 32 }}>Media Bulk Upload</Title>

            <Card>
                <Steps current={currentStep} style={{ marginBottom: 40 }}>
                    <Step title="Auswahl" description="Produkte wählen" />
                    <Step title="Upload" description="Dateien hochladen" />
                    <Step title="Mapping" description="Zuordnen & Speichern" />
                </Steps>

                <div style={{ minHeight: 400 }}>
                    {currentStep === 0 && (
                        <StepProductSelection
                            selectedProducts={selectedProducts}
                            setSelectedProducts={setSelectedProducts}
                            onNext={next}
                        />
                    )}
                    {currentStep === 1 && (
                        <StepFileUpload
                            selectedProducts={selectedProducts}
                            files={files}
                            setFiles={setFiles}
                            onNext={next}
                            onBack={prev}
                        />
                    )}
                    {currentStep === 2 && (
                        <StepMapping
                            selectedProducts={selectedProducts}
                            files={files}
                            onBack={prev}
                        />
                    )}
                </div>
            </Card>
        </div>
    );
}
