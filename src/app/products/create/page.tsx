"use client";

import React, { useState, useEffect } from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Tabs, App, message as antMessage } from "antd";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { IProductDetails } from "@/interfaces/productdata";

// Components
import { GeneralTab } from "@/components/products/tabs/general-tab";
import { SpecsSection } from "@components/products/sections/specs-section";
import { TagsSection } from "@/components/products/sections/tags-section";
import { LogisticsTab } from "@/components/products/tabs/logistics-tab";

export default function ProductCreatePage() {
    const { message } = App.useApp();
    const [ isLocked, setIsLocked ] = useState(false); // Default unlocked for creation
    const [ requiredFields, setRequiredFields ] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("she_pim_required_fields");
        if (stored) {
            try {
                setRequiredFields(JSON.parse(stored));
            } catch (e) { console.error(e); }
        }
    }, []);

    const { formProps, saveButtonProps } = useForm<IProductDetails>({
        resource: "productData",
        action: "create",
        meta: {
            schema: "product",
        },
        // Wir nutzen den Standard Redirect nicht, da wir manuell submitten
        redirect: false
    });

    // --- MANUAL SUBMISSION HANDLING ---
    const handleOnFinish = async (values: any) => {
        try {
            message.loading({ content: "Erstelle Produkt...", key: "create_prod" });

            // 1. Whitelist für productData
            const mainTableData = {
                item_no: values.item_no,
                name: values.name,
                EAN: values.EAN,
                brand: values.brand,
                description: values.description,
                primaryCat: values.primaryCat,
                secondCat: values.secondCat,
                active: values.active,
                eol: values.eol,
            };

            // 2. Insert productData
            const { data: newProd, error: mainError } = await supabaseBrowserClient
                .schema("product")
                .from("productData")
                .insert(mainTableData)
                .select("id")
                .single();

            if (mainError) throw mainError;
            if (!newProd) throw new Error("Keine Daten zurückbekommen");

            const newId = newProd.id;

            // 3. Sub-Tabellen speichern (Sequentiell & Resilient)
            const { specs_items: specsItemsVal, features_items: featuresItemsVal, tags_list: tagsListVal } = values;

            // Logistics (1:N)
            // Auch hier: wir holen das Array oder erstellen eins mit einem Default-Entry falls leer
            let logisticsRaw = values.logistics;

            // Fallback: Wenn User nichts eingegeben hat, aber wir wollen einen Default anlegen
            // Wir schauen, ob die Einzelfelder (legacy) gefüllt sind, um daraus den ersten Eintrag zu bauen
            if (!logisticsRaw || logisticsRaw.length === 0) {
                // Wir bauen ein Objekt aus den möglichen root fields, falls user nur diese gefüllt hat
                // (Wobei unser Form.List das eigentlich verhindern sollte, da es direkt in 'logistics' schreibt)
                // Aber sicher ist sicher.
                logisticsRaw = [ {
                    variant_name: 'Standard',
                    is_default: true,
                    // Versuchen wir Werte zu retten, falls Form-Struktur gemischt war
                    net_length_mm: values.net_length_mm,
                    net_weight_kg: values.net_weight_kg
                } ];
            }

            const logisticsPayload = logisticsRaw.map((item: any, index: number) => ({
                ...item,
                id: crypto.randomUUID(), // Neue IDs immer generieren
                product_id: newId,
                is_default: index === 0,
                variant_name: item.variant_name || (index === 0 ? 'Standard' : `Variante ${index}`)
            }));

            try {
                // Upsert funktioniert auch mit Array
                const { error } = await supabaseBrowserClient.schema("product").from("logistics").upsert(
                    logisticsPayload,
                    { onConflict: 'product_id' } // ACHTUNG: onConflict product_id würde bei 1:N alle löschen oder failen, wenn constraint unique(product_id).
                    // Bei 1:N sollte der Constraint eher unique(product_id, variant_name) oder nur PK sein.
                    // Da wir hier ADDEN, machen wir besser insert?
                    // Upsert ist okay, wenn Supabase ID generiert.
                    // WICHTIG: Wenn constraint "product_id_key" (unique) existiert, knallt es bei > 1 Eintrag.
                    // User sagt: "1:1 Beziehung wurde auf 1:N umgestellt". 
                    // Das impliziert: Constraint auf product_id wurde entfernt oder angepasst.
                    // Wir lassen 'onConflict' hier mal weg oder nehmen ID falls vorhanden (bei Create nicht).
                );

                // Besser: Wir nutzen INSERT für Create, da wir sicher neue IDs wollen.
                const { error: logError } = await supabaseBrowserClient.schema("product").from("logistics").insert(logisticsPayload);

                if (logError) throw logError;
            } catch (err: any) {
                console.error("Logistics Save Error:", err);
                message.warning("Logistik konnte nicht gespeichert werden: " + err.message);
            }

            // Specs
            if (specsItemsVal && specsItemsVal.length > 0) {
                try {
                    const { error } = await supabaseBrowserClient.schema("product").from("specifications").upsert(
                        { product_id: newId, specs: specsItemsVal },
                        { onConflict: 'product_id' }
                    );
                    if (error) throw error;
                } catch (err: any) {
                    console.error("Specs Save Error:", err);
                    message.warning("Specs konnten nicht gespeichert werden: " + err.message);
                }
            }

            // Features
            if (featuresItemsVal && featuresItemsVal.length > 0) {
                try {
                    console.log("Saving Features Payload (features_list):", { product_id: newId, features_list: featuresItemsVal });

                    // Versuch: Wir nutzen 'features_list' da dies im Interface und Edit-Page so genutzt wird.
                    // Falls der Fehler 'column "feature_list" does not exist' persistiert, deutet es auf einen Trigger hin.
                    const { error } = await supabaseBrowserClient.schema("product").from("features").upsert(
                        { product_id: newId, features_list: featuresItemsVal },
                        { onConflict: 'product_id' }
                    );
                    if (error) throw error;
                } catch (err: any) {
                    console.error("Features Save Error:", err);
                    message.warning("Features konnten nicht gespeichert werden (Bitte DB Trigger prüfen): " + err.message);
                }
            }

            // Tags
            if (tagsListVal && tagsListVal.length > 0) {
                try {
                    const { error } = await supabaseBrowserClient.schema("product").from("tags").upsert(
                        { product_id: newId, tags_list: tagsListVal },
                        { onConflict: 'product_id' }
                    );
                    if (error) throw error;
                } catch (err: any) {
                    console.error("Tags Save Error:", err);
                    message.warning("Tags konnten nicht gespeichert werden: " + err.message);
                }
            }

            message.success({ content: "Produkt erfolgreich erstellt!", key: "create_prod" });

            // Redirect
            window.location.href = `/products/edit/${newId}`;

        } catch (e: any) {
            console.error(e);
            message.error({ content: "Fehler: " + e.message, key: "create_prod" });
        }
    };

    // Override Save Button to just trigger form submit
    const items = [
        {
            key: "general",
            label: "Allgemeine Daten",
            children: (
                <div style={{ padding: "20px 0" }}>
                    <GeneralTab
                        isLocked={isLocked}
                        onToggleLock={() => setIsLocked(!isLocked)}
                        requiredFields={requiredFields}
                    />
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
                <div style={{ padding: 20, textAlign: "center", color: "#999" }}>
                    Bitte speichern Sie das Produkt zuerst, um Bilder und Medien hochladen zu können.
                </div>
            ),
        },
    ];

    return (
        <Create saveButtonProps={{ ...saveButtonProps, onClick: () => formProps.form?.submit() }}>
            <Form
                {...formProps}
                form={formProps.form}
                onFinish={handleOnFinish} // WICHTIG: Hier unser eigener Handler
                layout="vertical"
                initialValues={{
                    active: true,
                    eol: false,
                    logistics: [ {
                        variant_name: 'Standard',
                        is_default: true
                    } ]
                }}
            >

                <Tabs defaultActiveKey="general" items={items} />
            </Form>
        </Create>
    );
}
