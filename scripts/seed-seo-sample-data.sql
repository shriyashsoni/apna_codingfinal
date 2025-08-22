-- Seed sample data with SEO optimization

-- Insert sample blog posts
INSERT INTO blog_posts (
    title, slug, content, excerpt, author_name, featured_image, category, tags,
    seo_title, seo_description, seo_keywords,
    og_title, og_description, og_image,
    published_at, featured
) VALUES 
(
    'Top 10 Coding Challenges for Beginners in 2025',
    'top-10-coding-challenges-beginners-2025',
    'Learning to code can be overwhelming, but with the right challenges, you can build your skills systematically. Here are the top 10 coding challenges every beginner should try in 2025...',
    'Discover the best coding challenges for beginners to build programming skills and confidence in 2025.',
    'Shriyash Soni',
    '/images/blog/coding-challenges-2025.jpg',
    'Programming',
    ARRAY['coding', 'beginners', 'challenges', 'programming', '2025'],
    'Top 10 Coding Challenges for Beginners in 2025 | Apna Coding',
    'Discover the best coding challenges for beginners to build programming skills and confidence in 2025. Start your coding journey with Apna Coding.',
    ARRAY['coding challenges', 'beginner programming', 'learn coding', 'programming exercises', 'Apna Coding'],
    'Top 10 Coding Challenges for Beginners in 2025',
    'Discover the best coding challenges for beginners to build programming skills and confidence in 2025.',
    '/images/blog/coding-challenges-2025.jpg',
    NOW() - INTERVAL '2 days',
    true
),
(
    'How to Land Your First Tech Job in 2025',
    'how-to-land-first-tech-job-2025',
    'The tech job market is competitive, but with the right strategy, you can land your dream job. Here''s a comprehensive guide to getting your first tech job in 2025...',
    'Complete guide to landing your first tech job in 2025 with tips, strategies, and resources.',
    'Shriyash Soni',
    '/images/blog/first-tech-job-2025.jpg',
    'Career',
    ARRAY['career', 'tech jobs', 'job search', 'interview', '2025'],
    'How to Land Your First Tech Job in 2025 | Apna Coding',
    'Complete guide to landing your first tech job in 2025 with tips, strategies, and resources from Apna Coding.',
    ARRAY['tech jobs', 'first job', 'career advice', 'job interview', 'Apna Coding'],
    'How to Land Your First Tech Job in 2025',
    'Complete guide to landing your first tech job in 2025 with tips, strategies, and resources.',
    '/images/blog/first-tech-job-2025.jpg',
    NOW() - INTERVAL '5 days',
    true
),
(
    'Best Programming Languages to Learn in 2025',
    'best-programming-languages-learn-2025',
    'Choosing the right programming language can make or break your coding career. Here are the most in-demand programming languages you should learn in 2025...',
    'Discover the most in-demand programming languages to learn in 2025 for career growth.',
    'Shriyash Soni',
    '/images/blog/programming-languages-2025.jpg',
    'Programming',
    ARRAY['programming languages', 'career', 'learning', '2025', 'skills'],
    'Best Programming Languages to Learn in 2025 | Apna Coding',
    'Discover the most in-demand programming languages to learn in 2025 for career growth and opportunities.',
    ARRAY['programming languages', 'learn coding', 'career growth', 'tech skills', 'Apna Coding'],
    'Best Programming Languages to Learn in 2025',
    'Discover the most in-demand programming languages to learn in 2025 for career growth.',
    '/images/blog/programming-languages-2025.jpg',
    NOW() - INTERVAL '1 week',
    false
);

