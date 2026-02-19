import { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

function App() {
    const [connected, setConnected] = useState(false);

    // Mở rộng Full màn hình và cài đặt màu thanh tiêu đề Telegram
    useEffect(() => {
        try {
            WebApp.ready();
            WebApp.expand();
            WebApp.setHeaderColor('#00457C');
        } catch (error) {
            console.log("Đang mở trên trình duyệt thường");
        }
    }, []);

    // Hàm giả lập kết nối ví
    const handleConnect = () => {
        setConnected(true);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 font-sans flex flex-col items-center justify-center">
            
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                {/* Phần Header màu xanh SWC */}
                <div className="bg-[#00457C] p-6 text-center">
                    <h1 className="text-2xl font-extrabold text-white">CỘNG ĐỒNG SWC</h1>
                    <p className="text-blue-200 text-sm mt-1">Hệ sinh thái công nghệ uST</p>
                </div>

                {/* Phần Nội Dung */}
                <div className="p-8 text-center">
                    {!connected ? (
                        // Màn hình lúc chưa kết nối
                        <div className="flex flex-col gap-6">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <p className="text-gray-600 text-sm">
                                    Chào mừng bạn! Hãy kết nối ví bảo mật của bạn để nhận phần thưởng <b>50 SWGT</b> từ Nhiệm vụ Tân binh.
                                </p>
                            </div>
                            <button 
                                onClick={handleConnect}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 text-lg"
                            >
                                🚀 KẾT NỐI VÍ NGAY
                            </button>
                        </div>
                    ) : (
                        // Màn hình sau khi kết nối thành công
                        <div className="flex flex-col gap-6">
                            <div className="bg-green-50 rounded-2xl p-6 border border-green-200 shadow-inner">
                                <h2 className="text-green-600 font-extrabold text-xl">✅ THÀNH CÔNG!</h2>
                                <p className="text-xs text-gray-400 mt-2 break-all bg-white p-2 rounded border">
                                    Ví: 0x8F9a...3b2C_SWC
                                </p>
                                <div className="mt-6">
                                    <p className="text-sm text-gray-500 font-medium">Số dư hiện tại của bạn</p>
                                    <p className="text-5xl font-black text-[#00457C] mt-2">50 <span className="text-lg font-bold text-gray-400">SWGT</span></p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <button className="bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl border border-gray-200">
                                    ⬇️ Nhận
                                </button>
                                <button className="bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl border border-gray-200">
                                    ⬆️ Gửi
                                </button>
                            </div>
                            
                            <button 
                                onClick={() => setConnected(false)}
                                className="mt-2 text-red-400 text-sm font-semibold underline"
                            >
                                Ngắt kết nối ví
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <p className="text-xs text-gray-400 mt-8">Được phát triển bởi Cộng Đồng SWC Việt Nam</p>
        </div>
    );
}

export default App;
