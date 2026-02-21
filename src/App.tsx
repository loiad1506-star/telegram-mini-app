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
            .then(data => {
                // Thêm dữ liệu giả (mock data) nếu mảng trả về ít hơn 5 người
                let combinedLeaderboard = [...data];
                const mockUsers = [
                    { firstName: 'Trần', lastName: 'Văn A', referralCount: 150 },
                    { firstName: 'Nguyễn', lastName: 'Thị B', referralCount: 120 },
                    { firstName: 'Lê', lastName: 'Hoàng C', referralCount: 85 },
                    { firstName: 'Phạm', lastName: 'Đức D', referralCount: 42 }
                ];
                
                if (combinedLeaderboard.length < 5) {
                    combinedLeaderboard = [...mockUsers, ...combinedLeaderboard];
                    // Sắp xếp lại theo referralCount giảm dần
                    combinedLeaderboard.sort((a, b) => b.referralCount - a.referralCount);
                }
                setLeaderboard(combinedLeaderboard.slice(0, 10)); // Chỉ lấy top 10
            })
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
                    alert("❌ Có lỗi xảy ra hoặc chưa đủ điều kiện!");
                }
            })
            .catch(() => alert('❌ Lỗi kết nối đến máy chủ!'));
        }
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

    const handleCopyLink = () => {
        const link = `https://t.me/Dau_Tu_SWC_bot?start=${userId || 'ref'}`;
        navigator.clipboard.writeText(link)
            .then(() => alert('✅ Đã sao chép link giới thiệu thành công!'))
            .catch(() => alert('❌ Lỗi sao chép. Vui lòng thử lại!'));
    };
    
    const handleClaimMilestone = (milestone: number) => {
        if (referrals < milestone) {
            alert(`⚠️ Bạn cần mời thêm ${milestone - referrals} người nữa để nhận thưởng mốc này!`);
        } else {
            alert("✅ Bạn đã đạt mốc này! Hệ thống đã tự động cộng thưởng vào số dư của bạn.");
        }
    }

    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: theme.bg }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', border: `2px solid ${theme.gold}`, marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.cardBg, color: theme.gold, fontWeight: 'bold' }}>SWC</div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: theme.textLight }}>CỘNG ĐỒNG</h1>
                    <p style={{ margin: 0, fontSize: '14px', color: theme.gold, fontWeight: 'bold' }}>Đầu tư uST</p>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', textAlign: 'right' }}>
                <div style={{ marginRight: '10px' }}>
                    <h2 style={{ margin: 0, fontSize: '16px', color: theme.textLight, fontWeight: 'bold' }}>{userProfile.name}</h2>
                    <p style={{ margin: 0, fontSize: '13px', color: theme.textDim }}>{userProfile.username}</p>
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
                    <h3 style={{ margin: 0, color: theme.gold, fontSize: '20px', fontWeight: 'bold' }}>{balance}</h3>
                    <p style={{ margin: '5px 0 0 0', color: theme.textDim, fontSize: '13px', fontWeight: 'bold' }}>Số dư SWGT</p>
                </div>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px 5px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: 0, color: theme.gold, fontSize: '20px', fontWeight: 'bold' }}>{referrals}</h3>
                    <p style={{ margin: '5px 0 0 0', color: theme.textDim, fontSize: '13px', fontWeight: 'bold' }}>Đã mời</p>
                </div>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px 5px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: 0, color: theme.gold, fontSize: '20px', fontWeight: 'bold' }}>Thường</h3>
                    <p style={{ margin: '5px 0 0 0', color: theme.textDim, fontSize: '13px', fontWeight: 'bold' }}>Hạng Tài khoản</p>
                </div>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '15px', textAlign: 'center', border: `1px solid ${theme.border}`, marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>📅 ĐIỂM DANH HÀNG NGÀY</h3>
                <button 
                    onClick={handleCheckIn} 
                    disabled={isCheckedInToday}
                    style={{ width: '100%', backgroundColor: isCheckedInToday ? '#333' : theme.green, color: isCheckedInToday ? theme.textDim : '#fff', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: isCheckedInToday ? 'not-allowed' : 'pointer', fontSize: '15px' }}
                >
                    {isCheckedInToday ? "✅ ĐÃ ĐIỂM DANH HÔM NAY" : "✋ ĐIỂM DANH NHẬN +2 SWGT"}
                </button>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '15px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.textLight, margin: '0 0 15px 0', fontSize: '18px', fontWeight: 'bold' }}>🎯 CÁCH HOẠT ĐỘNG</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '14px', lineHeight: '1.5' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>📱 Bước 1: Tham gia Bot SWC</span><br/>Liên kết với @Dau_Tu_SWC_bot trên Telegram để bắt đầu.</p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '14px', lineHeight: '1.5' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>👥 Bước 2: Mời bạn bè</span><br/>Chia sẻ link giới thiệu và mời bạn bè tham gia cộng đồng SWC.</p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '14px', lineHeight: '1.5' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>💰 Bước 3: Nhận SWGT</span><br/>Mỗi người bạn mời sẽ giúp bạn kiếm SWGT thưởng.</p>
                    
                    <div style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)', border: `1px dashed ${theme.green}`, padding: '12px', borderRadius: '8px', marginTop: '5px', marginBottom: '5px' }}>
                        <p style={{ margin: 0, color: theme.green, fontSize: '14px', lineHeight: '1.5' }}>
                            <span style={{fontWeight:'bold'}}>💬 MẸO: Tương tác kiếm thêm điểm</span><br/>
                            Mỗi tin nhắn bạn chat trong <b>Nhóm Thảo Luận</b> (từ 10 ký tự trở lên) sẽ được tự động cộng <b style={{color: theme.gold}}>+0.3 SWGT</b>. Chat càng nhiều, tiền càng nhiều!
                        </p>
                    </div>

                    <p style={{ margin: 0, color: theme.textDim, fontSize: '14px', lineHeight: '1.5' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>🔓 Bước 4: Rút tiền</span><br/>Rút ngay khi đạt 500 SWGT & đợi 30 ngày.</p>
                </div>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '15px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.gold, margin: '0 0 15px 0', fontSize: '18px', fontWeight: 'bold' }}>💎 CƠ CẤU PHẦN THƯỞNG SWGT</h2>
                <p style={{ color: theme.textLight, fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>📌 Thành viên Thường sẽ được nhận thưởng khi đáp ứng các điều kiện sau:</p>
                <div style={{ color: theme.textDim, fontSize: '14px', margin: '0 0 15px 0', lineHeight: '1.6' }}>
                    <p style={{ margin: 0 }}>Tham gia Channel (Nhóm chính): <span style={{color: '#34C759', fontWeight: 'bold'}}>+10 SWGT/người</span></p>
                    <p style={{ margin: 0 }}>Tham gia Nhóm Chat (Chat trên nhóm): <span style={{color: '#34C759', fontWeight: 'bold'}}>+10 SWGT/người</span></p>
                </div>

                <p style={{ color: theme.gold, fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>⭐ Thành Viên Premium (+5 SWGT)</p>
                <div style={{ color: theme.textDim, fontSize: '14px', margin: '0 0 10px 0', lineHeight: '1.6' }}>
                    <p style={{ margin: 0 }}>Tham gia Channel (Nhóm chính): <span style={{color: '#34C759', fontWeight: 'bold'}}>+20 SWGT/người</span></p>
                    <p style={{ margin: 0 }}>Tham gia Nhóm Chat (Chat trên nhóm): <span style={{color: '#34C759', fontWeight: 'bold'}}>+20 SWGT/người</span></p>
                </div>
                <p style={{ color: '#5E92F3', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>💫 Cộng ngay: +5 SWGT bonus!</p>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.textLight, margin: '0 0 15px 0', fontSize: '18px', fontWeight: 'bold' }}>⏱️ ĐIỀU KIỆN RÚT TIỀN</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '14px' }}>✓ Tối thiểu: <span style={{color: theme.textLight, fontWeight: 'bold'}}>500 SWGT/Tài Khoản</span></p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '14px' }}>✓ Thời gian: <span style={{color: theme.textLight, fontWeight: 'bold'}}>Sau 30 ngày unlock</span></p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '14px' }}>✓ Rút linh hoạt: <span style={{color: theme.textLight, fontWeight: 'bold'}}>Có thể rút bất cứ lúc nào sau khi đạt điều kiện</span></p>
                </div>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.textLight, margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase' }}>CÁC TÍNH NĂNG ĐANG BỔ SUNG</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ backgroundColor: '#000', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, textAlign: 'center', color: theme.textDim, fontSize: '13px', fontWeight: 'bold' }}>Cấp Độ Thành Viên</div>
                    <div style={{ backgroundColor: '#000', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, textAlign: 'center', color: theme.textDim, fontSize: '13px', fontWeight: 'bold' }}>Kiếm SWGT Nhanh Chóng</div>
                    <div style={{ backgroundColor: '#000', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, textAlign: 'center', color: theme.textDim, fontSize: '13px', fontWeight: 'bold' }}>Mục Tiêu Rõ Ràng</div>
                    <div style={{ backgroundColor: '#000', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, textAlign: 'center', color: theme.textDim, fontSize: '13px', fontWeight: 'bold' }}>An Toàn & Bảo Mật</div>
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
                    <div style={{ fontSize: '45px', marginBottom: '5px' }}>🎁</div>
                    <h2 style={{ color: theme.gold, margin: '0 0 5px 0', fontSize: '22px', fontWeight: 'bold' }}>TRUNG TÂM THU NHẬP</h2>
                    <p style={{ color: theme.textDim, fontSize: '14px', margin: 0, fontWeight: 'bold' }}>Xây dựng hệ thống - Tạo thu nhập thụ động</p>
                </div>

                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}`, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                        <div>
                            <p style={{ margin: 0, color: theme.textDim, fontSize: '13px', fontWeight: 'bold' }}>Đã giới thiệu</p>
                            <h2 style={{ margin: 0, color: theme.textLight, fontSize: '26px', fontWeight: 'bold' }}>{referrals} <span style={{fontSize:'16px', color: theme.textDim, fontWeight:'normal'}}>người</span></h2>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, color: theme.gold, fontSize: '13px', fontWeight: 'bold' }}>Mục tiêu: {nextTarget} người</p>
                            <p style={{ margin: 0, color: theme.green, fontSize: '14px', fontWeight: 'bold' }}>🎁 Thưởng nóng {nextReward}</p>
                        </div>
                    </div>
                    
                    <div style={{ width: '100%', height: '12px', backgroundColor: '#333', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: theme.gold, transition: 'width 0.5s ease' }}></div>
                    </div>
                    <p style={{ margin: '10px 0 0 0', color: theme.textDim, fontSize: '13px', textAlign: 'center', fontStyle: 'italic', fontWeight: 'bold' }}>
                        Chỉ còn {Math.max(0, nextTarget - referrals)} lượt mời nữa để mở khóa rương phần thưởng!
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '25px' }}>
                    <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '15px', padding: '15px', border: `1px solid ${theme.border}`, textAlign: 'center', opacity: referrals >= 10 ? 1 : 0.6 }}>
                        <div style={{ fontSize: '28px', marginBottom: '5px' }}>{referrals >= 10 ? '🌟' : '🔒'}</div>
                        <p style={{ color: theme.textLight, fontSize: '14px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Mốc 10 Người</p>
                        <p style={{ color: theme.gold, fontSize: '13px', fontWeight: 'bold', margin: '0 0 10px 0' }}>+50 SWGT</p>
                        <button onClick={() => handleClaimMilestone(10)} style={{backgroundColor: referrals >= 10 ? theme.green : '#333', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '5px', fontWeight: 'bold', fontSize: '12px', cursor: referrals >= 10 ? 'pointer' : 'not-allowed', width: '100%'}}>
                            {referrals >= 10 ? 'NHẬN THƯỞNG' : 'CHƯA ĐẠT'}
                        </button>
                    </div>
                    <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '15px', padding: '15px', border: `1px solid ${theme.border}`, textAlign: 'center', opacity: referrals >= 50 ? 1 : 0.6 }}>
                        <div style={{ fontSize: '28px', marginBottom: '5px' }}>{referrals >= 50 ? '👑' : '🔒'}</div>
                        <p style={{ color: theme.textLight, fontSize: '14px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Mốc 50 Người</p>
                        <p style={{ color: theme.gold, fontSize: '13px', fontWeight: 'bold', margin: '0 0 10px 0' }}>+300 SWGT</p>
                        <button onClick={() => handleClaimMilestone(50)} style={{backgroundColor: referrals >= 50 ? theme.green : '#333', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '5px', fontWeight: 'bold', fontSize: '12px', cursor: referrals >= 50 ? 'pointer' : 'not-allowed', width: '100%'}}>
                            {referrals >= 50 ? 'NHẬN THƯỞNG' : 'CHƯA ĐẠT'}
                        </button>
                    </div>
                </div>

                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: '0 0 15px 0', color: theme.textLight, fontSize: '16px', fontWeight: 'bold' }}>🔗 CÔNG CỤ LAN TỎA</h3>
                    <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '8px', color: theme.gold, fontSize: '14px', wordBreak: 'break-all', marginBottom: '15px', border: `1px dashed ${theme.border}`, fontWeight: 'bold' }}>
                        https://t.me/Dau_Tu_SWC_bot?start={userId || 'ref'}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleCopyLink} style={{ flex: 1, backgroundColor: theme.gold, color: '#000', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '14px', cursor: 'pointer' }}>
                            📋 SAO CHÉP LINK
                        </button>
                        <a href={`https://t.me/share/url?url=https://t.me/Dau_Tu_SWC_bot?start=${userId}&text=Vào%20nhận%20ngay%20SWGT%20miễn%20phí%20từ%20hệ%20sinh%20thái%20công%20nghệ%20uST%20này%20anh%20em!`} target="_blank" rel="noreferrer" style={{ flex: 1, backgroundColor: '#5E92F3', color: '#fff', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '14px', textAlign: 'center', textDecoration: 'none', display: 'inline-block' }}>
                            ✈️ GỬI BẠN BÈ
                        </a>
                    </div>
                </div>

                <h3 style={{color: '#fff', borderBottom: `2px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold'}}>🏆 BẢNG VÀNG GIỚI THIỆU</h3>
                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '15px', border: `1px solid ${theme.border}`, marginBottom: '25px' }}>
                    {leaderboard.length === 0 ? <p style={{color: theme.textDim, textAlign: 'center', fontSize: '13px', margin: 0, fontWeight: 'bold'}}>Chưa có dữ liệu. Hãy là người đầu tiên bứt phá!</p> : null}
                    
                    {leaderboard.map((user, index) => {
                        let medal = "🏅";
                        let color = theme.textLight;
                        if (index === 0) { medal = "🥇"; color = theme.gold; }
                        else if (index === 1) { medal = "🥈"; color = '#C0C0C0'; }
                        else if (index === 2) { medal = "🥉"; color = '#CD7F32'; }

                        const isCurrentUser = user.firstName === userProfile.name.split(' ')[0] && user.referralCount === referrals;

                        return (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 10px', borderBottom: index < leaderboard.length - 1 ? `1px solid ${theme.border}` : 'none', backgroundColor: isCurrentUser ? 'rgba(244, 208, 63, 0.1)' : 'transparent', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontSize: '22px', marginRight: '12px', width: '25px', textAlign: 'center' }}>{medal}</span>
                                    <span style={{ color: isCurrentUser ? theme.gold : theme.textLight, fontWeight: 'bold', fontSize: '15px' }}>
                                        {user.firstName} {user.lastName} {isCurrentUser ? '(Bạn)' : ''}
                                    </span>
                                </div>
                                <div style={{ color: theme.gold, fontWeight: 'bold', fontSize: '15px' }}>
                                    {user.referralCount} <span style={{ fontSize: '12px', color: theme.textDim, fontWeight: 'bold' }}>người</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
                
                <h3 style={{color: '#fff', borderBottom: `2px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold'}}>💎 KHO ĐẶC QUYỀN VIP</h3>
                
                <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '15px', marginBottom: '15px', border: `1px solid ${theme.border}`}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div>
                            <h4 style={{margin: '0 0 5px 0', color: '#5E92F3', fontSize: '16px', fontWeight: 'bold'}}>☕ Cà Phê Chiến Lược (Test)</h4>
                            <p style={{fontSize: '13px', color: theme.textDim, margin: '0 0 10px 0'}}>Thảo luận danh mục đầu tư trực tiếp.</p>
                        </div>
                        <div style={{fontSize: '30px'}}>☕</div>
                    </div>
                    <button onClick={() => redeemItem('Cà Phê Chiến Lược (Test)', 50)} style={{backgroundColor: '#5E92F3', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', width: '100%'}}>Đổi lấy: 50 SWGT</button>
                </div>

                <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '15px', marginBottom: '15px', border: `1px solid ${theme.border}`}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div>
                            <h4 style={{margin: '0 0 5px 0', color: '#34C759', fontSize: '16px', fontWeight: 'bold'}}>🔓 Group Private</h4>
                            <p style={{fontSize: '13px', color: theme.textDim, margin: '0 0 10px 0'}}>Nhận tín hiệu thị trường, Zoom kín.</p>
                        </div>
                        <div style={{fontSize: '30px'}}>🔐</div>
                    </div>
                    <button onClick={() => redeemItem('Group Private', 500)} style={{backgroundColor: '#34C759', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', width: '100%'}}>Đổi lấy: 500 SWGT</button>
                </div>
            </div>
        );
    };

    const renderWallet = () => (
        <div style={{ padding: '0 20px 20px 20px', paddingBottom: '100px' }}>
            
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '25px 20px', border: `1px solid ${theme.border}`, textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    <p style={{ color: theme.textDim, fontSize: '15px', margin: 0, fontWeight: 'bold' }}>SỐ DƯ HIỆN TẠI</p>
                    <button onClick={() => fetchUserData(userId)} style={{ background: 'none', border: 'none', color: theme.gold, cursor: 'pointer', fontSize: '18px' }}>🔄</button>
                </div>
                <h1 style={{ color: theme.gold, margin: '15px 0', fontSize: '50px', fontWeight: '900' }}>
                    {balance} <span style={{fontSize: '22px', fontWeight: 'bold'}}>SWGT</span>
                </h1>
                
                {balance >= 50 ? (
                    <button onClick={handleWithdraw} style={{ width: '100%', backgroundColor: theme.green, color: '#fff', padding: '16px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(52, 199, 89, 0.4)' }}>
                        💸 YÊU CẦU RÚT TIỀN NGAY
                    </button>
                ) : (
                    <button style={{ width: '100%', backgroundColor: '#333', color: theme.textDim, padding: '16px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '16px', cursor: 'not-allowed' }}>
                        🔒 Chưa đủ điều kiện (Cần 50 SWGT)
                    </button>
                )}
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px' }}>
                    <span style={{ color: theme.textLight, fontSize: '15px', fontWeight: 'bold' }}>Số người đã giới thiệu</span>
                    <span style={{ color: theme.gold, fontSize: '18px', fontWeight: 'bold' }}>{referrals}</span>
                </div>
                
                <p style={{ color: theme.textDim, fontSize: '14px', margin: '0 0 12px 0', fontWeight: 'bold' }}>• Thời gian → Đang mở khoá test <span style={{color: '#34C759'}}>✓</span></p>
                <p style={{ color: theme.textDim, fontSize: '14px', margin: '0 0 15px 0', fontWeight: 'bold' }}>• Đạt 50 SWGT thưởng → Được rút <span style={{color: balance >= 50 ? '#34C759' : theme.textDim}}>{balance >= 50 ? '✓' : '✗'}</span></p>
                
                <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <p style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 10px 0', fontWeight: 'bold' }}>THỜI GIAN MỞ KHOÁ CHÍNH THỨC</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ padding: '10px 15px', backgroundColor: '#222', borderRadius: '8px', color: theme.textLight, fontSize: '16px', fontWeight: 'bold' }}>{timeLeft.days} <span style={{fontSize:'11px', color: theme.textDim, fontWeight:'bold', display: 'block', marginTop: '3px'}}>Ngày</span></div>
                        <div style={{ padding: '10px 15px', backgroundColor: '#222', borderRadius: '8px', color: theme.textLight, fontSize: '16px', fontWeight: 'bold' }}>{timeLeft.hours} <span style={{fontSize:'11px', color: theme.textDim, fontWeight:'bold', display: 'block', marginTop: '3px'}}>Giờ</span></div>
                        <div style={{ padding: '10px 15px', backgroundColor: '#222', borderRadius: '8px', color: theme.textLight, fontSize: '16px', fontWeight: 'bold' }}>{timeLeft.mins} <span style={{fontSize:'11px', color: theme.textDim, fontWeight:'bold', display: 'block', marginTop: '3px'}}>Phút</span></div>
                    </div>
                </div>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                    <span style={{ fontSize: '22px' }}>🛡️</span>
                    <div>
                        <h3 style={{ margin: 0, color: theme.textLight, fontSize: '16px', fontWeight: 'bold' }}>BẢO MẬT CAO</h3>
                        <p style={{ margin: 0, color: theme.textDim, fontSize: '13px', fontWeight: 'bold' }}>Liên kết ví Gate.io an toàn</p>
                    </div>
                </div>
                <input 
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    placeholder="Dán địa chỉ ví Gate.io (BEP20) tại đây"
                    style={{ width: '100%', padding: '16px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: '#000', color: theme.gold, boxSizing: 'border-box', marginBottom: '15px', fontSize: '14px', fontWeight: 'bold' }}
                />
                <button onClick={handleSaveWallet} style={{ width: '100%', backgroundColor: theme.gold, color: '#000', padding: '14px', borderRadius: '8px', fontWeight: 'bold', border: 'none', fontSize: '15px', cursor: 'pointer' }}>
                    {wallet ? "CẬP NHẬT ĐỊA CHỈ VÍ" : "LƯU ĐỊA CHỈ VÍ"}
                </button>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: '0 0 5px 0', color: theme.textLight, fontSize: '14px', fontWeight: 'bold' }}>Hỗ trợ 24/7</h3>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '12px', fontWeight: 'bold' }}>Liên hệ ngay nếu cần trợ giúp</p>
                </div>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: '0 0 5px 0', color: theme.textLight, fontSize: '14px', fontWeight: 'bold' }}>Lịch sử giao dịch</h3>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '12px', fontWeight: 'bold' }}>Chưa có giao dịch nào</p>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '90px', boxSizing: 'border-box' }}>
            {renderHeader()}
            
            <div style={{ marginTop: '10px' }}>
                {activeTab === 'home' && renderHome()}
                {activeTab === 'rewards' && renderRewards()}
                {activeTab === 'wallet' && renderWallet()}
            </div>

            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: theme.cardBg, borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-around', padding: '15px 0', paddingBottom: 'calc(15px + env(safe-area-inset-bottom))', zIndex: 100 }}>
                <div onClick={() => setActiveTab('home')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'home' ? theme.gold : theme.textDim, width: '33%', cursor: 'pointer' }}>
                    <div style={{ fontSize: '26px', marginBottom: '6px' }}>🏠</div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>TRANG CHỦ</span>
                </div>
                <div onClick={() => setActiveTab('rewards')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'rewards' ? theme.gold : theme.textDim, width: '33%', cursor: 'pointer' }}>
                    <div style={{ fontSize: '26px', marginBottom: '6px' }}>🎁</div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>PHẦN THƯỞNG</span>
                </div>
                <div onClick={() => setActiveTab('wallet')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'wallet' ? theme.gold : theme.textDim, width: '33%', cursor: 'pointer' }}>
                    <div style={{ fontSize: '26px', marginBottom: '6px' }}>👛</div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>VÍ CỦA TÔI</span>
                </div>
            </div>
        </div>
    );
}

export default App;