-- Insert sample mentorship programs
INSERT INTO mentorship_programs (
    title, slug, description, mentor_name, mentor_bio, mentor_image, mentor_company, mentor_position,
    duration, format, price, max_participants,
    skills_covered, prerequisites, target_audience, features, what_you_learn, career_outcomes,
    start_date, end_date, application_deadline,
    seo_title, seo_description, seo_keywords,
    og_title, og_description, og_image,
    featured
) VALUES 
(
    'Full Stack Development Mentorship',
    'full-stack-development-mentorship',
    'Comprehensive mentorship program covering full stack development from basics to advanced concepts. Learn React, Node.js, databases, and deployment strategies.',
    'Shriyash Soni',
    'Senior Full Stack Developer with 8+ years of experience at top tech companies. Specialized in React, Node.js, and cloud technologies.',
    '/images/mentors/shriyash-soni.jpg',
    'Apna Coding',
    'Founder & Lead Developer',
    '12 weeks',
    '1-on-1',
    299.00,
    10,
    ARRAY['React', 'Node.js', 'MongoDB', 'Express.js', 'AWS', 'Git', 'API Development'],
    ARRAY['Basic JavaScript knowledge', 'HTML/CSS fundamentals', 'Problem-solving mindset'],
    ARRAY['Aspiring full stack developers', 'Career changers', 'Computer science students'],
    ARRAY['Weekly 1-on-1 sessions', 'Code reviews', 'Project guidance', 'Career counseling', 'Resume review'],
    ARRAY['Build 3 full stack projects', 'Master modern development tools', 'Learn deployment strategies', 'Understand system design'],
    ARRAY['Land full stack developer roles', 'Increase salary by 40-60%', 'Build impressive portfolio', 'Network with industry professionals'],
    NOW() + INTERVAL '2 weeks',
    NOW() + INTERVAL '14 weeks',
    NOW() + INTERVAL '1 week',
    'Full Stack Development Mentorship Program | Apna Coding',
    'Join our comprehensive full stack development mentorship program. Learn React, Node.js, and modern web technologies with expert guidance.',
    ARRAY['full stack mentorship', 'React mentoring', 'Node.js coaching', 'web development mentor', 'Apna Coding'],
    'Full Stack Development Mentorship Program',
    'Join our comprehensive full stack development mentorship program. Learn React, Node.js, and modern web technologies.',
    '/images/mentors/shriyash-soni.jpg',
    true
),
(
    'Data Science Career Transition',
    'data-science-career-transition',
    'Transition into data science with hands-on mentorship. Learn Python, machine learning, data analysis, and portfolio building.',
    'Dr. Priya Sharma',
    'Data Science Lead at Microsoft with PhD in Machine Learning. 10+ years experience in AI/ML and data analytics.',
    '/images/mentors/priya-sharma.jpg',
    'Microsoft',
    'Senior Data Scientist',
    '16 weeks',
    'group',
    199.00,
    15,
    ARRAY['Python', 'Pandas', 'Scikit-learn', 'TensorFlow', 'SQL', 'Statistics', 'Data Visualization'],
    ARRAY['Basic programming knowledge', 'Mathematics fundamentals', 'Analytical thinking'],
    ARRAY['Career changers', 'Software engineers', 'Analytics professionals'],
    ARRAY['Bi-weekly group sessions', 'Individual project reviews', 'Industry case studies', 'Job placement assistance'],
    ARRAY['Master data science tools', 'Build ML models', 'Create data visualizations', 'Develop portfolio projects'],
    ARRAY['Transition to data science roles', 'Increase earning potential', 'Work on impactful projects', 'Join growing field'],
    NOW() + INTERVAL '3 weeks',
    NOW() + INTERVAL '19 weeks',
    NOW() + INTERVAL '2 weeks',
    'Data Science Career Transition Mentorship | Apna Coding',
    'Transition into data science with expert mentorship. Learn Python, ML, and data analysis with hands-on projects.',
    ARRAY['data science mentorship', 'career transition', 'machine learning', 'Python coaching', 'Apna Coding'],
    'Data Science Career Transition Mentorship',
    'Transition into data science with expert mentorship. Learn Python, ML, and data analysis.',
    '/images/mentors/priya-sharma.jpg',
    true
);

-- Update existing hackathons with SEO data
UPDATE hackathons SET 
    seo_title = 'Hackathon: ' || title || ' | Apna Coding',
    seo_description = 'Join ' || title || ' hackathon. Win prizes, gain skills, and connect with global mentors. Hosted by Apna Coding.',
    seo_keywords = ARRAY[title, 'coding competition', 'hackathon 2025', 'Apna Coding events'] || technologies,
    og_title = 'Hackathon: ' || title,
    og_description = 'Join ' || title || ' hackathon. Win prizes, gain skills, and connect with global mentors.',
    og_image = COALESCE(image_url, '/images/hackathon-hero.png')
WHERE seo_title IS NULL;

-- Update existing jobs with SEO data
UPDATE jobs SET 
    seo_title = title || ' at ' || company || ' | Apna Coding',
    seo_description = 'Apply for ' || title || ' at ' || company || '. Exclusive tech job via Apna Coding.',
    seo_keywords = ARRAY[title, company || ' careers', 'tech jobs 2025', 'coding jobs'] || technologies,
    og_title = title || ' at ' || company,
    og_description = 'Apply for ' || title || ' at ' || company || '. Exclusive tech job via Apna Coding.',
    og_image = COALESCE(company_logo, '/images/job-default.png')
WHERE seo_title IS NULL;

-- Update existing courses with SEO data
UPDATE courses SET 
    seo_title = 'Learn ' || title || ' | Apna Coding',
    seo_description = 'Master ' || title || ' with Apna Coding''s interactive course. Get certification & real-world projects.',
    seo_keywords = ARRAY[title, 'coding course', 'online programming class', 'Apna Coding tutorials'] || technologies,
    og_title = 'Learn ' || title,
    og_description = 'Master ' || title || ' with Apna Coding''s interactive course. Get certification & real-world projects.',
    og_image = COALESCE(image_url, '/images/course-default.png')
WHERE seo_title IS NULL;
