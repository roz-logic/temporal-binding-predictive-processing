// ─── Experiment 1a (IC vs IP) ───────────────────────────────────────────────
export const exp1a_data = [
  // IC Fixed
  { block: "IC | Fixed", validity: "True",  ratio: 0.82 },
  { block: "IC | Fixed", validity: "False", ratio: 0.88 },
  // IC Random
  { block: "IC | Random", validity: "True",  ratio: 0.87 },
  { block: "IC | Random", validity: "False", ratio: 0.92 },
  // IP Fixed
  { block: "IP | Fixed", validity: "True",  ratio: 1.02 },
  { block: "IP | Fixed", validity: "False", ratio: 1.06 },
  // IP Random
  { block: "IP | Random", validity: "True",  ratio: 1.04 },
  { block: "IP | Random", validity: "False", ratio: 1.08 },
];

// ─── Experiment 1b (Temporal Control) ───────────────────────────────────────
export const exp1b_data = [
  { block: "TC | Fixed",  testTime: "Fixed",  logRatio: -0.12 },
  { block: "TC | Fixed",  testTime: "Random", logRatio: -0.03 },
  { block: "TC | Random", testTime: "Fixed",  logRatio: -0.09 },
  { block: "TC | Random", testTime: "Random", logRatio:  0.02 },
];

// ─── Experiment 1a vs 1b: IC vs TC ──────────────────────────────────────────
export const exp1_ICvsTC_data = [
  { block: "IC | Fixed",  acqTime: "Fixed",  ratio: 0.82 },
  { block: "IC | Fixed",  acqTime: "Random", ratio: 0.88 },
  { block: "IC | Random", acqTime: "Fixed",  ratio: 0.87 },
  { block: "IC | Random", acqTime: "Random", ratio: 0.92 },
  { block: "TC | Fixed",  acqTime: "Fixed",  ratio: 0.90 },
  { block: "TC | Fixed",  acqTime: "Random", ratio: 0.94 },
  { block: "TC | Random", acqTime: "Fixed",  ratio: 0.84 },
  { block: "TC | Random", acqTime: "Random", ratio: 0.97 },
];

// ─── Experiment 1a vs 1b: TC vs IP ──────────────────────────────────────────
export const exp1_TCvsIP_data = [
  { block: "IP | Fixed",  acqTime: "Fixed",  ratio: 1.02 },
  { block: "IP | Fixed",  acqTime: "Random", ratio: 1.06 },
  { block: "IP | Random", acqTime: "Fixed",  ratio: 1.04 },
  { block: "IP | Random", acqTime: "Random", ratio: 1.08 },
  { block: "TC | Fixed",  acqTime: "Fixed",  ratio: 0.90 },
  { block: "TC | Fixed",  acqTime: "Random", ratio: 0.94 },
  { block: "TC | Random", acqTime: "Fixed",  ratio: 0.84 },
  { block: "TC | Random", acqTime: "Random", ratio: 0.97 },
];

// ─── Experiment 2a (IC vs IP) ───────────────────────────────────────────────
export const exp2a_data = [
  { block: "IC | Fixed",  validity: "True",  ratio: 0.78 },
  { block: "IC | Fixed",  validity: "False", ratio: 0.82 },
  { block: "IC | Random", validity: "True",  ratio: 0.84 },
  { block: "IC | Random", validity: "False", ratio: 0.86 },
  { block: "IP | Fixed",  validity: "True",  ratio: 1.05 },
  { block: "IP | Fixed",  validity: "False", ratio: 1.07 },
  { block: "IP | Random", validity: "True",  ratio: 1.10 },
  { block: "IP | Random", validity: "False", ratio: 1.12 },
];

// ─── Experiment 2a RT ───────────────────────────────────────────────────────
export const exp2a_rt_data = [
  { block: "IC | Fixed",  validity: "True",  logRT: 5.62 },
  { block: "IC | Fixed",  validity: "False", logRT: 5.66 },
  { block: "IC | Random", validity: "True",  logRT: 5.64 },
  { block: "IC | Random", validity: "False", logRT: 5.68 },
  { block: "IP | Fixed",  validity: "True",  logRT: 5.80 },
  { block: "IP | Fixed",  validity: "False", logRT: 5.82 },
  { block: "IP | Random", validity: "True",  logRT: 5.78 },
  { block: "IP | Random", validity: "False", logRT: 5.84 },
];

// ─── Experiment 2b (Temporal Control) ───────────────────────────────────────
export const exp2b_data = [
  { block: "TC | Fixed",  testTime: "Fixed",  logRatio: -0.08 },
  { block: "TC | Fixed",  testTime: "Random", logRatio: -0.01 },
  { block: "TC | Random", testTime: "Fixed",  logRatio: -0.06 },
  { block: "TC | Random", testTime: "Random", logRatio:  0.01 },
];

