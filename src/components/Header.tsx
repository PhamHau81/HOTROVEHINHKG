import React, { useState, useEffect } from 'react';
import {
  Compass,
  PlusCircle,
  BookOpen,
  ChevronDown,
  Sparkles,
  PanelRightClose,
  PanelRightOpen,
  Settings,
  ExternalLink,
  KeyRound,
  CheckCircle,
  Cpu,
} from 'lucide-react';
import { CURRICULUM_PROBLEMS, CurriculumProblem } from '../data/curriculumData';
import { AI_MODELS } from '../utils/aiClient';

interface HeaderProps {
  currentProblemId: string;
  onSelectProblem: (prob: CurriculumProblem) => void;
  onCustomProblemSubmit: (text: string, grade: 11 | 12, selectedModel?: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentProblemId,
  onSelectProblem,
  onCustomProblemSubmit,
  isSidebarOpen,
  setIsSidebarOpen,
  isLoading,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [customText, setCustomText] = useState('');
  const [customGrade, setCustomGrade] = useState<11 | 12>(11);

  // Model & API Key state
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-flash-preview');
  const [isKeySaved, setIsKeySaved] = useState(false);

  // Load API key & model from localStorage on mount.
  // Per AI_INSTRUCTIONS.md: Khi chưa có key, hiển thị Modal bắt buộc nhập!
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key') || '';
    const savedModel = localStorage.getItem('gemini_selected_model') || 'gemini-3-flash-preview';
    setApiKey(savedKey);
    setSelectedModel(savedModel);

    if (!savedKey || savedKey.trim().length === 0) {
      setShowSettingsModal(true);
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', apiKey.trim());
    localStorage.setItem('gemini_selected_model', selectedModel);
    setIsKeySaved(true);
    setTimeout(() => setIsKeySaved(false), 2000);
    setShowSettingsModal(false);
  };

  const activeProblem = CURRICULUM_PROBLEMS.find((p) => p.id === currentProblemId);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    onCustomProblemSubmit(customText, customGrade, selectedModel);
    setShowCustomModal(false);
    setCustomText('');
  };

