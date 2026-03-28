import GroupedBarChart from "../components/GroupedBarChart";
import ResultCard from "../components/ResultCard";
import StatBadge from "../components/StatBadge";
import SectionHeader from "../components/SectionHeader";
import {
  exp2a_data, exp2a_rt_data, exp2b_data,
  exp2_ICvsTC_data, exp2_TCvsIP_data,
} from "../data/experimentData";

const MAROON = "#7f1d1d";
const PINK = "#f9a8d4";

export default function Experiment2() {
  return (
    <section id="exp2" className="space-y-10">
      <SectionHeader
        number="3.2"
        title="Experiments 2a & 2b"
        subtitle="Controlled Validity (50/50%) · Catch Trials · RT Analysis"
        color="blue"
      />

      {/* Method Overview */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
        <h3 className="font-semibold text-slate-800 mb-3 text-lg">Method Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
          <div className="rounded-xl bg-white border border-slate-200 p-4">
            <p className="font-semibold text-slate-800 mb-1">Participants</p>
            <p>42 undergraduate students (Psychology, Bogazici University). 1.5 course credits. 1 excluded (77.08% catch accuracy). Final catch accuracy: 97.76%.</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-4">
            <p className="font-semibold text-slate-800 mb-1">Design Changes from Exp 1</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Congruency set to 50/50% in test phases</li>
              <li>Catch trials added (20%) in acquisition</li>
              <li>Acq. trials reduced: 50 → 30</li>
              <li>Test trials kept at 50</li>
              <li>RT data added as manipulation check</li>
            </ul>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-4">
            <p className="font-semibold text-slate-800 mb-1">Updated Intervals</p>
            <p>Fixed: <strong>650 ms</strong><br />Random: 150–1150 ms</p>
            <p className="mt-2 font-semibold text-slate-800">DV:</p>
            <p>Ratio (reproduced ÷ physical) for main analyses<br />Log Ratio for TC blocks (2b)</p>
          </div>
        </div>
      </div>

      {/* Exp 2a Results */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">
          3.2.1.4.1 – Experiment 2a Results (IC vs IP)
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          LMM with sum contrast coding (±1). Predictors: Condition Type, Acquisition Time, Validity.
          Random effects: intercept + slopes for condition type and acquisition time by participant. <strong>DV: Ratio.</strong>
          Best model: two-way interaction between condition type and acquisition time.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBadge label="Interaction χ²" value="61.67" sub="p < 0.001" highlight />
          <StatBadge label="Cond. Type β" value="−0.19" sub="SE=0.01, t=−12.23" highlight />
          <StatBadge label="Acq. Time β" value="−0.03" sub="SE=0.01, t=−2.63" highlight />
          <StatBadge label="Cond. Type p" value="< 0.001" sub="Acq. Time p = 0.012" />
        </div>
        <ResultCard
          title="Figure 9 – Experiment 2a: Ratio by Condition & Validity"
          figureNum="Fig. 9"
          caption="X-axis: IC|Fixed, IC|Random, IP|Fixed, IP|Random. Y-axis: Ratio. Maroon = True (congruent); Pink = False (incongruent). Error bars = SEM."
        >
          <GroupedBarChart
            data={exp2a_data}
            series={[
              { key: "true", label: "True", color: MAROON },
              { key: "false", label: "False", color: PINK },
            ]}
            yAxisLabel="Ratio"
            yDomain={[0.6, 1.3]}
            referenceY={1}
          />
        </ResultCard>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">Key Finding</p>
          <p>Underestimations were more prevalent in <strong>fixed identity prediction</strong> and <strong>fixed identity control</strong> blocks. IP blocks showed consistent overestimation, especially with random intervals.</p>
        </div>
      </div>

      {/* Exp 2a RT Analysis */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">
          3.2.1.4.1.1 – Experiment 2a: Reaction Time Analysis
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          LMM on log-transformed RT. Same predictors and random effect structure as above.
          Only condition type significantly improved model fit.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatBadge label="Condition Type χ²" value="11.60" sub="p < 0.001" highlight />
          <StatBadge label="IC faster?" value="Yes" sub="IC &amp; IP comparisons" />
          <StatBadge label="DV" value="Log RT" sub="ms, log-transformed" />
        </div>
        <ResultCard
          title="Figure 10 – Experiment 2a: Log RT by Condition & Validity"
          figureNum="Fig. 10"
          caption="X-axis: IC|Fixed, IC|Random, IP|Fixed, IP|Random. Y-axis: Log Reaction Time (ms). Maroon = True; Pink = False."
        >
          <GroupedBarChart
            data={exp2a_rt_data}
            series={[
              { key: "true", label: "True", color: MAROON },
              { key: "false", label: "False", color: PINK },
            ]}
            yAxisLabel="Log RT (ms)"
            yDomain={[5.4, 6.0]}
            referenceY={undefined}
          />
        </ResultCard>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">Key Finding</p>
          <p>Participants reacted faster in <strong>identity control</strong> blocks than in identity prediction blocks. The congruency factor did not significantly affect reaction times (expected with 50/50 validity).</p>
        </div>
      </div>

      {/* Exp 2b Results */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">
          3.2.1.4.2 – Experiment 2b Results (Temporal Control)
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          LMM on <strong>log-transformed Ratio</strong>. Sum coded predictors: Acquisition Time, Test Time (fixed=+1, random=−1).
          Neither main effects nor interaction were significant. Test time was marginally significant.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatBadge label="Test Time χ²" value="3.570" sub="p = 0.058 (marginal)" highlight />
          <StatBadge label="Interaction" value="n.s." sub="Not significant" />
          <StatBadge label="DV" value="Log Ratio" sub="log-transformed" />
        </div>
        <ResultCard
          title="Figure 11 – Experiment 2b: Log Ratio by TC Blocks"
          figureNum="Fig. 11"
          caption="X-axis: TC|Fixed, TC|Random. Y-axis: Log Ratio. Maroon = Random test phase; Pink = Fixed test phase."
        >
          <GroupedBarChart
            data={exp2b_data}
            series={[
              { key: "random", label: "Random", color: MAROON },
              { key: "fixed", label: "Fixed", color: PINK },
            ]}
            yAxisLabel="Log Ratio"
            yDomain={[-0.20, 0.08]}
            referenceY={0}
          />
        </ResultCard>
      </div>

      {/* Cross-Experiment: IC vs TC */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">
          3.2.1.4.3 – Cross-Experiment: IC vs TC
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          LMM comparing IC (active [+]) vs TC (active [−]). Predictors: Condition Type, Acquisition Time (±1).
          <strong> DV: Ratio.</strong>
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatBadge label="Interaction χ²" value="338.29" sub="p < 0.001" highlight />
          <StatBadge label="Pattern" value="IC Fixed ↓, TC Random ↓" sub="More underestimation" />
          <StatBadge label="DV" value="Ratio" sub="Reproduced / Physical" />
        </div>
        <ResultCard
          title="Figure 12 – Exp 2a vs 2b: IC vs TC Ratio"
          figureNum="Fig. 12"
          caption="X-axis: IC|Fixed, IC|Random, TC|Fixed, TC|Random. Y-axis: Ratio. Maroon = Random acq.; Pink = Fixed acq."
        >
          <GroupedBarChart
            data={exp2_ICvsTC_data}
            series={[
              { key: "random", label: "Random", color: MAROON },
              { key: "fixed", label: "Fixed", color: PINK },
            ]}
            yAxisLabel="Ratio"
            yDomain={[0.6, 1.2]}
            referenceY={1}
          />
        </ResultCard>
      </div>

      {/* Cross-Experiment: TC vs IP */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">
          3.2.1.4.3 – Cross-Experiment: TC vs IP
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          LMM comparing TC (active [−]) vs IP (passive [+]). Predictors: Condition Type, Acquisition Time (±1).
          <strong> DV: Ratio.</strong>
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBadge label="Interaction χ²" value="27.90" sub="p < 0.001" highlight />
          <StatBadge label="Cond. Type β (TC)" value="−0.17" sub="SE=0.01, t=−2.63" highlight />
          <StatBadge label="Cond. Type p" value="< 0.001" sub="Significant" />
          <StatBadge label="IP Overest." value="IP ↑ Ratio" sub="Overestimation" />
        </div>
        <ResultCard
          title="Figure 13 – Exp 2a vs 2b: TC vs IP Ratio"
          figureNum="Fig. 13"
          caption="X-axis: IP|Fixed, IP|Random, TC|Fixed, TC|Random. Y-axis: Ratio. Maroon = Random acq.; Pink = Fixed acq."
        >
          <GroupedBarChart
            data={exp2_TCvsIP_data}
            series={[
              { key: "random", label: "Random", color: MAROON },
              { key: "fixed", label: "Fixed", color: PINK },
            ]}
            yAxisLabel="Ratio"
            yDomain={[0.6, 1.3]}
            referenceY={1}
          />
        </ResultCard>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">Key Finding</p>
          <p>IP blocks showed consistent <strong>overestimation</strong>. Fixed IP and random TC showed the greatest underestimation relative to their counterparts. Action with causal inference appears to be the primary driver of binding.</p>
        </div>
      </div>

      {/* Discussion */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 text-sm text-blue-900 leading-relaxed">
        <h3 className="font-bold text-lg mb-2">3.2.1.5 Discussion</h3>
        <p>Experiment 2 confirmed all hypotheses and replicated Desantis et al. (2012), Haering &amp; Kiesel (2014), and Bednark et al. (2015). Validity had no bearing on binding. RT analysis showed faster responses in IC compared to IP blocks (no congruency effect as expected). Temporal control alone did not eliminate binding — apparent causal inference from action presence drives the effect. Random intervals still produced temporal binding, corroborating Humphreys &amp; Buehner (2010).</p>
      </div>
    </section>
  );
}
