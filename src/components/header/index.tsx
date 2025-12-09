"use client";

import { useGetIdentity } from "@refinedev/core";
import { Layout, Space, Typography, Avatar, theme } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { useToken } = theme;

export const Header = () => {
  const { token } = useToken();
  // Hier nutzen wir die Daten aus Schritt 1
  const { data: user } = useGetIdentity();

  return (
    <Layout.Header
      style={{
        backgroundColor: token.colorBgElevated, // Passt sich Light/Dark Mode an
        display: "flex",
        justifyContent: "flex-end", // Rechtsbündig
        alignItems: "center",
        padding: "0 24px",
        height: "64px",
        position: "sticky",
        top: 0,
        zIndex: 1,
      }}
    >
      <Space size="middle">
        {user?.name && (
          <Text strong style={{ color: token.colorTextHeading }}>
            {user.name}
          </Text>
        )}
        <Avatar src={user?.avatar} icon={<UserOutlined />} alt={user?.name} />
      </Space>
    </Layout.Header>
  );
};