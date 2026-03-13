// ─────────────────────────────────────────────────────────────────────────────
// Experiment 2 — LMM Analysis Reference Data
// n = 41 participants (one excluded from n=42 original)
// DV1: RATIO (reproduced_duration / target_duration)  — all 4 analyses
// DV2: log(space_RT) in ms                            — RT analyses (IC + IP only)
// Fixed IEI: 650 ms | Random IEI: 150–1150 ms (changed from 0–1100 ms in Exp 1)
// Test congruency: 50/50 (Exp 2) → 80/20 (Exp 3, same script)
// NEW vs Exp 1: catch trials · RT collected · larger n · na.action = na.exclude
// ─────────────────────────────────────────────────────────────────────────────

export interface CodeSnippet {
  label: string;
  code: string;
  note?: string;
}

export interface AnalysisBlock2 {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  badge: string;
  description: string;
  design: string;
  dv: string;
  predictors: string[];
  randomStructure: string;
  contrastCoding: string;
  naAction: string;
  steps: {
    heading: string;
    items: { label: string; detail?: string; result: string }[];
  }[];
  winningModel: string;
  snippets: CodeSnippet[];
  notes: string[];
}

// ─── Libraries ───────────────────────────────────────────────────────────────
export const libraries2Code = `library(tidyverse)
library(lme4)
library(car)
library(afex)
library(jtools)
library(kableExtra)
library(writexl)`;

// ─── Wrangling: RATIO analyses ────────────────────────────────────────────────
export const wrangling2RatioCode = `# ══════════════════════════════════════════════════════════════════════════════
# Experiment 2 — RATIO analysis wrangling (n = 41)
# NOTE: RT exclusion was done manually in Excel for Exp 2.
#       In Exp 3 the code below handles exclusion directly.
# ══════════════════════════════════════════════════════════════════════════════

# ── 1. Read raw data ───────────────────────────────────────────────────────────
exp2_dat <- read.csv("Exp2_data_n41_full.csv", header = TRUE) |> tibble()

# ── 2. Helper functions ────────────────────────────────────────────────────────
s_to_ms        <- function(x) x * 1000
rt_excluded    <- function(x) ifelse(x < 100 | x > 2000, NA, x)   # excludes 100 & 2000
# NOTE: strict inequality — 100 ms and 2000 ms themselves are kept
#       Excel-level exclusion was stricter (≤100 / ≥2000) — counts differ by ~21

# trial_excluded removes space_pressed_duration / DIFFERENCE for trials
# where space_RT was already set to NA (RT out of range → whole trial excluded)
trial_excluded <- function(df) {
  df |> mutate(across(c(is_valid, space_pressed_duration, DIFFERENCE),
                      ~ ifelse(is.na(space_RT), NA, .)))
}

# ── 3. Clean & convert units ───────────────────────────────────────────────────
exp2_clean <- exp2_dat |>
  select(-RATIO, -ABS.ERROR, -Avg.underest..percentage.,
         -LOG_RT, -X, -X.1, -X.2, -X.3, -X.4, -X.5) |>
  mutate(across(c(wait_duration_before_circle, space_pressed_duration,
                  space_RT, DIFFERENCE), ~ s_to_ms(as.numeric(.)))) |>
  mutate(space_RT = rt_excluded(space_RT)) |>
  trial_excluded()

# Missing after cleaning: ~495 RT values + 1 technical error
# (ESK participant, 4-Motor-RF block: space_pressed_duration = 4880 ms)
sum(is.na(exp2_clean$space_RT))   # should be ~495

# ── 4. Condition labels ────────────────────────────────────────────────────────
exp2_clean <- exp2_clean |>
  mutate(
    cond_type = case_when(
      condition %in% c("1-Motor-FF", "4-Motor-RF")           ~ "IC",
      condition %in% c("0-Control-RR", "2-Control-FR",
                       "5-Control-RF", "7-Control-FF")       ~ "TC",
      condition %in% c("3-Prediction-FF", "6-Prediction-RF") ~ "IP"
    ),
    acq_time  = ifelse(condition %in% c("5-Control-RF", "4-Motor-RF",
                                        "6-Prediction-RF", "0-Control-RR"),
                       "random", "fixed"),
    test_time = ifelse(condition %in% c("2-Control-FR", "0-Control-RR"),
                       "random", "fixed")
  ) |>
  mutate(across(c(condition, is_valid, cond_type, acq_time, test_time), as.factor))

# ── 5. Derived DVs ────────────────────────────────────────────────────────────
exp2_clean <- exp2_clean |>
  mutate(
    RATIO     = space_pressed_duration / wait_duration_before_circle,
    log_RATIO = log(RATIO),
    RRE       = (space_pressed_duration - wait_duration_before_circle) /
                  wait_duration_before_circle,
    AV_und    = (wait_duration_before_circle - space_pressed_duration) /
                  wait_duration_before_circle,
    Diff      = space_pressed_duration - wait_duration_before_circle
  )

# ── 6. Analysis subsets ───────────────────────────────────────────────────────
MC   <- exp2_clean |> filter(condition %in% c("1-Motor-FF",   "4-Motor-RF",
                                               "7-Control-FF", "5-Control-RF"))
CP   <- exp2_clean |> filter(condition %in% c("3-Prediction-FF", "6-Prediction-RF",
                                               "7-Control-FF",    "5-Control-RF"))
MvP  <- exp2_clean |> filter(cond_type %in% c("IC", "IP"))
TC   <- exp2_clean |> filter(cond_type == "TC")

# ── 7. Sum contrast coding ────────────────────────────────────────────────────
# na.action = na.exclude is critical: with missing RT data, na.omit changes
# the number of rows and breaks residual-based outlier trimming.
# na.exclude inserts NA residuals for missing rows so lengths always match.

set_sum_contrasts <- function(df, vars) {
  for (v in vars) contrasts(df[[v]]) <- contr.sum(nlevels(df[[v]]))
  df
}

MC  <- set_sum_contrasts(MC,  c("cond_type", "acq_time"))
CP  <- set_sum_contrasts(CP,  c("cond_type", "acq_time"))
MvP <- set_sum_contrasts(MvP, c("cond_type", "acq_time", "is_valid"))
TC  <- set_sum_contrasts(TC,  c("acq_time", "test_time"))

# ── 8. Outlier trimming helper ────────────────────────────────────────────────
trim_by_resid <- function(data, model, z_thresh = 2.5) {
  data[abs(scale(resid(model))) < z_thresh, ]
}
# Usage: MC_trimmed <- trim_by_resid(MC, mc_final)
# IMPORTANT: always trim from the SAME dataset the model was fit on`;

