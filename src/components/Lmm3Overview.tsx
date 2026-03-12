import { conditionTable3, analysisMatrix3 } from "../data/analysis3Data";

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
  teal:    "border-teal-500/50    text-teal-300",
  rose:    "border-rose-500/50    text-rose-300",
};

const accentText: Record<string, string> = {
  violet:  "text-violet-300",
  sky:     "text-sky-300",
  emerald: "text-emerald-300",
  amber:   "text-amber-300",
  teal:    "text-teal-300",
  rose:    "text-rose-300",
};

export function Lmm3Overview() {
  return (
    <section id="lmm3-overview" className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">
          Experiment 3 — LMM Analysis Overview
        </h2>
        <p className="text-slate-400 text-sm">
          N = 41 · 5 RATIO analyses + 1 RT analysis ·{" "}
          <span className="text-slate-300">
            Fixed IEI = 650 ms · Random IEI = 150–1150 ms · Test congruency = 80/20
          </span>
        </p>
      </div>

      {/* Key Exp3 differences banner */}
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 flex gap-3">
        <span className="text-rose-400 text-lg shrink-0">⚡</span>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-rose-300">Key differences from Experiment 2</p>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-xs text-slate-300 leading-relaxed">
            <p>• Test congruency: <code className="text-amber-300">50/50 → 80/20</code></p>
            <p>• RT exclusion: Excel → <code className="text-amber-300">in code</code></p>
            <p>• DV: raw RATIO → <code className="text-amber-300">log_RATIO throughout</code></p>
            <p>• 5th RATIO analysis added (validity split)</p>
            <p>• <code className="text-rose-300">cond_type × is_valid</code> sig in RT ← new!</p>
            <p>• Three-way interaction sig in RT ← new!</p>
          </div>
        </div>
      </div>

      {/* What's new vs Exp 2 */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-3">
        <h3 className="text-base font-semibold text-white">Exp 3 vs. Exp 2 — analysis-level changes</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: "🎯", label: "Congruency split",   exp2: "50/50",               exp3: "80/20 (my_random > 0.8)" },
            { icon: "📊", label: "RATIO DV",           exp2: "RATIO (IC/IP), log_RATIO (TC)", exp3: "log_RATIO throughout" },
            { icon: "⏱",  label: "RT exclusion",       exp2: "Done in Excel",       exp3: "Done in code (rt_excluded)" },
            { icon: "🔢", label: "RATIO analyses",     exp2: "4 analyses",          exp3: "5 analyses (+validity split)" },
            { icon: "🔑", label: "cond × is_valid RT", exp2: "Not significant",     exp3: "SIGNIFICANT ✅" },
            { icon: "🔺", label: "Three-way RT",       exp2: "Not significant",     exp3: "SIGNIFICANT ✅" },
          ].map(({ icon, label, exp2, exp3 }) => (
            <div key={label} className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-300">{icon} {label}</p>
              <div className="flex flex-col gap-1 text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-400 font-mono">Exp2: {exp2}</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">Exp3: {exp3}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SK participant note */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3">
        <span className="text-amber-400 text-lg shrink-0">⚠️</span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-amber-300">SK participant — 6 missing trials</p>
          <p className="text-xs text-slate-300 leading-relaxed">
            Participant SK is missing 6 trials at the end of the <code className="text-amber-300">2-Control-FR</code> block.
            These appear as <code className="text-slate-400">NA</code> in <code className="text-slate-400">wait_duration_before_circle</code>.
            Use <code className="text-amber-300">na.action = na.exclude</code> throughout — never <code className="text-slate-400">na.omit</code>.
            Check with <code className="text-slate-400">sum(is.na(exp3_clean$wait_duration_before_circle)) # → 6</code>.
          </p>
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
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border bg-teal-500/20 text-teal-300 border-teal-500/40">
          <span className="font-mono">VAL</span>
          <span className="text-slate-400 font-normal">Validity Split — new in Exp 3</span>
        </span>
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
              <th className="text-left px-4 py-3 text-slate-300 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {conditionTable3.map((row, i) => (
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
                <td className="px-4 py-2.5 text-slate-500 text-xs">
                  {row.label === "TC-FR" ? "⚠️ SK missing 6" : ""}
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
          {analysisMatrix3.map((a) => (
            <div
              key={a.analysis}
              className={`rounded-xl border bg-slate-900 p-4 ${analysisAccent[a.color]}`}
            >
              <p className={`font-semibold text-sm mb-2 ${accentText[a.color]}`}>
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

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Participants",  value: "n = 41",    sub: "SK: 6 missing trials" },
          { label: "Fixed IEI",    value: "650 ms",    sub: "Acquisition or test" },
          { label: "Random IEI",  value: "150–1150 ms", sub: "Changed from 0–1100 ms in Exp 1" },
          { label: "Congruency",   value: "80 / 20",   sub: "Valid / Invalid (Exp3)" },
          { label: "Acq. / Test",  value: "30 / 50",   sub: "trials per phase" },
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
