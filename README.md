# AnimeVietsub AdBlock (Chrome MV3 + Tampermonkey)

## Mục đích

Tiện ích mở rộng và script Tampermonkey giúp **giảm quảng cáo tĩnh**, **hạn chế popup / chuyển tab**, và **xử lý overlay pause-ad** trên các trang có hostname dạng `animevietsub.*`, cùng logic trong iframe player `storage.googleapiscdn.com` khi được inject.

## Cấu trúc nguồn (quan trọng)

| File / thư mục | Vai trò |
|----------------|---------|
| `src/adblock-core.js` | **Nguồn logic duy nhất** — sửa file này rồi build. |
| `src/tampermonkey-header.txt` | Khối metadata `==UserScript==` cho Tampermonkey. |
| `scripts/build.mjs` | Ghép core + header → `content.js`, `tampermonkey.js`. |
| `content.js` / `tampermonkey.js` | **File sinh ra** (có dòng comment “Generated…” ở đầu `content.js`). |
| `page-world-hook.js` | Chạy trong **MAIN world** (load qua `src`), noop `open` / `location` + vô hiệu popunder globals — tránh CSP chặn inline trên site strict. |
| `manifest.json` | MV3: `content_scripts`, `web_accessible_resources`, icon `src/faviconV2.png`. |
| `ads.js` | Bản tham chiếu logic popunder trên site (không load trong extension). |

## Build

```bash
npm run build
```

Sau đó reload extension trong `chrome://extensions` (hoặc Brave tương đương). Cập nhật Tampermonkey: dán/ghi đè nội dung `tampermonkey.js` đã build.

## Tính năng tóm tắt (extension)

- Lọc domain `animevietsub.*` trước khi chạy logic nặng.
- Ẩn / gỡ node theo danh sách selector; `MutationObserver` + debounce; tránh xóa nhầm iframe player (`mustNotRemove`).
- Inject **external** `page-world-hook.js` (không inline) để tương thích CSP.
- Nhánh **player** (`storage.googleapiscdn.com`): chặn nút “Đóng quảng cáo” lừa, pipeline ẩn overlay pause-ad, nút “Tiếp tục”, lắng nghe `pause` / burst poll.

## Tampermonkey

- Header trong `src/tampermonkey-header.txt` (`@grant none`).
- Cùng core với extension; sau khi sửa core nhớ `npm run build` và cập nhật script trong TM.

## Ghi chú

- Cursor / Simple Browser **không** tự load extension unpacked; thử trên Chrome/Brave đã bật extension.
- Một số site đổi DOM thường xuyên — nếu overlay pause đổi cấu trúc, có thể cần điều chỉnh thêm trong `src/adblock-core.js` (hàm player).
