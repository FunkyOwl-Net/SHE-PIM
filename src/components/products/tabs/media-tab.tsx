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

    // --- KATEGORIE WECHSELN LOGIK ---
    const handleMoveMedia = async (itemIds: string[], sourceCat: string, targetCat: string) => {
        const tableMap: Record<string, string> = {
            'images': 'product_images',
            'content': 'content_images',
            'videos': 'product_videos',
            'downloads': 'product_downloads'
        };

        const sourceTable = tableMap[ sourceCat ];
        const targetTable = tableMap[ targetCat ];

        if (!sourceTable || !targetTable) return;

        try {
            let successCount = 0;

            for (const itemId of itemIds) {
                // 1. Hole den originalen Eintrag
                const { data: item, error: fetchError } = await supabaseBrowserClient
                    .schema('product')
                    .from(sourceTable)
                    .select('*')
                    .eq('id', itemId)
                    .single();

                if (fetchError || !item) {
                    console.warn(`Item ${itemId} not found`);
                    continue;
                }

                // 2. Bereite neuen Eintrag vor (ohne ID, lasse generieren)
                const { id, created_at, ...itemData } = item;

                // Clean specific fields
                if (targetTable !== 'product_images') {
                    delete (itemData as any).is_primary; // Nur product_images hat is_primary
                }

                // Insert into Target
                const { error: insertError } = await supabaseBrowserClient
                    .schema('product')
                    .from(targetTable)
                    .insert({
                        ...itemData,
                        product_id: productId // Sicherstellen
                    });

                if (insertError) {
                    console.error("Insert Error", insertError);
                    continue;
                }

                // 3. Lösche aus Source
                await supabaseBrowserClient
                    .schema('product')
                    .from(sourceTable)
                    .delete()
                    .eq('id', itemId);

                successCount++;
            }

            notification.success({ message: `${successCount} Elemente verschoben!` });
            onRefresh();

        } catch (error: any) {
            console.error(error);
            notification.error({ message: "Fehler beim Verschieben", description: error.message });
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
                    currentCategory="images"
                    onRefresh={onRefresh}
                    onSetPrimary={handleSetPrimary}
                    onMove={(ids: string[], target) => handleMoveMedia(ids, 'images', target)}
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
                    currentCategory="content"
                    onRefresh={onRefresh}
                    onMove={(ids: string[], target) => handleMoveMedia(ids, 'content', target)}
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
                    bucketFolder="videos" // Beachte helper Logic
                    type="video"
                    currentCategory="videos"
                    onRefresh={onRefresh}
                    onMove={(ids: string[], target) => handleMoveMedia(ids, 'videos', target)}
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
                    currentCategory="downloads"
                    onRefresh={onRefresh}
                    onMove={(ids: string[], target) => handleMoveMedia(ids, 'downloads', target)}
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