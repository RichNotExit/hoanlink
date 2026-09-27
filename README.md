# Hoàn Tiền Shopee V4.1

V4.1 bổ sung Admin Dashboard trên nền V4/PostgreSQL.

## Environment Variables
- `ADDLIVETAG_API_KEY`
- `SHOPEE_AFFILIATE_ID`
- `DATABASE_URL`
- `ADMIN_KEY`

## Trang
- `/` — giao diện khách hàng
- `/admin.html` — Admin Dashboard
- `/api/health` — kiểm tra server/database

## Admin Dashboard
- Tổng quan thành viên, link, đơn, hoa hồng, cashback, yêu cầu rút.
- Tìm thành viên.
- Xem link gần đây.
- Thêm/cập nhật đơn theo mã đơn Shopee + Member ID.
- Tự tính cashback = 80% commission nhập vào.
- Chuyển trạng thái đơn: PENDING / APPROVED / AVAILABLE / PAID / REJECTED.
- Xử lý yêu cầu rút: REQUESTED / PROCESSING / PAID / REJECTED.

`ADMIN_KEY` chỉ được nhập tại trang admin và lưu trong `sessionStorage` của trình duyệt; không nhúng vào source.

> V4.1 vẫn là giai đoạn đối soát thủ công. Không cộng tiền từ commission ước tính. Conversion Sync tự động nên triển khai ở bước sau khi có nguồn Conversion API phù hợp.
