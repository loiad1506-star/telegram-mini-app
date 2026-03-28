import { useState, useEffect } from 'react';

function App() {
const [activeTab, setActiveTab] = useState('home');
const [userId, setUserId] = useState('');
const [userProfile, setUserProfile] = useState({
name: 'Đang tải...',
username: '',
photoUrl: ''
});
const [userData, setUserData] = useState<any>({});
const [referrals, setReferrals] = useState(0);
const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

const BACKEND_URL = 'https://swc-bot-brain.onrender.com';
const GROUP_ZALO_LINK = "https://zalo.me/g/yeiaea989";
const WEBINAR_LINK = "https://launch.swc.capital/broadcast_31_vi";
const SWC_PASS_WEB = "https://swcpass.vn";
const ACTIVATE_URL = "https://auth.swcfield.com/en/recover-password";
const VIDEO_MOBILE = "https://youtu.be/SEB7RJrutxg";
const VIDEO_PC = "https://www.youtube.com/watch?v=gy_sxh9WCCM";
const SWC_FIELD_WEB = "https://swcfield.com/en";

const theme = {
bg: '#0F0F0F',
cardBg: '#1C1C1E',
gold: '#F4D03F',
textLight: '#FFFFFF',
textDim: '#8E8E93',
border: '#333333',
green: '#34C759',
red: '#FF3B30',
blue: '#5E92F3',
premium: '#E0B0FF'
};

// ==========================================
// ĐẾM NGƯỢC THỜI GIAN THẬT
// ==========================================
useEffect(() => {
const deadline = new Date('2026-03-31T23:59:00+07:00').getTime();
const timer = setInterval(() => {
const now = new Date().getTime();
const diff = deadline - now;
if (diff <= 0) {
setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
clearInterval(timer);
return;
}
setCountdown({
days: Math.floor(diff / (1000 * 60 * 60 * 24)),
hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
seconds: Math.floor((diff % (1000 * 60)) / 1000)
});
}, 1000);
return () => clearInterval(timer);
}, []);

// ==========================================
// LẤY DỮ LIỆU USER TỪ BACKEND
// ==========================================
const fetchUserData = (uid: string) => {
fetch(`${BACKEND_URL}/api/user?id=${uid}`)
.then(res => res.json())
.then(data => {
setReferrals(data.referralCount || 0);
setUserData(data);
})
.catch(err => console.error("Lỗi kết nối Backend:", err));
};

useEffect(() => {
const tg = (window as any).Telegram?.WebApp;
if (tg) {
tg.ready();
tg.expand();
const user = tg.initDataUnsafe?.user;
if (user) {
const currentUid = user.id.toString();
setUserId(currentUid);
setUserProfile({
name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
username: user.username ? `@${user.username}` : '@nguoidung',
photoUrl: user.photo_url || ''
});
fetchUserData(currentUid);
}
}
}, []);

// ==========================================
// HÀM TIỆN ÍCH
// ==========================================
const getMilitaryRank = (count: number) => {
if (count >= 500) return "Đại Tướng 🌟🌟🌟🌟";
if (count >= 350) return "Thượng Tướng 🌟🌟🌟";
if (count >= 200) return "Trung Tướng 🌟🌟";
if (count >= 120) return "Thiếu Tướng 🌟";
if (count >= 80) return "Đại Tá 🎖️";
if (count >= 50) return "Thượng Tá 🎖️";
if (count >= 20) return "Trung Tá 🎖️";
if (count >= 10) return "Thiếu Tá 🎖️";
if (count >= 3) return "Đại Úy 🎖️";
if (count >= 1) return "Tân Binh 🔰";
return "Tài Khoản Mới";
};

const getVipLevel = (count: number) => {
if (count >= 100) return { label: "Huyền Thoại 👑", color: "#E0B0FF" };
if (count >= 50) return { label: "Đối Tác VIP 💎", color: theme.gold };
if (count >= 10) return { label: "Đại Sứ 🥇", color: "#C0C0C0" };
if (count >= 3) return { label: "Sứ Giả 🥈", color: "#CD7F32" };
if (count >= 1) return { label: "Tân Binh 🥉", color: "#8E8E93" };
return { label: "Thành Viên", color: "#8E8E93" };
};

const getPassLabel = (tier: string) => {
if (tier === 'ultimate') return { label: '👑 ULTIMATE', color: '#E0B0FF' };
if (tier === 'plus') return { label: '💎 PLUS', color: theme.gold };
if (tier === 'essential') return { label: '✅ ESSENTIAL', color: theme.green };
return { label: '🔓 Chưa kích hoạt', color: theme.textDim };
};

// ==========================================
// HEADER
// ==========================================
const renderHeader = () => {
const militaryRank = getMilitaryRank(referrals);
const vip = getVipLevel(referrals);
const isFireEffect = (Number(userId || 1) % 2) !== 0;
const effectColor = isFireEffect ? '#FF3B30' : '#00FFFF';
const pulseAnim = isFireEffect ? 'pulseGlowRed 2s infinite' : 'pulseGlowCyan 2s infinite';

return (
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: theme.bg, borderBottom: `1px solid ${theme.border}` }}>
<div style={{ display: 'flex', alignItems: 'center' }}>
<img src="/logo.png" alt="SWC" style={{ width: '45px', height: '45px', borderRadius: '50%', border: `2px solid ${theme.gold}`, marginRight: '12px', objectFit: 'cover' }}
onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=SWC&background=F4D03F&color=000'; }} />
<div>
<h1 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: theme.gold, textTransform: 'uppercase', letterSpacing: '1px' }}>Club SWC Pass</h1>
<p style={{ margin: 0, fontSize: '11px', color: theme.textDim }}>Road to $1,000,000</p>
</div>
</div>

