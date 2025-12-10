"use client";

import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export default function UserEditPage() {
    const { formProps, saveButtonProps, query } = useForm({
        resource: "profiles",
        meta: { schema: "account" },
        redirect: "list"
    });

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                {/* Email anzeigen, aber sperren (da Auth-relevant) */}
                <Form.Item label="Email" name="email">
                    <Input disabled style={{ color: "#333" }} />
                </Form.Item>

                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item label="Vorname" name="name" style={{ flex: 1 }}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Nachname" name="surname" style={{ flex: 1 }}>
                        <Input />
                    </Form.Item>
                </div>

                <Form.Item label="Rolle" name="role" rules={[ { required: true } ]}>
                    <Select options={[
                        { label: "Administrator", value: "Admin" },
                        { label: "Benutzer", value: "User" },
                        { label: "Editor", value: "Editor" },
                    ]} />
                </Form.Item>
            </Form>
        </Edit>
    );
}