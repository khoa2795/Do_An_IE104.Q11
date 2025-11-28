# Do_An_IE104.Q11#
VHealth – Sống Khỏe (Do_An_IE104.Q11)

English and Vietnamese README. Scroll for both languages.

---

## English

### Overview
VHealth is a static, multi‑page web app for health, nutrition and community content. It ships as plain HTML/CSS/JS (no server required) and loads shared UI parts (Header, Left Nav, Footer, Chatbot) dynamically so pages stay consistent and fast.

Key features:
- Dark mode with an early theme preloader to prevent white flash.
- Client‑side auth (sessionStorage) with Login/Register modal shared across pages.
- News listing and detail pages with client search and tab filtering.
- Calories planner: per‑meal tracking, favorites, nutrient progress.
- Health info: quick profile, simple metrics, and edit flow.
- Community pages: list and create posts (mocked, localStorage based).
- Lightweight data cache for JSON and image preloading.

### Quick Start
Use the VS Code Live Server extension for the fastest local run.

Live Server (recommended):
- Install the VS Code extension "Live Server" (by Ritwick Dey).
- In VS Code, open this folder, then:
	- Right‑click `html/Mainpage.html` → "Open with Live Server"; or
	- Click the "Go Live" button (status bar) and open `http://127.0.0.1:<port>/html/Mainpage.html`.

Demo (Netlify):
- https://majestic-bubblegum-0e937a.netlify.app/html/mainpage

Note: Opening pages via `file://` can break dynamic fetches of components/data. Use Live Server or the Netlify link above.

Recommended entry pages:
- `html/Mainpage.html` (home)
- `html/Calories.html`
- `html/Health.html`
- `html/news.html` and `html/news-detail.html?id=1`
- `html/CongDong1.html` and `html/CongDong2.html`

Test account (for login modal):
- Username: `test`
- Password: `test123`
- ID: `3` (see `data/users.json`)

### Project Structure

```
assets/
	css/                 # Stylesheets (header, leftnav, pages, dark mode)
	javascript/          # All JS modules (see list below)
	images/, fonts/      # Static assets
data/                  # JSON data: users, news, calories, health, profiles
html/                  # Pages and HTML components (header/footer/leftnav)
docs/                  # Developer docs (overview and line‑by‑line)
index.html             # Root redirect / entry for hosting providers
vercel.json, netlify.toml  # Static hosting configs
```

Important HTML components (loaded dynamically):
- `html/components/header.html` via `assets/javascript/header.js`
- `html/components/LeftNavBar.html` via `assets/javascript/leftnav.js`
- `html/components/footer.html` via `assets/javascript/footer.js`
- `html/components/chatbot.html` via `assets/javascript/chatbot.js`

### JavaScript Modules (What they do)
- `theme-preload.js`: applies dark mode before CSS loads to avoid flicker.
- `header.js`: fetches header component, powers news search, dark‑mode toggle.
- `leftnav.js`: fetches left nav + login/register modals, pins sidebar on desktop, marks active menu, injects `login.js` and `login.css`.
- `login.js`: session‑based auth; validates against `data/users.json`, handles multi‑step register, updates UI and emits `auth:state-changed` events.
- `auth-check.js`: optional gate overlay for pages that require login.
- `data-cache.js`: cached JSON fetching and image preloading (localStorage + memory fallback).
- `news.js`: renders the news grid from `data/news.json`.
- `news-tabs.js`: tabbed news by category from `data/news-tabs.json`.
- `news-detail.js`: renders an article by `?id=`, plus related items and local comment thread.
- `calories-data-loader.js`: loads/enriches per‑user calories profile and targets.
- `Calories.js`: calories UI – meals, add/remove items, favorites, progress.
- `health-data-loader.js`: loads/enriches health profiles; helpers and UI updaters.
- `Health.js`: simple health flow (view ↔ edit), localStorage persistence, BMI calc.
- `CongDong1.js`: community list with paging, save, comment, share.
- `CongDong2.js`: create post (mock/local), then return to list.
- `footer.js`, `chatbot.js`, `script.js`: footer loader, draggable chatbot, home page carousels.

For a deeper, line‑by‑line explanation of how each script manipulates HTML, see:
- `docs/html-and-js-overview.md` (high‑level mapping)
- `docs/js-line-by-line.md` (step‑by‑step explanations)

### Data Files
- `data/users.json` – seed users used by login.
- `data/news.json`, `data/news-tabs.json` – articles and category tabs.
- `data/calories-data.json`, `data/health-data.json` – per‑user demo data.
- `data/user-profiles.json` – shared profile info used to enrich pages.

### Development Notes
- Components are cached in `sessionStorage` to speed up navigation.
- Auth uses `sessionStorage` (clears on tab close). App reads current user from `sessionStorage.currentUser`.
- UI respects dark mode class `dark-mode` on `html/body`.
- When adjusting header/leftnav sizes, check CSS vars: `--header-height`, `--sidebar-width`.

### Deploy
This is a static site. Popular options:
- Vercel: `vercel.json` already included. Set project as “Static”. Entry can be `/index.html` or direct HTML paths under `/html`.
- Netlify: `netlify.toml` is included. Drag‑and‑drop or CLI deploy as static.

Tip: Some hosts default to `/index.html`. We ship a root `index.html` that can redirect or link into `/html/Mainpage.html`. A live demo is available at the Netlify link above.

---

## Tiếng Việt

