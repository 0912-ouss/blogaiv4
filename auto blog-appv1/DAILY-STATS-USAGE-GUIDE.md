# 📊 Daily Stats Auto-Setup Guide

## 🎯 What This Does

Automatically creates a new row in `daily_stats` table every day and updates it when articles are created.

## 🚀 Quick Setup

### 1. Run the SQL Setup
```sql
-- Copy and paste the entire AUTO-DAILY-STATS-SETUP.sql file
-- into Supabase SQL Editor and run it
```

### 2. How It Works

#### **Automatic Triggers:**
- ✅ **Before Article Insert**: Creates today's row if it doesn't exist
- ✅ **After Article Insert**: Updates `articles_created` count
- ✅ **Auto-calculates**: `under_limit` status

#### **Manual Functions:**
- `create_today_stats()` - Create today's row manually
- `create_stats_for_date('2025-01-15')` - Create row for specific date
- `get_today_stats()` - Get today's statistics

## 📋 Daily Stats Table Structure

```sql
daily_stats:
├── id (auto-increment)
├── date (today's date)
├── articles_created (starts at 0)
├── daily_limit (set to 10, change as needed)
├── under_limit (true/false)
├── created_at (timestamp)
└── updated_at (timestamp)
```

## 🔧 Configuration

### Change Daily Limit
In the SQL file, find this line and change `10` to your desired limit:
```sql
10, -- Change this to your desired daily limit
```

### Example Limits:
- `5` - 5 articles per day
- `20` - 20 articles per day
- `50` - 50 articles per day

## 📊 Usage Examples

### Check Today's Stats
```sql
SELECT * FROM get_today_stats();
```

### Create Stats for Specific Date
```sql
SELECT create_stats_for_date('2025-01-15');
```

### View All Daily Stats
```sql
SELECT 
    date,
    articles_created,
    daily_limit,
    under_limit,
    (daily_limit - articles_created) as remaining
FROM daily_stats 
ORDER BY date DESC;
```

### Manual Today's Row Creation
```sql
SELECT create_today_stats();
```

## 🎯 What Happens Automatically

### When You Create an Article (via n8n or API):

1. **Before Insert**: 
   - Checks if today's row exists in `daily_stats`
   - Creates it if missing (with `articles_created = 0`)

2. **After Insert**:
   - Increments `articles_created` by 1
   - Updates `under_limit` status
   - Sets `updated_at` timestamp

### Example Flow:
```
Day 1: articles_created = 0, under_limit = true
Create Article 1: articles_created = 1, under_limit = true
Create Article 2: articles_created = 2, under_limit = true
...
Create Article 10: articles_created = 10, under_limit = false
Create Article 11: articles_created = 11, under_limit = false
```

## 🔍 Monitoring

### Check if Today's Row Exists
```sql
SELECT EXISTS(
    SELECT 1 FROM daily_stats WHERE date = CURRENT_DATE
) as today_exists;
```

### Get Remaining Articles for Today
```sql
SELECT 
    daily_limit - articles_created as remaining_articles
FROM daily_stats 
WHERE date = CURRENT_DATE;
```

### Check if Under Limit
```sql
SELECT under_limit 
FROM daily_stats 
WHERE date = CURRENT_DATE;
```

## 🛠️ Troubleshooting

### If Today's Row is Missing
```sql
SELECT create_today_stats();
```

### If Stats Are Wrong
```sql
-- Reset today's count
UPDATE daily_stats 
SET articles_created = 0, under_limit = true
WHERE date = CURRENT_DATE;
```

### If You Need to Recreate Everything
```sql
-- Drop and recreate (be careful!)
DROP TRIGGER IF EXISTS trigger_ensure_daily_stats ON articles;
DROP TRIGGER IF EXISTS trigger_update_daily_stats ON articles;
DROP FUNCTION IF EXISTS ensure_daily_stats();
DROP FUNCTION IF EXISTS update_daily_stats_on_article_insert();
-- Then run the setup SQL again
```

## 🎉 Benefits

- ✅ **Automatic**: No manual work needed
- ✅ **Real-time**: Updates immediately when articles are created
- ✅ **Accurate**: Always shows current count
- ✅ **Flexible**: Easy to change daily limits
- ✅ **Reliable**: Works with n8n, API, or manual inserts

## 📱 n8n Integration

Your n8n workflow can now check daily limits:

```javascript
// In n8n, use this to check if under limit
const response = await fetch('your-api-endpoint/daily-stats');
const stats = await response.json();
const canCreate = stats.under_limit;

if (canCreate) {
    // Create article
} else {
    // Skip or notify
}
```

---

## 🚀 Ready to Use!

After running the SQL setup, your daily stats will automatically:
- ✅ Create new rows every day
- ✅ Update when articles are created
- ✅ Track your daily limits
- ✅ Work with n8n workflows

**No more manual work needed!** 🎉
