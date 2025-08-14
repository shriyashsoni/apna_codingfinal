-- Create community_partners table
CREATE TABLE IF NOT EXISTS community_partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo TEXT,
    website TEXT,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    member_count INTEGER,
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_partners_status ON community_partners(status);
CREATE INDEX IF NOT EXISTS idx_community_partners_featured ON community_partners(featured);
CREATE INDEX IF NOT EXISTS idx_community_partners_category ON community_partners(category);
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
            AND (users.role = 'admin' OR users.email = 'sonishriyash@gmail.com')
        )
    );

CREATE POLICY "Only admins can update community partners" ON community_partners
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.role = 'admin' OR users.email = 'sonishriyash@gmail.com')
        )
    );

CREATE POLICY "Only admins can delete community partners" ON community_partners
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.role = 'admin' OR users.email = 'sonishriyash@gmail.com')
        )
    );

-- Insert sample community partners
INSERT INTO community_partners (name, logo, website, description, category, member_count, location, featured) VALUES
('React India', '/images/community/react-india.png', 'https://reactindia.io', 'Largest React community in India with monthly meetups and conferences', 'Tech Communities', 15000, 'India', true),
('Google Developer Groups Delhi', '/images/community/gdg-delhi.png', 'https://gdgdelhi.com', 'Official Google Developer Group for Delhi NCR region', 'Developer Groups', 8500, 'Delhi, India', true),
('Women Who Code Delhi', '/images/community/wwc-delhi.png', 'https://womenwhocode.com/delhi', 'Empowering women in technology through community and mentorship', 'Professional Networks', 3200, 'Delhi, India', false),
('Coding Ninjas Community', '/images/community/coding-ninjas.png', 'https://codingninjas.com', 'Student community focused on competitive programming and placements', 'Student Organizations', 25000, 'India', true),
('PyDelhi', '/images/community/pydelhi.png', 'https://pydelhi.org', 'Python community in Delhi with regular workshops and talks', 'Tech Communities', 4500, 'Delhi, India', false),
('Mozilla Campus Clubs', '/images/community/mozilla.png', 'https://campus.mozilla.community', 'Student clubs promoting open source and web literacy', 'Student Organizations', 12000, 'Global', false),
('GitHub Campus Experts', '/images/community/github-campus.png', 'https://githubcampus.expert', 'Student leaders building tech communities at universities', 'Student Organizations', 800, 'Global', true),
('TechStars Startup Community', '/images/community/techstars.png', 'https://techstars.com', 'Global startup accelerator and community', 'Startup Communities', 5000, 'Global', false),
('FreeCodeCamp Delhi', '/images/community/freecodecamp.png', 'https://freecodecamp.org', 'Local chapter of the global coding education community', 'Educational Institutions', 7800, 'Delhi, India', false),
('DevFest Community', '/images/community/devfest.png', 'https://devfest.withgoogle.com', 'Annual developer festival organized by GDGs worldwide', 'Developer Groups', 50000, 'Global', true);

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
