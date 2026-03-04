import { useState, useEffect } from 'react';

function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [balance, setBalance] = useState(0);
    const [lockedBalance, setLockedBalance] = useState(0); 
    
    const [withdrawMethod, setWithdrawMethod] = useState('gate'); 
    const [wallet, setWallet] = useState(''); 
    const [gatecode, setGatecode] = useState(''); 
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const [referrals, setReferrals] = useState(0); 
    const [withdrawAmount, setWithdrawAmount] = useState(''); 
    
    const [checkInStreak, setCheckInStreak] = useState(0);
    const [milestones, setMilestones] = useState<any>({});
    
    const [giftCodeInput, setGiftCodeInput] = useState('');

    const [tasks, setTasks] = useState({
        readTaskDone: false,
        youtubeTaskDone: false,
        facebookTaskDone: false,
        shareTaskDone: false
    });

    const [userId, setUserId] = useState('');
    const [userProfile, setUserProfile] = useState({
        name: 'Đang tải...',
        username: '',
        photoUrl: ''
    });

    const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    const [isPremiumUser, setIsPremiumUser] = useState(false);
    const [unlockDateMs, setUnlockDateMs] = useState(0);
    const [lockDaysLimit, setLockDaysLimit] = useState(15);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });
    const [isUnlocked, setIsUnlocked] = useState(false);

    const [boardType, setBoardType] = useState('weekly'); 

    const [animations, setAnimations] = useState<{id: number, text: string, x: number, y: number}[]>([]);
    const [serverDateVN, setServerDateVN] = useState<string>('');

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
        blue: '#5E92F3',
        premium: '#E0B0FF' 
    };

    const MILESTONE_LIST = [
        { req: 3, reward: 10, key: 'milestone3', rank: 'Đại Úy 🎖️' },
        { req: 10, reward: 20, key: 'milestone10', rank: 'Thiếu Tá 🎖️' },
        { req: 20, reward: 40, key: 'milestone20', rank: 'Trung Tá 🎖️' },
        { req: 50, reward: 80, key: 'milestone50', rank: 'Thượng Tá 🎖️' },
        { req: 80, reward: 150, key: 'milestone80', rank: 'Đại Tá 🎖️' },
        { req: 120, reward: 200, key: 'milestone120', rank: 'Thiếu Tướng 🌟' },
        { req: 200, reward: 300, key: 'milestone200', rank: 'Trung Tướng 🌟🌟' },
        { req: 350, reward: 500, key: 'milestone350', rank: 'Thượng Tướng 🌟🌟🌟' },
        { req: 500, reward: 700, key: 'milestone500', rank: 'Đại Tướng 🌟🌟🌟🌟' }
    ];

    // GIẢM 50% THƯỞNG ĐIỂM DANH
    const STREAK_REWARDS = [0.25, 0.75, 1.5, 1.75, 2.5, 3.5, 4.5];

    const triggerFloatAnim = (reward: string | number, x: number, y: number) => {
        const newAnim = { id: Date.now() + Math.random(), text: `+${reward} SWGT`, x, y };
        setAnimations(prev => [...prev, newAnim]);
        setTimeout(() => {
            setAnimations(prev => prev.filter(a => a.id !== newAnim.id));
        }, 1000);
    };

    useEffect(() => {
        if (!unlockDateMs) return;
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = unlockDateMs - now;
            
            if (distance <= 0 || balance >= 1500) {
                setIsUnlocked(true);
                setTimeLeft({ days: 0, hours: 0, mins: 0 });
            } else {
                setIsUnlocked(false);
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
                });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [unlockDateMs, balance]);

    const fetchUserData = (uid: string) => {
        fetch(`${BACKEND_URL}/api/user?id=${uid}`)
            .then(res => res.json())
            .then(data => {
                setBalance(data.balance || 0);
                setLockedBalance(data.lockedBalance || 0); 
                if (data.wallet) setWallet(data.wallet);
                if (data.gatecode) setGatecode(data.gatecode);
                if (data.fullName) setFullName(data.fullName);
                if (data.email) setEmail(data.email);
                if (data.phone) setPhone(data.phone);

                setReferrals(data.referralCount || 0); 
                if (data.lastCheckInDate) setLastCheckIn(data.lastCheckInDate);
                setCheckInStreak(data.checkInStreak || 0);
                
                setMilestones({
                    milestone3: data.milestone3, milestone10: data.milestone10, 
                    milestone20: data.milestone20, milestone50: data.milestone50,
                    milestone80: data.milestone80, milestone120: data.milestone120,
                    milestone200: data.milestone200, milestone350: data.milestone350, milestone500: data.milestone500
                });
                
                const premium = data.isPremium || false;
                setIsPremiumUser(premium);
                const daysLimit = premium ? 7 : 15;
                setLockDaysLimit(daysLimit);

                const joinMs = data.joinDate ? new Date(data.joinDate).getTime() : new Date("2026-02-22T00:00:00Z").getTime();
                setUnlockDateMs(joinMs + (daysLimit * 24 * 60 * 60 * 1000));

                const vnNowStr = data.serverDateVN || new Date(new Date().getTime() + 7 * 3600000).toISOString().split('T')[0];
                setServerDateVN(vnNowStr);

                const lastDailyStr = data.lastDailyTask ? new Date(new Date(data.lastDailyTask).getTime() + 7 * 3600000).toISOString().split('T')[0] : '';
                const lastShareStr = data.lastShareTask ? new Date(new Date(data.lastShareTask).getTime() + 7 * 3600000).toISOString().split('T')[0] : '';
                
                setTasks({
                    readTaskDone: lastDailyStr === vnNowStr, 
                    shareTaskDone: lastShareStr === vnNowStr,
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

    let isCheckedInToday = false;
    if (lastCheckIn && serverDateVN) {
        const lastCheckInVNStr = new Date(new Date(lastCheckIn).getTime() + 7 * 3600000).toISOString().split('T')[0];
        isCheckedInToday = (lastCheckInVNStr === serverDateVN);
    }

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
        return "Tân Binh 🔰";
    };

    const handleCheckIn = (e: React.MouseEvent) => {
        if (isCheckedInToday) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const floatX = rect.left + rect.width / 2;
        const floatY = rect.top;

        fetch(`${BACKEND_URL}/api/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        }).then(res => res.json()).then(data => {
            if (data.success) {
                setBalance(data.balance);
                setLastCheckIn(data.lastCheckInDate);
                setCheckInStreak(data.streak);
                triggerFloatAnim(data.reward, floatX, floatY); 
                alert(`🔥 Điểm danh thành công (Chuỗi ${data.streak} ngày)!\nBạn nhận được +${data.reward} SWGT.`);
                fetchUserData(userId); 
            } else { alert(data.message || "❌ Hôm nay bạn đã điểm danh rồi!"); }
        }).catch(() => alert("⚠️ Mạng chậm, vui lòng thử lại sau giây lát!"));
    };

    const handleClaimGiftCode = () => {
        if (!giftCodeInput.trim()) return alert("⚠️ Vui lòng nhập mã Giftcode!");
        fetch(`${BACKEND_URL}/api/claim-giftcode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, code: giftCodeInput })
        }).then(res => res.json()).then(data => {
            if (data.success) {
                setBalance(data.balance);
                setGiftCodeInput('');
                alert(`🎉 Chúc mừng! Bạn nhận được +${data.reward} SWGT từ mã quà tặng!`);
            } else { alert(data.message); }
        }).catch(() => alert("⚠️ Lỗi kết nối máy chủ!"));
    };

    const handleSaveWallet = () => {
        if (withdrawMethod === 'gate' && !gatecode) return alert("⚠️ Vui lòng nhập Gatecode/UID của bạn!");
        if (withdrawMethod === 'erc20' && !wallet) return alert("⚠️ Vui lòng nhập địa chỉ ví ERC20!");
        fetch(`${BACKEND_URL}/api/save-wallet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, wallet, gatecode, fullName, email, phone })
        }).then(() => alert('✅ Đã lưu thông tin thanh toán thành công!'));
    };

    const handleWithdraw = () => {
        if (!isUnlocked && balance < 1500) { 
            return alert(`⏳ Bạn chưa hết thời gian mở khóa (${lockDaysLimit} ngày). Trừ khi bạn cày đạt 1500 SWGT để được rút ngay!`); 
        }
        const amount = Number(withdrawAmount);
        if (!amount || amount < 500) return alert("⚠️ Bạn cần rút tối thiểu 500 SWGT!");
        if (amount > balance) return alert("⚠️ Số dư của bạn không đủ để rút mức này!");
        if (withdrawMethod === 'gate' && !gatecode) return alert("⚠️ Bạn chọn rút qua Gate.io nhưng chưa nhập Gatecode/UID ở bên dưới!");
        if (withdrawMethod === 'erc20' && !wallet) return alert("⚠️ Bạn chọn rút qua ERC20 nhưng chưa nhập ví ở bên dưới!");

        let confirmMsg = `Xác nhận rút ${amount} SWGT qua mạng Gate.io (Miễn phí)?`;
        if (withdrawMethod === 'erc20') confirmMsg = `Xác nhận rút ${amount} SWGT qua ví ERC20?\n\n⚠️ LƯU Ý: Phí rút mạng ERC20 là 70 SWGT. Bạn sẽ bị trừ phí từ số tiền rút. Bạn có chắc chắn không?`;

        if (window.confirm(confirmMsg)) {
            fetch(`${BACKEND_URL}/api/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, amount, withdrawMethod }) 
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    setBalance(data.balance); setWithdrawAmount(''); 
                    alert(`✅ Yêu cầu rút tiền đã được gửi thành công!\nCổng rút Token SWGT đã mở, Admin sẽ xử lý và chuyển Token cho bạn sớm nhất.`);
                } else { alert(data.message || "❌ Lỗi xử lý!"); }
            });
        }
    };

    const handleCopyLink = () => {
        const link = `https://t.me/Dau_Tu_SWC_bot?start=${userId || 'ref'}`;
        navigator.clipboard.writeText(link).then(() => alert('✅ Đã sao chép link giới thiệu thành công!')).catch(() => alert('❌ Lỗi sao chép!'));
    };

    const handleClaimMilestone = (milestoneReq: number, reward: number, e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const floatX = rect.left + rect.width / 2;
        const floatY = rect.top;

        fetch(`${BACKEND_URL}/api/claim-milestone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, milestone: milestoneReq })
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                setBalance(data.balance);
                setMilestones((prev: any) => ({ ...prev, [`milestone${milestoneReq}`]: true }));
                triggerFloatAnim(reward, floatX, floatY); 
            } else { alert(data.message || "❌ Chưa đủ điều kiện nhận hoặc đã nhận rồi!"); }
        });
    };

    const redeemItem = (itemName: string, cost: number) => {
        if (balance < cost) return alert(`⚠️ Bạn cần thêm ${cost - balance} SWGT nữa để đổi quyền lợi này!`);
        if (window.confirm(`Xác nhận dùng ${cost} SWGT để đổi ${itemName}?`)) {
            fetch(`${BACKEND_URL}/api/redeem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, itemName, cost })
            }).then(res => res.json()).then(data => {
                if(data.success) { setBalance(data.balance); alert("🎉 Yêu cầu đổi quà đã được gửi! Admin sẽ xử lý sớm."); }
            });
        }
    };

    const startShareTask = () => {
        const url = `https://t.me/share/url?url=https://t.me/Dau_Tu_SWC_bot?start=${userId}&text=Cơ%20hội%20nhận%20SWGT%20miễn%20phí%20từ%20Cộng%20Đồng%20SWC!`;
        window.open(url, '_blank'); 
    };

    const claimTaskApp = (taskType: string, e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const floatX = rect.left + rect.width / 2;
        const floatY = rect.top;

        fetch(`${BACKEND_URL}/api/claim-app-task`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, taskType })
        }).then(res => res.json()).then(data => {
            if(data.success) {
                setBalance(data.balance);
                setTasks(prev => ({ ...prev, [`${taskType}TaskDone`]: true }));
                triggerFloatAnim(data.reward, floatX, floatY); 
            } else { alert(data.message || "⚠️ Bạn chưa thao tác trên Bot Telegram hoặc chưa nán lại đủ thời gian!"); }
        }).catch(() => alert("⚠️ Mạng chậm, vui lòng thử lại."));
    };

    const renderHeader = () => {
        const isFireEffect = (Number(userId || 1) % 2) !== 0; 
        const effectColor = isFireEffect ? '#FF3B30' : '#00FFFF'; 
        const pulseAnim = isFireEffect ? 'pulseGlowRed 2s infinite' : 'pulseGlowCyan 2s infinite';

        let myRank = 0;
        if (referrals > 0) {
            const strictlyBetter = leaderboard.filter(u => u.referralCount > referrals).length;
            myRank = strictlyBetter + 1;
        }
        let vipLevel = "Tân Binh 🥉";
        let wreathColor = "#8E8E93"; 
        if (myRank === 1 && referrals >= 5) { vipLevel = "🏆 TOP 1 SERVER"; wreathColor = "#F4D03F"; }
        else if (myRank === 2 && referrals >= 5) { vipLevel = "🔥 TOP 2 SERVER"; wreathColor = "#C0C0C0"; }
        else if (myRank === 3 && referrals >= 5) { vipLevel = "🔥 TOP 3 SERVER"; wreathColor = "#CD7F32"; }
        else if (myRank > 0 && myRank <= 10 && referrals >= 5) { vipLevel = `🌟 TOP ${myRank} SERVER`; wreathColor = theme.blue; }
        else if (referrals >= 100) { vipLevel = "Huyền Thoại 👑"; wreathColor = "#E0B0FF"; }
        else if (referrals >= 50) { vipLevel = "Đối Tác VIP 💎"; wreathColor = theme.gold; }
        else if (referrals >= 10) { vipLevel = "Đại Sứ 🥇"; wreathColor = "#C0C0C0"; }
        else if (referrals >= 3) { vipLevel = "Sứ Giả 🥈"; wreathColor = "#CD7F32"; }

        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: theme.bg }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src="/logo.png" alt="SWC Logo" style={{ width: '45px', height: '45px', borderRadius: '50%', border: `2px solid ${theme.gold}`, marginRight: '12px', objectFit: 'cover' }} />
                    <div>
                        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: theme.textLight }}>CỘNG ĐỒNG</h1>
                        <p style={{ margin: 0, fontSize: '13px', color: theme.gold, fontWeight: 'bold' }}>Đầu tư uST</p>
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', textAlign: 'right' }}>
                    <div style={{ marginRight: '15px' }}>
                        <h2 style={{ margin: 0, fontSize: '15px', color: theme.textLight, fontWeight: 'bold' }}>{userProfile.name}</h2>
                        <p style={{ margin: 0, fontSize: '12px', color: theme.textDim, fontWeight: 'bold' }}>{getMilitaryRank(referrals)}</p>
                    </div>
                    
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '5px' }}>
                        <div style={{ position: 'relative', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                            <div style={{
                                position: 'absolute',
                                top: '-4px', left: '-4px', right: '-4px', bottom: '-4px',
                                borderRadius: '50%',
                                border: `2px dashed ${effectColor}`,
                                animation: `spin 4s linear infinite, ${pulseAnim}`,
                                zIndex: 0
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
                            <span style={{ color: wreathColor, fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                {vipLevel}
                            </span>
                        </div>
                        <div style={{ position: 'absolute', top: '0px', right: '-2px', width: '12px', height: '12px', backgroundColor: theme.green, borderRadius: '50%', border: `2px solid ${theme.bg}`, zIndex: 12 }}></div>
                    </div>
                </div>
            </div>
        );
    }

    const renderWealthBoard = () => {
        // Tự động gộp dữ liệu từ API và Dummy cho sinh động
        const dummyUsers = [
            { firstName: 'Vũ', lastName: 'Dũng', referralCount: 65, weeklyReferralCount: 12 },
            { firstName: 'Mai', lastName: 'Thiều Thị', referralCount: 60, weeklyReferralCount: 10 },
            { firstName: 'LINH', lastName: 'NGUYEN', referralCount: 47, weeklyReferralCount: 8 },
            { firstName: 'Minh', lastName: 'Ngọc Hoàng', referralCount: 33, weeklyReferralCount: 5 },
            { firstName: 'PHƯƠNG', lastName: 'ANH PHÙNG', referralCount: 27, weeklyReferralCount: 4 }
        ];

        let displayData = [...leaderboard];
        if (displayData.length < 5) displayData = [...displayData, ...dummyUsers];

        // SẮP XẾP LẠI VÀ CHỈNH SỬA TOÁN HỌC (x5 SWGT CHO MỖI REFERRAL)
        const sortedData = displayData.map(u => ({
            ...u,
            displayCount: boardType === 'weekly' ? (u.weeklyReferralCount || 0) : u.referralCount,
            displayTotal: boardType === 'weekly' ? (u.weeklyReferralCount || 0) * 5 : (u.referralCount * 5) + 300
        })).sort((a, b) => b.displayCount - a.displayCount);

        return (
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', border: `1px solid ${theme.border}`, marginBottom: '25px' }}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <button
                        onClick={() => setBoardType('weekly')}
                        style={{ 
                            flex: 1, padding: '12px', borderRadius: '10px', 
                            border: `2px solid ${boardType === 'weekly' ? theme.gold : theme.border}`, 
                            backgroundColor: boardType === 'weekly' ? 'rgba(244, 208, 63, 0.15)' : '#1C1C1E', 
                            color: boardType === 'weekly' ? theme.gold : theme.textDim, 
                            fontWeight: '900', fontSize: '14px', cursor: 'pointer'
                        }}
                    >
                        🏆 TOP TUẦN
                    </button>
                    <button
                        onClick={() => setBoardType('all')}
                        style={{ 
                            flex: 1, padding: '12px', borderRadius: '10px', 
                            border: `2px solid ${boardType === 'all' ? theme.gold : theme.border}`, 
                            backgroundColor: boardType === 'all' ? 'rgba(244, 208, 63, 0.15)' : '#1C1C1E', 
                            color: boardType === 'all' ? theme.gold : theme.textDim, 
                            fontWeight: '900', fontSize: '14px', cursor: 'pointer'
                        }}
                    >
                        🌟 TOP TỔNG
                    </button>
                </div>
                
                <div style={{ backgroundColor: 'rgba(244, 208, 63, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: `1px dashed ${theme.gold}` }}>
                    <p style={{fontSize: '13px', color: theme.gold, margin: 0, lineHeight: '1.5', textAlign: 'center'}}>
                        {boardType === 'weekly' 
                            ? 'Số liệu Tuần Reset vào 23:59 Chủ Nhật hàng tuần.'
                            : 'Bảng xếp hạng dựa trên tổng số người mời thực tế.'}
                    </p>
                </div>

                {sortedData.slice(0, 10).map((user, index) => {
                    // HIỂN THỊ TÊN ĐẦY ĐỦ KHÔNG BỊ CẮT
                    const isMe = `${user.firstName} ${user.lastName}`.trim() === userProfile.name.trim();
                    const rankTitle = getMilitaryRank(user.referralCount);
                    let badge = "🥈";
                    if (index === 0) badge = "🥇";
                    if (index === 2) badge = "🥉";
                    if (index > 2) badge = "🎖️";

                    return (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 10px', borderBottom: `1px solid ${theme.border}`, backgroundColor: isMe ? 'rgba(244, 208, 63, 0.05)' : 'transparent' }}>
                            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                <div style={{ minWidth: '35px', textAlign: 'center', marginRight: '10px', fontSize: '18px' }}>{badge}</div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ color: theme.textLight, fontWeight: 'bold', fontSize: '14px' }}>
                                        {user.firstName} {user.lastName} {isMe && <span style={{color: theme.gold, fontSize: '11px', fontWeight: 'normal'}}>(Bạn)</span>}
                                    </span>
                                    <span style={{ color: theme.textDim, fontSize: '11px' }}>{rankTitle}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: theme.green, fontWeight: 'bold', fontSize: '14px' }}>{user.displayTotal} SWGT</div>
                                <div style={{ color: theme.textDim, fontSize: '11px' }}>({user.displayCount} người)</div>
                            </div>
                        </div>
                    )
                })}
            </div>
        );
    };

    const renderHome = () => (
        <div style={{ padding: '0 20px 20px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '20px' }}>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px 5px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: 0, color: theme.gold, fontSize: '20px', fontWeight: 'bold' }}>{balance}</h3>
                    <p style={{ margin: '5px 0 0 0', color: theme.textDim, fontSize: '11px' }}>Số dư SWGT</p>
                </div>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px 5px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: 0, color: theme.gold, fontSize: '20px', fontWeight: 'bold' }}>{referrals}</h3>
                    <p style={{ margin: '5px 0 0 0', color: theme.textDim, fontSize: '11px' }}>Đã mời</p>
                </div>
                <div style={{ flex: 1, backgroundColor: theme.cardBg, borderRadius: '12px', padding: '15px 5px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: 0, color: isPremiumUser ? theme.premium : theme.gold, fontSize: '16px', fontWeight: 'bold' }}>
                        {isPremiumUser ? 'Premium⭐' : 'Thường'}
                    </h3>
                    <p style={{ margin: '5px 0 0 0', color: theme.textDim, fontSize: '11px' }}>Loại TK</p>
                </div>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', textAlign: 'center', border: `1px solid ${theme.border}`, marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>📅 Điểm Danh Hàng Ngày</h3>
                    <span style={{ color: theme.gold, fontSize: '13px', fontWeight: 'bold' }}>🔥 Chuỗi: {checkInStreak}/7</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {[1, 2, 3, 4, 5, 6, 7].map((day, idx) => {
                        const isClaimed = isCheckedInToday ? day <= checkInStreak : day < checkInStreak;
                        const isToday = isCheckedInToday ? day === checkInStreak : day === checkInStreak + 1;
                        let bgColor = '#000'; let textColor = theme.textDim; let borderColor = theme.border;
                        if (isClaimed) { bgColor = 'rgba(52, 199, 89, 0.1)'; textColor = theme.green; borderColor = theme.green; }
                        else if (isToday) { bgColor = 'rgba(244, 208, 63, 0.1)'; textColor = theme.gold; borderColor = theme.gold; }

                        return (
                            <div key={day} style={{ minWidth: '40px', backgroundColor: bgColor, borderRadius: '8px', padding: '8px 5px', border: `1px solid ${borderColor}`, position: 'relative' }}>
                                {isClaimed && <div style={{position:'absolute', top:'-6px', right:'-6px', background:'#0F0F0F', borderRadius:'50%', fontSize:'14px', zIndex: 5}}>✅</div>}
                                <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: textColor }}>Ngày {day}</p>
                                <p style={{ margin: 0, fontSize: '11px', fontWeight: 'bold', color: textColor }}>
                                    {isClaimed ? 'Đã nhận' : `+${STREAK_REWARDS[idx]}`}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <button 
                    onClick={(e) => handleCheckIn(e)} 
                    disabled={isCheckedInToday}
                    style={{ width: '100%', backgroundColor: isCheckedInToday ? '#333' : theme.green, color: isCheckedInToday ? theme.textDim : '#fff', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: isCheckedInToday ? 'not-allowed' : 'pointer', fontSize: '15px' }}
                >
                    {isCheckedInToday ? "✅ ĐÃ NHẬN HÔM NAY" : "✋ BẤM ĐIỂM DANH NGAY"}
                </button>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.textLight, margin: '0 0 5px 0', fontSize: '17px' }}>🧠 Nạp Kiến Thức & Lan Tỏa</h2>
                <p style={{ color: theme.gold, fontSize: '11px', marginBottom: '15px', fontStyle: 'italic' }}>⚠️ Lưu ý: Bạn cần bấm vào Link nhiệm vụ do Bot gửi trong tin nhắn trước khi bấm Nhận Quà tại đây.</p>
                
                <div style={{ backgroundColor: '#000', padding: '12px', borderRadius: '10px', marginBottom: '10px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                            <h4 style={{ margin: 0, color: theme.textLight, fontSize: '14px' }}>📖 Đọc bài phân tích</h4>
                            <p style={{ margin: 0, color: theme.textDim, fontSize: '12px' }}>Đợi 60 giây (+5 SWGT)</p>
                        </div>
                        {tasks.readTaskDone && <span style={{ color: theme.green, fontWeight: 'bold' }}>✅ Xong</span>}
                    </div>
                    {!tasks.readTaskDone && (
                        <button onClick={(e) => claimTaskApp('read', e)} style={{ width: '100%', backgroundColor: theme.gold, color: '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                            🎁 NHẬN QUÀ ĐỌC BÀI
                        </button>
                    )}
                </div>

                <div style={{ backgroundColor: '#000', padding: '12px', borderRadius: '10px', marginBottom: '10px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                            <h4 style={{ margin: 0, color: theme.textLight, fontSize: '14px' }}>▶️ Xem YouTube SWC</h4>
                            <p style={{ margin: 0, color: theme.textDim, fontSize: '12px' }}>Đợi 6 giây (+2.5 SWGT)</p>
                        </div>
                        {tasks.youtubeTaskDone && <span style={{ color: theme.green, fontWeight: 'bold' }}>✅ Xong</span>}
                    </div>
                    {!tasks.youtubeTaskDone && (
                        <button onClick={(e) => claimTaskApp('youtube', e)} style={{ width: '100%', backgroundColor: theme.gold, color: '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                            🎁 NHẬN QUÀ YOUTUBE
                        </button>
                    )}
                </div>

                <div style={{ backgroundColor: '#000', padding: '12px', borderRadius: '10px', marginBottom: '10px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                            <h4 style={{ margin: 0, color: theme.textLight, fontSize: '14px' }}>📘 Theo dõi Fanpage</h4>
                            <p style={{ margin: 0, color: theme.textDim, fontSize: '12px' }}>Đợi 5 giây (+2.5 SWGT)</p>
                        </div>
                        {tasks.facebookTaskDone && <span style={{ color: theme.green, fontWeight: 'bold' }}>✅ Xong</span>}
                    </div>
                    {!tasks.facebookTaskDone && (
                        <button onClick={(e) => claimTaskApp('facebook', e)} style={{ width: '100%', backgroundColor: theme.gold, color: '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                            🎁 NHẬN QUÀ FANPAGE
                        </button>
                    )}
                </div>

                <div style={{ backgroundColor: '#000', padding: '12px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                            <h4 style={{ margin: 0, color: theme.textLight, fontSize: '14px' }}>📢 Chia sẻ dự án</h4>
                            <p style={{ margin: 0, color: theme.textDim, fontSize: '12px' }}>Chuyển tiếp cho bạn bè (+7.5 SWGT)</p>
                        </div>
                        {tasks.shareTaskDone && <span style={{ color: theme.green, fontWeight: 'bold' }}>✅ Xong</span>}
                    </div>
                    {!tasks.shareTaskDone && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={startShareTask} style={{ flex: 1, backgroundColor: '#34C759', color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>MỞ CHIA SẺ</button>
                            <button onClick={(e) => claimTaskApp('share', e)} style={{ flex: 1, backgroundColor: theme.gold, color: '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                                NHẬN QUÀ
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderRewards = () => {
        let nextTarget = 3; let nextReward = "+10 SWGT";
        for (let m of MILESTONE_LIST) {
            if (referrals < m.req) { nextTarget = m.req; nextReward = `+${m.reward} SWGT`; break; }
        }
        let progressPercent = Math.min((referrals / nextTarget) * 100, 100);

        return (
            <div style={{ padding: '0 20px 20px 20px', paddingBottom: '100px' }}>
                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: '0 0 15px 0', color: theme.textLight, fontSize: '16px' }}>🎟️ Nhập Mã Giftcode</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            value={giftCodeInput} 
                            onChange={(e) => setGiftCodeInput(e.target.value)} 
                            placeholder="Nhập mã săn được..." 
                            style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `1px solid ${theme.green}`, backgroundColor: '#000', color: theme.gold, fontSize: '14px', textTransform: 'uppercase', boxSizing: 'border-box' }} 
                        />
                        <button onClick={handleClaimGiftCode} style={{ backgroundColor: theme.green, color: '#fff', padding: '0 20px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                            NHẬN
                        </button>
                    </div>
                </div>

                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: '0 0 15px 0', color: theme.textLight, fontSize: '16px' }}>🔗 Link Lan Tỏa</h3>
                    <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '8px', color: theme.gold, fontSize: '13px', wordBreak: 'break-all', marginBottom: '15px', border: `1px dashed ${theme.border}` }}>
                        https://t.me/Dau_Tu_SWC_bot?start={userId || 'ref'}
                    </div>
                    <button onClick={handleCopyLink} style={{ width: '100%', backgroundColor: theme.gold, color: '#000', padding: '14px 0', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>📋 COPY LINK MỜI</button>
                </div>

                <h3 style={{color: '#fff', paddingBottom: '10px', marginBottom: '15px', fontSize: '16px'}}>🚀 9 CỘT MỐC THƯỞNG NÓNG</h3>
                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                        <div>
                            <p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}>Đã giới thiệu</p>
                            <h2 style={{ margin: 0, color: theme.textLight, fontSize: '24px' }}>{referrals} <span style={{fontSize:'12px', color: theme.textDim, fontWeight:'normal'}}>người</span></h2>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, color: theme.gold, fontSize: '12px' }}>Tiếp: {nextTarget} người</p>
                            <p style={{ margin: 0, color: theme.green, fontSize: '12px', fontWeight: 'bold' }}>Thưởng {nextReward}</p>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: '#333', borderRadius: '5px', overflow: 'hidden', marginBottom: '15px' }}>
                        <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: theme.gold }}></div>
                    </div>

                    <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px' }}>
                        {MILESTONE_LIST.map((m) => {
                            const isClaimed = milestones[m.key];
                            const canClaim = referrals >= m.req && !isClaimed;
                            return (
                                <div key={m.req} style={{ minWidth: '105px', backgroundColor: '#000', borderRadius: '10px', padding: '12px 8px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
                                    <p style={{ color: theme.textLight, fontSize: '12px', fontWeight: 'bold', margin: '0 0 2px 0' }}>Mốc {m.req}</p>
                                    <p style={{ color: theme.gold, fontSize: '12px', fontWeight: '900', margin: '0 0 10px 0' }}>+{m.reward}</p>
                                    <button 
                                        onClick={(e) => handleClaimMilestone(m.req, m.reward, e)} 
                                        disabled={!canClaim}
                                        style={{ width: '100%', backgroundColor: isClaimed ? '#333' : (canClaim ? theme.green : '#333'), color: isClaimed ? theme.textDim : '#fff', border: 'none', padding: '7px 0', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px', cursor: canClaim ? 'pointer' : 'not-allowed' }}>
                                        {isClaimed ? 'ĐÃ NHẬN' : 'NHẬN'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <h3 style={{color: theme.gold, paddingBottom: '10px', marginBottom: '15px', fontSize: '17px', textAlign: 'center', fontWeight: '900'}}>🤝 BẢNG VÀNG ĐẠI SỨ</h3>
                {renderWealthBoard()}

                <h3 style={{color: '#fff', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '15px', fontSize: '16px'}}>💎 KHO ĐẶC QUYỀN VIP</h3>
                <p style={{ color: theme.textDim, fontSize: '13px', marginBottom: '15px' }}>Dùng SWGT quy đổi lấy vũ khí thực chiến:</p>
                
                {/* GIỮ NGUYÊN CÁC MỐC CỬA HÀNG VIP ANH YÊU CẦU */}
                <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '15px', marginBottom: '15px', border: `1px solid ${theme.border}`}}>
                    <h4 style={{margin: '0 0 8px 0', color: '#5E92F3', fontSize: '16px'}}>☕ Cà Phê Chiến Lược : 6000</h4>
                    <p style={{fontSize: '14px', color: theme.textDim, margin: '0 0 15px 0', lineHeight: '1.5'}}>Thảo luận danh mục trực tiếp cùng Admin Ucity.</p>
                    <button onClick={() => redeemItem('Cà Phê Chiến Lược', 6000)} style={{backgroundColor: '#5E92F3', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer'}}>LIÊN HỆ ADMIN</button>
                </div>
                
                <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '15px', marginBottom: '15px', border: `1px solid ${theme.border}`}}>
                    <h4 style={{margin: '0 0 8px 0', color: '#34C759', fontSize: '16px'}}>🔓 Mở Khóa Group Private : 8000</h4>
                    <p style={{fontSize: '14px', color: theme.textDim, margin: '0 0 15px 0', lineHeight: '1.5'}}>Nhận tín hiệu thị trường và họp Zoom kín hàng tuần.</p>
                    <button onClick={() => redeemItem('Group Private', 8000)} style={{backgroundColor: '#34C759', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer'}}>LIÊN HỆ ADMIN</button>
                </div>

                <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '15px', marginBottom: '15px', border: `1px solid ${theme.border}`}}>
                    <h4 style={{margin: '0 0 8px 0', color: theme.gold, fontSize: '16px'}}>🎟️ Phiếu Đầu Tư Ưu Đãi : 9000</h4>
                    <p style={{fontSize: '14px', color: theme.textDim, margin: '0 0 15px 0', lineHeight: '1.5'}}>Nhận Voucher chiết khấu đặc biệt khi vào gói đầu tư lớn.</p>
                    <button onClick={() => redeemItem('Phiếu Đầu Tư', 9000)} style={{backgroundColor: theme.gold, color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer'}}>LIÊN HỆ ADMIN</button>
                </div>
            </div>
        );
    };

    const renderWallet = () => (
        <div style={{ padding: '0 20px 20px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '25px 20px', border: `1px solid ${theme.gold}`, textAlign: 'center' }}>
                    <p style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 5px 0', fontWeight: 'bold' }}>💰 TỔNG TÀI SẢN SWGT</p>
                    <h1 style={{ color: theme.gold, margin: '0', fontSize: '42px', fontWeight: '900' }}>
                        {Math.round((balance + lockedBalance) * 100) / 100}
                    </h1>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1, backgroundColor: 'rgba(52, 199, 89, 0.1)', border: `1px solid ${theme.green}`, borderRadius: '12px', padding: '15px 5px', textAlign: 'center' }}>
                        <p style={{ color: theme.green, fontSize: '11px', margin: '0 0 5px 0', fontWeight: 'bold' }}>✅ Khả Dụng</p>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '22px' }}>{balance}</h3>
                    </div>
                    <div style={{ flex: 1, backgroundColor: 'rgba(255, 59, 48, 0.1)', border: `1px solid ${theme.red}`, borderRadius: '12px', padding: '15px 5px', textAlign: 'center' }}>
                        <p style={{ color: theme.red, fontSize: '11px', margin: '0 0 5px 0', fontWeight: 'bold' }}>🔒 Chờ Duyệt</p>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '22px' }}>{lockedBalance}</h3>
                    </div>
                </div>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', textAlign: 'center', border: `1px solid ${theme.border}`, marginBottom: '20px' }}>
                <input 
                    type="number" 
                    placeholder="Số lượng muốn rút..." 
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: '#000', color: theme.textLight, marginBottom: '15px', fontSize: '15px', textAlign: 'center', boxSizing: 'border-box' }}
                />
                <button onClick={handleWithdraw} style={{ width: '100%', backgroundColor: balance >= 500 ? theme.green : '#333', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: balance >= 500 ? 'pointer' : 'not-allowed' }}>
                    {balance >= 500 ? '💸 XÁC NHẬN RÚT TIỀN' : '🔒 TỐI THIỂU 500 KHẢ DỤNG'}
                </button>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <h3 style={{ margin: '0 0 15px 0', color: theme.textLight, fontSize: '15px' }}>⏳ Đếm ngược mở khóa ví</h3>
                {isUnlocked ? (
                    <div style={{ padding: '15px', backgroundColor: 'rgba(52, 199, 89, 0.1)', borderRadius: '10px', color: theme.green, fontWeight: 'bold', textAlign: 'center', border: `1px dashed ${theme.green}` }}>🎉 CỔNG RÚT TIỀN ĐÃ MỞ!</div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <div style={{ padding: '10px', backgroundColor: '#222', borderRadius: '8px', color: theme.gold, fontWeight: 'bold' }}>{timeLeft.days}D</div>
                        <div style={{ padding: '10px', backgroundColor: '#222', borderRadius: '8px', color: theme.gold, fontWeight: 'bold' }}>{timeLeft.hours}H</div>
                        <div style={{ padding: '10px', backgroundColor: '#222', borderRadius: '8px', color: theme.gold, fontWeight: 'bold' }}>{timeLeft.mins}M</div>
                    </div>
                )}
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                <h3 style={{ margin: '0 0 15px 0', color: theme.textLight, fontSize: '15px' }}>⚙️ Thiết lập thanh toán</h3>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button onClick={() => setWithdrawMethod('gate')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${withdrawMethod === 'gate' ? theme.green : theme.border}`, backgroundColor: withdrawMethod === 'gate' ? 'rgba(52, 199, 89, 0.1)' : '#000', color: withdrawMethod === 'gate' ? theme.green : theme.textDim, cursor: 'pointer', fontWeight: 'bold' }}>Gate.io</button>
                    <button onClick={() => setWithdrawMethod('erc20')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${withdrawMethod === 'erc20' ? theme.red : theme.border}`, backgroundColor: withdrawMethod === 'erc20' ? 'rgba(255, 59, 48, 0.1)' : '#000', color: withdrawMethod === 'erc20' ? theme.red : theme.textDim, cursor: 'pointer', fontWeight: 'bold' }}>Ví ERC20</button>
                </div>
                {withdrawMethod === 'gate' ? (
                    <input value={gatecode} onChange={(e) => setGatecode(e.target.value)} placeholder="UID / Gatecode Gate.io..." style={{ width: '100%', padding: '14px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: '#000', color: theme.gold, marginBottom: '15px', boxSizing: 'border-box' }} />
                ) : (
                    <input value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="Địa chỉ ví ERC20..." style={{ width: '100%', padding: '14px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: '#000', color: theme.gold, marginBottom: '15px', boxSizing: 'border-box' }} />
                )}
                <button onClick={handleSaveWallet} style={{ width: '100%', backgroundColor: theme.gold, color: '#000', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>LƯU THÔNG TIN</button>
            </div>
        </div>
    );

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '90px' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .nav-item { transition: all 0.3s; cursor: pointer; width: 33%; display: flex; flex-direction: column; align-items: center; opacity: 0.6; }
                .nav-item.active { opacity: 1; transform: translateY(-4px); }
                .floating-reward { position: fixed; color: #F4D03F; font-weight: 900; font-size: 24px; z-index: 9999; animation: floatUp 1s forwards; text-shadow: 0 0 8px rgba(0,0,0,0.5); }
                @keyframes floatUp { 0% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -80px); } }
            `}</style>
            
            {animations.map(anim => (
                <div key={anim.id} className="floating-reward" style={{ left: anim.x, top: anim.y }}>{anim.text}</div>
            ))}

            {renderHeader()}
            <div style={{ marginTop: '10px' }}>
                {activeTab === 'home' && renderHome()}
                {activeTab === 'rewards' && renderRewards()}
                {activeTab === 'wallet' && renderWallet()}
            </div>

            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: theme.cardBg, borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-around', padding: '15px 0', zIndex: 100 }}>
                <div onClick={() => setActiveTab('home')} className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} style={{ color: activeTab === 'home' ? theme.gold : theme.textDim }}>
                    <span style={{ fontSize: '24px' }}>🏠</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Trang chủ</span>
                </div>
                <div onClick={() => setActiveTab('rewards')} className={`nav-item ${activeTab === 'rewards' ? 'active' : ''}`} style={{ color: activeTab === 'rewards' ? theme.gold : theme.textDim }}>
                    <span style={{ fontSize: '24px' }}>🎁</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Thưởng</span>
                </div>
                <div onClick={() => setActiveTab('wallet')} className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`} style={{ color: activeTab === 'wallet' ? theme.gold : theme.textDim }}>
                    <span style={{ fontSize: '24px' }}>👛</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Ví</span>
                </div>
            </div>
        </div>
    );
}

export default App;