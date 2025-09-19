-- Complete Authentication System Fix
-- This script completely rebuilds the authentication system with proper RLS and triggers

-- First, drop all existing policies and triggers to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable read access for own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for own profile" ON users;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_last_login();
DROP FUNCTION IF EXISTS get_user_by_email(text);
DROP FUNCTION IF EXISTS update_user_last_login(uuid);

-- Ensure users table has all required columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS id uuid PRIMARY KEY DEFAULT gen_random_uuid();
ALTER TABLE users ADD COLUMN IF NOT EXISTS email text UNIQUE NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name text NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills text[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies
CREATE POLICY "Anyone can view user profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can do everything" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR email = 'sonishriyash@gmail.com')
        )
    );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role text := 'user';
    user_name text;
    user_avatar text;
BEGIN
    -- Determine role
    IF NEW.email = 'sonishriyash@gmail.com' THEN
        user_role := 'admin';
    END IF;
    
    -- Extract name from metadata
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    
    -- Extract avatar from metadata
    user_avatar := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture'
    );
    
    -- Insert or update user profile
    INSERT INTO public.users (
        id,
        email,
        full_name,
        avatar_url,
        role,
        email_verified,
        profile_completed,
        last_login,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        user_name,
        user_avatar,
        user_role,
        CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END,
        true,
        now(),
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, users.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
        role = CASE WHEN EXCLUDED.email = 'sonishriyash@gmail.com' THEN 'admin' ELSE users.role END,
        email_verified = EXCLUDED.email_verified,
        last_login = EXCLUDED.last_login,
        updated_at = EXCLUDED.updated_at;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the auth process
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create function to update last login
CREATE OR REPLACE FUNCTION public.update_user_last_login(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.users 
    SET 
        last_login = now(),
        updated_at = now()
    WHERE id = user_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail
        RAISE WARNING 'Error updating last login: %', SQLERRM;
END;
$$;

-- Create function to get user by email
CREATE OR REPLACE FUNCTION public.get_user_by_email(user_email text)
RETURNS TABLE(
    id uuid,
    email text,
    full_name text,
    avatar_url text,
    role text,
    email_verified boolean,
    profile_completed boolean,
    last_login timestamptz,
    created_at timestamptz,
    updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.full_name,
        u.avatar_url,
        u.role,
        u.email_verified,
        u.profile_completed,
        u.last_login,
        u.created_at,
        u.updated_at
    FROM users u
    WHERE u.email = user_email;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_last_login(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_by_email(text) TO anon, authenticated;

-- Ensure admin user exists
INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    email_verified,
    profile_completed,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'sonishriyash@gmail.com',
    'Shriyash Soni',
    'admin',
    true,
    true,
    now(),
    now()
)
ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    updated_at = now();

-- Create event registration tables if they don't exist
CREATE TABLE IF NOT EXISTS event_registrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registered_at timestamptz DEFAULT now(),
    status text DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
    additional_info jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(event_id, user_id)
);

CREATE TABLE IF NOT EXISTS hackathon_registrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id uuid NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registered_at timestamptz DEFAULT now(),
    status text DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
    team_name text,
    team_members jsonb DEFAULT '[]',
    additional_info jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(hackathon_id, user_id)
);

-- Enable RLS on registration tables
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_registrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for registrations
CREATE POLICY "Users can view their own registrations" ON event_registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own registrations" ON event_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" ON event_registrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all event registrations" ON event_registrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR email = 'sonishriyash@gmail.com')
        )
    );

CREATE POLICY "Users can view their own hackathon registrations" ON hackathon_registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hackathon registrations" ON hackathon_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hackathon registrations" ON hackathon_registrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all hackathon registrations" ON hackathon_registrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR email = 'sonishriyash@gmail.com')
        )
    );

-- Grant permissions on registration tables
GRANT ALL ON event_registrations TO anon, authenticated;
GRANT ALL ON hackathon_registrations TO anon, authenticated;