// ─── Wrangling: RT analyses ───────────────────────────────────────────────────
export const wrangling2RTCode = `# ══════════════════════════════════════════════════════════════════════════════
# Experiment 2 — RT analysis wrangling (IC + IP only; TC excluded)
# DV: log(space_RT) — reaction time from keypress to space-bar press onset
# TC blocks have no is_valid column → excluded from RT analyses
# ══════════════════════════════════════════════════════════════════════════════

# ── Build RT dataset (IC + IP only) ──────────────────────────────────────────
exp2_RT <- exp2_dat |>
  select(-RATIO, -ABS.ERROR, -Avg.underest..percentage.,
         -LOG_RT, -X, -X.1, -X.2, -X.3, -X.4, -X.5) |>
  filter(!condition %in% c("0-Control-RR", "2-Control-FR",
                            "5-Control-RF", "7-Control-FF")) |>
  mutate(across(c(wait_duration_before_circle, space_pressed_duration,
                  space_RT, DIFFERENCE), ~ s_to_ms(as.numeric(.)))) |>
  mutate(space_RT = rt_excluded(space_RT)) |>
  trial_excluded() |>
  mutate(
    cond_type = case_when(
      condition %in% c("1-Motor-FF", "4-Motor-RF")           ~ "IC",
      condition %in% c("3-Prediction-FF", "6-Prediction-RF") ~ "IP"
    ),
    acq_time = ifelse(condition %in% c("4-Motor-RF", "6-Prediction-RF"),
                      "random", "fixed"),
    log_space_RT = log(space_RT)
  ) |>
  mutate(across(c(is_valid, cond_type, acq_time), as.factor))

# Missing RT: ~274 + 1 (ESK technical error)
sum(is.na(exp2_RT$space_RT))

# Sum contrasts
exp2_RT <- set_sum_contrasts(exp2_RT, c("cond_type", "acq_time", "is_valid"))

# NOTE on my_random() in the PsychoPy script:
#   is_valid = my_random(trialsLoop) > 0.5   →  ~50/50 split (Exp 2)
#   is_valid = my_random(trialsLoop) > 0.8   →  ~80/20 split (Exp 3)
# This deterministic function ensures balanced congruency per participant.`;

// ─── Contrast rationale (shared) ─────────────────────────────────────────────
export const contrastRationale2 = {
  heading: "Contrast coding & na.action",
  body: [
    "Sum (deviation) coding used throughout — centres predictors at zero, making the intercept interpretable as the grand mean. Conclusions from LRT are largely invariant to contrast choice.",
    "na.action = na.exclude (not na.omit) is essential in Exp 2 because ~495 trials have missing space_RT. na.exclude inserts NA residuals so that resid(model) and nrow(data) always match, allowing residual-based outlier trimming.",
    "Outlier trimming: observations where |standardised residual| > 2.5 are removed. Always use the same dataset the final model was fit on, not an intermediate model.",
    "TC blocks have no is_valid column (colour is always random). Do not include is_valid in TC analyses — contrast matrix would become 3-level.",
  ],
};

