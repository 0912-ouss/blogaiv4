# 📊 Database Update Guide

## 🎯 What We're Doing

After analyzing the `post-single.html` template structure, I've identified all the fields needed to display a complete article page with the gmag theme. The database schema needs to be updated to support:

### Article Page Requirements (from post-single.html):
1. **Header Section**:
   - Category name and link
   - Article title
   - Subtitle (h4 under title)
   - Author name, image, and link
   - Publication date
   - Comment count
   - View count

2. **Media Section**:
   - Featured image(s) - can be multiple images in a slider
   - Image copyright text

3. **Content Section**:
   - Full HTML content
   - Share buttons
   - Font size controls
   - Print functionality

4. **Footer Section**:
   - Tags
   - Previous/Next article navigation
   - Related posts

5. **Additional Sections**:
   - Author bio with social links
   - Comments
   - Sidebar widgets

---

## 🔧 Two Options to Update Your Database

### **Option 1: Quick Fix (Recommended) - Keeps Your Data**
Run the `ADD-MISSING-COLUMNS.sql` file. This will:
- ✅ Keep all your existing articles
- ✅ Add only the missing columns
- ✅ Fix the `featured_image` column type (VARCHAR → TEXT for base64)
- ✅ Add authors, tags, and article_tags tables
- ✅ Update categories with icons and colors

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Copy the contents of `ADD-MISSING-COLUMNS.sql`
3. Paste and run it
4. Done! ✅

---

### **Option 2: Fresh Start (If You Want to Rebuild)**
Run the `updated-database-schema.sql` file. This will:
- ⚠️ Drop all existing tables (if you uncomment the DROP commands)
- ✅ Create a complete, well-structured database from scratch
- ✅ Include all tables: articles, categories, authors, tags, comments, article_images

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Copy the contents of `updated-database-schema.sql`
3. Uncomment the DROP TABLE commands if you want a fresh start
4. Paste and run it
5. Done! ✅

---

## 📋 New Database Structure

### Tables Created/Updated:

#### 1. **articles** (Enhanced)
```sql
- id, title, slug, subtitle, content, excerpt
- featured_image (TEXT - supports base64)
- image_copyright
- category_id, author_id, author_name
- status, published_at
- view_count, comment_count, likes_count
- is_featured, is_trending, ai_generated
- meta_description, meta_keywords
```

#### 2. **authors** (New)
```sql
- id, name, slug, bio, avatar_url
- email, facebook_url, twitter_url, instagram_url, vk_url
```

#### 3. **categories** (Enhanced)
```sql
- id, name, slug, description
- icon (Font Awesome class)
- color (hex code)
```

#### 4. **tags** (New)
```sql
- id, name, slug
```

#### 5. **article_tags** (New - Junction Table)
```sql
- article_id, tag_id
- Many-to-many relationship between articles and tags
```

---

## 🎨 What This Enables

### For the Frontend:
- ✅ Display author information with bio and social links
- ✅ Show article tags
- ✅ Display category icons and colors
- ✅ Support base64 encoded images
- ✅ Track engagement metrics (views, comments, likes)
- ✅ Featured/trending article flags
- ✅ Better SEO with meta fields

### For n8n Integration:
- ✅ Create articles with complete metadata
- ✅ Associate articles with authors
- ✅ Add tags to articles
- ✅ Set featured/trending flags
- ✅ Include subtitles and image copyrights

---

## 🚀 Next Steps After Database Update

1. **Update the API** (`server.js`):
   - Modify GET `/api/articles/:slug` to join with authors and tags
   - Update POST `/api/articles` to accept new fields

2. **Update Frontend JS** (`article-api.js`):
   - Display author info, tags, subtitle
   - Show category icons and colors

3. **Test with n8n**:
   - Send complete article data including new fields

---

## 📝 Sample n8n Request Body (After Update)

```json
{
  "title": "The Future of AI Technology in 2025",
  "slug": "future-of-ai-technology-2025",
  "subtitle": "Exploring the cutting-edge innovations shaping tomorrow",
  "content": "<div class='post-content'><h2>Introduction</h2><p>...</p></div>",
  "excerpt": "Exploring how AI is transforming technology...",
  "category_id": 1,
  "author_id": 1,
  "featured_image": "https://images.unsplash.com/...",
  "image_copyright": "© Unsplash 2025",
  "tags": ["AI", "Technology", "Innovation"],
  "is_featured": true,
  "is_trending": false,
  "status": "published"
}
```

---

## ❓ FAQ

**Q: Will I lose my existing articles?**  
A: No, if you use `ADD-MISSING-COLUMNS.sql`. It only adds missing columns.

**Q: What about the error with featured_image?**  
A: Fixed! We're changing it from `VARCHAR(500)` to `TEXT` to support base64 images.

**Q: Do I need to update my existing articles?**  
A: No, they'll continue working. New fields will have default values.

**Q: Can I still use the old n8n workflow?**  
A: Yes! The new fields are optional. Old requests will still work.

---

## 🎯 What to Do Right Now

**Choose ONE option and run it in Supabase:**

```bash
✅ Option 1: ADD-MISSING-COLUMNS.sql (Recommended - keeps data)
⚠️ Option 2: updated-database-schema.sql (Fresh start - optional)
```

**After running the SQL, tell me and I'll:**
1. Update the API to use the new fields
2. Update the frontend to display author, tags, etc.
3. Provide you with an updated n8n workflow

---

Let me know when you've run the SQL! 🚀

