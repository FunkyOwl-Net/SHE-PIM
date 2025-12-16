-- 1. Fix Permissions for Schema usage
GRANT USAGE ON SCHEMA she_pim TO postgres, anon, authenticated, service_role;

-- 2. Grant Table Access
GRANT ALL ON ALL TABLES IN SCHEMA she_pim TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA she_pim TO postgres, anon, authenticated, service_role;

-- 3. Enable RLS and Add Policy
ALTER TABLE she_pim.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON she_pim.audit_logs;

CREATE POLICY "Enable read access for authenticated users"
ON she_pim.audit_logs
FOR SELECT
TO authenticated
USING (true); -- Or (auth.role() = 'authenticated')

-- 4. FIX: Enable Trigger for Main Product Table (was missing/commented out)
-- Ensure the generic trigger function exists (it should from 01 script, but good to ensure uniqueness if needed)
-- We assume she_pim.log_product_changes() exists.

DROP TRIGGER IF EXISTS audit_log_products ON product."productData";
CREATE TRIGGER audit_log_products
AFTER INSERT OR UPDATE OR DELETE ON product."productData"
FOR EACH ROW EXECUTE FUNCTION she_pim.log_product_changes();
