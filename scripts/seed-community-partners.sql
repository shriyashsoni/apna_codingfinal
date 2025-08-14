-- Insert sample community partners data
INSERT INTO community_partners (
  name,
  logo_url,
  website_url,
  description,
  category,
  member_count,
  location,
  status,
  is_featured
) VALUES
(
  'React Delhi',
  '/placeholder.svg?height=100&width=100&text=RD',
  'https://reactdelhi.com',
  'Largest React community in India with monthly meetups and conferences',
  'Tech Communities',
  15000,
  'India',
  'active',
  true
),
(
  'Google Developer Groups Delhi',
  '/placeholder.svg?height=100&width=100&text=GDG',
  'https://gdgdelhi.com',
  'Official Google Developer Group for Delhi NCR region',
  'Developer Groups',
  8500,
  'Delhi, India',
  'active',
  true
),
(
  'Women Who Code Delhi',
  '/placeholder.svg?height=100&width=100&text=WWC',
  'https://womenwhocode.com/delhi',
  'Empowering women in technology through community and mentorship',
  'Professional Networks',
  3200,
  'Delhi, India',
  'active',
  false
),
(
  'Coding Ninjas Community',
  '/placeholder.svg?height=100&width=100&text=CN',
  'https://codingninjas.com/community',
  'Student community focused on competitive programming and placements',
  'Student Organizations',
  25000,
  'India',
  'active',
  true
),
(
  'PyDelhi',
  '/placeholder.svg?height=100&width=100&text=PY',
  'https://pydelhi.org',
  'Python community in Delhi with regular workshops and talks',
  'Tech Communities',
  4500,
  'Delhi, India',
  'active',
  false
),
(
  'Mozilla Campus Clubs',
  '/placeholder.svg?height=100&width=100&text=MCC',
  'https://campus.mozilla.community',
  'Student clubs promoting open source and web literacy',
  'Student Organizations',
  12000,
  'Global',
  'active',
  false
),
(
  'GitHub Campus Experts',
  '/placeholder.svg?height=100&width=100&text=GCE',
  'https://education.github.com/experts',
  'Student leaders building tech communities at universities',
  'Student Organizations',
  800,
  'Global',
  'active',
  true
),
(
  'TechStars Startup Community',
  '/placeholder.svg?height=100&width=100&text=TS',
  'https://techstars.com',
  'Global startup accelerator and community',
  'Startup Communities',
  5000,
  'Global',
  'active',
  false
),
(
  'FreeCodeCamp Delhi',
  '/placeholder.svg?height=100&width=100&text=FCC',
  'https://freecodecamp.org/news/freecodecamp-delhi',
  'Local chapter of the global coding education community',
  'Educational Institutions',
  7800,
  'Delhi, India',
  'active',
  false
),
(
  'DevFest Community',
  '/placeholder.svg?height=100&width=100&text=DF',
  'https://devfest.withgoogle.com',
  'Annual developer festival organized by GDGs worldwide',
  'Developer Groups',
  50000,
  'Global',
  'active',
  true
);
