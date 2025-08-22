-- Seed sample data with SEO optimization
BEGIN;

-- Update existing hackathons with SEO data
UPDATE hackathons SET 
    meta_title = title || ' | Apna Coding Hackathon',
    meta_description = 'Join ' || title || ' hackathon. Build innovative projects, win prizes, and connect with global developers. Hosted by Apna Coding.',
    meta_keywords = LOWER(title) || ', hackathon, coding competition, Apna Coding, tech event, programming contest'
WHERE meta_title IS NULL;

-- Update existing jobs with SEO data and slugs
UPDATE jobs SET 
    slug = LOWER(REGEXP_REPLACE(title || '-' || company, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(id::text, 1, 8),
    meta_title = title || ' at ' || company || ' | Apna Coding Jobs',
    meta_description = 'Apply for ' || title || ' position at ' || company || '. Exclusive tech job opportunity via Apna Coding.',
    meta_keywords = LOWER(title) || ', ' || LOWER(company) || ' careers, tech jobs, software engineer, Apna Coding jobs'
WHERE slug IS NULL;

-- Update existing courses with SEO data and slugs
UPDATE courses SET 
    slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(id::text, 1, 8),
    meta_title = 'Learn ' || title || ' | Apna Coding Course',
    meta_description = 'Master ' || title || ' with Apna Coding''s comprehensive course. Get hands-on experience and certification.',
    meta_keywords = LOWER(title) || ', coding course, online programming, Apna Coding tutorials, learn programming'
WHERE slug IS NULL;

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, content, excerpt, author_name, featured_image, tags, categories, meta_title, meta_description, meta_keywords, published, featured, published_at) VALUES
('Top 10 Hackathons to Join in 2025', 'top-10-hackathons-2025', 
'Discover the most exciting hackathons happening in 2025. From AI/ML challenges to Web3 competitions, find the perfect hackathon to showcase your skills and win amazing prizes.

## 1. ETH India 2025
The biggest Ethereum hackathon in India returns with $100K+ in prizes...

## 2. Google Solution Challenge
Build solutions for UN Sustainable Development Goals...

## 3. Microsoft Imagine Cup
The premier student technology competition...', 
'Discover the most exciting hackathons happening in 2025. From AI/ML challenges to Web3 competitions, find the perfect hackathon to showcase your skills.',
'Apna Coding Team',
'/images/blog/hackathons-2025.jpg',
ARRAY['hackathons', 'competitions', '2025', 'coding'],
ARRAY['Events', 'Hackathons'],
'Top 10 Hackathons to Join in 2025 | Apna Coding Blog',
'Discover the most exciting hackathons happening in 2025. From AI/ML challenges to Web3 competitions, find the perfect hackathon to showcase your skills.',
'hackathons 2025, coding competitions, tech events, programming contests, Apna Coding',
true, true, NOW()),

('How to Land Your First Tech Job in 2025', 'first-tech-job-2025',
'Breaking into the tech industry can be challenging, but with the right strategy and preparation, you can land your dream job. Here''s a comprehensive guide to help you get started.

## Building Your Portfolio
Your portfolio is your digital resume...

## Networking Strategies
Building connections in the tech industry...

## Interview Preparation
Technical interviews can be intimidating...',
'Breaking into the tech industry can be challenging, but with the right strategy and preparation, you can land your dream job.',
'Apna Coding Team',
'/images/blog/first-tech-job.jpg',
ARRAY['career', 'jobs', 'tech', 'beginners'],
ARRAY['Career', 'Jobs'],
'How to Land Your First Tech Job in 2025 | Apna Coding',
'Breaking into the tech industry can be challenging, but with the right strategy and preparation, you can land your dream job.',
'tech jobs 2025, software engineer career, programming jobs, tech interview tips',
true, false, NOW()),

('Best Programming Languages to Learn in 2025', 'best-programming-languages-2025',
'The tech landscape is constantly evolving. Here are the programming languages that will be most in-demand in 2025 and why you should consider learning them.

## 1. Python
Python continues to dominate in AI/ML...

## 2. JavaScript/TypeScript
Essential for web development...

## 3. Rust
Growing popularity for system programming...',
'The tech landscape is constantly evolving. Here are the programming languages that will be most in-demand in 2025.',
'Apna Coding Team',
'/images/blog/programming-languages-2025.jpg',
ARRAY['programming', 'languages', '2025', 'learning'],
ARRAY['Education', 'Programming'],
'Best Programming Languages to Learn in 2025 | Apna Coding',
'The tech landscape is constantly evolving. Here are the programming languages that will be most in-demand in 2025.',
'programming languages 2025, learn coding, Python, JavaScript, Rust, tech skills',
true, false, NOW());

-- Insert sample mentorship programs
INSERT INTO mentorship_programs (title, slug, description, mentor_name, mentor_bio, mentor_image, mentor_company, mentor_role, program_type, duration, price, max_participants, technologies, level, status, featured, start_date, end_date, meeting_schedule, prerequisites, what_you_learn, application_link, meta_title, meta_description, meta_keywords) VALUES
('Full-Stack Web Development Mentorship', 'fullstack-web-development-mentorship',
'Comprehensive mentorship program covering modern web development from frontend to backend. Learn React, Node.js, databases, and deployment strategies from industry experts.',
'Rahul Sharma',
'Senior Full-Stack Developer at Google with 8+ years of experience building scalable web applications. Passionate about mentoring the next generation of developers.',
'/images/mentors/rahul-sharma.jpg',
'Google',
'Senior Full-Stack Developer',
'one-on-one',
'12 weeks',
0,
5,
ARRAY['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'TypeScript'],
'intermediate',
'active',
true,
NOW() + INTERVAL '1 week',
NOW() + INTERVAL '13 weeks',
'Weekly 1-hour sessions on Saturdays',
ARRAY['Basic JavaScript knowledge', 'HTML/CSS fundamentals', 'Git basics'],
ARRAY['Build full-stack applications', 'Master React and Node.js', 'Database design and optimization', 'Deployment and DevOps', 'Code review and best practices'],
'https://forms.google.com/fullstack-mentorship',
'Full-Stack Web Development Mentorship | Apna Coding',
'Learn full-stack web development from Google engineer. Master React, Node.js, and modern web technologies with personalized mentorship.',
'full-stack development, React mentorship, Node.js training, web development course, Apna Coding mentorship'),

('AI/ML Career Transition Program', 'ai-ml-career-transition',
'Transition into AI/ML field with guidance from industry experts. Cover machine learning fundamentals, deep learning, and practical project implementation.',
'Dr. Priya Patel',
'AI Research Scientist at Microsoft with PhD in Machine Learning. Published 20+ research papers and mentored 50+ professionals transitioning to AI.',
'/images/mentors/priya-patel.jpg',
'Microsoft',
'AI Research Scientist',
'group',
'16 weeks',
0,
10,
ARRAY['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy'],
'beginner',
'upcoming',
true,
NOW() + INTERVAL '2 weeks',
NOW() + INTERVAL '18 weeks',
'Bi-weekly group sessions + monthly 1-on-1',
ARRAY['Basic Python programming', 'Mathematics fundamentals', 'Statistics basics'],
ARRAY['Machine learning algorithms', 'Deep learning with TensorFlow', 'Data preprocessing and analysis', 'Model deployment', 'AI project portfolio'],
'https://forms.google.com/ai-ml-mentorship',
'AI/ML Career Transition Program | Apna Coding',
'Transition into AI/ML career with Microsoft research scientist. Learn machine learning, deep learning, and build AI projects.',
'AI career transition, machine learning mentorship, deep learning course, AI jobs, data science training'),

('Mobile App Development with React Native', 'react-native-mobile-development',
'Learn to build cross-platform mobile applications using React Native. From basics to advanced concepts including navigation, state management, and app store deployment.',
'Amit Kumar',
'Lead Mobile Developer at Flipkart with 6+ years of experience. Built and launched 10+ mobile apps with millions of downloads.',
'/images/mentors/amit-kumar.jpg',
'Flipkart',
'Lead Mobile Developer',
'workshop',
'8 weeks',
0,
15,
ARRAY['React Native', 'JavaScript', 'Redux', 'Firebase', 'Expo'],
'intermediate',
'active',
false,
NOW() + INTERVAL '3 days',
NOW() + INTERVAL '8 weeks 3 days',
'Weekly 2-hour workshops on Sundays',
ARRAY['React fundamentals', 'JavaScript ES6+', 'Mobile development basics'],
ARRAY['React Native development', 'Navigation and routing', 'State management with Redux', 'API integration', 'App store deployment'],
'https://forms.google.com/react-native-workshop',
'Mobile App Development with React Native | Apna Coding',
'Learn React Native mobile development from Flipkart lead developer. Build cross-platform apps and deploy to app stores.',
'React Native course, mobile app development, cross-platform apps, JavaScript mobile, app development mentorship');

COMMIT;
