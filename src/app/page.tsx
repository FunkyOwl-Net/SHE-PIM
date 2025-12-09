"use client";

import { useGo } from "@refinedev/core";
import { Typography, Row, Col, Card, Statistic, Button } from "antd";
import { ShoppingOutlined, UserOutlined, FileTextOutlined, PlusOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function DashboardPage() {
  const go = useGo(); // Hook für Navigation

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "30px" }}>
        <Title level={2}>Willkommen im PIM Dashboard 👋</Title>
        <Paragraph>
          Verwalte deine Produkte, Kunden und Exporte zentral an einem Ort.
        </Paragraph>
      </div>

      {/* Statistik / KPI Bereich */}
      <Row gutter={[ 16, 16 ]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Aktive Produkte"
              value={128} // Später dynamisch aus DB laden
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Kunden (CRM)"
              value={45}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Datenblätter erstellt"
              value={12}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions Bereich */}
      <Title level={4} style={{ marginTop: "40px" }}>Schnellzugriff</Title>
      <Row gutter={[ 16, 16 ]}>
        <Col xs={24} md={8}>
          <Card title="Produktmanagement" bordered={false}>
            <p>Neue Produkte anlegen oder Bestände pflegen.</p>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => go({ to: "/products/create" })}
            >
              Produkt anlegen
            </Button>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="CSV Import/Export" bordered={false}>
            <p>Massendaten verarbeiten und Templates nutzen.</p>
            <Button onClick={() => go({ to: "/import" })}>
              Zum Import-Wizard
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}