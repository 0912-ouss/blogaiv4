# 🔧 Fix n8n Daily Limit Error

## ❌ Your Error:
```
column "articles_limit" of relation "daily_stats" does not exist
```

**Problem:** Your n8n workflow is trying to query `daily_stats` table, but:
1. The table might not exist
2. The column name is wrong (`articles_limit` vs `articles_created`)

---

## ✅ **OPTION 1: Skip Daily Limit (Simplest)** ⭐

### Don't use the daily limit check at all!

Your current API works fine without it. Just remove the "Check Daily Limit" node from your n8n workflow.

### **Simplified n8n Workflow:**

```
Trigger (Schedule/Webhook)
   ↓
Generate Content (AI)
   ↓
HTTP Request (POST /api/articles)
   ↓
Done!
```

**No daily limit check needed!** ✅

---

## ✅ **OPTION 2: Add Daily Limit API Endpoint**

If you want daily limit checking, I'll add it to your server.

### Step 1: Create `daily_stats` table in Supabase

Run this SQL:

```sql
-- Create daily_stats table
CREATE TABLE IF NOT EXISTS daily_stats (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  articles_created INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 10,
  under_limit BOOLEAN GENERATED ALWAYS AS (articles_created < daily_limit) STORED,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

-- Initialize today's record
INSERT INTO daily_stats (date, articles_created, daily_limit)
VALUES (CURRENT_DATE, 0, 10)
ON CONFLICT (date) DO NOTHING;

-- Auto-update function
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO daily_stats (date, articles_created)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) 
  DO UPDATE SET 
    articles_created = daily_stats.articles_created + 1,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_update_daily_stats ON articles;
CREATE TRIGGER trigger_update_daily_stats
AFTER INSERT ON articles
FOR EACH ROW
EXECUTE FUNCTION update_daily_stats();

SELECT '✅ Daily stats table created!' AS status;
```

### Step 2: Use This n8n Query

In your n8n "Supabase" node (Check Daily Limit):

```
Operation: Get All Rows
Table: daily_stats

Filters:
  Field: date
  Condition: equals
  Value: {{ $now.format('YYYY-MM-DD') }}

Limit: 1
```

**Check the field:** `under_limit` (not `articles_limit`)

---

## 🎯 **My Recommendation: Use Option 1**

### Why?

- ✅ **Simpler** - No database triggers needed
- ✅ **Faster** - One less database query
- ✅ **More flexible** - Control limits in n8n directly
- ✅ **Works now** - No code changes needed

### How to Control Limits in n8n:

Use n8n's built-in scheduling:

```
Schedule Trigger:
  - Run every 2 hours
  - Between 8 AM - 8 PM
  - That's 6 articles per day automatically!
```

Or use n8n's "Wait" node:

```
Create Article
   ↓
Wait 2 hours
   ↓
Create Another Article
   ↓
Repeat...
```

---

## 🔧 **How to Fix Your n8n Workflow Right Now**

### Current Workflow (With Error):
```
Trigger
   ↓
Supabase: Check daily_stats ❌ ERROR HERE!
   ↓
IF under_limit
   ↓
Create Article
```

### Fixed Workflow (Option 1):
```
Trigger (Schedule every 2 hours)
   ↓
Generate Content
   ↓
HTTP Request: POST /api/articles ✅
   ↓
Done!
```

### Fixed Workflow (Option 2 - With Daily Limit):
```
Trigger
   ↓
Supabase: SELECT * FROM daily_stats WHERE date = today
   ↓
IF {{ $json.under_limit }} = true ✅ (not articles_limit!)
   ↓
Create Article
```

---

## 🧪 **Test Your Current API (No Changes Needed)**

```powershell
# Test in PowerShell:
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/articles" -ContentType "application/json" -Body (@{
    title = "Test from n8n"
    content = "<div class='post-content'><p>Test content</p></div>"
    excerpt = "Test excerpt"
    category_id = 1
    status = "published"
} | ConvertTo-Json)
```

Should work! ✅

---

## 📋 **Summary**

| Option | Pros | Cons | Recommended? |
|--------|------|------|--------------|
| **Option 1: Skip Daily Limit** | ✅ Simple, works now | No database tracking | ⭐⭐⭐ **YES!** |
| **Option 2: Add Daily Limit** | ✅ Database tracking | Need to create table | ⭐ Advanced |

---

## 🚀 **Quick Fix for n8n Right Now**

1. **Open your n8n workflow**
2. **Remove the "Check Daily Limit" node**
3. **Connect Trigger directly to Create Article**
4. **Test it** ✅

Done! No more errors! 🎉

---

## 🎯 **n8n Workflow Template (No Daily Limit)**

```json
{
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [{"field": "hours", "hoursInterval": 2}]
        }
      }
    },
    {
      "name": "HTTP Request - Create Article",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3000/api/articles",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {"name": "title", "value": "Your Article Title"},
            {"name": "content", "value": "<div class='post-content'><p>Content</p></div>"},
            {"name": "excerpt", "value": "Excerpt"},
            {"name": "category_id", "value": "1"},
            {"name": "status", "value": "published"}
          ]
        }
      }
    }
  ]
}
```

**Use this and you're done!** 🎉

