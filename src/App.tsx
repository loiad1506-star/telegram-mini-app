import { useState, useEffect } from 'react';

function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [balance, setBalance] = useState(0);
    
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

    const STREAK_REWARDS = [0.5, 1.5, 3, 3.5, 5, 7, 9];

    const triggerFloatAnim = (reward: string | number, e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top;
        const newAnim = { id: Date.now() + Math.random(), text: `+${reward} SWGT`, x: startX, y: startY };
        
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

    let displayBoard = [...leaderboard];
    const dummyUsers = [
        { firstName: 'Vũ', lastName: 'Dũng', referralCount: 65 },
        { firstName: 'Mai', lastName: 'Thiều Thị', referralCount: 60 },
        { firstName: 'LINH', lastName: 'NGUYEN', referralCount: 47 },
        { firstName: 'Minh', lastName: 'Ngọc Hoàng', referralCount: 33 },
        { firstName: 'PHƯƠNG', lastName: 'ANH PHÙNG', referralCount: 27 },
        { firstName: 'Nông', lastName: 'Mao', referralCount: 12 },
        { firstName: 'Support', lastName: '', referralCount: 11 },
        { firstName: 'OSAKA', lastName: 'CHAU HUYNH', referralCount: 10 },
        { firstName: 'Trinh', lastName: 'Lê', referralCount: 9 },
        { firstName: 'Lý', lastName: 'Hà', referralCount: 8 }
    ];
    
    if (displayBoard.length < 10) {
        const needed = 10 - displayBoard.length;
        displayBoard = [...displayBoard, ...dummyUsers.slice(0, needed)];
        displayBoard.sort((a, b) => b.referralCount - a.referralCount);
    }

    const currentBoard = displayBoard.map(u => ({
        ...u, 
        displayCount: boardType === 'weekly' ? Math.ceil(u.referralCount / 3) : u.referralCount
    })).sort((a, b) => b.displayCount - a.displayCount);

    let wealthBoard = currentBoard.slice(0, 10).map((user, index) => {
        let estimatedTotal = (user.displayCount * 15) + 300 + (10 - index) * 50; 
        if (user.displayCount === referrals && user.firstName === userProfile.name.split(' ')[0]) {
            estimatedTotal = balance + (referrals * 15) + (checkInStreak * 5) + 50; 
        }
        return { ...user, totalEarned: Math.round(estimatedTotal * 10) / 10 };
    });
    wealthBoard.sort((a, b) => b.totalEarned - a.totalEarned);

    let myRank = 0;
    if (referrals > 0) {
        const strictlyBetter = displayBoard.filter(u => u.referralCount > referrals).length;
        myRank = strictlyBetter + 1;
    }

    let militaryRank = getMilitaryRank(referrals);

    let vipLevel = "Tân Binh 🥉";
    let wreathColor = "#8E8E93"; 

    if (myRank === 1 && referrals >= 5) { 
        vipLevel = "🏆 TOP 1 SERVER"; wreathColor = "#F4D03F"; 
    }
    else if (myRank === 2 && referrals >= 5) { 
        vipLevel = "🔥 TOP 2 SERVER"; wreathColor = "#C0C0C0"; 
    }
    else if (myRank === 3 && referrals >= 5) { 
        vipLevel = "🔥 TOP 3 SERVER"; wreathColor = "#CD7F32"; 
    }
    else if (myRank > 0 && myRank <= 10 && referrals >= 5) { 
        vipLevel = `🌟 TOP ${myRank} SERVER`; wreathColor = theme.blue; 
    }
    else if (referrals >= 100) { 
        vipLevel = "Huyền Thoại 👑"; wreathColor = "#E0B0FF"; 
    }
    else if (referrals >= 50) { 
        vipLevel = "Đối Tác VIP 💎"; wreathColor = theme.gold; 
    }
    else if (referrals >= 10) { 
        vipLevel = "Đại Sứ 🥇"; wreathColor = "#C0C0C0"; 
    }
    else if (referrals >= 3) { 
        vipLevel = "Sứ Giả 🥈"; wreathColor = "#CD7F32"; 
    }

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
                triggerFloatAnim(data.reward, e); 
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
                triggerFloatAnim(reward, e); 
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

    const claimTaskApp = (taskType: string, e: React.MouseEvent) => {
        fetch(`${BACKEND_URL}/api/claim-app-task`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, taskType })
        }).then(res => res.json()).then(data => {
            if(data.success) {
                setBalance(data.balance);
                setTasks(prev => ({ ...prev, [`${taskType}TaskDone`]: true }));
                triggerFloatAnim(data.reward, e); 
            } else { alert(data.message || "⚠️ Bạn chưa thao tác trên Bot Telegram hoặc chưa nán lại đủ thời gian!"); }
        }).catch(() => alert("⚠️ Mạng chậm, vui lòng thử lại."));
    };

    const renderHeader = () => {
        const isFireEffect = (Number(userId || 1) % 2) !== 0; 
        const effectColor = isFireEffect ? '#FF3B30' : '#00FFFF'; 
        const pulseAnim = isFireEffect ? 'pulseGlowRed 2s infinite' : 'pulseGlowCyan 2s infinite';

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
                        <p style={{ margin: 0, fontSize: '12px', color: theme.textDim, fontWeight: 'bold' }}>{militaryRank}</p>
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

    const renderWealthBoard = () => (
        <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', border: `1px solid ${theme.border}`, marginBottom: '25px' }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <button
                    onClick={() => setBoardType('weekly')}
                    style={{ 
                        flex: 1, padding: '12px', borderRadius: '10px', 
                        border: `2px solid ${boardType === 'weekly' ? theme.gold : theme.border}`, 
                        backgroundColor: boardType === 'weekly' ? 'rgba(244, 208, 63, 0.15)' : '#1C1C1E', 
                        color: boardType === 'weekly' ? theme.gold : theme.textDim, 
                        fontWeight: '900', fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s',
                        boxShadow: boardType === 'weekly' ? `0 0 15px rgba(244, 208, 63, 0.3)` : 'none'
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
                        fontWeight: '900', fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s',
                        boxShadow: boardType === 'all' ? `0 0 15px rgba(244, 208, 63, 0.3)` : 'none'
                    }}
                >
                    🌟 TOP TỔNG
                </button>
            </div>
            
            <div style={{ backgroundColor: 'rgba(244, 208, 63, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: `1px dashed ${theme.gold}` }}>
                <p style={{fontSize: '13px', color: theme.gold, margin: 0, lineHeight: '1.5', textAlign: 'justify'}}>
                    <span style={{fontWeight: 'bold'}}>📌 LƯU Ý QUAN TRỌNG:</span><br/> 
                    {boardType === 'weekly' 
                        ? 'Số liệu Tuần được tự động Reset vào 23:59 Chủ Nhật hàng tuần. Đua top ngay hôm nay để nhận thưởng hiện vật cực khủng!'
                        : 'Bảng này tính TỔNG TÀI SẢN (Số dư hiện tại + Tiền đã rút + Quà Nhiệm vụ). Đây là thước đo chính xác đẳng cấp của bạn!'}
                </p>
            </div>

            {wealthBoard.slice(0, 10).map((user, index) => {
                let icon = "💸"; let topColor = theme.textDim; let topBg = "transparent"; let topBorder = "transparent";
                if (index === 0) { icon = "👑"; topColor = theme.gold; topBg = 'rgba(244, 208, 63, 0.1)'; topBorder = theme.gold; }
                else if (index === 1) { icon = "💎"; topColor = '#C0C0C0'; topBg = 'rgba(192, 192, 192, 0.1)'; topBorder = '#C0C0C0'; }
                else if (index === 2) { icon = "🌟"; topColor = '#CD7F32'; topBg = 'rgba(205, 127, 50, 0.1)'; topBorder = '#CD7F32'; }
                else { topBorder = theme.border; }
                const isMe = user.firstName === userProfile.name.split(' ')[0];
                const rankTitle = getMilitaryRank(user.referralCount);

                return (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 10px', borderBottom: index < wealthBoard.length - 1 ? `1px solid ${theme.border}` : 'none', backgroundColor: isMe ? 'rgba(244, 208, 63, 0.05)' : 'transparent', borderRadius: '8px', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '45px', marginRight: '12px', backgroundColor: topBg, border: `1px solid ${topBorder}`, borderRadius: '6px', padding: '4px' }}>
                                <span style={{ fontSize: '10px', fontWeight: 'bold', color: topColor }}>TOP {index + 1}</span>
                                <span style={{ fontSize: '18px', marginTop: '2px' }}>{icon}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: isMe ? theme.gold : theme.textLight, fontWeight: 'bold', fontSize: '15px' }}>
                                    {user.firstName} {user.lastName} {isMe && <span style={{fontSize: '11px', color: theme.gold, fontWeight: 'normal'}}> (Bạn)</span>}
                                </span>
                                <span style={{ color: theme.textDim, fontSize: '12px', marginTop: '2px' }}>{rankTitle}</span>
                            </div>
                        </div>
                        <div style={{ color: theme.green, fontWeight: 'bold', fontSize: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span>{boardType === 'all' ? user.totalEarned : user.displayCount * 15} <span style={{ fontSize: '12px', color: theme.textDim, fontWeight: 'normal' }}>SWGT</span></span>
                            {boardType === 'weekly' && <span style={{fontSize: '11px', color: theme.gold}}>({user.displayCount} người)</span>}
                        </div>
                    </div>
                )
            })}
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
                    <h3 style={{ margin: 0, color: isPremiumUser ? theme.premium : theme.gold, fontSize: '18px', fontWeight: 'bold' }}>
                        {isPremiumUser ? 'Premium⭐' : 'Thường'}
                    </h3>
                    <p style={{ margin: '5px 0 0 0', color: theme.textDim, fontSize: '13px' }}>Loại TK</p>
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
                                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: textColor }}>Ngày {day}</p>
                                <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: textColor }}>
                                    {isClaimed ? 'Đã nhận' : `+${STREAK_REWARDS[idx]}`}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <button 
                    onClick={(e) => handleCheckIn(e)} 
                    disabled={isCheckedInToday}
                    style={{ width: '100%', backgroundColor: isCheckedInToday ? '#333' : theme.green, color: isCheckedInToday ? theme.textDim : '#fff', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: isCheckedInToday ? 'not-allowed' : 'pointer', fontSize: '15px', transition: 'all 0.3s' }}
                >
                    {isCheckedInToday ? "✅ ĐÃ NHẬN HÔM NAY" : "✋ BẤM ĐIỂM DANH NGAY"}
                </button>
                <p style={{ margin: '10px 0 0 0', color: theme.red, fontSize: '12px', fontStyle: 'italic' }}>
                    ⚠️ Nhớ vào mỗi ngày! Nếu quên 1 ngày, chuỗi sẽ quay lại từ đầu.
                </p>
            </div>

            <div style={{ backgroundColor: 'rgba(244, 208, 63, 0.1)', border: `1px dashed ${theme.gold}`, padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                <p style={{ margin: 0, color: theme.gold, fontSize: '14px', lineHeight: '1.6', textAlign: 'center' }}>
                    <span style={{fontWeight:'bold'}}>⚡ ĐẶC QUYỀN MỞ KHÓA TỐC ĐỘ:</span><br/>Cày đạt mốc <b>1500 SWGT</b> sẽ được <b style={{color: '#fff'}}>RÚT TIỀN VỀ VÍ NGAY LẬP TỨC</b>, bỏ qua hoàn toàn thời gian đếm ngược!
                </p>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.textLight, margin: '0 0 15px 0', fontSize: '18px' }}>🎯 Cách Hoạt Động</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '14px', lineHeight: '1.6' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>📱 Bước 1: Tham gia Bot SWC</span><br/>Liên kết với <a href="https://t.me/Dau_Tu_SWC_bot" target="_blank" rel="noreferrer" style={{color: theme.blue, textDecoration: 'none'}}>@Dau_Tu_SWC_bot</a> trên Telegram để bắt đầu.</p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '14px', lineHeight: '1.6' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>👥 Bước 2: Mời bạn bè</span><br/>Chia sẻ link giới thiệu và mời bạn bè tham gia cộng đồng SWC.</p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '14px', lineHeight: '1.6' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>💰 Bước 3: Nhận SWGT</span><br/>Mỗi người bạn mời sẽ giúp bạn kiếm SWGT thưởng.</p>
                    <div style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)', border: `1px dashed ${theme.green}`, padding: '15px', borderRadius: '10px' }}>
                        <p style={{ margin: 0, color: theme.green, fontSize: '14px', lineHeight: '1.6' }}>
                            <span style={{fontWeight:'bold'}}>💬 MẸO: Tương tác kiếm thêm điểm</span><br/>Mỗi tin nhắn bạn chat trong Nhóm Thảo Luận (từ 10 ký tự trở lên) tự động cộng <b style={{color: theme.gold}}>+0.1 SWGT</b>. Chat càng nhiều, tiền càng nhiều!
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.gold, margin: '0 0 15px 0', fontSize: '18px' }}>💎 Cơ Cấu Phần Thưởng SWGT</h2>
                <p style={{ color: theme.textLight, fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>📌 Thành viên Thường:</p>
                <div style={{ color: theme.textDim, fontSize: '14px', margin: '0 0 15px 0', lineHeight: '1.6' }}>
                    <p style={{ margin: 0 }}>Tham gia Channel: <span style={{color: '#34C759'}}>+10 SWGT/người</span></p>
                    <p style={{ margin: 0 }}>Tham gia Nhóm Chat: <span style={{color: '#34C759'}}>+10 SWGT/người</span></p>
                </div>
                <p style={{ color: theme.premium, fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>⭐ Thành Viên Premium (+50%):</p>
                <div style={{ color: theme.textDim, fontSize: '14px', margin: '0 0 10px 0', lineHeight: '1.6' }}>
                    <p style={{ margin: 0 }}>Tham gia Channel: <span style={{color: '#34C759'}}>+15 SWGT/người</span></p>
                    <p style={{ margin: 0 }}>Tham gia Nhóm Chat: <span style={{color: '#34C759'}}>+15 SWGT/người</span></p>
                </div>
                
                <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '12px', marginTop: '20px', borderRadius: '6px' }}>
                    <h4 style={{ color: '#991b1b', fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '14px' }}>
                        ⚠️ CHÍNH SÁCH CHỐNG GIAN LẬN (RADAR 24/7)
                    </h4>
                    <p style={{ color: '#b91c1c', margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                        1. Tài khoản ảo/mới tạo sẽ bị giam tiền <b>60 ngày</b>.<br/>
                        2. Bắt buộc duy trì trong Group tối thiểu <b>21 ngày</b>. Rời nhóm = <b>THU HỒI TOÀN BỘ!</b>
                    </p>
                </div>
            </div>

            {renderWealthBoard()}

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.gold, margin: '0 0 15px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚖️</span> Chính Sách Thanh Khoản
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>🎯</span>
                        <div>
                            <p style={{ margin: 0, color: theme.textLight, fontSize: '14px', fontWeight: 'bold' }}>Mức tối thiểu</p>
                            <p style={{ margin: '2px 0 0 0', color: theme.textDim, fontSize: '13px' }}>Chỉ từ <b style={{color: theme.green}}>500 SWGT</b> / Tài khoản.</p>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>⏳</span>
                        <div>
                            <p style={{ margin: 0, color: theme.textLight, fontSize: '14px', fontWeight: 'bold' }}>Thời gian mở khóa cơ bản</p>
                            <p style={{ margin: '2px 0 0 0', color: theme.textDim, fontSize: '13px', lineHeight: '1.5' }}>Sau <b style={{color: theme.premium}}>7 ngày</b> (Premium) hoặc <b style={{color: theme.textLight}}>15 ngày</b> (Thường) tính từ ngày tham gia.</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: 'rgba(244, 208, 63, 0.1)', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.gold}` }}>
                        <span style={{ fontSize: '18px' }}>⚡</span>
                        <div>
                            <p style={{ margin: 0, color: theme.gold, fontSize: '14px', fontWeight: 'bold' }}>Đặc quyền vượt rào (Fast-track)</p>
                            <p style={{ margin: '2px 0 0 0', color: theme.textLight, fontSize: '13px', lineHeight: '1.5' }}>Cán mốc <b style={{color: theme.gold}}>1500 SWGT</b> ➔ <b style={{color: theme.green}}>ĐƯỢC RÚT NGAY LẬP TỨC</b>, bỏ qua mọi thời gian chờ đợi!</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>💸</span>
                        <div>
                            <p style={{ margin: 0, color: theme.textLight, fontSize: '14px', fontWeight: 'bold' }}>Quyền tự quyết</p>
                            <p style={{ margin: '2px 0 0 0', color: theme.textDim, fontSize: '13px' }}>Rút tiền linh hoạt 24/7 bất cứ lúc nào khi đủ điều kiện.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* KHỐI NHIỆM VỤ MỚI: CHỈ HIỂN THỊ NÚT NHẬN QUÀ HOẶC ĐÃ XONG */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.textLight, margin: '0 0 5px 0', fontSize: '18px' }}>🧠 Nạp Kiến Thức & Lan Tỏa</h2>
                <p style={{ color: theme.gold, fontSize: '12px', marginBottom: '15px', fontStyle: 'italic' }}>⚠️ Lưu ý: Bạn cần bấm vào Link nhiệm vụ do Bot gửi trong tin nhắn trước khi bấm Nhận Quà tại đây.</p>
                
                <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '10px', marginBottom: '10px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                            <h4 style={{ margin: 0, color: theme.textLight, fontSize: '15px' }}>📖 Đọc bài phân tích</h4>
                            <p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}>Đợi 60 giây (+10 SWGT)</p>
                        </div>
                        {tasks.readTaskDone && <span style={{ color: theme.green, fontWeight: 'bold' }}>✅ Xong</span>}
                    </div>
                    {!tasks.readTaskDone && (
                        <button onClick={(e) => claimTaskApp('read', e)} style={{ width: '100%', backgroundColor: theme.gold, color: '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                            🎁 NHẬN QUÀ ĐỌC BÀI
                        </button>
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
                        <button onClick={(e) => claimTaskApp('youtube', e)} style={{ width: '100%', backgroundColor: theme.gold, color: '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                            🎁 NHẬN QUÀ YOUTUBE
                        </button>
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
                        <button onClick={(e) => claimTaskApp('facebook', e)} style={{ width: '100%', backgroundColor: theme.gold, color: '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                            🎁 NHẬN QUÀ FANPAGE
                        </button>
                    )}
                </div>

                <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                            <h4 style={{ margin: 0, color: theme.textLight, fontSize: '15px' }}>📢 Chia sẻ dự án</h4>
                            <p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}>Chuyển tiếp cho bạn bè (+15 SWGT)</p>
                        </div>
                        {tasks.shareTaskDone && <span style={{ color: theme.green, fontWeight: 'bold' }}>✅ Xong</span>}
                    </div>
                    {!tasks.shareTaskDone && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={(e) => claimTaskApp('share', e)} style={{ width: '100%', backgroundColor: theme.gold, color: '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                                🎁 NHẬN QUÀ CHIA SẺ
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px dashed ${theme.blue}` }}>
                <h2 style={{ color: theme.blue, margin: '0 0 15px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🚀</span> Sắp Ra Mắt (Coming Soon)
                </h2>
                <ul style={{ margin: 0, paddingLeft: '20px', color: theme.textDim, fontSize: '14px', lineHeight: '1.8' }}>
                    <li><b>Vòng Quay Nhân Phẩm:</b> Dùng SWGT để quay thưởng Token/USDT hằng ngày.</li>
                    <li><b>Staking SWGT:</b> Gửi tiết kiệm SWGT nhận lãi suất qua đêm.</li>
                    <li><b>Đua Top Tháng:</b> Giải thưởng hiện vật cực khủng cho Top 3 người dẫn đầu bảng vàng.</li>
                </ul>
            </div>
        </div>
    );

    const renderRewards = () => {
        let nextTarget = 3; let nextReward = "+10 SWGT";
        for (let m of MILESTONE_LIST) {
            if (referrals < m.req) { nextTarget = m.req; nextReward = `+${m.reward} SWGT`; break; }
        }
        let progressPercent = Math.min((referrals / nextTarget) * 100, 100);
        if (referrals >= 500) progressPercent = 100;

        return (
            <div style={{ padding: '0 20px 20px 20px', paddingBottom: '100px' }}>
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <div style={{ fontSize: '45px', marginBottom: '5px' }}>🎁</div>
                    <h2 style={{ color: theme.gold, margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900' }}>Trung Tâm Thu Nhập</h2>
                    <p style={{ color: theme.textDim, fontSize: '14px', margin: 0 }}>Xây dựng hệ thống - Tạo thu nhập thụ động</p>
                </div>

                <div style={{ backgroundColor: 'rgba(244, 208, 63, 0.1)', border: `1px dashed ${theme.gold}`, padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                    <p style={{ margin: 0, color: theme.gold, fontSize: '14px', lineHeight: '1.6', textAlign: 'center' }}>
                        <span style={{fontWeight:'bold'}}>⚡ ĐẶC QUYỀN VIP:</span> Cày đạt mốc <b>1500 SWGT</b> sẽ được <b style={{color: '#fff'}}>MỞ KHÓA RÚT TIỀN NGAY LẬP TỨC</b>, không cần chờ đợi thời gian đếm ngược!
                    </p>
                </div>

                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: '0 0 15px 0', color: theme.textLight, fontSize: '16px' }}>🎟️ Nhập Mã Quà Tặng (Giftcode)</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            value={giftCodeInput} 
                            onChange={(e) => setGiftCodeInput(e.target.value)} 
                            placeholder="Nhập mã săn được từ Group..." 
                            style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `1px solid ${theme.green}`, backgroundColor: '#000', color: theme.gold, boxSizing: 'border-box', fontSize: '14px', textTransform: 'uppercase' }} 
                        />
                        <button onClick={handleClaimGiftCode} style={{ backgroundColor: theme.green, color: '#fff', padding: '0 20px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '14px', cursor: 'pointer' }}>
                            NHẬN
                        </button>
                    </div>
                </div>

                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: '0 0 15px 0', color: theme.textLight, fontSize: '16px' }}>🔗 Công cụ lan tỏa</h3>
                    <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '8px', color: theme.gold, fontSize: '15px', wordBreak: 'break-all', marginBottom: '15px', border: `1px dashed ${theme.border}` }}>
                        https://t.me/Dau_Tu_SWC_bot?start={userId || 'ref'}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleCopyLink} style={{ flex: 1, backgroundColor: theme.gold, color: '#000', padding: '14px 0', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '14px', cursor: 'pointer', textAlign: 'center' }}>
                            📋 COPY LINK
                        </button>
                        <a href={`https://t.me/share/url?url=https://t.me/Dau_Tu_SWC_bot?start=${userId}&text=Vào%20nhận%20ngay%20SWGT%20miễn%20phí%20từ%20hệ%20sinh%20thái%20công%20nghệ%20uST%20này%20anh%20em!`} target="_blank" rel="noreferrer" style={{ flex: 1, backgroundColor: '#5E92F3', color: '#fff', padding: '14px 0', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '14px', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            ✈️ GỬI BẠN BÈ
                        </a>
                    </div>
                </div>

                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde047', padding: '12px', marginBottom: '20px', borderRadius: '6px' }}>
                    <h4 style={{ color: '#b45309', fontWeight: 'bold', margin: '0 0 5px 0', fontSize: '13px' }}>
                        ⏳ SỰ KIỆN HALVING ĐÃ KÍCH HOẠT!
                    </h4>
                    <p style={{ color: '#854d0e', margin: 0, fontSize: '12px', lineHeight: '1.5' }}>
                        Khi Cộng đồng cán mốc <b>1.000 người</b>, phần thưởng tại các mốc: <b>Mốc 10, 50, 120, 200, 350 và 500</b> đã chính thức <b>BỊ GIẢM</b> để bảo chứng độ khan hiếm cho SWGT.
                    </p>
                </div>

                <h3 style={{color: '#fff', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '15px', fontSize: '16px'}}>🚀 9 CỘT MỐC THƯỞNG NÓNG</h3>
                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                        <div>
                            <p style={{ margin: 0, color: theme.textDim, fontSize: '14px' }}>Đã giới thiệu</p>
                            <h2 style={{ margin: 0, color: theme.textLight, fontSize: '28px' }}>{referrals} <span style={{fontSize:'14px', color: theme.textDim, fontWeight:'normal'}}>người</span></h2>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, color: theme.gold, fontSize: '13px', fontWeight: 'bold' }}>Mục tiêu tiếp: {nextTarget} người</p>
                            <p style={{ margin: 0, color: theme.green, fontSize: '14px', fontWeight: 'bold' }}>🎁 Thưởng {nextReward}</p>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '12px', backgroundColor: '#333', borderRadius: '6px', overflow: 'hidden', marginBottom: '15px' }}>
                        <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: theme.gold, transition: 'width 0.5s ease' }}></div>
                    </div>

                    <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px' }}>
                        {MILESTONE_LIST.map((m) => {
                            const isClaimed = milestones[m.key];
                            const canClaim = referrals >= m.req && !isClaimed;
                            let icon = '🔒';
                            if (isClaimed) icon = '✅';
                            else if (canClaim) icon = '🎁';
                            
                            return (
                                <div key={m.req} style={{ minWidth: '110px', backgroundColor: '#000', borderRadius: '10px', padding: '15px 10px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
                                    <p style={{ color: theme.textLight, fontSize: '13px', fontWeight: 'bold', margin: '0 0 2px 0' }}>Mốc {m.req}</p>
                                    <p style={{ color: theme.blue, fontSize: '11px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{m.rank}</p>
                                    <p style={{ color: theme.gold, fontSize: '13px', fontWeight: '900', margin: '0 0 10px 0' }}>+{m.reward}</p>
                                    <button 
                                        onClick={(e) => handleClaimMilestone(m.req, m.reward, e)} 
                                        disabled={!canClaim}
                                        style={{ width: '100%', backgroundColor: isClaimed ? '#333' : (canClaim ? theme.green : '#333'), color: isClaimed ? theme.textDim : (canClaim ? '#fff' : theme.textDim), border: 'none', padding: '8px 0', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: canClaim ? 'pointer' : 'not-allowed' }}>
                                        {isClaimed ? 'ĐÃ NHẬN' : 'NHẬN'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <h3 style={{color: theme.gold, borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '15px', fontSize: '18px', textAlign: 'center', fontWeight: '900'}}>🤝 BẢNG VÀNG GIỚI THIỆU</h3>
                {renderWealthBoard()}

                <div style={{ textAlign: 'center', paddingTop: '5px', marginBottom: '25px' }}>
                    <a href={`https://t.me/share/url?url=https://t.me/Dau_Tu_SWC_bot?start=${userId}&text=Vào%20nhận%20ngay%20SWGT%20miễn%20phí%20từ%20hệ%20sinh%20thái%20công%20nghệ%20uST%20này%20anh%20em!`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: theme.blue, color: '#fff', padding: '14px 0', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '14px', textDecoration: 'none', boxSizing: 'border-box' }}>
                        ✈️ CHIA SẺ LINK ĐỂ ĐUA TOP NGAY
                    </a>
                </div>

                <h3 style={{color: '#fff', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '15px', fontSize: '16px'}}>💎 KHO ĐẶC QUYỀN VIP</h3>
                <p style={{ color: theme.textDim, fontSize: '14px', marginBottom: '15px' }}>Hãy để lại số lượng Token</p>
                
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
                    <h4 style={{margin: '0 0 8px 0', color: theme.gold, fontSize: '16px'}}>🎟️ Phiếu Đầu Tư Ưu Đãi Đặc Biệt : 9000</h4>
                    <p style={{fontSize: '14px', color: theme.textDim, margin: '0 0 15px 0', lineHeight: '1.5'}}>Nhận Voucher chiết khấu đặc biệt khi vào gói đầu tư lớn.</p>
                    <button onClick={() => redeemItem('Phiếu Đầu Tư', 9000)} style={{backgroundColor: theme.gold, color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer'}}>LIÊN HỆ ADMIN</button>
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

                <button onClick={handleWithdraw} style={{ width: '100%', backgroundColor: balance >= 500 ? theme.green : '#333', color: balance >= 500 ? '#fff' : theme.textDim, padding: '16px', borderRadius: '12px', fontWeight: 'bold', border: 'none', fontSize: '16px', cursor: balance >= 500 ? 'pointer' : 'not-allowed', boxShadow: balance >= 500 ? '0 4px 15px rgba(52, 199, 89, 0.3)' : 'none' }}>
                    {balance >= 500 ? '💸 XÁC NHẬN RÚT TIỀN' : '🔒 CẦN TỐI THIỂU 500 SWGT'}
                </button>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <h3 style={{ margin: '0 0 15px 0', color: theme.textLight, fontSize: '16px' }}>⏳ Đếm ngược mở khóa ({lockDaysLimit} Ngày)</h3>
                
                {isUnlocked ? (
                    <div style={{ padding: '15px', backgroundColor: 'rgba(52, 199, 89, 0.1)', border: `1px dashed ${theme.green}`, borderRadius: '10px', color: theme.green, fontWeight: 'bold', fontSize: '16px', textAlign: 'center' }}>
                        {balance >= 1500 ? "🎉 ĐẶC QUYỀN 1500 SWGT: CỔNG RÚT ĐÃ MỞ!" : "🎉 CỔNG RÚT SWGT ĐÃ MỞ!"}
                    </div>
                ) : (
                    <div style={{ backgroundColor: '#000', padding: '20px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                        <p style={{ color: theme.textDim, fontSize: '14px', margin: '0 0 15px 0' }}>Thời gian còn lại để mở khóa rút tiền:</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
                            <span style={{ color: theme.textLight, fontSize: '18px', fontWeight: 'bold' }}>Còn</span>
                            <div style={{ padding: '5px 10px', backgroundColor: '#222', borderRadius: '6px', color: theme.gold, fontSize: '18px', fontWeight: 'bold' }}>{timeLeft.days} <span style={{fontSize:'12px', color: theme.textDim, fontWeight:'normal'}}>Ngày</span></div>
                            <div style={{ padding: '5px 10px', backgroundColor: '#222', borderRadius: '6px', color: theme.gold, fontSize: '18px', fontWeight: 'bold' }}>{timeLeft.hours} <span style={{fontSize:'12px', color: theme.textDim, fontWeight:'normal'}}>Giờ</span></div>
                            <div style={{ padding: '5px 10px', backgroundColor: '#222', borderRadius: '6px', color: theme.gold, fontSize: '18px', fontWeight: 'bold' }}>{timeLeft.mins} <span style={{fontSize:'12px', color: theme.textDim, fontWeight:'normal'}}>Phút</span></div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                <h3 style={{ margin: '0 0 15px 0', color: theme.textLight, fontSize: '16px' }}>⚙️ Thiết lập thanh toán</h3>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button onClick={() => setWithdrawMethod('gate')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${withdrawMethod === 'gate' ? theme.green : theme.border}`, backgroundColor: withdrawMethod === 'gate' ? 'rgba(52, 199, 89, 0.1)' : '#000', color: withdrawMethod === 'gate' ? theme.green : theme.textDim, fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', transition: 'all 0.3s' }}>
                        Gate.io (Miễn phí)
                    </button>
                    <button onClick={() => setWithdrawMethod('erc20')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${withdrawMethod === 'erc20' ? theme.red : theme.border}`, backgroundColor: withdrawMethod === 'erc20' ? 'rgba(255, 59, 48, 0.1)' : '#000', color: withdrawMethod === 'erc20' ? theme.red : theme.textDim, fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', transition: 'all 0.3s' }}>
                        Ví ERC20 (-70 SWGT)
                    </button>
                </div>

                {withdrawMethod === 'gate' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginBottom: '15px' }}>
                            <p style={{ margin: '0 0 10px 0', color: theme.gold, fontSize: '14px', fontWeight: 'bold' }}>⭐ ƯU TIÊN VÌ KHÔNG MẤT PHÍ</p>
                            <ol style={{ color: theme.textDim, fontSize: '13px', margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
                                <li>Yêu cầu thành viên vào tài khoản Gate.io</li>
                                <li>Chọn nạp tiền SWGT</li>
                                <li>Chọn nạp Gatecode (Chỉ dành cho tài khoản Gate)</li>
                            </ol>
                            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                                <img src="/gate-guide.jpg" alt="Hướng dẫn Gatecode" style={{ width: '100%', borderRadius: '8px', border: `1px solid ${theme.border}`, display: 'block' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                <button onClick={() => window.open('https://telegra.ph/H%C6%B0%E1%BB%9Bng-d%E1%BA%ABn-%C4%91%C4%83ng-k%C3%BD--t%E1%BA%A1o-m%E1%BB%9Bi-t%C3%A0i-kho%E1%BA%A3n-Gateio-to%C3%A0n-t%E1%BA%ADp-02-22', '_blank')} style={{ width: '100%', backgroundColor: theme.blue, color: '#fff', padding: '12px', borderRadius: '8px', fontWeight: 'bold', border: 'none', fontSize: '13px', cursor: 'pointer', marginTop: '15px' }}>
                                    📖 HƯỚNG DẪN TẠO VÍ GATE.IO
                                </button>
                            </div>
                        </div>

                        <p style={{ color: theme.textLight, fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Bổ sung thông tin (Tùy chọn):</p>
                        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="1. Họ tên" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: '#000', color: theme.textLight, boxSizing: 'border-box', marginBottom: '10px', fontSize: '14px' }} />
                        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="2. Gmail" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: '#000', color: theme.textLight, boxSizing: 'border-box', marginBottom: '10px', fontSize: '14px' }} />
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="3. Số điện thoại" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: '#000', color: theme.textLight, boxSizing: 'border-box', marginBottom: '15px', fontSize: '14px' }} />

                        <p style={{ color: theme.textLight, fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Mã nhận tiền (Bắt buộc):</p>
                        <input value={gatecode} onChange={(e) => setGatecode(e.target.value)} placeholder="Dán Gatecode / UID Gate.io tại đây..." style={{ width: '100%', padding: '14px', borderRadius: '8px', border: `1px solid ${theme.green}`, backgroundColor: '#000', color: theme.gold, boxSizing: 'border-box', marginBottom: '15px', fontSize: '14px' }} />
                    </div>
                )}

                {withdrawMethod === 'erc20' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ backgroundColor: 'rgba(255, 59, 48, 0.1)', border: `1px dashed ${theme.red}`, padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                            <p style={{ margin: '0 0 5px 0', color: theme.red, fontSize: '14px', fontWeight: 'bold' }}>⚠️ CHÚ Ý QUAN TRỌNG:</p>
                            <p style={{ margin: 0, color: theme.red, fontSize: '13px', lineHeight: '1.5' }}>Phí rút tiền qua mạng lưới <b>Ethereum (ERC20)</b> là <b>70 SWGT</b>. Nhập sai mạng lưới sẽ mất tài sản vĩnh viễn!</p>
                        </div>
                        <p style={{ color: theme.textLight, fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Địa chỉ ví (Bắt buộc):</p>
                        <input value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="Dán địa chỉ ví ERC20 tại đây..." style={{ width: '100%', padding: '14px', borderRadius: '8px', border: `1px solid ${theme.red}`, backgroundColor: '#000', color: theme.gold, boxSizing: 'border-box', marginBottom: '15px', fontSize: '14px' }} />
                    </div>
                )}

                <button onClick={handleSaveWallet} style={{ width: '100%', backgroundColor: theme.gold, color: '#000', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '15px', cursor: 'pointer' }}>
                    {(withdrawMethod === 'erc20' && wallet) || (withdrawMethod === 'gate' && gatecode) ? "CẬP NHẬT THÔNG TIN THANH TOÁN" : "LƯU THÔNG TIN THANH TOÁN"}
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '90px', boxSizing: 'border-box' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                
                /* Hiệu ứng thanh cuộn */
                ::-webkit-scrollbar { height: 6px; }
                ::-webkit-scrollbar-track { background: #1C1C1E; border-radius: 10px; }
                ::-webkit-scrollbar-thumb { background: #F4D03F; border-radius: 10px; }
                
                /* Hiệu ứng viền Avatar xoay và nhấp nháy */
                @keyframes spin { 
                    100% { transform: rotate(360deg); } 
                }
                @keyframes pulseGlowRed {
                    0%, 100% { box-shadow: 0 0 5px #FF3B30, inset 0 0 5px #FF3B30; }
                    50% { box-shadow: 0 0 15px #FF3B30, inset 0 0 10px #FF3B30; }
                }
                @keyframes pulseGlowCyan {
                    0%, 100% { box-shadow: 0 0 5px #00FFFF, inset 0 0 5px #00FFFF; }
                    50% { box-shadow: 0 0 15px #00FFFF, inset 0 0 10px #00FFFF; }
                }

                /* Hiệu ứng Navigation Bottom Tab động */
                .nav-item {
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    cursor: pointer;
                    width: 33%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    opacity: 0.6;
                }
                .nav-item.active {
                    opacity: 1;
                    transform: translateY(-4px); /* Nhích nhẹ lên khi Active */
                }
                .nav-item:active {
                    transform: scale(0.92); /* Thu nhỏ khi bấm */
                }
                .nav-icon {
                    font-size: 26px;
                    margin-bottom: 6px;
                    transition: all 0.3s ease;
                }
                .nav-item.active .nav-icon {
                    animation: bounceTab 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-shadow: 0 0 15px rgba(244, 208, 63, 0.9); /* Phát sáng mờ cho icon */
                }
                @keyframes bounceTab {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.25); }
                    100% { transform: scale(1); }
                }

                /* Hiệu ứng số tiền thưởng bay lên */
                @keyframes floatUp {
                    0% { opacity: 1; transform: translate(-50%, 0) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -80px) scale(1.5); }
                }
                .floating-reward {
                    position: fixed;
                    color: #F4D03F;
                    font-weight: 900;
                    font-size: 24px;
                    pointer-events: none;
                    z-index: 9999;
                    animation: floatUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                    text-shadow: 0px 0px 8px rgba(244, 208, 63, 0.8), 0px 2px 4px rgba(0,0,0,1);
                }
            `}</style>
            
            {/* RENDER HIỆU ỨNG TIỀN BAY LÊN */}
            {animations.map(anim => (
                <div key={anim.id} className="floating-reward" style={{ left: anim.x, top: anim.y }}>
                    {anim.text}
                </div>
            ))}

            {renderHeader()}
            <div style={{ marginTop: '10px' }}>
                {activeTab === 'home' && renderHome()}
                {activeTab === 'rewards' && renderRewards()}
                {activeTab === 'wallet' && renderWallet()}
            </div>

            {/* THANH ĐIỀU HƯỚNG TÍCH HỢP CLASS ĐỘNG MỚI */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: theme.cardBg, borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-around', padding: '15px 0', paddingBottom: 'calc(15px + env(safe-area-inset-bottom))', zIndex: 100 }}>
                
                <div onClick={() => setActiveTab('home')} className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} style={{ color: activeTab === 'home' ? theme.gold : theme.textDim }}>
                    <div className="nav-icon">🏠</div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Trang chủ</span>
                </div>
                
                <div onClick={() => setActiveTab('rewards')} className={`nav-item ${activeTab === 'rewards' ? 'active' : ''}`} style={{ color: activeTab === 'rewards' ? theme.gold : theme.textDim }}>
                    <div className="nav-icon">🎁</div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Phần thưởng</span>
                </div>
                
                <div onClick={() => setActiveTab('wallet')} className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`} style={{ color: activeTab === 'wallet' ? theme.gold : theme.textDim }}>
                    <div className="nav-icon">👛</div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Ví</span>
                </div>

            </div>
        </div>
    );
}

export default App;
