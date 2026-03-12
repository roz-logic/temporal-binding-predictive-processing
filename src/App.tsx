import { useState, useEffect } from "react";

// ── Exp1 LMM Reference imports ────────────────────────────────────────────────
import { Sidebar }          from "./components/Sidebar";
import { DesignOverview }   from "./components/DesignOverview";
import { WranglingSection } from "./components/WranglingSection";
import { AnalysisSection }  from "./components/AnalysisSection";
import { analyses }         from "./data/analysisData";

// ── Exp2 LMM Reference imports ────────────────────────────────────────────────
import { Lmm2Sidebar }          from "./components/Lmm2Sidebar";
import { Lmm2Overview }         from "./components/Lmm2Overview";
import { Lmm2WranglingSection } from "./components/Lmm2WranglingSection";
import { analyses2 }            from "./data/analysis2Data";

// ── Exp3 LMM Reference imports ────────────────────────────────────────────────
import { Lmm3Sidebar }          from "./components/Lmm3Sidebar";
import { Lmm3Overview }         from "./components/Lmm3Overview";
import { Lmm3WranglingSection } from "./components/Lmm3WranglingSection";
import { analyses3 }            from "./data/analysis3Data";

// ── Exp1 Design Reference imports ────────────────────────────────────────────
import { DesignSidebar }    from "./components/DesignSidebar";
import { ComparisonTable }  from "./components/ComparisonTable";
import { ConditionPage }    from "./components/ConditionPage";
import { conditions }       from "./data/experimentData";

// ── Exp2 Design Reference imports ────────────────────────────────────────────
import { Exp2Sidebar }         from "./components/Exp2Sidebar";
import { Exp2ComparisonTable } from "./components/Exp2ComparisonTable";
import { Exp2ConditionPage }   from "./components/Exp2ConditionPage";
import { conditions2 }         from "./data/experiment2Data";

// ─────────────────────────────────────────────────────────────────────────────
const LMM_SECTIONS     = ["overview",      "wrangling",      "mc",  "cp",  "mvp",  "tc"];
const LMM2_SECTIONS    = ["lmm2-overview", "lmm2-wrangling", "mc2", "cp2", "mvp2", "tc2", "rt2"];
const LMM3_SECTIONS    = ["lmm3-overview", "lmm3-wrangling", "mc3", "cp3", "mvp3", "tc3", "val3", "rt3"];
const DESIGN1_SECTIONS = ["comparison",    "IC",  "TC",  "IP"];
const DESIGN2_SECTIONS = ["exp2-comparison", "IC2", "TC2", "IP2"];

type AppMode = "lmm" | "lmm2" | "lmm3" | "design1" | "design2";

