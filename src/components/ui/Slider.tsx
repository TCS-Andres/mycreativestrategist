'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  id?: string;
  name?: string;
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  minLabel,
  maxLabel,
  id,
  name,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <span>{minLabel}</span>
        <span className="text-brand-orange font-heading text-base font-semibold tabular-nums tracking-normal">
          {value}
        </span>
        <span>{maxLabel}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          id={id}
          name={name}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            'w-full appearance-none bg-transparent',
            '[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-brand-gray',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-soft [&::-webkit-slider-thumb]:-mt-2 [&::-webkit-slider-thumb]:cursor-grab',
            '[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-brand-gray',
            '[&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-orange [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-grab',
            'focus:outline-none',
          )}
          style={{
            background: `linear-gradient(to right, #F28D3D 0%, #F28D3D ${pct}%, #E8E4DD ${pct}%, #E8E4DD 100%)`,
            borderRadius: '9999px',
          }}
        />
      </div>
    </div>
  );
}
