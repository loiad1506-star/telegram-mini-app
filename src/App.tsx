import { useState, useEffect } from 'react';

function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [balance, setBalance] = useState(0);
    const [wallet, setWallet] = useState('');
    
    // Lưu trữ thông tin thật từ Telegram
    const [userId, setUserId] = useState('');
    const [userProfile, setUserProfile] = useState({
        name: 'Đang tải...',
        username: '',
        photoUrl: ''
    });

    const BACKEND_URL = 'https://swc-bot-backend.onrender.com';

    const theme = {
        bg: '#0F0F0F',        
        cardBg: '#1C1C1E',    
        gold: '#F4D03F',      
        textLight: '#FFFFFF', 
        textDim: '#8E8E93',   
        border: '#333333'     
    };

    // HÀM ÉP LẤY DỮ LIỆU TỪ BACKEND
    const fetchUserData = (uid: string) => {
        fetch(`${BACKEND_URL}/api/user?id=${uid}`)
            .then(res => res.json())
            .then(data => {
                setBalance(data.balance || 0);
                if (data.wallet) setWallet(data.wallet);
            })
            .catch(err => console.error("Lỗi:", err));
    };

    // KHI VỪA MỞ APP
    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp;
        if (tg) {
            tg.ready();
            tg.expand();
            const user = tg.initDataUnsafe?.user;
            if (user) {
                const uid = user.id.toString();
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

    // HÀM LƯU VÍ
    const handleSaveWallet = () => {
        if (!wallet) return alert("Vui lòng nhập địa chỉ ví!");
        fetch(`${BACKEND_URL}/api/save-wallet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, wallet })
        }).then(() => alert('✅ Đã lưu ví thành công!'));
    };

    // HÀM SAO CHÉP LINK GIỚI THIỆU
    const handleCopyLink = () => {
        const link = `https://t.me/Dau_Tu_SWC_bot?start=${userId || 'ref'}`;
        navigator.clipboard.writeText(link)
            .then(() => alert('✅ Đã sao chép link giới thiệu thành công!'))
            .catch(() => alert('❌ Lỗi sao chép. Vui lòng thử lại!'));
    };

    // --------------------------------------------------
    // HEADER GỐC SWC (Avatar + Info)
    // --------------------------------------------------
    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: theme.bg }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#000', borderRadius: '50%', border: `1px solid ${theme.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.gold, fontWeight: 'bold', fontSize: '12px', marginRight: '10px' }}>
                    SWC
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: theme.textLight }}>CỘNG ĐỒNG</h1>
                    <p style={{ margin: 0, fontSize: '12px', color: theme.gold }}>Đầu tư uST</p>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', textAlign: 'right' }}>
                <div style={{ marginRight: '10px' }}>
                    <h2 style={{ margin: 0, fontSize: '15px', color: theme.textLight, fontWeight: 'bold' }}>{userProfile.name}</h2>
                    <p style={{ margin: 0, fontSize: '12px', color: theme.textDim }}>{userProfile.username}</p>
                </div>
                {userProfile.photoUrl ? (
                    <img src={userProfile.photoUrl} alt="avatar" style={{ width: '45px', height: '45px', borderRadius: '50%', border: `2px solid ${theme.border}` }} />
                ) : (
                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: theme.cardBg, border: `2px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.gold }}>👤</div>
                )}
            </div>
        </div>
    );

    // --------------------------------------------------
    // TAB 1: TRANG CHỦ (HOME)
    // --------------------------------------------------
    const renderHome = () => (
        <div style={{ padding: '0 20px 20px 20px' }}>
            {/* 3 Ô THỐNG KÊ */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '25px' }}>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px 5px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: 0, color: theme.gold, fontSize: '18px', fontWeight: 'bold' }}>{balance}</h3>
                    <p style={{ margin: '5px 0 0 0', color: theme.textDim, fontSize: '11px' }}>Số dư SWGT</p>
                </div>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px 5px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: 0, color: theme.gold, fontSize: '18px', fontWeight: 'bold' }}>0</h3>
                    <p style={{ margin: '5px 0 0 0', color: theme.textDim, fontSize: '11px' }}>Đã mời</p>
                </div>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px 5px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: 0, color: theme.gold, fontSize: '18px', fontWeight: 'bold' }}>Thường</h3>
                    <p style={{ margin: '5px 0 0 0', color: theme.textDim, fontSize: '11px' }}>Hạng Tài khoản</p>
                </div>
            </div>

            {/* CÁCH HOẠT ĐỘNG */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '15px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.textLight, margin: '0 0 15px 0', fontSize: '16px' }}>🎯 Cách Hoạt Động</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px', lineHeight: '1.5' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>📱 Bước 1: Tham gia Bot SWC</span><br/>Liên kết với @Dau_Tu_SWC_bot trên Telegram để bắt đầu.</p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px', lineHeight: '1.5' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>👥 Bước 2: Mời bạn bè</span><br/>Chia sẻ link giới thiệu và mời bạn bè tham gia cộng đồng SWC.</p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px', lineHeight: '1.5' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>💰 Bước 3: Nhận SWGT</span><br/>Mỗi người bạn mời (Nick Premium & Nick thường đủ điều kiện bên dưới) sẽ giúp bạn kiếm SWGT thưởng.</p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px', lineHeight: '1.5' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>🔓 Bước 4: Rút tiền</span><br/>Rút ngay khi đạt 500 SWGT & đợi 30 ngày.</p>
                </div>
            </div>

            {/* CƠ CẤU PHẦN THƯỞNG */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '15px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.gold, margin: '0 0 15px 0', fontSize: '16px' }}>💎 Cơ Cấu Phần Thưởng SWGT</h2>
                
                <p style={{ color: theme.textLight, fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>📌 Thành viên Thường sẽ được nhận thưởng khi đáp ứng các điều kiện sau:</p>
                <ul style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 15px 0', paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li>Tham gia Channel (Nhóm chính): <span style={{color: '#34C759'}}>+10 SWGT/người</span></li>
                    <li>Tham gia Nhóm Chat (Chat 2 dòng trên nhóm): <span style={{color: '#34C759'}}>+10 SWGT/người</span></li>
                </ul>

                <p style={{ color: theme.gold, fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>⭐ Thành Viên Premium (+5 SWGT)</p>
                <ul style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 10px 0', paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li>Tham gia Channel (Nhóm chính): <span style={{color: '#34C759'}}>+20 SWGT/người</span></li>
                    <li>Tham gia Nhóm Chat (Chat 2 dòng trên nhóm): <span style={{color: '#34C759'}}>+20 SWGT/người</span></li>
                </ul>
                <p style={{ color: '#5E92F3', fontSize: '13px', fontWeight: 'bold', margin: 0 }}>💫 Cộng ngay: +5 SWGT bonus!</p>
            </div>

            {/* ĐIỀU KIỆN RÚT TIỀN */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '15px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.textLight, margin: '0 0 15px 0', fontSize: '16px' }}>⏱️ Điều Kiện Rút Tiền</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}>✓ Tối thiểu: <span style={{color: theme.textLight, fontWeight: 'bold'}}>500 SWGT/Tài Khoản</span></p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}>✓ Thời gian: <span style={{color: theme.textLight, fontWeight: 'bold'}}>Sau 30 ngày unlock</span></p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}>✓ Rút linh hoạt: <span style={{color: theme.textLight, fontWeight: 'bold'}}>Có thể rút bất cứ lúc nào sau khi đạt điều kiện</span></p>
                </div>
            </div>

            {/* TÍNH NĂNG ĐANG BỔ SUNG */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.textLight, margin: '0 0 15px 0', fontSize: '14px', textTransform: 'uppercase' }}>Các tính năng đang bổ sung</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ backgroundColor: '#000', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, textAlign: 'center', color: theme.textDim, fontSize: '12px' }}>Cấp Độ Thành Viên</div>
                    <div style={{ backgroundColor: '#000', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, textAlign: 'center', color: theme.textDim, fontSize: '12px' }}>Kiếm SWGT Nhanh Chóng</div>
                    <div style={{ backgroundColor: '#000', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, textAlign: 'center', color: theme.textDim, fontSize: '12px' }}>Mục Tiêu Rõ Ràng</div>
                    <div style={{ backgroundColor: '#000', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, textAlign: 'center', color: theme.textDim, fontSize: '12px' }}>An Toàn & Bảo Mật</div>
                </div>
            </div>
        </div>
    );

    // --------------------------------------------------
    // TAB 2: PHẦN THƯỞNG (REWARDS)
    // --------------------------------------------------
    const renderRewards = () => (
        <div style={{ padding: '0 20px 20px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <h2 style={{ color: theme.gold, margin: '0 0 5px 0', fontSize: '20px' }}>Chương trình giới thiệu</h2>
                <p style={{ color: theme.textDim, fontSize: '14px', margin: 0 }}>Mời bạn bè, nhận thưởng ngay</p>
            </div>

            {/* COPY LINK */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '15px', border: `1px solid ${theme.border}` }}>
                <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '8px', color: theme.gold, fontSize: '14px', wordBreak: 'break-all', marginBottom: '15px', border: `1px dashed ${theme.border}` }}>
                    https://t.me/Dau_Tu_SWC_bot?start={userId || 'ref'}
                </div>
                <button onClick={handleCopyLink} style={{ width: '100%', backgroundColor: theme.gold, color: '#000', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '15px', cursor: 'pointer' }}>
                    📋 SAO CHÉP LINK ĐỂ MỜI
                </button>
            </div>

            {/* ĐIỀU KIỆN NHẬN THƯỞNG */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '15px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.textLight, margin: '0 0 15px 0', fontSize: '15px' }}>Điều kiện nhận thưởng</h2>
                <p style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 8px 0' }}>• Người được mời phải vào Group chính</p>
                <p style={{ color: theme.textDim, fontSize: '13px', margin: 0, lineHeight: '1.5' }}>• Tài khoản người được mời phải hợp lệ<br/>(tài khoản thật, không spam)</p>
            </div>

            {/* THỐNG KÊ */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
                    <p style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 5px 0' }}>Số người bạn đã mời</p>
                    <h2 style={{ color: theme.gold, margin: 0, fontSize: '24px' }}>0</h2>
                </div>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
                    <p style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 5px 0' }}>Lịch sử thưởng</p>
                    <p style={{ color: theme.textLight, fontSize: '12px', margin: 0, fontStyle: 'italic' }}>Chưa có</p>
                </div>
            </div>
        </div>
    );

    // --------------------------------------------------
    // TAB 3: VÍ (WALLET)
    // --------------------------------------------------
    const renderWallet = () => (
        <div style={{ padding: '0 20px 20px 20px' }}>
            
            {/* SỐ DƯ */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '25px 20px', border: `1px solid ${theme.border}`, textAlign: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    <p style={{ color: theme.textDim, fontSize: '14px', margin: 0 }}>Số dư hiện tại</p>
                    <button onClick={() => fetchUserData(userId)} style={{ background: 'none', border: 'none', color: theme.gold, cursor: 'pointer', fontSize: '16px' }}>🔄</button>
                </div>
                <h1 style={{ color: theme.gold, margin: '15px 0', fontSize: '45px', fontWeight: '900' }}>
                    {balance} <span style={{fontSize: '20px', fontWeight: 'normal'}}>SWGT</span>
                </h1>
                <button style={{ width: '100%', backgroundColor: '#333', color: theme.textDim, padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '15px' }}>
                    🔒 Chưa đủ điều kiện rút
                </button>
            </div>

            {/* TIẾN ĐỘ RÚT TIỀN */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '15px', border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px' }}>
                    <span style={{ color: theme.textLight, fontSize: '14px' }}>Số người đã giới thiệu</span>
                    <span style={{ color: theme.gold, fontSize: '16px', fontWeight: 'bold' }}>0</span>
                </div>
                
                <p style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 10px 0' }}>• Thời gian → Unlock sau 3 tháng <span style={{color: '#34C759'}}>✓</span></p>
                <p style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 15px 0' }}>• Ít nhất 500 SWGT thưởng → Được rút thưởng <span style={{color: '#34C759'}}>✓</span></p>
                
                <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <p style={{ color: theme.textDim, fontSize: '12px', margin: '0 0 10px 0' }}>Thời gian mở khoá</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ padding: '8px 15px', backgroundColor: '#222', borderRadius: '6px', color: theme.textLight, fontSize: '14px', fontWeight: 'bold' }}>Ngày</div>
                        <div style={{ padding: '8px 15px', backgroundColor: '#222', borderRadius: '6px', color: theme.textLight, fontSize: '14px', fontWeight: 'bold' }}>Tháng</div>
                        <div style={{ padding: '8px 15px', backgroundColor: '#222', borderRadius: '6px', color: theme.textLight, fontSize: '14px', fontWeight: 'bold' }}>Năm</div>
                    </div>
                    <p style={{ color: theme.gold, fontSize: '11px', margin: 0, fontStyle: 'italic' }}>Hết thời gian trên → sẽ mở ngay lập tức</p>
                </div>
            </div>

            {/* LƯU ĐỊA CHỈ VÍ */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '15px', border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '18px' }}>🛡️</span>
                    <div>
                        <h3 style={{ margin: 0, color: theme.textLight, fontSize: '14px' }}>Bảo mật cao</h3>
                        <p style={{ margin: 0, color: theme.textDim, fontSize: '12px' }}>Liên kết ví SWGT an toàn</p>
                    </div>
                </div>
                <input 
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    placeholder="Dán địa chỉ ví Gate.io (BEP20) tại đây"
                    style={{ width: '100%', padding: '14px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: '#000', color: theme.gold, boxSizing: 'border-box', marginBottom: '10px', fontSize: '13px' }}
                />
                <button onClick={handleSaveWallet} style={{ width: '100%', backgroundColor: theme.gold, color: '#000', padding: '12px', borderRadius: '8px', fontWeight: 'bold', border: 'none', fontSize: '14px' }}>
                    LƯU ĐỊA CHỈ VÍ
                </button>
            </div>

            {/* HỖ TRỢ & LỊCH SỬ */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: '0 0 5px 0', color: theme.textLight, fontSize: '13px' }}>Hỗ trợ 24/7</h3>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '11px' }}>Liên hệ ngay nếu cần trợ giúp</p>
                </div>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: '0 0 5px 0', color: theme.textLight, fontSize: '13px' }}>Lịch sử giao dịch</h3>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '11px' }}>Chưa có giao dịch nào</p>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '80px', boxSizing: 'border-box' }}>
            {renderHeader()}
            
            <div style={{ marginTop: '5px' }}>
                {activeTab === 'home' && renderHome()}
                {activeTab === 'rewards' && renderRewards()}
                {activeTab === 'wallet' && renderWallet()}
            </div>

            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: theme.cardBg, borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-around', padding: '12px 0', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', zIndex: 100 }}>
                <div onClick={() => setActiveTab('home')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'home' ? theme.gold : theme.textDim, width: '33%', cursor: 'pointer' }}>
                    <div style={{ fontSize: '22px', marginBottom: '4px' }}>🏠</div>
                    <span style={{ fontSize: '12px' }}>Trang chủ</span>
                </div>
                <div onClick={() => setActiveTab('rewards')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'rewards' ? theme.gold : theme.textDim, width: '33%', cursor: 'pointer' }}>
                    <div style={{ fontSize: '22px', marginBottom: '4px' }}>🎁</div>
                    <span style={{ fontSize: '12px' }}>Phần thưởng</span>
                </div>
                <div onClick={() => setActiveTab('wallet')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'wallet' ? theme.gold : theme.textDim, width: '33%', cursor: 'pointer' }}>
                    <div style={{ fontSize: '22px', marginBottom: '4px' }}>👛</div>
                    <span style={{ fontSize: '12px' }}>Ví</span>
                </div>
            </div>
        </div>
    );
}

export default App;
