import { useState, useEffect } from 'react';
function App() {
  const [activeTab, setActiveTab] = useState('home');

  // Các đường link quan trọng của anh
  const GROUP_ZALO_LINK = "https://zalo.me/g/yeiaea989";
  const WEBINAR_LINK = "https://launch.swc.capital/broadcast_31_vi";

  // Mở rộng toàn màn hình khi chạy trên Telegram
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="animate-fade-in pb-24">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4">
                KHAI MỞ ĐẠI DƯƠNG XANH
              </h1>
              <p className="text-slate-300 text-lg">
                Kinh nghiệm quá khứ là nền tảng cho chiến lược mới. Lần đầu tiên, chúng tôi ra mắt dự án mới trên <span className="text-yellow-400 font-bold">SWC Field</span> với bộ lọc lựa chọn khắt khe và minh bạch nhất.
              </p>
            </div>

            <div className="bg-slate-800 border border-yellow-500/30 rounded-xl p-6 mb-6 shadow-lg shadow-yellow-500/10">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                ⏰ Đếm ngược đến Webinar
              </h2>
              <p className="text-slate-400 mb-4">20:00 (VN) | Ngày 31/03/2026</p>
              <a 
                href={WEBINAR_LINK}
                target="_blank" 
                rel="noreferrer"
                className="block w-full text-center bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-bold py-3 rounded-lg uppercase tracking-wide shadow-md hover:scale-105 transition-transform"
              >
                Đăng ký giữ chỗ ngay
              </a>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 mb-6">
              <h3 className="text-yellow-400 font-bold text-lg mb-2">🎁 ĐẶC QUYỀN BONUS</h3>
              <p className="text-slate-300 text-sm">
                Đăng ký tham gia phát sóng để nhận bản phân tích chuyên sâu về sự khác biệt của dự án mới và các thay đổi trong chiến lược dòng vốn của SWC.
              </p>
            </div>
            
            <a 
              href={GROUP_ZALO_LINK}
              target="_blank" 
              rel="noreferrer"
              className="block w-full text-center bg-blue-600 text-white font-bold py-4 rounded-lg shadow-lg hover:bg-blue-700 transition-colors animate-pulse"
            >
              💬 THAM GIA NHÓM ZALO NHẬN LỘ TRÌNH
            </a>
          </div>
        );
      
      case 'pass':
        return (
          <div className="animate-fade-in pb-24">
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-6 uppercase">Đặc quyền SWC Pass</h2>
            <p className="text-slate-300 text-center mb-8">
              Tấm vé thông hành của giới tinh anh. Trọn bộ công cụ để xây dựng sự giàu có bền vững.
            </p>

            <div className="space-y-6">
              {/* Gói Essential */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white text-center">GÓI ESSENTIAL</h3>
                <div className="text-3xl font-black text-yellow-400 text-center my-3">$240 <span className="text-sm text-slate-400 font-normal">/ 1 Năm</span></div>
                <ul className="text-slate-300 space-y-2 text-sm mb-4">
                  <li>✦ Truy cập chiến lược <strong>Road to $1M</strong></li>
                  <li>✦ Quyền truy cập vào gian hàng <strong>SWC Field</strong></li>
                  <li>✦ Trình theo dõi tiến độ cá nhân</li>
                </ul>
              </div>

              {/* Gói Plus */}
              <div className="bg-slate-800 border-2 border-yellow-500 rounded-xl p-6 relative shadow-lg shadow-yellow-500/20">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                  ⭐ KHUYÊN DÙNG
                </div>
                <h3 className="text-xl font-bold text-yellow-400 text-center">GÓI PLUS</h3>
                <div className="text-3xl font-black text-yellow-400 text-center my-3">$600 <span className="text-sm text-slate-400 font-normal">/ 5 Năm</span></div>
                <ul className="text-slate-300 space-y-2 text-sm mb-4">
                  <li>✦ Toàn bộ quyền lợi gói Essential</li>
                  <li>✦ Khóa giá cố định 5 năm (Chống lạm phát)</li>
                  <li>✦ Kỷ luật đầu tư dài hạn tận dụng Lãi kép</li>
                </ul>
                <a href="https://swcfield.com/" target="_blank" rel="noreferrer" className="block w-full text-center bg-yellow-500 text-slate-900 font-bold py-2 rounded-lg">
                  Nâng cấp ngay
                </a>
              </div>
            </div>
          </div>
        );

      case 'atlas':
        return (
          <div className="animate-fade-in pb-24">
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-6 uppercase">Siêu dự án ATLAS</h2>
            <p className="text-slate-300 text-center mb-6">
              Tương lai của Bất động sản số hóa (RWA) tại UAE và Toàn cầu. Phá vỡ thế độc quyền của giới siêu giàu.
            </p>

            <div className="space-y-4">
              <div className="bg-slate-800 p-5 rounded-xl border-l-4 border-yellow-500">
                <h3 className="text-lg font-bold text-white mb-2">Cơ sở hạ tầng RWA & Web 2.5</h3>
                <p className="text-slate-400 text-sm">Kết hợp tốc độ blockchain với độ tin cậy của tiền pháp định. Dân chủ hóa tiếp cận huy động vốn BĐS.</p>
              </div>
              
              <div className="bg-slate-800 p-5 rounded-xl border-l-4 border-yellow-500">
                <h3 className="text-lg font-bold text-white mb-2">Thanh khoản cực nhanh</h3>
                <p className="text-slate-400 text-sm">Thị trường thứ cấp tích hợp ngay trong ứng dụng, giao dịch cổ phần dễ dàng và minh bạch.</p>
              </div>

              <div className="bg-slate-800 p-5 rounded-xl border-l-4 border-yellow-500">
                <h3 className="text-lg font-bold text-white mb-2">Bảo chứng pháp lý</h3>
                <p className="text-slate-400 text-sm">Cấp phép chính thức bởi Cơ quan Trung tâm Thương mại Thế giới Dubai (DWTCA - 4219).</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-red-400 italic mb-4">⚠️ Vòng kín ưu đãi sẽ khép lại vào 31/03!</p>
              <a href={WEBINAR_LINK} target="_blank" rel="noreferrer" className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-bold px-8 py-3 rounded-full shadow-lg">
                Tìm hiểu thêm tại Webinar
              </a>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="text-center">
          <h1 className="text-yellow-500 font-black tracking-widest uppercase text-sm">
            Sky World Community Viet Nam
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Định hướng phát triển bởi Mr. Hồ Văn Lợi
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-5">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-slate-950 border-t border-slate-800 flex justify-around items-center p-3 pb-safe z-50">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center p-2 ${activeTab === 'home' ? 'text-yellow-400' : 'text-slate-500'}`}
        >
          <span className="text-2xl mb-1">🏠</span>
          <span className="text-[10px] font-bold uppercase">Trang chủ</span>
        </button>
        <button 
          onClick={() => setActiveTab('pass')}
          className={`flex flex-col items-center p-2 ${activeTab === 'pass' ? 'text-yellow-400' : 'text-slate-500'}`}
        >
          <span className="text-2xl mb-1">💎</span>
          <span className="text-[10px] font-bold uppercase">SWC Pass</span>
        </button>
        <button 
          onClick={() => setActiveTab('atlas')}
          className={`flex flex-col items-center p-2 ${activeTab === 'atlas' ? 'text-yellow-400' : 'text-slate-500'}`}
        >
          <span className="text-2xl mb-1">🏢</span>
          <span className="text-[10px] font-bold uppercase">ATLAS</span>
        </button>
      </nav>
    </div>
  );
}

// Đừng quên định nghĩa biến global cho Telegram WebApp
declare global {
  interface Window {
    Telegram: any;
  }
}

export default App;
