-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('workshop', 'webinar', 'conference', 'meetup', 'bootcamp', 'seminar')),
    technologies TEXT[] DEFAULT '{}',
    organizer VARCHAR(255) NOT NULL,
    max_participants INTEGER NOT NULL DEFAULT 50,
    current_participants INTEGER NOT NULL DEFAULT 0,
    registration_fee DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    registration_open BOOLEAN DEFAULT true,
    registration_link TEXT,
    event_mode VARCHAR(20) NOT NULL DEFAULT 'online' CHECK (event_mode IN ('online', 'offline', 'hybrid')),
    tags TEXT[] DEFAULT '{}',
    requirements TEXT[] DEFAULT '{}',
    agenda TEXT,
    speaker_info TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
    additional_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (true);

CREATE POLICY "Admins can insert events" ON events FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND (users.role = 'admin' OR users.email = 'sonishriyash@gmail.com')
    )
    OR
    EXISTS (
        SELECT 1 FROM organizer_roles 
        WHERE organizer_roles.user_id = auth.uid() 
        AND organizer_roles.role_name = 'event_organizer'
        AND organizer_roles.is_active = true
    )
);

CREATE POLICY "Admins and event creators can update events" ON events FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND (users.role = 'admin' OR users.email = 'sonishriyash@gmail.com')
    )
    OR
    (created_by = auth.uid() AND EXISTS (
        SELECT 1 FROM organizer_roles 
        WHERE organizer_roles.user_id = auth.uid() 
        AND organizer_roles.role_name = 'event_organizer'
        AND organizer_roles.is_active = true
    ))
);

CREATE POLICY "Admins and event creators can delete events" ON events FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND (users.role = 'admin' OR users.email = 'sonishriyash@gmail.com')
    )
    OR
    (created_by = auth.uid() AND EXISTS (
        SELECT 1 FROM organizer_roles 
        WHERE organizer_roles.user_id = auth.uid() 
        AND organizer_roles.role_name = 'event_organizer'
        AND organizer_roles.is_active = true
    ))
);

-- RLS Policies for event registrations
CREATE POLICY "Users can view their own registrations" ON event_registrations FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all registrations" ON event_registrations FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND (users.role = 'admin' OR users.email = 'sonishriyash@gmail.com')
    )
);

CREATE POLICY "Users can register for events" ON event_registrations FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own registrations" ON event_registrations FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own registrations" ON event_registrations FOR DELETE 
USING (user_id = auth.uid());

-- Function to increment event participants
CREATE OR REPLACE FUNCTION increment_event_participants(event_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE events 
    SET current_participants = current_participants + 1,
        updated_at = NOW()
    WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement event participants
CREATE OR REPLACE FUNCTION decrement_event_participants(event_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE events 
    SET current_participants = GREATEST(current_participants - 1, 0),
        updated_at = NOW()
    WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update event participants on registration
CREATE OR REPLACE FUNCTION update_event_participants()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM increment_event_participants(NEW.event_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM decrement_event_participants(OLD.event_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_event_participants ON event_registrations;
CREATE TRIGGER trigger_update_event_participants
    AFTER INSERT OR DELETE ON event_registrations
    FOR EACH ROW EXECUTE FUNCTION update_event_participants();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON event_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
