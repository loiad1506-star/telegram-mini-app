import os
import json
import asyncio
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from telegram import Update, constants, InlineKeyboardButton, InlineKeyboardMarkup, ChatMember
from telegram.ext import ApplicationBuilder, ContextTypes, MessageHandler, filters, ChatMemberHandler, CommandHandler
from flask import Flask
from threading import Thread
import google.generativeai as genai
import random 
from datetime import datetime, timedelta, timezone
from datetime import time as dt_time
import re 
import requests
from bs4 import BeautifulSoup
import feedparser
import logging

# ==============================================================================
# CẤU HÌNH & DỮ LIỆU
# ==============================================================================
SHEET_NAME = "Du_Lieu_Bot_SWC" 
CHANNEL_ID = -1001308148293  
GROUP_ID_TO_SEED = -1001598921227 

ADMIN_IDS = [507318519, 7515902413, 8364834164]
ALLOWED_GROUPS = [-1001598921227]

API_KEYS = [
    "AIzaSyAjgCXgRMkdIA6T-kWldjeC3-QFs4BOjmc",
    "AIzaSyD0EAq5g4NKH5Lm3fhAlfiOCvk7q2mOQkU",
    "AIzaSyA7KNfUpUPPiIZw_5azB4rtHfJkiieomUE",
    "AIzaSyDxlJcJuxtMUXSWbxrU2PGSAHZ-xzOJam8" 
]

AI_MODELS = [
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-exp-1206'
]

SIGNATURE = """
👉 Cộng đồng Nhà đầu tư Giá trị & Tự do Tài chính:
✅ Telegram: https://t.me/swc_capital_vn
🌐 Website: https://swc.capital/vi
"""

LAST_WELCOME_MSG = {} 
MESSAGE_COUNTER = 0
FORWARD_MAP = {}
POSTED_NEWS = set()

# ==============================================================================
# PHẦN 1: "BỘ NÃO" MENTOR
# ==============================================================================
SYSTEM_PROMPT = """
Bạn là CỐ VẤN ĐẦU TƯ (MENTOR) cấp cao của Sky World Community Việt Nam.

QUY TẮC SỐ 1: KIỂM SOÁT ĐỘ DÀI VÀ PHÂN LOẠI Ý ĐỊNH (SỐNG CÒN)
Khi nhận tin nhắn, HÃY TỰ ĐỘNG PHÂN LOẠI và áp dụng ĐÚNG luật sau:
  + NẾU LÀ "GIAO TIẾP XÃ GIAO" (Hỏi ngày tháng, chào hỏi, cảm ơn): CỰC KỲ NGẮN GỌN (Dưới 20 chữ). Chỉ trả lời đúng trọng tâm câu hỏi. NGHIÊM CẤM tuyệt đối việc đưa kiến thức, triết lý, hay nhắc đến SWC/dự án vào câu này.
  + NẾU LÀ "PHÂN TÍCH TIN TỨC / VĨ MÔ": Đóng vai Cáo già kinh tế. Dựa vào NGÀY HÔM NAY và các chỉ số (FED, CPI, DXY, M2...). BẮT BUỘC đưa ra NHẬN ĐỊNH CÁ NHÂN sắc bén, độc lập. Sau đó khéo léo định hướng dòng tiền về nơi an toàn.
  + NẾU LÀ "CÂU HỎI KIẾN THỨC/DỰ ÁN": Trả lời thẳng thắn, đúng trọng tâm. Dùng ví dụ đời thường. Tối đa 2-3 đoạn văn ngắn.
  + NẾU LÀ "THAN VÃN / MẤT KIÊN NHẪN": Xoa dịu cảm xúc trước, sau đó dùng triết lý "Cáo Già", "Chữ Nhẫn" để thức tỉnh họ một cách điềm đạm.
  + NẾU LÀ "TÍCH CỰC / KHOE THÀNH QUẢ": Chúc mừng, tán thưởng tầm nhìn của họ, đẩy năng lượng nhóm lên.

QUY TẮC SỐ 2: PHONG CÁCH TRÒ CHUYỆN
- Tông giọng: Điềm đạm, chân thành, đôi khi hóm hỉnh, hài hước và sắc sảo có chiều tư duy sâu.
- Xưng hô: Tôi. TUYỆT ĐỐI KHÔNG gọi khách là cháu, là em.
- Kỹ thuật: Viết liền mạch như văn nói. Không chia "Phần 1", "Kết luận". Dùng câu hỏi tu từ để khơi gợi tư duy. Dùng emoji vừa phải (🚀, 💰, 📈, 🌱).
- TUYỆT ĐỐI KHÔNG DÙNG dấu sao (*, **) để bôi đậm.

QUY TẮC SỐ 3: NHIỆM VỤ CHIẾN LƯỢC (ĐỊNH HƯỚNG TẬP TRUNG)
- Giáo dục 32 kỹ năng mềm, nhân tính, 17 tư duy triệu phú. Không hô hào mua bán (FOMO).
- TẬP TRUNG MẠNH NHẤT VÀO SKY WORLD COMMUNITY (SWC), QUẢN LÝ TÀI CHÍNH CÁ NHÂN, ĐẦU TƯ VÀO SWC FIELD & SWC PASS: Giải thích rõ SWC là cỗ máy in tiền mặt ngay hiện tại, giúp NĐT xây dựng dòng tiền. Nâng tầm vị thế quỹ SWC.
- HẠN CHẾ NHẮC ĐẾN uST, uTerra, SWGT (CHỈ NHẮC KHI KHÁCH HỎI TRỰC TIẾP). Xem đó là "Viên kim cương thô" cần 3-5-7 năm.
"""

# ==============================================================================
# PHẦN 2: KHO KIẾN THỨC
# ==============================================================================
KIEN_THUC_PHAT_TRIEN_BAN_THAN = """
🔥 17 TƯ DUY TRIỆU PHÚ (T. Harv Eker):
1. Người giàu tin: "Tôi tạo ra cuộc đời tôi". Người nghèo tin: "Cuộc sống đầy những bất ngờ".
2. Người giàu tham gia cuộc chơi tiền bạc để thắng. Người nghèo tham gia để không bị thua.
3. Người giàu quyết tâm giàu có. Người nghèo muốn trở thành giàu có.
4. Người giàu suy nghĩ lớn. Người nghèo suy nghĩ nhỏ.
5. Người giàu tập trung vào các cơ hội. Người nghèo tập trung vào những khó khăn.
6. Người giàu ngưỡng mộ những người giàu có khác. Người nghèo ghen ghét, đố kỵ.
7. Người giàu kết giao với người thành công và tích cực. Người nghèo giao du với người thất bại.
8. Người giàu sẵn sàng tôn vinh bản thân. Người nghèo suy nghĩ tiêu cực về bán hàng.
9. Người giàu đứng cao hơn những vấn đề của họ. Người nghèo đứng thấp hơn vấn đề.
10. Người giàu biết đón nhận. Người nghèo không biết đón nhận.
11. Người giàu muốn được trả công theo kết quả. Người nghèo muốn trả công theo thời gian.
12. Người giàu chọn cả hai. Người nghèo chỉ chọn một.
13. Người giàu chú trọng vào tổng tài sản. Người nghèo chú trọng thu nhập từ lương.
14. Người giàu quản lý tiền của họ rất giỏi. Người nghèo không biết quản lý tiền.
15. Người giàu bắt tiền phải "phục vụ" mình. Người nghèo làm việc vất vả để kiếm tiền.
16. Người giàu hành động bất chấp nỗi sợ hãi. Người nghèo để nỗi sợ hãi ngăn cản họ.
17. Người giàu luôn học hỏi và phát triển. Người nghèo nghĩ họ đã biết tất cả.

🔥 TRIẾT LÝ CỔ NHÂN & ĐẠO LÀM NGƯỜI:
- Nhân Quả: Tiền bạc là "Quả", đạo đức là "Nhân". Có đức mặc sức mà ăn.
- Lão Tử: "Thượng thiện nhược thủy" - Người giỏi nhất như nước, uyển chuyển luân chuyển vốn.
- Khổng Tử: "Kỷ sở bất dục, vật thi ư nhân". Quản lý cảm xúc mới quản lý được triệu đô.
- Tam Quốc: Tư Mã Ý (Chữ NHẪN - Mài gươm 10 năm vung 1 nhát). Tào Tháo (Dùng người không nghi).
- Học 7 điều: Nhận lỗi, Nhu hòa, Nhẫn nhịn, Thấu hiểu, Buông bỏ, Cảm động, Sinh tồn.

🔥 QUY TẮC 6 CHIẾC LỌ: 55% Thiết yếu, 10% Tiết kiệm, 10% Giáo dục, 10% Hưởng thụ, 10% Tự do TC, 5% Cho đi.
"""

