"use client";

import React, { useState } from "react";
import { Create } from "@refinedev/antd";
import { Form, Input, Select, App } from "antd";
import { useGo } from "@refinedev/core";
import { createNewUser } from "@/app/actions/admin"; // Unsere Server Action

export default function UserCreatePage() {
    const { notification } = App.useApp();
    const go = useGo();
    const [ form ] = Form.useForm();
    const [ isLoading, setIsLoading ] = useState(false);

    const onFinish = async (values: any) => {
        setIsLoading(true);
        try {
            // Server Action aufrufen
            const result = await createNewUser(values);

            if (result.success) {
                notification.success({
                    message: "Erfolg",
                    description: "Benutzer wurde angelegt."
                });
                // Zurück zur Liste navigieren
                go({ to: "/admin/users", type: "push" });
            } else {
                notification.error({
                    message: "Fehler",
                    description: result.message
                });
            }
        } catch (error) {
            notification.error({ message: "Systemfehler beim Erstellen" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Create
            saveButtonProps={{
                onClick: form.submit,
                loading: isLoading
            }}
            title="Neuen Benutzer anlegen"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ role: "User" }}
            >
                <div style={{ display: 'flex', gap: 24 }}>
                    <Form.Item
                        label="Vorname"
                        name="name"
                        style={{ flex: 1 }}
                        rules={[ { required: true, message: 'Pflichtfeld' } ]}
                    >
                        <Input placeholder="Max" />
                    </Form.Item>
                    <Form.Item
                        label="Nachname"
                        name="surname"
                        style={{ flex: 1 }}
                        rules={[ { required: true, message: 'Pflichtfeld' } ]}
                    >
                        <Input placeholder="Mustermann" />
                    </Form.Item>
                </div>

                <Form.Item
                    label="Email Adresse"
                    name="email"
                    rules={[
                        { required: true, message: 'Pflichtfeld' },
                        { type: 'email', message: 'Ungültige Email' }
                    ]}
                >
                    <Input placeholder="max@firma.at" />
                </Form.Item>

                <Form.Item
                    label="Passwort"
                    name="password"
                    rules={[
                        { required: true, message: 'Pflichtfeld' },
                        { min: 6, message: 'Mindestens 6 Zeichen' }
                    ]}
                >
                    <Input.Password placeholder="Vergib ein sicheres Passwort" />
                </Form.Item>

                <Form.Item
                    label="Rolle & Berechtigung"
                    name="role"
                    rules={[ { required: true } ]}
                >
                    <Select options={[
                        { label: "Benutzer (Standard)", value: "User" },
                        { label: "Administrator (Vollzugriff)", value: "Admin" },
                        { label: "Editor (Produktpflege)", value: "Editor" },
                    ]} />
                </Form.Item>
            </Form>
        </Create>
    );
}