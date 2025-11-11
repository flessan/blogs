const fs = require('fs-extra');
const path = require('path');
const marked = require('marked');
const matter = require('gray-matter');
const hljs = require('highlight.js');
const { JSDOM } = require('jsdom');

// Setup marked dengan syntax highlighting
marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  }
});

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');
const templatePath = path.join(__dirname, 'templates', 'layout.html');

// Baca template
const template = fs.readFileSync(templatePath, 'utf-8');

// Generate navigasi dari struktur folder
async function generateNavigation() {
  const nav = [];
  const pagesDir = path.join(srcDir, 'pages');
  
  const processDir = async (dir, basePath = '') => {
    const items = await fs.readdir(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        const children = await processDir(fullPath, `${basePath}${item}/`);
        nav.push({
          title: item,
          path: `${basePath}${item}/`,
          children
        });
      } else if (item.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const { data } = matter(content);
        nav.push({
          title: data.title || item.replace('.md', ''),
          path: `${basePath}${item.replace('.md', '.html')}`
        });
      }
    }
  };
  
  await processDir(pagesDir);
  return nav;
}

// Render navigasi ke HTML
function renderNavigation(nav, currentPath) {
  let html = '<ul class="nav-list">';
  nav.forEach(item => {
    const active = currentPath === item.path ? 'active' : '';
    if (item.children) {
      html += `
        <li class="nav-item nav-folder">
          <div class="nav-title">${item.title}</div>
          <div class="nav-children">
            ${renderNavigation(item.children, currentPath)}
          </div>
        </li>
      `;
    } else {
      html += `
        <li class="nav-item ${active}">
          <a href="/${item.path}" class="nav-link">${item.title}</a>
        </li>
      `;
    }
  });
  html += '</ul>';
  return html;
}

// Proses komponen kustom
function processCustomComponents(html) {
  // Komponen peringatan
  html = html.replace(
    /:::warning\s+(.*?)\s+:::/gs,
    '<div class="custom-block warning"><div class="custom-block-title">Peringatan</div>$1</div>'
  );
  
  // Komponen tips
  html = html.replace(
    /:::tip\s+(.*?)\s+:::/gs,
    '<div class="custom-block tip"><div class="custom-block-title">Tips</div>$1</div>'
  );
  
  // Komponen info
  html = html.replace(
    /:::info\s+(.*?)\s+:::/gs,
    '<div class="custom-block info"><div class="custom-block-title">Info</div>$1</div>'
  );
  
  // Komponen danger
  html = html.replace(
    /:::danger\s+(.*?)\s+:::/gs,
    '<div class="custom-block danger"><div class="custom-block-title">Bahaya</div>$1</div>'
  );
  
  return html;
}

// Generate TOC
function generateTOC(html) {
  const headings = [];
  const regex = /<h([1-6]) id="([^"]+)">([^<]+)<\/h[1-6]>/g;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3]
    });
  }
  
  if (headings.length === 0) return '';
  
  let toc = '<div class="toc"><h4>Daftar Isi</h4><ul>';
  let currentLevel = 1;
  
  headings.forEach(heading => {
    if (heading.level > currentLevel) {
      toc += '<ul>';
      currentLevel = heading.level;
    } else if (heading.level < currentLevel) {
      toc += '</ul>'.repeat(currentLevel - heading.level);
      currentLevel = heading.level;
    }
    
    toc += `<li><a href="#${heading.id}">${heading.text}</a></li>`;
  });
  
  toc += '</ul>'.repeat(currentLevel - 1) + '</div>';
  return toc;
}

// Generate search index
async function generateSearchIndex() {
  const searchIndex = [];
  const pagesDir = path.join(srcDir, 'pages');
  
  const processFiles = async (dir, basePath = '') => {
    const items = await fs.readdir(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        await processFiles(fullPath, `${basePath}${item}/`);
      } else if (item.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const { data, content: mdContent } = matter(content);
        
        // Render markdown ke HTML
        const htmlContent = marked(mdContent);
        
        // Ekstrak teks biasa dari HTML
        const dom = new JSDOM(htmlContent);
        const textContent = dom.window.document.body.textContent || '';
        
        searchIndex.push({
          title: data.title || item.replace('.md', ''),
          path: `${basePath}${item.replace('.md', '.html')}`,
          content: textContent.substring(0, 500),
          category: data.category || 'general'
        });
      }
    }
  };
  
  await processFiles(pagesDir);
  
  // Simpan search index
  await fs.ensureDir(path.join(distDir, 'assets', 'js'));
  await fs.writeFile(
    path.join(distDir, 'assets', 'js', 'search-index.json'),
    JSON.stringify(searchIndex, null, 2)
  );
}

// Proses file markdown
async function processMarkdown(filePath, nav) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data, content: mdContent } = matter(content);
  
  const htmlContent = marked(mdContent);
  const processedContent = processCustomComponents(htmlContent);
  const toc = generateTOC(processedContent);
  
  const title = data.title || path.basename(filePath, '.md');
  const description = data.description || '';
  
  // Path relatif untuk navigasi
  const relativePath = path.relative(srcDir, filePath)
    .replace('pages/', '')
    .replace('.md', '.html');
  
  const navHtml = renderNavigation(nav, relativePath);
  
  // Ganti placeholder di template
  let output = template
    .replace('{{ title }}', title)
    .replace('{{ description }}', description)
    .replace('{{ content }}', processedContent)
    .replace('{{ navigation }}', navHtml)
    .replace('{{ toc }}', toc);
  
  return output;
}

// Generate sitemap
async function generateSitemap(nav) {
  const baseUrl = 'https://your-domain.com'; // Ganti dengan domain Anda
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${nav.map(item => {
    if (item.children) {
      return item.children.map(child => `
  <url>
    <loc>${baseUrl}/${child.path}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`).join('');
    } else {
      return `
  <url>
    <loc>${baseUrl}/${item.path}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`;
    }
  }).join('')}
</urlset>`;
  
  await fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemap);
}

// Fungsi build utama
async function build() {
  await fs.emptyDir(distDir);
  
  // Salin aset
  await fs.copy(path.join(srcDir, 'assets'), path.join(distDir, 'assets'));
  await fs.copy(path.join(srcDir, 'images'), path.join(distDir, 'images'));
  
  // Generate navigasi
  const nav = await generateNavigation();
  
  // Proses semua file markdown
  const pagesDir = path.join(srcDir, 'pages');
  const processFiles = async (dir, basePath = '') => {
    const items = await fs.readdir(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        await processFiles(fullPath, `${basePath}${item}/`);
      } else if (item.endsWith('.md')) {
        const output = await processMarkdown(fullPath, nav);
        const outputPath = path.join(distDir, basePath, item.replace('.md', '.html'));
        await fs.ensureDir(path.dirname(outputPath));
        await fs.writeFile(outputPath, output);
      }
    }
  };
  
  await processFiles(pagesDir);
  
  // Buat index.html di root
  const indexHtml = await fs.readFile(path.join(distDir, 'pages', 'index.html'), 'utf-8');
  await fs.writeFile(path.join(distDir, 'index.html'), indexHtml);
  
  // Generate search index
  await generateSearchIndex();
  
  // Generate sitemap
  await generateSitemap(nav);
  
  console.log('Build completed!');
}

build().catch(console.error);
