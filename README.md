# Hoàn Tiền Shopee V4.0

V4 thêm PostgreSQL để Member ID, link đã tạo, đơn hàng, hoa hồng và yêu cầu rút tiền có thể tồn tại phía server.

## Render Environment
- `ADDLIVETAG_API_KEY`
- `SHOPEE_AFFILIATE_ID`
- `DATABASE_URL` (Internal Database URL của Render Postgres)
- `ADMIN_KEY` (chuỗi bí mật dài, chỉ admin biết)

## Triển khai
1. Tạo Render PostgreSQL.
2. Copy **Internal Database URL** vào Environment của Web Service dưới tên `DATABASE_URL`.
3. Thêm `ADMIN_KEY` bằng chuỗi ngẫu nhiên dài.
4. Upload source lên GitHub; Render deploy lại.
5. Mở `/api/health`; kết quả nên có `{"ok":true,"database":true}`.

Schema được server tự tạo lần đầu: `members`, `links`, `orders`, `withdrawals`.

## V4.0 vs V4.1
V4.0 chưa tự đồng bộ conversion Shopee. Admin có API nhập/cập nhật order sau đối soát. Không cộng số dư từ hoa hồng *ước tính* của Product API. V4.1 sẽ nối nguồn conversion/validation phù hợp để tự động map order -> member -> commission -> cashback.

## Admin API tối thiểu
Header: `x-admin-key: <ADMIN_KEY>`
- `GET /api/admin/summary`
- `POST /api/admin/orders` body ví dụ: `{"member":"HPXXXXXXXX","orderId":"ORDER123","amount":100000,"commission":5000,"status":"AVAILABLE"}`

Các trạng thái: `PENDING`, `APPROVED`, `AVAILABLE`, `WITHDRAW_REQUESTED`, `PAID`, `REJECTED`.

> Không commit `.env` hoặc secret lên GitHub.
