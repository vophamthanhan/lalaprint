# 🧾 Hệ Thống In Hóa Đơn Nhiệt POS

Trang web tạo và in hóa đơn nhiệt cho máy POS Android, tối ưu cho máy in Xprinter XP-80T qua RawBT Print Service.

## ✨ Tính năng

- ✅ Tạo phiếu tạm tính / hóa đơn
- ✅ Nhập món ăn, số lượng, đơn giá với nút giá nhanh
- ✅ Tính tổng tiền tự động
- ✅ QR thanh toán VietQR tự động
- ✅ In qua RawBT (Android) hoặc trình duyệt
- ✅ Giao diện tối ưu cho màn hình POS Android
- ✅ Không logo/watermark bên thứ ba

## 🚀 Deploy lên GitHub Pages

### Bước 1: Tạo Repository trên GitHub

1. Đăng nhập GitHub
2. Click **New repository**
3. Đặt tên: `pos-invoice` (hoặc tên khác)
4. Chọn **Public**
5. Click **Create repository**

### Bước 2: Upload Source Code

**Cách 1: Qua GitHub Web**
1. Vào repository vừa tạo
2. Click **uploading an existing file**
3. Kéo thả toàn bộ file/folder vào
4. Click **Commit changes**

**Cách 2: Qua Git Command**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pos-invoice.git
git push -u origin main
```

### Bước 3: Cấu hình GitHub Pages

1. Vào **Settings** > **Pages**
2. Source: chọn **GitHub Actions**
3. Tạo file `.github/workflows/deploy.yml` với nội dung:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Bước 4: Chờ Deploy

1. Vào tab **Actions** để xem tiến trình
2. Sau khi hoàn tất, truy cập: `https://YOUR_USERNAME.github.io/pos-invoice/`

## ⚠️ Lưu ý quan trọng

### Thay đổi base URL

Nếu tên repository khác `pos-invoice`, sửa file `vite.config.ts`:

```typescript
base: "/TEN-REPO-CUA-BAN/",
```

### Chạy local

```bash
npm install
npm run dev
```

Truy cập: http://localhost:3000

## 📱 Hướng dẫn sử dụng

### Cài đặt RawBT (Android)

1. Cài đặt **RawBT Print Service** từ Google Play
2. Kết nối máy in Xprinter XP-80T qua USB
3. Mở RawBT và chọn máy in

### Sử dụng

1. Mở web trên trình duyệt Chrome (Android)
2. Vào **Cài đặt** để điền thông tin cửa hàng, ngân hàng
3. Tạo đơn hàng: nhập tên món, số lượng, đơn giá
4. Nhấn **IN HÓA ĐƠN** để in

## 📁 Cấu trúc thư mục

```
pos-invoice/
├── public/              # Static assets
│   └── images/          # Logo và hình ảnh
├── src/
│   ├── components/      # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── OrderForm.tsx
│   │   └── ReceiptPreview.tsx
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilities
│   │   ├── types.ts     # TypeScript types
│   │   └── printUtils.ts # Print functions
│   ├── pages/           # Page components
│   │   ├── Home.tsx
│   │   └── Settings.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🛠️ Công nghệ

- React 19
- TypeScript
- Tailwind CSS 4
- Vite
- shadcn/ui
- VietQR API

## 📄 License

MIT License
