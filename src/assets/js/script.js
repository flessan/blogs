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
  
  // Fetch search index (dibuat saat build)
  try {
    const response = await fetch('/assets/js/search-index.json');
    const data = await response.json();
    
    const results = data.filter(page => 
      page.title.toLowerCase().includes(query) || 
      page.content.toLowerCase().includes(query)
    );
    
    if (results.length > 0) {
      searchResults.innerHTML = results.map(page => `
        <div class="search-result">
          <a href="/${page.path}">${page.title}</a>
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

// Tambahkan CSS untuk lightbox
const style = document.createElement('style');
style.textContent = `
  .lightbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    cursor: pointer;
  }
  
  .lightbox img {
    max-width: 90%;
    max-height: 90%;
    border-radius: 8px;
  }
`;
document.head.appendChild(style);
