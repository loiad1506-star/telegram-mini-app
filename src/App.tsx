import React, { useState, useEffect, useRef } from "react";

// ==========================================
// CẤU HÌNH & HẰNG SỐ
// ==========================================
const PRICE_CHANGE_DATE = new Date('2026-04-07T00:00:00+07:00');
const BACKEND_URL = 'https://swc-bot-brain.onrender.com';

const LINKS = {
  swcField:   'https://swc001.netlify.app/',
  swcPass:    'https://swcpass.vn',
  road1m:     'https://swc001.netlify.app/road-to-1m',
  atlas:      'https://swc001.netlify.app/chi-tiet-du-an-atlas',
  activate:   'https://auth.swcfield.com/en/recover-password',
  videoMobile:'https://youtu.be/SEB7RJrutxg',
  videoPC:    'https://www.youtube.com/watch?v=gy_sxh9WCCM',
  webinar:    'https://launch.swc.capital/broadcast_31_vi',
  zalo:       'https://zalo.me/g/yeiaea989',
};

// ==========================================
// BẢNG MÀU NỀN SÁNG (LIGHT THEME)
// ==========================================
const L = {
  bg:       '#F2F4F7', 
  card:     '#FFFFFF', 
  card2:    '#F8F9FA', 
  gold:     '#F4D03F', 
  goldText: '#B8860B', 
  purple:   '#AF52DE',
  green:    '#28A745',
  red:      '#FF3B30',
  blue:     '#007AFF',
  text:     '#1C1C1E', 
  muted:    '#6E6E73', 
  border:   '#E5E5EA', 
};

// ==========================================
// HÀM TIỆN ÍCH
// ==========================================
function getPrices() {
  return new Date() >= PRICE_CHANGE_DATE
    ? { essential: 290, plus: 720, ultimate: 2600, changed: true }
    : { essential: 240, plus: 600, ultimate: 2600, changed: false };
}

function getCountdownTo(target: Date) {
  const diff = Math.max(0, target.getTime() - new Date().getTime());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    total: diff
  };
}

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
  return "Hội Viên Mới";
};

// ==========================================
// TYPES & INTERFACES
// ==========================================
type BtnVariant = 'gold' | 'purple' | 'ghost' | 'dark' | 'red' | 'blue';

interface BtnProps {
  href?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  variant?: BtnVariant;
}

