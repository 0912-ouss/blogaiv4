// Article Page API Integration - Enhanced for full gmag theme
const API_URL = window.location.origin + '/api';

$(document).ready(function() {
    console.log('🚀 Loading article...');
    const slug = getSlugFromURL();
    if (slug) {
        loadArticle(slug);
        loadCategories();
        loadSidebarContent();
    } else {
        $('#article-content').html('<p>No article slug provided in URL.</p>');
    }
});

// Get slug from URL parameter
function getSlugFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('slug');
}

// Show enhanced loading skeleton
function showLoadingSkeleton() {
    const skeletonHTML = `
        <div class="article-loading">
            <div class="skeleton-loader">
                <div class="skeleton-title"></div>
                <div class="skeleton-content"></div>
                <div class="skeleton-content"></div>
                <div class="skeleton-content"></div>
                <div class="skeleton-content" style="width: 60%;"></div>
            </div>
        </div>
    `;
    $('#article-header').html(skeletonHTML);
    $('#article-content').html(skeletonHTML);
}

// Load main article with enhanced UX
async function loadArticle(slug) {
    try {
        // Show enhanced loading skeleton
        showLoadingSkeleton();
        
        // Add reading progress bar
        addReadingProgressBar();
        
        // Check if preview mode is enabled (for drafts)
        const urlParams = new URLSearchParams(window.location.search);
        const preview = urlParams.get('preview') === 'true';
        
        const apiUrl = preview 
            ? `${API_URL}/articles/${slug}?preview=true`
            : `${API_URL}/articles/${slug}`;
        
        console.log('🔍 Fetching article from:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        // Check if response is OK
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Article not found - The article may not exist or may not be published yet.');
            } else if (response.status === 500) {
                throw new Error('Server error - Please check if the backend server is running.');
            } else {
                throw new Error(`Failed to load article (Status: ${response.status})`);
            }
        }
        
        const json = await response.json();
        
        // Check if API returned success
        if (!json.success) {
            throw new Error(json.error || 'Article not found');
        }
        
        if (!json.data) {
            throw new Error('Article data is missing');
        }
        
        const article = json.data;
        console.log('✓ Article loaded:', article.title);
        
        // Update page title
        document.title = article.title + ' - Blog';
        $('#page-title').text(article.title + ' - Blog');
        $('#meta-keywords').attr('content', article.title);
        $('#meta-description').attr('content', article.excerpt || stripHtml(article.content).substring(0, 160));
        
        // Update breadcrumb
        $('#breadcrumb-title').text(article.title);
        
        // Load article header with fade-in
        loadArticleHeader(article);
        
        // Load article media (image)
        loadArticleMedia(article);
        
        // Load article content with animation
        setTimeout(() => {
            loadArticleContent(article);
            $('#article-content').addClass('article-content-fade-in');
        }, 200);
        
        // Load article tags
        loadArticleTags(article);
        
        // Load author info
        loadAuthorInfo(article);
        
        // Add enhanced social share buttons
        addSocialShareButtons(article);
        
        // Update Open Graph meta tags
        updateOpenGraphTags(article);
        
        // Load related articles
        loadRelatedArticles(article);
        
        // Load prev/next navigation
        loadArticleNavigation(slug);
        
        // Load comments
        loadComments(slug);
        
        // Load news ticker
        loadNewsTicker();
        
        // Load and setup like button
        loadLikeButton(article.id);
        
        // Add scroll to top button
        addScrollToTopButton();
        
        // Add reading mode toggle
        addReadingModeToggle();
        
        // Fade out loader smoothly
        $('.ajax-loader').fadeOut(300);
        $('.article-loading').fadeOut(300);
        
    } catch (error) {
        console.error('❌ Error loading article:', error);
        console.error('Error details:', {
            message: error.message,
            slug: slug,
            apiUrl: `${API_URL}/articles/${slug}`
        });
        
        // Hide loading elements
        $('.ajax-loader').fadeOut(300);
        $('.article-loading').fadeOut(300);
        
        // Show error message
        const errorMessage = error.message || 'The article you\'re looking for doesn\'t exist or has been removed.';
        const isNetworkError = error.message.includes('Failed to fetch') || error.message.includes('NetworkError');
        const isServerError = error.message.includes('Server error');
        
        let errorHTML = `
            <div style="text-align: center; padding: 60px 20px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #e23e57; margin-bottom: 20px; font-size: 28px;">Article Not Found</h2>
                <p style="color: #666; margin-bottom: 20px; font-size: 16px; line-height: 1.6;">${errorMessage}</p>
        `;
        
        // Add troubleshooting tips for network/server errors
        if (isNetworkError || isServerError) {
            errorHTML += `
                <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: left;">
                    <strong style="color: #856404; display: block; margin-bottom: 10px;">💡 Troubleshooting Tips:</strong>
                    <ul style="color: #856404; margin: 0; padding-left: 20px; line-height: 1.8;">
                        <li>Make sure the backend server is running on port 3000</li>
                        <li>Check if the API URL is correct: <code style="background: #f8f9fa; padding: 2px 6px; border-radius: 3px;">${API_URL}/articles/${slug}</code></li>
                        <li>Verify your network connection</li>
                        <li>Check browser console for more details</li>
                    </ul>
                </div>
            `;
        }
        
        errorHTML += `
                <div style="margin-top: 30px;">
                    <a href="index.html" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; margin-right: 10px; transition: background 0.3s;">Go to Homepage</a>
                    <button onclick="window.location.reload()" style="display: inline-block; padding: 12px 30px; background: #6c757d; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.3s;">Try Again</button>
                </div>
            </div>
        `;
        
        $('#article-header').html(errorHTML);
        $('#article-content').html('');
        $('#article-media').html('');
    }
}

// Add reading progress bar
function addReadingProgressBar() {
    if ($('.reading-progress').length) return;
    
    $('body').prepend('<div class="reading-progress"></div>');
    
    $(window).on('scroll', function() {
        const windowHeight = $(window).height();
        const documentHeight = $(document).height();
        const scrollTop = $(window).scrollTop();
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
        $('.reading-progress').css('width', scrollPercent + '%');
    });
}

