import { GeoMindSolveResult } from '../types/geomind';

export interface CurriculumProblem {
  id: string;
  grade: 11 | 12;
  chapter: string;
  title: string;
  difficulty: 'Cơ bản' | 'Vận dụng' | 'Vận dụng cao';
  problemText: string;
  defaultData: GeoMindSolveResult;
}

export const CURRICULUM_PROBLEMS: CurriculumProblem[] = [
  {
    id: 'kntt-11-goc-khoang-cach',
    grade: 11,
    chapter: 'Chương VII: Quan hệ vuông góc trong không gian',
    title: 'Góc giữa đường thẳng và mặt phẳng & Khoảng cách trong chóp S.ABCD',
    difficulty: 'Vận dụng',
    problemText:
      'Cho hình chóp S.ABCD có đáy ABCD là hình vuông cạnh a. Cạnh bên SA vuông góc với mặt phẳng đáy (ABCD) và SA = a√3. Tính góc giữa đường thẳng SD và mặt phẳng (ABCD). Kẻ đường phụ để tính khoảng cách từ điểm A đến mặt phẳng (SBD).',
    defaultData: {
      modelConfirmation:
        'Khởi tạo khối chóp tứ giác S.ABCD: Đáy ABCD là hình vuông nằm trên mặt phẳng (Oxy), đỉnh S nằm trên trục cao SA vuông góc với đáy tại A.',
      systemCode:
        'BUILD_SHAPE(SHAPE="Pyramid", BASE="Square", VERTICES=["S","A","B","C","D"], H="SA", H_PERP=true)',
      hypothesisConclusion: {
        hypothesis: [
          'Hình chóp S.ABCD có đáy ABCD là hình vuông cạnh a',
          'SA ⊥ (ABCD)',
          'SA = a√3',
        ],
        conclusion: [
          'Tính góc φ giữa đường thẳng SD và mặt phẳng (ABCD)',
          'Tính khoảng cách d(A, (SBD))',
        ],
      },
      geometryData: {
        title: 'Hình chóp S.ABCD (SA ⊥ đáy)',
        shapeType: 'pyramid',
        vertices: [
          { id: 'A', label: 'A', x: -1.5, y: 0, z: -1.5, isBase: true },
          { id: 'B', label: 'B', x: 1.5, y: 0, z: -1.5, isBase: true },
          { id: 'C', label: 'C', x: 1.5, y: 0, z: 1.5, isBase: true },
          { id: 'D', label: 'D', x: -1.5, y: 0, z: 1.5, isBase: true },
          { id: 'S', label: 'S', x: -1.5, y: 2.6, z: -1.5, isBase: false },
        ],
        edges: [
          // Đáy
          { from: 'A', to: 'B', style: 'dashed', label: 'a' },
          { from: 'B', to: 'C', style: 'solid', label: 'a' },
          { from: 'C', to: 'D', style: 'solid', label: 'a' },
          { from: 'D', to: 'A', style: 'dashed', label: 'a' },
          // Cạnh bên
          { from: 'S', to: 'A', style: 'dashed', label: 'a√3' },
          { from: 'S', to: 'B', style: 'solid' },
          { from: 'S', to: 'C', style: 'solid' },
          { from: 'S', to: 'D', style: 'solid' },
        ],
        faces: [
          { name: 'Đáy ABCD', vertices: ['A', 'B', 'C', 'D'], color: '#38bdf8' },
          { name: 'Mặt bên (SAB)', vertices: ['S', 'A', 'B'], color: '#818cf8' },
          { name: 'Mặt bên (SBC)', vertices: ['S', 'B', 'C'], color: '#a78bfa' },
          { name: 'Mặt bên (SCD)', vertices: ['S', 'C', 'D'], color: '#c084fc' },
          { name: 'Mặt bên (SDA)', vertices: ['S', 'D', 'A'], color: '#60a5fa' },
        ],
        auxiliaryPoints: [
          {
            id: 'O',
            label: 'O',
            x: 0,
            y: 0,
            z: 0,
            description: 'Tâm hình vuông ABCD, giao điểm của AC và BD',
            stepLevel: 2,
          },
          {
            id: 'H',
            label: 'H',
            x: -0.6,
            y: 1.04,
            z: -0.6,
            description: 'Hình chiếu vuông góc của A lên SO (kẻ AH ⊥ SO, H thuộc đoạn SO)',
            stepLevel: 2,
          },
        ],
        auxiliaryLines: [
          {
            id: 'line-BD',
            from: 'B',
            to: 'D',
            style: 'dashed',
            description: 'Đường chéo BD của đáy ABCD',
            stepLevel: 2,
            color: '#fbbf24',
          },
          {
            id: 'line-AC',
            from: 'A',
            to: 'C',
            style: 'dashed',
            description: 'Đường chéo AC, giao BD tại O',
            stepLevel: 2,
            color: '#fbbf24',
          },
          {
            id: 'line-SO',
            from: 'S',
            to: 'O',
            style: 'dashed',
            description: 'Đoạn nối đỉnh S với tâm đáy O',
            stepLevel: 2,
            color: '#fbbf24',
          },
          {
            id: 'line-AH',
            from: 'A',
            to: 'H',
            style: 'dashed',
            description: 'Đoạn AH vuông góc với SO, chính là khoảng cách từ A đến (SBD)',
            stepLevel: 2,
            color: '#34d399',
          },
        ],
        rightAngleMarkers: [
          { at: 'A', from: 'S', to: 'B', label: 'SA ⊥ AB' },
          { at: 'A', from: 'S', to: 'D', label: 'SA ⊥ AD' },
          { at: 'O', from: 'A', to: 'B', label: 'AC ⊥ BD tại O' },
          { at: 'H', from: 'A', to: 'S', label: 'AH ⊥ SO' },
        ],
        oxyzAxes: {
          originId: 'A',
          originLabel: 'A(0, 0, 0)',
          oxVector: 'Tia AB hướng theo trục Ox',
          oyVector: 'Tia AD hướng theo trục Oy',
          ozVector: 'Tia AS hướng theo trục Oz',
          notes:
            'Vì SA ⊥ AB và SA ⊥ AD, AB ⊥ AD nên ba tia AB, AD, AS đôi một vuông góc. Chọn gốc tọa độ tại A là tối ưu nhất.',
          vertexCoordinates: [
            { pointId: 'A', coordString: 'A(0, 0, 0)' },
            { pointId: 'B', coordString: 'B(a, 0, 0)' },
            { pointId: 'D', coordString: 'D(0, a, 0)' },
            { pointId: 'C', coordString: 'C(a, a, 0)' },
            { pointId: 'S', coordString: 'S(0, 0, a√3)' },
            { pointId: 'O', coordString: 'O(a/2, a/2, 0)' },
          ],
        },
      },
      pedagogy: {
        level1Theorem: {
          title: 'Cấp độ 1: Hệ thống Định lý & Kiến thức trọng tâm SGK KNTT',
          theorems: [
            {
              name: 'Định nghĩa góc giữa đường thẳng và mặt phẳng',
              textbookRef: 'SGK Toán 11 - Bài 24, Mục 2',
              content:
                'Góc giữa đường thẳng d và mặt phẳng (P) là góc giữa d và hình chiếu vuông góc d\' của d lên (P). Khi d cắt (P) tại D và SA ⊥ (P), hình chiếu của SD là AD.',
            },
            {
              name: 'Đường thẳng vuông góc với mặt phẳng',
              textbookRef: 'SGK Toán 11 - Bài 23, Định lý 1',
              content:
                'Nếu đường thẳng d vuông góc với hai đường thẳng cắt nhau cùng nằm trong mặt phẳng (P) thì d ⊥ (P).',
            },
            {
              name: 'Quy tắc xác định khoảng cách từ điểm đến mặt phẳng',
              textbookRef: 'SGK Toán 11 - Bài 25, Mục 2',
              content:
                'Để tính khoảng cách từ chân đường vuông góc A đến mặt phẳng xiên (SBD): Dựng mặt phẳng (SAC) chứa A và vuông góc với giao tuyến BD tại O, rồi từ A kẻ AH ⊥ SO.',
            },
          ],
          questionPrompt:
            'Bạn hãy xác định hình chiếu của điểm S lên mặt phẳng (ABCD) là điểm nào? Từ đó suy ra hình chiếu của đường thẳng SD là gì?',
        },
        level2Auxiliary: {
          title: 'Cấp độ 2: Gợi ý Kẻ Đường Phụ & Mặt Phẳng Phụ',
          linesToDraw: [
            'Bước 1: Nối hai đường chéo AC và BD cắt nhau tại O (tâm đáy).',
            'Bước 2: Nối đoạn thẳng SO. Nhận xét về quan hệ vuông góc giữa BD và mặt phẳng (SAC).',
            'Bước 3: Trong tam giác vuông SAO (vuông tại A), kẻ đoạn thẳng AH vuông góc với SO (H ∈ SO).',
          ],
          geometricReason:
            'Ta có BD ⊥ AC (đáy là hình vuông) và BD ⊥ SA (do SA ⊥ đáy). Suy ra BD ⊥ (SAC) ⇒ BD ⊥ AH. Lại có AH ⊥ SO nên AH ⊥ (SBD). Do đó d(A, (SBD)) = AH.',
          guidingQuestion:
            'Sau khi có AH ⊥ (SBD), trong tam giác vuông SAO bạn dùng hệ thức lượng nào để tính độ dài đoạn AH nhanh nhất?',
        },
        level3Detailed: {
          title: 'Cấp độ 3: Hướng Dẫn Giải Chi Tiết Từng Bước',
          steps: [
            {
              stepNumber: 1,
              heading: 'Tính góc giữa đường thẳng SD và mặt phẳng (ABCD)',
              explanation:
                'Do SA ⊥ (ABCD) nên hình chiếu vuông góc của điểm S lên (ABCD) chính là A. Điểm D thuộc (ABCD) nên hình chiếu của SD lên (ABCD) là AD. Do đó góc giữa SD và (ABCD) là góc ∠SDA.\nTam giác SAD vuông tại A:\ntan ∠SDA = SA / AD = (a√3) / a = √3.\nSuy ra ∠SDA = 60°.',
              formula: '\\tan(\\widehat{SDA}) = \\frac{SA}{AD} = \\sqrt{3} \\Rightarrow \\widehat{(SD, (ABCD))} = 60^\\circ',
            },
            {
              stepNumber: 2,
              heading: 'Chứng minh AH vuông góc với mặt phẳng (SBD)',
              explanation:
                'Gọi O = AC ∩ BD. Vì ABCD là hình vuông nên AC ⊥ BD tại O.\nTa có: BD ⊥ AC và BD ⊥ SA (vì SA ⊥ (ABCD)) ⇒ BD ⊥ (SAC).\nMà AH ⊂ (SAC) nên BD ⊥ AH.\nTrong tam giác vuông SAO, kẻ AH ⊥ SO tại H.\nKhi đó AH ⊥ SO và AH ⊥ BD ⇒ AH ⊥ (SBD) tại H.\nVậy khoảng cách từ A đến (SBD) bằng độ dài đoạn AH.',
              formula: 'AH \\perp SO, \\; AH \\perp BD \\Rightarrow AH \\perp (SBD) \\Rightarrow d(A, (SBD)) = AH',
            },
            {
              stepNumber: 3,
              heading: 'Tính độ dài đoạn thẳng AH',
              explanation:
                'Hình vuông ABCD cạnh a nên AC = a√2 ⇒ AO = AC / 2 = (a√2) / 2.\nTam giác SAO vuông tại A có đường cao AH:\n1 / AH² = 1 / SA² + 1 / AO²\n= 1 / (3a²) + 1 / (a² / 2) = 1 / (3a²) + 2 / a² = 7 / (3a²).\nSuy ra AH² = (3a²) / 7 ⇒ AH = a√(21) / 7.',
              formula: '\\frac{1}{AH^2} = \\frac{1}{SA^2} + \\frac{1}{AO^2} = \\frac{1}{3a^2} + \\frac{2}{a^2} = \\frac{7}{3a^2} \\Rightarrow AH = \\frac{a\\sqrt{21}}{7}',
            },
          ],
          finalAnswer: 'Góc giữa SD và (ABCD) bằng 60°. Khoảng cách d(A, (SBD)) = (a√21)/7.',
        },
      },
      arInteractionTips: {
        cameraAngleRecommendation:
          'Xoay mô hình sang góc xiên 45° chếch từ trên xuống (Perspective Isometric) để quan sát rõ cả 3 yếu tố: chân đường cao A, tâm đáy O và đoạn vuông góc AH.',
        crossSectionAdvice:
          'Sử dụng tính năng Cắt lớp thiết diện để kích hoạt mặt phẳng phụ (SAC), bạn sẽ thấy tam giác vuông SAO được làm nổi bật rõ ràng trong không gian.',
        touchDragNotes:
          'Bạn có thể thay đổi chiều cao SA trên thanh trượt để quan sát góc ∠SDA và khoảng cách AH thay đổi trực tiếp theo thời gian thực.',
      },
      advancedExtension: {
        oxyzAlternativeMethod:
          'Phương pháp Tọa độ hóa Oxyz (Toán 12): Chọn gốc A(0,0,0), B(a,0,0), D(0,a,0), S(0,0,a√3). Viết phương trình mặt phẳng (SBD) đi qua S, B, D rồi áp dụng công thức khoảng cách: d(A, (SBD)) = |D| / √(A² + B² + C²).',
        similarProblem:
          'Bài toán tương tự: Cho hình chóp S.ABCD đáy hình vuông cạnh a, SA ⊥ đáy. Tính khoảng cách giữa hai đường thẳng chéo nhau BD và SC.',
        teacherNote:
          'Giáo viên có thể sử dụng mô hình này để minh họa phương pháp "Quy khoảng cách về chân đường vuông góc" - chìa khóa vàng của hình học không gian 11.',
      },
    },
  },
  {
    id: 'kntt-11-thiet-dien',
    grade: 11,
    chapter: 'Chương IV: Quan hệ song song trong không gian',
    title: 'Xác định thiết diện cắt bởi mặt phẳng song song với hai đường chéo nhau',
    difficulty: 'Vận dụng',
    problemText:
      'Cho tứ diện ABCD. Gọi M là một điểm nằm trên cạnh AB (khác A và B). Mặt phẳng (α) đi qua điểm M và song song với hai đường thẳng BC và AD. Xác định thiết diện của tứ diện ABCD cắt bởi mặt phẳng (α) và chứng minh thiết diện là hình bình hành.',
    defaultData: {
      modelConfirmation:
        'Khởi tạo khối tứ diện ABCD và mặt phẳng cắt (α) di động qua điểm M, song song với AD và BC. Thiết diện tạo thành là hình bình hành MNPQ.',
      systemCode:
        'BUILD_SHAPE(SHAPE="Tetrahedron", VERTICES=["A","B","C","D"], CUT_PLANE=true, PARALLEL=["AD","BC"])',
      hypothesisConclusion: {
        hypothesis: [
          'Tứ diện ABCD',
          'M ∈ AB',
          'Mặt phẳng (α) qua M, (α) // BC và (α) // AD',
        ],
        conclusion: [
          'Tìm thiết diện của ABCD cắt bởi (α)',
          'Chứng minh thiết diện là hình bình hành',
        ],
      },
      geometryData: {
        title: 'Tứ diện ABCD & Thiết diện song song (α)',
        shapeType: 'pyramid',
        vertices: [
          { id: 'A', label: 'A', x: 0, y: 2.5, z: 0, isBase: false },
          { id: 'B', label: 'B', x: -1.8, y: 0, z: -1.2, isBase: true },
          { id: 'C', label: 'C', x: 2.0, y: 0, z: -1.2, isBase: true },
          { id: 'D', label: 'D', x: 0.2, y: 0, z: 1.8, isBase: true },
        ],
        edges: [
          { from: 'B', to: 'C', style: 'dashed', label: 'BC' },
          { from: 'C', to: 'D', style: 'solid' },
          { from: 'D', to: 'B', style: 'solid' },
          { from: 'A', to: 'B', style: 'solid' },
          { from: 'A', to: 'C', style: 'solid' },
          { from: 'A', to: 'D', style: 'solid', label: 'AD' },
        ],
        faces: [
          { name: 'Mặt đáy (BCD)', vertices: ['B', 'C', 'D'], color: '#38bdf8' },
          { name: 'Mặt (ABC)', vertices: ['A', 'B', 'C'], color: '#818cf8' },
          { name: 'Mặt (ACD)', vertices: ['A', 'C', 'D'], color: '#a78bfa' },
          { name: 'Mặt (ABD)', vertices: ['A', 'B', 'D'], color: '#60a5fa' },
        ],
        auxiliaryPoints: [
          { id: 'M', label: 'M', x: -0.9, y: 1.25, z: -0.6, description: 'Điểm M trên cạnh AB (tỉ số 1/2)', stepLevel: 2 },
          { id: 'N', label: 'N', x: 1.0, y: 1.25, z: -0.6, description: 'Giao điểm của (α) với AC (MN // BC)', stepLevel: 2 },
          { id: 'P', label: 'P', x: 1.1, y: 0, z: 0.3, description: 'Giao điểm của (α) với CD (NP // AD, P thuộc đoạn CD)', stepLevel: 2 },
          { id: 'Q', label: 'Q', x: -0.8, y: 0, z: 0.3, description: 'Giao điểm của (α) với BD (MQ // AD, Q thuộc đoạn BD)', stepLevel: 2 },
        ],
        auxiliaryLines: [
          { id: 'cut-MN', from: 'M', to: 'N', style: 'solid', description: 'Giao tuyến với (ABC): MN // BC', stepLevel: 2, color: '#f59e0b' },
          { id: 'cut-NP', from: 'N', to: 'P', style: 'solid', description: 'Giao tuyến với (ACD): NP // AD', stepLevel: 2, color: '#f59e0b' },
          { id: 'cut-PQ', from: 'P', to: 'Q', style: 'solid', description: 'Giao tuyến với (BCD): PQ // BC', stepLevel: 2, color: '#f59e0b' },
          { id: 'cut-QM', from: 'Q', to: 'M', style: 'solid', description: 'Giao tuyến với (ABD): QM // AD', stepLevel: 2, color: '#f59e0b' },
        ],
        cuttingPlane: {
          enabled: true,
          name: 'Mặt phẳng thiết diện (α)',
          description: 'Mặt phẳng đi qua M, N, P, Q cắt khối tứ diện thành hai phần',
          passThroughPoints: ['M', 'N', 'P', 'Q'],
          polygonVertices: [
            { x: -0.9, y: 1.25, z: -0.6 },
            { x: 1.0, y: 1.25, z: -0.6 },
            { x: 1.1, y: 0, z: 0.3 },
            { x: -0.8, y: 0, z: 0.3 },
          ],
        },
      },
      pedagogy: {
        level1Theorem: {
          title: 'Cấp độ 1: Định lý Giao tuyến song song (SGK KNTT)',
          theorems: [
            {
              name: 'Giao tuyến của mặt phẳng với hai mặt phẳng cắt nhau',
              textbookRef: 'SGK Toán 11 - Bài 11, Định lý 2',
              content:
                'Nếu mặt phẳng (α) chứa đường thẳng d song song với (β) thì giao tuyến của (α) và (β) (nếu có) sẽ song song với d hoặc trùng d.',
            },
            {
              name: 'Mặt phẳng song song với đường thẳng',
              textbookRef: 'SGK Toán 11 - Bài 12',
              content:
                'Nếu (α) // a thì bất kỳ mặt phẳng (β) nào chứa a cắt (α) theo giao tuyến b thì b // a.',
            },
          ],
          questionPrompt:
            'Mặt phẳng (α) đi qua M và song song với BC. Mặt phẳng (ABC) chứa BC cắt (α) theo giao tuyến đi qua M thì giao tuyến đó có phương như thế nào với BC?',
        },
        level2Auxiliary: {
          title: 'Cấp độ 2: Hướng Dẫn Kẻ Các Đoạn Giao Tuyến Của Thiết Diện',
          linesToDraw: [
            '1. Trong mặt phẳng (ABC): Qua M kẻ đường thẳng song song với BC, cắt AC tại N.',
            '2. Trong mặt phẳng (ACD): Qua N kẻ đường thẳng song song với AD, cắt CD tại P.',
            '3. Trong mặt phẳng (BCD): Qua P kẻ đường thẳng song song với BC, cắt BD tại Q.',
            '4. Trong mặt phẳng (ABD): Nối Q với M, chứng minh QM tự động song song với AD.',
          ],
          geometricReason:
            'Do (α) // BC nên giao tuyến của (α) với các mặt chứa BC (là (ABC) và (BCD)) đều song song với BC. Tương tự với đường thẳng AD.',
          guidingQuestion:
            'Tứ giác MNPQ có MN // PQ và NP // QM. Bạn kết luận được tứ giác MNPQ là hình gì?',
        },
        level3Detailed: {
          title: 'Cấp độ 3: Chứng Minh Chi Tiết Từng Bước',
          steps: [
            {
              stepNumber: 1,
              heading: 'Xác định giao tuyến của (α) với mặt (ABC)',
              explanation:
                'Ta có: M ∈ (α) ∩ (ABC).\nVì (α) // BC và BC ⊂ (ABC) nên giao tuyến của (α) và (ABC) là đường thẳng qua M và song song với BC.\nĐường thẳng này cắt AC tại N. Vậy đoạn giao tuyến thứ nhất là MN // BC (N ∈ AC).',
              formula: '(\\alpha) \\cap (ABC) = MN \\parallel BC',
            },
            {
              stepNumber: 2,
              heading: 'Xác định các giao tuyến tiếp theo',
              explanation:
                '- Với mặt (ACD): N ∈ (α) ∩ (ACD), mà (α) // AD ⇒ kẻ NP // AD (P ∈ CD).\n- Với mặt (BCD): P ∈ (α) ∩ (BCD), mà (α) // BC ⇒ kẻ PQ // BC (Q ∈ BD).\n- Với mặt (ABD): Q, M ∈ (α) ∩ (ABD), giao tuyến là đoạn QM.',
              formula: 'NP \\parallel AD, \\quad PQ \\parallel BC',
            },
            {
              stepNumber: 3,
              heading: 'Chứng minh tứ giác MNPQ là hình bình hành',
              explanation:
                'Ta có:\nMN // BC và PQ // BC ⇒ MN // PQ (cùng song song BC).\nLại có: QM là giao tuyến của (α) và (ABD), mà (α) // AD nên QM // AD.\nMà NP // AD ⇒ QM // NP (cùng song song AD).\nTứ giác MNPQ có hai cặp cạnh đối song song nên MNPQ là hình bình hành.',
              formula: 'MN \\parallel PQ \\; \\text{và} \\; NP \\parallel QM \\Rightarrow MNPQ \\text{ là hình bình hành}',
            },
          ],
          finalAnswer: 'Thiết diện cắt bởi mặt phẳng (α) là tứ giác MNPQ và MNPQ là một hình bình hành.',
        },
      },
      arInteractionTips: {
        cameraAngleRecommendation:
          'Kích hoạt nút Cắt lớp để quan sát mặt phẳng thiết diện màu hổ phách cắt xuyên qua tứ diện, tạo nên hình bình hành MNPQ.',
        crossSectionAdvice:
          'Kéo thanh trượt vị trí điểm M để quan sát thiết diện co giãn nhưng luôn giữ tính chất là hình bình hành.',
        touchDragNotes: 'Xoay khối tứ diện để thấy rõ sự song song giữa MN với BC và NP với AD.',
      },
      advancedExtension: {
        similarProblem:
          'Bài toán tìm điều kiện để thiết diện MNPQ là hình chữ nhật hoặc hình thoi (phụ thuộc vào góc giữa hai đường thẳng AD và BC, hoặc vị trí điểm M khi AD = BC).',
        teacherNote:
          'Đây là bài toán kinh điển trong kỳ thi THPT giúp rèn luyện định lý 3 đường giao tuyến song song.',
      },
    },
  },
  {
    id: 'kntt-12-oxyz-lap-phuong',
    grade: 12,
    chapter: 'Chương II: Tọa độ của vectơ trong không gian (Toán 12)',
    title: 'Tọa độ hóa Oxyz hình lập phương & Tính góc giữa hai đường thẳng chéo nhau',
    difficulty: 'Vận dụng',
    problemText:
      'Cho hình lập phương ABCD.A\'B\'C\'D\' có cạnh bằng a. Hãy thiết lập hệ tọa độ Oxyz thích hợp và tìm tọa độ tất cả các đỉnh. Sau đó dùng phương pháp vectơ tọa độ để tính cosin của góc giữa hai đường thẳng chéo nhau A\'C và BD.',
    defaultData: {
      modelConfirmation:
        'Khởi tạo khối hình lập phương ABCD.A\'B\'C\'D\'. Gắn hệ trục tọa độ Oxyz tại gốc A, các trục Ox, Oy, Oz lần lượt trùng với các tia AB, AD, AA\'.',
      systemCode:
        'BUILD_SHAPE(SHAPE="Cube", VERTICES=["A","B","C","D","A1","B1","C1","D1"], OXYZ_ORIGIN="A")',
      hypothesisConclusion: {
        hypothesis: [
          'Hình lập phương ABCD.A\'B\'C\'D\' cạnh a',
          'A\'C và BD là hai đường thẳng chéo nhau',
        ],
        conclusion: [
          'Gắn hệ trục Oxyz và xác định tọa độ các đỉnh',
          'Tính cos(A\'C, BD)',
        ],
      },
      geometryData: {
        title: 'Hình lập phương ABCD.A\'B\'C\'D\' (Oxyz)',
        shapeType: 'prism',
        vertices: [
          { id: 'A', label: 'A', x: -1.2, y: 0, z: -1.2, isBase: true },
          { id: 'B', label: 'B', x: 1.2, y: 0, z: -1.2, isBase: true },
          { id: 'C', label: 'C', x: 1.2, y: 0, z: 1.2, isBase: true },
          { id: 'D', label: 'D', x: -1.2, y: 0, z: 1.2, isBase: true },
          { id: 'A1', label: "A'", x: -1.2, y: 2.4, z: -1.2, isBase: false },
          { id: 'B1', label: "B'", x: 1.2, y: 2.4, z: -1.2, isBase: false },
          { id: 'C1', label: "C'", x: 1.2, y: 2.4, z: 1.2, isBase: false },
          { id: 'D1', label: "D'", x: -1.2, y: 2.4, z: 1.2, isBase: false },
        ],
        edges: [
          // Đáy dưới
          { from: 'A', to: 'B', style: 'dashed', label: 'Ox' },
          { from: 'B', to: 'C', style: 'solid' },
          { from: 'C', to: 'D', style: 'solid' },
          { from: 'D', to: 'A', style: 'dashed', label: 'Oy' },
          // Cạnh đứng
          { from: 'A', to: 'A1', style: 'dashed', label: 'Oz' },
          { from: 'B', to: 'B1', style: 'solid' },
          { from: 'C', to: 'C1', style: 'solid' },
          { from: 'D', to: 'D1', style: 'solid' },
          // Đáy trên
          { from: 'A1', to: 'B1', style: 'solid' },
          { from: 'B1', to: 'C1', style: 'solid' },
          { from: 'C1', to: 'D1', style: 'solid' },
          { from: 'D1', to: 'A1', style: 'solid' },
        ],
        faces: [
          { name: 'Đáy ABCD', vertices: ['A', 'B', 'C', 'D'], color: '#38bdf8' },
          { name: "Đáy A'B'C'D'", vertices: ['A1', 'B1', 'C1', 'D1'], color: '#818cf8' },
          { name: "Mặt bên ABB'A'", vertices: ['A', 'B', 'B1', 'A1'], color: '#60a5fa' },
          { name: "Mặt bên BCC'B'", vertices: ['B', 'C', 'C1', 'B1'], color: '#a78bfa' },
        ],
        auxiliaryLines: [
          {
            id: 'line-A1C',
            from: 'A1',
            to: 'C',
            style: 'dashed',
            description: "Đường chéo không gian A'C",
            stepLevel: 2,
            color: '#ef4444',
          },
          {
            id: 'line-BD',
            from: 'B',
            to: 'D',
            style: 'dashed',
            description: 'Đường chéo đáy BD',
            stepLevel: 2,
            color: '#10b981',
          },
        ],
        oxyzAxes: {
          originId: 'A',
          originLabel: 'A(0,0,0)',
          oxVector: 'Trục Ox trùng tia AB',
          oyVector: 'Trục Oy trùng tia AD',
          ozVector: "Trục Oz trùng tia AA'",
          notes: 'Ba tia AB, AD, AA\' vuông góc từng đôi một, tạo nên tam diện vuông chuẩn cho hệ Oxyz.',
          vertexCoordinates: [
            { pointId: 'A', coordString: 'A(0, 0, 0)' },
            { pointId: 'B', coordString: 'B(a, 0, 0)' },
            { pointId: 'D', coordString: 'D(0, a, 0)' },
            { pointId: 'C', coordString: 'C(a, a, 0)' },
            { pointId: 'A1', coordString: "A'(0, 0, a)" },
            { pointId: 'B1', coordString: "B'(a, 0, a)" },
            { pointId: 'D1', coordString: "D'(0, a, a)" },
            { pointId: 'C1', coordString: "C'(a, a, a)" },
          ],
        },
      },
      pedagogy: {
        level1Theorem: {
          title: 'Cấp độ 1: Định nghĩa & Công thức Tọa độ Vectơ (SGK Toán 12)',
          theorems: [
            {
              name: 'Hệ trục tọa độ Oxyz trong không gian',
              textbookRef: 'SGK Toán 12 - Bài 5, Mục 1',
              content:
                'Hệ gồm ba trục Ox, Oy, Oz vuông góc với nhau từng đôi một với các vectơ đơn vị i, j, k.',
            },
            {
              name: 'Góc giữa hai vectơ & hai đường thẳng',
              textbookRef: 'SGK Toán 12 - Bài 6, Mục 2',
              content:
                'cos(d1, d2) = |u1 . u2| / (|u1| * |u2|) với u1, u2 lần lượt là các vectơ chỉ phương.',
            },
          ],
          questionPrompt:
            "Tìm vectơ chỉ phương của đường thẳng A'C và vectơ chỉ phương của đường thẳng BD từ tọa độ các đỉnh?",
        },
        level2Auxiliary: {
          title: 'Cấp độ 2: Xác Định Tọa Độ Vectơ & Tích Vô Hướng',
          linesToDraw: [
            "1. Xác định tọa độ vectơ A'C = C - A' = (a - 0; a - 0; 0 - a) = (a; a; -a).",
            '2. Xác định tọa độ vectơ BD = D - B = (0 - a; a - 0; 0 - 0) = (-a; a; 0).',
            "3. Tính tích vô hướng A'C . BD theo công thức: x1.x2 + y1.y2 + z1.z2.",
          ],
          geometricReason:
            'Phương pháp tọa độ hóa chuyển bài toán hình học không gian phức tạp về các phép tính đại số đơn giản, tránh việc phải dựng thêm đường thẳng song song phụ.',
          guidingQuestion: 'Tích vô hướng x1.x2 + y1.y2 + z1.z2 cho kết quả bằng bao nhiêu? Kết quả này cho ta biết điều gì?',
        },
        level3Detailed: {
          title: 'Cấp độ 3: Tính Toán Chi Tiết Từng Bước',
          steps: [
            {
              stepNumber: 1,
              heading: 'Thiết lập hệ tọa độ Oxyz',
              explanation:
                "Chọn gốc tọa độ tại A(0,0,0).\nTrục Ox chứa tia AB ⇒ B(a; 0; 0).\nTrục Oy chứa tia AD ⇒ D(0; a; 0).\nTrục Oz chứa tia AA' ⇒ A'(0; 0; a).\nTừ đó suy ra C(a; a; 0).",
              formula: 'A(0,0,0), \\; B(a,0,0), \\; D(0,a,0), \\; C(a,a,0), \\; A\'(0,0,a)',
            },
            {
              stepNumber: 2,
              heading: 'Tính vectơ chỉ phương của A\'C và BD',
              explanation:
                "Vectơ A'C = (a - 0; a - 0; 0 - a) = (a; a; -a) = a(1; 1; -1).\nĐộ dài |A'C| = √(a² + a² + (-a)²) = a√3.\nVectơ BD = (0 - a; a - 0; 0 - 0) = (-a; a; 0) = a(-1; 1; 0).\nĐộ dài |BD| = √((-a)² + a² + 0²) = a√2.",
              formula: '\\vec{u_1} = (1, 1, -1), \\quad \\vec{u_2} = (-1, 1, 0)',
            },
            {
              stepNumber: 3,
              heading: 'Tính cosin góc giữa hai đường thẳng',
              explanation:
                "Tích vô hướng: u1 . u2 = 1.(-1) + 1.1 + (-1).0 = -1 + 1 + 0 = 0.\nDo đó:\ncos(A'C, BD) = |u1 . u2| / (|u1| . |u2|) = 0 / (√3 . √2) = 0.\nSuy ra góc giữa A'C và BD bằng 90°, hay A'C ⊥ BD.",
              formula: '\\cos(A\'C, BD) = \\frac{|1.(-1) + 1.1 + (-1).0|}{\\sqrt{3} \\cdot \\sqrt{2}} = 0 \\Rightarrow A\'C \\perp BD',
            },
          ],
          finalAnswer: "cos(A'C, BD) = 0. Hai đường thẳng A'C và BD vuông góc với nhau (góc bằng 90°).",
        },
      },
      arInteractionTips: {
        cameraAngleRecommendation:
          'Bật chế độ hiển thị hệ trục Oxyz (nút ở thanh dock dưới) để thấy rõ 3 tia Ox (đỏ), Oy (xanh lá), Oz (xanh dương).',
        crossSectionAdvice:
          'Quan sát đường chéo không gian A\'C (màu đỏ) và đường chéo đáy BD (màu lục) cắt nhau trong không gian trực quan.',
        touchDragNotes: 'Bạn có thể phóng to thu nhỏ để xem tọa độ từng đỉnh xuất hiện dạng tooltip.',
      },
      advancedExtension: {
        oxyzAlternativeMethod:
          'Cách giải thuần túy hình học 11: Ta có BD ⊥ AC và BD ⊥ AA\' ⇒ BD ⊥ (ACC\'A\'). Vì A\'C ⊂ (ACC\'A\') nên BD ⊥ A\'C.',
        similarProblem:
          'Tính khoảng cách giữa hai đường thẳng chéo nhau A\'C và BD bằng công thức tọa độ: d = |[u1, u2] . A\'B| / |[u1, u2]|.',
      },
    },
  },
];
