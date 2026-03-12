import { conditionTable2, analysisMatrix2 } from "../data/analysis2Data";

const typeColors: Record<string, string> = {
  IC: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  TC: "bg-amber-500/20  text-amber-300  border-amber-500/40",
  IP: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
};

const analysisAccent: Record<string, string> = {
  violet:  "border-violet-500/50  text-violet-300",
  sky:     "border-sky-500/50     text-sky-300",
  emerald: "border-emerald-500/50 text-emerald-300",
  amber:   "border-amber-500/50   text-amber-300",
  rose:    "border-rose-500/50    text-rose-300",
};

export function Lmm2Overview() {
  return (
    <section id="lmm2-overview" className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">
          Experiment 2 — LMM Analysis Overview
        </h2>
        <p className="text-slate-400 text-sm">
          N = 41 · 4 RATIO analyses + 1 RT analysis ·{" "}
          <span className="text-slate-300">
            Fixed IEI = 650 ms · Random IEI = 150–1150 ms · Test congruency = 50/50
          </span>
        </p>
      </div>

      {/* Exp3 note */}
      <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 flex gap-3">
        <span className="text-sky-400 text-lg shrink-0">ℹ</span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-sky-300">Experiment 3 — same script, one change</p>
          <p className="text-xs text-slate-300 leading-relaxed">
            Exp 3 is identical to Exp 2 in design and analysis structure. The only difference is test-phase
            congruency: <code className="text-amber-300">50/50 → 80/20</code> (
            <code className="text-slate-300">my_random(trialsLoop) &gt; 0.5 → &gt; 0.8</code> in PsychoPy).
            RT exclusion is also handled in code (not Excel) for Exp 3.
          </p>
        </div>
      </div>

      {/* What's new vs Exp 1 */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-3">
        <h3 className="text-base font-semibold text-white">Key differences from Experiment 1</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: "👥", label: "Sample size", exp1: "n = 10", exp2: "n = 41" },
            { icon: "🎯", label: "Catch trials", exp1: "None", exp2: "6 / 30 in acquisition" },
            { icon: "⏱",  label: "RT collected", exp1: "No", exp2: "Yes — log(space_RT)" },
            { icon: "📋", label: "Missing data", exp1: "None", exp2: "~495 RT exclusions" },
            { icon: "🔧", label: "na.action", exp1: "default (na.omit)", exp2: "na.exclude (critical!)" },
            { icon: "⚖️", label: "Congruency", exp1: "Uncontrolled", exp2: "50/50 (Exp 3: 80/20)" },
          ].map(({ icon, label, exp1, exp2 }) => (
            <div key={label} className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-300">{icon} {label}</p>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-400 font-mono">Exp1: {exp1}</span>
                <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono">Exp2: {exp2}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {[
          { code: "IC", label: "Identity Control (Motor)" },
          { code: "IP", label: "Identity Prediction" },
          { code: "TC", label: "Temporal Control" },
        ].map(({ code, label }) => (
          <span
            key={code}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${typeColors[code]}`}
          >
            <span className="font-mono">{code}</span>
            <span className="text-slate-400 font-normal">{label}</span>
          </span>
        ))}
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border bg-rose-500/20 text-rose-300 border-rose-500/40">
          <span className="font-mono">RT</span>
          <span className="text-slate-400 font-normal">Reaction Time (log ms)</span>
        </span>
      </div>

      {/* Block structure table */}
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 border-b border-slate-700">
              <th className="text-left px-4 py-3 text-slate-300 font-semibold">Block</th>
              <th className="text-left px-4 py-3 text-slate-300 font-semibold">Label</th>
              <th className="text-left px-4 py-3 text-slate-300 font-semibold">Type</th>
              <th className="text-left px-4 py-3 text-slate-300 font-semibold">Acq. Timing</th>
              <th className="text-left px-4 py-3 text-slate-300 font-semibold">Test Timing</th>
              <th className="text-left px-4 py-3 text-slate-300 font-semibold">RT</th>
            </tr>
          </thead>
          <tbody>
            {conditionTable2.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-slate-800 ${i % 2 === 0 ? "bg-slate-900/50" : "bg-slate-900"}`}
              >
                <td className="px-4 py-2.5 text-slate-500 text-xs">{row.block}</td>
                <td className="px-4 py-2.5 font-mono text-slate-200">{row.label}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${typeColors[row.type]}`}>
                    {row.type}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-300 capitalize">{row.acq}</td>
                <td className="px-4 py-2.5 text-slate-300 capitalize">{row.test}</td>
                <td className="px-4 py-2.5 text-slate-400 text-xs">
                  {row.type !== "TC" ? "✓ collected" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Analysis matrix */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Analysis Subsets</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {analysisMatrix2.map((a) => (
            <div
              key={a.analysis}
              className={`rounded-xl border bg-slate-900 p-4 ${analysisAccent[a.color]}`}
            >
              <p className={`font-semibold text-sm mb-2 ${analysisAccent[a.color].split(" ")[1]}`}>
                {a.analysis}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {a.conditions.map((c) => (
                  <span
                    key={c}
                    className="font-mono text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timing info */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Participants",    value: "n = 41",      sub: "1 excluded (n=42 original)" },
          { label: "Fixed IEI",       value: "650 ms",      sub: "Acquisition or test" },
          { label: "Random IEI",      value: "150–1150 ms", sub: "Changed from 0–1100 ms in Exp 1" },
          { label: "Acq. / Test",     value: "30 / 50",     sub: "trials per phase" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
