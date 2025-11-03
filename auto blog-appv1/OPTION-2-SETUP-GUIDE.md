# 🚀 Option 2 Setup Guide - Daily Stats Table

## 📋 What You're Setting Up

A `daily_stats` table that:
- ✅ Automatically counts articles created each day
- ✅ Tracks if you're under/over your daily limit
- ✅ Keeps historical data for analytics
- ✅ Updates automatically with database triggers

---

## ⏱️ Time Required: 10 minutes

---

## STEP 1: Create Table in Supabase (5 min)

### 1.1 Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**

### 1.2 Copy & Run SQL Script
1. Open file: `CREATE-DAILY-STATS-TABLE.sql`
2. Copy ALL content
3. Paste into Supabase SQL Editor
4. Click **RUN** (or press Ctrl+Enter)

### 1.3 Verify Success
You should see:
```
✅ Daily stats table created successfully!
```

### 1.4 Check the Table
1. Go to **Table Editor** (left sidebar)
2. You should see new table: `daily_stats`
3. It should have 1 row with today's date

---

## STEP 2: Test the Table (2 min)

Let me create a test script for you:

### Run this to verify everything works:

```sql
-- Check today's stats
SELECT * FROM daily_stats WHERE date = CURRENT_DATE;

-- Should return:
-- id | date       | articles_created | daily_limit | under_limit | created_at | updated_at
-- 1  | 2025-10-06 | 10              | 10          | false       | ...        | ...
```

---

## STEP 3: Setup n8n Workflow (3 min)

### Node Configuration

#### 📌 Node 1: Schedule Trigger
```
Node Type: Schedule Trigger
Interval: Every 2 hours (or your preference)
```

#### 📌 Node 2: Supabase - Check Daily Limit
```
Node Type: Supabase
Credential: Your Supabase credential

Operation: Get All Rows
Table: daily_stats
Return All: false
Limit: 1

Filters:
  Add Condition:
    - Field: date
    - Condition: equals
    - Value: {{ $now.format('YYYY-MM-DD') }}
```

**Output will be:**
```json
{
  "id": 1,
  "date": "2025-10-06",
  "articles_created": 5,
  "daily_limit": 10,
  "under_limit": true,
  "created_at": "2025-10-06T10:00:00",
  "updated_at": "2025-10-06T15:30:00"
}
```

#### 📌 Node 3: IF - Check Under Limit
```
Node Type: IF

Condition Type: Boolean
Value 1: {{ $json.under_limit }}
Operation: is true
```

- **TRUE branch** → Proceed to create article
- **FALSE branch** → Stop or send alert

#### 📌 Node 4a: Generate Article Content (AI)
```
Node Type: OpenAI / HTTP Request
(Your AI content generation node)
```

#### 📌 Node 4b: Supabase - Create Article
```
Node Type: Supabase
Operation: Insert
Table: articles

Data to Send: Define Below

Fields:
  - title: {{ $json.title }}
  - slug: {{ $json.slug }}-{{ $now.format('x') }}
  - subtitle: {{ $json.subtitle }}
  - content: {{ $json.content }}
  - excerpt: {{ $json.excerpt }}
  - category_id: {{ $json.category_id }}
  - author_name: "AI Content Generator"
  - author_id: 1
  - featured_image: {{ $json.image_url }}
  - image_copyright: "© AI Generated 2025"
  - tags: {{ $json.tags }}
  - status: "published"
  - is_featured: {{ $json.is_featured }}
  - is_trending: false
  - ai_generated: true
  - view_count: 0
  - comment_count: 0
  - likes_count: 0
```

**✨ Magic:** The `daily_stats` table will **auto-update** when article is created!

#### 📌 Node 5: Send Success Notification (Optional)
```
Node Type: Slack / Email / Discord
Message: ✅ Article created! ({{ $node["Supabase - Check Daily Limit"].json["articles_created"] + 1 }}/{{ $node["Supabase - Check Daily Limit"].json["daily_limit"] }})
```

---

## 📊 Visual Workflow

