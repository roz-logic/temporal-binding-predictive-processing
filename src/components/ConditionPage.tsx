import { useState } from "react";
import type { ConditionScript } from "../data/experimentData";
import { PyCodeBlock } from "./PyCodeBlock";
import { TrialTimeline } from "./TrialTimeline";
import { BlockSwitcher } from "./BlockSwitcher";

const colorMap: Record<string, {
  border: string; badge: string; accent: string; step: string;
  tabActive: string; pill: string; glow: string;
}> = {
  violet: {
    border:    "border-violet-500/40",
    badge:     "bg-violet-500/20 text-violet-300 border-violet-500/40",
    accent:    "text-violet-300",
    step:      "bg-violet-500/10 border-violet-500/30",
    tabActive: "bg-violet-500/20 text-violet-200 border-violet-500/50",
    pill:      "bg-violet-500/10 text-violet-300 border-violet-500/30",
    glow:      "shadow-violet-500/10",
  },
  amber: {
    border:    "border-amber-500/40",
    badge:     "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accent:    "text-amber-300",
    step:      "bg-amber-500/10 border-amber-500/30",
    tabActive: "bg-amber-500/20 text-amber-200 border-amber-500/50",
    pill:      "bg-amber-500/10 text-amber-300 border-amber-500/30",
    glow:      "shadow-amber-500/10",
  },
  emerald: {
    border:    "border-emerald-500/40",
    badge:     "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    accent:    "text-emerald-300",
    step:      "bg-emerald-500/10 border-emerald-500/30",
    tabActive: "bg-emerald-500/20 text-emerald-200 border-emerald-500/50",
    pill:      "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    glow:      "shadow-emerald-500/10",
  },
};

type Tab = "overview" | "timeline" | "blocks" | "data" | "code";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",  label: "Overview" },
  { id: "timeline",  label: "Trial Timeline" },
  { id: "blocks",    label: "Block Variants" },
  { id: "data",      label: "Data Columns" },
  { id: "code",      label: "Code Snippets" },
];

function Bool({ v }: { v: boolean }) {
  return v
    ? <span className="text-emerald-400 font-semibold">✅ Yes</span>
    : <span className="text-rose-400 font-semibold">❌ No</span>;
}

interface Props {
  cond: ConditionScript;
}