// ─── Analysis blocks ─────────────────────────────────────────────────────────
export const analyses2: AnalysisBlock2[] = [

  // ── RATIO Analysis 1: IC vs. TC ──────────────────────────────────────────
  {
    id: "mc2",
    title: "IC vs. TC — RATIO",
    subtitle: "Identity Control (Motor) vs. Temporal Control · Reproduced / Target",
    color: "violet",
    badge: "RATIO Analysis 1",
    description:
      "Compares Identity Control (IC) against Temporal Control (TC) blocks on reproduced interval ratio. Tests whether motor timing experience drives binding beyond mere temporal exposure. Exp 2 adds catch trials and RT collection but the RATIO structure mirrors Exp 1.",
    design: "2 × 2 (Condition Type × Acquisition Timing)",
    dv: "RATIO = space_pressed_duration / wait_duration_before_circle",
    predictors: ["cond_type (IC vs. TC)", "acq_time (fixed vs. random)"],
    randomStructure: "(1 + cond_type + acq_time | participant)",
    contrastCoding: "Sum contrasts",
    naAction: "na.action = na.exclude",
    steps: [
      {
        heading: "Fixed-effects forward selection (LRT, REML = FALSE)",
        items: [
          { label: "m0 → m1: add cond_type",             result: "✅ Significant" },
          { label: "m1 → m2: add acq_time",              result: "❌ Not significant" },
          { label: "m1 → m3: add cond_type × acq_time",  result: "✅ Significant" },
        ],
      },
      {
        heading: "Random-effects selection (REML = TRUE, refit = FALSE)",
        items: [
          { label: "Intercept → + cond_type slope",  result: "✅ Needed" },
          { label: "+ cond_type → + acq_time slope", result: "✅ Needed" },
        ],
      },
    ],
    winningModel: "RATIO ~ cond_type * acq_time + (1 + cond_type + acq_time | participant)",
    snippets: [
      {
        label: "Forward selection",
        code: `# ── Fixed-effects forward selection ─────────────────────────────────────────
m0_mc <- lmer(RATIO ~ 1 +
                (1 + cond_type + acq_time | participant),
              data = MC, REML = FALSE, na.action = na.exclude)

m1_mc <- lmer(RATIO ~ cond_type +
                (1 + cond_type + acq_time | participant),
              data = MC, REML = FALSE, na.action = na.exclude)

m2_mc <- lmer(RATIO ~ cond_type + acq_time +
                (1 + cond_type + acq_time | participant),
              data = MC, REML = FALSE, na.action = na.exclude)

m3_mc <- lmer(RATIO ~ cond_type * acq_time +
                (1 + cond_type + acq_time | participant),
              data = MC, REML = FALSE, na.action = na.exclude)

anova(m0_mc, m1_mc)   # cond_type sig ✅
anova(m1_mc, m2_mc)   # acq_time  not sig ❌
anova(m1_mc, m3_mc)   # interaction sig ✅  (skip m2; test from m1)

# ── Random-effects selection ──────────────────────────────────────────────────
r1_mc <- lmer(RATIO ~ cond_type * acq_time +
                (1 | participant),
              data = MC, REML = TRUE, na.action = na.exclude)

r2_mc <- lmer(RATIO ~ cond_type * acq_time +
                (1 + cond_type | participant),
              data = MC, REML = TRUE, na.action = na.exclude)

r3_mc <- lmer(RATIO ~ cond_type * acq_time +
                (1 + cond_type + acq_time | participant),
              data = MC, REML = TRUE, na.action = na.exclude)

anova(r1_mc, r2_mc, refit = FALSE)   # cond_type slope needed ✅
anova(r2_mc, r3_mc, refit = FALSE)   # acq_time  slope needed ✅

mc2_final <- r3_mc
summary(mc2_final)$coef`,
        note: "na.action = na.exclude ensures resid(model) length matches nrow(MC) even with missing RT trials. Critical for trimming.",
      },
      {
        label: "Outlier trim & robustness",
        code: `# Trim |z| > 2.5 using mc2_final residuals
MC_trimmed <- trim_by_resid(MC, mc2_final)

mc2_trimmed <- lmer(RATIO ~ cond_type * acq_time +
                      (1 + cond_type + acq_time | participant),
                    data = MC_trimmed, REML = TRUE, na.action = na.exclude)
summary(mc2_trimmed)$coef`,
      },
      {
        label: "afex confirmation",
        code: `afex_mc2 <- mixed(
  RATIO ~ cond_type * acq_time +
    (1 + cond_type + acq_time | participant),
  data   = MC,
  method = "LRT",
  na.action = na.exclude
)
afex_mc2`,
      },
      {
        label: "Backward selection cross-check",
        code: `full_mc2 <- lmer(RATIO ~ cond_type * acq_time +
                   (1 + cond_type + acq_time | participant),
                 data = CP, REML = FALSE, na.action = na.exclude)

red1_mc2 <- lmer(RATIO ~ cond_type + acq_time +
                   (1 + cond_type + acq_time | participant),
                 data = CP, REML = FALSE, na.action = na.exclude)

anova(full_mc2, red1_mc2)   # interaction sig ✅

red2_mc2 <- update(red1_mc2, . ~ . - acq_time)
red3_mc2 <- update(red1_mc2, . ~ . - cond_type)
anova(red1_mc2, red2_mc2)   # cond_type NOT sig ❌  (CP dataset)
anova(red1_mc2, red3_mc2)   # acq_time  sig ✅`,
      },
      {
        label: "Assumption diagnostics",
        code: `car::vif(mc2_final)
acf(resid(mc2_final))
hist(resid(mc2_final))
plot(density(resid(mc2_final)))
qqnorm(resid(mc2_final)); qqline(resid(mc2_final))
plot(fitted(mc2_final), resid(mc2_final))`,
      },
    ],
    notes: [
      "acq_time is not significant as a main effect but its interaction with cond_type is — retain both terms.",
      "na.action = na.exclude is new in Exp 2 (no missing data in Exp 1). Without it, resid() returns fewer rows than nrow(MC) and trimming breaks.",
      "With n = 41 the random structure is better supported than in Exp 1 (n = 10); singularity less likely but still possible.",
    ],
  },

  // ── RATIO Analysis 2: TC vs. IP ──────────────────────────────────────────
  {
    id: "cp2",
    title: "TC vs. IP — RATIO",
    subtitle: "Temporal Control vs. Identity Prediction · Reproduced / Target",
    color: "sky",
    badge: "RATIO Analysis 2",
    description:
      "Tests whether learned tone-colour prediction (IP) shifts temporal binding relative to matched control blocks (TC). Key result: interaction significant in Exp 2 — acq_time becomes a significant main effect unlike Exp 1.",
    design: "2 × 2 (Condition Type × Acquisition Timing)",
    dv: "RATIO",
    predictors: ["cond_type (IP vs. TC)", "acq_time (fixed vs. random)"],
    randomStructure: "(1 + cond_type + acq_time | participant)",
    contrastCoding: "Sum contrasts",
    naAction: "na.action = na.exclude",
    steps: [
      {
        heading: "Fixed-effects forward selection",
        items: [
          { label: "add cond_type",             result: "✅ Significant" },
          { label: "add acq_time",              result: "✅ Significant" },
          { label: "add cond_type × acq_time",  result: "✅ Significant" },
        ],
      },
      {
        heading: "Random-effects selection",
        items: [
          { label: "Intercept → + cond_type slope",  result: "✅ Needed" },
          { label: "+ cond_type → + acq_time slope", result: "✅ Needed" },
        ],
      },
    ],
    winningModel: "RATIO ~ cond_type * acq_time + (1 + cond_type + acq_time | participant)",
    snippets: [
      {
        label: "Forward selection",
        code: `m0_cp <- lmer(RATIO ~ 1 +
                (1 + cond_type + acq_time | participant),
              data = CP, REML = FALSE, na.action = na.exclude)

m1_cp <- lmer(RATIO ~ cond_type +
                (1 + cond_type + acq_time | participant),
              data = CP, REML = FALSE, na.action = na.exclude)

m2_cp <- lmer(RATIO ~ cond_type + acq_time +
                (1 + cond_type + acq_time | participant),
              data = CP, REML = FALSE, na.action = na.exclude)

m3_cp <- lmer(RATIO ~ cond_type * acq_time +
                (1 + cond_type + acq_time | participant),
              data = CP, REML = FALSE, na.action = na.exclude)

anova(m0_cp, m1_cp)   # cond_type sig ✅
anova(m1_cp, m2_cp)   # acq_time  sig ✅  (differs from Exp 1)
anova(m2_cp, m3_cp)   # interaction sig ✅

# Random effects
r1_cp <- lmer(RATIO ~ cond_type * acq_time + (1 | participant),
              data = CP, REML = TRUE, na.action = na.exclude)
r2_cp <- lmer(RATIO ~ cond_type * acq_time + (1 + cond_type | participant),
              data = CP, REML = TRUE, na.action = na.exclude)
r3_cp <- lmer(RATIO ~ cond_type * acq_time +
                (1 + cond_type + acq_time | participant),
              data = CP, REML = TRUE, na.action = na.exclude)

anova(r1_cp, r2_cp, refit = FALSE)
anova(r2_cp, r3_cp, refit = FALSE)

cp2_final <- r3_cp
summary(cp2_final)$coef`,
      },
      {
        label: "Backward selection cross-check",
        code: `full_cp2 <- lmer(RATIO ~ cond_type * acq_time +
                   (1 + cond_type + acq_time | participant),
                 data = CP, REML = FALSE, na.action = na.exclude)

red1_cp2 <- lmer(RATIO ~ cond_type + acq_time +
                   (1 + cond_type + acq_time | participant),
                 data = CP, REML = FALSE, na.action = na.exclude)
anova(full_cp2, red1_cp2)   # interaction sig ✅

red2_cp2 <- update(red1_cp2, . ~ . - acq_time)
red3_cp2 <- update(red1_cp2, . ~ . - cond_type)
anova(red1_cp2, red2_cp2)   # cond_type NOT sig ❌ (backward)
anova(red1_cp2, red3_cp2)   # acq_time sig ✅`,
        note: "If convergence fails, add control = lmerControl(optimizer = 'bobyqa').",
      },
      {
        label: "afex confirmation",
        code: `afex_cp2 <- mixed(
  RATIO ~ cond_type * acq_time +
    (1 + cond_type + acq_time | participant),
  data   = CP,
  method = "LRT",
  na.action = na.exclude
)
afex_cp2`,
      },
    ],
    notes: [
      "acq_time becomes significant in Exp 2 unlike Exp 1 — likely a power effect (n = 41 vs. n = 10).",
      "afex may warn about convergence with complex random structure; bobyqa resolves most cases.",
      "Backward and forward selection converge on the same winning model.",
    ],
  },

  // ── RATIO Analysis 3: IC vs. IP ──────────────────────────────────────────
  {
    id: "mvp2",
    title: "IC vs. IP — RATIO",
    subtitle: "Identity Control (Motor) vs. Identity Prediction · includes is_valid",
    color: "emerald",
    badge: "RATIO Analysis 3",
    description:
      "Contrasts IC and IP blocks with trial validity (is_valid) as an additional predictor. Winning model: cond_type × acq_time interaction; is_valid and its interactions not significant in Exp 2.",
    design: "2 × 2 × 2 (Condition Type × Acquisition Timing × Trial Validity)",
    dv: "RATIO",
    predictors: ["cond_type (IC vs. IP)", "acq_time (fixed vs. random)", "is_valid"],
    randomStructure: "(1 + cond_type + acq_time | participant)",
    contrastCoding: "Sum contrasts on all three predictors",
    naAction: "na.action = na.exclude",
    steps: [
      {
        heading: "Fixed-effects forward selection",
        items: [
          { label: "add cond_type",                  result: "✅ Significant" },
          { label: "add acq_time",                   result: "✅ Significant" },
          { label: "add cond_type × acq_time",       result: "✅ Significant" },
          { label: "add is_valid",                   result: "❌ Not significant" },
          { label: "add cond_type × is_valid",       result: "❌ Not significant" },
          { label: "add acq_time × is_valid",        result: "❌ Not significant" },
          { label: "add three-way interaction",      result: "❌ Not significant" },
        ],
      },
      {
        heading: "Random-effects selection",
        items: [
          { label: "Intercept → + cond_type slope",             result: "✅ Needed" },
          { label: "+ cond_type → + acq_time slope",            result: "✅ Needed" },
          { label: "+ acq_time → + is_valid slope",             result: "⚠️ Singular — excluded" },
        ],
      },
    ],
    winningModel: "RATIO ~ cond_type * acq_time + (1 + cond_type + acq_time | participant)",
    snippets: [
      {
        label: "Forward selection",
        code: `# Forward selection with trimmed data first
# NOTE: trim using a preliminary model fit on MvP

preliminary_mvp <- lmer(RATIO ~ cond_type + acq_time +
                           (1 + cond_type + acq_time | participant),
                         data = MvP, REML = FALSE, na.action = na.exclude)

MvP_trimmed <- trim_by_resid(MvP, preliminary_mvp)

# ── Fixed effects ─────────────────────────────────────────────────────────────
ma0 <- lmer(RATIO ~ 1 +
              (1 + cond_type + acq_time | participant),
            data = MvP_trimmed, REML = FALSE, na.action = na.exclude)

ma1 <- lmer(RATIO ~ cond_type +
              (1 + cond_type + acq_time | participant),
            data = MvP_trimmed, REML = FALSE, na.action = na.exclude)

ma2 <- lmer(RATIO ~ cond_type + acq_time +
              (1 + cond_type + acq_time | participant),
            data = MvP_trimmed, REML = FALSE,
            na.action = na.exclude,
            control = lmerControl(optimizer = "bobyqa"))

ma3 <- lmer(RATIO ~ cond_type * acq_time +
              (1 + cond_type + acq_time | participant),
            data = MvP_trimmed, REML = FALSE, na.action = na.exclude)

anova(ma0, ma1)   # cond_type sig ✅
anova(ma1, ma2)   # acq_time  sig ✅
anova(ma2, ma3)   # interaction sig ✅

# Add is_valid and its interactions
ma4 <- lmer(RATIO ~ cond_type * acq_time + is_valid +
              (1 + cond_type + acq_time | participant),
            data = MvP_trimmed, REML = FALSE, na.action = na.exclude)
anova(ma3, ma4)   # is_valid NOT sig ❌

ma5  <- update(ma3, . ~ cond_type + is_valid + acq_time + .)
ma6  <- lmer(RATIO ~ cond_type * is_valid +
               (1 + cond_type + acq_time | participant),
             data = MvP_trimmed, REML = FALSE, na.action = na.exclude)
anova(ma5, ma6)   # cond_type × is_valid NOT sig ❌

ma7  <- lmer(RATIO ~ acq_time + is_valid +
               (1 + cond_type + acq_time | participant),
             data = MvP_trimmed, REML = FALSE, na.action = na.exclude)
ma8  <- lmer(RATIO ~ acq_time * is_valid +
               (1 + cond_type + acq_time | participant),
             data = MvP_trimmed, REML = FALSE, na.action = na.exclude)
anova(ma7, ma8)   # acq_time × is_valid NOT sig ❌

ma9  <- lmer(RATIO ~ cond_type + acq_time + is_valid +
               cond_type:acq_time + cond_type:is_valid + acq_time:is_valid +
               (1 + cond_type + acq_time | participant),
             data = MvP_trimmed, REML = FALSE, na.action = na.exclude)
ma10 <- lmer(RATIO ~ cond_type * acq_time * is_valid +
               (1 + cond_type + acq_time | participant),
             data = MvP_trimmed, REML = FALSE, na.action = na.exclude)
anova(ma9, ma10)   # three-way NOT sig ❌

# Winning fixed: ma3 (cond_type × acq_time)`,
        note: "Trim before the full forward selection to avoid contamination from outliers detected in preliminary models.",
      },
      {
        label: "Random-effects selection",
        code: `ra1 <- lmer(RATIO ~ cond_type * acq_time +
              (1 | participant),
            data = MvP_trimmed, REML = TRUE, na.action = na.exclude)

ra2 <- lmer(RATIO ~ cond_type * acq_time +
              (1 + cond_type | participant),
            data = MvP_trimmed, REML = TRUE, na.action = na.exclude)

ra3 <- lmer(RATIO ~ cond_type * acq_time +
              (1 + cond_type + acq_time | participant),
            data = MvP_trimmed, REML = TRUE, na.action = na.exclude)

ra4 <- lmer(RATIO ~ cond_type * acq_time +
              (1 + cond_type + acq_time + is_valid | participant),
            data = MvP_trimmed, REML = TRUE, na.action = na.exclude)
# ⚠️ singular — is_valid slope excluded

anova(ra1, ra2, refit = FALSE)   # cond_type slope needed ✅
anova(ra2, ra3, refit = FALSE)   # acq_time  slope needed ✅
anova(ra3, ra4, refit = FALSE)   # is_valid  slope → singular ⚠️

mvp2_final <- ra3
summary(mvp2_final)$coef`,
      },
      {
        label: "Backward selection cross-check",
        code: `full_mvp2 <- lmer(RATIO ~ cond_type * acq_time * is_valid +
                    (1 + cond_type + acq_time | participant),
                  data = MvP, REML = FALSE, na.action = na.exclude)

red1_mvp2 <- lmer(RATIO ~ cond_type + acq_time + is_valid +
                    cond_type:acq_time + cond_type:is_valid + acq_time:is_valid +
                    (1 + cond_type + acq_time | participant),
                  data = MvP, REML = FALSE, na.action = na.exclude)
anova(full_mvp2, red1_mvp2)   # three-way NOT sig ❌

# Drop two-way interactions one at a time
red2 <- update(red1_mvp2, . ~ . - acq_time:is_valid)
red3 <- update(red1_mvp2, . ~ . - cond_type:is_valid)
red4 <- update(red1_mvp2, . ~ . - cond_type:acq_time)
anova(red1_mvp2, red2)   # acq_time × is_valid NOT sig ❌
anova(red1_mvp2, red3)   # cond_type × is_valid NOT sig ❌
anova(red1_mvp2, red4)   # cond_type × acq_time sig ✅

# Main effects (additive model)
full1.2 <- lmer(RATIO ~ cond_type + acq_time + is_valid +
                  (1 + cond_type + acq_time | participant),
                data = MvP, REML = FALSE, na.action = na.exclude)
anova(full1.2, update(full1.2, . ~ . - cond_type))   # cond_type sig ✅
anova(full1.2, update(full1.2, . ~ . - acq_time))    # acq_time  sig ✅
anova(full1.2, update(full1.2, . ~ . - is_valid))    # is_valid  NOT sig ❌`,
      },
      {
        label: "afex confirmation",
        code: `afex_mvp2 <- mixed(
  RATIO ~ cond_type * acq_time * is_valid +
    (1 + cond_type + acq_time | participant),
  data   = MvP,
  method = "LRT",
  na.action = na.exclude
)
afex_mvp2
# Expected: cond_type ✅, acq_time ✅, cond_type × acq_time ✅
#           is_valid and its interactions NOT sig`,
      },
    ],
    notes: [
      "is_valid is not significant in Exp 2 IC vs. IP — contrasts with Exp 1 where acq_time × is_valid was borderline significant.",
      "is_valid slope causes singularity — excluded from random structure as in Exp 1.",
      "Trimming before full forward selection avoids inflating significance with outlier-driven effects.",
    ],
  },

  // ── RATIO Analysis 4: Temporal Control ───────────────────────────────────
  {
    id: "tc2",
    title: "Temporal Control — log(RATIO)",
    subtitle: "Acquisition Timing × Test Timing · All four TC blocks",
    color: "amber",
    badge: "RATIO Analysis 4",
    description:
      "Examines whether acquisition timing (fixed/random) and test timing (fixed/random) affect temporal reproduction in TC blocks. Raw RATIO residuals are non-normal — log_RATIO is used for the backward selection and afex confirmation. Key result: only test_time is significant; interaction NOT significant in Exp 2.",
    design: "2 × 2 (Acquisition Timing × Test Timing)",
    dv: "log_RATIO = log(space_pressed_duration / wait_duration_before_circle)",
    predictors: ["acq_time (fixed vs. random)", "test_time (fixed vs. random)"],
    randomStructure: "(1 + acq_time + test_time | participant)",
    contrastCoding: "Sum contrasts",
    naAction: "na.action = na.exclude",
    steps: [
      {
        heading: "Fixed-effects forward selection (log_RATIO)",
        items: [
          { label: "add test_time",              result: "✅ Significant" },
          { label: "add acq_time",               result: "❌ Not significant" },
          { label: "add acq_time × test_time",   result: "❌ Not significant (Exp 2)" },
        ],
      },
      {
        heading: "Random-effects selection",
        items: [
          { label: "Intercept → + acq_time slope",   result: "✅ Needed" },
          { label: "+ acq_time → + test_time slope", result: "✅ Needed" },
        ],
      },
    ],
    winningModel: "log_RATIO ~ test_time + (1 + acq_time + test_time | participant)",
    snippets: [
      {
        title: "Forward selection (log_RATIO)",
        code: `# ── Forward selection on log_RATIO ───────────────────────────────────────────────
mb0 <- lmer(log_RATIO ~ 1 +
              (1 + acq_time + test_time | participant),
            data = TC, REML = FALSE, na.action = na.exclude)

mb1 <- lmer(log_RATIO ~ test_time +
              (1 + acq_time + test_time | participant),
            data = TC, REML = FALSE, na.action = na.exclude)

mb2 <- lmer(log_RATIO ~ acq_time + test_time +
              (1 + acq_time + test_time | participant),
            data = TC, REML = FALSE, na.action = na.exclude,
            control = lmerControl(optimizer = "bobyqa"))

mb3 <- lmer(log_RATIO ~ acq_time * test_time +
              (1 + acq_time + test_time | participant),
            data = TC, REML = FALSE, na.action = na.exclude)

anova(mb0, mb1)   # test_time sig ✅
anova(mb1, mb2)   # acq_time  NOT sig ❌
anova(mb2, mb3)   # interaction NOT sig ❌  (differs from Exp 1)

# ── Random-effects selection ──────────────────────────────────────────────────
rb1 <- lmer(log_RATIO ~ test_time + (1 | participant),
            data = TC, REML = TRUE, na.action = na.exclude)
rb2 <- lmer(log_RATIO ~ test_time + (1 + acq_time | participant),
            data = TC, REML = TRUE, na.action = na.exclude)
rb3 <- lmer(log_RATIO ~ test_time + (1 + acq_time + test_time | participant),
            data = TC, REML = TRUE, na.action = na.exclude)

anova(rb1, rb2, refit = FALSE)   # acq_time  slope needed ✅
anova(rb2, rb3, refit = FALSE)   # test_time slope needed ✅

tc2_final <- rb3
summary(tc2_final)$coef`,
        note: "RATIO residuals in TC blocks are non-normal — use log_RATIO for backward selection and afex confirmation.",
      },
      {
        label: "Backward selection (log_RATIO)",
        code: `# ── Backward selection on log_RATIO ──────────────────────────────────────────
full_tc2 <- lmer(log_RATIO ~ test_time + acq_time + acq_time:test_time +
                   (1 + acq_time + test_time | participant),
                 data = TC, REML = FALSE, na.action = na.exclude)

red1_tc2 <- lmer(log_RATIO ~ test_time + acq_time +
                   (1 + acq_time + test_time | participant),
                 data = TC, REML = FALSE, na.action = na.exclude)

anova(full_tc2, red1_tc2)   # interaction NOT sig ❌

red2_tc2 <- update(red1_tc2, . ~ . - acq_time)
red3_tc2 <- update(red1_tc2, . ~ . - test_time)
anova(red1_tc2, red2_tc2)   # test_time sig ✅
anova(red1_tc2, red3_tc2)   # acq_time  NOT sig ❌

# Trimming
TC_trimmed <- trim_by_resid(TC, tc2_final)

tc2_trimmed <- lmer(log_RATIO ~ acq_time + test_time +
                      (1 | participant),
                    data = TC_trimmed, REML = TRUE, na.action = na.exclude)
summary(tc2_trimmed)$coef`,
      },
      {
        label: "afex confirmation",
        code: `# Simple random structure for afex
afex_tc2_simple <- mixed(
  log_RATIO ~ acq_time + test_time + (1 | participant),
  data   = TC_trimmed,
  method = "LRT",
  na.action = na.exclude
)
afex_tc2_simple

# Complex random structure
afex_tc2_full <- mixed(
  log_RATIO ~ acq_time * test_time +
    (1 + acq_time + test_time | participant),
  data   = TC,
  method = "LRT",
  na.action = na.exclude
)
afex_tc2_full
# Expected: acq_time NOT sig, test_time sig, interaction NOT sig

# Exploratory: all four conditions as single factor
tc2_cond <- lmer(log_RATIO ~ condition + (1 | participant),
                 data = TC, REML = FALSE, na.action = na.exclude)
tc2_cond_rs <- lmer(log_RATIO ~ condition + (1 + condition | participant),
                    data = TC, REML = TRUE, na.action = na.exclude)
anova(tc2_cond, update(tc2_cond, . ~ 1 + .))   # condition sig ✅
anova(tc2_cond, tc2_cond_rs, refit = FALSE)    # random slope needed ✅`,
      },
    ],
    notes: [
      "Key difference from Exp 1: the acq_time × test_time interaction is NOT significant in Exp 2.",
      "log_RATIO used for backward selection and afex because RATIO residuals in TC blocks are non-normal.",
      "TC blocks have no is_valid column — never include is_valid in this analysis.",
      "With n = 41 and 221 missing values in TC, na.action = na.exclude is essential.",
    ],
  },

  // ── RT Analysis: IC vs. IP ────────────────────────────────────────────────
  {
    id: "rt2",
    title: "IC vs. IP — log(RT)",
    subtitle: "Reaction Time · Identity Control vs. Identity Prediction",
    color: "rose",
    badge: "RT Analysis",
    description:
      "New in Experiment 2. Reaction time (keypress → space-bar onset) log-transformed. Compares IC (motor action initiates trial) vs. IP (tone-triggered, passive) on log(space_RT). TC excluded — no is_valid column. Key result: cond_type significant; acq_time significant; no significant interactions.",
    design: "2 × 2 × 2 (Condition Type × Acquisition Timing × Trial Validity)",
    dv: "log_space_RT = log(space_RT in ms)",
    predictors: ["cond_type (IC vs. IP)", "acq_time (fixed vs. random)", "is_valid"],
    randomStructure: "(1 + cond_type + acq_time | participant)",
    contrastCoding: "Sum contrasts",
    naAction: "na.action = na.exclude",
    steps: [
      {
        heading: "Fixed-effects forward selection",
        items: [
          { label: "add cond_type",                  result: "✅ Significant" },
          { label: "add acq_time",                   result: "✅ Significant" },
          { label: "add cond_type × acq_time",       result: "❌ Not significant" },
          { label: "add is_valid",                   result: "❌ Not significant" },
          { label: "add cond_type × is_valid",       result: "❌ Not significant" },
          { label: "add acq_time × is_valid",        result: "❌ Not significant" },
          { label: "three-way interaction",          result: "❌ Not significant" },
        ],
      },
      {
        heading: "Random-effects selection",
        items: [
          { label: "Intercept → + cond_type slope",             result: "✅ Needed" },
          { label: "+ cond_type → + acq_time slope",            result: "✅ Needed" },
          { label: "+ acq_time → + is_valid slope",             result: "⚠️ Singular — excluded" },
        ],
      },
    ],
    winningModel: "log_space_RT ~ cond_type + acq_time + (1 + cond_type + acq_time | participant)",
    snippets: [
      {
        label: "Forward selection",
        code: `# ── Build RT dataset (IC + IP only) ──────────────────────────────────────────
# (see wrangling section for full pipeline)

# Preliminary model for trimming
preliminary_rt <- lmer(log_space_RT ~ cond_type + acq_time +
                         (1 + cond_type + acq_time | participant),
                       data = exp2_RT, REML = FALSE, na.action = na.exclude)

FFF_trimmed <- trim_by_resid(exp2_RT, preliminary_rt)

# ── Forward selection ─────────────────────────────────────────────────────────
m0_rt <- lmer(log_space_RT ~ 1 +
                (1 + cond_type + acq_time | participant),
              data = FFF_trimmed, REML = FALSE, na.action = na.exclude)

m1_rt <- lmer(log_space_RT ~ cond_type +
                (1 + cond_type + acq_time | participant),
              data = FFF_trimmed, REML = FALSE, na.action = na.exclude)

m2_rt <- lmer(log_space_RT ~ cond_type + acq_time +
                (1 + cond_type + acq_time | participant),
              data = FFF_trimmed, REML = FALSE, na.action = na.exclude)

m3_rt <- lmer(log_space_RT ~ cond_type * acq_time +
                (1 + cond_type + acq_time | participant),
              data = FFF_trimmed, REML = FALSE, na.action = na.exclude)

m4_rt <- lmer(log_space_RT ~ cond_type + acq_time + is_valid +
                (1 + cond_type + acq_time | participant),
              data = FFF_trimmed, REML = FALSE, na.action = na.exclude)

anova(m0_rt, m1_rt)   # cond_type sig ✅
anova(m1_rt, m2_rt)   # acq_time  sig ✅
anova(m1_rt, m3_rt)   # interaction NOT sig ❌
anova(m1_rt, m4_rt)   # is_valid  NOT sig ❌

# All two-way interactions with is_valid also NOT sig
m6_rt <- lmer(log_space_RT ~ cond_type * is_valid +
                (1 + cond_type + acq_time | participant),
              data = FFF_trimmed, REML = FALSE, na.action = na.exclude)
m8_rt <- lmer(log_space_RT ~ acq_time * is_valid +
                (1 + cond_type + acq_time | participant),
              data = FFF_trimmed, REML = FALSE, na.action = na.exclude)
m10_rt <- lmer(log_space_RT ~ cond_type * acq_time * is_valid +
                 (1 + cond_type + acq_time | participant),
               data = FFF_trimmed, REML = FALSE, na.action = na.exclude)
anova(m1_rt, m6_rt)    # cond_type × is_valid NOT sig ❌
anova(m1_rt, m8_rt)    # acq_time  × is_valid NOT sig ❌
anova(m1_rt, m10_rt)   # three-way NOT sig ❌

# m2_rt wins fixed structure`,
        note: "log_space_RT because raw RT is right-skewed. TC excluded — no is_valid column. RT only collected in test phase.",
      },
      {
        label: "Random-effects selection",
        code: `# Use full (untrimmed) dataset for random-effects selection
r1_rt <- lmer(log_space_RT ~ cond_type + acq_time +
                (1 | participant),
              data = exp2_RT, REML = TRUE, na.action = na.exclude)

r2_rt <- lmer(log_space_RT ~ cond_type + acq_time +
                (1 + cond_type | participant),
              data = exp2_RT, REML = TRUE, na.action = na.exclude)

r3_rt <- lmer(log_space_RT ~ cond_type + acq_time +
                (1 + cond_type + acq_time | participant),
              data = exp2_RT, REML = TRUE, na.action = na.exclude)

r4_rt <- lmer(log_space_RT ~ cond_type + acq_time +
                (1 + cond_type + acq_time + is_valid | participant),
              data = exp2_RT, REML = TRUE, na.action = na.exclude)
# ⚠️ singular — is_valid slope excluded

anova(r1_rt, r2_rt, refit = FALSE)   # cond_type slope needed ✅
anova(r2_rt, r3_rt, refit = FALSE)   # acq_time  slope needed ✅
anova(r3_rt, r4_rt, refit = FALSE)   # is_valid  slope → singular ⚠️

rt2_final <- r3_rt
summary(rt2_final)$coef`,
      },
      {
        label: "Backward selection cross-check",
        code: `full_rt <- lmer(log_space_RT ~ cond_type * acq_time * is_valid +
                  (1 + cond_type + acq_time | participant),
                data = exp2_RT, REML = FALSE,
                na.action = na.exclude,
                control = lmerControl(optimizer = "bobyqa"))

red1_rt <- lmer(log_space_RT ~ cond_type + acq_time + is_valid +
                  cond_type:acq_time + cond_type:is_valid + acq_time:is_valid +
                  (1 + cond_type + acq_time | participant),
                data = exp2_RT, REML = FALSE, na.action = na.exclude,
                control = lmerControl(optimizer = "bobyqa"))
anova(full_rt, red1_rt)   # three-way NOT sig ❌

# Drop two-way interactions
red2_rt <- update(red1_rt, . ~ . - acq_time:is_valid)
red3_rt <- update(red1_rt, . ~ . - cond_type:is_valid)
red4_rt <- update(red1_rt, . ~ . - cond_type:acq_time)
anova(red1_rt, red2_rt)   # acq_time × is_valid NOT sig ❌
anova(red1_rt, red3_rt)   # cond_type × is_valid NOT sig ❌
anova(red1_rt, red4_rt)   # cond_type × acq_time NOT sig ❌

# Main effects (additive)
full_rt_add <- lmer(log_space_RT ~ cond_type + acq_time + is_valid +
                      (1 + cond_type + acq_time | participant),
                    data = exp2_RT, REML = FALSE, na.action = na.exclude)
anova(full_rt_add, update(full_rt_add, . ~ . - cond_type))   # cond_type sig ✅
anova(full_rt_add, update(full_rt_add, . ~ . - acq_time))    # acq_time  NOT sig ❌
anova(full_rt_add, update(full_rt_add, . ~ . - is_valid))    # is_valid  NOT sig ❌`,
        note: "bobyqa needed for complex RT models — RT variance structure is harder to estimate than RATIO.",
      },
      {
        label: "afex confirmation",
        code: `# Complex model
afex_rt_full <- mixed(
  log_space_RT ~ cond_type * acq_time * is_valid +
    (1 + cond_type + acq_time | participant),
  data    = exp2_RT,
  method  = "LRT",
  control = lmerControl(optimizer = "bobyqa"),
  na.action = na.exclude
)
afex_rt_full
# With maximal random structure: only cond_type significant

# Simple model (intercept only)
afex_rt_simple <- mixed(
  log_space_RT ~ cond_type * acq_time * is_valid + (1 | participant),
  data   = exp2_RT,
  method = "LRT",
  na.action = na.exclude
)
afex_rt_simple`,
        note: "With maximal random slopes, only cond_type survives — most conservative result. Report alongside simpler model.",
      },
      {
        label: "Assumption diagnostics",
        code: `# Run on winning model
summary(rt2_final)

car::vif(rt2_final)               # should be < 5
acf(resid(rt2_final))

hist(resid(rt2_final))
plot(density(resid(rt2_final)))
qqnorm(resid(rt2_final)); qqline(resid(rt2_final))
plot(fitted(rt2_final), resid(rt2_final))`,
      },
    ],
    notes: [
      "RT analysis is new in Exp 2 — not collected in Exp 1.",
      "TC blocks excluded: no is_valid column available for TC conditions.",
      "log(space_RT) used because raw RT is right-skewed. Verify normality with QQ plots.",
      "cond_type is the dominant predictor — IC participants (voluntary action) are faster/slower than IP (passive tone-triggered) in a theoretically meaningful way.",
      "acq_time significant in forward selection but drops out with maximal random structure — report both.",
      "NOTE: space_RT column name differs between IC/TC ('space_RT') and IP ('space_rt') scripts — check CSV column names before merging.",
    ],
  },
];

