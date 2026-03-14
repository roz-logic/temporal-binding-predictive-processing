# Contributing & Reproducing

This document explains how to run the PsychoPy experiment scripts and switch between block configurations.

---

## Running the Python scripts

Install PsychoPy via the standalone installer: https://www.psychopy.org/download.html

Each script covers one condition type (IC, TC, or IP) across two block variants that differ only in acquisition-phase timing. The block variant is selected by commenting/uncommenting two lines inside the script before running.

---

## Switching block configurations

Every PsychoPy script has a `get_acquisition_interval()` function near the top. To switch between the Fixed (FF) and Random (RF) acquisition variant:

**Fixed acquisition (FF) — default as committed:**
```python
def get_acquisition_interval(trial_dict):
    # return trial_dict['wait_duration_before_circle']   # ← UNCOMMENT for Random
    return FIXED_IEI_S                                    # ← COMMENT OUT for Random
```

**Random acquisition (RF):**
```python
def get_acquisition_interval(trial_dict):
    return trial_dict['wait_duration_before_circle']      # ← Random IEI from CSV
    # return FIXED_IEI_S                                  # ← COMMENT OUT for Fixed
```

The Temporal Control scripts have a second function `get_test_interval()` that works the same way, covering the four TC block variants (RR, FR, RF, FF).

---

## Block–script mapping

| Block | Script | Acq | Test | Change needed |
|---|---|---|---|---|
| IC-FF | `exp_identity_control.py` | Fixed | Fixed | None (default) |
| IC-RF | `exp_identity_control.py` | Random | Fixed | Swap `get_acquisition_interval()` |
| IP-FF | `exp_identity_prediction.py` | Fixed | Fixed | None (default) |
| IP-RF | `exp_identity_prediction.py` | Random | Fixed | Swap `get_acquisition_interval()` |
| TC-FF | `exp_temporal_control.py` | Fixed | Fixed | None (default) |
| TC-RF | `exp_temporal_control.py` | Random | Fixed | Swap `get_acquisition_interval()` |
| TC-FR | `exp_temporal_control.py` | Fixed | Random | Swap `get_test_interval()` |
| TC-RR | `exp_temporal_control.py` | Random | Random | Swap both functions |

The same table applies to Exp 1, 2, and 3 scripts. Exp 1 scripts use `csv--Cond (0- 1.1).csv` (0–1100 ms range); Exp 2 and 3 use `csv--Cond (150- 1150).csv` (150–1150 ms range).

---

## Data files

| File | Experiment | N |
|---|---|---|
| `data/exp1_data_n10.csv` | Experiment 1 | 10 |
| `data/exp2_data_n41.csv` | Experiment 2 | 41 (42 − 1 excluded) |
| `data/exp3_data_n41.csv` | Experiment 3 | 41 (44 − 3 excluded) |
| `data/conditions_0_1100ms.csv` | Exp 1 random IEI conditions | — |
| `data/conditions_150_1150ms.csv` | Exp 2/3 random IEI conditions | — |
| `data/practice_trials.csv` | Practice phase (all experiments) | — |

---

## Running the R scripts

```r
install.packages(c("here", "tidyverse", "lme4", "afex", "car"))
```

Set working directory to repo root. All paths use `here::here()`. Run scripts in any order — they are independent.

```r
source("scripts/exp1/exp1_LMM_RATIO_analysis.R")
source("scripts/exp2/exp2_RATIO_LMM_analysis.R")
source("scripts/exp2/exp2_reaction-time_LMM_analysis.R")
source("scripts/exp3/exp3_RATIO_LMM_analysis.R")
source("scripts/exp3/exp3_reaction-time_LMM_analysis.R")
```

Figures are saved to `figures/` at 300 dpi automatically. The `figures/` directory is not tracked in git.
