-- Add missing columns to hackathons table
BEGIN;

-- Add created_by column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hackathons' AND column_name = 'created_by') THEN
        ALTER TABLE hackathons ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add slug column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hackathons' AND column_name = 'slug') THEN
        ALTER TABLE hackathons ADD COLUMN slug TEXT UNIQUE;
    END IF;
END $$;

-- Create index on created_by if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'hackathons' AND indexname = 'idx_hackathons_created_by') THEN
        CREATE INDEX idx_hackathons_created_by ON hackathons(created_by);
    END IF;
END $$;

-- Create index on slug if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'hackathons' AND indexname = 'idx_hackathons_slug') THEN
        CREATE INDEX idx_hackathons_slug ON hackathons(slug);
    END IF;
END $$;

-- Generate slugs for existing hackathons that don't have them
UPDATE hackathons 
SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL;

COMMIT;
