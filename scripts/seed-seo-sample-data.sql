-- Insert sample blog posts
INSERT INTO blog_posts (
  title, slug, content, excerpt, author_name, author_avatar, published, featured, 
  tags, category, reading_time, seo_title, seo_description, seo_keywords, published_at
) VALUES 
(
  'Getting Started with React Hooks',
  'getting-started-with-react-hooks',
  'React Hooks revolutionized how we write React components. In this comprehensive guide, we''ll explore useState, useEffect, and custom hooks with practical examples.',
  'Learn React Hooks from scratch with practical examples and best practices.',
  'Shriyash Soni',
  '/images/shriyash-soni.jpeg',
  true,
  true,
  ARRAY['react', 'hooks', 'javascript', 'frontend'],
  'Web Development',
  8,
  'Getting Started with React Hooks - Complete Guide | Apna Coding',
  'Master React Hooks with this comprehensive guide. Learn useState, useEffect, and custom hooks with practical examples and best practices.',
  ARRAY['react hooks', 'useState', 'useEffect', 'react tutorial', 'javascript hooks'],
  NOW()
),
(
  'Building Scalable APIs with Node.js',
  'building-scalable-apis-with-nodejs',
  'Learn how to build production-ready APIs with Node.js, Express, and MongoDB. We''ll cover authentication, rate limiting, caching, and deployment strategies.',
  'Complete guide to building scalable and secure APIs with Node.js and Express.',
  'Shriyash Soni',
  '/images/shriyash-soni.jpeg',
  true,
  false,
  ARRAY['nodejs', 'api', 'express', 'mongodb', 'backend'],
  'Backend Development',
  12,
  'Building Scalable APIs with Node.js and Express | Apna Coding',
  'Learn to build production-ready APIs with Node.js, Express, and MongoDB. Covers authentication, security, and deployment.',
  ARRAY['nodejs api', 'express js', 'mongodb', 'backend development', 'api security'],
  NOW()
),
(
  'Machine Learning for Beginners',
  'machine-learning-for-beginners',
  'Start your machine learning journey with Python. This beginner-friendly guide covers fundamental concepts, algorithms, and hands-on projects.',
  'Beginner-friendly introduction to machine learning with Python and practical projects.',
  'Shriyash Soni',
  '/images/shriyash-soni.jpeg',
  true,
  true,
  ARRAY['machine-learning', 'python', 'ai', 'data-science'],
  'Data Science',
  15,
  'Machine Learning for Beginners - Complete Python Guide | Apna Coding',
  'Start your ML journey with this beginner-friendly guide. Learn Python, algorithms, and build real projects.',
  ARRAY['machine learning', 'python ml', 'ai for beginners', 'data science tutorial'],
  NOW()
);

-- Insert sample mentorship programs
INSERT INTO mentorship_programs (
  title, slug, description, mentor_name, mentor_avatar, mentor_bio, mentor_experience,
  skills, duration, price, max_participants, start_date, end_date, schedule, level,
  featured, seo_title, seo_description, seo_keywords
) VALUES 
(
  'Full Stack Web Development Mentorship',
  'full-stack-web-development-mentorship',
  'Comprehensive mentorship program covering React, Node.js, databases, and deployment. Get personalized guidance and build real-world projects.',
  'Shriyash Soni',
  '/images/shriyash-soni.jpeg',
  'Senior Full Stack Developer with 5+ years of experience at top tech companies.',
  'Led development teams at Google and Microsoft, built scalable applications serving millions of users.',
  ARRAY['React', 'Node.js', 'MongoDB', 'AWS', 'Docker'],
  '12 weeks',
  299.00,
  20,
  '2024-02-01',
  '2024-04-30',
  'Weekly 1-on-1 sessions + group workshops',
  'intermediate',
  true,
  'Full Stack Web Development Mentorship with Industry Expert | Apna Coding',
  'Get mentored by industry experts in full stack development. Learn React, Node.js, and build production-ready applications.',
  ARRAY['full stack mentorship', 'react mentoring', 'nodejs mentor', 'web development coaching']
),
(
  'Data Science Career Transition',
  'data-science-career-transition',
  'Perfect for professionals looking to transition into data science. Covers Python, machine learning, and portfolio building.',
  'Shriyash Soni',
  '/images/shriyash-soni.jpeg',
  'Data Science Lead with expertise in ML and AI applications.',
  'Built ML models for Fortune 500 companies, published research in top conferences.',
  ARRAY['Python', 'Machine Learning', 'SQL', 'Tableau', 'Statistics'],
  '16 weeks',
  399.00,
  15,
  '2024-03-01',
  '2024-06-30',
  'Bi-weekly sessions + project reviews',
  'beginner',
  true,
  'Data Science Career Transition Mentorship | Apna Coding',
  'Transition to data science with expert mentorship. Learn Python, ML, and build a winning portfolio.',
  ARRAY['data science mentorship', 'career transition', 'python data science', 'ml mentoring']
),
(
  'Mobile App Development with React Native',
  'mobile-app-development-react-native',
  'Learn to build cross-platform mobile apps with React Native. From basics to app store deployment.',
  'Shriyash Soni',
  '/images/shriyash-soni.jpeg',
  'Mobile development expert with 50+ apps published on app stores.',
  'Senior Mobile Developer at top startups, expertise in React Native and Flutter.',
  ARRAY['React Native', 'JavaScript', 'Mobile UI/UX', 'App Store Optimization'],
  '10 weeks',
  249.00,
  25,
  '2024-02-15',
  '2024-04-30',
  'Weekly group sessions + individual code reviews',
  'intermediate',
  false,
  'React Native Mobile Development Mentorship | Apna Coding',
  'Master mobile app development with React Native. Build and deploy apps to iOS and Android stores.',
  ARRAY['react native mentorship', 'mobile app development', 'cross platform apps', 'app store deployment']
);

-- Update existing data with SEO fields
UPDATE hackathons SET 
  seo_title = title || ' Hackathon | Apna Coding',
  seo_description = 'Join ' || title || ' hackathon. Build innovative projects, win prizes, and network with industry experts. Register now on Apna Coding.',
  seo_keywords = ARRAY[LOWER(REPLACE(title, ' ', '-')), 'hackathon', 'coding competition', 'tech event', 'apna coding']
WHERE seo_title IS NULL;

UPDATE jobs SET 
  seo_title = title || ' at ' || company || ' | Apna Coding',
  seo_description = 'Apply for ' || title || ' position at ' || company || '. Exclusive tech job opportunity through Apna Coding platform.',
  seo_keywords = ARRAY[LOWER(REPLACE(title, ' ', '-')), LOWER(company), 'tech jobs', 'software engineer', 'developer jobs']
WHERE seo_title IS NULL;

UPDATE courses SET 
  seo_title = 'Learn ' || title || ' | Apna Coding',
  seo_description = 'Master ' || title || ' with Apna Coding''s comprehensive course. Interactive lessons, projects, and certification included.',
  seo_keywords = ARRAY[LOWER(REPLACE(title, ' ', '-')), 'online course', 'programming tutorial', 'coding bootcamp', 'tech education']
WHERE seo_title IS NULL;
