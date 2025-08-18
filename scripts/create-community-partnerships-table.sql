-- Create community_partnerships table
CREATE TABLE IF NOT EXISTS community_partnerships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    partner_logo TEXT,
    partner_name VARCHAR(255) NOT NULL,
    partner_website TEXT,
    partnership_type VARCHAR(100) DEFAULT 'general' CHECK (partnership_type IN ('general', 'educational', 'corporate', 'startup', 'nonprofit')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    featured BOOLEAN DEFAULT false,
    benefits TEXT[], -- Array of benefits
    contact_email VARCHAR(255),
    contact_person VARCHAR(255),
    start_date DATE,
    end_date DATE,
    partnership_date DATE DEFAULT CURRENT_DATE,
    partnership_photo TEXT,
    social_links JSONB DEFAULT '{}',
    tags TEXT[],
    priority INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_partnerships_status ON community_partnerships(status);
CREATE INDEX IF NOT EXISTS idx_community_partnerships_type ON community_partnerships(partnership_type);
CREATE INDEX IF NOT EXISTS idx_community_partnerships_featured ON community_partnerships(featured);
CREATE INDEX IF NOT EXISTS idx_community_partnerships_priority ON community_partnerships(priority);
CREATE INDEX IF NOT EXISTS idx_community_partnerships_created_by ON community_partnerships(created_by);

-- Enable Row Level Security
ALTER TABLE community_partnerships ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can view active partnerships" ON community_partnerships
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage all partnerships" ON community_partnerships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Users can view their own partnerships" ON community_partnerships
    FOR SELECT USING (created_by = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_community_partnerships_updated_at 
    BEFORE UPDATE ON community_partnerships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO community_partnerships (
    title, description, partner_name, partner_website, partnership_type, 
    status, featured, benefits, contact_email, partnership_date, tags, priority
) VALUES 
(
    'AWS Cloud Credits Program',
    'Get up to $10,000 in AWS credits for your startup or project. Perfect for students and developers looking to build scalable applications in the cloud.',
    'Amazon Web Services',
    'https://aws.amazon.com/activate',
    'corporate',
    'active',
    true,
    ARRAY['Up to $10,000 AWS Credits', '24/7 Technical Support', 'Training Resources', 'Startup Mentorship', 'Architecture Reviews'],
    'partnerships@aws.com',
    '2024-01-15',
    ARRAY['cloud', 'startup', 'credits', 'aws', 'infrastructure'],
    10
),
(
    'GitHub Student Developer Pack',
    'Access to premium developer tools and services worth over $200k. Includes free GitHub Pro, domain names, cloud hosting, and much more.',
    'GitHub',
    'https://education.github.com/pack',
    'educational',
    'active',
    true,
    ARRAY['Free GitHub Pro', 'Premium Developer Tools', 'Cloud Hosting Credits', 'Free Domain Names', 'Design Software'],
    'education@github.com',
    '2024-01-10',
    ARRAY['education', 'student', 'developer', 'tools', 'github'],
    9
),
(
    'Microsoft for Startups',
    'Join Microsoft for Startups and get up to $150,000 in Azure credits, plus access to technical support and go-to-market resources.',
    'Microsoft',
    'https://startups.microsoft.com',
    'startup',
    'active',
    true,
    ARRAY['Up to $150,000 Azure Credits', 'Technical Support', 'Go-to-market Resources', 'Mentorship Program', 'Co-selling Opportunities'],
    'startups@microsoft.com',
    '2024-01-20',
    ARRAY['startup', 'azure', 'cloud', 'mentorship', 'microsoft'],
    8
);
