# 🔧 Fix Your n8n Node - Step by Step

## ❌ **The Problem:**

You're using a **Supabase node** that inserts **directly to the database**, bypassing your backend!

```
n8n → Supabase (direct) → Database
      ❌ Skips backend slug generation!
```

This means the slug from your data (`{{ $json.slug }}`) goes straight to the database without getting the unique timestamp added!

---

## ✅ **The Solution:**

Use an **HTTP Request node** to call your backend API instead!

```
n8n → Backend API → Database
      ✅ Backend adds unique slug!
```

---

## 🎯 **Step-by-Step Fix:**

### **Step 1: Delete or Disable the Supabase Node**

1. Open your n8n workflow
2. Find the "Save to Database" (Supabase) node
3. Delete it or disable it

---

### **Step 2: Add HTTP Request Node**

1. Click **"+"** to add a new node
2. Search for **"HTTP Request"**
3. Click to add it

---

### **Step 3: Configure HTTP Request Node**

#### **Basic Settings:**

| Setting | Value |
|---------|-------|
| **Method** | `POST` |
| **URL** | `http://localhost:3000/api/articles` |
| **Authentication** | `None` |

#### **Body Settings:**

| Setting | Value |
|---------|-------|
| **Send Body** | `✅ Yes` |
| **Body Content Type** | `JSON` |
| **Specify Body** | `Using JSON` |

#### **JSON Body:**

```json
{
  "title": "={{ $json.title }}",
  "content": "={{ $json.content }}",
  "excerpt": "={{ $json.excerpt }}",
  "meta_description": "={{ $json.meta_description }}",
  "category_id": 1,
  "status": "published"
}
```

**⚠️ IMPORTANT:** Do **NOT** include `"slug"`, `"created_at"`, or `"updated_at"` - the backend handles these!

---

### **Step 4: Save and Test**

1. Click **Save**
2. Click **Execute Node** or **Execute Workflow**
3. Check the output - should see success with a unique slug!

---

## 📋 **Complete Node Configuration**

### **Option 1: Copy-Paste JSON (Easiest)**

1. In n8n, delete the Supabase node
2. Click **"Import from URL or File"** or **"Add Node" → "Code" → "JSON"**
3. Paste this:

```json
{
  "nodes": [
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3000/api/articles",
        "authentication": "none",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"title\": {{ JSON.stringify($json.title) }},\n  \"content\": {{ JSON.stringify($json.content) }},\n  \"excerpt\": {{ JSON.stringify($json.excerpt) }},\n  \"meta_description\": {{ JSON.stringify($json.meta_description) }},\n  \"category_id\": 1,\n  \"status\": \"published\"\n}",
        "options": {}
      },
      "name": "Save to Database",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [272, -288]
    }
  ]
}
```

---

### **Option 2: Manual Configuration**

#### **In n8n HTTP Request Node:**

**Method:** `POST`

**URL:** `http://localhost:3000/api/articles`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "title": "={{ $json.title }}",
  "content": "={{ $json.content }}",
  "excerpt": "={{ $json.excerpt }}",
  "meta_description": "={{ $json.meta_description }}",
  "category_id": 1,
  "status": "published"
}
```

---

## 📊 **Before vs After**

### ❌ **Before (Supabase Direct - Has Duplicate Error):**

```
┌─────────────────────┐
│   Your n8n Data     │
│  slug: "article"    │ ← Static slug from your data
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Supabase Node      │
│  (Direct Insert)    │
└──────────┬──────────┘
           │
           ▼
      Database
      slug: "article" ← Same every time!
      ❌ DUPLICATE ERROR!
```

---

### ✅ **After (HTTP Request - Always Unique):**

```
┌─────────────────────┐
│   Your n8n Data     │
│  title: "Article"   │ ← Just send title
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  HTTP Request Node  │
│  POST /api/articles │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Your Backend       │
│  Generates:         │
│  "article-20251008  │
│   -121502-675-3728" │ ← Unique slug!
└──────────┬──────────┘
           │
           ▼
      Database
      slug: "article-20251008-121502-675-3728"
      ✅ ALWAYS UNIQUE!
```

---

## 🎯 **Key Differences**

| Field | Supabase Node (Old) | HTTP Request (New) |
|-------|--------------------|--------------------|
| `slug` | ❌ You provide it (static) | ✅ Backend generates (unique) |
| `created_at` | ❌ You provide it | ✅ Backend auto-fills |
| `updated_at` | ❌ You provide it | ✅ Backend auto-fills |
| Uniqueness | ❌ Manual, error-prone | ✅ Automatic, guaranteed |

---

## 🧪 **Test Your Fixed Node**

### **Expected Output:**

```json
{
  "success": true,
  "data": {
    "id": 12,
    "title": "Your Article Title",
    "slug": "your-article-title-20251008-121502-675-3728",
    "content": "<div class='post-content'>...</div>",
    "excerpt": "Your excerpt",
    "status": "published",
    "created_at": "2025-10-08T12:15:02.675Z",
    "updated_at": "2025-10-08T12:15:02.675Z"
  },
  "message": "Article created successfully"
}
```

**Notice:** Slug has unique timestamp! ✅

---

## ⚠️ **Important Notes:**

### **Fields You Should NOT Send:**

- ❌ `slug` - Backend generates this with unique timestamp
- ❌ `created_at` - Backend auto-fills with current time
- ❌ `updated_at` - Backend auto-fills with current time
- ❌ `id` - Database auto-increments this

### **Fields You SHOULD Send:**

- ✅ `title` - Required
- ✅ `content` - Required  
- ✅ `excerpt` - Optional but recommended
- ✅ `meta_description` - Optional
- ✅ `category_id` - Optional (defaults to 1)
- ✅ `status` - Optional (defaults to "published")

---

## 🚀 **Quick Summary:**

1. **Delete Supabase node** ❌
2. **Add HTTP Request node** ✅
3. **Configure:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/articles`
   - Body: JSON with title, content, excerpt
4. **Remove:** `slug`, `created_at`, `updated_at`
5. **Test!** 🎉

---

## 📁 **Files Created:**

- ✅ **`FIXED-N8N-NODE.json`** - Ready-to-import node configuration
- ✅ **`HOW-TO-FIX-YOUR-N8N-NODE.md`** - This guide

---

## 🎉 **That's It!**

Replace your Supabase node with HTTP Request node and you'll never see duplicate errors again! 🚀

**Backend handles everything:**
- ✅ Unique slug generation
- ✅ Timestamps
- ✅ German character handling
- ✅ Validation

**Just send title and content!** 😊

