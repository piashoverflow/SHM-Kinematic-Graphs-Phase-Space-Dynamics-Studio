import React, { useEffect, useRef, useState } from 'react';
import { GhostTrailSnapshot, KinematicState, ShmParams } from '../types/shm';
import { Translations } from '../i18n/translations';
import { fmt, fmtSigned } from '../utils/physics';
import {
  drawOscillatorBar,
  drawRoundedRect,
  drawVectorArrow,
  prepareCanvas,
} from '../utils/canvasDraw';

interface Module2PhaseCanvasProps {
  params: ShmParams;
  kin: KinematicState;
  ghostTrail: GhostTrailSnapshot | null;
  onScrubPhase: (phiRad: number) => void;
  t: Translations;
}

export const Module2PhaseCanvas: React.FC<Module2PhaseCanvasProps> = ({
  params,
  kin,
  ghostTrail,
  onScrubPhase,
  t: tr,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 820, height: 640 });
  const isDraggingRef = useRef(false);
  const ellipseCenterRef = useRef({ cx: 200, cy: 360, rxScale: 50, ryScale: 50, rBox: 150 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(320, Math.floor(entry.contentRect.width));
        const h = Math.max(540, Math.min(720, Math.floor(window.innerHeight - 150)));
        setSize({ width: w, height: h });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = prepareCanvas(canvas, size.width, size.height);
    if (!ctx) return;

    const { width: W, height: H } = size;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    const pad = 16;
    const oscH = 104;
    drawOscillatorBar(
      ctx,
      { x: pad, y: 12, w: W - pad * 2, h: oscH },
      {
        amplitude: params.amplitude,
        x: kin.x,
        v: kin.v,
        a: kin.a,
        vMax: kin.vMax,
        aMax: kin.aMax,
        title: tr.canvas.oscillatorStrip,
        eqLabel: tr.canvas.equilibrium,
        massLabel: tr.canvas.massLabel,
      }
    );

    const dualTop = oscH + 26;
    const dualH = H - dualTop - 22;
    const colGap = 16;
    const halfW = (W - pad * 2 - colGap) / 2;

    const leftBox = { x: pad, y: dualTop, w: halfW, h: dualH };
    const rightBox = { x: pad + halfW + colGap, y: dualTop, w: halfW, h: dualH };

    // ==================== LEFT PLOT: v-x Phase-Space Ellipse ====================
    drawRoundedRect(ctx, leftBox.x, leftBox.y, leftBox.w, leftBox.h, 12);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 12px "Plus Jakarta Sans", "Hind Siliguri", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(tr.canvas.phaseEllipseTitle, leftBox.x + 14, leftBox.y + 12);

    const isCircle = Math.abs(params.omega - 1.0) < 0.005;
    if (isCircle) {
      const badgeText = tr.canvas.circleSpecialTag;
      ctx.font = '700 10.5px "Plus Jakarta Sans", "Hind Siliguri", sans-serif';
      const bw = ctx.measureText(badgeText).width + 14;
      drawRoundedRect(ctx, leftBox.x + 14, leftBox.y + 32, bw, 20, 6);
      ctx.fillStyle = '#d1fae5';
      ctx.fill();
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#065f46';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, leftBox.x + 21, leftBox.y + 42);
    }

    const ePad = 48;
    const ePlotSize = Math.min(leftBox.w - ePad * 2, leftBox.h - 104);
    const eCx = leftBox.x + leftBox.w / 2;
    const eCy = leftBox.y + 56 + (leftBox.h - 76) / 2;
    const eHalf = ePlotSize / 2;

    const maxXBound = Math.max(
      3.4,
      params.amplitude * 1.18,
      ghostTrail ? ghostTrail.amplitude * 1.18 : 0
    );
    const maxVBound = Math.max(
      3.4,
      kin.vMax * 1.18,
      ghostTrail ? ghostTrail.omega * ghostTrail.amplitude * 1.18 : 0
    );
    // Unified 1:1 unit scale ensures true ellipse geometry (ry / rx = ω) when ω ≠ 1, and a perfect circle when ω = 1
    const sharedBound = Math.max(maxXBound, maxVBound);
    const xBound = sharedBound;
    const vBound = sharedBound;

    const xToPx = (val: number) => eCx + (val / xBound) * eHalf;
    const vToPx = (val: number) => eCy - (val / vBound) * eHalf;

    ellipseCenterRef.current = {
      cx: eCx,
      cy: eCy,
      rxScale: eHalf / xBound,
      ryScale: eHalf / vBound,
      rBox: eHalf,
    };

    // Gridlines for v-x plot
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let g = -3; g <= 3; g++) {
      const gx = eCx + (g / 3) * eHalf;
      const gy = eCy + (g / 3) * eHalf;
      ctx.beginPath();
      ctx.moveTo(gx, eCy - eHalf);
      ctx.lineTo(gx, eCy + eHalf);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(eCx - eHalf, gy);
      ctx.lineTo(eCx + eHalf, gy);
      ctx.stroke();
    }
    ctx.restore();

    // Axes for v-x plot
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(eCx - eHalf - 10, eCy);
    ctx.lineTo(eCx + eHalf + 10, eCy);
    ctx.moveTo(eCx, eCy - eHalf - 10);
    ctx.lineTo(eCx, eCy + eHalf + 10);
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.font = '600 10.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('x', eCx + eHalf + 13, eCy);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('v', eCx, eCy - eHalf - 13);

    // Ghost Trail Ellipse if locked
    if (ghostTrail) {
      const gRx = (ghostTrail.amplitude / xBound) * eHalf;
      const gRy = ((ghostTrail.omega * ghostTrail.amplitude) / vBound) * eHalf;
      ctx.save();
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(eCx, eCy, gRx, gRy, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Active Ellipse
    const rx = (params.amplitude / xBound) * eHalf;
    const ry = (kin.vMax / vBound) * eHalf;
    ctx.save();
    ctx.fillStyle = isCircle ? 'rgba(5, 150, 105, 0.08)' : 'rgba(2, 132, 199, 0.07)';
    ctx.strokeStyle = isCircle ? '#059669' : '#0284c7';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.ellipse(eCx, eCy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Clockwise flow arrows on upper (v>0) & lower (v<0) halves
    const arrowHalf = Math.max(8, Math.min(16, rx * 0.45));
    drawVectorArrow(ctx, eCx - arrowHalf, eCy - ry, eCx + arrowHalf, eCy - ry, '#059669', 2.2, 7);
    drawVectorArrow(ctx, eCx + arrowHalf, eCy + ry, eCx - arrowHalf, eCy + ry, '#d97706', 2.2, 7);

    ctx.font = '600 10px "Plus Jakarta Sans", "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#047857';
    ctx.textBaseline = 'bottom';
    ctx.fillText(tr.canvas.upperFlow, eCx, eCy - ry - 6);
    ctx.fillStyle = '#b45309';
    ctx.textBaseline = 'top';
    ctx.fillText(tr.canvas.lowerFlow, eCx, eCy + ry + 6);

    // Semi-axes labels A and ωA
    ctx.fillStyle = '#0369a1';
    ctx.font = '700 10.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`+A=${fmt(params.amplitude, 1)}`, eCx + rx + 4, eCy + 4);
    ctx.textAlign = 'right';
    ctx.fillText(`-A`, eCx - rx - 4, eCy + 4);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`+ωA=${fmt(kin.vMax, 1)}`, eCx + 5, eCy - ry + 14);

    // Current particle (x, v) + projection lines
    const pxCur = xToPx(kin.x);
    const pvCur = vToPx(kin.v);

    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(pxCur, eCy);
    ctx.lineTo(pxCur, pvCur);
    ctx.lineTo(eCx, pvCur);
    ctx.stroke();
    ctx.restore();

    // Glowing particle dot
    ctx.save();
    ctx.fillStyle = 'rgba(2, 132, 199, 0.22)';
    ctx.beginPath();
    ctx.arc(pxCur, pvCur, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(pxCur, pvCur, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // ==================== RIGHT PLOT: a-x Linear Plot ====================
    drawRoundedRect(ctx, rightBox.x, rightBox.y, rightBox.w, rightBox.h, 12);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 12px "Plus Jakarta Sans", "Hind Siliguri", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(tr.canvas.accDispLineTitle, rightBox.x + 14, rightBox.y + 12);

    const aCx = rightBox.x + rightBox.w / 2;
    const aCy = rightBox.y + 56 + (rightBox.h - 76) / 2;
    const aHalf = Math.min(rightBox.w - ePad * 2, rightBox.h - 104) / 2;

    const ghostAMax = ghostTrail
      ? ghostTrail.omega * ghostTrail.omega * ghostTrail.amplitude
      : 0;
    const aBound = Math.max(8, kin.aMax * 1.18, ghostAMax * 1.18);

    const axToPx = (val: number) => aCx + (val / maxXBound) * aHalf;
    const aToPx = (val: number) => aCy - (val / aBound) * aHalf;

    // Gridlines
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let g = -3; g <= 3; g++) {
      const gx = aCx + (g / 3) * aHalf;
      const gy = aCy + (g / 3) * aHalf;
      ctx.beginPath();
      ctx.moveTo(gx, aCy - aHalf);
      ctx.lineTo(gx, aCy + aHalf);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(aCx - aHalf, gy);
      ctx.lineTo(aCx + aHalf, gy);
      ctx.stroke();
    }
    ctx.restore();

    // Axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(aCx - aHalf - 10, aCy);
    ctx.lineTo(aCx + aHalf + 10, aCy);
    ctx.moveTo(aCx, aCy - aHalf - 10);
    ctx.lineTo(aCx, aCy + aHalf + 10);
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.font = '600 10.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('x', aCx + aHalf + 13, aCy);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('a', aCx, aCy - aHalf - 13);

    // Ghost line if locked
    if (ghostTrail) {
      const gA = ghostTrail.amplitude;
      const gAMax = ghostTrail.omega * ghostTrail.omega * gA;
      ctx.save();
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(axToPx(-gA), aToPx(gAMax));
      ctx.lineTo(axToPx(gA), aToPx(-gAMax));
      ctx.stroke();
      ctx.restore();
    }

    // Slope triangle in 4th quadrant (0 -> +0.65A)
    const triX = params.amplitude * 0.65;
    const triA = -params.omega * params.omega * triX;
    const tx0 = axToPx(0);
    const ty0 = aToPx(0);
    const tx1 = axToPx(triX);
    const ty1 = aToPx(triA);

    ctx.save();
    ctx.fillStyle = 'rgba(225, 29, 72, 0.09)';
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(tx0, ty0);
    ctx.lineTo(tx1, ty0);
    ctx.lineTo(tx1, ty1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Angle theta arc
    const slopeAngle = Math.atan2(ty1 - ty0, tx1 - tx0);
    ctx.strokeStyle = '#be123c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(tx0, ty0, 22, 0, slopeAngle);
    ctx.stroke();

    ctx.fillStyle = '#be123c';
    ctx.font = '700 10.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`θ`, tx0 + 25, ty0 + 4);
    ctx.fillText(
      `${tr.canvas.slopeLabel} = ${fmt(-params.omega * params.omega, 2)}`,
      rightBox.x + 14,
      rightBox.y + 34
    );
    ctx.restore();

    // Active a = -ω²x line
    const xMinPx = axToPx(-params.amplitude);
    const aMaxPx = aToPx(kin.aMax);
    const xMaxPx = axToPx(params.amplitude);
    const aMinPx = aToPx(-kin.aMax);

    ctx.save();
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(xMinPx, aMaxPx);
    ctx.lineTo(xMaxPx, aMinPx);
    ctx.stroke();

    // Endpoints
    ctx.fillStyle = '#e11d48';
    [
      { px: xMinPx, py: aMaxPx },
      { px: xMaxPx, py: aMinPx },
    ].forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.px, pt.py, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Current particle on a-x line
    const paX = axToPx(kin.x);
    const paY = aToPx(kin.a);
    ctx.save();
    ctx.fillStyle = 'rgba(225, 29, 72, 0.22)';
    ctx.beginPath();
    ctx.arc(paX, paY, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e11d48';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(paX, paY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 10.5px "JetBrains Mono", monospace';
    ctx.fillStyle = '#9f1239';
    ctx.textAlign = kin.x >= 0 ? 'right' : 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(
      `(${fmtSigned(kin.x, 2)}, ${fmtSigned(kin.a, 2)})`,
      paX + (kin.x >= 0 ? -10 : 10),
      paY - 8
    );
    ctx.restore();

    // Ghost vs Active legend if ghostTrail exists
    if (ghostTrail) {
      ctx.save();
      ctx.font = '600 10.5px "Plus Jakarta Sans", "Hind Siliguri", sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#4f46e5';
      ctx.fillText(`--- ${tr.canvas.ghostLegend}`, rightBox.x + rightBox.w - 14, rightBox.y + 13);
      ctx.restore();
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '500 10.5px "Plus Jakarta Sans", "Hind Siliguri", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(tr.canvas.clickDragHint, W - pad, H - 3);
  }, [size, params, kin, ghostTrail, tr]);

  const handlePointer = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const { cx, cy, rxScale, ryScale } = ellipseCenterRef.current;

    // Normalize relative to ellipse center to infer phase phi: x = A sin(phi), v = ωA cos(phi)
    const nx = (px - cx) / Math.max(1, params.amplitude * rxScale);
    const nv = (cy - py) / Math.max(1, kin.vMax * ryScale);
    if (Math.hypot(nx, nv) > 0.02 && px < rect.width * 0.52 && py > 120) {
      let phi = Math.atan2(nx, nv); // sin(phi) = nx, cos(phi) = nv
      if (phi < 0) phi += Math.PI * 2;
      onScrubPhase(phi);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 min-w-0 bg-white/95 backdrop-blur-md border border-sky-200 rounded-2xl shadow-sm p-2 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        style={{ width: size.width, height: size.height }}
        className="block rounded-xl cursor-crosshair touch-none select-none"
        onPointerDown={(e) => {
          isDraggingRef.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          handlePointer(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (isDraggingRef.current) {
            handlePointer(e.clientX, e.clientY);
          }
        }}
        onPointerUp={(e) => {
          isDraggingRef.current = false;
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
      />
    </div>
  );
};
