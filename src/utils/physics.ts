import { KinematicState, LandmarkType, SnapFraction } from '../types/shm';

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function computeKinematics(
  amplitude: number,
  omega: number,
  deltaDeg: number,
  t: number
): KinematicState {
  const T = (2 * Math.PI) / omega;
  const f = omega / (2 * Math.PI);
  const deltaRad = (deltaDeg * Math.PI) / 180;
  const phiRad = omega * t + deltaRad;
  const phiDeg = (phiRad * 180) / Math.PI;
  const phiWrappedDeg = ((phiDeg % 360) + 360) % 360;

  const sinPhi = Math.sin(phiRad);
  const cosPhi = Math.cos(phiRad);

  const x = amplitude * sinPhi;
  const v = omega * amplitude * cosPhi;
  const a = -omega * omega * amplitude * sinPhi;

  const vMax = omega * amplitude;
  const aMax = omega * omega * amplitude;

  const xNorm = x / amplitude;
  const vNorm = v / vMax;
  const aNorm = a / aMax;
  const identitySum = xNorm * xNorm + vNorm * vNorm;

  const radical = Math.max(0, amplitude * amplitude - x * x);
  const vRootPos = omega * Math.sqrt(radical);
  const vRootNeg = -vRootPos;

  const slopeVx = Math.abs(v) > 1e-4 ? a / v : 0;
  const slopeAx = -omega * omega;

  let landmark: LandmarkType = 'general';
  if (Math.abs(xNorm) < 0.04) {
    landmark = v >= 0 ? 'equilibrium_pos' : 'equilibrium_neg';
  } else if (xNorm > 0.985) {
    landmark = 'positive_extreme';
  } else if (xNorm < -0.985) {
    landmark = 'negative_extreme';
  }

  return {
    t,
    T,
    f,
    tOverT: t / T,
    phiRad,
    phiDeg,
    phiWrappedDeg,
    x,
    v,
    a,
    vMax,
    aMax,
    xNorm,
    vNorm,
    aNorm,
    identitySum,
    vRootPos,
    vRootNeg,
    slopeVx,
    slopeAx,
    landmark,
  };
}

export function snapTime(t: number, T: number, snap: SnapFraction): number {
  if (snap === 'free') return clamp(t, 0, 2 * T);
  const divisorMap: Record<Exclude<SnapFraction, 'free'>, number> = {
    'T/12': 12,
    'T/8': 8,
    'T/6': 6,
    'T/4': 4,
    'T/3': 3,
    'T/2': 2,
  };
  const step = T / divisorMap[snap];
  const snapped = Math.round(t / step) * step;
  return clamp(snapped, 0, 2 * T);
}

export function timeFromDisplacement(
  targetX: number,
  amplitude: number,
  omega: number,
  deltaDeg: number,
  preferPositiveVelocity: boolean
): number {
  const T = (2 * Math.PI) / omega;
  const deltaRad = (deltaDeg * Math.PI) / 180;
  const ratio = clamp(targetX / amplitude, -1, 1);
  const theta = Math.asin(ratio); // [-pi/2, pi/2]
  const targetPhi = preferPositiveVelocity ? theta : Math.PI - theta;

  let rawT = (targetPhi - deltaRad) / omega;
  const twoT = 2 * T;
  rawT = ((rawT % twoT) + twoT) % twoT;
  return rawT;
}

export function fmt(n: number, decimals = 2): string {
  const fixed = n.toFixed(decimals);
  return fixed === '-0.00' || fixed === '-0.000' ? fixed.slice(1) : fixed;
}

export function fmtSigned(n: number, decimals = 2): string {
  const clean = Math.abs(n) < Math.pow(10, -decimals - 1) ? 0 : n;
  const prefix = clean > 0 ? '+' : '';
  return `${prefix}${fmt(clean, decimals)}`;
}
