"use client";

import React, { useState, useEffect } from "react";
import { SaveButton, useForm } from "@refinedev/antd";
import { Form, Checkbox, Card, Typography, Divider, Button, message, List } from "antd";
import { AVAILABLE_FIELDS } from "@/interfaces/import"; // Reuse available fields list? Or define new?
// AVAILABLE_FIELDS contains targetTable/targetField but maybe not readable labels for all columns.
// We might want to just hardcode standard fields or list db columns.

// For now, let's use a hardcoded list of relevant fields for creation
const REQUIRED_OPTIONS = [
    { label: "Artikelnummer (item_no)", value: "item_no", disabled: true }, // Always required
    { label: "Produktname (name)", value: "name" },
    { label: "EAN Code (EAN)", value: "EAN" },
    { label: "Marke (brand)", value: "brand" },
    { label: "Beschreibung (description)", value: "description" },
    { label: "Hauptkategorie (primaryCat)", value: "primaryCat" },
    { label: "Unterkategorie (secondCat)", value: "secondCat" },
];

export default function SettingsRequiredFieldsPage() {
    // We use localStorage as a simple persistence layer for now
    const [ checkedValues, setCheckedValues ] = useState<string[]>([ "item_no" ]);

    useEffect(() => {
        const stored = localStorage.getItem("she_pim_required_fields");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Ensure item_no is present
                if (!parsed.includes("item_no")) parsed.push("item_no");
                setCheckedValues(parsed);
            } catch (e) { console.error(e); }
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem("she_pim_required_fields", JSON.stringify(checkedValues));
        message.success("Pflichtfelder Einstellungen gespeichert.");
        // Notify other components? They read from localStorage on mount, usually need reload.
    };

    const onChange = (list: string[]) => {
        setCheckedValues(list);
    };

    return (
        <Card title="Einstellungen: Pflichtfelder für Produkterstellung">
            <Typography.Paragraph>
                Wählen Sie hier aus, welche Felder beim Anlegen eines neuen Produktes zwingend ausgefüllt werden müssen.
            </Typography.Paragraph>

            <Checkbox.Group
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                value={checkedValues}
                onChange={onChange}
            >
                {REQUIRED_OPTIONS.map(opt => (
                    <Checkbox key={opt.value} value={opt.value} disabled={opt.disabled}>
                        {opt.label}
                    </Checkbox>
                ))}
            </Checkbox.Group>

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" onClick={handleSave}>
                    Speichern
                </Button>
            </div>
        </Card>
    );
}
