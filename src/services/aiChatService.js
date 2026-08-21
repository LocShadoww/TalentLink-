// src/services/aiChatService.js
// Service Xử lý AI Chatbot Hybrid (Google Gemini API + Rule-based Offline Fallback) cho SenBot DTHU

// Cấu hình API Key cho Google Gemini (Đọc từ biến môi trường .env)
export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

/**
 * Phân tích câu trả lời từ Bot để tách văn bản thuần và Tag Hành động [ACTION: ...]
 */
export const parseBotResponse = (rawText) => {
  if (!rawText) return { text: '', action: null };

  let action = null;
  let text = rawText;

  const actionMatch = rawText.match(/\[ACTION:\s*([A-Z_]+)\]/i);
  if (actionMatch) {
    action = actionMatch[1].toUpperCase();
    text = rawText.replace(/\[ACTION:\s*([A-Z_]+)\]/gi, '').trim();
  }

  return { text, action };
};

/**
 * Hàm gọi API Google Gemini (Lớp 1: Online)
 */
const callGeminiAPI = async (userMessage) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
    throw new Error('Chưa cấu hình GEMINI_API_KEY hợp lệ');
  }

  const promptText = `Bạn là SenBot - Trợ lý AI Tìm việc Sinh viên DTHU tại TP. Cao Lãnh (Đồng Tháp). Hãy trả lời ngắn gọn, thân thiện, súc tích (1-3 câu). 
Nếu người dùng tìm việc theo ngành hoặc muốn tìm việc trên bản đồ, hãy chèn tag hành động phù hợp ở cuối câu: [ACTION: IT], [ACTION: FB], [ACTION: RETAIL], [ACTION: TUTOR], [ACTION: MAP].
Nội dung câu hỏi của sinh viên: "${userMessage}"`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: promptText }],
      },
    ],
  };

  const models = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          return parseBotResponse(rawText);
        }
      } else {
        try {
          const errorDetail = await response.json();
          console.log(`❌ Lỗi chi tiết từ Google API (${model}):`, errorDetail);
        } catch (e) {}
      }
    } catch (err) {
      console.warn(`Lỗi kết nối khi gọi model ${model}:`, err.message);
    }
  }

  throw new Error('Tất cả các model Gemini API đều không khả dụng, chuyển sang Offline Fallback');
};

/**
 * Xử lý Phản hồi Offline (Lớp 2: Rule-based Fallback khi mất mạng hoặc API lỗi)
 */
export const handleOfflineFallback = (userMessage) => {
  const query = (userMessage || '').toLowerCase().trim();

  // 1. Nhóm từ khóa Công nghệ thông tin / IT
  if (
    query.includes('it') ||
    query.includes('cntt') ||
    query.includes('lập trình') ||
    query.includes('code') ||
    query.includes('web') ||
    query.includes('frontend') ||
    query.includes('react') ||
    query.includes('phần mềm')
  ) {
    return {
      text: 'Dạ SenBot thấy hiện có các vị trí Lập trình viên React/JS, Thực tập sinh Web DTHU và Quản trị hệ thống dành cho sinh viên CNTT với trợ cấp 2.5 - 6 triệu/tháng.',
      action: 'IT',
    };
  }

  // 2. Nhóm từ khóa Phục vụ & Cafe / F&B
  if (
    query.includes('cafe') ||
    query.includes('cà phê') ||
    query.includes('phục vụ') ||
    query.includes('trà sữa') ||
    query.includes('pha chế') ||
    query.includes('bếp') ||
    query.includes('căn tin') ||
    query.includes('nhà hàng')
  ) {
    return {
      text: 'SenBot gợi ý bạn các việc làm Phục vụ & Pha chế ca linh hoạt tại HighCafe Chợ Cao Lãnh, Vincom và Căn tin DTHU với thu nhập từ 22k - 35k/giờ.',
      action: 'FB',
    };
  }

  // 3. Nhóm từ khóa Bán hàng & Thu ngân / Retail
  if (
    query.includes('bán hàng') ||
    query.includes('thu ngân') ||
    query.includes('siêu thị') ||
    query.includes('co.opmart') ||
    query.includes('kiểm kho') ||
    query.includes('shop') ||
    query.includes('bách hóa xanh')
  ) {
    return {
      text: 'SenBot thấy Siêu thị Co.opmart, Vincom Plaza và Bách Hóa Xanh đang tuyển Thu ngân & Bán hàng với mức lương hấp dẫn 25k - 38k/giờ.',
      action: 'RETAIL',
    };
  }

  // 4. Nhóm từ khóa Gia sư & Giáo dục
  if (
    query.includes('gia sư') ||
    query.includes('dạy kèm') ||
    query.includes('trợ giảng') ||
    query.includes('tiếng anh') ||
    query.includes('toán') ||
    query.includes('giáo dục')
  ) {
    return {
      text: 'Cơ hội cực kỳ phù hợp cho sinh viên DTHU! Các vị trí Gia sư Toán - Tin cấp 2/3 và Trợ giảng Tiếng Anh mầm non đang tuyển với thu nhập 80k - 120k/buổi.',
      action: 'TUTOR',
    };
  }

  // 5. Nhóm từ khóa Bản đồ & Địa điểm / GPS
  if (
    query.includes('bản đồ') ||
    query.includes('gần đây') ||
    query.includes('dthu') ||
    query.includes('vị trí') ||
    query.includes('chỉ đường') ||
    query.includes('địa chỉ')
  ) {
    return {
      text: 'Bạn có thể mở Bản đồ GPS để xem vị trí trực quan của từng việc làm quanh khuôn viên DTHU, Vincom và Chợ Cao Lãnh.',
      action: 'MAP',
    };
  }

  // 6. Nhóm câu hỏi Chào hỏi / Giới thiệu chung
  if (
    query.includes('xin chào') ||
    query.includes('chào') ||
    query.includes('hi') ||
    query.includes('hello') ||
    query.includes('bạn là ai')
  ) {
    return {
      text: 'Chào bạn! Mình là SenBot - Trợ lý AI Tìm việc Sinh viên DTHU. Bạn cần SenBot hỗ trợ gợi ý việc làm hay tư vấn phỏng vấn hôm nay?',
      action: null,
    };
  }

  // 7. Mặc định: Phản hồi chung hướng dẫn ứng tuyển
  return {
    text: 'Dạ, bạn có thể tìm việc làm part-time/freelance phù hợp theo ngành nghề, lưu tin yêu thích hoặc bấm nút bên dưới để xem vị trí công việc gần bạn cùng SenBot nhé!',
    action: 'MAP',
  };
};

/**
 * Gửi tin nhắn đến AI (Hybrid Handler)
 */
export const sendMessageToAI = async (userMessage) => {
  try {
    // Thử gọi Lớp 1 (Online Gemini API)
    return await callGeminiAPI(userMessage);
  } catch (error) {
    console.log('🤖 SenBot AI Info: Đang dùng Lớp 2 (Offline Fallback Handler) -', error.message);
    // Tự động chuyển sang Lớp 2 (Offline Fallback)
    return handleOfflineFallback(userMessage);
  }
};
