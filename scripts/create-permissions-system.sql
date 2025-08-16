-- Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_type TEXT NOT NULL CHECK (permission_type IN ('hackathons', 'courses', 'jobs', 'all')),
    permission_level TEXT NOT NULL CHECK (permission_level IN ('read', 'write', 'admin')),
    granted_by UUID NOT NULL REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create organizer_roles table
CREATE TABLE IF NOT EXISTS organizer_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL CHECK (role_name IN ('hackathon_organizer', 'course_instructor', 'job_poster')),
    assigned_by UUID NOT NULL REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_type ON user_permissions(permission_type);
CREATE INDEX IF NOT EXISTS idx_user_permissions_active ON user_permissions(is_active);
CREATE INDEX IF NOT EXISTS idx_organizer_roles_user_id ON organizer_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_organizer_roles_active ON organizer_roles(is_active);

-- Create function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(
    user_id_param UUID,
    permission_type_param TEXT,
    required_level TEXT DEFAULT 'read'
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    has_permission BOOLEAN := FALSE;
    permission_hierarchy INTEGER;
    required_hierarchy INTEGER;
BEGIN
    -- Check if user is admin
    SELECT role INTO user_role FROM users WHERE id = user_id_param;
    IF user_role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Define permission hierarchy
    required_hierarchy := CASE required_level
        WHEN 'read' THEN 1
        WHEN 'write' THEN 2
        WHEN 'admin' THEN 3
        ELSE 0
    END;
    
    -- Check direct permissions
    SELECT EXISTS(
        SELECT 1 FROM user_permissions 
        WHERE user_id = user_id_param 
        AND (permission_type = permission_type_param OR permission_type = 'all')
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
        AND CASE permission_level
            WHEN 'read' THEN 1
            WHEN 'write' THEN 2
            WHEN 'admin' THEN 3
            ELSE 0
        END >= required_hierarchy
    ) INTO has_permission;
    
    IF has_permission THEN
        RETURN TRUE;
    END IF;
    
    -- Check role-based permissions
    SELECT EXISTS(
        SELECT 1 FROM organizer_roles 
        WHERE user_id = user_id_param 
        AND is_active = true
        AND (
            (role_name = 'hackathon_organizer' AND permission_type_param = 'hackathons') OR
            (role_name = 'course_instructor' AND permission_type_param = 'courses') OR
            (role_name = 'job_poster' AND permission_type_param = 'jobs')
        )
        AND required_hierarchy <= 2 -- Organizers have write access by default
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage all permissions" ON user_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Users can view their own permissions" ON user_permissions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all organizer roles" ON organizer_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Users can view their own roles" ON organizer_roles
    FOR SELECT USING (user_id = auth.uid());

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_permissions_updated_at
    BEFORE UPDATE ON user_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizer_roles_updated_at
    BEFORE UPDATE ON organizer_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
