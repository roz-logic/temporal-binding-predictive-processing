import GroupedBarChart from "../components/GroupedBarChart";
import ResultCard from "../components/ResultCard";
import StatBadge from "../components/StatBadge";
import SectionHeader from "../components/SectionHeader";
import {
  exp3a_data, exp3a_rt_data, exp3b_data,
  exp3_ICvsTC_data, exp3_TCvsIP_data,
} from "../data/experimentData";

const DARK_BLUE = "#1B4965";
const LIGHT_BLUE = "#CAE9FF";

export default function Experiment3() {
  return (
    <section id="exp3" className="space-y-10">
      <SectionHeader
        number="3.3"
        title="Experiments 3a & 3b"
        subtitle="80/20% Congruency · Replication & Extension of Experiment 2"
        color="emerald"
      />

      {/* Method Overview */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
        <h3 className="font-semibold text-slate-800 mb-3 text-lg">Method Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
          <div className="rounded-xl bg-white border border-slate-200 p-4">
            <p className="font-semibold text-slate-800 mb-1">Participants</p>
            <p>44 undergraduates (Psychology, Bogazici University). 3 excluded (incomplete). Final N = 41. Catch accuracy: 98.02%.</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-4">
            <p className="font-semibold text-slate-800 mb-1">Key Change from Exp 2</p>
            <p>Congruency in test phases of Experiment 3a set to <strong>80/20%</strong> (vs 50/50% in Exp 2). Exp 3b identical to Exp 2b.</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-4">
            <p className="font-semibold text-slate-800 mb-1">Dependent Variables</p>
            <p><strong>3a (IC vs IP):</strong> Ratio (reproduced ÷ physical duration)<br />
              <strong>3b (TC):</strong> Log Ratio (log-transformed)<br />
              <strong>3a vs 3b IC vs TC:</strong> Log Ratio<br />
              <strong>3a vs 3b TC vs IP:</strong> Log Ratio</p>
          </div>
        </div>
      </div>

      {/* Exp 3a Results */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
          <h3 className="text-xl font-bold text-slate-800 flex-1">
            3.3.1.4.1 – Experiment 3a Results (IC vs IP)
          </h3>
          <span className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-400 px-3 py-1 text-xs font-bold text-emerald-800">
            ✓ DV = Ratio (not log ratio)
          </span>
        </div>
        <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold mb-1">Dependent Variable</p>
          <p>
            <strong>Ratio</strong> (space-pressed duration ÷ physical duration) was used as the dependent variable.
            The ratio was <strong>not</strong> log-transformed for this analysis — unlike the temporal control
            blocks (3b) and the cross-experiment analyses (3.3.1.4.3). Reference line is at <strong>1.0</strong> (perfect reproduction).
          </p>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          LMM with sum contrast coding (±1). Predictors: Condition Type (active [+], passive [+]),
          Acquisition Time, Validity. Random effects: intercept + slopes for condition type and
          acquisition time by participant. <strong>DV: Ratio</strong> (reproduced ÷ physical duration).
          Best model: two-way interaction between condition type and acquisition time.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBadge label="Interaction χ²" value="5.59" sub="p = 0.017" highlight />
          <StatBadge label="Cond. Type β (IC)" value="−0.18" sub="SE=0.01, t=−9.95" highlight />
          <StatBadge label="Cond. Type p" value="< 0.001" sub="Significant" />
          <StatBadge label="Pattern" value="Random ↓ more" sub="IC &amp; IP random > fixed" />
        </div>
        <ResultCard
          title="Figure 15 – Experiment 3a: Ratio by Condition & Validity"
          figureNum="Fig. 15"
          caption="X-axis: IC|Fixed, IC|Random, IP|Fixed, IP|Random. Y-axis: Ratio (reproduced / physical duration). Maroon = True (congruent); Pink = False (incongruent)."
        >
          <GroupedBarChart
            data={exp3a_data}
            series={[
              { key: "true", label: "True", color: DARK_BLUE },
              { key: "false", label: "False", color: LIGHT_BLUE },
            ]}
            yAxisLabel="Ratio"
            yDomain={[0.6, 1.3]}
            referenceY={1}
          />
        </ResultCard>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">Key Finding</p>
          <p>Underestimation was more pronounced in <strong>random</strong> blocks (both IC and IP). IC blocks produced underestimation while IP blocks produced overestimation — consistent with Experiment 2 findings.</p>
        </div>
      </div>

      {/* Exp 3a RT Analysis */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">
          3.3.1.4.1.1 – Experiment 3a: Reaction Time Analysis
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          LMM on log-transformed RT. Same predictors and random effect structure. <strong>DV: Log RT.</strong>
          Best model: significant three-way interaction between condition type, acquisition time, and validity.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBadge label="3-way Interaction χ²" value="7.20" sub="p = 0.007" highlight />
          <StatBadge label="Cond. Type β" value="−0.09" sub="SE=0.02, t=−4.04" highlight />
          <StatBadge label="Cond. Type p" value="< 0.001" sub="Significant" />
          <StatBadge label="Validity β (False)" value="0.02" sub="SE=0.005, t=4.98, p=0.012" highlight />
        </div>
        <ResultCard
          title="Figure 16 – Experiment 3a: Log RT by Condition & Validity"
          figureNum="Fig. 16"
          caption="X-axis: IC|Fixed, IC|Random, IP|Fixed, IP|Random. Y-axis: Log Reaction Time (ms). Maroon = True (congruent); Pink = False (incongruent)."
        >
          <GroupedBarChart
            data={exp3a_rt_data}
            series={[
              { key: "true", label: "True", color: DARK_BLUE },
              { key: "false", label: "False", color: LIGHT_BLUE },
            ]}
            yAxisLabel="Log RT (ms)"
            yDomain={[5.4, 6.0]}
            referenceY={undefined}
          />
        </ResultCard>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">Key Finding</p>
          <p>Participants responded faster in <strong>IC blocks</strong>. Faster RTs were recorded when action-outcome mappings were congruent with learned associations — consistent with Haering &amp; Kiesel (2014) at 80% congruency.</p>
        </div>
      </div>

      {/* Exp 3b Results */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">
          3.3.1.4.2 – Experiment 3b Results (Temporal Control)
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          LMM with sum contrast coding (fixed = +1, random = −1). Predictors: Acquisition Time, Test Time.
          <strong> DV: Log Ratio</strong> (ratio log-transformed to meet normality assumptions).
          Only test time main effect was significant.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatBadge label="Test Time χ²" value="6.80" sub="p = 0.009" highlight />
          <StatBadge label="Fixed > Random" value="↓ Ratio" sub="Fixed test phase" />
          <StatBadge label="DV" value="Log Ratio" sub="log-transformed" />
        </div>
        <ResultCard
          title="Figure 17 – Experiment 3b: Log Ratio by TC Blocks"
          figureNum="Fig. 17"
          caption="X-axis: TC|Fixed, TC|Random. Y-axis: Log Ratio. Maroon = Random test phase; Pink = Fixed test phase."
        >
          <GroupedBarChart
            data={exp3b_data}
            series={[
              { key: "random", label: "Random", color: DARK_BLUE },
              { key: "fixed", label: "Fixed", color: LIGHT_BLUE },
            ]}
            yAxisLabel="Log Ratio"
            yDomain={[-0.20, 0.06]}
            referenceY={0}
          />
        </ResultCard>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">Key Finding</p>
          <p>Underestimation was significantly greater when the test phase interval was <strong>fixed</strong> compared to random — replicating the pattern from Experiment 2b.</p>
        </div>
      </div>

      {/* ─── Cross-experiment analyses ─────────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5">
        <h3 className="text-lg font-bold text-emerald-900 mb-1">
          3.3.1.4.3 – Cross-Experiment Analyses (3a vs 3b)
        </h3>
        <p className="text-sm text-emerald-800">
          Two LMM analyses comparing blocks across experiments: IC vs TC and TC vs IP.
          Both use sum-contrast coding (±1) for Condition Type and Acquisition Time.
          Random effects: intercept + slopes for condition type and acquisition time by participant.
        </p>
      </div>

      {/* Cross-Experiment: IC vs TC — LOG RATIO */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">
          IC vs TC – Identity Control vs Temporal Control
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          LMM comparing IC (active [+]) vs TC (active [−]).
          <strong> DV: Log Ratio</strong> — ratio was log-transformed to meet the model's normality assumptions
          (as stated in thesis Section 3.3.1.4.3).
          Best model: two-way interaction between condition type and acquisition time.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBadge label="Interaction χ²" value="6.70" sub="p = 0.009" highlight />
          <StatBadge label="DV" value="Log Ratio" sub="log-transformed" />
          <StatBadge label="TC Fixed ↓" value="Underest." sub="Fixed TC blocks" />
          <StatBadge label="IC Random ↓" value="Underest." sub="Random IC blocks" />
        </div>
        <ResultCard
          title="Figure 18 – Exp 3a vs 3b: IC vs TC Log Ratio"
          figureNum="Fig. 18"
          caption="X-axis: IC|Fixed, IC|Random, TC|Fixed, TC|Random. Y-axis: Log Ratio. Maroon = Random acq. phase; Pink = Fixed acq. phase. DV is log-transformed ratio."
        >
          <GroupedBarChart
            data={exp3_ICvsTC_data}
            series={[
              { key: "random", label: "Random", color: DARK_BLUE },
              { key: "fixed", label: "Fixed", color: LIGHT_BLUE },
            ]}
            yAxisLabel="Log Ratio"
            yDomain={[-0.22, 0.05]}
            referenceY={0}
          />
        </ResultCard>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">Key Finding</p>
          <p>Underestimations occurred when blocks were <strong>fixed TC (active [−]: fixed)</strong> and <strong>random IC (active [+]: random)</strong>.</p>
        </div>
      </div>

      {/* ─── Cross-Experiment: TC vs IP — LOG RATIO ─────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">
          TC vs IP – Temporal Control vs Identity Prediction
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          LMM comparing TC (active [−]) vs IP (passive [+]).
          Predictors: Condition Type, Acquisition Time (±1 sum coded).
          <strong> DV: Log Ratio</strong> — ratio was log-transformed to meet the model's normality assumptions
          (thesis §3.3.1.4.3). Best model: two-way interaction between condition type and acquisition time.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBadge label="Interaction χ²" value="26.16" sub="p < 0.001" highlight />
          <StatBadge label="Cond. Type β (TC)" value="−0.20" sub="SE=0.02, t=−8.94" highlight />
          <StatBadge label="Cond. Type p" value="< 0.001" sub="Significant" />
          <StatBadge label="DV" value="Log Ratio" sub="log-transformed" />
        </div>
        <ResultCard
          title="Figure 19 – Exp 3a vs 3b: TC vs IP Log Ratio"
          figureNum="Fig. 19"
          caption="X-axis: IP|Fixed, IP|Random, TC|Fixed, TC|Random. Y-axis: Log Ratio. Maroon = Random acq. phase; Pink = Fixed acq. phase."
        >
          <GroupedBarChart
            data={exp3_TCvsIP_data}
            series={[
              { key: "random", label: "Random", color: DARK_BLUE },
              { key: "fixed", label: "Fixed", color: LIGHT_BLUE },
            ]}
            yAxisLabel="Log Ratio"
            yDomain={[-0.25, 0.15]}
            referenceY={0}
          />
        </ResultCard>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">Key Findings</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Two-way interaction: χ² = 26.16, p &lt; 0.001</li>
            <li>Relative overestimations in <strong>random TC</strong> and <strong>fixed IP</strong> blocks compared to counterparts</li>
            <li>Condition Type significant: TC → underestimation; IP → overestimation (β = −0.20, SE = 0.02, t = −8.94, p &lt; 0.001)</li>
          </ul>
        </div>
      </div>

      {/* Discussion */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900 leading-relaxed">
        <h3 className="font-bold text-lg mb-2">3.3.1.5 Discussion</h3>
        <p>Experiment 3 confirmed the findings of Experiment 2. Temporal binding was not influenced by validity — the presence of action with a causal link was sufficient. At 80% congruency, participants also reacted faster for congruent outcomes in IC blocks, consistent with Haering &amp; Kiesel (2014). The significance of acquisition time interval learning persisted in different ways, suggesting the temporal binding phenomenon is adaptive and context-dependent (Humphreys &amp; Buehner, 2010). Underestimation was more pronounced with fixed intervals in TC blocks, and random intervals still produced binding, indicating temporal control alone could drive binding under causal inference.</p>
      </div>
    </section>
  );
}
