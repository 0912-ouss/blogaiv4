// Simple Blog API Integration - Enhanced for full gmag theme
const API_URL = 'http://localhost:3000/api';

$(document).ready(function() {
    console.log('🚀 Loading blog data...');
    loadAllData();
    
    // Setup category filter handlers (will be re-setup after categories load)
    setupCategoryFilters();
});

// Setup category filter click handlers
function setupCategoryFilters() {
    // Remove existing handlers to prevent duplicates
    $(".ajax-nav li a").off('click.categoryFilter');
    
    // Add new click handlers using event delegation for dynamically added elements
    $(document).off('click.categoryFilter', '.ajax-nav li a').on('click.categoryFilter', '.ajax-nav li a', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const category = $(this).data('category') || 'all';
        
        console.log('Category filter clicked:', category);
        
        // Update UI
        $(".ajax-nav li a").removeClass('current_page');
        $(this).addClass('current_page');
        
        // Show loading
        $("#ajax-content").animate({opacity: "0"}, 300);
        $(".ajax-loader").fadeIn(100);
        
        // Load filtered articles
        setTimeout(() => {
            loadFilteredArticles(category);
        }, 300);
        
        return false;
    });
    
    console.log('✓ Category filters setup complete');
}

// Load articles filtered by category
async function loadFilteredArticles(category) {
    try {
        let url = `${API_URL}/articles`;
        
        // If category is not "all", filter by category
        if (category && category !== 'all') {
            url = `${API_URL}/articles?category=${category}`;
        }
        
        const response = await fetch(url);
        const json = await response.json();
        const articles = json.data || [];
        
        console.log(`✓ Articles loaded for category "${category}":`, articles.length);
        
        // Clear content
        $("#ajax-content").empty();
        
        if (articles.length === 0) {
            $("#ajax-content").html('<p>Keine Artikel in dieser Kategorie gefunden.</p>');
            $("#ajax-content").animate({opacity: "1"}, 300);
            $(".ajax-loader").fadeOut(100);
            return;
        }
        
        // Load filtered content
        loadMainContent(articles);
        loadTopStories(articles.slice(3, 11));
        
        // Fade in content
        setTimeout(() => {
            $("#ajax-content").animate({opacity: "1"}, 300);
            $(".ajax-loader").fadeOut(100);
            
            // Reinitialize background images after content is rendered
            setTimeout(() => {
                initializeBackgroundImages();
            }, 300);
        }, 300);
        
    } catch (error) {
        console.error('❌ Error loading filtered articles:', error);
        $("#ajax-content").html('<p>Fehler beim Laden der Artikel. Bitte versuchen Sie es erneut.</p>');
        $("#ajax-content").animate({opacity: "1"}, 300);
        $(".ajax-loader").fadeOut(100);
    }
}

// Load all homepage data
async function loadAllData() {
    try {
        await loadCategories();
        await loadArticles();
    } catch (error) {
        console.error('❌ Error loading data:', error);
    }
}

// Load categories for navigation
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        const json = await response.json();
        const categories = json.data || [];
        
        // Main navigation categories
        const list = $('#categories-list');
        list.empty();
        categories.forEach(category => {
            list.append(`<li><a href="index.html?category=${category.slug}">${category.name}</a></li>`);
        });
        
        // Ajax nav categories
        const ajaxNav = $('#ajax-nav-categories');
        ajaxNav.html('<li><a href="#" class="current_page" data-category="all">Alle</a></li>');
        categories.forEach(category => {
            ajaxNav.append(`<li><a href="#" data-category="${category.slug}">${category.name}</a></li>`);
        });
        
        // Setup category filter click handlers
        setupCategoryFilters();
        
        // Footer categories
        const footerCats = $('#footer-categories');
        footerCats.empty();
        categories.forEach(category => {
            footerCats.append(`<li><a href="index.html?category=${category.slug}">${category.name}</a></li>`);
        });
        
        // Popular tags
        const tags = $('#popular-tags');
        tags.empty();
        categories.forEach(category => {
            tags.append(`<a href="index.html?category=${category.slug}">${category.name}</a>`);
        });
        
        console.log('✓ Categories loaded:', categories.length);
        
        // Setup category filter click handlers AFTER categories are loaded
        setTimeout(() => {
            setupCategoryFilters();
        }, 100);
    } catch (error) {
        console.error('❌ Error loading categories:', error);
    }
}

