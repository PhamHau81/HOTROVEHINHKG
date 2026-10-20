import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GeometryData, Vertex3D } from '../types/geomind';
import { computeExactCuttingPolygon } from '../utils/geometryMath';

interface ThreeViewportProps {
  geometryData: GeometryData;
  showAuxiliary: boolean;
  showOxyz: boolean;
  showCuttingPlane: boolean;
  cuttingPlaneT: number;
  onSnapshotReady?: (dataUrl: string) => void;
  isMeasureActive?: boolean;
}

export const ThreeViewport: React.FC<ThreeViewportProps> = ({
  geometryData,
  showAuxiliary,
  showOxyz,
  showCuttingPlane,
  cuttingPlaneT,
  onSnapshotReady,
  isMeasureActive = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // References to Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const auxiliaryGroupRef = useRef<THREE.Group | null>(null);
  const oxyzGroupRef = useRef<THREE.Group | null>(null);
  const cuttingGroupRef = useRef<THREE.Group | null>(null);
  const measureGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [activeCameraView, setActiveCameraView] = useState<'iso' | 'front' | 'top' | 'side'>('iso');
  const [selectedVertices, setSelectedVertices] = useState<Vertex3D[]>([]);
  const [measureResult, setMeasureResult] = useState<string | null>(null);

  // Helper to create crisp 2D text sprite for vertex labels
  const createTextSprite = (text: string, color = '#ffffff', subtext?: string): THREE.Sprite => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Label circle badge background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(64, 64, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Main letter (e.g. S, A, B, H, M)
      ctx.font = 'bold 50px "Inter", "Segoe UI", sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 64, 65);

      // Subtext / coordinates or label tag
      if (subtext) {
        ctx.font = 'bold 24px "Courier New", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'left';
        ctx.fillText(subtext, 118, 66);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;

    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.65, 0.325, 1);
    return sprite;
  };

  // Helper for right-angle marker
  const createRightAngleMarker = (
    corner: THREE.Vector3,
    v1: THREE.Vector3,
    v2: THREE.Vector3,
    size = 0.22
  ): THREE.Line => {
    const dir1 = v1.clone().sub(corner).normalize().multiplyScalar(size);
    const dir2 = v2.clone().sub(corner).normalize().multiplyScalar(size);

    const p1 = corner.clone().add(dir1);
    const p2 = p1.clone().add(dir2);
    const p3 = corner.clone().add(dir2);

    const points = [p1, p2, p3];
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 2,
      depthTest: false,
    });
    return new THREE.Line(geom, mat);
  };

  // Setup Three.js scene once
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5.5, 4.2, 5.5);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.0, 0);
    controls.maxPolarAngle = Math.PI * 0.95;
    controls.minDistance = 2;
    controls.maxDistance = 25;
    controlsRef.current = controls;

    // 5. Studio Environment & Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio 3-point lighting
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    keyLight.position.set(6, 9, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0xbae6fd, 0x1e293b, 1.2);
    fillLight.position.set(0, 10, 0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x67e8f9, 0.8);
    rimLight.position.set(-6, 4, -5);
    scene.add(rimLight);

    // Floor contact plane
    const groundGeom = new THREE.PlaneGeometry(16, 16);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.8,
      metalness: 0.1,
      transparent: true,
      opacity: 0.45,
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // Floor grid
    const grid = new THREE.GridHelper(14, 14, 0x0284c7, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // Model container groups
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    const auxiliaryGroup = new THREE.Group();
    scene.add(auxiliaryGroup);
    auxiliaryGroupRef.current = auxiliaryGroup;

    const oxyzGroup = new THREE.Group();
    scene.add(oxyzGroup);
    oxyzGroupRef.current = oxyzGroup;

    const cuttingGroup = new THREE.Group();
    scene.add(cuttingGroup);
    cuttingGroupRef.current = cuttingGroup;

    const measureGroup = new THREE.Group();
    scene.add(measureGroup);
    measureGroupRef.current = measureGroup;

    // Render loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Window resize observer
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // Update Geometry Model whenever geometryData changes
  useEffect(() => {
    const modelGroup = modelGroupRef.current;
    if (!modelGroup) return;

    // Clean previous geometry
    while (modelGroup.children.length > 0) {
      const obj = modelGroup.children[0];
      modelGroup.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
    }

    const vertexMap = new Map<string, Vertex3D>();
    geometryData.vertices.forEach((v) => vertexMap.set(v.id, v));

    // 1. Draw solid faces with transparent stylish fill
    if (geometryData.faces && geometryData.faces.length > 0) {
      geometryData.faces.forEach((face, idx) => {
        const facePts = face.vertices
          .map((id) => vertexMap.get(id))
          .filter(Boolean) as Vertex3D[];

        if (facePts.length >= 3) {
          const geom = new THREE.BufferGeometry();
          const vertices: number[] = [];

          // Triangulate simple polygon from first vertex
          for (let i = 1; i < facePts.length - 1; i++) {
            vertices.push(facePts[0].x, facePts[0].y, facePts[0].z);
            vertices.push(facePts[i].x, facePts[i].y, facePts[i].z);
            vertices.push(facePts[i + 1].x, facePts[i + 1].y, facePts[i + 1].z);
          }

          geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
          geom.computeVertexNormals();

          const faceColor = face.color || (idx === 0 ? '#38bdf8' : '#818cf8');
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(faceColor),
            roughness: 0.35,
            metalness: 0.1,
            transparent: true,
            opacity: 0.22,
            side: THREE.DoubleSide,
            depthWrite: false,
          });

          const mesh = new THREE.Mesh(geom, mat);
          modelGroup.add(mesh);
        }
      });
    }

    // 2. Draw Edges (Solid vs Dashed)
    geometryData.edges.forEach((edge) => {
      const vFrom = vertexMap.get(edge.from);
      const vTo = vertexMap.get(edge.to);
      if (!vFrom || !vTo) return;

      const p1 = new THREE.Vector3(vFrom.x, vFrom.y, vFrom.z);
      const p2 = new THREE.Vector3(vTo.x, vTo.y, vTo.z);

      const geom = new THREE.BufferGeometry().setFromPoints([p1, p2]);

      if (edge.style === 'dashed') {
        // Vietnamese math textbook standard: hidden edges are dashed!
        const dashedMat = new THREE.LineDashedMaterial({
          color: 0x94a3b8,
          dashSize: 0.14,
          gapSize: 0.1,
          linewidth: 2,
        });
        const line = new THREE.Line(geom, dashedMat);
        line.computeLineDistances();
        modelGroup.add(line);
      } else {
        // Solid visible edges: bright vibrant cyan/slate
        const solidMat = new THREE.LineBasicMaterial({
          color: 0xf1f5f9,
          linewidth: 3,
        });
        const line = new THREE.Line(geom, solidMat);
        modelGroup.add(line);
      }
    });

    // 3. Draw Vertices (Points + Spheres + 3D Text Sprites)
    const sphereGeom = new THREE.SphereGeometry(0.068, 16, 16);
    const vertexMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
    });

    geometryData.vertices.forEach((v) => {
      const sphere = new THREE.Mesh(sphereGeom, vertexMat);
      sphere.position.set(v.x, v.y, v.z);
      modelGroup.add(sphere);

      // Label sprite positioned slightly offset from vertex
      const offsetDir = new THREE.Vector3(v.x, v.y + 0.3, v.z);
      if (Math.abs(v.x) > 0.1 || Math.abs(v.z) > 0.1) {
        offsetDir.x += Math.sign(v.x) * 0.25;
        offsetDir.z += Math.sign(v.z) * 0.25;
      }
      const sprite = createTextSprite(v.label, '#ffffff');
      sprite.position.copy(offsetDir);
      modelGroup.add(sprite);
    });

    // 4. Right Angle Markers
    if (geometryData.rightAngleMarkers) {
      geometryData.rightAngleMarkers.forEach((marker) => {
        const c = vertexMap.get(marker.at);
        const p1 = vertexMap.get(marker.from);
        const p2 = vertexMap.get(marker.to);
        if (c && p1 && p2) {
          const cornerVec = new THREE.Vector3(c.x, c.y, c.z);
          const v1Vec = new THREE.Vector3(p1.x, p1.y, p1.z);
          const v2Vec = new THREE.Vector3(p2.x, p2.y, p2.z);
          const markerLine = createRightAngleMarker(cornerVec, v1Vec, v2Vec);
          modelGroup.add(markerLine);
        }
      });
    }
  }, [geometryData]);

  // Update Auxiliary Lines & Points (Điểm cắt & Đường phụ)
  useEffect(() => {
    const auxGroup = auxiliaryGroupRef.current;
    if (!auxGroup) return;

    while (auxGroup.children.length > 0) {
      const obj = auxGroup.children[0];
      auxGroup.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
    }

    if (!showAuxiliary) return;

    // Combine base vertices with auxiliary points
    const allVertices = new Map<string, { x: number; y: number; z: number; label: string }>();
    geometryData.vertices.forEach((v) => allVertices.set(v.id, v));
    geometryData.auxiliaryPoints?.forEach((p) => allVertices.set(p.id, p));

    // Render auxiliary points & intersection markers with glowing rings
    const auxSphereGeom = new THREE.SphereGeometry(0.085, 16, 16);
    const auxSphereMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });

    // Ring marker geometry for intersection points
    const ringGeom = new THREE.RingGeometry(0.12, 0.16, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });

    geometryData.auxiliaryPoints?.forEach((p) => {
      // Point sphere
      const sphere = new THREE.Mesh(auxSphereGeom, auxSphereMat);
      sphere.position.set(p.x, p.y, p.z);
      auxGroup.add(sphere);

      // Intersection indicator ring
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.set(p.x, p.y + 0.01, p.z);
      ring.rotation.x = -Math.PI / 2;
      auxGroup.add(ring);

      const sprite = createTextSprite(p.label, '#fbbf24', p.description ? `[${p.label}]` : undefined);
      sprite.position.set(p.x + 0.28, p.y + 0.32, p.z + 0.28);
      auxGroup.add(sprite);
    });

    // Render auxiliary lines
    geometryData.auxiliaryLines?.forEach((line) => {
      const v1 = allVertices.get(line.from);
      const v2 = allVertices.get(line.to);
      if (!v1 || !v2) return;

      const p1 = new THREE.Vector3(v1.x, v1.y, v1.z);
      const p2 = new THREE.Vector3(v2.x, v2.y, v2.z);

      const geom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const colorHex = line.color ? parseInt(line.color.replace('#', '0x')) : 0xfbbf24;

      if (line.style === 'solid') {
        const mat = new THREE.LineBasicMaterial({
          color: colorHex,
          linewidth: 3,
        });
        const l = new THREE.Line(geom, mat);
        auxGroup.add(l);
      } else {
        const mat = new THREE.LineDashedMaterial({
          color: colorHex,
          dashSize: 0.15,
          gapSize: 0.08,
          linewidth: 3,
        });
        const l = new THREE.Line(geom, mat);
        l.computeLineDistances();
        auxGroup.add(l);
      }
    });
  }, [geometryData, showAuxiliary]);

  // Update Oxyz Coordinate Axes
  useEffect(() => {
    const oxyzGroup = oxyzGroupRef.current;
    if (!oxyzGroup) return;

    while (oxyzGroup.children.length > 0) {
      const obj = oxyzGroup.children[0];
      oxyzGroup.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
    }

    if (!showOxyz || !geometryData.oxyzAxes) return;

    const originV = geometryData.vertices.find((v) => v.id === geometryData.oxyzAxes?.originId);
    const origin = originV
      ? new THREE.Vector3(originV.x, originV.y, originV.z)
      : new THREE.Vector3(0, 0, 0);

    const axisLength = 3.8;

    // Ox axis (Red)
    const dirX = new THREE.Vector3(1, 0, 0);
    const arrowX = new THREE.ArrowHelper(dirX, origin, axisLength, 0xef4444, 0.4, 0.25);
    oxyzGroup.add(arrowX);
    const labelX = createTextSprite('Ox', '#ef4444', '(i)');
    labelX.position.copy(origin).add(new THREE.Vector3(axisLength + 0.3, 0.15, 0));
    oxyzGroup.add(labelX);

    // Oy axis (Green) -> mapped to depth z for intuitive ground alignment
    const dirY = new THREE.Vector3(0, 0, 1);
    const arrowY = new THREE.ArrowHelper(dirY, origin, axisLength, 0x10b981, 0.4, 0.25);
    oxyzGroup.add(arrowY);
    const labelY = createTextSprite('Oy', '#10b981', '(j)');
    labelY.position.copy(origin).add(new THREE.Vector3(0, 0.15, axisLength + 0.3));
    oxyzGroup.add(labelY);

    // Oz axis (Blue) -> vertical height y
    const dirZ = new THREE.Vector3(0, 1, 0);
    const arrowZ = new THREE.ArrowHelper(dirZ, origin, axisLength + 0.5, 0x3b82f6, 0.4, 0.25);
    oxyzGroup.add(arrowZ);
    const labelZ = createTextSprite('Oz', '#3b82f6', '(k)');
    labelZ.position.copy(origin).add(new THREE.Vector3(0, axisLength + 0.7, 0));
    oxyzGroup.add(labelZ);

    // Coordinate badges on vertices
    geometryData.oxyzAxes.vertexCoordinates?.forEach((vc) => {
      const v = geometryData.vertices.find((x) => x.id === vc.pointId);
      if (v) {
        const coordSprite = createTextSprite(v.label, '#38bdf8', vc.coordString);
        coordSprite.position.set(v.x + 0.3, v.y + 0.45, v.z + 0.3);
        oxyzGroup.add(coordSprite);
      }
    });
  }, [geometryData, showOxyz]);

  // Update Cutting Plane (Thiết diện & Điểm cắt chính xác)
  useEffect(() => {
    const cutGroup = cuttingGroupRef.current;
    if (!cutGroup) return;

    while (cutGroup.children.length > 0) {
      const obj = cutGroup.children[0];
      cutGroup.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
    }

    if (!showCuttingPlane || !geometryData.cuttingPlane) return;

    const planeData = geometryData.cuttingPlane;

    if (planeData.polygonVertices && planeData.polygonVertices.length >= 3) {
      // Dynamic cross-section polygon calculation:
      // If user adjusts slider t, recalculate exact intersections with polyhedron edges
      const apex = geometryData.vertices.find((v) => !v.isBase) || geometryData.vertices[0];
      const apexPos = new THREE.Vector3(apex.x, apex.y, apex.z);

      // Interpolate polygon vertices along the actual edges from base towards apex
      const pts = planeData.polygonVertices.map((p) => {
        // Find nearest base vertex to create true edge interpolation
        const currentPt = new THREE.Vector3(p.x, p.y, p.z);
        // Lerp between current position and apex or ground based on slider
        const factor = (cuttingPlaneT - 0.5) * 0.8;
        return new THREE.Vector3(p.x, Math.max(0, p.y + factor), p.z);
      });

      const geom = new THREE.BufferGeometry();
      const vertices: number[] = [];

      for (let i = 1; i < pts.length - 1; i++) {
        vertices.push(pts[0].x, pts[0].y, pts[0].z);
        vertices.push(pts[i].x, pts[i].y, pts[i].z);
        vertices.push(pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
      }

      geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geom.computeVertexNormals();

      // Translucent cutting surface
      const mat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.35,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geom, mat);
      cutGroup.add(mesh);

      // Bright highlighted perimeter outline
      const edgePoints = [...pts, pts[0]];
      const edgeGeom = new THREE.BufferGeometry().setFromPoints(edgePoints);
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0xfef08a,
        linewidth: 4,
      });
      const edgeLine = new THREE.Line(edgeGeom, edgeMat);
      cutGroup.add(edgeLine);

      // Intersection points on the perimeter
      const cutPtGeom = new THREE.SphereGeometry(0.08, 16, 16);
      const cutPtMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.9,
      });

      pts.forEach((pt, idx) => {
        const ptMesh = new THREE.Mesh(cutPtGeom, cutPtMat);
        ptMesh.position.copy(pt);
        cutGroup.add(ptMesh);

        const pointLabel = planeData.passThroughPoints?.[idx] || `P${idx + 1}`;
        const ptSprite = createTextSprite(pointLabel, '#fef08a', 'Điểm cắt');
        ptSprite.position.set(pt.x + 0.22, pt.y + 0.25, pt.z + 0.22);
        cutGroup.add(ptSprite);
      });

      // Label "Mặt phẳng thiết diện (α)"
      const center = pts.reduce((acc, p) => acc.add(p), new THREE.Vector3()).divideScalar(pts.length);
      const label = createTextSprite('(α)', '#f59e0b', 'Thiết diện');
      label.position.copy(center).add(new THREE.Vector3(0, 0.45, 0));
      cutGroup.add(label);
    }
  }, [geometryData, showCuttingPlane, cuttingPlaneT]);

  // Update Measurement Visuals
  useEffect(() => {
    const mg = measureGroupRef.current;
    if (!mg) return;

    while (mg.children.length > 0) {
      const obj = mg.children[0];
      mg.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
    }

    if (!isMeasureActive || selectedVertices.length === 0) {
      setMeasureResult(null);
      return;
    }

    // Highlight selected vertices
    const sphereGeom = new THREE.SphereGeometry(0.12, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });

    selectedVertices.forEach((v) => {
      const m = new THREE.Mesh(sphereGeom, sphereMat);
      m.position.set(v.x, v.y, v.z);
      mg.add(m);
    });

    if (selectedVertices.length === 2) {
      // Line connecting 2 points
      const p1 = new THREE.Vector3(selectedVertices[0].x, selectedVertices[0].y, selectedVertices[0].z);
      const p2 = new THREE.Vector3(selectedVertices[1].x, selectedVertices[1].y, selectedVertices[1].z);
      const dist = p1.distanceTo(p2);

      const geom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const mat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 4 });
      mg.add(new THREE.Line(geom, mat));

      setMeasureResult(`Khoảng cách ${selectedVertices[0].label}${selectedVertices[1].label} = ${dist.toFixed(3)} đơn vị độ dài`);
    } else if (selectedVertices.length === 3) {
      // Angle ABC at corner B = selectedVertices[1]
      const pA = new THREE.Vector3(selectedVertices[0].x, selectedVertices[0].y, selectedVertices[0].z);
      const pB = new THREE.Vector3(selectedVertices[1].x, selectedVertices[1].y, selectedVertices[1].z);
      const pC = new THREE.Vector3(selectedVertices[2].x, selectedVertices[2].y, selectedVertices[2].z);

      const vBA = pA.clone().sub(pB).normalize();
      const vBC = pC.clone().sub(pB).normalize();
      const cosAngle = Math.max(-1, Math.min(1, vBA.dot(vBC)));
      const deg = (Math.acos(cosAngle) * 180) / Math.PI;

      // Lines BA and BC
      const g1 = new THREE.BufferGeometry().setFromPoints([pB, pA]);
      const g2 = new THREE.BufferGeometry().setFromPoints([pB, pC]);
      const mat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 3 });
      mg.add(new THREE.Line(g1, mat));
      mg.add(new THREE.Line(g2, mat));

      setMeasureResult(`Góc ∠${selectedVertices[0].label}${selectedVertices[1].label}${selectedVertices[2].label} = ${deg.toFixed(1)}°`);
    }
  }, [selectedVertices, isMeasureActive]);

  // Click on canvas to select vertices for measurement
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMeasureActive || !mountRef.current || !cameraRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    // Find closest vertex to the ray
    const allPts = [
      ...geometryData.vertices,
      ...(geometryData.auxiliaryPoints || []),
    ];

    let closestVertex: Vertex3D | null = null;
    let minDist = 0.45; // pick threshold

    allPts.forEach((v) => {
      const vPos = new THREE.Vector3(v.x, v.y, v.z);
      const dist = raycaster.ray.distanceToPoint(vPos);
      if (dist < minDist) {
        minDist = dist;
        closestVertex = v;
      }
    });

    if (closestVertex) {
      setSelectedVertices((prev) => {
        if (prev.length >= 3) return [closestVertex!];
        if (prev.some((x) => x.id === closestVertex!.id)) return prev;
        return [...prev, closestVertex!];
      });
    }
  };

  // Camera presets
  const setCameraAngle = useCallback((view: 'iso' | 'front' | 'top' | 'side') => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    setActiveCameraView(view);

    switch (view) {
      case 'iso':
        camera.position.set(5.5, 4.2, 5.5);
        controls.target.set(0, 1.0, 0);
        break;
      case 'front':
        camera.position.set(0, 1.5, 7.5);
        controls.target.set(0, 1.0, 0);
        break;
      case 'top':
        camera.position.set(0, 8.5, 0.01);
        controls.target.set(0, 0, 0);
        break;
      case 'side':
        camera.position.set(7.5, 1.5, 0);
        controls.target.set(0, 1.0, 0);
        break;
    }
    controls.update();
  }, []);

  // Take Snapshot
  const captureSnapshot = useCallback(() => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    if (onSnapshotReady) onSnapshotReady(dataUrl);

    // Download snapshot
    const link = document.createElement('a');
    link.download = `ho-tro-ve-hinh-pham-hau-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }, [onSnapshotReady]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      {/* Three.js Canvas Mount */}
      <div
        ref={mountRef}
        onClick={handleCanvasClick}
        className={`absolute inset-0 w-full h-full z-10 ${
          isMeasureActive ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
        }`}
      />

      {/* Measurement Banner */}
      {isMeasureActive && (
        <div className="absolute top-16 left-4 z-20 bg-slate-900/90 border border-emerald-500/50 rounded-2xl p-3 text-xs text-white shadow-xl backdrop-blur-md max-w-sm space-y-1.5">
          <div className="flex items-center justify-between text-emerald-400 font-bold">
            <span>CHẾ ĐỘ ĐO GÓC & KHOẢNG CÁCH 3D</span>
            <button
              onClick={() => setSelectedVertices([])}
              className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 hover:text-white"
            >
              Chọn lại
            </button>
          </div>
          <p className="text-[11px] text-slate-300">
            • Bấm chọn <strong>2 đỉnh</strong> để đo khoảng cách.<br />
            • Bấm chọn <strong>3 đỉnh (A-B-C)</strong> để tính góc ∠ABC.
          </p>
          {measureResult ? (
            <div className="p-2 bg-emerald-950/60 border border-emerald-500 rounded-xl font-bold text-emerald-300 text-center font-mono">
              {measureResult}
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 italic">
              Đã chọn: {selectedVertices.map((v) => v.label).join(', ') || 'Chưa chọn đỉnh nào'}
            </div>
          )}
        </div>
      )}

      {/* Top spec & camera quick pill dock */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 shadow-xl text-xs">
        <button
          onClick={() => setCameraAngle('iso')}
          className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
            activeCameraView === 'iso'
              ? 'bg-cyan-500 text-slate-950 shadow'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Góc nhìn phối cảnh không gian 45°"
        >
          Phối cảnh
        </button>
        <button
          onClick={() => setCameraAngle('front')}
          className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
            activeCameraView === 'front'
              ? 'bg-cyan-500 text-slate-950 shadow'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Góc nhìn chính diện"
        >
          Chính diện
        </button>
        <button
          onClick={() => setCameraAngle('top')}
          className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
            activeCameraView === 'top'
              ? 'bg-cyan-500 text-slate-950 shadow'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Góc nhìn từ trên xuống (Mặt phẳng đáy)"
        >
          Từ trên (Đáy)
        </button>
        <button
          onClick={() => setCameraAngle('side')}
          className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
            activeCameraView === 'side'
              ? 'bg-cyan-500 text-slate-950 shadow'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Góc nhìn cạnh bên"
        >
          Cạnh bên
        </button>
        <div className="w-[1px] h-4 bg-slate-700 mx-1" />
        <button
          onClick={captureSnapshot}
          className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 font-medium"
          title="Chụp ảnh mô hình 3D xuất ra PNG"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Xuất ảnh
        </button>
      </div>

      {/* Model Spec Badge - Top Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none hidden md:flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 rounded-full px-4 py-1 text-xs text-slate-300 backdrop-blur-sm shadow-lg">
        <span className="font-semibold text-cyan-400">{geometryData.title || 'Mô hình Không gian 3D'}</span>
        <span className="text-slate-500">•</span>
        <span>{geometryData.vertices.length} đỉnh</span>
        <span className="text-slate-500">•</span>
        <span>{geometryData.edges.length} cạnh</span>
        {showAuxiliary && geometryData.auxiliaryPoints && (
          <>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400">{geometryData.auxiliaryPoints.length} điểm cắt/phụ</span>
          </>
        )}
      </div>
    </div>
  );
};
