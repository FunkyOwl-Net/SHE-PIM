"use client";

import React, { useEffect, useState } from "react";
import { Card, Tag, Typography, Spin, Empty, Avatar, Button, Timeline, ConfigProvider, theme } from "antd";
import { ClockCircleOutlined, UserOutlined, DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/de";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { IAuditLog } from "@/interfaces/audit";

dayjs.extend(relativeTime);
dayjs.locale("de");

const { Text, Title, Paragraph } = Typography;

interface HistoryTabProps {
    productId: string;
}

// Maps table names to readable areas
const AREA_MAP: Record<string, string> = {
    'productData': 'Stammdaten',
    'specifications': 'Spezifikationen',
    'features': 'Features',
    'product_images': 'Produktbilder',
    'content_images': 'Content Bilder',
    'product_videos': 'Videos',
    'product_downloads': 'Downloads',
    'tags': 'Tags',
    'logistics': 'Logistik & Maße'
};

const getAreaName = (tableName: string) => {
    // Falls tableName schema.table format hat
    const cleanName = tableName.split('.').pop() || tableName;
    return AREA_MAP[ cleanName ] || cleanName;
};

// Helper to determine if we should group items (same user, within 2 minutes)
const shouldGroup = (current: IAuditLog, prev: IAuditLog) => {
    if (!prev) return false;
    if (current.changed_by !== prev.changed_by) return false;
    const diff = dayjs(current.changed_at).diff(dayjs(prev.changed_at), 'minute');
    return Math.abs(diff) < 2;
};

export const HistoryTab: React.FC<HistoryTabProps> = ({ productId }) => {
    const { token } = theme.useToken();
    const [ logs, setLogs ] = useState<IAuditLog[]>([]);
    const [ loading, setLoading ] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabaseBrowserClient
                .schema("she_pim")
                .from("audit_logs")
                .select("*")
                .or(`record_id.eq.${productId},new_data->>product_id.eq.${productId},old_data->>product_id.eq.${productId}`)
                .order("changed_at", { ascending: false })
                .limit(50);

            if (error) throw error;

            const userIds = Array.from(new Set(data.map(l => l.changed_by).filter(Boolean)));

            let userMap: Record<string, string> = {};
            if (userIds.length > 0) {
                const { data: users } = await supabaseBrowserClient
                    .schema("account")
                    .from("profiles")
                    .select("id, name, surname")
                    .in("id", userIds);

                users?.forEach(u => {
                    userMap[ u.id ] = `${u.name} ${u.surname}`;
                });
            }

            const enrichedLogs = data.map((log: any) => ({
                ...log,
                changer_name: userMap[ log.changed_by ] || "System / Unbekannt"
            }));

            setLogs(enrichedLogs);

        } catch (err) {
            console.error("Error fetching history:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchLogs();
        }
    }, [ productId ]);

    // Helper for action colors
    const getActionColor = (action: string) => {
        switch (action) {
            case "INSERT": return "green";
            case "UPDATE": return "blue";
            case "DELETE": return "red";
            default: return "default";
        }
    };

    // Helper functions for rendering values
    const renderValue = (val: any): React.ReactNode => {
        if (val === null || val === undefined) return <Text type="secondary" italic>leer</Text>;
        if (typeof val === 'boolean') return val ? 'Ja' : 'Nein';
        if (Array.isArray(val)) {
            if (val.length === 0) return <Text type="secondary" italic>leer</Text>;
            if (typeof val[ 0 ] === 'string') return val.join(", ");
            return <Text code>{val.length} Elemente</Text>;
        }
        if (typeof val === 'object') {
            return <Text code style={{ fontSize: 12 }}>{JSON.stringify(val).substring(0, 50)}...</Text>;
        }
        return String(val);
    };

    // Special diff renderer
    const renderDiffDetail = (key: string, oldVal: any, newVal: any) => {
        // Special handling for Arrays/Lists
        if ((key === 'specs' || key === 'features_list' || key === 'tags_list') && Array.isArray(newVal)) {
            if (key === 'tags_list') {
                const oldTags = Array.isArray(oldVal) ? oldVal : [];
                const added = newVal.filter(t => !oldTags.includes(t));
                const removed = oldTags.filter(t => !newVal.includes(t));
                return (
                    <div>
                        {added.map(t => <Tag key={`add-${t}`} color="green">+{t}</Tag>)}
                        {removed.map(t => <Tag key={`rem-${t}`} color="red">-{t}</Tag>)}
                        {added.length === 0 && removed.length === 0 && <Text type="secondary">Reihenfolge geändert</Text>}
                    </div>
                );
            }
            return <Text type="secondary">Liste aktualisiert ({newVal.length} Einträge)</Text>;
        }

        // Standard Field Comparison
        return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px 1fr', gap: 8, alignItems: 'center' }}>
                <div style={{ backgroundColor: token.colorErrorBg, padding: '6px 10px', borderRadius: 4, border: `1px solid ${token.colorErrorBorder}`, fontSize: 13 }}>
                    <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 2, color: token.colorTextSecondary }}>VORHER</Text>
                    <Text style={{ color: token.colorText }} delete>{renderValue(oldVal)}</Text>
                </div>
                <div style={{ textAlign: 'center', color: token.colorTextQuaternary, paddingTop: 14 }}>
                    →
                </div>
                <div style={{ backgroundColor: token.colorSuccessBg, padding: '6px 10px', borderRadius: 4, border: `1px solid ${token.colorSuccessBorder}`, fontSize: 13 }}>
                    <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 2, color: token.colorTextSecondary }}>NACHHER</Text>
                    <Text style={{ color: token.colorText }} strong>{renderValue(newVal)}</Text>
                </div>
            </div>
        );
    };


    const renderLogContent = (log: IAuditLog) => {
        if (log.action === 'DELETE') return <Text type="danger">Datensatz gelöscht</Text>;
        if (log.action === 'INSERT') return <Text type="success">Neu erstellt (Initialwerte)</Text>;

        const oldD = log.old_data || {};
        const newD = log.new_data || {};
        const ignore = [ 'updated_at', 'created_at', 'id', 'product_id', 'record_id', 'changed_by', 'changed_at' ];

        const keys = Object.keys(newD).filter(k => {
            if (ignore.includes(k)) return false;
            return JSON.stringify(oldD[ k ]) !== JSON.stringify(newD[ k ]);
        });

        if (keys.length === 0) return <Text italic type="secondary">Technische Aktualisierung</Text>;

        return (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {keys.map(key => (
                    <div key={key}>
                        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: 2 }}>
                            {key}
                        </Text>
                        {renderDiffDetail(key, oldD[ key ], newD[ key ])}
                    </div>
                ))}
            </div>
        );
    };

    // Grouping Logic
    const groupedLogs: { header: IAuditLog, items: IAuditLog[] }[] = [];
    logs.forEach((log, index) => {
        const lastGroup = groupedLogs[ groupedLogs.length - 1 ];
        if (lastGroup && shouldGroup(lastGroup.header, log)) {
            lastGroup.items.push(log);
        } else {
            groupedLogs.push({ header: log, items: [ log ] });
        }
    });


    // Render Item for Timeline (Content generation for items prop)
    const getTimelineItems = () => {
        return groupedLogs.map(group => {
            const { header, items } = group;
            const changerName = header.changer_name || 'Unbekannt';

            return {
                color: header.action === 'DELETE' ? 'red' : header.action === 'INSERT' ? 'green' : 'blue',
                dot: header.action === 'UPDATE' ? <EditOutlined /> : header.action === 'INSERT' ? <PlusOutlined /> : <DeleteOutlined />,
                children: (
                    <Card
                        size="small"
                        variant="borderless"
                        style={{
                            background: token.colorFillAlter,
                            marginBottom: 12,
                            borderRadius: token.borderRadiusLG,
                            border: `1px solid ${token.colorBorderSecondary}`,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, borderBottom: `1px solid ${token.colorBorderSecondary}`, paddingBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Avatar size="small" style={{ backgroundColor: token.colorPrimary }}>{changerName.charAt(0)}</Avatar>
                                <Text strong>{changerName}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {dayjs(header.changed_at).format("DD.MM.YYYY HH:mm")}
                                </Text>
                            </div>
                            <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(header.changed_at).fromNow()}</Text>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {items.map((item, idx) => (
                                <div key={item.id}>
                                    {/* Subheadline: AREA */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <Tag color="cyan">{getAreaName(item.table_name)}</Tag>
                                        <Tag color={getActionColor(item.action)} style={{ fontSize: 10 }}>{item.action}</Tag>
                                    </div>

                                    {/* Changes */}
                                    <div style={{ paddingLeft: 4 }}>
                                        {renderLogContent(item)}
                                    </div>
                                    {idx < items.length - 1 && <div style={{ height: 1, background: token.colorBorderSecondary, marginTop: 16 }} />}
                                </div>
                            ))}
                        </div>
                    </Card>
                )
            };
        });
    };

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 0" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>Änderungshistorie</Title>
                <Button icon={<ReloadOutlined />} onClick={fetchLogs} loading={loading}>Aktualisieren</Button>
            </div>

            {loading && logs.length === 0 ? <Spin size="large" style={{ display: 'block', margin: '40px auto' }} /> : (
                <ConfigProvider theme={{ components: { Timeline: { tailColor: token.colorBorderSecondary } } }}>
                    <Timeline mode="left" items={getTimelineItems()} />
                </ConfigProvider>
            )}
            {!loading && logs.length === 0 && <Empty description="Keine Änderungen gefunden" />}
        </div>
    );
};
