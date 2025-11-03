# How to Create Articles Like Option 2 - Complete Guide

This guide explains how to create AI-generated articles with different images and modern structure, similar to Option 2.

## 📋 Overview

Option 2 creates articles with:
- **AI-generated content** using OpenAI GPT-4o-mini
- **Different images** for each placement (not the same image everywhere)
- **Modern HTML structure** with varied layouts
- **Engaging content** optimized for reader retention

## 🚀 Quick Start

### Prerequisites

1. **Node.js** installed (v14 or higher)
2. **OpenAI API Key** in your `.env` file
3. **Supabase** database configured

### Step 1: Setup Environment

Make sure your `.env` file contains:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

### Step 2: Run the Script

```bash
node create-demo-article-option2.js
```

This will:
- Generate fresh AI content
- Use different images for different placements
- Create/update the article in your database

## 📝 How It Works

### Image System

The script uses different images for different placements:

```javascript
const imageUrls = {
    featured: 'https://images.unsplash.com/...',  // Featured image (top)
    content1: 'https://images.unsplash.com/...',  // First content image
    content2: 'https://images.unsplash.com/...',  // Second content image
    content3: 'https://images.unsplash.com/...',  // Third content image
    content4: 'https://images.unsplash.com/...',  // Fourth content image
};
```

### Content Generation

1. **AI Prompt**: The script sends a prompt to OpenAI with:
   - Topic and category
   - Structure requirements (H2, H3, images, blockquotes, etc.)
   - Image placeholders: `[IMAGE_1]`, `[IMAGE_2]`, `[IMAGE_3]`, `[IMAGE_4]`

2. **Content Processing**: After generation:
   - Removes markdown code blocks (`\`\`\`html`)
   - Replaces image placeholders with actual URLs
   - Each placeholder gets a different image

3. **Database Storage**: Saves to Supabase with:
   - Different featured image
   - Content with different images embedded

## 🎨 Customization Guide

### Change Article Topic

Edit the `topic` and `categoryName` variables:

```javascript
const topic = "Your Article Topic Here";
const categoryName = "Your Category Name";
```

### Use Different Images

Update the `imageUrls` object:

```javascript
const imageUrls = {
    featured: 'your-featured-image-url',
    content1: 'your-first-content-image-url',
    content2: 'your-second-content-image-url',
    content3: 'your-third-content-image-url',
    content4: 'your-fourth-content-image-url',
};
```

### Change Article Slug

Modify the slug in the `demoArticle` object:

```javascript
slug: "your-custom-slug-here",
```

### Adjust Content Length

Edit the prompt in `generateArticleContent`:

```javascript
- 1000-1200 Wörter  // Change to desired word count
```

## 📐 Article Structure

The generated articles include:

### HTML Elements

- **Drop Cap**: First paragraph with `class="has-drop-cap"`
- **Headings**: `H2` with `class="mb_head"` for main sections
- **Subheadings**: `H3` for subsections
- **Images**: Side-by-side layouts with `single-post-content_text_media`
- **Blockquotes**: `blockquote` with `class="article-quote"`
- **Lists**: `ul` with `class="article-list"`
- **Info Boxes**: `div` with `class="modern-info-box info/warning/success"`

### Image Placeholders

The AI generates content with placeholders:
- `[IMAGE_1]` → First content image
- `[IMAGE_2]` → Second content image
- `[IMAGE_3]` → Third content image
- `[IMAGE_4]` → Fourth content image

These are replaced with actual URLs before saving.

## 🔧 Advanced Usage

### Create Multiple Articles

Create a loop to generate multiple articles:

```javascript
const topics = [
    "Topic 1",
    "Topic 2",
    "Topic 3"
];

for (const topic of topics) {
    await createDemoArticleOption2();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Delay between articles
}
```

### Different Categories

Modify the `category_id`:

```javascript
category_id: 2,  // Business
// or
category_id: 1,  // Technology
// or
category_id: 3,  // Science
```

### Custom Meta Tags

Update meta information:

```javascript
meta_title: 'Your Custom Title',
meta_description: 'Your custom description',
meta_keywords: ['keyword1', 'keyword2', 'keyword3'],
```

## 📦 File Structure

```
auto blog-appv1/
├── create-demo-article-option2.js  # Main script for Option 2
├── create-new-demo-article.js       # Script for Option 1
├── js/
│   └── article-api.js              # Processes images and content
└── .env                             # Environment variables
```

## 🐛 Troubleshooting

