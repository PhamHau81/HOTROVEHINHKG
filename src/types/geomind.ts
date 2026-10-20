export interface Vertex3D {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  isBase?: boolean;
}

export interface Edge3D {
  from: string;
  to: string;
  style: 'solid' | 'dashed';
  label?: string;
  color?: string;
}

export interface Face3D {
  name?: string;
  vertices: string[];
  color?: string;
}

export interface AuxiliaryPoint3D {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  description: string;
  stepLevel: number;
}

export interface AuxiliaryLine3D {
  id: string;
  from: string;
  to: string;
  style: 'solid' | 'dashed';
  description: string;
  stepLevel: number;
  color?: string;
}

export interface RightAngleMarker {
  at: string;
  from: string;
  to: string;
  label?: string;
}

export interface CuttingPlaneData {
  enabled?: boolean;
  name?: string;
  description?: string;
  passThroughPoints?: string[];
  normal?: { x: number; y: number; z: number };
  distance?: number;
  polygonVertices?: Array<{ x: number; y: number; z: number }>;
}

export interface OxyzAxesData {
  originId: string;
  originLabel?: string;
  oxVector?: string;
  oyVector?: string;
  ozVector?: string;
  notes?: string;
  vertexCoordinates?: Array<{
    pointId: string;
    coordString: string;
  }>;
}

export interface GeometryData {
  title?: string;
  shapeType?: string;
  vertices: Vertex3D[];
  edges: Edge3D[];
  faces?: Face3D[];
  auxiliaryPoints?: AuxiliaryPoint3D[];
  auxiliaryLines?: AuxiliaryLine3D[];
  rightAngleMarkers?: RightAngleMarker[];
  cuttingPlane?: CuttingPlaneData;
  oxyzAxes?: OxyzAxesData;
}

export interface TheoremItem {
  name: string;
  textbookRef?: string;
  content: string;
}

export interface StepItem {
  stepNumber: number;
  heading: string;
  explanation: string;
  formula?: string;
}

export interface PedagogyData {
  level1Theorem: {
    title: string;
    theorems: TheoremItem[];
    questionPrompt: string;
  };
  level2Auxiliary: {
    title: string;
    linesToDraw: string[];
    geometricReason: string;
    guidingQuestion?: string;
  };
  level3Detailed: {
    title: string;
    steps: StepItem[];
    finalAnswer: string;
  };
}

export interface GeoMindSolveResult {
  modelConfirmation: string;
  systemCode: string;
  hypothesisConclusion: {
    hypothesis: string[];
    conclusion: string[];
  };
  geometryData: GeometryData;
  pedagogy: PedagogyData;
  arInteractionTips: {
    cameraAngleRecommendation: string;
    crossSectionAdvice: string;
    touchDragNotes: string;
  };
  advancedExtension: {
    oxyzAlternativeMethod?: string;
    similarProblem: string;
    teacherNote?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
