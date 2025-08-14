-- Create community_partners table
CREATE TABLE IF NOT EXISTS community_partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  website_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_community_partners_updated_at BEFORE UPDATE
    ON community_partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
