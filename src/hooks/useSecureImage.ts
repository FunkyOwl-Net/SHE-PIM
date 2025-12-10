"use client";

import { useEffect, useState } from "react";
import { getSignedUrl } from "@/utils/product-images";

export const useSecureImage = (path: string | undefined) => {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [fullUrl, setFullUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!path) {
            setThumbnailUrl(null);
            setFullUrl(null);
            return;
        }

        if (path.startsWith("http")) {
            setThumbnailUrl(path);
            setFullUrl(path);
            return;
        }

        let isMounted = true;
        
        const fetchUrls = async () => {
            setLoading(true);
            
            // Parallel Request: einmal Thumbnail (300px), einmal Full
            const [thumb, full] = await Promise.all([
                getSignedUrl(path, { width: 300, height: 300, resize: 'cover' }),
                getSignedUrl(path) // Original
            ]);

            if (isMounted) {
                setThumbnailUrl(thumb);
                setFullUrl(full);
                setLoading(false);
            }
        };

        fetchUrls();

        return () => { isMounted = false; };
    }, [path]);

    return { 
        imageUrl: thumbnailUrl, // Legacy Support, defaults to thumb for list queries
        fullUrl,
        loading 
    };
};