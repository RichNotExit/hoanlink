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
  const keepParams = new Set(['sp_atk', 'xptdk']);

  for (const key of Array.from(u.searchParams.keys())) {
    if (!keepParams.has(key)) u.searchParams.delete(key);
  }

  return u.toString();
}

async function fetchWithTimeout(url, options = {}, ms = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'vi-VN,vi;q=0.9,en;q=0.8',
        ...(options.headers || {})
      }
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function resolveWithFetch(url) {
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    redirect: 'follow'
  });
  return response.url || url;
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getMeta(html, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escaped}["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escaped}["'][^>]*>`, 'i')
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) return decodeHtml(match[1]);
  }
  return '';
}

function titleFromUrl(url) {
  try {
    const u = new URL(url);
    const firstPath = decodeURIComponent(u.pathname.split('/').filter(Boolean)[0] || '');
    if (!firstPath) return '';
    return firstPath
      .replace(/-i\.\d+\.\d+.*$/i, '')
      .replace(/\.\d+\.\d+.*$/i, '')
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch (_) {
    return '';
  }
}

function normalizeImageUrl(imageUrl) {
  if (!imageUrl) return '';
  let value = imageUrl.trim();
  if (value.startsWith('//')) value = 'https:' + value;
  if (value.startsWith('/')) return '';
  return value;
}

function extractProductInfo(html, finalUrl) {
  let title = getMeta(html, 'og:title') || getMeta(html, 'twitter:title');
  let image = getMeta(html, 'og:image') || getMeta(html, 'twitter:image');
  let description = getMeta(html, 'og:description') || getMeta(html, 'description');

  if (!title) {
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) title = decodeHtml(titleMatch[1]);
  }

  title = decodeHtml(title)
    .replace(/\|\s*Shopee\s*Việt\s*Nam.*$/i, '')
    .replace(/\|\s*Shopee.*$/i, '')
    .replace(/^Shopee\s*[-|:]\s*/i, '')
    .trim();

  if (!title) title = titleFromUrl(finalUrl);

  return {
    title: title || 'Sản phẩm Shopee',
    image: normalizeImageUrl(image),
    description: decodeHtml(description)
  };
}

async function readProductInfo(finalUrl) {
  try {
    const response = await fetchWithTimeout(finalUrl, {
      method: 'GET',
      redirect: 'follow'
    }, 15000);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return { title: titleFromUrl(finalUrl) || 'Sản phẩm Shopee', image: '', description: '' };
    }

    const html = await response.text();
    return extractProductInfo(html, response.url || finalUrl);
  } catch (error) {
    return { title: titleFromUrl(finalUrl) || 'Sản phẩm Shopee', image: '', description: '' };
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

    return res.json({ inputUrl: input, finalUrl: cleanShopeeUrl(final.toString()) });
  } catch (error) {
    return res.status(500).json({
      error: 'Không thể chuyển link vn.shp.ee ở thời điểm này. Hãy thử lại hoặc copy link Shopee đầy đủ.'
    });
  }
});

app.get('/api/product', async (req, res) => {
  try {
    const input = normalizeUrl(req.query.url);

    if (!input || !isAllowedInputUrl(input)) {
      return res.status(400).json({ error: 'Link không hợp lệ hoặc không thuộc Shopee.' });
    }

    const finalUrlRaw = await resolveWithFetch(input);
    const final = new URL(finalUrlRaw);
    const finalHost = final.hostname.toLowerCase();

    if (!(finalHost === 'shopee.vn' || finalHost.endsWith('.shopee.vn') || finalHost === 's.shopee.vn')) {
      return res.status(400).json({ error: 'Link không trỏ về Shopee Việt Nam.' });
    }

    const finalUrl = cleanShopeeUrl(final.toString());
    const product = await readProductInfo(finalUrl);

    return res.json({
      inputUrl: input,
      finalUrl,
      product,
      commissionText: 'Theo Shopee ghi nhận'
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Không thể đọc thông tin sản phẩm lúc này. Hãy thử lại hoặc copy link Shopee đầy đủ.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Shopee affiliate link tool is running at http://localhost:${PORT}`);
});
