// @ts-nocheck
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
    
    // 😈 STATE QUẢN LÝ KHUNG VIỀN AVATAR
    const [userProfile, setUserProfile] = useState({
        name: 'Đang tải...',
        username: '',
        photoUrl: '',
        activeFrame: 'none', 
        ownedFrames: ['none']
    });

    const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    const [isPremiumUser, setIsPremiumUser] = useState(false);
    const [unlockDateMs, setUnlockDateMs] = useState(0);
    const [lockDaysLimit, setLockDaysLimit] = useState(15);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });
    const [isUnlocked, setIsUnlocked] = useState(false);

    const [boardType, setBoardType] = useState('weekly'); 

    // ==========================================
    // STATE CHO RƯƠNG BÍ ẨN (GACHA 3.0)
    // ==========================================
    const [isSpinning, setIsSpinning] = useState(false);
    const [chestBoard, setChestBoard] = useState(Array(9).fill({ isOpened: false, reward: null, isMine: false }));
    const [spinResultMsg, setSpinResultMsg] = useState('');
    
    const [spinCount, setSpinCount] = useState(0); 
    const MAX_PITY = 30; 

    const [boxModal, setBoxModal] = useState({ show: false, type: '', label: '', reward: 0, status: 'closed', isFrame: false });

    const [winnersList, setWinnersList] = useState<string[]>([]);
    const [currentWinner, setCurrentWinner] = useState('');
    const [showWinner, setShowWinner] = useState(false);
    const [showRevengePopup, setShowRevengePopup] = useState(false);

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

    // 😈 DANH SÁCH KHUNG VIỀN AVATAR
    const AVATAR_FRAMES = [
        { id: 'bronze', name: 'Khung Đồng', price: 100, border: '3px solid #CD7F32', shadow: '0 0 5px #CD7F32' },
        { id: 'silver', name: 'Khung Bạc', price: 300, border: '3px solid #C0C0C0', shadow: '0 0 8px #C0C0C0' },
        { id: 'gold', name: 'Khung Vàng', price: 800, border: '3px solid #F4D03F', shadow: '0 0 12px #F4D03F' },
        { id: 'dragon', name: 'Rồng Lửa', price: 2000, border: '3px dashed #FF3B30', shadow: '0 0 20px #FF3B30', animation: 'pulseRed 1.5s infinite' },
        { id: 'light', name: 'Ánh Sáng', price: -1, border: '3px dotted #00FFFF', shadow: '0 0 15px #00FFFF', desc: 'Chỉ rớt từ Đập Rương' }
    ];

    const getFrameStyle = (frameId) => {
        const frame = AVATAR_FRAMES.find(f => f.id === frameId);
        if (!frame) return { border: `2px solid ${theme.border}`, shadow: 'none', animation: 'none' };
        return { border: frame.border, shadow: frame.shadow, animation: frame.animation || 'none' };
    };

    const MILESTONE_LIST = [
        { req: 3, reward: 10, key: 'milestone3', rank: 'Đại Úy 🎖️' },
        { req: 10, reward: 25, key: 'milestone10', rank: 'Thiếu Tá 🎖️' },
        { req: 20, reward: 40, key: 'milestone20', rank: 'Trung Tá 🎖️' },
        { req: 50, reward: 100, key: 'milestone50', rank: 'Thượng Tá 🎖️' },
        { req: 80, reward: 150, key: 'milestone80', rank: 'Đại Tá 🎖️' },
        { req: 120, reward: 250, key: 'milestone120', rank: 'Thiếu Tướng 🌟' },
        { req: 200, reward: 425, key: 'milestone200', rank: 'Trung Tướng 🌟🌟' },
        { req: 350, reward: 800, key: 'milestone350', rank: 'Thượng Tướng 🌟🌟🌟' },
        { req: 500, reward: 1200, key: 'milestone500', rank: 'Đại Tướng 🌟🌟🌟🌟' }
    ];

    const STREAK_REWARDS = [0.5, 1.5, 3, 3.5, 5, 7, 9];

    useEffect(() => {
        const generateFakeWinners = () => {
            const ho = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng'];
            const ten = ['Anh', 'Dũng', 'Linh', 'Hùng', 'Tuấn', 'Ngọc', 'Trang', 'Thảo', 'Tâm', 'Phương'];
            const actions = ['vừa bốc trúng 50 SWGT', 'đập rương nổ hũ 100 SWGT', 'vừa bốc trúng 20 SWGT', 'mở hụt rương 500 đầy tiếc nuối', 'bốc trúng rương 500 SWGT', 'đập rương 10 SWGT', 'vừa bốc trúng Khung Ánh Sáng ✨'];
            const icons = ['🎁', '💎', '🚀', '💰', '📦', '⚡', '🖼️'];

            let arr = [];
            for (let i = 0; i < 50; i++) {
                const randomHo = ho[Math.floor(Math.random() * ho.length)];
                const randomTen = ten[Math.floor(Math.random() * ten.length)];
                const randomAction = actions[Math.floor(Math.random() * actions.length)];
                const randomIcon = icons[Math.floor(Math.random() * icons.length)];
                arr.push(`${randomIcon} ${randomHo} ${randomTen} ${randomAction}`);
            }
            return arr;
        };
        setWinnersList(generateFakeWinners());
    }, []);

    useEffect(() => {
        if (winnersList.length === 0) return;
        let timeoutId;
        let showTimeoutId;
        const runTicker = () => {
            const msg = winnersList[Math.floor(Math.random() * winnersList.length)];
            setCurrentWinner(msg);
            setShowWinner(true);
            showTimeoutId = setTimeout(() => {
                setShowWinner(false);
                const pauseTime = Math.floor(Math.random() * 5000) + 5000; 
                timeoutId = setTimeout(runTicker, pauseTime);
            }, 3500);
        };
        timeoutId = setTimeout(runTicker, 1500); 
        return () => { clearTimeout(timeoutId); clearTimeout(showTimeoutId); };
    }, [winnersList]);

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

    const fetchUserData = (uid) => {
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

                if (data.activeFrame || data.ownedFrames) {
                    setUserProfile(prev => ({ 
                        ...prev, 
                        activeFrame: data.activeFrame || 'none', 
                        ownedFrames: data.ownedFrames && data.ownedFrames.length > 0 ? data.ownedFrames : ['none'] 
                    }));
                }
                
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
        const tg = (window).Telegram?.WebApp;
        if (tg) {
            tg.ready();
            tg.expand();
            const user = tg.initDataUnsafe?.user;
            if (user) {
                const uid = user.id.toString();
                setUserId(uid);
                setUserProfile(prev => ({
                    ...prev,
                    name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                    username: user.username ? `@${user.username}` : '@nguoidung',
                    photoUrl: user.photo_url || ''
                }));
                fetchUserData(uid);
            }
        }
        
        fetch(`${BACKEND_URL}/api/leaderboard`)
            .then(res => res.json())
            .then(data => setLeaderboard(data))
            .catch(() => {});
    }, []);

    const isCheckedInToday = lastCheckIn ? new Date(lastCheckIn).toDateString() === new Date().toDateString() : false;

    const getMilitaryRank = (count) => {
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
        { firstName: 'Vũ', lastName: 'Dũng', referralCount: 65, photoUrl: '', activeFrame: 'dragon' },
        { firstName: 'Mai', lastName: 'Thiều Thị', referralCount: 60, photoUrl: '', activeFrame: 'gold' },
        { firstName: 'LINH', lastName: 'NGUYEN', referralCount: 47, photoUrl: '', activeFrame: 'silver' },
        { firstName: 'Minh', lastName: 'Ngọc Hoàng', referralCount: 33, photoUrl: '', activeFrame: 'bronze' },
        { firstName: 'PHƯƠNG', lastName: 'ANH PHÙNG', referralCount: 27, photoUrl: '', activeFrame: 'none' },
        { firstName: 'Nông', lastName: 'Mao', referralCount: 12, photoUrl: '', activeFrame: 'none' },
        { firstName: 'Support', lastName: '', referralCount: 11, photoUrl: '', activeFrame: 'none' },
        { firstName: 'OSAKA', lastName: 'CHAU HUYNH', referralCount: 10, photoUrl: '', activeFrame: 'none' },
        { firstName: 'Trinh', lastName: 'Lê', referralCount: 9, photoUrl: '', activeFrame: 'none' },
        { firstName: 'Lý', lastName: 'Hà', referralCount: 8, photoUrl: '', activeFrame: 'none' }
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
        let estimatedTotal = (user.displayCount * 25) + 300 + (10 - index) * 50; 
        if (user.displayCount === referrals && user.firstName === (userProfile.name || '').split(' ')[0]) {
            estimatedTotal = balance + (referrals * 25) + (checkInStreak * 5) + 50; 
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

    if (myRank === 1 && referrals >= 5) { vipLevel = "🏆 TOP 1 SERVER"; wreathColor = "#F4D03F"; }
    else if (myRank === 2 && referrals >= 5) { vipLevel = "🔥 TOP 2 SERVER"; wreathColor = "#C0C0C0"; }
    else if (myRank === 3 && referrals >= 5) { vipLevel = "🔥 TOP 3 SERVER"; wreathColor = "#CD7F32"; }
    else if (myRank > 0 && myRank <= 10 && referrals >= 5) { vipLevel = `🌟 TOP ${myRank} SERVER`; wreathColor = theme.blue; }
    else if (referrals >= 100) { vipLevel = "Huyền Thoại 👑"; wreathColor = "#E0B0FF"; }
    else if (referrals >= 50) { vipLevel = "Đối Tác VIP 💎"; wreathColor = theme.gold; }
    else if (referrals >= 10) { vipLevel = "Đại Sứ 🥇"; wreathColor = "#C0C0C0"; }
    else if (referrals >= 3) { vipLevel = "Sứ Giả 🥈"; wreathColor = "#CD7F32"; }

    const handleBuyFrame = (frameId, price) => {
        if (userProfile.ownedFrames.includes(frameId)) {
            fetch(`${BACKEND_URL}/api/redeem`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, itemName: frameId, cost: 0 })
            }).then(() => {
                setUserProfile(prev => ({ ...prev, activeFrame: frameId }));
                alert("✅ Đã trang bị khung viền thành công!");
            });
            return;
        }

        if (balance < price) return alert(`⚠️ Bạn cần thêm ${price - balance} SWGT nữa để mua Khung này!`);
        
        if (window.confirm(`Xác nhận dùng ${price} SWGT để mua Khung viền này?`)) {
            fetch(`${BACKEND_URL}/api/redeem`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, itemName: frameId, cost: price })
            }).then(res => res.json()).then(data => {
                if(data.success) {
                    setBalance(data.balance);
                    setUserProfile(prev => ({ 
                        ...prev, 
                        activeFrame: frameId, 
                        ownedFrames: [...prev.ownedFrames, frameId] 
                    }));
                    alert("🎉 Mua và trang bị khung viền thành công! Trông bạn ngầu hơn hẳn rồi đấy.");
                } else {
                    alert("❌ Lỗi: " + data.message);
                }
            }).catch(() => alert("⚠️ Lỗi kết nối máy chủ!"));
        }
    };

    const handleCheckIn = () => {
        if (isCheckedInToday) return;
        fetch(`${BACKEND_URL}/api/checkin`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId })
        }).then(res => res.json()).then(data => {
            if (data.success) {
                setBalance(data.balance); setLastCheckIn(data.lastCheckInDate); setCheckInStreak(data.streak);
                alert(`🔥 Điểm danh thành công (Chuỗi ${data.streak} ngày)!\nBạn nhận được +${data.reward} SWGT.`);
            } else { alert(data.message || "❌ Hôm nay bạn đã điểm danh rồi!"); }
        }).catch(() => alert("⚠️ Mạng chậm, vui lòng thử lại sau giây lát!"));
    };

    const handleClaimGiftCode = () => {
        if (!giftCodeInput.trim()) return alert("⚠️ Vui lòng nhập mã Giftcode!");
        fetch(`${BACKEND_URL}/api/claim-giftcode`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, code: giftCodeInput })
        }).then(res => res.json()).then(data => {
            if (data.success) {
                setBalance(data.balance); setGiftCodeInput('');
                alert(`🎉 Chúc mừng! Bạn nhận được +${data.reward} SWGT từ mã quà tặng!`);
            } else { alert(data.message); }
        }).catch(() => alert("⚠️ Lỗi kết nối máy chủ!"));
    };

    const handleSaveWallet = () => {
        if (withdrawMethod === 'gate' && !gatecode) return alert("⚠️ Vui lòng nhập Gatecode/UID của bạn!");
        if (withdrawMethod === 'erc20' && !wallet) return alert("⚠️ Vui lòng nhập địa chỉ ví ERC20!");
        fetch(`${BACKEND_URL}/api/save-wallet`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, wallet, gatecode, fullName, email, phone })
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
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, amount, withdrawMethod }) 
            }).then(res => res.json()).then(data => {
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

    const handleClaimMilestone = (milestoneReq) => {
        fetch(`${BACKEND_URL}/api/claim-milestone`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, milestone: milestoneReq })
        }).then(res => res.json()).then(data => {
            if(data.success) {
                setBalance(data.balance); setMilestones(prev => ({ ...prev, [`milestone${milestoneReq}`]: true }));
                alert(`🎉 Chúc mừng! Bạn đã nhận thành công thưởng mốc ${milestoneReq} người!`);
            } else { alert(data.message || "❌ Chưa đủ điều kiện nhận hoặc đã nhận rồi!"); }
        });
    };

    const redeemItem = (itemName, cost) => {
        if (balance < cost) return alert(`⚠️ Bạn cần thêm ${cost - balance} SWGT nữa để đổi quyền lợi này!`);
        if (window.confirm(`Xác nhận dùng ${cost} SWGT để đổi ${itemName}?`)) {
            fetch(`${BACKEND_URL}/api/redeem`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, itemName, cost })
            }).then(res => res.json()).then(data => {
                if(data.success) { setBalance(data.balance); alert("🎉 Yêu cầu đổi quà đã được gửi! Admin sẽ xử lý sớm."); }
            });
        }
    };

    const startTask = (taskType, url, duration) => {
        window.open(url, '_blank'); 
        setTaskStarted(prev => ({ ...prev, [taskType]: true }));
        setTaskTimers(prev => ({ ...prev, [taskType]: duration })); 
        const interval = setInterval(() => {
            setTaskTimers(prev => {
                if (prev[taskType] <= 1) { clearInterval(interval); return { ...prev, [taskType]: 0 }; }
                return { ...prev, [taskType]: prev[taskType] - 1 };
            });
        }, 1000);
    };

    const claimTaskApp = (taskType) => {
        if (taskTimers[taskType] > 0) return alert(`⏳ Vui lòng đợi ${taskTimers[taskType]} giây nữa để nhận thưởng!`);
        fetch(`${BACKEND_URL}/api/claim-app-task`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, taskType })
        }).then(res => res.json()).then(data => {
            if(data.success) {
                setBalance(data.balance); setTasks(prev => ({ ...prev, [`${taskType}TaskDone`]: true }));
                alert(`🎉 Nhận thành công +${data.reward} SWGT!`);
            } else { alert(data.message || "❌ Lỗi: Bạn thao tác quá nhanh hoặc đã nhận rồi!"); }
        });
    };

    // ==================================================
    // GIAO DIỆN HEADER (CÓ CHẤM ONLINE VÀ KHUNG VIỀN)
    // ==================================================
    const renderHeader = () => {
        const myFrameStyle = getFrameStyle(userProfile.activeFrame);
        
        // Avatar Mặc định cho User
        const getInitials = (f, l) => { return ((f ? f.charAt(0) : '') + (l ? l.charAt(0) : '')).toUpperCase().substring(0, 2) || 'U'; };
        const myInitials = getInitials(userProfile.name?.split(' ')[0], userProfile.name?.split(' ')[1]);

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
                        
                        <div style={{ 
                            position: 'relative', width: '52px', height: '52px', borderRadius: '50%', padding: '2px', backgroundColor: theme.bg, 
                            border: myFrameStyle.border, boxShadow: myFrameStyle.shadow, animation: myFrameStyle.animation, zIndex: 1, flexShrink: 0
                        }}>
                            {userProfile.photoUrl ? (
                                <img src={userProfile.photoUrl} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: theme.gold, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>{myInitials}</div>
                            )}
                        </div>
                        
                        <div style={{ position: 'absolute', bottom: '-10px', zIndex: 11, display: 'flex', alignItems: 'center', backgroundColor: '#000', padding: '2px 8px', borderRadius: '12px', border: `1px solid ${wreathColor}` }}>
                            <span style={{ color: wreathColor, fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{vipLevel}</span>
                        </div>

                        {/* ĐÃ FIX: CHẤM XANH ONLINE ĐẨY LÊN TRÊN CÙNG Z-INDEX CAO NHẤT */}
                        <div style={{ position: 'absolute', bottom: '8px', right: '-4px', width: '14px', height: '14px', backgroundColor: '#34C759', borderRadius: '50%', border: `2px solid ${theme.bg}`, zIndex: 15 }}></div>
                    </div>
                </div>
            </div>
        );
    };

    // ==================================================
    // KHỐI RENDER: BẢNG XẾP HẠNG (THUẬT TOÁN TẠO AVATAR CHỮ)
    // ==================================================
    const renderWealthBoard = () => (
        <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', border: `1px solid ${theme.border}`, marginBottom: '25px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button onClick={() => setBoardType('weekly')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${boardType === 'weekly' ? theme.gold : theme.border}`, backgroundColor: boardType === 'weekly' ? 'rgba(244, 208, 63, 0.1)' : '#000', color: boardType === 'weekly' ? theme.gold : theme.textDim, fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', transition: 'all 0.3s' }}>
                    🏆 TOP TUẦN
                </button>
                <button onClick={() => setBoardType('all')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${boardType === 'all' ? theme.gold : theme.border}`, backgroundColor: boardType === 'all' ? 'rgba(244, 208, 63, 0.1)' : '#000', color: boardType === 'all' ? theme.gold : theme.textDim, fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', transition: 'all 0.3s' }}>
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
                let icon = "💸"; if (index === 0) icon = "👑"; else if (index === 1) icon = "💎"; else if (index === 2) icon = "🌟";
                const isMe = user.firstName === (userProfile.name || '').split(' ')[0];
                
                // Thuật toán tạo ảnh Avatar Chữ cái (Tránh lỗi do UI-Avatar bị sập)
                const photo = isMe && userProfile.photoUrl ? userProfile.photoUrl : (user.photoUrl || user.photo_url);
                const getInitials = (f, l) => { return ((f ? f.charAt(0) : '') + (l ? l.charAt(0) : '')).toUpperCase().substring(0, 2) || 'U'; };
                const initials = getInitials(user.firstName, user.lastName);
                const initialBg = index === 0 ? '#F4D03F' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#333333';
                const initialColor = index === 0 ? '#000' : '#FFF';

                let frameStyle = { border: `2px solid ${theme.border}`, shadow: 'none', animation: 'none' };
                if (isMe && userProfile.activeFrame !== 'none') {
                    frameStyle = getFrameStyle(userProfile.activeFrame);
                } else if (user.activeFrame && user.activeFrame !== 'none') {
                    frameStyle = getFrameStyle(user.activeFrame);
                } else {
                    if (index === 0) frameStyle = getFrameStyle('gold');
                    else if (index === 1) frameStyle = getFrameStyle('silver');
                    else if (index === 2) frameStyle = getFrameStyle('bronze');
                }

                return (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: index < wealthBoard.length - 1 ? `1px solid ${theme.border}` : 'none', backgroundColor: isMe ? 'rgba(244, 208, 63, 0.1)' : 'transparent', borderRadius: '8px', paddingLeft: isMe ? '10px' : '0', paddingRight: isMe ? '10px' : '0' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ color: theme.textDim, fontWeight: 'bold', fontSize: '14px', minWidth: '24px', marginRight: '5px' }}>{index + 1}.</span>
                            
                            {/* AVATAR CÓ BỌC KHUNG VIỀN ĐUA TOP */}
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', overflow: 'hidden', flexShrink: 0, border: frameStyle.border, boxShadow: frameStyle.shadow, animation: frameStyle.animation, padding: '2px' }}>
                                {photo ? (
                                    <img src={photo} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: initialBg, color: initialColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>{initials}</div>
                                )}
                            </div>
                            
                            <span style={{ fontSize: '20px', marginRight: '8px' }}>{icon}</span>
                            
                            {/* KHÔI PHỤC HIỂN THỊ CẤP BẬC DƯỚI TÊN */}
                            <div style={{display:'flex', flexDirection:'column', gap: '3px'}}>
                                <span style={{ color: isMe ? theme.gold : theme.textLight, fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
                                    {user.firstName} {user.lastName} {isMe && '(Bạn)'}
                                </span>
                                <span style={{ color: theme.blue, fontSize: '11px', fontWeight: 'bold' }}>{getMilitaryRank(user.displayCount || user.referralCount)}</span>
                            </div>
                        </div>

                        {/* HIỂN THỊ ĐẦY ĐỦ CẢ SWGT VÀ SỐ NGƯỜI */}
                        <div style={{ color: theme.green, fontWeight: 'bold', fontSize: '15px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span>{boardType === 'all' ? user.totalEarned : user.displayCount * 15} <span style={{ fontSize: '11px', color: theme.textDim, fontWeight: 'normal' }}>SWGT</span></span>
                            <span style={{fontSize: '11px', color: theme.gold}}>({user.displayCount || 0} người)</span>
                        </div>
                    </div>
                )
            })}
        </div>
    );

    // ==================================================
    // TRANG CHỦ
    // ==================================================
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
                                <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: textColor }}>{isClaimed ? 'Đã nhận' : `+${STREAK_REWARDS[idx]}`}</p>
                            </div>
                        );
                    })}
                </div>

                <button onClick={handleCheckIn} disabled={isCheckedInToday} style={{ width: '100%', backgroundColor: isCheckedInToday ? '#333' : theme.green, color: isCheckedInToday ? theme.textDim : '#fff', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: isCheckedInToday ? 'not-allowed' : 'pointer', fontSize: '15px', transition: 'all 0.3s' }}>
                    {isCheckedInToday ? "✅ ĐÃ NHẬN HÔM NAY" : "✋ BẤM ĐIỂM DANH NGAY"}
                </button>
                <p style={{ margin: '10px 0 0 0', color: theme.red, fontSize: '12px', fontStyle: 'italic' }}>⚠️ Nhớ vào mỗi ngày! Nếu quên 1 ngày, chuỗi sẽ quay lại từ đầu.</p>
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

            {/* BẢNG ĐẠI GIA */}
            {renderWealthBoard()}

            {/* CHÍNH SÁCH THANH KHOẢN */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.gold, margin: '0 0 15px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>⚖️</span> Chính Sách Thanh Khoản</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><span style={{ fontSize: '18px' }}>🎯</span><div><p style={{ margin: 0, color: theme.textLight, fontSize: '14px', fontWeight: 'bold' }}>Mức tối thiểu</p><p style={{ margin: '2px 0 0 0', color: theme.textDim, fontSize: '13px' }}>Chỉ từ <b style={{color: theme.green}}>500 SWGT</b> / Tài khoản.</p></div></div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><span style={{ fontSize: '18px' }}>⏳</span><div><p style={{ margin: 0, color: theme.textLight, fontSize: '14px', fontWeight: 'bold' }}>Thời gian mở khóa cơ bản</p><p style={{ margin: '2px 0 0 0', color: theme.textDim, fontSize: '13px', lineHeight: '1.5' }}>Sau <b style={{color: theme.premium}}>7 ngày</b> (Premium) hoặc <b style={{color: theme.textLight}}>15 ngày</b> (Thường) tính từ ngày tham gia.</p></div></div>
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

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.textLight, margin: '0 0 15px 0', fontSize: '18px' }}>🧠 Nạp Kiến Thức & Lan Tỏa</h2>
                
                <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '10px', marginBottom: '10px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div><h4 style={{ margin: 0, color: theme.textLight, fontSize: '15px' }}>📖 Đọc bài phân tích</h4><p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}>Đợi 60 giây (+10 SWGT)</p></div>
                        {tasks.readTaskDone && <span style={{ color: theme.green, fontWeight: 'bold' }}>✅ Xong</span>}
                    </div>
                    {!tasks.readTaskDone && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {!taskStarted.read ? <button onClick={() => startTask('read', 'https://swc.capital/', 60)} style={{ flex: 1, backgroundColor: theme.blue, color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>MỞ ĐỌC NGAY</button>
                            : <button onClick={() => claimTaskApp('read')} disabled={taskTimers.read > 0} style={{ flex: 1, backgroundColor: taskTimers.read > 0 ? '#333' : theme.gold, color: taskTimers.read > 0 ? theme.textDim : '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: taskTimers.read > 0 ? 'not-allowed' : 'pointer' }}>{taskTimers.read > 0 ? `ĐỢI ${taskTimers.read}s` : 'NHẬN QUÀ'}</button>}
                        </div>
                    )}
                </div>

                <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '10px', marginBottom: '10px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div><h4 style={{ margin: 0, color: theme.textLight, fontSize: '15px' }}>▶️ Xem YouTube SWC</h4><p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}>Đợi 6 giây (+5 SWGT)</p></div>
                        {tasks.youtubeTaskDone && <span style={{ color: theme.green, fontWeight: 'bold' }}>✅ Xong</span>}
                    </div>
                    {!tasks.youtubeTaskDone && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {!taskStarted.youtube ? <button onClick={() => startTask('youtube', 'https://www.youtube.com/c/SkyWorldCommunityVietNam/videos', 6)} style={{ flex: 1, backgroundColor: '#FF0000', color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>MỞ XEM NGAY</button>
                            : <button onClick={() => claimTaskApp('youtube')} disabled={taskTimers.youtube > 0} style={{ flex: 1, backgroundColor: taskTimers.youtube > 0 ? '#333' : theme.gold, color: taskTimers.youtube > 0 ? theme.textDim : '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: taskTimers.youtube > 0 ? 'not-allowed' : 'pointer' }}>{taskTimers.youtube > 0 ? `ĐỢI ${taskTimers.youtube}s` : 'NHẬN QUÀ'}</button>}
                        </div>
                    )}
                </div>

                <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '10px', marginBottom: '10px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div><h4 style={{ margin: 0, color: theme.textLight, fontSize: '15px' }}>📘 Theo dõi Fanpage</h4><p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}>Đợi 5 giây (+5 SWGT)</p></div>
                        {tasks.facebookTaskDone && <span style={{ color: theme.green, fontWeight: 'bold' }}>✅ Xong</span>}
                    </div>
                    {!tasks.facebookTaskDone && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {!taskStarted.facebook ? <button onClick={() => startTask('facebook', 'https://www.facebook.com/swc.capital.vn', 5)} style={{ flex: 1, backgroundColor: '#1877F2', color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>MỞ TRANG</button>
                            : <button onClick={() => claimTaskApp('facebook')} disabled={taskTimers.facebook > 0} style={{ flex: 1, backgroundColor: taskTimers.facebook > 0 ? '#333' : theme.gold, color: taskTimers.facebook > 0 ? theme.textDim : '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: taskTimers.facebook > 0 ? 'not-allowed' : 'pointer' }}>{taskTimers.facebook > 0 ? `ĐỢI ${taskTimers.facebook}s` : 'NHẬN QUÀ'}</button>}
                        </div>
                    )}
                </div>

                <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div><h4 style={{ margin: 0, color: theme.textLight, fontSize: '15px' }}>📢 Chia sẻ dự án</h4><p style={{ margin: 0, color: theme.textDim, fontSize: '13px' }}>Đợi 5 giây (+15 SWGT)</p></div>
                        {tasks.shareTaskDone && <span style={{ color: theme.green, fontWeight: 'bold' }}>✅ Xong</span>}
                    </div>
                    {!tasks.shareTaskDone && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {!taskStarted.share ? <button onClick={() => startTask('share', `https://t.me/share/url?url=https://t.me/Dau_Tu_SWC_bot?start=${userId}`, 5)} style={{ flex: 1, backgroundColor: '#34C759', color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>MỞ CHIA SẺ</button>
                            : <button onClick={() => claimTaskApp('share')} disabled={taskTimers.share > 0} style={{ flex: 1, backgroundColor: taskTimers.share > 0 ? '#333' : theme.gold, color: taskTimers.share > 0 ? theme.textDim : '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: taskTimers.share > 0 ? 'not-allowed' : 'pointer' }}>{taskTimers.share > 0 ? `ĐỢI ${taskTimers.share}s` : 'NHẬN QUÀ'}</button>}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px dashed ${theme.blue}` }}>
                <h2 style={{ color: theme.blue, margin: '0 0 15px 0', fontSize: '16px' }}>🚀 Sắp Ra Mắt (Coming Soon)</h2>
                <ul style={{ margin: 0, paddingLeft: '20px', color: theme.textDim, fontSize: '14px', lineHeight: '1.8' }}>
                    <li><b>Vòng Quay Nhân Phẩm:</b> Dùng SWGT để quay thưởng Token/USDT hằng ngày.</li>
                    <li><b>Staking SWGT:</b> Gửi tiết kiệm SWGT nhận lãi suất qua đêm.</li>
                    <li><b>Đua Top Tháng:</b> Giải thưởng hiện vật cực khủng cho Top 3 người dẫn đầu bảng vàng.</li>
                </ul>
            </div>
        </div>
    );

    // ==================================================
    // TAB THU NHẬP
    // ==================================================
    const renderRewards = () => {
        let nextTarget = 3; let nextReward = "+10 SWGT";
        for (let m of MILESTONE_LIST) { if (referrals < m.req) { nextTarget = m.req; nextReward = `+${m.reward} SWGT`; break; } }
        let progressPercent = Math.min((referrals / nextTarget) * 100, 100);
        if (referrals >= 500) progressPercent = 100;

        return (
            <div style={{ padding: '0 20px 20px 20px', paddingBottom: '100px' }}>
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <div style={{ fontSize: '45px', marginBottom: '5px' }}>🎁</div>
                    <h2 style={{ color: theme.gold, margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900' }}>Trung Tâm Thu Nhập</h2>
                    <p style={{ color: theme.textDim, fontSize: '14px', margin: 0 }}>Xây dựng hệ thống - Tạo thu nhập thụ động</p>
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
                            let icon = '🔒'; if (isClaimed) icon = '✅'; else if (canClaim) icon = '🎁';
                            
                            const isHalvingMilestone = [10, 50, 120, 200, 350, 500].includes(m.req);
                            
                            return (
                                <div key={m.req} style={{ minWidth: '110px', backgroundColor: '#000', borderRadius: '10px', padding: '15px 10px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
                                    <p style={{ color: theme.textLight, fontSize: '13px', fontWeight: 'bold', margin: '0 0 2px 0' }}>Mốc {m.req}</p>
                                    <p style={{ color: theme.blue, fontSize: '11px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{m.rank}</p>
                                    <p style={{ color: theme.gold, fontSize: '12px', margin: '0 0 10px 0' }}>+{m.reward}{isHalvingMilestone ? '*' : ''}</p>
                                    <button onClick={() => handleClaimMilestone(m.req)} disabled={!canClaim} style={{ width: '100%', backgroundColor: isClaimed ? '#333' : (canClaim ? theme.green : '#333'), color: isClaimed ? theme.textDim : (canClaim ? '#fff' : theme.textDim), border: 'none', padding: '8px 0', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: canClaim ? 'pointer' : 'not-allowed' }}>
                                        {isClaimed ? 'ĐÃ NHẬN' : 'NHẬN'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: '0 0 15px 0', color: theme.textLight, fontSize: '16px' }}>🎟️ Nhập Mã Quà Tặng (Giftcode)</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input value={giftCodeInput} onChange={(e) => setGiftCodeInput(e.target.value)} placeholder="Nhập mã săn được từ Group..." style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `1px solid ${theme.green}`, backgroundColor: '#000', color: theme.gold, boxSizing: 'border-box', fontSize: '14px', textTransform: 'uppercase' }} />
                        <button onClick={handleClaimGiftCode} style={{ backgroundColor: theme.green, color: '#fff', padding: '0 20px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '14px', cursor: 'pointer' }}>NHẬN</button>
                    </div>
                </div>

                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: '0 0 15px 0', color: theme.textLight, fontSize: '16px' }}>🔗 Công cụ lan tỏa</h3>
                    <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '8px', color: theme.gold, fontSize: '15px', wordBreak: 'break-all', marginBottom: '15px', border: `1px dashed ${theme.border}` }}>
                        https://t.me/Dau_Tu_SWC_bot?start={userId || 'ref'}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleCopyLink} style={{ flex: 1, backgroundColor: theme.gold, color: '#000', padding: '14px 0', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '14px', cursor: 'pointer', textAlign: 'center' }}>📋 COPY LINK</button>
                        <a href={`https://t.me/share/url?url=https://t.me/Dau_Tu_SWC_bot?start=${userId}&text=Vào%20nhận%20ngay%20SWGT%20miễn%20phí%20từ%20hệ%20sinh%20thái%20công%20nghệ%20uST%20này%20anh%20em!`} target="_blank" rel="noreferrer" style={{ flex: 1, backgroundColor: '#5E92F3', color: '#fff', padding: '14px 0', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '14px', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✈️ GỬI BẠN BÈ</a>
                    </div>
                </div>

                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde047', padding: '12px', marginBottom: '20px', borderRadius: '6px' }}>
                    <h4 style={{ color: '#b45309', fontWeight: 'bold', margin: '0 0 5px 0', fontSize: '13px' }}>⏳ SỰ KIỆN HALVING SẮP DIỄN RA!</h4>
                    <p style={{ color: '#854d0e', margin: 0, fontSize: '12px', lineHeight: '1.5' }}>Khi Cộng đồng cán mốc <b>1.000 người</b>, phần thưởng tại các mốc sẽ tự động <b>GIẢM XUỐNG</b>. Hãy nhận thưởng ngay hôm nay!</p>
                </div>

                <h3 style={{color: '#fff', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '15px', fontSize: '16px'}}>🤝 BẢNG VÀNG GIỚI THIỆU</h3>
                
                {/* HIỂN THỊ CHUNG BẢNG XẾP HẠNG NHƯ TAB TRANG CHỦ */}
                {renderWealthBoard()}

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

    // ==================================================
    // CỬA HÀNG KHUNG VIỀN AVATAR (SHOP)
    // ==================================================
    const renderShop = () => (
        <div style={{ padding: '0 20px 20px 20px', paddingBottom: '100px' }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <div style={{ fontSize: '45px', marginBottom: '5px' }}>🛍️</div>
                <h2 style={{ color: theme.gold, margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900' }}>Cửa Hàng Avatar</h2>
                <p style={{ color: theme.textDim, fontSize: '14px', margin: 0 }}>Số dư: <b style={{color: theme.green}}>{balance} SWGT</b></p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {AVATAR_FRAMES.map((frame) => {
                    const isOwned = userProfile.ownedFrames.includes(frame.id);
                    const isActive = userProfile.activeFrame === frame.id;
                    
                    return (
                        <div key={frame.id} style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '15px', textAlign: 'center', border: `1px solid ${isActive ? theme.green : theme.border}`, position: 'relative' }}>
                            {isActive && <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '20px' }}>✅</div>}
                            
                            <div style={{ 
                                width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 15px auto', 
                                border: frame.border, boxShadow: frame.shadow, animation: frame.animation || 'none', padding: '2px', backgroundColor: '#333'
                            }}>
                                <img src={userProfile.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name || 'U')}&background=F4D03F&color=000&bold=true`} alt="preview" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            </div>
                            
                            <h4 style={{ margin: '0 0 5px 0', color: theme.textLight, fontSize: '14px' }}>{frame.name}</h4>
                            
                            {frame.price === -1 ? (
                                <p style={{ margin: '0 0 10px 0', color: '#00FFFF', fontSize: '12px', fontWeight: 'bold' }}>{frame.desc}</p>
                            ) : (
                                <p style={{ margin: '0 0 10px 0', color: theme.gold, fontSize: '13px', fontWeight: 'bold' }}>{frame.price} SWGT</p>
                            )}

                            <button 
                                onClick={() => handleBuyFrame(frame.id, frame.price)}
                                disabled={isActive || (frame.price === -1 && !isOwned)}
                                style={{ 
                                    width: '100%', padding: '8px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px',
                                    backgroundColor: isActive ? '#333' : isOwned ? theme.blue : (frame.price === -1 ? '#444' : theme.gold),
                                    color: isActive ? theme.textDim : isOwned ? '#fff' : (frame.price === -1 ? theme.textDim : '#000'),
                                    cursor: isActive || (frame.price === -1 && !isOwned) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isActive ? 'ĐANG DÙNG' : isOwned ? 'TRANG BỊ' : (frame.price === -1 ? 'QUAY GACHA' : 'MUA NGAY')}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // ==================================================
    // GIẢI TRÍ: RƯƠNG BÍ ẨN (THAO TÚNG TÂM LÝ 3.0)
    // ==================================================
    const renderGameZone = () => {

        const handlePickChest = (index) => {
            if (balance < 20) return alert("⚠️ Bạn cần ít nhất 20 SWGT để mua Búa Đập Rương!");
            if (isSpinning) return;

            setIsSpinning(true);
            setSpinResultMsg('');

            fetch(`${BACKEND_URL}/api/spin-wheel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    processGachaBoard(index, data.reward, data.newBalance);
                } else {
                    setIsSpinning(false);
                    alert(data.message);
                }
            })
            .catch(err => {
                console.error("Lỗi:", err);
                let fallbackReward = Math.random() > 0.8 ? 5 : 0;
                processGachaBoard(index, fallbackReward, balance - 20 + fallbackReward);
            });
        };

        const processGachaBoard = (index, actualReward, newBalance) => {
            setSpinCount(prev => prev >= MAX_PITY ? 0 : prev + 1);

            let pool = [0, 0, 5, 5, 10, 20]; 
            
            if (actualReward !== 500) pool.push(500); else pool.push(0);
            
            let finalRewardVisual = actualReward;
            if (actualReward === 0 && Math.random() < 0.15) {
                finalRewardVisual = -2; // Tráo thành Mảnh Khung
            }

            if (finalRewardVisual !== -2) pool.push(-2); else pool.push(50);
            pool = pool.sort(() => Math.random() - 0.5);

            let newBoard = Array(9).fill(null);
            let poolIndex = 0;
            for(let i=0; i<9; i++) {
                if (i === index) {
                    newBoard[i] = { isOpened: true, reward: finalRewardVisual, isMine: true };
                } else {
                    newBoard[i] = { isOpened: false, reward: pool[poolIndex], isMine: false };
                    poolIndex++;
                }
            }

            setChestBoard(newBoard);

            setTimeout(() => {
                const revealedBoard = newBoard.map(c => ({ ...c, isOpened: true }));
                setChestBoard(revealedBoard);
                
                setTimeout(() => {
                    setBalance(newBalance);
                    
                    const playerName = (userProfile.name || 'Bạn').split(' ')[0];
                    
                    let boxType = ''; let boxLabel = '';
                    if (finalRewardVisual === -2) { boxType = 'frame'; boxLabel = '✨ RƯƠNG HUYỀN BÍ'; }
                    else if (finalRewardVisual === 0) { boxType = 'coal'; boxLabel = '💣 THAN ĐÁ (XỊT)'; }
                    else if (finalRewardVisual <= 10) { boxType = 'wood'; boxLabel = '📦 RƯƠNG GỖ'; }
                    else if (finalRewardVisual <= 50) { boxType = 'silver'; boxLabel = '🎁 RƯƠNG BẠC'; }
                    else { boxType = 'gold'; boxLabel = '💎 RƯƠNG KIM CƯƠNG'; }

                    setBoxModal({ show: true, type: boxType, label: boxLabel, reward: finalRewardVisual, status: 'closed', isFrame: finalRewardVisual === -2 });

                    if (finalRewardVisual === -2) {
                        if (!userProfile.ownedFrames.includes('light')) {
                            setUserProfile(prev => ({ ...prev, ownedFrames: [...prev.ownedFrames, 'light'] }));
                        }
                        setSpinResultMsg('🎉 BÙM! Trúng Mảnh Khung Ánh Sáng siêu hiếm!');
                    } else if (finalRewardVisual === 0) {
                        setSpinResultMsg(`Trời ơi ${playerName}! Rương 500 nằm ngay bên kia kìa!`);
                    } else if (finalRewardVisual >= 500) {
                        setSpinResultMsg(`🏆 ĐẠI CÁT ĐẠI LỢI! NỔ HŨ LỚN!`);
                    } else {
                        setSpinResultMsg(`Thu về +${finalRewardVisual} SWGT. Đập phát nữa nổ hũ to hơn nào!`);
                    }
                    
                    setIsSpinning(false);
                    setTimeout(() => setChestBoard(Array(9).fill({ isOpened: false, reward: null, isMine: false })), 2500);
                }, 1500); 
            }, 1000);
        };

        const handleOpenBox = () => {
            setBoxModal(prev => ({ ...prev, status: 'opening' }));
            setTimeout(() => {
                setBoxModal(prev => ({ ...prev, status: 'opened' }));
                if (boxModal.reward === 0) {
                    setTimeout(() => setShowRevengePopup(true), 1500);
                }
            }, 1500); 
        };

        return (
            <div style={{ padding: '0 20px 20px 20px', paddingBottom: '100px', textAlign: 'center' }}>
                <h2 style={{ color: theme.gold, margin: '0 0 5px 0', fontSize: '24px', fontWeight: '900' }}>🗝️ Chọn Rương Bí Ẩn</h2>
                <p style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 15px 0' }}>Mua 1 Búa lật rương: <b style={{color: theme.red}}>20 SWGT</b></p>

                <div style={{ backgroundColor: '#000', borderRadius: '10px', padding: '12px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: theme.textLight, fontWeight: 'bold' }}>⚡ Năng lượng Nổ Hũ</span>
                        <span style={{ fontSize: '12px', color: theme.gold, fontWeight: 'bold' }}>{spinCount} / {MAX_PITY}</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: '#222', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${(spinCount / MAX_PITY) * 100}%`, height: '100%', backgroundColor: theme.gold, transition: 'width 0.3s' }}></div>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: theme.textDim, fontStyle: 'italic' }}>
                        Chỉ còn <b>{MAX_PITY - spinCount}</b> búa nữa <b style={{color: theme.green}}>CHẮC CHẮN</b> rớt Rương Kim Cương 500 SWGT.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', maxWidth: '320px', margin: '0 auto', marginBottom: '20px' }}>
                    {chestBoard.map((chest, i) => {
                        let content = '📦'; let textColor = '#fff'; let bgItem = theme.gold;

                        if (chest.isOpened) {
                            bgItem = '#1A1A1A';
                            if (chest.reward === 500) { content = '💎 500'; textColor = theme.gold; }
                            else if (chest.reward === -2) { content = '🧩 Khung'; textColor = '#00FFFF'; }
                            else if (chest.reward > 0) { content = `💰 +${chest.reward}`; textColor = theme.green; }
                            else { content = '💣 Xịt'; textColor = theme.red; }
                        }

                        return (
                            <div 
                                key={i} 
                                onClick={() => !chest.isOpened && handlePickChest(i)}
                                style={{ 
                                    height: '90px', backgroundColor: bgItem, borderRadius: '15px', 
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                                    fontSize: chest.isOpened ? '16px' : '40px', fontWeight: '900', color: textColor,
                                    cursor: isSpinning ? 'not-allowed' : 'pointer',
                                    border: chest.isMine ? `3px solid ${theme.green}` : `2px solid ${chest.isOpened ? '#333' : '#b49010'}`,
                                    boxShadow: chest.isMine ? '0 0 15px rgba(52, 199, 89, 0.6)' : (chest.isOpened ? 'none' : '0 4px 0 #b49010'),
                                    transition: 'all 0.3s ease',
                                    opacity: chest.isOpened && !chest.isMine ? 0.6 : 1
                                }}
                            >
                                {content}
                            </div>
                        );
                    })}
                </div>

                <div style={{ minHeight: '40px', marginBottom: '20px', padding: '10px', backgroundColor: 'rgba(244, 208, 63, 0.1)', borderRadius: '10px' }}>
                    <p style={{ color: (spinResultMsg || '').includes('500') || (spinResultMsg || '').includes('Trời ơi') ? theme.textLight : theme.green, fontSize: '14px', fontWeight: 'bold', margin: 0 }}>
                        {spinResultMsg || '👇 Chạm vào 1 rương bất kỳ để mở!'}
                    </p>
                </div>

                {/* MODAL MỞ HỘP */}
                {boxModal.show && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998, padding: '20px' }}>
                        <div style={{ backgroundColor: theme.cardBg, border: `2px solid ${boxModal.type === 'gold' ? theme.gold : boxModal.type === 'frame' ? '#00FFFF' : theme.border}`, borderRadius: '20px', padding: '30px 20px', textAlign: 'center', width: '100%', maxWidth: '350px' }}>
                            
                            {boxModal.status === 'closed' && (
                                <>
                                    <h2 style={{ color: theme.textLight, margin: '0 0 10px 0', fontSize: '18px' }}>BẠN VỪA CÂU ĐƯỢC</h2>
                                    <h1 style={{ color: boxModal.type === 'gold' ? theme.gold : boxModal.type === 'frame' ? '#00FFFF' : theme.blue, margin: '0 0 20px 0', fontSize: '24px', fontWeight: '900' }}>{boxModal.label}</h1>
                                    <div style={{ fontSize: '80px', marginBottom: '20px' }}>{boxModal.type === 'coal' ? '💣' : boxModal.type === 'gold' ? '💎' : boxModal.type === 'frame' ? '🧩' : '📦'}</div>
                                    <button onClick={handleOpenBox} style={{ width: '100%', padding: '15px', borderRadius: '10px', backgroundColor: theme.green, color: '#fff', border: 'none', fontWeight: '900', fontSize: '16px', cursor: 'pointer', animation: 'pulseRed 1.5s infinite' }}>BẤM ĐỂ MỞ KHÓA</button>
                                </>
                            )}

                            {boxModal.status === 'opening' && (
                                <div>
                                    <div style={{ fontSize: '80px', animation: 'shake 0.5s infinite' }}>{boxModal.type === 'coal' ? '💣' : boxModal.type === 'gold' ? '💎' : boxModal.type === 'frame' ? '🧩' : '📦'}</div>
                                    <p style={{ color: theme.textDim, fontWeight: 'bold', marginTop: '20px' }}>Đang giải mã từ trường...</p>
                                </div>
                            )}

                            {boxModal.status === 'opened' && (
                                <>
                                    {boxModal.isFrame ? (
                                        <>
                                            <h2 style={{ color: '#00FFFF', fontSize: '22px', margin: '0 0 10px 0', fontWeight: '900' }}>NHẬN: KHUNG ÁNH SÁNG!</h2>
                                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 20px auto', border: getFrameStyle('light').border, boxShadow: getFrameStyle('light').shadow, padding: '2px', backgroundColor: '#333' }}>
                                                <img src={userProfile.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name || 'U')}&background=F4D03F&color=000&bold=true`} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                            </div>
                                            <p style={{ color: theme.textDim, fontSize: '14px', marginBottom: '25px' }}>Siêu hiếm! Hãy vào Cửa hàng để trang bị ngay.</p>
                                        </>
                                    ) : (
                                        <>
                                            <h2 style={{ color: boxModal.reward > 0 ? theme.green : theme.red, fontSize: '28px', margin: '0 0 10px 0', fontWeight: '900' }}>
                                                {boxModal.reward > 0 ? `+${boxModal.reward} SWGT` : 'TRẮNG TAY!'}
                                            </h2>
                                            <p style={{ color: theme.textDim, fontSize: '14px', marginBottom: '25px' }}>
                                                {boxModal.reward >= 500 ? 'ĐẠI CÁT ĐẠI LỢI! NỔ HŨ TRÚNG MÁNH LỚN!' : boxModal.reward > 0 ? 'Có lộc là vui rồi! Đập thêm rương xịn hơn nào.' : 'Trượt sát nút ô 500. Cay thật! Đập lại ngay!'}
                                            </p>
                                        </>
                                    )}
                                    <button onClick={() => setBoxModal({ ...boxModal, show: false })} style={{ width: '100%', padding: '14px', borderRadius: '10px', backgroundColor: '#333', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Đóng</button>
                                </>
                            )}
                        </div>
                    </div>
                )}
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
                
                <input type="number" placeholder="Nhập số SWGT muốn rút..." value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: '#000', color: theme.textLight, boxSizing: 'border-box', marginBottom: '15px', fontSize: '15px', textAlign: 'center' }} />
                <button onClick={handleWithdraw} style={{ width: '100%', backgroundColor: balance >= 300 ? theme.green : '#333', color: balance >= 300 ? '#fff' : theme.textDim, padding: '16px', borderRadius: '12px', fontWeight: 'bold', border: 'none', fontSize: '16px', cursor: balance >= 300 ? 'pointer' : 'not-allowed', boxShadow: balance >= 300 ? '0 4px 15px rgba(52, 199, 89, 0.3)' : 'none' }}>
                    {balance >= 300 ? '💸 XÁC NHẬN RÚT TIỀN' : '🔒 CẦN TỐI THIỂU 500 SWGT'}
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
                    <button onClick={() => setWithdrawMethod('gate')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${withdrawMethod === 'gate' ? theme.green : theme.border}`, backgroundColor: withdrawMethod === 'gate' ? 'rgba(52, 199, 89, 0.1)' : '#000', color: withdrawMethod === 'gate' ? theme.green : theme.textDim, fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', transition: 'all 0.3s' }}>Gate.io (Miễn phí)</button>
                    <button onClick={() => setWithdrawMethod('erc20')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${withdrawMethod === 'erc20' ? theme.red : theme.border}`, backgroundColor: withdrawMethod === 'erc20' ? 'rgba(255, 59, 48, 0.1)' : '#000', color: withdrawMethod === 'erc20' ? theme.red : theme.textDim, fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', transition: 'all 0.3s' }}>Ví ERC20 (-70 SWGT)</button>
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
                                <button onClick={() => window.open('https://telegra.ph/H%C6%B0%E1%BB%9Bng-d%E1%BA%ABn-%C4%91%C4%83ng-k%C3%BD--t%E1%BA%A1o-m%E1%BB%9Bi-t%C3%A0i-kho%E1%BA%A3n-Gateio-to%C3%A0n-t%E1%BA%ADp-02-22', '_blank')} style={{ width: '100%', backgroundColor: theme.blue, color: '#fff', padding: '12px', borderRadius: '8px', fontWeight: 'bold', border: 'none', fontSize: '13px', cursor: 'pointer', marginTop: '15px' }}>📖 HƯỚNG DẪN TẠO VÍ GATE.IO</button>
                            </div>
                        </div>
                        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="1. Họ tên" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: '#000', color: theme.textLight, boxSizing: 'border-box', marginBottom: '10px', fontSize: '14px' }} />
                        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="2. Gmail" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: '#000', color: theme.textLight, boxSizing: 'border-box', marginBottom: '10px', fontSize: '14px' }} />
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="3. Số điện thoại" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: '#000', color: theme.textLight, boxSizing: 'border-box', marginBottom: '15px', fontSize: '14px' }} />
                        <input value={gatecode} onChange={(e) => setGatecode(e.target.value)} placeholder="Dán Gatecode / UID Gate.io tại đây..." style={{ width: '100%', padding: '14px', borderRadius: '8px', border: `1px solid ${theme.green}`, backgroundColor: '#000', color: theme.gold, boxSizing: 'border-box', marginBottom: '15px', fontSize: '14px' }} />
                    </div>
                )}

                {withdrawMethod === 'erc20' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ backgroundColor: 'rgba(255, 59, 48, 0.1)', border: `1px dashed ${theme.red}`, padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                            <p style={{ margin: '0 0 5px 0', color: theme.red, fontSize: '14px', fontWeight: 'bold' }}>⚠️ CHÚ Ý QUAN TRỌNG:</p>
                            <p style={{ margin: 0, color: theme.red, fontSize: '13px', lineHeight: '1.5' }}>Phí rút tiền qua mạng lưới <b>Ethereum (ERC20)</b> là <b>70 SWGT</b>. Nhập sai mạng lưới sẽ mất tài sản vĩnh viễn!</p>
                        </div>
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
                @keyframes pulseRed { 0% { box-shadow: 0 0 10px #FF3B30; } 50% { box-shadow: 0 0 35px #FF3B30; } 100% { box-shadow: 0 0 10px #FF3B30; } }
                @keyframes shake { 0% { transform: translate(1px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -2px) rotate(-1deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 30% { transform: translate(3px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 70% { transform: translate(3px, 1px) rotate(-1deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 90% { transform: translate(1px, 2px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
                ::-webkit-scrollbar { height: 6px; }
                ::-webkit-scrollbar-track { background: #1C1C1E; border-radius: 10px; }
                ::-webkit-scrollbar-thumb { background: #F4D03F; border-radius: 10px; }
            `}</style>
            
            {renderHeader()}
            
            <div style={{ marginTop: '10px' }}>
                {activeTab === 'home' && renderHome()}
                {activeTab === 'rewards' && renderRewards()}
                {activeTab === 'game' && renderGameZone()}
                {activeTab === 'shop' && renderShop()}
                {activeTab === 'wallet' && renderWallet()}
            </div>

            {/* THANH ĐIỀU HƯỚNG DƯỚI ĐÁY CHUẨN 5 NÚT */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: theme.cardBg, borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-around', padding: '15px 0', paddingBottom: 'calc(15px + env(safe-area-inset-bottom))', zIndex: 100 }}>
                <div onClick={() => setActiveTab('home')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'home' ? theme.gold : theme.textDim, width: '20%', cursor: 'pointer' }}>
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏠</div><span style={{ fontSize: '11px', fontWeight: 'bold' }}>TRANG CHỦ</span>
                </div>
                <div onClick={() => setActiveTab('rewards')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'rewards' ? theme.gold : theme.textDim, width: '20%', cursor: 'pointer' }}>
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>🎁</div><span style={{ fontSize: '11px', fontWeight: 'bold' }}>THU NHẬP</span>
                </div>
                <div onClick={() => setActiveTab('game')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'game' ? theme.gold : theme.textDim, width: '20%', cursor: 'pointer' }}>
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>🎰</div><span style={{ fontSize: '11px', fontWeight: 'bold' }}>RƯƠNG MÙ</span>
                </div>
                <div onClick={() => setActiveTab('shop')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'shop' ? theme.gold : theme.textDim, width: '20%', cursor: 'pointer' }}>
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>🛍️</div><span style={{ fontSize: '11px', fontWeight: 'bold' }}>CỬA HÀNG</span>
                </div>
                <div onClick={() => setActiveTab('wallet')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'wallet' ? theme.gold : theme.textDim, width: '20%', cursor: 'pointer' }}>
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>👛</div><span style={{ fontSize: '11px', fontWeight: 'bold' }}>VÍ</span>
                </div>
            </div>

            {/* BẢNG POP-UP KHIÊU KHÍCH PHỤC THÙ */}
            {showRevengePopup && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
                    <div style={{ backgroundColor: theme.cardBg, border: `2px solid ${theme.red}`, borderRadius: '15px', padding: '25px', textAlign: 'center', animation: 'pulseRed 1.2s infinite' }}>
                        <div style={{ fontSize: '50px', marginBottom: '10px' }}>🤬</div>
                        <h2 style={{ color: theme.textLight, margin: '0 0 10px 0', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase' }}>CAY CHƯA? ĐẬP LẠI NGAY!</h2>
                        <p style={{ color: theme.textDim, fontSize: '14px', marginBottom: '25px', lineHeight: '1.5' }}>Trời ơi, rương 500 SWGT nằm ngay sát bên cạnh! Thanh năng lượng sắp đầy rồi, nạp thêm tiền và đập cho bằng được!</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowRevengePopup(false)} style={{ flex: 1, padding: '14px', borderRadius: '10px', backgroundColor: '#333', color: theme.textDim, border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Bỏ Cuộc</button>
                            <button onClick={() => { setShowRevengePopup(false); setActiveTab('wallet'); }} style={{ flex: 1, padding: '14px', borderRadius: '10px', backgroundColor: theme.red, color: '#fff', border: 'none', fontWeight: '900', cursor: 'pointer', boxShadow: `0 4px 15px rgba(255, 59, 48, 0.4)` }}>💸 NẠP TIỀN ĐẬP TIẾP</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
