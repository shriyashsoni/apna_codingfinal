-- Enhanced Hackathon System with Team Management and Submissions

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS hackathon_submissions CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS hackathon_teams CASCADE;
DROP TABLE IF EXISTS hackathon_participants CASCADE;
DROP TABLE IF EXISTS hackathon_problem_statements CASCADE;

-- Update hackathons table to support both external and internal hackathons
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS hackathon_type VARCHAR(20) DEFAULT 'external' CHECK (hackathon_type IN ('external', 'apna_coding'));
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS platform_url TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS max_team_members INTEGER DEFAULT 5;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS min_team_members INTEGER DEFAULT 1;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS allow_individual BOOLEAN DEFAULT true;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS submissions_open BOOLEAN DEFAULT false;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS results_published BOOLEAN DEFAULT false;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS total_participants INTEGER DEFAULT 0;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS total_teams INTEGER DEFAULT 0;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS total_submissions INTEGER DEFAULT 0;

-- Problem Statements table
CREATE TABLE hackathon_problem_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    max_points INTEGER DEFAULT 100,
    resources TEXT[], -- Array of resource links
    constraints TEXT[], -- Array of constraints
    evaluation_criteria TEXT[], -- Array of evaluation criteria
    sample_input TEXT,
    sample_output TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table for Apna Coding hackathons
CREATE TABLE hackathon_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    team_name VARCHAR(255) NOT NULL,
    team_leader_id UUID REFERENCES users(id) ON DELETE CASCADE,
    invite_code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    current_members INTEGER DEFAULT 1,
    max_members INTEGER DEFAULT 5,
    is_full BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'disqualified')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hackathon_id, team_name)
);

-- Team Members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES hackathon_teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('leader', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'left', 'removed')),
    invited_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Enhanced Participants table
CREATE TABLE hackathon_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES hackathon_teams(id) ON DELETE SET NULL,
    participation_type VARCHAR(20) DEFAULT 'individual' CHECK (participation_type IN ('individual', 'team')),
    registration_status VARCHAR(20) DEFAULT 'registered' CHECK (registration_status IN ('registered', 'confirmed', 'cancelled', 'disqualified')),
    additional_info JSONB DEFAULT '{}',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hackathon_id, user_id)
);

-- Submissions table
CREATE TABLE hackathon_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    team_id UUID REFERENCES hackathon_teams(id) ON DELETE CASCADE,
    problem_statement_id UUID REFERENCES hackathon_problem_statements(id) ON DELETE SET NULL,
    submitted_by UUID REFERENCES users(id) ON DELETE CASCADE,
    project_title VARCHAR(500) NOT NULL,
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
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_hackathon_problem_statements_hackathon_id ON hackathon_problem_statements(hackathon_id);
CREATE INDEX idx_hackathon_teams_hackathon_id ON hackathon_teams(hackathon_id);
CREATE INDEX idx_hackathon_teams_invite_code ON hackathon_teams(invite_code);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_hackathon_participants_hackathon_id ON hackathon_participants(hackathon_id);
CREATE INDEX idx_hackathon_participants_user_id ON hackathon_participants(user_id);
CREATE INDEX idx_hackathon_submissions_hackathon_id ON hackathon_submissions(hackathon_id);
CREATE INDEX idx_hackathon_submissions_team_id ON hackathon_submissions(team_id);

-- Functions for team management
CREATE OR REPLACE FUNCTION generate_team_invite_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        code := upper(substring(md5(random()::text) from 1 for 8));
        SELECT EXISTS(SELECT 1 FROM hackathon_teams WHERE invite_code = code) INTO exists;
        IF NOT exists THEN
            EXIT;
        END IF;
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to update team member count
CREATE OR REPLACE FUNCTION update_team_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE hackathon_teams 
        SET current_members = (
            SELECT COUNT(*) FROM team_members 
            WHERE team_id = NEW.team_id AND status = 'active'
        ),
        is_full = (
            SELECT COUNT(*) FROM team_members 
            WHERE team_id = NEW.team_id AND status = 'active'
        ) >= max_members,
        updated_at = NOW()
        WHERE id = NEW.team_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE hackathon_teams 
        SET current_members = (
            SELECT COUNT(*) FROM team_members 
            WHERE team_id = NEW.team_id AND status = 'active'
        ),
        is_full = (
            SELECT COUNT(*) FROM team_members 
            WHERE team_id = NEW.team_id AND status = 'active'
        ) >= max_members,
        updated_at = NOW()
        WHERE id = NEW.team_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE hackathon_teams 
        SET current_members = (
            SELECT COUNT(*) FROM team_members 
            WHERE team_id = OLD.team_id AND status = 'active'
        ),
        is_full = (
            SELECT COUNT(*) FROM team_members 
            WHERE team_id = OLD.team_id AND status = 'active'
        ) >= max_members,
        updated_at = NOW()
        WHERE id = OLD.team_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update hackathon statistics
