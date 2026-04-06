import React, { useState, useEffect, useRef } from "react";

const PRICE_CHANGE_DATE = new Date('2026-04-07T00:00:00+07:00');

function getPrices() {
  return new Date() >= PRICE_CHANGE_DATE
    ? { essential: 290, plus: 720, ultimate: 2600, changed: true }
    : { essential: 240, plus: 600, ultimate: 2600, changed: false };
}

function getCountdownTo(target: Date) {
  // Thay vì lấy Date trừ Date (gây lỗi TS2363), ta dùng .getTime() để lấy số milliseconds
  const diff = Math.max(0, target.getTime() - new Date().getTime());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    total: diff
  };
}

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

const G = {
  bg:      '#080808',
  card:    '#111111',
  card2:   '#181818',
  gold:    '#F0C040',
  gold2:   '#D4A820',
  purple:  '#C084FC',
  green:   '#22C55E',
  red:     '#F87171',
  blue:    '#60A5FA',
  text:    '#F5F5F5',
  muted:   '#737373',
  border:  '#222222',
  border2: '#2A2A2A',
};

// Định nghĩa các type dùng chung
type BtnVariant = 'gold' | 'purple' | 'ghost' | 'dark' | 'red' | 'blue';

interface BtnProps {
  href?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  variant?: BtnVariant;
}

interface PriceCardProps {
  tier: string;
  price: number;
  oldPrice: number;
  per?: string;
  badge?: string;
  color: string;
  highlight?: boolean;
  features: { inc: boolean; label: string }[];
  href: string;
  btnLabel: string;
  btnVariant?: BtnVariant;
}