### Error: OPENAI_API_KEY not found
- Make sure `.env` file exists
- Check that `OPENAI_API_KEY` is set correctly

### Error: Images not showing
- Verify image URLs are accessible
- Check browser console for image loading errors
- Ensure `processArticleContent` function runs correctly

### Error: Content has markdown delimiters
- The script automatically removes `\`\`\`html` tags
- If still present, check the cleaning logic

### Images are the same everywhere
- Verify image placeholders are different: `[IMAGE_1]`, `[IMAGE_2]`, etc.
- Check that replacement logic runs correctly
- Verify `imageUrls` object has different URLs

## ✅ Best Practices

1. **Use Different Images**: Always use different images for different placements
2. **Optimize Images**: Use Unsplash with proper dimensions (`w=1200`)
3. **Test Content**: Review generated content before publishing
4. **Check Structure**: Ensure HTML structure is correct
5. **Monitor API Usage**: OpenAI API calls cost money - monitor usage

## 📊 Example Output

After running the script, you'll see:

```
🚀 Creating Demo Article OPTION 2 - Different Style...
============================================================
📰 Topic: "Die Revolution des Remote Work..."
📂 Category: Business
============================================================
🤖 Generating fresh content...
✅ Content generated (5836 chars)
✅ Article created successfully!
📝 Article ID: 37
🔗 URL: http://localhost:3000/article.html?slug=...
```

## 🖼️ Editing Images with fal.ai/recraft/v3/text-to-image

### Overview

You can generate and replace images in your articles using **fal.ai Recraft V3 Text-to-Image API**. This allows you to create custom images tailored to your article content.

### Prerequisites

1. **fal.ai API Key**: Sign up at [fal.ai](https://fal.ai/login) and get your API key
2. **Add API Key to `.env`**:
   ```env
   FAL_API_KEY=your_fal_api_key_here
   ```

### Method 1: Using the Admin Panel (Recommended)

#### Step 1: Generate Article Content

When you generate an article using the admin panel, the system automatically creates a JSON request for fal.ai that you can use.

#### Step 2: Generate Image via fal.ai API

**Option A: Using JavaScript/Node.js**

```javascript
const { fal } = require("@fal-ai/client");

// Configure fal.ai client
fal.config({
  credentials: process.env.FAL_API_KEY
});

// Generate image
async function generateImage(prompt, style = 'realistic_image', size = 'square_hd') {
  try {
    const result = await fal.subscribe("fal-ai/recraft-v3", {
      input: {
        prompt: prompt,
        style: style,
        image_size: size
      }
    });
    
    // Return the image URL
    return result.data.images[0].url;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

// Example usage
const imageUrl = await generateImage(
  "A professional, high-quality featured image representing 'Artificial Intelligence' in the context of Technology. Modern, visually appealing, suitable for a professional blog article. High resolution, sharp details, vibrant colors. No text, no watermark, no overlays."
);
```

**Option B: Using cURL**

```bash
curl -X POST https://fal.ai/models/fal-ai/recraft/v3/text-to-image \
  -H "Authorization: Bearer YOUR_FAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A professional, high-quality featured image representing \"Artificial Intelligence\" in the context of Technology. Modern, visually appealing, suitable for a professional blog article. High resolution, sharp details, vibrant colors. No text, no watermark, no overlays.",
    "style": "realistic_image",
    "image_size": "square_hd"
  }'
```

**Option C: Using Python**

```python
from fal_client import FalClient

client = FalClient("YOUR_FAL_API_KEY")

result = client.subscribe("fal-ai/recraft-v3", {
    "prompt": "A professional, high-quality featured image representing 'Artificial Intelligence' in the context of Technology. Modern, visually appealing, suitable for a professional blog article. High resolution, sharp details, vibrant colors. No text, no watermark, no overlays.",
    "style": "realistic_image",
    "image_size": "square_hd"
})

image_url = result["images"][0]["url"]
```

#### Step 3: Store Image in Article

After generating the image, use the `/api/admin/articles/store-image-from-fal` endpoint:

```javascript
// POST /api/admin/articles/store-image-from-fal
const response = await fetch('/api/admin/articles/store-image-from-fal', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${yourAuthToken}`
  },
  body: JSON.stringify({
    article_id: 123,
    fal_ai_response: {
      images: [{
        url: "https://fal.ai/files/..."
      }]
    }
  })
});
```

### Method 2: Generate Images for Different Placements

For Option 2 articles, you need **different images** for each placement (`[IMAGE_1]`, `[IMAGE_2]`, `[IMAGE_3]`, `[IMAGE_4]`). Here's how:

#### Example: Generate Multiple Images

```javascript
const { fal } = require("@fal-ai/client");

