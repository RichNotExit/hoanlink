# HoanLink V4.2 — Database-first + Wallet Ledger

Nâng cấp từ V4.1, giữ nguyên Render Postgres hiện tại.

## Điểm mới
- PostgreSQL là nguồn duy nhất cho bộ đếm link và lịch sử link. Không còn dùng localStorage để đếm.
- `wallet_transactions` là sổ cái số dư: CREDIT/DEBIT, không chỉnh số dư trực tiếp.
- Khi đơn chuyển sang `AVAILABLE`, cashback được CREDIT đúng một lần.
- Khi yêu cầu rút chuyển `PAID`, số tiền được DEBIT đúng một lần.
- Nếu đơn đã AVAILABLE bị chuyển ngược trạng thái, hệ thống tạo giao dịch reversal thay vì sửa/xóa lịch sử.
- Admin bấm Member ID để xem chi tiết: đơn, ledger, link gần đây.
- `/api/health` trả `version: 4.2`.

## Deploy
Upload đè toàn bộ source lên repo đang dùng. Giữ nguyên 4 biến Render:
`ADDLIVETAG_API_KEY`, `SHOPEE_AFFILIATE_ID`, `DATABASE_URL`, `ADMIN_KEY`.
Server tự migration bảng `wallet_transactions` khi khởi động.

## Kiểm tra
1. `/api/health` -> `{ "ok": true, "database": true, "version": "4.2" }`
2. Tạo 1 link mới -> counter hôm nay và Link gần đây cùng tăng từ PostgreSQL.
3. Admin -> Thành viên -> bấm Member ID để xem chi tiết.
4. Tạo đơn PENDING/APPROVED: chưa cộng số dư.
5. Chuyển AVAILABLE: cashback 80% được cộng vào ledger một lần.
6. Yêu cầu rút và admin chuyển PAID: ledger trừ đúng số tiền.

> V4.2 vẫn đối soát đơn thủ công. Không cộng tiền thật từ hoa hồng ước tính. Conversion sync nên nối sau khi luồng ledger đã được test ổn định.
