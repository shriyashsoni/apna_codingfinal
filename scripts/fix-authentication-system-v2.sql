-- Fix authentication system with proper user management
-- This script ensures proper user authentication and profile management

-- First, ensure the users table has all required columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[];

-- Update existing users to have proper defaults
UPDATE users 
SET 
  email_verified = COALESCE(email_verified, true),
  profile_completed = COALESCE(profile_completed, true),
  last_login = COALESCE(last_login, created_at),
  updated_at = NOW()
WHERE email_verified IS NULL OR profile_completed IS NULL OR last_login IS NULL;

-- Create or replace function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    CASE 
      WHEN NEW.email = 'sonishriyash@gmail.com' THEN 'admin'
      ELSE 'user'
    END,
    true,
    true,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    last_login = NOW(),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure admin user exists
INSERT INTO users (
  id,
  email,
  full_name,
  role,
  email_verified,
  profile_completed,
  last_login,
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
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  updated_at = NOW();

-- Update RLS policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'sonishriyash@gmail.com')
    )
  );

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'sonishriyash@gmail.com')
    )
  );

-- Create function to get user by email
CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.avatar_url,
    u.created_at
  FROM users u
  WHERE u.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_by_email(TEXT) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
