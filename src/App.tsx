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
                
                // Trích xuất Tên và Avatar từ Telegram
                setUserProfile({
                    name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                    username: user.username ? `@${user.username}` : '@nguoidung',
                    photoUrl: user.photo_url || ''
                });

                fetchUserData(uid);
            }
        }
    }, []);

    const handleSaveWallet = () => {
        if (!wallet) return alert("Vui lòng nhập địa chỉ ví!");
        fetch(`${BACKEND_URL}/api/save-wallet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, wallet })
        }).then(() => alert('✅ Đã lưu ví thành công!'));
    };

    // --------------------------------------------------
    // HEADER GỐC RKT (Avatar + Info)
    // --------------------------------------------------
    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: theme.bg }}>
            {/* Trái: Logo dự án */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#000', borderRadius: '50%', border: `1px solid ${theme.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.gold, fontWeight: 'bold', fontSize: '12px', marginRight: '10px' }}>
                    SWC
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: theme.textLight }}>CỘNG ĐỒNG</h1>
                    <p style={{ margin: 0, fontSize: '12px', color: theme.gold }}>Đầu tư uST</p>
                </div>
            </div>

            {/* Phải: User Info (Giống RKT) */}
            <div style={{ display: 'flex', alignItems: 'center', textAlign: 'right' }}>
                <div style={{ marginRight: '10px' }}>
                    <h2 style={{ margin: 0, fontSize: '15px', color: theme.textLight, fontWeight: 'bold' }}>{userProfile.name}</h2>
                    <p style={{ margin: 0, fontSize: '12px', color: theme.textDim }}>{userProfile.username}</p>
                </div>
                {/* Avatar */}
                {userProfile.photoUrl ? (
                    <img src={userProfile.photoUrl} alt="avatar" style={{ width: '45px', height: '45px', borderRadius: '50%', border: `2px solid ${theme.border}` }} />
                ) : (
                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: theme.cardBg, border: `2px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.gold }}>
                        👤
                    </div>
                )}
            </div>
        </div>
    );

    // --------------------------------------------------
    // TAB 1: TRANG CHỦ (HOME - Chuẩn RKT)
    // --------------------------------------------------
    const renderHome = () => (
        <div style={{ padding: '0 20px 20px 20px' }}>
            
            {/* 3 Ô THỐNG KÊ (Giống RKT) */}
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

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '15px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.textLight, margin: '0 0 15px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🎯 Cách Hoạt Động
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}><span style={{color: theme.textLight}}>📱 Bước 1:</span> Tham gia các Kênh/Nhóm của SWC.</p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}><span style={{color: theme.textLight}}>👥 Bước 2:</span> Mời bạn bè tham gia hệ sinh thái.</p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}><span style={{color: theme.textLight}}>💰 Bước 3:</span> Nhận thưởng SWGT tự động.</p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}><span style={{color: theme.textLight}}>🔒 Bước 4:</span> Rút về ví cá nhân an toàn.</p>
                </div>
            </div>
        </div>
    );

    // --------------------------------------------------
    // TAB VÍ VÀ PHẦN THƯỞNG (Rút gọn để tập trung)
    // --------------------------------------------------
    const renderWallet = () => (
        <div style={{ padding: '0 20px 20px 20px' }}>
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '25px 20px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    <p style={{ color: theme.textDim, fontSize: '14px', margin: 0 }}>Số dư hiện tại</p>
                    {/* Nút làm mới dữ liệu */}
                    <button onClick={() => fetchUserData(userId)} style={{ background: 'none', border: 'none', color: theme.gold, cursor: 'pointer', fontSize: '16px' }}>🔄</button>
                </div>
                <h1 style={{ color: theme.gold, margin: '15px 0', fontSize: '45px', fontWeight: '900' }}>
                    {balance} <span style={{fontSize: '20px', fontWeight: 'normal'}}>SWGT</span>
                </h1>
                
                <div style={{ marginTop: '25px', textAlign: 'left' }}>
                    <p style={{ color: theme.textDim, fontSize: '13px', marginBottom: '8px' }}>Địa chỉ ví SWGT (BEP20/ERC20):</p>
                    <input 
                        value={wallet}
                        onChange={(e) => setWallet(e.target.value)}
                        placeholder="Dán địa chỉ ví 0x... tại đây"
                        style={{ width: '100%', padding: '14px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: '#000', color: theme.gold, boxSizing: 'border-box' }}
                    />
                    <button onClick={handleSaveWallet} style={{ width: '100%', backgroundColor: theme.gold, color: '#000', padding: '14px', borderRadius: '8px', fontWeight: 'bold', border: 'none', marginTop: '12px', fontSize: '15px' }}>
                        LƯU ĐỊA CHỈ VÍ
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '80px', boxSizing: 'border-box' }}>
            {renderHeader()}
            
            <div style={{ marginTop: '10px' }}>
                {activeTab === 'home' && renderHome()}
                {activeTab === 'wallet' && renderWallet()}
                {activeTab === 'rewards' && <div style={{padding:'20px', color: '#fff', textAlign: 'center'}}>Đang phát triển tính năng đếm Ref...</div>}
            </div>

            {/* Thanh Điều Hướng */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: theme.cardBg, borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-around', padding: '12px 0', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', zIndex: 100 }}>
                <div onClick={() => setActiveTab('home')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'home' ? theme.gold : theme.textDim, width: '33%' }}>
                    <div style={{ fontSize: '22px', marginBottom: '4px' }}>🏠</div>
                    <span style={{ fontSize: '12px' }}>Trang chủ</span>
                </div>
                <div onClick={() => setActiveTab('rewards')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'rewards' ? theme.gold : theme.textDim, width: '33%' }}>
                    <div style={{ fontSize: '22px', marginBottom: '4px' }}>🎁</div>
                    <span style={{ fontSize: '12px' }}>Phần thưởng</span>
                </div>
                <div onClick={() => setActiveTab('wallet')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'wallet' ? theme.gold : theme.textDim, width: '33%' }}>
                    <div style={{ fontSize: '22px', marginBottom: '4px' }}>👛</div>
                    <span style={{ fontSize: '12px' }}>Ví</span>
                </div>
            </div>
        </div>
    );
}

export default App;
