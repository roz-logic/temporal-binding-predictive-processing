interface SectionHeaderProps {
  number: string;
  title: string;
  subtitle?: string;
  color?: "violet" | "blue" | "emerald" | "amber";
}

const colorMap = {
  violet: "from-violet-600 to-indigo-600 shadow-violet-200",
  blue: "from-blue-600 to-cyan-600 shadow-blue-200",
  emerald: "from-emerald-600 to-teal-600 shadow-emerald-200",
  amber: "from-amber-500 to-orange-500 shadow-amber-200",
};

export default function SectionHeader({
  number,
  title,
  subtitle,
  color = "violet",
}: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div
        className={`flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colorMap[color]} shadow-md`}
      >
        <span className="text-white font-bold text-sm">{number}</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h2>
        {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
