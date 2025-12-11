"use client";

import { useGo } from "@refinedev/core";
import { Typography, Row, Col, Card, Statistic, Button, theme } from "antd";
import { ShoppingOutlined, UserOutlined, FileTextOutlined, PlusOutlined, RocketOutlined, ImportOutlined } from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

export default function DashboardPage() {
  const go = useGo();
  const { token } = theme.useToken();

  return (
    <div style={{ padding: "20px" }}>

      {/* HERO SECTION */}
      <Card
        variant="borderless"
        style={{
          marginBottom: "30px",
          background: `linear-gradient(135deg, ${token.colorPrimary}20 0%, ${token.colorBgContainer} 100%)`, // Subtle gradient
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Title level={2} style={{ marginBottom: 0, color: token.colorPrimary }}>
              Willkommen im PIM Dashboard 👋
            </Title>
            <Paragraph style={{ marginTop: 8, fontSize: 16, color: token.colorTextSecondary }}>
              Verwalte deine Produkte, Kunden und Exporte zentral an einem Ort.
            </Paragraph>
          </div>
          {/* Optional Illustration or Icon */}
          <RocketOutlined style={{ fontSize: 48, color: token.colorPrimary, opacity: 0.5, marginRight: 20 }} />
        </div>
      </Card>

      {/* KPI STATISTICS */}
      <Row gutter={[ 16, 16 ]}>
        <Col xs={24} sm={8}>
          <Card variant="borderless" hoverable style={{ height: '100%' }}>
            <Statistic
              title={<Text type="secondary">Aktive Produkte</Text>}
              value={128}
              prefix={<ShoppingOutlined style={{ color: token.colorSuccess || '#a6e3a1' }} />} // Green (Catppuccin Green)
              valueStyle={{ fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" hoverable style={{ height: '100%' }}>
            <Statistic
              title={<Text type="secondary">Kunden (CRM)</Text>}
              value={45}
              prefix={<UserOutlined style={{ color: token.colorInfo || '#89b4fa' }} />} // Blue
              valueStyle={{ fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" hoverable style={{ height: '100%' }}>
            <Statistic
              title={<Text type="secondary">Datenblätter erstellt</Text>}
              value={12}
              prefix={<FileTextOutlined style={{ color: token.colorWarning || '#f9e2af' }} />} // Yellow
              valueStyle={{ fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* QUICK ACTIONS */}
      <Title level={4} style={{ marginTop: "40px", color: token.colorTextHeading }}>Schnellzugriff</Title>
      <Row gutter={[ 16, 16 ]}>
        <Col xs={24} md={8}>
          <Card
            title={<span style={{ color: token.colorTextHeading }}>Produktmanagement</span>}
            variant="borderless"
            style={{ height: '100%' }}
            actions={[
              <Button type="link" onClick={() => go({ to: "/products/create" })} icon={<PlusOutlined />}>
                Produkt anlegen
              </Button>
            ]}
          >
            <Paragraph type="secondary" style={{ minHeight: 40 }}>
              Neue Produkte anlegen, Bestände pflegen oder Metadaten bearbeiten.
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            title={<span style={{ color: token.colorTextHeading }}>CSV Import/Export</span>}
            variant="borderless"
            style={{ height: '100%' }}
            actions={[
              <Button type="link" onClick={() => go({ to: "/import" })} icon={<ImportOutlined />}>
                Zum Import-Wizard
              </Button>
            ]}
          >
            <Paragraph type="secondary" style={{ minHeight: 40 }}>
              Massendaten via CSV importieren oder Templates für den Export konfigurieren.
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
}