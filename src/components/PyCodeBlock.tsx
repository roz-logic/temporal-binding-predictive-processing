import { useState } from "react";

interface PyCodeBlockProps {
  code: string;
  label?: string;
  note?: string;
  lang?: "python" | "r";
}

function highlightPython(code: string): string {
  const keywords = [
    "def","return","if","else","elif","for","while","in","not","and","or","True","False","None",
    "import","from","as","class","with","pass","break","continue","raise","try","except","finally",
  ];
  const psychopyFns = [
    "visual","core","data","event","logging","clock","keyboard","gui","sound","colors",
    "Window","Clock","CountdownTimer","TrialHandler","ExperimentHandler","LogFile",
    "ShapeStim","Polygon","TextStim","Keyboard","DlgFromDict","importConditions",
    "addLoop","addData","nextEntry","saveAsWideText","saveAsPickle","abort","quit",
    "getTime","reset","wait","flip","getKeys","play","stop","setVolume","setAutoDraw",
    "setFillColor","setLineColor","getFutureFlipTime","timeOnFlip","callOnFlip",
    "getActualFrameRate","mouseVisible","clearEvents",
    "NOT_STARTED","STARTED","FINISHED","FOREVER","PRESSED","RELEASED",
  ];

  let h = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Triple-quoted strings / docstrings
  h = h.replace(/\"\"\"([\s\S]*?)\"\"\"/g, '<span class="text-slate-400 italic">"""$1"""</span>');

  // Regular strings
  h = h.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '<span class="text-amber-300">\'$1\'</span>');
  h = h.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="text-amber-300">"$1"</span>');

  // Comments
  h = h.replace(/(#[^\n]*)/g, '<span class="text-slate-500 italic">$1</span>');

  // Keywords
  keywords.forEach((kw) => {
    h = h.replace(
      new RegExp(`\\b(${kw})\\b`, "g"),
      '<span class="text-sky-300 font-semibold">$1</span>'
    );
  });

  // PsychoPy identifiers
  psychopyFns.forEach((fn) => {
    h = h.replace(
      new RegExp(`\\b(${fn})\\b`, "g"),
      '<span class="text-violet-300">$1</span>'
    );
  });

  // Numbers
  h = h.replace(/\b(\d+\.?\d*)\b/g, '<span class="text-emerald-300">$1</span>');

  // Arrows / symbols
  h = h.replace(/✅/g, '<span class="text-emerald-400">✅</span>');
  h = h.replace(/❌/g, '<span class="text-rose-400">❌</span>');
  h = h.replace(/⚠️/g, '<span class="text-amber-400">⚠️</span>');

  return h;
}

export function PyCodeBlock({ code, label, note, lang = "python" }: PyCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 shadow-lg">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
        </div>
        <div className="flex items-center gap-2">
          {label && (
            <span className="text-xs text-slate-400 font-mono truncate max-w-xs">{label}</span>
          )}
          <span className="text-xs text-slate-600 font-mono">.{lang === "python" ? "py" : "R"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-700"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      {/* Code */}
      <pre className="bg-slate-900 px-5 py-4 text-sm font-mono leading-relaxed overflow-x-auto text-slate-200">
        <code dangerouslySetInnerHTML={{ __html: highlightPython(code) }} />
      </pre>

      {/* Note */}
      {note && (
        <div className="bg-slate-800/60 border-t border-slate-700 px-4 py-2.5 text-xs text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-300">Note: </span>{note}
        </div>
      )}
    </div>
  );
}