KIEN_THUC_TAI_CHINH = """
🔥 BỨC TRANH VĨ MÔ & CHỈ SỐ KINH TẾ:
- Lãi suất FED & Cung tiền M2: Khi FED hạ lãi suất và bơm tiền (M2 tăng), tiền rẻ ngập tràn, tài sản rủi ro (chứng khoán, crypto) tăng giá. Khi thắt chặt, tiền rút về, bong bóng vỡ. "Cáo già" luôn theo sát van bơm/hút này.
- Lạm phát (CPI) & Tỷ giá (DXY): CPI là kẻ thù của tiền mặt. DXY (Sức mạnh USD) tăng sẽ gây áp lực tỷ giá lên các nước đang phát triển, làm khối ngoại rút ròng (FDI/FII).
- Tư duy đọc tin tức: Tin tức sinh ra để hợp thức hóa đường đi của giá. Khi tin tốt ra ngập tràn mặt báo là lúc đám đông say máu -> Lúc đó dòng tiền thông minh (Smart Money) đang âm thầm xả hàng (Phân phối).

🔥 PHÂN TÍCH VI MÔ & HÀNH VI DÒNG TIỀN:
- Doanh nghiệp thực chất: Chỉ những nơi tạo ra giá trị thặng dư thực sự (Sản xuất, công nghệ lõi, nông nghiệp) mới sống sót qua khủng hoảng.
- Miễn phí là cái bẫy đắt nhất. Tiền là công cụ, hãy kiểm soát nó. Vùng đáy hoảng loạn thì gom, đỉnh hưng phấn thì chốt lời dần.
- Nhận định xu hướng: Vàng/Bạc luôn là hầm trú ẩn dài hạn. Chứng khoán/BĐS phân hóa khốc liệt, chỉ có dòng tiền thực mới sống.

🔥 RWA (TÀI SẢN THẾ GIỚI THỰC MÃ HÓA):
- Token hóa tài sản thực (RWA): Thế hệ tiếp theo của tài chính. Ứng dụng Blockchain đại diện quyền sở hữu tài sản dưới dạng token kỹ thuật số.
- Tối ưu hóa thanh toán: Cho phép thanh toán tức thì, giảm rủi ro đối tác, loại bỏ trung gian bằng Hợp đồng thông minh, giảm chi phí.
- Dân chủ hóa & Thanh khoản: Chia nhỏ tài sản (Fractionalization) giúp mở rộng tệp NĐT, biến tài sản vốn lớn thành đơn vị nhỏ dễ mua bán.
- Cầu nối tương hỗ: Không triệt tiêu tài chính truyền thống (TradFi) mà làm cầu nối với Web3.
- Pháp lý nghiêm ngặt: Khác DeFi/Crypto thiếu kiểm soát, RWA yêu cầu tuân thủ pháp lý, bảo vệ NĐT, KYC/AML rõ ràng.
- Bản chất: Đây là hành động MUA TÀI SẢN. Cần chọn nền tảng uy tín, có Audit, không Fomo.

🔥 ĐẦU TƯ MẠO HIỂM QUỐC TẾ:
- Cần hiểu luật thuế, kinh tế, văn hóa.
- Thị trường phát triển (Mỹ, EU): Minh bạch, quản lý chặt. Thị trường đang phát triển: Tăng trưởng khủng nhưng cần Due Diligence (thẩm định) kỹ.

🔥 Công thức giúp bạn hiểu rõ về quản lý tài chính cá nhân.
1. Hai công thức quan trọng của tài chính cá nhân
- Công thức thứ nhất là công thức thu nhập ròng. Tổng thu nhập trừ tất cả các khoản chi phí chi tiêu, sẽ ra thu nhập ròng — là khoản mà các bạn có thể tích luỹ được hàng tháng, hàng năm.
- Công thức thứ hai là công thức tài sản ròng. Tổng tài sản trừ đi tất cả các khoản nợ, sẽ ra tài sản ròng. Tài sản ròng là thứ đo sự giàu có về tiền của mỗi chúng ta.
2. Làm sao để tăng thu nhập ròng
- Để tăng thu nhập ròng, chúng ta cần tối đa hoá tất cả các khoản thu nhập. Ngoài lương, chúng ta phải cố gắng để đạt thêm thưởng. Ngoài công việc hiện tại, chúng ta còn cố gắng làm thêm những việc khác để tăng thu nhập của mình. 
- Việc thứ hai chúng ta cần làm là phải quản lý chi phí chi tiêu. Chi phí chi tiêu gồm hai mục: nhu cầu thiết yếu, tiếng Anh gọi là NEED, như là ăn ở, đi lại, học tập và giải trí.
- Loại chi phí chi tiêu thứ hai là nhu cầu mong muốn, tiếng Anh gọi là WANT. 
- Là những chi phí chi tiêu trên sự mong muốn của chúng ta, có cũng được mà không có cũng không ảnh hưởng lớn đến sự phát triển của cá nhân chúng ta. Chẳng hạn như là uống cà phê quá nhiều, nhậu nhẹt quá nhiều, đi du lịch quá nhiều, mua quần áo hay là đồ công nghệ cao cấp quá nhiều. Tức là những chi tiêu mà nó không quá cần thiết với cuộc sống của chúng ta.
- Một cách lý tưởng thì người ta chia tổng thu nhập ra làm 3 phần. Tổng thu nhập là 100%, thì chi tiêu cho nhu cầu thiết yếu là 50%, chi tiêu cho nhu cầu mong muốn là 30%, và còn lại thu nhập ròng là 20%. Tức là 50%, 30% và 20%. 
- Nhưng để đảm bảo rằng chúng ta có thu nhập ròng và có thể tích luỹ được, thì chúng ta hãy đổi từ công thức 50-30-20 qua công thức 20%, 30% và 50%. Tức là mỗi khi có thu nhập, chúng ta hãy trích ra 20% để tích luỹ ngay lập tức. Và còn lại 50% chi tiêu cho nhu cầu thiết yếu.
- Phần cuối cùng là 30% chi tiêu cho nhu cầu mong muốn. Và 30% cho nhu cầu mong muốn này là ở cuối cùng và có thể cắt giảm nếu như chúng ta muốn tăng cái tích luỹ lên hoặc là chúng ta tăng cái nhu cầu thiết yếu.
3. Chi tiết của công thức tài sản ròng
- Công thức thứ hai quan trọng thứ hai là công thức tài sản ròng.
- Tổng tài sản trừ tất cả loại nợ sẽ ra tài sản ròng. Tài sản ròng, tiếng Anh gọi là Net Worth. Và tài sản ròng đảm bảo cho chúng ta có cuộc sống hưu trí, cũng như tài sản ròng giúp chúng ta đạt độc lập và tự do về tài chính. 
- Về tài sản có những loại sau đây.
3.1 Thứ nhất là loại tài sản thanh khoản.
- Trong tài sản thanh khoản có 2 thành phần: Phần 1 là tài sản thanh khoản nhưng không tăng trưởng hoặc ít tăng trưởng. Phần này bao gồm: tiền mặt, tiền trong tài khoản thanh toán ngân hàng, tiền trong ví điện tử và tiền được gửi vào những nơi không sinh ra tiền. Phần 2 là những tài sản kiểu như ngoại tệ, vàng: vừa có tính thanh khoản vừa tăng trưởng
3.2 Thứ hai là là tài sản tăng trưởng.
- Tài sản tăng trưởng bào gồm: Phần góp vốn, đầu tư vào doanh nghiệp, mình đầu tư trực tiếp, mình khởi nghiệp thì cũng là tài sản. Hoặc là chứng khoán gồm có cổ phiếu, trái phiếu, chứng chỉ quỹ đầu tư, hoặc là bất động sản: nhà, đất, căn hộ, chung cư. Tài sản tăng trưởng còn gồm những đồng tiền số, tiền mã hóa “chính thức” đã xác định được giá trị.
3.3. Thứ ba là tài sản mạo hiểm.
- Tài sản mạo hiểm là những loại tài sản mà lợi nhuận cao, rủi ro cũng cao, là những tài khoản mà chúng ta lướt sóng như vàng, ngoại tệ, chứng khoán phái sinh, tiền số chưa xác định được giá trị bền vững  và cũng bao gồm những loại tài sản sưu tầm để đầu cơ.
3.4. Thứ tư là tài sản cần thiết như nhà ở, xe
- Đây là những tài sản cần thiết cho cuộc sống. Chúng có thể tăng trưởng ít, hoặc giảm nhẹ theo thời gian
3.5. Thứ năm là tài sản sử dụng, tiêu sản
- Định nghĩa một cách cực đoan, tiêu sản là những cái tài sản mà cái giá trị của nó giảm đi theo thời gian. Xe, TV, máy ảnh, những cái đồ công nghệ cao là tiêu sản.
- Nợ nó sẽ gồm là những cái nợ không có lãi suất, do chúng ta vay từ gia đình hay bạn bè, và những khoản nợ mà chúng ta vay có lãi suất gồm vay ngắn hạn và vay dài hạn. Tổng tài sản trừ nợ sẽ ra tài sản ròng. Nhiệm vụ hết sức quan trọng của chúng ta là phải tăng tài sản ròng.
4. Làm sao để tăng tài sản ròng. Để tăng tài sản ròng thì có 3 cách chủ yếu sau đây:
4.1 Cách thứ nhất là chúng ta tăng thu nhập ròng hàng tháng, hàng năm. Thu nhập ròng sẽ làm tăng tiền mặt và chúng ta sẽ phân bổ tiền mặt này vào những loại tài sản tăng trưởng. 
4.2 Thứ hai là tài sản chúng ta phải tăng trưởng. Tăng trưởng nghĩa là nó tăng giá hoặc là nó sinh ra lãi.
- Như vậy rõ ràng nhìn vào đây, nếu mà chúng ta để quá nhiều tiền mặt hoặc là tiền trong tài khoản thanh toán thì những tiền này là không có tăng trưởng. Hoặc là chúng ta có quá nhiều tài sản sử dụng — nó giúp chúng ta sung sướng, thỏa mãn được cái cảm giác của mình, nhưng nó cũng làm giảm cái sự tăng trưởng của tài sản. Cái mấu chốt của việc quản lý thu nhập ròng là làm sao quản lý được các cái loại tài sản này để tài sản tăng trưởng. 
4.3 Cái thứ ba là giảm nợ có lãi suất cao.
- Những món nợ có lãi suất cao hơn tốc độ tăng trưởng của tài sản, cao hơn tỷ lệ lợi nhuận của tài sản thì chúng ta phải giảm đi. Và những món nợ có lãi suất thấp thì chúng ta giữ lại bởi vì nó tạo được cái hiệu quả đòn bẩy, giúp cho tài sản ròng của chúng ta tăng trưởng tốt hơn.
- Nhưng tổng nợ không được chiếm tỷ lệ quá nhiều so với tổng tài sản, bởi vì khi đó nó sẽ tạo ra rủi ro cho việc quản lý tài sản của chúng ta.
Tóm lại, để tăng tài sản ròng, chúng ta có 3 cách chính là: 1) tăng thu nhập ròng, 2) phân bổ tài sản vào những tài sản tăng trưởng có tỷ suất lợi nhuận cao, 3) giảm nợ có lãi suất cao. 

🔥  Bí Quyết Xây Dựng Tài Chính Cá Nhân Vững Chắc
- Trong cuộc sống hiện đại, tối đa hóa thu nhập không chỉ là cách để đáp ứng các nhu cầu cơ bản mà còn là chìa khóa để xây dựng một tương lai tài chính an toàn và đạt được tự do tài chính. Kiếm tiền càng nhiều càng tốt không chỉ là một mục tiêu mà còn là chiến lược giúp bạn vượt qua thách thức kinh tế, tích lũy tài sản và sống cuộc đời mà bạn mong muốn. Vậy tại sao cần tối đa hóa thu nhập, và làm thế nào để thực hiện điều đó? Hãy cùng khám phá.
1. Tại sao tối đa hóa thu nhập là tâm điểm của tài chính cá nhân?
Tối đa hóa thu nhập là nền tảng của tài chính cá nhân, không chỉ giúp bạn chi trả các chi phí thiết yếu mà còn tạo điều kiện để nâng cao chất lượng cuộc sống, bảo vệ bản thân trước rủi ro và đóng góp cho xã hội.
1.1. Đáp ứng nhu cầu và nâng tầm chất lượng cuộc sống
Thu nhập cao cho phép bạn dễ dàng chi trả cho các nhu cầu cơ bản như nhà ở, thực phẩm, y tế và giáo dục. Hơn thế nữa, khi kiếm được nhiều tiền, bạn có thể nâng cấp cuộc sống: chuyển từ thuê nhà sang sở hữu nhà riêng, đầu tư vào giáo dục chất lượng cao cho con cái, hoặc tận hưởng những kỳ nghỉ sang trọng. Một mức thu nhập lớn mở ra cánh cửa đến một cuộc sống vượt trội.
1.2. Xây dựng lá chắn tài chính chống lại rủi ro
Kiếm được nhiều tiền giúp bạn chuẩn bị tốt hơn cho những tình huống bất ngờ. Một quỹ dự phòng khẩn cấp lý tưởng, đủ để trang trải 6-12 tháng chi phí sinh hoạt, chỉ khả thi khi thu nhập vượt xa chi tiêu hàng ngày. Khoản dự phòng này giúp bạn vượt qua khó khăn như mất việc, ốm đau hoặc các chi phí đột xuất mà không phải vay nợ.
1.3. Tăng cường cơ hội đầu tư và phát triển tài sản
Thu nhập lớn mang lại nhiều vốn hơn để đầu tư vào các tài sản như cổ phiếu, bất động sản, quỹ mở hoặc kinh doanh cá nhân. Đây là cách để gia tăng tài sản và tiến gần hơn đến tự do tài chính – trạng thái mà bạn có thể sống thoải mái nhờ lợi nhuận từ tài sản thay vì phải làm việc trực tiếp.
1.4. Tạo động lực và sự tự tin tài chính
Khi bạn tối đa hóa thu nhập, mỗi đồng tiền kiếm được là minh chứng cho nỗ lực và khả năng của bạn. Điều này không chỉ mang lại niềm tự hào mà còn khơi dậy động lực để đặt ra những mục tiêu tài chính cao hơn, chẳng hạn như sở hữu một doanh nghiệp riêng hoặc đạt thu nhập hàng trăm triệu đồng mỗi tháng.
1.5. Đóng góp ý nghĩa cho xã hội
Thu nhập cao không chỉ cải thiện cuộc sống cá nhân mà còn cho phép bạn tạo ra tác động tích cực đến cộng đồng. Với nguồn lực tài chính dồi dào, bạn có thể hỗ trợ gia đình, tham gia các hoạt động từ thiện hoặc đầu tư vào các dự án xã hội, góp phần xây dựng một xã hội tốt đẹp hơn.

2. Chiến lược tối đa hóa thu nhập cho mọi đối tượng
Để tăng thu nhập tối đa, bạn cần áp dụng những chiến lược phù hợp, tận dụng thế mạnh và cơ hội sẵn có. Dưới đây là các phương pháp hiệu quả:
2.1. Tận dụng thời điểm vàng khi còn trẻ
Tuổi trẻ là thời kỳ lý tưởng để kiếm tiền nhiều nhất có thể. Với sức khỏe, sự sáng tạo và khả năng học hỏi nhanh, bạn có thể làm việc với cường độ cao và thử sức ở nhiều lĩnh vực. Ở các nước như Mỹ hay châu Âu, nhiều người trẻ làm hai công việc hoặc kết hợp công việc chính với dự án phụ để tăng thu nhập. Tại Việt Nam, bạn cũng có thể làm thêm ngoài giờ, học kỹ năng mới hoặc khởi nghiệp nhỏ.
2.2. Đa dạng hóa nguồn thu nhập
Đừng phụ thuộc vào một nguồn thu nhập duy nhất. Thời đại số mang đến nhiều cơ hội để đa dạng hóa:
Kiếm tiền online: Làm freelancer (thiết kế, viết lách, lập trình) qua các nền tảng như Upwork hoặc Fiverr, với thu nhập tiềm năng từ 10-50 triệu đồng mỗi tháng nếu chăm chỉ.
Kinh doanh cá nhân: Bán hàng trên Shopee, Lazada, hoặc thử sức với dropshipping mà không cần vốn lớn.
Thu nhập thụ động: Đầu tư vào chứng khoán, cho thuê bất động sản, hoặc xây dựng kênh YouTube để kiếm tiền từ quảng cáo.
2.3. Đầu tư vào bản thân để kiếm tiền nhiều hơn
Kỹ năng là công cụ quan trọng để tăng thu nhập. Hãy dành thời gian và tiền bạc để học tập:
Kỹ năng nghề nghiệp: Lập trình, marketing số, quản lý dự án – những lĩnh vực có nhu cầu cao và mức lương hấp dẫn.
Ngoại ngữ: Thành thạo tiếng Anh, tiếng Nhật hoặc các ngôn ngữ khác giúp bạn làm việc cho công ty quốc tế hoặc nhận dự án toàn cầu.
2.4. Đặt mục tiêu tăng thu nhập liên tục
Hãy đặt ra các mục tiêu cụ thể, như tăng 30% thu nhập trong 6 tháng hoặc gấp đôi thu nhập sau 2 năm. Để đạt được điều này:
Nâng cao năng suất: Sử dụng công cụ như Trello hoặc Notion để quản lý thời gian hiệu quả.
Tìm kiếm cơ hội: Đàm phán tăng lương, nhảy việc khi có lời mời tốt hơn, hoặc đảm nhận các dự án lớn trong công ty.
Theo dõi xu hướng: Tham gia các ngành đang phát triển như AI, thương mại điện tử, hoặc sản xuất nội dung số.
2.5. Tận dụng công nghệ và mạng xã hội
Công nghệ và mạng xã hội mở ra cơ hội kiếm tiền không giới hạn:
Sáng tạo nội dung: Làm TikToker hoặc YouTuber, với tiềm năng thu nhập hàng chục triệu đồng từ lượt xem và tài trợ.
Affiliate Marketing: Quảng bá sản phẩm qua link liên kết để nhận hoa hồng từ 5-20% mỗi giao dịch.
Dạy học online: Dạy các kỹ năng như vẽ, nấu ăn, hoặc ngoại ngữ qua Zoom.
3. Lợi ích dài hạn của việc tối đa hóa thu nhập
Việc kiếm tiền nhiều ngay từ hôm nay sẽ tạo nền tảng cho một tương lai an toàn. Nếu bạn bắt đầu ở tuổi 25 với thu nhập 20 triệu đồng mỗi tháng và tăng 10% mỗi năm, đến tuổi 50, bạn có thể tích lũy hàng tỷ đồng thông qua tiết kiệm và đầu tư. Đây là bước đệm để nghỉ hưu sớm hoặc sống thoải mái mà không phụ thuộc vào người khác.
4. Kết luận: Tối đa hóa thu nhập – Con đường đến tự do tài chính
Tối đa hóa thu nhập không chỉ giúp bạn sống tốt hơn hôm nay mà còn là chìa khóa để đạt được tự do tài chính trong tương lai. Bằng cách tận dụng tuổi trẻ, đa dạng hóa nguồn thu nhập, đầu tư vào bản thân, đặt mục tiêu rõ ràng và sử dụng công nghệ, bạn đang xây dựng một cuộc sống thịnh vượng. Hãy bắt đầu ngay hôm nay: đặt mục tiêu, học kỹ năng mới và không ngừng tìm cách kiếm tiền càng nhiều càng tốt.

🔥 Quỹ đầu tư là gì? Cách công ty quản lý quỹ giúp tiền của bạn sinh lời
Trong thế giới tài chính ngày nay, nhiều người đang tìm cách làm cho đồng tiền của mình "làm việc" thay vì nằm im trong tài khoản tiết kiệm. Một trong những công cụ phổ biến nhất để đạt được điều đó chính là quỹ đầu tư. Nhưng quỹ đầu tư là gì? Và làm thế nào mà các công ty quản lý quỹ có thể giúp tiền của bạn sinh lời? Bài viết này sẽ giải thích một cách đơn giản, dễ hiểu, giúp bạn nắm bắt khái niệm cơ bản và cách thức hoạt động của chúng.
Chúng ta sẽ đi sâu vào các ý chính để bạn có cái nhìn rõ ràng hơn, phù hợp cho những ai đang bắt đầu tìm hiểu về đầu tư. Khi nhắc đến đầu tư, nhiều người sẽ nghĩ ngay đến việc tự mua cổ phiếu, trái phiếu hay bất động sản. Nhưng thực tế, có một cách đầu tư giúp bạn vừa tiết kiệm thời gian, vừa tận dụng được kiến thức và kinh nghiệm của chuyên gia — đó là đầu tư thông qua quỹ đầu tư.
Bài viết này sẽ giải thích quỹ đầu tư là gì, công ty quản lý quỹ làm gì, và tại sao tiền của bạn có thể sinh lời ổn định hơn khi gửi gắm vào đây.
1. Quỹ đầu tư là gì?
Quỹ đầu tư có thể được ví như một "chiếc giỏ" chung mà nhiều người cùng bỏ tiền vào, sau đó dùng số tiền đó để đầu tư vào nhiều tài sản khác nhau nhằm kiếm lợi nhuận. Thay vì tự mình mua cổ phiếu, trái phiếu hay bất động sản, bạn có thể tham gia quỹ để chia sẻ rủi ro và lợi ích với người khác. Đây là một cách đầu tư thông minh, đặc biệt cho những ai không có nhiều thời gian hoặc kiến thức chuyên sâu về thị trường tài chính. Quỹ đầu tư (Investment Fund) là một “rổ” tiền được gom từ nhiều nhà đầu tư khác nhau. Số tiền đó được quản lý và đầu tư bởi công ty quản lý quỹ theo một chiến lược đã được xác định trước.
1.1 Định nghĩa cơ bản về quỹ đầu tư
Quỹ đầu tư, hay còn gọi là quỹ tương hỗ (mutual fund) hoặc quỹ đầu tư chứng khoán, là một hình thức tập hợp vốn từ nhiều nhà đầu tư cá nhân hoặc tổ chức. Số tiền này được quản lý bởi các chuyên gia, và họ sẽ dùng nó để mua các tài sản như cổ phiếu, trái phiếu, hàng hóa hoặc thậm chí là bất động sản. Mục tiêu chính là tạo ra lợi nhuận cho các nhà đầu tư thông qua việc tăng giá trị của quỹ hoặc phân phối lợi tức định kỳ.
Ví dụ, nếu bạn đầu tư 10 triệu đồng vào một quỹ, số tiền của bạn sẽ được kết hợp với hàng trăm nhà đầu tư khác, tạo thành một khoản vốn lớn có thể lên đến hàng nghìn tỷ đồng. Quỹ này hoạt động theo nguyên tắc "chia sẻ lợi nhuận và rủi ro", nghĩa là nếu quỹ kiếm lời, bạn sẽ nhận phần tương ứng với số tiền đầu tư của mình. Ở Việt Nam, các quỹ đầu tư được quản lý bởi Ủy ban Chứng khoán Nhà nước (SSC), đảm bảo tính minh bạch và an toàn nhất định. Bản chất của quỹ đầu tư: Bạn hãy hình dung: thay vì bạn bỏ ra vài chục triệu để mua vài mã cổ phiếu, thì khi tham gia quỹ, tiền của bạn sẽ gộp chung với hàng trăm, hàng ngàn nhà đầu tư khác. Nhờ đó, quỹ có số vốn lớn, đủ để mua được nhiều loại tài sản khác nhau — từ cổ phiếu, trái phiếu, vàng, bất động sản, đến chứng chỉ tiền gửi.
1.2 Lợi ích của việc đầu tư vào quỹ
Một trong những lý do quỹ đầu tư phổ biến là vì nó giúp đa dạng hóa danh mục đầu tư mà không cần vốn lớn. Thay vì bỏ hết trứng vào một giỏ (như mua cổ phiếu của một công ty duy nhất), quỹ sẽ phân bổ tiền vào nhiều lĩnh vực khác nhau, giảm thiểu rủi ro nếu một tài sản nào đó giảm giá.
Ngoài ra, quỹ đầu tư còn mang lại tính thanh khoản cao – bạn có thể rút tiền ra dễ dàng hơn so với đầu tư trực tiếp vào bất động sản. Lợi ích khác là chi phí thấp hơn so với tự đầu tư, vì quỹ tận dụng quy mô lớn để đàm phán phí giao dịch. Theo thống kê từ Hiệp hội Quỹ đầu tư Việt Nam (VAFI), các quỹ đầu tư đã giúp hàng triệu người Việt Nam tăng trưởng tài sản trung bình 8-12% mỗi năm trong thập kỷ qua, cao hơn lãi suất ngân hàng thông thường. Lợi ích cơ bản khi tham gia quỹ đầu tư: Không cần nhiều vốn vẫn đa dạng hóa danh mục. Có đội ngũ chuyên gia theo dõi thị trường và ra quyết định. Tiết kiệm thời gian, công sức so với tự đầu tư.
1.3 Các loại quỹ đầu tư phổ biến
Có nhiều loại quỹ để phù hợp với mức độ rủi ro và mục tiêu của từng người. Quỹ cổ phiếu (equity fund) tập trung vào cổ phiếu, phù hợp cho ai muốn lợi nhuận cao nhưng chấp nhận rủi ro lớn. Quỹ trái phiếu (bond fund) an toàn hơn, đầu tư chủ yếu vào trái phiếu chính phủ hoặc doanh nghiệp, mang lại thu nhập ổn định. Quỹ hỗn hợp (balanced fund) kết hợp cả hai, lý tưởng cho người mới bắt đầu. Ngoài ra, còn có quỹ ETF (Exchange-Traded Fund) – một loại quỹ giao dịch trên sàn chứng khoán như cổ phiếu, rất linh hoạt và phí thấp. Ở Việt Nam, các quỹ như VCBF hay Dragon Capital đang dẫn đầu thị trường với đa dạng lựa chọn. Các loại quỹ đầu tư phổ biến: Quỹ mở: Nhà đầu tư có thể mua hoặc bán chứng chỉ quỹ bất cứ lúc nào theo giá trị tài sản ròng (NAV). Quỹ đóng: Chỉ bán chứng chỉ quỹ vào một đợt huy động vốn, sau đó niêm yết trên sàn, giá biến động theo cung – cầu. Quỹ ETF (Exchange Traded Fund): Quỹ mô phỏng theo một chỉ số (ví dụ VN30), giao dịch như cổ phiếu trên sàn. Quỹ trái phiếu: Đầu tư chủ yếu vào trái phiếu chính phủ, trái phiếu doanh nghiệp. Quỹ cổ phiếu: Đầu tư vào cổ phiếu của các công ty niêm yết.
2. Công ty quản lý quỹ là gì và vai trò của họ?
Công ty quản lý quỹ (fund management company) chính là "người lái tàu" cho chiếc giỏ đầu tư mà chúng ta vừa nhắc đến. Họ là các tổ chức chuyên nghiệp, được cấp phép để quản lý và đầu tư số tiền từ quỹ. Không phải ai cũng có thể tự đầu tư hiệu quả, nên các công ty này đóng vai trò quan trọng trong việc biến tiền nhàn rỗi thành lợi nhuận. Nếu quỹ đầu tư là “chiếc xe”, thì công ty quản lý quỹ chính là “người lái xe”.
2.1 Định nghĩa và cấu trúc của công ty quản lý quỹ
Công ty quản lý quỹ là doanh nghiệp chuyên cung cấp dịch vụ quản lý tài sản cho các quỹ đầu tư. Họ có đội ngũ chuyên gia phân tích thị trường, nghiên cứu kinh tế và ra quyết định đầu tư. Ở Việt Nam, các công ty này phải đăng ký với SSC và tuân thủ các quy định nghiêm ngặt về báo cáo tài chính. Ví dụ, một công ty như VinaCapital hay SSI Asset Management sẽ có ban lãnh đạo gồm các nhà quản lý quỹ (fund managers), chuyên viên phân tích và bộ phận pháp lý để đảm bảo mọi hoạt động hợp pháp. Vai trò chính của công ty quản lý quỹ: Xây dựng chiến lược đầu tư: Quyết định quỹ sẽ tập trung vào cổ phiếu, trái phiếu, hay phân bổ đa dạng. Phân tích và lựa chọn tài sản: Sử dụng đội ngũ phân tích để chọn ra các cơ hội đầu tư tiềm năng. Giám sát và điều chỉnh: Khi thị trường biến động, công ty sẽ điều chỉnh danh mục để hạn chế rủi ro và tối ưu lợi nhuận.
2.2 Cách công ty quản lý quỹ hoạt động
Quy trình hoạt động của họ bắt đầu từ việc thu thập vốn từ nhà đầu tư qua các kênh như ngân hàng, sàn chứng khoán hoặc ứng dụng trực tuyến. Sau đó, họ phân tích thị trường để quyết định đầu tư vào đâu. Công ty sử dụng các công cụ như phân tích cơ bản (xem xét báo cáo tài chính của doanh nghiệp) và phân tích kỹ thuật (dựa trên biểu đồ giá) để chọn tài sản. Họ cũng theo dõi liên tục để điều chỉnh danh mục, ví dụ bán cổ phiếu đang giảm và mua thêm trái phiếu an toàn khi thị trường biến động.
Để minh họa, giả sử quỹ đầu tư vào cổ phiếu ngân hàng. Công ty quản lý sẽ nghiên cứu tình hình kinh tế vĩ mô, như lãi suất giảm sẽ làm cổ phiếu ngân hàng tăng giá, rồi quyết định phân bổ tỷ lệ phù hợp. Họ còn sử dụng công nghệ như AI để dự báo xu hướng, giúp quyết định nhanh chóng và chính xác hơn. Quy trình giúp tiền của bạn sinh lời: Huy động vốn từ các nhà đầu tư. Đầu tư vào nhiều loại tài sản theo chiến lược đã đăng ký. Theo dõi liên tục và chốt lời khi đạt mục tiêu, cắt lỗ khi cần. Phân phối lợi nhuận lại cho nhà đầu tư dưới dạng cổ tức, hoặc tăng giá trị chứng chỉ quỹ.
2.3 Cách họ giúp tiền của bạn sinh lời
Bí quyết chính là sự chuyên nghiệp và đa dạng hóa. Công ty quản lý quỹ có lợi thế tiếp cận thông tin nội bộ và dữ liệu lớn mà cá nhân khó có được, giúp họ chọn đúng thời điểm mua bán. Họ cũng áp dụng chiến lược dài hạn, như đầu tư giá trị (mua tài sản bị định giá thấp) hoặc đầu tư tăng trưởng (chọn công ty đang phát triển nhanh). Kết quả là, tiền của bạn có thể sinh lời qua hai cách: tăng giá trị quỹ (capital gain) hoặc nhận cổ tức định kỳ (dividend).
Theo báo cáo từ Morningstar, các quỹ được quản lý chuyên nghiệp thường vượt trội hơn thị trường trung bình 2-3% mỗi năm. Ở Việt Nam, trong giai đoạn 2020-2023, nhiều quỹ đã mang lại lợi nhuận 15-20% nhờ đầu tư vào cổ phiếu công nghệ và bất động sản, giúp nhà đầu tư như bạn kiếm lời mà không cần lo lắng hàng ngày.
3. Cách tham gia quỹ đầu tư và những lưu ý cần biết
Bây giờ, khi đã hiểu quỹ là gì và công ty quản lý giúp ích ra sao, bạn có thể nghĩ đến việc tham gia. Tuy nhiên, đầu tư luôn đi kèm rủi ro, nên cần chuẩn bị kỹ lưỡng để tránh mất mát không đáng có. Vì sao gửi tiền vào quỹ đầu tư có thể an toàn và hiệu quả hơn? Nhiều người ngại tham gia quỹ vì nghĩ “tôi tự đầu tư được”, nhưng thực tế, công ty quản lý quỹ có lợi thế mà cá nhân khó có được.
3.1 Các bước để đầu tư vào quỹ
Đầu tiên, chọn quỹ phù hợp với mục tiêu của bạn – ví dụ quỹ cổ phiếu cho dài hạn, quỹ trái phiếu cho ngắn hạn. Bạn có thể mở tài khoản tại các công ty chứng khoán như SSI, VNDIRECT hoặc qua ứng dụng ngân hàng như Techcombank Securities. Sau đó, nộp tiền và mua chứng chỉ quỹ (units). Số tiền tối thiểu thường chỉ từ 1-5 triệu đồng, rất dễ tiếp cận. Theo dõi lợi nhuận qua báo cáo hàng tháng từ công ty quản lý, và bạn có thể rút tiền bất cứ lúc nào với phí thấp. Chuyên môn và kinh nghiệm: Đội ngũ quản lý quỹ thường có nhiều năm kinh nghiệm, bằng cấp chuyên sâu, và thông tin phân tích thị trường cập nhật liên tục. Kỷ luật đầu tư: Nhiều nhà đầu tư cá nhân dễ bị cảm xúc chi phối — thấy giá tăng thì mua đuổi, giá giảm thì bán tháo. Quỹ thì tuân theo chiến lược đã định, ít bị ảnh hưởng bởi tâm lý đám đông. Quy mô vốn lớn: Giúp quỹ tiếp cận được những thương vụ và tài sản mà nhà đầu tư cá nhân khó mua, và đàm phán được phí tốt hơn.
3.2 Rủi ro và cách giảm thiểu
Không có đầu tư nào an toàn 100%. Rủi ro lớn nhất là biến động thị trường – quỹ có thể lỗ nếu kinh tế suy thoái. Ngoài ra, còn có rủi ro lạm phát làm giảm giá trị thực của lợi nhuận, hoặc phí quản lý (thường 1-2% mỗi năm) ăn mòn lợi ích. Để giảm thiểu, hãy đa dạng hóa bằng cách đầu tư vào nhiều quỹ khác nhau, và chỉ dùng tiền nhàn rỗi chứ không vay mượn. Luôn đọc kỹ prospectus (bản cáo bạch) của quỹ để hiểu rõ chiến lược. Các chuyên gia khuyên nên đầu tư dài hạn (ít nhất 3-5 năm) để vượt qua biến động ngắn hạn. Lợi nhuận và rủi ro khi tham gia quỹ đầu tư: Không có kênh đầu tư nào chỉ có lợi nhuận mà không có rủi ro. Lợi nhuận kỳ vọng: Quỹ cổ phiếu: thường 8–15%/năm tùy giai đoạn thị trường. Quỹ trái phiếu: ổn định hơn, thường 4–8%/năm. Rủi ro: Thị trường giảm giá → NAV quỹ giảm. Quản lý quỹ kém hiệu quả. Chi phí quản lý cao làm giảm lợi nhuận ròng.
3.3 Lời khuyên cho người mới bắt đầu
Bắt đầu với số tiền nhỏ để học hỏi, và tham gia các khóa học trực tuyến trên BizUni để nâng cao kiến thức. Theo dõi tin tức kinh tế từ nguồn uy tín như VnEconomy hoặc Bloomberg. Cuối cùng, hãy nhớ rằng đầu tư là marathon, không phải sprint – kiên nhẫn và kỷ luật sẽ giúp tiền của bạn sinh lời bền vững. Cách chọn quỹ đầu tư phù hợp: Xác định mục tiêu và khẩu vị rủi ro: Nếu muốn an toàn, chọn quỹ trái phiếu. Muốn lợi nhuận cao hơn, chấp nhận biến động, chọn quỹ cổ phiếu hoặc ETF. Xem lịch sử hoạt động của quỹ: Không chỉ nhìn lợi nhuận 1 năm, mà nên xem 3–5 năm, qua cả thời kỳ thị trường khó khăn. So sánh chi phí: Quỹ thu phí quản lý (thường 1–2%/năm) và đôi khi phí mua/bán. Lời khuyên cuối cùng: Nếu bạn bận rộn, không có nhiều thời gian để phân tích thị trường, nhưng vẫn muốn tiền sinh lời tốt hơn gửi tiết kiệm, thì đầu tư qua quỹ đầu tư là một lựa chọn đáng cân nhắc. Tuy nhiên, bạn nên: Chọn quỹ uy tín, được cấp phép bởi Ủy ban Chứng khoán Nhà nước. Đọc kỹ bản cáo bạch và chiến lược đầu tư. Hiểu rằng lợi nhuận không bao giờ đảm bảo, và rủi ro luôn tồn tại.
Tóm lại, quỹ đầu tư là công cụ mạnh mẽ để làm giàu, và các công ty quản lý quỹ chính là chìa khóa giúp bạn đạt được điều đó mà không cần là chuyên gia. Với lợi nhuận tiềm năng cao hơn tiết kiệm ngân hàng, đây là lựa chọn lý tưởng cho nhiều người Việt Nam đang tìm cách bảo vệ và tăng trưởng tài sản. Nếu bạn đang cân nhắc, hãy bắt đầu nghiên cứu ngay hôm nay. Chúc bạn đầu tư thành công! Kết luận: Quỹ đầu tư là một công cụ giúp bạn ủy thác việc đầu tư cho những người chuyên nghiệp. Công ty quản lý quỹ sẽ thay bạn nghiên cứu, mua bán và tối ưu danh mục để đạt mục tiêu sinh lời. Với kiến thức, kỷ luật và nguồn lực vượt trội, họ có thể giúp bạn tăng khả năng đạt được mục tiêu tài chính, miễn là bạn chọn đúng quỹ và kiên nhẫn với chiến lược dài hạn

🔥 Tư Duy Tự Chịu Trách Nhiệm Với Tài Chính Cá Nhân – Chìa Khóa Thành Công Và Tự Do Tài Chính.
Tư duy tự chịu trách nhiệm với tài chính cá nhân là một trong những yếu tố nền tảng quyết định thành công, ổn định và chất lượng cuộc sống của mỗi chúng ta. Khi bạn nhận thức sâu sắc rằng chính bạn chứ không phải ai khác mới là người chịu trách nhiệm hoàn toàn về tình trạng tài chính của mình, bạn sẽ đưa ra được những quyết định tài chính đúng đắn, sáng suốt và hiệu quả hơn.
Ngược lại, nếu bạn thiếu kế hoạch cụ thể, phó mặc tài chính cá nhân cho may rủi hoặc phụ thuộc vào người khác, bạn sẽ dễ dàng rơi vào vòng xoáy của nợ nần, chi tiêu mất kiểm soát và mất an toàn tài chính.
Vậy làm thế nào để rèn luyện tư duy tự chịu trách nhiệm với tài chính cá nhân?
1. Hiểu rõ tình trạng tài chính hiện tại – Nhìn thẳng vào thực tế
Ghi chép chi tiết về thu nhập và chi tiêu hàng tháng.
Liệt kê tất cả các khoản nợ, xác định rõ lãi suất và thời hạn trả nợ.
Đánh giá tài sản và các khoản đầu tư đang sở hữu để biết rõ vị thế tài chính của bản thân.
2. Lập kế hoạch tài chính cá nhân – Xây dựng lộ trình rõ ràng để đạt mục tiêu
Xác định các mục tiêu tài chính ngắn hạn và dài hạn cụ thể, ví dụ như mua nhà, đầu tư giáo dục, chuẩn bị về hưu.
Quản lý chi tiêu theo công thức hợp lý (VD: 50% nhu cầu thiết yếu, 30% mong muốn, 20% tiết kiệm).
Áp dụng nguyên tắc: "Tiết kiệm trước, chi tiêu sau" – đảo ngược công thức truyền thống thành 20% tiết kiệm, 50% nhu cầu thiết yếu, và 30% mong muốn.
Xây dựng chiến lược đầu tư bền vững, hướng tới tăng trưởng ổn định và an toàn.
3. Thực thi kế hoạch – Kỷ luật và kiên trì
Theo dõi, kiểm soát chi tiêu thường xuyên để đảm bảo bạn luôn đi đúng kế hoạch.
Điều chỉnh và cập nhật kế hoạch tài chính định kỳ để phù hợp với sự thay đổi trong cuộc sống và thị trường.
Luôn giữ kỷ luật tài chính, tránh để cảm xúc chi phối làm mất đi tính hiệu quả của kế hoạch.
4. Chủ động học hỏi và nâng cao kiến thức tài chính
Tìm hiểu sâu về các khái niệm quan trọng như lãi suất kép, phân bổ tài sản, đa dạng hóa các kênh đầu tư để giảm thiểu rủi ro.
Hiểu rõ cách quản trị rủi ro tài chính, nhận biết và tránh xa các khoản nợ xấu.
Liên tục cập nhật xu hướng thị trường, cơ hội đầu tư mới để luôn chủ động và linh hoạt trong quản lý tài chính cá nhân.
5. Chuẩn bị trước cho những rủi ro tài chính bất ngờ
Xây dựng quỹ khẩn cấp tương đương 3-6 tháng chi tiêu nhằm đảm bảo khả năng ứng phó với các tình huống bất ngờ.
Tham gia các loại bảo hiểm sức khỏe, bảo hiểm nhân thọ để bảo vệ tài sản và bản thân trước các rủi ro lớn như bệnh tật, tai nạn.
Luôn có "Kế hoạch B" cho nguồn thu nhập như kỹ năng phụ trợ, nghề tay trái hay các nguồn thu nhập thay thế khác.
6. Đầu tư để tăng trưởng tài sản – Biến tiết kiệm thành nguồn tài sản lớn hơn
Số tiền tích lũy không nên chỉ gửi tiết kiệm ngân hàng mà cần được đầu tư hợp lý để tạo ra lợi nhuận cao hơn và bù đắp lại ảnh hưởng của lạm phát.
Chọn lựa các kênh đầu tư phù hợp với khả năng chịu rủi ro và mục tiêu tài chính của bản thân như chứng khoán, chứng chỉ quỹ, bất động sản, vàng hoặc các kênh đầu tư an toàn khác.
Áp dụng nguyên tắc đầu tư dài hạn, duy trì tính kỷ luật và không bị cuốn theo những lời hứa hẹn lợi nhuận cao một cách bất thường, phi lý.
Liên tục đánh giá hiệu quả đầu tư để điều chỉnh và tối ưu hóa danh mục tài sản của bạn, đảm bảo lợi nhuận tốt và bền vững trong dài hạn.
7. Hướng đến tự do tài chính – Mục tiêu cuối cùng
Tập trung xây dựng và quản lý tài sản vững chắc, bền vững để đạt đến trạng thái tài chính ổn định và an tâm.
Luôn tìm cách tối ưu hóa chi tiêu, tránh xa các khoản chi lãng phí không cần thiết.
Phát triển các nguồn thu nhập thụ động như cho thuê bất động sản, đầu tư vào doanh nghiệp, hoặc sở hữu cổ tức từ các công ty.
8. Kết luận
Tư duy tự chịu trách nhiệm với tài chính cá nhân không chỉ đơn thuần là một thái độ sống mà còn là một kỹ năng quan trọng mà mỗi người cần phải sở hữu và liên tục phát triển. Khi bạn nắm quyền làm chủ tài chính cá nhân, bạn mới thực sự có thể kiểm soát cuộc sống của mình, xây dựng nền tảng tài chính vững chắc, và hướng tới mục tiêu cuối cùng là sự tự do và hạnh phúc tài chính.
"""

