import { useEffect, useState } from "react";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { cleanStoragePath, STORAGE_BUCKET } from "@/utils/product-images";

/**
 * Hook zum Generieren einer Signierten URL für Produktbilder.
 * Funktioniert sowohl für öffentliche als auch private Buckets.
 * 
 * @param filePath - Der Pfad zur Datei im Storage
 * @returns { url: string | null, isLoading: boolean }
 */
export const useProductImageUrl = (filePath: string | undefined | null) => {
    const [url, setUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        setErrorMsg(null);
        if (!filePath) {
            setUrl(null);
            return;
        }

        // 1. Externe URLs direkt nutzen
        if (filePath.startsWith("http")) {
            setUrl(filePath);
            return;
        }

        const fetchSignedUrl = async () => {
            setIsLoading(true);
            try {
                // 2. Pfad bereinigen
                const cleanPath = cleanStoragePath(filePath);

                // 3. Debug: Verify file existence via List
                if (filePath.includes('/')) {
                    const folderPath = cleanPath.substring(0, cleanPath.lastIndexOf('/'));
                    const fileName = cleanPath.substring(cleanPath.lastIndexOf('/') + 1);
                    
                    console.log(`[useProductImageUrl] Debug - Listing files in folder: ${folderPath}`);
                    const { data: listData, error: listError } = await supabaseBrowserClient
                        .storage
                        .from(STORAGE_BUCKET)
                        .list(folderPath);

                    if (listError) {
                        console.error("[useProductImageUrl] List Error:", listError);
                    } else {
                        const found = listData?.find(f => f.name === fileName);
                        console.log(`[useProductImageUrl] File in list?`, found ? "YES" : "NO", found || "");
                        if (!found) {
                            console.warn("[useProductImageUrl] File NOT found in listing. Metadata:", listData);
                        }
                    }
                }

                // 4. Signed URL anfragen (Gültig für 1 Stunde)
                console.log(`[useProductImageUrl] Requesting signed URL for: ${cleanPath} (Bucket: ${STORAGE_BUCKET})`);
                
                const { data, error } = await supabaseBrowserClient
                    .storage
                    .from(STORAGE_BUCKET)
                    .createSignedUrl(cleanPath, 3600);
                    
                if (data) {
                    console.log(`[useProductImageUrl] Success! URL:`, data.signedUrl);
                    setUrl(data.signedUrl);
                }

                if (error) {
                    console.warn(`[useProductImageUrl] Error signing URL for path "${cleanPath}":`, error.message);
                    setErrorMsg(error.message);
                    
                    // Fallback: Versuche Public URL, falls Signing nicht klappt (z.B. Bucket Policies)
                    const { data: publicData } = supabaseBrowserClient
                        .storage
                        .from(STORAGE_BUCKET)
                        .getPublicUrl(cleanPath);
                        
                    if(publicData?.publicUrl) {
                        setUrl(publicData.publicUrl); // Try public anyway, might work if public bucket
                    } else {
                        setUrl(null);
                    }
                }
            } catch (err: any) {
                console.error("[useProductImageUrl] Unexpected error:", err);
                setErrorMsg(err.message || "Unknown error");
                setUrl(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSignedUrl();
    }, [filePath]);

    return { url, isLoading, error: errorMsg };
};
