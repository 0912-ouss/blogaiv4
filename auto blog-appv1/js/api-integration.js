// API Integration for Gmag Theme
// This file handles all API calls to the Node.js backend

// Load articles from API
function loadArticles(category = null) {
    let url = '/api/articles';
    if (category) {
        url = `/api/articles/category/${category}`;
    }
    
    $.ajax({
        url: url,
        method: 'GET',
        success: function(articles) {
            renderArticles(articles);
        },
        error: function(xhr, status, error) {
            console.error('Error loading articles:', error);
            // Fallback to static content
            loadStaticContent();
        }
    });
}

// Render articles in the content area
function renderArticles(articles) {
    const container = $("#ajax-content");
    if (container.length === 0) return;
    
    let html = '<div class="ajax-inner fl-wrap"><div class="list-post-wrap">';
    
    articles.forEach(article => {
        html += `
            <div class="list-post fl-wrap">
                <div class="list-post-media">
                    <a href="/post-single.html?id=${article.id}">
                        <div class="bg-wrap">
                            <div class="bg" data-bg="${article.featured_image_url || 'images/all/1.jpg'}"></div>
                        </div>
                    </a>
                    <span class="post-media_title">&copy; Image Copyrights Title</span>
                </div>
                <div class="list-post-content">
                    <a class="post-category-marker" href="/category.html?cat=${article.category}">${article.category}</a>
                    <h3><a href="/post-single.html?id=${article.id}">${article.title}</a></h3>
                    <span class="post-date"><i class="far fa-clock"></i> ${formatDate(article.published_at)}</span>
                    <p>${article.excerpt || article.content.substring(0, 150) + '...'}</p>
                    <ul class="post-opt">
                        <li><i class="far fa-comments-alt"></i> 0</li>
                        <li><i class="fal fa-eye"></i> 0</li>
                    </ul>
                    <div class="author-link">
                        <a href="/author-single.html">
                            <img src="images/avatar/1.jpg" alt="">
                            <span>By AI Author</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div></div>';
    container.html(html);
    initbg(); // Reinitialize background images
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Load static content as fallback
function loadStaticContent() {
    if ($("#ajax-content").length > 0) {
        $("#ajax-content").empty();
        $.ajax({
            url: 'ajax/category1.html',
            success: function (html) {
                $("#ajax-content").empty().append(html);
                initbg();
            }
        });
    }
}

// Search articles
function searchArticles(query) {
    $.ajax({
        url: '/api/search',
        method: 'GET',
        data: { q: query },
        success: function(articles) {
            renderArticles(articles);
        },
        error: function(xhr, status, error) {
            console.error('Search error:', error);
        }
    });
}

// Load single article
function loadSingleArticle(articleId) {
    $.ajax({
        url: `/api/articles/${articleId}`,
        method: 'GET',
        success: function(article) {
            renderSingleArticle(article);
        },
        error: function(xhr, status, error) {
            console.error('Error loading article:', error);
        }
    });
}

// Render single article
function renderSingleArticle(article) {
    // Update page title
    document.title = article.meta_title || article.title;
    
    // Update meta description
    $('meta[name="description"]').attr('content', article.meta_description || article.excerpt);
    
    // Update article content
    $('.single-post-content h1').text(article.title);
    $('.single-post-content .post-date').html(`<i class="far fa-clock"></i> ${formatDate(article.published_at)}`);
    $('.single-post-content .post-category-marker').text(article.category);
    $('.single-post-content .post-content').html(article.content);
    
    // Update featured image
    if (article.featured_image_url) {
        $('.single-post-media .bg').css('background-image', `url(${article.featured_image_url})`);
    }
}

// Initialize API integration
$(document).ready(function() {
    // Load initial articles
    loadArticles();
    
    // Handle AJAX navigation
    $(".ajax-nav li a").click(function (e) {
        e.preventDefault();
        
        const category = $(this).data('category') || $(this).text().toLowerCase();
        
        $("#ajax-content").animate({opacity: "0"}, 500);
        $(".ajax-nav li a").removeClass('current_page');
        $(this).addClass('current_page');
        $(".ajax-loader").fadeIn(100);
        
        setTimeout(function () {
            $("#ajax-content").empty();
        }, 500);
        
        // Load articles for the selected category
        loadArticles(category);
        
        return false;
    });
    
    // Handle search form
    $("#search-form").on('submit', function(e) {
        e.preventDefault();
        const query = $("#search-input").val();
        if (query.trim()) {
            searchArticles(query);
        }
    });
    
    // Handle single article loading
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    if (articleId) {
        loadSingleArticle(articleId);
    }
});
