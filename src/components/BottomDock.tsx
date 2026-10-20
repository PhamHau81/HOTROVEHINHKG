import React, { useState } from 'react';
import {
  Layers,
  Scissors,
  Compass,
  ChevronDown,
  ChevronUp,
  PenTool,
  Ruler,
  FileText,
  Presentation,
  Download,
  Share2,
} from 'lucide-react';

interface BottomDockProps {
  showAuxiliary: boolean;
  setShowAuxiliary: (val: boolean) => void;
  showOxyz: boolean;
  setShowOxyz: (val: boolean) => void;
  showCuttingPlane: boolean;
  setShowCuttingPlane: (val: boolean) => void;
  cuttingPlaneT: number;
  setCuttingPlaneT: (val: number) => void;
  hasCuttingPlaneData: boolean;
  hasOxyzData: boolean;
  auxiliaryCount: number;

  // New interactive capabilities from SKILL EDUCATION
  isAnnotationActive: boolean;
  setIsAnnotationActive: (val: boolean) => void;
  isMeasureActive: boolean;
  setIsMeasureActive: (val: boolean) => void;
  onOpenNetUnfold: () => void;
  onExportWord: () => void;
  onExportPowerPoint: () => void;
  onExportMoodle: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  showAuxiliary,
  setShowAuxiliary,
  showOxyz,
  setShowOxyz,
  showCuttingPlane,
  setShowCuttingPlane,
  cuttingPlaneT,
  setCuttingPlaneT,
  hasCuttingPlaneData,
  hasOxyzData,
  auxiliaryCount,
  isAnnotationActive,
  setIsAnnotationActive,
  isMeasureActive,
  setIsMeasureActive,
  onOpenNetUnfold,
  onExportWord,
  onExportPowerPoint,
  onExportMoodle,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 w-full px-4 flex flex-col items-center pointer-events-none"
      style={{ maxWidth: 'min(1080px, 98vw)' }}
    >
      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="pointer-events-auto mb-1.5 flex items-center gap-1.5 px-3 py-1 bg-slate-900/95 hover:bg-slate-850 text-slate-300 hover:text-white rounded-full text-xs font-medium border border-slate-700/60 shadow-lg backdrop-blur-md transition-colors"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mở thanh công cụ sư phạm & điều khiển</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Thu gọn (Toàn cảnh 3D)</span>
          </>
        )}
      </button>

      {/* Main Unified Dock */}
      {!isCollapsed && (
        <div className="pointer-events-auto w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-2.5 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-2.5 text-sm">
          {/* Group 1: 3D Geometry Toggles */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Auxiliary Lines Toggle */}
            <button
              onClick={() => setShowAuxiliary(!showAuxiliary)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                showAuxiliary
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Bật/tắt đường kẻ phụ và điểm cắt giải bài toán"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Đường phụ & Điểm cắt</span>
              {auxiliaryCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/30 text-amber-300 font-mono">
                  {auxiliaryCount}
                </span>
              )}
            </button>

            {/* Smart Cross-Section Cutting Plane */}
            <button
              onClick={() => setShowCuttingPlane(!showCuttingPlane)}
              disabled={!hasCuttingPlaneData}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                !hasCuttingPlaneData
                  ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-500'
                  : showCuttingPlane
                  ? 'bg-orange-500/20 border-orange-500 text-orange-300 shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title={
                hasCuttingPlaneData
                  ? 'Kích hoạt mặt phẳng thiết diện (α) cắt xuyên hình khối'
                  : 'Bài toán hiện tại không có dữ liệu thiết diện'
              }
            >
              <Scissors className="w-3.5 h-3.5 text-orange-400" />
              <span>Mặt phẳng thiết diện (α)</span>
            </button>

            {/* Oxyz Coordinate System */}
            <button
              onClick={() => setShowOxyz(!showOxyz)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                showOxyz
                  ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Gắn hệ trục tọa độ Oxyz (Phương pháp Toán 12)"
            >
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Tọa độ Oxyz</span>
            </button>
          </div>

          {/* Group 2: Cross Section Slider (if active) */}
          {showCuttingPlane && hasCuttingPlaneData && (
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-orange-400 font-medium whitespace-nowrap text-[11px]">Vị trí cắt (t):</span>
              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.02"
                value={cuttingPlaneT}
                onChange={(e) => setCuttingPlaneT(parseFloat(e.target.value))}
                className="w-20 accent-orange-500 cursor-pointer"
              />
              <span className="text-slate-400 font-mono w-7 text-right text-[11px]">
                {Math.round(cuttingPlaneT * 100)}%
              </span>
            </div>
          )}

          {/* Group 3: Interactive Teacher & Student Tools */}
          <div className="flex items-center gap-1.5">
            {/* Annotation Pen */}
            <button
              onClick={() => setIsAnnotationActive(!isAnnotationActive)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                isAnnotationActive
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md'
                  : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-800'
              }`}
              title="Bật/tắt bút vẽ ghi chú bài giảng trực tiếp trên hình 3D"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bút ghi chú</span>
            </button>

            {/* Measure Tool */}
            <button
              onClick={() => setIsMeasureActive(!isMeasureActive)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                isMeasureActive
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md'
                  : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-800'
              }`}
              title="Đo khoảng cách & góc giữa các đỉnh"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đo góc/độ dài</span>
            </button>

            {/* Net Unfold */}
            <button
              onClick={onOpenNetUnfold}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/60 border border-slate-700/70 text-amber-300 hover:bg-slate-800 transition-colors"
              title="Xem mô phỏng trải phẳng 2D khối đa diện"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Trải phẳng 2D</span>
            </button>

            {/* Export Dropdown (PowerPoint & Word) */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all"
                title="Xuất bài giảng PowerPoint & Tài liệu Word"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất tài liệu</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                  <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 space-y-1">
                    <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Xuất bản sư phạm
                    </div>
                    <button
                      onClick={() => {
                        onExportPowerPoint();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-800 text-slate-200 transition-colors flex items-center gap-2"
                    >
                      <Presentation className="w-4 h-4 text-orange-400" />
                      <div>
                        <div className="font-semibold text-white">Xuất Slide PowerPoint</div>
                        <div className="text-[10px] text-slate-400">Trình chiếu bài giảng đầy đủ các bước</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onExportWord();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-800 text-slate-200 transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="font-semibold text-white">Xuất Tài Liệu Word (.doc)</div>
                        <div className="text-[10px] text-slate-400">Phiếu bài tập & lời giải chuẩn Bộ GD&ĐT</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onExportMoodle();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-800 text-slate-200 transition-colors flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-semibold text-white">Xuất Moodle GIFT (LMS)</div>
                        <div className="text-[10px] text-slate-400">Ngân hàng câu hỏi trắc nghiệm</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
