"use client";

import React from "react";
import { List, useTable, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Tag, Avatar } from "antd";
import { IProductData, IProductImage } from "@/interfaces/productdata"; // Deine Typen
import { getPublicImageUrl } from "@/utils/product-images";
import { FileImageOutlined } from "@ant-design/icons";

export default function ProductListPage() {
    // 1. useTable ist der "große Bruder" von useList. 
    // Er verbindet sich mit Supabase, holt Seite 1, und steuert die AntD Tabelle.
    const { tableProps } = useTable<IProductData>({
        resource: "productData", // Deine Tabelle in Supabase
        meta: {
            schema: "product", // Dein Schema
            select: "*, product_images(file_path, is_primary)", // Für die Hauptübersicht laden wir meist alles (oder spezifische Spalten)
        },
        sorters: {
            initial: [
                {
                    field: "item_no",
                    order: "asc",
                },
            ],
        },
    });

    return (
        <List>
            <Table {...(tableProps as any)} rowKey="id">
                {/* --- NEUE BILD SPALTE --- */}
                <Table.Column
                    title=""
                    dataIndex="product_images"
                    width={80}
                    render={(images: IProductImage[]) => {
                        // Logik: Finde das Bild mit is_primary === true.
                        // Wenn keins da ist, nimm das erste (images[0]).
                        const primaryImage = images?.find(img => img.is_primary) || (images && images.length > 0 ? images[ 0 ] : null);

                        const imageUrl = getPublicImageUrl(primaryImage?.file_path);

                        return (
                            <Avatar
                                shape="square"
                                size={50}
                                src={imageUrl}
                                icon={<FileImageOutlined />}
                                style={{ backgroundColor: "#f5f5f5", verticalAlign: 'middle' }}
                            />
                        );
                    }}
                />

                {/* Marke */}
                <Table.Column
                    dataIndex="brand"
                    title="Marke"
                    sorter // Macht die Spalte sortierbar
                />

                {/* Kategorie */}
                <Table.Column
                    dataIndex="primaryCat"
                    title="Kategorie"
                    sorter
                />

                {/* Artikelnummer */}
                <Table.Column
                    dataIndex="item_no"
                    title="Artikel-Nr."
                    sorter // Macht die Spalte sortierbar
                />

                {/* Name */}
                <Table.Column
                    dataIndex="name"
                    title="Bezeichnung"
                    sorter
                />

                {/* Status (als hübscher Tag) */}
                <Table.Column
                    dataIndex="active"
                    title="Status"
                    render={(value: boolean) => (
                        <Tag color={value ? "green" : "red"}>
                            {value ? "Aktiv" : "Inaktiv"}
                        </Tag>
                    )}
                />

                {/* Aktionen (Bearbeiten, Löschen buttons) */}
                <Table.Column<IProductData>
                    title="Aktionen"
                    dataIndex="actions"
                    render={(_, record) => (
                        <Space>
                            {/* Refine weiß automatisch: Geh zu /products/edit/ID */}
                            <EditButton hideText size="small" recordItemId={record.id} />
                            <ShowButton hideText size="small" recordItemId={record.item_no} />

                            {/* Achtung: Löschen braucht meist die ID (UUID), nicht item_no, 
                                je nachdem was dein Primary Key in Supabase ist */}
                            <DeleteButton hideText size="small" recordItemId={record.id} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
}