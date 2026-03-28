import GroupedBarChart from "../components/GroupedBarChart";
import ResultCard from "../components/ResultCard";
import StatBadge from "../components/StatBadge";
import SectionHeader from "../components/SectionHeader";
import {
  exp1a_data, exp1b_data,
  exp1_ICvsTC_data, exp1_TCvsIP_data,
} from "../data/experimentData";

const MAROON = "#7f1d1d";
const PINK = "#f9a8d4";

export default function Experiment1() {
  return (
    <section id="exp1" className="space-y-10">
      {/* Header */}
      <SectionHeader
        number="3.1"
        title="Experiments 1a & 1b"
        subtitle="Identity Control vs. Identity Prediction · Temporal Control"
        color="violet"
      />

      {/* Method Overview */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
        <h3 className="font-semibold text-slate-800 mb-3 text-lg">Method Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
          <div className="rounded-xl bg-white border border-slate-200 p-4">
            <p className="font-semibold text-slate-800 mb-1">Participants</p>
            <p>10 graduate &amp; undergraduate students (Vision Lab, Bogazici University). Normal or corrected-to-normal vision.</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-4">
            <p className="font-semibold text-slate-800 mb-1">Apparatus</p>
            <p>PsychoPy · Eizo Foris FG2421 (1920×1080, 120 Hz) · Calibrated with Spyder4Elite · 55 cm viewing distance.</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-4">
            <p className="font-semibold text-slate-800 mb-1">Key Variables</p>
            <p><span className="font-medium">DV:</span> Ratio (reproduced ÷ physical duration)<br />
              <span className="font-medium">IVs:</span> Condition Type, Acquisition Time (fixed/random), Validity (true/false)</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div className="rounded-xl bg-white border border-slate-200 p-4">
            <p className="font-semibold text-slate-800 mb-1">Experiment 1a Blocks</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li><span className="font-medium">Block 1</span> – Fixed Identity Control (IC | Fixed)</li>
              <li><span className="font-medium">Block 2</span> – Random Identity Control (IC | Random)</li>
              <li><span className="font-medium">Block 3</span> – Fixed Identity Prediction (IP | Fixed)</li>
              <li><span className="font-medium">Block 4</span> – Random Identity Prediction (IP | Random)</li>
            </ul>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-4">
            <p className="font-semibold text-slate-800 mb-1">Experiment 1b Blocks (Temporal Control)</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li><span className="font-medium">Block 5</span> – TC | Random acq / Random test</li>
              <li><span className="font-medium">Block 6</span> – TC | Fixed acq / Random test</li>
              <li><span className="font-medium">Block 7</span> – TC | Random acq / Fixed test</li>
              <li><span className="font-medium">Block 8</span> – TC | Fixed acq / Fixed test</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3.1.1.4.1 – Exp 1a Results */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">
          3.1.1.4.1 – Experiment 1a Results (IC vs IP)
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          A linear mixed model (LMM) with varying intercepts and slopes was fit using sum contrast coding (±1). Predictors: Condition Type, Acquisition Time, Validity.
          Random effects: intercept + slopes for condition type and acquisition time by participant.
          Iterative backward selection with LRT (χ²). <strong>Dependent variable: Ratio</strong> (reproduced ÷ physical duration).
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBadge label="Condition Type χ²" value="1225.1" sub="p < 0.001" highlight />
          <StatBadge label="Validity χ²" value="8.82" sub="p = 0.002" highlight />
          <StatBadge label="IC underestimation" value="↓ Ratio" sub="Active blocks" />
          <StatBadge label="Congruent effect" value="↓ Ratio" sub="True vs False" />
        </div>
        <ResultCard
          title="Figure 4 – Experiment 1a: Ratio by Condition & Validity"
          figureNum="Fig. 4"
          caption="X-axis: IC|Fixed, IC|Random, IP|Fixed, IP|Random. Y-axis: Ratio (reproduced / physical duration). Maroon = True (congruent); Pink = False (incongruent). Error bars = SEM."
        >
          <GroupedBarChart
            data={exp1a_data}
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
          <p>Participants underestimated the duration significantly more in <strong>action with validness (IC)</strong> blocks than in <strong>no-action with validness (IP)</strong> blocks. Congruent outcomes also produced more underestimation than incongruent ones.</p>
        </div>
      </div>

      {/* 3.1.1.4.2 – Exp 1b Results */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">
          3.1.1.4.2 – Experiment 1b Results (Temporal Control)
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          LMM with sum contrast coding (fixed = +1, random = −1). Predictors: Acquisition Time, Test Time.
          To meet model assumptions, ratio was <strong>log-transformed</strong> (log ratio used as DV).
          Best-fitting model: two-way interaction between acquisition and test time.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatBadge label="Interaction χ²" value="20.83" sub="p < 0.001" highlight />
          <StatBadge label="Test Time β (Fixed)" value="−0.10" sub="SE=0.04, t=−2.29" highlight />
          <StatBadge label="Test Time p" value="0.047" sub="Significant" />
        </div>
        <ResultCard
          title="Figure 5 – Experiment 1b: Log Ratio by TC Blocks"
          figureNum="Fig. 5"
          caption="X-axis: TC|Fixed, TC|Random. Y-axis: Log Ratio (log of reproduced / physical duration). Maroon = Random test phase; Pink = Fixed test phase."
        >
          <GroupedBarChart
            data={exp1b_data}
            series={[
              { key: "random", label: "Random", color: MAROON },
              { key: "fixed", label: "Fixed", color: PINK },
            ]}
            yAxisLabel="Log Ratio"
            yDomain={[-0.25, 0.1]}
            referenceY={0}
          />
        </ResultCard>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">Key Finding</p>
          <p>Underestimations were more pronounced when the test phase interval was <strong>fixed</strong>, regardless of acquisition time type. A two-way interaction between acquisition time and test time was significant.</p>
        </div>
      </div>

      {/* 3.1.1.4.3 – Cross-experiment: IC vs TC */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">
          3.1.1.4.3 – Cross-Experiment: IC vs TC
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          LMM comparing identity control (active [+]) vs temporal control (active [−]).
          Predictors: Condition Type, Acquisition Time (both ±1 coded). <strong>Dependent variable: Ratio.</strong>
          Iterative backward selection with LRT (χ²).
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBadge label="Interaction χ²" value="136.39" sub="p < 0.001" highlight />
          <StatBadge label="Cond. Type β (TC)" value="0.03" sub="SE=0.01, t=8.99" highlight />
          <StatBadge label="Cond. Type p" value="0.037" sub="Significant" />
          <StatBadge label="IC vs TC" value="IC ↓ more" sub="More underestimation" />
        </div>
        <ResultCard
          title="Figure 6 – Exp 1a vs 1b: IC vs TC Ratio"
          figureNum="Fig. 6"
          caption="X-axis: IC|Fixed, IC|Random, TC|Fixed, TC|Random. Y-axis: Ratio. Maroon = Random acq. phase; Pink = Fixed acq. phase."
        >
          <GroupedBarChart
            data={exp1_ICvsTC_data}
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

      {/* 3.1.1.4.3 – Cross-experiment: TC vs IP */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">
          3.1.1.4.3 – Cross-Experiment: TC vs IP
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          LMM comparing temporal control (active [−]) vs identity prediction (passive [+]).
          Predictors: Condition Type, Acquisition Time (both ±1 coded). <strong>Dependent variable: Ratio.</strong>
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBadge label="Interaction χ²" value="101.71" sub="p < 0.001" highlight />
          <StatBadge label="Cond. Type β (TC)" value="−0.12" sub="SE=0.02, t=9.00" highlight />
          <StatBadge label="Cond. Type p" value="< 0.001" sub="Significant" />
          <StatBadge label="IP Overest." value="IP ↑ Ratio" sub="Overestimation" />
        </div>
        <ResultCard
          title="Figure 7 – Exp 1a vs 1b: TC vs IP Ratio"
          figureNum="Fig. 7"
          caption="X-axis: IP|Fixed, IP|Random, TC|Fixed, TC|Random. Y-axis: Ratio. Maroon = Random acq. phase; Pink = Fixed acq. phase."
        >
          <GroupedBarChart
            data={exp1_TCvsIP_data}
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
          <p>Participants <strong>overestimated</strong> the duration in the identity prediction blocks. Underestimation was greater in fixed temporal prediction and random temporal control blocks.</p>
        </div>
      </div>

      {/* Discussion */}
      <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6 text-sm text-violet-900 leading-relaxed">
        <h3 className="font-bold text-lg mb-2">3.1.1.5 Discussion</h3>
        <p>Temporal predictability and validity influenced the temporal binding effect. These findings partially failed to replicate Desantis et al. (2012). Congruency played a significant role — expected outcomes led to more underestimation. Underestimation was also more pronounced when the inter-event interval was fixed, contradicting the hypothesis that temporal prediction is not linked to temporal control. Identity control produced more underestimation than temporal control, even though both involve an action and causality component.</p>
      </div>
    </section>
  );
}
