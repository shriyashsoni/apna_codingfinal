-- Fix events system with proper slug support and database functions
-- This script ensures proper event management and SEO-friendly URLs

-- Add missing columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS event_mode TEXT DEFAULT 'offline' CHECK (event_mode IN ('online', 'offline', 'hybrid')),
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS requirements TEXT[],
ADD COLUMN IF NOT EXISTS prerequisites TEXT[],
ADD COLUMN IF NOT EXISTS learning_outcomes TEXT[],
ADD COLUMN IF NOT EXISTS agenda TEXT,
ADD COLUMN IF NOT EXISTS speaker_info TEXT,
ADD COLUMN IF NOT EXISTS certificate_provided BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recording_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS live_streaming BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_event_slug(title TEXT, event_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
BEGIN
  -- Create base slug from title
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Add first 8 characters of UUID for uniqueness
  final_slug := base_slug || '-' || substring(event_id::text from 1 for 8);
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION auto_generate_event_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate slug if it's not provided or if title changed
  IF NEW.slug IS NULL OR (TG_OP = 'UPDATE' AND OLD.title != NEW.title) THEN
    NEW.slug := generate_event_slug(NEW.title, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto slug generation
DROP TRIGGER IF EXISTS trigger_auto_generate_event_slug ON events;
CREATE TRIGGER trigger_auto_generate_event_slug
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION auto_generate_event_slug();

-- Update existing events to have slugs
UPDATE events 
SET slug = generate_event_slug(title, id)
WHERE slug IS NULL;

-- Create function to get event by slug or ID
CREATE OR REPLACE FUNCTION get_event_by_slug_or_id(identifier TEXT)
RETURNS TABLE (
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
  RETURN QUERY
  SELECT 
    e.id, e.title, e.description, e.image_url, e.banner_url,
    e.event_date, e.end_date, e.location, e.event_type, e.technologies,
    e.organizer, e.max_participants, e.current_participants, e.registration_fee,
    e.status, e.registration_open, e.registration_link, e.event_mode,
    e.tags, e.requirements, e.prerequisites, e.learning_outcomes,
    e.agenda, e.speaker_info, e.certificate_provided, e.recording_available,
    e.live_streaming, e.social_links, e.featured, e.slug,
    e.created_by, e.created_at, e.updated_at
  FROM events e
  WHERE 
    e.id::text = identifier 
    OR e.slug = identifier 
    OR e.id::text ILIKE identifier || '%'
  ORDER BY 
    CASE 
      WHEN e.id::text = identifier THEN 1
      WHEN e.slug = identifier THEN 2
      ELSE 3
    END
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment event participants
CREATE OR REPLACE FUNCTION increment_event_participants(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE events 
  SET 
    current_participants = COALESCE(current_participants, 0) + 1,
    updated_at = NOW()
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to decrement event participants
CREATE OR REPLACE FUNCTION decrement_event_participants(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE events 
  SET 
    current_participants = GREATEST(COALESCE(current_participants, 0) - 1, 0),
    updated_at = NOW()
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for events
DROP POLICY IF EXISTS "Anyone can view published events" ON events;
DROP POLICY IF EXISTS "Authenticated users can view all events" ON events;
DROP POLICY IF EXISTS "Organizers can manage their events" ON events;
DROP POLICY IF EXISTS "Admins can manage all events" ON events;

CREATE POLICY "Anyone can view published events" ON events
  FOR SELECT USING (status IN ('upcoming', 'ongoing'));

CREATE POLICY "Authenticated users can view all events" ON events
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Organizers can manage their events" ON events
  FOR ALL USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM organizer_roles 
      WHERE user_id = auth.uid() 
      AND role_name = 'event_organizer' 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can manage all events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'sonishriyash@gmail.com')
    )
  );

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_event_slug(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_event_by_slug_or_id(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_event_participants(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_event_participants(UUID) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