```
┌─────────────────────┐
│  Schedule Trigger   │
│   (Every 2 hours)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│  Supabase                   │
│  Check Daily Stats          │
│  Table: daily_stats         │
│  Filter: date = today       │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  IF                         │
│  {{ $json.under_limit }}    │
└─────┬──────────────────┬────┘
      │ TRUE             │ FALSE
      ▼                  ▼
┌──────────────┐   ┌─────────────┐
│   Generate   │   │ Send Alert  │
│   Content    │   │ "Limit      │
│   (AI/GPT)   │   │  Reached!"  │
└──────┬───────┘   └─────────────┘
       │
       ▼
┌──────────────────┐
│  Supabase        │
│  Create Article  │
│  (Auto-updates   │
│   daily_stats!)  │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  Notification    │
│  "Success! 6/10" │
└──────────────────┘
```

---

## 🎯 Complete n8n Workflow JSON

Save this as a `.json` file and import into n8n:

```json
{
  "name": "Auto Blog - Daily Limit with Stats Table",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [{"field": "hours", "hoursInterval": 2}]
        }
      },
      "name": "Schedule Every 2 Hours",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 300],
      "id": "node-1"
    },
    {
      "parameters": {
        "operation": "getAll",
        "tableId": "daily_stats",
        "returnAll": false,
        "limit": 1,
        "filters": {
          "conditions": [
            {
              "keyName": "date",
              "condition": "equals",
              "keyValue": "={{ $now.format('YYYY-MM-DD') }}"
            }
          ]
        }
      },
      "name": "Check Daily Limit",
      "type": "n8n-nodes-base.supabase",
      "position": [450, 300],
      "id": "node-2",
      "credentials": {
        "supabaseApi": {
          "id": "YOUR_CREDENTIAL_ID",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{ $json.under_limit }}",
              "value2": true
            }
          ]
        }
      },
      "name": "Under Limit?",
      "type": "n8n-nodes-base.if",
      "position": [650, 300],
      "id": "node-3"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://openrouter.ai/api/v1/chat/completions",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "openAiApi",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "model",
              "value": "anthropic/claude-3.5-sonnet"
            },
            {
              "name": "messages",
              "value": "=[{\"role\": \"user\", \"content\": \"Generate a blog article about technology.\"}]"
            }
          ]
        },
        "options": {}
      },
      "name": "Generate Content (AI)",
      "type": "n8n-nodes-base.httpRequest",
      "position": [850, 200],
      "id": "node-4"
    },
    {
      "parameters": {
        "operation": "insert",
        "tableId": "articles",
        "dataToSend": "defineInNode",
        "fieldsUi": {
          "field": [
            {"fieldName": "title", "fieldValue": "={{ $json.title }}"},
            {"fieldName": "slug", "fieldValue": "={{ $json.slug }}-{{ $now.format('x') }}"},
            {"fieldName": "subtitle", "fieldValue": "={{ $json.subtitle }}"},
            {"fieldName": "content", "fieldValue": "={{ $json.content }}"},
            {"fieldName": "excerpt", "fieldValue": "={{ $json.excerpt }}"},
            {"fieldName": "category_id", "fieldValue": "={{ $json.category_id }}"},
            {"fieldName": "author_name", "fieldValue": "AI Content Generator"},
            {"fieldName": "author_id", "fieldValue": "1"},
            {"fieldName": "status", "fieldValue": "published"},
            {"fieldName": "ai_generated", "fieldValue": "true"}
          ]
        }
      },
      "name": "Create Article",
      "type": "n8n-nodes-base.supabase",
      "position": [1050, 200],
      "id": "node-5"
    },
    {
      "parameters": {
        "text": "⚠️ Daily limit reached!\n\nCreated: {{ $node['Check Daily Limit'].json.articles_created }}/{{ $node['Check Daily Limit'].json.daily_limit }}\n\nNo more articles will be created today."
      },
      "name": "Send Alert - Limit Reached",
      "type": "n8n-nodes-base.noOp",
      "position": [850, 400],
      "id": "node-6"
    },
    {
      "parameters": {
        "text": "✅ Article Created Successfully!\n\nToday's count: {{ $node['Check Daily Limit'].json.articles_created + 1 }}/{{ $node['Check Daily Limit'].json.daily_limit }}"
      },
      "name": "Send Success Notification",
      "type": "n8n-nodes-base.noOp",
      "position": [1250, 200],
      "id": "node-7"
    }
  ],
  "connections": {
    "Schedule Every 2 Hours": {
      "main": [[{"node": "Check Daily Limit", "type": "main", "index": 0}]]
    },
    "Check Daily Limit": {
      "main": [[{"node": "Under Limit?", "type": "main", "index": 0}]]
    },
    "Under Limit?": {
      "main": [
        [{"node": "Generate Content (AI)", "type": "main", "index": 0}],
        [{"node": "Send Alert - Limit Reached", "type": "main", "index": 0}]
      ]
    },
    "Generate Content (AI)": {
      "main": [[{"node": "Create Article", "type": "main", "index": 0}]]
    },
    "Create Article": {
      "main": [[{"node": "Send Success Notification", "type": "main", "index": 0}]]
    }
  }
}
```

