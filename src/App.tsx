import { useState, useEffect } from 'react';

function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [balance, setBalance] = useState(0);
    const [wallet, setWallet] = useState('');
    const [referrals, setReferrals] = useState(0); 
    
    const [userId, setUserId] = useState('');
    const [userProfile, setUserProfile] = useState({
        name: 'Đang tải...',
        username: '',
        photoUrl: ''
    });

    const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    const BACKEND_URL = 'https://swc-bot-brain.onrender.com';

    const theme = {
        bg: '#0F0F0F',        
        cardBg: '#1C1C1E',    
        gold: '#F4D03F',      
        textLight: '#FFFFFF', 
        textDim: '#8E8E93',   
        border: '#333333',
        green: '#34C759'      
    };

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
    
    useEffect(() => {
        const unlockDate = new Date("2026-12-31T00:00:00").getTime(); 
        const interval = setInterval(() => {
            const distance = unlockDate - new Date().getTime();
            if (distance > 0) {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    secs: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchUserData = (uid: string) => {
        fetch(`${BACKEND_URL}/api/user?id=${uid}`)
            .then(res => res.json())
            .then(data => {
                setBalance(data.balance || 0);
                if (data.wallet) setWallet(data.wallet);
                setReferrals(data.referralCount || 0); 
                if (data.lastCheckInDate) setLastCheckIn(data.lastCheckInDate);
            })
            .catch(err => console.error("Lỗi:", err));
    };

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
        
        fetch(`${BACKEND_URL}/api/leaderboard`)
            .then(res => res.json())
            .then(data => setLeaderboard(data))
            .catch(() => {});
    }, []);

    const isCheckedInToday = lastCheckIn ? new Date(lastCheckIn).toDateString() === new Date().toDateString() : false;

    const handleCheckIn = () => {
        if (isCheckedInToday) return;
        fetch(`${BACKEND_URL}/api/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        }).then(res => res.json()).then(data => {
            if (data.success) {
                setBalance(data.balance);
                setLastCheckIn(data.lastCheckInDate);
                alert("🎉 Tuyệt vời! Bạn nhận được +2 SWGT cho hôm nay.");
            }
        }).catch(() => alert("⚠️ Lỗi kết nối, vui lòng thử lại sau!"));
    };

    const handleSaveWallet = () => {
        if (!wallet) return alert("Vui lòng nhập địa chỉ ví!");
        fetch(`${BACKEND_URL}/api/save-wallet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, wallet })
        }).then(() => alert('✅ Đã lưu/cập nhật ví thành công!'));
    };

    const redeemItem = (itemName: string, cost: number) => {
        if (balance < cost) return alert(`⚠️ Bạn cần thêm ${cost - balance} SWGT nữa để đổi quyền lợi này!`);
        if (window.confirm(`Xác nhận dùng ${cost} SWGT để đổi ${itemName}?`)) {
            fetch(`${BACKEND_URL}/api/redeem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, itemName, cost })
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    setBalance(data.balance);
                    alert("🎉 Đổi quà thành công! Admin sẽ liên hệ bạn sớm qua Telegram.");
                }
            });
        }
    };

    // Bước 2.1: THÊM HÀM XỬ LÝ RÚT TIỀN
    const handleWithdraw = () => {
        if (!wallet) {
            return alert("⚠️ Vui lòng lướt xuống dưới và lưu địa chỉ ví Gate.io trước khi rút tiền!");
        }
        if (balance < 50) {
            return alert("⚠️ Bạn cần tối thiểu 50 SWGT để rút!");
        }
        if (window.confirm(`Xác nhận yêu cầu rút toàn bộ ${balance} SWGT về ví đã đăng ký?`)) {
            fetch(`${BACKEND_URL}/api/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    setBalance(data.balance);
                    alert("💸 Yêu cầu rút tiền đã được gửi! Vui lòng kiểm tra tin nhắn từ Bot.");
                } else {
                    alert(data.message || "❌ Có lỗi xảy ra hoặc chưa đủ điều kiện!");
                }
            })
            .catch(() => alert('❌ Lỗi kết nối đến máy chủ!'));
        }
    };

    const handleCopyLink = () => {
        const link = `https://t.me/Dau_Tu_SWC_bot?start=${userId || 'ref'}`;
        navigator.clipboard.writeText(link)
            .then(() => alert('✅ Đã sao chép link giới thiệu thành công!'))
            .catch(() => alert('❌ Lỗi sao chép. Vui lòng thử lại!'));
    };

    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: theme.bg }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', border: `2px solid ${theme.gold}`, marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.cardBg, color: theme.gold, fontWeight: 'bold' }}>SWC</div>
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

    const renderHome = () => (
        <div style={{ padding: '0 20px 20px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '20px' }}>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px 5px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: 0, color: theme.gold, fontSize: '18px', fontWeight: 'bold' }}>{balance}</h3>
                    <p style={{ margin: '5px 0 0 0', color: theme.textDim, fontSize: '11px' }}>Số dư SWGT</p>
                </div>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px 5px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: 0, color: theme.gold, fontSize: '18px', fontWeight: 'bold' }}>{referrals}</h3>
                    <p style={{ margin: '5px 0 0 0', color: theme.textDim, fontSize: '11px' }}>Đã mời</p>
                </div>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px 5px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: 0, color: theme.gold, fontSize: '18px', fontWeight: 'bold' }}>Thường</h3>
                    <p style={{ margin: '5px 0 0 0', color: theme.textDim, fontSize: '11px' }}>Hạng Tài khoản</p>
                </div>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '15px', textAlign: 'center', border: `1px solid ${theme.border}`, marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '15px' }}>📅 Điểm Danh Hàng Ngày</h3>
                <button 
                    onClick={handleCheckIn} 
                    disabled={isCheckedInToday}
                    style={{ width: '100%', backgroundColor: isCheckedInToday ? '#333' : theme.green, color: isCheckedInToday ? theme.textDim : '#fff', padding: '12px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: isCheckedInToday ? 'not-allowed' : 'pointer' }}
                >
                    {isCheckedInToday ? "✅ ĐÃ ĐIỂM DANH HÔM NAY" : "✋ ĐIỂM DANH NHẬN +2 SWGT"}
                </button>
            </div>

            {/* Các phần khác của Home giữ nguyên như code cũ của bạn */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '15px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.textLight, margin: '0 0 15px 0', fontSize: '16px' }}>🎯 Cách Hoạt Động</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px', lineHeight: '1.5' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>📱 Bước 1: Tham gia Bot SWC</span><br/>Liên kết với @Dau_Tu_SWC_bot</p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px', lineHeight: '1.5' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>👥 Bước 2: Mời bạn bè</span><br/>Chia sẻ link giới thiệu</p>
                    <div style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)', border: `1px dashed ${theme.green}`, padding: '12px', borderRadius: '8px' }}>
                        <p style={{ margin: 0, color: theme.green, fontSize: '13px' }}>
                           Chat trong Nhóm Thảo Luận để nhận <b style={{color: theme.gold}}>+0.3 SWGT</b> mỗi tin nhắn!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderRewards = () => {
        let nextTarget = 10;
        let nextReward = "+50 SWGT";
        if (referrals >= 10 && referrals < 50) { nextTarget = 50; nextReward = "+300 SWGT"; }
        else if (referrals >= 50) { nextTarget = 100; nextReward = "+1000 SWGT"; }
        const progressPercent = Math.min((referrals / nextTarget) * 100, 100);

        return (
            <div style={{ padding: '0 20px 20px 20px', paddingBottom: '100px' }}>
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '5px' }}>🎁</div>
                    <h2 style={{ color: theme.gold, margin: '0 0 5px 0', fontSize: '20px' }}>Trung Tâm Thu Nhập</h2>
                </div>
                {/* Phần rương thưởng giữ nguyên logic của bạn */}
                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <h2 style={{ margin: 0, color: theme.textLight, fontSize: '24px' }}>{referrals} <span style={{fontSize:'14px', color: theme.textDim}}>người</span></h2>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, color: theme.gold, fontSize: '12px', fontWeight: 'bold' }}>Mục tiêu: {nextTarget}</p>
                            <p style={{ margin: 0, color: theme.green, fontSize: '13px', fontWeight: 'bold' }}>{nextReward}</p>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: '#333', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: theme.gold }}></div>
                    </div>
                </div>
                {/* Các nút Copy/Share giữ nguyên */}
            </div>
        );
    };

    // Bước 2.2: THAY THẾ TOÀN BỘ HÀM renderWallet
    const renderWallet = () => (
        <div style={{ padding: '0 20px 20px 20px' }}>
            
            {/* SỐ DƯ VÀ NÚT RÚT TIỀN */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '25px 20px', border: `1px solid ${theme.border}`, textAlign: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    <p style={{ color: theme.textDim, fontSize: '14px', margin: 0 }}>Số dư hiện tại</p>
                    <button onClick={() => fetchUserData(userId)} style={{ background: 'none', border: 'none', color: theme.gold, cursor: 'pointer', fontSize: '16px' }}>🔄</button>
                </div>
                <h1 style={{ color: theme.gold, margin: '15px 0', fontSize: '45px', fontWeight: '900' }}>
                    {balance} <span style={{fontSize: '20px', fontWeight: 'normal'}}>SWGT</span>
                </h1>
                
                {/* LOGIC NÚT RÚT TIỀN THÔNG MINH */}
                {balance >= 50 ? (
                    <button onClick={handleWithdraw} style={{ width: '100%', backgroundColor: theme.green, color: '#fff', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(52, 199, 89, 0.3)' }}>
                        💸 YÊU CẦU RÚT TIỀN NGAY
                    </button>
                ) : (
                    <button style={{ width: '100%', backgroundColor: '#333', color: theme.textDim, padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '15px', cursor: 'not-allowed' }}>
                        🔒 Chưa đủ điều kiện (Cần 50 SWGT)
                    </button>
                )}
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '15px', border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px' }}>
                    <span style={{ color: theme.textLight, fontSize: '14px' }}>Số người đã giới thiệu</span>
                    <span style={{ color: theme.gold, fontSize: '16px', fontWeight: 'bold' }}>{referrals}</span>
                </div>
                
                <p style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 10px 0' }}>• Thời gian → Đang mở khoá test <span style={{color: '#34C759'}}>✓</span></p>
                <p style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 15px 0' }}>• Đạt 50 SWGT thưởng → Được rút <span style={{color: balance >= 50 ? '#34C759' : theme.textDim}}>{balance >= 50 ? '✓' : '✗'}</span></p>
                
                <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <p style={{ color: theme.textDim, fontSize: '12px', margin: '0 0 10px 0' }}>Thời gian mở khoá chính thức</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ padding: '8px 12px', backgroundColor: '#222', borderRadius: '6px', color: theme.textLight, fontSize: '14px', fontWeight: 'bold' }}>{timeLeft.days} <span style={{fontSize:'10px', color: theme.textDim, fontWeight:'normal'}}>Ngày</span></div>
                        <div style={{ padding: '8px 12px', backgroundColor: '#222', borderRadius: '6px', color: theme.textLight, fontSize: '14px', fontWeight: 'bold' }}>{timeLeft.hours} <span style={{fontSize:'10px', color: theme.textDim, fontWeight:'normal'}}>Giờ</span></div>
                        <div style={{ padding: '8px 12px', backgroundColor: '#222', borderRadius: '6px', color: theme.textLight, fontSize: '14px', fontWeight: 'bold' }}>{timeLeft.mins} <span style={{fontSize:'10px', color: theme.textDim, fontWeight:'normal'}}>Phút</span></div>
                    </div>
                </div>
            </div>

            {/* LƯU ĐỊA CHỈ VÍ */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
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
                    {wallet ? "CẬP NHẬT ĐỊA CHỈ VÍ" : "LƯU ĐỊA CHỈ VÍ"}
                </button>
            </div>

            <h3 style={{color: '#fff', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '15px', fontSize: '15px'}}>💎 KHO ĐẶC QUYỀN VIP</h3>
            
            <div style={{ backgroundColor: theme.cardBg, padding: '15px', borderRadius: '10px', marginBottom: '15px', border: `1px solid ${theme.border}`}}>
                <h4 style={{margin: '0 0 5px 0', color: '#5E92F3', fontSize: '14px'}}>☕ Cà Phê Chiến Lược (Bản Test)</h4>
                <p style={{fontSize: '12px', color: theme.textDim, margin: '0 0 10px 0'}}>Thảo luận danh mục đầu tư trực tiếp tại Ucity Coffee.</p>
                <button onClick={() => redeemItem('Cà Phê Chiến Lược (Test)', 50)} style={{backgroundColor: '#5E92F3', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer'}}>Đổi lấy: 50 SWGT</button>
            </div>

            <div style={{ backgroundColor: theme.cardBg, padding: '15px', borderRadius: '10px', marginBottom: '25px', border: `1px solid ${theme.border}`}}>
                <h4 style={{margin: '0 0 5px 0', color: '#34C759', fontSize: '14px'}}>🔓 Mở Khóa Group Private</h4>
                <p style={{fontSize: '12px', color: theme.textDim, margin: '0 0 10px 0'}}>Nhận tín hiệu thị trường và Zoom kín hàng tuần.</p>
                <button onClick={() => redeemItem('Group Private', 500)} style={{backgroundColor: '#34C759', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer'}}>Đổi lấy: 500 SWGT</button>
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
