export default function Hero() {
  return (
    <div
      id="overview"
      className="relative overflow-hidden bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 text-white"
    >
      {/* subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-300 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            Master's Thesis · Bogazici University
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Temporal Binding &amp;<br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
              Predictive Processing
            </span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-2xl">
            Investigating the role of temporal predictability, identity validity, and causal inference
            in the temporal binding effect across three sets of experiments using interval reproduction tasks.
          </p>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: "3", label: "Experiment Sets" },
              { value: "96", label: "Participants (total)" },
              { value: "8", label: "Block Conditions" },
              { value: "LMM", label: "Analysis Method" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3 text-center"
              >
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
