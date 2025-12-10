"use client";

import React, { useEffect, useState, useRef } from "react";
import { Input, Tag, Tooltip, theme, Space } from "antd";
import { PlusOutlined, SettingOutlined, TagsOutlined } from "@ant-design/icons";
import type { InputRef } from 'antd';

// Eine Liste schöner Presets von Ant Design
const TAG_COLORS = [ 'magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple' ];

// Helper: Berechnet eine Farbe basierend auf dem Text (damit "Sale" immer rot ist)
const getColor = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % TAG_COLORS.length);
    return TAG_COLORS[ index ];
};

interface TagsSectionProps {
    value?: string[];
    onChange?: (tags: string[]) => void;
}

export const TagsSection: React.FC<TagsSectionProps> = ({ value = [], onChange }) => {
    const { token } = theme.useToken();
    const [ inputValue, setInputValue ] = useState("");

    // States für das Editieren
    const [ editInputIndex, setEditInputIndex ] = useState(-1);
    const [ editInputValue, setEditInputValue ] = useState("");
    const inputRef = useRef<InputRef>(null);
    const editInputRef = useRef<InputRef>(null);

    // Focus beim Editieren setzen
    useEffect(() => {
        if (editInputIndex !== -1) {
            editInputRef.current?.focus();
        }
    }, [ editInputIndex ]);

    // Tag Hinzufügen (Enter oder Komma)
    const handleInputConfirm = () => {
        if (inputValue && !value.includes(inputValue)) {
            // Split bei Komma, falls jemand "tag1, tag2" reinpastet
            const newTags = inputValue.split(',').map(t => t.trim()).filter(t => t);
            // Duplikate vermeiden und hinzufügen
            const uniqueNewTags = newTags.filter(t => !value.includes(t));
            onChange?.([ ...value, ...uniqueNewTags ]);
        }
        setInputValue("");
    };

    // Sonderbehandlung für Komma während des Tippens
    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ',') {
            e.preventDefault();
            handleInputConfirm();
        }
    };

    // Tag Löschen
    const handleClose = (removedTag: string) => {
        const newTags = value.filter((tag) => tag !== removedTag);
        onChange?.(newTags);
    };

    // Editieren Starten
    const handleEditClick = (index: number, tag: string, e: React.MouseEvent) => {
        e.preventDefault();
        setEditInputIndex(index);
        setEditInputValue(tag);
    };

    // Editieren Abschließen
    const handleEditConfirm = () => {
        const newTags = [ ...value ];
        newTags[ editInputIndex ] = editInputValue;
        onChange?.(newTags);
        setEditInputIndex(-1);
    };

    return (
        <div style={{
            padding: 16,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
            border: `1px solid ${token.colorBorderSecondary}`
        }}>
            <h4 style={{ marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TagsOutlined /> Produkt Tags
            </h4>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {value.map((tag, index) => {
                    if (editInputIndex === index) {
                        return (
                            <Input
                                ref={editInputRef}
                                key={tag}
                                size="small"
                                style={{ width: 100, verticalAlign: 'top' }}
                                value={editInputValue}
                                onChange={(e) => setEditInputValue(e.target.value)}
                                onBlur={handleEditConfirm}
                                onPressEnter={handleEditConfirm}
                            />
                        );
                    }
                    const isLongTag = tag.length > 20;
                    const tagElem = (
                        <Tag
                            key={tag}
                            closable
                            onClose={() => handleClose(tag)}
                            color={getColor(tag)}
                            style={{
                                userSelect: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '4px 10px',
                                fontSize: 13
                            }}
                        >
                            <span>{isLongTag ? `${tag.slice(0, 20)}...` : tag}</span>

                            {/* Zahnrad zum Bearbeiten */}
                            <Tooltip title="Tag bearbeiten">
                                <SettingOutlined
                                    style={{ cursor: 'pointer', marginLeft: 4, opacity: 0.7 }}
                                    onClick={(e) => handleEditClick(index, tag, e)}
                                />
                            </Tooltip>
                        </Tag>
                    );
                    return isLongTag ? (
                        <Tooltip title={tag} key={tag}>{tagElem}</Tooltip>
                    ) : (
                        tagElem
                    );
                })}
            </div>

            <Input
                ref={inputRef}
                type="text"
                size="middle"
                style={{ width: '100%' }}
                placeholder="Neue Tags eingeben (mit Komma oder Enter bestätigen)..."
                value={inputValue}
                onChange={(e) => {
                    // Verhindern, dass das Komma im Input landet
                    if (!e.target.value.endsWith(',')) setInputValue(e.target.value);
                }}
                onKeyUp={handleKeyUp} // Fängt das Komma ab
                onPressEnter={handleInputConfirm}
                prefix={<PlusOutlined style={{ color: token.colorTextDescription }} />}
            />
        </div>
    );
};