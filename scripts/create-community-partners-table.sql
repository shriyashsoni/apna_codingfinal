-- Create community_partners table
CREATE TABLE IF NOT EXISTS community_partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    category VARCHAR(100) NOT NULL CHECK (category IN (
        'tech-communities',
        'student-organizations', 
        'developer-groups',
        'startup-communities',
        'educational-institutions',
        'open-source-projects',
        'coding-bootcamps',
        'professional-networks'
    )),
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_partners_category ON community_partners(category);
CREATE INDEX IF NOT EXISTS idx_community_partners_status ON community_partners(status);
CREATE INDEX IF NOT EXISTS idx_community_partners_featured ON community_partners(is_featured);
CREATE INDEX IF NOT EXISTS idx_community_partners_created_at ON community_partners(created_at);

-- Enable Row Level Security
ALTER TABLE community_partners ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Community partners are viewable by everyone" ON community_partners
    FOR SELECT USING (true);

CREATE POLICY "Only admins can insert community partners" ON community_partners
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Only admins can update community partners" ON community_partners
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete community partners" ON community_partners
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Insert sample community partners data
INSERT INTO community_partners (name, description, logo_url, website_url, category, is_featured, status) VALUES
('Google Developer Groups', 'Global community of developers interested in Google developer technologies', 'https://developers.google.com/community/gdg/images/gdg-logo.svg', 'https://developers.google.com/community/gdg', 'tech-communities', true, 'active'),
('Microsoft Student Partners', 'Student community program by Microsoft for aspiring technologists', 'https://studentambassadors.microsoft.com/images/msa-logo.png', 'https://studentambassadors.microsoft.com/', 'student-organizations', true, 'active'),
('GitHub Campus Experts', 'Student leaders who build technical communities on campus', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', 'https://education.github.com/experts', 'student-organizations', true, 'active'),
('Stack Overflow Community', 'The largest online community for programmers to learn and share knowledge', 'https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon.png', 'https://stackoverflow.com/', 'developer-groups', true, 'active'),
('Dev.to Community', 'A constructive and inclusive social network for software developers', 'https://dev-to-uploads.s3.amazonaws.com/uploads/logos/resized_logo_UQww2soKuUsjaOGNB38o.png', 'https://dev.to/', 'developer-groups', true, 'active'),
('Startup Grind', 'Global startup community designed to educate, inspire, and connect entrepreneurs', 'https://startupgrind.com/wp-content/uploads/2019/01/SG-Logo-Horizontal-Color-1.png', 'https://startupgrind.com/', 'startup-communities', true, 'active'),
('IEEE Computer Society', 'Professional organization for computing professionals', 'https://www.computer.org/web/guest/home/-/media/computer/images/computer-society-logo.png', 'https://www.computer.org/', 'professional-networks', false, 'active'),
('ACM Student Chapters', 'Student chapters of the Association for Computing Machinery', 'https://www.acm.org/binaries/content/gallery/acm/logos/acm_logo_tablet.png', 'https://www.acm.org/chapters/student-chapters', 'student-organizations', false, 'active'),
('Women Who Code', 'Global nonprofit dedicated to inspiring women to excel in technology careers', 'https://www.womenwhocode.com/assets/logos/wwc_logo_color.png', 'https://www.womenwhocode.com/', 'tech-communities', false, 'active'),
('FreeCodeCamp', 'Learn to code for free with millions of other people', 'https://cdn.freecodecamp.org/platform/universal/fcc_primary.svg', 'https://www.freecodecamp.org/', 'educational-institutions', false, 'active');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_community_partners_updated_at 
    BEFORE UPDATE ON community_partners 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
