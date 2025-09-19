-- Fix Events System v2
-- This script fixes the events system with automatic slug generation for SEO-friendly URLs

-- Create function for automatic slug generation
CREATE OR REPLACE FUNCTION generate_slug(title TEXT, id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        )
    ) || '-' || substring(id::text, 1, 8);
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically generate slug for events
CREATE OR REPLACE FUNCTION public.handle_event_slug()
RETURNS trigger AS $$
BEGIN
    -- Generate slug if not provided
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.title, NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic slug generation on events
DROP TRIGGER IF EXISTS on_event_slug_generation ON events;
CREATE TRIGGER on_event_slug_generation
    BEFORE INSERT OR UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION public.handle_event_slug();

-- Create database function for efficient event lookup
CREATE OR REPLACE FUNCTION get_event_by_slug_or_id(identifier TEXT)
RETURNS TABLE(
    id UUID,
    title TEXT,
    description TEXT,
    image_url TEXT,
    banner_url TEXT,
    event_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    location TEXT,
    event_type TEXT,
    technologies TEXT[],
    organizer TEXT,
    max_participants INTEGER,
    current_participants INTEGER,
    registration_fee NUMERIC,
    status TEXT,
    registration_open BOOLEAN,
    registration_link TEXT,
    event_mode TEXT,
    tags TEXT[],
    requirements TEXT[],
    prerequisites TEXT[],
    learning_outcomes TEXT[],
    agenda TEXT,
    speaker_info TEXT,
    certificate_provided BOOLEAN,
    recording_available BOOLEAN,
    live_streaming BOOLEAN,
    social_links JSONB,
    featured BOOLEAN,
    slug TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Try exact ID match first
    RETURN QUERY
    SELECT e.* FROM events e WHERE e.id::text = identifier;
    
    -- If no results, try slug match
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT e.* FROM events e WHERE e.slug = identifier;
    END IF;
    
    -- If still no results, try partial ID match (for shortened UUIDs)
    IF NOT FOUND AND length(identifier) >= 8 THEN
        RETURN QUERY
        SELECT e.* FROM events e WHERE e.id::text ILIKE identifier || '%' LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to increment event participants
CREATE OR REPLACE FUNCTION increment_event_participants(event_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE events 
    SET 
        current_participants = current_participants + 1,
        updated_at = NOW()
    WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to increment hackathon participants
CREATE OR REPLACE FUNCTION increment_hackathon_participants(hackathon_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE hackathons 
    SET 
        participants_count = participants_count + 1,
        updated_at = NOW()
    WHERE id = hackathon_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_slug(TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_event_slug() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_event_by_slug_or_id(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_event_participants(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_hackathon_participants(UUID) TO anon, authenticated;

-- Update existing events to have slugs
UPDATE events 
SET slug = generate_slug(title, id) 
WHERE slug IS NULL OR slug = '';

-- Update existing hackathons to have slugs
UPDATE hackathons 
SET slug = generate_slug(title, id) 
WHERE slug IS NULL OR slug = '';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

CREATE INDEX IF NOT EXISTS idx_hackathons_slug ON hackathons(slug);
CREATE INDEX IF NOT EXISTS idx_hackathons_status ON hackathons(status);
CREATE INDEX IF NOT EXISTS idx_hackathons_featured ON hackathons(featured);
CREATE INDEX IF NOT EXISTS idx_hackathons_start_date ON hackathons(start_date);
