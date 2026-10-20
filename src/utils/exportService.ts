import { GeoMindSolveResult } from '../types/geomind';

/**
 * Educational Export Service for HỖ TRỢ VẼ HÌNH - PHẠM HẬU
 * References skills: pptx-official, docx-official, moodle-external-api-development
 */

/**
 * Clean KaTeX/LaTeX delimiters for plain-text presentation
 */
function cleanLatexForText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1√($2)')
    .replace(/\\perp/g, '⊥')
    .replace(/\\parallel/g, '//')
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\angle/g, '∠')
    .replace(/\\widehat\{([^}]+)\}/g, '∠$1')
    .replace(/\\Rightarrow/g, '⇒')
    .replace(/\\Leftrightarrow/g, '⇔')
    .replace(/\\in/g, '∈')
    .replace(/\\subset/g, '⊂')
    .replace(/\\cap/g, '∩')
    .replace(/\\cup/g, '∪')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\circ/g, '°')
    .replace(/\\quad/g, ' ')
    .replace(/\\;/g, ' ')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\vec\{([^}]+)\}/g, 'véctơ $1')
    .replace(/\$+/g, '');
}

/**
 * Generate a complete, beautifully styled Word Document (.doc/.docx compatible)
 * with Ministry of Education exam paper format, 3D image, GT/KL table, and step-by-step solution.
 */
