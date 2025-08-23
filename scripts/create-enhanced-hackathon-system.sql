-- Create enhanced hackathons table
CREATE TABLE IF NOT EXISTS enhanced_hackathons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(200) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255) NOT NULL,
    mode VARCHAR(20) CHECK (mode IN ('online', 'offline', 'hybrid')) DEFAULT 'hybrid',
    status VARCHAR(20) CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) DEFAULT 'upcoming',
    prize_pool VARCHAR(100) NOT NULL,
    max_team_size INTEGER,
    min_team_size INTEGER DEFAULT 1,
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'intermediate',
    organizer VARCHAR(255) NOT NULL,
    registration_link TEXT,
    whatsapp_link TEXT,
    image_url TEXT,
    banner_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    hackathon_type VARCHAR(20) CHECK (hackathon_type IN ('external', 'apna_coding')) DEFAULT 'apna_coding',
    submission_start TIMESTAMP WITH TIME ZONE,
    submission_end TIMESTAMP WITH TIME ZONE,
    team_formation_deadline TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER,
    entry_fee DECIMAL(10,2) DEFAULT 0,
    certificate_provided BOOLEAN DEFAULT TRUE,
    live_streaming BOOLEAN DEFAULT FALSE,
    recording_available BOOLEAN DEFAULT FALSE,
    technologies JSONB DEFAULT '[]'::jsonb,
    problem_statements JSONB DEFAULT '[]'::jsonb,
    partnerships JSONB DEFAULT '[]'::jsonb,
    participants_count INTEGER DEFAULT 0,
    slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create enhanced registrations table
CREATE TABLE IF NOT EXISTS enhanced_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hackathon_id UUID REFERENCES enhanced_hackathons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) CHECK (status IN ('registered', 'team_formed', 'submitted', 'cancelled')) DEFAULT 'registered',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hackathon_id, user_id)
);

-- Create enhanced teams table
CREATE TABLE IF NOT EXISTS enhanced_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    hackathon_id UUID REFERENCES enhanced_hackathons(id) ON DELETE CASCADE,
    leader_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invite_code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced team members table
CREATE TABLE IF NOT EXISTS enhanced_team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES enhanced_teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('leader', 'member')) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Create enhanced submissions table
CREATE TABLE IF NOT EXISTS enhanced_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES enhanced_teams(id) ON DELETE CASCADE,
    hackathon_id UUID REFERENCES enhanced_hackathons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    github_url TEXT,
    demo_url TEXT,
    video_url TEXT,
    presentation_url TEXT,
    additional_links JSONB DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, hackathon_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enhanced_hackathons_status ON enhanced_hackathons(status);
