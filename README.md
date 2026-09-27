# Shopee Hoàn Phí — Product + Commission + Affiliate Link

Web Node.js/Express dành cho nhóm bạn bè: dán link Shopee hoặc Item ID, lấy thông tin sản phẩm + hoa hồng dự kiến từ AddLiveTag Product Data API và trả link affiliate chuẩn `an_redir`.

## Tính năng
- Dán link Shopee đầy đủ, link rút gọn hoặc Item ID.
- Hiển thị tên, ảnh (nếu API trả), giá, rating, lượt bán, danh mục.
- Hiển thị tổng hoa hồng dự kiến, seller commission, Shopee commission.
- Tạo `affLink` bằng Affiliate ID của bạn.
- Tracking thành viên qua `sub1`; `sub2=hoanphi`, `sub3=web`.
- API key và Affiliate ID chỉ nằm ở backend / Render Environment Variables.
- Rate limit backend 60 request/phút/IP.

## Chạy local
1. `npm install`
2. Thiết lập biến môi trường `ADDLIVETAG_API_KEY` và `SHOPEE_AFFILIATE_ID`.
3. `npm start`
4. Mở http://localhost:3000

## Deploy Render
- Push thư mục này lên GitHub.
- Render > New > Blueprint hoặc Web Service.
- Build: `npm install`
- Start: `npm start`
- Thêm Environment Variables:
  - `ADDLIVETAG_API_KEY`: API key mới của bạn.
  - `SHOPEE_AFFILIATE_ID`: Affiliate ID Shopee của bạn.

## Lưu ý bảo mật
API key từng được gửi trong chat không được ghi vào source. Nên rotate key và chỉ đặt key mới trong Environment Variables.

## Lưu ý dữ liệu
Hoa hồng hiển thị là ước tính tại thời điểm tra cứu, không phải cam kết thanh toán. Muốn làm hệ thống hoàn tiền thật cần thêm Conversion/Validation Report + database + trạng thái đối soát/rút tiền.
