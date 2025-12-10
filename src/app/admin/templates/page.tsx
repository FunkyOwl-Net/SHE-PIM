"use client";

import React from "react";
import { List, useTable, DeleteButton, EditButton } from "@refinedev/antd";
import { Table, Space } from "antd";

export default function TemplateListPage() {
    const { tableProps } = useTable({
        resource: "import_templates",
        meta: {
            schema: "product",
            select: "*"
        }
    });

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="name" title="Template Name" />
                <Table.Column dataIndex="description" title="Beschreibung" />
                <Table.Column
                    dataIndex="created_at"
                    title="Erstellt am"
                    render={(val) => new Date(val).toLocaleDateString()}
                />
                <Table.Column
                    title="Aktionen"
                    render={(_, record: any) => (
                        <Space>
                            {/* Bearbeiten Button */}
                            <EditButton hideText size="small" recordItemId={record.id} />
                            {/* Löschen Button */}
                            <DeleteButton hideText size="small" recordItemId={record.id} meta={{ schema: "product" }} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
}