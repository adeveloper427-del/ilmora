import type { Stroke } from '@/state/ProgressProvider';

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Smooth freehand path: quadratic curves through the midpoints of successive samples. */
export function strokeToPath(p: number[]): string {
  const n = p.length / 2;
  if (n === 0) return '';
  if (n === 1) return `M${r1(p[0])} ${r1(p[1])} L${r1(p[0] + 0.1)} ${r1(p[1] + 0.1)}`;
  let d = `M${r1(p[0])} ${r1(p[1])}`;
  for (let i = 1; i < n - 1; i++) {
    const x = p[2 * i];
    const y = p[2 * i + 1];
    const mx = (x + p[2 * i + 2]) / 2;
    const my = (y + p[2 * i + 3]) / 2;
    d += ` Q${r1(x)} ${r1(y)} ${r1(mx)} ${r1(my)}`;
  }
  d += ` L${r1(p[2 * n - 2])} ${r1(p[2 * n - 1])}`;
  return d;
}

export function scaleStrokes(strokes: Stroke[], sx: number, sy: number): Stroke[] {
  return strokes.map((s) => ({ ...s, p: s.p.map((v, i) => (i % 2 === 0 ? v * sx : v * sy)) }));
}

export type Box = { x: number; y: number; width: number; height: number };

export type WritingFeedback = {
  strokeCount: number;
  inkLength: number;
  /** Share of the ink that lies inside the guide's area (with a small margin). Not a handwriting accuracy score. */
  insideRatio: number;
  /** Ink length relative to the guide's height; tells "a few dots" apart from an actual attempt. */
  effort: number;
};

/**
 * Basic, honest feedback: where the student wrote and how much they wrote.
 * This deliberately does not judge letter shape; there is no handwriting recognition here.
 */
export function analyse(strokes: Stroke[], box: Box | null): WritingFeedback {
  let length = 0;
  let inside = 0;
  let samples = 0;
  const mx = box ? box.width * 0.12 : 0;
  const my = box ? box.height * 0.12 : 0;
  for (const s of strokes) {
    for (let i = 0; i < s.p.length; i += 2) {
      const x = s.p[i];
      const y = s.p[i + 1];
      if (i >= 2) length += Math.hypot(x - s.p[i - 2], y - s.p[i - 1]);
      samples++;
      if (box && x >= box.x - mx && x <= box.x + box.width + mx && y >= box.y - my && y <= box.y + box.height + my) inside++;
    }
  }
  return {
    strokeCount: strokes.length,
    inkLength: length,
    insideRatio: samples && box ? inside / samples : 0,
    effort: box && box.height > 0 ? length / box.height : 0,
  };
}

/** Rough count of glyph positions, used to size the tracing guide to the canvas. */
export function glyphUnits(text: string): number {
  const base = text.replace(/[ً-ٰٟۖ-ۭ]/g, '');
  let units = 0;
  for (const ch of base) units += ch === ' ' ? 0.6 : ch === 'ـ' ? 0.5 : 1;
  return Math.max(units, 1);
}

/** Largest guide font size whose wrapped lines still fit inside the canvas. */
export function fitGuideFont(text: string, w: number, h: number): { fontSize: number; lines: number } {
  const units = glyphUnits(text);
  if (units <= 3) {
    const fontSize = Math.max(28, Math.min(h * 0.5, (w * 0.75) / Math.max(units * 0.6, 1)));
    return { fontSize, lines: 1 };
  }
  const usableW = w * 0.9;
  for (let fs = Math.min(h * 0.42, 150); fs > 24; fs -= 2) {
    const lines = Math.ceil((units * 0.6 * fs) / usableW);
    if (lines * fs * 1.85 <= h * 0.94) return { fontSize: fs, lines };
  }
  return { fontSize: 24, lines: Math.ceil((units * 0.6 * 24) / usableW) };
}