CREATE OR REPLACE FUNCTION update_hackathon_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        -- Update participants count
        UPDATE hackathons 
        SET total_participants = (
            SELECT COUNT(*) FROM hackathon_participants 
            WHERE hackathon_id = COALESCE(NEW.hackathon_id, OLD.hackathon_id)
            AND registration_status IN ('registered', 'confirmed')
        ),
        total_teams = (
            SELECT COUNT(*) FROM hackathon_teams 
            WHERE hackathon_id = COALESCE(NEW.hackathon_id, OLD.hackathon_id)
            AND status = 'active'
        ),
        total_submissions = (
            SELECT COUNT(*) FROM hackathon_submissions 
            WHERE hackathon_id = COALESCE(NEW.hackathon_id, OLD.hackathon_id)
            AND submission_status = 'submitted'
        ),
        updated_at = NOW()
        WHERE id = COALESCE(NEW.hackathon_id, OLD.hackathon_id);
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_team_member_count
    AFTER INSERT OR UPDATE OR DELETE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_team_member_count();

CREATE TRIGGER trigger_update_hackathon_stats_participants
    AFTER INSERT OR UPDATE OR DELETE ON hackathon_participants
    FOR EACH ROW EXECUTE FUNCTION update_hackathon_stats();

CREATE TRIGGER trigger_update_hackathon_stats_teams
    AFTER INSERT OR UPDATE OR DELETE ON hackathon_teams
    FOR EACH ROW EXECUTE FUNCTION update_hackathon_stats();

CREATE TRIGGER trigger_update_hackathon_stats_submissions
    AFTER INSERT OR UPDATE OR DELETE ON hackathon_submissions
    FOR EACH ROW EXECUTE FUNCTION update_hackathon_stats();

-- RLS Policies

-- Problem Statements policies
ALTER TABLE hackathon_problem_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view problem statements" ON hackathon_problem_statements
    FOR SELECT USING (true);

CREATE POLICY "Admins and organizers can manage problem statements" ON hackathon_problem_statements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.role = 'admin' OR 
                 EXISTS (SELECT 1 FROM organizer_roles WHERE user_id = auth.uid() AND role_name = 'hackathon_organizer' AND is_active = true))
        )
    );

-- Teams policies
ALTER TABLE hackathon_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teams" ON hackathon_teams
    FOR SELECT USING (true);

CREATE POLICY "Team leaders can update their teams" ON hackathon_teams
    FOR UPDATE USING (team_leader_id = auth.uid());

CREATE POLICY "Authenticated users can create teams" ON hackathon_teams
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND team_leader_id = auth.uid());

CREATE POLICY "Admins and organizers can manage all teams" ON hackathon_teams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.role = 'admin' OR 
                 EXISTS (SELECT 1 FROM organizer_roles WHERE user_id = auth.uid() AND role_name = 'hackathon_organizer' AND is_active = true))
        )
    );

-- Team Members policies
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team members" ON team_members
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own team membership" ON team_members
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Team leaders can manage their team members" ON team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hackathon_teams 
            WHERE hackathon_teams.id = team_members.team_id 
            AND hackathon_teams.team_leader_id = auth.uid()
        )
    );

CREATE POLICY "Admins and organizers can manage all team members" ON team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.role = 'admin' OR 
                 EXISTS (SELECT 1 FROM organizer_roles WHERE user_id = auth.uid() AND role_name = 'hackathon_organizer' AND is_active = true))
        )
    );

-- Participants policies
ALTER TABLE hackathon_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view participants" ON hackathon_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own participation" ON hackathon_participants
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins and organizers can manage all participants" ON hackathon_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.role = 'admin' OR 
                 EXISTS (SELECT 1 FROM organizer_roles WHERE user_id = auth.uid() AND role_name = 'hackathon_organizer' AND is_active = true))
        )
    );

-- Submissions policies
ALTER TABLE hackathon_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view their team submissions" ON hackathon_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_members 
            WHERE team_members.team_id = hackathon_submissions.team_id 
            AND team_members.user_id = auth.uid() 
            AND team_members.status = 'active'
        )
    );

CREATE POLICY "Team members can manage their team submissions" ON hackathon_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM team_members 
            WHERE team_members.team_id = hackathon_submissions.team_id 
            AND team_members.user_id = auth.uid() 
            AND team_members.status = 'active'
        )
    );

CREATE POLICY "Admins and organizers can manage all submissions" ON hackathon_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.role = 'admin' OR 
                 EXISTS (SELECT 1 FROM organizer_roles WHERE user_id = auth.uid() AND role_name = 'hackathon_organizer' AND is_active = true))
        )
    );

-- Update existing hackathons to set default type
UPDATE hackathons SET hackathon_type = 'external' WHERE hackathon_type IS NULL;

-- Create updated_at triggers for new tables
CREATE TRIGGER update_hackathon_problem_statements_updated_at BEFORE UPDATE ON hackathon_problem_statements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hackathon_teams_updated_at BEFORE UPDATE ON hackathon_teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hackathon_participants_updated_at BEFORE UPDATE ON hackathon_participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hackathon_submissions_updated_at BEFORE UPDATE ON hackathon_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