// Store articles globally for slider initialization
let loadedArticles = [];

// Load articles
async function loadArticles() {
    try {
        const response = await fetch(`${API_URL}/articles`);
        const json = await response.json();
        loadedArticles = json.data || [];
        
        console.log('✓ Articles loaded:', loadedArticles.length);
        
        if (loadedArticles.length === 0) {
            $('#ajax-content').html('<p>Keine Artikel gefunden. Erstellen Sie Ihren ersten Artikel über n8n oder die API!</p>');
            $('.ajax-loader').fadeOut();
            return;
        }
        
        // Load hero slider (top 4 articles)
        loadHeroSlider(loadedArticles.slice(0, 4));
        
        // Load hero controls - use same articles for synchronization with slider
        // The controls will show thumbnails that sync with the main slider
        loadHeroControls(loadedArticles.slice(0, 4));
        
        // Load main content grid (articles 0-2)
        loadMainContent(loadedArticles);
        
        // Load top stories (articles 3-10)
        loadTopStories(loadedArticles.slice(3, 11));
        
        // Load popular posts sidebar
        loadPopularPosts(loadedArticles.slice(0, 4));
        
        // Load recent posts sidebar
        loadRecentPosts(loadedArticles.slice(0, 3));
        
        // Load news ticker
        loadNewsTicker(loadedArticles.slice(0, 5));
        
        // Hide loader
        $('.ajax-loader').fadeOut();
        
        // Initialize background images and Swiper after content is loaded
        setTimeout(() => {
            initializeBackgroundImages();
            initializeHeroSlider();
        }, 500);
        
    } catch (error) {
        console.error('❌ Error loading articles:', error);
        $('.ajax-loader').html('<p>Fehler beim Laden der Artikel. Bitte überprüfen Sie die Konsole.</p>');
    }
}

// Initialize hero slider with Swiper
function initializeHeroSlider() {
    if (typeof Swiper === 'undefined') {
        console.warn('Swiper library not loaded');
        return;
    }
    
    // Check if multi-slider exists
    if ($(".multi-slider").length === 0) {
        return;
    }
    
    // Get the number of articles loaded in hero slider
    const heroArticlesCount = loadedArticles.slice(0, 4).length;
    
    // Destroy existing Swiper instances if they exist
    const controlContainer = $(".multi-slider_control .swiper-container");
    const mainContainer = $(".multi-slider .swiper-container");
    
    const existingControl = controlContainer.data('swiper');
    const existingMain = mainContainer.data('swiper');
    
    if (existingControl) {
        existingControl.destroy(true, true);
    }
    if (existingMain) {
        existingMain.destroy(true, true);
    }
    
    // Initialize control slider first
    const ms2 = new Swiper(".multi-slider_control .swiper-container", {
        preloadImages: false,
        loop: heroArticlesCount > 1, // Only loop if more than 1 article
        speed: 2400,
        spaceBetween: 30,
        slidesPerView: Math.min(3, heroArticlesCount),
        watchSlidesProgress: true,
        effect: "slide",
    });
    
    // Initialize main slider with navigation buttons
    const ms1 = new Swiper(".multi-slider .swiper-container", {
        preloadImages: false,
        loop: heroArticlesCount > 1, // Only loop if more than 1 article
        speed: 2400,
        spaceBetween: 0,
        effect: "slide",
        grabCursor: true,
        parallax: false,
        pagination: {
            el: '.multi-pag',
            clickable: true,
        },
        thumbs: {
            swiper: ms2,
        },
        navigation: {
            nextEl: '.fs-slider-button-next',
            prevEl: '.fs-slider-button-prev',
        },
        autoplay: {
            delay: 3500,
            disableOnInteraction: false
        },
    });
    
    // Progress bar animation
    ms1.on("slideChangeTransitionStart", function () {
        $(".slider-progress-bar").removeClass("act-slider");
    });
    ms1.on("slideChangeTransitionEnd", function () {
        $(".slider-progress-bar").addClass("act-slider");
    });
    
    console.log('✓ Hero slider initialized with', heroArticlesCount, 'articles');
}

