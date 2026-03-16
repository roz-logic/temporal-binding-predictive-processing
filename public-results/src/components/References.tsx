const refs = [
  "Bednark, J. G., Reynolds, J. N. J., Stafford, T., Redgrave, P., & Franz, E. A. (2015). Making it your own: Somatosensory activations during action-outcome learning. Journal of Neurophysiology, 113(5), 1807–1815.",
  "Desantis, A., Roussel, C., & Waszak, F. (2012). On the influence of causal beliefs on the feeling of agency. Consciousness and Cognition, 21(3), 1456–1464.",
  "Haering, C., & Kiesel, A. (2014). Mine is earlier than yours: Causal beliefs influence the perceived time of action effects. Frontiers in Psychology, 5, 1–9.",
  "Hoerl, C., McCormack, T., & Butterfill, S. (2020). Action, causal knowledge, and causal reasoning. Cognition, 204, 104399.",
  "Humphreys, G. R., & Buehner, M. J. (2010). Temporal binding of action and effect in interval reproduction. Experimental Brain Research, 203(2), 465–470.",
  "Peirce, J. W., Gray, J. R., Simpson, S., MacAskill, M. R., Höchenberger, R., Sogo, H., Kastman, E., & Lindeløv, J. K. (2019). PsychoPy2: Experiments in behavior made easy. Behavior Research Methods, 51(1), 195–203.",
  "Wolfensteller, U., & Ruge, H. (2011). Frontostriatal mechanisms in instruction-based learning as a hallmark of flexible goal-directed behavior. Human Brain Mapping, 32(4), 582–600.",
];

export default function References() {
  return (
    <section id="references" className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">References</h2>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <ul className="space-y-4">
          {refs.map((ref, i) => (
            <li key={i} className="text-sm text-slate-600 leading-relaxed pl-6 relative before:absolute before:left-0 before:top-0 before:text-slate-400 before:font-medium before:content-['–']">
              {ref}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
