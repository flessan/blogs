// Main JavaScript file for the blog homepage

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initializeTheme();
    
    // Load posts
    loadPosts();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load recent posts in sidebar
    loadRecentPosts();
    
    // Load tag cloud
    loadTagCloud();
});

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggle(savedTheme);
}

function updateThemeToggle(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle(newTheme);
}

// Post Management
async function loadPosts() {
    try {
        const postsContainer = document.getElementById('posts-container');
        if (!postsContainer) return;
        
        // Show loading state
        postsContainer.innerHTML = '<div class="loading">Loading posts...</div>';
        
        // Fetch posts list
        const postsResponse = await fetch('posts/posts.json');
        if (!postsResponse.ok) {
            throw new Error('Failed to fetch posts list');
        }
        
        const postsList = await postsResponse.json();
        
        // Clear loading state
        postsContainer.innerHTML = '';
        
        // If no posts, show message
        if (postsList.length === 0) {
            postsContainer.innerHTML = '<div class="no-posts">No posts found.</div>';
            return;
        }
        
        // Load and display each post
        for (const postInfo of postsList) {
            try {
                const postResponse = await fetch(`posts/${postInfo.file}`);
                if (!postResponse.ok) {
                    console.error(`Failed to fetch post: ${postInfo.file}`);
                    continue;
                }
                
                const markdownContent = await postResponse.text();
                const post = parsePostMetadata(markdownContent, postInfo.file);
                
                if (post) {
                    const postCard = createPostCard(post);
                    postsContainer.appendChild(postCard);
                }
            } catch (error) {
                console.error(`Error loading post ${postInfo.file}:`, error);
            }
        }
        
        // Initialize lazy loading for images
        initializeLazyLoading();
        
    } catch (error) {
        console.error('Error loading posts:', error);
        const postsContainer = document.getElementById('posts-container');
        if (postsContainer) {
            postsContainer.innerHTML = '<div class="error">Failed to load posts. Please try again later.</div>';
        }
    }
}

function parsePostMetadata(markdown, filename) {
    // Extract metadata from markdown frontmatter
    const metadataMatch = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    
    if (!metadataMatch) {
        // If no frontmatter, create basic metadata from filename
        const title = filename.replace('.md', '').replace(/[-_]/g, ' ');
        const date = new Date(filename.substring(0, 10)).toISOString().split('T')[0];
        const content = markdown;
        
        return {
            title,
            date,
            tags: [],
            content,
            file: filename,
            excerpt: content.substring(0, 150) + '...'
        };
    }
    
    const metadata = metadataMatch[1];
    const content = metadataMatch[2];
    
    // Parse metadata
    const metadataLines = metadata.split('\n');
    const parsedMetadata = {};
    
    for (const line of metadataLines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.substring(1, value.length - 1);
            }
            
            parsedMetadata[key] = value;
        }
    }
    
    // Parse tags if they exist
    let tags = [];
    if (parsedMetadata.tags) {
        tags = parsedMetadata.tags.split(',').map(tag => tag.trim());
    }
    
    // Generate excerpt from content
    const plainText = content.replace(/[#*`\[\]()]/g, '');
    const excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
    
    return {
        title: parsedMetadata.title || filename.replace('.md', '').replace(/[-_]/g, ' '),
        date: parsedMetadata.date || new Date().toISOString().split('T')[0],
        tags,
        content,
        file: filename,
        excerpt
    };
}

function createPostCard(post) {
    const postCard = document.createElement('div');
    postCard.className = 'post-card';
    
    // Find first image in content for card image
    const imageMatch = post.content.match(/!\[.*?\]\((.*?)\)/);
    const imageUrl = imageMatch ? imageMatch[1] : `https://picsum.photos/seed/${post.file}/400/200.jpg`;
    
    // Format date
    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    postCard.innerHTML = `
        <img src="${imageUrl}" alt="${post.title}" class="post-card-image lazy-image">
        <div class="post-card-content">
            <h3 class="post-card-title">${post.title}</h3>
            <div class="post-card-meta">
                <span class="post-date">${formattedDate}</span>
                <span class="post-views"><i class="fas fa-eye"></i> ${getPostViews(post.file)}</span>
            </div>
            <div class="post-card-tags">
                ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <p class="post-card-excerpt">${post.excerpt}</p>
            <a href="post.html?post=${post.file}" class="read-more">Read More</a>
        </div>
    `;
    
    return postCard;
}

function getPostViews(postFile) {
    const viewsKey = `views_${postFile}`;
    return localStorage.getItem(viewsKey) || '0';
}

function incrementPostViews(postFile) {
    const viewsKey = `views_${postFile}`;
    const currentViews = parseInt(localStorage.getItem(viewsKey) || '0');
    localStorage.setItem(viewsKey, (currentViews + 1).toString());
    return currentViews + 1;
}

// Recent Posts
async function loadRecentPosts() {
    try {
        const recentPostsContainer = document.getElementById('recent-posts');
        if (!recentPostsContainer) return;
        
        // Fetch posts list
        const postsResponse = await fetch('posts/posts.json');
        if (!postsResponse.ok) {
            throw new Error('Failed to fetch posts list');
        }
        
        const postsList = await postsResponse.json();
        
        // Sort by date (newest first)
        postsList.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Take only the 5 most recent
        const recentPosts = postsList.slice(0, 5);
        
        // Clear container
        recentPostsContainer.innerHTML = '';
        
        // Add each post
        for (const postInfo of recentPosts) {
            try {
                const postResponse = await fetch(`posts/${postInfo.file}`);
                if (!postResponse.ok) {
                    console.error(`Failed to fetch post: ${postInfo.file}`);
                    continue;
                }
                
                const markdownContent = await postResponse.text();
                const post = parsePostMetadata(markdownContent, postInfo.file);
                
                if (post) {
                    const li = document.createElement('li');
                    li.innerHTML = `<a href="post.html?post=${post.file}">${post.title}</a>`;
                    recentPostsContainer.appendChild(li);
                }
            } catch (error) {
                console.error(`Error loading post ${postInfo.file}:`, error);
            }
        }
    } catch (error) {
        console.error('Error loading recent posts:', error);
        const recentPostsContainer = document.getElementById('recent-posts');
        if (recentPostsContainer) {
            recentPostsContainer.innerHTML = '<li>Error loading posts</li>';
        }
    }
}

// Tag Cloud
async function loadTagCloud() {
    try {
        const tagCloudContainer = document.getElementById('tag-cloud');
        if (!tagCloudContainer) return;
        
        // Fetch posts list
        const postsResponse = await fetch('posts/posts.json');
        if (!postsResponse.ok) {
            throw new Error('Failed to fetch posts list');
        }
        
        const postsList = await postsResponse.json();
        
        // Collect all tags
        const tags = {};
        
        for (const postInfo of postsList) {
            try {
                const postResponse = await fetch(`posts/${postInfo.file}`);
                if (!postResponse.ok) {
                    console.error(`Failed to fetch post: ${postInfo.file}`);
                    continue;
                }
                
                const markdownContent = await postResponse.text();
                const post = parsePostMetadata(markdownContent, postInfo.file);
                
                if (post && post.tags) {
                    for (const tag of post.tags) {
                        if (tags[tag]) {
                            tags[tag]++;
                        } else {
                            tags[tag] = 1;
                        }
                    }
                }
            } catch (error) {
                console.error(`Error loading post ${postInfo.file}:`, error);
            }
        }
        
        // Clear container
        tagCloudContainer.innerHTML = '';
        
        // Add tags to cloud
        for (const [tag, count] of Object.entries(tags)) {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = `${tag} (${count})`;
            tagElement.addEventListener('click', () => filterByTag(tag));
            tagCloudContainer.appendChild(tagElement);
        }
    } catch (error) {
        console.error('Error loading tag cloud:', error);
        const tagCloudContainer = document.getElementById('tag-cloud');
        if (tagCloudContainer) {
            tagCloudContainer.innerHTML = '<span class="error">Error loading tags</span>';
        }
    }
}

// Event Listeners
function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

// Search Functionality
function performSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (!searchTerm) {
        loadPosts();
        return;
    }
    
    searchPosts(searchTerm);
}

