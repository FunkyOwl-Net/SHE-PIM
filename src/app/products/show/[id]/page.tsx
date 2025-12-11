"use client";

import React from "react";
import { useShow, useGo } from "@refinedev/core";
import {
    Typography,
    Card,
    Row,
    Col,
    Space,
    Tag,
    Button,
    theme,
    Carousel,
    Image,
    Descriptions,
    Divider,
    List,
    Skeleton,
    Statistic
} from "antd";
import {
    EditOutlined,
    ArrowLeftOutlined,
    BarcodeOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    CodeOutlined,
    FileTextOutlined,
    InboxOutlined,
    SafetyCertificateOutlined,
    TagsOutlined,
    RocketOutlined,
    AppstoreOutlined,
    InfoCircleOutlined,
    PictureOutlined,
    ColumnWidthOutlined,
    ExpandAltOutlined,
    CompressOutlined,
    GlobalOutlined
} from "@ant-design/icons";

import { IProductDetails } from "@/interfaces/productdata";
import { getPublicImageUrl } from "@/utils/product-images";
import { ProductDetailTabs } from "@/components/products/detail-tabs";

const { Title, Text, Paragraph } = Typography;

// --- MINI INFO WIDGET COMPONENT ---
const StatWidget = ({ title, value, icon, color }: any) => {
    const { token } = theme.useToken();
    return (
        <Card bodyStyle={{ padding: 12 }} style={{ height: "100%", border: `1px solid ${token.colorBorderSecondary}` }} variant="borderless">
            <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between" }}>
                <div>
                    <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 600 }}>{title}</Text>
                    <div style={{ fontSize: 16, fontWeight: "bold", marginTop: 4, color: token.colorTextHeading }}>{value}</div>
                </div>
                <div style={{
                    color: color,
                    background: color ? `${color}15` : token.colorFillSecondary,
                    borderRadius: "50%",
                    width: 32, height: 32,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16
                }}>
                    {icon}
                </div>
            </div>
        </Card>
    );
};

