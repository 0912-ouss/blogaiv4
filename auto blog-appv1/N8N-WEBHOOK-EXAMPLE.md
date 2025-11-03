# 🔔 n8n Webhook Response - Quick Guide

## 🎯 Your Current Data (Has Issues)

```json
{
  "slug": "einer-langen-geschichte-in-der-entwicklung-von-robusten...", // ❌ TOO LONG!
  "title": "Neu: Getac S510AD vereint starke KI Leistung...",
  "content": "Mit einer langen Geschichte...",
  "excerpt": "", // ❌ EMPTY!
  "meta_description": "", // ❌ EMPTY!
  "focus_keyword": "...",
  "status": "draft",
  "source_url": "https://www.maschinenmarkt.vogel.de/..."
}
```

**Problems:**
- ❌ Slug is 500+ characters (max should be 100)
- ❌ Missing `category_id` (required)
- ❌ Missing `featured_image`
- ❌ Empty `excerpt`
- ❌ Content not wrapped in HTML

---

## ✅ Fixed Data (What to Send)

```json
{
  "title": "Neu: Getac S510AD vereint starke KI Leistung mit Nachhaltigkeit",
  "slug": "neu-getac-s510ad-ki-leistung-nachhaltigkeit-1759771234567",
  "content": "<div class='post-content'><h2>Getac S510AD: Innovation trifft Nachhaltigkeit</h2><p>Mit einer langen Geschichte in der Entwicklung von robusten Geräten für den Einsatz in anspruchsvollen Umgebungen hat Getac den neuen S510AD vorgestellt.</p><p>Dieses innovative Gerät kombiniert starke KI-Leistung mit Nachhaltigkeit und einem vielseitigen, robusten Design.</p><p><strong>Quelle:</strong> <a href='https://www.maschinenmarkt.vogel.de/...' target='_blank'>Maschinenmarkt</a></p></div>",
  "excerpt": "Getac stellt den neuen S510AD vor - ein robustes Gerät mit KI-Leistung und Nachhaltigkeit.",
  "category_id": 1,
  "author_name": "Tech News Bot",
  "featured_image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  "meta_description": "Getac S510AD vereint KI-Leistung mit Nachhaltigkeit und robustem Design.",
  "meta_keywords": "Getac, S510AD, KI, Nachhaltigkeit",
  "tags": ["Getac", "KI", "Nachhaltigkeit", "Technologie"],
  "status": "published",
  "ai_generated": true
}
```

---

## 📊 Webhook Response You'll Get

When you POST to `http://localhost:3000/api/articles`, you'll receive:

```json
{
  "success": true,
  "data": {
    "id": 40,
    "title": "Neu: Getac S510AD vereint starke KI Leistung mit Nachhaltigkeit",
    "slug": "neu-getac-s510ad-ki-leistung-nachhaltigkeit-1759771234567",
    "content": "<div class='post-content'>...</div>",
    "excerpt": "Getac stellt den neuen S510AD vor...",
    "category_id": 1,
    "author_name": "Tech News Bot",
    "featured_image": "https://images.unsplash.com/...",
    "status": "published",
    "created_at": "2025-10-08T11:40:34.567Z",
    "updated_at": "2025-10-08T11:40:34.567Z",
    "ai_generated": true,
    "view_count": 0,
    "comment_count": 0,
    "likes_count": 0
  }
}
```

---

## 🔧 n8n "Set" Node Configuration

Add this **BEFORE** your HTTP Request node:

### **Fields to Set:**

| Field Name | Expression |
|------------|------------|
| `title` | `{{ $json.title }}` |
| `slug` | `{{ $json.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').substring(0, 80) }}-{{ $now.format('x') }}` |
| `content` | `<div class='post-content'><p>{{ $json.content }}</p><p><strong>Quelle:</strong> <a href="{{ $json.source_url }}">Link</a></p></div>` |
| `excerpt` | `{{ $json.content.substring(0, 200) }}...` |
| `category_id` | `1` |
| `author_name` | `Tech News Bot` |
| `featured_image` | `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80` |
| `meta_description` | `{{ $json.meta_description \|\| $json.content.substring(0, 160) }}` |
| `meta_keywords` | `{{ $json.focus_keyword }}` |
| `tags` | `["Tech", "News", "Innovation"]` |
| `status` | `published` |
| `ai_generated` | `true` |

---

## 🎯 Complete n8n Workflow

```
1. Webhook/Trigger
   ↓
2. Set Node (Transform Data)
   ↓
3. HTTP Request
   Method: POST
   URL: http://localhost:3000/api/articles
   Body: JSON (use transformed data)
   ↓
4. Respond to Webhook
   Status: 200
   Body: {{ $json }}
```

---

## 📝 HTTP Request Node Config

```
Method: POST
URL: http://localhost:3000/api/articles

Headers:
  Content-Type: application/json

Body:
  Send Body: Yes
  Body Content Type: JSON

JSON Body:
{
  "title": "={{ $json.title }}",
  "slug": "={{ $json.slug }}",
  "content": "={{ $json.content }}",
  "excerpt": "={{ $json.excerpt }}",
  "category_id": {{ $json.category_id }},
  "author_name": "={{ $json.author_name }}",
  "featured_image": "={{ $json.featured_image }}",
  "meta_description": "={{ $json.meta_description }}",
  "tags": ={{ $json.tags }},
  "status": "={{ $json.status }}",
  "ai_generated": {{ $json.ai_generated }}
}
```

---

## 🧪 Test with cURL

```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Neu: Getac S510AD vereint starke KI Leistung",
    "slug": "neu-getac-s510ad-ki-leistung-1759771234567",
    "content": "<div class=\"post-content\"><p>Test content</p></div>",
    "excerpt": "Test excerpt",
    "category_id": 1,
    "author_name": "Bot",
    "status": "published"
  }'
```

---

## 🎉 What You Get Back

### Success Response:
```json
{
  "success": true,
  "data": {
    "id": 40,
    "title": "...",
    "slug": "...",
    "created_at": "2025-10-08T...",
    ...
  }
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## 📋 Quick Checklist

Before sending to API, make sure:

- ✅ Slug is max 100 characters
- ✅ Slug has unique timestamp: `-${Date.now()}`
- ✅ Content is wrapped in `<div class='post-content'>`
- ✅ Excerpt is 100-250 characters
- ✅ category_id is set (1-6)
- ✅ featured_image URL is valid
- ✅ status is "published" or "draft"

---

## 🚀 Ready to Use!

Copy the n8n configuration above and you're all set! 🎉

**Article URL Format:**
```
http://localhost:3000/article.html?slug=YOUR-SLUG-HERE
```
