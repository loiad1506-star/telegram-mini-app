import { useState, useEffect } from 'react';

function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [balance, setBalance] = useState(0);
    const [wallet, setWallet] = useState('');
    const [referrals, setReferrals] = useState(0); 
    
    // --- STATE MỚI BỔ SUNG ---
    const [withdrawAmount, setWithdrawAmount] = useState(''); 
    const [milestone10, setMilestone10] = useState(false); 
    const [milestone50, setMilestone50] = useState(false); 

    // --- STATE NHIỆM VỤ TRÊN APP ---
    const [tasks, setTasks] = useState({
        readTaskDone: false,
        youtubeTaskDone: false,
        facebookTaskDone: false,
        shareTaskDone: false
    });
    
    const [taskTimers, setTaskTimers] = useState({
        read: 0, youtube: 0, facebook: 0, share: 0
    });

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
        green: '#34C759',
        red: '#FF3B30',
        blue: '#5E92F3'
    };

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });
    useEffect(() => {
        const unlockDate = new Date("2026-03-25T00:00:00").getTime(); 
        const interval = setInterval(() => {
            const distance = unlockDate - new Date().getTime();
            if (distance > 0) {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
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
                setMilestone10(data.milestone10 || false);
                setMilestone50(data.milestone50 || false);
                
                const now = new Date().getTime();
                const lastDaily = data.lastDailyTask ? new Date(data.lastDailyTask).getTime() : 0;
                const lastShare = data.lastShareTask ? new Date(data.lastShareTask).getTime() : 0;
                
                setTasks({
                    readTaskDone: (now - lastDaily) < 86400000, 
                    shareTaskDone: (now - lastShare) < 86400000,
                    youtubeTaskDone: data.youtubeTaskDone || false,
                    facebookTaskDone: data.facebookTaskDone || false
                });
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
        });
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
        const amount = Number(withdrawAmount);
        if (!wallet) return alert("⚠️ Vui lòng lưu địa chỉ ví ERC20 bên dưới trước khi rút!");
        if (!amount || amount < 300) return alert("⚠️ Bạn cần rút tối thiểu 300 SWGT!");
        if (amount > balance) return alert("⚠️ Số dư của bạn không đủ để rút mức này!");
        
        if (window.confirm(`Xác nhận yêu cầu rút ${amount} SWGT về ví?`)) {
            fetch(`${BACKEND_URL}/api/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, amount }) 
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    setBalance(data.balance);
                    setWithdrawAmount(''); 
                    alert(`💸 Yêu cầu rút ${amount} SWGT đã được gửi! Vui lòng kiểm tra tin nhắn Bot.`);
                } else { alert(data.message || "❌ Lỗi xử lý!"); }
            });
        }
    };

    const handleCopyLink = () => {
        const link = `https://t.me/Dau_Tu_SWC_bot?start=${userId || 'ref'}`;
        navigator.clipboard.writeText(link)
            .then(() => alert('✅ Đã sao chép link giới thiệu thành công!'))
            .catch(() => alert('❌ Lỗi sao chép!'));
    };

    const handleClaimMilestone = (milestone: number) => {
        fetch(`${BACKEND_URL}/api/claim-milestone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, milestone })
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                setBalance(data.balance);
                if (milestone === 10) setMilestone10(true);
                if (milestone === 50) setMilestone50(true);
                alert(`🎉 Chúc mừng! Bạn đã nhận thành công thưởng mốc ${milestone} người!`);
            } else { alert(data.message || "❌ Chưa đủ điều kiện nhận!"); }
        });
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
                    alert("🎉 Yêu cầu đổi quà đã được gửi! Admin sẽ xử lý sớm.");
                }
            });
        }
    };

    const startTask = (taskType: string, url: string, duration: number) => {
        window.open(url, '_blank'); 
        setTaskTimers(prev => ({ ...prev, [taskType]: duration })); 
        
        const interval = setInterval(() => {
            setTaskTimers(prev => {
                if (prev[taskType as keyof typeof prev] <= 1) {
                    clearInterval(interval);
                    return { ...prev, [taskType]: 0 };
                }
                return { ...prev, [taskType]: prev[taskType as keyof typeof prev] - 1 };
            });
        }, 1000);
    };

    const claimTaskApp = (taskType: string) => {
        if (taskTimers[taskType as keyof typeof taskTimers] > 0) {
            return alert(`⏳ Vui lòng đợi ${taskTimers[taskType as keyof typeof taskTimers]} giây nữa để nhận thưởng!`);
        }
        
        fetch(`${BACKEND_URL}/api/claim-app-task`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, taskType })
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                setBalance(data.balance);
                setTasks(prev => ({ ...prev, [`${taskType}TaskDone`]: true }));
                alert(`🎉 Nhận thành công +${data.reward} SWGT!`);
            } else { alert(data.message || "❌ Chưa đủ điều kiện nhận!"); }
        });
    };

    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: theme.bg }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/logo.png" alt="SWC Logo" style={{ width: '50px', height: '50px', borderRadius: '50%', border: `2px solid ${theme.gold}`, marginRight: '12px', objectFit: 'cover' }} />
                <div>
                    <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: theme.textLight }}>CỘNG ĐỒNG</h1>
                    <p style={{ margin: 0, fontSize: '14px', color: theme.gold, fontWeight: 'bold' }}>Đầu tư uST</p>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', textAlign: 'right' }}>
                <div style={{ marginRight: '10px' }}>
                    <h2 style={{ margin: 0, fontSize: '16px', color: theme.textLight, fontWeight: 'bold' }}>{userProfile.name}</h2>
                    <p style={{ margin: 0, fontSize: '13px', color: theme.textDim }}>{userProfile.username}</p>
                </div>
                {userProfile.photoUrl ? (
                    <img src={userProfile.photoUrl} alt="avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', border: `2px solid ${theme.border}` }} />
                ) : (
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: theme.cardBg, border: `2px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.gold, fontSize: '20px' }}>👤</div>
                )}
            </div>
        </div>
    );

    const renderHome = () => (
        <div style={{ padding: '0 20px 20px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '20px' }}>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px 5px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: 0, color: theme.gold, fontSize: '22px', fontWeight: 'bold' }}>{balance}</h3>
                    <p style={{ margin: '5px 0 0 0', color: theme.textDim, fontSize: '13px' }}>Số dư SWGT</p>
                </div>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px 5px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: 0, color: theme.gold, fontSize: '22px', fontWeight: 'bold' }}>{referrals}</h3>
                    <p style={{ margin: '5px 0 0 0', color: theme.textDim, fontSize: '13px' }}>Đã mời</p>
                </div>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px 5px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: 0, color: theme.gold, fontSize: '22px', fontWeight: 'bold' }}>Thường</h3>
                    <p style={{ margin: '5px 0 0 0', color: theme.textDim, fontSize: '13px' }}>Hạng TK</p>
                </div>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '18px', textAlign: 'center', border: `1px solid ${theme.border}`, marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '16px' }}>📅 Điểm Danh Hàng Ngày</h3>
                <button 
                    onClick={handleCheckIn} 
                    disabled={isCheckedInToday}
                    style={{ width: '100%', backgroundColor: isCheckedInToday ? '#333' : theme.green, color: isCheckedInToday ? theme.textDim : '#fff', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: isCheckedInToday ? 'not-allowed' : 'pointer', fontSize: '15px' }}
                >
                    {isCheckedInToday ? "✅ ĐÃ ĐIỂM DANH HÔM NAY" : "✋ BẤM ĐIỂM DANH NHẬN +2 SWGT"}
                </button>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.textLight, margin: '0 0 15px 0', fontSize: '18px' }}>🧠 Nạp Kiến Thức & Lan Tỏa</h2>
                
                <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '10px', marginBottom: '10px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                            <h4 style={{ margin: 0, color: theme.textLight, fontSize: '15px' }}>📖 Đọc bài phân tích</h4>
                            <p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}>Đợi 60 giây (+10 SWGT)</p>
                        </div>
                        {tasks.readTaskDone && <span style={{ color: theme.green, fontWeight: 'bold' }}>✅ Xong</span>}
                    </div>
                    {!tasks.readTaskDone && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => startTask('read', 'https://swc.capital/', 60)} style={{ flex: 1, backgroundColor: theme.blue, color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>ĐỌC NGAY</button>
                            <button onClick={() => claimTaskApp('read')} style={{ flex: 1, backgroundColor: taskTimers.read > 0 ? '#333' : theme.gold, color: taskTimers.read > 0 ? theme.textDim : '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                                {taskTimers.read > 0 ? `ĐỢI ${taskTimers.read}s` : 'NHẬN QUÀ'}
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '10px', marginBottom: '10px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                            <h4 style={{ margin: 0, color: theme.textLight, fontSize: '15px' }}>▶️ Xem YouTube SWC</h4>
                            <p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}>Đợi 6 giây (+5 SWGT)</p>
                        </div>
                        {tasks.youtubeTaskDone && <span style={{ color: theme.green, fontWeight: 'bold' }}>✅ Xong</span>}
                    </div>
                    {!tasks.youtubeTaskDone && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => startTask('youtube', 'https://www.youtube.com/c/SkyWorldCommunityVietNam/videos', 6)} style={{ flex: 1, backgroundColor: '#FF0000', color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>XEM NGAY</button>
                            <button onClick={() => claimTaskApp('youtube')} style={{ flex: 1, backgroundColor: taskTimers.youtube > 0 ? '#333' : theme.gold, color: taskTimers.youtube > 0 ? theme.textDim : '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                                {taskTimers.youtube > 0 ? `ĐỢI ${taskTimers.youtube}s` : 'NHẬN QUÀ'}
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '10px', marginBottom: '10px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                            <h4 style={{ margin: 0, color: theme.textLight, fontSize: '15px' }}>📘 Theo dõi Fanpage</h4>
                            <p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}>Đợi 5 giây (+5 SWGT)</p>
                        </div>
                        {tasks.facebookTaskDone && <span style={{ color: theme.green, fontWeight: 'bold' }}>✅ Xong</span>}
                    </div>
                    {!tasks.facebookTaskDone && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => startTask('facebook', 'https://www.facebook.com/swc.capital.vn', 5)} style={{ flex: 1, backgroundColor: '#1877F2', color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>MỞ TRANG</button>
                            <button onClick={() => claimTaskApp('facebook')} style={{ flex: 1, backgroundColor: taskTimers.facebook > 0 ? '#333' : theme.gold, color: taskTimers.facebook > 0 ? theme.textDim : '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                                {taskTimers.facebook > 0 ? `ĐỢI ${taskTimers.facebook}s` : 'NHẬN QUÀ'}
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                            <h4 style={{ margin: 0, color: theme.textLight, fontSize: '15px' }}>📢 Chia sẻ dự án</h4>
                            <p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}>Đợi 5 giây (+15 SWGT)</p>
                        </div>
                        {tasks.shareTaskDone && <span style={{ color: theme.green, fontWeight: 'bold' }}>✅ Xong</span>}
                    </div>
                    {!tasks.shareTaskDone && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => startTask('share', `https://t.me/share/url?url=https://t.me/Dau_Tu_SWC_bot?start=${userId}`, 5)} style={{ flex: 1, backgroundColor: '#34C759', color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>CHIA SẺ</button>
                            <button onClick={() => claimTaskApp('share')} style={{ flex: 1, backgroundColor: taskTimers.share > 0 ? '#333' : theme.gold, color: taskTimers.share > 0 ? theme.textDim : '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                                {taskTimers.share > 0 ? `ĐỢI ${taskTimers.share}s` : 'NHẬN QUÀ'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* THÔNG TIN BỔ SUNG Ở TAB TRANG CHỦ */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '15px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.gold, margin: '0 0 15px 0', fontSize: '18px' }}>💎 Cơ Cấu Phần Thưởng SWGT</h2>
                <p style={{ color: theme.textLight, fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>📌 Thành viên Thường:</p>
                <div style={{ color: theme.textDim, fontSize: '14px', margin: '0 0 15px 0', lineHeight: '1.6' }}>
                    <p style={{ margin: 0 }}>Tham gia Channel: <span style={{color: '#34C759'}}>+10 SWGT/người</span></p>
                    <p style={{ margin: 0 }}>Tham gia Nhóm Chat: <span style={{color: '#34C759'}}>+10 SWGT/người</span></p>
                </div>
                <p style={{ color: theme.gold, fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>⭐ Thành Viên Premium (+5 SWGT):</p>
                <div style={{ color: theme.textDim, fontSize: '14px', margin: '0 0 10px 0', lineHeight: '1.6' }}>
                    <p style={{ margin: 0 }}>Tham gia Channel: <span style={{color: '#34C759'}}>+20 SWGT/người</span></p>
                    <p style={{ margin: 0 }}>Tham gia Nhóm Chat: <span style={{color: '#34C759'}}>+20 SWGT/người</span></p>
                </div>
                <p style={{ color: '#5E92F3', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>💫 Cộng ngay: +5 SWGT bonus!</p>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.textLight, margin: '0 0 15px 0', fontSize: '18px' }}>⏱️ Điều Kiện Rút Tiền</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '14px' }}>✓ Tối thiểu: <span style={{color: theme.textLight, fontWeight: 'bold'}}>500 SWGT/Tài Khoản</span></p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '14px' }}>✓ Thời gian: <span style={{color: theme.textLight, fontWeight: 'bold'}}>Mở khóa sau 30 ngày đếm ngược</span></p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '14px' }}>✓ Rút linh hoạt: <span style={{color: theme.textLight, fontWeight: 'bold'}}>Bất cứ lúc nào khi đủ điều kiện</span></p>
                </div>
            </div>
        </div>
    );

    // --- TAB 2: PHẦN THƯỞNG ---
    const renderRewards = () => {
        let nextTarget = 10;
        let nextReward = "+50 SWGT";
        if (referrals >= 10 && referrals < 50) { nextTarget = 50; nextReward = "+300 SWGT"; }
        else if (referrals >= 50) { nextTarget = 100; nextReward = "+1000 SWGT"; }
        const progressPercent = Math.min((referrals / nextTarget) * 100, 100);

        let displayBoard = [...leaderboard];
        const dummyUsers = [
            { firstName: 'Trần', lastName: 'Thành', referralCount: 24 },
            { firstName: 'Lê', lastName: 'Minh', referralCount: 18 },
            { firstName: 'Phạm', lastName: 'Hương', referralCount: 12 },
            { firstName: 'Hoàng', lastName: 'Nam', referralCount: 7 }
        ];
        if (displayBoard.length < 5) {
            const needed = 5 - displayBoard.length;
            displayBoard = [...displayBoard, ...dummyUsers.slice(0, needed)];
            displayBoard.sort((a, b) => b.referralCount - a.referralCount);
        }

        return (
            <div style={{ padding: '0 20px 20px 20px', paddingBottom: '100px' }}>
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <div style={{ fontSize: '45px', marginBottom: '5px' }}>🎁</div>
                    <h2 style={{ color: theme.gold, margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900' }}>Trung Tâm Thu Nhập</h2>
                    <p style={{ color: theme.textDim, fontSize: '14px', margin: 0 }}>Xây dựng hệ thống - Tạo thu nhập thụ động</p>
                </div>

                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: '0 0 15px 0', color: theme.textLight, fontSize: '16px' }}>🔗 Công cụ lan tỏa</h3>
                    <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '8px', color: theme.gold, fontSize: '15px', wordBreak: 'break-all', marginBottom: '15px', border: `1px dashed ${theme.border}` }}>
                        https://t.me/Dau_Tu_SWC_bot?start={userId || 'ref'}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleCopyLink} style={{ flex: 1, backgroundColor: theme.gold, color: '#000', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '14px', cursor: 'pointer' }}>
                            📋 COPY LINK
                        </button>
                        <a href={`https://t.me/share/url?url=https://t.me/Dau_Tu_SWC_bot?start=${userId}&text=Vào%20nhận%20ngay%20SWGT%20miễn%20phí%20từ%20hệ%20sinh%20thái%20công%20nghệ%20uST%20này%20anh%20em!`} target="_blank" rel="noreferrer" style={{ flex: 1, backgroundColor: '#5E92F3', color: '#fff', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '14px', textAlign: 'center', textDecoration: 'none' }}>
                            ✈️ GỬI BẠN BÈ
                        </a>
                    </div>
                </div>

                {/* --- ĐÃ CHÈN "CÁCH HOẠT ĐỘNG" VÀO TAB PHẦN THƯỞNG TẠI ĐÂY --- */}
                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                    <h2 style={{ color: theme.textLight, margin: '0 0 15px 0', fontSize: '18px' }}>🎯 Cách Hoạt Động</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <p style={{ margin: 0, color: theme.textDim, fontSize: '14px', lineHeight: '1.6' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>📱 Bước 1: Tham gia Bot SWC</span><br/>Liên kết với @Dau_Tu_SWC_bot trên Telegram để bắt đầu.</p>
                        <p style={{ margin: 0, color: theme.textDim, fontSize: '14px', lineHeight: '1.6' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>👥 Bước 2: Mời bạn bè</span><br/>Chia sẻ link giới thiệu và mời bạn bè tham gia cộng đồng SWC.</p>
                        <p style={{ margin: 0, color: theme.textDim, fontSize: '14px', lineHeight: '1.6' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>💰 Bước 3: Nhận SWGT</span><br/>Mỗi người bạn mời sẽ giúp bạn kiếm SWGT thưởng.</p>
                        <div style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)', border: `1px dashed ${theme.green}`, padding: '15px', borderRadius: '10px' }}>
                            <p style={{ margin: 0, color: theme.green, fontSize: '14px', lineHeight: '1.6' }}>
                                <span style={{fontWeight:'bold'}}>💬 MẸO: Tương tác kiếm thêm điểm</span><br/>Mỗi tin nhắn bạn chat trong Nhóm Thảo Luận (từ 10 ký tự trở lên) tự động cộng <b style={{color: theme.gold}}>+0.3 SWGT</b>. Chat càng nhiều, tiền càng nhiều!
                            </p>
                        </div>
                        <p style={{ margin: 0, color: theme.textDim, fontSize: '14px', lineHeight: '1.6' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>🔓 Bước 4: Rút tiền</span><br/>Rút ngay khi đạt 500 SWGT & đợi 30 ngày.</p>
                    </div>
                </div>

                <h3 style={{color: '#fff', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '15px', fontSize: '16px'}}>🚀 CỘT MỐC THƯỞNG NÓNG</h3>
                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                        <div>
                            <p style={{ margin: 0, color: theme.textDim, fontSize: '14px' }}>Đã giới thiệu</p>
                            <h2 style={{ margin: 0, color: theme.textLight, fontSize: '28px' }}>{referrals} <span style={{fontSize:'14px', color: theme.textDim, fontWeight:'normal'}}>người</span></h2>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, color: theme.gold, fontSize: '13px', fontWeight: 'bold' }}>Mục tiêu: {nextTarget} người</p>
                            <p style={{ margin: 0, color: theme.green, fontSize: '14px', fontWeight: 'bold' }}>🎁 Thưởng {nextReward}</p>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '12px', backgroundColor: '#333', borderRadius: '6px', overflow: 'hidden', marginBottom: '15px' }}>
                        <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: theme.gold, transition: 'width 0.5s ease' }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ flex: 1, backgroundColor: '#000', borderRadius: '10px', padding: '15px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{referrals >= 10 ? '🌟' : '🔒'}</div>
                            <p style={{ color: theme.textLight, fontSize: '14px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Mốc 10 Người</p>
                            <p style={{ color: theme.gold, fontSize: '13px', margin: '0 0 10px 0' }}>+50 SWGT</p>
                            <button 
                                onClick={() => handleClaimMilestone(10)} 
                                disabled={referrals < 10 || milestone10}
                                style={{ width: '100%', backgroundColor: milestone10 ? '#333' : (referrals >= 10 ? theme.green : '#333'), color: milestone10 ? theme.textDim : (referrals >= 10 ? '#fff' : theme.textDim), border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: (referrals >= 10 && !milestone10) ? 'pointer' : 'not-allowed' }}>
                                {milestone10 ? 'ĐÃ NHẬN' : 'BẤM NHẬN'}
                            </button>
                        </div>
                        <div style={{ flex: 1, backgroundColor: '#000', borderRadius: '10px', padding: '15px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{referrals >= 50 ? '👑' : '🔒'}</div>
                            <p style={{ color: theme.textLight, fontSize: '14px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Mốc 50 Người</p>
                            <p style={{ color: theme.gold, fontSize: '13px', margin: '0 0 10px 0' }}>+300 SWGT</p>
                            <button 
                                onClick={() => handleClaimMilestone(50)} 
                                disabled={referrals < 50 || milestone50}
                                style={{ width: '100%', backgroundColor: milestone50 ? '#333' : (referrals >= 50 ? theme.green : '#333'), color: milestone50 ? theme.textDim : (referrals >= 50 ? '#fff' : theme.textDim), border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: (referrals >= 50 && !milestone50) ? 'pointer' : 'not-allowed' }}>
                                {milestone50 ? 'ĐÃ NHẬN' : 'BẤM NHẬN'}
                            </button>
                        </div>
                    </div>
                </div>

                <h3 style={{color: '#fff', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '15px', fontSize: '16px'}}>🏆 BẢNG VÀNG ĐUA TOP</h3>
                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '15px', border: `1px solid ${theme.border}`, marginBottom: '25px' }}>
                    {displayBoard.slice(0, 5).map((user, index) => {
                        let medal = "🏅";
                        if (index === 0) medal = "🥇";
                        else if (index === 1) medal = "🥈";
                        else if (index === 2) medal = "🥉";
                        return (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: index < displayBoard.length - 1 ? `1px solid ${theme.border}` : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontSize: '22px', marginRight: '12px' }}>{medal}</span>
                                    <span style={{ color: theme.textLight, fontWeight: 'bold', fontSize: '15px' }}>{user.firstName} {user.lastName}</span>
                                </div>
                                <div style={{ color: theme.gold, fontWeight: 'bold', fontSize: '16px' }}>
                                    {user.referralCount} <span style={{ fontSize: '12px', color: theme.textDim, fontWeight: 'normal' }}>người</span>
                                </div>
                            </div>
                        )
                    })}
                    <div style={{ textAlign: 'center', paddingTop: '15px', borderTop: `1px dashed ${theme.gold}`, marginTop: '5px' }}>
                        <p style={{ color: theme.gold, fontSize: '14px', fontWeight: 'bold', margin: 0, fontStyle: 'italic' }}>👉 Người tiếp theo trên Bảng Vàng sẽ là BẠN!</p>
                    </div>
                </div>

                <h3 style={{color: '#fff', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '15px', fontSize: '16px'}}>💎 KHO ĐẶC QUYỀN VIP</h3>
                <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '15px', marginBottom: '15px', border: `1px solid ${theme.border}`}}>
                    <h4 style={{margin: '0 0 8px 0', color: '#5E92F3', fontSize: '16px'}}>☕ Cà Phê Chiến Lược</h4>
                    <p style={{fontSize: '14px', color: theme.textDim, margin: '0 0 15px 0', lineHeight: '1.5'}}>Thảo luận danh mục trực tiếp cùng Admin.</p>
                    <button onClick={() => redeemItem('Cà Phê Chiến Lược', 300)} style={{backgroundColor: '#5E92F3', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer'}}>Đổi lấy: 300 SWGT</button>
                </div>

                <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '15px', marginBottom: '15px', border: `1px solid ${theme.border}`}}>
                    <h4 style={{margin: '0 0 8px 0', color: '#34C759', fontSize: '16px'}}>🔓 Mở Khóa Group Private</h4>
                    <p style={{fontSize: '14px', color: theme.textDim, margin: '0 0 15px 0', lineHeight: '1.5'}}>Nhận tín hiệu thị trường và họp Zoom kín hàng tuần.</p>
                    <button onClick={() => redeemItem('Group Private', 500)} style={{backgroundColor: '#34C759', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer'}}>Đổi lấy: 500 SWGT</button>
                </div>
            </div>
        );
    };

    const renderWallet = () => (
        <div style={{ padding: '0 20px 20px 20px' }}>
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '30px 20px', border: `1px solid ${theme.border}`, textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    <p style={{ color: theme.textDim, fontSize: '16px', margin: 0, fontWeight: 'bold' }}>Số dư khả dụng</p>
                    <button onClick={() => fetchUserData(userId)} style={{ background: 'none', border: 'none', color: theme.gold, cursor: 'pointer', fontSize: '18px' }}>🔄</button>
                </div>
                <h1 style={{ color: theme.gold, margin: '20px 0', fontSize: '55px', fontWeight: '900' }}>
                    {balance} <span style={{fontSize: '24px', fontWeight: 'normal'}}>SWGT</span>
                </h1>
                
                <input 
                    type="number" 
                    placeholder="Nhập số SWGT muốn rút..." 
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: '#000', color: theme.textLight, boxSizing: 'border-box', marginBottom: '15px', fontSize: '15px', textAlign: 'center' }}
                />

                <button onClick={handleWithdraw} style={{ width: '100%', backgroundColor: balance >= 300 ? theme.green : '#333', color: balance >= 300 ? '#fff' : theme.textDim, padding: '16px', borderRadius: '12px', fontWeight: 'bold', border: 'none', fontSize: '16px', cursor: balance >= 300 ? 'pointer' : 'not-allowed', boxShadow: balance >= 300 ? '0 4px 15px rgba(52, 199, 89, 0.3)' : 'none' }}>
                    {balance >= 300 ? '💸 XÁC NHẬN RÚT TIỀN' : '🔒 CẦN TỐI THIỂU 300 SWGT'}
                </button>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <h3 style={{ margin: '0 0 15px 0', color: theme.textLight, fontSize: '16px' }}>⏳ Đếm ngược mở khóa (30 Ngày)</h3>
                <div style={{ backgroundColor: '#000', padding: '20px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <p style={{ color: theme.textDim, fontSize: '14px', margin: '0 0 15px 0' }}>Thời gian còn lại để mở khóa rút tiền:</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
                        <span style={{ color: theme.textLight, fontSize: '18px', fontWeight: 'bold' }}>Còn</span>
                        <div style={{ padding: '5px 10px', backgroundColor: '#222', borderRadius: '6px', color: theme.gold, fontSize: '18px', fontWeight: 'bold' }}>{timeLeft.days} <span style={{fontSize:'12px', color: theme.textDim, fontWeight:'normal'}}>Ngày</span></div>
                        <div style={{ padding: '5px 10px', backgroundColor: '#222', borderRadius: '6px', color: theme.gold, fontSize: '18px', fontWeight: 'bold' }}>{timeLeft.hours} <span style={{fontSize:'12px', color: theme.textDim, fontWeight:'normal'}}>Giờ</span></div>
                        <div style={{ padding: '5px 10px', backgroundColor: '#222', borderRadius: '6px', color: theme.gold, fontSize: '18px', fontWeight: 'bold' }}>{timeLeft.mins} <span style={{fontSize:'12px', color: theme.textDim, fontWeight:'normal'}}>Phút</span></div>
                    </div>
                </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 59, 48, 0.1)', border: `1px dashed ${theme.red}`, padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                <p style={{ margin: '0 0 5px 0', color: theme.red, fontSize: '14px', fontWeight: 'bold' }}>⚠️ CHÚ Ý QUAN TRỌNG:</p>
                <p style={{ margin: 0, color: theme.red, fontSize: '13px', lineHeight: '1.5' }}>Vui lòng chỉ sử dụng địa chỉ ví SWGT thuộc mạng lưới <b>Ethereum (ERC20)</b>. Nhập sai mạng lưới sẽ mất tài sản!</p>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                    <span style={{ fontSize: '22px' }}>🛡️</span>
                    <div>
                        <h3 style={{ margin: 0, color: theme.textLight, fontSize: '16px' }}>Liên kết ví (Mạng ERC20)</h3>
                        <p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}>Đảm bảo đúng địa chỉ để nhận Token</p>
                    </div>
                </div>
                <input 
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    placeholder="Dán địa chỉ ví ERC20 tại đây..."
                    style={{ width: '100%', padding: '16px', borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: '#000', color: theme.gold, boxSizing: 'border-box', marginBottom: '15px', fontSize: '14px' }}
                />
                <button onClick={handleSaveWallet} style={{ width: '100%', backgroundColor: theme.gold, color: '#000', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '15px', cursor: 'pointer' }}>
                    {wallet ? "CẬP NHẬT ĐỊA CHỈ VÍ" : "LƯU ĐỊA CHỈ VÍ"}
                </button>
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
                    <span style={{ fontSize: '15px', fontWeight: 'bold' }}>Trang chủ</span>
                </div>
                <div onClick={() => setActiveTab('rewards')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'rewards' ? theme.gold : theme.textDim, width: '33%', cursor: 'pointer' }}>
                    <div style={{ fontSize: '26px', marginBottom: '6px' }}>🎁</div>
                    <span style={{ fontSize: '15px', fontWeight: 'bold' }}>Phần thưởng</span>
                </div>
                <div onClick={() => setActiveTab('wallet')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'wallet' ? theme.gold : theme.textDim, width: '33%', cursor: 'pointer' }}>
                    <div style={{ fontSize: '26px', marginBottom: '6px' }}>👛</div>
                    <span style={{ fontSize: '15px', fontWeight: 'bold' }}>Ví</span>
                </div>
            </div>
        </div>
    );
}

export default App;
