"use client";

import React from "react";
import { useLogin } from "@refinedev/core"; // Der Hook für die Logik
import { Form, Input, Button, Checkbox, Card, Typography, message, theme } from "antd"; // UI Komponenten
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function LoginPage() {
  // 1. Den Login-Hook von Refine holen
  const { token } = theme.useToken();
  const { mutate: login, isPending: isLoading } = useLogin();

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
        backgroundColor: token.colorBgLayout, // Dynamischer Background (Catppuccin Crust)
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          backgroundColor: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🐱</div> {/* Optional: Cat logo for Cattpuccin? Or just SHE */}
          <Title level={3} style={{ color: token.colorPrimary, marginBottom: 0 }}>
            Welcome Back
          </Title>
          <Typography.Text type="secondary">Bitte melde dich an, um fortzufahren</Typography.Text>
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
              prefix={<UserOutlined style={{ color: token.colorTextTertiary }} />}
              placeholder="Email Adresse"
              size="large"
              style={{ borderRadius: token.borderRadius }}
            />
          </Form.Item>

          {/* Passwort Feld */}
          <Form.Item
            name="password"
            rules={[ { required: true, message: "Bitte Passwort eingeben!" } ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: token.colorTextTertiary }} />}
              placeholder="Passwort"
              size="large"
              style={{ borderRadius: token.borderRadius }}
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
              style={{
                borderRadius: token.borderRadius,
                fontWeight: 600,
                boxShadow: `0 4px 14px ${token.colorPrimary}40` // Glow effect
              }}
            >
              Einloggen
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}