import { GoogleGenAI, Type } from '@google/genai';
import { GeoMindSolveResult } from '../types/geomind';
import { synthesizeGeometryFromText } from './geometrySynthesizer';

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
}

/**
 * Model AI Configuration per AI_INSTRUCTIONS.md:
 * 1. gemini-3-flash-preview (Default)
 * 2. gemini-3-pro-preview
 * 3. gemini-2.5-flash
 */
export const AI_MODELS: ModelOption[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    description: 'Tốc độ nhanh nhất, tối ưu cho phân tích và dựng hình tức thì',
    isDefault: true,
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    description: 'Mô hình tư duy chuyên sâu, tính toán hình học phức tạp',
    isDefault: false,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Mô hình dự phòng ổn định cao khi quota bị giới hạn',
    isDefault: false,
  },
];

export const GEOMETRY_SYSTEM_INSTRUCTION = `Bạn là Trợ lý AI chuyên gia giải toán và vẽ hình học không gian THPT Việt Nam (Bộ sách Kết nối tri thức với cuộc sống).
Nhiệm vụ của bạn là phân tích đề bài toán hình học không gian THPT (lớp 11 và 12), TỰ ĐỘNG DỰNG HÌNH CHÍNH XÁC 100% trong không gian 3 chiều Three.js, tính toán ĐIỂM CẮT, ĐƯỜNG CAO, HÌNH CHIẾU VUÔNG GÓC, NÉT KHUẤT / NÉT THẤY và kế hoạch sư phạm 3 cấp độ.

QUY TẮC DỰNG HÌNH & TÍNH TOÁN TỌA ĐỘ BẮT BUỘC:
1. Hệ tọa độ 3D:
   - Trục y: Chiều cao thẳng đứng hướng lên (đáy nằm trên mặt phẳng y = 0, đỉnh S có y > 0).
   - Trục x và z: Mặt phẳng nằm ngang (đáy), tâm đáy hoặc trọng tâm đặt gần (0,0,0).
   - Tọa độ nên nằm gọn trong khoảng [-3.5, 3.5] để hiển thị cân đối, trực quan.
2. Quy tắc Nét vẽ Hình học THPT Việt Nam (BẮT BUỘC CHÍNH XÁC):
   - Cạnh bị che khuất (nhìn không thấy từ góc nhìn phối cảnh): style = "dashed" (nét đứt). Ví dụ: Các cạnh đáy phía sau (AB, AD trong hình chóp S.ABCD khi nhìn từ trước), đoạn đường cao SA hạ vào phía trong.
   - Cạnh nhìn thấy: style = "solid" (nét liền).
3. ĐIỂM CẮT & ĐƯỜNG PHỤ CHÍNH XÁC:
   - Nếu có chân đường vuông góc (ví dụ AH ⊥ SO, AH ⊥ SB), tọa độ điểm H BẮT BUỘC phải nằm chính xác trên đoạn thẳng SO hoặc SB (sử dụng công thức hình chiếu vuông góc véctơ: H = S + t*(O - S)).
   - Nếu có giao điểm đường thẳng và mặt phẳng hoặc hai đường thẳng (như O = AC ∩ BD, M là trung điểm), tọa độ điểm cắt PHẢI CHÍNH XÁC TUYỆT ĐỐI.
   - Các điểm phụ phải được liệt kê trong auxiliaryPoints kèm id, label, tọa độ x,y,z và mô tả rõ ràng.
   - Các đoạn phụ (như AC, BD, SO, AH, HK) phải được liệt kê trong auxiliaryLines kèm màu sắc nổi bật.
4. Ký hiệu góc vuông (rightAngleMarkers): Liệt kê chính xác các góc vuông ở chân đường cao hoặc đáy.
5. Thiết diện (cuttingPlane): Nếu bài toán liên quan đến thiết diện, cung cấp tọa độ các đỉnh thiết diện cắt qua các cạnh của hình khối.
6. Hệ trục Oxyz (oxyzAxes): Cho bài toán lớp 12 hoặc khi thuận tiện để tọa độ hóa.`;

export interface SolveProgressCallback {
  onStepChange?: (step: number, status: 'running' | 'success' | 'error', model: string, errorMsg?: string) => void;
}

