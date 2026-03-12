import type { BlockVariant } from "../data/experimentData";

const timingColor = (t: "fixed" | "random") =>
  t === "fixed"
    ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
    : "bg-orange-500/20 text-orange-300 border-orange-500/40";

interface BlockSwitcherProps {
  variants: BlockVariant[];
  accentColor: string;
}

const accentBorder: Record<string, string> = {
  violet:  "border-violet-500/60 ring-violet-500/30",
  amber:   "border-amber-500/60  ring-amber-500/30",
  emerald: "border-emerald-500/60 ring-emerald-500/30",
};
const accentBadge: Record<string, string> = {
  violet:  "bg-violet-500/20 text-violet-300 border-violet-500/40",
  amber:   "bg-amber-500/20  text-amber-300  border-amber-500/40",
  emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
};

export function BlockSwitcher({ variants, accentColor }: BlockSwitcherProps) {
  const border  = accentBorder[accentColor]  ?? accentBorder.violet;
  const badge   = accentBadge[accentColor]   ?? accentBadge.violet;

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Block variants</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {variants.map((v) => (
          <div
            key={v.code}
            className={`rounded-xl border bg-slate-900 p-4 space-y-3 transition-all ${
              v.isCurrent
                ? `${border} ring-1 shadow-lg shadow-black/40`
                : "border-slate-700"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <span className={`font-mono text-sm font-bold px-2.5 py-1 rounded-lg border ${
                v.isCurrent ? badge : "bg-slate-800 text-slate-400 border-slate-700"
              }`}>
                {v.code}
              </span>
              {v.isCurrent && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  This script
                </span>
              )}
            </div>

            {/* Timing badges */}
            <div className="flex gap-2 flex-wrap">
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider">Acq</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${timingColor(v.acqTiming)}`}>
                  {v.acqTiming}
                </span>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider">Test</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${timingColor(v.testTiming)}`}>
                  {v.testTiming}
                </span>
              </div>
            </div>

            {/* Switch instruction */}
            <p className="text-xs text-slate-400 leading-relaxed">
              {v.isCurrent
                ? <span className="text-emerald-400">✓ {v.switchInstruction}</span>
                : <><span className="text-amber-400 font-semibold">To switch: </span>{v.switchInstruction}</>
              }
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
