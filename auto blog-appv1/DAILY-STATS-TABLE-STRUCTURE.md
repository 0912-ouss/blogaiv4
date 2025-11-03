# 🙇🏻‍♂️ Daily Stats Table Structure

## 📊 Table: `daily_stats`

Based on your screenshot and setup, here's the structure:

---

## 📋 Columns

| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|---------|-------------|
| `id` | `int4` (integer) | NO | Auto-increment | Primary key |
| `date` | `date` | NO | CURRENT_DATE | The date for this stats row |
| `articles_created` | `int4` (integer) | NO | 0 | Number of articles created today |
| `daily_limit` | `int4` (integer) | NO | 10 | Maximum articles allowed per day |
| `under_limit` | `boolean` | NO | **GENERATED** | Auto-calculated: `articles_created < daily_limit` |
| `created_at` | `timestamp` | NO | NOW() | When this row was created |
| `updated_at` | `timestamp` | NO | NOW() | Last time this row was updated |

---

## 🔑 Key Features

### **Generated Column:**
```sql
under_limit BOOLEAN GENERATED ALWAYS AS (articles_created < daily_limit) STORED
```
- ✅ **Auto-calculates** - You can't insert/update this directly
- ✅ **Always accurate** - Updates when `articles_created` or `daily_limit` changes
- ✅ **Returns:** 
  - `TRUE` if you're under the limit
  - `FALSE` if you've reached or exceeded the limit

---

## 📝 Example Data

```
id | date       | articles_created | daily_limit | under_limit | created_at              | updated_at
---|------------|------------------|-------------|-------------|-------------------------|------------
1  | 2025-10-08 | 10               | 10          | FALSE       | 2025-10-08 12:43:59     | 2025-10-08 15:30:00
```

---

## 🎯 How to Use

### **Insert New Day:**
```sql
INSERT INTO daily_stats (date, articles_created, daily_limit)
VALUES (CURRENT_DATE, 0, 10);
```
❌ **Don't include `under_limit`** - it's generated!

### **Update Article Count:**
```sql
UPDATE daily_stats 
SET articles_created = articles_created + 1
WHERE date = CURRENT_DATE;
```
✅ `under_limit` updates automatically!

### **Change Daily Limit:**
```sql
UPDATE daily_stats 
SET daily_limit = 20
WHERE date = CURRENT_DATE;
```
✅ `under_limit` recalculates automatically!

---

## 🔍 Query Examples

### **Check Today's Stats:**
```sql
SELECT 
    date,
    articles_created,
    daily_limit,
    under_limit,
    (daily_limit - articles_created) as remaining
FROM daily_stats 
WHERE date = CURRENT_DATE;
```

### **Check if Under Limit:**
```sql
SELECT under_limit 
FROM daily_stats 
WHERE date = CURRENT_DATE;
```

### **Get Last 7 Days:**
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

---

## 🚀 Create Table SQL

If you need to recreate the table:

```sql
CREATE TABLE daily_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
    articles_created INTEGER NOT NULL DEFAULT 0,
    daily_limit INTEGER NOT NULL DEFAULT 10,
    under_limit BOOLEAN GENERATED ALWAYS AS (articles_created < daily_limit) STORED,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster date lookups
CREATE INDEX idx_daily_stats_date ON daily_stats(date DESC);

-- Optional: Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_daily_stats_updated_at
    BEFORE UPDATE ON daily_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## ⚠️ Important Notes

### **Generated Column Rules:**
1. ❌ **Cannot INSERT** values into `under_limit`
2. ❌ **Cannot UPDATE** `under_limit` directly
3. ✅ **Automatically updates** when other columns change
4. ✅ **Always accurate** - no manual calculation needed

### **Best Practices:**
- ✅ One row per day
- ✅ Use `date` as unique identifier
- ✅ Let `under_limit` calculate itself
- ✅ Update `articles_created` via trigger or manually

---

## 📁 Files

- **`CHECK-DAILY-STATS-STRUCTURE.sql`** - Query to check your table structure
- **`DAILY-STATS-TABLE-STRUCTURE.md`** - This documentation

---

## 🎯 Summary

```
daily_stats table:
├── id (auto)
├── date (unique, default today)
├── articles_created (starts at 0)
├── daily_limit (default 10)
├── under_limit (generated: articles_created < daily_limit)
├── created_at (auto)
└── updated_at (auto)
```

**Key Point:** `under_limit` is **GENERATED** - you can't set it manually!
