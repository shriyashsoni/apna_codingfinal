-- Add slug column to hackathons table for SEO-friendly URLs
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_hackathons_slug ON hackathons(slug);

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_hackathon_slug(title TEXT, hackathon_id UUID)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from title
    base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    -- Add hackathon ID to make it unique
    final_slug := base_slug || '-' || substring(hackathon_id::text from 1 for 8);
    
    -- Check if slug exists and make it unique if needed
    WHILE EXISTS (SELECT 1 FROM hackathons WHERE slug = final_slug AND id != hackathon_id) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || substring(hackathon_id::text from 1 for 8) || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically generate slug on insert/update
CREATE OR REPLACE FUNCTION set_hackathon_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_hackathon_slug(NEW.title, NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_set_hackathon_slug ON hackathons;
CREATE TRIGGER trigger_set_hackathon_slug
    BEFORE INSERT OR UPDATE ON hackathons
    FOR EACH ROW
    EXECUTE FUNCTION set_hackathon_slug();

-- Update existing hackathons with slugs
UPDATE hackathons 
SET slug = generate_hackathon_slug(title, id) 
WHERE slug IS NULL OR slug = '';
