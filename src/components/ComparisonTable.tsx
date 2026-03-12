import { comparisonTable, BLOCK_STRUCTURE, SHARED_PARAMS } from "../data/experimentData";

const condColors: Record<string, string> = {
  IC: "text-violet-300",
  TC: "text-amber-300",
  IP: "text-emerald-300",
};
const condBg: Record<string, string> = {
  IC: "bg-violet-500/20 border-violet-500/40",
  TC: "bg-amber-500/20 border-amber-500/40",
  IP: "bg-emerald-500/20 border-emerald-500/40",
};

function renderCell(val: string) {
  if (val.startsWith("✅")) return <span className="text-emerald-400">{val}</span>;
  if (val.startsWith("❌")) return <span className="text-rose-400">{val}</span>;
  return <span className="text-slate-300">{val}</span>;
}

export function ComparisonTable() {
  return (
    <section id="comparison" className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Condition Comparison</h2>
        <p className="text-slate-400 text-sm">
          IC vs. TC vs. IP — design features, block structure, and thesis results at a glance.
        </p>
      </div>

      {/* Feature comparison grid */}
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 border-b border-slate-700">
              <th className="text-left px-4 py-3 text-slate-400 font-semibold w-40">Feature</th>
              {["IC", "TC", "IP"].map((id) => (
                <th key={id} className="text-left px-4 py-3">
                  <span className={`font-mono font-bold ${condColors[id]}`}>{id}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonTable.map((row, i) => (
              <tr
                key={row.feature}
                className={`border-b border-slate-800 ${i % 2 === 0 ? "bg-slate-900/50" : "bg-slate-900"}`}
              >
                <td className="px-4 py-2.5 text-slate-400 font-medium text-xs">{row.feature}</td>
                <td className="px-4 py-2.5 text-xs">{renderCell(row.IC)}</td>
                <td className="px-4 py-2.5 text-xs">{renderCell(row.TC)}</td>
                <td className="px-4 py-2.5 text-xs">{renderCell(row.IP)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 8-block map */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Full 8-Block Structure</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {BLOCK_STRUCTURE.map((b) => (
            <div
              key={b.code}
              className={`rounded-xl border p-3 space-y-2 ${condBg[b.script]}`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-mono font-bold text-sm ${condColors[b.script]}`}>{b.code}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${condBg[b.script]} ${condColors[b.script]}`}>
                  {b.script}
                </span>
              </div>
              <p className="text-xs text-slate-300">{b.condition}</p>
              <div className="flex gap-2 text-[10px]">
                <span className={`px-1.5 py-0.5 rounded border ${
                  b.acq === "Fixed"
                    ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                    : "bg-orange-500/20 text-orange-300 border-orange-500/40"
                }`}>
                  Acq: {b.acq}
                </span>
                <span className={`px-1.5 py-0.5 rounded border ${
                  b.test === "Fixed"
                    ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                    : "bg-orange-500/20 text-orange-300 border-orange-500/40"
                }`}>
                  Test: {b.test}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shared parameters */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Shared Parameters (All Conditions)</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Fixed IEI",            value: SHARED_PARAMS.fixedIEI },
            { label: "Random IEI range",     value: SHARED_PARAMS.randomRange },
            { label: "Outcome display",      value: SHARED_PARAMS.outcomeDuration },
            { label: "Acquisition trials",   value: String(SHARED_PARAMS.acquisitionTrials) },
            { label: "Test trials",          value: String(SHARED_PARAMS.testTrials) },
            { label: "Practice trials",      value: String(SHARED_PARAMS.practiceTrials) },
            { label: "Reaction time",        value: "Not collected (added in Exp 2 & 3)" },
            { label: "Catch trials",         value: "Not included (added in Exp 2 & 3)" },
            { label: "PsychoPy version",     value: SHARED_PARAMS.psychopyVersion },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-slate-700 bg-slate-900 p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{label}</p>
              <p className="text-sm text-white font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800" />
    </section>
  );
}
