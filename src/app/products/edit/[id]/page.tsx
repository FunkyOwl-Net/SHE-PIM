"use client";

import React, { useState, useEffect } from "react";
import { Edit, useForm } from "@refinedev/antd";
import { useParsed, useInvalidate } from "@refinedev/core";
import { Form, Tabs, App, Spin } from "antd";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { IProductDetails } from "@/interfaces/productdata";

// Deine Komponenten
import { GeneralTab } from "@/components/products/tabs/general-tab";
import { MediaTab } from "@/components/products/tabs/media-tab";
import { SpecsSection } from "@components/products/sections/specs-section";
import { TagsSection } from "@/components/products/sections/tags-section";
import { LogisticsTab } from "@/components/products/tabs/logistics-tab";

export default function ProductEditPage() {
    const { id } = useParsed();
    const invalidate = useInvalidate();
    const { message } = App.useApp();
    const [ isLocked, setIsLocked ] = useState(true);

    const { formProps, saveButtonProps, query } = useForm<IProductDetails>({
        resource: "productData",
        id: id,
        meta: {
            schema: "product",
            // Wir laden ALLES inklusive der Relationen
            select: "*, product_images(*), content_images(*), product_videos(*), product_downloads(*), specifications(*), features(*), tags(*)",
        },
        redirect: false,

        // --- SPEICHERN LOGIK (Bleibt wie vorher) ---
        onMutationSuccess: async () => {
            const currentValues = formProps.form?.getFieldsValue() as any;
            const { specs_items, features_items, tags_list, ...formValues } = currentValues;

            // --- NEU: LOGISTIK SPEICHERN ---
            // Wir extrahieren die Logistik-Felder manuell aus dem großen 'formValues' Topf
            const logisticsData = {
                product_id: id,
                net_length_mm: formValues.net_length_mm,
                net_width_mm: formValues.net_width_mm,
                net_height_mm: formValues.net_height_mm,
                net_weight_kg: formValues.net_weight_kg,
                gross_length_mm: formValues.gross_length_mm,
                gross_width_mm: formValues.gross_width_mm,
                gross_height_mm: formValues.gross_height_mm,
                gross_weight_kg: formValues.gross_weight_kg,
                has_master_carton: formValues.has_master_carton,
                master_length_mm: formValues.master_length_mm,
                master_width_mm: formValues.master_width_mm,
                master_height_mm: formValues.master_height_mm,
                master_weight_kg: formValues.master_weight_kg,
                master_quantity: formValues.master_quantity,
                items_per_pallet: formValues.items_per_pallet,
                pallet_height_mm: formValues.pallet_height_mm,
            };

            try {
                // 1. Specs speichern
                const { error: specError } = await supabaseBrowserClient
                    .schema("product")
                    .from("specifications")
                    .upsert(
                        { product_id: id, specs: specs_items || [] },
                        { onConflict: 'product_id' }
                    );

                if (specError) throw specError;

                // 2. Features speichern
                const { error: featError } = await supabaseBrowserClient
                    .schema("product")
                    .from("features")
                    .upsert(
                        { product_id: id, features_list: features_items || [] },
                        { onConflict: 'product_id' }
                    );

                if (featError) throw featError;

                message.success("Alle Daten gespeichert");
                invalidate({ resource: "productData", id: id, invalidates: [ "detail" ] });

                // NEU: Tags speichern
                const { error: tagError } = await supabaseBrowserClient
                    .schema("product")
                    .from("tags")
                    .upsert(
                        { product_id: id, tags_list: tags_list || [] },
                        { onConflict: 'product_id' }
                    );

                if (tagError) throw tagError;

                // NEU: Logistics speichern
                const { error: logError } = await supabaseBrowserClient
                    .schema("product")
                    .from("logistics")
                    .upsert(logisticsData, { onConflict: 'product_id' });

                if (logError) throw logError;

            } catch (e: any) {
                console.error(e);
                message.warning("Hauptdaten ok, aber Details fehlgeschlagen: " + e.message);
            }
        }
    });

    // Lade-Status für die UX
    const product = query?.data?.data;
    const isLoading = query?.isLoading;

    // --- DATEN IN DAS FORMULAR LADEN ---
    // --- DATEN IN DAS FORMULAR LADEN ---
    useEffect(() => {
        if (product && formProps.form) {
            // Helper
            const extract = (arr: any, k: string) => Array.isArray(arr) && arr.length > 0 ? arr[ 0 ][ k ] : [];
            const extractObj = (arr: any) => Array.isArray(arr) && arr.length > 0 ? arr[ 0 ] : {};

            // Logistik-Objekt aus dem Array holen
            const dbLogistics = extractObj(product.logistics);

            console.log("Lade Daten:", { dbLogistics });

            formProps.form.setFieldsValue({
                ...product,
                specs_items: extract(product.specifications, 'specs'),
                features_items: extract(product.features, 'features_list'),
                tags_list: extract(product.tags, 'tags_list'),

                // WICHTIG: Logistik flach hineinkopieren
                ...dbLogistics
            });
        }
    }, [ product, formProps.form ]);

    // --- FILTER VOR DEM SENDEN ---
    const handleOnFinish = (values: any) => {
        const {
            // Virtuelle Felder entfernen
            specs_items, features_items, tags_list,

            // Relationen entfernen
            product_images, content_images, product_videos, product_downloads,
            specifications, features, tags, logistics,

            // NEU: Logistik-Felder entfernen (gehören nicht in productData)
            net_length_mm, net_width_mm, net_height_mm, net_weight_kg,
            gross_length_mm, gross_width_mm, gross_height_mm, gross_weight_kg,
            has_master_carton, master_length_mm, master_width_mm, master_height_mm, master_weight_kg, master_quantity,
            items_per_pallet, pallet_height_mm,

            // Der Rest geht an die Haupttabelle
            ...mainTableData
        } = values;

        return formProps.onFinish?.(mainTableData);
    };

    const items = [
        {
            key: "general",
            label: "Allgemeine Daten",
            children: (
                <div style={{ padding: "20px 0" }}>
                    {/* 1. Die allgemeinen Formularfelder (GeneralTab) */}
                    <GeneralTab
                        isLocked={isLocked}
                        onToggleLock={() => setIsLocked(!isLocked)}
                    />

                    {/* 2. HIER fügen wir die SpecsSection direkt darunter ein */}
                    <SpecsSection />
                    <Form.Item name="tags_list" noStyle>
                        <TagsSection />
                    </Form.Item>
                </div>
            ),
        },
        {
            key: "logistics",
            label: "Logistik & Maße",
            children: <LogisticsTab />,
        },
        {
            key: "images",
            label: "Bilder & Medien",
            children: (
                <MediaTab
                    product={product} // <--- ÄNDERUNG: Ganzes Objekt übergeben
                    productId={id as string}
                    onRefresh={() => invalidate({ resource: "productData", id, invalidates: [ "detail" ] })}
                />
            ),
        },
    ];

    return (
        <Edit saveButtonProps={saveButtonProps} isLoading={isLoading}>
            <Form
                {...formProps}
                layout="vertical"
                // Wir brauchen hier keine komplexen initialValues mehr, 
                // da der useEffect das übernimmt. Nur Defaults setzen:
                initialValues={{
                    active: true,
                    eol: false
                }}
                onFinish={handleOnFinish}
            >
                <Tabs defaultActiveKey="general" items={items} />
            </Form>
        </Edit>
    );
}