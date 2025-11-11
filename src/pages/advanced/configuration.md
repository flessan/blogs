---
title: Konfigurasi Lanjutan
description: Opsi konfigurasi lanjutan untuk produk kami
---

# Konfigurasi Lanjutan

Dokumen ini menjelaskan opsi konfigurasi lanjutan yang tersedia untuk produk kami.

## File Konfigurasi

Produk kami menggunakan file `config.json` untuk konfigurasi. Berikut adalah opsi yang tersedia:

### Opsi Umum

| Opsi | Tipe | Default | Deskripsi |
|------|------|---------|-----------|
| `name` | String | - | Nama proyek Anda |
| `version` | String | "1.0.0" | Versi proyek |
| `theme` | String | "light" | Tema aplikasi (light/dark) |
| `language` | String | "en" | Bahasa aplikasi |

### Opsi Server

| Opsi | Tipe | Default | Deskripsi |
|------|------|---------|-----------|
| `port` | Number | 3000 | Port server |
| `host` | String | "localhost" | Host server |
| `ssl` | Boolean | false | Aktifkan HTTPS |

### Opsi Build

| Opsi | Tipe | Default | Deskripsi |
|------|------|---------|-----------|
| `minify` | Boolean | true | Minifikasi output |
| `sourceMaps` | Boolean | false | Generate source maps |
| `outDir` | String | "dist" | Direktori output |

## Variabel Lingkungan

Anda juga dapat menggunakan variabel lingkungan untuk konfigurasi:

```bash
# Set port server
export PORT=8080

# Set tema
export THEME=dark

# Set mode debug
export DEBUG=true
```

## Konfigurasi Multi-Lingkungan

Untuk konfigurasi yang berbeda di setiap lingkungan, Anda dapat membuat file konfigurasi terpisah:

```
config/
├── development.json
├── staging.json
└── production.json
```

Kemudian gunakan variabel lingkungan `NODE_ENV` untuk memilih konfigurasi:

```bash
NODE_ENV=production npx our-product start
```

## Plugin

Produk kami mendukung sistem plugin untuk memperluas fungsionalitas. Untuk menginstal plugin:

```bash
npm install our-product-plugin-example
```

Kemudian tambahkan ke konfigurasi:

```json
{
  "plugins": [
    "our-product-plugin-example"
  ]
}
```

:::tip
Anda dapat menemukan plugin yang tersedia di [registry plugin](https://plugins.example.com).
:::

## Contoh Konfigurasi Lengkap

Berikut adalah contoh file konfigurasi lengkap:

```json
{
  "name": "Aplikasi Saya",
  "version": "2.0.0",
  "settings": {
    "theme": "dark",
    "language": "id",
    "debug": false
  },
  "server": {
    "port": 8080,
    "host": "0.0.0.0",
    "ssl": {
      "enabled": true,
      "cert": "./ssl/cert.pem",
      "key": "./ssl/key.pem"
    }
  },
  "build": {
    "minify": true,
    "sourceMaps": false,
    "outDir": "dist"
  },
  "plugins": [
    "our-product-plugin-analytics",
    "our-product-plugin-pwa"
  ]
}
```

## Validasi Konfigurasi

Untuk memvalidasi file konfigurasi Anda, jalankan:

```bash
npx our-product validate-config
```

Ini akan memeriksa kesalahan sintaks dan opsi yang tidak dikenal.
