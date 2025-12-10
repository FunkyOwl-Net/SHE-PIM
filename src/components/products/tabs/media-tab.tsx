"use client";

import React from "react";
import { Tabs, App } from "antd";
import { PictureOutlined, VideoCameraOutlined, FileTextOutlined, FileImageOutlined } from "@ant-design/icons";
import { IProductDetails } from "@/interfaces/productdata";
import { MediaManager } from "../media-manager";
import { supabaseBrowserClient } from "@/utils/supabase/client";

interface MediaTabProps {
    product: IProductDetails | undefined;
    productId: string;
    onRefresh: () => void;
}

export const MediaTab: React.FC<MediaTabProps> = ({ product, productId, onRefresh }) => {
    const { notification } = App.useApp();

    // Logik für Hauptbild (nur für product_images Tabelle)
    const handleSetPrimary = async (imageId: string) => {
        try {
            // 1. Alle Bilder dieses Produkts auf "nicht primary" setzen
            await supabaseBrowserClient
                .schema('product')
                .from("product_images")
                .update({ is_primary: false })
                .eq("product_id", productId);

            // 2. Das gewählte Bild auf "primary" setzen
            const { error } = await supabaseBrowserClient
                .schema('product')
                .from("product_images")
                .update({ is_primary: true })
                .eq("id", imageId);

            if (error) throw error;

            notification.success({ message: "Hauptbild aktualisiert" });
            onRefresh();
        } catch (error: any) {
            notification.error({ message: "Fehler beim Setzen des Hauptbildes", description: error.message });
        }
    };

    const subTabs = [
        {
            key: 'images',
            label: (<span><PictureOutlined /> Produktbilder</span>),
            children: (
                <MediaManager
                    items={product?.product_images}
                    productId={productId}
                    tableName="product_images"
                    bucketFolder="product_images"
                    type="image"
                    onRefresh={onRefresh}
                    // HIER übergeben wir die Stern-Funktion
                    onSetPrimary={handleSetPrimary}
                />
            )
        },
        {
            key: 'content',
            label: (<span><FileImageOutlined /> Content Bilder</span>),
            children: (
                <MediaManager
                    items={product?.content_images}
                    productId={productId}
                    tableName="content_images"
                    bucketFolder="content_images"
                    type="image"
                    onRefresh={onRefresh}
                // Kein onSetPrimary, da Content Bilder kein Hauptbild haben
                />
            )
        },
        {
            key: 'videos',
            label: (<span><VideoCameraOutlined /> Videos</span>),
            children: (
                <MediaManager
                    items={product?.product_videos}
                    productId={productId}
                    tableName="product_videos"
                    bucketFolder="videos"
                    type="video"
                    onRefresh={onRefresh}
                />
            )
        },
        {
            key: 'downloads',
            label: (<span><FileTextOutlined /> BDA & Downloads</span>),
            children: (
                <MediaManager
                    items={product?.product_downloads}
                    productId={productId}
                    tableName="product_downloads"
                    bucketFolder="downloads"
                    type="file"
                    onRefresh={onRefresh}
                />
            )
        }
    ];

    return (
        <Tabs
            defaultActiveKey="images"
            items={subTabs}
            type="card"
            style={{ marginTop: 10 }}
        />
    );
};