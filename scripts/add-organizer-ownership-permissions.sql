-- Add created_by column to track ownership
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- Create function to check if user is owner or admin
CREATE OR REPLACE FUNCTION is_owner_or_admin(user_id UUID, content_created_by UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is admin
  IF EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id 
    AND (role = 'admin' OR email = 'sonishriyash@gmail.com')
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is the owner
  IF content_created_by = user_id THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for hackathons
DROP POLICY IF EXISTS "Users can view all hackathons" ON hackathons;
DROP POLICY IF EXISTS "Admins and organizers can insert hackathons" ON hackathons;
DROP POLICY IF EXISTS "Admins and organizers can update hackathons" ON hackathons;
DROP POLICY IF EXISTS "Admins and organizers can delete hackathons" ON hackathons;

CREATE POLICY "Users can view all hackathons" ON hackathons
  FOR SELECT USING (true);

CREATE POLICY "Admins and organizers can insert hackathons" ON hackathons
  FOR INSERT WITH CHECK (
    is_admin(auth.jwt() ->> 'email') OR 
    has_organizer_permission(auth.uid(), 'hackathon_organizer')
  );

CREATE POLICY "Owners and admins can update hackathons" ON hackathons
  FOR UPDATE USING (
    is_owner_or_admin(auth.uid(), created_by)
  );

CREATE POLICY "Owners and admins can delete hackathons" ON hackathons
  FOR DELETE USING (
    is_owner_or_admin(auth.uid(), created_by)
  );

-- Update RLS policies for jobs
DROP POLICY IF EXISTS "Users can view all jobs" ON jobs;
DROP POLICY IF EXISTS "Admins and organizers can insert jobs" ON jobs;
DROP POLICY IF EXISTS "Admins and organizers can update jobs" ON jobs;
DROP POLICY IF EXISTS "Admins and organizers can delete jobs" ON jobs;

CREATE POLICY "Users can view all jobs" ON jobs
  FOR SELECT USING (true);

CREATE POLICY "Admins and organizers can insert jobs" ON jobs
  FOR INSERT WITH CHECK (
    is_admin(auth.jwt() ->> 'email') OR 
    has_organizer_permission(auth.uid(), 'job_poster')
  );

CREATE POLICY "Owners and admins can update jobs" ON jobs
  FOR UPDATE USING (
    is_owner_or_admin(auth.uid(), created_by)
  );

CREATE POLICY "Owners and admins can delete jobs" ON jobs
  FOR DELETE USING (
    is_owner_or_admin(auth.uid(), created_by)
  );

-- Update RLS policies for courses
DROP POLICY IF EXISTS "Users can view all courses" ON courses;
DROP POLICY IF EXISTS "Admins and organizers can insert courses" ON courses;
DROP POLICY IF EXISTS "Admins and organizers can update courses" ON courses;
DROP POLICY IF EXISTS "Admins and organizers can delete courses" ON courses;

CREATE POLICY "Users can view all courses" ON courses
  FOR SELECT USING (true);

CREATE POLICY "Admins and organizers can insert courses" ON courses
  FOR INSERT WITH CHECK (
    is_admin(auth.jwt() ->> 'email') OR 
    has_organizer_permission(auth.uid(), 'course_instructor')
  );

CREATE POLICY "Owners and admins can update courses" ON courses
  FOR UPDATE USING (
    is_owner_or_admin(auth.uid(), created_by)
  );

CREATE POLICY "Owners and admins can delete courses" ON courses
  FOR DELETE USING (
    is_owner_or_admin(auth.uid(), created_by)
  );