async function searchPosts(searchTerm) {
    try {
        const postsContainer = document.getElementById('posts-container');
        if (!postsContainer) return;
        
        // Show loading state
        postsContainer.innerHTML = '<div class="loading">Searching posts...</div>';
        
        // Fetch posts list
        const postsResponse = await fetch('posts/posts.json');
        if (!postsResponse.ok) {
            throw new Error('Failed to fetch posts list');
        }
        
        const postsList = await postsResponse.json();
        
        // Clear loading state
        postsContainer.innerHTML = '';
        
        // Filter posts based on search term
        const matchingPosts = [];
        
        for (const postInfo of postsList) {
            try {
                const postResponse = await fetch(`posts/${postInfo.file}`);
                if (!postResponse.ok) {
                    console.error(`Failed to fetch post: ${postInfo.file}`);
                    continue;
                }
                
                const markdownContent = await postResponse.text();
                const post = parsePostMetadata(markdownContent, postInfo.file);
                
                if (post) {
                    // Check if search term matches title, tags, or content
                    const titleMatch = post.title.toLowerCase().includes(searchTerm);
                    const tagsMatch = post.tags.some(tag => tag.toLowerCase().includes(searchTerm));
                    const contentMatch = post.content.toLowerCase().includes(searchTerm);
                    
                    if (titleMatch || tagsMatch || contentMatch) {
                        matchingPosts.push(post);
                    }
                }
            } catch (error) {
                console.error(`Error loading post ${postInfo.file}:`, error);
            }
        }
        
        // Display matching posts
        if (matchingPosts.length === 0) {
            postsContainer.innerHTML = '<div class="no-posts">No posts found matching your search.</div>';
            return;
        }
        
        for (const post of matchingPosts) {
            const postCard = createPostCard(post);
            postsContainer.appendChild(postCard);
        }
        
        // Initialize lazy loading for images
        initializeLazyLoading();
        
    } catch (error) {
        console.error('Error searching posts:', error);
        const postsContainer = document.getElementById('posts-container');
        if (postsContainer) {
            postsContainer.innerHTML = '<div class="error">Failed to search posts. Please try again later.</div>';
        }
    }
}

// Filter by Tag
function filterByTag(tag) {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = tag;
        performSearch();
    }
}

// Lazy Loading
function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('.lazy-image');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.remove('lazy-image');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }
}
