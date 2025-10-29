---
title: "How to Use the Admin Panel"
date: "2023-10-25"
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

## Creating a New Post

1. Click on the "Create Post" tab in the sidebar
2. Fill in the post details:
   - **Title**: The title of your post
   - **Date**: The publication date
   - **Tags**: Comma-separated tags for your post
   - **Template**: Choose a template to get started quickly
   - **Content**: The content of your post in Markdown format
3. Click "Preview" to see how your post will look
4. Click "Download Markdown" to download the post file
5. Upload the downloaded file to your `/posts` directory
6. Update the `posts.json` file to include your new post

## Managing Posts

### Editing a Post

1. Go to the "Posts" tab
2. Find the post you want to edit
3. Click the "Edit" button
4. Make your changes
5. Click "Download Markdown" to download the updated post
6. Replace the original file on your server with the new one

### Downloading a Post

1. Go to the "Posts" tab
2. Find the post you want to download
3. Click the "Download" button
4. The post will be downloaded as a Markdown file

### Deleting a Post

1. Go to the "Posts" tab
2. Find the post you want to delete
3. Click the "Delete" button
4. Confirm the deletion
5. Remove the file from your server and update `posts.json`

## Managing posts.json

The `posts.json` file is crucial for your blog to function correctly. It contains a list of all your posts. Here's how to manage it:

1. Go to the "Posts" tab
2. Click the "Download posts.json" button
3. Edit the file to add, remove, or update posts
4. Upload the updated file to your `/posts` directory

The format of `posts.json` is simple:

```json
[
    {
        "file": "post-filename.md",
        "date": "YYYY-MM-DD"
    },
    {
        "file": "another-post.md",
        "date": "YYYY-MM-DD"
    }
]
```

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

## Templates

The admin panel includes several templates to help you get started quickly:

- **Standard Post**: A basic blog post structure
- **Tutorial**: Step-by-step guide format
- **Review**: Product or service review format
- **Listicle**: List-based article format

To use a template:

1. Go to the "Create Post" tab
2. Select a template from the dropdown
3. The content area will be populated with the template structure
4. Customize the content to fit your needs

## Conclusion

The admin panel provides a simple, efficient way to manage your static blog. While it requires manual file uploads, it gives you full control over your content without the need for a backend.
```

## How to Use the Updated Admin Panel

With these updates, the admin panel is now fully functional for creating and managing blog posts:

1. **Creating Posts**:
   - Fill in the post details (title, date, tags)
   - Choose a template to get started quickly
   - Write your content in Markdown
   - Preview your post before downloading
   - Click "Download Markdown" to save the file
   - Upload the file to your `/posts` directory
   - Update `posts.json` to include your new post

2. **Editing Posts**:
   - Go to the "Posts" tab
   - Click "Edit" on the post you want to modify
   - Make your changes
   - Click "Download Markdown" to save the updated file
   - Replace the original file on your server

3. **Managing posts.json**:
   - Click "Download posts.json" in the "Posts" tab
   - Edit the file to add, remove, or update posts
   - Upload the updated file to your `/posts` directory

4. **Using Templates**:
   - Select a template from the dropdown when creating a post
   - The content area will be populated with a pre-structured format
   - Customize the content to fit your needs

This implementation maintains the static nature of the blog while providing a convenient way to create and manage content. The downloaded files can be easily uploaded to your server or committed to your Git repository.
