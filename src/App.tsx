import { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';
import { AppDispatch, RootState } from './redux/store';

import Avatar from './components/utils/Avatar';
import BackButton from './components/buttons/BackButton';
import SkipButton from './components/buttons/SkipButton';
import PrimaryButton from './components/buttons/PrimaryButton';
import Tooltip from './components/utils/Tooltip';
import TransactionButton from './components/buttons/TransactionButton';
import TransactionHistoryItem from './components/utils/TransactionHistoryItem';
import ConnectOverlay from './components/connectOverlay/ConnectOverlay';

import EVMConnectModal from './components/connectors/EVMConnectModal';
import TonConnectModal from './components/connectors/TonConnectModal';

import avatarPhone from './assets/avatar_phone.svg';
import avatarScooter from './assets/avatar_scooter.svg';
import avatarTable from './assets/avatar_table.svg';

import evmConnectIcon from './assets/EVM_connect_logos.png';
import tonConnectIcon from './assets/ton_connect.png';
import sendIcon from './assets/send_icon.svg';
import receiveIcon from './assets/receive_icon.svg';
import sellIcon from './assets/sell_icon.svg';
import { useTonWallet } from '@tonconnect/ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { setConnectionState } from './redux/connectionSlice';

enum View {
    LANDING = 0,
    CONNECT = 1,
    CONNECTED = 2,
    WALLET = 3,
}

// Màu thương hiệu uST/SWC (Xanh đậm)
WebApp.setHeaderColor('#00457C');

const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || '';

function App() {
    const [view, setView] = useState<View>(View.LANDING);
    const connectionState = useSelector((state: RootState) => state.connection.connectionState);
    const dispatch = useDispatch<AppDispatch>();

    const skip = () => setView(view + 1);
    const goBack = () => {
        if (view !== View.LANDING) setView(view - 1);
    };
    const openWallet = () => setView(View.WALLET);

    const [account, setAccount] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);

    const getAccountData = async () => {
        const providerId = window.localStorage.getItem('providerId');
        if (!providerId) return;
        try {
            const response = await axios.get(`${BRIDGE_URL}/account/${providerId}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            setAccount(response.data.account);
            setBalance(response.data.balance);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu ví:", error);
        }
    };

    const handleConnect = () => {
        dispatch(setConnectionState('connected'));
        setView(View.CONNECTED);
    };

    useEffect(() => {
        if (view === View.CONNECTED) getAccountData();
    }, [view]);

    const tonWallet = useTonWallet();
    useEffect(() => {
        if (tonWallet) {
            // Xử lý ví TON nếu cần
        }
    }, [tonWallet]);

    const [signedMessage, setSignedMessage] = useState<string | null>(null);
    
    const triggerTestMessageSign = async () => {
        const providerId = window.localStorage.getItem('providerId');
        const wallet = window.localStorage.getItem('walletProvider');
        const uri = window.localStorage.getItem('walletConnectURI');

        if (!providerId || !wallet || !uri) return;

        if (wallet === 'metamask') {
            WebApp.openLink(`https://metamask.app.link/wc?uri=${uri}`);
        } else if (wallet === 'trust') {
            WebApp.openLink(`https://link.trustwallet.com/wc?uri=${uri}`);
        }

        try {
            const response = await axios.post(`${BRIDGE_URL}/sign`, {
                message: 'Xác nhận kết nối Cộng đồng SWC',
                account: account,
                providerId: providerId,
            });
            setSignedMessage(response.data.signature);
        } catch (error) {
            console.error("Lỗi ký tin nhắn:", error);
        }
    };

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

    const handleDisconnect = async () => {
        WebApp.showConfirm('Bạn có chắc chắn muốn ngắt kết nối ví?', async (confirmed) => {
            if (!confirmed) return;
            const pid = window.localStorage.getItem('providerId');
            window.localStorage.clear();
            dispatch(setConnectionState('disconnected'));
            setSignedMessage(null);
            setView(View.CONNECT);
            if (pid) await axios.post(`${BRIDGE_URL}/disconnect`, { providerId: pid });
        });
    };

    return (
        <div className="flex flex-col h-full min-h-screen w-screen rounded-xl bg-customGrayWallet font-sans">
            {view === View.LANDING && (
                <div className="flex flex-col flex-grow min-h-full justify-end">
                    <div className="components-container mb-2">
                        <SkipButton skip={skip} />
                        <Avatar src={avatarScooter} />
                        <div className="flex flex-col bg-white pt-6 px-8 pb-8 gap-4 rounded-t-3xl shadow-lg">
                            <h2 className="headline text-blue-800 text-2xl font-bold">Cộng Đồng SWC</h2>
                            <p className="text-gray-600">Chào mừng bạn đến với ứng dụng quản lý tài sản số của Cộng đồng nhà đầu tư uST Việt Nam.</p>
                            <p className="text-gray-600 text-sm italic">Kết nối ví để nhận phần thưởng SWGT từ hệ sinh thái.</p>
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
                            <h2 className="headline text-xl font-bold text-center">KẾT NỐI VÍ CỦA BẠN</h2>
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
                        <h2 className="text-green-600 font-bold text-xl mt-4">KẾT NỐI THÀNH CÔNG</h2>
                        <p className="text-xs text-gray-400 mt-2 break-all">{account}</p>
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                            <p className="text-gray-500 text-sm">Tổng số dư khả dụng</p>
                            <p className="text-3xl font-black text-blue-900">{balance || 0} SWGT</p>
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
                        <h2 className="ml-4 font-bold text-lg">Ví Cá Nhân</h2>
                    </div>
                    <div className="bg-gradient-to-br from-blue-900 to-blue-700 p-6 rounded-2xl text-white shadow-lg">
                        <p className="opacity-80 text-sm">Số dư hiện tại</p>
                        <p className="text-4xl font-bold mt-1">{balance || 0} <span className="text-lg font-light">SWGT</span></p>
                    </div>
                    <div className="flex justify-between mt-8">
                        <TransactionButton text="Gửi" icon={sendIcon} callback={() => {}} />
                        <TransactionButton text="Nhận" icon={receiveIcon} callback={() => {}} />
                        <TransactionButton text="Bán" icon={sellIcon} callback={() => {}} />
                    </div>
                    <div className="mt-10">
                        <p className="font-bold text-gray-800 mb-4">Lịch sử giao dịch</p>
                        <TransactionHistoryItem currency="SWGT Token" symbol="SWGT" valueSpot={parseFloat(balance || '0.0')} />
                    </div>
                    <div className="mt-auto pb-6">
                        <PrimaryButton title="Xác Minh Giao Dịch" callback={triggerTestMessageSign} />
                        {signedMessage && <p className="text-[10px] text-gray-400 mt-2 break-all">ID: {signedMessage}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
