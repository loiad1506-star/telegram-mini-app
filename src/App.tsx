import { useState, useEffect } from 'react';

function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [userId, setUserId] = useState('');
    const [userProfile, setUserProfile] = useState({
        name: 'Đang tải...',
        username: '',
        photoUrl: ''
    });
    const [referrals, setReferrals] = useState(0); 
    const [isPremiumUser, setIsPremiumUser] = useState(false);

    // Link API Backend và các Link điều hướng
    const BACKEND_URL = 'https://swc-bot-brain.onrender.com';
    const GROUP_ZALO_LINK = "https://zalo.me/g/yeiaea989";
    const WEBINAR_LINK = "https://launch.swc.capital/broadcast_31_vi";
    const SWC_PASS_WEB = "https://swcpass.vn";

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

    // Kết nối MongoDB để lấy thông tin User
    const fetchUserData = (uid: string) => {
        fetch(`${BACKEND_URL}/api/user?id=${uid}`)
            .then(res => res.json())
            .then(data => {
                setReferrals(data.referralCount || 0); 
                setIsPremiumUser(data.isPremium || false);
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

    const renderHeader = () => {
        const militaryRank = getMilitaryRank(referrals);
        let vipLevel = referrals >= 1 ? "Tân Binh 🥉" : "Thành Viên";
        let wreathColor = "#8E8E93"; 
        
        if (referrals >= 100) { vipLevel = "Huyền Thoại 👑"; wreathColor = "#E0B0FF"; }
        else if (referrals >= 50) { vipLevel = "Đối Tác VIP 💎"; wreathColor = theme.gold; }
        else if (referrals >= 10) { vipLevel = "Đại Sứ 🥇"; wreathColor = "#C0C0C0"; }
        else if (referrals >= 3) { vipLevel = "Sứ Giả 🥈"; wreathColor = "#CD7F32"; }

        const isFireEffect = (Number(userId || 1) % 2) !== 0; 
        const effectColor = isFireEffect ? '#FF3B30' : '#00FFFF'; 
        const pulseAnim = isFireEffect ? 'pulseGlowRed 2s infinite' : 'pulseGlowCyan 2s infinite';

        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: theme.bg, borderBottom: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* CHỖ THAY LOGO: Thay đổi "/logo.png" thành link ảnh của anh nếu cần */}
                    <img src="/logo.png" alt="SWC Logo" style={{ width: '45px', height: '45px', borderRadius: '50%', border: `2px solid ${theme.gold}`, marginRight: '12px', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=SWC&background=F4D03F&color=000'; }} />
                    <div>
                        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: theme.gold, textTransform: 'uppercase', letterSpacing: '1px' }}>Club SWC Pass</h1>
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', textAlign: 'right' }}>
                    <div style={{ marginRight: '15px' }}>
                        <h2 style={{ margin: 0, fontSize: '14px', color: theme.textLight, fontWeight: 'bold' }}>{userProfile.name}</h2>
                        <p style={{ margin: 0, fontSize: '12px', color: theme.gold, fontWeight: 'bold' }}>{militaryRank}</p>
                    </div>
                    
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                            <div style={{
                                position: 'absolute', top: '-4px', left: '-4px', right: '-4px', bottom: '-4px',
                                borderRadius: '50%', border: `2px dashed ${effectColor}`,
                                animation: `spin 4s linear infinite, ${pulseAnim}`, zIndex: 0
                            }}></div>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', padding: '2px', backgroundColor: theme.bg, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {userProfile.photoUrl ? (
                                    <img src={userProfile.photoUrl} alt="avatar" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: theme.cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.gold, fontSize: '20px' }}>👤</div>
                                )}
                            </div>
                        </div>
                        <div style={{ position: 'absolute', bottom: '-10px', zIndex: 11, display: 'flex', alignItems: 'center', backgroundColor: '#000', padding: '2px 8px', borderRadius: '12px', border: `1px solid ${wreathColor}`, boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                            <span style={{ color: wreathColor, fontSize: '9px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{vipLevel}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderHome = () => (
        <div style={{ padding: '20px', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: '900', color: theme.gold, margin: '0 0 10px 0', textTransform: 'uppercase', lineHeight: '1.3', textShadow: '0 2px 10px rgba(244, 208, 63, 0.3)' }}>
                    Khai Mở Đại Dương Xanh
                </h1>
                <p style={{ color: theme.textDim, fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                    Tại <b>Club SWC Pass</b>, chúng tôi hiểu rằng kinh nghiệm xương máu là nền tảng cho sự đột phá. Lần đầu tiên, dự án chiến lược mới chính thức ra mắt trên gian trưng bày <b>SWC Field</b> với bộ lọc khắt khe, minh bạch tuyệt đối và tiềm năng tăng trưởng vượt trội dành riêng cho giới tinh anh.
                </p>
            </div>

            <div style={{ backgroundColor: 'rgba(244, 208, 63, 0.1)', border: `1px solid ${theme.gold}`, borderRadius: '15px', padding: '25px 20px', textAlign: 'center', marginBottom: '25px', boxShadow: '0 0 20px rgba(244, 208, 63, 0.15)' }}>
                <div style={{ fontSize: '35px', marginBottom: '10px' }}>⏳</div>
                <h2 style={{ fontSize: '18px', color: theme.textLight, margin: '0 0 5px 0', fontWeight: 'bold' }}>ĐẾM NGƯỢC WEBINAR VÒNG KÍN</h2>
                <p style={{ color: theme.gold, fontSize: '16px', fontWeight: 'bold', margin: '0 0 20px 0' }}>20:00 (VN) | Ngày 31/03/2026</p>
                <a href={WEBINAR_LINK} target="_blank" rel="noreferrer" style={{ display: 'block', background: 'linear-gradient(90deg, #F4D03F 0%, #D4AC0D 100%)', color: '#000', padding: '15px', borderRadius: '10px', fontWeight: '900', textDecoration: 'none', textTransform: 'uppercase', fontSize: '15px', boxShadow: '0 4px 15px rgba(244, 208, 63, 0.4)' }}>
                    Đăng Ký & Giữ Chỗ Ngay
                </a>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>
                    <span style={{ fontSize: '22px', marginRight: '10px' }}>🎁</span>
                    <h3 style={{ color: theme.gold, margin: 0, fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase' }}>Đặc quyền tham gia</h3>
                </div>
                <p style={{ color: theme.textDim, fontSize: '14px', margin: '0 0 15px 0', lineHeight: '1.6', textAlign: 'justify' }}>
                    Sự kiện 31/03 sẽ phân tích thẳng thắn những rủi ro đã xảy ra trong quá khứ và cách dự án mới thiết lập <b>hàng rào bảo vệ nhà đầu tư</b>. Tham gia buổi phát sóng để nhận ngay bộ tài liệu <b>ĐỘC QUYỀN</b> phân tích chuyên sâu về sự thay đổi dòng vốn của SWC.
                </p>
                <a href={GROUP_ZALO_LINK} target="_blank" rel="noreferrer" style={{ display: 'block', backgroundColor: theme.blue, color: '#fff', padding: '14px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', fontSize: '14px' }}>
                    💬 THAM GIA NHÓM ZALO VIP
                </a>
            </div>
        </div>
    );

    const renderPass = () => (
        <div style={{ padding: '20px', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: '900', color: theme.gold, margin: '0 0 10px 0', textTransform: 'uppercase', textShadow: '0 2px 10px rgba(244, 208, 63, 0.2)' }}>Hệ Sinh Thái SWC</h2>
                <p style={{ color: theme.textDim, fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                    Vũ khí tối thượng để định hình lại tương lai tài chính của bạn.
                </p>
            </div>

            {/* BLOCK 1: HÀNH TRÌNH ĐẾN 1 TRIỆU ĐÔ */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '25px 20px', border: `1px solid ${theme.gold}`, marginBottom: '25px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-15px', fontSize: '80px', opacity: 0.05 }}>💰</div>
                <h3 style={{ margin: '0 0 15px 0', color: theme.gold, fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>Hành trình đến $1M</h3>
                <p style={{ color: theme.textLight, fontSize: '14px', lineHeight: '1.6', margin: '0 0 10px 0', textAlign: 'justify' }}>
                    Chiến lược đỉnh cao do <b>SWC Field</b> phát triển. Đây là một chương trình đầu tư dài hạn mang tính cách mạng: chỉ cần đầu tư <b>$8 mỗi ngày</b> (khoảng $240 mỗi tháng) với kỷ luật thép.
                </p>
                <p style={{ color: theme.textDim, fontSize: '14px', lineHeight: '1.6', margin: '0 0 15px 0', textAlign: 'justify' }}>
                    Nhờ sức mạnh của Lãi Kép, bạn hoàn toàn có thể hướng đến mục tiêu đạt số vốn <b>$1.000.000 trong 15 năm</b>. Không cần kinh nghiệm, không cần khóa học phức tạp, chỉ tốn <b>10-15 phút/tháng</b> để thực thi.
                </p>
                <ul style={{ color: theme.textLight, fontSize: '13px', lineHeight: '1.8', paddingLeft: '20px', margin: '0 0 0 0' }}>
                    <li><b style={{color: theme.green}}>Mục tiêu 1:</b> Xây dựng vốn tài chính vượt mốc 1 triệu USD trong 15-20 năm.</li>
                    <li><b style={{color: theme.green}}>Mục tiêu 2:</b> Thoát khỏi áp lực "sống dựa vào đồng lương", tạo thu nhập thụ động.</li>
                    <li><b style={{color: theme.green}}>Mục tiêu 3:</b> Xây dựng di sản vững chắc cho thế hệ tương lai.</li>
                </ul>
            </div>

            {/* BLOCK 2: GÓI SWC PASS */}
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: theme.textLight, margin: '0 0 15px 0', textAlign: 'center' }}>CHỌN VỊ THẾ CỦA BẠN</h3>
            
            <div style={{ backgroundColor: 'rgba(244, 208, 63, 0.05)', borderRadius: '15px', padding: '25px 20px', border: `2px solid ${theme.gold}`, position: 'relative', boxShadow: '0 10px 25px rgba(244, 208, 63, 0.15)', marginBottom: '20px' }}>
                <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: theme.gold, color: '#000', padding: '6px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(244, 208, 63, 0.5)' }}>
                    ⭐ GÓI PLUS (KHUYÊN DÙNG)
                </div>
                <h3 style={{ margin: '0 0 5px 0', color: theme.gold, fontSize: '20px', textAlign: 'center', marginTop: '15px', fontWeight: '900' }}>VỊ THẾ 5 NĂM</h3>
                
                <div style={{ color: theme.gold, fontSize: '35px', fontWeight: '900', textAlign: 'center', marginBottom: '5px' }}>
                    $600
                </div>
                <p style={{ textAlign: 'center', color: theme.green, fontSize: '13px', fontWeight: 'bold', marginBottom: '20px' }}>(Giảm 50% - Chỉ tốn $10 / tháng)</p>
                
                <ul style={{ color: theme.textLight, fontSize: '13px', lineHeight: '1.8', paddingLeft: '20px', margin: '0 0 20px 0' }}>
                    <li><b style={{color: theme.gold}}>Truy cập SWC Field:</b> Quyền truy cập gian hàng chọn lọc các dự án khởi nghiệp mạo hiểm.</li>
                    <li><b style={{color: theme.gold}}>Khóa giá cố định 5 năm:</b> Bảo vệ bạn khỏi sự lạm phát của phí dịch vụ.</li>
                    <li><b style={{color: theme.gold}}>Cập nhật miễn phí:</b> Tận hưởng mọi tính năng mở rộng tương lai mà không mất thêm phí.</li>
                    <li><b style={{color: theme.gold}}>Minh bạch 100%:</b> Quản lý qua SPV, triệt tiêu phí ẩn.</li>
                </ul>
                <a href={SWC_PASS_WEB} target="_blank" rel="noreferrer" style={{ display: 'block', background: 'linear-gradient(90deg, #F4D03F 0%, #D4AC0D 100%)', color: '#000', padding: '15px', borderRadius: '10px', fontWeight: '900', textDecoration: 'none', textAlign: 'center', fontSize: '15px', boxShadow: '0 4px 15px rgba(244, 208, 63, 0.3)' }}>
                    ĐĂNG KÝ GÓI PLUS NGAY
                </a>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '25px 20px', border: `1px solid ${theme.border}` }}>
                <h3 style={{ margin: '0 0 5px 0', color: theme.textLight, fontSize: '18px', textAlign: 'center', fontWeight: 'bold' }}>GÓI ESSENTIAL</h3>
                <div style={{ color: theme.textLight, fontSize: '28px', fontWeight: '900', textAlign: 'center', marginBottom: '5px' }}>
                    $240 <span style={{ fontSize: '14px', color: theme.textDim, fontWeight: 'normal' }}>/ 1 Năm</span>
                </div>
                <p style={{ textAlign: 'center', color: theme.textDim, fontSize: '13px', marginBottom: '20px' }}>(Chi phí $20 / tháng)</p>
                <a href={SWC_PASS_WEB} target="_blank" rel="noreferrer" style={{ display: 'block', backgroundColor: '#333', color: theme.textLight, padding: '14px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', fontSize: '14px' }}>
                    TÌM HIỂU THÊM
                </a>
            </div>
        </div>
    );

    const renderAtlas = () => (
        <div style={{ padding: '20px', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: '900', color: theme.gold, margin: '0 0 10px 0', textTransform: 'uppercase', textShadow: '0 2px 10px rgba(244, 208, 63, 0.2)' }}>TÂM ĐIỂM: ATLAS RWA</h2>
                <p style={{ color: theme.textDim, fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                    Tiên phong trong lĩnh vực Bất động sản số hóa (Real World Assets) tại UAE. Phá vỡ rào cản độc quyền, đưa BĐS triệu đô đến tay mọi nhà đầu tư.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '12px', borderLeft: `4px solid ${theme.gold}`, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ fontSize: '28px', marginBottom: '10px' }}>🌐</div>
                    <h3 style={{ margin: '0 0 8px 0', color: theme.gold, fontSize: '17px', fontWeight: '900', textTransform: 'uppercase' }}>Nền tảng Web 2.5 Ưu việt</h3>
                    <p style={{ margin: 0, color: theme.textLight, fontSize: '14px', lineHeight: '1.6', textAlign: 'justify' }}>
                        ATLAS không bắt bạn phải là chuyên gia Crypto. Nền tảng kết hợp sự minh bạch, tốc độ của Blockchain (Web3) với giao diện trực quan, dễ sử dụng và độ tin cậy của tiền pháp định (Web2).
                    </p>
                </div>

                <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '12px', borderLeft: `4px solid ${theme.gold}` }}>
                    <div style={{ fontSize: '28px', marginBottom: '10px' }}>⚡</div>
                    <h3 style={{ margin: '0 0 8px 0', color: theme.gold, fontSize: '17px', fontWeight: '900', textTransform: 'uppercase' }}>Thanh khoản Cực Nhanh</h3>
                    <p style={{ margin: 0, color: theme.textLight, fontSize: '14px', lineHeight: '1.6', textAlign: 'justify' }}>
                        Bất động sản truyền thống thường làm bạn chôn vốn hàng năm trời. Với ATLAS, thị trường thứ cấp được tích hợp ngay trong ứng dụng, cho phép bạn giao dịch bán lại cổ phần BĐS chỉ trong vài cú chạm.
                    </p>
                </div>

                <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '12px', borderLeft: `4px solid ${theme.gold}` }}>
                    <div style={{ fontSize: '28px', marginBottom: '10px' }}>⚖️</div>
                    <h3 style={{ margin: '0 0 8px 0', color: theme.gold, fontSize: '17px', fontWeight: '900', textTransform: 'uppercase' }}>Bảo Chứng Pháp Lý Dubai</h3>
                    <p style={{ margin: 0, color: theme.textLight, fontSize: '14px', lineHeight: '1.6', textAlign: 'justify' }}>
                        Mọi giao dịch được bảo vệ tối đa. Dự án hoạt động dưới pháp nhân pháp lý rõ ràng: <b>Atlas Overseas FZE</b>, được cấp phép chính thức bởi Cơ quan Trung tâm Thương mại Thế giới Dubai (DWTCA - Giấy phép 4219).
                    </p>
                </div>
            </div>

            <div style={{ textAlign: 'center', backgroundColor: 'rgba(255, 59, 48, 0.1)', padding: '25px 20px', borderRadius: '15px', border: `2px dashed ${theme.red}`, boxShadow: '0 0 15px rgba(255, 59, 48, 0.2)' }}>
                <div style={{ fontSize: '30px', marginBottom: '5px', animation: 'pulseGlowRed 1.5s infinite' }}>🚨</div>
                <h3 style={{ color: theme.red, fontSize: '18px', fontWeight: '900', margin: '0 0 10px 0', textTransform: 'uppercase' }}>CƠ HỘI SẮP KHÉP LẠI</h3>
                <p style={{ color: theme.textLight, fontSize: '14px', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                    Vòng gọi vốn kín ưu đãi dành riêng cho hệ thống nội bộ sẽ chính thức đóng vào ngày <b>31/03</b>. Đừng để lỡ nhịp đập của kỷ nguyên BĐS số hóa!
                </p>
                <a href={EVENT_WEBINAR_LINK} target="_blank" rel="noreferrer" style={{ display: 'block', backgroundColor: theme.red, color: '#fff', padding: '15px', borderRadius: '10px', fontWeight: '900', textDecoration: 'none', textAlign: 'center', fontSize: '15px', textTransform: 'uppercase', boxShadow: '0 4px 10px rgba(255, 59, 48, 0.4)' }}>
                    ĐĂNG KÝ WEBINAR TÌM HIỂU
                </a>
            </div>
        </div>
    );

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '90px', boxSizing: 'border-box' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                /* Hiệu ứng viền Avatar xoay và nhấp nháy */
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes pulseGlowRed {
                    0%, 100% { box-shadow: 0 0 5px #FF3B30, inset 0 0 5px #FF3B30; }
                    50% { box-shadow: 0 0 15px #FF3B30, inset 0 0 10px #FF3B30; }
                }
                @keyframes pulseGlowCyan {
                    0%, 100% { box-shadow: 0 0 5px #00FFFF, inset 0 0 5px #00FFFF; }
                    50% { box-shadow: 0 0 15px #00FFFF, inset 0 0 10px #00FFFF; }
                }

                .nav-item {
                    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
                    padding: 12px 0; cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); opacity: 0.5;
                }
                .nav-item.active {
                    opacity: 1; transform: translateY(-4px);
                }
                .nav-icon {
                    font-size: 24px; margin-bottom: 6px; transition: transform 0.3s;
                }
                .nav-item.active .nav-icon {
                    transform: scale(1.15);
                    text-shadow: 0 0 15px rgba(244, 208, 63, 0.8);
                }
            `}</style>
            
            {renderHeader()}

            <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                {activeTab === 'home' && renderHome()}
                {activeTab === 'pass' && renderPass()}
                {activeTab === 'atlas' && renderAtlas()}
            </div>

            {/* THANH ĐIỀU HƯỚNG BOTTOM TAB */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: theme.cardBg, borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-around', paddingBottom: 'env(safe-area-inset-bottom)', zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,0.5)' }}>
                
                <div onClick={() => setActiveTab('home')} className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} style={{ color: activeTab === 'home' ? theme.gold : theme.textDim }}>
                    <div className="nav-icon">🏠</div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sự Kiện</span>
                </div>
                
                <div onClick={() => setActiveTab('pass')} className={`nav-item ${activeTab === 'pass' ? 'active' : ''}`} style={{ color: activeTab === 'pass' ? theme.gold : theme.textDim }}>
                    <div className="nav-icon">💎</div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SWC Pass</span>
                </div>
                
                <div onClick={() => setActiveTab('atlas')} className={`nav-item ${activeTab === 'atlas' ? 'active' : ''}`} style={{ color: activeTab === 'atlas' ? theme.gold : theme.textDim }}>
                    <div className="nav-icon">🏢</div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ATLAS</span>
                </div>

            </div>
        </div>
    );
}

export default App;
