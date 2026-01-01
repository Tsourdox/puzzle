interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  leftLabel: string;
  rightLabel: string;
  formatValue?: (value: number) => string;
}

export default function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  leftLabel,
  rightLabel,
  formatValue = (v) => `${v.toFixed(1)}x`,
}: SliderProps) {
  return (
    <div>
      <label className="block text-zinc-300 font-medium">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
      />
      <div className="text-zinc-500 text-xs flex">
        <span className="flex-1">{leftLabel}</span>
        <span className="text-zinc-200">{formatValue(value)}</span>
        <span className="flex-1 text-right">{rightLabel}</span>
      </div>
    </div>
  );
}
