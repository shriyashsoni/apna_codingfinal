-- Enhanced Hackathon System Database Schema

-- Create hackathons table with image support
DROP TABLE IF EXISTS hackathons CASCADE;
CREATE TABLE hackathons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT NOT NULL,
    hackathon_type VARCHAR(20) NOT NULL CHECK (hackathon_type IN ('external', 'apna_coding')),
    platform_url TEXT,
    image_url TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255) NOT NULL,
    prize_pool VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    max_team_members INTEGER DEFAULT 5,
    min_team_members INTEGER DEFAULT 1,
    allow_individual BOOLEAN DEFAULT true,
    submissions_open BOOLEAN DEFAULT false,
    results_published BOOLEAN DEFAULT false,
    total_participants INTEGER DEFAULT 0,
    total_teams INTEGER DEFAULT 0,
    total_submissions INTEGER DEFAULT 0,
    technologies TEXT[] DEFAULT '{}',
    organizer VARCHAR(255) NOT NULL,
    featured BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hackathon_problem_statements table
CREATE TABLE IF NOT EXISTS hackathon_problem_statements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty_level VARCHAR(10) NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    max_points INTEGER DEFAULT 100,
    resources TEXT[] DEFAULT '{}',
    constraints TEXT[] DEFAULT '{}',
    evaluation_criteria TEXT[] DEFAULT '{}',
    sample_input TEXT,
    sample_output TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hackathon_partnerships table
CREATE TABLE IF NOT EXISTS hackathon_partnerships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    partner_name VARCHAR(255) NOT NULL,
    partner_logo_url TEXT,
    partner_website TEXT,
    partnership_type VARCHAR(20) NOT NULL CHECK (partnership_type IN ('sponsor', 'organizer', 'supporter', 'media')),
    contribution_amount VARCHAR(100),
    benefits TEXT[] DEFAULT '{}',
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hackathon_teams table
CREATE TABLE IF NOT EXISTS hackathon_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    team_name VARCHAR(255) NOT NULL,
    team_leader_id UUID REFERENCES auth.users(id),
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    current_members INTEGER DEFAULT 1,
    max_members INTEGER DEFAULT 5,
    is_full BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'disqualified')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES hackathon_teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    role VARCHAR(20) NOT NULL CHECK (role IN ('leader', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'left', 'removed')),
    invited_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Create hackathon_participants table
CREATE TABLE IF NOT EXISTS hackathon_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    team_id UUID REFERENCES hackathon_teams(id),
    participation_type VARCHAR(20) NOT NULL CHECK (participation_type IN ('individual', 'team')),
    registration_status VARCHAR(20) DEFAULT 'registered' CHECK (registration_status IN ('registered', 'confirmed', 'cancelled', 'disqualified')),
    additional_info JSONB DEFAULT '{}',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hackathon_id, user_id)
);

-- Create hackathon_submissions table
CREATE TABLE IF NOT EXISTS hackathon_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    team_id UUID REFERENCES hackathon_teams(id),
    problem_statement_id UUID REFERENCES hackathon_problem_statements(id),
    submitted_by UUID REFERENCES auth.users(id),
    project_title VARCHAR(255) NOT NULL,
    project_description TEXT NOT NULL,
    github_repository_url TEXT,
    live_demo_url TEXT,
    presentation_url TEXT,
    video_demo_url TEXT,
    documentation_url TEXT,
    technologies_used TEXT[] DEFAULT '{}',
    challenges_faced TEXT,
    future_improvements TEXT,
    submission_status VARCHAR(20) DEFAULT 'draft' CHECK (submission_status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
    score INTEGER DEFAULT 0,
    feedback TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hackathons_status ON hackathons(status);
CREATE INDEX IF NOT EXISTS idx_hackathons_type ON hackathons(hackathon_type);
CREATE INDEX IF NOT EXISTS idx_hackathons_start_date ON hackathons(start_date);
CREATE INDEX IF NOT EXISTS idx_hackathons_featured ON hackathons(featured);
CREATE INDEX IF NOT EXISTS idx_hackathon_teams_hackathon_id ON hackathon_teams(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_participants_hackathon_id ON hackathon_participants(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_participants_user_id ON hackathon_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_submissions_hackathon_id ON hackathon_submissions(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_submissions_team_id ON hackathon_submissions(team_id);

-- Create storage bucket for hackathon images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hackathon-images', 'hackathon-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for hackathon images
CREATE POLICY "Anyone can view hackathon images" ON storage.objects
FOR SELECT USING (bucket_id = 'hackathon-images');

CREATE POLICY "Authenticated users can upload hackathon images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'hackathon-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own hackathon images" ON storage.objects
FOR UPDATE USING (bucket_id = 'hackathon-images' AND auth.role() = 'authenticated');

-- Enable RLS on all tables
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_problem_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hackathons
CREATE POLICY "Anyone can view hackathons" ON hackathons FOR SELECT USING (true);
CREATE POLICY "Admins and organizers can manage hackathons" ON hackathons FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_permissions 
        WHERE user_id = auth.uid() 
        AND permission_type IN ('admin', 'hackathon_organizer')
        AND is_active = true
    )
);

-- RLS Policies for problem statements
CREATE POLICY "Anyone can view problem statements" ON hackathon_problem_statements FOR SELECT USING (true);
CREATE POLICY "Admins and organizers can manage problem statements" ON hackathon_problem_statements FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_permissions 
        WHERE user_id = auth.uid() 
        AND permission_type IN ('admin', 'hackathon_organizer')
        AND is_active = true
    )
);

