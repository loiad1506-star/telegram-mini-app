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
    
    const [taskStarted, setTaskStarted] = useState({
        read: false, youtube: false, facebook: false, share: false
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

    const [isPremiumUser, setIsPremiumUser] = useState(false);
    const [unlockDateMs, setUnlockDateMs] = useState(0);
    const [lockDaysLimit, setLockDaysLimit] = useState(15);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });
    const [isUnlocked, setIsUnlocked] = useState(false);

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
        { req: 3, reward: 10, key: 'milestone3' },
        { req: 10, reward: 25, key: 'milestone10' },
        { req: 20, reward: 40, key: 'milestone20' },
        { req: 50, reward: 100, key: 'milestone50' },
        { req: 80, reward: 150, key: 'milestone80' },
        { req: 120, reward: 250, key: 'milestone120' },
        { req: 200, reward: 425, key: 'milestone200' },
        { req: 350, reward: 800, key: 'milestone350' },
        { req: 500, reward: 1200, key: 'milestone500' }
    ];

    const STREAK_REWARDS = [0.5, 1.5, 3, 3.5, 5, 7, 9];

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

                const todayStr = new Date().toDateString();
                const lastDaily = data.lastDailyTask ? new Date(data.lastDailyTask).toDateString() : '';
                const lastShare = data.lastShareTask ? new Date(data.lastShareTask).toDateString() : '';
                
                setTasks({
                    readTaskDone: lastDaily === todayStr, 
                    shareTaskDone: lastShare === todayStr,
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

    // ==================================================
    // TẠO DỮ LIỆU BẢNG XẾP HẠNG & ĐẠI GIA ĐỂ DÙNG CHUNG
    // ==================================================
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

    let wealthBoard = displayBoard.slice(0, 10).map((user, index) => {
        let estimatedTotal = (user.referralCount * 25) + 300 + (10 - index) * 50; 
        if (user.referralCount === referrals && user.firstName === userProfile.name.split(' ')[0]) {
            // Cộng cả số dư + điểm danh + nhiệm vụ ước tính để ra Tổng
            estimatedTotal = balance + (referrals * 25) + (checkInStreak * 5) + 50; 
        }
        return { ...user, totalEarned: Math.round(estimatedTotal * 10) / 10 };
    });
    wealthBoard.sort((a, b) => b.totalEarned - a.totalEarned);

    // ==================================================
    // CƠ CHẾ RANK AVATAR ĐỘNG DỰA TRÊN LEADERBOARD
    // ==================================================
    let myRank = 0;
    if (referrals > 0) {
        // Tính hạng thực tế: Số người có lượt mời lớn hơn mình + 1
        const strictlyBetter = displayBoard.filter(u => u.referralCount > referrals).length;
        myRank = strictlyBetter + 1;
    }

    let vipLevel = "Tân Binh 🥉";
    let wreathColor = "#8E8E93"; // Xám nhạt
    let glow = "none";

    // CHUẨN HÓA DANH HIỆU THEO RANK & LƯỢT MỜI
    if (myRank === 1 && referrals >= 5) { 
        vipLevel = "🏆 TOP 1 SERVER"; wreathColor = "#F4D03F"; glow = `0 0 15px #F4D03F`; 
    }
    else if (myRank === 2 && referrals >= 5) { 
        vipLevel = "🔥 TOP 2 SERVER"; wreathColor = "#C0C0C0"; glow = `0 0 12px #C0C0C0`; 
    }
    else if (myRank === 3 && referrals >= 5) { 
        vipLevel = "🔥 TOP 3 SERVER"; wreathColor = "#CD7F32"; glow = `0 0 12px #CD7F32`; 
    }
    else if (myRank > 0 && myRank <= 10 && referrals >= 5) { 
        vipLevel = `🌟 TOP ${myRank} SERVER`; wreathColor = theme.blue; glow = `0 0 10px ${theme.blue}`; 
    }
    // NẾU KHÔNG LỌT TOP 10, PHÂN BẬC THEO MỐC CỐ ĐỊNH
    else if (referrals >= 100) { 
        vipLevel = "Huyền Thoại 👑"; wreathColor = "#E0B0FF"; glow = `0 0 15px #E0B0FF`; 
    }
    else if (referrals >= 50) { 
        vipLevel = "Đối Tác VIP 💎"; wreathColor = theme.gold; glow = `0 0 12px ${theme.gold}`; 
    }
    else if (referrals >= 10) { 
        vipLevel = "Đại Sứ 🥇"; wreathColor = "#C0C0C0"; glow = `0 0 10px #C0C0C0`; 
    }
    else if (referrals >= 3) { 
        vipLevel = "Sứ Giả 🥈"; wreathColor = "#CD7F32"; glow = `0 0 8px #CD7F32`; 
    }

    // ==================================================
    // CÁC HÀM XỬ LÝ API
    // ==================================================
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
                setCheckInStreak(data.streak);
                alert(`🔥 Điểm danh thành công (Chuỗi ${data.streak} ngày)!\nBạn nhận được +${data.reward} SWGT.`);
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
            } else {
                alert(data.message);
            }
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
        if (!amount || amount < 300) return alert("⚠️ Bạn cần rút tối thiểu 300 SWGT!");
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

    const handleClaimMilestone = (milestoneReq: number) => {
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
                alert(`🎉 Chúc mừng! Bạn đã nhận thành công thưởng mốc ${milestoneReq} người!`);
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

    const startTask = (taskType: string, url: string, duration: number) => {
        window.open(url, '_blank'); 
        setTaskStarted(prev => ({ ...prev, [taskType]: true }));
        setTaskTimers(prev => ({ ...prev, [taskType]: duration })); 
        const interval = setInterval(() => {
            setTaskTimers(prev => {
                if (prev[taskType as keyof typeof prev] <= 1) { clearInterval(interval); return { ...prev, [taskType]: 0 }; }
                return { ...prev, [taskType]: prev[taskType as keyof typeof prev] - 1 };
            });
        }, 1000);
    };

    const claimTaskApp = (taskType: string) => {
        if (taskTimers[taskType as keyof typeof taskTimers] > 0) return alert(`⏳ Vui lòng đợi ${taskTimers[taskType as keyof typeof taskTimers]} giây nữa để nhận thưởng!`);
        fetch(`${BACKEND_URL}/api/claim-app-task`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, taskType })
        }).then(res => res.json()).then(data => {
            if(data.success) {
                setBalance(data.balance);
                setTasks(prev => ({ ...prev, [`${taskType}TaskDone`]: true }));
                alert(`🎉 Nhận thành công +${data.reward} SWGT!`);
            } else { alert(data.message || "❌ Lỗi: Bạn thao tác quá nhanh hoặc đã nhận rồi!"); }
        });
    };

    // ==================================================
    // KHỐI RENDER: HEADER (CÓ AVATAR)
    // ==================================================
    const renderHeader = () => (
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
                    <p style={{ margin: 0, fontSize: '12px', color: theme.textDim, fontWeight: 'normal' }}>Thành viên</p>
                </div>
                
                {/* --- KHUNG AVATAR KÈM VÒNG NGUYỆT QUẾ ĐƯỢC CHUẨN HÓA --- */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '5px' }}>
                    
                    {/* SVG Vòng nguyệt quế */}
                    <svg viewBox="0 0 100 100" style={{ position: 'absolute', width: '150%', height: '150%', top: '-25%', left: '-25%', zIndex: 1, pointerEvents: 'none' }}>
                        {/* Cành cây */}
                        <path d="M 50 90 C 15 90, 5 50, 20 20" fill="none" stroke={wreathColor} strokeWidth="1.5" />
                        <path d="M 50 90 C 85 90, 95 50, 80 20" fill="none" stroke={wreathColor} strokeWidth="1.5" />
                        {/* Lá bên trái */}
                        <path d="M 20 20 Q 30 15 25 30 Q 15 25 20 20" fill={wreathColor} />
                        <path d="M 12 40 Q 25 35 20 50 Q 5 45 12 40" fill={wreathColor} />
                        <path d="M 15 65 Q 30 55 25 70 Q 10 70 15 65" fill={wreathColor} />
                        <path d="M 28 82 Q 40 75 35 88 Q 20 85 28 82" fill={wreathColor} />
                        {/* Lá bên phải */}
                        <path d="M 80 20 Q 70 15 75 30 Q 85 25 80 20" fill={wreathColor} />
                        <path d="M 88 40 Q 75 35 80 50 Q 95 45 88 40" fill={wreathColor} />
                        <path d="M 85 65 Q 70 55 75 70 Q 90 70 85 65" fill={wreathColor} />
                        <path d="M 72 82 Q 60 75 65 88 Q 80 85 72 82" fill={wreathColor} />
                    </svg>

                    {/* Lõi Avatar */}
                    <div style={{ 
                        width: '52px', height: '52px', borderRadius: '50%', 
                        padding: '2px', backgroundColor: theme.bg,
                        boxShadow: glow, zIndex: 2
                    }}>
                        {userProfile.photoUrl ? (
                            <img src={userProfile.photoUrl} alt="avatar" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${wreathColor}` }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: theme.cardBg, border: `2px solid ${wreathColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.gold, fontSize: '20px' }}>👤</div>
                        )}
                    </div>
                    
                    {/* Bảng Danh hiệu VIP đính kèm dưới chân Avatar */}
                    <div style={{ position: 'absolute', bottom: '-10px', zIndex: 3, display: 'flex', alignItems: 'center', backgroundColor: '#000', padding: '2px 8px', borderRadius: '12px', border: `1px solid ${wreathColor}`, boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        <span style={{ color: wreathColor, fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            {vipLevel}
                        </span>
                    </div>

                    {/* Dấu chấm Online (Xanh lá) */}
                    <div style={{ position: 'absolute', top: '0px', right: '0px', width: '12px', height: '12px', backgroundColor: theme.green, borderRadius: '50%', border: `2px solid ${theme.bg}`, zIndex: 4 }}></div>
                </div>
            </div>
        </div>
    );

    // ==================================================
    // KHỐI RENDER: BẢNG TỔNG TÀI SẢN (DÙNG CHUNG CẢ 2 TAB)
    // ==================================================
    const renderWealthBoard = () => (
        <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', border: `1px solid ${theme.border}`, marginBottom: '25px' }}>
            <h3 style={{color: '#F4D03F', borderBottom: `1px solid ${theme.gold}`, paddingBottom: '10px', margin: '0 0 15px 0', fontSize: '16px'}}>
                💎 TOP 10 ĐẠI GIA SWGT
            </h3>
            
            {/* Ghi chú cực kỳ rõ ràng để xóa tan thắc mắc của người dùng */}
            <div style={{ backgroundColor: 'rgba(244, 208, 63, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: `1px dashed ${theme.gold}` }}>
                <p style={{fontSize: '13px', color: theme.gold, margin: 0, lineHeight: '1.5', textAlign: 'justify'}}>
                    <span style={{fontWeight: 'bold'}}>📌 LƯU Ý QUAN TRỌNG:</span><br/> 
                    Số SWGT trong bảng này tính <b>TỔNG TÀI SẢN</b> bạn đã tạo ra từ đầu đến nay (Bao gồm: <i>Số dư hiện tại + Tiền đã rút về ví + Quà điểm danh & Nhiệm vụ</i>). Bảng này phản ánh chính xác đẳng cấp và sức cày cuốc của bạn!
                </p>
            </div>

            {wealthBoard.slice(0, 10).map((user, index) => {
                let icon = "💸";
                if (index === 0) icon = "👑";
                else if (index === 1) icon = "💎";
                else if (index === 2) icon = "💰";
                
                const isMe = user.firstName === userProfile.name.split(' ')[0];

                return (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: index < wealthBoard.length - 1 ? `1px solid ${theme.border}` : 'none', backgroundColor: isMe ? 'rgba(244, 208, 63, 0.1)' : 'transparent', borderRadius: '8px', paddingLeft: isMe ? '10px' : '0', paddingRight: isMe ? '10px' : '0' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '22px', marginRight: '12px' }}>{icon}</span>
                            <span style={{ color: isMe ? theme.gold : theme.textLight, fontWeight: 'bold', fontSize: '15px' }}>
                                {user.firstName} {user.lastName} {isMe && '(Bạn)'}
                            </span>
                        </div>
                        <div style={{ color: theme.green, fontWeight: 'bold', fontSize: '16px' }}>
                            {user.totalEarned} <span style={{ fontSize: '12px', color: theme.textDim, fontWeight: 'normal' }}>SWGT</span>
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
                        
                        let bgColor = '#000';
                        let textColor = theme.textDim;
                        let borderColor = theme.border;

                        if (isClaimed) { bgColor = 'rgba(52, 199, 89, 0.1)'; textColor = theme.green; borderColor = theme.green; }
                        else if (isToday) { bgColor = 'rgba(244, 208, 63, 0.1)'; textColor = theme.gold; borderColor = theme.gold; }

                        return (
                            <div key={day} style={{ minWidth: '40px', backgroundColor: bgColor, borderRadius: '8px', padding: '8px 5px', border: `1px solid ${borderColor}` }}>
                                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: textColor }}>Ngày {day}</p>
                                <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: textColor }}>
                                    {isClaimed ? '✅' : `+${STREAK_REWARDS[idx]}`}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <button 
                    onClick={handleCheckIn} 
                    disabled={isCheckedInToday}
                    style={{ width: '100%', backgroundColor: isCheckedInToday ? '#333' : theme.green, color: isCheckedInToday ? theme.textDim : '#fff', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: isCheckedInToday ? 'not-allowed' : 'pointer', fontSize: '15px' }}
                >
                    {isCheckedInToday ? "✅ BẠN ĐÃ NHẬN SWGT HÔM NAY" : "✋ BẤM ĐIỂM DANH NGAY"}
                </button>
                <p style={{ margin: '10px 0 0 0', color: theme.red, fontSize: '12px', fontStyle: 'italic' }}>
                    ⚠️ Nhớ vào mỗi ngày! Nếu quên 1 ngày, chuỗi sẽ quay lại từ đầu.
                </p>
            </div>

            {/* BANNER 1500 SWGT - HOME */}
            <div style={{ backgroundColor: 'rgba(244, 208, 63, 0.1)', border: `1px dashed ${theme.gold}`, padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                <p style={{ margin: 0, color: theme.gold, fontSize: '14px', lineHeight: '1.6', textAlign: 'center' }}>
                    <span style={{fontWeight:'bold'}}>⚡ ĐẶC QUYỀN MỞ KHÓA TỐC ĐỘ:</span><br/>Cày đạt mốc <b>1500 SWGT</b> sẽ được <b style={{color: '#fff'}}>RÚT TIỀN VỀ VÍ NGAY LẬP TỨC</b>, bỏ qua hoàn toàn thời gian đếm ngược!
                </p>
            </div>

            {/* ĐƯA TOP 10 ĐẠI GIA RA TRANG CHỦ THEO YÊU CẦU */}
            {renderWealthBoard()}

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
                            {!taskStarted.read ? (
                                <button onClick={() => startTask('read', 'https://swc.capital/', 60)} style={{ flex: 1, backgroundColor: theme.blue, color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>MỞ ĐỌC NGAY</button>
                            ) : (
                                <button onClick={() => claimTaskApp('read')} disabled={taskTimers.read > 0} style={{ flex: 1, backgroundColor: taskTimers.read > 0 ? '#333' : theme.gold, color: taskTimers.read > 0 ? theme.textDim : '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: taskTimers.read > 0 ? 'not-allowed' : 'pointer' }}>
                                    {taskTimers.read > 0 ? `ĐỢI ${taskTimers.read}s` : 'NHẬN QUÀ'}
                                </button>
                            )}
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
                            {!taskStarted.youtube ? (
                                <button onClick={() => startTask('youtube', 'https://www.youtube.com/c/SkyWorldCommunityVietNam/videos', 6)} style={{ flex: 1, backgroundColor: '#FF0000', color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>MỞ XEM NGAY</button>
                            ) : (
                                <button onClick={() => claimTaskApp('youtube')} disabled={taskTimers.youtube > 0} style={{ flex: 1, backgroundColor: taskTimers.youtube > 0 ? '#333' : theme.gold, color: taskTimers.youtube > 0 ? theme.textDim : '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: taskTimers.youtube > 0 ? 'not-allowed' : 'pointer' }}>
                                    {taskTimers.youtube > 0 ? `ĐỢI ${taskTimers.youtube}s` : 'NHẬN QUÀ'}
                                </button>
                            )}
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
                            {!taskStarted.facebook ? (
                                <button onClick={() => startTask('facebook', 'https://www.facebook.com/swc.capital.vn', 5)} style={{ flex: 1, backgroundColor: '#1877F2', color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>MỞ TRANG</button>
                            ) : (
                                <button onClick={() => claimTaskApp('facebook')} disabled={taskTimers.facebook > 0} style={{ flex: 1, backgroundColor: taskTimers.facebook > 0 ? '#333' : theme.gold, color: taskTimers.facebook > 0 ? theme.textDim : '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: taskTimers.facebook > 0 ? 'not-allowed' : 'pointer' }}>
                                    {taskTimers.facebook > 0 ? `ĐỢI ${taskTimers.facebook}s` : 'NHẬN QUÀ'}
                                </button>
                            )}
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
                            {!taskStarted.share ? (
                                <button onClick={() => startTask('share', `https://t.me/share/url?url=https://t.me/Dau_Tu_SWC_bot?start=${userId}`, 5)} style={{ flex: 1, backgroundColor: '#34C759', color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>MỞ CHIA SẺ</button>
                            ) : (
                                <button onClick={() => claimTaskApp('share')} disabled={taskTimers.share > 0} style={{ flex: 1, backgroundColor: taskTimers.share > 0 ? '#333' : theme.gold, color: taskTimers.share > 0 ? theme.textDim : '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: taskTimers.share > 0 ? 'not-allowed' : 'pointer' }}>
                                    {taskTimers.share > 0 ? `ĐỢI ${taskTimers.share}s` : 'NHẬN QUÀ'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.textLight, margin: '0 0 15px 0', fontSize: '18px' }}>🎯 Cách Hoạt Động</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '14px', lineHeight: '1.6' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>📱 Bước 1: Tham gia Bot SWC</span><br/>Liên kết với <a href="https://t.me/Dau_Tu_SWC_bot" target="_blank" rel="noreferrer" style={{color: theme.blue, textDecoration: 'none'}}>@Dau_Tu_SWC_bot</a> trên Telegram để bắt đầu.</p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '14px', lineHeight: '1.6' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>👥 Bước 2: Mời bạn bè</span><br/>Chia sẻ link giới thiệu và mời bạn bè tham gia cộng đồng SWC.</p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '14px', lineHeight: '1.6' }}><span style={{color: theme.textLight, fontWeight:'bold'}}>💰 Bước 3: Nhận SWGT</span><br/>Mỗi người bạn mời sẽ giúp bạn kiếm SWGT thưởng.</p>
                    <div style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)', border: `1px dashed ${theme.green}`, padding: '15px', borderRadius: '10px' }}>
                        <p style={{ margin: 0, color: theme.green, fontSize: '14px', lineHeight: '1.6' }}>
                            <span style={{fontWeight:'bold'}}>💬 MẸO: Tương tác kiếm thêm điểm</span><br/>Mỗi tin nhắn bạn chat trong Nhóm Thảo Luận (từ 10 ký tự trở lên) tự động cộng <b style={{color: theme.gold}}>+0.3 SWGT</b>. Chat càng nhiều, tiền càng nhiều!
                        </p>
                    </div>
                </div>
            </div>
            
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '15px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.gold, margin: '0 0 15px 0', fontSize: '18px' }}>💎 Cơ Cấu Phần Thưởng SWGT</h2>
                <p style={{ color: theme.textLight, fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>📌 Thành viên Thường:</p>
                <div style={{ color: theme.textDim, fontSize: '14px', margin: '0 0 15px 0', lineHeight: '1.6' }}>
                    <p style={{ margin: 0 }}>Tham gia Channel: <span style={{color: '#34C759'}}>+10 SWGT/người</span></p>
                    <p style={{ margin: 0 }}>Tham gia Nhóm Chat: <span style={{color: '#34C759'}}>+10 SWGT/người</span></p>
                </div>
                <p style={{ color: theme.premium, fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>⭐ Thành Viên Premium (+100%):</p>
                <div style={{ color: theme.textDim, fontSize: '14px', margin: '0 0 10px 0', lineHeight: '1.6' }}>
                    <p style={{ margin: 0 }}>Tham gia Channel: <span style={{color: '#34C759'}}>+20 SWGT/người</span></p>
                    <p style={{ margin: 0 }}>Tham gia Nhóm Chat: <span style={{color: '#34C759'}}>+20 SWGT/người</span></p>
                </div>
            </div>
        </div>
    );

    const renderRewards = () => {
        let nextTarget = 3;
        let nextReward = "+10 SWGT";
        for (let m of MILESTONE_LIST) {
            if (referrals < m.req) {
                nextTarget = m.req;
                nextReward = `+${m.reward} SWGT`;
                break;
            }
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
                                    <p style={{ color: theme.textLight, fontSize: '13px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Mốc {m.req}</p>
                                    <p style={{ color: theme.gold, fontSize: '12px', margin: '0 0 10px 0' }}>+{m.reward}</p>
                                    <button 
                                        onClick={() => handleClaimMilestone(m.req)} 
                                        disabled={!canClaim}
                                        style={{ width: '100%', backgroundColor: isClaimed ? '#333' : (canClaim ? theme.green : '#333'), color: isClaimed ? theme.textDim : (canClaim ? '#fff' : theme.textDim), border: 'none', padding: '8px 0', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: canClaim ? 'pointer' : 'not-allowed' }}>
                                        {isClaimed ? 'ĐÃ NHẬN' : 'NHẬN'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <h3 style={{color: '#fff', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '15px', fontSize: '16px'}}>🤝 BẢNG VÀNG GIỚI THIỆU</h3>
                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '15px', border: `1px solid ${theme.border}`, marginBottom: '25px' }}>
                    {displayBoard.slice(0, 10).map((user, index) => {
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
                    <div style={{ textAlign: 'center', paddingTop: '15px', borderTop: `1px dashed ${theme.gold}`, marginTop: '10px' }}>
                        <a href={`https://t.me/share/url?url=https://t.me/Dau_Tu_SWC_bot?start=${userId}&text=Vào%20nhận%20ngay%20SWGT%20miễn%20phí%20từ%20hệ%20sinh%20thái%20công%20nghệ%20uST%20này%20anh%20em!`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: theme.blue, color: '#fff', padding: '14px 0', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '14px', textDecoration: 'none', boxSizing: 'border-box' }}>
                            ✈️ CHIA SẺ LINK ĐỂ ĐUA TOP NGAY
                        </a>
                    </div>
                </div>

                {renderWealthBoard()}

                <h3 style={{color: '#fff', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '15px', fontSize: '16px'}}>💎 KHO ĐẶC QUYỀN VIP</h3>
                <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '15px', marginBottom: '15px', border: `1px solid ${theme.border}`}}>
                    <h4 style={{margin: '0 0 8px 0', color: '#5E92F3', fontSize: '16px'}}>☕ Cà Phê Chiến Lược</h4>
                    <p style={{fontSize: '14px', color: theme.textDim, margin: '0 0 15px 0', lineHeight: '1.5'}}>Thảo luận danh mục trực tiếp cùng Admin Ucity.</p>
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
                ::-webkit-scrollbar { height: 6px; }
                ::-webkit-scrollbar-track { background: #1C1C1E; border-radius: 10px; }
                ::-webkit-scrollbar-thumb { background: #F4D03F; border-radius: 10px; }
            `}</style>
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
