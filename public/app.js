const $ = s => document.querySelector(s);
const RATE = 0.8;
const money = n => new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(Number(n||0));
const number = n => new Intl.NumberFormat('vi-VN').format(Number(n||0));

function makeMemberId(){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes=new Uint8Array(8); crypto.getRandomValues(bytes);
  return 'HP'+Array.from(bytes,b=>chars[b%chars.length]).join('');
}
function validId(v){ return /^HP[A-Z0-9]{6,12}$/.test(String(v||'').toUpperCase()); }
function setMember(v){
  member=v.toUpperCase();
  localStorage.setItem('cashbackMemberV31',member);
  document.cookie=`cashback_member=${encodeURIComponent(member)}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;
  $('#memberView').textContent=member;
}
let member=localStorage.getItem('cashbackMemberV31') || localStorage.getItem('cashbackMember');
if(!validId(member)) member=makeMemberId();
setMember(member);

const dayKey=()=>`links-${new Date().toLocaleDateString('en-CA')}`;
const renderCount=()=>$('#todayCount').textContent=`${Number(localStorage.getItem(dayKey())||0)} link`;
renderCount();

$('#copyId').onclick=async()=>{try{await navigator.clipboard.writeText(member); const b=$('#copyId'),o=b.textContent;b.textContent='✓ Đã sao chép ID';setTimeout(()=>b.textContent=o,1400)}catch{}};
$('#restoreId').onclick=()=>{
  const v=prompt('Nhập ID Hoàn Tiền cũ của bạn. Chỉ dùng ID do hệ thống đã cấp trước đó:',member);
  if(v===null)return;
  const x=v.trim().toUpperCase();
  if(!validId(x)) return alert('ID không đúng định dạng. Ví dụ: HP8K4M2Q7A');
  if(x===member) return;
  if(!confirm(`Khôi phục ID ${x}? Các link mới sẽ được ghi nhận theo ID này.`)) return;
  setMember(x);
};
$('#newId').onclick=()=>{
  if(!confirm('Chỉ tạo ID mới khi bạn thực sự không muốn dùng ID hiện tại. Lịch sử gắn với ID cũ sẽ không tự chuyển sang ID mới.')) return;
  if(!confirm('Xác nhận lần nữa: tạo ID Hoàn Tiền mới?')) return;
  setMember(makeMemberId());
};
$('#paste').onclick=async()=>{try{$('#url').value=await navigator.clipboard.readText()}catch{$('#url').focus()}};
$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText($('#afflink').value);const b=$('#copy'),o=b.textContent;b.textContent='✓ Đã sao chép';setTimeout(()=>b.textContent=o,1400)}catch{}};
$('#submit').onclick=async()=>{
  const btn=$('#submit'),err=$('#error'); err.hidden=true; btn.disabled=true; btn.textContent='⏳ ĐANG KIỂM TRA...';
  try{
    const r=await fetch('/api/convert',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:$('#url').value.trim(),member})});
    const d=await r.json(); if(!r.ok)throw new Error(d.error||'Không thể xử lý link.'); if(!d.affiliateLink)throw new Error('API chưa trả về link affiliate. Kiểm tra Affiliate ID trên Render.');
    $('#name').textContent=d.name; $('#price').textContent=money(d.price); $('#commission').textContent=money(d.commission); $('#cashback').textContent=money(d.estimatedCashback ?? d.commission*RATE); $('#rate').textContent=d.commissionRate!=null?`${(d.commissionRate*100).toFixed(2).replace('.00','')}%`:'—'; $('#rating').textContent=d.rating?`★ ${d.rating}`:''; $('#sales').textContent=d.sales?`Đã bán ${number(d.sales)}`:'';
    if(d.image){$('#image').src=d.image;$('#image').style.display='block'}else $('#image').style.display='none';
    $('#buy').href=d.affiliateLink; $('#afflink').value=d.affiliateLink; $('#trackingId').textContent=member; $('#result').hidden=false;
    const c=Number(localStorage.getItem(dayKey())||0)+1; localStorage.setItem(dayKey(),c); renderCount(); $('#result').scrollIntoView({behavior:'smooth',block:'start'});
  }catch(e){err.textContent=e.message;err.hidden=false}finally{btn.disabled=false;btn.textContent='⚡ TẠO LINK HOÀN TIỀN'}
};
