# Book Manager (Node.js + Express + MySQL + Redis)

Hệ thống quản lý người dùng & sách:

- Đăng ký → Xác thực OTP qua email (SMTP) → Đăng nhập (Email/Password + Google OAuth).
- Session lưu trong Redis (express-session + connect-redis).
- Phân quyền: ADMIN quản lý sách (CRUD mềm) + lọc theo giá.
- Frontend tĩnh (HTML + Bootstrap 5 + CSS + JS) – responsive, tách file.
- **Upload ảnh sách lên Cloudinary** (multipart/form-data) và lưu URL vào DB.
- Root `/` **redirect** đến `/login.html`.
- Thêm sách: **chọn danh mục theo tên** (select từ API `/api/categories`), gửi `category_id` để lưu vào bảng `books`.

---

## 1) Công nghệ

- **Backend**: Node.js (Express 5), express-validator, bcrypt, nodemailer (SMTP), passport + passport-google-oauth20  
- **DB**: MySQL (mysql2/promise)  
- **Cache/Session**: Redis (ioredis, connect-redis)  
- **Upload**: Cloudinary SDK v2 + Multer (memoryStorage)  
- **Test**: Jest + SuperTest (OTP flow)  
- **Frontend**: HTML + Bootstrap 5 + JS (fetch)

Thư mục chính:

```
src/
  app.js, server.js
  config/
    env.js, db.js, redis.js, mailer.js, session.js, passport.js
  middlewares/
    asyncHandler.js, validate.js, error.js, authz.js
  models/
    user.model.js, book.model.js, category.model.js
  services/
    auth.service.js, otp.service.js, login.service.js, social.service.js, book.service.js
  controllers/
    auth.controller.js, book.controller.js, category.controller.js
  routes/
    auth.routes.js, book.routes.js, category.routes.js
  tests/ (Jest)
public/
  css/styles.css
  js/api.js, signup.js, verify-otp.js, login.js, admin.js
  signup.html, verify-otp.html, login.html, admin.html
```

---

## 2) Yêu cầu hệ thống

- Node.js ≥ 18 (khuyến nghị 20)  
- MySQL 8.x  
- Redis 6+  
- SMTP (Gmail/Mailgun/SendGrid…) để gửi OTP  
- (Tuỳ chọn) Google OAuth 2.0 credentials  
- Cloudinary account (Cloud name, API Key, API Secret)

---

## 3) Cài đặt

```bash
npm i
```

Tạo DB và bảng theo DDL đã cung cấp (users, profiles, categories, books).

### `.env` mẫu

```env
# Server
PORT=3000
NODE_ENV=development

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DB=book_manager

# Redis
REDIS_URL=redis://127.0.0.1:6379

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM="BookManager <no-reply@bookmanager.local>"

# OTP
OTP_TTL_SECONDS=300
OTP_LENGTH=6
OTP_MAX_ATTEMPTS=4

# Session
SESSION_SECRET=supersecret_change_me
SESSION_NAME=sid
SESSION_MAX_AGE_MS=604800000
COOKIE_SECURE=false

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
SUCCESS_REDIRECT_URL=/admin.html   # login Google xong chuyển về trang quản trị

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
CLOUDINARY_FOLDER=book-manager/books
```
## 4) Luồng chạy
Đăng ký: 
- Kiểm tra dữ liệu hợp lệ
- Kiểm tra email tồn tại hay chưa nếu chưa tạo mới user ở trạng thái chưa ACTIVE
- Gửi OTP qua email vừa đăng ký
- Người dùng nhập OTP đúng thì ACTIVE tài khoản, sai báo lỗi , OTP hết hạn mới được yêu cầu OTP mới
- Người dùng chưa xác thực OTP nhưng chọn đăng nhập bằng google với email đó thì tài khoản tự chuyển về ACTIVE vì email hợp lệ
- Mọi tài khoản đăng ký đều được xét mặc định role = 'ADMIN' thuận lợi test CRUD sản phẩm
Đăng nhập:
- Dữ liệu hợp lệ mới submit
- Chưa ACTIVE báo lỗi , sai mật khẩu báo lỗi 
- Đăng nhập thành công tạo session phiên đăng nhập
- Đăng nhập bằng google kiểm tra email tồn tại chưa nếu tồn tại tạo sesson, lưu google_id đăng nhập thành công
- Đăng nhập bằng google kiểm tra email tồn tại chưa nếu chưa tồn tại tạo mới user, sesson, lưu google_id đăng nhập thành công
Đăng xuất:
- Xóa session
Quản lý: Chỉ có role là admin mới vào được trang này và thao tác gồm:
- Hiển thị danh sách sách gồm cả đã và chưa xóa
- Thêm sách 
- Tìm kiếm theo khoảng giá min, max nếu min max không có giá trị hiển thị tất cả
- Xóa mềm sách đổi deleted = tru và chỉ nhưng sách chưa xóa mới xóa được
- Khôi phục sách chỉ những sách bị xóa mơi có thể khôi phục 
---

## 5) Chạy dự án

```bash
npm run dev
# http://localhost:3000  -> redirect về /login.html
```

## 6) Danh mục (select theo tên)

- API: `GET /api/categories` → `{ items: [{id, name}, ...] }`
- Frontend nạp danh mục để hiển thị `<select>`, khi submit gửi `category_id` (ID) lên backend.  
- Bảng danh sách hiển thị **tên** danh mục (map từ `{id, name}` đã nạp).

---

## 7) Auth & Điều hướng