// Initialize background images for dynamically loaded content
function initializeBackgroundImages() {
    // Use setTimeout to ensure DOM is fully ready
    setTimeout(() => {
        $('.bg[data-bg]').each(function() {
            const $this = $(this);
            const bg = $this.attr('data-bg');
            
            if (!bg) return;
            
            // Always set the background image immediately (theme's initbg style)
            $this.css('background-image', 'url(' + bg + ')');
            
            // Also validate the image in the background
            if (bg && bg !== 'images/all/1.jpg' && (bg.startsWith('http') || bg.startsWith('//'))) {
                const img = new Image();
                img.onload = function() {
                    // Image loaded successfully, ensure it's set
                    $this.css('background-image', 'url(' + bg + ')');
                };
                img.onerror = function() {
                    // If image fails to load, try fallback
                    console.warn('Image failed to load:', bg);
                    $this.css('background-image', 'url(images/all/1.jpg)');
                };
                img.src = bg;
            }
        });
        
        // Also call theme's initbg function if it exists (double check)
        if (typeof initbg === 'function') {
            initbg();
        }
        
        console.log('✓ Background images initialized:', $('.bg[data-bg]').length, 'elements');
    }, 100);
}

// Load hero slider
function loadHeroSlider(articles) {
    const hero = $('#hero-slider-content');
    hero.empty();
    
    if (articles.length === 0) {
        hero.html('<div class="swiper-slide"><div class="hero-item fl-wrap"><div class="container"><h2>No articles found</h2></div></div></div>');
        return;
    }
    
    articles.forEach((article, index) => {
        const date = formatDate(article.published_at || article.created_at);
        const categoryName = (article.categories && (article.categories.name || (Array.isArray(article.categories) && article.categories[0]?.name))) || article.category || 'Uncategorized';
        
        // Ensure featured_image exists or use fallback
        const featuredImage = article.featured_image && article.featured_image.trim() 
            ? article.featured_image 
            : 'images/all/1.jpg';
        
        hero.append(`
            <div class="swiper-slide">
                <div class="bg-wrap">
                    <div class="bg" data-bg="${featuredImage}" data-swiper-parallax="40%"></div>
                    <div class="overlay"></div>
                </div>
                <div class="hero-item fl-wrap">
                    <div class="container">
                        <a class="post-category-marker" href="index.html?category=${categoryName}">${categoryName}</a>
                        <div class="clearfix"></div>
                        <h2><a href="article.html?slug=${article.slug}">${article.title}</a></h2>
                        <h4>${article.excerpt || stripHtml(article.content).substring(0, 150)}...</h4>
                        <div class="clearfix"></div>
                        <div class="author-link">
                            <a href="author.html?slug=${article.authors?.slug || 'author'}"><img src="${article.authors?.avatar_url || 'images/avatar/1.jpg'}" alt="${article.author_name || article.author || 'Admin'}" onerror="this.src='images/avatar/1.jpg'"><span>By ${article.author_name || article.author || (article.authors?.name) || 'Admin'}</span></a>
                        </div>
                        <span class="post-date"><i class="far fa-clock"></i> ${date}</span>
                    </div>
                </div>
            </div>
        `);
    });
}

