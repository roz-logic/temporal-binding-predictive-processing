import { wranglingCode, librariesCode, contrastRationale } from "../data/analysisData";
import { CodeBlock } from "./CodeBlock";

export function WranglingSection() {
  return (
    <section id="wrangling" className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Data Wrangling & Setup</h2>
        <p className="text-slate-400 text-sm">
          Libraries, unit conversion, condition labelling, derived DVs, subset creation, and contrast coding.
        </p>
      </div>

      {/* Libraries */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-slate-200">Required packages</h3>
        <CodeBlock code={librariesCode} label="libraries.R" />
      </div>

      {/* Wrangling pipeline */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-slate-200">Full wrangling pipeline</h3>
        <CodeBlock code={wranglingCode} label="wrangling.R" />
      </div>

      {/* Contrast rationale */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-3">
        <h3 className="text-base font-semibold text-white">{contrastRationale.heading}</h3>
        <ul className="space-y-2">
          {contrastRationale.body.map((line, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-300">
              <span className="mt-0.5 text-violet-400 shrink-0">▸</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-slate-700 pt-3 text-xs text-slate-500">
          Reference: Brehm & Alday (2022) — <em>Contrast coding is often overlooked in psycholinguistics: Theoretical and empirical considerations</em>
        </div>
      </div>
    </section>
  );
}
