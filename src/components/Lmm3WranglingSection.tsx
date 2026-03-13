import { useState } from "react";
import { CodeBlock } from "./CodeBlock";
import {
  libraries3Code,
  wrangling3RatioCode,
  wrangling3RTCode,
} from "../data/analysis3Data";

type Tab = "libs" | "ratio" | "rt";

export function Lmm3WranglingSection() {
  const [tab, setTab] = useState<Tab>("libs");

  const tabs: { id: Tab; label: string; badge?: string }[] = [
    { id: "libs",  label: "Libraries" },
    { id: "ratio", label: "RATIO Wrangling", badge: "5 analyses" },
    { id: "rt",    label: "RT Wrangling",    badge: "IC+IP only" },
  ];

  return (
    <section id="lmm3-wrangling" className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Wrangling & Setup — Experiment 3</h2>
        <p className="text-slate-400 text-sm">
          Data cleaning · RT exclusion (in code, not Excel) · SK missing trials · log_RATIO (mc/cp/tc) · RATIO (mvp/val)
        </p>
      </div>

      {/* Key flags */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            color: "rose",
            title: "RT exclusion in code",
            body: "Exp 2 did RT exclusion manually in Excel. Exp 3 uses rt_excluded() in R. This means the full raw CSV is loaded and cleaned here.",
          },
          {
            color: "amber",
            title: "DV varies by analysis",
            body: "log_RATIO for mc3, cp3, tc3 (cross-exp and TC blocks). RATIO for mvp3 and val3 (within-Exp 3a IC vs IP). Same logic as Exp 2: TC blocks need log-transform.",
          },
          {
            color: "teal",
            title: "80/20 congruency",
            body: "my_random(trialsLoop) > 0.8 in PsychoPy. ~80% valid, 20% invalid trials per participant. is_valid is unbalanced — sum coding is critical.",
          },
        ].map(({ color, title, body }) => (
          <div
            key={title}
            className={`rounded-xl border p-4 space-y-2 border-${color}-500/30 bg-${color}-500/5`}
          >
            <p className={`text-sm font-semibold text-${color}-300`}>{title}</p>
            <p className="text-xs text-slate-300 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      {/* Contrast & na.action notes */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-4">
        <h3 className="text-base font-semibold text-white">Contrast coding & na.action</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              label: "Sum contrasts (contr.sum)",
              body: "Used throughout. Centres predictors — intercept = grand mean. With 80/20 split, is_valid cells are unbalanced: sum coding prevents the imbalance biasing other estimates.",
            },
            {
              label: "na.action = na.exclude",
              body: "Critical in Exp 3. SK has 6 truly missing trials AND ~747 RT exclusions. na.exclude inserts NA residuals so resid(model) length = nrow(data), making residual-based trimming work correctly.",
            },
            {
              label: "Trial exclusion logic",
              body: "If space_RT is out of range (< 100 or > 2000 ms), the whole trial is excluded: is_valid, space_pressed_duration, and DIFFERENCE are all set to NA for that row.",
            },
            {
              label: "Trimming model choice",
              body: "Always trim using the FIXED-effects model residuals (e.g., m3, ma3), not the random-effects final model. This avoids circular shrinkage and matches what was done in Exp 1 and 2.",
            },
          ].map(({ label, body }) => (
            <div key={label} className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 space-y-1">
              <p className="text-xs font-semibold text-slate-200">{label}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Exp2 vs Exp3 comparison table */}
      <div className="rounded-xl border border-slate-700 overflow-hidden">
        <div className="bg-slate-800 px-4 py-2.5 border-b border-slate-700">
          <p className="text-sm font-semibold text-white">Exp 2 vs. Exp 3 — wrangling differences</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900">
                <th className="text-left px-4 py-2 text-slate-400">Topic</th>
                <th className="text-left px-4 py-2 text-violet-300">Experiment 2</th>
                <th className="text-left px-4 py-2 text-rose-300">Experiment 3</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["RT exclusion",        "Done in Excel pre-import",         "rt_excluded() in R"],
                ["RATIO DV",            "RATIO for IC/IP, log_RATIO for TC", "log_RATIO for mc/cp/tc · RATIO for mvp/val"],
                ["Test congruency",     "50/50 (my_random > 0.5)",          "80/20 (my_random > 0.8)"],
                ["# RATIO analyses",   "4",                                 "5 (+ validity split)"],
                ["Missing trials",      "~495 RT exclusions",               "~747 RT + 6 SK structural"],
                ["cond×is_valid RT",    "Not significant",                  "Significant ✅"],
                ["Three-way RT",        "Not significant",                  "Significant ✅"],
                ["select() columns",    "-X, -X.1 … -X.5, -LOG_RT",        "Only -RATIO, -ABS.ERROR, -Avg.und"],
              ].map(([topic, exp2, exp3], i) => (
                <tr key={topic} className={`border-b border-slate-800 ${i % 2 === 0 ? "bg-slate-900/50" : "bg-slate-900"}`}>
                  <td className="px-4 py-2 text-slate-300 font-semibold">{topic}</td>
                  <td className="px-4 py-2 text-slate-400 font-mono">{exp2}</td>
                  <td className="px-4 py-2 text-rose-300 font-mono">{exp3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code tabs */}
      <div className="rounded-xl border border-slate-700 overflow-hidden">
        <div className="flex border-b border-slate-700 bg-slate-900">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 transition-colors border-b-2 ${
                tab === t.id
                  ? "border-rose-400 text-rose-300 bg-slate-800"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.label}
              {t.badge && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-700 text-slate-400">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="p-4">
          {tab === "libs"  && <CodeBlock code={libraries3Code}      />}
          {tab === "ratio" && <CodeBlock code={wrangling3RatioCode} />}
          {tab === "rt"    && <CodeBlock code={wrangling3RTCode}    />}
        </div>
      </div>
    </section>
  );
}
