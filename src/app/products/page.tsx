"use client";

import React from "react";
import { List, useTable, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Tag } from "antd";
import { IProductData } from "@/interfaces/productdata"; // Deine Typen

export default function ProductListPage() {
    // 1. useTable ist der "große Bruder" von useList. 
    // Er verbindet sich mit Supabase, holt Seite 1, und steuert die AntD Tabelle.
    const { tableProps } = useTable<IProductData>({
        resource: "productData", // Deine Tabelle in Supabase
        meta: {
            schema: "product", // Dein Schema
            select: "*", // Für die Hauptübersicht laden wir meist alles (oder spezifische Spalten)
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
            <Table {...tableProps} rowKey="id">
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

                {/* EAN */}
                <Table.Column
                    dataIndex="EAN"
                    title="EAN"
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