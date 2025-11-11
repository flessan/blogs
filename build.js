const fs = require('fs-extra');
const path = require('path');
const marked = require('marked');
const matter = require('gray-matter');
const hljs = require('highlight.js');

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

// Proses file markdown
async function processMarkdown(filePath, nav) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data, content: mdContent } = matter(content);
  
  const htmlContent = marked(mdContent);
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
    .replace('{{ content }}', htmlContent)
    .replace('{{ navigation }}', navHtml);
  
  return output;
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
  
  console.log('Build completed!');
}

build().catch(console.error);