---

## 🎛️ Configuration Options

### Change Daily Limit

Update in Supabase:
```sql
UPDATE daily_stats 
SET daily_limit = 20 
WHERE date = CURRENT_DATE;
```

### Set Different Limits for Different Days

```sql
-- Weekend: 5 articles
-- Weekday: 10 articles

UPDATE daily_stats 
SET daily_limit = CASE 
  WHEN EXTRACT(DOW FROM date) IN (0, 6) THEN 5
  ELSE 10
END
WHERE date = CURRENT_DATE;
```

---

## 📊 View Statistics

### Today's Stats
```sql
SELECT * FROM daily_stats WHERE date = CURRENT_DATE;
```

### Last 7 Days
```sql
SELECT 
  date,
  articles_created,
  daily_limit,
  under_limit
FROM daily_stats
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;
```

### Monthly Summary
```sql
SELECT 
  DATE_TRUNC('month', date) as month,
  SUM(articles_created) as total_articles,
  AVG(articles_created) as avg_per_day,
  COUNT(*) as days_active
FROM daily_stats
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('month', date);
```

---

## ✅ Testing

### Test 1: Check Table Exists
```sql
SELECT * FROM daily_stats;
```

### Test 2: Manually Update Count
```sql
UPDATE daily_stats 
SET articles_created = 5 
WHERE date = CURRENT_DATE;
```

### Test 3: Check Trigger Works
Create an article through n8n or directly, then check:
```sql
SELECT * FROM daily_stats WHERE date = CURRENT_DATE;
-- articles_created should increase by 1
```

---

## 🐛 Troubleshooting

### Issue: "Table doesn't exist"
**Solution:** Run `CREATE-DAILY-STATS-TABLE.sql` again in Supabase SQL Editor

### Issue: "Trigger not firing"
**Solution:**
```sql
DROP TRIGGER IF EXISTS trigger_update_daily_stats ON articles;
CREATE TRIGGER trigger_update_daily_stats
AFTER INSERT ON articles
FOR EACH ROW
EXECUTE FUNCTION update_daily_stats();
```

### Issue: "under_limit always true"
**Solution:** Check if `articles_created` is updating:
```sql
SELECT * FROM daily_stats WHERE date = CURRENT_DATE;
```

---

## 🎉 You're Done!

Your setup is complete when:
- ✅ `daily_stats` table exists in Supabase
- ✅ Trigger is active on `articles` table
- ✅ n8n workflow is configured
- ✅ Test article creation works

**Next:** Test the workflow in n8n!

---

## 📞 Need Help?

Check:
1. Supabase logs for SQL errors
2. n8n execution logs for API errors
3. `daily_stats` table data for count accuracy

**Common fixes:**
- Refresh Supabase schema cache
- Re-grant permissions
- Check timezone settings

