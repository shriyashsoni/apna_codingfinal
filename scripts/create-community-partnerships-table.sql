-- Create community partnerships table
CREATE TABLE IF NOT EXISTS community_partnerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    partner_logo TEXT,
    partner_name VARCHAR(255) NOT NULL,
    partner_website TEXT,
    partnership_type VARCHAR(100) DEFAULT 'general' CHECK (partnership_type IN ('general', 'educational', 'corporate', 'startup', 'nonprofit')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    featured BOOLEAN DEFAULT false,
    benefits TEXT[] DEFAULT '{}',
    contact_email VARCHAR(255),
    contact_person VARCHAR(255),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    social_links JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    priority INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_partnerships_status ON community_partnerships(status);
CREATE INDEX IF NOT EXISTS idx_community_partnerships_featured ON community_partnerships(featured);
CREATE INDEX IF NOT EXISTS idx_community_partnerships_type ON community_partnerships(partnership_type);
CREATE INDEX IF NOT EXISTS idx_community_partnerships_priority ON community_partnerships(priority);
CREATE INDEX IF NOT EXISTS idx_community_partnerships_created_by ON community_partnerships(created_by);

-- Create trigger for updated_at
CREATE TRIGGER update_community_partnerships_updated_at 
    BEFORE UPDATE ON community_partnerships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE community_partnerships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access to active partnerships" ON community_partnerships
    FOR SELECT USING (status = 'active');

CREATE POLICY "Allow admins full access to partnerships" ON community_partnerships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Insert sample data
INSERT INTO community_partnerships (
    title,
    description,
    partner_name,
    partner_website,
    partnership_type,
    featured,
    benefits,
    contact_email,
    contact_person,
    social_links,
    tags,
    priority
) VALUES 
(
    'AWS Cloud Credits Program',
    'Get up to $10,000 in AWS credits for your startup or project. Perfect for students and developers looking to build scalable applications.',
    'Amazon Web Services',
    'https://aws.amazon.com',
    'corporate',
    true,
    ARRAY['Free AWS Credits', 'Technical Support', 'Training Resources', 'Startup Mentorship'],
    'partnerships@aws.com',
    'AWS Startup Team',
    '{"twitter": "https://twitter.com/awscloud", "linkedin": "https://linkedin.com/company/amazon-web-services"}',
    ARRAY['cloud', 'startup', 'credits', 'aws'],
    10
),
(
    'GitHub Student Developer Pack',
    'Access to premium developer tools and services worth over $200k. Includes free GitHub Pro, domain names, and cloud hosting.',
    'GitHub',
    'https://education.github.com/pack',
    'educational',
    true,
    ARRAY['Free GitHub Pro', 'Developer Tools', 'Cloud Hosting', 'Domain Names'],
    'education@github.com',
    'GitHub Education Team',
    '{"twitter": "https://twitter.com/github", "linkedin": "https://linkedin.com/company/github"}',
    ARRAY['education', 'student', 'developer', 'tools'],
    9
),
(
    'Microsoft for Startups',
    'Join Microsoft for Startups and get up to $150,000 in Azure credits, plus access to technical support and go-to-market resources.',
    'Microsoft',
    'https://startups.microsoft.com',
    'startup',
    true,
    ARRAY['Azure Credits', 'Technical Support', 'Go-to-market Resources', 'Mentorship'],
    'startups@microsoft.com',
    'Microsoft Startups Team',
    '{"twitter": "https://twitter.com/microsoft", "linkedin": "https://linkedin.com/company/microsoft"}',
    ARRAY['startup', 'azure', 'cloud', 'mentorship'],
    8
);
