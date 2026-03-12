interface TimelineEvent {
  label: string;
  duration: string;
  color: string;
  icon: string;
  sublabel?: string;
}

interface TrialTimelineProps {
  conditionId: "IC" | "TC" | "IP";
  phase: "practice" | "acquisition" | "test";
}

const IC_TIMELINE: Record<string, TimelineEvent[]> = {
  practice: [
    { label: "Fixation",    duration: "until keypress",   color: "bg-slate-600",   icon: "+",  sublabel: "cross visible" },
    { label: "Keypress",    duration: "0 ms",             color: "bg-violet-500",  icon: "↓",  sublabel: "left or right" },
    { label: "IEI",         duration: "0–1100 ms (CSV)",  color: "bg-slate-700",   icon: "⏱",  sublabel: "blank interval" },
    { label: "Circle",      duration: "200 ms",           color: "bg-rose-400",    icon: "●",  sublabel: "red or green" },
    { label: "Space hold",  duration: "participant-set",  color: "bg-emerald-500", icon: "⎵",  sublabel: "DV captured" },
  ],
  acquisition: [
    { label: "Fixation",    duration: "until keypress",   color: "bg-slate-600",   icon: "+",  sublabel: "cross visible" },
    { label: "Keypress",    duration: "0 ms",             color: "bg-violet-500",  icon: "↓",  sublabel: "left or right" },
    { label: "IEI",         duration: "550 ms (FF) / 0–1100 ms (RF)", color: "bg-slate-700", icon: "⏱", sublabel: "blank interval" },
    { label: "Circle",      duration: "200 ms",           color: "bg-rose-400",    icon: "●",  sublabel: "100% congruent" },
    { label: "Next trial",  duration: "—",                color: "bg-slate-800",   icon: "→",  sublabel: "no reproduction" },
  ],
  test: [
    { label: "Fixation",    duration: "until keypress",   color: "bg-slate-600",   icon: "+",  sublabel: "cross visible" },
    { label: "Keypress",    duration: "0 ms",             color: "bg-violet-500",  icon: "↓",  sublabel: "left or right" },
    { label: "IEI",         duration: "550 ms",           color: "bg-slate-700",   icon: "⏱",  sublabel: "fixed" },
    { label: "Circle",      duration: "200 ms",           color: "bg-rose-400",    icon: "●",  sublabel: "randomised" },
    { label: "Space hold",  duration: "participant-set",  color: "bg-emerald-500", icon: "⎵",  sublabel: "DV captured" },
  ],
};

const TC_TIMELINE: Record<string, TimelineEvent[]> = {
  practice: [
    { label: "Fixation",    duration: "until keypress",   color: "bg-slate-600",   icon: "+",  sublabel: "cross visible" },
    { label: "Keypress",    duration: "0 ms",             color: "bg-amber-500",   icon: "↓",  sublabel: "left or right" },
    { label: "IEI",         duration: "0–1100 ms (CSV)",  color: "bg-slate-700",   icon: "⏱",  sublabel: "blank interval" },
    { label: "Circle",      duration: "200 ms",           color: "bg-amber-400",   icon: "●",  sublabel: "always random" },
    { label: "Space hold",  duration: "participant-set",  color: "bg-emerald-500", icon: "⎵",  sublabel: "DV captured" },
  ],
  acquisition: [
    { label: "Fixation",    duration: "until keypress",   color: "bg-slate-600",   icon: "+",  sublabel: "cross visible" },
    { label: "Keypress",    duration: "0 ms",             color: "bg-amber-500",   icon: "↓",  sublabel: "left or right" },
    { label: "IEI",         duration: "depends on block", color: "bg-slate-700",   icon: "⏱",  sublabel: "FF/RF/FR/RR" },
    { label: "Circle",      duration: "200 ms",           color: "bg-amber-400",   icon: "●",  sublabel: "always random" },
    { label: "Next trial",  duration: "—",                color: "bg-slate-800",   icon: "→",  sublabel: "no reproduction" },
  ],
  test: [
    { label: "Flush keys",  duration: "~0 ms",            color: "bg-slate-700",   icon: "🗑",  sublabel: "event.getKeys()" },
    { label: "Fixation",    duration: "until keypress",   color: "bg-slate-600",   icon: "+",  sublabel: "cross visible" },
    { label: "Keypress",    duration: "0 ms",             color: "bg-amber-500",   icon: "↓",  sublabel: "left or right" },
    { label: "IEI",         duration: "depends on block", color: "bg-slate-700",   icon: "⏱",  sublabel: "FF/RF/FR/RR" },
    { label: "Circle",      duration: "200 ms",           color: "bg-amber-400",   icon: "●",  sublabel: "always random" },
    { label: "Space hold",  duration: "participant-set",  color: "bg-emerald-500", icon: "⎵",  sublabel: "DV captured" },
  ],
};

