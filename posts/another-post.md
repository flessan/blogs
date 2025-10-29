---
title: "How to Use the Admin Panel"
date: "2023-10-20"
tags: "admin, tutorial, guide"
---

# How to Use the Admin Panel

The admin panel allows you to manage your blog posts without needing a backend. Here's how to use it:

## Accessing the Admin Panel

1. Navigate to `/admin.html` on your blog
2. Log in with your credentials (default: username `admin`, password `password123`)
3. You'll be taken to the admin dashboard

## Dashboard

The dashboard provides an overview of your blog:

- **Total Posts**: Number of published posts
- **Total Views**: Combined views of all posts
- **Total Comments**: Number of comments across all posts
- **Recent Activity**: Shows recent actions like creating or editing posts

## Managing Posts

### Creating a New Post

1. Click on the "Create Post" tab in the sidebar
2. Fill in the post details:
   - **Title**: The title of your post
   - **Date**: The publication date
   - **Tags**: Comma-separated tags for your post
   - **Content**: The content of your post in Markdown format
3. Click "Save Post" to save your post
4. You can preview your post before saving by clicking "Preview"

### Editing a Post

1. Go to the "Posts" tab
2. Find the post you want to edit
3. Click the "Edit" button
4. Make your changes
5. Click "Save Post" to save your changes

### Deleting a Post

1. Go to the "Posts" tab
2. Find the post you want to delete
3. Click the "Delete" button
4. Confirm the deletion

## Customizing Your Blog

The "Settings" tab allows you to customize the appearance of your blog:

- **Primary Color**: The main color used throughout the blog
- **Secondary Color**: The secondary color for accents
- **Banner Image**: URL for a banner image (if you want one)
- **Blog Title**: The title of your blog

## Security Note

Since this is a static blog with no backend, the admin login is handled entirely in the browser using JavaScript. The credentials are stored in plain text in the JavaScript code. In a production environment, you should:

1. Change the default username and password
2. Consider using additional security measures like IP restrictions
3. Remember that anyone with access to the admin panel can modify your blog's content

## Limitations

Because this is a static blog, there are some limitations:

- Posts are not actually saved as files (this would require a backend)
- The blog relies on localStorage for comments, reactions, and view counts
- The admin panel is only as secure as your browser's localStorage

Despite these limitations, this static blog provides a simple, fast, and secure way to run a blog without needing a backend.
