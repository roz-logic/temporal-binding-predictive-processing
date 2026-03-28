interface StatBadgeProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}

export default function StatBadge({ label, value, sub, highlight }: StatBadgeProps) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-center ${
        highlight
          ? "border-violet-300 bg-violet-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <p className="text-xs font-medium text-slate-500 mb-0.5">{label}</p>
      <p
        className={`text-base font-bold font-mono ${
          highlight ? "text-violet-700" : "text-slate-800"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}
