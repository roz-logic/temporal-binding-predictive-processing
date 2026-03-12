import { useState } from "react";
import {
  libraries2Code,
  wrangling2RatioCode,
  wrangling2RTCode,
  contrastRationale2,
} from "../data/analysis2Data";
import { CodeBlock } from "./CodeBlock";

const tabs = [
  { id: "libraries",  label: "Libraries" },
  { id: "ratio",      label: "RATIO wrangling" },
  { id: "rt",         label: "RT wrangling" },
];

export function Lmm2WranglingSection() {
  const [active, setActive] = useState("libraries");

  return (
    <section id="lmm2-wrangling" className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Data Wrangling & Setup</h2>
        <p className="text-slate-400 text-sm">
          Libraries, RT exclusion, unit conversion, condition labelling, derived DVs,
          subset creation, and contrast coding.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              active === t.id
                ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                : "text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === "libraries" && (
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-slate-200">Required packages</h3>
          <CodeBlock code={libraries2Code} label="libraries.R" />
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200">
            <strong>New in Exp 2:</strong> <code>writexl</code> added for exporting data frames to Excel.
            All other packages identical to Exp 1.
          </div>
        </div>
      )}

      {active === "ratio" && (
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-slate-200">RATIO analysis — full wrangling pipeline</h3>
          <CodeBlock code={wrangling2RatioCode} label="wrangling_ratio.R" />
        </div>
      )}

      {active === "rt" && (
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-slate-200">RT analysis — wrangling (IC + IP only)</h3>
          <CodeBlock code={wrangling2RTCode} label="wrangling_rt.R" />
        </div>
      )}

      {/* Contrast rationale */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-3">
        <h3 className="text-base font-semibold text-white">{contrastRationale2.heading}</h3>
        <ul className="space-y-2">
          {contrastRationale2.body.map((line, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-300">
              <span className="mt-0.5 text-violet-400 shrink-0">▸</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-slate-700 pt-3 text-xs text-slate-500">
          Reference: Brehm & Alday (2022) · Bates et al. (2015) · Matuschek et al. (2017)
        </div>
      </div>

      {/* RT note */}
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-2">
        <p className="text-sm font-semibold text-rose-300">RT column naming — watch for merge issues</p>
        <div className="overflow-x-auto">
          <table className="text-xs w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 pr-6 text-slate-400">Script</th>
                <th className="text-left py-2 pr-6 text-slate-400">CSV column</th>
                <th className="text-left py-2 text-slate-400">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="py-1.5 pr-6 font-mono text-violet-300">IC (motor)</td>
                <td className="py-1.5 pr-6 font-mono text-slate-200">space_RT</td>
                <td className="py-1.5 text-slate-400">capital RT</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-6 font-mono text-amber-300">TC (control)</td>
                <td className="py-1.5 pr-6 font-mono text-slate-200">space_RT</td>
                <td className="py-1.5 text-slate-400">capital RT — but TC excluded from RT analysis</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-6 font-mono text-emerald-300">IP (prediction)</td>
                <td className="py-1.5 pr-6 font-mono text-slate-200">space_rt</td>
                <td className="py-1.5 text-rose-300 font-semibold">lowercase rt — check before merging!</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
