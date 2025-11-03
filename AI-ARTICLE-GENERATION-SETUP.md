# AI Article Generation Setup Guide

## Overview
The admin panel now supports AI-powered article generation using OpenAI API. You can create articles by simply entering a keyword and clicking "Generate with AI".

## Setup Instructions

### 1. Get Your OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new secret key
5. Copy the API key (it won't be shown again!)

### 2. Add API Key to Backend
Add your OpenAI API key to the `.env` file in the `auto blog-appv1` folder:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Restart Backend Server
After adding the API key, restart your backend server:

```bash
cd "auto blog-appv1"
node server.js
```

## How to Use

### Creating Articles with AI

1. **Navigate to Create Article**
   - Go to Articles page
   - Click "Create New" button

2. **Fill in AI Settings**
   - **Keyword**: Enter the main keyword or topic (e.g., "artificial intelligence", "climate change")
   - **Category**: Select a category (optional but recommended)
   - **Keyword Focused**: Toggle this on for SEO-optimized content that uses the keyword throughout

3. **Generate Article**
   - Click "Generate with AI" button
   - Wait for the AI to generate content (usually 10-30 seconds)
   - The article will be automatically filled in with:
     - Title
     - Content (HTML format)
     - Excerpt
     - SEO meta tags

4. **Preview Article**
   - Click "See Demo" button to preview how the article will look
   - Review the content and make any edits needed

5. **Publish Article**
   - Select status: Draft, Published, or Archived
   - Click "Publish Article" button
   - The article will be saved and published immediately if status is "Published"

## Features

- **AI-Powered Content Generation**: Uses GPT-4o-mini to generate high-quality blog articles
- **SEO Optimization**: Keyword-focused option for better SEO
- **Category Integration**: Automatically associates articles with selected categories
- **Preview Mode**: See how the article will look before publishing
- **Auto-filled Meta Tags**: Automatically generates SEO meta title, description, and keywords
- **HTML Format**: Content is generated in HTML format for better presentation

## API Endpoint

The backend provides an endpoint at:
```
POST /api/admin/articles/generate-ai
```

**Request Body:**
```json
{
  "keyword": "your keyword here",
  "keywordFocused": true,
  "category_id": 1,
  "category_name": "Technology"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Generated Title",
    "slug": "generated-slug",
    "content": "<div class='post-content'>...</div>",
    "excerpt": "Short description...",
    "category_id": 1,
    "ai_generated": true,
    "meta_title": "SEO Title",
    "meta_description": "SEO Description",
    "meta_keywords": ["keyword1", "keyword2"]
  }
}
```

## Troubleshooting

### "OpenAI API key not configured" Error
- Make sure `OPENAI_API_KEY` is set in your `.env` file
- Restart the backend server after adding the key

### "Failed to generate article" Error
- Check your OpenAI API key is valid
- Verify you have credits in your OpenAI account
- Check backend console for detailed error messages

### Slow Generation
- AI generation takes 10-30 seconds on average
- Check your internet connection
- Verify OpenAI API is accessible

## Notes

- Generated articles are automatically marked as `ai_generated: true`
- You can edit the generated content before publishing
- The "See Demo" button only appears when content exists
- Content is generated in HTML format for better presentation