export function ConditionPage({ cond }: Props) {
  const [tab, setTab]     = useState<Tab>("overview");
  const [snippet, setSnippet] = useState(0);
  const [phase, setPhase] = useState<"practice" | "acquisition" | "test">("test");
  const c = colorMap[cond.color] ?? colorMap.violet;

  return (
    <section id={cond.id} className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className={`rounded-2xl border bg-slate-900 p-6 shadow-xl ${c.border} ${c.glow}`}>
        <div className="flex flex-wrap items-start gap-3 mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border font-mono ${c.badge}`}>
            {cond.id}
          </span>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white leading-tight">{cond.fullName}</h2>
            <p className={`text-sm mt-0.5 ${c.accent}`}>{cond.tagline}</p>
          </div>
        </div>

        {/* Characteristic pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { label: "Voluntary Action",    val: cond.hasAction },
            { label: "Identity Mapping",    val: cond.hasMapping },
            { label: "Temporal Control",    val: cond.hasTemporalControl },
          ].map(({ label, val }) => (
            <div key={label} className={`rounded-lg border px-3 py-1.5 text-xs flex items-center gap-2 ${c.pill}`}>
              <span className="text-slate-400">{label}:</span>
              <Bool v={val} />
            </div>
          ))}
          <div className={`rounded-lg border px-3 py-1.5 text-xs flex items-center gap-2 ${c.pill}`}>
            <span className="text-slate-400">First event:</span>
            <span className="text-white font-medium">{cond.firstEvent}</span>
          </div>
          {cond.mappingRule && (
            <div className={`rounded-lg border px-3 py-1.5 text-xs flex items-center gap-2 ${c.pill}`}>
              <span className="text-slate-400">Mapping:</span>
              <span className="text-white font-medium">{cond.mappingRule}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              tab === t.id
                ? c.tabActive
                : "text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview ────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Constants */}
          <div>
            <h3 className={`text-sm font-semibold mb-3 ${c.accent}`}>Timing Constants</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {cond.constants.map((ct) => (
                <div key={ct.name} className="rounded-xl border border-slate-700 bg-slate-900 p-3 flex items-start gap-3">
                  <code className="font-mono text-xs text-violet-300 bg-slate-800 px-2 py-0.5 rounded shrink-0">
                    {ct.name}
                  </code>
                  <div>
                    <p className="text-sm font-bold text-white">{ct.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{ct.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phases table */}
          <div>
            <h3 className={`text-sm font-semibold mb-3 ${c.accent}`}>Phase Summary</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {cond.phases.map((ph) => (
                <div key={ph.name} className={`rounded-xl border p-4 space-y-2 ${c.step}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-white">{ph.name}</p>
                    <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                      {ph.trials} trials
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-300">
                    <p><span className="text-slate-500">Timing:</span> {ph.timing}</p>
                    <p><span className="text-slate-500">Colour:</span> {ph.colourRule}</p>
                    <p><span className="text-slate-500">Reproduction:</span>{" "}
                      {ph.hasReproduction
                        ? <span className="text-emerald-400">✅ Yes (DV)</span>
                        : <span className="text-rose-400">❌ No</span>
                      }
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 border-t border-slate-700 pt-2 leading-relaxed">
                    {ph.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Timing functions */}
          <div>
            <h3 className={`text-sm font-semibold mb-3 ${c.accent}`}>Timing Functions</h3>
            <div className="space-y-3">
              {cond.timingFunctions.map((fn) => (
                <div key={fn.name} className="rounded-xl border border-slate-700 bg-slate-900 overflow-hidden">
                  <div className="flex items-center justify-between bg-slate-800 px-4 py-2">
                    <code className="font-mono text-xs text-violet-300">{fn.name}</code>
                    <span className="text-xs text-slate-500 italic">{fn.forVariant}</span>
                  </div>
                  <pre className="px-4 py-3 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
                    {fn.body}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* Key differences */}
          <div className={`rounded-xl border p-4 ${c.step}`}>
            <h3 className={`text-sm font-semibold mb-3 ${c.accent}`}>
              Key design notes — {cond.id}
            </h3>
            <ul className="space-y-1.5">
              {cond.keyDifferences.map((d, i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
                  <span className={`mt-0.5 shrink-0 ${c.accent}`}>›</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Tab: Trial Timeline ──────────────────────────────────────────── */}
      {tab === "timeline" && (
        <div className="space-y-5">
          <div className="flex gap-2 flex-wrap">
            {(["practice", "acquisition", "test"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPhase(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-colors ${
                  phase === p
                    ? c.tabActive
                    : "text-slate-400 border-slate-700 hover:text-slate-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 overflow-x-auto">
            <TrialTimeline conditionId={cond.id} phase={phase} />
          </div>
          <div className={`rounded-xl border p-4 text-xs text-slate-400 space-y-1 ${c.step}`}>
            <p className="text-slate-300 font-semibold text-xs">Reading the timeline</p>
            <p>• Each block = one event in the trial, left to right in chronological order.</p>
            <p>• Duration shown is the target/nominal value; actual values logged to CSV.</p>
            <p>• <span className="text-emerald-400">⎵ Space hold</span> = dependent variable (reproduced IEI).</p>
            {cond.id === "IP" && (
              <p>• Reproduction only accepted after the time gate: tone offset + IEI + circle display.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Block Variants ──────────────────────────────────────────── */}
      {tab === "blocks" && (
        <BlockSwitcher variants={cond.blockVariants} accentColor={cond.color} />
      )}

      {/* ── Tab: Data Columns ────────────────────────────────────────────── */}
      {tab === "data" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Columns written by <code className="font-mono text-slate-300">.addData()</code> calls — appears in the output CSV.
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700">
                  <th className="text-left px-4 py-3 text-slate-300 font-semibold">Column</th>
                  <th className="text-left px-4 py-3 text-slate-300 font-semibold">Phase</th>
                  <th className="text-left px-4 py-3 text-slate-300 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {cond.dataColumns.map((col, i) => (
                  <tr
                    key={col.col}
                    className={`border-b border-slate-800 ${i % 2 === 0 ? "bg-slate-900/50" : "bg-slate-900"}`}
                  >
                    <td className="px-4 py-2.5">
                      <code className="font-mono text-xs text-violet-300">{col.col}</code>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-slate-400">{col.phase}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-300">{col.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab: Code Snippets ───────────────────────────────────────────── */}
      {tab === "code" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {cond.snippets.map((s, i) => (
              <button
                key={i}
                onClick={() => setSnippet(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  snippet === i
                    ? c.tabActive
                    : "text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-500"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <PyCodeBlock
            code={cond.snippets[snippet].code}
            label={cond.snippets[snippet].label}
            note={cond.snippets[snippet].note}
          />
        </div>
      )}

      <div className="border-t border-slate-800" />
    </section>
  );
}
