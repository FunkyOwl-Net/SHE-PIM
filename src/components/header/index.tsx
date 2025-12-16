"use client";

import { useGetIdentity } from "@refinedev/core";
import { useContext } from "react";
import { ColorModeContext } from "@/contexts/color-mode";
import { Layout, Space, Typography, Avatar, theme, Switch } from "antd";
import { UserOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { useToken } = theme;

export const Header = () => {
  const { token } = useToken();
  const { data: user } = useGetIdentity();
  const { mode, setMode } = useContext(ColorModeContext);

  return (
    <Layout.Header
      style={{
        // Background handled by globals.css

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
        <Switch
          checkedChildren={<SunOutlined />}
          unCheckedChildren={<MoonOutlined />}
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          checked={mode === "light"}
        />
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