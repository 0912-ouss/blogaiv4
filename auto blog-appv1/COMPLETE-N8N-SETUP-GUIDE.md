# 🚀 Complete n8n Setup with Auto Daily Stats

## 🎯 Two Options for You

### **Option 1: Automatic (RECOMMENDED)** ⭐
SQL trigger updates `daily_stats` automatically when article is created.
**No extra n8n node needed!**

### **Option 2: Manual Update**
n8n updates `daily_stats` table after creating article.
**Requires extra n8n node.**

---

## ✅ **OPTION 1: Automatic Update (BEST!)** ⭐

### Step 1: Run This SQL in Supabase

```sql
-- This creates a trigger that auto-updates daily_stats
-- Every time an article is inserted, the counter increases automatically!

CREATE TABLE IF NOT EXISTS daily_stats (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  articles_created INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 10,
  under_limit BOOLEAN GENERATED ALWAYS AS (articles_created < daily_limit) STORED,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

-- Auto-update function
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO daily_stats (date, articles_created, daily_limit)
  VALUES (CURRENT_DATE, 1, 10)
  ON CONFLICT (date) 
  DO UPDATE SET 
    articles_created = daily_stats.articles_created + 1,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger that fires after article insert
DROP TRIGGER IF EXISTS trigger_update_daily_stats ON articles;
CREATE TRIGGER trigger_update_daily_stats
AFTER INSERT ON articles
FOR EACH ROW
EXECUTE FUNCTION update_daily_stats();

-- Initialize today
INSERT INTO daily_stats (date, articles_created, daily_limit)
VALUES (CURRENT_DATE, 0, 10)
ON CONFLICT (date) DO NOTHING;

SELECT '✅ Auto-update trigger created!' AS status;
```

### Step 2: n8n Workflow (Simple!)

```
1. Schedule Trigger (Every 2 hours)
   ↓
2. Supabase: Check Daily Limit
   Query: SELECT * FROM daily_stats WHERE date = CURRENT_DATE
   ↓
3. IF Node: Check {{ $json[0].under_limit }} = true
   ↓ TRUE                              ↓ FALSE
4. HTTP POST /api/articles          5. Stop/Alert
   ↓
✅ DONE! (daily_stats updates automatically!)
```

**That's it!** The trigger handles the update! 🎉

---

## 🔧 **OPTION 2: Manual Update in n8n**

If you prefer to update from n8n (not recommended, but possible):

### n8n Workflow:

```
1. Schedule Trigger
   ↓
2. Check Daily Limit
   ↓
3. IF Under Limit
   ↓
4. Create Article (HTTP POST)
   ↓
5. Update Daily Stats (Supabase Node) ← MANUAL UPDATE
   Operation: Execute Query
   Query: 
   UPDATE daily_stats 
   SET articles_created = articles_created + 1, 
       updated_at = NOW() 
   WHERE date = CURRENT_DATE
```

---

## 📋 **Detailed n8n Node Configurations**

### **Node 1: Schedule Trigger**

```json
{
  "rule": {
    "interval": [
      {
        "field": "hours",
        "hoursInterval": 2
      }
    ]
  }
}
```

---

### **Node 2: Supabase - Check Daily Limit**

```
Operation: Execute Query
Query: SELECT * FROM daily_stats WHERE date = CURRENT_DATE LIMIT 1

Returns:
{
  "id": 1,
  "date": "2025-10-08",
  "articles_created": 5,
  "daily_limit": 10,
  "under_limit": true
}
```

---

### **Node 3: IF - Check Under Limit**

```
Condition Type: Boolean
Value 1: {{ $json[0].under_limit }}
Operation: is true
```

**Output:**
- TRUE path → Create article
- FALSE path → Stop or send alert

---

### **Node 4: HTTP Request - Create Article**

