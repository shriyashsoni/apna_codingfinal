-- Create comprehensive SEO-optimized database schema
-- Drop existing tables if they exist (be careful in production)
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS mentorship_programs CASCADE;

-- Create blog_posts table with full SEO support
CREATE TABLE blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID REFERENCES users(id),
    author_name VARCHAR(255),
    featured_image TEXT,
    category VARCHAR(100),
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    reading_time INTEGER, -- in minutes
    
    -- SEO fields
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    canonical_url TEXT,
    
    -- Social media
    og_title VARCHAR(255),
    og_description TEXT,
    og_image TEXT,
    twitter_title VARCHAR(255),
    twitter_description TEXT,
    twitter_image TEXT,
    
    -- Timestamps
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mentorship_programs table
CREATE TABLE mentorship_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    mentor_name VARCHAR(255) NOT NULL,
    mentor_bio TEXT,
    mentor_image TEXT,
    mentor_company VARCHAR(255),
    mentor_position VARCHAR(255),
    
    -- Program details
    duration VARCHAR(100), -- e.g., "8 weeks", "3 months"
    format VARCHAR(50), -- "1-on-1", "group", "hybrid"
    price DECIMAL(10,2) DEFAULT 0,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    
    -- Skills and requirements
    skills_covered TEXT[],
    prerequisites TEXT[],
    target_audience TEXT[],
    
    -- Program features
    features TEXT[],
    what_you_learn TEXT[],
    career_outcomes TEXT[],
    
    -- Scheduling
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    application_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Status and visibility
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'full', 'completed')),
    featured BOOLEAN DEFAULT false,
    
    -- Contact and application
    application_link TEXT,
    contact_email VARCHAR(255),
    
    -- SEO fields
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    
    -- Social media
    og_title VARCHAR(255),
    og_description TEXT,
    og_image TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Add SEO fields to existing tables
-- Add SEO fields to hackathons table
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255);
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS seo_keywords TEXT[];
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS og_title VARCHAR(255);
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS og_image TEXT;

-- Add SEO fields to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS seo_keywords TEXT[];
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS og_title VARCHAR(255);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS og_image TEXT;

-- Add SEO fields to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS seo_keywords TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS og_title VARCHAR(255);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS og_image TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);

CREATE INDEX IF NOT EXISTS idx_mentorship_programs_slug ON mentorship_programs(slug);
CREATE INDEX IF NOT EXISTS idx_mentorship_programs_status ON mentorship_programs(status);
CREATE INDEX IF NOT EXISTS idx_mentorship_programs_featured ON mentorship_programs(featured);

-- Create RLS policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_programs ENABLE ROW LEVEL SECURITY;

-- Blog posts policies
CREATE POLICY "Blog posts are viewable by everyone" ON blog_posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Users can insert their own blog posts" ON blog_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own blog posts" ON blog_posts
    FOR UPDATE USING (auth.uid() = author_id);

-- Mentorship programs policies
CREATE POLICY "Mentorship programs are viewable by everyone" ON mentorship_programs
    FOR SELECT USING (status = 'active');

CREATE POLICY "Authenticated users can insert mentorship programs" ON mentorship_programs
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own mentorship programs" ON mentorship_programs
    FOR UPDATE USING (auth.uid() = created_by);

-- Create functions for automatic slug generation
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Create trigger functions for automatic SEO field population
CREATE OR REPLACE FUNCTION auto_generate_seo_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate slug if not provided
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.title);
    END IF;
    
    -- Generate SEO title if not provided
    IF NEW.seo_title IS NULL OR NEW.seo_title = '' THEN
        NEW.seo_title := NEW.title || ' | Apna Coding';
    END IF;
    
    -- Generate SEO description if not provided
    IF NEW.seo_description IS NULL OR NEW.seo_description = '' THEN
        NEW.seo_description := LEFT(NEW.description, 155) || '...';
    END IF;
    
    -- Set updated_at
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic SEO field population
CREATE TRIGGER blog_posts_seo_trigger
    BEFORE INSERT OR UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION auto_generate_seo_fields();

CREATE TRIGGER mentorship_programs_seo_trigger
    BEFORE INSERT OR UPDATE ON mentorship_programs
    FOR EACH ROW EXECUTE FUNCTION auto_generate_seo_fields();

-- Create function to update hackathon SEO fields
CREATE OR REPLACE FUNCTION update_hackathon_seo()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate SEO title if not provided
    IF NEW.seo_title IS NULL OR NEW.seo_title = '' THEN
        NEW.seo_title := 'Hackathon: ' || NEW.title || ' | Apna Coding';
    END IF;
    
    -- Generate SEO description if not provided
    IF NEW.seo_description IS NULL OR NEW.seo_description = '' THEN
        NEW.seo_description := 'Join ' || NEW.title || ' hackathon. Win prizes, gain skills, and connect with global mentors. Hosted by Apna Coding.';
    END IF;
    
    -- Generate SEO keywords if not provided
    IF NEW.seo_keywords IS NULL OR array_length(NEW.seo_keywords, 1) IS NULL THEN
        NEW.seo_keywords := ARRAY[NEW.title, 'coding competition', 'hackathon 2025', 'Apna Coding events'] || NEW.technologies;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for hackathons SEO
CREATE TRIGGER hackathons_seo_trigger
    BEFORE INSERT OR UPDATE ON hackathons
    FOR EACH ROW EXECUTE FUNCTION update_hackathon_seo();

-- Create function to update job SEO fields
CREATE OR REPLACE FUNCTION update_job_seo()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate SEO title if not provided
    IF NEW.seo_title IS NULL OR NEW.seo_title = '' THEN
        NEW.seo_title := NEW.title || ' at ' || NEW.company || ' | Apna Coding';
    END IF;
    
    -- Generate SEO description if not provided
    IF NEW.seo_description IS NULL OR NEW.seo_description = '' THEN
        NEW.seo_description := 'Apply for ' || NEW.title || ' at ' || NEW.company || '. Exclusive tech job via Apna Coding.';
    END IF;
    
    -- Generate SEO keywords if not provided
    IF NEW.seo_keywords IS NULL OR array_length(NEW.seo_keywords, 1) IS NULL THEN
        NEW.seo_keywords := ARRAY[NEW.title, NEW.company || ' careers', 'tech jobs 2025', 'coding jobs'] || NEW.technologies;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for jobs SEO
CREATE TRIGGER jobs_seo_trigger
    BEFORE INSERT OR UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_job_seo();

-- Create function to update course SEO fields
CREATE OR REPLACE FUNCTION update_course_seo()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate SEO title if not provided
    IF NEW.seo_title IS NULL OR NEW.seo_title = '' THEN
        NEW.seo_title := 'Learn ' || NEW.title || ' | Apna Coding';
    END IF;
    
    -- Generate SEO description if not provided
    IF NEW.seo_description IS NULL OR NEW.seo_description = '' THEN
        NEW.seo_description := 'Master ' || NEW.title || ' with Apna Coding''s interactive course. Get certification & real-world projects.';
    END IF;
    
    -- Generate SEO keywords if not provided
    IF NEW.seo_keywords IS NULL OR array_length(NEW.seo_keywords, 1) IS NULL THEN
        NEW.seo_keywords := ARRAY[NEW.title, 'coding course', 'online programming class', 'Apna Coding tutorials'] || NEW.technologies;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for courses SEO
CREATE TRIGGER courses_seo_trigger
    BEFORE INSERT OR UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_course_seo();
