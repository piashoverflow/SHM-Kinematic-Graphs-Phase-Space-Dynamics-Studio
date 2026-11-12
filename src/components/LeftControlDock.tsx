import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Circle,
  Layers,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  CurveVisibility,
  GhostTrailSnapshot,
  LabModule,
  ShmParams,
  SnapFraction,
} from '../types/shm';
import { Translations } from '../i18n/translations';
import { ProgressiveSlider } from './ProgressiveSlider';

interface LeftControlDockProps {
  activeModule: LabModule;
  params: ShmParams;
  onChangeParams: (next: Partial<ShmParams>) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStep: (direction: -1 | 1) => void;
  onResetTime: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  visibility: CurveVisibility;
  onToggleVisibility: (key: keyof CurveVisibility) => void;
  ghostTrail: GhostTrailSnapshot | null;
  lastEllipticalOmega: number;
  onRestoreEllipse: () => void;
  onLockGhost: () => void;
  onRestoreGhost: () => void;
  onClearGhost: () => void;
  snapFraction: SnapFraction;
  onChangeSnap: (snap: SnapFraction) => void;
  showTangents: boolean;
  onToggleTangents: () => void;
  t: Translations;
}

export const LeftControlDock: React.FC<LeftControlDockProps> = ({
  activeModule,
  params,
  onChangeParams,
  isPlaying,
  onTogglePlay,
  onStep,
  onResetTime,
  playbackSpeed,
  onChangeSpeed,
  visibility,
  onToggleVisibility,
  ghostTrail,
  lastEllipticalOmega,
  onRestoreEllipse,
  onLockGhost,
  onRestoreGhost,
  onClearGhost,
  snapFraction,
  onChangeSnap,
  showTangents,
  onToggleTangents,
  t,
}) => {
  const isCircleCase = Math.abs(params.omega - 1.0) < 0.005;
  const snapOptions: SnapFraction[] = ['free', 'T/12', 'T/8', 'T/6', 'T/4', 'T/3', 'T/2'];
  const speeds = [0.25, 0.5, 1, 1.5];

  return (
    <aside className="w-full lg:w-[340px] shrink-0 flex flex-col gap-4">
      {/* Oscillator Parameters Card */}
      <section className="bg-white/90 backdrop-blur-md border border-sky-200 rounded-2xl shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-sky-100 pb-2.5">
          <h2 className="text-sm font-bold text-slate-950">{t.controls.parameters}</h2>
          <span className="font-mono tabular-nums text-[11px] font-semibold text-sky-700">
            T = {((2 * Math.PI) / params.omega).toFixed(2)} s
          </span>
        </div>

        <ProgressiveSlider
          id="slider-amplitude"
          label={t.controls.amplitude}
          value={params.amplitude}
          min={0.5}
          max={3.0}
          step={0.1}
          unit="m"
          decimals={1}
          onChange={(amplitude) => onChangeParams({ amplitude })}
        />

        <ProgressiveSlider
          id="slider-omega"
          label={t.controls.omega}
          value={params.omega}
          min={0.5}
          max={5.0}
          step={0.1}
          unit="rad/s"
          decimals={1}
          onChange={(omega) => onChangeParams({ omega })}
        />

        <ProgressiveSlider
          id="slider-delta"
          label={t.controls.initialPhase}
          value={params.deltaDeg}
          min={0}
          max={360}
          step={5}
          unit="°"
          decimals={0}
          onChange={(deltaDeg) => onChangeParams({ deltaDeg })}
        />
      </section>

      {/* Playback & Time Scrubbing Card */}
      <section className="bg-white/90 backdrop-blur-md border border-sky-200 rounded-2xl shadow-sm p-4 space-y-3.5">
        <h2 className="text-sm font-bold text-slate-950 border-b border-sky-100 pb-2">
          {t.controls.playback}
        </h2>

        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={onTogglePlay}
            className={`col-span-2 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? t.controls.pause : t.controls.play}</span>
          </button>

          <button
            type="button"
            onClick={() => onStep(-1)}
            title={t.controls.stepBack}
            className="inline-flex items-center justify-center py-2 px-2 rounded-xl text-xs font-semibold text-slate-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onStep(1)}
            title={t.controls.stepForward}
            className="inline-flex items-center justify-center py-2 px-2 rounded-xl text-xs font-semibold text-slate-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700">{t.controls.speed}</span>
          <div className="flex items-center gap-1 bg-sky-50 border border-sky-200 p-0.5 rounded-lg">
            {speeds.map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => onChangeSpeed(sp)}
                className={`px-2 py-1 rounded-md font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                  playbackSpeed === sp
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onResetTime}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.controls.resetTime}</span>
          </button>
        </div>
      </section>

      {/* Module-Specific Controls */}
      {activeModule === 'time' && (
        <section className="bg-white/90 backdrop-blur-md border border-sky-200 rounded-2xl shadow-sm p-4 space-y-2.5">
          <h2 className="text-sm font-bold text-slate-950 border-b border-sky-100 pb-2">
            {t.controls.visibility}
          </h2>

          <div className="space-y-1.5">
            {(
              [
                {
                  key: 'x' as const,
                  label: t.controls.dispCurve,
                  colorClass: 'bg-sky-500',
                  activeBg: 'bg-sky-50 border-sky-300 text-sky-950',
                },
                {
                  key: 'v' as const,
                  label: t.controls.velCurve,
                  colorClass: 'bg-emerald-600',
                  activeBg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
                },
                {
                  key: 'a' as const,
                  label: t.controls.accCurve,
                  colorClass: 'bg-rose-600',
                  activeBg: 'bg-rose-50 border-rose-300 text-rose-950',
                },
              ] as const
            ).map((item) => {
              const active = visibility[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onToggleVisibility(item.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? item.activeBg
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-3 h-1.5 rounded-sm ${
                        active ? item.colorClass : 'bg-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </span>
                  {active ? (
                    <Eye className="w-3.5 h-3.5 opacity-80" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 opacity-60" />
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {activeModule === 'phase' && (
        <section className="bg-white/90 backdrop-blur-md border border-sky-200 rounded-2xl shadow-sm p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-950 border-b border-sky-100 pb-2">
            {t.controls.phaseOptions}
          </h2>

          {/* Elliptical vs Circular Segmented Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-sky-50 border border-sky-200 rounded-xl">
            <button
              type="button"
              onClick={onRestoreEllipse}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                !isCircleCase
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              {t.controls.ellipseMode}
            </button>
            <button
              type="button"
              onClick={() => onChangeParams({ omega: 1.0 })}
              className={`inline-flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                isCircleCase
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              <Circle className="w-3 h-3" />
              <span>{t.controls.circleMode}</span>
            </button>
          </div>

          {isCircleCase && (
            <button
              type="button"
              onClick={onRestoreEllipse}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-900 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>
                {t.controls.restoreEllipse} (ω = {lastEllipticalOmega.toFixed(1)})
              </span>
            </button>
          )}

          <div className="flex items-center gap-2 pt-1 border-t border-sky-100">
            <button
              type="button"
              onClick={onLockGhost}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t.controls.ghostLock}</span>
            </button>

            {ghostTrail && (
              <button
                type="button"
                onClick={onClearGhost}
                title={t.controls.ghostClear}
                className="inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {ghostTrail && (
            <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <p className="text-[11px] text-slate-600 leading-relaxed font-mono tabular-nums">
                {t.controls.ghostActiveNote}: A = {ghostTrail.amplitude.toFixed(1)}m, ω ={' '}
                {ghostTrail.omega.toFixed(1)} rad/s
              </p>
              <button
                type="button"
                onClick={onRestoreGhost}
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t.controls.ghostRestore}</span>
              </button>
            </div>
          )}
        </section>
      )}

      {activeModule === 'scrubber' && (
        <section className="bg-white/90 backdrop-blur-md border border-sky-200 rounded-2xl shadow-sm p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-950 border-b border-sky-100 pb-2">
            {t.controls.scrubberOptions}
          </h2>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 block">
              {t.controls.gridSnap}
            </span>
            <div className="grid grid-cols-4 gap-1">
              {snapOptions.map((opt) => {
                const active = snapFraction === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onChangeSnap(opt)}
                    className={`py-1.5 px-1.5 rounded-lg text-[11px] font-mono font-semibold border transition-colors cursor-pointer ${
                      active
                        ? 'bg-emerald-600 border-emerald-700 text-white'
                        : 'bg-sky-50 border-sky-200 text-slate-800 hover:bg-sky-100'
                    }`}
                  >
                    {opt === 'free' ? t.controls.snapFree : opt}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleTangents}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              showTangents
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <span>{t.controls.showTangents}</span>
            <span className="font-mono text-[11px] font-bold">
              {showTangents ? 'ON' : 'OFF'}
            </span>
          </button>

          <p className="text-[11px] text-slate-600 leading-relaxed bg-sky-50/70 border border-sky-200 rounded-xl p-2.5">
            {t.controls.dragHint}
          </p>
        </section>
      )}
    </aside>
  );
};