- `/` redirect `/login.html`
- Email/Password: `POST /api/auth/login` (có `rememberEmail` → cookie `remember_email`)
- Google OAuth:
  - `GET /api/auth/google?redirect=/admin.html`
  - `GET /api/auth/google/callback` → server **`res.redirect('/admin.html')`** (hoặc theo `SUCCESS_REDIRECT_URL`)

---

## 8) API tóm tắt

**Auth**
- `POST /api/auth/signup` – đăng ký → INACTIVE + gửi OTP  
- `POST /api/auth/verify-otp` – xác minh OTP → ACTIVE  
- `POST /api/auth/resend-otp` – gửi lại OTP khi hết hạn  
- `POST /api/auth/login` – đăng nhập  
- `GET  /api/auth/me` – thông tin phiên  
- `GET  /api/auth/logout` – đăng xuất  
- `GET  /api/auth/google` – bắt đầu Google OAuth  
- `GET  /api/auth/google/callback` – callback, auto-activate nếu INACTIVE

**Admin – Sách** (yêu cầu ADMIN)
- `GET  /api/books?minPrice=&maxPrice=` – liệt kê (kể cả soft-deleted)
- `GET  /api/books/:id` – chi tiết
- `POST /api/books` – thêm mới
- `DELETE /api/books/:id` – xóa mềm
- `PATCH /api/books/:id/restore` – khôi phục

**Admin – Danh mục** (yêu cầu ADMIN)
- `GET  /api/categories` – danh mục `{id, name}`


## 9) Test

```bash

npm test

```

- Đã gồm test cho OTP flow (Jest + SuperTest + ioredis-mock).
- Gồm các trường hợp: OTP đúng , OTP sai, OTP hết hạn, gửi lại OTP

---
## 10) Database

CREATE DATABASE IF NOT EXISTS book_manager;
USE book_manager;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    role ENUM('ADMIN','USER') DEFAULT 'ADMIN',
    google_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status enum('INACTIVE','ACTIVE') default 'INACTIVE',
    deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    birth_date DATE ,
    phone VARCHAR(20) UNIQUE,
    address VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) unique NOT NULL
);

CREATE TABLE books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    stock INT NOT NULL,
    sold INT NOT NULL,
    category_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    deleted BOOLEAN DEFAULT FALSE
);


-- Tăng tốc lọc theo khoảng thời gian tạo
CREATE INDEX idx_users_created_at ON users (created_at);

-- Tối ưu join infors → users
CREATE INDEX idx_profiles_user_id ON profiles (user_id);
-- Thêm users
INSERT INTO users (email, password, name, role, google_id, status, deleted) VALUES
('admin@gmail.com', '$2a$10$abcdef1234567890abcdef1234567890abcdef1234567890abcdef12', 'Admin User', 'ADMIN', NULL, 'ACTIVE', FALSE),
('user1@gmail.com', '$2a$10$abcdef1234567890abcdef1234567890abcdef1234567890abcdef12', 'Nguyễn Văn A', 'USER', NULL, 'ACTIVE', FALSE),
('user2@gmail.com', NULL, 'Trần Thị B', 'USER', 'google-123456', 'ACTIVE', FALSE),
('user3@gmail.com', '$2a$10$abcdef1234567890abcdef1234567890abcdef1234567890abcdef12', 'Lê Văn C', 'USER', NULL, 'INACTIVE', FALSE);

-- Thêm profiles
INSERT INTO profiles (birth_date, phone, address, user_id) VALUES
('1990-05-20', '0901234567', 'Hà Nội', 1),
('1995-08-12', '0912345678', 'TP. Hồ Chí Minh', 2),
('1998-02-25', '0923456789', 'Đà Nẵng', 3),
('2000-11-01', '0934567890', 'Cần Thơ', 4);

INSERT INTO categories (name) VALUES
('Tiểu thuyết'),
('Khoa học'),
('Lập trình'),
('Kinh doanh'),
('Tâm lý - Kỹ năng sống');

INSERT INTO books (title, author, price, image, description, stock, sold, category_id) VALUES
('Đắc Nhân Tâm', 'Dale Carnegie', 85000, 'dac_nhan_tam.jpg', 'Cuốn sách kinh điển về nghệ thuật giao tiếp và thuyết phục.', 100, 20, 5),
('Nhà Giả Kim', 'Paulo Coelho', 99000, 'nha_gia_kim.jpg', 'Một câu chuyện triết lý về hành trình theo đuổi ước mơ.', 80, 30, 1),
('Từ Tốt Đến Vĩ Đại', 'Jim Collins', 120000, 'tu_tot_den_vi_dai.jpg', 'Phân tích vì sao một số công ty phát triển bền vững và vĩ đại.', 50, 15, 4),
('Clean Code', 'Robert C. Martin', 350000, 'clean_code.jpg', 'Hướng dẫn lập trình viết code sạch, dễ bảo trì.', 40, 10, 3),
('Sapiens: Lược sử loài người', 'Yuval Noah Harari', 180000, 'sapiens.jpg', 'Khám phá lịch sử tiến hóa và phát triển của nhân loại.', 60, 25, 2),
('Atomic Habits', 'James Clear', 150000, 'atomic_habits.jpg', 'Chiến lược thay đổi thói quen nhỏ để đạt kết quả lớn.', 70, 12, 5),
('Dế Mèn Phiêu Lưu Ký', 'Tô Hoài', 60000, 'de_men.jpg', 'Tác phẩm văn học thiếu nhi nổi tiếng của Việt Nam.', 90, 40, 1),
('Head First Java', 'Kathy Sierra, Bert Bates', 320000, 'head_first_java.jpg', 'Sách nhập môn lập trình Java cho người mới.', 30, 5, 3);