export default function App() {
  const [tab, setTab] = useState<string>('home');
  const [prices, setPrices] = useState(getPrices());
  const [cdPrice, setCdPrice] = useState(getCountdownTo(PRICE_CHANGE_DATE));
  
  // Khai báo rõ kiểu dữ liệu cho state
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openKnowledge, setOpenKnowledge] = useState<string | null>(null);
  
  // Ref cần được gán kiểu HTMLDivElement để có thuộc tính scrollTop
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const Btn = ({ href, children, style = {}, variant = 'gold' }: BtnProps) => {
    const base: React.CSSProperties = {
      display: 'block', width: '100%', padding: '14px 20px',
      borderRadius: 12, fontWeight: 800, fontSize: 14,
      textDecoration: 'none', textAlign: 'center',
      cursor: 'pointer', border: 'none', letterSpacing: '0.3px',
    };
    const variants: Record<BtnVariant, React.CSSProperties> = {
      gold:   { background: `linear-gradient(135deg, ${G.gold} 0%, ${G.gold2} 100%)`, color: '#000' },
      purple: { background: `linear-gradient(135deg, ${G.purple} 0%, #9333EA 100%)`, color: '#fff' },
      ghost:  { background: 'transparent', color: G.gold, border: `1.5px solid ${G.gold}` },
      dark:   { background: G.card2, color: G.text, border: `1px solid ${G.border2}` },
      red:    { background: G.red, color: '#fff' },
      blue:   { background: G.blue, color: '#000' },
    };
    return <a href={href} target="_blank" rel="noreferrer" style={{ ...base, ...variants[variant], ...style }}>{children}</a>;
  };

  const PadNum = ({ v, label }: { v: number; label: string }) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        background: 'rgba(240,192,64,0.12)', border: `1.5px solid ${G.gold}`,
        borderRadius: 10, padding: '8px 10px', minWidth: 52, marginBottom: 6
      }}>
        <span style={{ color: G.gold, fontSize: 26, fontWeight: 900, fontFamily: 'monospace', letterSpacing: '-1px' }}>
          {String(v).padStart(2, '0')}
        </span>
      </div>
      <span style={{ color: G.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
    </div>
  );

  const Colon = () => (
    <span style={{ color: G.gold, fontSize: 24, fontWeight: 900, alignSelf: 'flex-start', paddingTop: 8, lineHeight: 1 }}>:</span>
  );

  const Section = ({ title, children, style = {} }: { title?: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{
      background: G.card, borderRadius: 16,
      border: `1px solid ${G.border}`, marginBottom: 16,
      overflow: 'hidden', ...style
    }}>
      {title && (
        <div style={{ padding: '16px 20px 0', color: G.gold, fontWeight: 800, fontSize: 15, letterSpacing: '0.3px' }}>
          {title}
        </div>
      )}
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );

  const Tag = ({ children, color = G.gold, bg, style = {} }: { children: React.ReactNode; color?: string; bg?: string; style?: React.CSSProperties }) => (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700,
      color, background: bg || `${color}18`,
      border: `1px solid ${color}40`,
      ...style
    }}>{children}</span>
  );

  const InfoRow = ({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${G.border}` }}>
      <span style={{ color: G.muted, fontSize: 13 }}>{label}</span>
      <span style={{ color: accent || G.text, fontSize: 13, fontWeight: 600, textAlign: 'right', maxWidth: '55%' }}>{value}</span>
    </div>
  );

  const Accordion = ({ items, state, setState }: { items: { q: string; a: React.ReactNode }[]; state: number | null; setState: (v: number | null) => void }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: G.card2, borderRadius: 12, border: `1px solid ${G.border}`, overflow: 'hidden' }}>
          <div
            onClick={() => setState(state === i ? null : i)}
            style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <span style={{ color: G.text, fontSize: 13, fontWeight: 600, flex: 1, paddingRight: 12 }}>{item.q}</span>
            <span style={{ color: G.gold, fontSize: 18, transition: 'transform 0.2s', transform: state === i ? 'rotate(45deg)' : 'none', flexShrink: 0 }}>+</span>
          </div>
          {state === i && (
            <div style={{ padding: '0 16px 16px', color: G.muted, fontSize: 13, lineHeight: 1.75, borderTop: `1px solid ${G.border}`, paddingTop: 14 }}>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ═══════════════════════════════════════════════
  // TAB HOME
  // ═══════════════════════════════════════════════
  const renderHome = () => {
    const isPriceChangeSoon = cdPrice.total > 0;
    return (
      <div>
        {/* COUNTDOWN BANNER */}
        {isPriceChangeSoon ? (
          <div style={{
            background: 'linear-gradient(135deg, rgba(240,192,64,0.12) 0%, rgba(240,192,64,0.05) 100%)',
            border: `1.5px solid ${G.gold}40`, borderRadius: 16, padding: 20, marginBottom: 16, textAlign: 'center'
          }}>
            <div style={{ color: G.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>
              ⚡ Giá tăng sau
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
              <PadNum v={cdPrice.days} label="Ngày" />
              <Colon /><PadNum v={cdPrice.hours} label="Giờ" />
              <Colon /><PadNum v={cdPrice.minutes} label="Phút" />
              <Colon /><PadNum v={cdPrice.seconds} label="Giây" />
            </div>
            <p style={{ color: G.text, fontSize: 13, margin: '0 0 16px', lineHeight: 1.6 }}>
              Từ <strong style={{ color: G.gold }}>07/04/2026</strong> — Essential <strong style={{ color: G.red }}>$240→$290</strong> · Plus <strong style={{ color: G.red }}>$600→$720</strong>
            </p>
            <Btn href={LINKS.swcPass}>Khoá Giá Ngay Trước Khi Tăng</Btn>
          </div>
        ) : (
          <div style={{ background: `${G.red}15`, border: `1.5px solid ${G.red}40`, borderRadius: 16, padding: 20, marginBottom: 16, textAlign: 'center' }}>
            <div style={{ color: G.red, fontWeight: 800, fontSize: 15, marginBottom: 8 }}>Giá mới đã có hiệu lực từ 07/04/2026</div>
            <p style={{ color: G.muted, fontSize: 13, margin: '0 0 16px' }}>Essential $290/năm · Plus $720/5 năm · Ultimate $2,600 vĩnh viễn</p>
            <Btn href={LINKS.swcPass}>Đăng Ký SWC Pass Ngay</Btn>
          </div>
        )}

        {/* THÔNG BÁO ĐỐI TÁC */}
        <Section title="📡 Thông Báo Chính Thức">
          <p style={{ color: G.muted, fontSize: 13, lineHeight: 1.75, margin: '0 0 14px' }}>
            Quý đối tác đã tham gia buổi phát sóng <em style={{ color: G.text }}>"Dự án nào được SWC hỗ trợ trong năm 2026 và có thể tham gia như thế nào"</em> — nơi chúng tôi phân tích thị trường tiềm năng, giới thiệu nền tảng SWC Field và dự án Atlas, trình bày chiến lược mới của SWC.
          </p>
          <div style={{ background: G.card2, borderRadius: 12, padding: 16, marginBottom: 14 }}>
            <p style={{ color: G.gold, fontWeight: 700, fontSize: 13, margin: '0 0 10px' }}>Atlas là dự án đầu tiên trên nền tảng SWC Field. Điều gì tiếp theo?</p>
            {[
              'Hàng chục sản phẩm đang trong quá trình lựa chọn và phê duyệt',
              'Quyền truy cập được cung cấp thông qua đăng ký SWC Pass',
              'Tự lựa chọn dự án để hỗ trợ trong mô hình minh bạch',
              'Tham gia hệ sinh thái kèm hoa hồng đại lý từ chương trình đối tác',
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                <span style={{ color: G.gold, fontSize: 12, flexShrink: 0, marginTop: 2 }}>▸</span>
                <span style={{ color: G.muted, fontSize: 13, lineHeight: 1.6 }}>{t}</span>
              </div>
            ))}
          </div>
          <Btn href={LINKS.webinar} variant="ghost">Xem Lại Buổi Webinar</Btn>
        </Section>

        {/* HƯỚNG DẪN KÍCH HOẠT */}
        <Section title="📖 Hướng Dẫn Kích Hoạt">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            {[
              { icon: '📱', label: 'Hướng dẫn trên Điện thoại', sub: 'Video 3 phút', href: LINKS.videoMobile },
              { icon: '💻', label: 'Hướng dẫn trên Máy tính', sub: 'Video 2 phút', href: LINKS.videoPC },
            ].map((v, i) => (
              <a key={i} href={v.href} target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 14, background: G.card2, padding: '13px 16px', borderRadius: 12, textDecoration: 'none', border: `1px solid ${G.border}` }}>
                <span style={{ fontSize: 22 }}>{v.icon}</span>
                <div>
                  <p style={{ margin: 0, color: G.text, fontSize: 13, fontWeight: 700 }}>{v.label}</p>
                  <p style={{ margin: 0, color: G.muted, fontSize: 11, marginTop: 2 }}>{v.sub}</p>
                </div>
                <span style={{ marginLeft: 'auto', color: G.gold, fontSize: 16 }}>›</span>
              </a>
            ))}
          </div>
          <Btn href={LINKS.activate}>Kích Hoạt Tài Khoản SWC Field</Btn>
        </Section>

        {/* ZALO */}
        <Section title="💬 Cộng Đồng Nội Bộ">
          <p style={{ color: G.muted, fontSize: 13, lineHeight: 1.7, margin: '0 0 14px' }}>
            Nhận tài liệu độc quyền, cập nhật tin tức nội bộ và kết nối với cộng đồng nhà đầu tư tinh anh SWC.
          </p>
          <Btn href={LINKS.zalo} variant="blue">Tham Gia Nhóm Zalo VIP</Btn>
        </Section>

        {/* QUICK LINKS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: '🌐 SWC Field', href: LINKS.swcField },
            { label: '💳 SWC Pass', href: LINKS.swcPass },
            { label: '🗺️ Road to $1M', href: LINKS.road1m },
            { label: '🏢 Atlas Dubai', href: LINKS.atlas },
          ].map((l, i) => (
            <a key={i} href={l.href} target="_blank" rel="noreferrer"
              style={{ display: 'block', background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: '13px 14px', textDecoration: 'none', textAlign: 'center', color: G.text, fontSize: 13, fontWeight: 600 }}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════
  // TAB SWC PASS
  // ═══════════════════════════════════════════════
  const renderPass = () => {
    const { essential, plus, ultimate, changed } = prices;
    const OLD = { essential: 240, plus: 600, ultimate: 2600 };

    const PriceCard = ({ tier, price, oldPrice, per, badge, color, highlight, features, href, btnLabel, btnVariant = 'gold' }: PriceCardProps) => (
      <div style={{
        background: highlight ? `${color}08` : G.card,
        border: `${highlight ? '2px' : '1px'} solid ${highlight ? color : G.border}`,
        borderRadius: 16, padding: '24px 20px', marginBottom: 14,
        position: 'relative', overflow: 'hidden'
      }}>
        {badge && (
          <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: color, color: highlight && color === G.gold ? '#000' : color === G.purple ? '#fff' : '#000', padding: '5px 18px', borderRadius: '0 0 12px 12px', fontSize: 11, fontWeight: 800, letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
            {badge}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: badge ? 16 : 0, marginBottom: 18 }}>
          <div style={{ color, fontSize: 38, fontWeight: 900, lineHeight: 1 }}>
            ${price}
            {changed && price !== oldPrice && (
              <span style={{ fontSize: 14, color: G.red, textDecoration: 'line-through', marginLeft: 8, fontWeight: 400 }}>${oldPrice}</span>
            )}
          </div>
          {per && <p style={{ color: G.muted, fontSize: 12, margin: '4px 0 0' }}>{per}</p>}
          {!changed && cdPrice.total > 0 && price !== oldPrice && (
            <div style={{ display: 'inline-block', background: `${G.red}18`, border: `1px solid ${G.red}40`, borderRadius: 20, padding: '3px 12px', marginTop: 8 }}>
              <span style={{ color: G.red, fontSize: 11, fontWeight: 700 }}>Tăng lên ${changed ? price : (tier === 'essential' ? 290 : 720)} sau {cdPrice.hours}h {cdPrice.minutes}m</span>
            </div>
          )}
        </div>
        <div style={{ marginBottom: 18 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0', borderBottom: i < features.length - 1 ? `1px solid ${G.border}` : 'none' }}>
              <span style={{ color: f.inc ? G.green : G.muted, fontSize: 13, flexShrink: 0, marginTop: 1 }}>{f.inc ? '✓' : '✗'}</span>
              <span style={{ color: f.inc ? G.text : G.muted, fontSize: 13, lineHeight: 1.5 }}>{f.label}</span>
            </div>
          ))}
        </div>
        <Btn href={href} variant={btnVariant}>{btnLabel}</Btn>
      </div>
    );

    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ color: G.gold, fontSize: 22, fontWeight: 900, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Chọn Vị Thế</h2>
          <p style={{ color: G.muted, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: G.text }}>$8/ngày</strong> · <strong style={{ color: G.text }}>10 phút/tháng</strong> · Mục tiêu <strong style={{ color: G.gold }}>$1,000,000</strong>
          </p>
          {!changed && cdPrice.total > 0 && (
            <div style={{ display: 'inline-block', background: `${G.red}15`, border: `1px solid ${G.red}40`, borderRadius: 20, padding: '5px 14px', marginTop: 10 }}>
              <span style={{ color: G.red, fontSize: 12, fontWeight: 700 }}>
                Giá cũ còn {cdPrice.hours}h {cdPrice.minutes}m {cdPrice.seconds}s
              </span>
            </div>
          )}
        </div>

        <PriceCard
          tier="ultimate" price={ultimate} oldPrice={OLD.ultimate}
          per="Một lần duy nhất — Sở hữu vĩnh viễn"
          badge="👑 ULTIMATE — VĨNH VIỄN" color={G.purple} highlight btnVariant="purple"
          href={LINKS.activate} btnLabel="Kích Hoạt Ultimate Ngay"
          features={[
            { inc: true, label: 'Truy cập vĩnh viễn — không bao giờ gia hạn' },
            { inc: true, label: 'Private Rounds độc quyền — vị thế Cá Voi Tầng 1' },
            { inc: true, label: 'SPV pháp lý quốc tế — bảo vệ tài sản tối đa' },
            { inc: true, label: 'Tất cả tính năng tương lai — miễn phí mãi mãi' },
            { inc: true, label: 'Road to $1M + SWC Field không giới hạn' },
          ]}
        />

        <PriceCard
          tier="plus" price={plus} oldPrice={OLD.plus}
          per={`5 năm — chỉ $${Math.round(plus / 60)}/tháng (Giảm 50%)`}
          badge="⭐ PLUS — KHUYÊN DÙNG" color={G.gold} highlight
          href={LINKS.swcPass} btnLabel="Đăng Ký Gói Plus Ngay"
          features={[
            { inc: true, label: 'Khoá giá 5 năm — miễn nhiễm lạm phát phí' },
            { inc: true, label: 'SWC Field — gian hàng dự án khởi nghiệp' },
            { inc: true, label: 'Minh bạch SPV — triệt tiêu phí ẩn' },
            { inc: true, label: 'Cập nhật miễn phí tất cả tính năng mới' },
            { inc: false, label: 'Private Rounds độc quyền' },
          ]}
        />

        <PriceCard
          tier="essential" price={essential} oldPrice={OLD.essential}
          per="1 năm — $20/tháng" color={G.muted}
          href={LINKS.swcPass} btnLabel="Tìm Hiểu Thêm" btnVariant="dark"
          features={[
            { inc: true, label: 'Tín hiệu đầu tư hàng tháng — mua mã nào, tỷ lệ nào' },
            { inc: true, label: 'Road to $1M — lộ trình $8/ngày' },
            { inc: true, label: 'SWC Field — quyền truy cập cơ bản' },
            { inc: false, label: 'Khoá giá dài hạn' },
            { inc: false, label: 'Private Rounds' },
          ]}
        />

        {/* SO SÁNH GÓI */}
        <Section title="📊 So Sánh Chi Tiết">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ color: G.muted, padding: '10px 8px', textAlign: 'left', borderBottom: `1px solid ${G.border}`, fontWeight: 600 }}>Tính năng</th>
                  <th style={{ color: G.text, padding: '10px 8px', textAlign: 'center', borderBottom: `1px solid ${G.border}`, fontWeight: 600 }}>Essential</th>
                  <th style={{ color: G.gold, padding: '10px 8px', textAlign: 'center', borderBottom: `1px solid ${G.border}`, fontWeight: 700 }}>Plus</th>
                  <th style={{ color: G.purple, padding: '10px 8px', textAlign: 'center', borderBottom: `1px solid ${G.border}`, fontWeight: 700 }}>Ultimate</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Thời hạn', '1 năm', '5 năm', 'Vĩnh viễn'],
                  ['Giá hiện tại', `$${essential}`, `$${plus}`, `$${ultimate}`],
                  ['Road to $1M', '✓', '✓', '✓'],
                  ['SWC Field', '✓', '✓', '✓'],
                  ['Private Rounds', '✗', '✓', '✓'],
                  ['Vị thế Cá Voi', '✗', '✗', '✓'],
                  ['Tính năng tương lai', '✗', '✓', '✓'],
                ].map(([feat, e, p, u], i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <td style={{ padding: '9px 8px', color: G.muted }}>{feat}</td>
                    <td style={{ padding: '9px 8px', textAlign: 'center', color: e === '✓' ? G.green : e === '✗' ? G.muted : G.text, fontWeight: feat === 'Giá hiện tại' ? 700 : 400 }}>{e}</td>
                    <td style={{ padding: '9px 8px', textAlign: 'center', color: p === '✓' ? G.green : p === '✗' ? G.muted : G.gold, fontWeight: feat === 'Giá hiện tại' ? 700 : 400 }}>{p}</td>
                    <td style={{ padding: '9px 8px', textAlign: 'center', color: u === '✓' ? G.green : u === '✗' ? G.muted : G.purple, fontWeight: feat === 'Giá hiện tại' ? 700 : 400 }}>{u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* LÃI KÉP */}
        <Section title="🧮 Sức Mạnh Lãi Kép">
          <p style={{ color: G.muted, fontSize: 13, lineHeight: 1.7, margin: '0 0 14px' }}>
            $240/tháng × tỷ suất 20%/năm — kết quả sau các mốc thời gian:
          </p>
          {[
            { year: '10 năm', val: '~$55,000', usd: '~1.4 tỷ VNĐ', pct: 30 },
            { year: '15 năm', val: '~$230,000', usd: '~5.8 tỷ VNĐ', pct: 55 },
            { year: '20 năm', val: '~$480,000', usd: '~12 tỷ VNĐ', pct: 75 },
            { year: '30 năm', val: '~$3,400,000', usd: '×64 vốn gốc', pct: 100, gold: true },
          ].map((r, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: r.gold ? G.gold : G.text, fontSize: 13, fontWeight: 700 }}>{r.year}</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: r.gold ? G.gold : G.green, fontSize: 13, fontWeight: 800 }}>{r.val}</span>
                  <span style={{ color: G.muted, fontSize: 11, marginLeft: 6 }}>{r.usd}</span>
                </div>
              </div>
              <div style={{ background: G.border, borderRadius: 4, height: 4, overflow: 'hidden' }}>
                <div style={{ width: `${r.pct}%`, height: '100%', background: r.gold ? G.gold : G.green, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </Section>
      </div>
    );
  };

  // ═══════════════════════════════════════════════
  // TAB SWC FIELD & ATLAS
  // ═══════════════════════════════════════════════
  const renderField = () => (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h2 style={{ color: G.gold, fontSize: 22, fontWeight: 900, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>SWC Field & Atlas</h2>
        <p style={{ color: G.muted, fontSize: 13, margin: 0 }}>Sân chơi của Cá Mập — từ $50</p>
      </div>

      <Section title="🌐 SWC Field — Nền Tảng">
        {[
          { icon: '🔐', title: 'Chỉ 1% dự án được chọn', desc: 'Đội ngũ thẩm định khắt khe — hàng nghìn dự án được xem xét, chỉ những cơ hội tốt nhất mới xuất hiện trên gian hàng.' },
          { icon: '⚖️', title: 'Cấu trúc SPV pháp lý', desc: 'Mỗi dự án có SPV riêng biệt. Bạn mua cổ phiếu hợp pháp, được bảo chứng bởi luật pháp Mỹ và Châu Âu. Không phải "lời hứa trên giấy".' },
          { icon: '🛡️', title: 'Bảo vệ vốn All-or-Nothing', desc: 'Không đạt đủ KPI gọi vốn → hoàn trả 100% tiền cho nhà đầu tư. Cơ chế kỹ thuật, không phải cam kết miệng.' },
          { icon: '💰', title: 'Đầu tư từ $50', desc: 'Phá vỡ rào cản $500,000 của giới tài phiệt. Ai cũng có thể ngồi mâm Cá Mập với vốn nhỏ.' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: i < 3 ? `1px solid ${G.border}` : 'none' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
            <div>
              <p style={{ margin: '0 0 4px', color: G.gold, fontSize: 13, fontWeight: 700 }}>{item.title}</p>
              <p style={{ margin: 0, color: G.muted, fontSize: 12, lineHeight: 1.65 }}>{item.desc}</p>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 16 }}>
          <Btn href={LINKS.swcField}>Khám Phá SWC Field</Btn>
        </div>
      </Section>

      <Section title="🏢 Dự Án Atlas — BĐS Dubai">
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <Tag color={G.gold}>RWA — Tài sản số hóa</Tag>
          <Tag color={G.green}>Pháp lý Dubai</Tag>
          <Tag color={G.blue}>Từ $50</Tag>
        </div>
        <p style={{ color: G.muted, fontSize: 13, lineHeight: 1.75, margin: '0 0 14px' }}>
          Atlas là <strong style={{ color: G.text }}>"Grab của ngành BĐS"</strong> tại UAE — gom toàn bộ quy trình mua-bán bất động sản vào 1 ứng dụng duy nhất.
        </p>
        {[
          { label: 'Vấn đề giải quyết', value: 'Tin ảo, kê giá (môi giới ăn chênh), thiếu minh bạch' },
          { label: 'Thanh khoản', value: 'Bán lại cổ phần trong vài giây — không chôn vốn hàng năm' },
          { label: 'Pháp lý', value: 'Atlas Overseas FZE — cấp phép DWTCA (GP 4219)' },
          { label: 'Bảo vệ vốn', value: 'All-or-Nothing — không đủ KPI → hoàn 100%' },
        ].map((r, i) => <InfoRow key={i} label={r.label} value={r.value} />)}
        <div style={{ marginTop: 16 }}>
          <Btn href={LINKS.atlas}>Chi Tiết Dự Án Atlas</Btn>
        </div>
      </Section>

      <Section title="🗺️ Lộ Trình Atlas">
        {[
          { phase: '01', label: 'Giai đoạn 1', desc: 'Xây dựng MVP — thị trường UAE', status: 'active' },
          { phase: '02', label: 'Giai đoạn 2', desc: 'Mở rộng toàn UAE, tích hợp AI định giá', status: 'next' },
          { phase: '03', label: 'Giai đoạn 3', desc: 'Singapore, Hồng Kông, Anh, Pháp', status: 'future' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 0', borderBottom: i < 2 ? `1px solid ${G.border}` : 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, background: s.status === 'active' ? G.gold : s.status === 'next' ? `${G.gold}30` : G.border, color: s.status === 'active' ? '#000' : s.status === 'next' ? G.gold : G.muted }}>
              {s.phase}
            </div>
            <div>
              <p style={{ margin: '0 0 3px', color: s.status === 'active' ? G.gold : G.text, fontSize: 13, fontWeight: 700 }}>{s.label}</p>
              <p style={{ margin: 0, color: G.muted, fontSize: 12, lineHeight: 1.6 }}>{s.desc}</p>
            </div>
            {s.status === 'active' && <Tag color={G.green} style={{ marginLeft: 'auto', flexShrink: 0 }}>Đang mở</Tag>}
          </div>
        ))}
      </Section>
    </div>
  );

  // ═══════════════════════════════════════════════
  // TAB ROAD TO $1M — KIẾN THỨC
  // ═══════════════════════════════════════════════
  const renderRoad = () => {
    const knowledge = [
      {
        cat: 'Phát Triển Bản Thân',
        icon: '🧠',
        items: [
          { q: '17 Tư Duy Triệu Phú (Harv Eker)', a: 'Người giàu tin "Tôi tạo ra cuộc đời tôi" — không đổ lỗi hoàn cảnh. Người giàu chơi để THẮNG, suy nghĩ LỚN, tập trung vào CƠ HỘI, ngưỡng mộ người giàu khác, kết giao người thành công, muốn trả công theo KẾT QUẢ, bắt tiền PHỤC VỤ mình, và hành động bất chấp nỗi sợ. Khác biệt không nằm ở vốn ban đầu mà ở tư duy.' },
          { q: 'Quy Tắc 6 Chiếc Lọ', a: '55% Thiết yếu (ăn ở đi lại) — 10% Tiết kiệm (không được đụng) — 10% Giáo dục (đầu tư bản thân) — 10% Hưởng thụ (không tội lỗi) — 10% Tự do Tài chính (đầu tư) — 5% Cho đi (từ thiện). Hệ thống này tự động hoá kỷ luật tài chính.' },
          { q: '4 Bước Tiến Hoá Tài Chính', a: '(1) Giảm chi tiêu — bịt lỗ hổng con thuyền. (2) Tăng thu nhập — bơm nước vào thuyền. (3) Đầu tư — bắt tiền làm nô lệ. (4) Đòn bẩy — chỉ dùng khi đã thắng bước 1-2-3. Cảnh báo: 90% đám đông làm ngược thứ tự này = công thức tự sát tài chính.' },
        ]
      },
      {
        cat: 'Thấu Hiểu Nhân Tính',
        icon: '🤝',
        items: [
          { q: 'Nguyên Tắc Dale Carnegie', a: '(1) Không chỉ trích, lên án — làm người cảm thấy tốt về bản thân trước. (2) Tán thành chân thành — mọi người khao khát được thừa nhận. (3) Khơi dậy khát khao — hỏi "Anh/chị đang SỢ điều gì nhất trong 5 năm tới?" (4) Làm người khác nói nhiều — người nói nhiều thua trong bán hàng. (5) Để người khác giữ thể diện — sửa lỗi làm riêng.' },
          { q: '5 Tầng Chuỗi Thức Ăn Tài Chính', a: 'Tầng 1 — Chính phủ & NHTW (in tiền, tạo luật). Tầng 2 — Cá Voi (quỹ tài phiệt, âm thầm gom mua dưới đáy). Tầng 3 — Đội Lái (tạo nến đỏ giả lúc 2h sáng để rũ bỏ người yếu). Tầng 4 — Sói Già (smart investors, kỷ luật thép). Tầng 5 — F0 Đám Đông (90% người tham gia, giao dịch bằng cảm xúc = mồi cho 4 tầng trên). Tự trade = tự trao tiền cho Tầng 2-3.' },
          { q: '3 Câu Hỏi Mở Cửa Lòng Người', a: '"Anh/chị đang SỢ điều gì nhất trong 5 năm tới?" — đánh vào nỗi đau sâu nhất. "Nếu không có ràng buộc tài chính, muốn cuộc sống thế nào?" — khơi dậy khát vọng. "Đã từng mất tiền vì quyết định nào rồi?" — tạo cầu nối tin tưởng. Bán hàng: người hỏi nhiều thắng, không phải người trình bày nhiều.' },
        ]
      },
      {
        cat: 'Đầu Tư & Vĩ Mô',
        icon: '📈',
        items: [
          { q: 'Triết Lý Warren Buffett', a: '"Giá cả là những gì bạn phải trả. Giá trị là những gì bạn nhận được." Chỉ đầu tư vào thứ mình HIỂU — vòng tròn năng lực (Circle of Competence). Mua DOANH NGHIỆP, không mua mảnh giấy. Moat (lợi thế cạnh tranh bền vững). "Thị trường là công cụ chuyển tiền từ tay người nóng vội sang tay người kiên nhẫn." Sợ khi tham lam — Tham lam khi sợ. 2 quy tắc: Không mất vốn. Không quên quy tắc 1.' },
          { q: 'Bản Đồ Dòng Tiền 4 Mùa', a: 'Mùa Xuân (lãi suất hạ) → tiền chảy vào Chứng khoán & Crypto. Mùa Hạ (tiền phình to) → BĐS sốt. Mùa Thu (lạm phát tăng) → NHTW tăng lãi suất, tiền rút khỏi BĐS và CS. Mùa Đông (tiền đắt) → tiền về Tiết kiệm, Vàng, USD. Kẻ thắng là kẻ chực chờ ở bình chuẩn bị đón nước, không phải kẻ đuổi theo đám đông.' },
          { q: 'Dữ Liệu Vĩ Mô 03/2026', a: 'FED: 3.625% (giảm từ đỉnh 5.5%). M2 YoY: +4.29% — Vùng Hoàng Kim (3-5%), tiền mới đang ngấm vào hệ thống. DXY: 98-100 — giật lên là đòn tâm lý ép đám đông hoảng loạn. CPI: 2.4%. Tín hiệu: M2 Vùng Hoàng Kim + Tầng 5 hoảng loạn = RÚT KIẾM, gom tài sản lõi.' },
        ]
      },
    ];

    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ color: G.gold, fontSize: 22, fontWeight: 900, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Con Đường $1,000,000</h2>
          <p style={{ color: G.muted, fontSize: 13, margin: 0 }}>Kiến thức nền tảng — Tư duy — Chiến lược</p>
        </div>

        <Section style={{ background: `${G.gold}08`, border: `1.5px solid ${G.gold}40` }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            {[
              { num: '$8/ngày', label: 'DCA mỗi ngày' },
              { num: '10 phút', label: 'Mỗi tháng' },
              { num: '×64', label: 'Sau 30 năm' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ color: G.gold, fontSize: 20, fontWeight: 900 }}>{s.num}</div>
                <div style={{ color: G.muted, fontSize: 11, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Section>

        {knowledge.map((cat, ci) => (
          <Section key={ci} title={`${cat.icon} ${cat.cat}`}>
            <Accordion 
              items={cat.items} 
              state={openKnowledge === String(ci) ? openFaq : null}
              setState={(v: number | null) => {
                setOpenKnowledge(v !== null ? String(ci) : null);
                setOpenFaq(v);
              }}
            />
          </Section>
        ))}

        <Btn href={LINKS.road1m}>Xem Chi Tiết Road to $1M</Btn>
      </div>
    );
  };

  // ═══════════════════════════════════════════════
  // TAB HỎI ĐÁP
  // ═══════════════════════════════════════════════
  const renderFaq = () => {
    const faqs = [
      {
        q: 'Chuyển tiền mua Pass xong nhận được gì ngay?',
        a: 'Ngay khi kích hoạt: Tín hiệu chiến lược tháng đầu tiên hiển thị trong vài phút — mua mã nào, rót bao nhiêu % vốn, vùng giá an toàn. Bạn mở app chứng khoán cá nhân (Vanguard, IBKR, VPS...), thực thi trong 10 phút, tắt máy. Tiền của bạn vẫn nằm trong app chứng khoán riêng — SWC KHÔNG GIỮ TIỀN của bạn.'
      },
      {
        q: 'Có lừa đảo như Ponzi, đa cấp không?',
        a: 'Ponzi/MLM: Cam kết lãi suất ảo (30%/tháng), giữ tiền của bạn, trả lãi bằng tiền người mới. SWC Pass: Không cam kết lãi suất — bạn tự quyết định mua gì. Không giữ tiền — tiền nằm trong app chứng khoán cá nhân. Bạn sở hữu tài sản thực: cổ phiếu, cổ phần SPV. Pháp lý: Giấy phép quỹ đầu tư SEC Mỹ, tuân thủ MiFID II Châu Âu.'
      },
      {
        q: 'Tại sao không tự học YouTube miễn phí?',
        a: 'Kiến thức miễn phí thì nhiều như rác — nhưng nếu chỉ cần "biết kiến thức" mà giàu, thế giới đã ai cũng là triệu phú. 95% thua lỗ vì thiếu HỆ THỐNG ÉP KỶ LUẬT THỰC THI, không phải thiếu kiến thức. SWC Pass là người huấn luyện viên bơi lội kề bên, không phải cuốn sách dạy bơi.'
      },
      {
        q: 'Để tiền ngân hàng không an toàn hơn sao?',
        a: 'Năm 2015: $1,000 mua được 2-3 iPhone mới. Năm 2025: $1,000 chưa đủ mua 1 iPhone mới — cùng những tờ tiền đó. Đó là lạm phát. Giữ tiền nằm im = chắc chắn mất đi theo thời gian. Giới tinh anh không bao giờ tích trữ tiền mặt dài hạn — họ luôn chuyển hóa thành tài sản sinh lời.'
      },
      {
        q: 'Tôi tự đầu tư cũng được, cần gì Pass?',
        a: 'Tự đầu tư: bạn mua trên sàn công khai (Tầng 2), giá đã phản ánh thông tin, lợi nhuận giới hạn 10-15%/năm. Với SWC Pass: bạn ngồi mâm Tầng 1 Venture Capital, mua tài sản vòng Private TRƯỚC KHI lên sàn. Ví dụ: Amazon IPO 1997 giá $18/cổ — nhà đầu tư vòng Private vào trước với $0.30, lãi 60 lần khi bán lại bằng giá IPO.'
      },
    ];

    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ color: G.gold, fontSize: 22, fontWeight: 900, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Hỏi & Đáp</h2>
          <p style={{ color: G.muted, fontSize: 13, margin: 0 }}>Phá vỡ rào cản tâm lý thường gặp</p>
        </div>
        <Accordion items={faqs} state={openFaq} setState={setOpenFaq} />
        <div style={{ marginTop: 20 }}>
          <Btn href={LINKS.swcPass}>Đăng Ký SWC Pass Ngay</Btn>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════
  // TABS CONFIG
  // ═══════════════════════════════════════════════
  const TABS = [
    { key: 'home',   icon: '🏠', label: 'Trang Chủ',  render: renderHome },
    { key: 'pass',   icon: '💳', label: 'SWC Pass',   render: renderPass },
    { key: 'field',  icon: '🌐', label: 'SWC Field',  render: renderField },
    { key: 'road',   icon: '🗺️', label: '$1M',        render: renderRoad },
    { key: 'faq',    icon: '❓', label: 'Hỏi Đáp',    render: renderFaq },
  ];

  return (
    <div style={{ background: G.bg, minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', color: G.text, maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
        a { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* HEADER */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: `${G.bg}EE`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${G.border}`, padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${G.gold} 0%, ${G.gold2} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💎</div>
            <div>
              <div style={{ color: G.gold, fontWeight: 900, fontSize: 16, letterSpacing: '0.5px', lineHeight: 1.2 }}>Club SWC Pass</div>
              <div style={{ color: G.muted, fontSize: 10, letterSpacing: '0.5px' }}>ROAD TO $1,000,000</div>
            </div>
          </div>
          {cdPrice.total > 0 && (
            <div style={{ background: `${G.red}18`, border: `1px solid ${G.red}30`, borderRadius: 8, padding: '5px 10px', textAlign: 'center' }}>
              <div style={{ color: G.red, fontSize: 11, fontWeight: 700, animation: 'pulse 2s infinite' }}>
                Giá tăng trong {cdPrice.hours}:{String(cdPrice.minutes).padStart(2,'0')}:{String(cdPrice.seconds).padStart(2,'0')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div ref={scrollRef} style={{ padding: '20px 16px', paddingBottom: 90, animation: 'fadeIn 0.35s ease', minHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
        {TABS.find(t => t.key === tab)?.render()}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: `${G.card}F5`, backdropFilter: 'blur(20px)', borderTop: `1px solid ${G.border}`, display: 'flex', zIndex: 200 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, background: 'none', border: 'none', padding: '10px 0 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.2s', WebkitTapHighlightColor: 'transparent' }}>
            <span style={{ fontSize: 19, transition: 'transform 0.2s', transform: tab === t.key ? 'scale(1.2)' : 'scale(1)' }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', color: tab === t.key ? G.gold : G.muted, transition: 'color 0.2s' }}>{t.label}</span>
            {tab === t.key && <div style={{ width: 4, height: 4, borderRadius: '50%', background: G.gold, position: 'absolute', bottom: 4 }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
