"use client";

import React from "react";
import { useShow, useGo } from "@refinedev/core";
import {
    Typography,
    Button,
    theme,
    Carousel,
    Image,
    Tag,
    Divider,
    Skeleton
} from "antd";
import {
    EditOutlined,
    ArrowLeftOutlined,
    BarcodeOutlined,
    CalendarOutlined,
    CodeOutlined,
    InboxOutlined,
    RocketOutlined,
    AppstoreOutlined,
    ColumnWidthOutlined,
    ExpandAltOutlined,
    CompressOutlined,
    FileTextOutlined,
    GlobalOutlined,
    ArrowRightOutlined
} from "@ant-design/icons";

import { IProductDetails } from "@/interfaces/productdata";
import { getPublicImageUrl } from "@/utils/product-images";
import { ProductDetailTabs } from "@/components/products/detail-tabs";

// Optimized Components
import { StatWidget } from "@/components/products/stat-widget";
import { OverviewTab } from "@/components/products/show/overview-tab";
import { LogisticsDisplayTab } from "@/components/products/show/logistics-tab";
import { SalesTab } from "@/components/products/show/sales-tab";
import { MarketingTab } from "@/components/products/show/marketing-tab";

const { Title } = Typography;

export default function ProductShowPage() {
    const { token } = theme.useToken();
    const go = useGo();
    const carouselRef = React.useRef(null);
    // State for Tabs
    const [ activeTab, setActiveTab ] = React.useState('overview');

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
    const logistics = product.logistics; // Pass array directly, component handles it

    const tabItems = [
        {
            key: 'overview',
            label: <span><FileTextOutlined /> Übersicht</span>,
            children: <OverviewTab product={product} features={features} tags={tags} specs={specs} allImages={allImages} />
        },
        {
            key: 'logistics',
            label: <span><InboxOutlined /> Logistik</span>,
            children: <LogisticsDisplayTab logistics={logistics} />
        },
        {
            key: 'sales',
            label: <span><RocketOutlined /> Vertrieb</span>,
            children: <SalesTab />
        },
        {
            key: 'marketing',
            label: <span><GlobalOutlined /> Marketing</span>,
            children: <MarketingTab />
        },
    ];


    return (
        <div style={{ padding: "8px 24px 12px 24px", maxWidth: 1600, margin: "0 auto" }}>

            {/* --- TOP NAVIGATION BAR --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: "0 8px" }}>
                <Button
                    type="text"
                    size="small"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => go({ to: { resource: "productData", action: "list" } })}
                >
                    Zurück zur Liste
                </Button>

                <Button
                    type="primary"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => go({ to: { resource: "productData", action: "edit", id: product?.id } })}
                >
                    Bearbeiten
                </Button>
            </div>

            {/* --- SEPARATED HEADER WITH TABS --- */}
            <div style={{
                background: `linear-gradient(135deg, ${token.colorBgContainer}, ${token.colorPrimary}15)`,
                borderRadius: token.borderRadiusLG,
                border: `1px solid ${token.colorBorderSecondary}`,
                marginBottom: 24,
                padding: 40, // Consistent padding
                display: "grid",
                gridTemplateColumns: "1fr 450px", // grid-template-columns
                gridTemplateRows: "1fr auto", // Top: Identity, Bottom: Tabs
                gap: "24px 48px", // row-gap col-gap
                alignItems: "start", // Default alignment
                position: "relative"
            }}>

                {/* 1. LEFT TOP: PRODUCT IDENTITY (Spans Col 1, Row 1) */}
                <div style={{ gridColumn: "1", gridRow: "1", display: "flex", gap: 32, alignItems: "start" }}>
                    <div style={{ flexShrink: 0 }}>
                        {primaryImage ? (
                            <Image
                                width={140}
                                height={140}
                                style={{ objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}
                                src={getPublicImageUrl(primaryImage?.file_path)}
                                fallback="https://placehold.co/180x180?text=No+Image"
                            />
                        ) : (
                            <div style={{
                                width: 140, height: 140,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: `radial-gradient(circle, ${token.colorBgContainer} 0%, ${token.colorBgLayout} 100%)`,
                                borderRadius: '50%',
                                border: `2px solid ${token.colorBorderSecondary}` // FIXED: 44px -> 2px
                            }}>
                                <RocketOutlined style={{ fontSize: 60, color: token.colorPrimary, opacity: 0.8 }} />
                            </div>
                        )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div>
                            <Tag color={product.active ? "success" : "error"} style={{ fontSize: 12, padding: "2px 8px" }}>
                                {product.active ? "AKTIV" : "INAKTIV"}
                            </Tag>
                            {product.eol && <Tag color="warning">EOL</Tag>}
                        </div>

                        <Title level={1} style={{ margin: 0, fontSize: 28, lineHeight: 1.2 }}>{product.name}</Title>

                        <div style={{ color: token.colorTextSecondary, fontSize: 15 }}>
                            <span style={{ fontWeight: 600, color: token.colorText }}>{product.brand}</span>
                            <span style={{ borderLeft: `1px solid ${token.colorBorderSecondary}`, margin: "0 8px", height: "1em", display: "inline-block", verticalAlign: "middle" }} />
                            <span>{product.primaryCat}</span>
                            {product.secondCat && <> <span style={{ borderLeft: `1px solid ${token.colorBorderSecondary}`, margin: "0 8px", height: "1em", display: "inline-block", verticalAlign: "middle" }} /> {product.secondCat}</>}
                        </div>
                    </div>
                </div>

                {/* 2. LEFT BOTTOM: TABS NAVIGATION (Spans Col 1, Row 2) */}
                <div style={{
                    gridColumn: "1",
                    gridRow: "2",
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    alignSelf: "end" // Align to bottom of grid
                }}>
                    {tabItems.map(item => {
                        const isActive = activeTab === item.key;
                        return (
                            <div
                                key={item.key}
                                onClick={() => setActiveTab(item.key)}
                                style={{
                                    padding: "8px 16px",
                                    cursor: "pointer",
                                    borderRadius: token.borderRadiusLG,

                                    // Style: Active gets Button look
                                    background: isActive ? token.colorBgContainer : "transparent",
                                    border: isActive ? `1px solid ${token.colorBorderSecondary}` : "none",
                                    boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.05)" : "none",

                                    color: isActive ? token.colorPrimary : token.colorTextSecondary,
                                    fontWeight: isActive ? 600 : 500,
                                    transition: "all 0.2s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    opacity: isActive ? 1 : 0.7,
                                }}
                            >
                                {item.label}
                            </div>
                        );
                    })}
                </div>

                {/* 3. RIGHT COLUMN: INFO CAROUSEL (Spans Col 2, Row 1-2) */}
                <div style={{
                    gridColumn: "2",
                    gridRow: "1 / span 2",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end", // Push content to bottom
                    height: "100%",
                    minHeight: 0
                }}>

                    {/* Carousel Content */}
                    <div style={{ position: 'relative', width: "100%" }}>
                        <Carousel
                            ref={carouselRef}
                            dotPlacement="bottom"
                            dots={true}
                            style={{ paddingBottom: 40 }}
                        >
                            {/* Slide 1 */}
                            <div style={{ padding: "4px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <StatWidget title="Artikelnummer" value={product.item_no} icon={<CodeOutlined />} color="#8e44ad" />
                                    <StatWidget title="EAN / GTIN" value={product.EAN || "-"} icon={<BarcodeOutlined />} color={token.colorInfo} />
                                    <StatWidget title="Netto Gewicht" value={`${logistics?.[ 0 ]?.net_weight_kg || 0} kg`} icon={<InboxOutlined />} color={token.colorWarning} />
                                    <StatWidget title="Erstellt" value={product.created_at ? new Date(product.created_at).toLocaleDateString() : "-"} icon={<CalendarOutlined />} color={token.colorSuccess} />
                                </div>
                            </div>
                            {/* Slide 2 */}
                            <div style={{ padding: "4px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <StatWidget title="Länge (Netto)" value={`${logistics?.[ 0 ]?.net_length_mm || 0} mm`} icon={<ColumnWidthOutlined />} color={token.colorTextSecondary} />
                                    <StatWidget title="Breite (Netto)" value={`${logistics?.[ 0 ]?.net_width_mm || 0} mm`} icon={<ExpandAltOutlined />} color={token.colorTextSecondary} />
                                    <StatWidget title="Höhe (Netto)" value={`${logistics?.[ 0 ]?.net_height_mm || 0} mm`} icon={<CompressOutlined />} color={token.colorTextSecondary} />
                                    <StatWidget title="Master Karton" value={logistics?.[ 0 ]?.has_master_carton ? `${logistics[ 0 ].master_quantity} Stk.` : "Nein"} icon={<AppstoreOutlined />} color={logistics?.[ 0 ]?.has_master_carton ? token.colorPrimary : token.colorTextDisabled} />
                                </div>
                            </div>
                        </Carousel>

                        {/* Custom Arrows at Bottom */}
                        <div style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            pointerEvents: "none"
                        }}>
                            <Button
                                type="text"
                                size="small"
                                icon={<ArrowLeftOutlined style={{ fontSize: 14 }} />}
                                onClick={() => (carouselRef.current as any)?.prev()}
                                style={{ pointerEvents: "auto", color: token.colorPrimary }}
                            />
                            <Button
                                type="text"
                                size="small"
                                icon={<ArrowRightOutlined style={{ fontSize: 14 }} />}
                                onClick={() => (carouselRef.current as any)?.next()}
                                style={{ pointerEvents: "auto", color: token.colorPrimary }}
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* --- CONTENT AREA (Direct on Page Background) --- */}
            <div>
                {tabItems.find(t => t.key === activeTab)?.children}
            </div>

        </div >
    );
}