const IP_TIMELINE: Record<string, TimelineEvent[]> = {
  practice: [
    { label: "Fixation",     duration: "1300 ms",         color: "bg-slate-600",   icon: "+",  sublabel: "auto delay" },
    { label: "Tone",         duration: "200 ms",          color: "bg-emerald-600", icon: "♪",  sublabel: "500 or 1000 Hz" },
    { label: "IEI",          duration: "0–1100 ms (CSV)", color: "bg-slate-700",   icon: "⏱",  sublabel: "blank interval" },
    { label: "Circle",       duration: "200 ms",          color: "bg-rose-400",    icon: "●",  sublabel: "random colour" },
    { label: "Space hold",   duration: "participant-set", color: "bg-emerald-500", icon: "⎵",  sublabel: "DV (gated)" },
  ],
  acquisition: [
    { label: "Fixation",     duration: "1300 ms",         color: "bg-slate-600",   icon: "+",  sublabel: "auto delay" },
    { label: "Tone",         duration: "200 ms",          color: "bg-emerald-600", icon: "♪",  sublabel: "low→Red/high→Green" },
    { label: "IEI",          duration: "550 ms (FF) / 0–1100 ms (RF)", color: "bg-slate-700", icon: "⏱", sublabel: "tone offset → circle" },
    { label: "Circle",       duration: "200 ms",          color: "bg-rose-400",    icon: "●",  sublabel: "100% congruent" },
    { label: "Next trial",   duration: "—",               color: "bg-slate-800",   icon: "→",  sublabel: "no reproduction" },
  ],
  test: [
    { label: "Flush keys",   duration: "~0 ms",           color: "bg-slate-700",   icon: "🗑",  sublabel: "event.getKeys()" },
    { label: "Fixation",     duration: "1300 ms",         color: "bg-slate-600",   icon: "+",  sublabel: "auto delay" },
    { label: "Tone",         duration: "200 ms",          color: "bg-emerald-600", icon: "♪",  sublabel: "random" },
    { label: "IEI",          duration: "550 ms",          color: "bg-slate-700",   icon: "⏱",  sublabel: "fixed" },
    { label: "Circle",       duration: "200 ms",          color: "bg-rose-400",    icon: "●",  sublabel: "randomised" },
    { label: "Space hold",   duration: "participant-set", color: "bg-emerald-500", icon: "⎵",  sublabel: "DV (gated)" },
  ],
};

const TIMELINES: Record<string, Record<string, TimelineEvent[]>> = {
  IC: IC_TIMELINE,
  TC: TC_TIMELINE,
  IP: IP_TIMELINE,
};

const PHASE_LABELS: Record<string, string> = {
  practice: "Practice",
  acquisition: "Acquisition",
  test: "Test",
};

export function TrialTimeline({ conditionId, phase }: TrialTimelineProps) {
  const events = TIMELINES[conditionId]?.[phase] ?? [];

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
        {PHASE_LABELS[phase]} trial structure
      </p>
      <div className="flex flex-wrap items-stretch gap-0">
        {events.map((ev, i) => (
          <div key={i} className="flex items-stretch">
            <div className="flex flex-col items-center">
              <div
                className={`${ev.color} rounded-lg px-3 py-2.5 text-center min-w-[80px] flex flex-col gap-0.5`}
              >
                <span className="text-lg leading-none">{ev.icon}</span>
                <span className="text-xs font-semibold text-white leading-tight">{ev.label}</span>
                <span className="text-[10px] text-white/70 leading-tight">{ev.duration}</span>
                {ev.sublabel && (
                  <span className="text-[10px] text-white/50 leading-tight">{ev.sublabel}</span>
                )}
              </div>
            </div>
            {i < events.length - 1 && (
              <div className="flex items-center px-1">
                <svg className="w-3 h-3 text-slate-600" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M4 2l5 4-5 4V2z" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
