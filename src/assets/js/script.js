// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

themeToggle.addEventListener('click', () => {
  html.setAttribute('data-theme', 
    html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
  );
  localStorage.setItem('theme', html.getAttribute('data-theme'));
});

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

// Search Functionality
const searchInput = document.getElementById('search');
const searchResults = document.getElementById('search-results');

searchInput.addEventListener('input', async (e) => {
  const query = e.target.value.toLowerCase();
  
  if (query.length < 2) {
    searchResults.innerHTML = '';
    return;
  }
  
  try {
    const response = await fetch('/assets/js/search-index.json');
    const data = await response.json();
    
    // Filter berdasarkan query
    const results = data.filter(page => 
      page.title.toLowerCase().includes(query) || 
      page.content.toLowerCase().includes(query)
    );
    
    // Group by category
    const groupedResults = results.reduce((acc, page) => {
      if (!acc[page.category]) acc[page.category] = [];
      acc[page.category].push(page);
      return acc;
    }, {});
    
    if (Object.keys(groupedResults).length > 0) {
      searchResults.innerHTML = Object.entries(groupedResults).map(([category, pages]) => `
        <div class="search-category">
          <div class="category-title">${category}</div>
          ${pages.map(page => `
            <div class="search-result">
              <a href="/${page.path}">${page.title}</a>
              <div class="search-snippet">${page.content.substring(0, 100)}...</div>
            </div>
          `).join('')}
        </div>
      `).join('');
    } else {
      searchResults.innerHTML = '<div class="no-results">Tidak ada hasil</div>';
    }
  } catch (error) {
    console.error('Search error:', error);
  }
});

// Edit Page Button
const editButton = document.getElementById('edit-page');
if (editButton) {
  editButton.addEventListener('click', () => {
    const currentPath = window.location.pathname;
    const editUrl = `https://github.com/username/repo/edit/main/src/pages${currentPath.replace('.html', '.md')}`;
    window.open(editUrl, '_blank');
  });
}

// Pagination
function setupPagination() {
  const pagination = document.querySelector('.pagination');
  if (!pagination) return;
  
  const currentPage = window.location.pathname;
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  
  const currentIndex = navLinks.findIndex(link => 
    link.getAttribute('href') === currentPage
  );
  
  if (currentIndex === -1) return;
  
  let prevLink = null;
  let nextLink = null;
  
  if (currentIndex > 0) {
    prevLink = navLinks[currentIndex - 1];
  }
  
  if (currentIndex < navLinks.length - 1) {
    nextLink = navLinks[currentIndex + 1];
  }
  
  pagination.innerHTML = `
    ${prevLink ? `<a href="${prevLink.getAttribute('href')}">← ${prevLink.textContent}</a>` : '<span></span>'}
    ${nextLink ? `<a href="${nextLink.getAttribute('href')}">${nextLink.textContent} →</a>` : '<span></span>'}
  `;
}

setupPagination();

// Image Lightbox
document.querySelectorAll('.markdown-body img').forEach(img => {
  img.addEventListener('click', () => {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
    
    lightbox.addEventListener('click', () => {
      document.body.removeChild(lightbox);
    });
    
    document.body.appendChild(lightbox);
  });
});

// Copy Code Button
document.querySelectorAll('pre code').forEach(block => {
  const button = document.createElement('button');
  button.className = 'copy-button';
  button.textContent = 'Salin';
  button.addEventListener('click', () => {
    navigator.clipboard.writeText(block.textContent);
    button.textContent = 'Tersalin!';
    setTimeout(() => {
      button.textContent = 'Salin';
    }, 2000);
  });
  
  const pre = block.parentElement;
  pre.style.position = 'relative';
  pre.appendChild(button);
});
