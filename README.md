# 🛍️ Web Bán Hàng

Ứng dụng bán hàng trực tuyến full-stack sử dụng **Spring Boot** (Backend) + **React** (Frontend), với đầy đủ tính năng quản lý sản phẩm, giỏ hàng và thanh toán.

---

## 🛠️ Công nghệ sử dụng

| Layer | Công nghệ |
|-------|-----------|
| Backend | Spring Boot 3.4.3, Spring Data JPA, Hibernate |
| Database | MySQL 8.x |
| Frontend | React + Vite, Axios |
| Build tool | Maven 3.x |
| Lưu trữ ảnh | Local Storage (thư mục `uploads/`) |

---

## 📁 Cấu trúc dự án

```
web-ban-hang/
├── src/main/java/com/example/webbanhang/
│   ├── config/
│   │   └── WebMvcConfig.java          # Cấu hình serve static file /uploads/
│   ├── controller/
│   │   ├── CategoryController.java    # API danh mục
│   │   ├── ProductController.java     # API sản phẩm + upload ảnh
│   │   └── CartController.java        # API giỏ hàng
│   ├── entity/
│   │   ├── Category.java              # Danh mục sản phẩm
│   │   ├── Product.java               # Sản phẩm
│   │   ├── ProductImage.java          # Ảnh sản phẩm (tối đa 4)
│   │   ├── Cart.java                  # Giỏ hàng
│   │   └── CartItem.java              # Item trong giỏ
│   ├── repository/                    # JPA Repositories
│   ├── service/
│   │   ├── CategoryService.java
│   │   ├── ProductService.java
│   │   ├── CartService.java
│   │   └── FileStorageService.java    # Lưu file ảnh
│   └── WebBanHangApplication.java
├── src/main/resources/
│   └── application.properties
├── frontend/                          # React app (Vite)
│   └── src/
│       ├── api/api.js                 # Axios API calls
│       ├── context/CartContext.jsx    # Quản lý state giỏ hàng
│       └── components/
│           ├── ProductCard.jsx        # Card sản phẩm
│           ├── ProductList.jsx        # Lưới sản phẩm
│           ├── ProductDetailModal.jsx # Modal chi tiết + gallery ảnh
│           ├── CategoryFilter.jsx     # Lọc theo danh mục
│           ├── CartDrawer.jsx         # Giỏ hàng slide-in
│           └── CheckoutPage.jsx       # Trang thanh toán
├── uploads/                           # Ảnh sản phẩm (không commit)
└── auto-commit.ps1                    # Script tự động commit lên GitHub
```

---

## ⚙️ Cài đặt & Chạy

### Yêu cầu
- Java 17+
- Maven 3.6+
- MySQL 8+
- Node.js 18+

### 1. Tạo database MySQL
```sql
CREATE DATABASE web_ban_hang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Cấu hình kết nối DB
Chỉnh `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/web_ban_hang
spring.datasource.username=root
spring.datasource.password=root
```

### 3. Chạy Backend
```bash
mvn spring-boot:run
```
> Backend chạy tại: http://localhost:8080

### 4. Chạy Frontend
```bash
cd frontend
npm install
npm run dev
```
> Frontend chạy tại: http://localhost:5173 (hoặc 5174)

---

## 🔌 API Endpoints

### Category (Danh mục)
| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/api/categories` | Lấy tất cả danh mục |
| POST | `/api/categories` | Tạo danh mục mới |
| PUT | `/api/categories/{id}` | Cập nhật danh mục |
| DELETE | `/api/categories/{id}` | Xóa danh mục |

### Product (Sản phẩm)
| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/api/products` | Lấy tất cả sản phẩm |
| GET | `/api/products/{id}` | Lấy sản phẩm theo ID |
| GET | `/api/products/category/{categoryId}` | Lọc theo danh mục |
| GET | `/api/products/search?keyword=...` | Tìm kiếm sản phẩm |
| POST | `/api/products` | Tạo sản phẩm mới |
| PUT | `/api/products/{id}` | Cập nhật sản phẩm |
| DELETE | `/api/products/{id}` | Xóa sản phẩm |
| POST | `/api/products/{id}/upload-image` | Upload 1 ảnh |
| POST | `/api/products/{id}/upload-images` | Upload tối đa 4 ảnh |

### Cart (Giỏ hàng)
| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/api/cart` | Tạo giỏ hàng mới |
| GET | `/api/cart/{cartId}` | Lấy giỏ hàng |
| POST | `/api/cart/{cartId}/items` | Thêm sản phẩm vào giỏ |
| PUT | `/api/cart/{cartId}/items/{itemId}` | Cập nhật số lượng |
| DELETE | `/api/cart/{cartId}/items/{itemId}` | Xóa 1 sản phẩm |
| DELETE | `/api/cart/{cartId}` | Xóa toàn bộ giỏ |

---

## 📸 Upload ảnh sản phẩm (Postman)

Upload **tối đa 4 ảnh**, ảnh đầu tiên là ảnh chính:

```
POST http://localhost:8080/api/products/1/upload-images
Body: form-data
  files → [file] ảnh1.jpg   ← ảnh chính (thumbnail)
  files → [file] ảnh2.jpg
  files → [file] ảnh3.jpg
  files → [file] ảnh4.jpg
```

---

## ✨ Tính năng Frontend

- 🔍 **Tìm kiếm** sản phẩm theo tên
- 🏷️ **Lọc** sản phẩm theo danh mục
- 🖼️ **Gallery ảnh** trong trang chi tiết (zoom fullscreen, chuyển thumbnail)
- 🛒 **Giỏ hàng** slide-in với chỉnh số lượng realtime
- ⚡ **Mua ngay** → chuyển thẳng sang trang thanh toán
- 📦 **Giới hạn số lượng** không vượt quá tồn kho
- 💳 **Trang thanh toán** với bảng đơn hàng chi tiết
- 🔄 **Tiếp tục mua sắm** từ trang thanh toán (giỏ hàng được giữ nguyên)
- 💾 **Giỏ hàng lưu bền vững** qua `localStorage` (cartId)
- 🌙 **Dark mode** theme Catppuccin

---

## 🗄️ Database Schema

```
categories
  id, name

products
  id, name, description, price, quantity, image_url, category_id, created_at, updated_at

product_images
  id, product_id, image_url, sort_order

carts
  id, created_at

cart_items
  id, cart_id, product_id, quantity
```

---

## 🤖 Auto-Commit

Script theo dõi thay đổi và tự động push lên GitHub sau 5 giây:

```powershell
.\auto-commit.ps1
```

---

## 👨‍💻 Tác giả

**Thiều Hoàng Việt** – [github.com/thieuhoangviet](https://github.com/thieuhoangviet)
