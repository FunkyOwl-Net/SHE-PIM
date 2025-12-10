export interface IImportTemplate {
    id: string;
    name: string;
    description?: string;
    mapping_config: IMappingField[];
}

export interface IMappingField {
    csvHeader: string;      // Wie heißt die Spalte in der Datei? (z.B. "Gewicht (kg)")
    targetTable: 'productData' | 'logistics' | 'specifications' | 'features' | 'tags';
    targetField: string;    // DB Spalte (z.B. "net_weight_kg")
    isSpecKey?: boolean;    // Falls true: targetField ist der Key im JSON (z.B. "Leistung")
}

// Definition aller verfügbaren DB-Felder für den Template-Builder
export const AVAILABLE_FIELDS = [
    { label: "Artikelnummer (Pflicht)", value: "item_no", table: "productData", required: true },
    { label: "Produktname", value: "name", table: "productData" },
    { label: "Beschreibung", value: "description", table: "productData" },
    { label: "EAN", value: "EAN", table: "productData" },
    { label: "Marke", value: "brand", table: "productData" },
    
    // Logistik
    { label: "Gewicht Netto (kg)", value: "net_weight_kg", table: "logistics" },
    { label: "Länge Netto (mm)", value: "net_length_mm", table: "logistics" },
    // ... weitere Logistik Felder ...

    // Spezial
    { label: "Technische Daten (JSON)", value: "json_spec", table: "specifications", isDynamic: true },
    { label: "Features (Liste)", value: "json_feature", table: "features", isDynamic: true },
    { label: "Tags (Kommagetrennt)", value: "json_tags", table: "tags", isDynamic: true },
];