fal.config({
  credentials: process.env.FAL_API_KEY
});

async function generateArticleImages(articleTitle, categoryName) {
  const imagePrompts = [
    {
      placeholder: '[IMAGE_1]',
      prompt: `A professional image showing the main concept of "${articleTitle}" in ${categoryName}. Side-by-side layout image, modern style, high quality.`,
      style: 'realistic_image',
      size: 'landscape_16_9'
    },
    {
      placeholder: '[IMAGE_2]',
      prompt: `A detailed illustration related to "${articleTitle}" showing key benefits or features. Professional blog image, visually engaging.`,
      style: 'realistic_image',
      size: 'landscape_16_9'
    },
    {
      placeholder: '[IMAGE_3]',
      prompt: `An informative visual about "${articleTitle}" showing practical applications or examples. Modern, clean design.`,
      style: 'realistic_image',
      size: 'square_hd'
    },
    {
      placeholder: '[IMAGE_4]',
      prompt: `A compelling image representing the future or impact of "${articleTitle}" in ${categoryName}. Professional, engaging.`,
      style: 'realistic_image',
      size: 'portrait_4_3'
    }
  ];

  const images = {};
  
  for (const imageSpec of imagePrompts) {
    try {
      const result = await fal.subscribe("fal-ai/recraft-v3", {
        input: {
          prompt: imageSpec.prompt,
          style: imageSpec.style,
          image_size: imageSpec.size
        }
      });
      
      images[imageSpec.placeholder] = result.data.images[0].url;
      console.log(`✅ Generated ${imageSpec.placeholder}: ${images[imageSpec.placeholder]}`);
      
      // Wait 2 seconds between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Error generating ${imageSpec.placeholder}:`, error);
    }
  }
  
  return images;
}

