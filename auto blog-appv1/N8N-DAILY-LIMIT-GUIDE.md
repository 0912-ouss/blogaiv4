# 🎯 N8N Daily Limit Checker - Complete Guide

## 📌 The Question
**"How do I check the daily limit from the database in n8n?"**

## ✅ OPTION 1: Simple Check (RECOMMENDED)

**No new table needed!** Just query your existing `articles` table.

### Step-by-Step in n8n:

#### Node 1: Supabase - Get Today's Articles
```
Node: Supabase
Operation: Get All Rows
Table: articles
Filters:
  - created_at [gte] {{ $now.startOf('day').toISO() }}
```

**This returns all articles created today.**

#### Node 2: IF - Check Daily Limit
```
Node: IF
Condition: {{ $json.length < 10 }}
```

- **TRUE** → Under limit, create article
- **FALSE** → Over limit, stop or send alert

### Visual Workflow:
```
┌─────────────────┐
│   Trigger       │
│  (Schedule)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│   Supabase              │
│   Get Today's Articles  │
│   Filter: created_at    │
│   >= today 00:00:00     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   IF                    │
│   {{ $json.length < 10 }}│
└────┬────────────────┬───┘
     │ TRUE           │ FALSE
     ▼                ▼
┌─────────┐      ┌──────────┐
│ Create  │      │   Stop   │
│ Article │      │ or Alert │
└─────────┘      └──────────┘
```

---

## 📊 OPTION 2: Daily Stats Table (Advanced)

Create a dedicated table to track daily statistics.

### Step 1: Run SQL in Supabase

Copy and run `CREATE-DAILY-STATS-TABLE.sql` in Supabase SQL Editor.

**This creates:**
- `daily_stats` table with automatic counting
- Trigger that updates count when article is created
- `under_limit` boolean field (calculated automatically)

### Step 2: n8n Workflow

#### Node 1: Supabase - Check Daily Stats
```
Node: Supabase
Operation: Get All Rows
Table: daily_stats
Filters:
  - date [eq] {{ $now.format('YYYY-MM-DD') }}
Limit: 1
```

**Returns:**
```json
{
  "id": 1,
  "date": "2025-10-06",
  "articles_created": 5,
  "daily_limit": 10,
  "under_limit": true
}
```

#### Node 2: IF - Check under_limit
```
Node: IF
Condition: {{ $json.under_limit === true }}
```

### Visual Workflow:
```
┌─────────────────┐
│   Trigger       │
│  (Schedule)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│   Supabase              │
│   Get Daily Stats       │
│   Table: daily_stats    │
│   Filter: date = today  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   IF                    │
│ {{ $json.under_limit }} │
└────┬────────────────┬───┘
     │ TRUE           │ FALSE
     ▼                ▼
┌─────────┐      ┌──────────┐
│ Create  │      │   Stop   │
│ Article │      │ or Alert │
└─────────┘      └──────────┘
```

---

## 🆚 Comparison

| Feature | Option 1 (Simple) | Option 2 (Stats Table) |
|---------|-------------------|------------------------|
| **Complexity** | ✅ Easy | ⚠️ Medium |
| **Setup Time** | ✅ 2 minutes | ⚠️ 5 minutes |
| **New Table** | ✅ No | ❌ Yes |
| **Query Speed** | ✅ Fast | ✅ Very Fast |
| **Historical Data** | ❌ No | ✅ Yes |
| **Auto-Update** | ✅ Yes | ✅ Yes (trigger) |
| **Flexibility** | ⚠️ Basic | ✅ Advanced |

---

## 📝 Complete n8n Workflow JSON (Option 1)

```json
{
  "name": "Daily Article Creator with Limit",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours",
              "hoursInterval": 2
            }
          ]
        }
      },
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 300]
    },
    {
      "parameters": {
        "operation": "getAll",
        "tableId": "articles",
        "returnAll": true,
        "filters": {
          "conditions": [
            {
              "keyName": "created_at",
              "condition": "gte",
              "keyValue": "={{ $now.startOf('day').toISO() }}"
            }
          ]
        }
      },
      "name": "Supabase - Check Today Count",
      "type": "n8n-nodes-base.supabase",
      "position": [450, 300]
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{ $json.length }}",
              "operation": "smaller",
              "value2": 10
            }
          ]
        }
      },
      "name": "Under Daily Limit?",
      "type": "n8n-nodes-base.if",
      "position": [650, 300]
    },
    {
      "parameters": {
        "operation": "insert",
        "tableId": "articles",
        "dataToSend": "defineInNode",
        "fieldsUi": {
          "field": [
            {
              "fieldName": "title",
              "fieldValue": "={{ $json.title }}"
            },
            {
              "fieldName": "slug",
              "fieldValue": "={{ $json.slug }}-{{ $now.format('x') }}"
            },
            {
              "fieldName": "content",
              "fieldValue": "={{ $json.content }}"
            },
            {
              "fieldName": "excerpt",
              "fieldValue": "={{ $json.excerpt }}"
            },
            {
              "fieldName": "category_id",
              "fieldValue": "={{ $json.category_id }}"
            },
            {
              "fieldName": "author_name",
              "fieldValue": "AI Content Generator"
            },
            {
              "fieldName": "status",
              "fieldValue": "published"
            }
          ]
        }
      },
      "name": "Supabase - Create Article",
      "type": "n8n-nodes-base.supabase",
      "position": [850, 200]
    },
    {
      "parameters": {
        "content": "⚠️ Daily limit reached! Created {{ $node['Supabase - Check Today Count'].json.length }} articles today.",
        "channel": "alerts"
      },
      "name": "Send Alert",
      "type": "n8n-nodes-base.slack",
      "position": [850, 400]
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [[{ "node": "Supabase - Check Today Count" }]]
    },
    "Supabase - Check Today Count": {
      "main": [[{ "node": "Under Daily Limit?" }]]
    },
    "Under Daily Limit?": {
      "main": [
        [{ "node": "Supabase - Create Article" }],
        [{ "node": "Send Alert" }]
      ]
    }
  }
}
```

---

## 🎯 My Recommendation

**Use OPTION 1 (Simple Check)** because:
- ✅ No new table needed
- ✅ Works immediately
- ✅ Easy to understand and maintain
- ✅ Fast queries
- ✅ Less complex

**Use OPTION 2 (Stats Table)** if you want:
- 📊 Historical tracking (see daily trends)
- 📈 Dashboard/analytics
- 🔧 More control over limits per day
- 📅 Monthly/weekly reporting

---

## 🚀 Quick Start (Option 1)

1. **Open n8n**
2. **Add Supabase Node**:
   - Operation: `Get All`
   - Table: `articles`
   - Add filter: `created_at` `gte` `{{ $now.startOf('day').toISO() }}`
3. **Add IF Node**:
   - Condition: `{{ $json.length < 10 }}`
4. **Done!** ✅

---

## ❓ FAQ

**Q: Can I change the daily limit?**  
A: Yes! Change the number `10` in the IF condition to your desired limit.

**Q: Does this work across time zones?**  
A: Yes, it uses your server's timezone. Make sure your server timezone is correct.

**Q: Can I set different limits for weekdays vs weekends?**  
A: Yes! Use an IF node to check the day: `{{ $now.day() === 0 || $now.day() === 6 }}` (weekend)

**Q: How do I test this?**  
A: Create some test articles and check the count in Supabase.

---

**Choose your option and let me know if you need help setting it up!** 🎉

