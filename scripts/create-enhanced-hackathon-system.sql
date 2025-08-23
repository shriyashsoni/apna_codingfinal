-- Enhanced Hackathon System Database Schema
-- This script creates all necessary tables, functions, and policies for the enhanced hackathon system

-- Drop existing tables if they exist (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS hackathon_submissions CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS hackathon_teams CASCADE;
DROP TABLE IF EXISTS hackathon_participants CASCADE;
DROP TABLE IF EXISTS hackathon_problem_statements CASCADE;

-- Create hackathon_problem_statements table
CREATE TABLE hackathon_problem_statements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    max_points INTEGER DEFAULT 100,
    resources TEXT[] DEFAULT '{}',
    constraints TEXT[] DEFAULT '{}',
    evaluation_criteria TEXT[] DEFAULT '{}',
    sample_input TEXT,
    sample_output TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hackathon_teams table
CREATE TABLE hackathon_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    team_name TEXT NOT NULL,
    team_leader_id UUID REFERENCES users(id) ON DELETE CASCADE,
    invite_code TEXT UNIQUE NOT NULL,
    description TEXT,
    current_members INTEGER DEFAULT 1,
    max_members INTEGER DEFAULT 5,
    is_full BOOLEAN DEFAULT FALSE,
    status TEXT CHECK (status IN ('active', 'inactive', 'disqualified')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES hackathon_teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('leader', 'member')) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT CHECK (status IN ('pending', 'active', 'left', 'removed')) DEFAULT 'active',
    invited_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Create hackathon_participants table
CREATE TABLE hackathon_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES hackathon_teams(id) ON DELETE SET NULL,
    participation_type TEXT CHECK (participation_type IN ('individual', 'team')) DEFAULT 'team',
    registration_status TEXT CHECK (registration_status IN ('registered', 'confirmed', 'cancelled', 'disqualified')) DEFAULT 'registered',
    additional_info JSONB DEFAULT '{}',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hackathon_id, user_id)
);

-- Create hackathon_submissions table
CREATE TABLE hackathon_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    team_id UUID REFERENCES hackathon_teams(id) ON DELETE CASCADE,
    problem_statement_id UUID REFERENCES hackathon_problem_statements(id) ON DELETE SET NULL,
    submitted_by UUID REFERENCES users(id) ON DELETE CASCADE,
    project_title TEXT NOT NULL,
    project_description TEXT NOT NULL,
    github_repository_url TEXT,
    live_demo_url TEXT,
    presentation_url TEXT,
    video_demo_url TEXT,
    documentation_url TEXT,
    technologies_used TEXT[] DEFAULT '{}',
    challenges_faced TEXT,
    future_improvements TEXT,
    submission_status TEXT CHECK (submission_status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')) DEFAULT 'draft',
    score INTEGER DEFAULT 0,
    feedback TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to existing hackathons table
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS hackathon_type TEXT CHECK (hackathon_type IN ('external', 'apna_coding')) DEFAULT 'external';
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS platform_url TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS max_team_members INTEGER DEFAULT 5;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS min_team_members INTEGER DEFAULT 1;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS allow_individual BOOLEAN DEFAULT TRUE;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS submissions_open BOOLEAN DEFAULT FALSE;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS results_published BOOLEAN DEFAULT FALSE;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS total_participants INTEGER DEFAULT 0;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS total_teams INTEGER DEFAULT 0;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS total_submissions INTEGER DEFAULT 0;

-- Create function to generate team invite codes
CREATE OR REPLACE FUNCTION generate_team_invite_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_check INTEGER;
BEGIN
    LOOP
        -- Generate a random 8-character code
        code := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Check if code already exists
        SELECT COUNT(*) INTO exists_check FROM hackathon_teams WHERE invite_code = code;
        
        -- If code doesn't exist, return it
        IF exists_check = 0 THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to update team member count
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
        IF OLD.status = 'active' AND NEW.status != 'active' THEN
            UPDATE hackathon_teams 
            SET current_members = current_members - 1,
                is_full = FALSE,
                updated_at = NOW()
            WHERE id = NEW.team_id;
        ELSIF OLD.status != 'active' AND NEW.status = 'active' THEN
            UPDATE hackathon_teams 
            SET current_members = current_members + 1,
                is_full = (current_members + 1 >= max_members),
                updated_at = NOW()
            WHERE id = NEW.team_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
        UPDATE hackathon_teams 
        SET current_members = current_members - 1,
            is_full = FALSE,
            updated_at = NOW()
        WHERE id = OLD.team_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create function to update hackathon statistics
CREATE OR REPLACE FUNCTION update_hackathon_statistics()
RETURNS TRIGGER AS $$
DECLARE
    hackathon_id_val UUID;
BEGIN
    -- Get hackathon_id based on the table
    IF TG_TABLE_NAME = 'hackathon_participants' THEN
        hackathon_id_val := COALESCE(NEW.hackathon_id, OLD.hackathon_id);
    ELSIF TG_TABLE_NAME = 'hackathon_teams' THEN
        hackathon_id_val := COALESCE(NEW.hackathon_id, OLD.hackathon_id);
    ELSIF TG_TABLE_NAME = 'hackathon_submissions' THEN
        hackathon_id_val := COALESCE(NEW.hackathon_id, OLD.hackathon_id);
    END IF;
    
    -- Update hackathon statistics
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
            WHERE hackathon_id = hackathon_id_val AND submission_status = 'submitted'
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hackathon_problem_statements_hackathon_id ON hackathon_problem_statements(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_teams_hackathon_id ON hackathon_teams(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_teams_invite_code ON hackathon_teams(invite_code);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_participants_hackathon_id ON hackathon_participants(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_participants_user_id ON hackathon_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_submissions_hackathon_id ON hackathon_submissions(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_submissions_team_id ON hackathon_submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_hackathons_type ON hackathons(hackathon_type);

-- Enable Row Level Security
ALTER TABLE hackathon_problem_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Problem Statements: Everyone can read, only admins/organizers can write
DROP POLICY IF EXISTS "Everyone can view problem statements" ON hackathon_problem_statements;
CREATE POLICY "Everyone can view problem statements" ON hackathon_problem_statements
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins and organizers can manage problem statements" ON hackathon_problem_statements;
CREATE POLICY "Admins and organizers can manage problem statements" ON hackathon_problem_statements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.role = 'admin' OR EXISTS (
                SELECT 1 FROM organizer_roles 
                WHERE organizer_roles.user_id = auth.uid() 
                AND organizer_roles.is_active = true
            ))
        )
    );

-- Teams: Everyone can read, authenticated users can create/join
DROP POLICY IF EXISTS "Everyone can view teams" ON hackathon_teams;
CREATE POLICY "Everyone can view teams" ON hackathon_teams
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create teams" ON hackathon_teams;
CREATE POLICY "Authenticated users can create teams" ON hackathon_teams
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Team leaders can update their teams" ON hackathon_teams;
CREATE POLICY "Team leaders can update their teams" ON hackathon_teams
    FOR UPDATE USING (team_leader_id = auth.uid());

-- Team Members: Everyone can read, authenticated users can join
DROP POLICY IF EXISTS "Everyone can view team members" ON team_members;
CREATE POLICY "Everyone can view team members" ON team_members
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can join teams" ON team_members;
CREATE POLICY "Authenticated users can join teams" ON team_members
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own membership" ON team_members;
CREATE POLICY "Users can update their own membership" ON team_members
    FOR UPDATE USING (user_id = auth.uid());

-- Participants: Everyone can read, authenticated users can register
DROP POLICY IF EXISTS "Everyone can view participants" ON hackathon_participants;
CREATE POLICY "Everyone can view participants" ON hackathon_participants
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can register" ON hackathon_participants;
CREATE POLICY "Authenticated users can register" ON hackathon_participants
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own participation" ON hackathon_participants;
CREATE POLICY "Users can update their own participation" ON hackathon_participants
    FOR UPDATE USING (user_id = auth.uid());

-- Submissions: Team members can manage their submissions
DROP POLICY IF EXISTS "Everyone can view submissions" ON hackathon_submissions;
CREATE POLICY "Everyone can view submissions" ON hackathon_submissions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Team members can create submissions" ON hackathon_submissions;
CREATE POLICY "Team members can create submissions" ON hackathon_submissions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_members 
            WHERE team_members.team_id = hackathon_submissions.team_id 
            AND team_members.user_id = auth.uid() 
            AND team_members.status = 'active'
        )
    );

