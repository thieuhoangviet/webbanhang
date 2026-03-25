# Web Bán Hàng

Dự án web bán hàng xây dựng bằng Spring Boot + MySQL.

## Công nghệ sử dụng
- Java 17
- Spring Boot 3.4.3
- Spring Data JPA
- MySQL
- Maven
- Lombok

## Cài đặt

### Yêu cầu
- JDK 17+
- Maven 3.8+
- MySQL 8.0+

### Bước 1: Tạo database
```sql
CREATE DATABASE web_ban_hang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Bước 2: Cấu hình database
Mở `src/main/resources/application.properties` và cập nhật:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Bước 3: Chạy ứng dụng
```bash
mvn spring-boot:run
```

Ứng dụng sẽ chạy tại: http://localhost:8080

## API Endpoints

### Products
| Method | URL | Mô tả |
|--------|-----|--------|
| GET | /api/products | Lấy tất cả sản phẩm |
| GET | /api/products/{id} | Lấy sản phẩm theo id |
| GET | /api/products/search?keyword= | Tìm kiếm sản phẩm |
| POST | /api/products | Thêm sản phẩm mới |
| PUT | /api/products/{id} | Cập nhật sản phẩm |
| DELETE | /api/products/{id} | Xóa sản phẩm |

### Categories
| Method | URL | Mô tả |
|--------|-----|--------|
| GET | /api/categories | Lấy tất cả danh mục |
| GET | /api/categories/{id} | Lấy danh mục theo id |
| POST | /api/categories | Thêm danh mục mới |
| PUT | /api/categories/{id} | Cập nhật danh mục |
| DELETE | /api/categories/{id} | Xóa danh mục |
