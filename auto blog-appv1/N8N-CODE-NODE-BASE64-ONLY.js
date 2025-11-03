// Complete Code Node: Convert Arrays + Download Image to Base64 (Raw Text Only)
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
  
  // Download and convert image to base64 (raw text only)
  let base64Image = null;
  let imageMimeType = null;
  let hasImage = false;
  
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
      base64Image = imageBuffer.toString('base64'); // Raw base64 text only
      imageMimeType = response.headers['content-type'] || 'image/jpeg';
      hasImage = true;
      
      console.log('Image downloaded successfully:', imageUrl);
    } catch (error) {
      console.error('Image download failed:', error.message);
      base64Image = null;
      hasImage = false;
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
      
      // Image data (base64 raw text only - no data URI prefix)
      featured_image: base64Image, // Just the raw base64 string
      image_mime_type: imageMimeType, // Store mime type separately
      has_image: hasImage,
      original_image_url: imageUrl, // Keep original URL for reference
      
      // Timestamps
      published_at: data.published_at || new Date().toISOString(),
      created_at: data.created_at || new Date().toISOString()
    }
  });
}

return results;
