-- Create comprehensive SEO-optimized database schema
BEGIN;

-- Create blog posts table for SEO content
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    published BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    tags TEXT[],
    category TEXT,
    reading_time INTEGER,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Create mentorship programs table
CREATE TABLE IF NOT EXISTS mentorship_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    mentor_name TEXT NOT NULL,
    mentor_avatar TEXT,
    mentor_bio TEXT,
    mentor_experience TEXT,
    skills TEXT[],
    duration TEXT,
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    schedule TEXT,
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'intermediate',
    featured BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add SEO fields to existing tables if they don't exist
DO $$ 
BEGIN
    -- Add SEO fields to hackathons
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hackathons' AND column_name = 'seo_title') THEN
        ALTER TABLE hackathons ADD COLUMN seo_title TEXT;
        ALTER TABLE hackathons ADD COLUMN seo_description TEXT;
        ALTER TABLE hackathons ADD COLUMN seo_keywords TEXT[];
        ALTER TABLE hackathons ADD COLUMN views INTEGER DEFAULT 0;
    END IF;

    -- Add SEO fields to jobs
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'seo_title') THEN
        ALTER TABLE jobs ADD COLUMN seo_title TEXT;
        ALTER TABLE jobs ADD COLUMN seo_description TEXT;
        ALTER TABLE jobs ADD COLUMN seo_keywords TEXT[];
        ALTER TABLE jobs ADD COLUMN views INTEGER DEFAULT 0;
        ALTER TABLE jobs ADD COLUMN slug TEXT;
    END IF;

    -- Add SEO fields to courses
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'seo_title') THEN
        ALTER TABLE courses ADD COLUMN seo_title TEXT;
        ALTER TABLE courses ADD COLUMN seo_description TEXT;
        ALTER TABLE courses ADD COLUMN seo_keywords TEXT[];
        ALTER TABLE courses ADD COLUMN views INTEGER DEFAULT 0;
        ALTER TABLE courses ADD COLUMN slug TEXT;
    END IF;
END $$;

-- Create indexes for SEO optimization
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_mentorship_programs_slug ON mentorship_programs(slug);
CREATE INDEX IF NOT EXISTS idx_mentorship_programs_active ON mentorship_programs(active);

-- Enable RLS on new tables
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_programs ENABLE ROW LEVEL SECURITY;

-- Create permissive RLS policies
CREATE POLICY "Blog posts are viewable by everyone" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Mentorship programs are viewable by everyone" ON mentorship_programs
  FOR SELECT USING (active = true);

-- Admin policies (using service role)
CREATE POLICY "Admins can manage blog posts" ON blog_posts
  FOR ALL USING (true);

CREATE POLICY "Admins can manage mentorship programs" ON mentorship_programs
  FOR ALL USING (true);

COMMIT;
