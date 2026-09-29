# 📋 Absensi Sekolah

Web absensi sederhana dengan notifikasi otomatis ke Gmail guru.

## 🚀 Cara Deploy ke Vercel

### 1. Persiapkan Gmail App Password
1. Aktifkan 2FA di akun Google Anda.
2. Buka https://myaccount.google.com/apppasswords
3. Buat App Password baru → copy 16 digit (tanpa spasi).

### 2. Deploy via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