// ─────────────────────────────────────────────────────────────────────────────
export function App() {
  const [mode, setMode]                   = useState<AppMode>("lmm3");
  const [lmmActive,     setLmmActive]     = useState("overview");
  const [lmm2Active,    setLmm2Active]    = useState("lmm2-overview");
  const [lmm3Active,    setLmm3Active]    = useState("lmm3-overview");
  const [design1Active, setDesign1Active] = useState("comparison");
  const [design2Active, setDesign2Active] = useState("exp2-comparison");
  const [sidebarOpen,   setSidebarOpen]   = useState(false);

  useEffect(() => {
    const sections =
      mode === "lmm"     ? LMM_SECTIONS     :
      mode === "lmm2"    ? LMM2_SECTIONS    :
      mode === "lmm3"    ? LMM3_SECTIONS    :
      mode === "design1" ? DESIGN1_SECTIONS :
                           DESIGN2_SECTIONS;

    const setActive =
      mode === "lmm"     ? setLmmActive     :
      mode === "lmm2"    ? setLmm2Active    :
      mode === "lmm3"    ? setLmm3Active    :
      mode === "design1" ? setDesign1Active :
                           setDesign2Active;

    const obs = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); },
      { rootMargin: "-25% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [mode]);

  const handleNavigate = (id: string) => {
    setSidebarOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const active =
    mode === "lmm"     ? lmmActive     :
    mode === "lmm2"    ? lmm2Active    :
    mode === "lmm3"    ? lmm3Active    :
    mode === "design1" ? design1Active :
                         design2Active;

  const modeConfig: Record<AppMode, { expLabel: string; label: string }> = {
    lmm:     { expLabel: "Experiment 1 · LMM",        label: "LMM Analyses E1"   },
    lmm2:    { expLabel: "Experiment 2 · LMM",        label: "LMM Analyses E2"   },
    lmm3:    { expLabel: "Experiment 3 · LMM",        label: "LMM Analyses E3"   },
    design1: { expLabel: "Experiment 1 · Design",     label: "Design Scripts E1"  },
    design2: { expLabel: "Experiments 2&3 · Design",  label: "Design Scripts E2/3" },
  };

  const modeBtns: { key: AppMode; label: string; activeCls: string }[] = [
    { key: "design1", label: "🧪 Design E1",   activeCls: "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40" },
    { key: "design2", label: "🔬 Design E2/3", activeCls: "bg-sky-500/20     text-sky-200     border border-sky-500/40" },
    { key: "lmm",     label: "📊 LMM E1",      activeCls: "bg-violet-500/20  text-violet-200  border border-violet-500/40" },
    { key: "lmm2",    label: "📈 LMM E2",      activeCls: "bg-rose-500/20    text-rose-200    border border-rose-500/40" },
    { key: "lmm3",    label: "📉 LMM E3",      activeCls: "bg-teal-500/20    text-teal-200    border border-teal-500/40" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-14">

          {/* Hamburger + logo */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd"
                  d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z"
                  clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 via-sky-500 to-emerald-500 flex items-center justify-center text-[10px] font-bold text-white shadow">
                TB
              </span>
              <div>
                <p className="text-sm font-semibold text-white leading-none">Temporal Binding</p>
                <p className="text-xs text-slate-500 leading-none mt-0.5">{modeConfig[mode].expLabel}</p>
              </div>
            </div>
          </div>

          {/* Mode switcher */}
          <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 p-1 gap-1">
            {modeBtns.map((btn) => (
              <button
                key={btn.key}
                onClick={() => { setMode(btn.key); setSidebarOpen(false); }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === btn.key ? `${btn.activeCls} shadow` : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Status pills */}
          <div className="hidden sm:flex items-center gap-2">
            {mode === "lmm" && (<>
              <span className="px-2.5 py-1 rounded-full text-xs bg-slate-800 text-slate-400 border border-slate-700">n = 10</span>
              <span className="px-2.5 py-1 rounded-full text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30">4 analyses</span>
              <span className="px-2.5 py-1 rounded-full text-xs bg-sky-500/20 text-sky-300 border border-sky-500/30">lme4 · afex</span>
            </>)}
            {mode === "lmm2" && (<>
              <span className="px-2.5 py-1 rounded-full text-xs bg-slate-800 text-slate-400 border border-slate-700">n = 41</span>
              <span className="px-2.5 py-1 rounded-full text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30">RT analyses</span>
              <span className="px-2.5 py-1 rounded-full text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30">5 analyses</span>
            </>)}
            {mode === "lmm3" && (<>
              <span className="px-2.5 py-1 rounded-full text-xs bg-slate-800 text-slate-400 border border-slate-700">n = 41</span>
              <span className="px-2.5 py-1 rounded-full text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30">80/20</span>
              <span className="px-2.5 py-1 rounded-full text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30">6 analyses</span>
            </>)}
            {mode === "design1" && (<>
              <span className="px-2.5 py-1 rounded-full text-xs bg-slate-800 text-slate-400 border border-slate-700">n = 10</span>
              <span className="px-2.5 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">3 conditions</span>
              <span className="px-2.5 py-1 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">8 blocks</span>
            </>)}
            {mode === "design2" && (<>
              <span className="px-2.5 py-1 rounded-full text-xs bg-sky-500/20 text-sky-300 border border-sky-500/30">Exp 2 & 3</span>
              <span className="px-2.5 py-1 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">catch trials</span>
              <span className="px-2.5 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">RT collected</span>
            </>)}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-14 h-[calc(100vh-3.5rem)] z-20 w-64 shrink-0 border-r border-slate-800 bg-slate-950 p-4 overflow-y-auto transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>

          {mode === "design1" && (<>
            <DesignSidebar active={active} onNavigate={handleNavigate} />
            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-1.5 text-xs text-slate-500">
              <p className="text-slate-400 font-semibold">Quick reference</p>
              <p>• Fixed IEI: 550 ms</p>
              <p>• Random IEI: 0–1100 ms</p>
              <p>• DV: space-bar hold duration</p>
              <p>• No catch trials · No RT</p>
            </div>
          </>)}

          {mode === "design2" && (<>
            <Exp2Sidebar active={active} onNavigate={handleNavigate} />
            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-1.5 text-xs text-slate-500">
              <p className="text-slate-400 font-semibold">Quick reference</p>
              <p>• Fixed IEI: 650 ms</p>
              <p>• Acq: 30 trials · Test: 50</p>
              <p>• Catch: 6/30 acquisition</p>
              <p>• RT collected in test</p>
              <p>• 50/50 congruency (Exp2)</p>
              <p>• 80/20 congruency (Exp3)</p>
            </div>
          </>)}

          {mode === "lmm" && (<>
            <Sidebar active={active} onNavigate={handleNavigate} />
            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-1.5 text-xs text-slate-500">
              <p className="text-slate-400 font-semibold">Quick reference</p>
              <p>• Forward & backward LRT</p>
              <p>• Sum contrast coding</p>
              <p>• REML=FALSE for fixed</p>
              <p>• REML=TRUE for random</p>
              <p>• Outlier trim |z| &gt; 2.5</p>
              <p>• afex Type-III confirmation</p>
            </div>
          </>)}

          {mode === "lmm2" && (<>
            <Lmm2Sidebar active={active} onNavigate={handleNavigate} />
            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-1.5 text-xs text-slate-500">
              <p className="text-slate-400 font-semibold">Quick reference</p>
              <p>• na.action = na.exclude</p>
              <p>• RT excluded: 100–2000 ms</p>
              <p>• TC excluded from RT</p>
              <p>• log(space_RT) RT DV</p>
              <p>• log_RATIO for TC blocks</p>
              <p>• Outlier trim |z| &gt; 2.5</p>
            </div>
          </>)}

          {mode === "lmm3" && (<>
            <Lmm3Sidebar active={active} onNavigate={handleNavigate} />
            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-1.5 text-xs text-slate-500">
              <p className="text-slate-400 font-semibold">Quick reference</p>
              <p>• log_RATIO ALL analyses</p>
              <p>• RT exclusion: in code</p>
              <p>• 80/20 congruency split</p>
              <p>• SK: 6 missing (TC-FR)</p>
              <p>• cond×valid sig in RT ✅</p>
              <p>• 3-way sig in RT ✅</p>
            </div>
          </>)}
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-10 space-y-20">

          {/* EXP 1 DESIGN */}
          {mode === "design1" && (<>
            <div id="comparison"><ComparisonTable /></div>
            {conditions.map((cond) => (
              <div key={cond.id} id={cond.id}><ConditionPage cond={cond} /></div>
            ))}
            <footer className="border-t border-slate-800 pt-8 text-xs text-slate-600 space-y-1">
              <p>Experiment 1 · PsychoPy Design Reference · n = 10</p>
              <p>IC · TC · IP · 8 blocks · PsychoPy v2021.1.4</p>
            </footer>
          </>)}

          {/* EXP 2/3 DESIGN */}
          {mode === "design2" && (<>
            <div id="exp2-comparison"><Exp2ComparisonTable /></div>
            {conditions2.map((cond) => (
              <div key={cond.id} id={cond.id}><Exp2ConditionPage cond={cond} /></div>
            ))}
            <footer className="border-t border-slate-800 pt-8 text-xs text-slate-600 space-y-1">
              <p>Experiments 2 & 3 · PsychoPy Design Reference</p>
              <p>IC · TC · IP · 6 blocks · PsychoPy v2021.1.4</p>
              <p>Exp 3: identical to Exp 2 — only test congruency changes (50/50 → 80/20)</p>
            </footer>
          </>)}

          {/* EXP 1 LMM */}
          {mode === "lmm" && (<>
            <div id="overview"><DesignOverview /></div>
            <div id="wrangling"><WranglingSection /></div>
            {analyses.map((block) => (
              <div key={block.id} id={block.id}><AnalysisSection block={block} /></div>
            ))}
            <footer className="border-t border-slate-800 pt-8 text-xs text-slate-600 space-y-1">
              <p>Experiment 1 · LMM Analysis Reference · n = 10</p>
              <p>lme4 · afex · car · tidyverse · R</p>
              <p className="text-slate-700">Brehm & Alday (2022) · Bates et al. (2015)</p>
            </footer>
          </>)}

          {/* EXP 2 LMM */}
          {mode === "lmm2" && (<>
            <div id="lmm2-overview"><Lmm2Overview /></div>
            <div id="lmm2-wrangling"><Lmm2WranglingSection /></div>
            {analyses2.map((block) => (
              <div key={block.id} id={block.id}>
                <AnalysisSection block={block as any} />
              </div>
            ))}
            <footer className="border-t border-slate-800 pt-8 text-xs text-slate-600 space-y-1">
              <p>Experiment 2 · LMM Analysis Reference · n = 41</p>
              <p>lme4 · afex · car · tidyverse · writexl · R</p>
              <p className="text-slate-700">Brehm & Alday (2022) · Bates et al. (2015) · Matuschek et al. (2017)</p>
            </footer>
          </>)}

          {/* EXP 3 LMM */}
          {mode === "lmm3" && (<>
            <div id="lmm3-overview"><Lmm3Overview /></div>
            <div id="lmm3-wrangling"><Lmm3WranglingSection /></div>
            {analyses3.map((block) => (
              <div key={block.id} id={block.id}>
                <AnalysisSection block={block as any} />
              </div>
            ))}
            <footer className="border-t border-slate-800 pt-8 text-xs text-slate-600 space-y-1">
              <p>Experiment 3 · LMM Analysis Reference · n = 41</p>
              <p>lme4 · afex · car · tidyverse · R</p>
              <p className="text-slate-700">80/20 congruency · cond×validity significant in RT · Bates et al. (2015)</p>
            </footer>
          </>)}

        </main>
      </div>
    </div>
  );
}