// Add scroll to top button
function addScrollToTopButton() {
    if ($('.scroll-to-top').length) return;
    
    $('body').append('<button class="scroll-to-top" aria-label="Scroll to top"><i class="fas fa-arrow-up"></i></button>');
    
    $(window).on('scroll', function() {
        if ($(window).scrollTop() > 300) {
            $('.scroll-to-top').addClass('visible');
        } else {
            $('.scroll-to-top').removeClass('visible');
        }
    });
    
    $('.scroll-to-top').on('click', function() {
        $('html, body').animate({ scrollTop: 0 }, 600);
    });
}

// Add reading mode toggle
function addReadingModeToggle() {
    if ($('.reading-mode-toggle').length) return;
    
    $('body').append('<button class="reading-mode-toggle"><i class="fas fa-book-reader"></i> Reading Mode</button>');
    
    $('.reading-mode-toggle').on('click', function() {
        $('body').toggleClass('reading-mode');
        const isReadingMode = $('body').hasClass('reading-mode');
        $(this).html(isReadingMode ? '<i class="fas fa-times"></i> Exit Mode' : '<i class="fas fa-book-reader"></i> Reading Mode');
    });
}

// Load article header - clean minimalist style
function loadArticleHeader(article) {
    const date = formatDate(article.published_at || article.created_at);
    const categoryName = (article.categories && (article.categories.name || (Array.isArray(article.categories) && article.categories[0]?.name))) || article.category || 'Uncategorized';
    const plain = stripHtml(article.content || '');
    
    // Use reading_time from backend if available, otherwise calculate
    const readingTimeMin = article.reading_time || (() => {
        const words = plain.split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.round(words / 225));
    })();
    
    // Clean minimalist structure
    const authorName = article.author_name || article.author || (article.authors?.name) || 'Admin';
    const headerHTML = `
        <a class="post-category-marker modern-category" href="index.html?category=${categoryName}">${categoryName}</a>
        <h1 class="modern-title">${article.title}</h1>
        ${article.excerpt ? `<h4 class="modern-excerpt">${article.excerpt}</h4>` : ''}
        <div class="author-link modern-author">
            <a href="author.html?slug=${article.authors?.slug || 'author'}"><span>By ${authorName}</span></a>
        </div>
        <span class="post-date modern-date">${date} • ${readingTimeMin} min read</span>
        <ul class="post-opt modern-meta">
            <li><i class="fal fa-eye"></i> ${article.view_count || 0} views</li>
            <li class="like-option" data-article-id="${article.id}">
                <i class="fal fa-heart like-icon"></i> 
                <span class="like-count">0</span> likes
            </li>
        </ul>
    `;
    
    $('#article-header').html(headerHTML);
    $('#article-header').addClass('enhanced-header');

    // Inject enhanced reading UX controls/styles once
    injectReadingUX();
    
    // Add modern reading features
    addModernReadingFeatures();
}

// Load and setup like button for article page
async function loadLikeButton(articleId) {
    if (!articleId) return;
    
    // Wait for DOM to be ready
    setTimeout(async () => {
        const likeElement = document.querySelector('.like-option[data-article-id="' + articleId + '"]');
        if (!likeElement) return;
        
        const likeIcon = likeElement.querySelector('.like-icon');
        const likeCount = likeElement.querySelector('.like-count');
        
        try {
            // Get like status
            const statusResponse = await fetch(`${API_URL}/articles/${articleId}/like-status`);
            const statusData = await statusResponse.json();
            
            if (statusData.success) {
                if (likeCount) {
                    likeCount.textContent = statusData.likeCount || 0;
                }
                
                if (statusData.liked && likeIcon) {
                    likeIcon.classList.add('liked');
                    likeIcon.classList.remove('fal');
                    likeIcon.classList.add('fas');
                    likeIcon.style.color = '#ef4444';
                }
                
                // Add click handler
                likeElement.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    try {
                        const response = await fetch(`${API_URL}/articles/${articleId}/like`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        const data = await response.json();
                        
                        if (data.success && likeIcon && likeCount) {
                            likeCount.textContent = data.likeCount || 0;
                            
                            if (data.liked) {
                                likeIcon.classList.add('liked');
                                likeIcon.classList.remove('fal');
                                likeIcon.classList.add('fas');
                                likeIcon.style.color = '#ef4444';
                            } else {
                                likeIcon.classList.remove('liked');
                                likeIcon.classList.remove('fas');
                                likeIcon.classList.add('fal');
                                likeIcon.style.color = '';
                            }
                        }
                    } catch (error) {
                        console.error('Error toggling like:', error);
                    }
                });
            }
        } catch (error) {
            console.error('Error loading like status:', error);
        }
    }, 300);
}