### Giới thiệu
VHealth là ứng dụng web tĩnh nhiều trang về sức khỏe, dinh dưỡng và cộng đồng. Dự án chỉ dùng HTML/CSS/JS (không cần backend) và nạp các thành phần dùng chung (Header, Thanh trái, Footer, Chatbot) động để đồng bộ giao diện và tối ưu hiệu năng.

Tính năng chính:
- Chế độ tối (dark mode) kèm script nạp sớm để tránh nháy nền trắng.
- Xác thực phía client (sessionStorage) với modal Đăng nhập/Đăng ký dùng chung.
- Trang Tin tức (danh sách/chi tiết) có tìm kiếm và tab lọc.
- Trang Calories: theo dõi từng bữa, món ưa thích, tiến độ dinh dưỡng.
- Trang Sức khỏe: hồ sơ nhanh, chỉ số cơ bản, luồng chỉnh sửa.
- Cộng đồng: danh sách và tạo bài (giả lập, lưu localStorage).
- Bộ cache nhẹ cho JSON và preload ảnh.

### Bắt đầu nhanh
Sử dụng tiện ích VS Code Live Server để chạy nhanh tại máy.

Live Server (khuyến nghị):
- Cài extension "Live Server" (tác giả Ritwick Dey) trong VS Code.
- Mở thư mục dự án, sau đó:
	- Nhấp phải `html/Mainpage.html` → "Open with Live Server"; hoặc
	- Bấm nút "Go Live" (thanh trạng thái) và mở `http://127.0.0.1:<port>/html/Mainpage.html`.

Demo (Netlify):
- https://majestic-bubblegum-0e937a.netlify.app/html/mainpage

Lưu ý: Nếu mở file trực tiếp bằng `file://`, việc nạp component/data động có thể lỗi. Hãy dùng Live Server hoặc link Netlify ở trên.

Trang vào nhanh:
- `html/Mainpage.html`
- `html/Calories.html`
- `html/Health.html`
- `html/news.html` và `html/news-detail.html?id=1`
- `html/CongDong1.html` và `html/CongDong2.html`

Tài khoản test (cho modal đăng nhập):
- Tên đăng nhập: `test`
- Mật khẩu: `test123`
- ID: `3` (xem `data/users.json`)

### Cấu trúc dự án
Xem nhanh:
```
assets/ (css, javascript, images, fonts)
data/   (JSON mẫu: users, news, calories, health, profiles)
html/   (các trang và component HTML)
docs/   (tài liệu cho developer)
index.html, vercel.json, netlify.toml
```

Component HTML được nạp động:
- Header: `header.js` → `html/components/header.html`
- Thanh trái: `leftnav.js` → `html/components/LeftNavBar.html`
- Footer: `footer.js` → `html/components/footer.html`
- Chatbot: `chatbot.js` → `html/components/chatbot.html`

### Các file JS chính (nhiệm vụ)
- `theme-preload.js`: áp dụng dark mode trước khi CSS tải.
- `header.js`: nạp header, tìm kiếm tin tức, bật/tắt dark mode.
- `leftnav.js`: nạp thanh trái + modal login/register, ghim sidebar desktop, đánh dấu menu đang xem, chèn `login.js`/`login.css`.
- `login.js`: đăng nhập theo `data/users.json`, đăng ký nhiều bước, lưu phiên, phát sự kiện `auth:state-changed`.
- `auth-check.js`: (tùy chọn) phủ lớp yêu cầu đăng nhập.
- `data-cache.js`: fetch JSON có cache và preload ảnh.
- `news.js`, `news-tabs.js`, `news-detail.js`: trang tin tức (danh sách, tab, chi tiết + bình luận cục bộ).
- `calories-data-loader.js`, `Calories.js`: dữ liệu và UI Calories (bữa ăn, thêm/xóa món, ưa thích, tiến độ).
- `health-data-loader.js`, `Health.js`: dữ liệu và UI sức khỏe (xem/sửa) + tính BMI.
- `CongDong1.js`, `CongDong2.js`: danh sách và tạo bài cộng đồng.
- `footer.js`, `chatbot.js`, `script.js`: footer, chatbot kéo/thả, carousel trang chủ.

Chi tiết từng dòng code và cách thao tác HTML:
- `docs/html-and-js-overview.md` (tổng quan)
- `docs/js-line-by-line.md` (giải thích theo từng khối/từng bước)

### Dữ liệu mẫu
- `data/users.json`: tài khoản mẫu dùng khi đăng nhập.
- `data/news.json`, `data/news-tabs.json`: nguồn tin và tab.
- `data/calories-data.json`, `data/health-data.json`: dữ liệu demo theo user.
- `data/user-profiles.json`: thông tin hồ sơ dùng để enrich trên trang.

### Lưu ý phát triển
- Component được cache trong `sessionStorage` để điều hướng nhanh.
- Phiên đăng nhập dùng `sessionStorage`; đọc tại `sessionStorage.currentUser`.
- Dark mode dựa trên class `dark-mode` trên `html/body`.
- Khi chỉnh chiều cao header/thanh trái, xem các biến: `--header-height`, `--sidebar-width`.

### Triển khai
Site tĩnh – gợi ý:
- Vercel: dùng `vercel.json` (Static). Trỏ vào `index.html` hoặc trực tiếp các trang trong `/html`.
- Netlify: có `netlify.toml`. Có thể kéo‑thả hoặc dùng CLI.

Mẹo: nhiều host yêu cầu `/index.html`. Dự án có sẵn `index.html` ở gốc để chuyển hướng/liên kết tới `/html/Mainpage.html`.

---
