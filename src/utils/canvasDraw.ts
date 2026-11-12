export function prepareCanvas(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number
): CanvasRenderingContext2D | null {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const targetW = Math.max(1, Math.floor(cssWidth * dpr));
  const targetH = Math.max(1, Math.floor(cssHeight * dpr));

  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function drawSpring(
  ctx: CanvasRenderingContext2D,
  xStart: number,
  yCenter: number,
  xEnd: number,
  coils = 12,
  halfAmp = 10,
  strokeColor = '#334155'
): void {
  const lead = 14;
  const span = Math.max(16, xEnd - xStart - 2 * lead);
  const coilStart = xStart + lead;

  ctx.save();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2.2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(xStart, yCenter);
  ctx.lineTo(coilStart, yCenter);

  const segments = coils * 2;
  for (let i = 1; i < segments; i++) {
    const px = coilStart + (i / segments) * span;
    const py = yCenter + (i % 2 === 1 ? -halfAmp : halfAmp);
    ctx.lineTo(px, py);
  }

  ctx.lineTo(coilStart + span, yCenter);
  ctx.lineTo(xEnd, yCenter);
  ctx.stroke();
  ctx.restore();
}

export function drawVectorArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  lineWidth = 2.5,
  headLength = 8
): void {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 2) return;

  const angle = Math.atan2(dy, dx);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLength * Math.cos(angle - Math.PI / 6),
    y2 - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    x2 - headLength * Math.cos(angle + Math.PI / 6),
    y2 - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export interface OscillatorGeometry {
  massCenterX: number;
  massCenterY: number;
  massW: number;
  massH: number;
  trackLeft: number;
  trackRight: number;
  eqX: number;
  pxPerMeter: number;
}

export function drawOscillatorBar(
  ctx: CanvasRenderingContext2D,
  bounds: { x: number; y: number; w: number; h: number },
  params: {
    amplitude: number;
    x: number;
    v: number;
    a: number;
    vMax: number;
    aMax: number;
    title: string;
    eqLabel: string;
    massLabel: string;
    draggableHint?: string;
    isDragging?: boolean;
  }
): OscillatorGeometry {
  const { x: bx, y: by, w: bw, h: bh } = bounds;
  const { amplitude, x, v, a, vMax, aMax, title, eqLabel, massLabel, draggableHint, isDragging } = params;

  ctx.save();
  // Card container background
  drawRoundedRect(ctx, bx, by, bw, bh, 12);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.strokeStyle = '#bae6fd';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Header text
  ctx.fillStyle = '#0f172a';
  ctx.font = '600 12px "Plus Jakarta Sans", "Hind Siliguri", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(title, bx + 14, by + 10);

  if (draggableHint) {
    ctx.fillStyle = '#0369a1';
    ctx.font = '500 11px "Plus Jakarta Sans", "Hind Siliguri", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(draggableHint, bx + bw - 14, by + 10);
  }

  const wallX = bx + 28;
  const trackLeft = bx + Math.max(96, bw * 0.24);
  const trackRight = bx + bw - 48;
  const eqX = (trackLeft + trackRight) / 2;
  const halfTrack = (trackRight - trackLeft) / 2;
  const pxPerMeter = halfTrack / 3.1; // fixed scale for up to 3.0m amplitude so A changes visibly!
  const centerY = by + bh * 0.58;

  // Wall bracket + hatching
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(wallX, centerY - 24);
  ctx.lineTo(wallX, centerY + 24);
  ctx.stroke();

  ctx.lineWidth = 1.2;
  ctx.strokeStyle = '#94a3b8';
  for (let hy = centerY - 20; hy <= centerY + 20; hy += 8) {
    ctx.beginPath();
    ctx.moveTo(wallX - 8, hy + 5);
    ctx.lineTo(wallX, hy);
    ctx.stroke();
  }

  // Frictionless rail line
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(wallX, centerY + 18);
  ctx.lineTo(trackRight + 16, centerY + 18);
  ctx.stroke();

  // -A and +A Amplitude boundary markers
  const negAX = eqX - amplitude * pxPerMeter;
  const posAX = eqX + amplitude * pxPerMeter;

  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.2;
  [negAX, posAX].forEach((ax) => {
    ctx.beginPath();
    ctx.moveTo(ax, centerY - 22);
    ctx.lineTo(ax, centerY + 22);
    ctx.stroke();
  });

  // Equilibrium dashed line
  ctx.strokeStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(eqX, centerY - 24);
  ctx.lineTo(eqX, centerY + 24);
  ctx.stroke();
  ctx.restore();

  // Axis labels (-A, 0, +A)
  ctx.font = '600 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#0369a1';
  ctx.fillText(`-A (-${amplitude.toFixed(1)}m)`, negAX, centerY + 24);
  ctx.fillText(`+A (+${amplitude.toFixed(1)}m)`, posAX, centerY + 24);
  ctx.fillStyle = '#475569';
  ctx.font = '500 10.5px "Plus Jakarta Sans", "Hind Siliguri", sans-serif';
  ctx.fillText(eqLabel, eqX, centerY + 24);

  // Mass position
  const massW = 40;
  const massH = 30;
  const massCenterX = eqX + x * pxPerMeter;
  const massLeft = massCenterX - massW / 2;

  // Displacement highlight bar from eqX to massCenterX
  if (Math.abs(massCenterX - eqX) > 2) {
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(eqX, centerY + 18);
    ctx.lineTo(massCenterX, centerY + 18);
    ctx.stroke();
  }

  // Spring from wall to mass
  drawSpring(ctx, wallX, centerY, massLeft, 13, 9, '#334155');

  // Mass block
  drawRoundedRect(ctx, massLeft, centerY - massH / 2, massW, massH, 7);
  const grad = ctx.createLinearGradient(massLeft, centerY - massH / 2, massLeft, centerY + massH / 2);
  grad.addColorStop(0, isDragging ? '#0284c7' : '#0ea5e9');
  grad.addColorStop(1, isDragging ? '#0369a1' : '#0284c7');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = isDragging ? '#0f172a' : '#075985';
  ctx.lineWidth = isDragging ? 2.2 : 1.5;
  ctx.stroke();

  // Mass text
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(massLabel, massCenterX, centerY);

  // Velocity vector above mass (emerald)
  const vVecLen = vMax > 1e-4 ? (v / vMax) * 52 : 0;
  if (Math.abs(vVecLen) > 4) {
    drawVectorArrow(ctx, massCenterX, centerY - 22, massCenterX + vVecLen, centerY - 22, '#059669', 2.4, 7);
    ctx.fillStyle = '#047857';
    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.textAlign = vVecLen > 0 ? 'left' : 'right';
    ctx.fillText('v', massCenterX + vVecLen + (vVecLen > 0 ? 4 : -4), centerY - 22);
  }

  // Acceleration vector below mass inside track area (rose)
  const aVecLen = aMax > 1e-4 ? (a / aMax) * 44 : 0;
  if (Math.abs(aVecLen) > 4) {
    drawVectorArrow(ctx, massCenterX, centerY + 10, massCenterX + aVecLen, centerY + 10, '#e11d48', 2.0, 6);
  }

  ctx.restore();

  return {
    massCenterX,
    massCenterY: centerY,
    massW,
    massH,
    trackLeft,
    trackRight,
    eqX,
    pxPerMeter,
  };
}