CREATE INDEX IF NOT EXISTS idx_enhanced_hackathons_featured ON enhanced_hackathons(featured);
CREATE INDEX IF NOT EXISTS idx_enhanced_hackathons_start_date ON enhanced_hackathons(start_date);
CREATE INDEX IF NOT EXISTS idx_enhanced_hackathons_slug ON enhanced_hackathons(slug);
CREATE INDEX IF NOT EXISTS idx_enhanced_registrations_hackathon ON enhanced_registrations(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_registrations_user ON enhanced_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_teams_hackathon ON enhanced_teams(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_teams_invite_code ON enhanced_teams(invite_code);
CREATE INDEX IF NOT EXISTS idx_enhanced_team_members_team ON enhanced_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_team_members_user ON enhanced_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_submissions_hackathon ON enhanced_submissions(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_submissions_team ON enhanced_submissions(team_id);

-- Create function to increment participant count
CREATE OR REPLACE FUNCTION increment_enhanced_hackathon_participants(hackathon_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE enhanced_hackathons 
    SET participants_count = participants_count + 1,
        updated_at = NOW()
    WHERE id = hackathon_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to decrement participant count
CREATE OR REPLACE FUNCTION decrement_enhanced_hackathon_participants(hackathon_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE enhanced_hackathons 
    SET participants_count = GREATEST(participants_count - 1, 0),
        updated_at = NOW()
    WHERE id = hackathon_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-generate slug
CREATE OR REPLACE FUNCTION generate_hackathon_slug()
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
DROP TRIGGER IF EXISTS trigger_generate_hackathon_slug ON enhanced_hackathons;
CREATE TRIGGER trigger_generate_hackathon_slug
    BEFORE INSERT ON enhanced_hackathons
    FOR EACH ROW
    EXECUTE FUNCTION generate_hackathon_slug();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating updated_at
CREATE TRIGGER trigger_enhanced_hackathons_updated_at
    BEFORE UPDATE ON enhanced_hackathons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_enhanced_registrations_updated_at
    BEFORE UPDATE ON enhanced_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_enhanced_teams_updated_at
    BEFORE UPDATE ON enhanced_teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_enhanced_submissions_updated_at
    BEFORE UPDATE ON enhanced_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE enhanced_hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enhanced_hackathons
CREATE POLICY "Enhanced hackathons are viewable by everyone" ON enhanced_hackathons
    FOR SELECT USING (true);

CREATE POLICY "Enhanced hackathons can be created by authenticated users" ON enhanced_hackathons
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enhanced hackathons can be updated by creator or admin" ON enhanced_hackathons
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Enhanced hackathons can be deleted by creator or admin" ON enhanced_hackathons
    FOR DELETE USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- RLS Policies for enhanced_registrations
CREATE POLICY "Registrations are viewable by participant and admins" ON enhanced_registrations
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Users can register themselves" ON enhanced_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" ON enhanced_registrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own registrations" ON enhanced_registrations
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for enhanced_teams
CREATE POLICY "Teams are viewable by members and admins" ON enhanced_teams
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM enhanced_team_members 
            WHERE enhanced_team_members.team_id = enhanced_teams.id 
            AND enhanced_team_members.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Teams can be created by registered users" ON enhanced_teams
    FOR INSERT WITH CHECK (
        auth.uid() = leader_id AND
        EXISTS (
            SELECT 1 FROM enhanced_registrations 
            WHERE enhanced_registrations.hackathon_id = enhanced_teams.hackathon_id 
            AND enhanced_registrations.user_id = auth.uid()
        )
    );

CREATE POLICY "Teams can be updated by team leader" ON enhanced_teams
    FOR UPDATE USING (auth.uid() = leader_id);

CREATE POLICY "Teams can be deleted by team leader" ON enhanced_teams
    FOR DELETE USING (auth.uid() = leader_id);

-- RLS Policies for enhanced_team_members
CREATE POLICY "Team members are viewable by team members and admins" ON enhanced_team_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM enhanced_team_members tm 
            WHERE tm.team_id = enhanced_team_members.team_id 
            AND tm.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Team members can be added by team leader or themselves" ON enhanced_team_members
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM enhanced_teams 
            WHERE enhanced_teams.id = enhanced_team_members.team_id 
            AND enhanced_teams.leader_id = auth.uid()
        )
    );

CREATE POLICY "Team members can be removed by team leader or themselves" ON enhanced_team_members
    FOR DELETE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM enhanced_teams 
            WHERE enhanced_teams.id = enhanced_team_members.team_id 
            AND enhanced_teams.leader_id = auth.uid()
        )
    );

-- RLS Policies for enhanced_submissions
CREATE POLICY "Submissions are viewable by team members and admins" ON enhanced_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM enhanced_team_members 
            WHERE enhanced_team_members.team_id = enhanced_submissions.team_id 
            AND enhanced_team_members.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Submissions can be created by team members" ON enhanced_submissions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM enhanced_team_members 
            WHERE enhanced_team_members.team_id = enhanced_submissions.team_id 
            AND enhanced_team_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Submissions can be updated by team members" ON enhanced_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM enhanced_team_members 
            WHERE enhanced_team_members.team_id = enhanced_submissions.team_id 
            AND enhanced_team_members.user_id = auth.uid()
        )
    );

-- Create storage bucket for hackathon images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hackathon-images', 'hackathon-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for hackathon images
CREATE POLICY "Hackathon images are publicly viewable" ON storage.objects
    FOR SELECT USING (bucket_id = 'hackathon-images');

CREATE POLICY "Authenticated users can upload hackathon images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'hackathon-images' AND 
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Users can update their own hackathon images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'hackathon-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own hackathon images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'hackathon-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );
