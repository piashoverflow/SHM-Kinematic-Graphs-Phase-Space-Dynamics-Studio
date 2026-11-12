import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CurveVisibility,
  GhostTrailSnapshot,
  LabModule,
  Language,
  ShmParams,
  SnapFraction,
} from './types/shm';
import { TRANSLATIONS } from './i18n/translations';
import {
  computeKinematics,
  snapTime,
  timeFromDisplacement,
} from './utils/physics';
import { TopNavBar } from './components/TopNavBar';
import { LeftControlDock } from './components/LeftControlDock';
import { RightTelemetryPanel } from './components/RightTelemetryPanel';
import { Module1TimeCanvas } from './components/Module1TimeCanvas';
import { Module2PhaseCanvas } from './components/Module2PhaseCanvas';
import { Module3ScrubberCanvas } from './components/Module3ScrubberCanvas';

const DEFAULT_PARAMS: ShmParams = {
  amplitude: 2.0,
  omega: 2.0,
  deltaDeg: 0,
};

export default function App() {
  const [language, setLanguage] = useState<Language>('bn');
  const [activeModule, setActiveModule] = useState<LabModule>('time');
  const [params, setParams] = useState<ShmParams>(DEFAULT_PARAMS);
  const [simTime, setSimTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [visibility, setVisibility] = useState<CurveVisibility>({
    x: true,
    v: true,
    a: true,
  });
  const [ghostTrail, setGhostTrail] = useState<GhostTrailSnapshot | null>(null);
  const [lastEllipticalOmega, setLastEllipticalOmega] = useState<number>(2.0);
  const [snapFraction, setSnapFraction] = useState<SnapFraction>('free');
  const [showTangents, setShowTangents] = useState<boolean>(true);

  const lastFrameRef = useRef<number | null>(null);
  const tr = TRANSLATIONS[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const T = (2 * Math.PI) / params.omega;

  // 60 FPS Animation Loop
  useEffect(() => {
    if (!isPlaying) {
      lastFrameRef.current = null;
      return;
    }

    let rafId = 0;
    const tick = (now: number) => {
      if (lastFrameRef.current !== null) {
        const dt = Math.min(0.05, (now - lastFrameRef.current) / 1000);
        const twoT = 2 * ((2 * Math.PI) / params.omega);
        setSimTime((prev) => (prev + dt * playbackSpeed) % twoT);
      }
      lastFrameRef.current = now;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      lastFrameRef.current = null;
    };
  }, [isPlaying, playbackSpeed, params.omega]);

  const kin = useMemo(
    () => computeKinematics(params.amplitude, params.omega, params.deltaDeg, simTime),
    [params.amplitude, params.omega, params.deltaDeg, simTime]
  );

  const handleChangeParams = useCallback((next: Partial<ShmParams>) => {
    if (next.omega !== undefined && Math.abs(next.omega - 1.0) >= 0.005) {
      setLastEllipticalOmega(next.omega);
    }
    setParams((prev) => ({ ...prev, ...next }));
  }, []);

  const handleScrubTime = useCallback(
    (rawT: number) => {
      setIsPlaying(false);
      const nextT =
        activeModule === 'scrubber' ? snapTime(rawT, T, snapFraction) : rawT;
      setSimTime(nextT);
    },
    [activeModule, T, snapFraction]
  );

  const handleScrubPhase = useCallback(
    (phiRad: number) => {
      setIsPlaying(false);
      const deltaRad = (params.deltaDeg * Math.PI) / 180;
      const twoT = 2 * T;
      let nextT = (phiRad - deltaRad) / params.omega;
      nextT = ((nextT % twoT) + twoT) % twoT;
      setSimTime(nextT);
    },
    [params.deltaDeg, params.omega, T]
  );

  const handleDragDisplacement = useCallback(
    (xVal: number) => {
      setIsPlaying(false);
      const preferPos = kin.v >= 0;
      const nextT = timeFromDisplacement(
        xVal,
        params.amplitude,
        params.omega,
        params.deltaDeg,
        preferPos
      );
      setSimTime(nextT);
    },
    [kin.v, params.amplitude, params.omega, params.deltaDeg]
  );

  const handleStep = useCallback(
    (direction: -1 | 1) => {
      setIsPlaying(false);
      const twoT = 2 * T;
      const divMap: Record<Exclude<SnapFraction, 'free'>, number> = {
        'T/12': 12,
        'T/8': 8,
        'T/6': 6,
        'T/4': 4,
        'T/3': 3,
        'T/2': 2,
      };
      const stepSize =
        activeModule === 'scrubber' && snapFraction !== 'free'
          ? T / divMap[snapFraction]
          : T / 24;
      setSimTime((prev) => {
        const raw = prev + direction * stepSize;
        return ((raw % twoT) + twoT) % twoT;
      });
    },
    [activeModule, snapFraction, T]
  );

  const handleResetTime = useCallback(() => {
    setSimTime(0);
  }, []);

  const handleResetAll = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    setLastEllipticalOmega(DEFAULT_PARAMS.omega);
    setSimTime(0);
    setPlaybackSpeed(1);
    setIsPlaying(true);
    setVisibility({ x: true, v: true, a: true });
    setGhostTrail(null);
    setSnapFraction('free');
    setShowTangents(true);
  }, []);

  const handleToggleVisibility = useCallback((key: keyof CurveVisibility) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleRestoreEllipse = useCallback(() => {
    setParams((prev) => ({
      ...prev,
      omega: Math.abs(lastEllipticalOmega - 1.0) >= 0.005 ? lastEllipticalOmega : 2.0,
    }));
  }, [lastEllipticalOmega]);

  const handleLockGhost = useCallback(() => {
    setGhostTrail({ ...params });
  }, [params]);

  const handleRestoreGhost = useCallback(() => {
    if (!ghostTrail) return;
    if (Math.abs(ghostTrail.omega - 1.0) >= 0.005) {
      setLastEllipticalOmega(ghostTrail.omega);
    }
    setParams({ ...ghostTrail });
  }, [ghostTrail]);

  return (
    <div className="min-h-screen flex flex-col bg-sky-50 text-slate-950">
      <TopNavBar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'bn' ? 'en' : 'bn'))}
        onResetAll={handleResetAll}
        t={tr}
      />

      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 lg:px-5 py-4 flex flex-col lg:flex-row items-start gap-4">
        <LeftControlDock
          activeModule={activeModule}
          params={params}
          onChangeParams={handleChangeParams}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          onStep={handleStep}
          onResetTime={handleResetTime}
          playbackSpeed={playbackSpeed}
          onChangeSpeed={setPlaybackSpeed}
          visibility={visibility}
          onToggleVisibility={handleToggleVisibility}
          ghostTrail={ghostTrail}
          lastEllipticalOmega={lastEllipticalOmega}
          onRestoreEllipse={handleRestoreEllipse}
          onLockGhost={handleLockGhost}
          onRestoreGhost={handleRestoreGhost}
          onClearGhost={() => setGhostTrail(null)}
          snapFraction={snapFraction}
          onChangeSnap={(snap) => {
            setSnapFraction(snap);
            if (snap !== 'free') {
              setSimTime((prev) => snapTime(prev, T, snap));
            }
          }}
          showTangents={showTangents}
          onToggleTangents={() => setShowTangents((s) => !s)}
          t={tr}
        />

        {activeModule === 'time' && (
          <Module1TimeCanvas
            params={params}
            kin={kin}
            visibility={visibility}
            onScrubTime={handleScrubTime}
            t={tr}
          />
        )}

        {activeModule === 'phase' && (
          <Module2PhaseCanvas
            params={params}
            kin={kin}
            ghostTrail={ghostTrail}
            onScrubPhase={handleScrubPhase}
            t={tr}
          />
        )}

        {activeModule === 'scrubber' && (
          <Module3ScrubberCanvas
            params={params}
            kin={kin}
            snapFraction={snapFraction}
            showTangents={showTangents}
            onScrubTime={handleScrubTime}
            onDragDisplacement={handleDragDisplacement}
            t={tr}
          />
        )}

        <RightTelemetryPanel
          activeModule={activeModule}
          params={params}
          kin={kin}
          t={tr}
        />
      </main>
    </div>
  );
}
