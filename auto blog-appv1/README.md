# 🚀 Simple Blog with n8n Integration

A clean, minimal blog system with gmag theme, Supabase database, and n8n integration.

## 📦 **What's Included**

- ✅ **Frontend:** Homepage + Article pages (gmag theme style)
- ✅ **Backend:** Simple Node.js API with Express
- ✅ **Database:** Supabase (PostgreSQL)
- ✅ **n8n Ready:** APIs for automation workflows

## 🛠️ **Setup Instructions**

### **1. Install Dependencies**

```bash
npm install
```

### **2. Configure Environment**

Rename `env.example` to `.env`:

```bash
# Windows PowerShell
Rename-Item env.example .env

# Mac/Linux
mv env.example .env
```

The `.env` file already contains your Supabase credentials.

### **3. Start the Server**

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### **4. Open in Browser**

- **Homepage:** http://localhost:3000/index.html
- **API Health:** http://localhost:3000/api/health

## 📡 **API Endpoints for n8n**

### **GET /api/articles**
Fetch all published articles

```bash
GET http://localhost:3000/api/articles
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Article Title",
      "slug": "article-title",
      "content": "Article content...",
      "excerpt": "Short summary",
      "category": "technology",
      "featured_image": "https://...",
      "view_count": 10,
      "published_at": "2025-01-01T00:00:00Z",
      "ai_generated": true
    }
  ]
}
```

### **GET /api/articles/:slug**
Fetch single article by slug

```bash
GET http://localhost:3000/api/articles/article-title
```

### **POST /api/articles**
Create new article (for n8n workflows)

```bash
POST http://localhost:3000/api/articles
Content-Type: application/json

{
  "title": "New Article Title",
  "content": "<p>Article content with HTML...</p>",
  "excerpt": "Short summary of the article",
  "category": "technology",
  "featured_image": "https://example.com/image.jpg",
  "tags": ["ai", "blog"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "slug": "new-article-title",
    ...
  },
  "message": "Article created successfully"
}
```

### **GET /api/categories**
Fetch all categories

```bash
GET http://localhost:3000/api/categories
```

### **GET /api/health**
Health check endpoint

```bash
GET http://localhost:3000/api/health
```

## 🔌 **n8n Integration Example**

### **Example Workflow: Auto-Post Article**

1. **Trigger:** Schedule (e.g., daily at 9 AM)
2. **HTTP Request:** Generate content from AI
3. **HTTP Request:** POST to `/api/articles`
4. **Notification:** Send success message

### **Example n8n HTTP Request Node:**

**Method:** POST  
**URL:** `http://localhost:3000/api/articles`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Body:**
```json
{
  "title": "{{ $json.generatedTitle }}",
  "content": "{{ $json.generatedContent }}",
  "excerpt": "{{ $json.generatedExcerpt }}",
  "category": "technology",
  "featured_image": "{{ $json.imageUrl }}"
}
```

## 📁 **Project Structure**

```
auto blog-appv1/
├── server.js           # Backend API
├── package.json        # Dependencies
├── .env               # Environment variables (create from env.example)
├── index.html         # Homepage
├── article.html       # Article page
├── js/
│   ├── blog-api.js    # Homepage API integration
│   ├── article-api.js # Article page API integration
│   ├── jquery.min.js  # jQuery library
│   ├── plugins.js     # Theme plugins
│   └── scripts.js     # Theme scripts
├── css/               # Stylesheets
├── images/            # Images and assets
└── fonts/             # Font files
```

## 🎯 **Key Features**

- ✅ Clean, minimal code
- ✅ Database-driven content
- ✅ SEO-friendly URLs with slugs
- ✅ View count tracking
- ✅ Category management
- ✅ AI-generated content support
- ✅ Responsive gmag theme design
- ✅ n8n webhook ready

## 🔧 **Troubleshooting**

### **Server won't start**
- Make sure `.env` file exists (rename from `env.example`)
- Check if port 3000 is available
- Verify Supabase credentials

### **Articles not loading**
- Check Supabase connection in `.env`
- Verify database has articles table
- Check browser console for errors

### **n8n can't connect**
- Make sure server is running
- Use `http://localhost:3000` not `https://`
- Check firewall settings

## 📝 **Database Schema**

Your Supabase database should have these tables:

**articles:**
- id (bigint, primary key)
- title (text)
- slug (text, unique)
- content (text)
- excerpt (text)
- category (text)
- featured_image (text)
- tags (text[])
- status (text)
- published_at (timestamp)
- ai_generated (boolean)
- view_count (integer)
- created_at (timestamp)
- updated_at (timestamp)

**categories:**
- id (bigint, primary key)
- name (text)
- slug (text, unique)
- description (text)

## 🚀 **Next Steps**

1. ✅ Test the homepage: http://localhost:3000/index.html
2. ✅ Test creating articles via API (Postman or curl)
3. ✅ Set up n8n workflows
4. ✅ Customize the theme (edit CSS in `css/` folder)
5. ✅ Add more categories in Supabase

## 📞 **Support**

If you encounter any issues:
1. Check the browser console (F12)
2. Check the server logs in terminal
3. Verify Supabase connection
4. Ensure all dependencies are installed

---

**That's it! Your simple blog is ready for n8n automation! 🎉**

