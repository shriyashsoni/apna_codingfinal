-- Add created_by column to hackathons table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'hackathons' AND column_name = 'created_by') THEN
        ALTER TABLE hackathons ADD COLUMN created_by UUID REFERENCES auth.users(id);
        CREATE INDEX IF NOT EXISTS idx_hackathons_created_by ON hackathons(created_by);
    END IF;
END $$;

-- Add slug column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'hackathons' AND column_name = 'slug') THEN
        ALTER TABLE hackathons ADD COLUMN slug TEXT;
        CREATE INDEX IF NOT EXISTS idx_hackathons_slug ON hackathons(slug);
    END IF;
END $$;

-- Update existing hackathons to have slugs if they don't have them
UPDATE hackathons 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9 -]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL OR slug = '';
