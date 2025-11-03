# ✅ Option 2 Setup Checklist

## 🎯 Quick Setup Guide

Follow these steps in order:

---

## ☑️ STEP 1: Setup Database (5 minutes)

### 1.1 Open Supabase
- [ ] Go to https://supabase.com/dashboard
- [ ] Select your project
- [ ] Click **SQL Editor** (left sidebar)

### 1.2 Run SQL Script
- [ ] Open file: `CREATE-DAILY-STATS-TABLE.sql`
- [ ] Copy ALL content (165 lines)
- [ ] Paste into Supabase SQL Editor
- [ ] Click **RUN** button
- [ ] Wait for: `✅ Daily stats table created successfully!`

### 1.3 Verify Table
- [ ] Go to **Table Editor** (left sidebar)
- [ ] Find `daily_stats` table
- [ ] Should see 1 row with today's date
- [ ] Columns: `id`, `date`, `articles_created`, `daily_limit`, `under_limit`

---

## ☑️ STEP 2: Test Everything (2 minutes)

### 2.1 Run Test Script
```bash
cd "D:\old pc\auto blog v1\auto blog-appv1"
node test-daily-stats.js
```

### 2.2 Expected Results
- [ ] ✅ Test 1: Table exists
- [ ] ✅ Test 2: Can read historical data
- [ ] ✅ Test 3: n8n simulation works
- [ ] ✅ Test 4: Trigger auto-updates

---

## ☑️ STEP 3: Configure n8n (3 minutes)

### 3.1 Create New Workflow
- [ ] Open n8n
- [ ] Create new workflow
- [ ] Name it: "Auto Blog - Daily Limit"

### 3.2 Add Nodes

#### Node 1: Trigger
- [ ] Add **Schedule Trigger** node
- [ ] Set interval: Every 2 hours
- [ ] Save

#### Node 2: Check Limit
- [ ] Add **Supabase** node
- [ ] Connect your Supabase credential
- [ ] Operation: **Get All Rows**
- [ ] Table: `daily_stats`
- [ ] Add Filter:
  - Field: `date`
  - Condition: `equals`
  - Value: `{{ $now.format('YYYY-MM-DD') }}`
- [ ] Limit: `1`
- [ ] Save

#### Node 3: IF Condition
- [ ] Add **IF** node
- [ ] Condition Type: **Boolean**
- [ ] Value 1: `{{ $json.under_limit }}`
- [ ] Operation: `is true`
- [ ] Save

#### Node 4: Your Content Generation
- [ ] Add your AI content generation node
- [ ] (OpenAI, HTTP Request, etc.)
- [ ] Configure as needed

#### Node 5: Create Article
- [ ] Add **Supabase** node
- [ ] Operation: **Insert**
- [ ] Table: `articles`
- [ ] Map your fields:
  - `title` → `{{ $json.title }}`
  - `slug` → `{{ $json.slug }}-{{ $now.format('x') }}`
  - `content` → `{{ $json.content }}`
  - `excerpt` → `{{ $json.excerpt }}`
  - `category_id` → `{{ $json.category_id }}`
  - `author_name` → `AI Content Generator`
  - `status` → `published`
- [ ] Save

#### Node 6: Alert (FALSE branch)
- [ ] Add notification node (Slack/Email/etc.)
- [ ] Message: "⚠️ Daily limit reached!"
- [ ] Save

### 3.3 Connect Nodes
- [ ] Trigger → Check Limit
- [ ] Check Limit → IF
- [ ] IF (TRUE) → Content Generation
- [ ] Content Generation → Create Article
- [ ] IF (FALSE) → Alert

### 3.4 Test Workflow
- [ ] Click "Execute Workflow"
- [ ] Check results
- [ ] Verify article created (if under limit)
- [ ] Check `daily_stats` table updated

---

## ☑️ STEP 4: Verify Everything Works

### 4.1 Check Database
```sql
SELECT * FROM daily_stats WHERE date = CURRENT_DATE;
```
- [ ] `articles_created` should match actual count
- [ ] `under_limit` should be correct

### 4.2 Test Article Creation
- [ ] Create an article through n8n
- [ ] Check `daily_stats` table
- [ ] `articles_created` should increase by 1
- [ ] Trigger is working! ✅

### 4.3 Test Daily Limit
- [ ] Create articles until limit reached
- [ ] Workflow should stop creating articles
- [ ] Alert should be sent
- [ ] Perfect! ✅

---

## 📊 Optional: View Statistics

### Last 7 Days
```sql
SELECT * FROM daily_stats 
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;
```

### Change Daily Limit
```sql
UPDATE daily_stats 
SET daily_limit = 20 
WHERE date = CURRENT_DATE;
```

---

## 🎉 You're Done When:

- ✅ `daily_stats` table exists in Supabase
- ✅ Test script passes all 4 tests
- ✅ n8n workflow is configured
- ✅ Test article creation works
- ✅ Counter increases automatically
- ✅ Workflow stops when limit reached

---

## 📁 Files You Need:

1. **CREATE-DAILY-STATS-TABLE.sql** - Run this in Supabase
2. **OPTION-2-SETUP-GUIDE.md** - Detailed instructions
3. **test-daily-stats.js** - Test script to verify setup
4. **SETUP-CHECKLIST.md** - This file (step by step)

---

## 🆘 Need Help?

If something doesn't work:

1. **Table not found?**
   - Run `CREATE-DAILY-STATS-TABLE.sql` again
   
2. **Trigger not working?**
   - Check Supabase logs
   - Re-run the trigger creation SQL

3. **n8n can't connect?**
   - Verify Supabase credentials
   - Check table permissions

4. **Count not updating?**
   - Run test script: `node test-daily-stats.js`
   - Check trigger exists in Supabase

---

## 🚀 Ready to Start?

### Quick Commands:

```bash
# Navigate to project
cd "D:\old pc\auto blog v1\auto blog-appv1"

# Run test (after SQL setup)
node test-daily-stats.js

# Check current stats
# (Run in Supabase SQL Editor)
SELECT * FROM daily_stats WHERE date = CURRENT_DATE;
```

**Let's do this!** 🎉