export async function solveGeometryProblem(
  problemText: string,
  grade: 11 | 12 = 11,
  selectedModel: string = 'gemini-3-flash-preview',
  progressCb?: SolveProgressCallback
): Promise<{ result: GeoMindSolveResult; modelUsed: string }> {
  const apiKey = (typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : '') || '';

  // Order of models to try per AI_INSTRUCTIONS.md:
  // Try selected model first, then fallback through gemini-3-flash-preview, gemini-3-pro-preview, gemini-2.5-flash
  const candidateModels = [
    selectedModel,
    ...AI_MODELS.map((m) => m.id).filter((id) => id !== selectedModel),
  ];

  let rawApiErrorString: string | null = null;

  // If user has provided a Gemini API Key in localStorage, use client-side GenAI with fallback
  if (apiKey && apiKey.trim().length > 5) {
    for (let i = 0; i < candidateModels.length; i++) {
      const model = candidateModels[i];
      try {
        progressCb?.onStepChange?.(1, 'running', model);

        const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
        const prompt = `Phân tích và tự động dựng hình học không gian THPT cho đề bài sau (Toán ${grade}):

ĐỀ BÀI:
${problemText}

Hãy tạo dữ liệu 3D chính xác tuyệt đối (tọa độ các đỉnh, điểm cắt, nét liền/nét đứt, đường kẻ phụ, hệ trục Oxyz) cùng lời giải sư phạm 3 cấp độ.`;

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: GEOMETRY_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                modelConfirmation: { type: Type.STRING },
                systemCode: { type: Type.STRING },
                hypothesisConclusion: {
                  type: Type.OBJECT,
                  properties: {
                    hypothesis: { type: Type.ARRAY, items: { type: Type.STRING } },
                    conclusion: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['hypothesis', 'conclusion'],
                },
                geometryData: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    shapeType: { type: Type.STRING },
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
                          style: { type: Type.STRING },
                          label: { type: Type.STRING },
                        },
                        required: ['from', 'to', 'style'],
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
              required: ['modelConfirmation', 'hypothesisConclusion', 'geometryData', 'pedagogy'],
            },
          },
        });

        progressCb?.onStepChange?.(1, 'success', model);
        progressCb?.onStepChange?.(2, 'success', model);
        progressCb?.onStepChange?.(3, 'success', model);

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.geometryData && parsed.geometryData.vertices?.length > 0) {
          return { result: parsed, modelUsed: model };
        }
      } catch (err: any) {
        // Extract raw API error code/string (e.g. 429 RESOURCE_EXHAUSTED) per AI_INSTRUCTIONS.md
        const errMsg = err?.message || err?.statusText || String(err);
        rawApiErrorString = errMsg;
        console.warn(`[Fallback] Model ${model} gặp lỗi: ${errMsg}. Tự động thử model tiếp theo...`);
        progressCb?.onStepChange?.(1, 'error', model, errMsg);
      }
    }
  }

  // If user entered key but all models failed, per AI_INSTRUCTIONS.md:
  // "Nếu tất cả các model đều thất bại -> Hiện thông báo lỗi màu đỏ, hiển thị nguyên văn lỗi từ API (VD: 429 RESOURCE_EXHAUSTED)."
  if (apiKey && apiKey.trim().length > 5 && rawApiErrorString) {
    throw new Error(rawApiErrorString);
  }

  // If no API key was entered yet, smoothly fallback to local synthesizer
  const synthetic = synthesizeGeometryFromText(problemText, grade);
  if (synthetic) {
    progressCb?.onStepChange?.(1, 'success', 'Bộ giải hình học thuật toán');
    progressCb?.onStepChange?.(2, 'success', 'Bộ giải hình học thuật toán');
    progressCb?.onStepChange?.(3, 'success', 'Bộ giải hình học thuật toán');
    return {
      result: synthetic,
      modelUsed: 'Thuật toán Dựng hình Không gian Chính xác',
    };
  }

  throw new Error('Chưa có API key và không thể phân tích đề bài. Vui lòng nhập Gemini API key tại nút Settings.');
}
