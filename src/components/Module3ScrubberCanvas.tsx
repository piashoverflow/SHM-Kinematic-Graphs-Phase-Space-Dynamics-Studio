import React, { useEffect, useRef, useState } from 'react';
import { KinematicState, ShmParams, SnapFraction } from '../types/shm';
import { Translations } from '../i18n/translations';
import { clamp, computeKinematics, fmt, fmtSigned } from '../utils/physics';
import {
  drawOscillatorBar,
  drawRoundedRect,
  prepareCanvas,
} from '../utils/canvasDraw';

interface Module3ScrubberCanvasProps {
  params: ShmParams;
  kin: KinematicState;
  snapFraction: SnapFraction;
  showTangents: boolean;
  onScrubTime: (t: number) => void;
  onDragDisplacement: (x: number) => void;
  t: Translations;
}

export const Module3ScrubberCanvas: React.FC<Module3ScrubberCanvasProps> = ({
  params,
  kin,
  snapFraction,
  showTangents,
  onScrubTime,
  onDragDisplacement,
  t: tr,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 820, height: 640 });
  const [isDraggingMass, setIsDraggingMass] = useState(false);

  const dragModeRef = useRef<'none' | 'mass' | 'ellipse' | 'time'>('none');
  const hitRegionsRef = useRef({
    oscTop: 12,
    oscBottom: 124,
    eqX: 400,
    pxPerMeter: 80,
    eCx: 200,
    eRx: 100,
    eLeft: 20,
    eRight: 380,
    eTop: 140,
    timeLeft: 440,
    timeRight: 780,
    timeTop: 140,
    timeBottom: 610,
  });

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
    const oscH = 110;
    const oscGeom = drawOscillatorBar(
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
        draggableHint: tr.canvas.dragMassPrompt,
        isDragging: isDraggingMass,
      }
    );

    const lowerTop = oscH + 26;
    const lowerH = H - lowerTop - 22;
    const gap = 16;
    const leftW = Math.floor((W - pad * 2 - gap) * 0.44);
    const rightW = W - pad * 2 - gap - leftW;

    const leftBox = { x: pad, y: lowerTop, w: leftW, h: lowerH };
    const rightBox = { x: pad + leftW + gap, y: lowerTop, w: rightW, h: lowerH };

    // ==================== LOWER LEFT: Dual-Root v-x Ellipse ====================
    drawRoundedRect(ctx, leftBox.x, leftBox.y, leftBox.w, leftBox.h, 12);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 11.5px "Plus Jakarta Sans", "Hind Siliguri", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(tr.canvas.dualRootTitle, leftBox.x + 12, leftBox.y + 12);

    const eCx = leftBox.x + leftBox.w / 2;
    const eCy = leftBox.y + 42 + (leftBox.h - 54) / 2;
    const eHalf = Math.min(leftBox.w - 76, leftBox.h - 104) / 2;
    const xBound = Math.max(3.2, params.amplitude * 1.15);
    const vBound = Math.max(3.2, kin.vMax * 1.15);

    const xToPx = (val: number) => eCx + (val / xBound) * eHalf;
    const vToPx = (val: number) => eCy - (val / vBound) * eHalf;

    // Grid
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let g = -2; g <= 2; g++) {
      const gx = eCx + (g / 2) * eHalf;
      const gy = eCy + (g / 2) * eHalf;
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

    // Axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(eCx - eHalf - 8, eCy);
    ctx.lineTo(eCx + eHalf + 8, eCy);
    ctx.moveTo(eCx, eCy - eHalf - 8);
    ctx.lineTo(eCx, eCy + eHalf + 8);
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.font = '600 10.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('x', eCx + eHalf + 11, eCy);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('v', eCx, eCy - eHalf - 10);

    // Ellipse
    const rx = (params.amplitude / xBound) * eHalf;
    const ry = (kin.vMax / vBound) * eHalf;
    ctx.save();
    ctx.fillStyle = 'rgba(2, 132, 199, 0.06)';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(eCx, eCy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Vertical slice at current x intersecting ellipse at two symmetric roots (+v, -v)
    const slicePx = xToPx(kin.x);
    const rootPosPy = vToPx(kin.vRootPos);
    const rootNegPy = vToPx(kin.vRootNeg);

    ctx.save();
    ctx.strokeStyle = '#0f172a';
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(slicePx, eCy - eHalf);
    ctx.lineTo(slicePx, eCy + eHalf);
    ctx.stroke();
    ctx.restore();

    // Horizontal dashed projections from both roots to v-axis
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#059669';
    ctx.beginPath();
    ctx.moveTo(eCx, rootPosPy);
    ctx.lineTo(slicePx, rootPosPy);
    ctx.stroke();

    ctx.strokeStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(eCx, rootNegPy);
    ctx.lineTo(slicePx, rootNegPy);
    ctx.stroke();
    ctx.restore();

    // Root points
    [
      { py: rootPosPy, color: '#059669', label: `+${fmt(kin.vRootPos, 2)}`, active: kin.v >= 0 },
      { py: rootNegPy, color: '#d97706', label: `${fmt(kin.vRootNeg, 2)}`, active: kin.v < 0 },
    ].forEach((rt, idx) => {
      ctx.save();
      if (rt.active) {
        ctx.fillStyle = idx === 0 ? 'rgba(5, 150, 105, 0.25)' : 'rgba(217, 119, 6, 0.25)';
        ctx.beginPath();
        ctx.arc(slicePx, rt.py, 11, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = rt.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(slicePx, rt.py, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '700 10.5px "JetBrains Mono", monospace';
      ctx.fillStyle = rt.color;
      ctx.textAlign = kin.x >= 0 ? 'right' : 'left';
      ctx.textBaseline = idx === 0 ? 'bottom' : 'top';
      ctx.fillText(
        `${rt.label} m/s`,
        slicePx + (kin.x >= 0 ? -8 : 8),
        rt.py + (idx === 0 ? -7 : 7)
      );
      ctx.restore();
    });

    // ==================== LOWER RIGHT: Tangent Slope Scrubber ====================
    drawRoundedRect(ctx, rightBox.x, rightBox.y, rightBox.w, rightBox.h, 12);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 11.5px "Plus Jakarta Sans", "Hind Siliguri", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(tr.canvas.scrubberTimeTitle, rightBox.x + 14, rightBox.y + 12);

    const pLeft = rightBox.x + 56;
    const pRight = rightBox.x + rightBox.w - 18;
    const pW = Math.max(80, pRight - pLeft);
    const subGap = 16;
    const subTop = rightBox.y + 38;
    const subBottom = rightBox.y + rightBox.h - 28;
    const subH = (subBottom - subTop - subGap) / 2;

    const twoT = 2 * kin.T;
    const timeToPx = (tm: number) => pLeft + (tm / twoT) * pW;
    const cursorT = ((kin.t % twoT) + twoT) % twoT;
    const cursorPx = timeToPx(cursorT);

    // Snap grid lines
    const snapDivMap: Record<Exclude<SnapFraction, 'free'>, number> = {
      'T/12': 12,
      'T/8': 8,
      'T/6': 6,
      'T/4': 4,
      'T/3': 3,
      'T/2': 2,
    };
    const snapSteps = snapFraction === 'free' ? 8 : snapDivMap[snapFraction] * 2;

    const subPlots = [
      {
        title: tr.canvas.tangentXt,
        color: '#0284c7',
        slopeColor: '#059669',
        maxAbs: Math.max(3.2, params.amplitude * 1.15),
        valNow: kin.x,
        slopeNow: kin.v,
        slopeName: `dx/dt = ${fmtSigned(kin.v, 2)}`,
        evalFn: (tm: number) =>
          computeKinematics(params.amplitude, params.omega, params.deltaDeg, tm).x,
      },
      {
        title: tr.canvas.tangentVt,
        color: '#059669',
        slopeColor: '#e11d48',
        maxAbs: Math.max(3.2, kin.vMax * 1.15),
        valNow: kin.v,
        slopeNow: kin.a,
        slopeName: `dv/dt = ${fmtSigned(kin.a, 2)}`,
        evalFn: (tm: number) =>
          computeKinematics(params.amplitude, params.omega, params.deltaDeg, tm).v,
      },
    ];

    subPlots.forEach((sp, idx) => {
      const sy = subTop + idx * (subH + subGap);
      const midY = sy + subH / 2;
      const halfAmpPx = subH * 0.38;
      const valToY = (v: number) => midY - (v / sp.maxAbs) * halfAmpPx;

      drawRoundedRect(ctx, pLeft, sy, pW, subH, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Grid lines based on snap
      for (let i = 0; i <= snapSteps; i++) {
        const tm = (i / snapSteps) * twoT;
        const gx = timeToPx(tm);
        ctx.strokeStyle = snapFraction !== 'free' ? '#e0f2fe' : '#f1f5f9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gx, sy);
        ctx.lineTo(gx, sy + subH);
        ctx.stroke();
      }

      // Zero axis
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(pLeft, midY);
      ctx.lineTo(pRight, midY);
      ctx.stroke();

      // Y-axis bounds
      ctx.fillStyle = '#475569';
      ctx.font = '600 9.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`+${fmt(sp.maxAbs / 1.15, 1)}`, pLeft - 5, sy + 16);
      ctx.fillText('0', pLeft - 5, midY);
      ctx.fillText(`-${fmt(sp.maxAbs / 1.15, 1)}`, pLeft - 5, sy + subH - 16);

      // Curve
      const samples = Math.max(160, Math.floor(pW / 2));
      ctx.save();
      ctx.strokeStyle = sp.color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const tm = (i / samples) * twoT;
        const px = timeToPx(tm);
        const py = valToY(sp.evalFn(tm));
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();

      // Tangent line & slope triangle
      const curPy = valToY(sp.valNow);
      if (showTangents) {
        const dtHalf = kin.T * 0.14;
        const t1 = cursorT - dtHalf;
        const t2 = cursorT + dtHalf;
        const y1 = sp.valNow - sp.slopeNow * dtHalf;
        const y2 = sp.valNow + sp.slopeNow * dtHalf;

        const px1 = timeToPx(t1);
        const py1 = valToY(y1);
        const px2 = timeToPx(t2);
        const py2 = valToY(y2);

        ctx.save();
        // Clip inside subplot
        ctx.beginPath();
        ctx.rect(pLeft, sy, pW, subH);
        ctx.clip();

        // Slope triangle from cursor point to right tangent end
        ctx.fillStyle =
          idx === 0 ? 'rgba(5, 150, 105, 0.13)' : 'rgba(225, 29, 72, 0.13)';
        ctx.beginPath();
        ctx.moveTo(cursorPx, curPy);
        ctx.lineTo(px2, curPy);
        ctx.lineTo(px2, py2);
        ctx.closePath();
        ctx.fill();

        // Tangent line
        ctx.strokeStyle = sp.slopeColor;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px2, py2);
        ctx.stroke();
        ctx.restore();

        // Slope badge
        ctx.fillStyle = sp.slopeColor;
        ctx.font = '700 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(sp.slopeName, pRight - 8, sy + 6);
      }

      // Label
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 10.5px "Plus Jakarta Sans", "Hind Siliguri", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(sp.title, pLeft + 8, sy + 6);

      // Cursor intersection dot
      ctx.save();
      ctx.fillStyle = sp.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cursorPx, curPy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // Bottom time axis labels (0, T/2, T, 3T/2, 2T)
    [0, 0.5, 1.0, 1.5, 2.0].forEach((frac) => {
      const gx = timeToPx(frac * kin.T);
      ctx.fillStyle = '#334155';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const lbl = frac === 0 ? '0' : frac === 1 ? 'T' : `${frac}T`;
      ctx.fillText(lbl, gx, subBottom + 5);
    });

    // Vertical time cursor across both subplots
    ctx.save();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cursorPx, subTop - 4);
    ctx.lineTo(cursorPx, subBottom + 2);
    ctx.stroke();
    ctx.restore();

    hitRegionsRef.current = {
      oscTop: 12,
      oscBottom: 12 + oscH,
      eqX: oscGeom.eqX,
      pxPerMeter: oscGeom.pxPerMeter,
      eCx,
      eRx: rx,
      eLeft: leftBox.x,
      eRight: leftBox.x + leftBox.w,
      eTop: lowerTop,
      timeLeft: pLeft,
      timeRight: pRight,
      timeTop: subTop,
      timeBottom: subBottom,
    };

    ctx.fillStyle = '#64748b';
    ctx.font = '500 10.5px "Plus Jakarta Sans", "Hind Siliguri", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(tr.canvas.clickDragHint, W - pad, H - 3);
  }, [size, params, kin, snapFraction, showTangents, isDraggingMass, tr]);

  const handlePointerDown = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const hr = hitRegionsRef.current;

    if (py >= hr.oscTop && py <= hr.oscBottom) {
      dragModeRef.current = 'mass';
      setIsDraggingMass(true);
      const xVal = clamp((px - hr.eqX) / hr.pxPerMeter, -params.amplitude, params.amplitude);
      onDragDisplacement(xVal);
    } else if (px >= hr.eLeft && px <= hr.eRight && py >= hr.eTop) {
      dragModeRef.current = 'ellipse';
      const xVal = clamp(
        ((px - hr.eCx) / Math.max(1, hr.eRx)) * params.amplitude,
        -params.amplitude,
        params.amplitude
      );
      onDragDisplacement(xVal);
    } else if (px >= hr.timeLeft - 10 && px <= hr.timeRight + 10 && py >= hr.timeTop - 15) {
      dragModeRef.current = 'time';
      const ratio = clamp((px - hr.timeLeft) / (hr.timeRight - hr.timeLeft), 0, 1);
      onScrubTime(ratio * 2 * kin.T);
    }
  };

  const handlePointerMove = (clientX: number) => {
    if (dragModeRef.current === 'none') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const hr = hitRegionsRef.current;

    if (dragModeRef.current === 'mass') {
      const xVal = clamp((px - hr.eqX) / hr.pxPerMeter, -params.amplitude, params.amplitude);
      onDragDisplacement(xVal);
    } else if (dragModeRef.current === 'ellipse') {
      const xVal = clamp(
        ((px - hr.eCx) / Math.max(1, hr.eRx)) * params.amplitude,
        -params.amplitude,
        params.amplitude
      );
      onDragDisplacement(xVal);
    } else if (dragModeRef.current === 'time') {
      const ratio = clamp((px - hr.timeLeft) / (hr.timeRight - hr.timeLeft), 0, 1);
      onScrubTime(ratio * 2 * kin.T);
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
          e.currentTarget.setPointerCapture(e.pointerId);
          handlePointerDown(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => handlePointerMove(e.clientX)}
        onPointerUp={(e) => {
          dragModeRef.current = 'none';
          setIsDraggingMass(false);
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
      />
    </div>
  );
};
