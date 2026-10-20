import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const GEOMIND_SYSTEM_INSTRUCTION = `Bạn là HỖ TRỢ VẼ HÌNH - PHẠM HẬU, Trợ lý Trí tuệ Nhân tạo chuyên sâu về Hình học Không gian THPT Việt Nam (Bộ sách Kết nối tri thức với cuộc sống). Bạn đóng vai trò là "Kỹ sư dựng hình không gian 3D chính xác" và "Gia sư tư duy sư phạm", hỗ trợ học sinh và giáo viên trong việc trực quan hóa, giải quyết các bài toán hình học phức tạp.

Nguyên tắc Dựng hình 3D & Tính toán Điểm cắt:
1. Độ chính xác tuyệt đối trong không gian 3 chiều:
   - Hệ trục: y hướng lên trên (chiều cao), x và z nằm trên mặt phẳng đáy y = 0.
   - Tâm đáy đặt gần gốc tọa độ (0,0,0).
   - Tọa độ trong khoảng [-3.5, 3.5] để hiển thị hài hòa, cân đối.
2. Quy chuẩn nét vẽ Hình học Không gian THPT Việt Nam:
   - Cạnh bị che khuất: style = "dashed" (nét đứt).
   - Cạnh nhìn thấy: style = "solid" (nét liền).
3. Điểm cắt & Đường phụ chính xác:
   - Tọa độ các điểm cắt (giao điểm hai đường thẳng, giao điểm đường thẳng với mặt phẳng, chân đường vuông góc AH ⊥ SO, trung điểm) PHẢI NẰM CHÍNH XÁC trên các đoạn thẳng tương ứng, tính toán đúng công thức véctơ hình học.
   - Thể hiện rõ các điểm phụ trong auxiliaryPoints và các đoạn nối phụ trong auxiliaryLines.
4. Ký hiệu góc vuông và mặt phẳng thiết diện (nếu có).

Nguyên tắc Sư phạm:
1. Chiến lược gợi ý 3 cấp độ:
   - Cấp 1: Định lý liên quan (SGK Kết nối tri thức).
   - Cấp 2: Gợi ý điểm cắt, đường kẻ phụ / mặt phẳng phụ.
   - Cấp 3: Hướng dẫn giải chi tiết từng bước.
2. Chuyển đổi Oxyz: Đề xuất phương án tọa độ hóa cho bài toán lớp 12 khi có yếu tố vuông góc thuận lợi.`;

