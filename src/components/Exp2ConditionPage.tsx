import { useState } from "react";
import { ConditionScript2 } from "../data/experiment2Data";
import { PyCodeBlock } from "./PyCodeBlock";

type Tab = "overview" | "helpers" | "phases" | "data" | "snippets";

const condAccent: Record<string, { ring: string; bg: string; text: string; badge: string }> = {
  IC: {
    ring:  "ring-violet-500/40",
    bg:    "bg-violet-500/10",
    text:  "text-violet-300",
    badge: "bg-violet-500/20 border-violet-500/30 text-violet-200",
  },
  TC: {
    ring:  "ring-amber-500/40",
    bg:    "bg-amber-500/10",
    text:  "text-amber-300",
    badge: "bg-amber-500/20 border-amber-500/30 text-amber-200",
  },
  IP: {
    ring:  "ring-emerald-500/40",
    bg:    "bg-emerald-500/10",
    text:  "text-emerald-300",
    badge: "bg-emerald-500/20 border-emerald-500/30 text-emerald-200",
  },
};

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",  label: "Overview" },
  { id: "helpers",   label: "Helper Functions" },
  { id: "phases",    label: "Trial Phases" },
  { id: "data",      label: "Data Columns" },
  { id: "snippets",  label: "Code Snippets" },
];

interface Props {
  cond: ConditionScript2;
}

export function Exp2ConditionPage({ cond }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const a = condAccent[cond.shortId];

  return (
    <div className={`rounded-2xl border border-slate-800 ring-1 ${a.ring} bg-slate-900/50 overflow-hidden`}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className={`${a.bg} border-b border-slate-800 px-6 py-5`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${a.badge}`}>
                {cond.shortId}
              </span>
              <span className="text-xs text-slate-500">Experiment 2 · {cond.currentBlock}</span>
            </div>
            <h2 className={`text-xl font-bold ${a.text}`}>{cond.fullName}</h2>
            <p className="text-xs text-slate-400 mt-1">{cond.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold border ${
              cond.hasAction ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                            : "bg-rose-500/20 border-rose-500/30 text-rose-300"}`}>
              {cond.hasAction ? "✅ Action" : "❌ No Action"}
            </span>
            <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold border ${
              cond.hasMapping ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                             : "bg-rose-500/20 border-rose-500/30 text-rose-300"}`}>
              {cond.hasMapping ? "✅ Identity Mapping" : "❌ No Mapping"}
            </span>
            <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold border ${
              cond.hasTemporalControl ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                                      : "bg-rose-500/20 border-rose-500/30 text-rose-300"}`}>
              {cond.hasTemporalControl ? "✅ Temporal Control" : "❌ Passive"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-800 px-6 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id
                ? `border-current ${a.text}`
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────── */}
      <div className="p-6 space-y-6">

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-6">

            {/* New in Exp2 */}
            <div>
              <h3 className={`text-sm font-semibold ${a.text} mb-3`}>New in Experiment 2</h3>
              <ul className="space-y-1.5">
                {cond.newInExp2.map((item, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-300">
                    <span className={`mt-0.5 shrink-0 ${a.text}`}>→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Constants */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Timing Constants</h3>
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900">
                      <th className="text-left py-2 px-4 text-slate-400">Name</th>
                      <th className="text-left py-2 px-4 text-slate-400">Value</th>
                      <th className="text-left py-2 px-4 text-slate-400">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cond.constants.map((c, i) => (
                      <tr key={c.name}
                        className={`border-b border-slate-800/50 ${i % 2 === 0 ? "bg-slate-950/40" : ""}`}>
                        <td className="py-2 px-4 font-mono text-violet-300">{c.name}</td>
                        <td className="py-2 px-4 font-mono text-amber-300">{c.value}</td>
                        <td className="py-2 px-4 text-slate-400">{c.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key differences */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Key Design Notes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cond.keyDifferences.map((d, i) => (
                  <div key={i} className="flex gap-2 rounded-lg bg-slate-950/60 border border-slate-800 p-3 text-xs text-slate-300">
                    <span className={`shrink-0 font-bold ${a.text}`}>{i + 1}.</span>
                    {d}
                  </div>
                ))}
              </div>
            </div>

            {/* Block variants */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Block Variants</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cond.blockVariants.map((bv) => (
                  <div key={bv.code}
                    className={`rounded-xl border p-4 space-y-2 ${
                      bv.isCurrent
                        ? `${a.bg} border-current ring-1 ${a.ring}`
                        : "border-slate-800 bg-slate-950/40"
                    }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${bv.isCurrent ? a.text : "text-slate-300"}`}>
                        {bv.code}
                      </span>
                      {bv.isCurrent && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${a.badge}`}>
                          current
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        bv.acqTiming === "fixed"
                          ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}>Acq: {bv.acqTiming}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        bv.testTiming === "fixed"
                          ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}>Test: {bv.testTiming}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{bv.switchInstruction}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HELPER FUNCTIONS */}
        {tab === "helpers" && (
          <div className="space-y-6">
            {cond.helperFunctions.map((fn) => (
              <div key={fn.name} className="space-y-2">
                <div className="flex flex-wrap items-baseline gap-2">
                  <code className={`text-sm font-mono font-bold ${a.text}`}>{fn.name}</code>
                </div>
                <p className="text-xs text-slate-400">{fn.purpose}</p>
                <PyCodeBlock code={fn.body} />
              </div>
            ))}
          </div>
        )}

        {/* TRIAL PHASES */}
        {tab === "phases" && (
          <div className="space-y-4">
            {cond.phases.map((ph) => (
              <div key={ph.name}
                className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/60 border-b border-slate-800">
                  <span className={`text-sm font-bold ${a.text}`}>{ph.name}</span>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {ph.trials} trials
                    </span>
                    {ph.hasCatchTrials && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        catch trials
                      </span>
                    )}
                    {ph.hasRT && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        RT collected
                      </span>
                    )}
                    {ph.hasReproduction && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        reproduction (DV)
                      </span>
                    )}
                  </div>
                </div>
                <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-slate-500 mb-1">Timing (IEI)</p>
                    <p className="text-slate-200">{ph.timing}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Colour rule</p>
                    <p className="text-slate-200">{ph.colourRule}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Notes</p>
                    <p className="text-slate-300 leading-relaxed">{ph.notes}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DATA COLUMNS */}
        {tab === "data" && (
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900">
                  <th className="text-left py-2.5 px-4 text-slate-400">Column</th>
                  <th className="text-left py-2.5 px-4 text-slate-400">Phase</th>
                  <th className="text-left py-2.5 px-4 text-slate-400">Description</th>
                </tr>
              </thead>
              <tbody>
                {cond.dataColumns.map((dc, i) => (
                  <tr key={dc.col}
                    className={`border-b border-slate-800/50 ${i % 2 === 0 ? "bg-slate-950/40" : ""}`}>
                    <td className="py-2.5 px-4 font-mono text-emerald-300">{dc.col}</td>
                    <td className="py-2.5 px-4 text-slate-400">{dc.phase}</td>
                    <td className="py-2.5 px-4 text-slate-300">{dc.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CODE SNIPPETS */}
        {tab === "snippets" && (
          <div className="space-y-8">
            {cond.snippets.map((s) => (
              <div key={s.label} className="space-y-2">
                <h3 className={`text-sm font-semibold ${a.text}`}>{s.label}</h3>
                <PyCodeBlock code={s.code} />
                {s.note && (
                  <p className="text-xs text-slate-400 italic leading-relaxed border-l-2 border-slate-700 pl-3">
                    {s.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
