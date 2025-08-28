-- Create events table to replace courses
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('workshop', 'webinar', 'conference', 'meetup', 'bootcamp', 'seminar')),
  technologies TEXT[] DEFAULT '{}',
  organizer TEXT NOT NULL,
  max_participants INTEGER DEFAULT 100,
  current_participants INTEGER DEFAULT 0,
  registration_fee DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  registration_open BOOLEAN DEFAULT true,
  registration_link TEXT,
  event_mode TEXT NOT NULL DEFAULT 'online' CHECK (event_mode IN ('online', 'offline', 'hybrid')),
  tags TEXT[] DEFAULT '{}',
  requirements TEXT[],
  agenda TEXT,
  speaker_info TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert events" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own events" ON events
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admins can update any event" ON events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can delete their own events" ON events
  FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete any event" ON events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
  additional_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create indexes for event registrations
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);

-- Enable RLS for event registrations
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for event registrations
CREATE POLICY "Users can view their own registrations" ON event_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can register for events" ON event_registrations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" ON event_registrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own registrations" ON event_registrations
  FOR DELETE USING (auth.uid() = user_id);

-- Function to increment event participants
CREATE OR REPLACE FUNCTION increment_event_participants(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE events 
  SET current_participants = current_participants + 1,
      updated_at = NOW()
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement event participants
CREATE OR REPLACE FUNCTION decrement_event_participants(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE events 
  SET current_participants = GREATEST(current_participants - 1, 0),
      updated_at = NOW()
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Drop courses table if it exists (be careful with this in production)
-- DROP TABLE IF EXISTS courses CASCADE;
