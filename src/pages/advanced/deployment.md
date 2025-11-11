---
title: Deployment
description: Panduan deployment aplikasi ke berbagai platform
---

# Deployment

Panduan ini menjelaskan cara mendeploy aplikasi Anda ke berbagai platform.

## Build untuk Produksi

Sebelum mendeploy, Anda perlu membuild aplikasi untuk produksi:

```bash
npx our-product build
```

Ini akan membuat folder `dist` dengan file yang dioptimalkan untuk produksi.

## Deployment ke Cloudflare Pages

Cloudflare Pages adalah platform hosting statis yang gratis dan cepat. Berikut cara mendeploy:

### 1. Push ke GitHub

Pastikan kode Anda sudah di-push ke repository GitHub.

### 2. Setup Cloudflare Pages

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pilih "Pages" dari menu samping
3. Klik "Create a project"
4. Pilih repository GitHub Anda
5. Konfigurasi build settings:
   - **Build command**: `npm install && npm run build`
   - **Build output directory**: `dist`
6. Klik "Save and Deploy"

### 3. Environment Variables (Opsional)

Jika Anda menggunakan variabel lingkungan, tambahkan di Settings > Environment variables.

## Deployment ke Vercel

Vercel adalah platform hosting yang dioptimalkan untuk aplikasi modern:

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Deploy

```bash
vercel
```

Ikuti instruksi untuk menyelesaikan deployment.

## Deployment ke Netlify

Netlify adalah platform hosting statis populer:

### 1. Push ke GitHub

Pastikan kode Anda sudah di-push ke repository GitHub.

### 2. Setup Netlify

1. Login ke [Netlify](https://app.netlify.com)
2. Klik "New site from Git"
3. Pilih repository GitHub Anda
4. Konfigurasi build settings:
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `dist`
5. Klik "Deploy site"

## Deployment ke Server Sendiri

Untuk deployment ke server sendiri:

### 1. Upload File

Upload folder `dist` ke server Anda menggunakan FTP, SFTP, atau SCP.

### 2. Setup Web Server

#### Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Apache

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/dist

    <Directory /path/to/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

## Deployment dengan Docker

Anda juga dapat menggunakan Docker untuk deployment:

### 1. Buat Dockerfile

```dockerfile
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Build Image

```bash
docker build -t my-app .
```

### 3. Jalankan Container

```bash
docker run -p 80:80 my-app
```

## CI/CD

Untuk deployment otomatis, Anda dapat menggunakan GitHub Actions:

### 1. Buat Workflow

Buat file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@1.3.0
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

:::warning
Pastikan Anda telah mengatur secrets di repository GitHub Anda.
:::

## Monitoring

Setelah deployment, Anda mungkin ingin memantau aplikasi Anda:

- **Cloudflare Analytics**: Gratis untuk pengguna Cloudflare Pages
- **Google Analytics**: Tambahkan script tracking di konfigurasi
- **Uptime Monitoring**: Gunakan layanan seperti UptimeRobot

## Best Practices

Berikut beberapa best practices untuk deployment:

1. **Gunakan CI/CD**: Otomatisasi deployment untuk mengurangi kesalahan manusia
2. **Environment Variables**: Jangan hardcode kredensial atau konfigurasi sensitif
3. **Caching**: Gunakan caching untuk meningkatkan performa
4. **HTTPS**: Selalu gunakan HTTPS untuk keamanan
5. **Backup**: Selalu backup kode dan konfigurasi Anda

## Troubleshooting

Jika Anda mengalami masalah setelah deployment:

1. Periksa log build di platform hosting Anda
2. Pastikan semua file telah diupload dengan benar
3. Verifikasi konfigurasi server atau platform hosting
4. Periksa error di browser console

:::danger
Jangan pernah mengupload folder `node_modules` atau file konfigurasi sensitif ke repository publik.
:::
