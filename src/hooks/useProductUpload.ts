import { useState } from "react";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { generateProductImagePath, validateImageFile, STORAGE_BUCKET } from "@/utils/product-images";
import { App } from "antd";

export const useProductUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const { notification } = App.useApp();

    const uploadImage = async (file: File, productId: string) => {
        const validationError = validateImageFile(file);
        if (validationError) {
            notification.error({ message: "Fehler", description: validationError });
            return null;
        }

        setIsUploading(true);
        try {
            const path = generateProductImagePath(productId, file.name);
            
            // Upload zu Supabase
            const { data, error } = await supabaseBrowserClient
                .storage
                .from(STORAGE_BUCKET)
                .upload(path, file, { 
                    upsert: false,
                    cacheControl: '31536000' // 1 Jahr Cache für bessere Performance
                });

            if (error) throw error;

            return { path: data.path, name: file.name };
        } catch (error: any) {
            console.error("Upload Error:", error);
            notification.error({ message: "Upload fehlgeschlagen", description: error.message });
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    return { uploadImage, isUploading };
};