// Markdown article loader
const ARTICLES_DIR = './articles/';

async function loadArticles() {
    try {
        // Fetch the list of articles
        const response = await fetch('./articles.json');
        if (!response.ok) {
            console.log('No articles.json found, using static article list');
            loadStaticArticles();
            return;
        }

        const articlesData = await response.json();
        displayArticles(articlesData);
    } catch (error) {
        console.log('Loading articles...');
        loadStaticArticles();
    }
}

async function loadStaticArticles() {
    // For now, display a welcome message
    const articlesSection = document.getElementById('articles');
    articlesSection.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
            <h2>Welcome to Grandma's Crypto! 👵</h2>
            <p style="font-size: 1.1em; margin: 20px 0; color: #555;">
                Add your first article by creating a Markdown file in the <code>articles/</code> folder.
            </p>
            <p style="color: #888;">
                Example: <code>articles/2026-05-10-bitcoin-basics.md</code>
            </p>
            <p style="margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 8px; line-height: 1.8;">
                <strong>How to add articles:</strong><br>
                1. Create a Markdown file in the <code>articles/</code> folder<br>
                2. Use format: <code>YYYY-MM-DD-title.md</code><br>
                3. Push to GitHub<br>
                4. Cloudflare Pages will auto-deploy!
            </p>
        </div>
    `;
}

function displayArticles(articlesData) {
    const articlesSection = document.getElementById('articles');
    articlesSection.innerHTML = '';

    if (!articlesData || articlesData.length === 0) {
        loadStaticArticles();
        return;
    }

    articlesData.forEach(article => {
        const card = createArticleCard(article);
        articlesSection.appendChild(card);
    });
}

function createArticleCard(article) {
    const card = document.createElement('article');
    card.className = 'article-card';
    card.innerHTML = `
        <div class="article-card-header">
            <h2>${article.title}</h2>
            <div class="article-date">${formatDate(article.date)}</div>
        </div>
        <div class="article-card-body">
            <p class="article-preview">${article.preview || article.description}</p>
            <a href="#" class="read-more" onclick="viewArticle('${article.filename}'); return false;">
                Read More →
            </a>
        </div>
    `;
    return card;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

async function viewArticle(filename) {
    try {
        const response = await fetch(`./articles/${filename}`);
        if (!response.ok) {
            console.error(`Could not load article: ${filename}`);
            return;
        }

        const markdown = await response.text();
        const html = marked.parse(markdown);

        // Extract title from markdown (first h1)
        const titleMatch = markdown.match(/^# (.+)$/m);
        const title = titleMatch ? titleMatch[1] : filename;

        // Extract date from filename (YYYY-MM-DD)
        const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
        const date = dateMatch ? dateMatch[1] : '';

        displayArticleDetail(title, date, html);
    } catch (error) {
        console.error('Error loading article:', error);
        alert('Could not load article. Please try again.');
    }
}

function displayArticleDetail(title, date, content) {
    const articlesSection = document.getElementById('articles');
    articlesSection.innerHTML = `
        <article class="article-detail" style="grid-column: 1 / -1;">
            <a href="#" class="back-button" onclick="loadArticles(); return false;">← Back to Articles</a>
            <h1>${title}</h1>
            <div class="article-detail-meta">
                📅 ${formatDate(date)} | Easy Crypto Explained
            </div>
            <div class="article-detail-content">
                ${content}
            </div>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #f0f0f0;">
                <a href="#" class="back-button" onclick="loadArticles(); return false;">← Back to Articles</a>
            </div>
        </article>
    `;
    window.scrollTo(0, 0);
}

// Load articles on page load
document.addEventListener('DOMContentLoaded', loadArticles);
