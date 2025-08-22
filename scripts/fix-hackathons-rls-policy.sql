-- Fix RLS policies for hackathons table to allow admin operations
BEGIN;

-- Drop existing policies
DROP POLICY IF EXISTS "hackathons_select_policy" ON hackathons;
DROP POLICY IF EXISTS "hackathons_insert_policy" ON hackathons;
DROP POLICY IF EXISTS "hackathons_update_policy" ON hackathons;
DROP POLICY IF EXISTS "hackathons_delete_policy" ON hackathons;

-- Create permissive policies for all operations
CREATE POLICY "hackathons_select_policy" ON hackathons FOR SELECT USING (true);
CREATE POLICY "hackathons_insert_policy" ON hackathons FOR INSERT WITH CHECK (true);
CREATE POLICY "hackathons_update_policy" ON hackathons FOR UPDATE USING (true);
CREATE POLICY "hackathons_delete_policy" ON hackathons FOR DELETE USING (true);

-- Ensure RLS is enabled
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;

COMMIT;
