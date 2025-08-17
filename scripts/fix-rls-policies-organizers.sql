-- Drop existing policies if they exist
DROP POLICY IF EXISTS "hackathons_select_policy" ON hackathons;
DROP POLICY IF EXISTS "hackathons_insert_policy" ON hackathons;
DROP POLICY IF EXISTS "hackathons_update_policy" ON hackathons;
DROP POLICY IF EXISTS "hackathons_delete_policy" ON hackathons;

DROP POLICY IF EXISTS "courses_select_policy" ON courses;
DROP POLICY IF EXISTS "courses_insert_policy" ON courses;
DROP POLICY IF EXISTS "courses_update_policy" ON courses;
DROP POLICY IF EXISTS "courses_delete_policy" ON courses;

DROP POLICY IF EXISTS "jobs_select_policy" ON jobs;
DROP POLICY IF EXISTS "jobs_insert_policy" ON jobs;
DROP POLICY IF EXISTS "jobs_update_policy" ON jobs;
DROP POLICY IF EXISTS "jobs_delete_policy" ON jobs;

-- Create helper functions for permission checking
CREATE OR REPLACE FUNCTION is_admin(user_email text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If no email provided, get current user's email
  IF user_email IS NULL THEN
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  END IF;
  
  -- Check if user is the main admin
  IF user_email = 'sonishriyash@gmail.com' THEN
    RETURN true;
  END IF;
  
  -- Check if user has admin role in users table
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE email = user_email AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION has_organizer_permission(permission_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin first
  IF is_admin() THEN
    RETURN true;
  END IF;
  
  -- Check if user has the specific organizer permission
  RETURN EXISTS (
    SELECT 1 FROM organizer_roles 
    WHERE user_id = auth.uid() 
    AND role_name = permission_type 
    AND is_active = true
  );
END;
$$;

-- Enable RLS on all tables
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Hackathons policies
CREATE POLICY "hackathons_select_policy" ON hackathons
  FOR SELECT USING (true);

CREATE POLICY "hackathons_insert_policy" ON hackathons
  FOR INSERT WITH CHECK (
    is_admin() OR has_organizer_permission('hackathon_organizer')
  );

CREATE POLICY "hackathons_update_policy" ON hackathons
  FOR UPDATE USING (
    is_admin() OR has_organizer_permission('hackathon_organizer')
  );

CREATE POLICY "hackathons_delete_policy" ON hackathons
  FOR DELETE USING (
    is_admin() OR has_organizer_permission('hackathon_organizer')
  );

-- Courses policies
CREATE POLICY "courses_select_policy" ON courses
  FOR SELECT USING (true);

CREATE POLICY "courses_insert_policy" ON courses
  FOR INSERT WITH CHECK (
    is_admin() OR has_organizer_permission('course_instructor')
  );

CREATE POLICY "courses_update_policy" ON courses
  FOR UPDATE USING (
    is_admin() OR has_organizer_permission('course_instructor')
  );

CREATE POLICY "courses_delete_policy" ON courses
  FOR DELETE USING (
    is_admin() OR has_organizer_permission('course_instructor')
  );

-- Jobs policies
CREATE POLICY "jobs_select_policy" ON jobs
  FOR SELECT USING (true);

CREATE POLICY "jobs_insert_policy" ON jobs
  FOR INSERT WITH CHECK (
    is_admin() OR has_organizer_permission('job_poster')
  );

CREATE POLICY "jobs_update_policy" ON jobs
  FOR UPDATE USING (
    is_admin() OR has_organizer_permission('job_poster')
  );

CREATE POLICY "jobs_delete_policy" ON jobs
  FOR DELETE USING (
    is_admin() OR has_organizer_permission('job_poster')
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
