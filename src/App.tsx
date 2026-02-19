import { useState } from 'react';

function App() {
    // Quản lý việc chuyển đổi giữa 3 Tab
    const [activeTab, setActiveTab] = useState('home');

    // Bảng màu chuẩn VIP (Dark Mode & Gold)
    const theme = {
        bg: '#0F0F0F',        // Đen tuyền (Nền)
        cardBg: '#1C1C1E',    // Đen xám (Các khối thông tin)
        gold: '#F4D03F',      // Vàng hoàng kim
        textLight: '#FFFFFF', // Trắng sáng
        textDim: '#8E8E93',   // Xám nhạt
        border: '#333333'     // Viền mỏng
    };

    // --------------------------------------------------
    // TAB 1: TRANG CHỦ (HOME)
    // --------------------------------------------------
    const renderHome = () => (
        <div style={{ padding: '20px' }}>
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', marginBottom: '15px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.gold, margin: '0 0 10px 0', fontSize: '18px' }}>🚀 Cách Hoạt Động</h2>
                <p style={{ color: theme.textDim, fontSize: '14px', lineHeight: '1.6' }}>
                    <b style={{color: theme.textLight}}>Bước 1:</b> Liên kết với Bot trên Telegram.<br/>
                    <b style={{color: theme.textLight}}>Bước 2:</b> Chia sẻ link giới thiệu.<br/>
                    <b style={{color: theme.textLight}}>Bước 3:</b> Nhận SWGT thưởng.<br/>
                    <b style={{color: theme.textLight}}>Bước 4:</b> Rút về ví cá nhân.
                </p>
            </div>
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: '#5E92F3', margin: '0 0 10px 0', fontSize: '18px' }}>💎 Cơ Cấu Phần Thưởng</h2>
                <p style={{ color: theme.textLight, fontSize: '14px', marginBottom: '8px' }}>Tham gia Kênh uST: <span style={{ color: '#34C759', fontWeight: 'bold' }}>+10 SWGT</span></p>
                <p style={{ color: theme.textLight, fontSize: '14px', marginBottom: '8px' }}>Tham gia Nhóm SWC: <span style={{ color: '#34C759', fontWeight: 'bold' }}>+10 SWGT</span></p>
                <p style={{ color: theme.textLight, fontSize: '14px', marginBottom: '0' }}>Mời bạn bè (Ref): <span style={{ color: '#34C759', fontWeight: 'bold' }}>+20 SWGT/người</span></p>
            </div>
        </div>
    );

    // --------------------------------------------------
    // TAB 2: PHẦN THƯỞNG (REWARDS)
    // --------------------------------------------------
    const renderRewards = () => (
        <div style={{ padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: theme.gold, borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>🎁</div>
                <h2 style={{ color: theme.textLight, margin: '15px 0 5px 0', fontSize: '20px' }}>Chương trình giới thiệu</h2>
                <p style={{ color: theme.textDim, fontSize: '14px', margin: 0 }}>Mời bạn bè, nhận thưởng ngay</p>
            </div>
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '20px', border: `1px solid ${theme.border}` }}>
                <p style={{ color: theme.textDim, fontSize: '13px', marginBottom: '10px' }}>Link giới thiệu của bạn:</p>
                <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '8px', color: theme.gold, fontSize: '14px', wordBreak: 'break-all', marginBottom: '15px', border: `1px dashed ${theme.gold}` }}>
                    https://t.me/Dau_Tu_SWC_bot?start=ref_vip
                </div>
                <button style={{ width: '100%', backgroundColor: theme.gold, color: '#000', padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '16px', cursor: 'pointer' }}>
                    📋 Sao chép link
                </button>
            </div>
        </div>
    );

    // --------------------------------------------------
    // TAB 3: VÍ (WALLET)
    // --------------------------------------------------
    const renderWallet = () => (
        <div style={{ padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: theme.gold, borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>👛</div>
                <h2 style={{ color: theme.textLight, margin: '15px 0 5px 0', fontSize: '20px' }}>Ví SWGT</h2>
                <p style={{ color: theme.textDim, fontSize: '14px', margin: 0 }}>Quản lý & Rút tiền</p>
            </div>
            <div style={{ backgroundColor: theme.cardBg, borderRadius: '15px', padding: '25px 20px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
                <p style={{ color: theme.textDim, fontSize: '14px', margin: '0 0 10px 0' }}>Số dư hiện tại</p>
                <h1 style={{ color: theme.gold, margin: '0 0 20px 0', fontSize: '40px', fontWeight: '900' }}>0 <span style={{fontSize: '20px', fontWeight: 'normal'}}>SWGT</span></h1>
                <button style={{ width: '100%', backgroundColor: '#333', color: theme.gold, padding: '14px', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '16px' }}>
                    🔒 Chưa đủ điều kiện rút
                </button>
            </div>
        </div>
    );

    // --------------------------------------------------
    // GIAO DIỆN CHÍNH (BỘ KHUNG)
    // --------------------------------------------------
    return (
        <div style={{ backgroundColor: theme.bg, color: theme.textLight, minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '80px', boxSizing: 'border-box' }}>
            
            {/* Thanh Tiêu đề (Header) */}
            <div style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.bg, position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ width: '45px', height: '45px', backgroundColor: '#000', borderRadius: '50%', border: `2px solid ${theme.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: theme.gold, marginRight: '15px', fontSize: '14px' }}>
                    SWC
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: theme.gold, textTransform: 'uppercase' }}>CỘNG ĐỒNG SWC</h1>
                    <p style={{ margin: 0, fontSize: '13px', color: theme.textDim }}>Hệ sinh thái đầu tư uST</p>
                </div>
            </div>

            {/* Khu vực hiển thị nội dung theo Tab */}
            <div>
                {activeTab === 'home' && renderHome()}
                {activeTab === 'rewards' && renderRewards()}
                {activeTab === 'wallet' && renderWallet()}
            </div>

            {/* Thanh Điều hướng dưới cùng (Bottom Navigation) */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: theme.cardBg, borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-around', padding: '12px 0', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', zIndex: 100 }}>
                <div onClick={() => setActiveTab('home')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'home' ? theme.gold : theme.textDim, cursor: 'pointer', width: '33%', transition: '0.2s' }}>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>🏠</div>
                    <span style={{ fontSize: '12px', fontWeight: activeTab === 'home' ? 'bold' : 'normal' }}>Trang chủ</span>
                </div>
                <div onClick={() => setActiveTab('rewards')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'rewards' ? theme.gold : theme.textDim, cursor: 'pointer', width: '33%', transition: '0.2s' }}>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>🎁</div>
                    <span style={{ fontSize: '12px', fontWeight: activeTab === 'rewards' ? 'bold' : 'normal' }}>Phần thưởng</span>
                </div>
                <div onClick={() => setActiveTab('wallet')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'wallet' ? theme.gold : theme.textDim, cursor: 'pointer', width: '33%', transition: '0.2s' }}>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>👛</div>
                    <span style={{ fontSize: '12px', fontWeight: activeTab === 'wallet' ? 'bold' : 'normal' }}>Ví</span>
                </div>
            </div>

        </div>
    );
}

export default App;
