# 🔧 Fix n8n Duplicate Slug Error

## ❌ Your Error:
```
duplicate key value violates unique constraint "articles_slug_key"
```

## 🎯 **Root Cause:**

Your n8n workflow is sending a **static slug** that doesn't change between executions!

Example of what's causing the problem:
```json
{
  "title": "Article Title",
  "slug": "article-title",  ← ❌ This is the same every time!
  "content": "..."
}
```

---

## ✅ **Solution: Let Backend Generate Slug**

### **Option 1: Remove slug field entirely** ⭐ BEST!

In your n8n HTTP Request node, **DON'T send slug at all**:

```json
{
  "title": "{{ $json.title }}",
  "content": "{{ $json.content }}",
  "excerpt": "{{ $json.excerpt }}",
  "category_id": 1,
  "status": "published"
}
```

Backend will automatically create:
```
your-title-20251008-121502-675-3728 ✅ UNIQUE!
```

---

### **Option 2: Set slug to empty string**

```json
{
  "title": "{{ $json.title }}",
  "slug": "",  ← Empty string
  "content": "{{ $json.content }}",
  "excerpt": "{{ $json.excerpt }}",
  "category_id": 1,
  "status": "published"
}
```

---

### **Option 3: Set slug to null**

```json
{
  "title": "{{ $json.title }}",
  "slug": null,  ← Null value
  "content": "{{ $json.content }}",
  "excerpt": "{{ $json.excerpt }}",
  "category_id": 1,
  "status": "published"
}
```

---

## 🔍 **How to Check Your n8n Workflow**

### Step 1: Open your n8n workflow

### Step 2: Find the "HTTP Request" node that creates articles

### Step 3: Check the Body

Look for something like this:
```json
{
  "slug": "some-fixed-value"  ← ❌ PROBLEM!
}
```

Or this:
```json
{
  "slug": "={{ $json.title.toLowerCase().replace(/\s+/g, '-') }}"  ← ❌ PROBLEM!
}
```

**Why is this a problem?**
- If the title is the same, the slug will be the same
- Database requires unique slugs
- You get duplicate error!

---

## ✅ **Correct n8n Configuration**

### In your HTTP Request node:

**Method:** POST
**URL:** `http://localhost:3000/api/articles`

**Headers:**
```
Content-Type: application/json
```

**Body - JSON:**
```json
{
  "title": "={{ $json.title }}",
  "content": "={{ $json.content }}",
  "excerpt": "={{ $json.excerpt }}",
  "category_id": 1,
  "author_name": "AI Bot",
  "status": "published",
  "ai_generated": true
}
```

**Notice:** NO "slug" field! ✅

---

## 🧪 **Test It**

### Before Fix (n8n with static slug):
```
Run 1: ✅ Article created with slug "my-article"
Run 2: ❌ ERROR: duplicate key "my-article"
Run 3: ❌ ERROR: duplicate key "my-article"
```

### After Fix (no slug in n8n):
```
Run 1: ✅ Article created with slug "my-article-20251008-121502-675-3728"
Run 2: ✅ Article created with slug "my-article-20251008-121503-521-8725"
Run 3: ✅ Article created with slug "my-article-20251008-121504-164-6047"
```

All unique! 🎉

---

## 📊 **Visual Comparison**

### ❌ WRONG (causes duplicates):

```
┌─────────────────────┐
│  n8n HTTP Request   │
│                     │
│  Body:              │
│  {                  │
│    "title": "...",  │
│    "slug": "fixed", │ ← Problem!
│    "content": "..." │
│  }                  │
└─────────────────────┘
         │
         ▼
    Database
    Tries to insert same slug twice
    ❌ ERROR!
```

### ✅ CORRECT (always unique):

```
┌─────────────────────┐
│  n8n HTTP Request   │
│                     │
│  Body:              │
│  {                  │
│    "title": "...",  │
│    "content": "..." │
│  }                  │
│  (no slug field)    │ ← Correct!
└─────────────────────┘
         │
         ▼
    Backend generates:
    "article-20251008-121502-675-3728"
         │
         ▼
    Database
    ✅ SUCCESS! Always unique!
```

---

## 🎯 **Common Mistakes in n8n**

### Mistake 1: Using title directly as slug
```json
{
  "slug": "={{ $json.title.toLowerCase() }}"  ❌
}
```
**Problem:** Same title = same slug = duplicate error

---

### Mistake 2: Using title with replace but no timestamp
```json
{
  "slug": "={{ $json.title.toLowerCase().replace(/\s+/g, '-') }}"  ❌
}
```
**Problem:** Same title = same slug = duplicate error

---

### Mistake 3: Using hardcoded slug
```json
{
  "slug": "my-article"  ❌
}
```
**Problem:** Always the same = always duplicate error

---

## ✅ **Correct Approach**

```json
{
  // Just don't include slug at all! ✅
  "title": "={{ $json.title }}",
  "content": "={{ $json.content }}"
}
```

---

## 🚀 **Summary**

1. **Open your n8n workflow**
2. **Find the HTTP Request node** (POST /api/articles)
3. **Remove the "slug" field** from the JSON body
4. **Save and test**
5. **No more duplicate errors!** ✅

---

## 📋 **Example n8n Workflow JSON**

Save this as a reference:

```json
{
  "nodes": [
    {
      "name": "HTTP Request - Create Article",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3000/api/articles",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"title\": \"{{ $json.title }}\",\n  \"content\": \"{{ $json.content }}\",\n  \"excerpt\": \"{{ $json.excerpt }}\",\n  \"category_id\": 1,\n  \"status\": \"published\"\n}"
      }
    }
  ]
}
```

**Notice:** No slug field! ✅

---

## 🎉 **That's It!**

Remove the slug field from your n8n workflow and let the backend handle it!

**Backend automatically creates:**
```
title-YYYYMMDD-HHMMSS-milliseconds-random
```

**Always unique!** 🚀

