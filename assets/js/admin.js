// JavaScript for the admin panel

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkLoginStatus();
    
    // Setup event listeners
    setupEventListeners();
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('post-date');
    if (dateInput) {
        dateInput.value = today;
    }
});

// Login Management
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (isLoggedIn) {
        showAdminPanel();
    } else {
        showLoginForm();
    }
}

function showLoginForm() {
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('admin-container').style.display = 'none';
}

function showAdminPanel() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('admin-container').style.display = 'block';
    
    // Load dashboard data
    loadDashboardData();
    
    // Load posts
    loadPosts();
    
    // Load settings
    loadSettings();
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Hardcoded credentials (in a real app, this would be handled by a backend)
    const validUsername = 'admin';
    const validPassword = 'password123';
    
    const messageElement = document.getElementById('login-message');
    
    if (username === validUsername && password === validPassword) {
        localStorage.setItem('adminLoggedIn', 'true');
        showAdminPanel();
    } else {
        messageElement.textContent = 'Invalid username or password';
        messageElement.className = 'message error';
    }
}

function logout() {
    localStorage.removeItem('adminLoggedIn');
    showLoginForm();
}

// Dashboard
async function loadDashboardData() {
    try {
        // Fetch posts list
        const postsResponse = await fetch('posts/posts.json');
        if (!postsResponse.ok) {
            throw new Error('Failed to fetch posts list');
        }
        
        const postsList = await postsResponse.json();
        
        // Update total posts
        document.getElementById('total-posts').textContent = postsList.length;
        
        // Calculate total views
        let totalViews = 0;
        let totalComments = 0;
        
        for (const postInfo of postsList) {
            // Get views
            const viewsKey = `views_${postInfo.file}`;
            const views = parseInt(localStorage.getItem(viewsKey) || '0');
            totalViews += views;
            
            // Get comments
            const commentsKey = `comments_${postInfo.file}`;
            const comments = JSON.parse(localStorage.getItem(commentsKey) || '[]');
            totalComments += comments.length;
        }
        
        // Update stats
        document.getElementById('total-views').textContent = totalViews;
        document.getElementById('total-comments').textContent = totalComments;
        
        // Load recent activity
        loadRecentActivity();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function loadRecentActivity() {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;
    
    // Get recent activity from localStorage
    const activities = JSON.parse(localStorage.getItem('adminActivity') || '[]');
    
    // Sort by date (newest first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Take only the 5 most recent
    const recentActivities = activities.slice(0, 5);
    
    // Clear container
    activityList.innerHTML = '';
    
    if (recentActivities.length === 0) {
        activityList.innerHTML = '<p>No recent activity</p>';
        return;
    }
    
    // Add each activity
    for (const activity of recentActivities) {
        const activityElement = document.createElement('div');
        activityElement.className = 'activity-item';
        
        // Format date
        const formattedDate = new Date(activity.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        activityElement.innerHTML = `
            <p>${activity.description}</p>
            <div class="activity-date">${formattedDate}</div>
        `;
        
        activityList.appendChild(activityElement);
    }
}

function addActivity(description) {
    const activities = JSON.parse(localStorage.getItem('adminActivity') || '[]');
    
    activities.push({
        description,
        date: new Date().toISOString()
    });
    
    // Keep only the last 20 activities
    if (activities.length > 20) {
        activities.splice(0, activities.length - 20);
    }
    
    localStorage.setItem('adminActivity', JSON.stringify(activities));
}

// Posts Management
async function loadPosts() {
    try {
        const postsList = document.getElementById('posts-list');
        if (!postsList) return;
        
        // Show loading state
        postsList.innerHTML = '<div class="loading">Loading posts...</div>';
        
        // Fetch posts list
        const postsResponse = await fetch('posts/posts.json');
        if (!postsResponse.ok) {
            throw new Error('Failed to fetch posts list');
        }
        
        const postsListData = await postsResponse.json();
        
        // Clear loading state
        postsList.innerHTML = '';
        
        // If no posts, show message
        if (postsListData.length === 0) {
            postsList.innerHTML = '<div class="no-posts">No posts found.</div>';
            return;
        }
        
        // Load and display each post
        for (const postInfo of postsListData) {
            try {
                const postResponse = await fetch(`posts/${postInfo.file}`);
                if (!postResponse.ok) {
                    console.error(`Failed to fetch post: ${postInfo.file}`);
                    continue;
                }
                
                const markdownContent = await postResponse.text();
                const post = parsePostMetadata(markdownContent, postInfo.file);
                
                if (post) {
                    const postItem = createPostItem(post);
                    postsList.appendChild(postItem);
                }
            } catch (error) {
                console.error(`Error loading post ${postInfo.file}:`, error);
            }
        }
        
    } catch (error) {
        console.error('Error loading posts:', error);
        const postsList = document.getElementById('posts-list');
        if (postsList) {
            postsList.innerHTML = '<div class="error">Failed to load posts. Please try again later.</div>';
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

function createPostItem(post) {
    const postItem = document.createElement('div');
    postItem.className = 'post-item';
    
    // Format date
    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    postItem.innerHTML = `
        <div class="post-item-header">
            <h3 class="post-item-title">${post.title}</h3>
            <div class="post-item-meta">
                <span class="post-date">${formattedDate}</span>
                <span class="post-views"><i class="fas fa-eye"></i> ${getPostViews(post.file)}</span>
            </div>
        </div>
        <div class="post-item-content">
            <p class="post-item-excerpt">${post.excerpt}</p>
            <div class="post-item-tags">
                ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="post-item-actions">
                <button class="edit-btn" data-file="${post.file}"><i class="fas fa-edit"></i> Edit</button>
                <button class="download-btn" data-file="${post.file}"><i class="fas fa-download"></i> Download</button>
                <button class="delete-btn" data-file="${post.file}"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const editBtn = postItem.querySelector('.edit-btn');
    const downloadBtn = postItem.querySelector('.download-btn');
    const deleteBtn = postItem.querySelector('.delete-btn');
    
    if (editBtn) {
        editBtn.addEventListener('click', () => editPost(post.file));
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => downloadPost(post.file));
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => deletePost(post.file));
    }
    
    return postItem;
}

function getPostViews(postFile) {
    const viewsKey = `views_${postFile}`;
    return localStorage.getItem(viewsKey) || '0';
}

// Create Post
function savePost() {
    const title = document.getElementById('post-title').value.trim();
    const date = document.getElementById('post-date').value;
    const tagsInput = document.getElementById('post-tags').value.trim();
    const content = document.getElementById('post-content').value.trim();
    
    if (!title || !date || !content) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Parse tags
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
    
    // Generate filename from title
    const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.md';
    
    // Create markdown content with frontmatter
    let markdownContent = '---\n';
    markdownContent += `title: "${title}"\n`;
    markdownContent += `date: "${date}"\n`;
    
    if (tags.length > 0) {
        markdownContent += `tags: "${tags.join(', ')}"\n`;
    }
    
    markdownContent += '---\n\n';
    markdownContent += content;
    
    // Store in localStorage for download
    const postsKey = 'draftPosts';
    const draftPosts = JSON.parse(localStorage.getItem(postsKey) || '{}');
    draftPosts[filename] = markdownContent;
    localStorage.setItem(postsKey, JSON.stringify(draftPosts));
    
    // Add activity
    addActivity(`Created new post: ${title}`);
    
    // Show success message
    alert(`Post "${title}" has been saved. Click "Download Markdown" to download the file.`);
    
    // Reload posts list
    loadPosts();
    
    // Reload dashboard data
    loadDashboardData();
}

function previewPost() {
    const title = document.getElementById('post-title').value.trim();
    const date = document.getElementById('post-date').value;
    const tagsInput = document.getElementById('post-tags').value.trim();
    const content = document.getElementById('post-content').value.trim();
    
    if (!title || !date || !content) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Parse tags
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
    
    // Create markdown content with frontmatter
    let markdownContent = '---\n';
    markdownContent += `title: "${title}"\n`;
    markdownContent += `date: "${date}"\n`;
    
    if (tags.length > 0) {
        markdownContent += `tags: "${tags.join(', ')}"\n`;
    }
    
    markdownContent += '---\n\n';
    markdownContent += content;
    
    // Convert markdown to HTML
    const htmlContent = marked.parse(markdownContent);
    
    // Show preview
    const previewContainer = document.getElementById('post-preview');
    const previewContent = document.getElementById('preview-content');
    
    if (previewContainer && previewContent) {
        previewContent.innerHTML = htmlContent;
        previewContainer.style.display = 'block';
        
        // Scroll to preview
        previewContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

function downloadPostFile() {
    const title = document.getElementById('post-title').value.trim();
    const date = document.getElementById('post-date').value;
    const tagsInput = document.getElementById('post-tags').value.trim();
    const content = document.getElementById('post-content').value.trim();
    
    if (!title || !date || !content) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Parse tags
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
    
    // Generate filename from title
    const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.md';
    
    // Create markdown content with frontmatter
    let markdownContent = '---\n';
    markdownContent += `title: "${title}"\n`;
    markdownContent += `date: "${date}"\n`;
    
    if (tags.length > 0) {
        markdownContent += `tags: "${tags.join(', ')}"\n`;
    }
    
    markdownContent += '---\n\n';
    markdownContent += content;
    
    // Create a blob and download
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Add activity
    addActivity(`Downloaded post: ${title}`);
}

// Download existing post
async function downloadPost(filename) {
    try {
        // Fetch post
        const response = await fetch(`posts/${filename}`);
        if (!response.ok) {
            throw new Error('Failed to fetch post');
        }
        
        const markdownContent = await response.text();
        
        // Create a blob and download
        const blob = new Blob([markdownContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Add activity
        addActivity(`Downloaded post: ${filename}`);
        
    } catch (error) {
        console.error('Error downloading post:', error);
        alert('Failed to download post. Please try again.');
    }
}

// Download posts.json
async function downloadPostsJson() {
    try {
        // Fetch posts list
        const postsResponse = await fetch('posts/posts.json');
        if (!postsResponse.ok) {
            throw new Error('Failed to fetch posts list');
        }
        
        const postsList = await postsResponse.json();
        const postsJsonContent = JSON.stringify(postsList, null, 2);
        
        // Create a blob and download
        const blob = new Blob([postsJsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'posts.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Add activity
        addActivity('Downloaded posts.json');
        
    } catch (error) {
        console.error('Error downloading posts.json:', error);
        alert('Failed to download posts.json. Please try again.');
    }
}

// Edit Post
async function editPost(filename) {
    try {
        // Fetch post
        const response = await fetch(`posts/${filename}`);
        if (!response.ok) {
            throw new Error('Failed to fetch post');
        }
        
        const markdownContent = await response.text();
        const post = parsePostMetadata(markdownContent, filename);
        
        if (!post) {
            throw new Error('Failed to parse post');
        }
        
        // Switch to create tab
        switchTab('create');
        
        // Populate form
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-date').value = post.date;
        document.getElementById('post-tags').value = post.tags.join(', ');
        document.getElementById('post-content').value = post.content;
        
        // Scroll to top of form
        document.querySelector('.create-post-form').scrollIntoView({ behavior: 'smooth' });
        
        // Store the original filename
        localStorage.setItem('editingPost', filename);
        
        // Add activity
        addActivity(`Edited post: ${post.title}`);
        
    } catch (error) {
        console.error('Error editing post:', error);
        alert('Failed to edit post. Please try again.');
    }
}

// Delete Post
function deletePost(filename) {
    if (confirm(`Are you sure you want to delete this post? This action cannot be undone.`)) {
        try {
            // Add activity
            addActivity(`Deleted post: ${filename}`);
            
            // Show success message
            alert(`Post "${filename}" has been marked for deletion. Please update posts.json and remove the file from the server.`);
            
            // Reload posts list
            loadPosts();
            
            // Reload dashboard data
            loadDashboardData();
            
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        }
    }
}

// Settings
function loadSettings() {
    // Load theme settings
    const primaryColor = localStorage.getItem('primaryColor') || '#3498db';
    const secondaryColor = localStorage.getItem('secondaryColor') || '#2c3e50';
    const bannerImage = localStorage.getItem('bannerImage') || '';
    const blogTitle = localStorage.getItem('blogTitle') || 'Static Blog';
    
    // Update form
    document.getElementById('primary-color').value = primaryColor;
    document.getElementById('secondary-color').value = secondaryColor;
    document.getElementById('banner-image').value = bannerImage;
    document.getElementById('blog-title').value = blogTitle;
}

function saveSettings() {
    const primaryColor = document.getElementById('primary-color').value;
    const secondaryColor = document.getElementById('secondary-color').value;
    const bannerImage = document.getElementById('banner-image').value.trim();
    const blogTitle = document.getElementById('blog-title').value.trim();
    
    // Save to localStorage
    localStorage.setItem('primaryColor', primaryColor);
    localStorage.setItem('secondaryColor', secondaryColor);
    localStorage.setItem('bannerImage', bannerImage);
    localStorage.setItem('blogTitle', blogTitle);
    
    // Update CSS variables
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    
    // Add activity
    addActivity('Updated blog settings');
    
    // Show success message
    alert('Settings saved successfully!');
}

// Tab Management
function switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }
    
    // Update nav
    const navLinks = document.querySelectorAll('.admin-nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-tab') === tabName) {
            link.classList.add('active');
        }
    });
}

// Templates
function loadTemplate(templateName) {
    const templates = {
        standard: `---
title: "Your Post Title"
date: "${new Date().toISOString().split('T')[0]}"
tags: "tag1, tag2, tag3"
---

# Introduction

Write your introduction here.

## Main Content

Write your main content here.

### Subsection

Write your subsection here.

## Conclusion

Write your conclusion here.`,
        
        tutorial: `---
title: "How to [Do Something]"
date: "${new Date().toISOString().split('T')[0]}"
tags: "tutorial, guide, how-to"
---

# Introduction

In this tutorial, you'll learn how to [do something]. This guide is suitable for beginners and will take you through each step in detail.

## Prerequisites

Before you start, make sure you have:

- Prerequisite 1
- Prerequisite 2
- Prerequisite 3

## Step 1: First Step

Describe the first step in detail.

## Step 2: Second Step

Describe the second step in detail.

## Step 3: Third Step

Describe the third step in detail.

## Conclusion

Congratulations! You've successfully learned how to [do something].`,

        review: `---
title: "[Product Name] Review"
date: "${new Date().toISOString().split('T')[0]}"
tags: "review, [product category]"
---

# Introduction

Today, we're taking a close look at [Product Name]. In this review, we'll cover its features, performance, and whether it's worth your money.

## Specifications

- Feature 1: [Description]
- Feature 2: [Description]
- Feature 3: [Description]

## Design and Build Quality

Describe the design and build quality of the product.

## Performance

Describe how the product performs in real-world use.

## Pros and Cons

### Pros
- Pro 1
- Pro 2
- Pro 3

### Cons
- Con 1
- Con 2
- Con 3

## Conclusion

Summarize your thoughts on the product and give your final verdict.`,

        listicle: `---
title: "10 Ways to [Achieve Something]"
date: "${new Date().toISOString().split('T')[0]}"
tags: "list, tips, [topic]"
---

# Introduction

Looking for ways to [achieve something]? We've got you covered! Here are 10 effective methods to help you reach your goal.

## 1. First Method

Describe the first method in detail.

## 2. Second Method

Describe the second method in detail.

## 3. Third Method

Describe the third method in detail.

## 4. Fourth Method

Describe the fourth method in detail.

## 5. Fifth Method

Describe the fifth method in detail.

## 6. Sixth Method

Describe the sixth method in detail.

## 7. Seventh Method

Describe the seventh method in detail.

## 8. Eighth Method

Describe the eighth method in detail.

## 9. Ninth Method

Describe the ninth method in detail.

## 10. Tenth Method

Describe the tenth method in detail.

## Conclusion

Try out these methods and see which ones work best for you. Remember that consistency is key to [achieving something].`
    };
    
    return templates[templateName] || '';
}

// Event Listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            login();
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Tab navigation
    const tabLinks = document.querySelectorAll('.admin-nav a');
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = link.getAttribute('data-tab');
            if (tabName) {
                switchTab(tabName);
            }
        });
    });
    
    // Save post button
    const savePostBtn = document.getElementById('save-post');
    if (savePostBtn) {
        savePostBtn.addEventListener('click', savePost);
    }
    
    // Preview post button
    const previewPostBtn = document.getElementById('preview-post');
    if (previewPostBtn) {
        previewPostBtn.addEventListener('click', previewPost);
    }
    
    // Download post button
    const downloadPostBtn = document.getElementById('download-post');
    if (downloadPostBtn) {
        downloadPostBtn.addEventListener('click', downloadPostFile);
    }
    
    // Download posts.json button
    const downloadPostsJsonBtn = document.getElementById('download-posts-json');
    if (downloadPostsJsonBtn) {
        downloadPostsJsonBtn.addEventListener('click', downloadPostsJson);
    }
    
    // Save settings button
    const saveSettingsBtn = document.getElementById('save-settings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }
    
    // Refresh posts button
    const refreshPostsBtn = document.getElementById('refresh-posts');
    if (refreshPostsBtn) {
        refreshPostsBtn.addEventListener('click', loadPosts);
    }
    
    // Post search
    const postSearch = document.getElementById('post-search');
    if (postSearch) {
        postSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterPosts(searchTerm);
        });
    }
    
    // Template selector
    const templateSelector = document.getElementById('post-template');
    if (templateSelector) {
        templateSelector.addEventListener('change', (e) => {
            const templateName = e.target.value;
            if (templateName) {
                const template = loadTemplate(templateName);
                document.getElementById('post-content').value = template;
            }
        });
    }
}

// Filter Posts
function filterPosts(searchTerm) {
    const postItems = document.querySelectorAll('.post-item');
    
    postItems.forEach(item => {
        const title = item.querySelector('.post-item-title').textContent.toLowerCase();
        const tags = Array.from(item.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
        
        const titleMatch = title.includes(searchTerm);
        const tagsMatch = tags.some(tag => tag.includes(searchTerm));
        
        if (titleMatch || tagsMatch || searchTerm === '') {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}
