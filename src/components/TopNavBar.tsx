import React from 'react';
import { Globe, RotateCcw } from 'lucide-react';
import { LabModule, Language } from '../types/shm';
import { Translations } from '../i18n/translations';

interface TopNavBarProps {
  activeModule: LabModule;
  onSelectModule: (mod: LabModule) => void;
  language: Language;
  onToggleLanguage: () => void;
  onResetAll: () => void;
  t: Translations;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  activeModule,
  onSelectModule,
  language,
  onToggleLanguage,
  onResetAll,
  t,
}) => {
  const tabs: { id: LabModule; label: string; shortLabel: string }[] = [
    { id: 'time', label: t.tabs.time, shortLabel: t.tabs.timeShort },
    { id: 'phase', label: t.tabs.phase, shortLabel: t.tabs.phaseShort },
    { id: 'scrubber', label: t.tabs.scrubber, shortLabel: t.tabs.scrubberShort },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-200 px-4 lg:px-6 py-2.5 shadow-xs">
      <div className="max-w-[1920px] mx-auto flex flex-wrap xl:flex-nowrap items-center justify-between gap-3">
        {/* Left: Studio Title */}
        <div className="min-w-0 shrink-0">
          <h1 className="text-sm sm:text-base lg:text-[17px] font-bold text-slate-950 tracking-tight leading-snug whitespace-nowrap truncate max-w-[360px] lg:max-w-[430px]">
            {t.studioTitle}
          </h1>
        </div>

        {/* Center: 3 Interactive Lab Mode Tabs */}
        <nav
          aria-label="Simulation Modules"
          className="order-3 xl:order-2 w-full xl:w-auto flex items-center gap-1 p-1 bg-sky-50 border border-sky-200 rounded-xl overflow-x-auto"
        >
          {tabs.map((tab) => {
            const isActive = activeModule === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectModule(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/80'
                }`}
              >
                <span className="hidden 2xl:inline">{tab.label}</span>
                <span className="2xl:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Language Switcher, Reset, and Institution Badge */}
        <div className="order-2 xl:order-3 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-sky-700" />
            <span>{t.controls.langToggle}</span>
          </button>

          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-sky-200 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            title={t.controls.resetAll}
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-700" />
            <span>{t.controls.resetAll}</span>
          </button>

          <span className="bg-rose-50 border border-rose-300 text-rose-600 font-extrabold px-3 py-1 rounded-full text-sm whitespace-nowrap shrink-0">
            উদ্ভাস
          </span>
        </div>
      </div>
    </header>
  );
};