// Server-side Gemini client
const getAiClient = () => {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Endpoint to solve / generate 3D model & pedagogical plan
app.post('/api/geomind/solve', async (req: Request, res: Response) => {
  try {
    const { problemText, grade = 11, focusMode = 'hint' } = req.body;

    if (!problemText || typeof problemText !== 'string') {
      res.status(400).json({ error: 'problemText is required' });
      return;
    }

    const ai = getAiClient();

    const prompt = `Phân tích và giải bài toán hình học không gian THPT sau đây theo chuẩn SGK "Kết nối tri thức với cuộc sống" (Toán ${grade}):

ĐỀ BÀI:
${problemText}

Hãy tạo dữ liệu 3D chính xác để vẽ mô hình tương tác Three.js/AR cùng với 3 cấp độ sư phạm.
LƯU Ý QUAN TRỌNG VỀ TỌA ĐỘ 3D:
- Hệ tọa độ: y hướng lên trên (chiều cao), x và z nằm trên mặt phẳng nằm ngang.
- Tọa độ nên nằm trong khoảng [-4, 4] để hiển thị trực quan đẹp mắt trên màn hình.
- Đáy nằm trên mặt phẳng y = 0.
- Nét vẽ: Cạnh bị che khuất thì style: "dashed", cạnh thấy thì style: "solid".
- Nếu có đường kẻ phụ (ví dụ kẻ AH vuông góc với SB hoặc nối trung điểm), hãy định nghĩa trong auxiliaryLines và auxiliaryPoints kèm stepLevel: 2.
- Nếu bài toán liên quan đến thiết diện hoặc mặt cắt, hãy cung cấp định nghĩa cuttingPlane.
- Cung cấp thiết lập hệ trục tọa độ Oxyz (oxyzAxes) phù hợp với bài toán.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: GEOMIND_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            modelConfirmation: {
              type: Type.STRING,
              description: 'Xác nhận mô hình: Mô tả tóm tắt cấu trúc hình học vừa khởi tạo',
            },
            systemCode: {
              type: Type.STRING,
              description: 'Mã lệnh hệ thống AR (ví dụ: AR_BUILD(SHAPE="Pyramid", BASE="Square", H="SA"))',
            },
            hypothesisConclusion: {
              type: Type.OBJECT,
              properties: {
                hypothesis: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Giả thiết (GT)',
                },
                conclusion: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Kết luận (KL)',
                },
              },
              required: ['hypothesis', 'conclusion'],
            },
            geometryData: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                shapeType: { type: Type.STRING, description: 'pyramid, prism, cone, cylinder, etc.' },
                vertices: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                      z: { type: Type.NUMBER },
                      isBase: { type: Type.BOOLEAN },
                    },
                    required: ['id', 'label', 'x', 'y', 'z'],
                  },
                },
                edges: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      from: { type: Type.STRING },
                      to: { type: Type.STRING },
                      style: { type: Type.STRING, description: 'solid hoặc dashed' },
                      label: { type: Type.STRING },
                    },
                    required: ['from', 'to', 'style'],
                  },
                },
                faces: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      vertices: { type: Type.ARRAY, items: { type: Type.STRING } },
                      color: { type: Type.STRING },
                    },
                    required: ['vertices'],
                  },
                },
                auxiliaryPoints: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                      z: { type: Type.NUMBER },
                      description: { type: Type.STRING },
                      stepLevel: { type: Type.INTEGER },
                    },
                    required: ['id', 'label', 'x', 'y', 'z', 'description'],
                  },
                },
                auxiliaryLines: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      from: { type: Type.STRING },
                      to: { type: Type.STRING },
                      style: { type: Type.STRING },
                      description: { type: Type.STRING },
                      stepLevel: { type: Type.INTEGER },
                      color: { type: Type.STRING },
                    },
                    required: ['id', 'from', 'to', 'description', 'stepLevel'],
                  },
                },
                rightAngleMarkers: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      at: { type: Type.STRING },
                      from: { type: Type.STRING },
                      to: { type: Type.STRING },
                      label: { type: Type.STRING },
                    },
                    required: ['at', 'from', 'to'],
                  },
                },
                cuttingPlane: {
                  type: Type.OBJECT,
                  properties: {
                    enabled: { type: Type.BOOLEAN },
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    passThroughPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                    normal: {
                      type: Type.OBJECT,
                      properties: {
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        z: { type: Type.NUMBER },
                      },
                    },
                    distance: { type: Type.NUMBER },
                    polygonVertices: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          x: { type: Type.NUMBER },
                          y: { type: Type.NUMBER },
                          z: { type: Type.NUMBER },
                        },
                        required: ['x', 'y', 'z'],
                      },
                    },
                  },
                },
                oxyzAxes: {
                  type: Type.OBJECT,
                  properties: {
                    originId: { type: Type.STRING },
                    originLabel: { type: Type.STRING },
                    oxVector: { type: Type.STRING },
                    oyVector: { type: Type.STRING },
                    ozVector: { type: Type.STRING },
                    notes: { type: Type.STRING },
                    vertexCoordinates: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          pointId: { type: Type.STRING },
                          coordString: { type: Type.STRING },
                        },
                        required: ['pointId', 'coordString'],
                      },
                    },
                  },
                },
              },
              required: ['vertices', 'edges'],
            },
            pedagogy: {
              type: Type.OBJECT,
              properties: {
                level1Theorem: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    theorems: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          textbookRef: { type: Type.STRING },
                          content: { type: Type.STRING },
                        },
                        required: ['name', 'content'],
                      },
                    },
                    questionPrompt: { type: Type.STRING },
                  },
                  required: ['title', 'theorems', 'questionPrompt'],
                },
                level2Auxiliary: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    linesToDraw: { type: Type.ARRAY, items: { type: Type.STRING } },
                    geometricReason: { type: Type.STRING },
                    guidingQuestion: { type: Type.STRING },
                  },
                  required: ['title', 'linesToDraw', 'geometricReason'],
                },
                level3Detailed: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    steps: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          stepNumber: { type: Type.INTEGER },
                          heading: { type: Type.STRING },
                          explanation: { type: Type.STRING },
                          formula: { type: Type.STRING },
                        },
                        required: ['stepNumber', 'heading', 'explanation'],
                      },
                    },
                    finalAnswer: { type: Type.STRING },
                  },
                  required: ['title', 'steps', 'finalAnswer'],
                },
              },
              required: ['level1Theorem', 'level2Auxiliary', 'level3Detailed'],
            },
            arInteractionTips: {
              type: Type.OBJECT,
              properties: {
                cameraAngleRecommendation: { type: Type.STRING },
                crossSectionAdvice: { type: Type.STRING },
                touchDragNotes: { type: Type.STRING },
              },
              required: ['cameraAngleRecommendation', 'crossSectionAdvice', 'touchDragNotes'],
            },
            advancedExtension: {
              type: Type.OBJECT,
              properties: {
                oxyzAlternativeMethod: { type: Type.STRING },
                similarProblem: { type: Type.STRING },
                teacherNote: { type: Type.STRING },
              },
              required: ['similarProblem'],
            },
          },
          required: [
            'modelConfirmation',
            'systemCode',
            'hypothesisConclusion',
            'geometryData',
            'pedagogy',
            'arInteractionTips',
            'advancedExtension',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('GeoMind solve error:', err);
    res.status(500).json({ error: err.message || 'Lỗi khi xử lý bài toán' });
  }
});

// Endpoint for conversational tutoring follow-up
app.post('/api/geomind/chat', async (req: Request, res: Response) => {
  try {
    const { problemContext, chatHistory, userMessage } = req.body;

    if (!userMessage) {
      res.status(400).json({ error: 'userMessage is required' });
      return;
    }

    const ai = getAiClient();

    const prompt = `Bối cảnh bài toán hiện tại:
${JSON.stringify(problemContext || {})}

Lịch sử trò chuyện:
${(chatHistory || []).map((m: any) => `${m.role === 'user' ? 'Học sinh' : 'GeoMind'}: ${m.content}`).join('\n')}

Câu hỏi mới của Học sinh:
"${userMessage}"

Hãy trả lời theo chuẩn mực sư phạm GeoMind AR:
- Khích lệ học sinh tự suy nghĩ, không đưa trực tiếp đáp án cuối nếu chưa qua các bước gợi ý.
- Bám sát SGK Kết nối tri thức.
- Nếu học sinh hỏi về góc nhìn AR, hướng dẫn cách xoay hình để quan sát.
- Sử dụng công thức toán rõ ràng (có thể dùng $...$ để KaTeX hiển thị).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: GEOMIND_SYSTEM_INSTRUCTION,
      },
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    console.error('GeoMind chat error:', err);
    res.status(500).json({ error: err.message || 'Lỗi khi trao đổi với trợ lý AI' });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HỖ TRỢ VẼ HÌNH - PHẠM HẬU server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
