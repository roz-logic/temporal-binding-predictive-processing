import { useState } from "react";

interface CodeBlockProps {
  code: string;
  label?: string;
  note?: string;
}

// Very lightweight syntax highlighter for R code
function highlight(code: string): string {
  const keywords = [
    "library","function","if","else","ifelse","for","while","return","TRUE","FALSE","NULL","NA",
    "lmer","glmer","mixed","anova","summary","filter","mutate","select","case_when",
    "contr.sum","lmerControl","update","as.factor","as.numeric","log","abs","scale","resid",
    "fitted","vif","acf","hist","plot","qqnorm","qqline","print","cat",
  ];
  // Escape HTML
  let h = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Strings
  h = h.replace(/"([^"]*?)"/g, '<span class="text-amber-300">"$1"</span>');

  // Comments
  h = h.replace(/(#[^\n]*)/g, '<span class="text-slate-500 italic">$1</span>');

  // Keywords (only outside already-replaced spans – rough but sufficient)
  keywords.forEach((kw) => {
    h = h.replace(
      new RegExp(`\\b(${kw})\\b`, "g"),
      '<span class="text-violet-300 font-semibold">$1</span>'
    );
  });

  // Numbers
  h = h.replace(/\b(\d+\.?\d*)\b/g, '<span class="text-emerald-300">$1</span>');

  // ✅ / ❌ result markers
  h = h.replace(/✅/g, '<span class="text-emerald-400">✅</span>');
  h = h.replace(/❌/g, '<span class="text-rose-400">❌</span>');
  h = h.replace(/⚠️/g, '<span class="text-amber-400">⚠️</span>');

  return h;
}

export function CodeBlock({ code, label, note }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 shadow-lg">
      {/* header bar */}
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
        </div>
        {label && (
          <span className="text-xs text-slate-400 font-mono truncate max-w-xs">{label}</span>
        )}
        <button
          onClick={handleCopy}
          className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-700"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      {/* code */}
      <pre className="bg-slate-900 px-5 py-4 text-sm font-mono leading-relaxed overflow-x-auto text-slate-200">
        <code dangerouslySetInnerHTML={{ __html: highlight(code) }} />
      </pre>

      {/* note */}
      {note && (
        <div className="bg-slate-800/60 border-t border-slate-700 px-4 py-2.5 text-xs text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-300">Note: </span>{note}
        </div>
      )}
    </div>
  );
}