  return (
    <>
      <header className="h-14 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0">
        {/* Brand: HỖ TRỢ VẼ HÌNH - PHẠM HẬU */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20 font-bold">
              <Compass className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-sm tracking-tight text-white uppercase">
                  HỖ TRỢ VẼ HÌNH - PHẠM HẬU
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  KNTT
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Hệ thống Tự động Dựng hình & Tính Điểm cắt Hình học Không gian THPT
              </p>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-slate-800 hidden md:block" />

          {/* Curriculum Problem Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-colors max-w-xs md:max-w-md truncate"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate font-medium">
                {activeProblem ? activeProblem.title : 'Bài toán nạp vào'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="absolute top-full left-0 mt-2 w-80 md:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Ngân hàng bài tập mẫu SGK Kết nối tri thức
                  </div>
                  {CURRICULUM_PROBLEMS.map((prob) => (
                    <button
                      key={prob.id}
                      onClick={() => {
                        onSelectProblem(prob);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start gap-2.5 ${
                        prob.id === currentProblemId
                          ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-400 shrink-0 mt-0.5">
                        Lớp {prob.grade}
                      </span>
                      <div className="truncate">
                        <div className="font-semibold text-slate-100 truncate">{prob.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">{prob.chapter}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          {/* Settings (API Key) Button with red instruction text per AI_INSTRUCTIONS.md: LUÔN HIỂN THỊ */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-500/50 hover:border-rose-400 text-rose-300 rounded-xl text-xs transition-all shadow-sm"
            title="Cấu hình Model & API Key Gemini"
          >
            <Settings className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
            <span className="text-[11px] font-bold text-rose-400 whitespace-nowrap">
              Lấy API key để sử dụng app
            </span>
          </button>

          {/* Custom problem modal opener: "Tự vẽ hình theo yêu cầu bài toán nạp vào" */}
          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-cyan-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tự vẽ hình theo đề bài</span>
          </button>

          {/* Sidebar Toggle for Mentor */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title={isSidebarOpen ? 'Đóng bảng giải toán' : 'Mở bảng giải toán'}
          >
            {isSidebarOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4 text-cyan-400" />
            )}
          </button>
        </div>
      </header>

      {/* Modal 1: Settings & API Key Configuration */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Thiết lập Model AI & Gemini API Key</h3>
                  <p className="text-xs text-slate-400">
                    Cấu hình mô hình thông minh để tự động phân tích và dựng hình chính xác
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Instructions banner */}
              <div className="p-3.5 bg-rose-950/40 border border-rose-500/50 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between text-rose-300 font-bold">
                  <span>Hướng dẫn lấy Google Gemini API Key miễn phí:</span>
                  <a
                    href="https://aistudio.google.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline font-semibold"
                  >
                    <span>Lấy key tại Google AI Studio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  1. Truy cập liên kết <strong className="text-white">aistudio.google.com/api-keys</strong>.<br />
                  2. Đăng nhập tài khoản Google và bấm nút <strong className="text-cyan-300">"Create API key"</strong>.<br />
                  3. Dán key vào ô bên dưới. Key được lưu an toàn trực tiếp trên trình duyệt của bạn (localStorage).
                </p>
              </div>

              {/* API Key Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Gemini API Key:
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Model AI Selection Cards (per AI_INSTRUCTIONS.md) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Chọn Model AI (Thứ tự ưu tiên Fallback):
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {AI_MODELS.map((m) => (
                    <label
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                        selectedModel === m.id
                          ? 'bg-cyan-500/15 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Cpu className={`w-4 h-4 ${selectedModel === m.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <div>
                          <div className="font-semibold text-white">{m.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{m.id}</div>
                        </div>
                      </div>
                      {m.isDefault && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                          Mặc định
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Lưu Cấu Hình</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Custom Problem Input Modal - "Tự vẽ hình theo yêu cầu bài toán nạp vào" */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Nạp Đề Toán & Tự Động Vẽ Hình Không Gian</h3>
                  <p className="text-xs text-slate-400">
                    Phần mềm hỗ trợ phân tích đề bài, dựng hình 3D và tính toán các điểm cắt chính xác tuyệt đối
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-300 font-medium">Chương trình:</span>
                <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="grade"
                    checked={customGrade === 11}
                    onChange={() => setCustomGrade(11)}
                    className="accent-cyan-500"
                  />
                  <span>Hình học 11 (Song song, Vuông góc, Thiết diện)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="grade"
                    checked={customGrade === 12}
                    onChange={() => setCustomGrade(12)}
                    className="accent-cyan-500"
                  />
                  <span>Hình học 12 (Tọa độ hóa Oxyz)</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nhập hoặc dán nội dung đề bài toán (Tiếng Việt):
                </label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Ví dụ: Cho hình chóp S.ABCD có đáy ABCD là hình vuông cạnh a, SA vuông góc với đáy. Gọi M là trung điểm SC. Tính khoảng cách từ điểm A đến mặt phẳng (SBD) và tìm giao điểm của đường thẳng với mặt phẳng..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                />
              </div>

              {/* Sample suggestion prompts */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-medium">Chọn nhanh đề bài mẫu:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setCustomText(
                        'Cho hình chóp S.ABCD có đáy ABCD là hình vuông cạnh a, SA vuông góc với mặt phẳng đáy và SA = a√2. Kẻ AH vuông góc với SO. Tính khoảng cách từ điểm A đến mặt phẳng (SBD).'
                      )
                    }
                    className="text-[11px] px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors"
                  >
                    Chóp đáy vuông, SA ⊥ đáy
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomText(
                        'Cho hình chóp S.ABC có đáy ABC là tam giác vuông tại B, SA vuông góc với mặt phẳng đáy. Kẻ AH vuông góc với SB tại H và AK vuông góc với SC tại K. Tìm giao điểm và chứng minh quan hệ vuông góc.'
                      )
                    }
                    className="text-[11px] px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors"
                  >
                    Chóp tam giác S.ABC, AH ⊥ SB
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomText(
                        'Cho tứ diện ABCD. Gọi M là một điểm nằm trên cạnh AB. Mặt phẳng (α) đi qua M và song song với hai đường thẳng BC và AD. Xác định thiết diện MNPQ và các điểm cắt.'
                      )
                    }
                    className="text-[11px] px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors"
                  >
                    Tứ diện & Thiết diện song song
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !customText.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Đang phân tích & Dựng hình...' : 'Tự Vẽ Hình Không Gian Ngay'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
