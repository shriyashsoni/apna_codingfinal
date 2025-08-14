-- Drop existing table if it exists
DROP TABLE IF EXISTS community_partners CASCADE;

-- Create community_partners table with correct schema
CREATE TABLE community_partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    member_count INTEGER,
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_community_partners_status ON community_partners(status);
CREATE INDEX idx_community_partners_featured ON community_partners(is_featured);
CREATE INDEX idx_community_partners_category ON community_partners(category);
CREATE INDEX idx_community_partners_created_at ON community_partners(created_at);

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

-- NO SAMPLE DATA - Table starts empty
-- Only real partners added through admin portal will appear

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
