# 🚀 Quick Start Guide - AI Blog with n8n

Get your AI-powered blog running in 5 minutes!

---

## ✅ Prerequisites

- [ ] Node.js installed
- [ ] Supabase account
- [ ] n8n instance (local or cloud)
- [ ] OpenRouter API key

---

## 📦 Step 1: Setup Blog Backend

### 1. Navigate to project folder:
```bash
cd "auto blog-appv1"
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Configure environment (.env file already created):
```env
PORT=3000
SUPABASE_URL=https://tepxdymotrexlcmwkejq.supabase.co
SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

### 4. Fix Database Schema in Supabase:

Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Add missing columns
ALTER TABLE articles ADD COLUMN IF NOT EXISTS featured_image VARCHAR(500);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author VARCHAR(100) DEFAULT 'Admin';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';

-- Verify
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'articles';
```

### 5. Start the server:
```bash
npm start
```

**Server should be running at:** http://localhost:3000

---

## 🤖 Step 2: Setup n8n Workflow

### Option A: Simple Workflow (Recommended for beginners)

1. Open n8n
2. Import: `n8n-workflow-simple.json`
3. Open **"AI Generate Content"** node
4. Replace `YOUR_OPENROUTER_API_KEY_HERE` with your actual API key
5. Activate workflow
6. Copy webhook URL

### Option B: Complete Workflow (Advanced features)

1. Open n8n
2. Import: `n8n-workflow-complete.json`
3. Configure API keys in nodes
4. Activate workflow
5. Copy webhook URL

---

## 🧪 Step 3: Test Your Setup

### Test 1: Blog is Running
```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Simple Blog API is running"
}
```

### Test 2: Database Connection
```bash
node test-db.js
```

**Expected Output:**
```
✅ Found 5 categories
✅ Found X articles
✅ Database connection successful!
```

### Test 3: Create Article via n8n Webhook

**Replace `YOUR_WEBHOOK_URL` with your actual n8n webhook URL:**

```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "The Future of Artificial Intelligence",
    "title": "AI Trends 2024",
    "category_id": 1
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "article_url": "http://localhost:3000/article.html?slug=ai-trends-2024-1696608000",
  "article_id": 8,
  "title": "AI Trends 2024"
}
```

### Test 4: View Your Blog

Open browser: **http://localhost:3000/index.html**

You should see your articles displayed in the gmag theme!

---

## 📝 Step 4: Create Your First Article

### Method 1: Using Webhook (Recommended)

```bash
curl -X POST YOUR_N8N_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Machine Learning Basics",
    "title": "Introduction to Machine Learning",
    "category_id": 1
  }'
```

### Method 2: Using API Directly

```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Article",
    "slug": "my-first-article",
    "content": "<div class=\"post-content\"><h2>Hello World</h2><p>This is my first article!</p></div>",
    "excerpt": "My first article on the blog",
    "category_id": 1,
    "author": "Your Name"
  }'
