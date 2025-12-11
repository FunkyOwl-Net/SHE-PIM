export interface IProductData {
    id: string;
    item_no: string;
    name: string;
    EAN: string;
    brand: string;
    description: string;
    primaryCat: string;
    secondCat: string;
    active: boolean;
    eol: boolean;
    created_at?: string;
    updated_at?: string;
    product_images?: IProductImage[]; // Optional array of images
    specifications?: ISpecifications[]; // Joined specifications relation
    features?: IFeatures[]; // Joined features relation
    tags?: IProductTags[]; // Das neue Array
    content_images?: IMediaItem[];
    product_videos?: IMediaItem[];
    product_downloads?: IMediaItem[];
    logistics?: IProductLogistics[]; // Array, da Supabase Relation
}

export interface IFeatures {
    product_id: string;
    features_list: string[];
}

//import Jsonb array von Supabase
export interface ISpecificationsAttribute {
    key: string;          // z.B. "Leistung"
    value: string;        // z.B. "1200 W" (Achtung: In deinem JSON ist es ein String)
    unit: string | null;  // z.B. "Watt" oder null
}

export interface ISpecifications {
    product_id: string;
    id: string;
    specs?: ISpecificationsAttribute[];
}

// Produktbilder aus dem Supabase Bucket
export interface IProductImage {
    id: string;
    product_id: string;
    file_path: string;
    file_name: string;
    description?: string;
    is_primary?: boolean;
}

export interface IProductDetails extends IProductData {
    
    // HIER kommen die Relationen rein.
    // WICHTIG: Der Name der Eigenschaft muss exakt so heißen wie die Tabelle in Supabase!
    
    // Beispiel: Tabelle heißt "product_images" -> Array von IProductImage
    product_images?: IProductImage[];
}

// Ein schlankes Interface nur für Auswahl-Listen (Dropdowns etc.)
export interface IProductSelectOption {
    id: string;      // Die UID (für die Verknüpfung im Hintergrund)
    item_no: string; // Was der User sieht/sucht
    name: string;    // Hilfreich für die Anzeige (z.B. "NX1LITE - Super Produkt")
}

export interface IProductTags {
    id: string;
    product_id: string;
    tags_list: string[]; // Einfaches String-Array
}

// Ein Basis-Interface für ALLE Medien-Typen
export interface IMediaItem {
    id: string;
    product_id: string;
    file_path: string;
    file_name: string;
    display_name?: string; // NEU: Der "schöne" Name
    description?: string;
    created_at?: string;
    created_by_name?: string; // NEU: Wer hat es hochgeladen
    is_primary?: boolean; // Nur bei product_images relevant
    category?: string;    // Nur bei Downloads relevant
}

export interface IProductLogistics {
    id: string;
    product_id: string;
    // Netto
    net_length_mm?: number;
    net_width_mm?: number;
    net_height_mm?: number;
    net_weight_kg?: number;
    // Brutto
    gross_length_mm?: number;
    gross_width_mm?: number;
    gross_height_mm?: number;
    gross_weight_kg?: number;
    // Master
    has_master_carton?: boolean;
    master_length_mm?: number;
    master_width_mm?: number;
    master_height_mm?: number;
    master_weight_kg?: number;
    master_quantity?: number;
    // Palette
    items_per_pallet?: number;
    pallet_height_mm?: number;
}