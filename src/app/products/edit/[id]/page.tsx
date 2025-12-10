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
            const { specs_items, features_items, tags_list } = currentValues;


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
    useEffect(() => {
        if (product && formProps.form) {

            // Helper Funktion: Findet die Daten, egal ob Supabase ein Array oder Objekt liefert
            const extractData = (relation: any, key: string) => {
                if (!relation) return [];
                // Fall A: Es ist ein Array (Standard bei 1:n) -> Nimm das erste Element
                if (Array.isArray(relation)) {
                    return relation.length > 0 ? relation[ 0 ][ key ] : [];
                }
                // Fall B: Es ist ein Objekt (Standard bei 1:1) -> Greif direkt zu
                return relation[ key ] || [];
            };

            const dbSpecs = extractData(product.specifications, 'specs');
            const dbFeatures = extractData(product.features, 'features_list');
            const dbTags = extractData(product.tags, 'tags_list'); // Auch Tags extrahieren

            console.log("Daten werden ins Formular geladen:", { dbSpecs, dbFeatures, dbTags });

            // Daten ins Formular injizieren
            formProps.form.setFieldsValue({
                ...product,
                specs_items: dbSpecs,
                features_items: dbFeatures,
                tags_list: dbTags, // NEU: Tags laden
            });
        }
    }, [ product, formProps.form ]);


    // --- FILTER VOR DEM SENDEN ---
    const handleOnFinish = (values: any) => {
        const {
            specs_items,
            features_items,
            product_images,
            specifications,
            features,
            tags_list,
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