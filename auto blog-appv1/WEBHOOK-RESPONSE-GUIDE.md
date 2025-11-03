# 🔔 Webhook Response Guide for n8n

## 🎯 Your Data Structure

You have this data coming from your workflow:

```json
{
  "slug": "einer-langen-geschichte-in-der-entwicklung...",
  "title": "Neu: Getac S510AD vereint starke KI Leistung...",
  "content": "Mit einer langen Geschichte in der Entwicklung...",
  "excerpt": "",
  "meta_description": "",
  "focus_keyword": "einer langen geschichte...",
  "secondary_keywords": "",
  "status": "draft",
  "source_url": "https://www.maschinenmarkt.vogel.de/...",
  "created_at": "2025-10-08T13:35:28.135+02:00",
  "updated_at": "2025-10-08T13:35:28.135+02:00"
}
```

---

## ⚠️ Issues to Fix

### 1. **Slug is Too Long!**
Your slug is **500+ characters** - it should be **max 100 characters**.

### 2. **Missing Required Fields:**
- `category_id` (required)
- `author_name` (optional but recommended)
- `featured_image` (optional but recommended)

### 3. **Empty Fields:**
- `excerpt` is empty (should be 100-250 chars)
- `meta_description` is empty

---

## ✅ Solution: Transform Data in n8n

### **Option 1: Use "Set" Node to Transform Data**

Add a **Set** node in n8n BEFORE sending to your API:

```javascript
// In n8n "Set" node:

{
  // Fix slug - take first 100 chars and clean it
  "slug": "{{ $json.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').substring(0, 100) }}-{{ $now.format('x') }}",
  
  // Keep title as is
  "title": "{{ $json.title }}",
  
  // Wrap content in HTML
  "content": "<div class='post-content'><p>{{ $json.content }}</p></div>",
  
  // Generate excerpt from content (first 200 chars)
  "excerpt": "{{ $json.content.substring(0, 200) }}...",
  
  // Add category_id (1 = Technology)
  "category_id": 1,
  
  // Add author
  "author_name": "AI Content Generator",
  
  // Add featured image (use a placeholder or default)
  "featured_image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  
  // Keep your meta fields
  "meta_description": "{{ $json.meta_description || $json.content.substring(0, 160) }}",
  "meta_keywords": "{{ $json.focus_keyword }}",
  
  // Keep status
  "status": "{{ $json.status }}",
  
  // Add AI flag
  "ai_generated": true,
  
  // Keep source
  "source_url": "{{ $json.source_url }}",
  
  // Add tags from keywords
  "tags": "{{ $json.focus_keyword.split(' ').slice(0, 5) }}"
}
```

---

## 🎯 Complete n8n Workflow

### **Step-by-Step Setup:**

```
┌─────────────────┐
│  Your Trigger   │
│  (Webhook/RSS)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Check Daily Limit          │
│  (Query daily_stats table)  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────┐
│  IF Under Limit │
└────┬───────┬────┘
     │ YES   │ NO → Stop
     ▼       │
┌─────────────────┐
│  Set Node       │
│  (Transform     │
│   Data)         │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  HTTP Request       │
│  POST /api/articles │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Respond to Webhook │
│  (Return Success)   │
└─────────────────────┘
```

---

## 📋 n8n Node Configurations

### **Node 1: Set (Data Transformation)**

```javascript
// Mode: Manual Mapping

// Field 1: slug
{{ $json.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').substring(0, 80) }}-{{ $now.format('x') }}

// Field 2: title
{{ $json.title }}

// Field 3: content
<div class='post-content'>
  <h2>{{ $json.title }}</h2>
  {{ $json.content.split('\n').map(p => '<p>' + p + '</p>').join('') }}
  <p><strong>Quelle:</strong> <a href="{{ $json.source_url }}" target="_blank">{{ $json.source_url }}</a></p>
</div>

// Field 4: excerpt
{{ $json.content.substring(0, 200).trim() }}...

// Field 5: category_id
1

// Field 6: author_name
AI Content Bot

// Field 7: featured_image
https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80

// Field 8: meta_description
{{ $json.meta_description || $json.content.substring(0, 160) }}

// Field 9: meta_keywords
{{ $json.focus_keyword }}

// Field 10: status
published

// Field 11: ai_generated
true

// Field 12: tags
{{ $json.focus_keyword.split(' ').slice(0, 5) }}
```

---

### **Node 2: HTTP Request (Create Article)**

```
Method: POST
URL: http://localhost:3000/api/articles
Authentication: None

Headers:
  Content-Type: application/json

Body:
  Send Body: Yes
  Body Content Type: JSON
  Specify Body: Using JSON
  
JSON:
{
  "title": "={{ $json.title }}",
  "slug": "={{ $json.slug }}",
  "content": "={{ $json.content }}",
  "excerpt": "={{ $json.excerpt }}",
  "category_id": {{ $json.category_id }},
  "author_name": "={{ $json.author_name }}",
  "featured_image": "={{ $json.featured_image }}",
  "meta_description": "={{ $json.meta_description }}",
  "meta_keywords": "={{ $json.meta_keywords }}",
  "tags": ={{ $json.tags }},
  "status": "={{ $json.status }}",
  "ai_generated": {{ $json.ai_generated }}
}
```