// Usage
const images = await generateArticleImages(
  "Die Zukunft der Künstlichen Intelligenz",
  "Technologie"
);
```

### fal.ai API JSON Configuration

#### Available Styles

- `realistic_image` - Photorealistic images (default)
- `digital_illustration` - Digital art style
- `vector_illustration` - Vector graphics style
- `3d_render` - 3D rendered images

#### Available Image Sizes

- `square_hd` - Square HD (1024x1024)
- `portrait_4_3` - Portrait 4:3 aspect ratio
- `landscape_16_9` - Landscape 16:9 aspect ratio
- `landscape_21_9` - Ultra-wide landscape

#### Complete JSON Request Format

```json
{
  "prompt": "A professional, high-quality featured image representing '[TOPIC]' in the context of [CATEGORY]. Modern, visually appealing, suitable for a professional blog article. High resolution, sharp details, vibrant colors. No text, no watermark, no overlays.",
  "style": "realistic_image",
  "image_size": "square_hd",
  "colors": []
}
```

#### Example JSON for Featured Image

```json
{
  "prompt": "A professional, high-quality featured image representing 'Artificial Intelligence' in the context of Technology. Modern, visually appealing, suitable for a professional blog article. High resolution, sharp details, vibrant colors. No text, no watermark, no overlays.",
  "style": "realistic_image",
  "image_size": "square_hd"
}
```

#### Example JSON for Content Image [IMAGE_1]

```json
{
  "prompt": "A professional image showing the main concept of 'Artificial Intelligence' in Technology. Side-by-side layout image, modern style, high quality. Suitable for blog article content. No text overlays.",
  "style": "realistic_image",
  "image_size": "landscape_16_9"
}
```

#### Example JSON for Content Image [IMAGE_2]

```json
{
  "prompt": "A detailed illustration related to 'Artificial Intelligence' showing key benefits or features. Professional blog image, visually engaging. Modern design. No text overlays.",
  "style": "realistic_image",
  "image_size": "landscape_16_9"
}
```

### Editing Images in Admin Panel

#### Step-by-Step Guide

1. **Open Article Editor**
   - Navigate to Admin Panel → Articles
   - Click "Edit" on the article you want to modify

2. **Replace Featured Image**
   - Scroll to "Featured Image" section
   - Upload a new image file, paste a URL, or generate using fal.ai

3. **Replace Content Images**
   - Edit the article content HTML
   - Find image tags: `<img src="[IMAGE_1]" ...>`
   - Replace `[IMAGE_1]`, `[IMAGE_2]`, etc. with new image URLs

4. **Generate New Images via API**
   ```javascript
   // Use the JSON examples above with fal.ai API
   // Then update the article content with new URLs
   ```

5. **Save Changes**
   - Click "Update Article" to save

### Updating Content Images Programmatically

```javascript
// Function to update all [IMAGE_X] placeholders in article content
async function updateArticleImages(articleId, newImages) {
  // Get current article
  const { data: article } = await supabase
    .from('articles')
    .select('content')
    .eq('id', articleId)
    .single();
  
  let updatedContent = article.content;
  
  // Replace each placeholder
  updatedContent = updatedContent.replace(/\[IMAGE_1\]/g, newImages.IMAGE_1);
  updatedContent = updatedContent.replace(/\[IMAGE_2\]/g, newImages.IMAGE_2);
  updatedContent = updatedContent.replace(/\[IMAGE_3\]/g, newImages.IMAGE_3);
  updatedContent = updatedContent.replace(/\[IMAGE_4\]/g, newImages.IMAGE_4);
  
  // Update article
  await supabase
    .from('articles')
    .update({ content: updatedContent })
    .eq('id', articleId);
}
```

### Tips for Better Image Prompts

1. **Be Specific**: Include the article topic and category
2. **Describe Style**: Mention "professional", "modern", "blog article"
3. **Avoid Text**: Always add "No text, no watermark, no overlays"
4. **Specify Layout**: For side-by-side images, mention "Side-by-side layout image"
5. **Quality**: Include "High resolution, sharp details, vibrant colors"

### Example Prompts for Different Categories

#### Technology Category
```json
{
  "prompt": "A futuristic tech image showing cutting-edge technology and innovation. Modern, sleek design with vibrant colors. Professional blog featured image. No text overlays."
}
```

#### Business Category
```json
{
  "prompt": "A professional business image showing collaboration and growth. Modern office setting or business concept. Clean, professional style. Suitable for blog article. No text overlays."
}
```

#### Science Category
```json
{
  "prompt": "A scientific illustration showing research and discovery. Educational, informative style. Professional blog image with detailed visuals. No text overlays."
}
```

#### Health Category
```json
{
  "prompt": "A health and wellness image showing positive lifestyle and medical concepts. Clean, modern design. Professional blog image. No text overlays."
}
```

#### Politics Category
```json
{
  "prompt": "A political image showing governance and democracy concepts. Professional, neutral style. Suitable for blog article. No text overlays."
}
```

### API Response Format

After calling fal.ai API, you'll receive a response like:

```json
{
  "images": [
    {
      "url": "https://fal.ai/files/xxxxx/xxxxx.png",
      "width": 1024,
      "height": 1024
    }
  ]
}
```

Use this format when calling `/store-image-from-fal` endpoint.

### Troubleshooting Image Generation

**Error: Rate limit exceeded**
- Wait 2-3 seconds between requests
- Use a delay: `await new Promise(resolve => setTimeout(resolve, 2000))`

**Error: Invalid API key**
- Verify your `FAL_API_KEY` in `.env`
- Check your fal.ai dashboard for the correct key

**Error: Image not showing**
- Verify the image URL is accessible
- Check CORS settings if hosting images yourself
- Ensure the URL is properly formatted

**Images look similar**
- Vary your prompts significantly
- Use different styles (`realistic_image` vs `digital_illustration`)
- Change image sizes for visual variety

## 🔗 Related Files

- `create-demo-article-option2.js` - Main script
- `create-new-demo-article.js` - Alternative option (Option 1)
- `js/article-api.js` - Image processing logic
- `css/style.css` - Styling for articles
- `css/modern-article-style.css` - Modern article styles
- `admin-routes-articles.js` - API endpoints for image generation

## 📞 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your API keys are correct (OpenAI and fal.ai)
3. Ensure database connection is working
4. Check that Supabase tables exist
5. Verify fal.ai API key is valid and has credits

## 🎯 Summary

To create articles like Option 2:

1. **Run**: `node create-demo-article-option2.js`
2. **Customize**: Edit topic, images, and category
3. **Generate**: AI creates content with different images
4. **Review**: Check the article in your browser
5. **Publish**: Article is automatically saved to database

The key difference from Option 1 is that Option 2 uses **different images** for each placement instead of the same featured image everywhere.

---

**Happy Article Creating! 🚀**

