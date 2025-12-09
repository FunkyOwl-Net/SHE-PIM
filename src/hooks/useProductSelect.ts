import { useList } from "@refinedev/core";
import { IProductSelectOption } from "@/interfaces/productdata";

export const useProductSelect = () => {
    return useList<IProductSelectOption>({
        resource: "productData",
        // Paginierung deaktivieren oder sehr hoch setzen, wenn du alle in einem Dropdown willst
        pagination: {
            mode: "off", 
        },
        sorters: [
            {
                field: "item_no",
                order: "asc",
            },
        ],
        meta: {
            schema: "product", // WICHTIG: Dein Schema-Name (Plural beachten wie du sagtest)
            
            // HIER ist der Performance-Trick:
            // Wir laden NUR id, item_no und name. Keine Bilder, keine Specs.
            select: "item_no, name", 
        },
    });
};