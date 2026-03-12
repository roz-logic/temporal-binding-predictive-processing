import { conditionTable, analysisMatrix } from "../data/analysisData";

const typeColors: Record<string, string> = {
  IC: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  TC: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  IP: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
};

const analysisColors = [
  "border-violet-500/50 text-violet-300",
  "border-sky-500/50 text-sky-300",
  "border-emerald-500/50 text-emerald-300",
  "border-amber-500/50 text-amber-300",
];

export function DesignOverview() {
  return (
    <section id="overview" className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Experiment 1 — Design Overview</h2>
        <p className="text-slate-400 text-sm">
          N = 10 · DV: RATIO (reproduced duration ÷ target duration) ·{" "}
          <span className="text-slate-300">Fixed time = 550 ms · Varied time = 0–1100 ms</span>
        </p>
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
      </div>

      {/* Condition table */}
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 border-b border-slate-700">
              <th className="text-left px-4 py-3 text-slate-300 font-semibold">Condition</th>
              <th className="text-left px-4 py-3 text-slate-300 font-semibold">Type</th>
              <th className="text-left px-4 py-3 text-slate-300 font-semibold">Acq. Timing</th>
              <th className="text-left px-4 py-3 text-slate-300 font-semibold">Test Timing</th>
            </tr>
          </thead>
          <tbody>
            {conditionTable.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-slate-800 ${i % 2 === 0 ? "bg-slate-900/50" : "bg-slate-900"}`}
              >
                <td className="px-4 py-2.5 font-mono text-slate-200">{row.label}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${typeColors[row.type]}`}>
                    {row.type}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-300 capitalize">{row.acq}</td>
                <td className="px-4 py-2.5 text-slate-300 capitalize">{row.test}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Analysis matrix */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Analysis Subsets</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {analysisMatrix.map((a, i) => (
            <div
              key={a.analysis}
              className={`rounded-xl border bg-slate-900 p-4 ${analysisColors[i]}`}
            >
              <p className={`font-semibold text-sm mb-2 ${analysisColors[i].split(" ")[1]}`}>
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

      {/* Timing info box */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Participants", value: "n = 10", sub: "Full random design" },
          { label: "Fixed Duration", value: "550 ms", sub: "Acquisition or test" },
          { label: "Variable Duration", value: "0–1100 ms", sub: "Uniform draw" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
