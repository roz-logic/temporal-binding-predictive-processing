interface NavItem {
  id: string;
  label: string;
  sub?: string;
  color: string;
  icon?: string;
}

const navItems: NavItem[] = [
  { id: "comparison", label: "Condition Comparison",    color: "text-slate-300",   icon: "⊞" },
  { id: "IC",  label: "Identity Control",         sub: "IC · keypress + mapping",        color: "text-violet-400",  icon: "IC" },
  { id: "TC",  label: "Temporal Control",         sub: "TC · keypress, no mapping",      color: "text-amber-400",   icon: "TC" },
  { id: "IP",  label: "Identity Prediction",      sub: "IP · tone, no action",           color: "text-emerald-400", icon: "IP" },
];

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
}

const iconBg: Record<string, string> = {
  "⊞":  "bg-slate-700 text-slate-300",
  "IC": "bg-violet-500/30 text-violet-300",
  "TC": "bg-amber-500/30 text-amber-300",
  "IP": "bg-emerald-500/30 text-emerald-300",
};

export function DesignSidebar({ active, onNavigate }: SidebarProps) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 ${
            active === item.id
              ? "bg-slate-700/80 ring-1 ring-slate-600"
              : "hover:bg-slate-800"
          }`}
        >
          <span className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
            iconBg[item.icon ?? "⊞"] ?? "bg-slate-700 text-slate-300"
          }`}>
            {item.icon}
          </span>
          <div>
            <p className={`text-sm font-medium ${item.color}`}>{item.label}</p>
            {item.sub && (
              <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
            )}
          </div>
        </button>
      ))}
    </nav>
  );
}
