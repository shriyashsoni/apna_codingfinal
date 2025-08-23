-- Enhanced Hackathon System Database Schema
-- This script creates all necessary tables, functions, and policies for the enhanced hackathon system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enhanced hackathons table
CREATE TABLE IF NOT EXISTS hackathons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    hackathon_type VARCHAR(20) NOT NULL CHECK (hackathon_type IN ('external', 'apna_coding')),
    platform_url TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255) NOT NULL,
    prize_pool VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    max_team_members INTEGER NOT NULL DEFAULT 5,
    min_team_members INTEGER NOT NULL DEFAULT 1,
    allow_individual BOOLEAN NOT NULL DEFAULT true,
    submissions_open BOOLEAN NOT NULL DEFAULT false,
    results_published BOOLEAN NOT NULL DEFAULT false,
    total_participants INTEGER NOT NULL DEFAULT 0,
    total_teams INTEGER NOT NULL DEFAULT 0,
    total_submissions INTEGER NOT NULL DEFAULT 0,
    technologies TEXT[] NOT NULL DEFAULT '{}',
    organizer VARCHAR(255) NOT NULL,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create problem statements table
CREATE TABLE IF NOT EXISTS hackathon_problem_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty_level VARCHAR(10) NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    max_points INTEGER NOT NULL DEFAULT 100,
    resources TEXT[] NOT NULL DEFAULT '{}',
    constraints TEXT[] NOT NULL DEFAULT '{}',
    evaluation_criteria TEXT[] NOT NULL DEFAULT '{}',
    sample_input TEXT,
    sample_output TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS hackathon_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
    team_name VARCHAR(255) NOT NULL,
    team_leader_id UUID NOT NULL REFERENCES auth.users(id),
    invite_code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    current_members INTEGER NOT NULL DEFAULT 1,
    max_members INTEGER NOT NULL DEFAULT 5,
    is_full BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'disqualified')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES hackathon_teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    role VARCHAR(10) NOT NULL CHECK (role IN ('leader', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'left', 'removed')),
    invited_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Create participants table
