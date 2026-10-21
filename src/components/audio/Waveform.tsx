import { memo } from 'react';
import { View } from 'react-native';

/** Converts a metering reading (dBFS, about -160..0) to a 0..1 bar height. */
export function levelFromDb(db: number | undefined): number {
  if (db == null || !Number.isFinite(db)) return 0.05;
  return Math.max(0.05, Math.min(1, (db + 55) / 55));
}

/** Bar waveform. With `progress`, bars before the playhead are drawn in the active colour. */
export const Waveform = memo(function Waveform({
  levels,
  bars = 48,
  height = 72,
  color,
  muted,
  progress,
}: {
  levels: number[];
  bars?: number;
  height?: number;
  color: string;
  muted: string;
  progress?: number;
}) {
  // Resample to a fixed bar count so the shape fills the width regardless of recording length.
  const data: number[] = [];
  if (levels.length <= bars) {
    for (let i = 0; i < bars; i++) data.push(levels[i - (bars - levels.length)] ?? 0.05);
  } else {
    const step = levels.length / bars;
    for (let i = 0; i < bars; i++) {
      const slice = levels.slice(Math.floor(i * step), Math.floor((i + 1) * step));
      data.push(slice.length ? Math.max(...slice) : 0.05);
    }
  }
  return (
    <View style={{ height, flexDirection: 'row', alignItems: 'center', gap: 2 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {data.map((v, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: Math.max(3, v * height),
            borderRadius: 2,
            backgroundColor: progress == null ? color : i / bars <= progress ? color : muted,
          }}
        />
      ))}
    </View>
  );
});
