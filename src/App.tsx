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
    
    const [bankName, setBankName] = useState('');
    const [accountName, setAccountName] = useState(''); 
    const [bankAccount, setBankAccount] = useState('');

    const [referrals, setReferrals] = useState(0); 
    const [withdrawAmount, setWithdrawAmount] = useState(''); 
    
    const [checkInStreak, setCheckInStreak] = useState(0);
    const [milestones, setMilestones] = useState<any>({});
    
    const [giftCodeInput, setGiftCodeInput] = useState('');

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

    const [eventTimeLeft, setEventTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    // State cho Rương Bí Ẩn
    const [isShaking, setIsShaking] = useState(false);
    const [openedReward, setOpenedReward] = useState<{type: string, name: string} | null>(null);

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

    const STREAK_REWARDS = [0.25, 0.75, 1.5, 1.75, 2.5, 3.5, 4.5];

    const triggerFloatAnim = (reward: string | number, x: number, y: number) => {
        const newAnim = { id: Date.now() + Math.random(), text: `+${reward} SWGT`, x, y };
        setAnimations(prev => [...prev, newAnim]);
        setTimeout(() => {
            setAnimations(prev => prev.filter(a => a.id !== newAnim.id));
        }, 1000);
    };

    useEffect(() => {
        const calculateNextSunday = () => {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
            const nextSunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday);
            nextSunday.setHours(23, 59, 59, 999);
            return nextSunday.getTime();
        };

        const targetTime = calculateNextSunday();

        const eventInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetTime - now;

            if (distance <= 0) {
                setEventTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
            } else {
                setEventTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    secs: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(eventInterval);
    }, []);

    useEffect(() => {
        if (!unlockDateMs) return;
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = unlockDateMs - now;
            
            if (distance <= 0 || balance >= 500) {
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
        if (!isUnlocked) { 
            return alert(`⏳ Bạn chưa hết thời gian mở khóa (${lockDaysLimit} ngày). Cày lên 500 SWGT để hệ thống mở khóa ngay nhé!`); 
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

    const handleLiquidateVND = (vndAmount: string, isEligible: boolean) => {
        if (!isEligible) return alert("⚠️ Số dư quy đổi chưa đạt tối thiểu 5.000 VNĐ.");
        if (!bankName || !bankAccount || !accountName) return alert("⚠️ Vui lòng nhập Tên Ngân Hàng, Chủ Tài Khoản và Số Tài Khoản để nhận tiền!");
        if (window.confirm(`Xác nhận thanh lý ${balance} SWGT để nhận ${vndAmount} VNĐ về tài khoản ngân hàng?`)) {
            fetch(`${BACKEND_URL}/api/liquidate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, vndAmount, bankName, accountName, bankAccount }) 
            }).then(res => res.json()).then(data => {
                if(data.success) {
                    setBalance(data.balance); setBankName(''); setBankAccount(''); setAccountName('');
                    alert(`✅ Lệnh thanh khoản đã gửi! Vui lòng chờ Admin chuyển khoản cho bạn.`);
                } else { alert(data.message); }
            });
        }
    };

    const handleTopUp = (usdtAmount: string, vndAmount: string) => {
        if (window.confirm(`Bạn muốn nộp thêm số tiền tương đương ${usdtAmount} USDT để đủ 500 SWGT rút Token về ví?`)) {
            fetch(`${BACKEND_URL}/api/topup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, usdtAmount, vndAmount }) 
            }).then(res => res.json()).then(data => {
                if(data.success) {
                    alert(`✅ Yêu cầu đã ghi nhận! Bot Telegram vừa gửi tin nhắn hướng dẫn thanh toán cho bạn.`);
                }
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
        
        let finalEmail = "";
        if (itemName.includes('Ebook') || itemName.includes('Audio') || itemName.includes('Combo') || itemName.includes('Gói')) {
            const promptInput = window.prompt(`📧 Nhập địa chỉ Gmail của bạn để Admin gửi tài liệu [${itemName}]:`);
            if (promptInput === null) return; 
            if (!promptInput.trim() || !promptInput.includes('@')) {
                return alert("⚠️ Địa chỉ Gmail không hợp lệ. Vui lòng thao tác lại!");
            }
            finalEmail = promptInput.trim();
        }

        if (window.confirm(`Xác nhận dùng ${cost} SWGT để đổi lấy [${itemName}]?`)) {
            fetch(`${BACKEND_URL}/api/redeem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, itemName, cost, email: finalEmail })
            }).then(res => res.json()).then(data => {
                if(data.success) { 
                    setBalance(data.balance); 
                    alert("🎉 Đổi thưởng thành công! Admin sẽ gửi tài liệu qua Gmail và Bot Telegram cho bạn sớm nhất."); 
                }
            });
        }
    };

    // --- HÀM MỞ RƯƠNG BÍ ẨN ĐÃ FIX LỖI TÊN QUÀ ---
    const handleOpenChest = () => {
        if (balance < 20) return alert("⚠️ Bạn cần tối thiểu 20 SWGT để mua búa đập rương!");
        setIsShaking(true);
        setOpenedReward(null);

        fetch(`${BACKEND_URL}/api/spin-wheel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        })
        .then(res => res.json())
        .then(data => {
            setTimeout(() => {
                setIsShaking(false);
                if (data.success) {
                    setBalance(data.newBalance);
                    // Dùng thủ thuật Fallback: Nếu backend cũ trả về, tự map tên quà
                    setOpenedReward({ 
                        type: data.rewardType || (data.reward > 0 ? 'swgt' : 'none'), 
                        name: data.rewardName || (data.reward > 0 ? `${data.reward} SWGT` : 'Chúc bạn may mắn lần sau!') 
                    });
                } else {
                    alert(data.message || "❌ Có lỗi xảy ra, không thể mở rương!");
                }
            }, 1500); 
        })
        .catch(() => {
            setIsShaking(false);
            alert("⚠️ Lỗi kết nối mạng!");
        });
    };

    const renderHeader = () => {
        const isFireEffect = (Number(userId || 1) % 2) !== 0; 
        const effectColor = isFireEffect ? '#FF3B30' : '#00FFFF'; 
        const pulseAnim = isFireEffect ? 'pulseGlowRed 2s infinite' : 'pulseGlowCyan 2s infinite';
        
        const militaryRank = getMilitaryRank(referrals);

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

    const renderWealthBoard = () => {
        const dummyUsers = [
            { firstName: 'Vũ', lastName: 'Dũng', referralCount: 65, weeklyReferralCount: 12 },
            { firstName: 'Mai', lastName: 'Thiều Thị', referralCount: 60, weeklyReferralCount: 10 },
            { firstName: 'LINH', lastName: 'NGUYEN', referralCount: 47, weeklyReferralCount: 8 },
            { firstName: 'Minh', lastName: 'Ngọc Hoàng', referralCount: 33, weeklyReferralCount: 5 },
            { firstName: 'PHƯƠNG', lastName: 'ANH PHÙNG', referralCount: 27, weeklyReferralCount: 4 },
            { firstName: 'Nông', lastName: 'Mao', referralCount: 12, weeklyReferralCount: 3 },
            { firstName: 'Support', lastName: '', referralCount: 11, weeklyReferralCount: 2 },
            { firstName: 'OSAKA', lastName: 'CHAU HUYNH', referralCount: 10, weeklyReferralCount: 1 },
            { firstName: 'Trinh', lastName: 'Lê', referralCount: 9, weeklyReferralCount: 1 },
            { firstName: 'Lý', lastName: 'Hà', referralCount: 8, weeklyReferralCount: 0 }
        ];

        let displayData = [...leaderboard];
        if (displayData.length < 10) displayData = [...displayData, ...dummyUsers.slice(0, 10 - displayData.length)];

        const sortedData = displayData.map(u => ({
            ...u,
            displayCount: boardType === 'weekly' ? (u.weeklyReferralCount || 0) : u.referralCount,
            displayTotal: boardType === 'weekly' 
                ? (u.weeklyReferralCount || 0) * 5 
                : (u.referralCount * 15) + 350
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

                {sortedData.slice(0, 10).map((user, index) => {
                    const isMe = `${user.firstName} ${user.lastName}`.trim() === userProfile.name.trim();
                    const rankTitle = getMilitaryRank(user.referralCount);
                    let icon = "💸"; let topColor = theme.textDim; let topBg = "transparent"; let topBorder = "transparent";
                    
                    if (index === 0) { icon = "👑"; topColor = theme.gold; topBg = 'rgba(244, 208, 63, 0.1)'; topBorder = theme.gold; }
                    else if (index === 1) { icon = "💎"; topColor = '#C0C0C0'; topBg = 'rgba(192, 192, 192, 0.1)'; topBorder = '#C0C0C0'; }
                    else if (index === 2) { icon = "🌟"; topColor = '#CD7F32'; topBg = 'rgba(205, 127, 50, 0.1)'; topBorder = '#CD7F32'; }
                    else { topBorder = theme.border; }

                    return (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 10px', borderBottom: index < sortedData.length - 1 ? `1px solid ${theme.border}` : 'none', backgroundColor: isMe ? 'rgba(244, 208, 63, 0.05)' : 'transparent', borderRadius: '8px', marginBottom: '4px' }}>
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
                                <span>{user.displayTotal} <span style={{ fontSize: '12px', color: theme.textDim, fontWeight: 'normal' }}>SWGT</span></span>
                                <span style={{fontSize: '11px', color: theme.gold}}>({user.displayCount} người)</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        );
    };

    const renderHome = () => (
        <div style={{ padding: '0 20px 20px 20px' }}>
            
            {/* ĐỒNG HỒ ĐẾM NGƯỢC FOMO */}
            <div style={{ backgroundColor: 'rgba(255, 59, 48, 0.1)', border: `1px dashed ${theme.red}`, borderRadius: '15px', padding: '20px', textAlign: 'center', marginBottom: '20px', animation: 'pulseGlowRed 2s infinite' }}>
                <h3 style={{ margin: '0 0 10px 0', color: theme.red, fontSize: '16px', fontWeight: '900', textTransform: 'uppercase' }}>
                    🚨 CẢNH BÁO: ĐÓNG CỔNG KHAI THÁC SWGT MIỄN PHÍ
                </h3>
                <p style={{ margin: '0 0 15px 0', color: theme.textLight, fontSize: '13px', lineHeight: '1.5' }}>
                    99% Tổng cung Airdrop đã được khai thác. Hệ thống sẽ chính thức đóng cổng khai thác vào <b style={{color: theme.gold}}>23:59 Chủ Nhật Tuần Này!</b>
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <div style={{ padding: '10px 12px', backgroundColor: theme.red, borderRadius: '8px', color: '#fff', fontWeight: '900', fontSize: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {eventTimeLeft.days} <span style={{fontSize:'10px', fontWeight:'normal', textTransform:'uppercase'}}>Ngày</span>
                    </div>
                    <div style={{ padding: '10px 12px', backgroundColor: theme.red, borderRadius: '8px', color: '#fff', fontWeight: '900', fontSize: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {eventTimeLeft.hours} <span style={{fontSize:'10px', fontWeight:'normal', textTransform:'uppercase'}}>Giờ</span>
                    </div>
                    <div style={{ padding: '10px 12px', backgroundColor: theme.red, borderRadius: '8px', color: '#fff', fontWeight: '900', fontSize: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {eventTimeLeft.mins} <span style={{fontSize:'10px', fontWeight:'normal', textTransform:'uppercase'}}>Phút</span>
                    </div>
                    <div style={{ padding: '10px 12px', backgroundColor: '#333', borderRadius: '8px', color: theme.gold, fontWeight: '900', fontSize: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {eventTimeLeft.secs} <span style={{fontSize:'10px', fontWeight:'normal', textTransform:'uppercase'}}>Giây</span>
                    </div>
                </div>
            </div>

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
                    style={{ width: '100%', backgroundColor: isCheckedInToday ? '#333' : theme.green, color: isCheckedInToday ? theme.textDim : '#fff', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: isCheckedInToday ? 'not-allowed' : 'pointer', fontSize: '15px', transition: 'all 0.3s' }}
                >
                    {isCheckedInToday ? "✅ ĐÃ NHẬN HÔM NAY" : "✋ BẤM ĐIỂM DANH NGAY"}
                </button>
            </div>

            {/* KHỐI HƯỚNG DẪN CỘNG ĐỒNG */}
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.textLight, margin: '0 0 15px 0', fontSize: '18px' }}>🎯 Hướng dẫn Xây Dựng Hệ Thống</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '14px', lineHeight: '1.6' }}>
                        <span style={{color: theme.textLight, fontWeight:'bold'}}>1️⃣ Trở thành Cổ đông uST</span><br/>
                        Chỉ bằng việc mời bạn bè tham gia Bot SWC, bạn sẽ nhận được SWGT Token để quy đổi Cổ phần.
                    </p>
                    <p style={{ margin: 0, color: theme.textDim, fontSize: '14px', lineHeight: '1.6' }}>
                        <span style={{color: theme.textLight, fontWeight:'bold'}}>2️⃣ Chặng Nước Rút</span><br/>
                        Sự kiện Airdrop miễn phí sẽ kết thúc vào Chủ Nhật tuần này. Tận dụng mọi thời gian để đua Top Leader!
                    </p>
                    <div style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)', border: `1px dashed ${theme.green}`, padding: '15px', borderRadius: '10px' }}>
                        <p style={{ margin: 0, color: theme.green, fontSize: '14px', lineHeight: '1.6' }}>
                            <span style={{fontWeight:'bold'}}>💬 MẸO: Tương tác kiếm thêm điểm</span><br/>Mỗi tin nhắn bạn chat trong Nhóm Thảo Luận (từ 10 ký tự trở lên) tự động cộng <b style={{color: theme.gold}}>+0.1 SWGT</b>. Chat càng nhiều, tiền càng nhiều!
                        </p>
                    </div>
                </div>
            </div>
            
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.gold, margin: '0 0 15px 0', fontSize: '18px' }}>💎 Cơ Cấu Phần Thưởng SWGT</h2>
                <div style={{ color: theme.textDim, fontSize: '14px', margin: '0 0 10px 0', lineHeight: '1.6' }}>
                    <p style={{ margin: 0 }}>Khách hoàn thành nhiệm vụ Tân Binh: <span style={{color: theme.gold, fontWeight:'bold'}}>+5 SWGT/người</span></p>
                </div>
                
                <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '12px', marginTop: '15px', borderRadius: '6px' }}>
                    <h4 style={{ color: '#991b1b', fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '14px' }}>
                        ⚠️ CHÍNH SÁCH CHỐNG GIAN LẬN (RADAR 24/7)
                    </h4>
                    <p style={{ color: '#b91c1c', margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                        1. Tài khoản ảo/mới tạo sẽ bị giam tiền <b>30 ngày</b>.<br/>
                        2. Bắt buộc duy trì trong Group tối thiểu <b>21 ngày</b>. Rời nhóm = <b>THU HỒI TOÀN BỘ!</b>
                    </p>
                </div>
            </div>
        </div>
    );

    const renderGame = () => {
        return (
            <div style={{ padding: '0 20px 20px 20px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '10px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '5px' }}>🏴‍☠️</div>
                    <h2 style={{ color: theme.gold, margin: '0 0 5px 0', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase' }}>Đảo Kho Báu</h2>
                    <p style={{ color: theme.textDim, fontSize: '13px', margin: 0, padding: '0 20px' }}>Dùng 20 SWGT để mua búa đập rương. Có cơ hội trúng ngay Sách, Audio hoặc 50 SWGT tiền mặt!</p>
                </div>

                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '30px 20px', width: '100%', boxSizing: 'border-box', border: `1px solid ${theme.border}`, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    
                    {/* KHỐI HIỂN THỊ RƯƠNG HOẶC QUÀ */}
                    {!openedReward ? (
                        <>
                            <div className={isShaking ? "chest-shake" : ""} style={{ fontSize: '100px', margin: '20px 0', textShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>
                                🧰
                            </div>
                            <p style={{ color: theme.textLight, fontSize: '15px', fontWeight: 'bold', marginBottom: '20px' }}>{isShaking ? "Đang mở khóa..." : "Rương Bí Ẩn"}</p>
                            
                            <button 
                                onClick={handleOpenChest} 
                                disabled={isShaking}
                                style={{ width: '100%', backgroundColor: isShaking ? '#333' : theme.gold, color: isShaking ? theme.textDim : '#000', padding: '16px', borderRadius: '12px', fontWeight: '900', border: 'none', fontSize: '16px', cursor: isShaking ? 'not-allowed' : 'pointer', boxShadow: isShaking ? 'none' : '0 4px 15px rgba(244, 208, 63, 0.4)', transition: 'all 0.3s' }}
                            >
                                {isShaking ? "⏳ ĐANG ĐẬP RƯƠNG..." : "🔨 ĐẬP RƯƠNG (20 SWGT)"}
                            </button>
                        </>
                    ) : (
                        <div className="pop-in" style={{ padding: '10px 0' }}>
                            <div style={{ fontSize: '70px', marginBottom: '15px' }}>
                                {openedReward.type === 'none' ? '😢' : (openedReward.type === 'swgt' ? '💸' : '🎁')}
                            </div>
                            
                            {/* KHUNG HIỂN THỊ TÊN QUÀ CỰC ĐẸP ĐÃ FIX LỖI TÀNG HÌNH CHỮ */}
                            {openedReward.type !== 'none' ? (
                                <div style={{ backgroundColor: openedReward.type === 'swgt' ? 'rgba(244, 208, 63, 0.15)' : 'rgba(52, 199, 89, 0.15)', border: `1px dashed ${openedReward.type === 'swgt' ? theme.gold : theme.green}`, padding: '10px 20px', borderRadius: '10px', margin: '0 auto 15px auto', display: 'inline-block' }}>
                                    <h3 style={{ color: openedReward.type === 'swgt' ? theme.gold : theme.green, margin: 0, fontSize: '20px', fontWeight: '900' }}>
                                        {openedReward.name}
                                    </h3>
                                </div>
                            ) : (
                                <h3 style={{ color: theme.textDim, margin: '0 0 15px 0', fontSize: '20px', fontWeight: '900' }}>
                                    {openedReward.name}
                                </h3>
                            )}

                            <p style={{ color: theme.textLight, fontSize: '13px', margin: '0 0 25px 0', lineHeight: '1.5', padding: '0 10px' }}>
                                {openedReward.type === 'none' ? "Rất tiếc, rương trống không! Hãy thử lại vận may nhé." 
                                : (openedReward.type === 'swgt' ? "Chúc mừng! Số tiền đã được cộng thẳng vào Két sắt của bạn." 
                                : "Tuyệt vời! Admin sẽ sớm gửi file tài liệu này vào phần Chat cho bạn.")}
                            </p>
                            <button 
                                onClick={() => setOpenedReward(null)} 
                                style={{ width: '100%', backgroundColor: theme.blue, color: '#fff', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '14px', cursor: 'pointer' }}
                            >
                                ĐÓNG LẠI & CHƠI TIẾP
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ width: '100%', backgroundColor: 'rgba(244, 208, 63, 0.05)', border: `1px dashed ${theme.gold}`, borderRadius: '12px', padding: '15px', marginTop: '20px', boxSizing: 'border-box' }}>
                    <h4 style={{ color: theme.gold, margin: '0 0 10px 0', fontSize: '14px' }}>📊 TỶ LỆ TRÚNG ĐỒ & BẢO HIỂM :</h4>
                    <ul style={{ color: theme.textDim, fontSize: '13px', margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                        <li style={{ color: '#fff', fontWeight: 'bold', marginBottom: '5px' }}>💎 CƠ CHẾ BẢO HIỂM ĐẶC BIỆT:<br/><span style={{ color: theme.green, fontWeight: 'normal', fontSize: '12px' }}>Đập rương tích lũy, TRONG 30 LẦN ĐẬP CHẮC CHẮN TRÚNG 500 SWGT!</span></li>
                        <li>Trúng <b style={{color: '#fff'}}>5 - 500 SWGT</b> (Tỉ lệ cao)</li>
                        <li>Trúng <b style={{color: theme.gold}}>Sách & Audio VIP</b> (Siêu hiếm)</li>
                        <li>Rương rỗng (Có rủi ro)</li>
                    </ul>
                </div>
        );
    }

    const renderRewards = () => {
        let nextTarget = 3; let nextReward = "+10 SWGT";
        for (let m of MILESTONE_LIST) {
            if (referrals < m.req) { nextTarget = m.req; nextReward = `+${m.reward} SWGT`; break; }
        }
        let progressPercent = Math.min((referrals / nextTarget) * 100, 100);

        return (
            <div style={{ padding: '0 20px 20px 20px', paddingBottom: '100px' }}>
                
                {/* 1. KHU VỰC KHO TRI THỨC MỚI (4 NHÓM TĂNG DẦN) */}
                <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '10px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '5px' }}>📚</div>
                    <h2 style={{ color: theme.gold, margin: '0 0 5px 0', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase' }}>Kho Tàng Tri Thức</h2>
                    <p style={{ color: theme.textDim, fontSize: '13px', margin: 0 }}>Nâng cấp tư duy - Thay đổi vận mệnh.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                    {/* Nhóm 1: 100 SWGT */}
                    <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#333', color: '#fff', padding: '5px 15px', borderBottomLeftRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>CẤP ĐỘ 1</div>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>🎧</div>
                        <h4 style={{ margin: '0 0 8px 0', color: theme.textLight, fontSize: '16px' }}>Gói Nhận Thức</h4>
                        <p style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 10px 0', lineHeight: '1.4' }}>• Audio: Nhân Tính Đen Trắng</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                            <span style={{ color: theme.gold, fontWeight: 'bold', fontSize: '18px' }}>100 SWGT</span>
                            <button onClick={() => redeemItem('Gói 1: Audio Nhân Tính Đen Trắng', 100)} style={{ backgroundColor: '#5E92F3', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>ĐỔI NGAY</button>
                        </div>
                    </div>

                    {/* Nhóm 2: 200 SWGT */}
                    <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#5E92F3', color: '#fff', padding: '5px 15px', borderBottomLeftRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>CẤP ĐỘ 2</div>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>🎧 🎧</div>
                        <h4 style={{ margin: '0 0 8px 0', color: theme.textLight, fontSize: '16px' }}>Gói Khai Sáng</h4>
                        <p style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 10px 0', lineHeight: '1.4' }}>• Audio: Nhân Tính Đen Trắng<br/>• Audio: Tuyệt Mật Nhân Tính</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                            <span style={{ color: theme.gold, fontWeight: 'bold', fontSize: '18px' }}>200 SWGT</span>
                            <button onClick={() => redeemItem('Gói 2: Combo 2 Audio Nhân Tính', 200)} style={{ backgroundColor: '#5E92F3', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>ĐỔI NGAY</button>
                        </div>
                    </div>

                    {/* Nhóm 3: 300 SWGT */}
                    <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.green}`, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: theme.green, color: '#fff', padding: '5px 15px', borderBottomLeftRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>CẤP ĐỘ 3</div>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>📘 🎧 🎧</div>
                        <h4 style={{ margin: '0 0 8px 0', color: theme.textLight, fontSize: '16px' }}>Gói Thực Chiến</h4>
                        <p style={{ color: theme.textDim, fontSize: '13px', margin: '0 0 10px 0', lineHeight: '1.4' }}>• Ebook: Logic Kiếm Tiền<br/>• Audio: Nhân Tính Đen Trắng<br/>• Audio: Tuyệt Mật Nhân Tính</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                            <span style={{ color: theme.gold, fontWeight: 'bold', fontSize: '18px' }}>300 SWGT</span>
                            <button onClick={() => redeemItem('Gói 3: Ebook Logic Kiếm Tiền + 2 Audio', 300)} style={{ backgroundColor: theme.green, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>ĐỔI NGAY</button>
                        </div>
                    </div>

                    {/* Nhóm 4: 400 SWGT */}
                    <div style={{ backgroundColor: 'rgba(244, 208, 63, 0.1)', padding: '20px', borderRadius: '12px', border: `1px solid ${theme.gold}`, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: theme.gold, color: '#000', padding: '5px 15px', borderBottomLeftRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>VIP</div>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>👑 📚</div>
                        <h4 style={{ margin: '0 0 8px 0', color: theme.gold, fontSize: '16px' }}>Combo Thượng Lưu</h4>
                        <p style={{ color: theme.textLight, fontSize: '13px', margin: '0 0 10px 0', lineHeight: '1.4' }}>• [COMBO EBOOK] Bản gốc, rõ đẹp về Kinh doanh, Khởi nghiệp & Làm giàu.</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                            <span style={{ color: theme.gold, fontWeight: 'bold', fontSize: '18px' }}>400 SWGT</span>
                            <button onClick={() => redeemItem('Gói 4: Combo Ebook Kinh Doanh Khởi Nghiệp', 400)} style={{ backgroundColor: theme.gold, color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>ĐỔI COMBO</button>
                        </div>
                    </div>
                </div>

                {/* 2. KHU VỰC GROUP VIP */}
                <h3 style={{color: '#fff', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '15px', fontSize: '16px', textTransform: 'uppercase'}}>💎 QUYỀN LỰC VIP (ROAD TO $1M)</h3>
                
                <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '15px', marginBottom: '15px', border: `1px solid ${theme.border}`}}>
                    <h4 style={{margin: '0 0 8px 0', color: theme.green, fontSize: '15px'}}>🟢 TUYẾN TRONG HỆ THỐNG</h4>
                    <p style={{fontSize: '13px', color: theme.textDim, margin: '0 0 15px 0', lineHeight: '1.5'}}>Dành cho khách hàng đã đăng ký mua Gói <b>SWC Pass</b> qua đường link của Admin.</p>
                    <ul style={{ margin: '0 0 15px 0', paddingLeft: '20px', color: theme.textLight, fontSize: '13px', lineHeight: '1.6' }}>
                        <li>Miễn phí vào Group Private vĩnh viễn.</li>
                        <li>Hỗ trợ 1-1 nạp rút, họp Zoom kín.</li>
                    </ul>
                    <button onClick={() => alert("Hãy tham gia Nhóm Chat và nhắn tin cho Admin (@swc_capital_vn), gửi kèm ảnh chụp màn hình tài khoản SWC Pass của bạn để được duyệt vào Nhóm Kín @swctradings nhé!")} style={{backgroundColor: theme.green, color: '#fff', border: 'none', padding: '10px 0', width: '100%', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer'}}>LIÊN HỆ NHẬN QUYỀN LỢI</button>
                </div>

                <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '15px', marginBottom: '25px', border: `1px solid ${theme.border}`}}>
                    <h4 style={{margin: '0 0 8px 0', color: theme.red, fontSize: '15px'}}>🔴 KHÁCH NGOÀI HỆ THỐNG (CROSSLINE)</h4>
                    <p style={{fontSize: '13px', color: theme.textDim, margin: '0 0 15px 0', lineHeight: '1.5'}}>Anh em thuộc tuyến Leader khác nhưng vẫn muốn tham gia Group VIP @swctradings của Admin để nhận phím kèo & tài liệu độc quyền.</p>
                    <div style={{ backgroundColor: '#000', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
                        <p style={{ margin: 0, color: theme.gold, fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>PHÍ BẢO TRỢ: 2000 SWGT / NĂM</p>
                    </div>
                    <button onClick={() => redeemItem('Vé vào Group VIP @swctradings (Khách Crossline)', 2000)} style={{backgroundColor: '#333', color: theme.gold, border: `1px solid ${theme.gold}`, padding: '10px 0', width: '100%', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer'}}>DÙNG 2000 SWGT ĐỂ VÀO NHÓM</button>
                </div>

                {/* 3. KHU VỰC NHIỆM VỤ CŨ & BẢNG XẾP HẠNG */}
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

                <h3 style={{color: theme.gold, paddingBottom: '10px', marginBottom: '15px', fontSize: '17px', textAlign: 'center', fontWeight: '900'}}>🤝 BẢNG VÀNG ĐẠI SỨ</h3>
                {renderWealthBoard()}

                <div style={{ textAlign: 'center', paddingTop: '5px', marginBottom: '25px' }}>
                    <a href={`https://t.me/share/url?url=https://t.me/Dau_Tu_SWC_bot?start=${userId}&text=Vào%20nhận%20ngay%20SWGT%20miễn%20phí%20từ%20hệ%20sinh%20thái%20công%20nghệ%20uST%20này%20anh%20em!`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: theme.blue, color: '#fff', padding: '14px 0', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '14px', textDecoration: 'none', boxSizing: 'border-box' }}>
                        ✈️ CHIA SẺ LINK ĐỂ ĐUA TOP NGAY
                    </a>
                </div>
            </div>
        );
    };

    const renderWallet = () => {
        // Khách hàng dưới 500 thì hiện Thanh Khoản VNĐ và Nạp Ghép Vốn
        const isUnder500 = balance > 0 && balance < 500;
        
        const bidRate = 25400; // Tỷ giá thu mua VNĐ
        const askRate = 27000; // Tỷ giá ghép vốn USDT

        const liquidateVNDNum = Math.floor(balance * 0.007 * bidRate); 
        const liquidateVND = liquidateVNDNum.toLocaleString('vi-VN');
        const shortfall = 500 - balance;
        const costUSDT = (shortfall * 0.022).toFixed(2);
        const costVND = Math.floor(shortfall * 0.022 * askRate).toLocaleString('vi-VN'); 
        
        const isEligibleForVND = liquidateVNDNum >= 5000;

        return (
            <div style={{ padding: '0 20px 20px 20px' }}>
                {/* 1. KHỐI HIỂN THỊ SỐ DƯ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '25px 20px', border: `1px solid ${theme.gold}`, textAlign: 'center', boxShadow: '0 4px 15px rgba(244, 208, 63, 0.1)' }}>
                        <p style={{ color: theme.textDim, fontSize: '14px', margin: '0 0 5px 0', fontWeight: 'bold', textTransform: 'uppercase' }}>💰 TỔNG TÀI SẢN SWGT</p>
                        <h1 style={{ color: theme.gold, margin: '0', fontSize: '45px', fontWeight: '900' }}>
                            {Math.round((balance + lockedBalance) * 100) / 100}
                        </h1>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, backgroundColor: 'rgba(52, 199, 89, 0.1)', border: `1px solid ${theme.green}`, borderRadius: '12px', padding: '15px 5px', textAlign: 'center' }}>
                            <p style={{ color: theme.green, fontSize: '12px', margin: '0 0 5px 0', fontWeight: 'bold' }}>✅ Khả Dụng</p>
                            <h3 style={{ margin: 0, color: '#fff', fontSize: '24px' }}>{balance}</h3>
                        </div>
                        <div style={{ flex: 1, backgroundColor: 'rgba(255, 59, 48, 0.1)', border: `1px solid ${theme.red}`, borderRadius: '12px', padding: '15px 5px', textAlign: 'center' }}>
                            <p style={{ color: theme.red, fontSize: '12px', margin: '0 0 5px 0', fontWeight: 'bold' }}>🔒 Chờ Duyệt</p>
                            <h3 style={{ margin: 0, color: '#fff', fontSize: '24px' }}>{lockedBalance}</h3>
                        </div>
                    </div>
                </div>

                {/* 2. KHỐI ĐẾM NGƯỢC (Luôn nằm trên cùng) */}
                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: '0 0 15px 0', color: theme.textLight, fontSize: '16px' }}>⏳ Tình trạng Mở khóa ({lockDaysLimit} Ngày)</h3>
                    
                    {isUnlocked ? (
                        <div style={{ padding: '15px', backgroundColor: 'rgba(52, 199, 89, 0.1)', border: `1px dashed ${theme.green}`, borderRadius: '10px', color: theme.green, fontWeight: 'bold', fontSize: '16px', textAlign: 'center' }}>
                            🎉 ĐÃ ĐỦ ĐIỀU KIỆN. CỔNG GIAO DỊCH ĐÃ MỞ!
                        </div>
                    ) : (
                        <div style={{ backgroundColor: '#000', padding: '20px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                            <p style={{ color: theme.red, fontSize: '14px', margin: '0 0 15px 0', fontWeight: 'bold' }}>🔒 TÀI KHOẢN ĐANG BỊ KHÓA RÚT TOKEN</p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
                                <span style={{ color: theme.textLight, fontSize: '18px', fontWeight: 'bold' }}>Còn</span>
                                <div style={{ padding: '5px 10px', backgroundColor: '#222', borderRadius: '6px', color: theme.gold, fontSize: '18px', fontWeight: 'bold' }}>{timeLeft.days} <span style={{fontSize:'12px', color: theme.textDim, fontWeight:'normal'}}>Ngày</span></div>
                                <div style={{ padding: '5px 10px', backgroundColor: '#222', borderRadius: '6px', color: theme.gold, fontSize: '18px', fontWeight: 'bold' }}>{timeLeft.hours} <span style={{fontSize:'12px', color: theme.textDim, fontWeight:'normal'}}>Giờ</span></div>
                                <div style={{ padding: '5px 10px', backgroundColor: '#222', borderRadius: '6px', color: theme.gold, fontSize: '18px', fontWeight: 'bold' }}>{timeLeft.mins} <span style={{fontSize:'12px', color: theme.textDim, fontWeight:'normal'}}>Phút</span></div>
                            </div>
                            <p style={{ color: theme.gold, fontSize: '12px', margin: '10px 0 0 0', fontStyle: 'italic' }}>Mẹo: Nạp Ghép Vốn để đủ 500 SWGT và mở khóa ngay lập tức!</p>
                        </div>
                    )}
                </div>

                {/* 3. KHỐI HÀNH ĐỘNG DƯỚI 500 (VẪN CHO BÁN VNĐ VÀ NẠP TIỀN BẤT CHẤP THỜI GIAN KHÓA) */}
                {isUnder500 ? (
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        <div style={{ backgroundColor: 'rgba(52, 199, 89, 0.05)', borderRadius: '15px', padding: '20px', border: `1px solid ${theme.green}`, marginBottom: '15px' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: theme.green, fontSize: '15px', textTransform: 'uppercase' }}>💸 THANH KHOẢN TỨC THÌ</h3>
                            <p style={{ color: theme.textLight, fontSize: '13px', margin: '0 0 15px 0', lineHeight: '1.5' }}>
                                Bạn chưa đủ 500 SWGT để rút Token. Tuy nhiên BQT hỗ trợ thu mua số dư nhỏ ngay lập tức. <br/><br/>Số dư <b>{balance} SWGT</b> quy đổi thành: <b style={{color: theme.gold, fontSize: '16px'}}>{liquidateVND} VNĐ</b>
                            </p>
                            <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Tên Ngân hàng (VD: Vietcombank)" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: '#000', color: theme.textLight, boxSizing: 'border-box', marginBottom: '10px', fontSize: '13px' }} />
                            <input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Họ và Tên Chủ Tài Khoản" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: '#000', color: theme.textLight, boxSizing: 'border-box', marginBottom: '10px', fontSize: '13px' }} />
                            <input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="Số Tài Khoản Nhận Tiền" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: '#000', color: theme.textLight, boxSizing: 'border-box', marginBottom: '15px', fontSize: '13px' }} />
                            <button 
                                onClick={() => handleLiquidateVND(liquidateVND, isEligibleForVND)} 
                                style={{ width: '100%', backgroundColor: isEligibleForVND ? theme.green : '#333', color: isEligibleForVND ? '#fff' : theme.textDim, padding: '14px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                            >
                                {isEligibleForVND ? `BÁN LẤY ${liquidateVND} VNĐ` : `🔒 CẦN ĐẠT MIN 5.000 VNĐ`}
                            </button>
                        </div>

                        <div style={{ backgroundColor: 'rgba(244, 208, 63, 0.05)', borderRadius: '15px', padding: '20px', border: `1px solid ${theme.gold}`, marginBottom: '20px' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: theme.gold, fontSize: '15px', textTransform: 'uppercase' }}>⚡ GHÉP VỐN ĐỂ RÚT TOKEN</h3>
                            <p style={{ color: theme.textLight, fontSize: '13px', margin: '0 0 15px 0', lineHeight: '1.5' }}>
                                Bạn đang thiếu <b>{shortfall} SWGT</b> để đủ hạn mức rút về ví cá nhân (Min 500). Bạn có thể mua thêm từ quỹ OTC nội bộ để miễn phí Gas mạng lưới. Sau khi nạp đủ, hệ thống sẽ mở khóa rút tiền ngay.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', backgroundColor: '#000', padding: '12px', borderRadius: '8px' }}>
                                <span style={{ color: theme.textDim, fontSize: '13px' }}>Chi phí nạp ghép vốn:</span>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px', display: 'block' }}>{costUSDT} USDT</span>
                                    <span style={{ color: theme.gold, fontSize: '12px' }}>(~{costVND} VNĐ)</span>
                                </div>
                            </div>
                            <button onClick={() => handleTopUp(costUSDT, costVND)} style={{ width: '100%', backgroundColor: theme.gold, color: '#000', padding: '14px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>NẠP THÊM ĐỂ ĐỦ 500 SWGT</button>
                        </div>
                    </div>
                ) : (
                    // --- 4. KHỐI RÚT TIỀN TRÊN 500 ---
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        {isUnlocked ? (
                            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', textAlign: 'center', border: `1px solid ${theme.border}`, marginBottom: '20px' }}>
                                <p style={{ color: theme.textLight, fontSize: '14px', margin: '0 0 15px 0', fontWeight: 'bold' }}>👇 ĐIỀN SỐ LƯỢNG MUỐN RÚT 👇</p>
                                <input 
                                    type="number" 
                                    placeholder="Nhập số dư Khả dụng..." 
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: '#000', color: theme.textLight, boxSizing: 'border-box', marginBottom: '15px', fontSize: '15px', textAlign: 'center' }}
                                />
                                <button onClick={handleWithdraw} style={{ width: '100%', backgroundColor: theme.green, color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: 'bold', border: 'none', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(52, 199, 89, 0.3)' }}>
                                    💸 XÁC NHẬN RÚT TIỀN
                                </button>
                            </div>
                        ) : (
                            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', textAlign: 'center', border: `1px dashed ${theme.red}`, marginBottom: '20px' }}>
                                <p style={{ color: theme.red, fontSize: '14px', margin: '0', fontWeight: 'bold' }}>Tài khoản của bạn đã đạt 500 SWGT nhưng chưa hết thời gian khóa. Vui lòng chờ đợi!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* 5. KHỐI THIẾT LẬP THANH TOÁN (LUÔN HIỆN) */}
                <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: '0 0 15px 0', color: theme.textLight, fontSize: '16px' }}>⚙️ Thiết lập thanh toán</h3>
                    
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <button onClick={() => setWithdrawMethod('gate')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${withdrawMethod === 'gate' ? theme.green : theme.border}`, backgroundColor: withdrawMethod === 'gate' ? 'rgba(52, 199, 89, 0.1)' : '#000', color: withdrawMethod === 'gate' ? theme.green : theme.textDim, cursor: 'pointer', fontWeight: 'bold' }}>Gate.io</button>
                        <button onClick={() => setWithdrawMethod('erc20')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${withdrawMethod === 'erc20' ? theme.red : theme.border}`, backgroundColor: withdrawMethod === 'erc20' ? 'rgba(255, 59, 48, 0.1)' : '#000', color: withdrawMethod === 'erc20' ? theme.red : theme.textDim, cursor: 'pointer', fontWeight: 'bold' }}>Ví ERC20</button>
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
    };

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

                /* Hiệu ứng rung lắc rương */
                @keyframes shakeChest {
                    0% { transform: translate(1px, 1px) rotate(0deg) scale(1); }
                    10% { transform: translate(-1px, -2px) rotate(-5deg) scale(1.1); }
                    20% { transform: translate(-3px, 0px) rotate(5deg) scale(1.1); }
                    30% { transform: translate(3px, 2px) rotate(0deg) scale(1.1); }
                    40% { transform: translate(1px, -1px) rotate(5deg) scale(1.1); }
                    50% { transform: translate(-1px, 2px) rotate(-5deg) scale(1.1); }
                    60% { transform: translate(-3px, 1px) rotate(0deg) scale(1.1); }
                    70% { transform: translate(3px, 1px) rotate(-5deg) scale(1.1); }
                    80% { transform: translate(-1px, -1px) rotate(5deg) scale(1.1); }
                    90% { transform: translate(1px, 2px) rotate(0deg) scale(1.1); }
                    100% { transform: translate(1px, -2px) rotate(-5deg) scale(1); }
                }
                .chest-shake {
                    animation: shakeChest 1s cubic-bezier(.36,.07,.19,.97) both infinite;
                }

                /* Hiệu ứng bật pop-up quà */
                .pop-in {
                    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.5); }
                    to { opacity: 1; transform: scale(1); }
                }

                /* Hiệu ứng Navigation Bottom Tab động */
                .nav-item {
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    cursor: pointer;
                    width: 25%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    opacity: 0.6;
                }
                .nav-item.active {
                    opacity: 1;
                    transform: translateY(-4px); 
                }
                .nav-item:active {
                    transform: scale(0.92);
                }
                .nav-icon {
                    font-size: 24px;
                    margin-bottom: 4px;
                    transition: all 0.3s ease;
                }
                .nav-item.active .nav-icon {
                    animation: bounceTab 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-shadow: 0 0 15px rgba(244, 208, 63, 0.9);
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
                {activeTab === 'game' && renderGame()}
                {activeTab === 'rewards' && renderRewards()}
                {activeTab === 'wallet' && renderWallet()}
            </div>

            {/* THANH ĐIỀU HƯỚNG 4 TABS */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: theme.cardBg, borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-around', padding: '12px 0', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', zIndex: 100 }}>
                
                <div onClick={() => setActiveTab('home')} className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} style={{ color: activeTab === 'home' ? theme.gold : theme.textDim }}>
                    <div className="nav-icon">🏠</div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Trang chủ</span>
                </div>

                <div onClick={() => setActiveTab('game')} className={`nav-item ${activeTab === 'game' ? 'active' : ''}`} style={{ color: activeTab === 'game' ? theme.gold : theme.textDim }}>
                    <div className="nav-icon">🕹️</div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Trò chơi</span>
                </div>
                
                <div onClick={() => setActiveTab('rewards')} className={`nav-item ${activeTab === 'rewards' ? 'active' : ''}`} style={{ color: activeTab === 'rewards' ? theme.gold : theme.textDim }}>
                    <div className="nav-icon">🎁</div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Cửa hàng</span>
                </div>
                
                <div onClick={() => setActiveTab('wallet')} className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`} style={{ color: activeTab === 'wallet' ? theme.gold : theme.textDim }}>
                    <div className="nav-icon">👛</div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Ví</span>
                </div>

            </div>
        </div>
    );
}

export default App;
