BẢN FULL - TOOL TẠO LINK SHOPEE AFFILIATE CÓ XỬ LÝ vn.shp.ee

1) File bên trong
- index.html: giao diện web cho khách dán link và bấm tạo link hoàn tiền.
- server.js: backend để bung link rút gọn vn.shp.ee thành link Shopee đầy đủ.
- package.json: cấu hình Node.js để chạy server.

2) Vì sao phải có server.js?
Link dạng https://vn.shp.ee/... là link rút gọn/redirect. Trình duyệt mở file HTML tĩnh thường không lấy được link đích cuối cùng do CORS/redirect. Vì vậy cần backend server.js xử lý.

3) Cách chạy thử trên máy tính
Yêu cầu: cài Node.js bản 18 trở lên.

Mở terminal/cmd tại thư mục chứa code và chạy:

npm install
npm start

Sau đó mở trình duyệt vào:

http://localhost:3000

4) Cách dùng
- Dán link shopee.vn hoặc vn.shp.ee vào ô.
- Bấm Tạo link hoàn tiền.
- Nếu là vn.shp.ee, hệ thống sẽ tự bung link rồi tạo link Aff.
- Link Aff tạo ra có dạng:
https://s.shopee.vn/an_redir?origin_link=...&affiliate_id=17348250401&sub_id=traffic_web

5) Cần sửa thông tin ở đâu?
Mở index.html và sửa phần CẤU HÌNH:

const affiliateID = "17348250401";
const subID = "traffic_web";
const linkGoogleForm = "...";
const linkGoogleSheet = "...";

6) Lưu ý khi đưa lên hosting
Hosting phải hỗ trợ Node.js/Express. Nếu chỉ upload index.html lên Google Sites, Blogger, GitHub Pages hoặc hosting tĩnh thì chức năng vn.shp.ee sẽ không hoạt động đầy đủ.
