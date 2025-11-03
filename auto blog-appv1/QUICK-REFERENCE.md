# 🚀 Quick Reference - Article JSON for n8n

## 📦 Minimal JSON (Required Fields Only)

```json
{
  "title": "Your Article Title",
  "slug": "your-article-title",
  "content": "<div class='post-content'><p>Content here</p></div>",
  "excerpt": "Brief summary of your article",
  "category_id": 1,
  "status": "published"
}
```

---

## 🎯 Recommended JSON (With SEO & Images)

```json
{
  "title": "Your Article Title",
  "slug": "your-article-title",
  "subtitle": "Your subtitle",
  "content": "<div class='post-content'><h2>Heading</h2><p>Content...</p></div>",
  "excerpt": "Brief summary",
  "category_id": 1,
  "author_name": "AI Content Generator",
  "featured_image": "https://images.unsplash.com/photo-xxx",
  "image_copyright": "© Unsplash 2025",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "meta_title": "SEO Title",
  "meta_description": "SEO description",
  "status": "published",
  "is_featured": true,
  "ai_generated": true
}
```

---

## 📂 Categories

```
1 = Technology
2 = Science
3 = Health & Wellness
4 = Business
5 = Lifestyle
6 = Entertainment
```

---

## 🎨 Content HTML Structure

```html
<div class='post-content'>
  <h2>Main Heading</h2>
  <p>Introduction paragraph...</p>
  
  <h3>Subheading</h3>
  <p>Content paragraph...</p>
  
  <ul>
    <li>List item 1</li>
    <li>List item 2</li>
  </ul>
  
  <blockquote>
    <p>"Quote text here"</p>
    <cite>— Author Name</cite>
  </blockquote>
  
  <h3>Conclusion</h3>
  <p>Closing paragraph...</p>
</div>
```

---

## 🧪 Test in n8n

### Step 1: Create HTTP Request Node
```
Method: POST
URL: http://localhost:3000/api/articles
Headers:
  Content-Type: application/json
Body:
  (Paste JSON from examples)
```

### Step 2: Expected Response
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Your Article Title",
    "slug": "your-article-title",
    "created_at": "2025-10-06T..."
  }
}
```

---

## 📋 Field Validation Rules

| Field | Min | Max | Format |
|-------|-----|-----|--------|
| `title` | 10 chars | 100 chars | Text |
| `slug` | 10 chars | 120 chars | lowercase-with-hyphens |
| `excerpt` | 100 chars | 250 chars | Text |
| `content` | 200 chars | No limit | HTML |
| `category_id` | 1 | 10 | Integer |
| `tags` | 0 items | 10 items | Array |

---

## 🔗 Useful Links

- **Full Examples:** `ARTICLE-JSON-EXAMPLE.md`
- **Sample JSON:** `test-article-samples.json`
- **Database Setup:** `CREATE-DAILY-STATS-TABLE.sql`
- **Complete Guide:** `OPTION-2-SETUP-GUIDE.md`

---

## ⚡ Quick Commands

```bash
# Test your API endpoint
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d @test-article-samples.json

# Or in PowerShell:
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/articles" -ContentType "application/json" -Body (Get-Content test-article-samples.json -Raw)

# Check database stats
node test-daily-stats.js
```

---

## 🎯 Copy & Paste Template

```json
{
  "title": "",
  "slug": "",
  "content": "<div class='post-content'></div>",
  "excerpt": "",
  "category_id": 1,
  "author_name": "AI Content Generator",
  "featured_image": "",
  "tags": [],
  "status": "published",
  "ai_generated": true
}
```

---

**That's it!** 🎉

Now you have everything you need to generate articles from n8n!

