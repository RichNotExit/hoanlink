import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE = 'https://data.addlivetag.com/product-data/product-data.php';

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '20kb' }));
app.use(express.static('public'));
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false }));

const safeSub = (value, fallback = '') => String(value || fallback)
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd').replace(/Đ/g, 'D')
  .replace(/-/g, '_').replace(/[^a-zA-Z0-9_.]/g, '_')
  .replace(/_+/g, '_').slice(0, 60);

function isShopeeInput(value) {
  const v = String(value || '').trim();
  if (/^\d{6,20}$/.test(v)) return true;
  try {
    const u = new URL(v);
    return /(^|\.)shopee\.vn$/i.test(u.hostname) || /(^|\.)s\.shopee\.vn$/i.test(u.hostname) || /(^|\.)vn\.shp\.ee$/i.test(u.hostname);
  } catch { return false; }
}

app.post('/api/convert', async (req, res) => {
  try {
    const input = String(req.body?.url || '').trim();
    const member = safeSub(req.body?.member, 'friend');
    if (!isShopeeInput(input)) return res.status(400).json({ error: 'Vui lòng nhập link Shopee Việt Nam hoặc Item ID hợp lệ.' });

    const apiKey = process.env.ADDLIVETAG_API_KEY;
    const affiliateId = process.env.SHOPEE_AFFILIATE_ID;
    if (!apiKey || !affiliateId) return res.status(503).json({ error: 'Server chưa cấu hình ADDLIVETAG_API_KEY hoặc SHOPEE_AFFILIATE_ID.' });

    const params = new URLSearchParams();
    if (/^\d{6,20}$/.test(input)) params.set('item_id', input); else params.set('url', input);
    params.set('affid', affiliateId);
    params.set('sub1', member);
    params.set('sub2', 'hoanphi');
    params.set('sub3', 'web');

    const upstream = await fetch(`${API_BASE}?${params}`, {
      headers: { 'X-API-Key': apiKey, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    });
    const raw = await upstream.text();
    let data;
    try { data = JSON.parse(raw); } catch { throw new Error('API trả dữ liệu không hợp lệ.'); }
    if (!upstream.ok || data?.status !== 'success' || !data?.productInfo) {
      return res.status(upstream.status >= 400 ? upstream.status : 502).json({ error: data?.message || data?.error || 'Không lấy được thông tin sản phẩm.' });
    }

    const p = data.productInfo;
    const price = Number(p.price || 0);
    const commission = Number(p.commission || 0);
    const commissionRate = price > 0 ? commission / price : null;

    res.json({
      itemId: String(p.itemId || ''),
      shopId: String(p.shopId || ''),
      name: p.productName || p.name || 'Sản phẩm Shopee',
      image: p.imageUrl || p.image || p.imageUrlList?.[0] || null,
      price,
      sales: Number(p.sales || 0),
      rating: Number(p.rating || 0),
      category: p.catName || null,
      commission,
      commissionRate,
      sellerCommission: Number(p.sellerComFinal || 0),
      shopeeCommission: Number(p.shopeeComFinal || 0),
      affiliateLink: p.affLink || null,
      originalLink: p.originLink || p.productLink || null,
      member,
      dataSource: p.dataSource || data.dataSource || null,
      estimated: true
    });
  } catch (err) {
    const timeout = err?.name === 'TimeoutError';
    res.status(timeout ? 504 : 500).json({ error: timeout ? 'API phản hồi quá chậm, vui lòng thử lại.' : (err.message || 'Có lỗi xảy ra.') });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
