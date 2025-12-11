import { supabaseBrowserClient } from "@/utils/supabase/client";

export const useSecureImage = (path: string | undefined) => {
    if (!path) {
        return { imageUrl: null, fullUrl: null, loading: false };
    }

    if (path.startsWith("http")) {
        return { imageUrl: path, fullUrl: path, loading: false };
    }

    // Synchronous URL generation for maximum performance in lists
    const clean = path.startsWith('/') ? path.slice(1) : path;
    const { data } = supabaseBrowserClient.storage.from("product-assets").getPublicUrl(clean);
    const url = data.publicUrl;

    return { 
        imageUrl: url, 
        fullUrl: url,
        loading: false 
    };
};