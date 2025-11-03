# Fix n8n Workflow to Send Arrays to Supabase

## Problem
Supabase error: `malformed array literal: "MSC veranstaltet Technology Roundtable in Brüssel"`

This happens because:
- Database columns (`meta_keywords`, `tags`, `secondary_keywords`) are **array types**
- n8n is sending **string data** instead of **array data**

## Solution

### Option 1: Add a Code Node (Best Solution)

Add this **Code Node** BEFORE your Supabase node:

```javascript
// Convert strings to arrays for Supabase
const items = $input.all();

return items.map(item => {
  const data = item.json;
  
  // Helper function to convert string to array
  const stringToArray = (str) => {
    if (!str || str === '') return [];
    if (Array.isArray(str)) return str;
    return str.split(',').map(item => item.trim()).filter(item => item !== '');
  };
  
  return {
    json: {
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      category: data.category,
      featured_image: data.featured_image,
      author: data.author,
      source_url: data.source_url,
      
      // Convert these to arrays
      meta_keywords: stringToArray(data.meta_keywords),
      secondary_keywords: stringToArray(data.secondary_keywords),
      tags: stringToArray(data.tags),
      
      // Other fields
      meta_description: data.meta_description,
      focus_keyword: data.focus_keyword,
      word_count: data.word_count,
      reading_time: data.reading_time,
      status: data.status || 'published',
      ai_generated: data.ai_generated || true
    }
  };
});
```

### Option 2: Use Set Node with Expressions

In your **Set Node** before Supabase, configure fields like this:

**Field: meta_keywords**
- Type: `Array`
- Expression: `{{ $json.meta_keywords ? $json.meta_keywords.split(',').map(k => k.trim()) : [] }}`

**Field: tags**
- Type: `Array`
- Expression: `{{ $json.tags ? $json.tags.split(',').map(t => t.trim()) : [] }}`

**Field: secondary_keywords**
- Type: `Array`
- Expression: `{{ $json.secondary_keywords ? $json.secondary_keywords.split(',').map(k => k.trim()) : [] }}`

### Option 3: Direct Expression in Supabase Node

In your Supabase node, for each array field:

**meta_keywords field:**
```
={{ $json.meta_keywords ? $json.meta_keywords.split(',').map(item => item.trim()) : [] }}=
```

## Example Data Format

### ❌ Wrong (What you're currently sending):
```json
{
  "title": "MSC Technology Roundtable",
  "meta_keywords": "MSC, Technologie, Roundtable, Brüssel",
  "tags": "technology, event, brussels"
}
```

### ✅ Correct (What Supabase expects):
```json
{
  "title": "MSC Technology Roundtable",
  "meta_keywords": ["MSC", "Technologie", "Roundtable", "Brüssel"],
  "tags": ["technology", "event", "brussels"]
}
```

## Complete n8n Workflow Example

```
[AI Generator Node]
    ↓
[Code Node: Convert Strings to Arrays] ← Add this!
    ↓
[Supabase Node: Insert Article]
```

## Testing

After implementing the fix, test with this sample data:

```json
{
  "title": "Test Article",
  "content": "Test content",
  "meta_keywords": "keyword1, keyword2, keyword3",
  "tags": "tag1, tag2",
  "secondary_keywords": "seo1, seo2"
}
```

Should be converted to:
```json
{
  "title": "Test Article",
  "content": "Test content",
  "meta_keywords": ["keyword1", "keyword2", "keyword3"],
  "tags": ["tag1", "tag2"],
  "secondary_keywords": ["seo1", "seo2"]
}
```

## Quick Fix if AI Already Generates Arrays

If your AI is already generating arrays but n8n is converting them to strings, wrap the field in array notation:

In the Supabase node:
```javascript
={{ $json.meta_keywords }}=
```

Make sure the field type is set to **"Expression"** not **"String"**.

