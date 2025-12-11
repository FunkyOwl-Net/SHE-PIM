"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Input, Form, InputNumber } from 'antd';

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string | string[];
    title: string;
    inputType: 'number' | 'text';
    record: any;
    index: number;
    children: React.ReactNode;
}

export const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    dataIndex,
    title,
    inputType,
    children,
    record,
    ...restProps
}) => {
    const inputNode = inputType === 'number' ? <InputNumber style={{ width: '100%' }} /> : <Input />;

    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={[ record.id, ...(Array.isArray(dataIndex) ? dataIndex : [ dataIndex ]) ]}
                    style={{ margin: 0 }}
                    rules={[ { required: false } ]} // Hier ggf. Validation aus Template laden
                >
                    {inputNode}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};