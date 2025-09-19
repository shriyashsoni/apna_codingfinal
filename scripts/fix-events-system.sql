-- Fix events system for better functionality
-- This script ensures proper event management and registration

-- Ensure events table has all required columns
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS prerequisites TEXT[],
ADD COLUMN IF NOT EXISTS learning_outcomes TEXT[],
ADD COLUMN IF NOT EXISTS certificate_provided BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS recording_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS live_streaming BOOLEAN DEFAULT false;

-- Create function to generate event slug
CREATE OR REPLACE FUNCTION generate_event_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9\s]', '', 'g'));
        NEW.slug := regexp_replace(NEW.slug, '\s+', '-', 'g');
        NEW.slug := NEW.slug || '-' || substring(NEW.id::text from 1 for 8);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating slug
DROP TRIGGER IF EXISTS trigger_generate_event_slug ON events;
CREATE TRIGGER trigger_generate_event_slug
    BEFORE INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION generate_event_slug();

-- Update existing events to have slugs
UPDATE events 
SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g')) || '-' || substring(id::text from 1 for 8)
WHERE slug IS NULL OR slug = '';

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON events(slug);

-- Create function to get event by slug or ID
CREATE OR REPLACE FUNCTION get_event_by_slug_or_id(identifier TEXT)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    image_url TEXT,
    banner_url TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    event_type VARCHAR(50),
    technologies TEXT[],
    organizer VARCHAR(255),
    max_participants INTEGER,
    current_participants INTEGER,
    registration_fee DECIMAL(10,2),
    status VARCHAR(20),
    registration_open BOOLEAN,
    registration_link TEXT,
    event_mode VARCHAR(20),
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
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- First try exact slug match
    RETURN QUERY
    SELECT e.* FROM events e WHERE e.slug = identifier;
    
    -- If no results, try ID match
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT e.* FROM events e WHERE e.id::text = identifier;
    END IF;
    
    -- If still no results, try partial ID match
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT e.* FROM events e WHERE e.id::text ILIKE identifier || '%' LIMIT 1;
    END IF;
    
    -- If still no results, try title search
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT e.* FROM events e 
        WHERE e.title ILIKE '%' || replace(identifier, '-', ' ') || '%' 
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for events
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
DROP POLICY IF EXISTS "Event creators can update their events" ON events;
DROP POLICY IF EXISTS "Admins can manage all events" ON events;

-- Create comprehensive RLS policies for events
CREATE POLICY "Events are viewable by everyone" ON events
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON events
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND (
            EXISTS (
                SELECT 1 FROM users 
                WHERE users.id = auth.uid() 
                AND (users.role = 'admin' OR users.email = 'sonishriyash@gmail.com')
            ) OR
            EXISTS (
                SELECT 1 FROM organizer_roles 
                WHERE organizer_roles.user_id = auth.uid() 
                AND organizer_roles.role_name = 'event_organizer'
                AND organizer_roles.is_active = true
            )
        )
    );

CREATE POLICY "Event creators and admins can update events" ON events
    FOR UPDATE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.role = 'admin' OR users.email = 'sonishriyash@gmail.com')
        )
    );

CREATE POLICY "Event creators and admins can delete events" ON events
    FOR DELETE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.role = 'admin' OR users.email = 'sonishriyash@gmail.com')
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_registration_open ON events(registration_open);

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_event_by_slug_or_id(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_event_by_slug_or_id(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION generate_event_slug() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_event_slug() TO service_role;