```

### Method 3: Using Test Script

```bash
node test-create-article.js
```

---

## 🎯 Available API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Check server status |
| `/api/articles` | GET | Get all articles |
| `/api/articles/:slug` | GET | Get single article |
| `/api/articles` | POST | Create new article |
| `/api/articles/:id` | PUT | Update article |
| `/api/articles/:id` | DELETE | Delete article |
| `/api/categories` | GET | Get all categories |

---

## 📂 Project Structure

```
auto blog-appv1/
├── server.js                      # Main server file
├── package.json                   # Dependencies
├── .env                          # Configuration
├── index.html                    # Homepage
├── article.html                  # Article page
├── js/
│   ├── blog-api.js              # Frontend API integration
│   ├── article-api.js           # Article page logic
│   └── scripts.js               # Theme scripts
├── css/                          # Styles (gmag theme)
├── images/                       # Images and assets
├── n8n-workflow-simple.json     # Simple n8n workflow
├── n8n-workflow-complete.json   # Complete n8n workflow
├── N8N-WORKFLOW-GUIDE.md        # Detailed n8n guide
├── database-setup.sql           # Database schema
├── test-db.js                   # Test database connection
└── test-create-article.js       # Test article creation
```

---

## 🔧 Common Issues & Solutions

### ❌ Issue: "Cannot find module '@supabase/supabase-js'"
**Solution:**
```bash
npm install
```

### ❌ Issue: "Invalid API key"
**Solution:** Check your `.env` file has correct Supabase keys

### ❌ Issue: "Could not find column 'featured_image'"
**Solution:** Run the schema fix SQL in Supabase (Step 1.4)

### ❌ Issue: "Connection refused on localhost:3000"
**Solution:** Make sure server is running:
```bash
npm start
```

### ❌ Issue: "Webhook not responding"
**Solution:** Activate the workflow in n8n (toggle Active switch)

### ❌ Issue: "AI content generation fails"
**Solution:** Check OpenRouter API key has credits and is valid

---

## 📊 What Happens Next?

### Automatic Content Generation:
1. **n8n workflow triggers** (webhook or schedule)
2. **OpenRouter/GPT generates** article content
3. **Article is formatted** with title, slug, excerpt
4. **Saved to Supabase** database
5. **Immediately visible** on your blog homepage

### View Your Articles:
- **Homepage:** http://localhost:3000/index.html
- **Single Article:** http://localhost:3000/article.html?slug=article-slug
- **API Response:** http://localhost:3000/api/articles

---

## 🎨 Customization

### Change Article Generation Prompt:

Edit in n8n **"AI Generate Content"** node:

```javascript
{
  "role": "user",
  "content": "Write a detailed, SEO-optimized blog article about: {{ $json.body.topic }}. 
             Include:
             - Engaging introduction
             - 3-5 main sections with H2 headings
             - Examples and explanations
             - Conclusion with call-to-action
             Format in clean HTML with <div class='post-content'>."
}
```

### Change AI Model:

In n8n workflow, change:
```json
"model": "openai/gpt-4o-mini"
```

To:
```json
"model": "openai/gpt-4"              // More powerful
"model": "openai/gpt-3.5-turbo"     // Cheaper/faster
"model": "anthropic/claude-3.5-sonnet"  // Alternative
```

### Add Categories:

Run in Supabase SQL Editor:
```sql
INSERT INTO categories (name, slug, description) VALUES
('AI & ML', 'ai-ml', 'Artificial Intelligence and Machine Learning'),
('Blockchain', 'blockchain', 'Blockchain and Crypto'),
('Cloud', 'cloud', 'Cloud Computing');
```

---

## 📚 Next Steps

1. ✅ **Customize Theme:** Edit CSS files in `/css/` folder
2. ✅ **Add Images:** Use Unsplash API or upload to `/images/`
3. ✅ **SEO Optimization:** Add meta tags, sitemap
4. ✅ **Analytics:** Integrate Google Analytics
5. ✅ **Monetization:** Add ads or affiliate links
6. ✅ **Social Sharing:** Add share buttons
7. ✅ **Comments:** Integrate Disqus or similar
8. ✅ **Email Notifications:** Send alerts on new articles

---

## 🌟 Pro Tips

### Tip 1: Batch Article Creation
Modify `Batch Topics Generator` in complete workflow to create multiple articles:
```javascript
const topics = [
  { topic: 'AI in Healthcare', category_id: 1 },
  { topic: 'Sustainable Energy', category_id: 3 },
  { topic: 'Remote Work Tips', category_id: 2 }
];
```

### Tip 2: Schedule Content
Set n8n schedule to create articles automatically:
- Every 6 hours
- Daily at specific time
- Weekly roundup

### Tip 3: Monitor Performance
Check execution logs in n8n:
- Success rate
- Generation time
- Error patterns

---

## 🆘 Need Help?

- 📖 **Read:** `N8N-WORKFLOW-GUIDE.md` for detailed workflow explanation
- 🗄️ **Database:** Check `database-setup.sql` for schema
- 🧪 **Test:** Run `test-db.js` to verify connection
- 📝 **API Docs:** Your blog has built-in API docs at `/api/`

---

## ✅ Success Checklist

- [ ] Server running on http://localhost:3000
- [ ] Database connected (test-db.js passes)
- [ ] n8n workflow imported and active
- [ ] OpenRouter API key configured
- [ ] Test article created successfully
- [ ] Homepage displays articles
- [ ] Single article page works

---

**🎉 Congratulations! Your AI-powered blog is ready!**

Start creating amazing content with just a webhook call! 🚀

