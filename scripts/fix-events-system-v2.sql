-- Fix events system with proper slug support and database functions
-- Add missing columns to events table if they don't exist
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS banner_url text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS prerequisites text[];
ALTER TABLE events ADD COLUMN IF NOT EXISTS learning_outcomes text[];
ALTER TABLE events ADD COLUMN IF NOT EXISTS certificate_provided boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS recording_available boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS live_streaming boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}';
ALTER TABLE events ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;

-- Create index on slug for better performance
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);

-- Create function to generate slug from title and id
CREATE OR REPLACE FUNCTION generate_event_slug(title text, event_id uuid)
RETURNS text AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        )
    ) || '-' || substring(event_id::text, 1, 8);
END;
$$ LANGUAGE plpgsql;

-- Create function to get event by slug or ID
CREATE OR REPLACE FUNCTION get_event_by_slug_or_id(identifier text)
RETURNS TABLE(
    id uuid,
    title text,
    description text,
    image_url text,
    banner_url text,
    event_date timestamptz,
    end_date timestamptz,
    location text,
    event_type text,
    technologies text[],
    organizer text,
    max_participants integer,
    current_participants integer,
    registration_fee numeric,
    status text,
    registration_open boolean,
    registration_link text,
    event_mode text,
    tags text[],
    requirements text[],
    prerequisites text[],
    learning_outcomes text[],
    agenda text,
    speaker_info text,
    certificate_provided boolean,
    recording_available boolean,
    live_streaming boolean,
    social_links jsonb,
    featured boolean,
    slug text,
    created_by uuid,
    created_at timestamptz,
    updated_at timestamptz
) AS $$
BEGIN
    -- First try exact ID match
    RETURN QUERY
    SELECT e.* FROM events e WHERE e.id::text = identifier;
    
    IF FOUND THEN
        RETURN;
    END IF;
    
    -- Try slug match
    RETURN QUERY
    SELECT e.* FROM events e WHERE e.slug = identifier;
    
    IF FOUND THEN
        RETURN;
    END IF;
    
    -- Try partial ID match (first 8 characters)
    IF length(identifier) >= 8 THEN
        RETURN QUERY
        SELECT e.* FROM events e WHERE e.id::text ILIKE identifier || '%' LIMIT 1;
        
        IF FOUND THEN
            RETURN;
        END IF;
    END IF;
    
    -- Try title-based search as last resort
    RETURN QUERY
    SELECT e.* FROM events e 
    WHERE e.title ILIKE '%' || replace(identifier, '-', ' ') || '%' 
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate slug when inserting/updating events
CREATE OR REPLACE FUNCTION update_event_slug()
RETURNS trigger AS $$
BEGIN
    NEW.slug = generate_event_slug(NEW.title, NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_event_slug ON events;

-- Create trigger for slug generation
CREATE TRIGGER trigger_update_event_slug
    BEFORE INSERT OR UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_event_slug();

-- Update existing events to have slugs
UPDATE events 
SET slug = generate_event_slug(title, id) 
WHERE slug IS NULL;

-- Create function to increment event participants
CREATE OR REPLACE FUNCTION increment_event_participants(event_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE events 
    SET current_participants = current_participants + 1,
        updated_at = now()
    WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment hackathon participants
CREATE OR REPLACE FUNCTION increment_hackathon_participants(hackathon_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE hackathons 
    SET participants_count = participants_count + 1,
        updated_at = now()
    WHERE id = hackathon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure RLS is properly configured for events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Admins can manage all events" ON events;

-- Create comprehensive RLS policies for events
CREATE POLICY "Events are viewable by everyone" ON events
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON events
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own events" ON events
    FOR UPDATE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR email = 'sonishriyash@gmail.com')
        )
    );

CREATE POLICY "Users can delete own events" ON events
    FOR DELETE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR email = 'sonishriyash@gmail.com')
        )
    );
