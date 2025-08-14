-- Remove all existing fake/sample community partners data
DELETE FROM community_partners;

-- Reset the table to be completely empty
-- Only real partners added through admin portal will appear
