interface NavItem {
  id: string;
  label: string;
  sub?: string;
  color: string;
}

const navItems: NavItem[] = [
  { id: "overview",  label: "Design Overview",        color: "text-slate-300" },
  { id: "wrangling", label: "Wrangling & Setup",       color: "text-slate-300" },
  { id: "mc",  label: "Motor vs. Control",        sub: "Analysis 1 · IC vs. TC",       color: "text-violet-400" },
  { id: "cp",  label: "Control vs. Prediction",   sub: "Analysis 2 · TC vs. IP",       color: "text-sky-400" },
  { id: "mvp", label: "Motor vs. Prediction",     sub: "Analysis 3 · IC vs. IP",       color: "text-emerald-400" },
  { id: "tc",  label: "Temporal Control",         sub: "Analysis 4 · acq × test",      color: "text-amber-400" },
];

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group ${
            active === item.id
              ? "bg-slate-700/80 ring-1 ring-slate-600"
              : "hover:bg-slate-800"
          }`}
        >
          <p className={`text-sm font-medium ${item.color}`}>{item.label}</p>
          {item.sub && (
            <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
          )}
        </button>
      ))}
    </nav>
  );
}
