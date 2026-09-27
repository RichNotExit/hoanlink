const $ = (s) => document.querySelector(s);
const money = (n) => new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(Number(n||0));
const number = (n) => new Intl.NumberFormat('vi-VN').format(Number(n||0));

$('#paste').onclick = async () => { try { $('#url').value = await navigator.clipboard.readText(); } catch { $('#url').focus(); } };
$('#copy').onclick = async () => { await navigator.clipboard.writeText($('#afflink').value); const b=$('#copy'); const old=b.textContent;b.textContent='Đã sao chép ✓';setTimeout(()=>b.textContent=old,1400); };

$('#form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn=$('#submit'), err=$('#error'); err.hidden=true; btn.disabled=true; btn.querySelector('span').textContent='Đang kiểm tra sản phẩm...';
  try {
    const r=await fetch('/api/convert',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:$('#url').value,member:$('#member').value})});
    const d=await r.json(); if(!r.ok) throw new Error(d.error||'Không thể xử lý link.');
    $('#name').textContent=d.name; $('#category').textContent=d.category||'Sản phẩm Shopee'; $('#price').textContent=money(d.price);
    $('#commission').textContent=money(d.commission); $('#rate').textContent=d.commissionRate!=null?`≈ ${(d.commissionRate*100).toFixed(2)}%`:'—';
    $('#sellerCom').textContent=money(d.sellerCommission); $('#shopeeCom').textContent=money(d.shopeeCommission);
    $('#rating').textContent=d.rating?`★ ${d.rating}`:''; $('#sales').textContent=d.sales?`Đã bán ${number(d.sales)}`:'';
    if(d.image){$('#image').src=d.image;$('#imageWrap').hidden=false}else{$('#imageWrap').hidden=true}
    if(!d.affiliateLink) throw new Error('API chưa trả về link affiliate. Kiểm tra Affiliate ID trên server.');
    $('#buy').href=d.affiliateLink; $('#afflink').value=d.affiliateLink; $('#result').hidden=false; $('#result').scrollIntoView({behavior:'smooth',block:'start'});
  } catch(ex) { err.textContent=ex.message;err.hidden=false; }
  finally { btn.disabled=false;btn.querySelector('span').textContent='Tạo link & kiểm tra hoa hồng'; }
});
