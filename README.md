# Hoàn Tiền Shopee V3.1

Bản nâng cấp từ V3 dành cho nhóm **HOÀN TIỀN SHOPEE - TIKTOK - LAZADA 💰💎❤**.

## Điểm mới
- Tự sinh ID Hoàn Tiền ngẫu nhiên ở lần truy cập đầu tiên.
- ID được lưu bằng localStorage + cookie, không đổi mỗi lần mở web.
- Sao chép ID, khôi phục ID cũ, tạo ID mới có cảnh báo 2 bước.
- Tracking chuẩn hóa nội bộ: `sub1=MemberID`, `sub2=C01`, `sub3=web`, `sub4/sub5` để trống.
- Hiển thị hoa hồng ước tính và hoàn dự kiến 80% tách biệt.
- Không nhúng API key vào frontend.

## Render Environment
- `ADDLIVETAG_API_KEY`
- `SHOPEE_AFFILIATE_ID`

Build: `npm install`  
Start: `npm start`

> Lưu ý: số tiền hoàn chỉ là ước tính cho đến khi hoa hồng được đối soát/duyệt. Việc dùng affiliate/cashback cần tuân thủ điều khoản chương trình áp dụng.
