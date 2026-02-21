import { useState, useEffect } from 'react';

function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [balance, setBalance] = useState(0);
    const [wallet, setWallet] = useState('');
    const [isWalletSaved, setIsWalletSaved] = useState(false);
    const [userId, setUserId] = useState('');
    
    // Trạng thái mới cho Điểm danh và Leaderboard
    const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    const BACKEND_URL = 'https://swc-bot-backend.onrender.com'; 
    const theme = { bg: '#0F0F0F', cardBg: '#1C1C1E', gold: '#F4D03F', textLight: '#FFFFFF', textDim: '#8E8E93', border: '#333333', green: '#34C759' };

    // --- ĐỒNG HỒ ĐẾM NGƯỢC ---
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

    // --- NỐI DÂY LẤY DỮ LIỆU CHÍNH & TOP 10 ---
    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp;
        if (tg) {
            tg.ready();
            const user = tg.initDataUnsafe?.user;
            if (user) {
                setUserId(user.id.toString());
                // Lấy thông tin cá nhân
                fetch(`${BACKEND_URL}/api/user?id=${user.id}`)
                    .then(res => res.json())
                    .then(data => {
                        setBalance(data.balance);
                        if (data.wallet) { setWallet(data.wallet); setIsWalletSaved(true); }
                        if (data.lastCheckInDate) setLastCheckIn(data.lastCheckInDate);
                    });
            }
        }
        // Lấy danh sách Bảng xếp hạng
        fetch(`${BACKEND_URL}/api/leaderboard`)
            .then(res => res.json())
            .then(data => setLeaderboard(data))
            .catch(() => {});
    }, []);

    // --- LOGIC ĐIỂM DANH MỖI NGÀY ---
    const isCheckedInToday = lastCheckIn && new Date(lastCheckIn).toDateString() === new Date().toDateString();

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
        });
    };

    // ... (Giữ nguyên các hàm saveWallet và redeemItem) ...
    const saveWallet = () => {
        if (!wallet) return alert("Vui lòng nhập địa chỉ ví!");
        fetch(`${BACKEND_URL}/api/save-wallet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, wallet })
        }).then(() => { alert('Đã lưu ví!'); setIsWalletSaved(true); });
    };

    const redeemItem = (itemName: string, cost: number) => {
        if (balance < cost) return alert(`Bạn cần thêm ${cost - balance} SWGT!`);
        if (window.confirm(`Đổi ${cost} SWGT lấy ${itemName}?`)) {
            fetch(`${BACKEND_URL}/api/redeem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, itemName, cost })
            }).then(res => res.json()).then(data => {
                if(data.success) { setBalance(data.balance); alert("Đổi quà thành công!"); }
            });
        }
    };

    // --- GIAO DIỆN TRANG CHỦ (TÍCH HỢP ĐIỂM DANH & LEADERBOARD) ---
    const renderHome = () => (
        <div style={{ padding: '20px', paddingBottom: '100px' }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <h2 style={{ color: theme.gold, margin: 0 }}>CỘNG ĐỒNG SWC</h2>
                <p style={{ color: theme.textDim, fontSize: '13px', margin: '5px 0' }}>Sở hữu sớm công nghệ giao thông uST</p>
            </div>

            {/* KHỐI ĐIỂM DANH */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', textAlign: 'center', border: `1px solid ${theme.border}`, marginBottom: '25px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>📅 Nhiệm Vụ Điểm Danh</h3>
                <p style={{ fontSize: '12px', color: theme.textDim, marginBottom: '15px' }}>Truy cập App mỗi ngày để nhận ngay 2 SWGT.</p>
                <button 
                    onClick={handleCheckIn} 
                    disabled={isCheckedInToday}
                    style={{ width: '100%', backgroundColor: isCheckedInToday ? '#333' : theme.green, color: isCheckedInToday ? theme.textDim : '#fff', padding: '15px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: isCheckedInToday ? 'not-allowed' : 'pointer' }}
                >
                    {isCheckedInToday ? "✅ ĐÃ ĐIỂM DANH HÔM NAY" : "✋ ĐIỂM DANH NHẬN +2 SWGT"}
                </button>
            </div>

            {/* BẢNG XẾP HẠNG TOP 10 */}
            <h3 style={{color: '#fff', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '15px'}}>🏆 BẢNG VÀNG GIỚI THIỆU</h3>
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '15px', border: `1px solid ${theme.border}` }}>
                {leaderboard.length === 0 ? <p style={{color: theme.textDim, textAlign: 'center', fontSize: '12px'}}>Chưa có dữ liệu. Hãy là người đầu tiên!</p> : null}
                
                {leaderboard.map((user, index) => {
                    let medal = "🏅";
                    if (index === 0) medal = "🥇";
                    else if (index === 1) medal = "🥈";
                    else if (index === 2) medal = "🥉";

                    return (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: index < leaderboard.length - 1 ? `1px solid ${theme.border}` : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontSize: '20px', marginRight: '10px' }}>{medal}</span>
                                <span style={{ color: theme.textLight, fontWeight: 'bold', fontSize: '14px' }}>{user.firstName} {user.lastName}</span>
                            </div>
                            <div style={{ color: theme.gold, fontWeight: 'bold', fontSize: '14px' }}>
                                {user.referralCount} <span style={{ fontSize: '10px', color: theme.textDim, fontWeight: 'normal' }}>người</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );

    // --- GIAO DIỆN VÍ (Giữ nguyên siêu phẩm cũ) ---
    const renderWallet = () => (
        <div style={{ padding: '20px', paddingBottom: '100px' }}>
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '25px 20px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                <p style={{ color: theme.textDim, fontSize: '14px', margin: 0 }}>Số dư hiện tại</p>
                <h1 style={{ color: theme.gold, fontSize: '42px', margin: '5px 0' }}>{balance} <span style={{fontSize: '18px'}}>SWGT</span></h1>
                
                {/* ĐỒNG HỒ MỞ KHÓA */}
                <div style={{ backgroundColor: '#000', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px', border: `1px dashed ${theme.gold}` }}>
                    <div style={{textAlign: 'center'}}><b style={{color: '#fff'}}>{timeLeft.days}</b><br/><span style={{fontSize:'10px', color: theme.textDim}}>NGÀY</span></div>:
                    <div style={{textAlign: 'center'}}><b style={{color: '#fff'}}>{timeLeft.hours}</b><br/><span style={{fontSize:'10px', color: theme.textDim}}>GIỜ</span></div>:
                    <div style={{textAlign: 'center'}}><b style={{color: '#fff'}}>{timeLeft.mins}</b><br/><span style={{fontSize:'10px', color: theme.textDim}}>PHÚT</span></div>:
                    <div style={{textAlign: 'center'}}><b style={{color: '#fff'}}>{timeLeft.secs}</b><br/><span style={{fontSize:'10px', color: theme.textDim}}>GIÂY</span></div>
                </div>
            </div>

            <div style={{ marginTop: '25px' }}>
                <p style={{ color: theme.textDim, fontSize: '13px' }}>Ví nhận SWGT (BEP20) trên Gate.io:</p>
                <input 
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    disabled={isWalletSaved}
                    placeholder="Dán địa chỉ 0x..."
                    style={{ width: '100%', padding: '15px', borderRadius: '10px', backgroundColor: '#000', color: isWalletSaved ? theme.textDim : theme.gold, border: `1px solid ${theme.border}`, marginTop: '8px', boxSizing: 'border-box' }}
                />
                {isWalletSaved ? (
                    <button onClick={() => setIsWalletSaved(false)} style={{ width: '100%', backgroundColor: '#333', color: '#fff', padding: '15px', borderRadius: '10px', fontWeight: 'bold', border: 'none', marginTop: '15px' }}>✏️ CHỈNH SỬA VÍ</button>
                ) : (
                    <button onClick={saveWallet} style={{ width: '100%', backgroundColor: theme.gold, color: '#000', padding: '15px', borderRadius: '10px', fontWeight: 'bold', border: 'none', marginTop: '15px' }}>💾 LƯU ĐỊA CHỈ VÍ</button>
                )}
            </div>
            
            {/* KHO VIP ĐỔI THƯỞNG O2O */}
            <h3 style={{color: '#fff', marginTop: '30px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px'}}>💎 KHO ĐẶC QUYỀN VIP</h3>
            
            <div style={{ backgroundColor: theme.cardBg, padding: '15px', borderRadius: '10px', marginBottom: '15px', border: `1px solid ${theme.border}`}}>
                <h4 style={{margin: '0 0 5px 0', color: '#5E92F3'}}>☕ Cà Phê Chiến Lược 1:1</h4>
                <p style={{fontSize: '12px', color: theme.textDim, margin: '0 0 10px 0'}}>Thảo luận danh mục đầu tư trực tiếp tại Ucity Coffee.</p>
                <button onClick={() => redeemItem('Cà Phê Chiến Lược', 300)} style={{backgroundColor: '#5E92F3', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', fontWeight: 'bold'}}>Đổi: 300 SWGT</button>
            </div>

            <div style={{ backgroundColor: theme.cardBg, padding: '15px', borderRadius: '10px', marginBottom: '15px', border: `1px solid ${theme.border}`}}>
                <h4 style={{margin: '0 0 5px 0', color: '#34C759'}}>🔓 Mở Khóa Group Private</h4>
                <p style={{fontSize: '12px', color: theme.textDim, margin: '0 0 10px 0'}}>Nhận tín hiệu thị trường và Zoom kín hàng tuần.</p>
                <button onClick={() => redeemItem('Group Private', 500)} style={{backgroundColor: '#34C759', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', fontWeight: 'bold'}}>Đổi: 500 SWGT</button>
            </div>
        </div>
    );

    return (
        <div style={{ backgroundColor: theme.bg, color: theme.textLight, minHeight: '100vh', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
            {activeTab === 'home' && renderHome()}
            {activeTab === 'wallet' && renderWallet()}
            
            {/* THANH ĐIỀU HƯỚNG */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: theme.cardBg, display: 'flex', padding: '15px 0', borderTop: `1px solid ${theme.border}` }}>
                <div onClick={() => setActiveTab('home')} style={{ width: '50%', textAlign: 'center', color: activeTab === 'home' ? theme.gold : theme.textDim, cursor: 'pointer' }}>🏠 Trang chủ</div>
                <div onClick={() => setActiveTab('wallet')} style={{ width: '50%', textAlign: 'center', color: activeTab === 'wallet' ? theme.gold : theme.textDim, cursor: 'pointer' }}>👛 Ví & VIP</div>
            </div>
        </div>
    );
}

export default App;
