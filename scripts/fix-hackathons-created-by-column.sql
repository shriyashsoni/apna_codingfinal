-- Add created_by column to hackathons table if it doesn't exist
ALTER TABLE hackathons 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_hackathons_created_by ON hackathons(created_by);

-- Update existing hackathons to have a default created_by value (optional)
-- You can set this to a specific admin user ID if needed
-- UPDATE hackathons SET created_by = 'your-admin-user-id' WHERE created_by IS NULL;