// ─── Experiment 2a vs 2b: IC vs TC ──────────────────────────────────────────
export const exp2_ICvsTC_data = [
  { block: "IC | Fixed",  acqTime: "Fixed",  ratio: 0.78 },
  { block: "IC | Fixed",  acqTime: "Random", ratio: 0.82 },
  { block: "IC | Random", acqTime: "Fixed",  ratio: 0.84 },
  { block: "IC | Random", acqTime: "Random", ratio: 0.86 },
  { block: "TC | Fixed",  acqTime: "Fixed",  ratio: 0.92 },
  { block: "TC | Fixed",  acqTime: "Random", ratio: 0.95 },
  { block: "TC | Random", acqTime: "Fixed",  ratio: 0.85 },
  { block: "TC | Random", acqTime: "Random", ratio: 0.98 },
];

// ─── Experiment 2a vs 2b: TC vs IP ──────────────────────────────────────────
export const exp2_TCvsIP_data = [
  { block: "IP | Fixed",  acqTime: "Fixed",  ratio: 1.05 },
  { block: "IP | Fixed",  acqTime: "Random", ratio: 1.07 },
  { block: "IP | Random", acqTime: "Fixed",  ratio: 1.10 },
  { block: "IP | Random", acqTime: "Random", ratio: 1.12 },
  { block: "TC | Fixed",  acqTime: "Fixed",  ratio: 0.92 },
  { block: "TC | Fixed",  acqTime: "Random", ratio: 0.95 },
  { block: "TC | Random", acqTime: "Fixed",  ratio: 0.85 },
  { block: "TC | Random", acqTime: "Random", ratio: 0.98 },
];

// ─── Experiment 3a (IC vs IP) ───────────────────────────────────────────────
export const exp3a_data = [
  { block: "IC | Fixed",  validity: "True",  ratio: 0.80 },
  { block: "IC | Fixed",  validity: "False", ratio: 0.83 },
  { block: "IC | Random", validity: "True",  ratio: 0.76 },
  { block: "IC | Random", validity: "False", ratio: 0.79 },
  { block: "IP | Fixed",  validity: "True",  ratio: 1.06 },
  { block: "IP | Fixed",  validity: "False", ratio: 1.09 },
  { block: "IP | Random", validity: "True",  ratio: 1.08 },
  { block: "IP | Random", validity: "False", ratio: 1.11 },
];

// ─── Experiment 3a RT ───────────────────────────────────────────────────────
export const exp3a_rt_data = [
  { block: "IC | Fixed",  validity: "True",  logRT: 5.58 },
  { block: "IC | Fixed",  validity: "False", logRT: 5.64 },
  { block: "IC | Random", validity: "True",  logRT: 5.60 },
  { block: "IC | Random", validity: "False", logRT: 5.66 },
  { block: "IP | Fixed",  validity: "True",  logRT: 5.76 },
  { block: "IP | Fixed",  validity: "False", logRT: 5.80 },
  { block: "IP | Random", validity: "True",  logRT: 5.74 },
  { block: "IP | Random", validity: "False", logRT: 5.82 },
];

// ─── Experiment 3b (Temporal Control) ───────────────────────────────────────
export const exp3b_data = [
  { block: "TC | Fixed",  testTime: "Fixed",  logRatio: -0.10 },
  { block: "TC | Fixed",  testTime: "Random", logRatio: -0.02 },
  { block: "TC | Random", testTime: "Fixed",  logRatio: -0.07 },
  { block: "TC | Random", testTime: "Random", logRatio:  0.00 },
];

// ─── Experiment 3a vs 3b: IC vs TC  (DV = log ratio per thesis) ─────────────
export const exp3_ICvsTC_data = [
  { block: "IC | Fixed",  acqTime: "Fixed",  logRatio: -0.09 },
  { block: "IC | Fixed",  acqTime: "Random", logRatio: -0.05 },
  { block: "IC | Random", acqTime: "Fixed",  logRatio: -0.13 },
  { block: "IC | Random", acqTime: "Random", logRatio: -0.08 },
  { block: "TC | Fixed",  acqTime: "Fixed",  logRatio: -0.11 },
  { block: "TC | Fixed",  acqTime: "Random", logRatio: -0.04 },
  { block: "TC | Random", acqTime: "Fixed",  logRatio: -0.06 },
  { block: "TC | Random", acqTime: "Random", logRatio: -0.02 },
];

// ─── Experiment 3a vs 3b: TC vs IP  (DV = log ratio per thesis §3.3.1.4.3) ──
export const exp3_TCvsIP_data = [
  { block: "IP | Fixed",  acqTime: "Fixed",  logRatio:  0.08 },
  { block: "IP | Fixed",  acqTime: "Random", logRatio:  0.04 },
  { block: "IP | Random", acqTime: "Fixed",  logRatio:  0.10 },
  { block: "IP | Random", acqTime: "Random", logRatio:  0.05 },
  { block: "TC | Fixed",  acqTime: "Fixed",  logRatio: -0.11 },
  { block: "TC | Fixed",  acqTime: "Random", logRatio: -0.04 },
  { block: "TC | Random", acqTime: "Fixed",  logRatio: -0.06 },
  { block: "TC | Random", acqTime: "Random", logRatio: -0.18 },
];
