-- Create comprehensive SEO-optimized database schema
BEGIN;

-- Create blog posts table for SEO content
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT DEFAULT 'Apna Coding Team',
    featured_image TEXT,
    tags TEXT[] DEFAULT '{}',
    categories TEXT[] DEFAULT '{}',
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    published BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    reading_time INTEGER DEFAULT 5,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mentorship programs table
CREATE TABLE IF NOT EXISTS mentorship_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    mentor_name TEXT NOT NULL,
    mentor_bio TEXT,
    mentor_image TEXT,
    mentor_company TEXT,
    mentor_role TEXT,
    program_type TEXT CHECK (program_type IN ('one-on-one', 'group', 'workshop', 'bootcamp')) DEFAULT 'one-on-one',
    duration TEXT, -- e.g., "4 weeks", "3 months"
    price DECIMAL(10,2) DEFAULT 0,
    max_participants INTEGER DEFAULT 1,
    current_participants INTEGER DEFAULT 0,
    technologies TEXT[] DEFAULT '{}',
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'intermediate',
    status TEXT CHECK (status IN ('active', 'upcoming', 'completed', 'cancelled')) DEFAULT 'active',
    featured BOOLEAN DEFAULT false,
    application_deadline TIMESTAMP WITH TIME ZONE,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    meeting_schedule TEXT, -- e.g., "Weekly on Saturdays"
    prerequisites TEXT[],
    what_you_learn TEXT[],
    application_link TEXT,
    whatsapp_link TEXT,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add SEO fields to existing tables if they don't exist
DO $$ 
BEGIN
    -- Add SEO fields to hackathons
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hackathons' AND column_name = 'meta_title') THEN
        ALTER TABLE hackathons ADD COLUMN meta_title TEXT;
        ALTER TABLE hackathons ADD COLUMN meta_description TEXT;
        ALTER TABLE hackathons ADD COLUMN meta_keywords TEXT;
        ALTER TABLE hackathons ADD COLUMN views_count INTEGER DEFAULT 0;
    END IF;

    -- Add SEO fields to jobs
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'meta_title') THEN
        ALTER TABLE jobs ADD COLUMN meta_title TEXT;
        ALTER TABLE jobs ADD COLUMN meta_description TEXT;
        ALTER TABLE jobs ADD COLUMN meta_keywords TEXT;
        ALTER TABLE jobs ADD COLUMN views_count INTEGER DEFAULT 0;
        ALTER TABLE jobs ADD COLUMN slug TEXT;
    END IF;

    -- Add SEO fields to courses
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'meta_title') THEN
        ALTER TABLE courses ADD COLUMN meta_title TEXT;
        ALTER TABLE courses ADD COLUMN meta_description TEXT;
        ALTER TABLE courses ADD COLUMN meta_keywords TEXT;
        ALTER TABLE courses ADD COLUMN views_count INTEGER DEFAULT 0;
        ALTER TABLE courses ADD COLUMN slug TEXT;
    END IF;
END $$;

-- Create indexes for SEO optimization
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_blog_posts_categories ON blog_posts USING GIN(categories);

CREATE INDEX IF NOT EXISTS idx_mentorship_slug ON mentorship_programs(slug);
CREATE INDEX IF NOT EXISTS idx_mentorship_status ON mentorship_programs(status);
CREATE INDEX IF NOT EXISTS idx_mentorship_featured ON mentorship_programs(featured);
CREATE INDEX IF NOT EXISTS idx_mentorship_technologies ON mentorship_programs USING GIN(technologies);

CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs(slug);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);

-- Enable RLS on new tables
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_programs ENABLE ROW LEVEL SECURITY;

-- Create permissive RLS policies
CREATE POLICY "blog_posts_select_policy" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "blog_posts_insert_policy" ON blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "blog_posts_update_policy" ON blog_posts FOR UPDATE USING (true);
CREATE POLICY "blog_posts_delete_policy" ON blog_posts FOR DELETE USING (true);

CREATE POLICY "mentorship_select_policy" ON mentorship_programs FOR SELECT USING (true);
CREATE POLICY "mentorship_insert_policy" ON mentorship_programs FOR INSERT WITH CHECK (true);
CREATE POLICY "mentorship_update_policy" ON mentorship_programs FOR UPDATE USING (true);
CREATE POLICY "mentorship_delete_policy" ON mentorship_programs FOR DELETE USING (true);

COMMIT;
