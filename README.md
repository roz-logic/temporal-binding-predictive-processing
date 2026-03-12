# Temporal Binding & Predictive Processing
### Interactive Analysis Reference — MSc Thesis

> **Live app:** https://roz-logic.github.io/temporal-binding-predictive-processing/

---

## What this is

An interactive reference tool for the analyses, experimental design scripts, and statistical models used across all three experiments of the MSc thesis:

**"Temporal Binding and Predictive Processing: Dissociating Temporal Control from Temporal Prediction"**

---

## Five modes

| Mode | Contents |
|---|---|
| 🧪 **Exp 1 Design** | PsychoPy scripts for IC, TC, IP conditions — trial timelines, block switcher, code snippets |
| 🔬 **Exp 2/3 Design** | PsychoPy scripts for Exp 2/3 — catch trials, RT collection, tone scheduling, block variants |
| 📊 **LMM Exp 1** | R analysis code — 4 RATIO analyses, wrangling pipeline, contrast rationale |
| 📈 **LMM Exp 2/3** | R analysis code — 4 RATIO + 1 RT analysis, na.action notes, RT exclusion |
| 📉 **LMM Exp 3** | R analysis code — 5 RATIO + 1 RT analysis, 80/20 validity, three-way interaction |

---

## Experiment overview

| | Exp 1 | Exp 2 | Exp 3 |
|---|---|---|---|
| **N** | 10 | 41 (42−1) | 41 (44−3) |
| **Fixed IEI** | 550 ms | 650 ms | 650 ms |
| **Random IEI** | 0–1100 ms | 150–1150 ms | 150–1150 ms |
| **Acq. trials** | 50 | 30 | 30 |
| **Test trials** | 50 | 50 | 50 |
| **Catch trials** | No | Yes (20%) | Yes (20%) |
| **RT collected** | No | Yes | Yes |
| **Test validity** | Uncontrolled | 50/50 | 80/20 |

---

## Conditions

| Code | Name | Action | Validity | Notes |
|---|---|---|---|---|
| **IC** | Identity Control | ✅ Yes | ✅ Yes | Left→Red, Right→Green (100% acq) |
| **TC** | Temporal Control | ✅ Yes | ❌ No | Random colour always |
| **IP** | Identity Prediction | ❌ No | ✅ Yes | Tone-triggered, Low→Red, High→Green |

---

## Analyses (per experiment)

| Analysis | Conditions | DV | Key predictors |
|---|---|---|---|
| IC vs TC | Blocks 1,2,7,5 | RATIO | cond.type × acq.time |
| TC vs IP | Blocks 7,5,3,6 | RATIO | cond.type × acq.time |
| IC vs IP | Blocks 1,4,3,6 | RATIO | cond.type × acq.time × is_valid |
| Temporal Control | Blocks 0,2,5,7 | log(RATIO) | acq.time × test.time |
| RT (Exp 2/3 only) | IC + IP only | log(RT) | cond.type × acq.time × is_valid |

---

## Running locally

```bash
git clone https://github.com/roz-logic/temporal-binding-predictive-processing.git
cd temporal-binding-predictive-processing
npm install
npm run dev
```

Open `http://localhost:5173/temporal-binding-predictive-processing/`

---

## Deploying

```bash
npm run deploy
```

This runs `npm run build` then pushes `dist/` to the `gh-pages` branch automatically.

---

## Stack

- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Vite 7**
- **gh-pages** for deployment

---

## Reference

Peirce J, Gray JR, Simpson S, MacAskill M, Höchenberger R, Sogo H, Kastman E, Lindeløv JK. (2019)
PsychoPy2: Experiments in behavior made easy. *Behav Res* 51: 195.
https://doi.org/10.3758/s13428-018-01193-y