-- RLS Policies for partnerships
CREATE POLICY "Anyone can view partnerships" ON hackathon_partnerships FOR SELECT USING (true);
CREATE POLICY "Admins and organizers can manage partnerships" ON hackathon_partnerships FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_permissions 
        WHERE user_id = auth.uid() 
        AND permission_type IN ('admin', 'hackathon_organizer')
        AND is_active = true
    )
);

-- RLS Policies for teams
CREATE POLICY "Anyone can view teams" ON hackathon_teams FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create teams" ON hackathon_teams FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Team leaders can update their teams" ON hackathon_teams FOR UPDATE USING (team_leader_id = auth.uid());
CREATE POLICY "Admins can manage all teams" ON hackathon_teams FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_permissions 
        WHERE user_id = auth.uid() 
        AND permission_type = 'admin'
        AND is_active = true
    )
);

-- RLS Policies for team members
CREATE POLICY "Anyone can view team members" ON team_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join teams" ON team_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own membership" ON team_members FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Team leaders can manage their team members" ON team_members FOR ALL USING (
    EXISTS (
        SELECT 1 FROM hackathon_teams 
        WHERE id = team_members.team_id 
        AND team_leader_id = auth.uid()
    )
);

-- RLS Policies for participants
CREATE POLICY "Anyone can view participants" ON hackathon_participants FOR SELECT USING (true);
CREATE POLICY "Authenticated users can register" ON hackathon_participants FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own participation" ON hackathon_participants FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all participants" ON hackathon_participants FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_permissions 
        WHERE user_id = auth.uid() 
        AND permission_type = 'admin'
        AND is_active = true
    )
);

-- RLS Policies for submissions
CREATE POLICY "Anyone can view submissions" ON hackathon_submissions FOR SELECT USING (true);
CREATE POLICY "Team members can create submissions" ON hackathon_submissions FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM team_members 
        WHERE team_id = hackathon_submissions.team_id 
        AND user_id = auth.uid() 
        AND status = 'active'
    )
);
CREATE POLICY "Team members can update their submissions" ON hackathon_submissions FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM team_members 
        WHERE team_id = hackathon_submissions.team_id 
        AND user_id = auth.uid() 
        AND status = 'active'
    )
);
CREATE POLICY "Admins can manage all submissions" ON hackathon_submissions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_permissions 
        WHERE user_id = auth.uid() 
        AND permission_type = 'admin'
        AND is_active = true
    )
);

-- Create triggers to update statistics
CREATE OR REPLACE FUNCTION update_hackathon_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update participant count
    UPDATE hackathons 
    SET total_participants = (
        SELECT COUNT(*) FROM hackathon_participants 
        WHERE hackathon_id = COALESCE(NEW.hackathon_id, OLD.hackathon_id)
        AND registration_status IN ('registered', 'confirmed')
    )
    WHERE id = COALESCE(NEW.hackathon_id, OLD.hackathon_id);
    
    -- Update team count
    UPDATE hackathons 
    SET total_teams = (
        SELECT COUNT(*) FROM hackathon_teams 
        WHERE hackathon_id = COALESCE(NEW.hackathon_id, OLD.hackathon_id)
        AND status = 'active'
    )
    WHERE id = COALESCE(NEW.hackathon_id, OLD.hackathon_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_hackathon_submission_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update submission count
    UPDATE hackathons 
    SET total_submissions = (
        SELECT COUNT(*) FROM hackathon_submissions 
        WHERE hackathon_id = COALESCE(NEW.hackathon_id, OLD.hackathon_id)
        AND submission_status = 'submitted'
    )
    WHERE id = COALESCE(NEW.hackathon_id, OLD.hackathon_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_hackathon_stats_participants ON hackathon_participants;
CREATE TRIGGER trigger_update_hackathon_stats_participants
    AFTER INSERT OR UPDATE OR DELETE ON hackathon_participants
    FOR EACH ROW EXECUTE FUNCTION update_hackathon_stats();

DROP TRIGGER IF EXISTS trigger_update_hackathon_stats_teams ON hackathon_teams;
CREATE TRIGGER trigger_update_hackathon_stats_teams
    AFTER INSERT OR UPDATE OR DELETE ON hackathon_teams
    FOR EACH ROW EXECUTE FUNCTION update_hackathon_stats();

DROP TRIGGER IF EXISTS trigger_update_hackathon_submission_stats ON hackathon_submissions;
CREATE TRIGGER trigger_update_hackathon_submission_stats
    AFTER INSERT OR UPDATE OR DELETE ON hackathon_submissions
    FOR EACH ROW EXECUTE FUNCTION update_hackathon_submission_stats();

-- Function to update team member count
CREATE OR REPLACE FUNCTION update_team_member_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update current_members count
    UPDATE hackathon_teams 
    SET current_members = (
        SELECT COUNT(*) FROM team_members 
        WHERE team_id = COALESCE(NEW.team_id, OLD.team_id)
        AND status = 'active'
    ),
    is_full = (
        SELECT COUNT(*) FROM team_members 
        WHERE team_id = COALESCE(NEW.team_id, OLD.team_id)
        AND status = 'active'
    ) >= max_members
    WHERE id = COALESCE(NEW.team_id, OLD.team_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for team member count
DROP TRIGGER IF EXISTS trigger_update_team_member_count ON team_members;
CREATE TRIGGER trigger_update_team_member_count
    AFTER INSERT OR UPDATE OR DELETE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_team_member_count();

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_hackathon_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
        NEW.slug := trim(both '-' from NEW.slug);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for slug generation
DROP TRIGGER IF EXISTS trigger_generate_hackathon_slug ON hackathons;
CREATE TRIGGER trigger_generate_hackathon_slug
    BEFORE INSERT OR UPDATE ON hackathons
    FOR EACH ROW EXECUTE FUNCTION generate_hackathon_slug();
