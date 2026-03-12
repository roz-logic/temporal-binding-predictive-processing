interface Props {
  active: string;
  onNavigate: (id: string) => void;
}

const navItems = [
  {
    id: "lmm3-overview",
    label: "Overview",
    icon: "📐",
    sub: "Design · 8 blocks · n=41",
  },
  {
    id: "lmm3-wrangling",
    label: "Wrangling & Setup",
    icon: "🔧",
    sub: "log_RATIO · RT in code · SK",
  },
  {
    id: "mc3",
    label: "IC vs. TC — log(RATIO)",
    icon: "🟣",
    sub: "Analysis 1 · 2×2",
    badge: "RATIO",
    badgeColor: "bg-violet-500/20 text-violet-300",
  },
  {
    id: "cp3",
    label: "TC vs. IP — log(RATIO)",
    icon: "🔵",
    sub: "Analysis 2 · 2×2",
    badge: "RATIO",
    badgeColor: "bg-sky-500/20 text-sky-300",
  },
  {
    id: "mvp3",
    label: "IC vs. IP — log(RATIO)",
    icon: "🟢",
    sub: "Analysis 3 · 2×2×2",
    badge: "RATIO",
    badgeColor: "bg-emerald-500/20 text-emerald-300",
  },
  {
    id: "tc3",
    label: "Temporal Control",
    icon: "🟡",
    sub: "Analysis 4 · log(RATIO)",
    badge: "RATIO",
    badgeColor: "bg-amber-500/20 text-amber-300",
  },
  {
    id: "val3",
    label: "Validity Split",
    icon: "🩵",
    sub: "Analysis 5 · NEW in Exp 3",
    badge: "NEW",
    badgeColor: "bg-teal-500/20 text-teal-300",
  },
  {
    id: "rt3",
    label: "IC vs. IP — log(RT)",
    icon: "🔴",
    sub: "RT · cond×validity sig!",
    badge: "RT",
    badgeColor: "bg-rose-500/20 text-rose-300",
  },
];

export function Lmm3Sidebar({ active, onNavigate }: Props) {
  return (
    <nav className="space-y-1">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">
        Exp 3 · LMM
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
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
            )}
          </div>
        </button>
      ))}

      {/* Key finding card */}
      <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 space-y-1.5 text-xs text-slate-500">
        <p className="text-rose-400 font-semibold">Exp 3 key findings</p>
        <p>• log_RATIO used for ALL analyses</p>
        <p>• is_valid not sig in RATIO</p>
        <p>• cond × is_valid SIG in RT ✅</p>
        <p>• Three-way SIG in RT ✅</p>
        <p>• 80/20 powers validity effects</p>
      </div>

      {/* SK reminder */}
      <div className="mt-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-1.5 text-xs text-slate-500">
        <p className="text-amber-400 font-semibold">⚠️ SK participant</p>
        <p>• 6 missing trials (2-Control-FR)</p>
        <p>• wait_duration_before_circle = NA</p>
        <p>• Use na.action = na.exclude!</p>
      </div>
    </nav>
  );
}
