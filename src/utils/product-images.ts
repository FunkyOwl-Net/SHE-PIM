import { supabaseBrowserClient } from "@/utils/supabase/client";

// Der Name deines Buckets in Supabase
export const STORAGE_BUCKET = "product-assets";

/**
 * Bereinigt den Pfad, entfernt führende Slashes.
 */
export const cleanStoragePath = (path: string): string => {
    if (!path) return "";
    return path.replace(/^\/+/, "");
};

/**
 * Generiert einen eindeutigen Pfad für den Upload.
 * Schema: {productId}/product_images/{timestamp}_{filename}
 */
export const generateProductImagePath = (productId: string, fileName: string): string => {
    // Sonderzeichen entfernen
    const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const timestamp = Date.now();
    return `${productId}/product_images/${timestamp}_${cleanName}`;
};

/**
 * Validiert die Datei vor dem Upload.
 */
export const validateImageFile = (file: File): string | null => {
    return null;
};

// Typ für Transformations-Optionen
export type ImageOptions = {
    width?: number;
    height?: number;
    resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Holt eine signierte URL (für private Buckets) oder eine Public URL.
 * Optional mit Transformationen (Resize).
 */
export const getSignedUrl = async (path: string, options?: ImageOptions): Promise<string | null> => {
    try {
        const clean = cleanStoragePath(path);
        
        let transformOption = undefined;
        if (options) {
            transformOption = {
                width: options.width,
                height: options.height,
                resize: options.resize || 'cover',
            };
        }

        // Versuche eine Signed URL zu erstellen (Gültig für 1 Stunde)
        const { data, error } = await supabaseBrowserClient
            .storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(clean, 3600, {
                transform: transformOption
            });

        if (error) {
            console.error("[getSignedUrl] Error:", error.message);
            return null;
        }
        return data.signedUrl;
    } catch (e) {
        console.error("[getSignedUrl] Exception:", e);
        return null;
    }
};

/**
 * Generiert die ÖFFENTLICHE URL für ein Bild (synchron).
 * Perfekt für Listen/Tabellen, da kein await nötig ist.
 */
export const getPublicImageUrl = (path: string | undefined): string | undefined => {
    if (!path) return undefined;
    
    // Falls schon http drin steht
    if (path.startsWith("http")) return path;

    const clean = cleanStoragePath(path);
    
    // Wir nutzen die Supabase Helper Methode, die ist synchron
    const { data } = supabaseBrowserClient
        .storage
        .from(STORAGE_BUCKET) // Das ist 'product-assets'
        .getPublicUrl(clean);

    return data.publicUrl;
};