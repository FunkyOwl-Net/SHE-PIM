"use client";

import { List, useTable, DateField, EditButton } from "@refinedev/antd"; // EditButton importieren
import { Table, Tag, Space, Button, Popconfirm, App } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { deleteUser } from "@/app/actions/admin"; // Unsere neue Action
import { useInvalidate } from "@refinedev/core";

export default function AdminUsersList() {
    const { tableProps } = useTable({
        resource: "profiles",
        meta: { schema: "account" }
    });

    const { notification } = App.useApp();
    const invalidate = useInvalidate();

    // Handler für das Löschen
    const handleDelete = async (id: string) => {
        const result = await deleteUser(id);
        if (result.success) {
            notification.success({ message: "Benutzer gelöscht" });
            // Liste neu laden
            invalidate({ resource: "profiles", invalidates: [ "list" ] });
        } else {
            notification.error({ message: "Fehler", description: result.message });
        }
    };

    return (
        <List title="Benutzerverwaltung">
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="email" title="Email" />
                <Table.Column dataIndex="name" title="Vorname" />
                <Table.Column dataIndex="surname" title="Nachname" />
                <Table.Column
                    dataIndex="role"
                    title="Rolle"
                    render={(value) => (
                        <Tag color={value === 'Admin' ? 'red' : 'blue'}>{value || 'User'}</Tag>
                    )}
                />
                <Table.Column
                    dataIndex="created_at"
                    title="Erstellt am"
                    render={(value) => <DateField value={value} format="DD.MM.YYYY" />}
                />

                {/* --- NEUE SPALTE: AKTIONEN --- */}
                <Table.Column
                    title="Aktionen"
                    render={(_, record: any) => (
                        <Space>
                            {/* Standard Edit Button (leitet weiter auf /edit/:id) */}
                            <EditButton hideText size="small" recordItemId={record.id} />

                            {/* Custom Delete Button mit Sicherheitsabfrage */}
                            <Popconfirm
                                title="Benutzer löschen?"
                                description="Dieser Vorgang kann nicht rückgängig gemacht werden."
                                onConfirm={() => handleDelete(record.id)}
                                okText="Ja, löschen"
                                cancelText="Abbrechen"
                                okButtonProps={{ danger: true }}
                            >
                                <Button
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    title="Löschen"
                                />
                            </Popconfirm>
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
}