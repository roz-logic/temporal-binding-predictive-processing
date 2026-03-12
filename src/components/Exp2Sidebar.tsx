interface Props {
  active: string;
  onNavigate: (id: string) => void;
}

const sections = [
  {
    id: "exp2-comparison",
    label: "Overview & Changes",
    icon: "📊",
    color: "text-slate-300",
  },
  {
    id: "IC2",
    label: "Identity Control (IC)",
    icon: "🟣",
    color: "text-violet-400",
    sub: ["get_color()", "catch trials", "space_RT"],
  },
  {
    id: "TC2",
    label: "Temporal Control (TC)",
    icon: "🟡",
    color: "text-amber-400",
    sub: ["my_random()", "catch trials", "space_RT"],
  },
  {
    id: "IP2",
    label: "Identity Prediction (IP)",
    icon: "🟢",
    color: "text-emerald-400",
    sub: ["PTB scheduling", "2.0s tone delay", "space_rt"],
  },
];

export function Exp2Sidebar({ active, onNavigate }: Props) {
  return (
    <nav className="space-y-1">
      <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-3 px-2">
        Experiment 2
      </p>
      {sections.map((s) => (
        <div key={s.id}>
          <button
            onClick={() => onNavigate(s.id)}
            className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              active === s.id
                ? `bg-slate-800 ${s.color}`
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <span className="text-sm">{s.icon}</span>
            <span className="truncate">{s.label}</span>
          </button>
          {s.sub && active === s.id && (
            <div className="ml-8 mt-1 space-y-0.5">
              {s.sub.map((sub) => (
                <p key={sub} className="text-[10px] text-slate-600 py-0.5">
                  • {sub}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="mt-4 pt-4 border-t border-slate-800/60">
        <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2 px-2">Exp 3 Note</p>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 space-y-1">
          <p className="text-[10px] text-amber-300/80 font-semibold">50/50 → 80/20</p>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Only the congruency threshold changes. All else identical to Exp 2.
          </p>
          <p className="text-[10px] font-mono text-amber-400/70">IC/TC: &gt; 0.8</p>
          <p className="text-[10px] font-mono text-amber-400/70">IP: &lt; 0.2</p>
        </div>
      </div>
    </nav>
  );
}
