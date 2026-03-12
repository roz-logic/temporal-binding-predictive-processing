import { useState } from "react";
import type { AnalysisBlock } from "../data/analysisData";
import { CodeBlock } from "./CodeBlock";

const colorMap: Record<string, { border: string; badge: string; accent: string; step: string; sig: string }> = {
  violet: {
    border: "border-violet-500/40",
    badge: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    accent: "text-violet-300",
    step: "bg-violet-500/10 border-violet-500/30",
    sig: "bg-emerald-500/10 text-emerald-300",
  },
  sky: {
    border: "border-sky-500/40",
    badge: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    accent: "text-sky-300",
    step: "bg-sky-500/10 border-sky-500/30",
    sig: "bg-emerald-500/10 text-emerald-300",
  },
  emerald: {
    border: "border-emerald-500/40",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    accent: "text-emerald-300",
    step: "bg-emerald-500/10 border-emerald-500/30",
    sig: "bg-emerald-500/10 text-emerald-300",
  },
  amber: {
    border: "border-amber-500/40",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accent: "text-amber-300",
    step: "bg-amber-500/10 border-amber-500/30",
    sig: "bg-emerald-500/10 text-emerald-300",
  },
  rose: {
    border: "border-rose-500/40",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    accent: "text-rose-300",
    step: "bg-rose-500/10 border-rose-500/30",
    sig: "bg-emerald-500/10 text-emerald-300",
  },
  teal: {
    border: "border-teal-500/40",
    badge: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    accent: "text-teal-300",
    step: "bg-teal-500/10 border-teal-500/30",
    sig: "bg-emerald-500/10 text-emerald-300",
  },
};

function resultPill(result: string) {
  if (result.startsWith("✅")) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
        {result}
      </span>
    );
  }
  if (result.startsWith("❌")) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
        {result}
      </span>
    );
  }
  if (result.startsWith("⚠️")) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
        {result}
      </span>
    );
  }
  return <span className="text-xs text-slate-400">{result}</span>;
}

interface Props {
  block: AnalysisBlock;
}

export function AnalysisSection({ block }: Props) {
  const [activeSnippet, setActiveSnippet] = useState(0);
  const c = colorMap[block.color] ?? colorMap.violet;

  return (
    <section id={block.id} className="space-y-7">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3">
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${c.badge}`}>
          {block.badge}
        </span>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white leading-tight">{block.title}</h2>
          <p className={`text-sm mt-0.5 ${c.accent}`}>{block.subtitle}</p>
        </div>
      </div>

      <p className="text-slate-300 text-sm leading-relaxed">{block.description}</p>

      {/* Meta grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Design", value: block.design },
          { label: "DV", value: block.dv },
          { label: "Random structure", value: block.randomStructure },
          { label: "Contrasts", value: block.contrastCoding },
        ].map(({ label, value }) => (
          <div key={label} className={`rounded-xl border bg-slate-900 p-3 ${c.border}`}>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xs text-slate-200 font-mono leading-relaxed">{value}</p>
          </div>
        ))}
      </div>

      {/* Selection steps */}
      <div className="grid gap-4 md:grid-cols-2">
        {block.steps.map((step) => (
          <div key={step.heading} className={`rounded-xl border p-4 space-y-3 ${c.step}`}>
            <h3 className="text-sm font-semibold text-slate-200">{step.heading}</h3>
            <div className="space-y-2">
              {step.items.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-3">
                  <span className="text-xs text-slate-300 font-mono leading-relaxed flex-1">
                    {item.label}
                  </span>
                  {resultPill(item.result)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Winning model */}
      <div className="rounded-xl border border-slate-600 bg-slate-800/50 p-4">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Winning model</p>
        <code className={`text-sm font-mono ${c.accent}`}>{block.winningModel}</code>
      </div>

      {/* Code snippets — tabbed */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {block.snippets.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveSnippet(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                activeSnippet === i
                  ? `${c.badge} border-opacity-100`
                  : "text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-500"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <CodeBlock
          code={block.snippets[activeSnippet].code}
          label={block.snippets[activeSnippet].label}
          note={block.snippets[activeSnippet].note}
        />
      </div>

      {/* Notes */}
      {block.notes.length > 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Analyst notes
          </p>
          <ul className="space-y-1.5">
            {block.notes.map((n, i) => (
              <li key={i} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
                <span className={`mt-0.5 shrink-0 ${c.accent}`}>›</span>
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* divider */}
      <div className="border-t border-slate-800" />
    </section>
  );
}
