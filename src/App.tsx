import { useState, useEffect } from 'react';

function App() {
    const [activeTab, setActiveTab] = useState('home');
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

    // Kết nối MongoDB để lấy thông tin User & Số lượng khách đã mời
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
                setUserId(uid);
                setUserProfile({
                    name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                    username: user.username ? `@${user.username}` : '@nguoidung',
                    photoUrl: user.photo_url || ''
                });
                fetchUserData(uid);
            }
        }
    }, []);

    // Giữ lại hệ thống Quân Hàm để vinh danh dựa trên số lượt giới thiệu
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

        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: theme.bg, borderBottom: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src="/logo.png" alt="SWC Logo" style={{ width: '45px', height: '45px', borderRadius: '50%', border: `2px solid ${theme.gold}`, marginRight: '12px', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=SWC&background=F4D03F&color=000'; }} />
                    <div>
                        <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: theme.gold, textTransform: 'uppercase' }}>SWC Viet Nam</h1>
                        <p style={{ margin: 0, fontSize: '11px', color: theme.textDim }}>Định hướng bởi Mr. Hồ Văn Lợi</p>
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', textAlign: 'right' }}>
                    <div style={{ marginRight: '15px' }}>
                        <h2 style={{ margin: 0, fontSize: '14px', color: theme.textLight, fontWeight: 'bold' }}>{userProfile.name}</h2>
                        <p style={{ margin: 0, fontSize: '12px', color: theme.gold, fontWeight: 'bold' }}>{militaryRank}</p>
                    </div>
                    
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', padding: '2px', backgroundColor: theme.bg, border: `2px solid ${wreathColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {userProfile.photoUrl ? (
                                <img src={userProfile.photoUrl} alt="avatar" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: theme.cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.gold, fontSize: '20px' }}>👤</div>
                            )}
                        </div>
                        <div style={{ position: 'absolute', bottom: '-8px', zIndex: 11, display: 'flex', alignItems: 'center', backgroundColor: '#000', padding: '2px 8px', borderRadius: '12px', border: `1px solid ${wreathColor}`, boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
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
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: theme.gold, margin: '0 0 10px 0', textTransform: 'uppercase', lineHeight: '1.3' }}>
                    Khai Mở Đại Dương Xanh
                </h1>
                <p style={{ color: theme.textDim, fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                    Kinh nghiệm quá khứ là nền tảng cho chiến lược mới. Lần đầu tiên, chúng tôi chính thức ra mắt dự án mới trên gian trưng bày <b style={{color: theme.textLight}}>SWC Field</b> với bộ lọc khắt khe và minh bạch nhất.
                </p>
            </div>

            <div style={{ backgroundColor: 'rgba(244, 208, 63, 0.1)', border: `1px solid ${theme.gold}`, borderRadius: '15px', padding: '20px', textAlign: 'center', marginBottom: '25px', boxShadow: '0 0 20px rgba(244, 208, 63, 0.15)' }}>
                <h2 style={{ fontSize: '18px', color: theme.textLight, margin: '0 0 5px 0' }}>⏰ ĐẾM NGƯỢC ĐẾN WEBINAR</h2>
                <p style={{ color: theme.gold, fontSize: '16px', fontWeight: 'bold', margin: '0 0 20px 0' }}>20:00 (VN) | Ngày 31/03/2026</p>
                <a href={WEBINAR_LINK} target="_blank" rel="noreferrer" style={{ display: 'block', backgroundColor: theme.gold, color: '#000', padding: '15px', borderRadius: '10px', fontWeight: '900', textDecoration: 'none', textTransform: 'uppercase', fontSize: '15px' }}>
                    Đăng Ký Giữ Chỗ Ngay
                </a>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '25px' }}>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px 5px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: 0, color: theme.textLight, fontSize: '20px', fontWeight: 'bold' }}>{referrals}</h3>
                    <p style={{ margin: '5px 0 0 0', color: theme.textDim, fontSize: '11px' }}>Mạng lưới đối tác</p>
                </div>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px 5px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: 0, color: isPremiumUser ? theme.premium : theme.gold, fontSize: '16px', fontWeight: 'bold', paddingTop: '3px' }}>
                        {isPremiumUser ? 'Premium⭐' : 'Thường'}
                    </h3>
                    <p style={{ margin: '6px 0 0 0', color: theme.textDim, fontSize: '11px' }}>Loại Tài khoản</p>
                </div>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', border: `1px solid ${theme.border}` }}>
                <h3 style={{ color: theme.gold, margin: '0 0 10px 0', fontSize: '16px' }}>🎁 ĐẶC QUYỀN BONUS</h3>
                <p style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 15px 0', lineHeight: '1.5' }}>
                    Tất cả những người tham gia đã đăng ký buổi phát sóng sẽ nhận được bộ tài liệu ĐỘC QUYỀN phân tích chuyên sâu về sự khác biệt của dự án mới.
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
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: theme.gold, margin: '0 0 10px 0', textTransform: 'uppercase' }}>ĐẶC QUYỀN SWC PASS</h2>
                <p style={{ color: theme.textDim, fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                    Tấm vé thông hành của giới tinh anh. Trọn bộ công cụ để xây dựng sự giàu có bền vững.
                </p>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '25px 20px', border: `1px solid ${theme.border}`, marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: theme.textLight, fontSize: '18px', textAlign: 'center' }}>GÓI ESSENTIAL</h3>
                <div style={{ color: theme.gold, fontSize: '30px', fontWeight: '900', textAlign: 'center', marginBottom: '5px' }}>
                    $240 <span style={{ fontSize: '14px', color: theme.textDim, fontWeight: 'normal' }}>/ 1 Năm</span>
                </div>
                <p style={{ textAlign: 'center', color: theme.textDim, fontSize: '12px', marginBottom: '20px' }}>(Chỉ $20 / tháng)</p>
                
                <ul style={{ color: theme.textLight, fontSize: '13px', lineHeight: '1.8', paddingLeft: '20px', margin: '0 0 20px 0' }}>
                    <li>Toàn quyền truy cập chiến lược <b>Road to $1M</b>.</li>
                    <li>Quyền truy cập vào <b>SWC Field</b> chọn lọc dự án.</li>
                    <li>Cấu trúc minh bạch qua SPV (Không phí ẩn).</li>
                </ul>
                <a href="https://swcpass.vn" target="_blank" rel="noreferrer" style={{ display: 'block', backgroundColor: '#333', color: theme.textLight, padding: '14px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', fontSize: '14px' }}>
                    TÌM HIỂU THÊM
                </a>
            </div>

            <div style={{ backgroundColor: 'rgba(244, 208, 63, 0.05)', borderRadius: '15px', padding: '25px 20px', border: `2px solid ${theme.gold}`, position: 'relative', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: theme.gold, color: '#000', padding: '5px 15px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>
                    ⭐ ĐƯỢC CHỌN NHIỀU NHẤT
                </div>
                <h3 style={{ margin: '0 0 10px 0', color: theme.gold, fontSize: '18px', textAlign: 'center', marginTop: '10px' }}>GÓI PLUS</h3>
                <div style={{ color: theme.gold, fontSize: '30px', fontWeight: '900', textAlign: 'center', marginBottom: '5px' }}>
                    $600 <span style={{ fontSize: '14px', color: theme.textDim, fontWeight: 'normal' }}>/ 5 Năm</span>
                </div>
                <p style={{ textAlign: 'center', color: theme.textDim, fontSize: '12px', marginBottom: '20px' }}>(Giảm 50% - Chỉ $10 / tháng)</p>
                
                <ul style={{ color: theme.textLight, fontSize: '13px', lineHeight: '1.8', paddingLeft: '20px', margin: '0 0 20px 0' }}>
                    <li style={{color: theme.gold}}>Bao gồm toàn bộ quyền lợi Gói Essential.</li>
                    <li><b>Khóa giá cố định</b> trong suốt 5 năm.</li>
                    <li>Miễn phí cập nhật tiện ích mở rộng tương lai.</li>
                    <li>Kỷ luật đầu tư dài hạn tận dụng Lãi kép.</li>
                </ul>
                <a href="https://swcpass.vn" target="_blank" rel="noreferrer" style={{ display: 'block', backgroundColor: theme.gold, color: '#000', padding: '14px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', fontSize: '14px' }}>
                    ĐĂNG KÝ VỊ THẾ 5 NĂM
                </a>
            </div>
        </div>
    );

    const renderAtlas = () => (
        <div style={{ padding: '20px', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: theme.gold, margin: '0 0 10px 0', textTransform: 'uppercase' }}>TÂM ĐIỂM: ATLAS</h2>
                <p style={{ color: theme.textDim, fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                    Tương lai của Bất động sản số hóa (RWA) tại UAE và Toàn cầu.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '12px', borderLeft: `4px solid ${theme.gold}` }}>
                    <h3 style={{ margin: '0 0 8px 0', color: theme.textLight, fontSize: '16px' }}>Cơ sở hạ tầng RWA & Web 2.5</h3>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px', lineHeight: '1.5' }}>
                        Kết hợp hiệu quả tốc độ của blockchain với độ tin cậy tuyệt đối của tiền pháp định. Dân chủ hóa việc tiếp cận huy động vốn vào bất động sản.
                    </p>
                </div>

                <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '12px', borderLeft: `4px solid ${theme.gold}` }}>
                    <h3 style={{ margin: '0 0 8px 0', color: theme.textLight, fontSize: '16px' }}>Thanh khoản Cực Nhanh</h3>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px', lineHeight: '1.5' }}>
                        Thị trường thứ cấp được tích hợp ngay trong ứng dụng. Bạn có thể giao dịch các cổ phần bất động sản của mình một cách dễ dàng và minh bạch.
                    </p>
                </div>

                <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '12px', borderLeft: `4px solid ${theme.gold}` }}>
                    <h3 style={{ margin: '0 0 8px 0', color: theme.textLight, fontSize: '16px' }}>Bảo Chứng Pháp Lý</h3>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px', lineHeight: '1.5' }}>
                        Hoạt động dưới pháp nhân Atlas Overseas FZE, được cấp phép chính thức bởi Cơ quan Trung tâm Thương mại Thế giới Dubai.
                    </p>
                </div>
            </div>

            <div style={{ textAlign: 'center', backgroundColor: 'rgba(255, 59, 48, 0.1)', padding: '20px', borderRadius: '15px', border: `1px dashed ${theme.red}` }}>
                <p style={{ color: theme.red, fontSize: '14px', fontWeight: 'bold', margin: '0 0 15px 0' }}>⚠️ Vòng kín tốt nhất sẽ khép lại vào 31/03!</p>
                <a href="https://swcfield.com" target="_blank" rel="noreferrer" style={{ display: 'block', backgroundColor: theme.red, color: '#fff', padding: '14px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', fontSize: '14px' }}>
                    TRUY CẬP SWC FIELD
                </a>
            </div>
        </div>
    );

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '80px', boxSizing: 'border-box' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                .nav-item {
                    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
                    padding: 10px 0; cursor: pointer; transition: all 0.3s; opacity: 0.5;
                }
                .nav-item.active {
                    opacity: 1; transform: translateY(-3px);
                }
                .nav-icon {
                    font-size: 24px; margin-bottom: 4px; transition: transform 0.3s;
                }
                .nav-item.active .nav-icon {
                    transform: scale(1.1);
                    text-shadow: 0 0 10px rgba(244, 208, 63, 0.5);
                }
            `}</style>
            
            {renderHeader()}

            <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                {activeTab === 'home' && renderHome()}
                {activeTab === 'pass' && renderPass()}
                {activeTab === 'atlas' && renderAtlas()}
            </div>

            {/* THANH ĐIỀU HƯỚNG BOTTOM TAB */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: theme.cardBg, borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-around', paddingBottom: 'env(safe-area-inset-bottom)', zIndex: 100 }}>
                
                <div onClick={() => setActiveTab('home')} className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} style={{ color: activeTab === 'home' ? theme.gold : theme.textDim }}>
                    <div className="nav-icon">🏠</div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Sự Kiện</span>
                </div>
                
                <div onClick={() => setActiveTab('pass')} className={`nav-item ${activeTab === 'pass' ? 'active' : ''}`} style={{ color: activeTab === 'pass' ? theme.gold : theme.textDim }}>
                    <div className="nav-icon">💎</div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>SWC Pass</span>
                </div>
                
                <div onClick={() => setActiveTab('atlas')} className={`nav-item ${activeTab === 'atlas' ? 'active' : ''}`} style={{ color: activeTab === 'atlas' ? theme.gold : theme.textDim }}>
                    <div className="nav-icon">🏢</div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>ATLAS</span>
                </div>

            </div>
        </div>
    );
}

export default App;
