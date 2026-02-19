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
import walletConnectIcon from './assets/wallet_connect.png';
import etherIcon from './assets/ether_icon.png';
import sendIcon from './assets/send_icon.svg';
import receiveIcon from './assets/receive_icon.svg';
import sellIcon from './assets/sell_icon.svg';
import { useTonWallet } from '@tonconnect/ui-react';
import WalletConnectModal from './components/connectors/WalletConnectModal';
import { useDispatch, useSelector } from 'react-redux';
import { setConnectionState } from './redux/connectionSlice';

enum View {
    LANDING = 0,
    CONNECT = 1,
    CONNECTED = 2,
    WALLET = 3,
}

// Thay đổi màu thanh tiêu đề Telegram sang màu xanh đậm của uST/SWC
WebApp.setHeaderColor('#00457C');

const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || '';

function App() {
    const [view, setView] = useState<View>(View.LANDING);

    const connectionState = useSelector(
        (state: RootState) => state.connection.connectionState
    );

    const dispatch = useDispatch<AppDispatch>();

    const skip = () => {
        setView(view + 1);
    };
    const goBack = () => {
        if (view === View.LANDING) {
            return;
        }
        setView(view - 1);
    };

    const openWallet = () => {
        setView(View.WALLET);
    };

    const [account, setAccount] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);

    const getAccountData = async () => {
        const providerId = window.localStorage.getItem('providerId');
        await axios
            .get(BRIDGE_URL + '/account/' + providerId, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
            })
            .then((response) => {
                setAccount(response.data.account);
                setBalance(response.data.balance);
            });
    };

    const handleConnect = () => {
        dispatch(setConnectionState('connected'));
        setView(View.CONNECTED);
    };

    useEffect(() => {
        if (view === View.CONNECTED) {
            getAccountData();
        }
    }, [view]);

    const tonWallet = useTonWallet();
    useEffect(() => {
        if (!tonWallet) return;
    }, [tonWallet]);

    const [signedMessage, setSignedMessage] = useState<string | null>(null);
    const triggerTestMessageSign = () => {
        const providerId = window.localStorage.getItem('providerId');
        if (!providerId) return;
        
        const wallet = window.localStorage.getItem('walletProvider');
        if (!wallet) return;

        const uri = window.localStorage.getItem('walletConnectURI');

        if (wallet === 'metamask') {
            WebApp.openLink(`https://metamask.app.link/wc?uri=${uri}`);
        } else if (wallet === 'trust') {
            WebApp.openLink(`https://link.trustwallet.com/wc?uri=${uri}`);
        }

        axios
            .post(BRIDGE_URL + '/sign', {
                message: 'Xác nhận kết nối Cộng đồng SWC',
                account: account,
                providerId: providerId,
            })
            .then((response) => {
                setSignedMessage(response.data.signature);
            });
    };

    const sendFunds = () => {};
    const receiveFunds = () => {};
    const sell = () => {};

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
        WebApp.showConfirm(
            'Bạn có chắc chắn muốn ngắt kết nối ví?',
            async (confirmed: boolean) => {
                if (!confirmed) return;
                window.localStorage.removeItem('providerId');
                window.localStorage.removeItem('walletConnectURI');
                window.localStorage.removeItem('walletProvider');
                window.localStorage.removeItem('walletconnect');
                dispatch(setConnectionState('disconnected'));
                setSignedMessage(null);
                setView(View.CONNECT);

                await axios.post(BRIDGE_URL + '/disconnect', {
                    providerId: window.localStorage.getItem('providerId'),
                });
            }
        );
    };

    return (
        <div className="flex flex-col h-full min-h-screen w-screen rounded-xl bg-customGrayWallet">
            {view === View.LANDING && (
                <div className="flex flex-col flex-grow min-h-full justify-end">
                    <div className="components-container mb-2">
                        <SkipButton skip={skip} />
                        <Avatar src={avatarScooter} />
                        <div className="flex flex-col bg-white pt-4 pr-8 pb-8 pl-8 gap-4 rounded-t-3xl rounded-b-xl shadow-custom-white">
                            <div>
                                <h2 className="headline text-blue-900">
                                    Cộng Đồng SWC Việt Nam
                                </h2>
                            </div>
                            <div>
                                <p className="text-customGrayText mt-0 mr-0 mb-4 ml-0">
                                    Chào mừng bạn đến với ứng dụng quản lý tài sản số của Cộng đồng nhà đầu tư uST.
                                </p>
                                <p className="text-customGrayText mt-0 mr-0 mb-4 ml-0">
                                    Hãy kết nối ví của bạn để bắt đầu tham gia các hoạt động và nhận phần thưởng từ hệ sinh thái.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-2 mb-4">
                        <PrimaryButton
                            title="Bắt Đầu Kết Nối"
                            callback={skip}
                        />
                    </div>
                </div>
            )}
            {view === View.CONNECT && (
                <div className="components-container">
                    <div className={`transition-opacity duration-1000 ease-in-out ${showConnectOverlay && 'blur-sm brightness-90'}`}>
                        <div className="flex justify-between">
                            <BackButton goBack={goBack} />
                            {connectionState === 'connected' && <SkipButton skip={skip} />}
                        </div>
                        <Avatar src={avatarPhone} />
                        <div className="flex flex-col absolute w-full bottom-0 bg-white pt-4 px-8 pb-14 gap-4 rounded-t-3xl rounded-b-xl shadow-custom-white">
                            <h2 className="headline">KẾT NỐI VÍ</h2>
                            <EVMConnectModal
                                title="Ví EVM (Metamask/Trust)"
                                icon={evmConnectIcon}
                                callback={openConnectOverlay}
                            />
                            <TonConnectModal
                                title="Ví TON"
                                icon={tonConnectIcon}
                            />
                        </div>
                    </div>
                    {showConnectOverlay && (
                        <ConnectOverlay
                            slideAnimation={slideAnimation}
                            close={closeConnectOverlay}
                            onConnect={handleConnect}
                            account={account}
                        />
                    )}
                </div>
            )}
            {view === View.CONNECTED && (
                <>
                    <div className="components-container mb-2">
                        <BackButton goBack={goBack} />
                        <Avatar src={avatarTable} />
                        <div className="flex flex-col bg-white pt-4 px-8 pb-2 min-h-fit gap-2 rounded-t-3xl rounded-b-xl shadow-custom-white">
                            <h2 className="headline text-green-600">THÀNH CÔNG!</h2>
                            <div className="text-xs break-all font-semibold text-center text-customGrayAddress">
                                <p className="my-0 mx-auto">{account}</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="flex justify-between items-center gap-4 text-lg font-semibold">
                                    <p className="m-0">Tổng số dư</p>
                                    <Tooltip
                                        headline="Số dư"
                                        content="Tổng số tài sản hiện có trong ví của bạn."
                                    />
                                </div>
                                <div className="text-2xl font-bold mb-4">
                                    {balance || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 p-2 mb-4">
                        <PrimaryButton
                            title="Vào Ví Của Tôi"
                            callback={openWallet}
                        />
                        <div>
                            <PrimaryButton
                                title="Ngắt Kết Nối"
                                className="bg-red-200 border border-red-300 active:bg-red-300"
                                textColor="customBlackText"
                                callback={handleDisconnect}
                            />
                        </div>
                    </div>
                </>
            )}
            {view === View.WALLET && (
                <div className="h-screen bg-customGrayWallet rounded-t-xl">
                    <BackButton goBack={goBack} />
                    <div className="flex flex-col gap-4 p-4">
                        <div className="flex flex-col">
                            <p className="m-0 text-xl font-semibold">Tổng số dư</p>
                            <p className="m-0 text-5xl font-extrabold">
                                <span className="text-customGrayAddress text-2xl mr-2">TOKEN</span>
                                {balance || 0}
                            </p>
                        </div>
                        <div className="flex justify-around gap-4 py-4 px-8">
                            <TransactionButton text="Gửi" icon={sendIcon} callback={sendFunds} />
                            <TransactionButton text="Nhận" icon={receiveIcon} callback={receiveFunds} />
                            <TransactionButton text="Bán" icon={sellIcon} callback={sell} />
                        </div>
                        <div className="flex flex-col min-h-32 gap-2">
                            <TransactionHistoryItem currency="SWGT Token" symbol="SWGT" valueSpot={parseFloat(balance || '0.0')} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <PrimaryButton
                                title="Xác minh giao dịch thử nghiệm"
                                callback={triggerTestMessageSign}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
