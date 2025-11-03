# 🎯 Which SQL File Should You Run?

You got an error about `source_url` not existing. Here's what to do:

---

## ⚡ **OPTION 1: Super Simple (RECOMMENDED)**

**File:** `SUPER-SIMPLE-FIX.sql`

**What it does:** 
- ✅ Only fixes 4 essential columns
- ✅ No errors - these columns always exist
- ✅ Fastest solution

**Run this SQL:**
```sql
ALTER TABLE articles ALTER COLUMN title TYPE VARCHAR(500);
ALTER TABLE articles ALTER COLUMN slug TYPE VARCHAR(500);
ALTER TABLE articles ALTER COLUMN content TYPE TEXT;
ALTER TABLE articles ALTER COLUMN excerpt TYPE TEXT;

SELECT '✅ Done!' AS status;
```

**Time:** 30 seconds

---

## 🛡️ **OPTION 2: Safe Fix (Recommended if you have more columns)**

**File:** `SAFE-FIX-ONLY-EXISTING-COLUMNS.sql`

**What it does:**
- ✅ Checks which columns exist first
- ✅ Only modifies existing columns
- ✅ No errors if columns are missing

**Time:** 1 minute

---

## 🔧 **OPTION 3: Complete Fix (Advanced)**

**File:** `COMPLETE-TABLE-FIX.sql`

**What it does:**
- ⚠️ Fixes ALL columns
- ⚠️ Creates missing columns like `source_url`
- ⚠️ Most comprehensive

**Time:** 2 minutes

---

## 🎯 **What I Recommend:**

### **Start with OPTION 1 (Super Simple)**

1. Open `SUPER-SIMPLE-FIX.sql`
2. Copy the SQL
3. Run in Supabase SQL Editor
4. Test your API

If that works, you're done! ✅

If you need more columns later, run OPTION 2.

---

## 🧪 **After Running SQL, Test It:**

```powershell
# In PowerShell:
cd "D:\old pc\auto blog v1\auto blog-appv1"

# Test with simple data:
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/articles" -ContentType "application/json" -Body (@{
    title = "Test Article"
    slug = "test-article-$(Get-Date -Format 'yyyyMMddHHmmss')"
    content = "<div class='post-content'><p>Test</p></div>"
    excerpt = "Test excerpt"
    category_id = 1
    status = "published"
} | ConvertTo-Json)
```

Should return: **Success!** ✅

---

## 🚨 **If You Get Other Errors:**

### Error: "column X does not exist"
**Solution:** That column doesn't exist in your table. You can either:
- Skip that column in your data
- Add it manually: `ALTER TABLE articles ADD COLUMN X TEXT;`

### Error: "permission denied"
**Solution:** Make sure you're using the **service_role** key, not the anon key.

---

## 📋 **Summary:**

| File | Pros | Cons | Recommended? |
|------|------|------|--------------|
| `SUPER-SIMPLE-FIX.sql` | ✅ Fast, no errors | Only 4 columns | ⭐⭐⭐ YES! |
| `SAFE-FIX-ONLY-EXISTING-COLUMNS.sql` | ✅ Fixes all existing | Slower | ⭐⭐ Good |
| `COMPLETE-TABLE-FIX.sql` | ✅ Most complete | Creates new columns | ⭐ Advanced |

---

## 🚀 **Quick Start:**

```sql
-- COPY AND RUN THIS IN SUPABASE:

ALTER TABLE articles ALTER COLUMN title TYPE VARCHAR(500);
ALTER TABLE articles ALTER COLUMN slug TYPE VARCHAR(500);
ALTER TABLE articles ALTER COLUMN content TYPE TEXT;
ALTER TABLE articles ALTER COLUMN excerpt TYPE TEXT;

SELECT '✅ Done!' AS status;
```

**That's it!** 🎉

