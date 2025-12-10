"use client";

import React from "react";
import { useGo } from "@refinedev/core";
import { Row, Col, Card, Typography, Statistic } from "antd";
import { UserOutlined, SettingOutlined, SafetyCertificateOutlined, ArrowRightOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const AdminToolCard = ({ title, desc, icon, path, stat }: any) => {
    const go = useGo();
    return (
        <Card
            hoverable
            style={{ height: '100%' }}
            onClick={() => go({ to: path })}
            actions={[ <div key="go" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>Öffnen <ArrowRightOutlined /></div> ]}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{
                    background: '#e6f7ff', color: '#1890ff',
                    width: 48, height: 48, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
                }}>
                    {icon}
                </div>
                <div>
                    <Title level={5} style={{ margin: 0 }}>{title}</Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>{desc}</Text>
                </div>
            </div>
            {stat && (
                <div style={{ marginTop: 16 }}>
                    <Statistic value={stat} valueStyle={{ fontSize: 20 }} prefix="#" />
                </div>
            )}
        </Card>
    );
};

export default function AdminDashboardPage() {
    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 32 }}>
                <Title level={2}>Admin Konsole</Title>
                <Text type="secondary">Verwalten Sie Benutzer, Systemeinstellungen und Logs.</Text>
            </div>

            <Row gutter={[ 24, 24 ]}>
                <Col xs={24} md={8} lg={6}>
                    <AdminToolCard
                        title="Benutzer"
                        desc="Rollen vergeben, User anlegen & löschen."
                        icon={<UserOutlined />}
                        path="/admin/users"
                        stat={12} // Später dynamisch laden
                    />
                </Col>
                <Col xs={24} md={8} lg={6}>
                    <AdminToolCard
                        title="System"
                        desc="Globale Einstellungen & Konfiguration."
                        icon={<SettingOutlined />}
                        path="/admin/settings"
                    />
                </Col>
                <Col xs={24} md={8} lg={6}>
                    <AdminToolCard
                        title="Audit Logs"
                        desc="Wer hat was wann geändert?"
                        icon={<SafetyCertificateOutlined />}
                        path="/admin/logs"
                    />
                </Col>
            </Row>
        </div>
    );
}