// Load article media - keep existing structure
function loadArticleMedia(article) {
    if (article.featured_image) {
        // Keep original slider structure but enhance with CSS
        const mediaHTML = `
            <div class="single-slider-wrap fl-wrap enhanced-media">
                <div class="single-slider fl-wrap">
                    <div class="swiper-container">
                        <div class="swiper-wrapper lightgallery">
                            <div class="swiper-slide hov_zoom">
                                <img src="${article.featured_image}" alt="${article.title}" loading="lazy" class="article-featured-image modern-featured-img">
                                <a href="${article.featured_image}" class="box-media-zoom popup-image"><i class="fas fa-search"></i></a>
                                <span class="post-media_title pmd_vis">© ${article.title}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $('#article-media').html(mediaHTML);
        $('#article-media').addClass('enhanced-media-wrap');
        
        // Optimize image loading
        optimizeImageLoading();
    } else {
        $('#article-media').html('');
    }
}

// Optimize image loading - lazy load and add error handling
function optimizeImageLoading() {
    // Add lazy loading to all images in content
    $('#article-content img').each(function() {
        const $img = $(this);
        if (!$img.attr('loading')) {
            $img.attr('loading', 'lazy');
        }
        
        // Add error handler for broken images
        $img.on('error', function() {
            $(this).attr('src', 'images/all/1.jpg'); // Fallback image
        });
    });
    
    // Add intersection observer for lazy loading if supported
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });
        
        $('#article-content img[data-src]').each(function() {
            imageObserver.observe(this);
        });
    }
}

// Load article content - keep existing structure, enhance with CSS
function loadArticleContent(article) {
    let content = article.content || '';
    
    // Process and enhance the content HTML
    content = processArticleContent(content, article);
    
    // Keep original structure, just add enhancement class
    $('#article-content').html(content);
    $('#article-content').addClass('enhanced-content');
    $('.single-post-content_text').addClass('enhanced-content-wrapper');
    
    // Process images and enhance readability
    setTimeout(() => {
        processContentImages();
        enhanceReadability();
        initializeContentStructure();
        // Removed: generateTableOfContents();
        // Removed: generateModernTableOfContents();
        addPullQuotes();
        addInfoBoxes();
        // Removed: addFloatingShareBar(article);
        // Removed: addReadingProgressCircle();
    }, 100);
}

// Process article content: fix images, structure, and formatting
function processArticleContent(content, article) {
    if (!content) return '<p>No content available.</p>';
    
    // Remove markdown code block delimiters if present
    let cleanedContent = content
        .replace(/^```html\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
    
    // Create a temporary div to process HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanedContent;
    
    // Process all images in the content
    const images = tempDiv.querySelectorAll('img');
    let imageIndex = 0;
    const contentImages = [
        article.featured_image,
        article.featured_image_url,
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80', // Team/Work
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', // Data/Chart
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', // Innovation
    ];
    
    images.forEach((img, index) => {
        const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
        
        // Fix image sources
        if (src) {
            // Handle placeholder images - use different images for different placements
            if (src.includes('[FEATURED_IMAGE_URL]') || src.includes('[IMAGE_')) {
                // Use different image based on index
                const imageToUse = contentImages[index % contentImages.length] || article.featured_image || article.featured_image_url;
                img.src = imageToUse;
                img.setAttribute('data-original', imageToUse);
            } else if (src.startsWith('http') || src.startsWith('//') || src.startsWith('/')) {
                // Valid URL - keep it
                img.setAttribute('data-original', src);
            } else {
                // Relative or invalid path - use different image based on index
                const imageToUse = contentImages[index % contentImages.length] || article.featured_image || article.featured_image_url;
                img.src = imageToUse;
                img.setAttribute('data-original', imageToUse);
            }
            
            // Ensure proper attributes
            if (!img.alt) {
                img.alt = article.title || 'Article image';
            }
            img.loading = 'lazy';
            img.classList.add('article-content-image', 'respimg');
            
            // Add error handling
            img.onerror = function() {
                const fallbackImage = contentImages[0] || article.featured_image || 'images/all/1.jpg';
                this.src = fallbackImage;
                this.onerror = null; // Prevent infinite loop
            };
        }
    });
    
    // Process image containers and fix structure
    const imageContainers = tempDiv.querySelectorAll('.single-post-content_text_media, [class*="image"], [class*="media"]');
    imageContainers.forEach(container => {
        const img = container.querySelector('img');
        if (img && !img.src) {
            // Fix broken image containers
            if (article.featured_image) {
                img.src = article.featured_image;
            }
        }
        
        // Ensure responsive classes
        if (!container.classList.contains('fl-wrap')) {
            container.classList.add('fl-wrap');
        }
    });
    
    // Ensure paragraphs have proper styling
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
        if (!p.className) {
            p.classList.add('smpar');
        }
        // Ensure first paragraph has drop cap if it should
        if (p.textContent.trim().length > 100 && !p.classList.contains('has-drop-cap')) {
            const firstChar = p.textContent.trim()[0];
            if (firstChar && firstChar.match(/[A-Za-zÄÖÜäöü]/)) {
                p.classList.add('has-drop-cap');
            }
        }
    });
    
    // Ensure headings are properly styled
    const headings = tempDiv.querySelectorAll('h2, h3, h4');
    headings.forEach(heading => {
        if (!heading.className) {
            if (heading.tagName === 'H2' || heading.tagName === 'H4') {
                heading.classList.add('mb_head');
            }
        }
    });
    
    // Wrap content in a readable container if not already wrapped
    const processedContent = tempDiv.innerHTML;
    
    // If content is too bare, wrap it better
    if (!processedContent.includes('<div') && !processedContent.includes('<section')) {
        return `<div class="article-text-content">${processedContent}</div>`;
    }
    
    return processedContent;
}

// Process and fix all images in content
function processContentImages() {
    $('#article-content').find('img').each(function() {
        const $img = $(this);
        const src = $img.attr('src') || $img.attr('data-src') || $img.data('original');
        
        if (!src || src.includes('[FEATURED_IMAGE_URL]')) {
            // Try to get from data attribute or use featured image
            const featuredImg = $('#article-media img').attr('src');
            if (featuredImg) {
                $img.attr('src', featuredImg);
                $img.data('original', featuredImg);
            } else {
                $img.attr('src', 'images/all/1.jpg');
            }
        }
        
        // Ensure responsive image class
        if (!$img.hasClass('respimg')) {
            $img.addClass('respimg article-content-image');
        }
        
        // Ensure lazy loading
        if (!$img.attr('loading')) {
            $img.attr('loading', 'lazy');
        }
        
        // Ensure alt text
        if (!$img.attr('alt')) {
            const articleTitle = $('#article-header h1').text() || 'Article image';
            $img.attr('alt', articleTitle);
        }
        
        // Add error handler
        $img.off('error').on('error', function() {
            const fallback = $('#article-media img').attr('src') || 'images/all/1.jpg';
            $(this).attr('src', fallback);
        });
        
        // Wrap images in proper containers if needed
        if (!$img.parent().hasClass('single-post-content_text_media') && 
            !$img.parent().hasClass('row') && 
            $img.css('display') !== 'none') {
            // Wrap standalone images
            if (!$img.parent().hasClass('image-wrapper')) {
                $img.wrap('<div class="article-image-wrapper fl-wrap"></div>');
            }
        }
    });
    
    // Fix image containers structure
    $('#article-content .single-post-content_text_media').each(function() {
        const $container = $(this);
        
        // Ensure it has row structure if it has both image and text
        if ($container.find('.row').length === 0 && $container.find('img').length > 0 && $container.find('p').length > 0) {
            const $img = $container.find('img').first();
            const $textElements = $container.find('p, div').not($img.parent()).not($img.closest('div'));
            
            if ($textElements.length > 0) {
                let textHTML = '';
                $textElements.each(function() {
                    textHTML += this.outerHTML;
                });
                
                $container.html(`
                    <div class="row">
                        <div class="col-md-6">${$img[0].outerHTML}</div>
                        <div class="col-md-6">${textHTML}</div>
                    </div>
                `);
            }
        }
    });
}

