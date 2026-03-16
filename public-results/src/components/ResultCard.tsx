import { ReactNode } from "react";

interface ResultCardProps {
  title: string;
  figureNum?: string;
  children: ReactNode;
  caption?: string;
}

export default function ResultCard({ title, figureNum, children, caption }: ResultCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
        {figureNum && (
          <span className="text-xs font-medium bg-slate-100 text-slate-500 rounded-full px-2.5 py-0.5">
            {figureNum}
          </span>
        )}
      </div>
      <div className="p-5">
        {children}
        {caption && (
          <p className="mt-3 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}
