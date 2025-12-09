export interface IProductData {
    id: string;
    item_no: string;
    name: string;
    EAN: string;
    brand: string;
    description: string;
    primaryCat: string;
    secondaryCat: string;
    active: boolean;
    eol: boolean;
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
    id: string;           // UUID der Bild-Zeile
    product_id: string;   // Verknüpfung zum Produkt
    file_path: string;    // Der Pfad im Bucket (z.B. "3dd4.../NX1LITE-05.png")
    file_name: string;    // Der Name (z.B. "NX1LITE-05.png")
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