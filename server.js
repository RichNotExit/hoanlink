const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const ALLOWED_HOSTS = new Set([
  'vn.shp.ee',
  'shp.ee',
  'shopee.vn',
  's.shopee.vn',
  'mall.shopee.vn'
]);

function normalizeUrl(input) {
  let value = String(input || '').trim();
  if (!value) return '';
  if (!/^https?:\/\//i.test(value)) value = 'https://' + value;
  return value;
}

function isAllowedInputUrl(input) {
  try {
    const u = new URL(normalizeUrl(input));
    const host = u.hostname.toLowerCase();
    return (u.protocol === 'http:' || u.protocol === 'https:') &&
      (ALLOWED_HOSTS.has(host) || host.endsWith('.shopee.vn') || host.endsWith('.shp.ee'));
  } catch (_) {
    return false;
  }
}

function cleanShopeeUrl(finalUrl) {
  const u = new URL(finalUrl);

  // Giữ link sản phẩm, bỏ bớt tracking thừa nếu có.
  // Không bắt buộc, nhưng giúp origin_link gọn hơn.
  const keepParams = new Set([
    'sp_atk',
    'xptdk'
  ]);

  for (const key of Array.from(u.searchParams.keys())) {
    if (!keepParams.has(key)) u.searchParams.delete(key);
  }

  return u.toString();
}

async function resolveWithFetch(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    return response.url || url;
  } finally {
    clearTimeout(timeout);
  }
}

app.use(express.static(__dirname));

app.get('/api/resolve', async (req, res) => {
  try {
    const input = normalizeUrl(req.query.url);

    if (!input || !isAllowedInputUrl(input)) {
      return res.status(400).json({ error: 'Link không hợp lệ hoặc không thuộc Shopee.' });
    }

    const finalUrlRaw = await resolveWithFetch(input);
    const final = new URL(finalUrlRaw);
    const finalHost = final.hostname.toLowerCase();

    if (!(finalHost === 'shopee.vn' || finalHost.endsWith('.shopee.vn') || finalHost === 's.shopee.vn')) {
      return res.status(400).json({ error: 'Link rút gọn không trỏ về Shopee Việt Nam.' });
    }

    return res.json({
      inputUrl: input,
      finalUrl: cleanShopeeUrl(final.toString())
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Không thể chuyển link vn.shp.ee ở thời điểm này. Hãy thử lại hoặc copy link Shopee đầy đủ.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Shopee affiliate link tool is running at http://localhost:${PORT}`);
});
