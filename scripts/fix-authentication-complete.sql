-- Complete Authentication System Fix
-- This script creates all necessary tables, policies, and functions for authentication

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies and tables if they exist (for clean setup)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;

DROP TABLE IF EXISTS hackathon_registrations CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS organizer_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with all necessary columns
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'organizer')),
    bio TEXT,
    location TEXT,
    website TEXT,
    github_username TEXT,
    linkedin_username TEXT,
    twitter_username TEXT,
    skills TEXT[],
    interests TEXT[],
    experience_level TEXT DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    is_public BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create organizer_roles table
CREATE TABLE organizer_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL CHECK (role_name IN ('hackathon_organizer', 'event_organizer', 'job_poster')),
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role_name)
);

-- Create event_registrations table
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
    UNIQUE(event_id, user_id)
);

-- Create hackathon_registrations table
CREATE TABLE hackathon_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hackathon_id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_name TEXT,
    team_members JSONB,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'participated')),
    UNIQUE(hackathon_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_registrations ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can view all profiles" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() AND role = = 'admin'
        )
    );

CREATE POLICY "Public profiles are viewable by everyone" ON users
    FOR SELECT USING (is_public = true);

CREATE POLICY "Enable insert for authenticated users" ON users
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Create RLS policies for organizer_roles
CREATE POLICY "Users can view own organizer roles" ON organizer_roles
    FOR SELECT USING (
        user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Admins can manage all organizer roles" ON organizer_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for registrations
CREATE POLICY "Users can view own registrations" ON event_registrations
    FOR SELECT USING (
        user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Users can insert own registrations" ON event_registrations
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Users can view own hackathon registrations" ON hackathon_registrations
    FOR SELECT USING (
        user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Users can insert own hackathon registrations" ON hackathon_registrations
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    );

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (
        auth_user_id,
        email,
        full_name,
        avatar_url,
        role
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url',
        'user'
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- User already exists, update their info
        UPDATE users SET
            email = NEW.email,
            full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', users.full_name),
            avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', users.avatar_url),
            updated_at = NOW()
        WHERE auth_user_id = NEW.id;
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error but don't fail the auth process
        RAISE WARNING 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create admin user function
CREATE OR REPLACE FUNCTION create_admin_user(user_email TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET role = 'admin' 
    WHERE email = user_email;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to grant organizer roles
CREATE OR REPLACE FUNCTION grant_organizer_role(
    user_email TEXT,
    role_type TEXT,
    granted_by_email TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    target_user_id UUID;
    granter_user_id UUID;
BEGIN
    -- Get target user ID
    SELECT id INTO target_user_id FROM users WHERE email = user_email;
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Get granter user ID if provided
    IF granted_by_email IS NOT NULL THEN
        SELECT id INTO granter_user_id FROM users WHERE email = granted_by_email;
    END IF;
    
    -- Insert or update organizer role
    INSERT INTO organizer_roles (user_id, role_name, granted_by, is_active)
    VALUES (target_user_id, role_type, granter_user_id, true)
    ON CONFLICT (user_id, role_name) 
    DO UPDATE SET 
        is_active = true,
        granted_by = COALESCE(granter_user_id, organizer_roles.granted_by),
        granted_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_organizer_roles_user_id ON organizer_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_organizer_roles_role_name ON organizer_roles(role_name);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_registrations_user_id ON hackathon_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_registrations_hackathon_id ON hackathon_registrations(hackathon_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Insert sample admin user (replace with your email)
-- Uncomment and modify the line below with your email
-- SELECT create_admin_user('your-email@example.com');

COMMIT;
