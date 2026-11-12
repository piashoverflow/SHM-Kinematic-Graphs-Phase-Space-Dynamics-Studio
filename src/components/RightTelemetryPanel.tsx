import React from 'react';
import { CheckCircle2, Compass, TrendingUp } from 'lucide-react';
import { KinematicState, LabModule, ShmParams } from '../types/shm';
import { Translations } from '../i18n/translations';
import { fmt, fmtSigned } from '../utils/physics';

interface RightTelemetryPanelProps {
  activeModule: LabModule;
  params: ShmParams;
  kin: KinematicState;
  t: Translations;
}

export const RightTelemetryPanel: React.FC<RightTelemetryPanelProps> = ({
  activeModule,
  params,
  kin,
  t,
}) => {
  const landmarkInfo = t.telemetry.landmarks[kin.landmark];
  const deltaRad = (params.deltaDeg * Math.PI) / 180;

  return (
    <aside className="w-full lg:w-[330px] shrink-0 flex flex-col gap-4">
      {/* Real-Time Kinematic Readouts */}
      <section className="bg-white/90 backdrop-blur-md border border-sky-200 rounded-2xl shadow-sm p-4 space-y-3">
        <h2 className="text-sm font-bold text-slate-950 border-b border-sky-100 pb-2">
          {t.telemetry.header}
        </h2>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-sky-50/80 border border-sky-100 rounded-xl p-2.5">
            <div className="text-[11px] font-medium text-slate-600">{t.telemetry.timeReadout}</div>
            <div className="font-mono tabular-nums text-base font-bold text-slate-950 mt-0.5">
              {fmt(kin.t, 3)} <span className="text-xs font-normal text-slate-500">s</span>
            </div>
          </div>

          <div className="bg-sky-50/80 border border-sky-100 rounded-xl p-2.5">
            <div className="text-[11px] font-medium text-slate-600">{t.telemetry.periodRatio}</div>
            <div className="font-mono tabular-nums text-base font-bold text-slate-950 mt-0.5">
              {fmt(kin.tOverT, 3)} <span className="text-xs font-normal text-slate-500">T</span>
            </div>
          </div>

          <div className="col-span-2 bg-sky-50/80 border border-sky-100 rounded-xl p-2.5 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-600">
              {t.telemetry.totalPhase}
            </span>
            <span className="font-mono tabular-nums text-xs font-bold text-slate-950">
              {fmt(kin.phiRad, 2)} rad · {fmt(kin.phiWrappedDeg, 1)}°
            </span>
          </div>
        </div>

        {/* x, v, a live values */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-sky-50 border border-sky-200">
            <span className="text-xs font-semibold text-sky-900">{t.telemetry.displacement}</span>
            <span className="font-mono tabular-nums text-sm font-bold text-sky-700">
              {fmtSigned(kin.x, 3)} m
            </span>
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs font-semibold text-emerald-900">{t.telemetry.velocity}</span>
            <span className="font-mono tabular-nums text-sm font-bold text-emerald-700">
              {fmtSigned(kin.v, 3)} m/s
            </span>
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-rose-50 border border-rose-200">
            <span className="text-xs font-semibold text-rose-900">{t.telemetry.acceleration}</span>
            <span className="font-mono tabular-nums text-sm font-bold text-rose-700">
              {fmtSigned(kin.a, 3)} m/s²
            </span>
          </div>
        </div>

        {/* Peak values */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-sky-100">
          <div className="text-xs">
            <span className="text-slate-500 block text-[11px]">{t.telemetry.vMax}</span>
            <span className="font-mono tabular-nums font-bold text-emerald-800">
              ±{fmt(kin.vMax, 2)} m/s
            </span>
          </div>
          <div className="text-xs">
            <span className="text-slate-500 block text-[11px]">{t.telemetry.aMax}</span>
            <span className="font-mono tabular-nums font-bold text-rose-700">
              ±{fmt(kin.aMax, 2)} m/s²
            </span>
          </div>
        </div>
      </section>

      {/* Landmark Detector */}
      <section className="bg-white/90 backdrop-blur-md border border-sky-200 rounded-2xl shadow-sm p-4 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-950">
          <Compass className="w-3.5 h-3.5 text-sky-600" />
          <span>{t.telemetry.landmarkHeader}</span>
        </div>
        <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-2.5">
          <div className="text-xs font-bold text-slate-950">{landmarkInfo.title}</div>
          <div className="text-[11px] text-slate-700 mt-0.5 leading-relaxed">
            {landmarkInfo.detail}
          </div>
        </div>
      </section>

      {/* Module 3 Dual Velocity Roots OR Slope Calculators */}
      {activeModule === 'scrubber' && (
        <section className="bg-white/90 backdrop-blur-md border border-sky-200 rounded-2xl shadow-sm p-4 space-y-2">
          <h2 className="text-xs font-bold text-slate-950 border-b border-sky-100 pb-1.5">
            {t.telemetry.dualRootsHeader}
          </h2>
          <div className="font-mono text-[11px] text-slate-600">
            v = ±ω√(A² - x²)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2">
              <div className="text-[10px] font-semibold text-emerald-800">{t.telemetry.rootPos}</div>
              <div className="font-mono tabular-nums text-xs font-bold text-emerald-700 mt-0.5">
                +{fmt(kin.vRootPos, 3)} m/s
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2">
              <div className="text-[10px] font-semibold text-amber-900">{t.telemetry.rootNeg}</div>
              <div className="font-mono tabular-nums text-xs font-bold text-amber-800 mt-0.5">
                {fmt(kin.vRootNeg, 3)} m/s
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slope & Derivative Calculators */}
      <section className="bg-white/90 backdrop-blur-md border border-sky-200 rounded-2xl shadow-sm p-4 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-950 border-b border-sky-100 pb-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.telemetry.slopeHeader}</span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 text-[11px]">{t.telemetry.slopeXt}</span>
            <span className="font-mono tabular-nums font-bold text-emerald-700">
              {fmtSigned(kin.v, 2)} m/s
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 text-[11px]">{t.telemetry.slopeVt}</span>
            <span className="font-mono tabular-nums font-bold text-rose-700">
              {fmtSigned(kin.a, 2)} m/s²
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 text-[11px]">{t.telemetry.slopeAx}</span>
            <span className="font-mono tabular-nums font-bold text-slate-900">
              {fmt(kin.slopeAx, 2)} s⁻²
            </span>
          </div>
        </div>
      </section>

      {/* Live Equation Evaluator */}
      <section className="bg-white/90 backdrop-blur-md border border-sky-200 rounded-2xl shadow-sm p-4 space-y-2">
        <h2 className="text-xs font-bold text-slate-950 border-b border-sky-100 pb-1.5">
          {t.telemetry.equationsHeader}
        </h2>
        <div className="space-y-1.5 font-mono tabular-nums text-[11px] leading-relaxed">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800">
            x = {fmt(params.amplitude, 1)}·sin({fmt(params.omega, 1)}·{fmt(kin.t, 2)} +{' '}
            {fmt(deltaRad, 2)}) ={' '}
            <span className="font-bold text-sky-700">{fmtSigned(kin.x, 2)} m</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800">
            v = {fmt(kin.vMax, 2)}·cos({fmt(kin.phiRad, 2)}) ={' '}
            <span className="font-bold text-emerald-700">{fmtSigned(kin.v, 2)} m/s</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800">
            a = -{fmt(params.omega * params.omega, 2)}·({fmtSigned(kin.x, 2)}) ={' '}
            <span className="font-bold text-rose-700">{fmtSigned(kin.a, 2)} m/s²</span>
          </div>
        </div>
      </section>

      {/* Live Trigonometric Identity Verifier */}
      <section className="bg-emerald-50/70 border border-emerald-200 rounded-2xl shadow-sm p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-emerald-950">{t.telemetry.identityHeader}</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        </div>
        <div className="font-mono tabular-nums text-xs bg-white border border-emerald-200 rounded-xl p-2.5 text-slate-900">
          <div className="text-[11px] text-slate-600 mb-1">(x / A)² + (v / ωA)²</div>
          <div className="font-bold text-emerald-800">
            ({fmt(kin.xNorm, 3)})² + ({fmt(kin.vNorm, 3)})² ={' '}
            <span className="text-emerald-700">{fmt(kin.identitySum, 3)}</span>
          </div>
        </div>
        <div className="text-[11px] font-medium text-emerald-800">
          {t.telemetry.identityVerified}
        </div>
      </section>
    </aside>
  );
};
