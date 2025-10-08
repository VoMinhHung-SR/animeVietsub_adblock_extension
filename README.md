# 🧩 AnimeVietsub AdBlock Extension v2.0

## 🔰 Mục đích
Tiện ích mở rộng trình duyệt (Chrome Extension) giúp **ẩn quảng cáo tĩnh**, **chặn popup chuyển trang** và **ngăn hành vi click lừa đảo** từ các trang xem phim `animevietsub.*`.

---

## 🆕 Version 2.0 - Cải tiến chính

### 🌐 **Mở rộng phạm vi**
- **Trước:** Chỉ hoạt động trên `animevietsub.lol`
- **Sau:** Hỗ trợ **tất cả domain** animevietsub (`animevietsub.tv`, `animevietsub.net`, etc.)

### ⚡ **Tối ưu hiệu suất**
- Kiểm tra domain trước khi thực thi → giảm overhead
- Code structure cải thiện với IIFE wrapper
- Early return cho các trang không liên quan

### 🏗️ **Kiến trúc mới**
- Wrapping code trong `(function() { 'use strict'; ... })()`
- Domain validation thông minh với regex pattern
- Manifest v3 với permissions tối ưu

---

## 🧪 Tính năng chính

- ✅ Tự động ẩn các phần tử quảng cáo (`div`, `iframe`, `banner`, ...)
- ✅ Theo dõi DOM động và ẩn quảng cáo render trễ
- ✅ Chặn popup mở tab mới (`window.open`)
- ✅ Ngăn script như `createPopupAndRedirect()` bị gọi
- ✅ Vô hiệu hóa `addEventListener` nếu chứa hành vi redirect
- ✅ Cookie-based popup protection
- ✅ MutationObserver với debounce tối ưu

---

## 📂 Cấu trúc file

```bash
HIDE_ADS_EXTENSION/
├── manifest.json    # Manifest v3 config
├── content.js       # Main ad-blocking logic
└── README.md        # Documentation