export default function ProductShowPage() {
    const { token } = theme.useToken();
    const go = useGo();

    // 1. Data Fetching
    const { query } = useShow<IProductDetails>({
        resource: "productData",
        meta: {
            schema: "product",
            select: "*, product_images(*), content_images(*), product_videos(*), product_downloads(*), specifications(*), features(*), tags(*), logistics(*)",
        },
    });

    const { data, isLoading } = query;
    const product = data?.data;

    if (isLoading) {
        return <div style={{ padding: 40 }}><Skeleton active paragraph={{ rows: 10 }} /></div>;
    }

    if (!product) {
        return <div style={{ padding: 40 }}>Product not found</div>;
    }

    // --- DATA PREPARATION ---
    const primaryImage = product.product_images?.find((img: any) => img.is_primary) || product.product_images?.[ 0 ];
    const otherImages = product.product_images?.filter((img: any) => img.id !== primaryImage?.id) || [];
    const allImages = primaryImage ? [ primaryImage, ...otherImages ] : [];

    const specs = product.specifications?.[ 0 ]?.specs || [];
    const features = product.features?.[ 0 ]?.features_list || [];
    const tags = product.tags?.[ 0 ]?.tags_list || [];
    const logistics = Array.isArray(product.logistics) ? product.logistics[ 0 ] : product.logistics;

    const SectionTitle = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ color: token.colorPrimary, fontSize: 18 }}>{icon}</span>
            <Title level={4} style={{ margin: 0, fontSize: 18 }}>{title}</Title>
        </div>
    );

    // --- TAB CONTENTS ---

    // Tab 1: Übersicht (Restored to First Proposal Structure + Side Info)
    const overviewContent = (
        <Row gutter={[ 24, 24 ]}>
            {/* LEFT COLUMN: Main Content */}
            <Col xs={24} lg={16}>
                <Space direction="vertical" size={24} style={{ width: "100%" }}>

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

                    {/* Features (Now full width in this column) */}
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

                    {/* Specifications Table (Restored to Left Column) */}
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

                    {/* Media Gallery (Restored) */}
                    <Card variant="borderless">
                        <SectionTitle icon={<PictureOutlined />} title="Produktbilder" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
                            {allImages.length > 0 ? allImages.map((img: any) => (
                                <div
                                    key={img.id}
                                    style={{
                                        border: `1px solid ${token.colorBorderSecondary}`,
                                        borderRadius: token.borderRadiusLG,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        background: token.colorBgContainer
                                    }}
                                >
                                    <div style={{ height: 150, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: token.colorFillSecondary }}>
                                        <Image
                                            src={getPublicImageUrl(img.file_path)}
                                            style={{ maxHeight: 130, maxWidth: '100%', objectFit: 'contain' }}
                                            preview={{ mask: "Zoom" }}
                                        />
                                    </div>
                                    <div style={{ padding: 8, borderTop: `1px solid ${token.colorBorderSecondary}` }}>
                                        {img.is_primary ? <Tag color="blue" style={{ margin: 0 }}>Hauptbild</Tag> : <Text type="secondary" style={{ fontSize: 11 }}>Galerie</Text>}
                                    </div>
                                </div>
                            )) : <Text type="secondary">Keine Bilder vorhanden.</Text>}
                        </div>
                    </Card>

                </Space>
            </Col>

            {/* RIGHT COLUMN: Sidebar Info (RESTORED) */}
            <Col xs={24} lg={8}>
                <Space direction="vertical" size={24} style={{ width: "100%" }}>

                    {/* Tags (Moved from Left) */}
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

                    {/* Quick Helper for Specs count if needed, or other minimal info */}
                    <Card variant="borderless" bodyStyle={{ padding: 24 }}>
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
                </Space>
            </Col>
        </Row>
    );

    // Tab 2: Logistik
    const logisticsContent = (
        <Card variant="borderless">
            <SectionTitle icon={<InboxOutlined />} title="Logistik & Verpackung" />
            {logistics ? (
                <Row gutter={[ 24, 24 ]}>
                    <Col xs={24} md={8}>
                        <Card title="Netto (Produkt)" size="small" type="inner">
                            <Statistic title="Länge" value={logistics.net_length_mm} suffix="mm" />
                            <Statistic title="Breite" value={logistics.net_width_mm} suffix="mm" />
                            <Statistic title="Höhe" value={logistics.net_height_mm} suffix="mm" />
                            <Divider style={{ margin: "12px 0" }} />
                            <Statistic title="Gewicht" value={logistics.net_weight_kg} suffix="kg" valueStyle={{ color: token.colorPrimary }} />
                        </Card>
                    </Col>
                    {logistics.has_master_carton && (
                        <Col xs={24} md={8}>
                            <Card title={`Master Karton (${logistics.master_quantity} Stk.)`} size="small" type="inner">
                                <Statistic title="Länge" value={logistics.master_length_mm} suffix="mm" />
                                <Statistic title="Breite" value={logistics.master_width_mm} suffix="mm" />
                                <Statistic title="Höhe" value={logistics.master_height_mm} suffix="mm" />
                                <Divider style={{ margin: "12px 0" }} />
                                <Statistic title="Gewicht" value={logistics.master_weight_kg} suffix="kg" />
                            </Card>
                        </Col>
                    )}
                    <Col xs={24} md={8}>
                        <Card title="Paletten Daten" size="small" type="inner">
                            <Statistic title="Stück pro Palette" value={logistics.items_per_pallet} prefix={<AppstoreOutlined />} />
                            <Statistic title="Palettenhöhe" value={logistics.pallet_height_mm} suffix="mm" style={{ marginTop: 16 }} />
                        </Card>
                    </Col>
                </Row>
            ) : (
                <Text type="secondary" italic>Keine Logistikdaten vorhanden.</Text>
            )}
        </Card>
    );

    // Tab 3: Vertrieb (Placeholder)
    const salesContent = (
        <Card variant="borderless" style={{ textAlign: 'center', padding: 40 }}>
            <RocketOutlined style={{ fontSize: 48, color: token.colorTextTertiary, marginBottom: 16 }} />
            <Title level={4}>Vertriebsdaten</Title>
            <Text type="secondary">Preise, Verfügbarkeit und Vertriebskanäle werden hier bald verfügbar sein.</Text>
        </Card>
    );

    // Tab 4: Marketing (Placeholder)
    const marketingContent = (
        <Card variant="borderless" style={{ textAlign: 'center', padding: 40 }}>
            <GlobalOutlined style={{ fontSize: 48, color: token.colorTextTertiary, marginBottom: 16 }} />
            <Title level={4}>Marketing Assets</Title>
            <Text type="secondary">Kampagnen, SEO-Texte und Social Media Assets werden hier bald verfügbar sein.</Text>
        </Card>
    );

    const tabItems = [
        { key: 'overview', label: <span><FileTextOutlined /> Übersicht</span>, children: overviewContent },
        { key: 'logistics', label: <span><InboxOutlined /> Logistik</span>, children: logisticsContent },
        { key: 'sales', label: <span><RocketOutlined /> Vertrieb</span>, children: salesContent },
        { key: 'marketing', label: <span><GlobalOutlined /> Marketing</span>, children: marketingContent },
    ];

    return (
        <div style={{ padding: "24px", maxWidth: 1600, margin: "0 auto" }}>

            {/* --- TOP NAVIGATION BAR --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => go({ to: "/products" })}
                    style={{ color: token.colorTextSecondary }}
                >
                    Zurück zur Übersicht
                </Button>

                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => go({ to: `/products/edit/${product.id}` })}
                    style={{
                        boxShadow: `0 4px 14px ${token.colorPrimary}40`,
                    }}
                >
                    Bearbeiten
                </Button>
            </div>

            {/* --- HERO HEADER --- */}
            <div style={{
                background: `linear-gradient(135deg, ${token.colorBgContainer}, ${token.colorBgLayout})`,
                borderRadius: token.borderRadiusLG,
                border: `1px solid ${token.colorBorderSecondary}`,
                padding: 32,
                display: "grid",
                gridTemplateColumns: "1fr 1fr", // Two columns: Identity | Slider Info
                gap: 40,
                alignItems: "stretch"
            }}>

                {/* LEFT: PRODUCT IDENTITY */}
                <div style={{ display: "flex", gap: 32, alignItems: "start" }}>
                    <div style={{ flexShrink: 0 }}>
                        {primaryImage ? (
                            <Image
                                width={180}
                                height={180}
                                style={{ objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}
                                src={getPublicImageUrl(primaryImage?.file_path)}
                                fallback="https://placehold.co/180x180?text=No+Image"
                            />
                        ) : (
                            <div style={{
                                width: 180, height: 180,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: `radial-gradient(circle, ${token.colorBgContainer} 0%, ${token.colorBgLayout} 100%)`,
                                borderRadius: '50%',
                                border: `4px solid ${token.colorBorderSecondary}`
                            }}>
                                <RocketOutlined style={{ fontSize: 80, color: token.colorPrimary, opacity: 0.8 }} />
                            </div>
                        )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div>
                            <Tag color={product.active ? "success" : "error"} style={{ fontSize: 12, padding: "2px 8px" }}>
                                {product.active ? "AKTIV" : "INAKTIV"}
                            </Tag>
                            {product.eol && <Tag color="warning">EOL</Tag>}
                        </div>

                        <Title level={1} style={{ margin: 0, fontSize: 32, lineHeight: 1.2 }}>{product.name}</Title>

                        <div style={{ color: token.colorTextSecondary, fontSize: 16 }}>
                            <span style={{ fontWeight: 600, color: token.colorText }}>{product.brand}</span>
                            <Divider type="vertical" />
                            <span>{product.primaryCat}</span>
                            {product.secondCat && <> <Divider type="vertical" /> {product.secondCat}</>}
                        </div>
                    </div>
                </div>

                {/* RIGHT: INFO SLIDER (Carousel) */}
                <div style={{ minHeight: 180, overflow: "hidden" }}>
                    <Carousel dotPosition="bottom" style={{ height: "100%", paddingBottom: 25 }}>

                        {/* Slide 1: Identification & Basic Stats */}
                        <div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: 170 }}>
                                <StatWidget
                                    title="Artikelnummer"
                                    value={product.item_no}
                                    icon={<CodeOutlined />}
                                    color="#8e44ad"
                                />
                                <StatWidget
                                    title="EAN / GTIN"
                                    value={product.EAN || "-"}
                                    icon={<BarcodeOutlined />}
                                    color={token.colorInfo}
                                />
                                <StatWidget
                                    title="Netto Gewicht"
                                    value={`${logistics?.net_weight_kg || 0} kg`}
                                    icon={<InboxOutlined />}
                                    color={token.colorWarning}
                                />
                                <StatWidget
                                    title="Erstellt"
                                    value={product.created_at ? new Date(product.created_at).toLocaleDateString() : "-"}
                                    icon={<CalendarOutlined />}
                                    color={token.colorSuccess}
                                />
                            </div>
                        </div>

                        {/* Slide 2: Logistics Dimensions (if available) */}
                        <div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: 170 }}>
                                <StatWidget
                                    title="Länge (Netto)"
                                    value={`${logistics?.net_length_mm || 0} mm`}
                                    icon={<ColumnWidthOutlined />}
                                    color={token.colorTextSecondary}
                                />
                                <StatWidget
                                    title="Breite (Netto)"
                                    value={`${logistics?.net_width_mm || 0} mm`}
                                    icon={<ExpandAltOutlined />}
                                    color={token.colorTextSecondary}
                                />
                                <StatWidget
                                    title="Höhe (Netto)"
                                    value={`${logistics?.net_height_mm || 0} mm`}
                                    icon={<CompressOutlined />}
                                    color={token.colorTextSecondary}
                                />
                                <StatWidget
                                    title="Master Karton"
                                    value={logistics?.has_master_carton ? `${logistics.master_quantity} Stk.` : "Nein"}
                                    icon={<AppstoreOutlined />}
                                    color={logistics?.has_master_carton ? token.colorPrimary : token.colorTextDisabled}
                                />
                            </div>
                        </div>

                    </Carousel>
                </div>
            </div>

            {/* --- TABS --- */}
            <ProductDetailTabs items={tabItems} defaultActiveKey="overview" />

        </div>
    );
}