CREATE TABLE IF NOT EXISTS hackathon_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    team_id UUID REFERENCES hackathon_teams(id),
    participation_type VARCHAR(20) NOT NULL CHECK (participation_type IN ('individual', 'team')),
    registration_status VARCHAR(20) NOT NULL DEFAULT 'registered' CHECK (registration_status IN ('registered', 'confirmed', 'cancelled', 'disqualified')),
    additional_info JSONB DEFAULT '{}',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hackathon_id, user_id)
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS hackathon_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES hackathon_teams(id) ON DELETE CASCADE,
    problem_statement_id UUID REFERENCES hackathon_problem_statements(id),
    submitted_by UUID NOT NULL REFERENCES auth.users(id),
    project_title VARCHAR(255) NOT NULL,
    project_description TEXT NOT NULL,
    github_repository_url TEXT,
    live_demo_url TEXT,
    presentation_url TEXT,
    video_demo_url TEXT,
    documentation_url TEXT,
    technologies_used TEXT[] NOT NULL DEFAULT '{}',
    challenges_faced TEXT,
    future_improvements TEXT,
    submission_status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (submission_status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
    score INTEGER NOT NULL DEFAULT 0,
    feedback TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hackathons_type ON hackathons(hackathon_type);
CREATE INDEX IF NOT EXISTS idx_hackathons_status ON hackathons(status);
CREATE INDEX IF NOT EXISTS idx_hackathons_start_date ON hackathons(start_date);
CREATE INDEX IF NOT EXISTS idx_hackathon_teams_hackathon_id ON hackathon_teams(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_participants_hackathon_id ON hackathon_participants(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_participants_user_id ON hackathon_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_submissions_hackathon_id ON hackathon_submissions(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_submissions_team_id ON hackathon_submissions(team_id);

-- Function to update team member count
CREATE OR REPLACE FUNCTION update_team_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        UPDATE hackathon_teams 
        SET current_members = current_members + 1,
            is_full = (current_members + 1 >= max_members),
            updated_at = NOW()
        WHERE id = NEW.team_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'active' AND NEW.status = 'active' THEN
            UPDATE hackathon_teams 
            SET current_members = current_members + 1,
                is_full = (current_members + 1 >= max_members),
                updated_at = NOW()
            WHERE id = NEW.team_id;
        ELSIF OLD.status = 'active' AND NEW.status != 'active' THEN
            UPDATE hackathon_teams 
            SET current_members = GREATEST(current_members - 1, 0),
                is_full = false,
                updated_at = NOW()
            WHERE id = NEW.team_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
        UPDATE hackathon_teams 
        SET current_members = GREATEST(current_members - 1, 0),
            is_full = false,
            updated_at = NOW()
        WHERE id = OLD.team_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update hackathon statistics
CREATE OR REPLACE FUNCTION update_hackathon_statistics()
RETURNS TRIGGER AS $$
DECLARE
    hackathon_id_val UUID;
BEGIN
    -- Get hackathon_id based on the table
    IF TG_TABLE_NAME = 'hackathon_participants' THEN
        hackathon_id_val = COALESCE(NEW.hackathon_id, OLD.hackathon_id);
    ELSIF TG_TABLE_NAME = 'hackathon_teams' THEN
        hackathon_id_val = COALESCE(NEW.hackathon_id, OLD.hackathon_id);
    ELSIF TG_TABLE_NAME = 'hackathon_submissions' THEN
        hackathon_id_val = COALESCE(NEW.hackathon_id, OLD.hackathon_id);
    END IF;
    
    -- Update statistics
    UPDATE hackathons SET
        total_participants = (
            SELECT COUNT(*) FROM hackathon_participants 
            WHERE hackathon_id = hackathon_id_val AND registration_status = 'registered'
        ),
        total_teams = (
            SELECT COUNT(*) FROM hackathon_teams 
            WHERE hackathon_id = hackathon_id_val AND status = 'active'
        ),
        total_submissions = (
            SELECT COUNT(*) FROM hackathon_submissions 
            WHERE hackathon_id = hackathon_id_val AND submission_status IN ('submitted', 'under_review', 'approved')
        ),
        updated_at = NOW()
    WHERE id = hackathon_id_val;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_team_member_count ON team_members;
CREATE TRIGGER trigger_update_team_member_count
    AFTER INSERT OR UPDATE OR DELETE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_team_member_count();

DROP TRIGGER IF EXISTS trigger_update_hackathon_stats_participants ON hackathon_participants;
CREATE TRIGGER trigger_update_hackathon_stats_participants
    AFTER INSERT OR UPDATE OR DELETE ON hackathon_participants
    FOR EACH ROW EXECUTE FUNCTION update_hackathon_statistics();

DROP TRIGGER IF EXISTS trigger_update_hackathon_stats_teams ON hackathon_teams;
CREATE TRIGGER trigger_update_hackathon_stats_teams
    AFTER INSERT OR UPDATE OR DELETE ON hackathon_teams
    FOR EACH ROW EXECUTE FUNCTION update_hackathon_statistics();

DROP TRIGGER IF EXISTS trigger_update_hackathon_stats_submissions ON hackathon_submissions;
CREATE TRIGGER trigger_update_hackathon_stats_submissions
    AFTER INSERT OR UPDATE OR DELETE ON hackathon_submissions
    FOR EACH ROW EXECUTE FUNCTION update_hackathon_statistics();

-- Enable Row Level Security
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_problem_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hackathons
CREATE POLICY "Hackathons are viewable by everyone" ON hackathons FOR SELECT USING (true);
CREATE POLICY "Admins can manage hackathons" ON hackathons FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_permissions up
        WHERE up.user_id = auth.uid() 
        AND up.permission_type = 'hackathons'
        AND up.is_active = true
        AND (up.expires_at IS NULL OR up.expires_at > NOW())
    )
    OR
    EXISTS (
        SELECT 1 FROM organizer_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_type = 'hackathon_organizer'
        AND ur.is_active = true
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    )
);

-- RLS Policies for problem statements
CREATE POLICY "Problem statements are viewable by everyone" ON hackathon_problem_statements FOR SELECT USING (true);
CREATE POLICY "Admins can manage problem statements" ON hackathon_problem_statements FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_permissions up
        WHERE up.user_id = auth.uid() 
        AND up.permission_type = 'hackathons'
        AND up.is_active = true
        AND (up.expires_at IS NULL OR up.expires_at > NOW())
    )
    OR
    EXISTS (
        SELECT 1 FROM organizer_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_type = 'hackathon_organizer'
        AND ur.is_active = true
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    )
);

-- RLS Policies for teams
CREATE POLICY "Teams are viewable by everyone" ON hackathon_teams FOR SELECT USING (true);
CREATE POLICY "Users can create teams" ON hackathon_teams FOR INSERT WITH CHECK (auth.uid() = team_leader_id);
CREATE POLICY "Team leaders can update their teams" ON hackathon_teams FOR UPDATE USING (auth.uid() = team_leader_id);
CREATE POLICY "Admins can manage all teams" ON hackathon_teams FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_permissions up
        WHERE up.user_id = auth.uid() 
        AND up.permission_type = 'hackathons'
        AND up.is_active = true
        AND (up.expires_at IS NULL OR up.expires_at > NOW())
    )
);

-- RLS Policies for team members
CREATE POLICY "Team members are viewable by everyone" ON team_members FOR SELECT USING (true);
CREATE POLICY "Users can join teams" ON team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their membership" ON team_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Team leaders can manage their team members" ON team_members FOR ALL USING (
    EXISTS (
        SELECT 1 FROM hackathon_teams ht
        WHERE ht.id = team_id AND ht.team_leader_id = auth.uid()
    )
);

