const { GoogleGenerativeAI } = require('@google/generative-ai');

// Cấu hình API Key (Lấy từ biến môi trường)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'DUMMY_KEY');

async function screenCV(jobDetails, candidateDetails) {
  if (!process.env.GEMINI_API_KEY) {
    return {
      score: 85,
      feedback: "Chưa cấu hình GEMINI_API_KEY. Đây là dữ liệu giả lập. Ứng viên phù hợp với mô tả công việc."
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Bạn là một Chuyên gia Tuyển dụng (HR Manager) dày dặn kinh nghiệm.
Hãy phân tích độ phù hợp của ứng viên sau đối với công việc được cung cấp.

THÔNG TIN CÔNG VIỆC:
- Chức danh: ${jobDetails.title}
- Yêu cầu: ${jobDetails.requirements}
- Mô tả: ${jobDetails.description}

THÔNG TIN ỨNG VIÊN:
- Tên: ${candidateDetails.full_name}
- Kỹ năng: ${candidateDetails.skills}
- Giới thiệu bản thân: ${candidateDetails.bio}

NHIỆM VỤ:
Trình bày kết quả dưới dạng JSON với định dạng sau, không thêm bất kỳ văn bản nào khác ngoài JSON:
{
  "score": <Điểm số độ phù hợp từ 0 đến 100>,
  "feedback": "<1 hoặc 2 câu nhận xét ngắn gọn, sắc bén về điểm mạnh/yếu của ứng viên so với công việc. Hãy dùng ngôn ngữ chuyên nghiệp.>"
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse JSON từ phản hồi của AI
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("AI Screening Error:", error);
    return {
      score: 0,
      feedback: "Lỗi khi gọi AI API. Vui lòng thử lại sau."
    };
  }
}

module.exports = { screenCV };
