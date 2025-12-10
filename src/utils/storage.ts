import { supabaseBrowserClient } from "@/utils/supabase/client";

// Der Name des Storage Buckets in Supabase
// (Schau in Supabase links im Menü unter "Storage" nach dem Namen des Ordners/Buckets)
// Update: Laut Screenshot ist der Bucket-Name "product_images"
const BUCKET_NAME = "product-assets"; 

/**
 * Generiert die öffentliche URL für ein Bild im Supabase Storage.
 * 
 * @param path - Der Pfad innerhalb des Buckets (z.B. "folder/image.png")
 * @returns Die vollständige Public URL
 */
export const getImageUrl = (path: string | undefined | null) => {
  if (!path) return "";

  // 1. Falls schon eine volle URL gespeichert wurde (z.B. externe URLs), diese direkt zurückgeben
  if (path.startsWith("http")) {
    return path;
  }

  // 2. Pfad bereinigen: Führende Slashes entfernen, um doppelte Slashes zu vermeiden
  let cleanPath = path.replace(/^\/+/, "");

  // 3. Fallback: Manche speichern "bucket_name/pfad/bild.jpg".
  // Da .from(BUCKET) den Bucket-Namen schon kennt, darf er nicht nochmal im Pfad stehen.
  // Wir entfernen ihn, falls er am Anfang steht.
  if (cleanPath.startsWith(BUCKET_NAME + "/")) {
      cleanPath = cleanPath.substring(BUCKET_NAME.length + 1);
  }

  // 4. URL generieren
  const { data } = supabaseBrowserClient
    .storage
    .from(BUCKET_NAME)
    .getPublicUrl(cleanPath);

  return data.publicUrl;
};