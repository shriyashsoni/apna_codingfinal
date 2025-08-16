-- Create permissions system tables
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_type VARCHAR(50) NOT NULL, -- 'hackathons', 'courses', 'jobs', 'all'
    permission_level VARCHAR(20) NOT NULL, -- 'read', 'write', 'admin'
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create organizer roles table
CREATE TABLE IF NOT EXISTS organizer_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_name VARCHAR(50) NOT NULL, -- 'hackathon_organizer', 'course_instructor', 'job_poster'
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_type ON user_permissions(permission_type);
CREATE INDEX IF NOT EXISTS idx_organizer_roles_user_id ON organizer_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_organizer_roles_role_name ON organizer_roles(role_name);

-- Create RLS policies
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_roles ENABLE ROW LEVEL SECURITY;

-- Policies for user_permissions
CREATE POLICY "Users can view their own permissions" ON user_permissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all permissions" ON user_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR email = 'sonishriyash@gmail.com')
        )
    );

-- Policies for organizer_roles
CREATE POLICY "Users can view their own roles" ON organizer_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON organizer_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR email = 'sonishriyash@gmail.com')
        )
    );

-- Function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(
    user_id UUID,
    permission_type VARCHAR,
    permission_level VARCHAR DEFAULT 'read'
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is super admin
    IF EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id 
        AND email = 'sonishriyash@gmail.com'
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user is admin
    IF EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id 
        AND role = 'admin'
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Check specific permissions
    IF EXISTS (
        SELECT 1 FROM user_permissions 
        WHERE user_permissions.user_id = check_user_permission.user_id
        AND (permission_type = 'all' OR user_permissions.permission_type = check_user_permission.permission_type)
        AND (
            permission_level = 'admin' OR 
            (permission_level = 'write' AND check_user_permission.permission_level IN ('read', 'write')) OR
            (permission_level = 'read' AND check_user_permission.permission_level = 'read')
        )
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Check organizer roles
    IF EXISTS (
        SELECT 1 FROM organizer_roles 
        WHERE organizer_roles.user_id = check_user_permission.user_id
        AND is_active = true
        AND (
            (role_name = 'hackathon_organizer' AND permission_type = 'hackathons') OR
            (role_name = 'course_instructor' AND permission_type = 'courses') OR
            (role_name = 'job_poster' AND permission_type = 'jobs')
        )
    ) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
