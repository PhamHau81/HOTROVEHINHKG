import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Send,
  Sparkles,
  ChevronRight,
  Compass,
  MessageSquare,
  Lock,
  Unlock,
  GraduationCap,
  Crosshair,
  Award,
  RefreshCw,
  Check,
  X,
} from 'lucide-react';
import { GeoMindSolveResult, ChatMessage } from '../types/geomind';
import { MathText } from './MathText';

interface PedagogyMentorProps {
  data: GeoMindSolveResult;
  currentStepLevel: number;
  setCurrentStepLevel: (lvl: number) => void;
  onActivateAuxiliary: () => void;
  onActivateOxyz: () => void;
  chatMessages: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  isChatLoading: boolean;
}

export const PedagogyMentor: React.FC<PedagogyMentorProps> = ({
  data,
  currentStepLevel,
  setCurrentStepLevel,
  onActivateAuxiliary,
  onActivateOxyz,
  chatMessages,
  onSendMessage,
  isChatLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'pedagogy' | 'analysis' | 'quiz' | 'chat'>('pedagogy');
  const [inputMessage, setInputMessage] = useState('');

  // Interactive Quiz State
  const [userAnswers, setUserAnswers] = useState<{ [qIdx: number]: number }>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Dynamic Quiz generation based on active problem
  const quizQuestions = [
    {
      question: `Trong mô hình "${data.geometryData.title || 'hình học'}", đường vuông góc chính hoặc chân đường cao hình học là gì?`,
      options: [
        data.geometryData.rightAngleMarkers?.[0]?.label
          ? `${data.geometryData.rightAngleMarkers[0].label}`
          : 'Đường cao hạ từ đỉnh vuông góc với mặt phẳng đáy',
        'Đường chéo nằm hoàn toàn trên mặt phẳng đáy',
        'Cạnh bên nghiêng góc bất kỳ',
        'Đường thẳng song song với mặt phẳng đáy',
      ],
      correctIdx: 0,
      explanation: 'Dựa vào giả thiết bài toán và các điểm đánh dấu vuông góc, đây là yếu tố then chốt để xác định khoảng cách và góc.',
    },
    {
      question: `Điểm cắt hoặc điểm phụ ${data.geometryData.auxiliaryPoints?.[0]?.label || 'H'} được xác định bằng tính chất nào?`,
      options: [
        'Lấy ngẫu nhiên trên cạnh',
        data.geometryData.auxiliaryPoints?.[0]?.description || 'Hình chiếu vuông góc hoặc giao điểm chính xác',
        'Điểm nằm ngoài không gian hình khối',
        'Trung điểm của cạnh đối diện',
      ],
      correctIdx: 1,
      explanation: 'Tọa độ điểm cắt được xác định chính xác bằng hình chiếu trực giao véctơ hoặc giao tuyến hai mặt phẳng.',
    },
    {
      question: 'Kết quả giải hoặc giá trị kết luận của bài toán là:',
      options: [
        data.pedagogy.level3Detailed.finalAnswer || 'Đáp số tính toán từ hệ thức lượng',
        'Không xác định được giá trị',
        'Góc luôn bằng 0°',
        'Khoảng cách bằng vô cùng',
      ],
      correctIdx: 0,
      explanation: `Kết luận chi tiết: ${data.pedagogy.level3Detailed.finalAnswer}`,
    },
  ];

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setSubmitted(false);
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIdx) score++;
    });
    return score;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isChatLoading) return;
    const msg = inputMessage;
    setInputMessage('');
    await onSendMessage(msg);
  };

  const quickQuestions = [
    'Tại sao điểm cắt H phải nằm chính xác trên đoạn SO?',
    'Cách gắn hệ trục tọa độ Oxyz cho bài này?',
    'Có cách giải nào khác bằng hình học thuần túy không?',
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100 overflow-hidden shadow-2xl">
      {/* Top Mentor Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
            <GraduationCap className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">
                HỖ TRỢ VẼ HÌNH - PHẠM HẬU
              </h2>
            </div>
            <p className="text-[10px] text-cyan-400 font-medium">Toán Hình học Không gian THPT (KNTT)</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs">
          <button
            onClick={() => setActiveTab('pedagogy')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'pedagogy'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lộ trình
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-2 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'analysis'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            GT/KL
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-2 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'quiz'
                ? 'bg-amber-500 text-slate-950 shadow font-bold'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <Award className="w-3 h-3" />
            <span>Trắc nghiệm</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-2 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'chat'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>Hỏi đáp</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: 3-TIER PEDAGOGY GUIDANCE */}
        {activeTab === 'pedagogy' && (
          <div className="space-y-4">
            {/* Level Stepper Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
              <button
                onClick={() => setCurrentStepLevel(1)}
                className={`py-2 px-2 text-center rounded-lg text-xs font-semibold transition-all ${
                  currentStepLevel === 1
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                Cấp 1: Định lý
              </button>
              <button
                onClick={() => setCurrentStepLevel(2)}
                className={`py-2 px-2 text-center rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                  currentStepLevel === 2
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <span>Cấp 2: Điểm cắt</span>
                {currentStepLevel < 2 ? (
                  <Lock className="w-3 h-3 opacity-60" />
                ) : (
                  <Unlock className="w-3 h-3 text-slate-950" />
                )}
              </button>
              <button
                onClick={() => setCurrentStepLevel(3)}
                className={`py-2 px-2 text-center rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                  currentStepLevel === 3
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <span>Cấp 3: Lời giải</span>
                {currentStepLevel < 3 ? (
                  <Lock className="w-3 h-3 opacity-60" />
                ) : (
                  <Unlock className="w-3 h-3 text-slate-950" />
                )}
              </button>
            </div>

            {/* LEVEL 1: THEOREMS */}
            {currentStepLevel >= 1 && (
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  currentStepLevel === 1
                    ? 'bg-slate-950/80 border-cyan-500/50 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/40 border-slate-800 opacity-90'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 rounded-md bg-cyan-500/20 text-cyan-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    {data.pedagogy.level1Theorem.title}
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {data.pedagogy.level1Theorem.theorems.map((t, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-900/90 rounded-xl border border-slate-800/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{t.name}</span>
                        {t.textbookRef && (
                          <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-2 py-0.5 rounded">
                            {t.textbookRef}
                          </span>
                        )}
                      </div>
                      <MathText content={t.content} className="text-slate-300 text-[11px]" />
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-xs text-cyan-200 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-cyan-300">Câu hỏi định hướng tư duy: </span>
                    <MathText content={data.pedagogy.level1Theorem.questionPrompt} />
                  </div>
                </div>

                {currentStepLevel === 1 && (
                  <button
                    onClick={() => {
                      setCurrentStepLevel(2);
                      onActivateAuxiliary();
                    }}
                    className="mt-3 w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
                  >
                    <span>Xem Cấp 2: Xác Định Điểm Cắt & Đường Kẻ Phụ</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* LEVEL 2: AUXILIARY LINES & INTERSECTIONS */}
            {currentStepLevel >= 2 && (
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  currentStepLevel === 2
                    ? 'bg-slate-950/80 border-amber-500/50 ring-1 ring-amber-500/30'
                    : 'bg-slate-950/40 border-slate-800 opacity-90'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-amber-500/20 text-amber-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      {data.pedagogy.level2Auxiliary.title}
                    </h3>
                  </div>
                  <button
                    onClick={onActivateAuxiliary}
                    className="text-[11px] px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg transition-colors font-medium flex items-center gap-1"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Hiện trên 3D</span>
                  </button>
                </div>

                <div className="space-y-2 mb-3">
                  {data.pedagogy.level2Auxiliary.linesToDraw.map((line, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-200 flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <MathText content={line} />
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-200">
                  <span className="font-semibold text-amber-300">Căn cứ hình học & Điểm cắt: </span>
                  <MathText content={data.pedagogy.level2Auxiliary.geometricReason} />
                </div>

                {data.pedagogy.level2Auxiliary.guidingQuestion && (
                  <div className="mt-2.5 p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-300">Gợi ý suy luận: </span>
                      <MathText content={data.pedagogy.level2Auxiliary.guidingQuestion} />
                    </div>
                  </div>
                )}

                {currentStepLevel === 2 && (
                  <button
                    onClick={() => setCurrentStepLevel(3)}
                    className="mt-3 w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <span>Xem Hướng Dẫn Giải Chi Tiết Cấp 3</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* LEVEL 3: DETAILED STEP-BY-STEP */}
            {currentStepLevel >= 3 && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/50 ring-1 ring-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {data.pedagogy.level3Detailed.title}
                  </h3>
                </div>

                <div className="space-y-3">
                  {data.pedagogy.level3Detailed.steps.map((st) => (
                    <div
                      key={st.stepNumber}
                      className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center gap-2 font-semibold text-emerald-300">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0">
                          {st.stepNumber}
                        </span>
                        <span>{st.heading}</span>
                      </div>
                      <MathText content={st.explanation} className="text-slate-300 pl-7 text-[12px]" />
                      {st.formula && (
                        <div className="pl-7 pt-1">
                          <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-center text-cyan-300 text-xs overflow-x-auto">
                            <MathText content={st.formula} block />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Final Answer Banner */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-500/50 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase text-[11px] tracking-wide">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Kết Luận:</span>
                  </div>
                  <MathText content={data.pedagogy.level3Detailed.finalAnswer} className="text-slate-100 font-medium text-[13px]" />
                </div>
              </div>
            )}

            {/* EXTENSIONS & OXYZ */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-blue-400" />
                  <span>Phương Pháp Tọa Độ Hóa Oxyz (Toán 12)</span>
                </span>
                {data.geometryData.oxyzAxes && (
                  <button
                    onClick={onActivateOxyz}
                    className="text-[11px] px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded-lg font-medium transition-colors"
                  >
                    Gắn trục Oxyz
                  </button>
                )}
              </div>

              {data.advancedExtension?.oxyzAlternativeMethod && (
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-blue-400">Cách giải bằng tọa độ Oxyz:</span>
                  <MathText
                    content={data.advancedExtension.oxyzAlternativeMethod}
                    className="text-slate-300 text-[11px]"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PROBLEM ANALYSIS (GT / KL) */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                1. Xác nhận mô hình hình học
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{data.modelConfirmation}</p>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-400">
                {data.systemCode}
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Phân tích Giả thiết & Kết luận (GT/KL)
              </span>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-amber-400">Giả thiết (GT):</span>
                <ul className="space-y-1">
                  {data.hypothesisConclusion.hypothesis.map((h, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <MathText content={h} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w-full h-[1px] bg-slate-800" />

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-emerald-400">Kết luận (KL):</span>
                <ul className="space-y-1">
                  {data.hypothesisConclusion.conclusion.map((c, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <MathText content={c} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INTERACTIVE PRACTICE QUIZ (GAMIFICATION FROM SKILL EDUCATION) */}
        {activeTab === 'quiz' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Luyện Tập Trắc Nghiệm Hình Học</span>
                </span>
                {submitted && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950 font-mono">
                    Điểm: {calculateScore()} / {quizQuestions.length}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Thử tài trả lời nhanh các câu hỏi trắc nghiệm liên quan đến mô hình 3D đang hiển thị
              </p>
            </div>

            <div className="space-y-3">
              {quizQuestions.map((q, qIdx) => (
                <div key={qIdx} className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2.5 text-xs">
                  <div className="font-semibold text-slate-200 leading-snug">
                    <span className="text-cyan-400 mr-1.5">Câu {qIdx + 1}:</span>
                    {q.question}
                  </div>

                  <div className="space-y-1.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[qIdx] === optIdx;
                      const isCorrect = q.correctIdx === optIdx;

                      let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850';
                      if (submitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-950 border-rose-500 text-rose-300 line-through';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-semibold';
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(qIdx, optIdx)}
                          className={`w-full text-left p-2.5 rounded-xl border text-[11.5px] transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                          {submitted && isCorrect && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />}
                          {submitted && isSelected && !isCorrect && <X className="w-3.5 h-3.5 text-rose-400 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  {submitted && (
                    <div className="p-2 bg-slate-900/90 border border-slate-800/80 rounded-xl text-[11px] text-slate-300 space-y-0.5">
                      <span className="font-semibold text-amber-400">Giải thích: </span>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit / Reset Actions */}
            <div className="flex items-center gap-2 pt-1">
              {!submitted ? (
                <button
                  onClick={() => setSubmitted(true)}
                  disabled={Object.keys(userAnswers).length === 0}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20"
                >
                  Nộp Bài & Xem Điểm
                </button>
              ) : (
                <button
                  onClick={handleResetQuiz}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Làm Lại Trắc Nghiệm</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CHAT TUTORING */}
        {activeTab === 'chat' && (
          <div className="space-y-3 h-full flex flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {chatMessages.length === 0 ? (
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Hỏi đáp với Trợ lý Hỗ Trợ Vẽ Hình</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Đặt câu hỏi về cách chứng minh, cách tìm điểm cắt hoặc phương pháp tọa độ hóa Oxyz.
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    {quickQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => onSendMessage(q)}
                        className="w-full text-left p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] text-cyan-300 hover:text-cyan-200 transition-colors"
                      >
                        "{q}"
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] p-3 rounded-2xl text-xs ${
                        msg.role === 'user'
                          ? 'bg-cyan-600 text-white rounded-br-none'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      <MathText content={msg.content} />
                    </div>
                  </div>
                ))
              )}

              {isChatLoading && (
                <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl text-xs text-cyan-400 border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Đang phân tích và trả lời câu hỏi...</span>
                </div>
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleSend} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập câu hỏi về hình vẽ..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isChatLoading || !inputMessage.trim()}
                className="p-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
