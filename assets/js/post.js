// JavaScript for the single post page

document.addEventListener('DOMContentLoaded', function() {
    // Get post ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const postFile = urlParams.get('post');
    
    if (!postFile) {
        window.location.href = 'index.html';
        return;
    }
    
    // Initialize theme
    initializeTheme();
    
    // Load post
    loadPost(postFile);
    
    // Setup event listeners
    setupEventListeners();
    
    // Load recent posts in sidebar
    loadRecentPosts();
    
    // Load comments
    loadComments(postFile);
    
    // Load reactions
    loadReactions(postFile);
    
    // Increment view count
    incrementPostViews(postFile);
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
async function loadPost(postFile) {
    try {
        const postContent = document.getElementById('post-content');
        if (!postContent) return;
        
        // Show loading state
        postContent.innerHTML = '<div class="loading">Loading post...</div>';
        
        // Fetch post
        const response = await fetch(`posts/${postFile}`);
        if (!response.ok) {
            throw new Error('Failed to fetch post');
        }
        
        const markdownContent = await response.text();
        const post = parsePostMetadata(markdownContent, postFile);
        
        if (!post) {
            throw new Error('Failed to parse post');
        }
        
        // Update page title
        document.getElementById('post-title').textContent = `${post.title} - Static Blog`;
        
        // Format date
        const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Convert markdown to HTML
        const htmlContent = marked.parse(post.content);
        
        // Apply syntax highlighting
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        tempDiv.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
        
        // Create post HTML
        postContent.innerHTML = `
            <div class="post-header">
                <h1 class="post-title">${post.title}</h1>
                <div class="post-meta">
                    <span class="post-date"><i class="far fa-calendar"></i> ${formattedDate}</span>
                    <span class="post-views"><i class="fas fa-eye"></i> ${getPostViews(postFile)} views</span>
                </div>
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="post-content">
                ${tempDiv.innerHTML}
            </div>
        `;
        
        // Update tags in sidebar
        updatePostTags(post.tags);
        
        // Setup share buttons
        setupShareButtons(post.title, postFile);
        
        // Load related posts
        loadRelatedPosts(post.tags, postFile);
        
        // Initialize lazy loading for images
        initializeLazyLoading();
        
    } catch (error) {
        console.error('Error loading post:', error);
        const postContent = document.getElementById('post-content');
        if (postContent) {
            postContent.innerHTML = '<div class="error">Failed to load post. Please try again later.</div>';
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
            file: filename
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
    
    return {
        title: parsedMetadata.title || filename.replace('.md', '').replace(/[-_]/g, ' '),
        date: parsedMetadata.date || new Date().toISOString().split('T')[0],
        tags,
        content,
        file: filename
    };
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

// Update Post Tags in Sidebar
function updatePostTags(tags) {
    const postTagsContainer = document.getElementById('post-tags');
    if (!postTagsContainer) return;
    
    postTagsContainer.innerHTML = '';
    
    if (tags.length === 0) {
        postTagsContainer.innerHTML = '<p>No tags</p>';
        return;
    }
    
    for (const tag of tags) {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        tagElement.addEventListener('click', () => {
            window.location.href = `index.html?search=${encodeURIComponent(tag)}`;
        });
        postTagsContainer.appendChild(tagElement);
    }
}

// Share Buttons
function setupShareButtons(title, postFile) {
    const url = window.location.href;
    
    // Twitter
    const twitterBtn = document.getElementById('share-twitter');
    if (twitterBtn) {
        twitterBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        twitterBtn.target = '_blank';
    }
    
    // Facebook
    const facebookBtn = document.getElementById('share-facebook');
    if (facebookBtn) {
        facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        facebookBtn.target = '_blank';
    }
    
    // WhatsApp
    const whatsappBtn = document.getElementById('share-whatsapp');
    if (whatsappBtn) {
        whatsappBtn.href = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
        whatsappBtn.target = '_blank';
    }
    
    // LinkedIn
    const linkedinBtn = document.getElementById('share-linkedin');
    if (linkedinBtn) {
        linkedinBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        linkedinBtn.target = '_blank';
    }
}

// Related Posts
async function loadRelatedPosts(currentPostTags, currentPostFile) {
    try {
        const relatedPostsContainer = document.getElementById('related-posts-list');
        if (!relatedPostsContainer) return;
        
        // Fetch posts list
        const postsResponse = await fetch('posts/posts.json');
        if (!postsResponse.ok) {
            throw new Error('Failed to fetch posts list');
        }
        
        const postsList = await postsResponse.json();
        
        // Score posts based on shared tags
        const scoredPosts = [];
        
        for (const postInfo of postsList) {
            // Skip current post
            if (postInfo.file === currentPostFile) continue;
            
            try {
                const postResponse = await fetch(`posts/${postInfo.file}`);
                if (!postResponse.ok) {
                    console.error(`Failed to fetch post: ${postInfo.file}`);
                    continue;
                }
                
                const markdownContent = await postResponse.text();
                const post = parsePostMetadata(markdownContent, postInfo.file);
                
                if (post && post.tags) {
                    // Calculate score based on shared tags
                    let score = 0;
                    for (const tag of currentPostTags) {
                        if (post.tags.includes(tag)) {
                            score++;
                        }
                    }
                    
                    if (score > 0) {
                        scoredPosts.push({
                            post,
                            score
                        });
                    }
                }
            } catch (error) {
                console.error(`Error loading post ${postInfo.file}:`, error);
            }
        }
        
        // Sort by score (highest first)
        scoredPosts.sort((a, b) => b.score - a.score);
        
        // Take top 3 related posts
        const relatedPosts = scoredPosts.slice(0, 3);
        
        // Clear container
        relatedPostsContainer.innerHTML = '';
        
        // If no related posts, show message
        if (relatedPosts.length === 0) {
            relatedPostsContainer.innerHTML = '<p>No related posts found.</p>';
            return;
        }
        
        // Add each related post
        for (const { post } of relatedPosts) {
            const relatedPostElement = document.createElement('div');
            relatedPostElement.className = 'related-post';
            
            // Find first image in content
            const imageMatch = post.content.match(/!\[.*?\]\((.*?)\)/);
            const imageUrl = imageMatch ? imageMatch[1] : `https://picsum.photos/seed/${post.file}/80/80.jpg`;
            
            // Format date
            const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            relatedPostElement.innerHTML = `
                <img src="${imageUrl}" alt="${post.title}" class="related-post-image">
                <div class="related-post-content">
                    <h4><a href="post.html?post=${post.file}">${post.title}</a></h4>
                    <div class="related-post-meta">${formattedDate}</div>
                </div>
            `;
            
            relatedPostsContainer.appendChild(relatedPostElement);
        }
        
    } catch (error) {
        console.error('Error loading related posts:', error);
        const relatedPostsContainer = document.getElementById('related-posts-list');
        if (relatedPostsContainer) {
            relatedPostsContainer.innerHTML = '<p>Error loading related posts.</p>';
        }
    }
}

// Comments
function loadComments(postFile) {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    
    const commentsKey = `comments_${postFile}`;
    const comments = JSON.parse(localStorage.getItem(commentsKey) || '[]');
    
    // Clear container
    commentsList.innerHTML = '';
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
        return;
    }
    
    // Add each comment
    for (const comment of comments) {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        
        // Format date
        const formattedDate = new Date(comment.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        commentElement.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${comment.name}</span>
                <span class="comment-date">${formattedDate}</span>
            </div>
            <div class="comment-text">${comment.text}</div>
        `;
        
        commentsList.appendChild(commentElement);
    }
}

function addComment(postFile) {
    const nameInput = document.getElementById('comment-name');
    const textInput = document.getElementById('comment-text');
    
    if (!nameInput || !textInput) return;
    
    const name = nameInput.value.trim();
    const text = textInput.value.trim();
    
    if (!name || !text) {
        alert('Please enter both name and comment.');
        return;
    }
    
    const commentsKey = `comments_${postFile}`;
    const comments = JSON.parse(localStorage.getItem(commentsKey) || '[]');
    
    // Add new comment
    comments.push({
        name,
        text,
        date: new Date().toISOString()
    });
    
    // Save to localStorage
    localStorage.setItem(commentsKey, JSON.stringify(comments));
    
    // Clear form
    nameInput.value = '';
    textInput.value = '';
    
    // Reload comments
    loadComments(postFile);
}

// Reactions
function loadReactions(postFile) {
    const reactionsKey = `reactions_${postFile}`;
    const reactions = JSON.parse(localStorage.getItem(reactionsKey) || '{}');
    
    // Default reactions
    const defaultReactions = {
        heart: 0,
        like: 0,
        laugh: 0,
        wow: 0
    };
    
    // Merge with saved reactions
    const mergedReactions = { ...defaultReactions, ...reactions };
    
    // Update UI
    for (const [reaction, count] of Object.entries(mergedReactions)) {
        const button = document.querySelector(`.reaction-btn[data-reaction="${reaction}"]`);
        if (button) {
            const countElement = button.querySelector('.count');
            if (countElement) {
                countElement.textContent = count;
            }
        }
    }
    
    // Check if user has already reacted
    const userReactionKey = `user_reaction_${postFile}`;
    const userReaction = localStorage.getItem(userReactionKey);
    
    if (userReaction) {
        const button = document.querySelector(`.reaction-btn[data-reaction="${userReaction}"]`);
        if (button) {
            button.classList.add('active');
        }
    }
}

function addReaction(postFile, reaction) {
    const reactionsKey = `reactions_${postFile}`;
    const reactions = JSON.parse(localStorage.getItem(reactionsKey) || '{}');
    
    // Check if user has already reacted
    const userReactionKey = `user_reaction_${postFile}`;
    const userReaction = localStorage.getItem(userReactionKey);
    
    // If user has already reacted, remove previous reaction
    if (userReaction && userReaction !== reaction) {
        reactions[userReaction] = (reactions[userReaction] || 0) - 1;
        
        // Update UI
        const prevButton = document.querySelector(`.reaction-btn[data-reaction="${userReaction}"]`);
        if (prevButton) {
            const countElement = prevButton.querySelector('.count');
            if (countElement) {
                countElement.textContent = reactions[userReaction] || 0;
            }
            prevButton.classList.remove('active');
        }
    }
    
    // Add new reaction
    reactions[reaction] = (reactions[reaction] || 0) + 1;
    
    // Save to localStorage
    localStorage.setItem(reactionsKey, JSON.stringify(reactions));
    localStorage.setItem(userReactionKey, reaction);
    
    // Update UI
    const button = document.querySelector(`.reaction-btn[data-reaction="${reaction}"]`);
    if (button) {
        const countElement = button.querySelector('.count');
        if (countElement) {
            countElement.textContent = reactions[reaction];
        }
        button.classList.add('active');
    }
}

// Recent Posts (copied from main.js)
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

// Event Listeners
function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Comment submission
    const submitCommentBtn = document.getElementById('submit-comment');
    if (submitCommentBtn) {
        submitCommentBtn.addEventListener('click', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const postFile = urlParams.get('post');
            if (postFile) {
                addComment(postFile);
            }
        });
    }
    
    // Reaction buttons
    const reactionButtons = document.querySelectorAll('.reaction-btn');
    reactionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const reaction = button.getAttribute('data-reaction');
            const urlParams = new URLSearchParams(window.location.search);
            const postFile = urlParams.get('post');
            if (postFile && reaction) {
                addReaction(postFile, reaction);
            }
        });
    });
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
