"use client";

import React from "react";
import { Tabs, theme } from "antd";
import type { TabsProps } from "antd";

interface ProductDetailTabsProps {
    defaultActiveKey?: string;
    items: TabsProps[ 'items' ];
    onChange?: (key: string) => void;
}

export const ProductDetailTabs: React.FC<ProductDetailTabsProps> = ({ defaultActiveKey = "1", items, onChange }) => {
    const { token } = theme.useToken();

    return (
        <div style={{ marginTop: 24 }}>
            <Tabs
                defaultActiveKey={defaultActiveKey}
                onChange={onChange}
                items={items}
                type="card"
                size="middle"
                tabBarStyle={{
                    marginBottom: 24,
                    borderBottom: `1px solid ${token.colorBorderSecondary}`
                }}
            // Custom styles for a premium look could be injected via css or specific classNames if we had a css file.
            // For now, AntD Card type Tabs look quite decent, especially with the Theme customization we already have.
            />
        </div>
    );
};
