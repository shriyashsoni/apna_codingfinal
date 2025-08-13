-- Drop existing tables if they exist
DROP TABLE IF EXISTS hackathon_registrations CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS hackathons CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS communities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    github_url TEXT,
    linkedin_url TEXT,
    bio TEXT,
    skills TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    duration VARCHAR(100),
    level VARCHAR(50) CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    technologies TEXT[] DEFAULT '{}',
    instructor VARCHAR(255),
    students_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    redirect_url TEXT,
    category VARCHAR(100),
    original_price VARCHAR(50),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hackathons table
CREATE TABLE hackathons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_deadline DATE,
    location VARCHAR(255),
    prize_pool VARCHAR(100),
    participants_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    registration_open BOOLEAN DEFAULT true,
    technologies TEXT[] DEFAULT '{}',
    registration_link TEXT,
    whatsapp_link TEXT,
    organizer VARCHAR(255),
    partnerships TEXT[],
    featured BOOLEAN DEFAULT false,
    mode VARCHAR(20) DEFAULT 'online' CHECK (mode IN ('online', 'offline', 'hybrid')),
    difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    max_team_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    type VARCHAR(50) CHECK (type IN ('Full-time', 'Part-time', 'Contract', 'Internship')),
    salary VARCHAR(100),
    experience VARCHAR(100),
    technologies TEXT[] DEFAULT '{}',
    company_logo TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'filled')),
    posted_date DATE DEFAULT CURRENT_DATE,
    application_deadline DATE,
    apply_link TEXT,
    requirements TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communities table
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    member_count INTEGER DEFAULT 0,
    type VARCHAR(20) CHECK (type IN ('discord', 'telegram', 'whatsapp')),
    invite_link TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hackathon_registrations table
CREATE TABLE hackathon_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
    team_name VARCHAR(255),
    team_members JSONB,
    additional_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hackathon_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_hackathons_status ON hackathons(status);
CREATE INDEX idx_hackathons_start_date ON hackathons(start_date);
CREATE INDEX idx_hackathons_featured ON hackathons(featured);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_posted_date ON jobs(posted_date);
CREATE INDEX idx_hackathon_registrations_hackathon_id ON hackathon_registrations(hackathon_id);
CREATE INDEX idx_hackathon_registrations_user_id ON hackathon_registrations(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hackathons_updated_at BEFORE UPDATE ON hackathons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hackathon_registrations_updated_at BEFORE UPDATE ON hackathon_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment hackathon participants
CREATE OR REPLACE FUNCTION increment_hackathon_participants(hackathon_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE hackathons 
    SET participants_count = participants_count + 1 
    WHERE id = hackathon_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for courses table
CREATE POLICY "Anyone can view active courses" ON courses FOR SELECT USING (status = 'active' OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Only admins can insert courses" ON courses FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Only admins can update courses" ON courses FOR UPDATE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Only admins can delete courses" ON courses FOR DELETE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Create policies for hackathons table
CREATE POLICY "Anyone can view hackathons" ON hackathons FOR SELECT USING (true);
CREATE POLICY "Only admins can insert hackathons" ON hackathons FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Only admins can update hackathons" ON hackathons FOR UPDATE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Only admins can delete hackathons" ON hackathons FOR DELETE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Create policies for jobs table
CREATE POLICY "Anyone can view active jobs" ON jobs FOR SELECT USING (status = 'active' OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Only admins can insert jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Only admins can update jobs" ON jobs FOR UPDATE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Only admins can delete jobs" ON jobs FOR DELETE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Create policies for communities table
CREATE POLICY "Anyone can view active communities" ON communities FOR SELECT USING (status = 'active');
CREATE POLICY "Only admins can manage communities" ON communities FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Create policies for hackathon_registrations table
CREATE POLICY "Users can view own registrations" ON hackathon_registrations FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Users can insert own registrations" ON hackathon_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own registrations" ON hackathon_registrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own registrations" ON hackathon_registrations FOR DELETE USING (auth.uid() = user_id);
