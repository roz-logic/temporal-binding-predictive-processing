const experiments = [
  {
    id: "exp1",
    number: "1a & 1b",
    title: "Identity Control vs Prediction",
    color: "violet",
    n: "N = 10",
    validity: "Uncontrolled",
    dv: "Ratio / Log Ratio (1b)",
    key: "Congruency & temporal prediction drive binding",
  },
  {
    id: "exp2",
    number: "2a & 2b",
    title: "Controlled 50/50 Validity + Catch Trials",
    color: "blue",
    n: "N = 41",
    validity: "50/50%",
    dv: "Ratio / Log Ratio (2b)",
    key: "Action + causal inference is the primary driver",
  },
  {
    id: "exp3",
    number: "3a & 3b",
    title: "80/20% Validity Extension",
    color: "emerald",
    n: "N = 41",
    validity: "80/20%",
    dv: "Ratio / Log Ratio (3b) / Ratio (IP vs TC)",
    key: "Binding confirmed; context-dependent interval learning",
  },
];

const colorMap: Record<string, string> = {
  violet: "border-violet-200 bg-violet-50 hover:border-violet-400",
  blue: "border-blue-200 bg-blue-50 hover:border-blue-400",
  emerald: "border-emerald-200 bg-emerald-50 hover:border-emerald-400",
};
const badgeMap: Record<string, string> = {
  violet: "bg-violet-100 text-violet-700",
  blue: "bg-blue-100 text-blue-700",
  emerald: "bg-emerald-100 text-emerald-700",
};
const numMap: Record<string, string> = {
  violet: "from-violet-600 to-indigo-600",
  blue: "from-blue-600 to-cyan-600",
  emerald: "from-emerald-600 to-teal-600",
};

export default function OverviewCards() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Experiment Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {experiments.map((exp) => (
          <a
            key={exp.id}
            href={`#${exp.id}`}
            className={`rounded-2xl border-2 p-5 transition-all cursor-pointer no-underline ${colorMap[exp.color]}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${numMap[exp.color]} shadow text-white font-bold text-xs`}
              >
                {exp.number}
              </div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">{exp.title}</h3>
            </div>
            <div className="space-y-1.5 text-sm text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-500">Participants</span>
                <span className={`font-medium rounded-full px-2 py-0.5 text-xs ${badgeMap[exp.color]}`}>{exp.n}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Validity</span>
                <span className="font-medium">{exp.validity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DV</span>
                <span className="font-medium text-right">{exp.dv}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500 border-t border-slate-200 pt-3">{exp.key}</p>
          </a>
        ))}
      </div>

      {/* Condition legend */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="font-semibold text-slate-800 mb-3 text-sm">Condition Types</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          {[
            {
              code: "IC",
              full: "Identity Control",
              desc: "Action + valid outcome association (active [+]). Participants' keypresses produce specific outcomes learned in acquisition.",
            },
            {
              code: "TC",
              full: "Temporal Control",
              desc: "Action without valid outcome association (active [−]). Action present but outcome mapping is random.",
            },
            {
              code: "IP",
              full: "Identity Prediction",
              desc: "No action; tone-based prediction (passive [+]). Participants observe tone-outcome associations without acting.",
            },
          ].map((c) => (
            <div key={c.code} className="rounded-xl bg-white border border-slate-200 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-bold text-violet-700">{c.code}</span>
                <span className="text-slate-700 font-medium">{c.full}</span>
              </div>
              <p className="text-xs text-slate-500">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
