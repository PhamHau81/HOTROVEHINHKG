import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PenTool, ArrowUpRight, Eraser, Trash2, Check, X } from 'lucide-react';

interface AnnotationLayerProps {
  isActive: boolean;
  onClose: () => void;
}

export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({ isActive, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'pen' | 'arrow' | 'eraser'>('pen');
  const [color, setColor] = useState<string>('#38bdf8');
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  // Resize canvas to match window
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isActive) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    if (tool === 'arrow' && startPoint) {
      // Draw arrow
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';

      // Line
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Arrowhead
      const angle = Math.atan2(endY - startPoint.y, endX - startPoint.x);
      const headLen = 14;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headLen * Math.cos(angle - Math.PI / 6),
        endY - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endX - headLen * Math.cos(angle + Math.PI / 6),
        endY - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    }

    setStartPoint(null);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  if (!isActive) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="absolute inset-0 z-25 cursor-crosshair"
      />

      {/* Floating Toolbar for Pen & Annotation */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-slate-900/90 border border-cyan-500/50 rounded-2xl p-2 shadow-2xl backdrop-blur-md text-xs">
        <div className="flex items-center gap-1 border-r border-slate-700 pr-2">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-xl transition-colors ${
              tool === 'pen' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Bút vẽ tự do"
          >
            <PenTool className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('arrow')}
            className={`p-2 rounded-xl transition-colors ${
              tool === 'arrow' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Vẽ mũi tên chỉ điểm"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-xl transition-colors ${
              tool === 'eraser' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Tẩy xoá"
          >
            <Eraser className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Xoá tất cả nét vẽ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5 border-r border-slate-700 pr-2">
          {['#38bdf8', '#ef4444', '#fbbf24', '#10b981', '#ffffff'].map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                color === c ? 'scale-125 border-white shadow' : 'border-transparent'
              }`}
            />
          ))}
        </div>

        {/* Close Drawing Mode */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Đóng chế độ bút vẽ"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};
