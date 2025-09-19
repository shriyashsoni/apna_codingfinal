-- Fix authentication system and user profiles
-- This script ensures proper user authentication and profile management

-- First, ensure the users table has all required columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;

-- Update existing users to have proper defaults
UPDATE users 
SET 
  avatar_url = COALESCE(avatar_url, ''),
  bio = COALESCE(bio, ''),
  github_url = COALESCE(github_url, ''),
  linkedin_url = COALESCE(linkedin_url, ''),
  skills = COALESCE(skills, '{}'),
  email_verified = COALESCE(email_verified, false),
  profile_completed = COALESCE(profile_completed, false),
  updated_at = NOW()
WHERE avatar_url IS NULL OR bio IS NULL OR github_url IS NULL OR linkedin_url IS NULL;

-- Ensure admin user exists and has proper role
INSERT INTO users (
  id, 
  email, 
  full_name, 
  role, 
  email_verified, 
  profile_completed,
  created_at, 
  updated_at
) VALUES (
  gen_random_uuid(),
  'sonishriyash@gmail.com',
  'Shriyash Soni',
  'admin',
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  email_verified = true,
  profile_completed = true,
  updated_at = NOW();

-- Create function to handle user profile creation/update
CREATE OR REPLACE FUNCTION handle_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update user profile when auth.users is modified
  INSERT INTO public.users (
    id,
    email,
    full_name,
    avatar_url,
    role,
    email_verified,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    CASE WHEN NEW.email = 'sonishriyash@gmail.com' THEN 'admin' ELSE 'user' END,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', users.full_name),
    avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', users.avatar_url),
    email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, users.email_verified),
    last_login = CASE WHEN NEW.last_sign_in_at > users.last_login THEN NEW.last_sign_in_at ELSE users.last_login END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile management
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_profile();

-- Create function to get user with profile
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT,
  bio TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  skills TEXT[],
  email_verified BOOLEAN,
  profile_completed BOOLEAN,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.avatar_url,
    u.role,
    u.bio,
    u.github_url,
    u.linkedin_url,
    u.skills,
    u.email_verified,
    u.profile_completed,
    u.last_login,
    u.created_at,
    u.updated_at
  FROM users u
  WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for better security
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'admin' OR users.email = 'sonishriyash@gmail.com')
    )
  );

CREATE POLICY "Admins can update all profiles" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'admin' OR users.email = 'sonishriyash@gmail.com')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Grant necessary permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;
GRANT EXECUTE ON FUNCTION handle_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_user_profile() TO service_role;
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO service_role;

-- Update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
