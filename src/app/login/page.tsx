"use client";

import React from "react";
import { useLogin } from "@refinedev/core"; // Der Hook für die Logik
import { Form, Input, Button, Checkbox, Card, Typography, message } from "antd"; // UI Komponenten
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function LoginPage() {
  // 1. Den Login-Hook von Refine holen
  const { mutate: login, isLoading } = useLogin();

  // 2. Was passiert, wenn man auf "Login" klickt?
  const onFinish = (values: any) => {
    // values enthält: { email, password, remember }

    login({
      email: values.email,
      password: values.password,
      remember: values.remember, // Geben wir weiter, falls wir es im AuthProvider nutzen wollen
    }, {
      onError: (error) => {
        // Fehlermeldung anzeigen (z.B. falsches Passwort)
        message.error("Login fehlgeschlagen. Bitte prüfe deine Daten.");
      }
    });
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Title level={3}>PIM Login</Title>
        </div>

        <Form
          name="login_form"
          initialValues={{ remember: true }} // Standardmäßig angehakt
          onFinish={onFinish}
          layout="vertical"
        >
          {/* Email Feld */}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Bitte Email eingeben!" },
              { type: "email", message: "Das ist keine gültige Email!" }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email Adresse"
              size="large"
            />
          </Form.Item>

          {/* Passwort Feld */}
          <Form.Item
            name="password"
            rules={[ { required: true, message: "Bitte Passwort eingeben!" } ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Passwort"
              size="large"
            />
          </Form.Item>

          {/* Checkbox "Angemeldet bleiben" */}
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Angemeldet bleiben</Checkbox>
            </Form.Item>
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={isLoading} // Zeigt Lade-Spinner während Supabase prüft
            >
              Einloggen
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}