import React, { useEffect, useRef, useState } from 'react';
import { CurveVisibility, KinematicState, ShmParams } from '../types/shm';
import { Translations } from '../i18n/translations';
import { computeKinematics, fmt, fmtSigned } from '../utils/physics';
import { drawOscillatorBar, drawRoundedRect, prepareCanvas } from '../utils/canvasDraw';

interface Module1TimeCanvasProps {
  params: ShmParams;
  kin: KinematicState;
  visibility: CurveVisibility;
  onScrubTime: (t: number) => void;
  t: Translations;
}

export const Module1TimeCanvas: React.FC<Module1TimeCanvasProps> = ({
  params,
  kin,
  visibility,
  onScrubTime,
  t: tr,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 820, height: 640 });
  const isDraggingRef = useRef(false);
  const plotAreaRef = useRef({ left: 68, right: 780, top: 132, bottom: 610 });

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

    // Subtle canvas background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    const padX = 16;
    const oscH = 104;
    const oscGeom = drawOscillatorBar(
      ctx,
      { x: padX, y: 12, w: W - padX * 2, h: oscH },
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

    const plotLeft = 74;
    const plotRight = W - 26;
    const plotW = Math.max(120, plotRight - plotLeft);
    const plotsTop = oscH + 28;
    const plotsBottom = H - 28;
    const gap = 16;
    const singleH = Math.max(96, (plotsBottom - plotsTop - gap * 2) / 3);

    plotAreaRef.current = {
      left: plotLeft,
      right: plotRight,
      top: plotsTop,
      bottom: plotsBottom,
    };

    const twoT = 2 * kin.T;
    const timeToPx = (timeSec: number) => plotLeft + (timeSec / twoT) * plotW;

    const plots = [
      {
        key: 'x' as const,
        visible: visibility.x,
        title: tr.canvas.dispPlotTitle,
        unit: 'm',
        color: '#0284c7',
        fill: 'rgba(2, 132, 199, 0.08)',
        maxAbs: Math.max(3.2, params.amplitude * 1.15),
        peakVal: params.amplitude,
        evalFn: (tm: number) => computeKinematics(params.amplitude, params.omega, params.deltaDeg, tm).x,
        curVal: kin.x,
      },
      {
        key: 'v' as const,
        visible: visibility.v,
        title: tr.canvas.velPlotTitle,
        unit: 'm/s',
        color: '#059669',
        fill: 'rgba(5, 150, 105, 0.08)',
        maxAbs: Math.max(3.2, kin.vMax * 1.15),
        peakVal: kin.vMax,
        evalFn: (tm: number) => computeKinematics(params.amplitude, params.omega, params.deltaDeg, tm).v,
        curVal: kin.v,
      },
      {
        key: 'a' as const,
        visible: visibility.a,
        title: tr.canvas.accPlotTitle,
        unit: 'm/s²',
        color: '#e11d48',
        fill: 'rgba(225, 29, 72, 0.08)',
        maxAbs: Math.max(5.0, kin.aMax * 1.15),
        peakVal: kin.aMax,
        evalFn: (tm: number) => computeKinematics(params.amplitude, params.omega, params.deltaDeg, tm).a,
        curVal: kin.a,
      },
    ];

    const fractionMarks = [
      { frac: 0, label: '0' },
      { frac: 0.25, label: 'T/4' },
      { frac: 0.5, label: 'T/2' },
      { frac: 0.75, label: '3T/4' },
      { frac: 1.0, label: 'T' },
      { frac: 1.25, label: '5T/4' },
      { frac: 1.5, label: '3T/2' },
      { frac: 1.75, label: '7T/4' },
      { frac: 2.0, label: '2T' },
    ];

    const cursorTime = ((kin.t % twoT) + twoT) % twoT;
    const cursorX = timeToPx(cursorTime);

    // Draw connector trace from physical oscillator mass down to the vertical time cursor top
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.45)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(oscGeom.massCenterX, oscGeom.massCenterY + oscGeom.massH / 2);
    ctx.lineTo(cursorX, plotsTop);
    ctx.stroke();
    ctx.restore();

    plots.forEach((p, idx) => {
      const py = plotsTop + idx * (singleH + gap);
      const midY = py + singleH / 2;
      const halfAmpPx = singleH * 0.39;

      // Plot card backdrop
      drawRoundedRect(ctx, plotLeft, py, plotW, singleH, 10);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Horizontal zero axis & peak guides
      const peakOffset = (p.peakVal / p.maxAbs) * halfAmpPx;
      ctx.save();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      [midY - peakOffset, midY + peakOffset].forEach((gy) => {
        ctx.beginPath();
        ctx.moveTo(plotLeft, gy);
        ctx.lineTo(plotRight, gy);
        ctx.stroke();
      });
      ctx.restore();

      // Zero axis line
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(plotLeft, midY);
      ctx.lineTo(plotRight, midY);
      ctx.stroke();

      // Vertical T/4 landmark gridlines
      fractionMarks.forEach((m) => {
        const gx = timeToPx(m.frac * kin.T);
        ctx.save();
        ctx.strokeStyle = m.frac === 1.0 ? '#94a3b8' : '#e2e8f0';
        ctx.lineWidth = m.frac === 1.0 ? 1.2 : 1;
        ctx.beginPath();
        ctx.moveTo(gx, py);
        ctx.lineTo(gx, py + singleH);
        ctx.stroke();
        ctx.restore();

        // Time axis labels on bottom plot only
        if (idx === 2) {
          ctx.fillStyle = '#334155';
          ctx.font = '600 10.5px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(m.label, gx, py + singleH + 6);
        }
      });

      // Y-axis peak labels on left
      ctx.fillStyle = '#475569';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`+${fmt(p.peakVal, 1)}`, plotLeft - 7, midY - peakOffset);
      ctx.fillText('0', plotLeft - 7, midY);
      ctx.fillText(`-${fmt(p.peakVal, 1)}`, plotLeft - 7, midY + peakOffset);

      // Plot title badge
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 11.5px "Plus Jakarta Sans", "Hind Siliguri", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(p.title, plotLeft + 10, py + 7);

      if (p.visible) {
        const valToY = (val: number) => midY - (val / p.maxAbs) * halfAmpPx;

        // Subtle fill under curve
        const samples = Math.max(220, Math.floor(plotW / 2));
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(plotLeft, midY);
        for (let i = 0; i <= samples; i++) {
          const tm = (i / samples) * twoT;
          const val = p.evalFn(tm);
          ctx.lineTo(timeToPx(tm), valToY(val));
        }
        ctx.lineTo(plotRight, midY);
        ctx.closePath();
        ctx.fillStyle = p.fill;
        ctx.fill();
        ctx.restore();

        // Main waveform stroke
        ctx.save();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.6;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        for (let i = 0; i <= samples; i++) {
          const tm = (i / samples) * twoT;
          const val = p.evalFn(tm);
          const px = timeToPx(tm);
          const pyVal = valToY(val);
          if (i === 0) ctx.moveTo(px, pyVal);
          else ctx.lineTo(px, pyVal);
        }
        ctx.stroke();
        ctx.restore();

        // Highlight zero-crossings & extrema in [0, 2T]
        const deltaRad = (params.deltaDeg * Math.PI) / 180;
        const stepQuarter = Math.PI / 2;
        const minK = Math.ceil((deltaRad - 1e-6) / stepQuarter);
        const maxK = Math.floor((params.omega * twoT + deltaRad + 1e-6) / stepQuarter);

        for (let k = minK; k <= maxK; k++) {
          const phiLandmark = k * stepQuarter;
          const tmLandmark = (phiLandmark - deltaRad) / params.omega;
          if (tmLandmark < 0 || tmLandmark > twoT) continue;
          const lx = timeToPx(tmLandmark);
          const lVal = p.evalFn(tmLandmark);
          const ly = valToY(lVal);
          const isZero = Math.abs(lVal) < p.peakVal * 0.05;

          ctx.save();
          if (isZero) {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(lx, ly, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(lx, ly, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // Intersection point on vertical time cursor
        const cy = valToY(p.curVal);
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(cursorX, cy, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Instantaneous value pill next to intersection
        const valText = `${fmtSigned(p.curVal, 2)} ${p.unit}`;
        ctx.font = '700 10.5px "JetBrains Mono", monospace';
        const tw = ctx.measureText(valText).width + 10;
        const flipLeft = cursorX + tw + 12 > plotRight;
        const bx = flipLeft ? cursorX - tw - 8 : cursorX + 8;
        const by = Math.max(py + 22, Math.min(py + singleH - 22, cy - 9));

        drawRoundedRect(ctx, bx, by, tw, 18, 5);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
        ctx.fill();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = p.color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(valText, bx + 5, by + 9);
        ctx.restore();
      }
    });

    // Vertical synchronized time-cursor spanning all 3 graphs
    ctx.save();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cursorX, plotsTop - 4);
    ctx.lineTo(cursorX, plotsBottom + 4);
    ctx.stroke();

    // Top cursor handle triangle
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(cursorX - 6, plotsTop - 8);
    ctx.lineTo(cursorX + 6, plotsTop - 8);
    ctx.lineTo(cursorX, plotsTop);
    ctx.closePath();
    ctx.fill();

    // Time label on cursor top
    const tLabel = `t = ${fmt(cursorTime, 2)}s`;
    ctx.font = '700 10.5px "JetBrains Mono", monospace';
    const labelW = ctx.measureText(tLabel).width + 10;
    const lx = Math.max(plotLeft, Math.min(plotRight - labelW, cursorX - labelW / 2));
    drawRoundedRect(ctx, lx, plotsTop - 24, labelW, 17, 5);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tLabel, lx + labelW / 2, plotsTop - 15.5);
    ctx.restore();

    // Legend / hint footer inside canvas
    ctx.fillStyle = '#64748b';
    ctx.font = '500 10.5px "Plus Jakarta Sans", "Hind Siliguri", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(tr.canvas.clickDragHint, plotRight, H - 3);
  }, [size, params, kin, visibility, tr]);

  const handlePointer = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const { left, right, top, bottom } = plotAreaRef.current;
    if (y >= top - 28 && y <= bottom + 20) {
      const ratio = Math.max(0, Math.min(1, (x - left) / (right - left)));
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
