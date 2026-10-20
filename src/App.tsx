/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { CURRICULUM_PROBLEMS, CurriculumProblem } from './data/curriculumData';
import { GeoMindSolveResult, ChatMessage } from './types/geomind';
import { ThreeViewport } from './components/ThreeViewport';
import { BottomDock } from './components/BottomDock';
import { PedagogyMentor } from './components/PedagogyMentor';
import { Header } from './components/Header';
import { AnnotationLayer } from './components/AnnotationLayer';
import { NetUnfoldModal } from './components/NetUnfoldModal';
import { solveGeometryProblem } from './utils/aiClient';
import {
  exportToWordDocument,
  exportToPowerPointPresentation,
  exportToMoodleGiftFormat,
} from './utils/exportService';
import { CheckCircle2, AlertOctagon, X, Cpu } from 'lucide-react';

interface SolveProgressState {
  isActive: boolean;
  step1: 'pending' | 'running' | 'success' | 'error';
  step2: 'pending' | 'running' | 'success' | 'error';
  step3: 'pending' | 'running' | 'success' | 'error';
  currentModel: string;
  rawApiError?: string;
}

export default function App() {
  const [currentProblem, setCurrentProblem] = useState<CurriculumProblem>(CURRICULUM_PROBLEMS[0]);
  const [activeData, setActiveData] = useState<GeoMindSolveResult>(CURRICULUM_PROBLEMS[0].defaultData);

  // 3D Visual Toggles
  const [showAuxiliary, setShowAuxiliary] = useState<boolean>(true);
  const [showOxyz, setShowOxyz] = useState<boolean>(false);
  const [showCuttingPlane, setShowCuttingPlane] = useState<boolean>(false);
  const [cuttingPlaneT, setCuttingPlaneT] = useState<number>(0.5);

  // Interactive Tools from SKILL EDUCATION
  const [isAnnotationActive, setIsAnnotationActive] = useState<boolean>(false);
  const [isMeasureActive, setIsMeasureActive] = useState<boolean>(false);
  const [isNetUnfoldOpen, setIsNetUnfoldOpen] = useState<boolean>(false);

  // Image snapshot cache for exports
  const [lastSnapshotUrl, setLastSnapshotUrl] = useState<string | undefined>(undefined);

  // Pedagogy step level (1: Theorems, 2: Auxiliary Lines & Intersections, 3: Detailed Solution)
  const [currentStepLevel, setCurrentStepLevel] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Chat conversation
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Progress & State Management per AI_INSTRUCTIONS.md
  const [solveProgress, setSolveProgress] = useState<SolveProgressState>({
    isActive: false,
    step1: 'pending',
    step2: 'pending',
    step3: 'pending',
    currentModel: 'gemini-3-flash-preview',
  });

  // Switch curriculum problem
  const handleSelectProblem = useCallback((prob: CurriculumProblem) => {
    setCurrentProblem(prob);
    setActiveData(prob.defaultData);
    setCurrentStepLevel(1);
    setShowAuxiliary(true);
    setShowOxyz(prob.id.includes('oxyz'));
    setShowCuttingPlane(prob.id.includes('thiet-dien'));
    setChatMessages([]);
  }, []);

  // Submit custom natural language geometry problem:
  // "TỰ VẼ HÌNH THEO YÊU CẦU BÀI TOÁN NẠP VÀO" with State Management per AI_INSTRUCTIONS.md
  const handleCustomProblemSubmit = useCallback(async (text: string, grade: 11 | 12, selectedModel?: string) => {
    setSolveProgress({
      isActive: true,
      step1: 'running',
      step2: 'pending',
      step3: 'pending',
      currentModel: selectedModel || 'gemini-3-flash-preview',
      rawApiError: undefined,
    });

    try {
      const { result } = await solveGeometryProblem(
        text,
        grade,
        selectedModel || 'gemini-3-flash-preview',
        {
          onStepChange: (step, status, model, errorMsg) => {
            setSolveProgress((prev) => ({
              ...prev,
              currentModel: model,
              [`step${step}`]: status,
              rawApiError: errorMsg || prev.rawApiError,
            }));
          },
        }
      );

      setSolveProgress((prev) => ({
        ...prev,
        step1: 'success',
        step2: 'success',
        step3: 'success',
      }));

      // Short delay for user to see completed state
      setTimeout(() => {
        setActiveData(result);
        setCurrentProblem({
          id: `custom-${Date.now()}`,
          grade,
          chapter: grade === 11 ? 'Toán 11 - Hình học Không gian' : 'Toán 12 - Tọa độ hóa Oxyz',
          title: result.geometryData.title || 'Bài toán nạp vào',
          difficulty: 'Vận dụng',
          problemText: text,
          defaultData: result,
        });

        setCurrentStepLevel(1);
        setShowAuxiliary(true);
        setShowOxyz(!!result.geometryData.oxyzAxes);
        setShowCuttingPlane(!!result.geometryData.cuttingPlane?.enabled);
        setChatMessages([]);
        setSolveProgress((prev) => ({ ...prev, isActive: false }));
      }, 500);
    } catch (err: any) {
      // Per AI_INSTRUCTIONS.md:
      // "Nếu tất cả các model đều thất bại -> Hiện thông báo lỗi màu đỏ, hiển thị nguyên văn lỗi từ API (VD: 429 RESOURCE_EXHAUSTED).
      // Trạng thái các cột đang chờ phải chuyển thành 'Đã dừng do lỗi', tuyệt đối không được hiện 'Hoàn tất' hoặc checkmark xanh nếu quy trình bị gián đoạn."
      const rawError = err?.message || String(err);
      setSolveProgress((prev) => ({
        ...prev,
        step1: prev.step1 === 'success' ? 'success' : 'error',
        step2: prev.step2 === 'success' ? 'success' : 'error',
        step3: 'error',
        rawApiError: rawError,
      }));
    }
  }, []);

  // Send follow-up question
  const handleSendMessage = useCallback(
    async (messageText: string) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: messageText,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, userMsg]);
      setIsChatLoading(true);

      try {
        const res = await fetch('/api/geomind/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problemContext: {
              title: activeData.geometryData.title,
              hypothesis: activeData.hypothesisConclusion.hypothesis,
              conclusion: activeData.hypothesisConclusion.conclusion,
              stepLevel: currentStepLevel,
            },
            chatHistory: chatMessages,
            userMessage: messageText,
          }),
        });

        if (res.ok) {
          const { reply } = await res.json();
          const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: reply,
            timestamp: new Date(),
          };
          setChatMessages((prev) => [...prev, assistantMsg]);
        } else {
          // Local fallback reply
          const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: `Để giải quyết câu hỏi: "${messageText}", bạn hãy chú ý đến quan hệ vuông góc giữa đường thẳng và mặt phẳng trong hình vẽ 3D, đặc biệt là các điểm cắt và đường cao đã được đánh dấu màu vàng.`,
            timestamp: new Date(),
          };
          setChatMessages((prev) => [...prev, assistantMsg]);
        }
      } catch (err: any) {
        console.warn('Chat request fallback:', err);
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `Về câu hỏi của bạn: "${messageText}": Hãy xoay mô hình 3D sang góc xiên 45° để quan sát rõ mối liên hệ giữa các điểm cắt, hình chiếu vuông góc và mặt phẳng đáy.`,
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, assistantMsg]);
      } finally {
        setIsChatLoading(false);
      }
    },
    [activeData, chatMessages, currentStepLevel]
  );

  // Export handlers
  const handleExportWord = useCallback(() => {
    exportToWordDocument(activeData, currentProblem.problemText, lastSnapshotUrl);
  }, [activeData, currentProblem.problemText, lastSnapshotUrl]);

  const handleExportPowerPoint = useCallback(() => {
    exportToPowerPointPresentation(activeData, currentProblem.problemText, lastSnapshotUrl);
  }, [activeData, currentProblem.problemText, lastSnapshotUrl]);

  const handleExportMoodle = useCallback(() => {
    exportToMoodleGiftFormat(activeData, currentProblem.problemText);
  }, [activeData, currentProblem.problemText]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Application Header */}
      <Header
        currentProblemId={currentProblem.id}
        onSelectProblem={handleSelectProblem}
        onCustomProblemSubmit={handleCustomProblemSubmit}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isLoading={solveProgress.isActive && !solveProgress.rawApiError}
      />

      {/* Main Workspace: 3D Viewport on Left/Center, Mentor Panel on Right */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 3D Viewport */}
        <div className="flex-1 h-full relative">
          <ThreeViewport
            geometryData={activeData.geometryData}
            showAuxiliary={showAuxiliary}
            showOxyz={showOxyz}
            showCuttingPlane={showCuttingPlane}
            cuttingPlaneT={cuttingPlaneT}
            onSnapshotReady={(dataUrl) => setLastSnapshotUrl(dataUrl)}
            isMeasureActive={isMeasureActive}
          />

          {/* Interactive Annotation Layer (Drawing Blackboard on 3D) */}
          <AnnotationLayer
            isActive={isAnnotationActive}
            onClose={() => setIsAnnotationActive(false)}
          />

          {/* Unified Collapsible Bottom Dock with Export & Measurement Tools */}
          <BottomDock
            showAuxiliary={showAuxiliary}
            setShowAuxiliary={setShowAuxiliary}
            showOxyz={showOxyz}
            setShowOxyz={setShowOxyz}
            showCuttingPlane={showCuttingPlane}
            setShowCuttingPlane={setShowCuttingPlane}
            cuttingPlaneT={cuttingPlaneT}
            setCuttingPlaneT={setCuttingPlaneT}
            hasCuttingPlaneData={Boolean(activeData.geometryData.cuttingPlane)}
            hasOxyzData={Boolean(activeData.geometryData.oxyzAxes)}
            auxiliaryCount={
              activeData.geometryData.auxiliaryPoints?.length ||
              activeData.geometryData.auxiliaryLines?.length ||
              0
            }
            isAnnotationActive={isAnnotationActive}
            setIsAnnotationActive={setIsAnnotationActive}
            isMeasureActive={isMeasureActive}
            setIsMeasureActive={setIsMeasureActive}
            onOpenNetUnfold={() => setIsNetUnfoldOpen(true)}
            onExportWord={handleExportWord}
            onExportPowerPoint={handleExportPowerPoint}
            onExportMoodle={handleExportMoodle}
          />
        </div>

        {/* Pedagogical Mentor Side Panel */}
        {isSidebarOpen && (
          <aside className="w-full md:w-[420px] lg:w-[460px] h-full shrink-0 z-20">
            <PedagogyMentor
              data={activeData}
              currentStepLevel={currentStepLevel}
              setCurrentStepLevel={setCurrentStepLevel}
              onActivateAuxiliary={() => {
                setShowAuxiliary(true);
                setCurrentStepLevel(2);
              }}
              onActivateOxyz={() => setShowOxyz(true)}
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
              isChatLoading={isChatLoading}
            />
          </aside>
        )}
      </div>

      {/* Net Unfold 2D Modal */}
      <NetUnfoldModal
        isOpen={isNetUnfoldOpen}
        onClose={() => setIsNetUnfoldOpen(false)}
        geometryData={activeData.geometryData}
      />

      {/* Progress & State Management Modal per AI_INSTRUCTIONS.md */}
      {solveProgress.isActive && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    Tiến Trình Dựng Hình AI
                  </h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span>Đang sử dụng:</span>
                    <span className="font-mono text-cyan-300 font-semibold">{solveProgress.currentModel}</span>
                  </div>
                </div>
              </div>

              {solveProgress.rawApiError && (
                <button
                  onClick={() => setSolveProgress((prev) => ({ ...prev, isActive: false }))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Step-by-Step Progress Display */}
            <div className="space-y-2.5">
              {/* Step 1 */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white">Bước 1: </span>
                  <span className="text-slate-300">Phân tích đề & Xác định toạ độ đỉnh 3D</span>
                </div>
                {solveProgress.step1 === 'success' && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Hoàn tất
                  </span>
                )}
                {solveProgress.step1 === 'running' && (
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold animate-pulse">
                    Đang xử lý...
                  </span>
                )}
                {solveProgress.step1 === 'error' && (
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-bold flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3" /> Đã dừng do lỗi
                  </span>
                )}
                {solveProgress.step1 === 'pending' && (
                  <span className="text-slate-500 italic">Đang chờ</span>
                )}
              </div>

              {/* Step 2 */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white">Bước 2: </span>
                  <span className="text-slate-300">Tính toán điểm cắt, chân đường cao & nét vẽ</span>
                </div>
                {solveProgress.step2 === 'success' && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Hoàn tất
                  </span>
                )}
                {solveProgress.step2 === 'running' && (
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold animate-pulse">
                    Đang xử lý...
                  </span>
                )}
                {solveProgress.step2 === 'error' && (
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-bold flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3" /> Đã dừng do lỗi
                  </span>
                )}
                {solveProgress.step2 === 'pending' && (
                  <span className="text-slate-500 italic">Đang chờ</span>
                )}
              </div>

              {/* Step 3 */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white">Bước 3: </span>
                  <span className="text-slate-300">Thiết lập lộ trình gợi mở sư phạm 3 cấp độ</span>
                </div>
                {solveProgress.step3 === 'success' && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Hoàn tất
                  </span>
                )}
                {solveProgress.step3 === 'running' && (
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold animate-pulse">
                    Đang xử lý...
                  </span>
                )}
                {solveProgress.step3 === 'error' && (
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-bold flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3" /> Đã dừng do lỗi
                  </span>
                )}
                {solveProgress.step3 === 'pending' && (
                  <span className="text-slate-500 italic">Đang chờ</span>
                )}
              </div>
            </div>

            {/* Error Message Display per AI_INSTRUCTIONS.md:
                "Nếu tất cả các model đều thất bại -> Hiện thông báo lỗi màu đỏ, hiển thị nguyên văn lỗi từ API (VD: 429 RESOURCE_EXHAUSTED)" */}
            {solveProgress.rawApiError && (
              <div className="p-3.5 bg-rose-950/80 border border-rose-500 rounded-2xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold">
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Lỗi phản hồi nguyên văn từ Gemini API:</span>
                </div>
                <div className="p-2.5 bg-black/50 rounded-lg font-mono text-[11px] text-rose-200 overflow-x-auto select-all">
                  {solveProgress.rawApiError}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-rose-300 italic">
                    Gợi ý: Kiểm tra lại quota hoặc thay đổi API key tại nút Settings màu đỏ trên Header.
                  </span>
                  <button
                    onClick={() => setSolveProgress((prev) => ({ ...prev, isActive: false }))}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