---

### **Node 3: Respond to Webhook**

```
Response Code: 200

Response Body:
{
  "success": true,
  "message": "Article created successfully",
  "data": {
    "id": "={{ $json.id }}",
    "title": "={{ $json.title }}",
    "slug": "={{ $json.slug }}",
    "url": "http://localhost:3000/article.html?slug={{ $json.slug }}",
    "created_at": "={{ $json.created_at }}"
  }
}
```

---

## 🧪 Test Your Webhook

### **Test Data (Fixed Version):**

```json
{
  "title": "Neu: Getac S510AD vereint starke KI Leistung mit Nachhaltigkeit",
  "slug": "neu-getac-s510ad-ki-leistung-nachhaltigkeit",
  "content": "<div class='post-content'><h2>Getac S510AD: Innovation trifft Nachhaltigkeit</h2><p>Mit einer langen Geschichte in der Entwicklung von robusten Geräten für den Einsatz in anspruchsvollen Umgebungen hat Getac den neuen S510AD vorgestellt.</p><p>Dieses innovative Gerät kombiniert starke KI-Leistung mit Nachhaltigkeit und einem vielseitigen, robusten Design.</p><h3>Hauptmerkmale</h3><ul><li>Leistungsstarke KI-Funktionen</li><li>Robustes Design für extreme Bedingungen</li><li>Nachhaltige Lösung für langfristigen Einsatz</li></ul><p><strong>Quelle:</strong> <a href='https://www.maschinenmarkt.vogel.de/getac-technology-gmbh-c-262099/nachrichten/68e634b39c9af/' target='_blank'>Maschinenmarkt</a></p></div>",
  "excerpt": "Getac stellt den neuen S510AD vor - ein robustes Gerät, das starke KI-Leistung mit Nachhaltigkeit und vielseitigem Design vereint.",
  "category_id": 1,
  "author_name": "Tech News Bot",
  "featured_image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  "meta_description": "Getac S510AD vereint KI-Leistung mit Nachhaltigkeit und robustem Design für anspruchsvolle Umgebungen.",
  "meta_keywords": "Getac, S510AD, KI, Nachhaltigkeit, robuste Geräte",
  "tags": ["Getac", "KI", "Nachhaltigkeit", "Technologie"],
  "status": "published",
  "ai_generated": true
}
```

---

## 🔧 Helper Functions for n8n

### **Clean Slug Function:**

```javascript
// In n8n Function node:
const title = $input.item.json.title;

// Remove special characters, normalize German umlauts
const cleanSlug = title
  .toLowerCase()
  .normalize('NFD')
  .replace(/ä/g, 'ae')
  .replace(/ö/g, 'oe')
  .replace(/ü/g, 'ue')
  .replace(/ß/g, 'ss')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9 -]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .substring(0, 80);

return {
  json: {
    ...($input.item.json),
    slug: `${cleanSlug}-${Date.now()}`
  }
};
```

---

## 📊 Expected Webhook Response

When you POST to `/api/articles`, you'll receive:

```json
{
  "success": true,
  "data": {
    "id": 40,
    "title": "Neu: Getac S510AD vereint starke KI Leistung...",
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
    "view_count": 0
  }
}
```

---

## 🎯 Quick Fix for Your Current Data

### **PowerShell Test Command:**

```powershell
$body = @{
    title = "Neu: Getac S510AD vereint starke KI Leistung mit Nachhaltigkeit"
    slug = "neu-getac-s510ad-ki-leistung-nachhaltigkeit-$(Get-Date -Format 'yyyyMMddHHmmss')"
    content = "<div class='post-content'><p>Mit einer langen Geschichte in der Entwicklung von robusten Geräten für den Einsatz in anspruchsvollen Umgebungen hat Getac den neuen S510AD vorgestellt. Dieses innovative Gerät kombiniert starke KI-Leistung mit Nachhaltigkeit und einem vielseitigen, robusten Design.</p></div>"
    excerpt = "Getac stellt den neuen S510AD vor - ein robustes Gerät mit KI-Leistung und Nachhaltigkeit."
    category_id = 1
    author_name = "Tech News Bot"
    featured_image = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
    status = "published"
    ai_generated = $true
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/articles" -ContentType "application/json" -Body $body
```

---

## 📝 Summary

### **Key Changes Needed:**

1. ✅ **Shorten slug** to max 100 characters
2. ✅ **Add category_id** (required)
3. ✅ **Generate excerpt** from content
4. ✅ **Add featured_image** (or use placeholder)
5. ✅ **Wrap content** in HTML `<div class='post-content'>`
6. ✅ **Handle German characters** (ä, ö, ü, ß) in slug

### **Webhook Response Will Include:**

- ✅ Article ID
- ✅ Full article data
- ✅ Created timestamp
- ✅ Success status

---

## 🚀 Ready to Use!

Copy the n8n node configurations above and you're all set! 🎉