export default function App() {
  const [tab, setTab] = useState<string>('home');
  const [prices, setPrices] = useState(getPrices());
  const [cdPrice, setCdPrice] = useState(getCountdownTo(PRICE_CHANGE_DATE));
  
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // User State
  const [userId, setUserId] = useState('');
  const [userProfile, setUserProfile] = useState({
    name: 'Khách',
    username: '',
    photoUrl: ''
  });
  const [userData, setUserData] = useState<any>({});
  const [referrals, setReferrals] = useState(0);

  // ==========================================
  // LẤY DỮ LIỆU TELEGRAM & ĐẾM NGƯỢC
  // ==========================================
  useEffect(() => {
    const t = setInterval(() => {
      setPrices(getPrices());
      setCdPrice(getCountdownTo(PRICE_CHANGE_DATE));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [tab]);

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
          username: user.username ? `@${user.username}` : '',
          photoUrl: user.photo_url || ''
        });
        
        fetch(`${BACKEND_URL}/api/user?id=${currentUid}`)
          .then(res => res.json())
          .then(data => {
            setReferrals(data.referralCount || 0);
            setUserData(data);
          })
          .catch(err => console.error("Lỗi Backend:", err));
      }
    }
  }, []);

  // ==========================================
  // UI COMPONENTS DÙNG CHUNG
  // ==========================================
  const Btn = ({ href, children, style = {}, variant = 'gold' }: BtnProps) => {
    const base: React.CSSProperties = {
      display: 'block', width: '100%', padding: '16px 20px', 
      borderRadius: 14, fontWeight: 800, fontSize: 16,
      textDecoration: 'none', textAlign: 'center',
      cursor: 'pointer', border: 'none', letterSpacing: '0.3px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    };
    const variants: Record<BtnVariant, React.CSSProperties> = {
      gold:   { background: `linear-gradient(135deg, ${L.gold} 0%, #D4AC0D 100%)`, color: '#000' },
      purple: { background: `linear-gradient(135deg, ${L.purple} 0%, #8A2BE2 100%)`, color: '#fff' },
      ghost:  { background: '#FFF', color: L.goldText, border: `2px solid ${L.goldText}`, boxShadow: 'none' },
      dark:   { background: L.text, color: '#FFF' },
      red:    { background: L.red, color: '#fff' },
      blue:   { background: L.blue, color: '#fff' },
    };
    return <a href={href} target="_blank" rel="noreferrer" style={{ ...base, ...variants[variant], ...style }}>{children}</a>;
  };

  const Section = ({ title, children, style = {} }: { title?: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{
      background: L.card, borderRadius: 16,
      border: `1px solid ${L.border}`, marginBottom: 20, 
      boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      overflow: 'hidden', ...style
    }}>
      {title && (
        <div style={{ padding: '18px 20px 0', color: L.goldText, fontWeight: 900, fontSize: 17, textTransform: 'uppercase' }}>
          {title}
        </div>
      )}
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );

  const Accordion = ({ items, prefix }: { items: { q: string; a: React.ReactNode }[]; prefix: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((item, i) => {
        const id = `${prefix}-${i}`;
        const isOpen = openAccordion === id;
        return (
          <div key={i} style={{ background: L.card2, borderRadius: 12, border: `1px solid ${L.border}`, overflow: 'hidden' }}>
            <div
              onClick={() => setOpenAccordion(isOpen ? null : id)}
              style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <span style={{ color: L.text, fontSize: 15, fontWeight: 700, flex: 1, paddingRight: 12 }}>{item.q}</span>
              <span style={{ color: L.goldText, fontSize: 22, transition: 'transform 0.2s', transform: isOpen ? 'rotate(45deg)' : 'none', flexShrink: 0 }}>+</span>
            </div>
            {isOpen && (
              <div style={{ padding: '0 16px 16px', color: L.text, fontSize: 15, lineHeight: 1.7, borderTop: `1px solid ${L.border}`, paddingTop: 14 }}>
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ==========================================
  // HEADER VỚI AVATAR PHÁT SÁNG
  // ==========================================
  const renderHeader = () => {
    const rank = getMilitaryRank(referrals);
    const isFireEffect = (Number(userId || 1) % 2) !== 0;
    const effectColor = isFireEffect ? '#FF3B30' : '#007AFF';
    const pulseAnim = isFireEffect ? 'pulseGlowRed 2s infinite' : 'pulseGlowBlue 2s infinite';

    return (
      <div style={{ 
        position: 'sticky', top: 0, zIndex: 100, 
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', 
        borderBottom: `1px solid ${L.border}`, padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        {/* LOGO */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="SWC" style={{ width: '42px', height: '42px', borderRadius: '50%', border: `2px solid ${L.gold}`, marginRight: '10px', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=SW&background=F4D03F&color=000'; }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: L.text, textTransform: 'uppercase' }}>SWC Pass</h1>
            <p style={{ margin: 0, fontSize: '11px', color: L.muted, fontWeight: 600 }}>ROAD TO $1,000,000</p>
          </div>
        </div>

        {/* AVATAR & INFO */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ marginRight: '12px', textAlign: 'right' }}>
            <h2 style={{ margin: 0, fontSize: '15px', color: L.text, fontWeight: '800' }}>{userProfile.name}</h2>
            <p style={{ margin: 0, fontSize: '12px', color: L.goldText, fontWeight: 'bold' }}>{rank.split(' ')[0]}</p>
          </div>

          <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: '-3px', left: '-3px', right: '-3px', bottom: '-3px', borderRadius: '50%', border: `2px dashed ${effectColor}`, animation: `spin 4s linear infinite, ${pulseAnim}` }}></div>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', padding: '2px', backgroundColor: L.card, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', zIndex: 2 }}>
              {userProfile.photoUrl
                ? <img src={userProfile.photoUrl} alt="avatar" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: L.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: L.goldText, fontSize: '20px' }}>👤</div>
              }
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // TAB 1: SỰ KIỆN (HOME)
  // ==========================================
  const renderHome = () => (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* COUNTDOWN */}
      <div style={{
        background: '#FFF8E1', border: `2px solid ${L.gold}`, borderRadius: 16, 
        padding: 20, marginBottom: 20, textAlign: 'center', boxShadow: '0 4px 15px rgba(244,208,63,0.2)'
      }}>
        <div style={{ color: L.goldText, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>
          ⏳ Ưu đãi đóng cửa vĩnh viễn sau
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'center', marginBottom: 16 }}>
          {[
            { v: cdPrice.days, l: 'Ngày' },
            { v: cdPrice.hours, l: 'Giờ' },
            { v: cdPrice.minutes, l: 'Phút' },
            { v: cdPrice.seconds, l: 'Giây' }
          ].map((item, i) => (
            <React.Fragment key={i}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: '#FFF', border: `1px solid ${L.goldText}`, borderRadius: 10, padding: '8px 10px', minWidth: 50, marginBottom: 6 }}>
                  <span style={{ color: L.goldText, fontSize: 24, fontWeight: 900, fontFamily: 'monospace' }}>{String(item.v).padStart(2, '0')}</span>
                </div>
                <span style={{ color: L.muted, fontSize: 11, fontWeight: 700 }}>{item.l}</span>
              </div>
              {i < 3 && <span style={{ color: L.goldText, fontSize: 20, fontWeight: 900, marginTop: '-20px' }}>:</span>}
            </React.Fragment>
          ))}
        </div>
        <p style={{ color: L.text, fontSize: 14, margin: '0 0 16px 0', lineHeight: 1.6 }}>
          Gói <b style={{ color: L.goldText }}>Ultimate (Vĩnh viễn)</b> — Chỉ <b>1.000 suất</b> toàn cầu.<br/>
          Từ 07/04/2026: Essential <b style={{color: L.red}}>$240→$290</b> · Plus <b style={{color: L.red}}>$600→$720</b>
        </p>
        <Btn href={LINKS.swcPass}>Khóa Giá Ngay Hôm Nay</Btn>
      </div>

      <Section title="📡 Webinar Vòng Kín Độc Quyền">
        <p style={{ color: L.text, fontSize: 15, lineHeight: 1.7, marginBottom: 15 }}>
          Buổi phân tích chuyên sâu dòng vốn SWC Field, chiến lược <b>Private Rounds</b> và lộ trình Road to $1M. Khám phá hàng chục sản phẩm đang trong quá trình phê duyệt và cách để tự lựa chọn dự án hỗ trợ với mô hình minh bạch 100%.<br/><br/>
          Tài liệu <b style={{ color: L.red }}>độc quyền</b> chỉ dành cho đối tác đã đăng ký giữ chỗ.
        </p>
        <Btn href={LINKS.webinar} variant="dark">Đăng Ký & Giữ Chỗ Ngay</Btn>
      </Section>

      <Section title="📖 Hướng Dẫn Kích Hoạt Nhanh">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 15 }}>
          <a href={LINKS.videoMobile} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 15, background: L.card2, padding: '15px', borderRadius: 12, textDecoration: 'none', border: `1px solid ${L.border}` }}>
            <span style={{ fontSize: 26 }}>📱</span>
            <div>
              <p style={{ margin: 0, color: L.text, fontSize: 15, fontWeight: 800 }}>Thao tác trên Điện thoại</p>
              <p style={{ margin: 0, color: L.muted, fontSize: 13, marginTop: 4 }}>Video hướng dẫn chi tiết (3 phút)</p>
            </div>
          </a>
          <a href={LINKS.videoPC} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 15, background: L.card2, padding: '15px', borderRadius: 12, textDecoration: 'none', border: `1px solid ${L.border}` }}>
            <span style={{ fontSize: 26 }}>💻</span>
            <div>
              <p style={{ margin: 0, color: L.text, fontSize: 15, fontWeight: 800 }}>Thao tác trên Máy tính</p>
              <p style={{ margin: 0, color: L.muted, fontSize: 13, marginTop: 4 }}>Video hướng dẫn chi tiết (2 phút)</p>
            </div>
          </a>
        </div>
        <Btn href={LINKS.activate}>Mở Tài Khoản SWC Field Ngay</Btn>
      </Section>

      <Section title="💬 Cộng Đồng Zalo VIP Nội Bộ">
        <p style={{ color: L.text, fontSize: 15, lineHeight: 1.7, marginBottom: 15 }}>
          Nhận tài liệu mật độc quyền, cập nhật tin tức nội bộ hàng ngày và kết nối trực tiếp với cộng đồng hơn 1.000+ nhà đầu tư tinh anh SWC.<br/><br/>
          Đặc biệt hỗ trợ giải đáp 1-1 cho các thành viên lớn tuổi chưa rành thao tác công nghệ.
        </p>
        <Btn href={LINKS.zalo} variant="blue">Tham Gia Nhóm Zalo VIP</Btn>
      </Section>
    </div>
  );

  // ==========================================
  // TAB 2: GIÁ THẺ SWC PASS
  // ==========================================
  const renderPass = () => {
    const { essential, plus, ultimate } = prices;
    
    return (
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 25 }}>
          <h2 style={{ color: L.goldText, fontSize: 24, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>Chọn Vị Thế Của Bạn</h2>
          <p style={{ color: L.text, fontSize: 15, margin: 0 }}>Đầu tư <b style={{color: L.blue}}>$8/ngày</b> — Chỉ <b style={{color: L.blue}}>10 phút/tháng</b> — Đạt <b style={{color: L.red}}>$1,000,000</b></p>
        </div>

        {/* PLUS CARD - KHUYÊN DÙNG */}
        <div style={{ background: '#FFF9E6', border: `2px solid ${L.gold}`, borderRadius: 16, padding: '30px 20px 20px', marginBottom: 20, position: 'relative', boxShadow: '0 8px 20px rgba(244,208,63,0.2)' }}>
          <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: L.gold, color: '#000', padding: '6px 20px', borderRadius: 20, fontSize: 13, fontWeight: 900, whiteSpace: 'nowrap' }}>
            ⭐ GÓI PLUS — KHUYÊN DÙNG NHẤT
          </div>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ color: L.goldText, fontSize: 44, fontWeight: 900 }}>${plus}</div>
            <p style={{ color: L.green, fontSize: 15, fontWeight: 800, marginTop: 5 }}>5 Năm — Chỉ $10/tháng (Giảm 50%)</p>
          </div>
          <ul style={{ color: L.text, fontSize: 15, lineHeight: 1.8, paddingLeft: 20, marginBottom: 20, fontWeight: 500 }}>
            <li><b>Khóa giá 5 năm:</b> Bảo vệ bạn khỏi đợt tăng giá lạm phát phí sắp tới.</li>
            <li><b>Quyền lợi SWC Field:</b> Truy cập gian hàng các dự án khởi nghiệp tiềm năng.</li>
            <li><b>Minh bạch SPV:</b> Triệt tiêu hoàn toàn các loại phí ẩn quản lý quỹ.</li>
            <li><b>Nâng cấp AI:</b> Được cập nhật miễn phí tất cả tính năng, tín hiệu mới.</li>
          </ul>
          <Btn href={LINKS.swcPass}>Mua Gói Plus Ngay</Btn>
        </div>

        {/* ULTIMATE CARD */}
        <div style={{ background: '#F9F0FF', border: `2px solid ${L.purple}`, borderRadius: 16, padding: '30px 20px 20px', marginBottom: 20, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: L.purple, color: '#FFF', padding: '6px 20px', borderRadius: 20, fontSize: 13, fontWeight: 900, whiteSpace: 'nowrap' }}>
            👑 GÓI ULTIMATE — DI SẢN
          </div>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ color: L.purple, fontSize: 44, fontWeight: 900 }}>${ultimate}</div>
            <p style={{ color: L.text, fontSize: 15, fontWeight: 700, marginTop: 5 }}>Thanh toán một lần — Sở hữu vĩnh viễn</p>
          </div>
          <ul style={{ color: L.text, fontSize: 15, lineHeight: 1.8, paddingLeft: 20, marginBottom: 20, fontWeight: 500 }}>
            <li><b>Quyền lực tối đa:</b> Truy cập vĩnh viễn trọn đời, không bao giờ phải gia hạn.</li>
            <li><b>Vị thế Cá Voi Tầng 1:</b> Đặc quyền tham gia các vòng <b>Private Rounds</b> siêu kín.</li>
            <li><b>Bảo vệ tài sản:</b> Được che chở bởi hành lang pháp lý SPV quốc tế.</li>
            <li><b>Tất cả tính năng:</b> Road to $1M và SWC Field không giới hạn.</li>
          </ul>
          <Btn href={LINKS.activate} variant="purple">Kích Hoạt Ultimate Ngay</Btn>
        </div>

        {/* ESSENTIAL CARD */}
        <div style={{ background: L.card, border: `1px solid ${L.border}`, borderRadius: 16, padding: '20px', marginBottom: 20 }}>
          <div style={{ textAlign: 'center', marginBottom: 15 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: L.text, margin: '0 0 5px' }}>ESSENTIAL</h3>
            <div style={{ fontSize: 32, fontWeight: 900, color: L.text }}>${essential} <span style={{ fontSize: 16, fontWeight: 500, color: L.muted }}>/ 1 Năm</span></div>
            <p style={{ color: L.muted, fontSize: 14, marginTop: 8 }}>$20/tháng — Trải nghiệm tín hiệu đầu tư và lộ trình cơ bản.</p>
          </div>
          <Btn href={LINKS.swcPass} variant="dark">Đăng Ký Essential</Btn>
        </div>

        {/* SO SÁNH */}
        <Section title="📊 Bảng So Sánh Quyền Lợi">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ color: L.muted, padding: '12px 8px', textAlign: 'left', borderBottom: `2px solid ${L.border}`, fontWeight: 700 }}>Tính năng</th>
                  <th style={{ color: L.text, padding: '12px 8px', textAlign: 'center', borderBottom: `2px solid ${L.border}`, fontWeight: 700 }}>Ess.</th>
                  <th style={{ color: L.goldText, padding: '12px 8px', textAlign: 'center', borderBottom: `2px solid ${L.border}`, fontWeight: 900 }}>Plus</th>
                  <th style={{ color: L.purple, padding: '12px 8px', textAlign: 'center', borderBottom: `2px solid ${L.border}`, fontWeight: 900 }}>Ult.</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Thời hạn', '1 năm', '5 năm', 'V.Viễn'],
                  ['Road to $1M', '✅', '✅', '✅'],
                  ['SWC Field', '✅', '✅', '✅'],
                  ['Khoá giá lạm phát', '❌', '✅', '✅'],
                  ['Private Rounds', '❌', '✅', '✅'],
                  ['Vị thế Cá Voi', '❌', '❌', '✅'],
                ].map(([feat, e, p, u], i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? L.card2 : 'transparent' }}>
                    <td style={{ padding: '12px 8px', color: L.text, fontWeight: 500 }}>{feat}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>{e}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>{p}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>{u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    );
  };

  // ==========================================
  // TAB 3: ATLAS & DỰ ÁN (SWC FIELD)
  // ==========================================
  const renderField = () => (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: 25 }}>
        <h2 style={{ color: L.goldText, fontSize: 24, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>ATLAS RWA & SWC FIELD</h2>
        <p style={{ color: L.text, fontSize: 15, margin: 0 }}>Sân chơi của Cá Mập — Dành cho mọi người từ <b>$50</b></p>
      </div>

      <Section title="🌐 Về Nền Tảng SWC Field">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {[
            { icon: '🔐', title: 'Chỉ 1% dự án được niêm yết', desc: 'Đội ngũ thẩm định khắt khe — hàng nghìn dự án được xem xét kỹ lưỡng, chỉ những cơ hội sinh lời thực sự an toàn mới xuất hiện trên gian hàng.' },
            { icon: '⚖️', title: 'Cấu trúc SPV pháp lý vững chắc', desc: 'Mỗi dự án có một SPV riêng biệt. Bạn mua cổ phiếu hợp pháp, được bảo chứng bởi luật pháp Mỹ và Châu Âu. Tiền của bạn không bay vào hư không.' },
            { icon: '🛡️', title: 'Bảo vệ vốn All-or-Nothing', desc: 'Một cơ chế kỹ thuật tuyệt vời: Nếu dự án không đạt đủ KPI gọi vốn để thực thi, hệ thống sẽ hoàn trả 100% tiền về tài khoản của nhà đầu tư.' },
            { icon: '💰', title: 'Đầu tư khởi điểm chỉ từ $50', desc: 'Phá vỡ hoàn toàn rào cản $500,000 của giới tài phiệt. Bất kỳ ai cũng có thể ngồi chung mâm với Cá Mập với số vốn cực kỳ nhỏ.' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 15, paddingBottom: 15, borderBottom: i < 3 ? `1px solid ${L.border}` : 'none' }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ margin: '0 0 5px', color: L.goldText, fontSize: 16, fontWeight: 800 }}>{item.title}</p>
                <p style={{ margin: 0, color: L.text, fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <Btn href={LINKS.swcField} style={{ marginTop: 15 }}>Khám Phá SWC Field</Btn>
      </Section>

      <Section title="🏢 Siêu Dự Án ATLAS — BĐS Dubai">
        <p style={{ color: L.text, fontSize: 15, lineHeight: 1.7, marginBottom: 15 }}>
          Tiên phong trong lĩnh vực Bất động sản số hóa (RWA) tại UAE. Atlas được ví như <b>"Grab của ngành Bất động sản"</b> — gom toàn bộ quy trình mua, bán, thuê vào 1 ứng dụng duy nhất, phá vỡ rào cản độc quyền của giới siêu giàu.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {[
            { icon: '🌐', title: 'Nền Tảng Web 2.5 Ưu Việt', desc: 'Kết hợp sự minh bạch tuyệt đối của Blockchain với giao diện trực quan truyền thống. Bạn không cần phải hiểu Crypto vẫn có thể đầu tư dễ dàng.' },
            { icon: '⚡', title: 'Thanh Khoản Cực Nhanh', desc: 'Thị trường thứ cấp được tích hợp sẵn — bạn có thể giao dịch bán lại cổ phần BĐS của mình chỉ trong vài cú chạm. Đập tan nỗi lo chôn vốn hàng năm trời.' },
            { icon: '⚖️', title: 'Bảo Chứng Pháp Lý Dubai', desc: 'Dự án được bảo lãnh bởi pháp nhân Atlas Overseas FZE — cấp phép chính thức bởi DWTCA (Giấy phép số 4219). Minh bạch và an toàn tuyệt đối.' },
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: L.card2, padding: '16px', borderRadius: '12px', borderLeft: `4px solid ${L.gold}` }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
              <h3 style={{ margin: '0 0 6px 0', color: L.goldText, fontSize: '15px', fontWeight: '900' }}>{item.title}</h3>
              <p style={{ margin: 0, color: L.text, fontSize: '14px', lineHeight: '1.6' }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <Btn href={LINKS.atlas} style={{ marginTop: 20 }} variant="dark">Xem Chi Tiết Dự Án ATLAS</Btn>
      </Section>

      <Section title="🗺️ Lộ Trình Phát Triển Atlas">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {[
            { phase: '01', label: 'Giai đoạn 1 (Hiện tại)', desc: 'Xây dựng sản phẩm cốt lõi (MVP) tập trung đánh chiếm thị trường UAE giàu có.', active: true },
            { phase: '02', label: 'Giai đoạn 2', desc: 'Mở rộng toàn UAE, tích hợp công nghệ AI định giá bất động sản tự động.', active: false },
            { phase: '03', label: 'Giai đoạn 3', desc: 'Vươn ra toàn cầu: Singapore, Hồng Kông, Anh, Pháp.', active: false },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 15, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, background: s.active ? L.gold : L.border, color: s.active ? '#000' : L.muted }}>
                {s.phase}
              </div>
              <div>
                <p style={{ margin: '0 0 5px', color: s.active ? L.goldText : L.text, fontSize: 15, fontWeight: 800 }}>{s.label}</p>
                <p style={{ margin: 0, color: L.muted, fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );

  // ==========================================
  // TAB 4: KIẾN THỨC & HỎI ĐÁP (Gộp chung để tối ưu bottom nav)
  // ==========================================
  const renderKnowledgeAndFaq = () => {
    const knowledge = [
      {
        cat: '🧠 Phát Triển Bản Thân & Tư Duy',
        items: [
          { q: '17 Tư Duy Triệu Phú (T. Harv Eker)', a: 'Người giàu tin "Tôi tạo ra cuộc đời tôi" — không đổ lỗi hoàn cảnh. Người giàu chơi trò chơi tiền bạc để THẮNG, suy nghĩ LỚN, tập trung vào CƠ HỘI, ngưỡng mộ người giàu khác, kết giao người thành công. Họ muốn trả công theo KẾT QUẢ, bắt tiền PHỤC VỤ mình, và hành động bất chấp nỗi sợ. Khác biệt không nằm ở vốn ban đầu mà ở tư duy.' },
          { q: 'Quy Tắc Quản Lý 6 Chiếc Lọ', a: '55% Thiết yếu (ăn ở đi lại) — 10% Tiết kiệm dài hạn (tuyệt đối không đụng) — 10% Giáo dục (đầu tư nâng cấp bản thân) — 10% Hưởng thụ (không tội lỗi) — 10% Tự do Tài chính (quỹ đầu tư) — 5% Cho đi (từ thiện). Xây dựng hệ thống này giúp bạn tự động hoá kỷ luật tài chính.' },
          { q: '4 Bước Tiến Hoá Tài Chính Cốt Lõi', a: '(1) Giảm chi tiêu — bịt lỗ hổng con thuyền. (2) Tăng thu nhập — bơm nước vào thuyền. (3) Đầu tư — bắt tiền làm nô lệ. (4) Đòn bẩy — chỉ dùng khi đã thuần thục bước 1-2-3. Cảnh báo đỏ: 90% đám đông làm ngược thứ tự này, thích dùng đòn bẩy vay mượn trước = công thức tự sát tài chính.' },
        ]
      },
      {
        cat: '🤝 Thấu Hiểu Nhân Tính & Tâm Lý',
        items: [
          { q: 'Nguyên Tắc Đắc Nhân Tâm (Dale Carnegie)', a: '(1) Không chỉ trích, lên án — làm người cảm thấy tốt về bản thân trước. (2) Tán thành chân thành — mọi người khao khát được thừa nhận. (3) Khơi dậy khát khao — hỏi "Anh/chị đang SỢ điều gì nhất trong 5 năm tới?" (4) Làm người khác nói nhiều — người nói nhiều thường thua trong đàm phán. (5) Để người khác giữ thể diện — sửa lỗi làm riêng.' },
          { q: '5 Tầng Bậc Của Chuỗi Thức Ăn Tài Chính', a: 'Tầng 1 — Chính phủ & NHTW (in tiền, tạo luật). Tầng 2 — Cá Voi/Quỹ Lớn (âm thầm gom mua dưới đáy). Tầng 3 — Đội Lái (tạo nến đỏ giả lúc 2h sáng để rũ bỏ người yếu bóng vía). Tầng 4 — Sói Già (smart investors, giao dịch vô cảm bằng kỷ luật thép). Tầng 5 — F0 Đám Đông (95% người tham gia, giao dịch bằng cảm xúc, mua đỉnh bán đáy = là thức ăn cho 4 tầng trên). Tự trade chính là tự nộp mạng.' },
          { q: '3 Câu Hỏi Mở Cửa Lòng Người', a: '"Anh/chị đang SỢ điều gì nhất trong 5 năm tới?" — đánh trực diện vào nỗi đau sâu nhất. "Nếu không có ràng buộc tài chính, anh/chị muốn cuộc sống thế nào?" — khơi dậy khát vọng. "Đã từng mất tiền vì quyết định sai lầm nào rồi?" — tạo sự đồng cảm và cầu nối tin tưởng.' },
        ]
      },
      {
        cat: '📈 Chiến Lược Đầu Tư & Vĩ Mô',
        items: [
          { q: 'Triết Lý Đầu Tư Của Warren Buffett', a: '"Giá cả là những gì bạn phải trả. Giá trị là những gì bạn nhận được." Chỉ đầu tư vào thứ mình HIỂU rõ ranh giới — vòng tròn năng lực (Circle of Competence). Hãy mua DOANH NGHIỆP, đừng mua những mảnh giấy. "Thị trường là một công cụ chuyển tiền từ tay kẻ nóng vội sang tay người kiên nhẫn." Hãy Sợ hãi khi người khác tham lam — và Tham lam khi người khác sợ hãi. 2 quy tắc sinh tử: Số 1 là Không để mất vốn. Số 2 là Không bao giờ quên quy tắc 1.' },
          { q: 'Bản Đồ Dòng Tiền 4 Mùa Vĩ Mô', a: 'Mùa Xuân (lãi suất hạ) → Dòng tiền chảy mạnh vào Chứng khoán & Crypto. Mùa Hạ (lượng tiền phình to) → BĐS nổi sốt. Mùa Thu (lạm phát tăng cao) → NHTW phải tăng lãi suất, tiền bắt đầu rút khỏi BĐS và CS. Mùa Đông (tiền trở nên đắt đỏ) → Dòng tiền trú ẩn về Tiết kiệm, Vàng, USD. Kẻ chiến thắng là kẻ chực chờ sẵn ở chiếc bình chuẩn bị đón nước, chứ không phải kẻ lật đật chạy đuổi theo đám đông.' },
        ]
      },
      {
        cat: '❓ Hỏi Đáp Xử Lý Từ Chối (FAQ)',
        items: [
          { q: 'Chuyển tiền mua SWC Pass xong thì tôi nhận được gì ngay?', a: 'Ngay khi kích hoạt thẻ thành công: Tín hiệu chiến lược tháng đầu tiên sẽ hiển thị trên hệ thống chỉ trong vài phút — hệ thống sẽ chỉ rõ mua mã cổ phiếu nào, rót bao nhiêu % vốn tổng, và đâu là vùng giá an toàn. Việc của bạn là mở app chứng khoán cá nhân (Vanguard, IBKR, VPS...), thao tác y hệt trong 10 phút, rồi tắt máy. Đặc biệt: Tiền vốn của bạn vẫn nằm trong app chứng khoán của riêng bạn — SWC KHÔNG GIỮ TIỀN CỦA BẠN.' },
          { q: 'Dự án này có phải là lừa đảo mô hình Ponzi, đa cấp không?', a: 'Ponzi/Đa cấp: Cam kết trả lãi suất ảo tưởng (20-30%/tháng), giam giữ vốn của bạn, lấy tiền người vào sau trả cho người trước. SWC Pass: KHÔNG cam kết lãi suất ảo — bạn là người tự tay đặt lệnh mua bán. KHÔNG giữ vốn — tiền của bạn nằm an toàn trong app chứng khoán do chính bạn đứng tên. Bạn sở hữu tài sản thực sự: cổ phiếu quốc tế, cổ phần SPV được pháp luật bảo vệ. Pháp lý chuẩn chỉnh: Sở hữu giấy phép quỹ đầu tư của SEC Mỹ, tuân thủ nghiêm ngặt chuẩn MiFID II Châu Âu.' },
          { q: 'Tại sao tôi không tự học kiến thức miễn phí trên YouTube cho đỡ tốn tiền?', a: 'Kiến thức miễn phí trên mạng thì nhiều như rác — nhưng sự thật là: nếu chỉ cần "Biết kiến thức" mà giàu, thì giáo sư kinh tế đại học đã là tỷ phú đô la hết rồi. 95% nhà đầu tư thua lỗ không phải vì họ thiếu kiến thức, mà vì họ THIẾU MỘT HỆ THỐNG ÉP BẢN THÂN PHẢI KỶ LUẬT THỰC THI. SWC Pass đóng vai trò là một người Huấn luyện viên bơi lội Olympic kề bên ép bạn bơi đúng hướng, chứ không phải là một cuốn sách dạy bơi suông.' },
          { q: 'Thà tôi để tiền trong két sắt hay gửi ngân hàng không an toàn hơn sao?', a: 'Năm 2015: $1,000 mua được 2-3 chiếc iPhone mới tinh. Năm 2025: Cùng $1,000 đó chưa đủ mua nổi 1 chiếc iPhone mới. Đó chính là sự tàn phá của LẠM PHÁT. Giữ tiền nằm im trong két sắt = đảm bảo 100% bạn sẽ nghèo đi một cách chắc chắn theo thời gian. Giới tinh anh và người giàu không bao giờ tích trữ tiền mặt dài hạn — họ luôn tìm mọi cách chuyển hóa nó thành tài sản sinh lời (Cổ phần, Bất động sản).' },
          { q: 'Tôi tự tay đầu tư cũng được, tại sao lại phải cần đến SWC Pass và Field?', a: 'Khi tự đầu tư: bạn đang mua trên sàn giao dịch công khai (Tầng 2, Tầng 3), lúc này mức giá đã phản ánh mọi thông tin tốt, lợi nhuận bị giới hạn ở mức thấp 10-15%/năm. Với SWC Pass: bạn được cấp quyền ngồi cùng mâm với Cá Voi (Venture Capital Tầng 1), mua gom tài sản chất lượng ở vòng Private (Giá sỉ) TRƯỚC KHI chúng được niêm yết lên sàn công khai. Đó mới là nơi tạo ra mức lợi nhuận x10, x20 lần để thay đổi vị thế.' },
        ]
      }
    ];

    return (
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 25 }}>
          <h2 style={{ color: L.goldText, fontSize: 24, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>Kiến Thức Triệu Đô</h2>
          <p style={{ color: L.text, fontSize: 15, margin: 0 }}>Nền tảng Tư duy — Tâm lý — Vĩ mô và Hỏi đáp.</p>
        </div>

        {/* LÃI KÉP CARD */}
        <div style={{ background: '#FFF8E1', border: `2px solid ${L.gold}`, borderRadius: 16, padding: 25, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 15px 0', color: L.goldText, fontSize: 18, fontWeight: 900, textAlign: 'center' }}>🧮 Sức Mạnh Của Lãi Kép</h3>
          <p style={{ color: L.text, fontSize: 15, lineHeight: 1.6, marginBottom: 20, textAlign: 'center' }}>
            Chiến lược Road to $1M: Kỷ luật đều đặn <b>$240/tháng</b> (khoảng $8/ngày) với mức tỷ suất kỳ vọng <b>20%/năm</b>. Hãy xem thời gian biến số tiền nhỏ thành gia tài:
          </p>
          {[
            { year: '10 năm', val: '~$55,000', usd: '~1.4 tỷ VNĐ', pct: 30 },
            { year: '15 năm', val: '~$230,000', usd: '~5.8 tỷ VNĐ', pct: 55 },
            { year: '20 năm', val: '~$480,000', usd: '~12 tỷ VNĐ', pct: 75 },
            { year: '30 năm', val: '~$3,400,000', usd: '×64 vốn gốc', pct: 100, gold: true },
          ].map((r, i) => (
            <div key={i} style={{ marginBottom: 15 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: r.gold ? L.goldText : L.text, fontSize: 15, fontWeight: 800 }}>{r.year}</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: r.gold ? L.goldText : L.green, fontSize: 16, fontWeight: 900 }}>{r.val}</span>
                  <span style={{ color: L.muted, fontSize: 13, marginLeft: 8, fontWeight: 600 }}>{r.usd}</span>
                </div>
              </div>
              <div style={{ background: L.border, borderRadius: 6, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${r.pct}%`, height: '100%', background: r.gold ? L.gold : L.green, borderRadius: 6 }} />
              </div>
            </div>
          ))}
          <Btn href={LINKS.road1m} style={{ marginTop: 20 }}>Tìm Hiểu Lộ Trình Road to $1M</Btn>
        </div>

        {knowledge.map((cat, ci) => (
          <Section key={ci} title={cat.cat}>
            <Accordion items={cat.items} prefix={`k-${ci}`} />
          </Section>
        ))}
      </div>
    );
  };

  // ==========================================
  // TAB 5: HỒ SƠ NGƯỜI DÙNG
  // ==========================================
  const renderProfile = () => {
    return (
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        <div style={{ textAlign: 'center', background: L.card, padding: '30px 20px', borderRadius: 16, border: `1px solid ${L.border}`, marginBottom: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', margin: '0 auto 15px auto', border: `4px solid ${L.goldText}`, overflow: 'hidden', backgroundColor: L.bg }}>
            {userProfile.photoUrl
              ? <img src={userProfile.photoUrl} alt="avatar" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '40px' }}>👤</div>
            }
          </div>
          <h2 style={{ margin: '0 0 5px 0', color: L.text, fontSize: '22px', fontWeight: '900' }}>{userProfile.name}</h2>
          <p style={{ margin: '0 0 12px 0', color: L.muted, fontSize: '15px' }}>{userProfile.username}</p>
          <div style={{ display: 'inline-block', backgroundColor: '#FFF9E6', border: `1px solid ${L.goldText}`, borderRadius: '20px', padding: '6px 20px' }}>
            <span style={{ color: L.goldText, fontSize: '14px', fontWeight: 'bold' }}>Cấp bậc: {getMilitaryRank(referrals)}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          {[
            { label: 'Giới Thiệu', value: referrals, color: L.blue, icon: '👥' },
            { label: 'Gói Thẻ Pass', value: (userData.swcPassTier || 'Chưa mua').toUpperCase(), color: L.goldText, icon: '💳' },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: L.card, borderRadius: '16px', padding: '20px 15px', textAlign: 'center', border: `1px solid ${L.border}` }}>
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>{stat.icon}</div>
              <div style={{ color: stat.color, fontSize: '16px', fontWeight: '900', marginBottom: '5px' }}>{stat.value}</div>
              <div style={{ color: L.muted, fontSize: '13px', fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <Section title="📋 Thông Tin Tài Khoản">
          {[
            { label: 'ID Hệ thống', value: userId || 'Đang tải...' },
            { label: 'Số điện thoại', value: userData.phone || 'Chưa cập nhật' },
            { label: 'Cấp bậc Funnel', value: userData.funnelStage || 'Mới tham gia' },
            { label: 'Email', value: userData.email || 'Chưa cập nhật' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 3 ? `1px solid ${L.border}` : 'none' }}>
              <span style={{ color: L.muted, fontSize: 15 }}>{item.label}</span>
              <span style={{ color: L.text, fontSize: 15, fontWeight: 700, textAlign: 'right' }}>{item.value}</span>
            </div>
          ))}
        </Section>
        
        <Btn href={LINKS.activate} variant="gold" style={{marginBottom: 10}}>🚀 Nâng Cấp Thẻ Pass Ngay</Btn>
        <Btn href={LINKS.zalo} variant="blue">💬 Nhắn Nhóm Zalo Hỗ Trợ</Btn>
      </div>
    );
  };

  // ==========================================
  // CẤU HÌNH MENU DƯỚI ĐÁY
  // ==========================================
  const TABS = [
    { key: 'home',    icon: '🏠', label: 'Sự Kiện' },
    { key: 'pass',    icon: '💎', label: 'Giá Thẻ' },
    { key: 'field',   icon: '🏢', label: 'Dự Án' },
    { key: 'road',    icon: '🧠', label: 'Kiến Thức' },
    { key: 'profile', icon: '👤', label: 'Hồ Sơ' },
  ];

  return (
    <div style={{ background: L.bg, minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: L.text, maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { display: none; }
        
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(15px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes spin { 
          100% { transform: rotate(360deg); } 
        }
        @keyframes pulseGlowRed {
          0%, 100% { box-shadow: 0 0 4px #FF3B30; }
          50% { box-shadow: 0 0 12px #FF3B30; }
        }
        @keyframes pulseGlowBlue {
          0%, 100% { box-shadow: 0 0 4px #007AFF; }
          50% { box-shadow: 0 0 12px #007AFF; }
        }
      `}</style>

      {renderHeader()}

      <div ref={scrollRef} style={{ padding: '20px 16px', paddingBottom: 100, minHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
        {tab === 'home' && renderHome()}
        {tab === 'pass' && renderPass()}
        {tab === 'field' && renderField()}
        {tab === 'road' && renderKnowledgeAndFaq()}
        {tab === 'profile' && renderProfile()}
      </div>

      {/* THANH ĐIỀU HƯỚNG DƯỚI CÙNG (BOTTOM NAV) */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderTop: `1px solid ${L.border}`, display: 'flex', zIndex: 200, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {TABS.map(t => {
          const isActive = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, background: 'none', border: 'none', padding: '12px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}>
              <span style={{ fontSize: 24, transition: 'transform 0.2s', transform: isActive ? 'scale(1.2)' : 'scale(1)', filter: isActive ? 'grayscale(0)' : 'grayscale(100%)', opacity: isActive ? 1 : 0.5 }}>
                {t.icon}
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: isActive ? L.goldText : L.muted, transition: 'color 0.2s' }}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