-- RLS Policies for participants
CREATE POLICY "Participants are viewable by everyone" ON hackathon_participants FOR SELECT USING (true);
CREATE POLICY "Users can register themselves" ON hackathon_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their registration" ON hackathon_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage participants" ON hackathon_participants FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_permissions up
        WHERE up.user_id = auth.uid() 
        AND up.permission_type = 'hackathons'
        AND up.is_active = true
        AND (up.expires_at IS NULL OR up.expires_at > NOW())
    )
);

-- RLS Policies for submissions
CREATE POLICY "Submissions are viewable by everyone" ON hackathon_submissions FOR SELECT USING (true);
CREATE POLICY "Team members can create submissions" ON hackathon_submissions FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = hackathon_submissions.team_id 
        AND tm.user_id = auth.uid() 
        AND tm.status = 'active'
    )
);
CREATE POLICY "Submitters can update their submissions" ON hackathon_submissions FOR UPDATE USING (auth.uid() = submitted_by);
CREATE POLICY "Admins can manage submissions" ON hackathon_submissions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_permissions up
        WHERE up.user_id = auth.uid() 
        AND up.permission_type = 'hackathons'
        AND up.is_active = true
        AND (up.expires_at IS NULL OR up.expires_at > NOW())
    )
);

-- Insert sample data
INSERT INTO hackathons (
    title, description, hackathon_type, start_date, end_date, location, prize_pool, 
    status, organizer, technologies, submissions_open
) VALUES 
(
    'Apna Coding Winter Hackathon 2024',
    'Build innovative solutions using modern web technologies. Create applications that solve real-world problems and showcase your coding skills.',
    'apna_coding',
    '2024-02-15 09:00:00+00',
    '2024-02-17 18:00:00+00',
    'Online',
    '$10,000',
    'upcoming',
    'Apna Coding Team',
    ARRAY['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'MongoDB', 'PostgreSQL'],
    true
),
(
    'AI/ML Innovation Challenge',
    'Develop cutting-edge AI and Machine Learning solutions. Focus on practical applications that can make a difference in various industries.',
    'apna_coding',
    '2024-03-01 10:00:00+00',
    '2024-03-03 20:00:00+00',
    'Hybrid - Delhi NCR',
    '$15,000',
    'upcoming',
    'Apna Coding Team',
    ARRAY['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Jupyter', 'Docker'],
    false
),
(
    'DevPost Global Hackathon',
    'Join developers worldwide in this massive coding competition. Build anything you can imagine with any technology stack.',
    'external',
    '2024-02-20 00:00:00+00',
    '2024-02-25 23:59:00+00',
    'Global - Online',
    '$50,000',
    'upcoming',
    'DevPost',
    ARRAY['Any Technology'],
    false
)
ON CONFLICT DO NOTHING;

-- Insert sample problem statements
INSERT INTO hackathon_problem_statements (
    hackathon_id, title, description, difficulty_level, max_points, resources, constraints, evaluation_criteria
) 
SELECT 
    h.id,
    'E-Commerce Platform Challenge',
    'Build a full-stack e-commerce platform with user authentication, product catalog, shopping cart, and payment integration. The platform should be responsive and user-friendly.',
    'medium',
    500,
    ARRAY['React Documentation', 'Node.js Guides', 'Payment Gateway APIs', 'Database Design Patterns'],
    ARRAY['Must use modern web technologies', 'Responsive design required', 'Include user authentication', 'Implement at least 3 main features'],
    ARRAY['Code Quality (25%)', 'Functionality (30%)', 'User Experience (25%)', 'Innovation (20%)']
FROM hackathons h 
WHERE h.title = 'Apna Coding Winter Hackathon 2024'
ON CONFLICT DO NOTHING;

INSERT INTO hackathon_problem_statements (
    hackathon_id, title, description, difficulty_level, max_points, resources, constraints, evaluation_criteria
) 
SELECT 
    h.id,
    'Predictive Analytics Dashboard',
    'Create an AI-powered dashboard that can predict trends and provide insights from large datasets. Include data visualization and real-time updates.',
    'hard',
    750,
    ARRAY['Machine Learning Libraries', 'Data Visualization Tools', 'Real-time Data Processing', 'Dashboard Frameworks'],
    ARRAY['Must use AI/ML algorithms', 'Real-time data processing', 'Interactive visualizations', 'Scalable architecture'],
    ARRAY['Algorithm Accuracy (30%)', 'Data Processing (25%)', 'Visualization Quality (25%)', 'Technical Implementation (20%)']
FROM hackathons h 
WHERE h.title = 'AI/ML Innovation Challenge'
ON CONFLICT DO NOTHING;

COMMIT;