```
Method: POST
URL: http://localhost:3000/api/articles
Authentication: None

Headers:
  Content-Type: application/json

Body (JSON):
{
  "title": "Your Article Title Here",
  "slug": "your-article-slug-{{ $now.format('x') }}",
  "content": "<div class='post-content'><h2>Heading</h2><p>Content here</p></div>",
  "excerpt": "Article summary here (150-200 chars)",
  "category_id": 1,
  "author_name": "AI Content Generator",
  "featured_image": "https://images.unsplash.com/photo-xxx",
  "tags": ["Tag1", "Tag2"],
  "status": "published",
  "ai_generated": true
}
```

---

### **Node 5 (Optional): Manual Update Daily Stats**

**Only needed if you DON'T use the SQL trigger!**

```
Operation: Execute Query
Query:
UPDATE daily_stats 
SET articles_created = articles_created + 1, 
    updated_at = NOW() 
WHERE date = CURRENT_DATE
```

---

## 🧪 **Testing**

### Test 1: Check Current Stats

```sql
-- In Supabase:
SELECT * FROM daily_stats WHERE date = CURRENT_DATE;
```

Should show:
```
id | date       | articles_created | daily_limit | under_limit
1  | 2025-10-08 | 0                | 10          | true
```

### Test 2: Create Test Article

```powershell
# In PowerShell:
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/articles" -ContentType "application/json" -Body (@{
    title = "Test Article"
    content = "<div class='post-content'><p>Test</p></div>"
    excerpt = "Test"
    category_id = 1
    status = "published"
} | ConvertTo-Json)
```

### Test 3: Verify Counter Increased

```sql
-- In Supabase:
SELECT * FROM daily_stats WHERE date = CURRENT_DATE;
```

Should now show:
```
articles_created = 1
```

**If it increased automatically, the trigger works!** ✅

---

## 📊 **Visual Workflow Diagram**

### With Automatic Update (Option 1):

```
┌─────────────────────┐
│  Schedule Trigger   │
│   (Every 2 hours)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────┐
│  Supabase: Check Limit  │
│  SELECT * FROM          │
│  daily_stats            │
│  WHERE date = today     │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  IF: under_limit = true │
└───┬─────────────────┬───┘
    │ TRUE            │ FALSE
    ▼                 ▼
┌──────────┐    ┌─────────┐
│  Create  │    │  Stop   │
│ Article  │    │  Alert  │
└──────────┘    └─────────┘
     │
     ▼
✅ Trigger auto-updates daily_stats!
```

---

## 🎯 **Comparison**

| Feature | Option 1 (Auto) | Option 2 (Manual) |
|---------|-----------------|-------------------|
| Complexity | ⭐ Simple | ⭐⭐ Medium |
| n8n Nodes | 4 nodes | 5 nodes |
| Reliability | ✅ Database guarantee | ⚠️ Depends on n8n |
| Performance | ✅ Fast | ⚠️ Extra query |
| Recommended | ⭐⭐⭐ **YES!** | Only if needed |

---

## 📁 **Files Created**

1. ✅ **`AUTO-UPDATE-DAILY-STATS.sql`** - SQL with trigger (Option 1)
2. ✅ **`N8N-UPDATE-DAILY-STATS.json`** - Full n8n workflow
3. ✅ **`COMPLETE-N8N-SETUP-GUIDE.md`** - This guide

---

## 🚀 **Quick Start**

### For Automatic Update (Recommended):

1. **Run SQL:** Copy `AUTO-UPDATE-DAILY-STATS.sql` → Run in Supabase
2. **Import Workflow:** Import `N8N-UPDATE-DAILY-STATS.json` into n8n
3. **Configure:** Update Supabase credentials
4. **Test:** Run workflow once
5. **Done!** ✅

---

## 🎉 **Summary**

**Best approach:** Use **Option 1 (Automatic)**

- ✅ SQL trigger auto-updates `daily_stats`
- ✅ No extra n8n nodes needed
- ✅ Guaranteed to update even if n8n fails
- ✅ Simpler workflow
- ✅ Better performance

Just run the SQL and use the simple 4-node workflow! 🚀

