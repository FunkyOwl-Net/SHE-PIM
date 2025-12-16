"use client";

import React from "react";
import { Spin } from "antd";

export default function Loading() {
    return (
        <div style={{
            height: "100vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.5)" // Optional semi-transparent
        }}>
            <Spin size="large" tip="Lade Daten..." />
        </div>
    );
}
