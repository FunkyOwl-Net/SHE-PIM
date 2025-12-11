import { supabaseBrowserClient } from "@/utils/supabase/client";
import { STORAGE_BUCKET } from "./product-images";

// UI Categories as defined in the media upload page
export type MediaCategory = 
    | 'product_image'
    | 'content'
    | 'product_video'
    | 'manual'
    | 'datasheet'
    | 'declaration'
    | 'other';

interface UploadResult {
    success: boolean;
    error?: string;
    filePath?: string;
    dbRecord?: any;
}

/**
 * Uploads a file to Supabase Storage and creates the corresponding database record.
 * 
 * @param file The file object to upload
 * @param productId The ID of the product
 * @param category The selected UI category
 * @param displayName User friendly name
 * @param description Optional description
 */
export const uploadAndLinkMedia = async (
    file: File,
    productId: string,
    category: MediaCategory,
    displayName: string,
    description: string = ""
): Promise<UploadResult> => {
    try {
        // 1. Determine Path and DB Table
        let folder = "others";
        let tableName = "";
        let isDownload = false;
        
        switch (category) {
            case "product_image":
                folder = "product_images";
                tableName = "product_images";
                break;
            case "content":
                folder = "content_images";
                tableName = "content_images";
                break;
            case "product_video":
                folder = "product_videos";
                tableName = "product_videos";
                break;
            case "manual":
            case "datasheet":
            case "declaration":
            case "other":
                folder = "downloads";
                tableName = "product_downloads";
                isDownload = true;
                break;
        }

        if (!tableName) return { success: false, error: "Invalid category mapping" };

        // 2. Generate Path
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const timestamp = Date.now();
        const filePath = `${productId}/${folder}/${timestamp}_${sanitizedName}`;

        // 3. Upload to Storage
        const { error: uploadError } = await supabaseBrowserClient
            .storage
            .from(STORAGE_BUCKET)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error("Storage Upload Error:", uploadError);
            return { success: false, error: uploadError.message };
        }

        // 4. Insert into Database
        // Construct the record object
        const recordData: any = {
            product_id: productId,
            file_path: filePath,
            file_name: file.name,
            description: description,
             // Some tables might not have display_name yet, but based on interface they do or should. 
             // If not, Supabase ignores distinct extra fields often if setup loosely, OR we strictly follow interfaces.
             // Interface IMediaItem has display_name. IProductImage does NOT have display_name in the interface 
             // I verified earlier (Step 495), but let's re-verify.
             // IProductImage: id, product_id, file_path, file_name, description, is_primary.
             // IMediaItem: id, product_id, file_path, file_name, display_name, description, category.
        };

        // Add specific fields based on type
        if (category === "product_image") {
             // product_images table usually strictly follows IProductImage
        } else {
             // other tables use IMediaItem structure usually
             recordData.display_name = displayName || file.name;
        }

        if (isDownload) {
            recordData.category = category; // map "manual", "datasheet" etc. to the category column
        }

        const { data: dbData, error: dbError } = await supabaseBrowserClient
            .from(tableName)
            .insert(recordData)
            .select()
            .single();

        if (dbError) {
            console.error("DB Insert Error:", dbError);
            // Optional: Try to cleanup uploaded file if DB fails? 
            // For now, let's just report error.
            return { success: false, error: dbError.message };
        }

        return { success: true, filePath, dbRecord: dbData };

    } catch (e) {
        console.error("Exception in uploadAndLinkMedia:", e);
        return { success: false, error: "Unknown exception occurred" };
    }
};
