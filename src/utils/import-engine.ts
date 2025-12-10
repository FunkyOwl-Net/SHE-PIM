import * as XLSX from 'xlsx';
import { supabaseBrowserClient } from './supabase/client';
import { IMappingField } from '@/interfaces/import';

export const processImport = async (file: File, mapping: IMappingField[]) => {
    // 1. Datei lesen
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const results = { success: 0, errors: 0, logs: [] as string[] };

    // 2. Zeile für Zeile verarbeiten
    for (const row of jsonData as any[]) {
        try {
            // A. Item Number finden (Pflicht!)
            const itemNoMapping = mapping.find(m => m.targetField === 'item_no');
            if (!itemNoMapping) throw new Error("Template hat keine Artikelnummer!");
            
            const itemNo = row[itemNoMapping.csvHeader];
            if (!itemNo) {
                results.logs.push(`Zeile übersprungen: Keine Artikelnummer`);
                continue;
            }

            // B. Daten vorbereiten (Gruppieren nach Tabelle)
            const productDataPayload: any = {};
            const logisticsPayload: any = {};
            const specsPayload: any[] = []; // Wird später gemerged
            const featuresPayload: string[] = [];
            const tagsPayload: string[] = [];

            mapping.forEach(map => {
                const value = row[map.csvHeader];
                if (value === undefined || value === "") return; // Leere ignorieren

                switch (map.targetTable) {
                    case 'productData':
                        productDataPayload[map.targetField] = value;
                        break;
                    case 'logistics':
                        logisticsPayload[map.targetField] = value; // Ggf. Number() parsen
                        break;
                    case 'specifications':
                        // targetField ist hier der Key Name (z.B. "Watt")
                        specsPayload.push({ key: map.targetField, value: String(value), unit: "" });
                        break;
                    case 'features':
                        featuresPayload.push(String(value));
                        break;
                    case 'tags':
                        // Annahme: "Tag1, Tag2" in einer Zelle
                        const tags = String(value).split(',').map(t => t.trim());
                        tagsPayload.push(...tags);
                        break;
                }
            });

            // C. 1. HAUPTPRODUKT (Upsert)
            // Wir holen zuerst die ID, falls das Produkt existiert
            let productId: string | null = null;
            
            const { data: existing } = await supabaseBrowserClient
                .schema('product').from('productData')
                .select('id').eq('item_no', itemNo).single();

            if (existing) {
                productId = existing.id;
                // Update
                await supabaseBrowserClient.schema('product').from('productData').update(productDataPayload).eq('id', productId);
            } else {
                // Insert
                const { data: newProd, error } = await supabaseBrowserClient
                    .schema('product').from('productData').insert(productDataPayload).select().single();
                if (error) throw error;
                productId = newProd.id;
            }

            if (!productId) throw new Error("Konnte Produkt ID nicht ermitteln");

            // D. NEBENTABELLEN (Upsert mit product_id)
            
            // Logistics
            if (Object.keys(logisticsPayload).length > 0) {
                await supabaseBrowserClient.schema('product').from('logistics').upsert({
                    product_id: productId, ...logisticsPayload
                }, { onConflict: 'product_id' });
            }

            // Specs (Merge Logik: Bestehende holen + Neue dazu)
            if (specsPayload.length > 0) {
                // Einfachheitshalber: Wir überschreiben oder appenden.
                // Besser: Bestehende holen, Key-Check, Merge. Hier: Plumper Upsert.
                // Für echte App: Erst SELECT specifications, dann Merge JS-Seitig, dann UPSERT.
                await supabaseBrowserClient.schema('product').from('specifications').upsert({
                    product_id: productId, specs: specsPayload 
                }, { onConflict: 'product_id' });
            }

            // Features & Tags analog...

            results.success++;

        } catch (e: any) {
            results.errors++;
            results.logs.push(`Fehler bei ${JSON.stringify(row)}: ${e.message}`);
        }
    }

    return results;
};