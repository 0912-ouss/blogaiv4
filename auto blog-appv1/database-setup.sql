-- AI Automated Blog - Database Setup
-- Run this in your Supabase SQL Editor

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image VARCHAR(500),
  category_id INTEGER,
  author VARCHAR(100) DEFAULT 'Admin',
  status VARCHAR(20) DEFAULT 'published',
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
('Technology', 'technology', 'Latest tech news and innovations'),
('Business', 'business', 'Business insights and strategies'),
('Lifestyle', 'lifestyle', 'Lifestyle tips and trends'),
('Sports', 'sports', 'Sports news and updates'),
('Health', 'health', 'Health and wellness articles'),
('Travel', 'travel', 'Travel guides and destinations')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample articles
INSERT INTO articles (title, slug, content, excerpt, category_id, featured_image, author) VALUES
(
  'Welcome to Our Blog',
  'welcome-to-our-blog',
  '<div class="post-content">
    <h2>Welcome to Our Blog Platform</h2>
    <p>This is your first article on our new AI-powered blog platform. We''re excited to share amazing content with you!</p>
    <h3>What You Can Expect</h3>
    <ul>
      <li>High-quality articles on various topics</li>
      <li>Regular updates and fresh content</li>
      <li>Engaging stories and insights</li>
      <li>Easy-to-navigate interface</li>
    </ul>
    <p>Stay tuned for more exciting content!</p>
  </div>',
  'Welcome to our new blog platform. Start your journey with us today!',
  1,
  '/images/all/banner.jpg',
  'Admin'
),
(
  'Getting Started with AI Technology',
  'getting-started-with-ai-technology',
  '<div class="post-content">
    <h2>The Future of AI</h2>
    <p>Artificial Intelligence is transforming the way we live and work. From automation to data analysis, AI is everywhere.</p>
    <h3>Key Benefits of AI</h3>
    <p>AI technology brings numerous advantages to businesses and individuals alike:</p>
    <ul>
      <li>Increased efficiency and productivity</li>
      <li>Better decision-making through data insights</li>
      <li>Cost reduction through automation</li>
      <li>Enhanced customer experiences</li>
    </ul>
    <p>Learn more about how AI can benefit your business today!</p>
  </div>',
  'Discover how AI technology is revolutionizing industries and creating new opportunities.',
  1,
  '/images/all/1.jpg',
  'Tech Writer'
),
(
  '5 Business Strategies for Success',
  '5-business-strategies-for-success',
  '<div class="post-content">
    <h2>Winning Business Strategies</h2>
    <p>Success in business requires careful planning and execution. Here are five proven strategies to help your business thrive.</p>
    <h3>1. Focus on Customer Value</h3>
    <p>Always put your customers first and deliver exceptional value.</p>
    <h3>2. Embrace Innovation</h3>
    <p>Stay ahead of the competition by constantly innovating.</p>
    <h3>3. Build Strong Teams</h3>
    <p>Invest in your people - they are your greatest asset.</p>
    <h3>4. Data-Driven Decisions</h3>
    <p>Use analytics to make informed business decisions.</p>
    <h3>5. Adapt and Evolve</h3>
    <p>Be flexible and ready to pivot when necessary.</p>
  </div>',
  'Learn the top 5 strategies that successful businesses use to stay competitive and grow.',
  2,
  '/images/bg/1.jpg',
  'Business Expert'
)
ON CONFLICT (slug) DO NOTHING;

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY IF NOT EXISTS "Allow public read access to articles" 
ON articles FOR SELECT 
USING (status = 'published');

CREATE POLICY IF NOT EXISTS "Allow public read access to categories" 
ON categories FOR SELECT 
USING (true);

-- Grant permissions
GRANT SELECT ON articles TO anon;
GRANT SELECT ON categories TO anon;
GRANT ALL ON articles TO authenticated;
GRANT ALL ON categories TO authenticated;
GRANT ALL ON articles TO service_role;
GRANT ALL ON categories TO service_role;

-- Success message
SELECT 'Database setup completed successfully!' AS status;