DROP POLICY IF EXISTS "Team members can update their submissions" ON hackathon_submissions;
CREATE POLICY "Team members can update their submissions" ON hackathon_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM team_members 
            WHERE team_members.team_id = hackathon_submissions.team_id 
            AND team_members.user_id = auth.uid() 
            AND team_members.status = 'active'
        )
    );

-- Grant necessary permissions
GRANT ALL ON hackathon_problem_statements TO authenticated;
GRANT ALL ON hackathon_teams TO authenticated;
GRANT ALL ON team_members TO authenticated;
GRANT ALL ON hackathon_participants TO authenticated;
GRANT ALL ON hackathon_submissions TO authenticated;

GRANT ALL ON hackathon_problem_statements TO anon;
GRANT ALL ON hackathon_teams TO anon;
GRANT ALL ON team_members TO anon;
GRANT ALL ON hackathon_participants TO anon;
GRANT ALL ON hackathon_submissions TO anon;

-- Insert sample data for testing
INSERT INTO hackathons (
    title, description, hackathon_type, start_date, end_date, location, 
    prize_pool, status, organizer, technologies, max_team_members, 
    min_team_members, allow_individual, submissions_open
) VALUES 
(
    'Apna Coding AI Challenge 2024',
    'Build innovative AI solutions to solve real-world problems. Teams will work on machine learning, natural language processing, and computer vision challenges.',
    'apna_coding',
    '2024-03-15 09:00:00+00',
    '2024-03-17 18:00:00+00',
    'Online',
    '₹50,000',
    'upcoming',
    'Apna Coding Team',
    ARRAY['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'AI'],
    5,
    2,
    false,
    true
),
(
    'Web3 Innovation Hackathon',
    'Create decentralized applications and blockchain solutions. Focus on DeFi, NFTs, and Web3 infrastructure.',
    'apna_coding',
    '2024-04-01 10:00:00+00',
    '2024-04-03 20:00:00+00',
    'Hybrid - Delhi & Online',
    '₹1,00,000',
    'upcoming',
    'Apna Coding Team',
    ARRAY['Solidity', 'React', 'Node.js', 'Blockchain', 'Web3'],
    4,
    1,
    true,
    false
),
(
    'DevPost Global Hackathon',
    'Join developers worldwide in this massive coding competition hosted on DevPost platform.',
    'external',
    '2024-02-20 00:00:00+00',
    '2024-02-25 23:59:00+00',
    'Global - Online',
    '$25,000 USD',
    'ongoing',
    'DevPost',
    ARRAY['JavaScript', 'Python', 'Java', 'React', 'Node.js'],
    6,
    1,
    true,
    true
) ON CONFLICT DO NOTHING;

COMMIT;