<div style={{ display: 'flex', alignItems: 'center' }}>
<div style={{ marginRight: '15px', textAlign: 'right' }}>
<h2 style={{ margin: 0, fontSize: '14px', color: theme.textLight, fontWeight: 'bold' }}>{userProfile.name}</h2>
<p style={{ margin: 0, fontSize: '12px', color: theme.gold, fontWeight: 'bold' }}>{militaryRank}</p>
</div>

<div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
<div style={{ position: 'relative', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
<div style={{ position: 'absolute', top: '-4px', left: '-4px', right: '-4px', bottom: '-4px', borderRadius: '50%', border: `2px dashed ${effectColor}`, animation: `spin 4s linear infinite, ${pulseAnim}` }}></div>
<div style={{ width: '100%', height: '100%', borderRadius: '50%', padding: '2px', backgroundColor: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
{userProfile.photoUrl
? <img src={userProfile.photoUrl} alt="avatar" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
: <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: theme.cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.gold, fontSize: '20px' }}>👤</div>
}
</div>
</div>
<div style={{ position: 'absolute', bottom: '-10px', backgroundColor: '#000', padding: '2px 8px', borderRadius: '12px', border: `1px solid ${vip.color}`, boxShadow: '0 2px 4px rgba(0,0,0,0.5)', zIndex: 10 }}>
<span style={{ color: vip.color, fontSize: '9px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{vip.label}</span>
</div>
</div>
</div>
</div>
);
};

// ==========================================
// COMPONENT: ĐẾM NGƯỢC
// ==========================================
const CountdownBox = ({ value, label }: { value: number, label: string }) => (
<div style={{ textAlign: 'center', minWidth: '60px' }}>
<div style={{ backgroundColor: '#000', border: `1px solid ${theme.gold}`, borderRadius: '10px', padding: '10px 8px', marginBottom: '6px', boxShadow: `0 0 10px rgba(244,208,63,0.3)` }}>
<span style={{ color: theme.gold, fontSize: '28px', fontWeight: '900', fontFamily: 'monospace' }}>
{String(value).padStart(2, '0')}
</span>
</div>
<span style={{ color: theme.textDim, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
</div>
);

// ==========================================
// TAB: HOME
// ==========================================
const renderHome = () => (
<div style={{ padding: '20px', animation: 'fadeIn 0.5s ease' }}>

{/* ĐỒNG HỒ ĐẾM NGƯỢC */}
<div style={{ backgroundColor: 'rgba(244,208,63,0.08)', border: `1px solid ${theme.gold}`, borderRadius: '15px', padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
<p style={{ color: theme.textDim, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0' }}>⏳ Đóng cửa vĩnh viễn sau</p>
<div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
<CountdownBox value={countdown.days} label="Ngày" />
<div style={{ color: theme.gold, fontSize: '28px', fontWeight: '900', alignSelf: 'flex-start', paddingTop: '10px' }}>:</div>
<CountdownBox value={countdown.hours} label="Giờ" />
<div style={{ color: theme.gold, fontSize: '28px', fontWeight: '900', alignSelf: 'flex-start', paddingTop: '10px' }}>:</div>
<CountdownBox value={countdown.minutes} label="Phút" />
<div style={{ color: theme.gold, fontSize: '28px', fontWeight: '900', alignSelf: 'flex-start', paddingTop: '10px' }}>:</div>
<CountdownBox value={countdown.seconds} label="Giây" />
</div>
<p style={{ color: theme.textLight, fontSize: '13px', margin: '0 0 16px 0' }}>
Gói <b style={{ color: theme.gold }}>Ultimate (Vĩnh viễn)</b> — Chỉ <b>1.000 suất</b> toàn cầu
</p>
<a href={ACTIVATE_URL} target="_blank" rel="noreferrer"
style={{ display: 'block', background: 'linear-gradient(90deg, #F4D03F 0%, #D4AC0D 100%)', color: '#000', padding: '14px', borderRadius: '10px', fontWeight: '900', textDecoration: 'none', fontSize: '14px', textTransform: 'uppercase' }}>
🚀 Kích Hoạt Ngay Trước 31/03
</a>
</div>

{/* WEBINAR */}
<div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', border: `1px solid ${theme.border}`, marginBottom: '20px' }}>
<div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
<span style={{ fontSize: '22px', marginRight: '10px' }}>📡</span>
<h3 style={{ color: theme.gold, margin: 0, fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase' }}>Webinar Vòng Kín — 31/03/2026</h3>
</div>
<p style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 15px 0', lineHeight: '1.6' }}>
20:00 (VN) — Phân tích chuyên sâu dòng vốn SWC Field, chiến lược Private Rounds và lộ trình Road to $1M. Tài liệu <b style={{ color: theme.textLight }}>độc quyền</b> chỉ dành cho người đăng ký.
</p>
<a href={WEBINAR_LINK} target="_blank" rel="noreferrer"
style={{ display: 'block', background: 'linear-gradient(90deg, #F4D03F 0%, #D4AC0D 100%)', color: '#000', padding: '13px', borderRadius: '10px', fontWeight: '900', textDecoration: 'none', textAlign: 'center', fontSize: '14px' }}>
Đăng Ký & Giữ Chỗ Ngay
</a>
</div>

{/* HƯỚNG DẪN KÍCH HOẠT */}
<div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', border: `1px solid ${theme.border}`, marginBottom: '20px' }}>
<div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
<span style={{ fontSize: '22px', marginRight: '10px' }}>📖</span>
<h3 style={{ color: theme.gold, margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Hướng Dẫn Kích Hoạt</h3>
</div>
<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
<a href={VIDEO_MOBILE} target="_blank" rel="noreferrer"
style={{ display: 'flex', alignItems: 'center', backgroundColor: '#000', padding: '12px 15px', borderRadius: '10px', textDecoration: 'none', border: `1px solid ${theme.border}` }}>
<span style={{ fontSize: '20px', marginRight: '12px' }}>📱</span>
<div>
<p style={{ margin: 0, color: theme.textLight, fontSize: '13px', fontWeight: 'bold' }}>Hướng dẫn trên Điện thoại</p>
<p style={{ margin: 0, color: theme.textDim, fontSize: '11px' }}>Video 3 phút</p>
</div>
</a>
<a href={VIDEO_PC} target="_blank" rel="noreferrer"
style={{ display: 'flex', alignItems: 'center', backgroundColor: '#000', padding: '12px 15px', borderRadius: '10px', textDecoration: 'none', border: `1px solid ${theme.border}` }}>
<span style={{ fontSize: '20px', marginRight: '12px' }}>💻</span>
<div>
<p style={{ margin: 0, color: theme.textLight, fontSize: '13px', fontWeight: 'bold' }}>Hướng dẫn trên Máy tính</p>
<p style={{ margin: 0, color: theme.textDim, fontSize: '11px' }}>Video 2 phút</p>
</div>
</a>
</div>
</div>

{/* ZALO GROUP */}
<div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', border: `1px solid ${theme.border}` }}>
<div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
<span style={{ fontSize: '22px', marginRight: '10px' }}>🎁</span>
<h3 style={{ color: theme.gold, margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Nhóm Zalo VIP Nội Bộ</h3>
</div>
<p style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 15px 0', lineHeight: '1.6' }}>
Nhận tài liệu độc quyền, cập nhật tin tức nội bộ và kết nối với cộng đồng nhà đầu tư tinh anh SWC.
</p>
<a href={GROUP_ZALO_LINK} target="_blank" rel="noreferrer"
style={{ display: 'block', backgroundColor: theme.blue, color: '#fff', padding: '13px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', fontSize: '14px' }}>
💬 Tham Gia Nhóm Zalo VIP
</a>
</div>
</div>
);

// ==========================================
// TAB: SWC PASS
// ==========================================
const renderPass = () => (
<div style={{ padding: '20px', animation: 'fadeIn 0.5s ease' }}>
<div style={{ textAlign: 'center', marginBottom: '25px' }}>
<h2 style={{ fontSize: '24px', fontWeight: '900', color: theme.gold, margin: '0 0 8px 0', textTransform: 'uppercase' }}>Chọn Vị Thế Của Bạn</h2>
<p style={{ color: theme.textDim, fontSize: '13px', margin: 0 }}>
Đầu tư <b style={{ color: theme.textLight }}>$8/ngày</b> — Chỉ <b style={{ color: theme.textLight }}>10 phút/tháng</b> — Lộ trình đến <b style={{ color: theme.gold }}>$1,000,000</b>
</p>
</div>

{/* ROAD TO $1M */}
<div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', border: `1px solid ${theme.gold}`, marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
<div style={{ position: 'absolute', top: '-10px', right: '-15px', fontSize: '80px', opacity: 0.05 }}>💰</div>
<h3 style={{ margin: '0 0 12px 0', color: theme.gold, fontSize: '18px', fontWeight: '900', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>🗺️ Hành Trình Đến $1M</h3>
<p style={{ color: theme.textLight, fontSize: '13px', lineHeight: '1.6', margin: '0 0 10px 0' }}>
Chỉ cần <b>$240/tháng</b> với kỷ luật thép, sức mạnh lãi kép sẽ đưa bạn đến <b>$1,000,000 trong 15 năm</b>. Không cần kinh nghiệm. Không cần xem chart. Chỉ 10–15 phút/tháng thực thi theo tín hiệu chuyên gia.
</p>
<div style={{ display: 'flex', gap: '10px' }}>
{['🎯 Không cần kinh nghiệm', '⏱️ 10 phút/tháng', '🛡️ AI theo dõi 24/7'].map((item, i) => (
<div key={i} style={{ flex: 1, backgroundColor: '#000', padding: '8px', borderRadius: '8px', textAlign: 'center', fontSize: '11px', color: theme.green, fontWeight: 'bold' }}>{item}</div>
))}
</div>
</div>

{/* GÓI ULTIMATE */}
<div style={{ backgroundColor: 'rgba(224,176,255,0.08)', borderRadius: '15px', padding: '25px 20px', border: `2px solid ${theme.premium}`, position: 'relative', marginBottom: '15px', boxShadow: '0 10px 25px rgba(224,176,255,0.1)' }}>
<div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: theme.premium, color: '#000', padding: '6px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
👑 ULTIMATE — VĨNH VIỄN
</div>
<div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '15px' }}>
<div style={{ color: theme.premium, fontSize: '36px', fontWeight: '900' }}>$2,600</div>
<p style={{ color: theme.textDim, fontSize: '12px', margin: '4px 0 0 0' }}>Một lần duy nhất — Sở hữu vĩnh viễn</p>
<div style={{ display: 'inline-block', backgroundColor: 'rgba(255,59,48,0.15)', border: `1px solid ${theme.red}`, borderRadius: '20px', padding: '4px 14px', marginTop: '8px' }}>
<span style={{ color: theme.red, fontSize: '12px', fontWeight: 'bold' }}>⚠️ Chỉ còn {countdown.days} ngày — 1.000 suất</span>
</div>
</div>
<ul style={{ color: theme.textLight, fontSize: '13px', lineHeight: '1.8', paddingLeft: '20px', margin: '0 0 20px 0' }}>
<li><b style={{ color: theme.premium }}>Truy cập vĩnh viễn</b> — Không bao giờ gia hạn</li>
<li><b style={{ color: theme.premium }}>Private Rounds độc quyền</b> — Vị thế Cá Voi</li>
<li><b style={{ color: theme.premium }}>SPV pháp lý quốc tế</b> — Bảo vệ tài sản tối đa</li>
<li><b style={{ color: theme.premium }}>Tất cả tính năng tương lai</b> — Miễn phí mãi mãi</li>
</ul>
<a href={ACTIVATE_URL} target="_blank" rel="noreferrer"
style={{ display: 'block', background: 'linear-gradient(90deg, #E0B0FF 0%, #9B59B6 100%)', color: '#000', padding: '15px', borderRadius: '10px', fontWeight: '900', textDecoration: 'none', textAlign: 'center', fontSize: '15px' }}>
KÍCH HOẠT ULTIMATE NGAY
</a>
</div>

{/* GÓI PLUS */}
<div style={{ backgroundColor: 'rgba(244,208,63,0.05)', borderRadius: '15px', padding: '25px 20px', border: `2px solid ${theme.gold}`, position: 'relative', marginBottom: '15px', boxShadow: '0 10px 25px rgba(244,208,63,0.15)' }}>
<div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: theme.gold, color: '#000', padding: '6px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
⭐ PLUS — KHUYÊN DÙNG
</div>
<div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '15px' }}>
<div style={{ color: theme.gold, fontSize: '36px', fontWeight: '900' }}>$600</div>
<p style={{ color: theme.green, fontSize: '13px', fontWeight: 'bold', margin: '4px 0 0 0' }}>5 năm — Chỉ $10/tháng (Giảm 50%)</p>
</div>
<ul style={{ color: theme.textLight, fontSize: '13px', lineHeight: '1.8', paddingLeft: '20px', margin: '0 0 20px 0' }}>
<li><b style={{ color: theme.gold }}>SWC Field</b> — Truy cập gian hàng dự án khởi nghiệp</li>
<li><b style={{ color: theme.gold }}>Khóa giá 5 năm</b> — Bảo vệ khỏi lạm phát phí</li>
<li><b style={{ color: theme.gold }}>Minh bạch SPV</b> — Triệt tiêu phí ẩn</li>
<li><b style={{ color: theme.gold }}>Cập nhật miễn phí</b> — Tất cả tính năng mới</li>
</ul>
<a href={SWC_PASS_WEB} target="_blank" rel="noreferrer"
style={{ display: 'block', background: 'linear-gradient(90deg, #F4D03F 0%, #D4AC0D 100%)', color: '#000', padding: '15px', borderRadius: '10px', fontWeight: '900', textDecoration: 'none', textAlign: 'center', fontSize: '15px' }}>
ĐĂNG KÝ GÓI PLUS NGAY
</a>
</div>

{/* GÓI ESSENTIAL */}
<div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', border: `1px solid ${theme.border}`, marginBottom: '20px' }}>
<div style={{ textAlign: 'center', marginBottom: '15px' }}>
<h3 style={{ margin: '0 0 5px 0', color: theme.textLight, fontSize: '18px', fontWeight: 'bold' }}>ESSENTIAL</h3>
<div style={{ color: theme.textLight, fontSize: '28px', fontWeight: '900' }}>$240 <span style={{ fontSize: '14px', color: theme.textDim, fontWeight: 'normal' }}>/ 1 Năm</span></div>
<p style={{ color: theme.textDim, fontSize: '12px', margin: '4px 0 0 0' }}>$20/tháng — Lý tưởng cho người mới bắt đầu</p>
</div>
<a href={SWC_PASS_WEB} target="_blank" rel="noreferrer"
style={{ display: 'block', backgroundColor: '#333', color: theme.textLight, padding: '13px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', fontSize: '14px' }}>
TÌM HIỂU THÊM
</a>
</div>

{/* SO SÁNH GÓI */}
<div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', border: `1px solid ${theme.border}` }}>
<h3 style={{ color: theme.gold, fontSize: '16px', fontWeight: 'bold', margin: '0 0 15px 0', textAlign: 'center' }}>📊 So Sánh Các Gói</h3>
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
<thead>
<tr>
<th style={{ color: theme.textDim, padding: '8px', textAlign: 'left', borderBottom: `1px solid ${theme.border}` }}>Tính năng</th>
<th style={{ color: theme.textLight, padding: '8px', textAlign: 'center', borderBottom: `1px solid ${theme.border}` }}>Essential</th>
<th style={{ color: theme.gold, padding: '8px', textAlign: 'center', borderBottom: `1px solid ${theme.border}` }}>Plus</th>
<th style={{ color: theme.premium, padding: '8px', textAlign: 'center', borderBottom: `1px solid ${theme.border}` }}>Ultimate</th>
</tr>
</thead>
<tbody>
{[
['Thời hạn', '1 năm', '5 năm', 'Vĩnh viễn'],
['Giá', '$240', '$600', '$2,600'],
['Road to $1M', '✅', '✅', '✅'],
['SWC Field', '✅', '✅', '✅'],
['Private Rounds', '❌', '✅', '✅'],
['Vị thế Cá Voi', '❌', '❌', '✅'],
].map(([feature, ess, plus, ult], i) => (
<tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
<td style={{ padding: '8px', color: theme.textDim }}>{feature}</td>
<td style={{ padding: '8px', textAlign: 'center', color: theme.textLight }}>{ess}</td>
<td style={{ padding: '8px', textAlign: 'center', color: theme.gold }}>{plus}</td>
<td style={{ padding: '8px', textAlign: 'center', color: theme.premium }}>{ult}</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
);

// ==========================================
// TAB: ATLAS
// ==========================================
const renderAtlas = () => (
<div style={{ padding: '20px', animation: 'fadeIn 0.5s ease' }}>
<div style={{ textAlign: 'center', marginBottom: '25px' }}>
<h2 style={{ fontSize: '24px', fontWeight: '900', color: theme.gold, margin: '0 0 8px 0', textTransform: 'uppercase' }}>ATLAS RWA — BĐS Dubai</h2>
<p style={{ color: theme.textDim, fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
Tiên phong Bất động sản số hóa tại UAE. Phá vỡ rào cản độc quyền của giới siêu giàu.
</p>
</div>

{[
{ icon: '🌐', title: 'Nền Tảng Web 2.5 Ưu Việt', desc: 'Kết hợp minh bạch Blockchain với giao diện trực quan. Không cần hiểu Crypto vẫn đầu tư được.' },
{ icon: '⚡', title: 'Thanh Khoản Cực Nhanh', desc: 'Thị trường thứ cấp tích hợp sẵn — giao dịch bán lại cổ phần BĐS trong vài cú chạm. Không chôn vốn hàng năm.' },
{ icon: '⚖️', title: 'Bảo Chứng Pháp Lý Dubai', desc: 'Atlas Overseas FZE — cấp phép chính thức bởi DWTCA (Giấy phép 4219). Minh bạch tuyệt đối.' },
{ icon: '💰', title: 'Đầu Tư Từ $50', desc: 'Dân chủ hóa sân chơi BĐS triệu đô. Ai cũng có thể sở hữu một phần bất động sản Dubai.' },
].map((item, i) => (
<div key={i} style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '12px', borderLeft: `4px solid ${theme.gold}`, marginBottom: '15px' }}>
<div style={{ fontSize: '26px', marginBottom: '8px' }}>{item.icon}</div>
<h3 style={{ margin: '0 0 8px 0', color: theme.gold, fontSize: '16px', fontWeight: '900' }}>{item.title}</h3>
<p style={{ margin: 0, color: theme.textLight, fontSize: '13px', lineHeight: '1.6' }}>{item.desc}</p>
</div>
))}

<div style={{ textAlign: 'center', backgroundColor: 'rgba(255,59,48,0.1)', padding: '25px 20px', borderRadius: '15px', border: `2px dashed ${theme.red}`, marginBottom: '20px' }}>
<div style={{ fontSize: '28px', marginBottom: '8px' }}>🚨</div>
<h3 style={{ color: theme.red, fontSize: '18px', fontWeight: '900', margin: '0 0 8px 0' }}>
CƠ HỘI ĐÓNG TRONG {countdown.days} NGÀY {countdown.hours} GIỜ
</h3>
<p style={{ color: theme.textLight, fontSize: '13px', margin: '0 0 20px 0', lineHeight: '1.5' }}>
Vòng gọi vốn kín ưu đãi dành riêng cho hệ thống nội bộ đóng lúc <b>23:59 ngày 31/03/2026</b>.
</p>
<a href={WEBINAR_LINK} target="_blank" rel="noreferrer"
style={{ display: 'block', backgroundColor: theme.red, color: '#fff', padding: '14px', borderRadius: '10px', fontWeight: '900', textDecoration: 'none', textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
ĐĂNG KÝ WEBINAR 31/03
</a>
<a href={SWC_FIELD_WEB} target="_blank" rel="noreferrer"
style={{ display: 'block', backgroundColor: '#333', color: theme.textLight, padding: '12px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', fontSize: '13px' }}>
🌐 Khám Phá SWC Field
</a>
</div>
</div>
);

// ==========================================
// TAB: HỒ SƠ
// ==========================================
const renderProfile = () => {
const pass = getPassLabel(userData.swcPassTier || 'none');
return (
<div style={{ padding: '20px', animation: 'fadeIn 0.5s ease' }}>
<div style={{ textAlign: 'center', marginBottom: '25px' }}>
<div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 12px auto', border: `3px solid ${theme.gold}`, overflow: 'hidden', backgroundColor: theme.cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
{userProfile.photoUrl
? <img src={userProfile.photoUrl} alt="avatar" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
: <span style={{ fontSize: '36px' }}>👤</span>
}
</div>
<h2 style={{ margin: '0 0 4px 0', color: theme.textLight, fontSize: '20px', fontWeight: 'bold' }}>{userProfile.name}</h2>
<p style={{ margin: '0 0 8px 0', color: theme.textDim, fontSize: '13px' }}>{userProfile.username}</p>
<div style={{ display: 'inline-block', backgroundColor: 'rgba(244,208,63,0.1)', border: `1px solid ${theme.gold}`, borderRadius: '20px', padding: '4px 16px' }}>
<span style={{ color: theme.gold, fontSize: '13px', fontWeight: 'bold' }}>{getMilitaryRank(referrals)}</span>
</div>
</div>

{/* THỐNG KÊ */}
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
{[
{ label: 'Lượt Giới Thiệu', value: referrals, color: theme.gold, icon: '👥' },
{ label: 'SWC Pass', value: pass.label, color: pass.color, icon: '💎' },
{ label: 'Funnel Stage', value: userData.funnelStage || 'new', color: theme.blue, icon: '📊' },
{ label: 'uST Holder', value: userData.ustHolder ? 'Có ✅' : 'Chưa', color: userData.ustHolder ? theme.green : theme.textDim, icon: '🪙' },
].map((stat, i) => (
<div key={i} style={{ backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
<div style={{ fontSize: '24px', marginBottom: '6px' }}>{stat.icon}</div>
<div style={{ color: stat.color, fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{stat.value}</div>
<div style={{ color: theme.textDim, fontSize: '11px' }}>{stat.label}</div>
</div>
))}
</div>

{/* THÔNG TIN CÁ NHÂN */}
<div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', border: `1px solid ${theme.border}`, marginBottom: '20px' }}>
<h3 style={{ color: theme.gold, fontSize: '15px', fontWeight: 'bold', margin: '0 0 15px 0' }}>📋 Thông Tin Cá Nhân</h3>
{[
{ label: 'Số điện thoại', value: userData.phone || 'Chưa cập nhật' },
{ label: 'Email', value: userData.email || 'Chưa cập nhật' },
{ label: 'Ví / GateCode', value: userData.gatecode || 'Chưa cập nhật' },
{ label: 'Tham gia', value: userData.joinDate ? new Date(userData.joinDate).toLocaleDateString('vi-VN') : 'N/A' },
].map((item, i) => (
<div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 3 ? `1px solid ${theme.border}` : 'none' }}>
<span style={{ color: theme.textDim, fontSize: '13px' }}>{item.label}</span>
<span style={{ color: theme.textLight, fontSize: '13px', fontWeight: '500', maxWidth: '180px', textAlign: 'right', wordBreak: 'break-all' }}>{item.value}</span>
</div>
))}
</div>

{/* QUICK LINKS */}
<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
<a href={ACTIVATE_URL} target="_blank" rel="noreferrer"
style={{ display: 'block', background: 'linear-gradient(90deg, #F4D03F 0%, #D4AC0D 100%)', color: '#000', padding: '14px', borderRadius: '10px', fontWeight: '900', textDecoration: 'none', textAlign: 'center', fontSize: '14px' }}>
🚀 Kích Hoạt / Nâng Cấp Pass
</a>
<a href={GROUP_ZALO_LINK} target="_blank" rel="noreferrer"
style={{ display: 'block', backgroundColor: theme.blue, color: '#fff', padding: '13px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', fontSize: '14px' }}>
💬 Nhóm Zalo VIP
</a>
<a href={SWC_FIELD_WEB} target="_blank" rel="noreferrer"
style={{ display: 'block', backgroundColor: '#333', color: theme.textLight, padding: '13px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', fontSize: '14px' }}>
🌐 SWC Field
</a>
</div>
</div>
);
};

// ==========================================
// RENDER CHÍNH
// ==========================================
return (
<div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', paddingBottom: '80px', boxSizing: 'border-box' }}>
<style>{`
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes pulseGlowRed {
0%, 100% { box-shadow: 0 0 5px #FF3B30; }
50% { box-shadow: 0 0 15px #FF3B30; }
}
@keyframes pulseGlowCyan {
0%, 100% { box-shadow: 0 0 5px #00FFFF; }
50% { box-shadow: 0 0 15px #00FFFF; }
}
* { box-sizing: border-box; }
.nav-item {
flex: 1; display: flex; flex-direction: column; align-items: center;
justify-content: center; padding: 12px 0; cursor: pointer;
transition: all 0.3s ease; opacity: 0.5;
}
.nav-item.active { opacity: 1; transform: translateY(-4px); }
.nav-icon { font-size: 22px; margin-bottom: 5px; transition: transform 0.3s; }
.nav-item.active .nav-icon { transform: scale(1.2); }
`}</style>

{renderHeader()}

<div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
{activeTab === 'home' && renderHome()}
{activeTab === 'pass' && renderPass()}
{activeTab === 'atlas' && renderAtlas()}
{activeTab === 'profile' && renderProfile()}
</div>

{/* BOTTOM NAV */}
<div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: theme.cardBg, borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-around', paddingBottom: 'env(safe-area-inset-bottom)', zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,0.5)' }}>
{[
{ key: 'home', icon: '🏠', label: 'Sự Kiện' },
{ key: 'pass', icon: '💎', label: 'SWC Pass' },
{ key: 'atlas', icon: '🏢', label: 'ATLAS' },
{ key: 'profile', icon: '👤', label: 'Hồ Sơ' },
].map(tab => (
<div key={tab.key} onClick={() => setActiveTab(tab.key)}
className={`nav-item ${activeTab === tab.key ? 'active' : ''}`}
style={{ color: activeTab === tab.key ? theme.gold : theme.textDim }}>
<div className="nav-icon">{tab.icon}</div>
<span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tab.label}</span>
</div>
))}
</div>
</div>
);
}

export default App;
