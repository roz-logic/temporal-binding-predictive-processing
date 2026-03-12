interface Props {
  active: string;
  onNavigate: (id: string) => void;
}

const navItems = [
  {
    id: "lmm2-overview",
    label: "Overview",
    icon: "📐",
    sub: "Design · blocks · n=41",
  },
  {
    id: "lmm2-wrangling",
    label: "Wrangling & Setup",
    icon: "🔧",
    sub: "RT exclusion · na.exclude",
  },
  {
    id: "mc2",
    label: "IC vs. TC — RATIO",
    icon: "🟣",
    sub: "Analysis 1 · 2×2",
    badge: "RATIO",
    badgeColor: "bg-violet-500/20 text-violet-300",
  },
  {
    id: "cp2",
    label: "TC vs. IP — RATIO",
    icon: "🔵",
    sub: "Analysis 2 · 2×2",
    badge: "RATIO",
    badgeColor: "bg-sky-500/20 text-sky-300",
  },
  {
    id: "mvp2",
    label: "IC vs. IP — RATIO",
    icon: "🟢",
    sub: "Analysis 3 · 2×2×2",
    badge: "RATIO",
    badgeColor: "bg-emerald-500/20 text-emerald-300",
  },
  {
    id: "tc2",
    label: "Temporal Control",
    icon: "🟡",
    sub: "Analysis 4 · log(RATIO)",
    badge: "RATIO",
    badgeColor: "bg-amber-500/20 text-amber-300",
  },
  {
    id: "rt2",
    label: "IC vs. IP — log(RT)",
    icon: "🔴",
    sub: "RT Analysis · NEW",
    badge: "RT",
    badgeColor: "bg-rose-500/20 text-rose-300",
  },
];

export function Lmm2Sidebar({ active, onNavigate }: Props) {
  return (
    <nav className="space-y-1">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">
        Exp 2 / 3 · LMM
      </p>

      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`w-full text-left px-3 py-2.5 rounded-xl transition-all group ${
            active === item.id
              ? "bg-slate-800 border border-slate-600"
              : "hover:bg-slate-900 border border-transparent"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-xs font-semibold truncate ${
                    active === item.id ? "text-white" : "text-slate-300 group-hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.sub}</p>
            </div>
            {active === item.id && (
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
            )}
          </div>
        </button>
      ))}

      {/* Exp3 reminder card */}
      <div className="mt-4 rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 space-y-1.5 text-xs text-slate-500">
        <p className="text-sky-400 font-semibold">Exp 3 reminder</p>
        <p>• Same script & analyses</p>
        <p>• Test congruency: 50/50 → 80/20</p>
        <p>• RT exclusion: code (not Excel)</p>
        <p>• my_random &gt; 0.8 (was &gt; 0.5)</p>
      </div>
    </nav>
  );
}
