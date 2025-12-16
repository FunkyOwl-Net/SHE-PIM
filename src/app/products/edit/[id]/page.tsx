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
            select: "*, product_images(*), content_images(*), product_videos(*), product_downloads(*), specifications(*), features(*), tags(*), logistics(*)",
        },
        redirect: false,

        // --- SPEICHERN LOGIK (Bleibt wie vorher) ---
        onMutationSuccess: async () => {
            const currentValues = formProps.form?.getFieldsValue() as any;
            const { specs_items, features_items, tags_list, ...formValues } = currentValues;

            console.log("Speichere Sub-Daten:", {
                specs: specs_items,
                features: features_items,
                tags: tags_list
            });

            // --- NEU: LOGISTIK SPEICHERN ---
            // --- NEU: LOGISTIK SPEICHERN (1:N) ---
            // Wir nehmen das "logistics" Array aus dem Formular.
            // Falls es leer ist (sollte nicht passieren), oder undefined, nehmen wir leer array.
            const logisticsRaw = formValues.logistics || [];

            // Map über alle Einträge und sicherstellen, dass product_id gesetzt ist
            const logisticsData = logisticsRaw.map((item: any, index: number) => ({
                ...item,
                id: item.id || crypto.randomUUID(), // Fix for "id violates not-null constraint"
                product_id: id,
                // Sicherstellen, dass der erste immer Default ist, falls Logic das verlangt
                // Aber wir haben es im UI gesteuert. Sicherheitshalber:
                is_default: index === 0,
                // Fallback Name für Default
                variant_name: index === 0 ? (item.variant_name || 'Standard') : item.variant_name
            }));

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
                // 1. IDs löschen, die nicht mehr im Formular sind (Clean Sync)
                // Wir holen aktuelle IDs aus DB um sicher zu sein
                const { data: currentRows } = await supabaseBrowserClient
                    .schema("product")
                    .from("logistics")
                    .select("id")
                    .eq("product_id", id);

                const currentIds = currentRows?.map(r => r.id) || [];
                const incomingIds = logisticsData.map((l: any) => l.id).filter(Boolean);
                const idsToDelete = currentIds.filter(cid => !incomingIds.includes(cid));

                if (idsToDelete.length > 0) {
                    await supabaseBrowserClient
                        .schema("product")
                        .from("logistics")
                        .delete()
                        .in("id", idsToDelete);
                }

                const { error: logError } = await supabaseBrowserClient
                    .schema("product")
                    .from("logistics")
                    .upsert(logisticsData, { onConflict: 'id' }); // WICHTIG: Explizit auf ID prüfen, damit 1:N Duplicate Checks nicht auf product_id gehen.

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
            // Helper: Extrahiert das Array oder Objekt sicher
            const extract = (data: any, k: string) => {
                if (!data) return [];
                if (Array.isArray(data)) {
                    if (data.length === 0) return [];
                    // Falls mehrere Rows existieren (z.B. Duplikate), nimm die mit Inhalt
                    const found = data.find((item: any) => item[ k ] && item[ k ].length > 0);
                    return found ? found[ k ] : data[ 0 ][ k ] || [];
                }
                // Falls Supabase ein Objekt (1:1) zurückgibt
                return data[ k ] || [];
            };

            // Für Logistics: Wir wollen jetzt explizit ein ARRAY haben.
            // Falls Supabase noch das alte 1:1 Objekt liefert (eher unwahrscheinlich bei Relation), packen wir es in Array.
            // Falls es schon ein Array ist, nehmen wir es direkt.
            const extractLogistics = (data: any) => {
                if (!data) return [];
                if (Array.isArray(data)) return data;
                return [ data ]; // Fallback für Legacy-Daten
            };

            const specsVal = extract(product.specifications, 'specs');
            const featuresVal = extract(product.features, 'features_list');
            const tagsVal = extract(product.tags, 'tags_list');
            const logisticsVal = extractLogistics(product.logistics);

            console.log("Form SetFieldsValue Payload:", {
                specs: specsVal,
                features: featuresVal,
                tags: tagsVal,
                logistics: logisticsVal
            });

            formProps.form.setFieldsValue({
                ...product,
                specs_items: specsVal,
                features_items: featuresVal,
                tags_list: tagsVal,
                logistics: logisticsVal
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
            specifications, features, tags,

            // NEU: Logistik-Feld (Array) entfernen (gehören nicht in productData)
            logistics,

            // Alte Felder falls sie noch im values objekt rumgeistern (clean up)
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
                form={formProps.form}
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