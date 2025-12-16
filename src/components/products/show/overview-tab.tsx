import React from 'react';
import {
    Card,
    Row,
    Col,
    Space,
    Typography,
    List,
    Tag,
    Descriptions,
    Image,
    Divider,
    Statistic,
    theme
} from 'antd';
import {
    FileTextOutlined,
    CheckCircleOutlined,
    SafetyCertificateOutlined,
    PictureOutlined,
    TagsOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons';
import { getPublicImageUrl } from "@/utils/product-images";

const { Title, Text } = Typography;

// Helper Title Component
const SectionTitle = ({ icon, title }: { icon: React.ReactNode, title: string }) => {
    const { token } = theme.useToken();
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ color: token.colorPrimary, fontSize: 18 }}>{icon}</span>
            <Title level={4} style={{ margin: 0, fontSize: 18 }}>{title}</Title>
        </div>
    );
};

interface OverviewTabProps {
    product: any;
    features: string[];
    tags: string[];
    specs: any[];
    allImages: any[];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ product, features, tags, specs, allImages }) => {
    const { token } = theme.useToken();

    return (
        <Row gutter={[ 24, 24 ]}>
            {/* LEFT COLUMN: Main Content */}
            <Col xs={24} lg={16}>
                <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>

                    {/* Description */}
                    <Card variant="borderless">
                        <SectionTitle icon={<FileTextOutlined />} title="Beschreibung" />
                        <div style={{ fontSize: 16, lineHeight: 1.6, color: token.colorText }}>
                            {product.description ? (
                                <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, "<br/>") }} />
                            ) : (
                                <Text type="secondary" italic>Keine Beschreibung hinterlegt.</Text>
                            )}
                        </div>
                    </Card>

                    {/* Features */}
                    <Card variant="borderless">
                        <SectionTitle icon={<CheckCircleOutlined />} title="Product Features" />
                        {features.length > 0 ? (
                            <List
                                dataSource={features}
                                renderItem={(item: string) => (
                                    <List.Item style={{ padding: "8px 0", border: "none" }}>
                                        <Space align="start">
                                            <CheckCircleOutlined style={{ color: token.colorSuccess, marginTop: 4 }} />
                                            <Text>{item}</Text>
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Text type="secondary" italic>Keine Features.</Text>
                        )}
                    </Card>

                    {/* Specifications Table */}
                    <Card variant="borderless">
                        <SectionTitle icon={<SafetyCertificateOutlined />} title="Technische Daten" />
                        {specs.length > 0 ? (
                            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }}>
                                {specs.map((spec: any, idx: number) => (
                                    <Descriptions.Item label={spec.key} key={idx}>
                                        {spec.value} {spec.unit && <Text type="secondary" style={{ fontSize: 12 }}>{spec.unit}</Text>}
                                    </Descriptions.Item>
                                ))}
                            </Descriptions>
                        ) : (
                            <Text type="secondary" italic>Keine Spezifikationen.</Text>
                        )}
                    </Card>

                    {/* Media Gallery */}
                    <Card variant="borderless" styles={{ body: { padding: 24 } }}>
                        <SectionTitle icon={<PictureOutlined />} title="Produktbilder" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
                            {allImages.length > 0 ? allImages.map((img: any) => (
                                <div
                                    key={img.id}
                                    style={{
                                        border: `1px solid ${token.colorBorder}`,
                                        borderRadius: token.borderRadiusLG,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        background: token.colorBgLayout, // Changes to Sand/Gray (Distinction)
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    <div style={{ height: 160, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: "transparent" }}>
                                        <Image
                                            src={getPublicImageUrl(img.file_path)}
                                            style={{ maxHeight: 140, maxWidth: '100%', objectFit: 'contain' }}
                                            preview={{ mask: "Zoom" }}
                                        />
                                    </div>
                                    <div style={{ padding: "8px 12px", borderTop: `1px solid ${token.colorBorder}`, background: token.colorBgLayout }}>
                                        {img.is_primary ? (
                                            <Tag color={token.colorPrimary} style={{ margin: 0, fontWeight: 600, border: "none" }}>Hauptbild</Tag>
                                        ) : (
                                            <Text type="secondary" style={{ fontSize: 12 }}>Galerie</Text>
                                        )}
                                    </div>
                                </div>
                            )) : <Text type="secondary">Keine Bilder vorhanden.</Text>}
                        </div>
                    </Card>

                </div>
            </Col>

            {/* RIGHT COLUMN: Sidebar Info */}
            <Col xs={24} lg={8}>
                <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>

                    {/* Tags */}
                    <Card variant="borderless">
                        <SectionTitle icon={<TagsOutlined />} title="Tags" />
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {tags.length > 0 ? tags.map((tag: string) => (
                                <Tag key={tag} color="blue" style={{ fontSize: 14, padding: "4px 10px" }}>#{tag}</Tag>
                            )) : <Text type="secondary" italic>Keine Tags.</Text>}
                        </div>
                    </Card>

                    <Card variant="borderless">
                        <SectionTitle icon={<InfoCircleOutlined />} title="Basis Informationen" />
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Artikelnummer">{product.item_no}</Descriptions.Item>
                            <Descriptions.Item label="EAN / GTIN">{product.EAN || "-"}</Descriptions.Item>
                            <Descriptions.Item label="Marke">{product.brand}</Descriptions.Item>
                            <Descriptions.Item label="Primär-Kategorie">{product.primaryCat}</Descriptions.Item>
                            <Descriptions.Item label="Sekundär-Kategorie">{product.secondCat || "-"}</Descriptions.Item>
                            <Descriptions.Item label="Erstellt am">{product.created_at ? new Date(product.created_at).toLocaleDateString() : "-"}</Descriptions.Item>
                            <Descriptions.Item label="Bearbeitet am">{product.updated_at ? new Date(product.updated_at).toLocaleDateString() : "-"}</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Quick Stats */}
                    <Card variant="borderless" styles={{ body: { padding: 24 } }}>
                        <Statistic
                            title="Anzahl Spezifikationen"
                            value={specs.length}
                            prefix={<SafetyCertificateOutlined />}
                        />
                        <Divider style={{ margin: "16px 0" }} />
                        <Statistic
                            title="Anzahl Features"
                            value={features.length}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </div>
            </Col>
        </Row>
    );
};