// Load hero controls
function loadHeroControls(articles) {
    const controls = $('#hero-controls-content');
    controls.empty();
    
    articles.forEach((article, index) => {
        const date = formatDate(article.published_at || article.created_at);
        
        // Ensure featured_image exists or use fallback
        const featuredImage = article.featured_image && article.featured_image.trim() 
            ? article.featured_image 
            : 'images/all/1.jpg';
        
        controls.append(`
            <div class="swiper-slide">
                <div class="hsc-list_item fl-wrap">
                    <div class="hsc-list_item-media">
                        <div class="bg-wrap">
                            <div class="bg" data-bg="${featuredImage}"></div>
                        </div>
                    </div>
                    <div class="hsc-list_item-content fl-wrap">
                        <h4>${article.title}</h4>
                        <span class="post-date"><i class="far fa-clock"></i> ${date}</span>
                    </div>
                </div>
            </div>
        `);
    });
}

// Load main content area
function loadMainContent(articles) {
    const content = $('#ajax-content');
    content.empty();
    
    if (articles.length === 0) {
        content.html('<p>No articles found</p>');
        return;
    }
    
    // Grid view - first 3 articles
    const gridArticles = articles.slice(0, 3);
    let gridHTML = `
        <div class="single-grid-slider-wrap fl-wrap">
            <div class="single-grid-slider">
                <div class="swiper-container">
                    <div class="swiper-wrapper">
    `;
    
    gridArticles.forEach(article => {
        const date = formatDate(article.published_at || article.created_at);
        const categoryName = (article.categories && (article.categories.name || (Array.isArray(article.categories) && article.categories[0]?.name))) || article.category || 'Uncategorized';
        
        gridHTML += `
            <div class="swiper-slide">
                <div class="grid-post-item bold_gpi fl-wrap">
                    <div class="grid-post-media gpm_sing">
                        <div class="bg" data-bg="${article.featured_image || 'images/all/1.jpg'}"></div>
                        <div class="author-link">
                            <a href="author.html?slug=${article.authors?.slug || 'author'}"><img src="${article.authors?.avatar_url || 'images/avatar/1.jpg'}" alt="${article.author_name || article.author || 'Admin'}" onerror="this.src='images/avatar/1.jpg'"><span>By ${article.author_name || article.author || (article.authors?.name) || 'Admin'}</span></a>
                        </div>
                        <div class="grid-post-media_title">
                            <a class="post-category-marker" href="index.html?category=${categoryName}">${categoryName}</a>
                            <h4><a href="article.html?slug=${article.slug}">${article.title}</a></h4>
                            <span class="video-date"><i class="far fa-clock"></i> ${date}</span>
                            <ul class="post-opt">
                                <li><i class="fal fa-eye"></i> ${article.view_count || 0}</li>
                                <li class="like-option-card" data-article-id="${article.id}" style="cursor: pointer;">
                                    <i class="fal fa-heart like-icon-card"></i> 
                                    <span class="like-count-card">0</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    gridHTML += `
                    </div>
                    <div class="sgs-pagination sgs_ver"></div>
                </div>
            </div>
        </div>
    `;
    
    content.append(gridHTML);
    
    // List view - next articles (3-10)
    const listArticles = articles.slice(3, 11);
    if (listArticles.length > 0) {
        let listHTML = '<div class="more-post-wrap fl-wrap"><div class="list-post-wrap list-post-wrap_column fl-wrap"><div class="row">';
        
        listArticles.forEach(article => {
            const date = formatDate(article.published_at || article.created_at);
            const categoryName = (article.categories && (article.categories.name || (Array.isArray(article.categories) && article.categories[0]?.name))) || article.category || 'Uncategorized';
            
            listHTML += `
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
                            <h3><a href="article.html?slug=${article.slug}">${article.title}</a></h3>
                            <span class="post-date"><i class="far fa-clock"></i> ${date}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        listHTML += '</div></div></div>';
        content.append(listHTML);
    }
}

// Load top stories
function loadTopStories(articles) {
    const topStories = $('#top-stories');
    topStories.empty();
    
    if (articles.length === 0) return;
    
    // First 2 articles in list format
    let html = '<div class="more-post-wrap fl-wrap"><div class="list-post-wrap list-post-wrap_column fl-wrap"><div class="row">';
    
    articles.slice(0, 2).forEach(article => {
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
                        <h3><a href="article.html?slug=${article.slug}">${article.title}</a></h3>
                        <span class="post-date"><i class="far fa-clock"></i> ${date}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div></div></div>';
    
    // Slider for next articles
    if (articles.length > 2) {
        html += `
            <div class="single-grid-slider-wrap fl-wrap">
                <div class="single-grid-slider">
                    <div class="swiper-container">
                        <div class="swiper-wrapper">
        `;
        
        articles.slice(2, 5).forEach(article => {
            const date = formatDate(article.published_at || article.created_at);
            const categoryName = (article.categories && (article.categories.name || (Array.isArray(article.categories) && article.categories[0]?.name))) || article.category || 'Uncategorized';
            
            html += `
                <div class="swiper-slide">
                    <div class="grid-post-item bold_gpi fl-wrap">
                        <div class="grid-post-media gpm_sing">
                            <div class="bg" data-bg="${article.featured_image || 'images/all/1.jpg'}"></div>
                            <div class="author-link">
                                <a href="author.html?slug=${article.authors?.slug || 'author'}"><img src="${article.authors?.avatar_url || 'images/avatar/1.jpg'}" alt="${article.author_name || article.author || 'Admin'}" onerror="this.src='images/avatar/1.jpg'"><span>By ${article.author_name || article.author || (article.authors?.name) || 'Admin'}</span></a>
                            </div>
                            <div class="grid-post-media_title">
                                <a class="post-category-marker" href="index.html?category=${categoryName}">${categoryName}</a>
                                <h4><a href="article.html?slug=${article.slug}">${article.title}</a></h4>
                                <span class="video-date"><i class="far fa-clock"></i> ${date}</span>
                                <ul class="post-opt">
                                    <li><i class="fal fa-eye"></i> ${article.view_count || 0}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                        </div>
                        <div class="sgs-pagination sgs_ver"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // More list items
    if (articles.length > 5) {
        html += '<div class="more-post-wrap fl-wrap"><div class="list-post-wrap list-post-wrap_column fl-wrap"><div class="row">';
        
        articles.slice(5, 9).forEach(article => {
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
                            <h3><a href="article.html?slug=${article.slug}">${article.title}</a></h3>
                            <span class="post-date"><i class="far fa-clock"></i> ${date}</span>
                            <ul class="post-opt" style="margin-top: 10px;">
                                <li><i class="fal fa-eye"></i> ${article.view_count || 0}</li>
                                <li class="like-option-card" data-article-id="${article.id}" style="cursor: pointer;">
                                    <i class="fal fa-heart like-icon-card"></i> 
                                    <span class="like-count-card">0</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div></div></div>';
    }
    
    topStories.html(html);
    
    // Setup like buttons after rendering
    setTimeout(() => setupLikeButtons(), 300);
}

// Load popular posts sidebar
function loadPopularPosts(articles) {
    const popular = $('#popular-posts');
    popular.empty();
    
    articles.forEach(article => {
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
}

// Load recent posts sidebar
function loadRecentPosts(articles) {
    const recent = $('#recent-posts');
    recent.empty();
    
    articles.forEach(article => {
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
}

// Load news ticker
function loadNewsTicker(articles) {
    const ticker = $('#news-ticker');
    ticker.empty();
    
    articles.forEach(article => {
        ticker.append(`<li><a href="article.html?slug=${article.slug}">${article.title}</a></li>`);
    });
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

// Setup like buttons for article cards
async function setupLikeButtons() {
    // Wait a bit for DOM to be ready
    setTimeout(() => {
        document.querySelectorAll('.like-option-card').forEach(async (element) => {
            const articleId = parseInt(element.getAttribute('data-article-id'));
            if (!articleId) return;
            
            try {
                // Get like status
                const statusResponse = await fetch(`/api/articles/${articleId}/like-status`);
                const statusData = await statusResponse.json();
                
                if (statusData.success) {
                    const likeIcon = element.querySelector('.like-icon-card');
                    const likeCount = element.querySelector('.like-count-card');
                    
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
                    element.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        try {
                            const response = await fetch(`/api/articles/${articleId}/like`, {
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
        });
    }, 500);
}
