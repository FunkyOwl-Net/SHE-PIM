"use client";

import React, { useState, useEffect } from "react";
import { Card, Image, Skeleton, Tooltip, Input, Button, Badge } from "antd";
import { DeleteOutlined, StarOutlined, StarFilled, DownloadOutlined } from "@ant-design/icons";
import { IProductImage } from "@/interfaces/productdata";
import { useSecureImage } from "@/hooks/useSecureImage";

interface ProductImageProps {
    image: IProductImage;
    onDelete?: (id: string, path: string) => void;
    onSetPrimary?: (id: string) => void;
    onUpdateDescription?: (id: string, description: string) => void;
}

export const ProductImage: React.FC<ProductImageProps> = ({
    image,
    onDelete,
    onSetPrimary,
    onUpdateDescription
}) => {
    const { imageUrl, fullUrl, loading } = useSecureImage(image.file_path);
    // Lokaler State für die Beschreibung, damit das Tippen flüssig ist
    const [ desc, setDesc ] = useState(image.description || "");

    // Wenn sich die Props ändern (z.B. nach Refresh), State updaten
    useEffect(() => {
        setDesc(image.description || "");
    }, [ image.description ]);

    const handleDownload = () => {
        if (imageUrl) {
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = image.file_name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <Badge.Ribbon
            text="Hauptbild"
            color="gold"
            style={{ display: image.is_primary ? "block" : "none" }}
        >
            <Card
                hoverable
                style={{ width: 200, borderColor: image.is_primary ? "#faad14" : undefined }}
                styles={{ body: { padding: 8 } }}
                cover={
                    <div style={{
                        height: 160,
                        overflow: "hidden",
                        background: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative"
                    }}>
                        {loading ? (
                            <Skeleton.Image active />
                        ) : imageUrl ? (
                            <Image
                                alt={image.file_name}
                                src={imageUrl || ""}
                                preview={{ src: fullUrl || imageUrl || "" }}
                                style={{ height: "100%", width: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            <div style={{ color: "#999", fontSize: 12 }}>Bild fehlt</div>
                        )}
                    </div>
                }
                actions={[
                    <Tooltip title="Als Hauptbild setzen" key="star">
                        <Button
                            type="text"
                            icon={image.is_primary ? <StarFilled style={{ color: "#faad14" }} /> : <StarOutlined />}
                            onClick={() => onSetPrimary?.(image.id)}
                        />
                    </Tooltip>,
                    <Tooltip title="Download" key="download">
                        <Button type="text" icon={<DownloadOutlined />} onClick={handleDownload} />
                    </Tooltip>,
                    <Tooltip title="Löschen" key="delete">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => onDelete?.(image.id, image.file_path)}
                        />
                    </Tooltip>
                ]}
            >
                {/* Beschreibung bearbeiten */}
                <div style={{ marginTop: 5 }}>
                    <Input.TextArea
                        placeholder="Bildbeschreibung..."
                        autoSize={{ minRows: 1, maxRows: 2 }}
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        onBlur={() => {
                            // Speichern erst beim Verlassen des Feldes (Performance)
                            if (desc !== image.description) {
                                onUpdateDescription?.(image.id, desc);
                            }
                        }}
                        style={{ fontSize: 12, resize: 'none' }}
                        variant="borderless"
                    />
                </div>
            </Card>
        </Badge.Ribbon>
    );
};