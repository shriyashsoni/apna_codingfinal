-- Create hackathon automation system
-- This script sets up automatic slug generation for hackathons

-- Add slug column to hackathons table if it doesn't exist
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Create function to generate slug from title and id
CREATE OR REPLACE FUNCTION generate_hackathon_slug(title TEXT, hackathon_id UUID)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from title
    base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    
    -- Add first 8 characters of UUID for uniqueness
    final_slug := base_slug || '-' || substring(hackathon_id::text from 1 for 8);
    
    -- Ensure uniqueness by checking if slug already exists
    WHILE EXISTS (SELECT 1 FROM hackathons WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || substring(hackathon_id::text from 1 for 8) || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to automatically generate slug
CREATE OR REPLACE FUNCTION auto_generate_hackathon_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate slug if it's not provided or is empty
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_hackathon_slug(NEW.title, NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new hackathons
DROP TRIGGER IF EXISTS hackathon_slug_trigger ON hackathons;
CREATE TRIGGER hackathon_slug_trigger
    BEFORE INSERT OR UPDATE ON hackathons
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_hackathon_slug();

-- Update existing hackathons without slugs
UPDATE hackathons 
SET slug = generate_hackathon_slug(title, id)
WHERE slug IS NULL OR slug = '';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_hackathons_slug ON hackathons(slug);

-- Add hackathon registrations table for tracking user registrations
CREATE TABLE IF NOT EXISTS hackathon_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'registered',
    team_name VARCHAR(255),
    team_members JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hackathon_id, user_id)
);

-- Create indexes for hackathon registrations
CREATE INDEX IF NOT EXISTS idx_hackathon_registrations_hackathon_id ON hackathon_registrations(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_registrations_user_id ON hackathon_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_registrations_status ON hackathon_registrations(status);

-- Create function to update participant count
CREATE OR REPLACE FUNCTION update_hackathon_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update participant count for the affected hackathon
    IF TG_OP = 'INSERT' THEN
        UPDATE hackathons 
        SET participants_count = participants_count + 1
        WHERE id = NEW.hackathon_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE hackathons 
        SET participants_count = GREATEST(0, participants_count - 1)
        WHERE id = OLD.hackathon_id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update participant count
DROP TRIGGER IF EXISTS update_participant_count_trigger ON hackathon_registrations;
CREATE TRIGGER update_participant_count_trigger
    AFTER INSERT OR DELETE ON hackathon_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_hackathon_participant_count();

-- Create function to get hackathon by slug
CREATE OR REPLACE FUNCTION get_hackathon_by_slug(hackathon_slug TEXT)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    mode VARCHAR(50),
    status VARCHAR(50),
    prize_pool VARCHAR(255),
    participants_count INTEGER,
    max_team_size INTEGER,
    difficulty VARCHAR(50),
    technologies TEXT[],
    organizer VARCHAR(255),
    partnerships TEXT[],
    registration_link VARCHAR(500),
    whatsapp_link VARCHAR(500),
    image_url VARCHAR(500),
    featured BOOLEAN,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    slug VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT h.* FROM hackathons h WHERE h.slug = hackathon_slug;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON hackathon_registrations TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
