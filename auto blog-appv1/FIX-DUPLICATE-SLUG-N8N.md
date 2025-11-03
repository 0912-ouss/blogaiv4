# 🔧 Fix Duplicate Slug Error in n8n

## ❌ Your Error:
```
duplicate key value violates unique constraint "articles_slug_key"
```

**Problem:** Your slug is the same every time, but the database requires **unique slugs**.

---

## ✅ **Solution: Add Timestamp to Slug**

In your n8n workflow, make the slug unique by adding a timestamp.

---

## 🎯 **n8n "Set" Node Configuration**

### Before Creating Article, Add a "Set" Node:

**Node Name:** `Prepare Article Data`

**Fields:**

| Field Name | Expression |
|------------|------------|
| `title` | `{{ $json.title }}` |
| `slug` | `{{ $json.title.toLowerCase().replace(/[^a-z0-9 -äöüß]/g, '').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/\s+/g, '-').substring(0, 80) }}-{{ $now.format('x') }}` |
| `content` | `<div class='post-content'>{{ $json.content }}</div>` |
| `excerpt` | `{{ $json.excerpt || $json.content.substring(0, 200) }}...` |
| `category_id` | `1` |
| `status` | `published` |

**The key part:** `-{{ $now.format('x') }}`

This adds a **unique timestamp** (milliseconds since epoch) to every slug!

---

## 📋 **Complete n8n Workflow**

```
1. Trigger
   ↓
2. Check Daily Limit (Supabase)
   ↓
3. IF Under Limit
   ↓
4. Set Node - Prepare Article Data ⭐ ADD THIS!
   └─ Generate unique slug with timestamp
   ↓
5. HTTP Request - Create Article
   └─ Use slug from Set node
   ↓
6. Done!
```

---

## 🔧 **Method 1: Simple Timestamp Slug**

In your HTTP Request node, use this for the slug:

```javascript
// In n8n expression:
{{ $json.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').substring(0, 80) }}-{{ $now.format('x') }}
```

**Example output:**
```
neu-getac-s510ad-ki-leistung-1728393845723
```

Always unique! ✅

---

## 🔧 **Method 2: Use UUID (Most Unique)**

```javascript
// Generate UUID-based slug:
{{ $json.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').substring(0, 60) }}-{{ $uuid() }}
```

**Example output:**
```
neu-getac-s510ad-ki-leistung-a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

## 🔧 **Method 3: Random Number**

```javascript
// Use random number:
{{ $json.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').substring(0, 80) }}-{{ Math.floor(Math.random() * 1000000) }}
```

**Example output:**
```
neu-getac-s510ad-ki-leistung-847293
```

---

## 🎯 **Recommended: Use Method 1 (Timestamp)**

### Complete HTTP Request Body:

```json
{
  "title": "={{ $json.title }}",
  "slug": "={{ $json.title.toLowerCase().replace(/[^a-z0-9 -äöüß]/g, '').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/\s+/g, '-').substring(0, 80) }}-{{ $now.format('x') }}",
  "content": "={{ $json.content }}",
  "excerpt": "={{ $json.excerpt }}",
  "category_id": 1,
  "author_name": "AI Content Generator",
  "status": "published",
  "ai_generated": true
}
```

**Key line:** The slug expression with `-{{ $now.format('x') }}`

---

## 🧪 **Test It**

### Before Fix:
```
slug: "neu-getac-s510ad-ki-leistung"  (same every time) ❌
```

### After Fix:
```
Article 1: "neu-getac-s510ad-ki-leistung-1728393845723" ✅
Article 2: "neu-getac-s510ad-ki-leistung-1728393847891" ✅
Article 3: "neu-getac-s510ad-ki-leistung-1728393849123" ✅
```

All unique! ✅

---

## 📊 **For German Characters (äöüß)**

Use this slug expression:

```javascript
{{ $json.title
  .toLowerCase()
  .normalize('NFD')
  .replace(/ä/g, 'ae')
  .replace(/ö/g, 'oe')
  .replace(/ü/g, 'ue')
  .replace(/ß/g, 'ss')
  .replace(/[^a-z0-9 -]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .substring(0, 80)
}}-{{ $now.format('x') }}
```

**Example:**
```
Input:  "Größe und Stärke"
Output: "groesse-und-staerke-1728393845723"
```

---

## 🎯 **Visual Fix**

### n8n Nodes:

```
┌─────────────────────────┐
│  HTTP Request           │
│  POST /api/articles     │
│                         │
│  Body:                  │
│  {                      │
│    "title": "...",      │
│    "slug": "...-{{ $now.format('x') }}", ← ADD THIS!
│    "content": "...",    │
│    ...                  │
│  }                      │
└─────────────────────────┘
```

---

## 🚨 **Common Mistakes**

### ❌ Wrong:
```javascript
"slug": "my-article-slug"  // Always the same!
```

### ✅ Correct:
```javascript
"slug": "my-article-slug-{{ $now.format('x') }}"  // Always unique!
```

---

## 🎉 **Quick Fix Summary**

In your n8n HTTP Request node, change:

**FROM:**
```json
{
  "slug": "your-article-slug"
}
```

**TO:**
```json
{
  "slug": "={{ $json.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-') }}-{{ $now.format('x') }}"
}
```

**That's it!** No more duplicate slug errors! 🎉

---

## 📋 **Alternative: Let Backend Generate Slug**

If you don't want to handle slugs in n8n, modify your API to auto-generate unique slugs.

Just send `title` without `slug`:

```json
{
  "title": "Your Article Title",
  "content": "...",
  // No slug - let backend generate it!
}
```

Backend will create: `your-article-title-1728393845723`

---

## ✅ **Ready to Test!**

Just update your n8n HTTP Request node with the new slug expression, and run it again! 🚀

