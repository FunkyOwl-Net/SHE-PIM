import { List, Typography } from "antd";
import { useProductSelect } from "@/hooks/useProductSelect";

export const SimpleProductList = () => {
    const { data, isLoading } = useProductSelect();

    return (
        <List
            loading={isLoading}
            header={<div>Verfügbare Artikelnummern</div>}
            bordered
            dataSource={data?.data || []}
            renderItem={(item) => (
                <List.Item>
                    <Typography.Text strong>{item.item_no}</Typography.Text>
                    <span style={{ marginLeft: 10, color: "#999" }}>({item.name})</span>
                </List.Item>
            )}
        />
    );
};