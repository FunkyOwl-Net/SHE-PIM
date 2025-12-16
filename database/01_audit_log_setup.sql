-- 1. Create the audit_logs table in she_pim schema
CREATE TABLE IF NOT EXISTS she_pim.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    record_id UUID NOT NULL,          -- The ID of the changed record (product_id, etc.)
    table_name TEXT NOT NULL,         -- e.g. 'products', 'specifications'
    action TEXT NOT NULL,             -- 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB,                   -- Previous state
    new_data JSONB,                   -- New state
    changed_by UUID DEFAULT auth.uid(), -- The user who made the change
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create the Trigger Function
CREATE OR REPLACE FUNCTION she_pim.log_product_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO she_pim.audit_logs (record_id, table_name, action, new_data, changed_by)
        VALUES (
            NEW.id,
            TG_TABLE_NAME,
            'INSERT',
            to_jsonb(NEW),
            auth.uid()
        );
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Only log if actual data changed (ignoring updated_at if you want, but good to log all)
        IF NEW IS DISTINCT FROM OLD THEN
            INSERT INTO she_pim.audit_logs (record_id, table_name, action, old_data, new_data, changed_by)
            VALUES (
                NEW.id,
                TG_TABLE_NAME,
                'UPDATE',
                to_jsonb(OLD),
                to_jsonb(NEW),
                auth.uid()
            );
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO she_pim.audit_logs (record_id, table_name, action, old_data, changed_by)
        VALUES (
            OLD.id,
            TG_TABLE_NAME,
            'DELETE',
            to_jsonb(OLD),
            auth.uid()
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Apply Triggers to relevant tables in 'product' schema

-- Main Products Table (Assuming table name is 'products' or 'main' - adjust if needed)
-- DROP TRIGGER IF EXISTS audit_log_products ON product.products;
-- CREATE TRIGGER audit_log_products
-- AFTER INSERT OR UPDATE OR DELETE ON product.products
-- FOR EACH ROW EXECUTE FUNCTION she_pim.log_product_changes();

-- Specifications
DROP TRIGGER IF EXISTS audit_log_specifications ON product.specifications;
CREATE TRIGGER audit_log_specifications
AFTER INSERT OR UPDATE OR DELETE ON product.specifications
FOR EACH ROW EXECUTE FUNCTION she_pim.log_product_changes();

-- Features
DROP TRIGGER IF EXISTS audit_log_features ON product.features;
CREATE TRIGGER audit_log_features
AFTER INSERT OR UPDATE OR DELETE ON product.features
FOR EACH ROW EXECUTE FUNCTION she_pim.log_product_changes();

-- Tags
DROP TRIGGER IF EXISTS audit_log_tags ON product.tags;
CREATE TRIGGER audit_log_tags
AFTER INSERT OR UPDATE OR DELETE ON product.tags
FOR EACH ROW EXECUTE FUNCTION she_pim.log_product_changes();

-- Logistics
DROP TRIGGER IF EXISTS audit_log_logistics ON product.logistics;
CREATE TRIGGER audit_log_logistics
AFTER INSERT OR UPDATE OR DELETE ON product.logistics
FOR EACH ROW EXECUTE FUNCTION she_pim.log_product_changes();

-- Product Images
DROP TRIGGER IF EXISTS audit_log_product_images ON product.product_images;
CREATE TRIGGER audit_log_product_images
AFTER INSERT OR UPDATE OR DELETE ON product.product_images
FOR EACH ROW EXECUTE FUNCTION she_pim.log_product_changes();

-- Content Images
DROP TRIGGER IF EXISTS audit_log_content_images ON product.content_images;
CREATE TRIGGER audit_log_content_images
AFTER INSERT OR UPDATE OR DELETE ON product.content_images
FOR EACH ROW EXECUTE FUNCTION she_pim.log_product_changes();

-- Product Videos
DROP TRIGGER IF EXISTS audit_log_product_videos ON product.product_videos;
CREATE TRIGGER audit_log_product_videos
AFTER INSERT OR UPDATE OR DELETE ON product.product_videos
FOR EACH ROW EXECUTE FUNCTION she_pim.log_product_changes();

-- Product Downloads
DROP TRIGGER IF EXISTS audit_log_product_downloads ON product.product_downloads;
CREATE TRIGGER audit_log_product_downloads
AFTER INSERT OR UPDATE OR DELETE ON product.product_downloads
FOR EACH ROW EXECUTE FUNCTION she_pim.log_product_changes();
