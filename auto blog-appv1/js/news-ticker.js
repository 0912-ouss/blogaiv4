/**
 * News Ticker Component
 * Displays scrolling hot news in the header
 */

class NewsTicker {
    constructor(containerId, apiUrl) {
        this.container = document.getElementById(containerId);
        this.apiUrl = apiUrl || '/api/articles';
        this.articles = [];
        this.currentIndex = 0;
        this.autoScrollInterval = null;
        this.init();
    }

    async init() {
        if (!this.container) {
            console.error('News ticker container not found');
            return;
        }

        await this.loadArticles();
        this.render();
        this.setupControls();
        this.startAutoScroll();
    }

    async loadArticles() {
        try {
            const response = await fetch(`${this.apiUrl}?status=published&limit=10&sortBy=view_count&sortOrder=desc`);
            const data = await response.json();
            
            if (data.success && data.data) {
                this.articles = data.data;
            }
        } catch (error) {
            console.error('Error loading news ticker articles:', error);
            this.articles = [];
        }
    }

    render() {
        if (!this.container || this.articles.length === 0) {
            this.container.innerHTML = '<li><a href="#">No news available</a></li>';
            return;
        }

        const html = this.articles.map(article => {
            const url = `article.html?slug=${article.slug}`;
            return `<li><a href="${url}">${this.escapeHTML(article.title)}</a></li>`;
        }).join('');

        this.container.innerHTML = html;
    }

    setupControls() {
        const prevBtn = document.querySelector('.n_contr.p_btn');
        const nextBtn = document.querySelector('.n_contr.n_btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previous());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.next());
        }
    }

    next() {
        if (this.articles.length === 0) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.articles.length;
        this.scrollToCurrent();
        this.resetAutoScroll();
    }

    previous() {
        if (this.articles.length === 0) return;
        
        this.currentIndex = (this.currentIndex - 1 + this.articles.length) % this.articles.length;
        this.scrollToCurrent();
        this.resetAutoScroll();
    }

    scrollToCurrent() {
        const items = this.container.querySelectorAll('li');
        if (items[this.currentIndex]) {
            items[this.currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    startAutoScroll() {
        // Auto-scroll every 5 seconds
        this.autoScrollInterval = setInterval(() => {
            this.next();
        }, 5000);
    }

    resetAutoScroll() {
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
        }
        this.startAutoScroll();
    }

    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    destroy() {
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.newsTicker = new NewsTicker('news-ticker');
    });
} else {
    window.newsTicker = new NewsTicker('news-ticker');
}

