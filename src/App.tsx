import { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

// Các Component giao diện (giữ nguyên vì nó an toàn)
import Avatar from './components/utils/Avatar';
import BackButton from './components/buttons/BackButton';
import SkipButton from './components/buttons/SkipButton';
import PrimaryButton from './components/buttons/PrimaryButton';
import TransactionButton from './components/buttons/TransactionButton';
import TransactionHistoryItem from './components/utils/TransactionHistoryItem';
import ConnectOverlay from './components/connectOverlay/ConnectOverlay';
import EVMConnectModal from './components/connectors/EVMConnectModal';
import TonConnectModal from './components/connectors/TonConnectModal';

// Hình ảnh
import avatarPhone from './assets/avatar_phone.svg';
import avatarScooter from './assets/avatar_scooter.svg';
import avatarTable from './assets/avatar_table.svg';
import evmConnectIcon from './assets/EVM_connect_logos.png';
import tonConnectIcon from './assets/ton_connect.png';
import sendIcon from './assets/send_icon.svg';
import receiveIcon from './assets/receive_icon.svg';
import sellIcon from './assets/sell_icon.svg';

enum View {
    LANDING = 0,
    CONNECT = 1,
    CONNECTED = 2,
    WALLET = 3,
}

function App() {
    // An toàn khởi tạo Telegram WebApp
    useEffect(() => {
        try {
            WebApp.ready();
            WebApp.expand(); // Mở rộng full màn hình
            WebApp.setHeaderColor('#00457C');
        } catch (error) {
            console.log("Mở ngoài Telegram");
        }
    }, []);

    const [view, setView] = useState<View>(View.LANDING);
    const [account, setAccount] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>("0.0");

    const skip = () => setView(view + 1);
    const goBack = () => {
        if (view !== View.LANDING) setView(view - 1);
    };
    const openWallet = () => setView(View.WALLET);

    const [showConnectOverlay, setShowConnectOverlay] = useState(false);
    const [slideAnimation, setSlideAnimation] = useState('in');

    const openConnectOverlay = () => {
        setSlideAnimation('in');
        setTimeout(() => setShowConnectOverlay(true), 100);
    };
    const closeConnectOverlay = () => {
        setSlideAnimation('out');
        setTimeout(() => setShowConnectOverlay(false), 100);
    };

    // Giả lập kết nối thành công để giao diện không bị lỗi
    const handleConnect = () => {
        setAccount("0x123...SWC_User");
        setBalance("50");
        setView(View.CONNECTED);
    };

    const handleDisconnect = () => {
        setAccount(null);
        setBalance("0.0");
        setView(View.CONNECT);
    };

    const triggerTestMessageSign = () => {
         WebApp.showAlert("Chức năng xác minh đang được cập nhật cho Cộng đồng SWC!");
    };

    return (
        <div className="flex flex-col h-full min-h-screen w-screen bg-customGrayWallet font-sans">
            {view === View.LANDING && (
                <div className="flex flex-col flex-grow min-h-full justify-end">
                    <div className="components-container mb-2">
                        <SkipButton skip={skip} />
                        <Avatar src={avatarScooter} />
                        <div className="flex flex-col bg-white pt-6 px-8 pb-8 gap-4 rounded-t-3xl shadow-lg">
                            <h2 className="headline text-blue-800 text-2xl font-bold">Cộng Đồng SWC</h2>
                            <p className="text-gray-600">Ứng dụng quản lý tài sản số của Cộng đồng nhà đầu tư uST Việt Nam.</p>
                        </div>
                    </div>
                    <div className="p-4 mb-4">
                        <PrimaryButton title="Bắt Đầu Ngay" callback={skip} />
                    </div>
                </div>
            )}

            {view === View.CONNECT && (
                <div className="components-container">
                    <div className={`transition-all duration-500 ${showConnectOverlay ? 'blur-md' : ''}`}>
                        <div className="flex justify-between p-4">
                            <BackButton goBack={goBack} />
                        </div>
                        <Avatar src={avatarPhone} />
                        <div className="flex flex-col absolute w-full bottom-0 bg-white pt-6 px-8 pb-10 gap-4 rounded-t-3xl shadow-2xl">
                            <h2 className="headline text-xl font-bold text-center">KẾT NỐI VÍ</h2>
                            <EVMConnectModal title="Ví Metamask / Trust" icon={evmConnectIcon} callback={openConnectOverlay} />
                            <TonConnectModal title="Ví Telegram (TON)" icon={tonConnectIcon} />
                        </div>
                    </div>
                    {showConnectOverlay && (
                        <ConnectOverlay slideAnimation={slideAnimation} close={closeConnectOverlay} onConnect={handleConnect} account={account} />
                    )}
                </div>
            )}

            {view === View.CONNECTED && (
                <div className="flex flex-col flex-grow justify-center px-4">
                    <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
                        <Avatar src={avatarTable} />
                        <h2 className="text-green-600 font-bold text-xl mt-4">THÀNH CÔNG!</h2>
                        <p className="text-xs text-gray-400 mt-2 break-all">{account}</p>
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                            <p className="text-gray-500 text-sm">Số dư hiện tại</p>
                            <p className="text-3xl font-black text-blue-900">{balance} SWGT</p>
                        </div>
                        <div className="mt-8 flex flex-col gap-3">
                            <PrimaryButton title="Quản Lý Ví" callback={openWallet} />
                            <button onClick={handleDisconnect} className="text-red-500 text-sm font-medium py-2">Ngắt kết nối</button>
                        </div>
                    </div>
                </div>
            )}

            {view === View.WALLET && (
                <div className="flex flex-col h-full p-6 bg-white rounded-t-3xl mt-10 shadow-2xl">
                    <div className="flex items-center mb-8">
                        <BackButton goBack={goBack} />
                        <h2 className="ml-4 font-bold text-lg text-blue-800">Ví SWC Cá Nhân</h2>
                    </div>
                    <div className="bg-gradient-to-br from-blue-900 to-blue-700 p-6 rounded-2xl text-white shadow-lg">
                        <p className="opacity-80 text-sm">Số dư khả dụng</p>
                        <p className="text-4xl font-bold mt-1">{balance} <span className="text-lg font-light">SWGT</span></p>
                    </div>
                    <div className="flex justify-between mt-8">
                        <TransactionButton text="Gửi" icon={sendIcon} callback={() => {}} />
                        <TransactionButton text="Nhận" icon={receiveIcon} callback={() => {}} />
                        <TransactionButton text="Bán" icon={sellIcon} callback={() => {}} />
                    </div>
                    <div className="mt-10">
                        <p className="font-bold text-gray-800 mb-4">Hoạt động gần đây</p>
                        <TransactionHistoryItem currency="SWGT Token" symbol="SWGT" valueSpot={parseFloat(balance || '0')} />
                    </div>
                    <div className="mt-auto pb-6">
                        <PrimaryButton title="Xác Minh Giao Dịch" callback={triggerTestMessageSign} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
