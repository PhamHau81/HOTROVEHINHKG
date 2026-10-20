import React from 'react';
import { X, Layers, Sparkles } from 'lucide-react';
import { GeometryData } from '../types/geomind';

interface NetUnfoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  geometryData: GeometryData;
}

export const NetUnfoldModal: React.FC<NetUnfoldModalProps> = ({
  isOpen,
  onClose,
  geometryData,
}) => {
  if (!isOpen) return null;

  const shapeType = geometryData.shapeType || 'pyramid';
  const isPyramid = shapeType === 'pyramid' && geometryData.vertices.length >= 5;
  const isTetrahedron = geometryData.vertices.length === 4;
  const isPrismOrCube = shapeType === 'prism' || geometryData.vertices.length === 8;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Mô Phỏng Trải Phẳng 2D (Net Unfold)</h3>
              <p className="text-xs text-slate-400">
                Khai triển các mặt khối đa diện thành hình phẳng 2D phục vụ tính diện tích và đường đi ngắn nhất
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SVG Net Unfolding Canvas */}
        <div className="w-full h-80 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
          <svg className="w-full h-full" viewBox="-200 -160 400 320">
            {/* Pyramid Net Unfolding */}
            {isPyramid && (
              <g className="animate-fade-in">
                {/* Center Base ABCD */}
                <rect
                  x="-50"
                  y="-50"
                  width="100"
                  height="100"
                  fill="#0284c7"
                  fillOpacity="0.3"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />
                <text x="0" y="5" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                  Đáy ABCD
                </text>

                {/* Top Flap (SAB) */}
                <polygon
                  points="-50,-50 50,-50 0,-140"
                  fill="#818cf8"
                  fillOpacity="0.3"
                  stroke="#818cf8"
                  strokeWidth="2"
                />
                <text x="0" y="-80" fill="#c7d2fe" fontSize="11" textAnchor="middle">
                  (SAB)
                </text>
                <text x="0" y="-145" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">
                  S
                </text>

                {/* Bottom Flap (SCD) */}
                <polygon
                  points="-50,50 50,50 0,140"
                  fill="#c084fc"
                  fillOpacity="0.3"
                  stroke="#c084fc"
                  strokeWidth="2"
                />
                <text x="0" y="90" fill="#e9d5ff" fontSize="11" textAnchor="middle">
                  (SCD)
                </text>
                <text x="0" y="155" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">
                  S
                </text>

                {/* Left Flap (SDA) */}
                <polygon
                  points="-50,-50 -50,50 -140,0"
                  fill="#60a5fa"
                  fillOpacity="0.3"
                  stroke="#60a5fa"
                  strokeWidth="2"
                />
                <text x="-85" y="5" fill="#bfdbfe" fontSize="11" textAnchor="middle">
                  (SDA)
                </text>
                <text x="-148" y="5" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">
                  S
                </text>

                {/* Right Flap (SBC) */}
                <polygon
                  points="50,-50 50,50 140,0"
                  fill="#a78bfa"
                  fillOpacity="0.3"
                  stroke="#a78bfa"
                  strokeWidth="2"
                />
                <text x="85" y="5" fill="#ddd6fe" fontSize="11" textAnchor="middle">
                  (SBC)
                </text>
                <text x="148" y="5" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">
                  S
                </text>
              </g>
            )}

            {/* Tetrahedron Net Unfolding */}
            {isTetrahedron && (
              <g className="animate-fade-in">
                {/* Central Face BCD */}
                <polygon
                  points="-60,40 60,40 0,-60"
                  fill="#0284c7"
                  fillOpacity="0.3"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />
                <text x="0" y="10" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                  Mặt (BCD)
                </text>

                {/* Top Flap (ACD) */}
                <polygon
                  points="-60,40 0,-60 -120,-30"
                  fill="#818cf8"
                  fillOpacity="0.3"
                  stroke="#818cf8"
                  strokeWidth="2"
                />
                <text x="-70" y="-15" fill="#c7d2fe" fontSize="11" textAnchor="middle">
                  (ACD)
                </text>

                {/* Right Flap (ABC) */}
                <polygon
                  points="60,40 0,-60 120,-30"
                  fill="#a78bfa"
                  fillOpacity="0.3"
                  stroke="#a78bfa"
                  strokeWidth="2"
                />
                <text x="70" y="-15" fill="#ddd6fe" fontSize="11" textAnchor="middle">
                  (ABC)
                </text>

                {/* Bottom Flap (ABD) */}
                <polygon
                  points="-60,40 60,40 0,140"
                  fill="#60a5fa"
                  fillOpacity="0.3"
                  stroke="#60a5fa"
                  strokeWidth="2"
                />
                <text x="0" y="85" fill="#bfdbfe" fontSize="11" textAnchor="middle">
                  (ABD)
                </text>
              </g>
            )}

            {/* Cube or Prism Net Unfolding */}
            {isPrismOrCube && (
              <g className="animate-fade-in">
                {/* 4 horizontal faces */}
                <rect x="-140" y="-35" width="70" height="70" fill="#0284c7" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="2" />
                <rect x="-70" y="-35" width="70" height="70" fill="#818cf8" fillOpacity="0.25" stroke="#818cf8" strokeWidth="2" />
                <rect x="0" y="-35" width="70" height="70" fill="#a78bfa" fillOpacity="0.25" stroke="#a78bfa" strokeWidth="2" />
                <rect x="70" y="-35" width="70" height="70" fill="#60a5fa" fillOpacity="0.25" stroke="#60a5fa" strokeWidth="2" />

                {/* Top and Bottom Caps */}
                <rect x="-70" y="-105" width="70" height="70" fill="#34d399" fillOpacity="0.25" stroke="#34d399" strokeWidth="2" />
                <rect x="-70" y="35" width="70" height="70" fill="#34d399" fillOpacity="0.25" stroke="#34d399" strokeWidth="2" />

                <text x="-35" y="-65" fill="#6ee7b7" fontSize="11" textAnchor="middle">Đáy trên</text>
                <text x="-35" y="75" fill="#6ee7b7" fontSize="11" textAnchor="middle">Đáy dưới</text>
                <text x="-35" y="5" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">Mặt bên 2</text>
              </g>
            )}
          </svg>
        </div>

        {/* Notes */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1">
          <div className="font-semibold text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Ứng dụng sư phạm:</span>
          </div>
          <p>
            Hình khai triển 2D giúp học sinh dễ dàng tính diện tích xung quanh (<span className="font-mono text-cyan-300 font-medium">S<sub>xq</sub> = ∑ S<sub>mặt bên</sub></span>),
            diện tích toàn phần và giải quyết bài toán đường gấp khúc ngắn nhất đi trên bề mặt khối đa diện.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