// Enhance readability of article content
function enhanceReadability() {
    const $content = $('#article-content');
    
    // Drop-cap logic: ensure ONLY the first eligible paragraph has a drop cap
    const $paragraphs = $content.find('p');
    // Remove any existing drop caps first
    $paragraphs.removeClass('has-drop-cap');
    // Find the first meaningful paragraph (non-empty, not inside blockquote)
    const $firstEligible = $paragraphs.filter(function() {
        const text = $(this).text().trim();
        const isEmpty = text.length < 60; // require some length to avoid tiny lead
        const inQuote = $(this).closest('blockquote').length > 0;
        return !isEmpty && !inQuote;
    }).first();
    if ($firstEligible.length) {
        $firstEligible.addClass('has-drop-cap lead-paragraph');
    }
    
    // Ensure proper spacing between sections - REMOVED excessive spacing
    // Don't add section-spacers anymore - let CSS handle spacing naturally
    $content.find('.section-spacer').remove();
    
    // Ensure lists are properly styled
    $content.find('ul, ol').each(function() {
        if (!$(this).hasClass('article-list')) {
            $(this).addClass('article-list');
        }
    });
    
    // Fix blockquotes
    $content.find('blockquote').each(function() {
        if (!$(this).hasClass('article-quote')) {
            $(this).addClass('article-quote');
        }
    });
}

// Initialize content structure and interactions
function initializeContentStructure() {
    // Re-initialize any theme-specific scripts that need the content
    if (typeof initbg !== 'undefined') {
        initbg();
    }
    
    // Initialize lightbox for images if available
    if (typeof lightGallery !== 'undefined') {
        $('#article-content img').each(function() {
            const $img = $(this);
            if (!$img.parent().hasClass('lightgallery')) {
                $img.wrap('<a href="' + $img.attr('src') + '" class="popup-image lightgallery"></a>');
            }
        });
    }
    
    // Add smooth scroll for anchor links
    $('#article-content a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 100
            }, 600);
        }
    });
}

// Generate a table of contents from headings with toggle option
function generateTableOfContents() {
    const $content = $('#article-content');
    const $headings = $content.find('h2, h3');
    if ($headings.length === 0) return;

    // Create IDs for headings
    $headings.each(function(idx) {
        if (!this.id) {
            const slug = $(this).text().toLowerCase().trim()
                .replace(/[^a-z0-9\säöüÄÖÜß-]/g, '')
                .replace(/\s+/g, '-').substring(0, 60);
            this.id = slug || `section-${idx}`;
        }
    });

    // Build TOC HTML with toggle button
    let tocHtml = `
        <div class="article-toc">
            <div class="toc-header">
                <div class="toc-title">Contents</div>
                <button class="toc-toggle-btn" aria-label="Toggle table of contents">
                    <i class="fas fa-chevron-up"></i>
                </button>
            </div>
            <div class="toc-content">
                <ul class="toc-list">`;
    $headings.each(function() {
        const tag = this.tagName.toLowerCase();
        const indent = tag === 'h3' ? ' class="toc-sub"' : '';
        tocHtml += `<li${indent}><a href="#${this.id}">${$(this).text()}</a></li>`;
    });
    tocHtml += `
                </ul>
            </div>
        </div>`;

    // Insert TOC near the top of the content if not present
    if ($('.article-toc').length === 0) {
        $('#article-content').prepend(tocHtml);
        
        // Add toggle functionality
        $('.toc-toggle-btn').on('click', function() {
            const $toc = $(this).closest('.article-toc');
            const $tocContent = $toc.find('.toc-content');
            const $icon = $(this).find('i');
            
            $tocContent.slideToggle(300);
            $toc.toggleClass('collapsed');
            
            // Update icon
            if ($toc.hasClass('collapsed')) {
                $icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
            } else {
                $icon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
            }
        });
    }

    // Smooth scroll for TOC links
    $('.article-toc a').on('click', function(e) {
        e.preventDefault();
        const tgt = $($(this).attr('href'));
        if (tgt.length) {
            $('html, body').animate({ scrollTop: tgt.offset().top - 90 }, 500);
        }
    });
}

// Generate clean table of contents sidebar
function generateModernTableOfContents() {
    const $content = $('#article-content.enhanced-content');
    const $headings = $content.find('h2, h3, h4');
    if ($headings.length < 3) return;
    
    // Create IDs for headings
    $headings.each(function(idx) {
        if (!this.id) {
            const slug = $(this).text().toLowerCase().trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            this.id = `heading-${idx}-${slug}`;
        }
    });
    
    // Build clean TOC HTML
    let tocHTML = '<div class="modern-toc"><div class="toc-title">Contents</div><ul class="toc-list">';
    
    $headings.each(function() {
        const level = parseInt(this.tagName.charAt(1)) - 1;
        const text = $(this).text();
        const id = this.id;
        tocHTML += `<li class="toc-level-${level}"><a href="#${id}">${text}</a></li>`;
    });
    
    tocHTML += '</ul></div>';
    
    $('body').append(tocHTML);
    
    // Smooth scroll on TOC link click
    $('.modern-toc a').on('click', function(e) {
        e.preventDefault();
        const targetId = $(this).attr('href');
        const $target = $(targetId);
        if ($target.length) {
            $('html, body').animate({ scrollTop: $target.offset().top - 90 }, 500);
        }
    });
    
    // Show TOC only after scrolling, hide on small screens
    function updateTOC() {
        const scrollTop = $(window).scrollTop();
        const windowWidth = $(window).width();
        
        if (windowWidth > 1024 && scrollTop > 400) {
            $('.modern-toc').addClass('visible');
        } else {
            $('.modern-toc').removeClass('visible');
        }
    }
    
    $(window).on('scroll', updateTOC);
    $(window).on('resize', updateTOC);
    updateTOC();
    
    // Highlight current section
    $(window).on('scroll', function() {
        const scrollPos = $(window).scrollTop() + 150;
        $headings.each(function() {
            const top = $(this).offset().top;
            const bottom = top + $(this).outerHeight();
            if (scrollPos >= top && scrollPos <= bottom) {
                $('.modern-toc a').removeClass('active');
                $(`.modern-toc a[href="#${this.id}"]`).addClass('active');
            }
        });
    });
}

