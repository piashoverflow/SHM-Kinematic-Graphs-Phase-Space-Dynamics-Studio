export type LabModule = 'time' | 'phase' | 'scrubber';
export type Language = 'bn' | 'en';
export type SnapFraction = 'free' | 'T/12' | 'T/8' | 'T/6' | 'T/4' | 'T/3' | 'T/2';

export interface ShmParams {
  amplitude: number; // A in meters [0.5, 3.0]
  omega: number; // angular frequency in rad/s [0.5, 5.0]
  deltaDeg: number; // initial phase in degrees [0, 360]
}

export interface CurveVisibility {
  x: boolean;
  v: boolean;
  a: boolean;
}

export interface GhostTrailSnapshot {
  amplitude: number;
  omega: number;
  deltaDeg: number;
}

export type LandmarkType =
  | 'equilibrium_pos'
  | 'equilibrium_neg'
  | 'positive_extreme'
  | 'negative_extreme'
  | 'general';

export interface KinematicState {
  t: number;
  T: number;
  f: number;
  tOverT: number;
  phiRad: number;
  phiDeg: number;
  phiWrappedDeg: number;
  x: number;
  v: number;
  a: number;
  vMax: number;
  aMax: number;
  xNorm: number;
  vNorm: number;
  aNorm: number;
  identitySum: number;
  vRootPos: number;
  vRootNeg: number;
  slopeVx: number;
  slopeAx: number;
  landmark: LandmarkType;
}
