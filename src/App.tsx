import { useState, useEffect } from 'react';

function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [balance, setBalance] = useState(0);
    const [wallet, setWallet] = useState('');
    const [referrals, setReferrals] = useState(0); 
    
    // Lưu trữ thông tin thật từ Telegram
    const [userId, setUserId] = useState('');
    const [userProfile, setUserProfile] = useState({
        name: 'Đang tải...',
        username: '',
        photoUrl: ''
    });

    // Trạng thái mới cho Điểm danh và Leaderboard
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

    // --- ĐỒNG HỒ ĐẾM NGƯỢC THỜI GIAN THỰC ---
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

    // HÀM ÉP LẤY DỮ LIỆU TỪ BACKEND
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
        
        // Lấy danh sách Top 10 Bảng xếp hạng
        fetch(`${BACKEND_URL}/api/leaderboard`)
            .then(res => res.json())
            .then(data => setLeaderboard(data))
            .catch(() => {});
    }, []);

    // --- LOGIC ĐIỂM DANH MỖI NGÀY ---
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

    // HÀM LƯU VÍ
    const handleSaveWallet = () => {
        if (!wallet) return alert("Vui lòng nhập địa chỉ ví!");
        fetch(`${BACKEND_URL}/api/save-wallet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, wallet })
        }).then(() => alert('✅ Đã lưu/cập nhật ví thành công!'));
    };

    // HÀM ĐỔI QUÀ VIP
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

    // HÀM SAO CHÉP LINK GIỚI THIỆU
    const handleCopyLink = () => {
        const link = `https://t.me/Dau_Tu_SWC_bot?start=${userId || 'ref'}`;
        navigator.clipboard.writeText(link)
            .then(() => alert('✅ Đã sao chép link giới thiệu thành công!'))
            .catch(() => alert('❌ Lỗi sao chép. Vui lòng thử lại!'));
    };

    // --------------------------------------------------
    // HEADER GỐC SWC (Avatar + Info + Logo Mới)
    // --------------------------------------------------
    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: theme.bg }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img 
                    src="/logo.png" 
                    alt="SWC Logo" 
                    style={{ width: '45px', height: '45px', borderRadius: '50%', border: `2px solid ${theme.gold}`, marginRight: '12px', objectFit: 'cover' }} 
                />
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

            {/* KHỐI ĐIỂM DANH MỚI */}
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

            {/* CÁCH HOẠT ĐỘNG (ĐÃ CẬP NHẬT CHAT-TO-EARN) */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '15px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.textLight, margin: '0 0 15px 0', fontSize: '16px' }}>🎯 Cách Hoạt Động</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px', lineHeight: '1.5' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>📱 Bước 1: Tham gia Bot SWC</span><br/>Liên kết với @Dau_Tu_SWC_bot trên Telegram để bắt đầu.</p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px', lineHeight: '1.5' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>👥 Bước 2: Mời bạn bè</span><br/>Chia sẻ link giới thiệu và mời bạn bè tham gia cộng đồng SWC.</p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px', lineHeight: '1.5' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>💰 Bước 3: Nhận SWGT</span><br/>Mỗi người bạn mời (Nick Premium & Nick thường đủ điều kiện bên dưới) sẽ giúp bạn kiếm SWGT thưởng.</p>
                    
                    {/* BỔ SUNG TIP TƯƠNG TÁC NHÓM (CHAT-TO-EARN) */}
                    <div style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)', border: `1px dashed ${theme.green}`, padding: '12px', borderRadius: '8px', marginTop: '5px', marginBottom: '5px' }}>
                        <p style={{ margin: 0, color: theme.green, fontSize: '13px', lineHeight: '1.5' }}>
                            <span style={{fontWeight:'bold'}}>💬 MẸO: Tương tác kiếm thêm điểm</span><br/>
                            Mỗi tin nhắn bạn chat trong <b>Nhóm Thảo Luận</b> (từ 10 ký tự trở lên) sẽ được tự động cộng <b style={{color: theme.gold}}>+0.3 SWGT</b>. Chat càng nhiều, tiền càng nhiều!
                        </p>
                    </div>

                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px', lineHeight: '1.5' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>🔓 Bước 4: Rút tiền</span><br/>Rút ngay khi đạt 500 SWGT & đợi 30 ngày.</p>
                </div>
            </div>

            {/* CƠ CẤU PHẦN THƯỞNG */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '15px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.gold, margin: '0 0 15px 0', fontSize: '16px' }}>💎 Cơ Cấu Phần Thưởng SWGT</h2>
                
                <p style={{ color: theme.textLight, fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>📌 Thành viên Thường sẽ được nhận thưởng khi đáp ứng các điều kiện sau:</p>
                <div style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 15px 0', lineHeight: '1.6' }}>
                    <p style={{ margin: 0 }}>Tham gia Channel (Nhóm chính): <span style={{color: '#34C759'}}>+10 SWGT/người</span></p>
                    <p style={{ margin: 0 }}>Tham gia Nhóm Chat (Chat 2 dòng trên nhóm): <span style={{color: '#34C759'}}>+10 SWGT/người</span></p>
                </div>

                <p style={{ color: theme.gold, fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>⭐ Thành Viên Premium (+5 SWGT)</p>
                <div style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 10px 0', lineHeight: '1.6' }}>
                    <p style={{ margin: 0 }}>Tham gia Channel (Nhóm chính): <span style={{color: '#34C759'}}>+20 SWGT/người</span></p>
                    <p style={{ margin: 0 }}>Tham gia Nhóm Chat (Chat 2 dòng trên nhóm): <span style={{color: '#34C759'}}>+20 SWGT/người</span></p>
                </div>
                <p style={{ color: '#5E92F3', fontSize: '13px', fontWeight: 'bold', margin: 0 }}>💫 Cộng ngay: +5 SWGT bonus!</p>
            </div>

            {/* ĐIỀU KIỆN RÚT TIỀN */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.textLight, margin: '0 0 15px 0', fontSize: '16px' }}>⏱️ Điều Kiện Rút Tiền</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}>✓ Tối thiểu: <span style={{color: theme.textLight, fontWeight: 'bold'}}>500 SWGT/Tài Khoản</span></p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}>✓ Thời gian: <span style={{color: theme.textLight, fontWeight: 'bold'}}>Sau 30 ngày unlock</span></p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}>✓ Rút linh hoạt: <span style={{color: theme.textLight, fontWeight: 'bold'}}>Có thể rút bất cứ lúc nào sau khi đạt điều kiện</span></p>
                </div>
            </div>

            {/* BẢNG XẾP HẠNG TOP 10 (HIỂN THỊ TẠI TRANG CHỦ) */}
            <h3 style={{color: '#fff', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '15px', fontSize: '15px'}}>🏆 BẢNG VÀNG GIỚI THIỆU</h3>
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '15px', border: `1px solid ${theme.border}`, marginBottom: '20px' }}>
                {leaderboard.length === 0 ? <p style={{color: theme.textDim, textAlign: 'center', fontSize: '12px', margin: 0}}>Chưa có dữ liệu. Hãy là người đầu tiên bứt phá!</p> : null}
                
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
    // TAB 2: PHẦN THƯỞNG (REWARDS) - GIAO DIỆN "DOPAMINE"
    // --------------------------------------------------
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
                    <p style={{ color: theme.textDim, fontSize: '13px', margin: 0 }}>Xây dựng hệ thống - Tạo thu nhập thụ động</p>
                </div>

                {/* KHỐI TIẾN ĐỘ */}
                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}`, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                        <div>
                            <p style={{ margin: 0, color: theme.textDim, fontSize: '12px' }}>Đã giới thiệu</p>
                            <h2 style={{ margin: 0, color: theme.textLight, fontSize: '24px' }}>{referrals} <span style={{fontSize:'14px', color: theme.textDim, fontWeight:'normal'}}>người</span></h2>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, color: theme.gold, fontSize: '12px', fontWeight: 'bold' }}>Mục tiêu: {nextTarget} người</p>
                            <p style={{ margin: 0, color: theme.green, fontSize: '13px', fontWeight: 'bold' }}>🎁 Thưởng nóng {nextReward}</p>
                        </div>
                    </div>
                    
                    <div style={{ width: '100%', height: '10px', backgroundColor: '#333', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: theme.gold, transition: 'width 0.5s ease' }}></div>
                    </div>
                    <p style={{ margin: '8px 0 0 0', color: theme.textDim, fontSize: '11px', textAlign: 'center', fontStyle: 'italic' }}>
                        Chỉ còn {nextTarget - referrals} lượt mời nữa để mở khóa rương phần thưởng!
                    </p>
                </div>

                {/* CÔNG CỤ CHIA SẺ */}
                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: '0 0 15px 0', color: theme.textLight, fontSize: '15px' }}>🔗 Công cụ lan tỏa</h3>
                    <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '8px', color: theme.gold, fontSize: '14px', wordBreak: 'break-all', marginBottom: '15px', border: `1px dashed ${theme.border}` }}>
                        https://t.me/Dau_Tu_SWC_bot?start={userId || 'ref'}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleCopyLink} style={{ flex: 1, backgroundColor: theme.gold, color: '#000', padding: '12px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '13px', cursor: 'pointer' }}>
                            📋 SAO CHÉP LINK
                        </button>
                        <a href={`https://t.me/share/url?url=https://t.me/Dau_Tu_SWC_bot?start=${userId}&text=Vào%20nhận%20ngay%20SWGT%20miễn%20phí%20từ%20hệ%20sinh%20thái%20công%20nghệ%20uST%20này%20anh%20em!`} target="_blank" rel="noreferrer" style={{ flex: 1, backgroundColor: '#5E92F3', color: '#fff', padding: '12px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '13px', textAlign: 'center', textDecoration: 'none', display: 'inline-block' }}>
                            ✈️ GỬI CHO BẠN BÈ
                        </a>
                    </div>
                </div>

                {/* BẢNG XẾP HẠNG TOP 10 (HIỂN THỊ TẠI TAB REWARDS) */}
                <h3 style={{color: '#fff', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '15px', fontSize: '15px'}}>🏆 BẢNG VÀNG GIỚI THIỆU</h3>
                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '15px', border: `1px solid ${theme.border}`, marginBottom: '20px' }}>
                    {leaderboard.length === 0 ? <p style={{color: theme.textDim, textAlign: 'center', fontSize: '12px', margin: 0}}>Chưa có dữ liệu. Hãy là người đầu tiên bứt phá!</p> : null}
                    
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

                {/* RƯƠNG HUY HIỆU */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '15px', padding: '15px', border: `1px solid ${theme.border}`, textAlign: 'center', opacity: referrals >= 10 ? 1 : 0.5 }}>
                        <div style={{ fontSize: '24px', marginBottom: '5px' }}>{referrals >= 10 ? '🌟' : '🔒'}</div>
                        <p style={{ color: theme.textLight, fontSize: '12px', fontWeight: 'bold', margin: '0 0 3px 0' }}>Mốc 10 Người</p>
                        <p style={{ color: theme.gold, fontSize: '11px', margin: 0 }}>+50 SWGT</p>
                    </div>
                    <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '15px', padding: '15px', border: `1px solid ${theme.border}`, textAlign: 'center', opacity: referrals >= 50 ? 1 : 0.5 }}>
                        <div style={{ fontSize: '24px', marginBottom: '5px' }}>{referrals >= 50 ? '👑' : '🔒'}</div>
                        <p style={{ color: theme.textLight, fontSize: '12px', fontWeight: 'bold', margin: '0 0 3px 0' }}>Mốc 50 Người</p>
                        <p style={{ color: theme.gold, fontSize: '11px', margin: 0 }}>+300 SWGT</p>
                    </div>
                </div>
            </div>
        );
    };

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
                    <span style={{ color: theme.gold, fontSize: '16px', fontWeight: 'bold' }}>{referrals}</span>
                </div>
                
                <p style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 10px 0' }}>• Thời gian → Unlock sau 3 tháng <span style={{color: '#34C759'}}>✓</span></p>
                <p style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 15px 0' }}>• Ít nhất 500 SWGT thưởng → Được rút thưởng <span style={{color: '#34C759'}}>✓</span></p>
                
                <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <p style={{ color: theme.textDim, fontSize: '12px', margin: '0 0 10px 0' }}>Thời gian mở khoá</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ padding: '8px 12px', backgroundColor: '#222', borderRadius: '6px', color: theme.textLight, fontSize: '14px', fontWeight: 'bold' }}>{timeLeft.days} <span style={{fontSize:'10px', color: theme.textDim, fontWeight:'normal'}}>Ngày</span></div>
                        <div style={{ padding: '8px 12px', backgroundColor: '#222', borderRadius: '6px', color: theme.textLight, fontSize: '14px', fontWeight: 'bold' }}>{timeLeft.hours} <span style={{fontSize:'10px', color: theme.textDim, fontWeight:'normal'}}>Giờ</span></div>
                        <div style={{ padding: '8px 12px', backgroundColor: '#222', borderRadius: '6px', color: theme.textLight, fontSize: '14px', fontWeight: 'bold' }}>{timeLeft.mins} <span style={{fontSize:'10px', color: theme.textDim, fontWeight:'normal'}}>Phút</span></div>
                    </div>
                    <p style={{ color: theme.gold, fontSize: '11px', margin: 0, fontStyle: 'italic' }}>Hết thời gian trên → sẽ mở ngay lập tức</p>
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

            {/* KHO VIP ĐỔI THƯỞNG O2O */}
            <h3 style={{color: '#fff', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '15px', fontSize: '15px'}}>💎 KHO ĐẶC QUYỀN VIP</h3>
            
            <div style={{ backgroundColor: theme.cardBg, padding: '15px', borderRadius: '10px', marginBottom: '15px', border: `1px solid ${theme.border}`}}>
                <h4 style={{margin: '0 0 5px 0', color: '#5E92F3', fontSize: '14px'}}>☕ Cà Phê Chiến Lược 1:1</h4>
                <p style={{fontSize: '12px', color: theme.textDim, margin: '0 0 10px 0'}}>Thảo luận danh mục đầu tư trực tiếp tại Ucity Coffee.</p>
                <button onClick={() => redeemItem('Cà Phê Chiến Lược', 300)} style={{backgroundColor: '#5E92F3', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', fontWeight: 'bold', fontSize: '12px'}}>Đổi lấy: 300 SWGT</button>
            </div>

            <div style={{ backgroundColor: theme.cardBg, padding: '15px', borderRadius: '10px', marginBottom: '25px', border: `1px solid ${theme.border}`}}>
                <h4 style={{margin: '0 0 5px 0', color: '#34C759', fontSize: '14px'}}>🔓 Mở Khóa Group Private</h4>
                <p style={{fontSize: '12px', color: theme.textDim, margin: '0 0 10px 0'}}>Nhận tín hiệu thị trường và Zoom kín hàng tuần.</p>
                <button onClick={() => redeemItem('Group Private', 500)} style={{backgroundColor: '#34C759', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', fontWeight: 'bold', fontSize: '12px'}}>Đổi lấy: 500 SWGT</button>
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