// ─── Condition table (Exp 2) ──────────────────────────────────────────────────
export const conditionTable2 = [
  { id: "1-Motor-FF",      type: "IC", acq: "fixed",  test: "fixed",  label: "IC-FF",  block: 1 },
  { id: "4-Motor-RF",      type: "IC", acq: "random", test: "fixed",  label: "IC-RF",  block: 2 },
  { id: "3-Prediction-FF", type: "IP", acq: "fixed",  test: "fixed",  label: "IP-FF",  block: 3 },
  { id: "6-Prediction-RF", type: "IP", acq: "random", test: "fixed",  label: "IP-RF",  block: 4 },
  { id: "7-Control-FF",    type: "TC", acq: "fixed",  test: "fixed",  label: "TC-FF",  block: 5 },
  { id: "5-Control-RF",    type: "TC", acq: "random", test: "fixed",  label: "TC-RF",  block: 6 },
];

export const analysisMatrix2 = [
  { analysis: "IC vs. TC — RATIO",          id: "mc2",  conditions: ["1-Motor-FF","4-Motor-RF","7-Control-FF","5-Control-RF"],     color: "violet" },
  { analysis: "TC vs. IP — RATIO",          id: "cp2",  conditions: ["3-Prediction-FF","6-Prediction-RF","7-Control-FF","5-Control-RF"], color: "sky" },
  { analysis: "IC vs. IP — RATIO",          id: "mvp2", conditions: ["1-Motor-FF","4-Motor-RF","3-Prediction-FF","6-Prediction-RF"], color: "emerald" },
  { analysis: "TC — Temporal Control",      id: "tc2",  conditions: ["7-Control-FF","5-Control-RF"],                                color: "amber" },
  { analysis: "IC vs. IP — log(RT)",        id: "rt2",  conditions: ["1-Motor-FF","4-Motor-RF","3-Prediction-FF","6-Prediction-RF"], color: "rose" },
];
