import * as XLSX from 'xlsx';
import { IMappingField } from '@/interfaces/import';

/**
 * Erstellt eine leere Vorlage basierend auf der Konfiguration
 * und lädt sie direkt herunter.
 */
export const downloadTemplateFile = (
    mapping: IMappingField[], 
    format: 'xlsx' | 'csv', 
    filename: string
) => {
    // 1. Überschriften aus dem Mapping extrahieren
    // Wir bauen ein Objekt, wo die Keys die CSV-Header sind
    const headerRow: any = {};
    mapping.forEach(field => {
        if (field.csvHeader) {
            headerRow[field.csvHeader] = ""; // Leerer Wert für die erste Datenzeile (optional)
        }
    });

    // 2. Worksheet erstellen
    // Wir nutzen json_to_sheet nur mit Headern, damit die Datei leer ist
    const worksheet = XLSX.utils.json_to_sheet([], { 
        header: mapping.map(m => m.csvHeader) 
    });

    // 3. Workbook erstellen
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    // 4. Download auslösen
    const ext = format === 'csv' ? 'csv' : 'xlsx';
    XLSX.writeFile(workbook, `${filename}_template.${ext}`);
};