KIEN_THUC_DU_AN = """
🔥 SWC (Sky World Community) - LÂU ĐÀI KINH DOANH (TRỌNG TÂM):
1. SWC Field - Bước vào thế giới của "Cá Mập":
- Là gì: Nền tảng đầu tư có cấu trúc, cho phép NĐT cá nhân tiếp cận các cơ hội toàn cầu (Pre-IPO, Venture Capital) vốn trước đây CHỈ DÀNH CHO ĐỊNH CHẾ TÀI CHÍNH LỚN.
- Vận hành (SPV): Mỗi dự án có SPV riêng. NĐT mua cổ phần SPV -> Sở hữu hợp pháp. Không thu phí giao dịch ẩn. Đầu tư từ $50.
- Pháp lý minh bạch: Tuân thủ SEC (Mỹ), MiFID II (Châu Âu), Bank Nga, Cayman Islands.

2. SWC Pass & Road to $1M - Công cụ Tự do Tài chính:
- SWC Pass: Gói thành viên "All-in-one". Chỉ mất 10 phút/tháng, NĐT nhận chiến lược chi tiết mua mã cổ tức nào. Không cần tự học.
- Road to $1M: Kỷ luật đầu tư $8/ngày (~$240/tháng) bằng phương pháp trung bình giá (DCA) & Buy & Hold. Tận dụng Lãi suất kép để đạt 1.000.000 USD trong 15-20 năm. 

3. Các Gói Thành Viên (Ưu đãi đến 31/03/2026):
- Essential : 20$/tháng ($20/tháng -> $240/năm). Plus : 10$/tháng (Cố định 5 năm -> $600). Ultimate ($2,600 trọn đời).

- Nền tảng: Crowdinvesting Platform quốc tế. Hơn 10 năm hoạt động. (Lưu ý: SWC KHÔNG bán hay huy động vốn cổ phần của chính mình).
- Cấu trúc hệ sinh thái (3 trụ cột): FinTech (Tài trợ công nghệ xanh), EdTech (Đại học trực tuyến), SocialTech (Cộng đồng toàn cầu).
- Vị thế (Bí mật dòng tiền): SWC là "SỰ NGHIỆP LÂU DÀI". SWC tạo Cash Flow (dòng tiền) NGAY BÂY GIỜ qua chương trình đối tác để trang trải cuộc sống và tái đầu tư.
- BƯỚC NGOẶT LỊCH SỬ (SEC Mỹ): SWC đã nhận giấy phép quỹ đầu tư tại Mỹ do SEC cấp. Khẳng định sự trưởng thành, minh bạch, nâng tầm uy tín quốc tế.

🔥 SỐ HÓA TÀI SẢN (RWA) TẠI SWC:
- Xu hướng tất yếu: Số hóa tài sản thực (RWA) sẽ bùng nổ. SWC đang nâng cấp thành "Sàn chứng khoán số" của riêng mình. Giải quyết bài toán thanh khoản 24/7.
- Sứ mệnh: Mảng RWA thành công sẽ quay lại bơm vốn giúp uST tiến về đích nhanh nhất.

🔥 CÁC DỰ ÁN NỀN TẢNG (CHỈ NHẮC KHI KHÁCH HỎI TRỰC TIẾP):
1. uST (Unitsky String Technologies) - TÀI SẢN DÀI HẠN: Công nghệ giao thông đường dây trên cao. Định giá 400 tỷ USD. Đang thương mại hóa. Cần kiên nhẫn 3-5 năm.
2. uTerra: Dự án nông nghiệp sinh học, cải tạo đất mùn.
3. SWGT Token: LƯU Ý SỐNG CÒN: SWGT HOÀN TOÀN KHÔNG LIÊN QUAN ĐẾN QUỸ SWC. Là Token tiện ích nội bộ, KHÔNG phải RWA. ĐẶC BIỆT: Khách hàng mua Combo VIP 450 SWGT sẽ được tặng kèm và nhận tất cả Ebook cùng Audio độc quyền.

🔥 TÍNH PHÁP LÝ TẠI VIỆT NAM & LỜI KHUYÊN ĐẦU TƯ:
- Lời khuyên: Hết sức thận trọng, tìm hiểu kỹ thông cáo pháp luật, dùng vốn nhàn rỗi và tuyệt đối không FOMO.
"""