// Add clean pull quotes - minimal styling
function addPullQuotes() {
    const $content = $('#article-content.enhanced-content');
    const $paragraphs = $content.find('p');
    
    // Add pull quote every 6-8 paragraphs, but only if not already present
    let quoteCount = 0;
    $paragraphs.each(function(index) {
        if (index > 0 && index % 7 === 0 && $(this).text().length > 100 && quoteCount < 2) {
            const quoteText = $(this).text().substring(0, 180);
            if (quoteText.length > 50 && !$(this).next().hasClass('modern-pull-quote')) {
                const pullQuote = `<div class="modern-pull-quote">${quoteText}...</div>`;
                $(this).after(pullQuote);
                quoteCount++;
            }
        }
    });
}

// Add clean info boxes - only for truly important content
function addInfoBoxes() {
    const $content = $('#article-content.enhanced-content');
    
    // Find paragraphs that might be important points
    $content.find('p').each(function() {
        const text = $(this).text().toLowerCase();
        if ((text.includes('important:') || text.includes('note:') || text.includes('tip:')) && !$(this).parent().hasClass('modern-info-box')) {
            $(this).wrap('<div class="modern-info-box info"></div>');
        } else if ((text.includes('warning:') || text.includes('caution:')) && !$(this).parent().hasClass('modern-info-box')) {
            $(this).wrap('<div class="modern-info-box warning"></div>');
        } else if ((text.includes('success:') || text.includes('great:')) && !$(this).parent().hasClass('modern-info-box')) {
            $(this).wrap('<div class="modern-info-box success"></div>');
        }
    });
}

// Add clean floating share bar
function addFloatingShareBar(article) {
    if ($('.floating-share-bar').length) return;
    
    const articleUrl = encodeURIComponent(window.location.href);
    const articleTitle = encodeURIComponent(article.title);
    
    const shareBarHTML = `
        <div class="floating-share-bar">
            <a href="https://www.facebook.com/sharer/sharer.php?u=${articleUrl}" target="_blank" class="share-btn facebook" title="Share on Facebook">
                <i class="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com/intent/tweet?url=${articleUrl}&text=${articleTitle}" target="_blank" class="share-btn twitter" title="Share on Twitter">
                <i class="fab fa-twitter"></i>
            </a>
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${articleUrl}" target="_blank" class="share-btn linkedin" title="Share on LinkedIn">
                <i class="fab fa-linkedin-in"></i>
            </a>
            <a href="https://pinterest.com/pin/create/button/?url=${articleUrl}&media=${encodeURIComponent(article.featured_image || '')}&description=${articleTitle}" target="_blank" class="share-btn pinterest" title="Share on Pinterest">
                <i class="fab fa-pinterest-p"></i>
            </a>
        </div>
    `;
    
    $('body').append(shareBarHTML);
    
    // Show/hide based on scroll and screen size
    function updateShareBar() {
        const scrollTop = $(window).scrollTop();
        const windowWidth = $(window).width();
        
        if (windowWidth > 1024 && scrollTop > 400) {
            $('.floating-share-bar').addClass('visible');
        } else {
            $('.floating-share-bar').removeClass('visible');
        }
    }
    
    $(window).on('scroll', updateShareBar);
    $(window).on('resize', updateShareBar);
    updateShareBar();
}

// Add clean reading progress circle
function addReadingProgressCircle() {
    if ($('.reading-progress-circle').length) return;
    
    const circleHTML = `
        <div class="reading-progress-circle">
            <svg>
                <circle class="progress-circle-bg" cx="25" cy="25" r="22"></circle>
                <circle class="progress-circle" cx="25" cy="25" r="22"></circle>
            </svg>
            <div class="progress-text">0%</div>
        </div>
    `;
    
    $('body').append(circleHTML);
    
    // Update progress on scroll
    $(window).on('scroll', function() {
        const windowHeight = $(window).height();
        const documentHeight = $(document).height();
        const scrollTop = $(window).scrollTop();
        const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
        
        const circumference = 2 * Math.PI * 22; // radius = 22
        const offset = circumference - (scrollPercent / 100) * circumference;
        
        $('.reading-progress-circle .progress-circle').css('stroke-dashoffset', offset);
        $('.reading-progress-circle .progress-text').text(scrollPercent + '%');
        
        if (scrollTop > 300) {
            $('.reading-progress-circle').addClass('visible');
        } else {
            $('.reading-progress-circle').removeClass('visible');
        }
    });
}

// Add modern reading features
function addModernReadingFeatures() {
    // Add smooth scroll to headings when clicked
    $('#article-content.enhanced-content h2, #article-content.enhanced-content h3').on('click', function() {
        if (this.id) {
            window.location.hash = this.id;
        }
    });
    
    // Add subtle animations on scroll
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        $('#article-content.enhanced-content p, #article-content.enhanced-content img').each(function() {
            $(this).css({
                'opacity': '0',
                'transform': 'translateY(20px)',
                'transition': 'opacity 0.6s ease, transform 0.6s ease'
            });
            observer.observe(this);
        });
    }
}

// Inject minimal CSS and a reading-mode toggle to improve legibility
function injectReadingUX() {
    if (document.getElementById('reading-ux-styles')) return;
    const style = document.createElement('style');
    style.id = 'reading-ux-styles';
    style.textContent = `
      .single-post-content_text{max-width: 840px;margin:0 auto;}
      #article-content{line-height:1.85;font-size:18px}
      #article-content .lead-paragraph{font-size:20px}
      .article-toc{display:none !important;visibility:hidden !important}
      .article-image-wrapper{margin:18px 0;text-align:center}
      .article-image-wrapper img{max-width:100%;height:auto;border-radius:8px}
      blockquote.article-quote{border-left:4px solid #e23e57;padding:12px 16px;background:#fff7f8;border-radius:6px}
      body.reading-mode #article-content{font-size:20px;line-height:1.95}
      body.reading-mode .single-post-content_text{max-width: 900px}
    `;
    document.head.appendChild(style);

    // Automatically enable reading mode on page load
    document.body.classList.add('reading-mode');

    // Add reading mode toggle button once
    const $controls = $('.fs-wrap');
    if ($controls.length && $('.reading-toggle').length === 0) {
        $controls.append('<button class="reading-toggle btn" style="margin-left:8px">Exit Reading Mode</button>');
        $('.reading-toggle').on('click', () => {
            document.body.classList.toggle('reading-mode');
            const isReadingMode = $('body').hasClass('reading-mode');
            $(this).html(isReadingMode ? '<i class="fas fa-times"></i> Exit Reading Mode' : '<i class="fas fa-book-reader"></i> Reading Mode');
        });
    }
}

