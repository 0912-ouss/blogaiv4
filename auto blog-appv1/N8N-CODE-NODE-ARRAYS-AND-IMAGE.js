// Complete Code Node: Convert Arrays + Download Image to Base64
const items = $input.all();

// Process all items
const results = [];

for (const item of items) {
  const data = item.json;
  
  // Helper function to safely convert string to array
  const toArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim()).filter(item => item !== '');
    }
    return [];
  };
  
  // Download and convert image to base64 with error handling
  let imageData = {
    featured_image_url: 'https://via.placeholder.com/1792x1024/1a1a1a/ffffff?text=Technology+Article',
    featured_image_base64: null,
    featured_image_mime: null,
    has_image: false
  };
  
  const imageUrl = data.featured_image || data.data?.[0]?.url || data.headers?.location;
  
  if (imageUrl && imageUrl.startsWith('http')) {
    try {
      const response = await this.helpers.httpRequest({
        method: 'GET',
        url: imageUrl,
        encoding: null,
        resolveWithFullResponse: true,
        timeout: 30000
      });

      const imageBuffer = Buffer.from(response.body);
      const base64 = imageBuffer.toString('base64');
      const mimeType = response.headers['content-type'] || 'image/jpeg';

      imageData = {
        featured_image_url: imageUrl,
        featured_image_base64: `data:${mimeType};base64,${base64}`,
        featured_image_mime: mimeType,
        has_image: true
      };
    } catch (error) {
      console.error('Image download failed:', error.message);
      imageData.error = error.message;
    }
  }
  
  // Combine all data
  results.push({
    json: {
      // Original fields
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      category: data.category,
      author: data.author || 'AI Writer',
      source_url: data.source_url,
      word_count: data.word_count,
      reading_time: data.reading_time,
      status: data.status || 'published',
      ai_generated: data.ai_generated !== false,
      
      // Convert these fields to arrays
      meta_keywords: toArray(data.meta_keywords || data.secondary_keywords),
      secondary_keywords: toArray(data.secondary_keywords),
      tags: toArray(data.tags),
      
      // String fields
      meta_description: data.meta_description,
      focus_keyword: data.focus_keyword,
      
      // Image data (base64)
      featured_image: imageData.featured_image_base64 || imageData.featured_image_url,
      featured_image_url: imageData.featured_image_url,
      has_image: imageData.has_image,
      image_mime_type: imageData.featured_image_mime,
      
      // Timestamps
      published_at: data.published_at || new Date().toISOString(),
      created_at: data.created_at || new Date().toISOString()
    }
  });
}

return results;
