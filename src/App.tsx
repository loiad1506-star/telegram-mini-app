function App() {
    return (
        <div style={{ backgroundColor: '#121212', color: '#F4D03F', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
            
            <div style={{ textAlign: 'center', padding: '30px 0', borderBottom: '1px solid #333' }}>
                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>CỘNG ĐỒNG SWC</h1>
                <p style={{ color: '#888', fontSize: '14px', marginTop: '5px' }}>Phiên bản thử nghiệm giao diện</p>
            </div>

            <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <p style={{ color: '#FFF', fontSize: '18px', lineHeight: '1.6' }}>
                    🎉 <b>CHÚC MỪNG!</b><br/>
                    Nếu bạn nhìn thấy những dòng chữ này, nghĩa là lỗi màn hình trắng đã bị tiêu diệt hoàn toàn!
                </p>
            </div>

            <div style={{ marginTop: '50px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button style={{ backgroundColor: '#F4D03F', color: '#000', padding: '15px', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', border: 'none' }}>
                    Trang Chủ
                </button>
                <button style={{ backgroundColor: '#222', color: '#F4D03F', padding: '15px', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', border: '1px solid #F4D03F' }}>
                    Ví SWGT của tôi
                </button>
            </div>

        </div>
    );
}

export default App;
