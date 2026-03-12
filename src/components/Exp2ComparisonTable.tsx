import { comparisonTable2, SHARED_PARAMS_2, BLOCK_STRUCTURE_2 } from "../data/experiment2Data";

const condColor: Record<string, string> = {
  IC: "text-violet-300",
  TC: "text-amber-300",
  IP: "text-emerald-300",
};

const condBg: Record<string, string> = {
  IC: "bg-violet-500/10 border-violet-500/30",
  TC: "bg-amber-500/10 border-amber-500/30",
  IP: "bg-emerald-500/10 border-emerald-500/30",
};

const timingBadge = (t: "Fixed" | "Random") =>
  t === "Fixed"
    ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
    : "bg-rose-500/20 text-rose-300 border border-rose-500/30";

export function Exp2ComparisonTable() {
  return (
    <div className="space-y-12">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-amber-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
            E2
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white">Experiment 2 — Design Overview</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              PsychoPy v2021.1.4 · 3 conditions · 6 blocks · Catch trials · RT collected
            </p>
          </div>
        </div>

        {/* Exp3 note banner */}
        <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="text-xs font-semibold text-amber-300 mb-1">⚠️ Experiment 3 Note</p>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            Experiment 3 is <strong>identical to Experiment 2</strong> with one change:{" "}
            <strong>test-phase congruency shifts from 50/50 → 80/20</strong>.
            In IC/TC: <code className="bg-amber-900/40 px-1 rounded">my_random() &gt; 0.8</code> (was{" "}
            <code className="bg-amber-900/40 px-1 rounded">&gt; 0.5</code>).
            In IP: <code className="bg-amber-900/40 px-1 rounded">my_random() &lt; 0.2</code> (was{" "}
            <code className="bg-amber-900/40 px-1 rounded">&lt; 0.5</code>).
            Trial counts, IEI, catch trials, RT collection — all unchanged.
          </p>
        </div>
      </div>

      {/* ── Key changes from Exp 1 ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-sky-500/20 text-sky-300 text-xs flex items-center justify-center border border-sky-500/30">Δ</span>
          Key Changes from Experiment 1
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: "Fixed IEI",         old: "550 ms",    now: "650 ms",              icon: "⏱" },
            { label: "Acquisition trials",old: "50",        now: "30",                  icon: "🔁" },
            { label: "Test trials",       old: "50",        now: "50 (unchanged)",       icon: "🧪" },
            { label: "Catch trials",      old: "None",      now: "6 per 30 acq trials", icon: "🎯" },
            { label: "RT collection",     old: "Not collected", now: "space_RT in test", icon: "⚡" },
            { label: "Test congruency",   old: "Uncontrolled", now: "50/50 via my_random()", icon: "⚖" },
            { label: "get_color()",       old: "raw random()", now: "deterministic helper", icon: "🎨" },
            { label: "IP tone onset",     old: "1.3 s",     now: "2.0 s",               icon: "🔊" },
            { label: "Acq CSV",           old: "50-trial CSV", now: "acq. 30.csv.csv",  icon: "📄" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <p className="text-xs text-slate-500 mb-1">{item.icon} {item.label}</p>
              <p className="text-[11px] text-rose-400/80 line-through">{item.old}</p>
              <p className="text-xs text-emerald-300 font-medium">{item.now}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Shared parameters ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-base font-semibold text-white mb-4">Shared Parameters (Exp 2 &amp; 3)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: "Fixed IEI",           value: SHARED_PARAMS_2.fixedIEI,          color: "sky" },
            { label: "Random IEI range",    value: SHARED_PARAMS_2.randomRange,        color: "rose" },
            { label: "Outcome duration",    value: SHARED_PARAMS_2.outcomeDuration,    color: "slate" },
            { label: "Acq trials",          value: String(SHARED_PARAMS_2.acquisitionTrials), color: "violet" },
            { label: "Test trials",         value: String(SHARED_PARAMS_2.testTrials), color: "violet" },
            { label: "Practice trials",     value: String(SHARED_PARAMS_2.practiceTrials), color: "slate" },
            { label: "Catch / acq",         value: String(SHARED_PARAMS_2.catchTrialsPerAcq), color: "amber" },
            { label: "Test congruency",     value: SHARED_PARAMS_2.testCongruency,     color: "emerald" },
            { label: "RT collected",        value: "Yes — space_RT / space_rt",        color: "emerald" },
            { label: "Acq CSV",             value: SHARED_PARAMS_2.acqCSV,             color: "slate" },
            { label: "Test CSV",            value: SHARED_PARAMS_2.testCSV,            color: "slate" },
            { label: "PsychoPy",            value: SHARED_PARAMS_2.psychopyVersion,    color: "slate" },
          ].map((p) => (
            <div key={p.label}
              className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">{p.label}</p>
              <p className="text-xs font-mono text-slate-200 leading-snug">{p.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6-block structure ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-base font-semibold text-white mb-4">Exp 2 Block Structure (6 blocks)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BLOCK_STRUCTURE_2.map((b, i) => (
            <div key={b.code}
              className={`rounded-xl border p-4 space-y-2 ${condBg[b.script]}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${condColor[b.script]}`}>{b.code}</span>
                <span className="text-[10px] text-slate-500 font-mono">Block {i + 1}</span>
              </div>
              <p className="text-xs text-slate-300">{b.condition}</p>
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${timingBadge(b.acq as "Fixed" | "Random")}`}>
                  Acq: {b.acq}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${timingBadge(b.test as "Fixed" | "Random")}`}>
                  Test: {b.test}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cross-condition comparison table ───────────────────────────────── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-base font-semibold text-white mb-4">Condition Comparison</h2>
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 font-semibold w-40">Feature</th>
                <th className={`py-3 px-4 text-center font-bold ${condColor.IC}`}>IC</th>
                <th className={`py-3 px-4 text-center font-bold ${condColor.TC}`}>TC</th>
                <th className={`py-3 px-4 text-center font-bold ${condColor.IP}`}>IP</th>
              </tr>
            </thead>
            <tbody>
              {comparisonTable2.map((row, i) => (
                <tr key={row.feature}
                  className={`border-b border-slate-800/50 ${i % 2 === 0 ? "bg-slate-900/30" : ""}`}>
                  <td className="py-2.5 px-4 text-slate-400 font-medium">{row.feature}</td>
                  <td className="py-2.5 px-4 text-center text-slate-300">{row.IC}</td>
                  <td className="py-2.5 px-4 text-center text-slate-300">{row.TC}</td>
                  <td className="py-2.5 px-4 text-center text-slate-300">{row.IP}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-4">
        {(["IC", "TC", "IP"] as const).map((c) => {
          const labels: Record<string, string> = {
            IC: "Identity Control",
            TC: "Temporal Control",
            IP: "Identity Prediction",
          };
          return (
            <div key={c} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${condBg[c]}`}>
              <span className={`text-xs font-bold ${condColor[c]}`}>{c}</span>
              <span className="text-xs text-slate-400">{labels[c]}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10">
          <span className="text-xs font-bold text-amber-300">Exp 3</span>
          <span className="text-xs text-slate-400">50/50 → 80/20 congruency only</span>
        </div>
      </div>

    </div>
  );
}