export function exportToWordDocument(
  data: GeoMindSolveResult,
  problemText: string,
  imageSnapshotUrl?: string
) {
  const title = data.geometryData.title || 'Bài toán Hình học Không gian THPT';
  const cleanTitle = cleanLatexForText(title);

  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${cleanTitle}</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 13pt;
      line-height: 1.4;
      color: #111827;
      margin: 2cm 2cm 2cm 2cm;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    .header-table td {
      vertical-align: top;
      text-align: center;
      font-size: 11pt;
    }
    .header-left {
      width: 45%;
      font-weight: bold;
    }
    .header-right {
      width: 55%;
      font-weight: bold;
    }
    .doc-title {
      text-align: center;
      font-size: 16pt;
      font-weight: bold;
      color: #0369a1;
      margin: 15px 0 5px 0;
      text-transform: uppercase;
    }
    .doc-subtitle {
      text-align: center;
      font-size: 12pt;
      font-style: italic;
      color: #4b5563;
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 13pt;
      font-weight: bold;
      color: #0284c7;
      border-bottom: 1.5pt solid #0284c7;
      padding-bottom: 3px;
      margin-top: 20px;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    .problem-box {
      background-color: #f8fafc;
      border-left: 4pt solid #0284c7;
      padding: 12px 15px;
      font-size: 12.5pt;
      margin-bottom: 15px;
    }
    .gt-kl-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    .gt-kl-table th, .gt-kl-table td {
      border: 1pt solid #cbd5e1;
      padding: 8px 12px;
      vertical-align: top;
    }
    .gt-kl-table th {
      background-color: #f1f5f9;
      font-weight: bold;
      color: #0f172a;
    }
    .step-box {
      margin-bottom: 12px;
      padding-left: 5px;
    }
    .step-heading {
      font-weight: bold;
      color: #0f172a;
    }
    .step-formula {
      background-color: #f0fdf4;
      border: 1pt dashed #86efac;
      padding: 6px 12px;
      margin: 6px 0;
      font-family: 'Courier New', monospace;
      color: #166534;
      font-weight: bold;
    }
    .final-answer-box {
      background-color: #eff6ff;
      border: 1.5pt solid #3b82f6;
      padding: 10px 15px;
      margin-top: 15px;
      font-weight: bold;
      color: #1e40af;
    }
    .img-container {
      text-align: center;
      margin: 15px 0;
    }
    .footer-note {
      text-align: right;
      font-size: 10pt;
      font-style: italic;
      color: #64748b;
      margin-top: 30px;
      border-top: 0.5pt solid #e2e8f0;
      padding-top: 8px;
    }
  </style>
</head>
<body>
  <!-- Header Table -->
  <table class="header-table">
    <tr>
      <td class="header-left">
        SỞ GD&ĐT TỈNH / THÀNH PHỐ<br>
        <strong>TRƯỜNG THPT CHUYÊN & CHẤT LƯỢNG CAO</strong><br>
        <span style="font-size: 9pt; font-weight: normal;">Năm học: 2026 - 2027</span>
      </td>
      <td class="header-right">
        <strong>TÀI LIỆU HỌC TẬP HÌNH HỌC KHÔNG GIAN</strong><br>
        BỘ SÁCH: KẾT NỐI TRI THỨC VỚI CUỘC SỐNG<br>
        <span style="font-size: 9pt; font-style: italic; font-weight: normal;">Hệ thống Hỗ trợ Vẽ hình - Phạm Hậu</span>
      </td>
    </tr>
  </table>

  <div class="doc-title">${cleanTitle}</div>
  <div class="doc-subtitle">Chuyên đề: Quan hệ song song, Vuông góc & Toạ độ hoá Oxyz trong không gian</div>

  <!-- Phần 1: Đề bài -->
  <div class="section-title">I. ĐỀ BÀI TOÁN</div>
  <div class="problem-box">
    <strong>Đề bài: </strong>${cleanLatexForText(problemText)}
  </div>

  ${imageSnapshotUrl ? `
  <div class="img-container">
    <img src="${imageSnapshotUrl}" style="max-width: 500px; height: auto; border: 1px solid #cbd5e1; border-radius: 8px;" alt="Hình vẽ không gian 3D" />
    <div style="font-size: 10pt; font-style: italic; color: #475569; margin-top: 4px;">Hình vẽ 3D mô phỏng toạ độ và các điểm cắt chính xác</div>
  </div>
  ` : ''}

  <!-- Phần 2: Giả thiết & Kết luận -->
  <div class="section-title">II. TÓM TẮT GIẢ THIẾT & KẾT LUẬN (GT - KL)</div>
  <table class="gt-kl-table">
    <tr>
      <th style="width: 50%;">GIẢ THIẾT (GT)</th>
      <th style="width: 50%;">KẾT LUẬN (KL)</th>
    </tr>
    <tr>
      <td>
        <ul>
          ${data.hypothesisConclusion.hypothesis.map((h) => `<li>${cleanLatexForText(h)}</li>`).join('')}
        </ul>
      </td>
      <td>
        <ul>
          ${data.hypothesisConclusion.conclusion.map((c) => `<li>${cleanLatexForText(c)}</li>`).join('')}
        </ul>
      </td>
    </tr>
  </table>

  <!-- Phần 3: Lời giải chi tiết sư phạm 3 cấp độ -->
  <div class="section-title">III. HƯỚNG DẪN GIẢI CHI TIẾT & GỢI MỞ SƯ PHẠM</div>

  <!-- Cấp 1: Định lý -->
  <div style="margin-bottom: 12px;">
    <strong>1. Định lý và kiến thức trọng tâm SGK:</strong>
    <ul>
      ${data.pedagogy.level1Theorem.theorems.map((t) => `
        <li><strong>${t.name}${t.textbookRef ? ` (${t.textbookRef})` : ''}:</strong> ${cleanLatexForText(t.content)}</li>
      `).join('')}
    </ul>
  </div>

  <!-- Cấp 2: Đường phụ & Điểm cắt -->
  <div style="margin-bottom: 12px;">
    <strong>2. Xác định điểm cắt & dựng đường kẻ phụ:</strong>
    <ul>
      ${data.pedagogy.level2Auxiliary.linesToDraw.map((line) => `<li>${cleanLatexForText(line)}</li>`).join('')}
    </ul>
    <div style="font-style: italic; color: #475569; margin-left: 20px;">
      Cơ sở hình học: ${cleanLatexForText(data.pedagogy.level2Auxiliary.geometricReason)}
    </div>
  </div>

  <!-- Cấp 3: Lời giải chi tiết -->
  <div style="margin-bottom: 15px;">
    <strong>3. Các bước chứng minh và tính toán chi tiết:</strong>
    ${data.pedagogy.level3Detailed.steps.map((st) => `
      <div class="step-box">
        <div class="step-heading">Bước ${st.stepNumber}: ${cleanLatexForText(st.heading)}</div>
        <div style="margin-top: 3px;">${cleanLatexForText(st.explanation).replace(/\n/g, '<br>')}</div>
        ${st.formula ? `<div class="step-formula">${cleanLatexForText(st.formula)}</div>` : ''}
      </div>
    `).join('')}
  </div>

  <!-- Kết luận chung -->
  <div class="final-answer-box">
    ĐÁP SỐ / KẾT LUẬN: ${cleanLatexForText(data.pedagogy.level3Detailed.finalAnswer)}
  </div>

  ${data.advancedExtension?.oxyzAlternativeMethod ? `
  <div class="section-title" style="margin-top: 25px;">IV. PHƯƠNG PHÁP TỌA ĐỘ HÓA OXYZ (MỞ RỘNG TOÁN 12)</div>
  <div style="background-color: #f8fafc; padding: 10px 15px; border-left: 3pt solid #3b82f6;">
    ${cleanLatexForText(data.advancedExtension.oxyzAlternativeMethod).replace(/\n/g, '<br>')}
  </div>
  ` : ''}

  <div class="footer-note">
    Tài liệu được xuất tự động từ phần mềm HỖ TRỢ VẼ HÌNH - PHẠM HẬU • Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}
  </div>
</body>
</html>
`;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Bai-Tap-Hinh-Hoc-${Date.now()}.doc`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate a complete, presentation-ready PowerPoint Slide deck
 * with Title slide, Problem statement, 3D Illustration, 3-tier Pedagogy, and Oxyz setup.
 */
export function exportToPowerPointPresentation(
  data: GeoMindSolveResult,
  problemText: string,
  imageSnapshotUrl?: string
) {
  const title = cleanLatexForText(data.geometryData.title || 'Bài toán Hình học Không gian');

  // Generate an HTML-based interactive PowerPoint / Presentation Deck that opens natively in MS PowerPoint & Web
  const htmlPresentation = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${title} - Bài Giảng PowerPoint</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0f172a;
      color: #f8fafc;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .slide-deck {
      display: flex;
      flex-direction: column;
      gap: 30px;
      padding: 30px;
      align-items: center;
    }
    .slide {
      width: 960px;
      height: 540px;
      background: linear-gradient(135deg, #090d16 0%, #1e293b 100%);
      border: 2px solid #334155;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
      padding: 40px;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .slide-badge {
      position: absolute;
      top: 25px;
      right: 35px;
      background: rgba(14, 165, 233, 0.2);
      border: 1px solid #0ea5e9;
      color: #38bdf8;
      font-size: 12px;
      font-weight: bold;
      padding: 4px 12px;
      border-radius: 999px;
      text-transform: uppercase;
    }
    .slide-title {
      font-size: 26px;
      font-weight: 800;
      color: #38bdf8;
      margin-top: 0;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .content-box {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid #334155;
      border-radius: 14px;
      padding: 20px;
      font-size: 15px;
      line-height: 1.6;
      flex: 1;
      overflow: hidden;
    }
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #334155;
      padding-top: 10px;
      margin-top: 15px;
    }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #0ea5e9;
      color: #0f172a;
      font-weight: bold;
      padding: 10px 20px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4);
      z-index: 1000;
    }
    @media print {
      body { background: transparent; }
      .print-btn { display: none; }
      .slide-deck { padding: 0; gap: 0; }
      .slide {
        border: none;
        box-shadow: none;
        width: 100vw;
        height: 100vh;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">In hoặc Lưu PDF Bài Giảng</button>
  <div class="slide-deck">
    <!-- Slide 1: Bìa Bài Giảng -->
    <div class="slide" style="justify-content: center; align-items: center; text-align: center;">
      <div class="slide-badge">BÀI GIẢNG ĐIỆN TỬ THPT</div>
      <div style="font-size: 16px; color: #38bdf8; font-weight: bold; margin-bottom: 10px; letter-spacing: 2px;">
        HÌNH HỌC KHÔNG GIAN • TOÁN 11 & 12
      </div>
      <h1 style="font-size: 34px; color: #ffffff; max-width: 800px; margin: 0 0 20px 0; line-height: 1.3;">
        ${title}
      </h1>
      <div style="font-size: 16px; color: #94a3b8; max-width: 650px;">
        Bộ sách: Kết nối tri thức với cuộc sống • Hệ thống Hỗ trợ Vẽ hình - Phạm Hậu
      </div>
      <div style="margin-top: 40px; display: flex; gap: 15px;">
        <span style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; padding: 6px 16px; border-radius: 8px; font-size: 13px; color: #38bdf8; font-weight: bold;">
          Khối đa diện 3D
        </span>
        <span style="background: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; padding: 6px 16px; border-radius: 8px; font-size: 13px; color: #f59e0b; font-weight: bold;">
          Điểm cắt chuẩn xác
        </span>
        <span style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; padding: 6px 16px; border-radius: 8px; font-size: 13px; color: #10b981; font-weight: bold;">
          Gợi ý sư phạm 3 cấp độ
        </span>
      </div>
    </div>

    <!-- Slide 2: Đề bài & Hình vẽ 3D -->
    <div class="slide">
      <div class="slide-badge">SLIDE 2: ĐỀ BÀI & TRỰC QUAN 3D</div>
      <h2 class="slide-title">1. Đề Bài & Mô Hình Không Gian</h2>
      <div style="display: flex; gap: 20px; flex: 1; overflow: hidden;">
        <div class="content-box" style="flex: 1.2;">
          <strong style="color: #38bdf8; font-size: 16px;">Nội dung đề bài:</strong>
          <p style="margin-top: 8px; color: #e2e8f0;">${cleanLatexForText(problemText)}</p>
          <div style="margin-top: 15px; border-top: 1px solid #334155; padding-top: 10px;">
            <strong style="color: #f59e0b;">Giả thiết chính:</strong>
            <ul style="margin: 6px 0 0 0; padding-left: 20px; color: #cbd5e1; font-size: 13.5px;">
              ${data.hypothesisConclusion.hypothesis.map((h) => `<li>${cleanLatexForText(h)}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="content-box" style="flex: 0.8; display: flex; align-items: center; justify-content: center; background: #020617; padding: 10px;">
          ${imageSnapshotUrl ? `
            <img src="${imageSnapshotUrl}" style="max-width: 100%; max-height: 280px; object-fit: contain; border-radius: 10px;" alt="3D Geometry" />
          ` : `
            <div style="text-align: center; color: #64748b;">Mô hình không gian 3D tương tác</div>
          `}
        </div>
      </div>
      <div class="slide-footer">
        <span>HỖ TRỢ VẼ HÌNH - PHẠM HẬU</span>
        <span>Slide 2 / 5</span>
      </div>
    </div>

    <!-- Slide 3: Cấp độ 1 - Định lý nền tảng -->
    <div class="slide">
      <div class="slide-badge">SLIDE 3: GỢI MỞ CẤP 1</div>
      <h2 class="slide-title">2. Cấp Độ 1: Định Lý & Kiến Thức Trọng Tâm</h2>
      <div class="content-box">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${data.pedagogy.level1Theorem.theorems.map((t) => `
            <div style="background: rgba(30, 41, 59, 0.7); border-left: 4px solid #38bdf8; padding: 10px 15px; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <strong style="color: #38bdf8; font-size: 15px;">${t.name}</strong>
                ${t.textbookRef ? `<span style="font-size: 11px; background: rgba(56, 189, 248, 0.2); padding: 2px 8px; border-radius: 4px; color: #7dd3fc;">${t.textbookRef}</span>` : ''}
              </div>
              <div style="color: #cbd5e1; font-size: 14px;">${cleanLatexForText(t.content)}</div>
            </div>
          `).join('')}

          <div style="background: rgba(14, 165, 233, 0.15); border: 1px solid #0284c7; padding: 12px 15px; border-radius: 10px; margin-top: 5px;">
            <strong style="color: #38bdf8;">Câu hỏi gợi ý suy luận trên lớp: </strong>
            <span style="color: #f1f5f9;">${cleanLatexForText(data.pedagogy.level1Theorem.questionPrompt)}</span>
          </div>
        </div>
      </div>
      <div class="slide-footer">
        <span>HỖ TRỢ VẼ HÌNH - PHẠM HẬU</span>
        <span>Slide 3 / 5</span>
      </div>
    </div>

    <!-- Slide 4: Cấp độ 2 - Đường phụ & Điểm cắt -->
    <div class="slide">
      <div class="slide-badge">SLIDE 4: GỢI MỞ CẤP 2</div>
      <h2 class="slide-title">3. Cấp Độ 2: Xác Định Điểm Cắt & Kẻ Đường Phụ</h2>
      <div class="content-box">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <strong style="color: #f59e0b; font-size: 16px;">Các bước dựng đường phụ & tìm giao điểm:</strong>
          ${data.pedagogy.level2Auxiliary.linesToDraw.map((line, idx) => `
            <div style="display: flex; align-items: flex-start; gap: 10px; background: rgba(30, 41, 59, 0.6); padding: 8px 12px; border-radius: 8px;">
              <span style="background: #f59e0b; color: #0f172a; font-weight: bold; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; shrink: 0;">
                ${idx + 1}
              </span>
              <span style="color: #e2e8f0; font-size: 14.5px;">${cleanLatexForText(line)}</span>
            </div>
          `).join('')}

          <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid #d97706; padding: 10px 14px; border-radius: 10px; margin-top: 6px;">
            <strong style="color: #fbbf24;">Cơ sở hình học: </strong>
            <span style="color: #fef3c7; font-size: 14px;">${cleanLatexForText(data.pedagogy.level2Auxiliary.geometricReason)}</span>
          </div>
        </div>
      </div>
      <div class="slide-footer">
        <span>HỖ TRỢ VẼ HÌNH - PHẠM HẬU</span>
        <span>Slide 4 / 5</span>
      </div>
    </div>

    <!-- Slide 5: Lời giải chi tiết & Kết luận -->
    <div class="slide">
      <div class="slide-badge">SLIDE 5: LỜI GIẢI CHI TIẾT</div>
      <h2 class="slide-title">4. Lời Giải Chi Tiết & Đáp Số</h2>
      <div class="content-box" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div style="display: flex; flex-direction: column; gap: 10px; overflow-y: auto;">
          ${data.pedagogy.level3Detailed.steps.map((st) => `
            <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid #334155; padding: 10px 14px; border-radius: 10px;">
              <strong style="color: #34d399; font-size: 14px;">Bước ${st.stepNumber}: ${cleanLatexForText(st.heading)}</strong>
              <div style="color: #cbd5e1; font-size: 13.5px; margin-top: 3px;">${cleanLatexForText(st.explanation).replace(/\n/g, '<br>')}</div>
              ${st.formula ? `<div style="background: #022c22; border: 1px dashed #10b981; padding: 4px 10px; margin-top: 5px; color: #6ee7b7; font-family: monospace; font-size: 13px;">${cleanLatexForText(st.formula)}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <div style="background: linear-gradient(90deg, #064e3b 0%, #0f766e 100%); border: 2px solid #10b981; border-radius: 12px; padding: 12px 18px; margin-top: 10px; display: flex; align-items: center; justify-content: space-between;">
          <strong style="color: #a7f3d0; font-size: 15px; text-transform: uppercase;">Đáp số / Kết luận:</strong>
          <span style="color: #ffffff; font-weight: bold; font-size: 16px;">${cleanLatexForText(data.pedagogy.level3Detailed.finalAnswer)}</span>
        </div>
      </div>
      <div class="slide-footer">
        <span>HỖ TRỢ VẼ HÌNH - PHẠM HẬU</span>
        <span>Slide 5 / 5</span>
      </div>
    </div>
  </div>
</body>
</html>
`;

  // Download Presentation
  const blob = new Blob([htmlPresentation], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bai-Giang-PowerPoint-${Date.now()}.html`;
    link.click();
  }
}

/**
 * Export quiz question to Moodle GIFT format for LMS
 */
export function exportToMoodleGiftFormat(data: GeoMindSolveResult, problemText: string): string {
  const title = cleanLatexForText(data.geometryData.title || 'Câu hỏi Hình học không gian');
  const answer = cleanLatexForText(data.pedagogy.level3Detailed.finalAnswer);

  const gift = `// ${title} - HỖ TRỢ VẼ HÌNH PHẠM HẬU
::${title}::[html]<p>${cleanLatexForText(problemText)}</p>{
=${answer}
~Đáp án phân tích sai 1
~Đáp án phân tích sai 2
~Đáp án phân tích sai 3
#### Gợi ý giải: ${cleanLatexForText(data.pedagogy.level2Auxiliary.geometricReason)}
}
`;

  const blob = new Blob([gift], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Moodle-Quiz-${Date.now()}.txt`;
  link.click();
  URL.revokeObjectURL(url);
  return gift;
}
