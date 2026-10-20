import * as THREE from 'three';
import { Vertex3D, Edge3D, AuxiliaryPoint3D, AuxiliaryLine3D, RightAngleMarker, CuttingPlaneData, GeoMindSolveResult } from '../types/geomind';

/**
 * 3D Vector Geometry & Intersection Calculations for Vietnamese High School Geometry
 */

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Calculate intersection of a line segment AB with a plane (P0, normal).
 * Returns the intersection point and parameter t in [0, 1] if it cuts the segment, or null otherwise.
 */
export function intersectSegmentWithPlane(
  A: THREE.Vector3,
  B: THREE.Vector3,
  planePoint: THREE.Vector3,
  planeNormal: THREE.Vector3
): { point: THREE.Vector3; t: number } | null {
  const dir = B.clone().sub(A);
  const denom = planeNormal.dot(dir);

  if (Math.abs(denom) < 1e-6) {
    // Segment is parallel to plane
    return null;
  }

  const t = planeNormal.dot(planePoint.clone().sub(A)) / denom;

  if (t >= -1e-4 && t <= 1 + 1e-4) {
    const clampedT = Math.max(0, Math.min(1, t));
    const point = A.clone().add(dir.multiplyScalar(clampedT));
    return { point, t: clampedT };
  }

  return null;
}

/**
 * Orthogonal projection of a point P onto a line passing through A and B.
 * Guarantees projection point lies on the line and P - P_proj is perpendicular to AB.
 */
export function projectPointOntoLine(
  P: THREE.Vector3,
  A: THREE.Vector3,
  B: THREE.Vector3
): { point: THREE.Vector3; t: number } {
  const AB = B.clone().sub(A);
  const lenSq = AB.lengthSq();
  if (lenSq < 1e-9) {
    return { point: A.clone(), t: 0 };
  }
  const AP = P.clone().sub(A);
  const t = AP.dot(AB) / lenSq;
  const point = A.clone().add(AB.multiplyScalar(t));
  return { point, t };
}

/**
 * Intersection of two lines in 3D (assuming they are coplanar or nearly coplanar).
 * Returns the midpoint of closest approach if lines are slightly non-coplanar due to float error.
 */
export function intersectTwoLines(
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  p3: THREE.Vector3,
  p4: THREE.Vector3
): THREE.Vector3 | null {
  const d1 = p2.clone().sub(p1);
  const d2 = p4.clone().sub(p3);
  const cross = d1.clone().cross(d2);
  const denom = cross.lengthSq();

  if (denom < 1e-6) {
    // Parallel lines
    return null;
  }

  const p13 = p3.clone().sub(p1);
  const t1 = p13.clone().cross(d2).dot(cross) / denom;
  const t2 = p13.clone().cross(d1).dot(cross) / denom;

  const ptOn1 = p1.clone().add(d1.multiplyScalar(t1));
  const ptOn2 = p3.clone().add(d2.multiplyScalar(t2));

  // Average to minimize float deviation
  return ptOn1.add(ptOn2).multiplyScalar(0.5);
}

/**
 * Dynamically compute exact polygon vertices for a cutting plane slicing through a polyhedron.
 * This ensures that every vertex of the cross section polygon lies EXACTLY on an edge of the polyhedron!
 */
export function computeExactCuttingPolygon(
  vertices: Vertex3D[],
  edges: Edge3D[],
  planePoint: THREE.Vector3,
  planeNormal: THREE.Vector3
): THREE.Vector3[] {
  const vertexMap = new Map<string, THREE.Vector3>();
  vertices.forEach((v) => vertexMap.set(v.id, new THREE.Vector3(v.x, v.y, v.z)));

  const intersectionPoints: THREE.Vector3[] = [];

  // Check each unique edge
  edges.forEach((edge) => {
    const v1 = vertexMap.get(edge.from);
    const v2 = vertexMap.get(edge.to);
    if (!v1 || !v2) return;

    const hit = intersectSegmentWithPlane(v1, v2, planePoint, planeNormal);
    if (hit) {
      // Avoid duplicates
      const isDuplicate = intersectionPoints.some((p) => p.distanceTo(hit.point) < 0.05);
      if (!isDuplicate) {
        intersectionPoints.push(hit.point);
      }
    }
  });

  if (intersectionPoints.length < 3) {
    return intersectionPoints;
  }

  // Sort intersection points cyclically in the plane to form a valid non-self-intersecting polygon
  const center = intersectionPoints
    .reduce((acc, p) => acc.add(p), new THREE.Vector3())
    .divideScalar(intersectionPoints.length);

  const norm = planeNormal.clone().normalize();
  // Find a vector u perpendicular to normal
  let u = new THREE.Vector3(1, 0, 0).cross(norm);
  if (u.lengthSq() < 1e-4) {
    u = new THREE.Vector3(0, 1, 0).cross(norm);
  }
  u.normalize();
  const v = norm.clone().cross(u).normalize();

  intersectionPoints.sort((a, b) => {
    const da = a.clone().sub(center);
    const db = b.clone().sub(center);
    const angleA = Math.atan2(da.dot(v), da.dot(u));
    const angleB = Math.atan2(db.dot(v), db.dot(u));
    return angleA - angleB;
  });

  return intersectionPoints;
}