// Load article tags
function loadArticleTags(article) {
    const categoryName = (article.categories && (article.categories.name || (Array.isArray(article.categories) && article.categories[0]?.name))) || article.category || 'Uncategorized';
    
    const tagsHTML = `
        <div class="post-single-tags">
            <span class="tags-title"><i class="fas fa-tag"></i> Tags : </span>
            <div class="tags-widget">
                <a href="index.html?category=${categoryName}">${categoryName}</a>
                ${article.author ? `<a href="#">${article.author}</a>` : ''}
            </div>
        </div>
    `;
    
    $('#article-tags').html(tagsHTML);
    
    // Add print button after tags
    addPrintButton();
}

// Add print button
function addPrintButton() {
    if ($('#print-article-btn').length) return; // Already exists
    
    const printBtnHTML = `
        <button id="print-article-btn" class="print-article-btn" onclick="window.print()">
            <i class="fas fa-print"></i> Print Article
        </button>
    `;
    
    $('#article-tags').after(printBtnHTML);
}

// Load author info - with real author data
async function loadAuthorInfo(article) {
    let authorName = article.author_name || article.author || 'Admin';
    let authorBio = 'Experienced writer and content creator passionate about sharing knowledge and insights.';
    let authorAvatar = 'images/avatar/1.jpg';
    
    // Try to fetch author details if author_id exists
    if (article.author_id && article.authors && article.authors.slug) {
        // Already have author data from join, use it
        authorName = article.authors.name || authorName;
        authorBio = article.authors.bio || authorBio;
        if (article.authors.avatar_url) {
            authorAvatar = article.authors.avatar_url;
        }
    } else if (article.authors && article.authors.slug) {
        // Has author slug from join
        try {
            const response = await fetch(`${API_URL}/authors/${article.authors.slug}`);
            if (response.ok) {
                const json = await response.json();
                if (json.success && json.data) {
                    authorName = json.data.name || authorName;
                    authorBio = json.data.bio || authorBio;
                    if (json.data.avatar_url) {
                        authorAvatar = json.data.avatar_url;
                    }
                }
            }
        } catch (error) {
            console.warn('Could not fetch author details:', error);
        }
    }
    
    // If article has authors object from join
    if (article.authors) {
        authorName = article.authors.name || authorName;
        authorBio = article.authors.bio || authorBio;
        if (article.authors.avatar_url) {
            authorAvatar = article.authors.avatar_url;
        }
    }
    
    const authorHTML = `
        <div class="author-img">
            <img src="${authorAvatar}" alt="${authorName}" onerror="this.src='images/avatar/1.jpg'">	
        </div>
        <div class="author-content fl-wrap">
            <h5>Written By <a href="author.html?slug=${article.authors?.slug || 'author'}">${authorName}</a></h5>
            <p>${authorBio}</p>
        </div>
        <div class="profile-card-footer fl-wrap">
            <a href="index.html" class="post-author_link">View More Articles <i class="fas fa-caret-right"></i></a>
        </div>
    `;
    
    $('#article-author').html(authorHTML);
}

