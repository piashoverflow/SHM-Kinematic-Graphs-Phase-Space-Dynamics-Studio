import React from 'react';

interface ProgressiveSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  decimals?: number;
  onChange: (val: number) => void;
}

export const ProgressiveSlider: React.FC<ProgressiveSliderProps> = ({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  decimals = 2,
  onChange,
}) => {
  const percent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="text-xs font-semibold text-slate-800 tracking-tight"
        >
          {label}
        </label>
        <span className="font-mono tabular-nums text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
          {value.toFixed(decimals)} {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="shm-slider w-full"
        style={{
          background: `linear-gradient(to right, #059669 0%, #059669 ${percent}%, #d1fae5 ${percent}%, #d1fae5 100%)`,
        }}
      />
      <div className="flex justify-between text-[10px] font-mono tabular-nums text-slate-500">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
};