FULL_KNOWLEDGE = f"""
[KIẾN THỨC PHÁT TRIỂN BẢN THÂN]
{KIEN_THUC_PHAT_TRIEN_BAN_THAN}

[KIẾN THỨC TÀI CHÍNH & VĨ MÔ/VI MÔ]
{KIEN_THUC_TAI_CHINH}

[KIẾN THỨC DỰ ÁN & CÔNG TY]
{KIEN_THUC_DU_AN}
"""

# ==============================================================================
# WEB SERVER
# ==============================================================================
app_web = Flask('')
@app_web.route('/')
def home(): return "Bot SWC Final v55 (Updated Combo VIP 450SWGT & Error Free) Ready!"

def run_web(): 
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)
    app_web.run(host='0.0.0.0', port=int(os.environ.get("PORT", 8080)))

def keep_alive(): 
    t = Thread(target=run_web, daemon=True) 
    t.start()

# ==============================================================================
# HÀM HỖ TRỢ & BÁO CHÍ
# ==============================================================================
async def auto_news_job(context: ContextTypes.DEFAULT_TYPE):
    if not ALLOWED_GROUPS: return
    chat_id = ALLOWED_GROUPS[0]
    
    try:
        feed = feedparser.parse("https://cafebiz.vn/cau-chuyen-kinh-doanh.rss")
        if feed.entries:
            latest = feed.entries[0]
            if latest.link not in POSTED_NEWS:
                POSTED_NEWS.add(latest.link)
                prompt = f"Có tin kinh doanh: '{latest.title}'. Viết 1 bình luận ngắn (dưới 100 chữ) rút ra bài học. KHÔNG bôi đậm."
                ai_comment = await ask_ai(prompt)
                if "Bot đang bận" not in ai_comment:
                    msg = f"📰 GÓC NHÌN VĨ MÔ - BÀI HỌC THƯƠNG TRƯỜNG\n\n{ai_comment}\n\n👉 Chi tiết: {latest.link}"
                    await context.bot.send_message(chat_id=chat_id, text=msg)
                    await asyncio.sleep(3600) 
    except: pass

    try:
        feed_vn = feedparser.parse("https://vneconomy.vn/rss/dau-tu.rss")
        if feed_vn.entries:
            latest_vn = feed_vn.entries[0]
            if latest_vn.link not in POSTED_NEWS:
                POSTED_NEWS.add(latest_vn.link)
                prompt = f"Có tin vĩ mô: '{latest_vn.title}'. Đóng vai Cáo già SWC viết nhận định cực bén dưới 100 chữ. KHÔNG bôi đậm."
                ai_comment = await ask_ai(prompt)
                if "Bot đang bận" not in ai_comment:
                    msg = f"📈 NHỊP ĐẬP THỊ TRƯỜNG - VNECONOMY\n\n{ai_comment}\n\n👉 Chi tiết: {latest_vn.link}"
                    await context.bot.send_message(chat_id=chat_id, text=msg)
                    await asyncio.sleep(3600)
    except: pass