// Load related articles
async function loadRelatedArticles(currentArticle) {
    try {
        if (!currentArticle || !currentArticle.id) {
            $('#related-articles').hide();
            return;
        }

        // Use the new related articles API endpoint with article ID
        const response = await fetch(`${API_URL}/articles/${currentArticle.id}/related?limit=4`);
        const json = await response.json();
        const articles = json.data || [];
        
        if (articles.length === 0) {
            $('#related-articles').hide();
            return;
        }
        
        let html = '';
        articles.forEach(article => {
            const date = formatDate(article.published_at || article.created_at);
            const categoryName = (article.categories && (article.categories.name || (Array.isArray(article.categories) && article.categories[0]?.name))) || article.category || 'Uncategorized';
            
            html += `
                <div class="col-md-6">
                    <div class="list-post fl-wrap">
                        <a class="post-category-marker" href="index.html?category=${categoryName}">${categoryName}</a>
                        <div class="list-post-media">
                            <a href="article.html?slug=${article.slug}">
                                <div class="bg-wrap">
                                    <div class="bg" data-bg="${article.featured_image || 'images/all/1.jpg'}"></div>
                                </div>
                            </a>
                            <span class="post-media_title">&copy; Image</span>
                        </div>
                        <div class="list-post-content">
                            <h3><a href="article.html?slug=${article.slug}">${escapeHtml(article.title)}</a></h3>
                            <span class="post-date"><i class="far fa-clock"></i> ${date}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        $('#related-articles-content').html(html);
        
        // Initialize background images
        if (typeof initbg === 'function') {
            initbg();
        }
        
    } catch (error) {
        console.error('Error loading related articles:', error);
        $('#related-articles').hide();
    }
}

// Add social share buttons
function addSocialShareButtons(article) {
    const articleUrl = encodeURIComponent(window.location.href);
    const articleTitle = encodeURIComponent(article.title);
    const articleDescription = encodeURIComponent(stripHtml(article.excerpt || article.content).substring(0, 200));
    const articleImage = encodeURIComponent(article.featured_image || '');
    
    const shareButtonsHTML = `
        <div class="social-share-enhanced">
            <span class="share-label"><i class="fas fa-share-alt"></i> Share this article:</span>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${articleUrl}" target="_blank" class="social-share-btn-enhanced facebook">
                <i class="fab fa-facebook-f"></i> Facebook
            </a>
            <a href="https://twitter.com/intent/tweet?url=${articleUrl}&text=${articleTitle}" target="_blank" class="social-share-btn-enhanced twitter">
                <i class="fab fa-twitter"></i> Twitter
            </a>
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${articleUrl}" target="_blank" class="social-share-btn-enhanced linkedin">
                <i class="fab fa-linkedin-in"></i> LinkedIn
            </a>
            <a href="https://pinterest.com/pin/create/button/?url=${articleUrl}&media=${articleImage}&description=${articleTitle}" target="_blank" class="social-share-btn-enhanced pinterest">
                <i class="fab fa-pinterest-p"></i> Pinterest
            </a>
            <a href="https://wa.me/?text=${articleTitle}%20${articleUrl}" target="_blank" class="social-share-btn-enhanced whatsapp">
                <i class="fab fa-whatsapp"></i> WhatsApp
            </a>
        </div>
    `;
    
    // Insert after article tags or before related articles
    if ($('#article-tags').length) {
        $('#article-tags').after(shareButtonsHTML);
    } else if ($('#related-articles').length) {
        $('#related-articles').before(shareButtonsHTML);
    } else {
        $('#article-content').after(shareButtonsHTML);
    }
}

// Update Open Graph meta tags
function updateOpenGraphTags(article) {
    const siteUrl = window.location.origin;
    const articleUrl = `${siteUrl}/article.html?slug=${article.slug}`;
    const articleImage = article.featured_image || `${siteUrl}/images/default-og-image.jpg`;
    const articleTitle = article.meta_title || article.title;
    const articleDescription = article.meta_description || stripHtml(article.excerpt || article.content).substring(0, 200);
    
    // Helper function to set or create meta tag
    function setMetaTag(property, content) {
        let meta = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            document.head.appendChild(meta);
        }
        meta.setAttribute('property', property);
        meta.setAttribute('content', content);
    }
    
    // Open Graph tags
    setMetaTag('og:title', articleTitle);
    setMetaTag('og:description', articleDescription);
    setMetaTag('og:type', 'article');
    setMetaTag('og:url', articleUrl);
    setMetaTag('og:image', articleImage);
    setMetaTag('og:site_name', 'Blog');
    
    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', articleTitle);
    setMetaTag('twitter:description', articleDescription);
    setMetaTag('twitter:image', articleImage);
    
    // Article specific tags
    if (article.published_at) {
        setMetaTag('article:published_time', new Date(article.published_at).toISOString());
    }
    if (article.updated_at) {
        setMetaTag('article:modified_time', new Date(article.updated_at).toISOString());
    }
    if (article.categories?.name) {
        setMetaTag('article:section', article.categories.name);
    }
    if (article.authors?.name) {
        setMetaTag('article:author', article.authors.name);
    }
}

// Load categories for sidebar
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        const json = await response.json();
        const categories = json.data || [];
        
        // Navigation categories
        const navList = $('#categories-list');
        navList.empty();
        categories.forEach(category => {
            navList.append(`<li><a href="index.html?category=${category.slug}">${category.name}</a></li>`);
        });
        
        // Sidebar categories
        const sidebarCats = $('#sidebar-categories');
        sidebarCats.empty();
        categories.forEach(category => {
            sidebarCats.append(`<li><a href="index.html?category=${category.slug}">${category.name}</a><span>•</span></li>`);
        });
        
        // Sidebar tags
        const tags = $('#sidebar-tags');
        tags.empty();
        categories.forEach(category => {
            tags.append(`<a href="index.html?category=${category.slug}">${category.name}</a>`);
        });
        
        // Footer categories
        const footerCats = $('#footer-categories');
        footerCats.empty();
        categories.forEach(category => {
            footerCats.append(`<li><a href="index.html?category=${category.slug}">${category.name}</a></li>`);
        });
        
        console.log('✓ Categories loaded:', categories.length);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load article navigation (prev/next)
async function loadArticleNavigation(slug) {
    try {
        const response = await fetch(`${API_URL}/articles/${slug}/navigation`);
        const json = await response.json();
        
        if (!json.success || !json.data) {
            $('#article-navigation').html('');
            return;
        }
        
        const { prev, next } = json.data;
        let navHTML = '';
        
        if (prev || next) {
            navHTML = '<div class="single-post-nav fl-wrap">';
            
            // Previous article
            if (prev) {
                navHTML += `
                    <a href="article.html?slug=${prev.slug}" class="single-post-nav_prev spn_box">
                        <div class="spn_box_img">
                            <img src="${prev.featured_image || 'images/all/1.jpg'}" class="respimg" alt="${prev.title}">
                        </div>
                        <div class="spn-box-content">
                            <span class="spn-box-content_subtitle"><i class="fas fa-caret-left"></i> Prev Post</span>
                            <span class="spn-box-content_title">${prev.title}</span>
                        </div>
                    </a>
                `;
            } else {
                navHTML += '<div class="single-post-nav_prev spn_box" style="visibility: hidden;"></div>';
            }
            
            // Next article
            if (next) {
                navHTML += `
                    <a href="article.html?slug=${next.slug}" class="single-post-nav_next spn_box">
                        <div class="spn_box_img">
                            <img src="${next.featured_image || 'images/all/1.jpg'}" class="respimg" alt="${next.title}">
                        </div>
                        <div class="spn-box-content">
                            <span class="spn-box-content_subtitle">Next Post <i class="fas fa-caret-right"></i></span>
                            <span class="spn-box-content_title">${next.title}</span>
                        </div>
                    </a>
                `;
            } else {
                navHTML += '<div class="single-post-nav_next spn_box" style="visibility: hidden;"></div>';
            }
            
            navHTML += '</div>';
        }
        
        $('#article-navigation').html(navHTML);
    } catch (error) {
        console.error('Error loading navigation:', error);
        $('#article-navigation').html('');
    }
}

// Load comments
async function loadComments(slug) {
    try {
        const response = await fetch(`${API_URL}/articles/${slug}/comments`);
        const json = await response.json();
        
        if (!json.success) {
            $('#comments-list').html('<li><p>No comments yet. Be the first to comment!</p></li>');
            $('#comment-count').text('0');
            setupCommentForm(slug);
            return;
        }
        
        const comments = json.data || [];
        $('#comment-count').text(comments.length);
        
        if (comments.length === 0) {
            $('#comments-list').html('<li><p>No comments yet. Be the first to comment!</p></li>');
            setupCommentForm(slug);
            return;
        }
        
        let commentsHTML = '';
        comments.forEach(comment => {
            const date = formatDate(comment.created_at);
            const replies = comment.replies || [];
            
            commentsHTML += `
                <li class="comment ${comment.parent_id ? 'comment_reply' : ''}">
                    <div class="comment-author">
                        <img alt="${comment.name}" src="images/avatar/1.jpg" width="50" height="50">
                    </div>
                    <div class="comment-body smpar">
                        <h4><a href="#">${comment.name}</a></h4>
                        <div class="box-widget-menu-btn smact"><i class="far fa-ellipsis-h"></i></div>
                        <div class="show-more-snopt-tooltip bxwt">
                            <a href="#" class="reply-btn" data-comment-id="${comment.id}"> <i class="fas fa-reply"></i> Reply</a>
                            <a href="#"> <i class="fas fa-exclamation-triangle"></i> Report </a>
                        </div>
                        <div class="clearfix"></div>
                        <p>${comment.content}</p>
                        <a class="comment-reply-link reply-btn" href="#" data-comment-id="${comment.id}"><i class="fas fa-reply"></i> Reply</a>
                        <div class="comment-meta"><i class="far fa-clock"></i> ${date}</div>
                        <div class="comment-body_dec"></div>
                    </div>
                </li>
            `;
            
            // Render replies if any
            if (replies.length > 0) {
                replies.forEach(reply => {
                    const replyDate = formatDate(reply.created_at);
                    commentsHTML += `
                        <li class="comment comment_reply">
                            <div class="comment-author">
                                <img alt="${reply.name}" src="images/avatar/1.jpg" width="50" height="50">
                            </div>
                            <div class="comment-body smpar">
                                <h4><a href="#">${reply.name}</a></h4>
                                <div class="box-widget-menu-btn smact"><i class="far fa-ellipsis-h"></i></div>
                                <div class="show-more-snopt-tooltip bxwt">
                                    <a href="#"> <i class="fas fa-exclamation-triangle"></i> Report </a>
                                </div>
                                <div class="clearfix"></div>
                                <p>${reply.content}</p>
                                <div class="comment-meta"><i class="far fa-clock"></i> ${replyDate}</div>
                                <div class="comment-body_dec"></div>
                            </div>
                        </li>
                    `;
                });
            }
        });
        
        $('#comments-list').html(commentsHTML);
        
        // Setup comment form submission
        setupCommentForm(slug);
    } catch (error) {
        console.error('Error loading comments:', error);
        $('#comments-list').html('<li><p>Error loading comments.</p></li>');
        $('#comment-count').text('0');
        setupCommentForm(slug);
    }
}

// Setup comment form submission
function setupCommentForm(slug) {
    $('#add-comment').off('submit').on('submit', async function(e) {
        e.preventDefault();
        
        const name = $('#comment-name').val().trim();
        const email = $('#comment-email').val().trim();
        const content = $('#comment-text').val().trim();
        
        if (!name || !email || !content) {
            alert('Please fill in all fields');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/articles/${slug}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, content })
            });
            
            const json = await response.json();
            
            if (json.success) {
                $('#comment-name').val('');
                $('#comment-email').val('');
                $('#comment-text').val('');
                alert('Comment submitted successfully! It will be visible after moderation.');
                // Reload comments
                loadComments(slug);
            } else {
                alert('Error submitting comment: ' + (json.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('Error submitting comment. Please try again.');
        }
    });
}

// Load sidebar content (popular and recent posts)
async function loadSidebarContent() {
    try {
        const response = await fetch(`${API_URL}/articles`);
        const json = await response.json();
        const articles = json.data || [];
        
        // Popular posts
        const popular = $('#popular-posts');
        popular.empty();
        articles.slice(0, 3).forEach(article => {
            const date = formatDate(article.published_at || article.created_at);
            
            popular.append(`
                <div class="post-widget-item fl-wrap">
                    <div class="post-widget-item-media">
                        <a href="article.html?slug=${article.slug}">
                            <img src="${article.featured_image || 'images/all/thumbs/1.jpg'}" alt="">
                        </a>
                    </div>
                    <div class="post-widget-item-content">
                        <h4><a href="article.html?slug=${article.slug}">${article.title}</a></h4>
                        <ul class="pwic_opt">
                            <li><span><i class="far fa-clock"></i> ${date}</span></li>
                            <li><span><i class="fal fa-eye"></i> ${article.view_count || 0}</span></li>
                        </ul>
                    </div>
                </div>
            `);
        });
        
        // Recent posts
        const recent = $('#recent-posts');
        recent.empty();
        articles.slice(0, 3).forEach(article => {
            const date = formatDate(article.published_at || article.created_at);
            
            recent.append(`
                <div class="post-widget-item fl-wrap">
                    <div class="post-widget-item-media">
                        <a href="article.html?slug=${article.slug}">
                            <img src="${article.featured_image || 'images/all/thumbs/1.jpg'}" alt="">
                        </a>
                    </div>
                    <div class="post-widget-item-content">
                        <h4><a href="article.html?slug=${article.slug}">${article.title}</a></h4>
                        <ul class="pwic_opt">
                            <li><span><i class="far fa-clock"></i> ${date}</span></li>
                            <li><span><i class="fal fa-eye"></i> ${article.view_count || 0}</span></li>
                        </ul>
                    </div>
                </div>
            `);
        });
        
    } catch (error) {
        console.error('Error loading sidebar content:', error);
    }
}

// Load news ticker
async function loadNewsTicker() {
    try {
        // Get popular articles sorted by view count
        const response = await fetch(`${API_URL}/articles?status=published&limit=10&sortBy=view_count&sortOrder=desc`);
        const json = await response.json();
        const articles = json.data || [];
        
        const ticker = $('#news-ticker');
        if (ticker.length === 0) return;
        
        ticker.empty();
        
        if (articles.length === 0) {
            ticker.append('<li><a href="#">No news available</a></li>');
            return;
        }
        
        articles.slice(0, 10).forEach(article => {
            const title = escapeHtml(article.title);
            ticker.append(`<li><a href="article.html?slug=${article.slug}">${title}</a></li>`);
        });
        
        // Re-initialize ticker if it exists
        if (typeof $ !== 'undefined' && $.fn.easyTicker) {
            $('.header_news-ticker').easyTicker({
                direction: 'up',
                easing: 'swing',
                interval: 2500,
                mousePause: true,
                controls: {
                    up: '.n_btn',
                    down: '.p_btn',
                },
            });
        }
    } catch (error) {
        console.error('Error loading news ticker:', error);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
}

function stripHtml(html) {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