async def get_live_news_summary():
    try:
        news_summary = ""
        feed_vn = feedparser.parse("https://vneconomy.vn/rss/dau-tu.rss")
        if feed_vn.entries:
            news_summary += f"- Báo VnEconomy: {feed_vn.entries[0].title}\n"
        feed_cafe = feedparser.parse("https://cafebiz.vn/cau-chuyen-kinh-doanh.rss")
        if feed_cafe.entries:
            news_summary += f"- Báo CafeBiz: {feed_cafe.entries[0].title}\n"
        return news_summary
    except:
        return "Thị trường đang cập nhật số liệu mới."

async def get_data_from_sheet(user_text):
    try:
        json_content = os.environ.get("GOOGLE_CREDENTIALS_JSON")
        if not json_content: return None
        creds = ServiceAccountCredentials.from_json_keyfile_dict(json.loads(json_content), ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"])
        client = gspread.authorize(creds)
        sheet = client.open(SHEET_NAME).sheet1
        data = sheet.get_all_values()
        clean_user_text = re.sub(r'[^\w\s]', ' ', user_text).lower()
        for row in data[1:]:
            while len(row) < 5: row.append("")
            keywords = row[0].lower().split(',')
            for key in keywords:
                key = key.strip()
                if not key: continue
                pattern = r'(^|\s)' + re.escape(key) + r'(\s|$)'
                if re.search(pattern, clean_user_text):
                    return {"msg1": row[1], "msg2": row[2], "link": row[3], "img": row[4]}
        return None
    except Exception as e:
        return None

async def ask_ai(user_text):
    vn_tz = timezone(timedelta(hours=7))
    now = datetime.now(vn_tz).strftime("%d/%m/%Y")
    
    live_news = ""
    user_text_lower = user_text.lower()
    if "tin tức" in user_text_lower or "vĩ mô" in user_text_lower or "hôm nay" in user_text_lower or "thị trường" in user_text_lower:
        live_news_summary = await get_live_news_summary()
        live_news = f"\n\n🚨 TIN TỨC NÓNG HỔI TRÊN BÁO CHÍ NGÀY {now}:\n{live_news_summary}"

    full_input = f"THÔNG TIN THỰC TẾ: Hôm nay chính xác là ngày {now}. Cấm trả lời sai ngày.{live_news}\n\n{SYSTEM_PROMPT}\n\nKIẾN THỨC:\n{FULL_KNOWLEDGE}\n\nUser: {user_text}\n(Lưu ý: KHÔNG dùng dấu **):"
    
    safety_settings = [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
    ]

    for key in API_KEYS:
        genai.configure(api_key=key) 
        for model_name in AI_MODELS:
            try:
                model = genai.GenerativeModel(model_name)
                response = await model.generate_content_async(full_input, safety_settings=safety_settings)
                clean_text = response.text.replace("**", "").replace("##", "")
                return clean_text.strip() 
            except: 
                continue 
                
    return "Bot đang bận nghiên cứu thị trường 📊"

async def send_smart_messages(update, context, text):
    chat_id = update.effective_chat.id
    global MESSAGE_COUNTER
    MESSAGE_COUNTER += 1 
    
    if "|||" not in text:
        final_msg = text
        if MESSAGE_COUNTER % 10 == 0: final_msg += f"\n{SIGNATURE}"
        await context.bot.send_chat_action(chat_id=chat_id, action=constants.ChatAction.TYPING)
        await asyncio.sleep(2)
        await update.message.reply_text(final_msg)
        return
    
    chunks = [c.strip() for c in text.split('|||') if c.strip()]
    for i, chunk in enumerate(chunks):
        await context.bot.send_chat_action(chat_id=chat_id, action=constants.ChatAction.TYPING)
        await asyncio.sleep(3)
        final_msg = chunk
        if i == len(chunks) - 1: 
            if MESSAGE_COUNTER % 10 == 0: final_msg += f"\n{SIGNATURE}"
        await update.message.reply_text(final_msg)

# ==============================================================================
# HANDLERS
# ==============================================================================
async def ping(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🏓 Pong! Động cơ đang hoạt động!")

async def handle_seeding_in_group(update: Update, context: ContextTypes.DEFAULT_TYPE):
    msg = update.message
    post_content = msg.text or msg.caption or "Tin tức"
    seed_prompt = f"Đóng vai nhà đầu tư lão luyện. Viết nhận định ngắn (dưới 40 từ) về tin: '{post_content}'. KHÔNG bôi đậm."
    comment = await ask_ai(seed_prompt)
    try: await msg.reply_text(f"💡 {comment}")
    except: pass

async def get_id(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(f"🆔 ID: `{update.effective_chat.id}`", parse_mode='Markdown')

async def greet_chat_members(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    result = update.chat_member
    new_member = result.new_chat_member
    
    if new_member.status == ChatMember.MEMBER and result.old_chat_member.status != ChatMember.MEMBER:
        user = new_member.user
        if user.is_bot: return
        
        chat_id = update.effective_chat.id
        global LAST_WELCOME_MSG
        if chat_id in LAST_WELCOME_MSG:
            try: await context.bot.delete_message(chat_id=chat_id, message_id=LAST_WELCOME_MSG[chat_id])
            except: pass

        welcome_text = (
            f"Chào mừng {user.full_name} đến với Cộng đồng SWC Việt Nam! 🇻🇳\n\n"
            f"Tại đây, chúng tôi chia sẻ con đường trở thành NHÀ ĐẦU TƯ GIÁ TRỊ & TỰ DO TÀI CHÍNH.\n\n"
            f"Hệ sinh thái đầu tư chiến lược của chúng tôi:\n"
            f"💼 SWC Pass & Road to $1M: Chiến lược xây dựng danh mục cổ tức, tạo dòng tiền nhàn rỗi.\n"
            f"🌍 SWC Field: Đặc quyền tiếp cận quỹ đầu tư tư nhân, Pre-IPO quốc tế.\n"
            f"💎 uST/uTerra: Sở hữu công nghệ giao thông định giá 400 tỷ USD & Nông nghiệp sinh học.\n\n"
            f"✍️ Bác hãy đặt bất kỳ câu hỏi nào để tôi hỗ trợ tư vấn tài chính nhé!\n\n"
            f"👇 TRUY CẬP TÀI LIỆU CHÍNH CHỦ TẠI ĐÂY:"
        )
        
        buttons = [
            [InlineKeyboardButton("📘 Fanpage SWC", url="https://www.facebook.com/swc.capital.vn"), InlineKeyboardButton("👥 Group UST", url="https://www.facebook.com/groups/ust.swc/")],
            [InlineKeyboardButton("🌱 uTerra VN", url="https://www.facebook.com/uTerraVietNam"), InlineKeyboardButton("📺 Youtube", url="https://www.youtube.com/c/SkyWorldCommunityVietNam/")],
            [InlineKeyboardButton("🌍 Website", url="https://swc.capital/vi"), InlineKeyboardButton("🇻🇳 Cài Tiếng Việt", url="https://t.me/setlanguage/vi-beta")],
            [InlineKeyboardButton("🛡 Cài đặt bảo mật Telegram", url="https://t.me/swc_capital_vn/1119")]
        ]
        
        sent = await context.bot.send_message(chat_id=chat_id, text=welcome_text, reply_markup=InlineKeyboardMarkup(buttons))
        LAST_WELCOME_MSG[chat_id] = sent.message_id

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message: return
    
    global MESSAGE_COUNTER 

    if update.message.is_automatic_forward:
        await handle_seeding_in_group(update, context)
        return

    user_text = update.message.text or update.message.caption or ""
    user_id = update.message.from_user.id
    chat_type = update.effective_chat.type
    chat_id = update.effective_chat.id 

    if chat_type != constants.ChatType.PRIVATE:
        if str(chat_id) not in [str(i) for i in ALLOWED_GROUPS]:
            return 

    if chat_type == constants.ChatType.PRIVATE:
        if user_id in ADMIN_IDS:
            if update.message.reply_to_message:
                reply_id = update.message.reply_to_message.message_id
                customer_id = FORWARD_MAP.get(reply_id)
                if not customer_id:
                    try: customer_id = update.message.reply_to_message.forward_origin.sender_user.id
                    except: pass
                
                if customer_id:
                    try:
                        await context.bot.copy_message(
                            chat_id=customer_id,
                            from_chat_id=chat_id,
                            message_id=update.message.message_id
                        )
                        await update.message.reply_text("✅ Đã chuyển câu trả lời cho khách!")
                    except Exception as e: 
                        await update.message.reply_text(f"❌ Lỗi gửi tin: {e}")
                else: 
                    await update.message.reply_text("⚠️ Không tìm thấy kết nối với khách hàng này.")
            else:
                if user_text:
                    await context.bot.send_chat_action(update.effective_chat.id, constants.ChatAction.TYPING)
                    ans = await ask_ai(user_text)
                    if ans: await send_smart_messages(update, context, ans)
        else:
            data = None
            if user_text:
                data = await get_data_from_sheet(user_text.lower()) if len(user_text) < 200 else None
            
            if data:
                MESSAGE_COUNTER += 1
                msg = data['msg1']
                if data['link']: msg += f"\n👉 Link chi tiết: {data['link']}"
                try: await update.message.reply_photo(data['img'], caption=msg)
                except: await update.message.reply_text(msg)
                if data['msg2']:
                    await asyncio.sleep(2)
                    await update.message.reply_text(data['msg2'])
            else:
                kb = [[InlineKeyboardButton("🇻🇳 Bấm Vào Đây Để Chuyển Ngôn Ngữ Tiếng Việt", url="https://t.me/setlanguage/vi-beta")],
                    [InlineKeyboardButton("🛡 Cài đặt bảo mật Telegram", url="https://t.me/swc_capital_vn/1119")],
                    [InlineKeyboardButton("👥 VÀO NHÓM THẢO LUẬN", url="https://t.me/swc_capital_vn")]]
                
                welcome_text = """👋 Chào bác!

*Tin nhắn này của bác đã được em chuyển trực tiếp đến BQT. BQT sẽ phản hồi bác trong chốc lát nhé.*

Trong lúc chờ đợi, mời bác tham gia thảo luận tại cộng đồng chính thức:

*Nếu lần đầu bác sử dụng Telegram thì hãy bấm vào nút Chuyển Ngôn Ngữ Sang Tiếng Việt Nhé* 👇 👇 👇 👇"""

                await update.message.reply_text(
                    welcome_text, 
                    reply_markup=InlineKeyboardMarkup(kb),
                    parse_mode='Markdown'
                )
                
                for admin_id in ADMIN_IDS:
                    try:
                        fwd = await context.bot.forward_message(chat_id=admin_id, from_chat_id=user_id, message_id=update.message.message_id)
                        FORWARD_MAP[fwd.message_id] = user_id
                    except: pass

    else: 
        if not user_text: return 
        
        data = await get_data_from_sheet(user_text.lower()) if len(user_text) < 200 else None
        
        if data:
            MESSAGE_COUNTER += 1
            msg = data['msg1']
            if data['link']: msg += f"\n👉 Link: {data['link']}"
            try: await update.message.reply_photo(data['img'], caption=msg)
            except: await update.message.reply_text(msg)
            if data['msg2']:
                await asyncio.sleep(2)
                await update.message.reply_text(data['msg2'])
        else:
            await context.bot.send_chat_action(update.effective_chat.id, constants.ChatAction.TYPING)
            ans = await ask_ai(user_text)
            if ans: await send_smart_messages(update, context, ans)

# ==============================================================================
# MAIN THREAD
# ==============================================================================
if __name__ == '__main__':
    keep_alive() 
    TOKEN = os.environ.get("TELEGRAM_TOKEN")
    if TOKEN:
        try:
            app = ApplicationBuilder().token(TOKEN).build()
            job_queue = app.job_queue
            job_queue.run_repeating(auto_news_job, interval=14400, first=60)
            
            app.add_handler(CommandHandler("ping", ping))
            app.add_handler(CommandHandler("id", get_id))
            app.add_handler(ChatMemberHandler(greet_chat_members, ChatMemberHandler.CHAT_MEMBER))
            app.add_handler(MessageHandler(filters.ALL, handle_message))
            
            print("🟢 Bot SWC Final v55 ĐÃ SẴN SÀNG CHỜ TIN NHẮN!")
            app.run_polling(allowed_updates=Update.ALL_TYPES, drop_pending_updates=True)
        except Exception as e:
            print(f"❌ Lỗi bật Bot: {e}")
