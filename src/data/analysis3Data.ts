// ─────────────────────────────────────────────────────────────────────────────
// Experiment 3 — LMM Analysis Reference Data
// n = 41 participants (1 participant [SK] has 6 missing trials from the start)
// DV1: log_RATIO = log(reproduced / target)   — 5 RATIO analyses
// DV2: log_space_RT                            — RT analysis (IC + IP only)
// Fixed IEI: 650 ms | Random IEI: 150–1150 ms (same as Exp 2; changed from 0–1100 ms in Exp 1)
// Test congruency: 80/20 (Exp 3) vs. 50/50 (Exp 2)
// NEW vs Exp 2: 5th RATIO analysis (validity split); cond×is_valid sig in RT
//              RT exclusion done in code (not Excel); log_RATIO used throughout
// ─────────────────────────────────────────────────────────────────────────────

export interface CodeSnippet3 {
  label: string;
  code: string;
  note?: string;
}

export interface AnalysisBlock3 {
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
  snippets: CodeSnippet3[];
  notes: string[];
}

// ─── Libraries ───────────────────────────────────────────────────────────────
export const libraries3Code = `library(tidyverse)
library(lme4)
library(afex)
library(car)
library(jtools)
library(kableExtra)`;

// ─── Wrangling: RATIO analyses ────────────────────────────────────────────────
export const wrangling3RatioCode = `# ══════════════════════════════════════════════════════════════════════════════
# Experiment 3 — RATIO analysis wrangling (n = 41)
# KEY DIFFERENCES FROM EXP 2:
#   1. RT exclusion is done IN CODE (not in Excel)
#   2. log_RATIO used throughout (RATIO residuals violated normality)
#   3. 5 RATIO analyses instead of 4 (validity split added)
#   4. SK participant has 6 missing trials from 2-Control-FR from the start
#   5. Test congruency: 80/20 (my_random > 0.8) vs 50/50 in Exp 2
# ══════════════════════════════════════════════════════════════════════════════

# ── 1. Read raw data ───────────────────────────────────────────────────────────
exp3_dat <- read.csv("Exp3_data_n41.csv", header = TRUE) |> tibble()
sum(is.na(exp3_dat))   # 8242 — includes SK's 6 missing trials

# ── 2. Helper functions ────────────────────────────────────────────────────────
s_to_ms        <- function(x) x * 1000
rt_excluded    <- function(x) ifelse(x < 100 | x > 2000, NA, x)

# trial_excluded: if space_RT is NA (out of range), also null out the DV
# columns for that trial so the whole trial is effectively excluded.
trial_excluded <- function(df) {
  df |> mutate(across(c(is_valid, space_pressed_duration, DIFFERENCE),
                      ~ ifelse(is.na(space_RT), NA, .)))
}

# ── 3. Clean & convert units ───────────────────────────────────────────────────
exp3_clean <- exp3_dat |>
  select(-RATIO, -ABS.ERROR, -Avg.underest..percentage.) |>
  mutate(across(c(wait_duration_before_circle, space_pressed_duration,
                  space_RT, DIFFERENCE), ~ s_to_ms(as.numeric(.)))) |>
  mutate(space_RT = rt_excluded(space_RT)) |>
  trial_excluded()

# Missing RT: 747 total (>495 in Exp2 because 80/20 split creates more invalid)
# Missing wait_duration: 6 rows (SK, condition 2-Control-FR)
sum(is.na(exp3_clean$space_RT))                    # ~747
sum(is.na(exp3_clean$wait_duration_before_circle)) # 6 (SK participant)

# Check which rows have missing wait_duration (SK issue)
rows_missing_wait <- exp3_clean[is.na(exp3_clean$wait_duration_before_circle), ]

# ── 4. Condition labels ────────────────────────────────────────────────────────
exp3_clean <- exp3_clean |>
  mutate(
    cond_type = case_when(
      condition %in% c("1-Motor-FF", "4-Motor-RF")            ~ "IC",
      condition %in% c("0-Control-RR", "2-Control-FR",
                       "5-Control-RF", "7-Control-FF")        ~ "TC",
      condition %in% c("3-Prediction-FF", "6-Prediction-RF")  ~ "IP"
    ),
    acq_time  = ifelse(
      condition %in% c("5-Control-RF","4-Motor-RF",
                       "6-Prediction-RF","0-Control-RR"),
      "random", "fixed"
    ),
    test_time = ifelse(
      condition %in% c("2-Control-FR","0-Control-RR"),
      "random", "fixed"
    )
  ) |>
  mutate(across(c(condition, is_valid, cond_type, acq_time, test_time), as.factor))

# ── 5. Derived DVs ────────────────────────────────────────────────────────────
exp3_clean <- exp3_clean |>
  mutate(
    RATIO     = space_pressed_duration / wait_duration_before_circle,
    log_RATIO = log(RATIO),   # PRIMARY DV for all RATIO analyses in Exp 3
    RRE       = (space_pressed_duration - wait_duration_before_circle) /
                  wait_duration_before_circle,
    AV_und    = (wait_duration_before_circle - space_pressed_duration) /
                  wait_duration_before_circle
  )

# NOTE: RRE and other measures violate normality assumptions badly.
# log_RATIO passes assumption checks and is used throughout Exp 3.
# Exp 2 used raw RATIO for IC/IP analyses but log_RATIO for TC.
# Exp 3 uses log_RATIO for ALL analyses for consistency.

# Missing after cleaning (space_pressed_duration exclusions): 747
rows_with_missing <- exp3_clean[is.na(exp3_clean$space_pressed_duration), ]

# ── 6. Analysis subsets ───────────────────────────────────────────────────────
MC   <- exp3_clean |>
  filter(condition %in% c("1-Motor-FF","4-Motor-RF",
                           "7-Control-FF","5-Control-RF"))

CP   <- exp3_clean |>
  filter(condition %in% c("3-Prediction-FF","6-Prediction-RF",
                           "7-Control-FF","5-Control-RF"))

MvP  <- exp3_clean |>
  filter(cond_type %in% c("IC","IP"))

TC   <- exp3_clean |>
  filter(cond_type == "TC")

# ── 7. Sum contrast coding ─────────────────────────────────────────────────────
set_sum_contrasts <- function(df, vars) {
  for (v in vars) contrasts(df[[v]]) <- contr.sum(nlevels(df[[v]]))
  df
}

MC  <- set_sum_contrasts(MC,  c("cond_type","acq_time"))
CP  <- set_sum_contrasts(CP,  c("cond_type","acq_time"))
MvP <- set_sum_contrasts(MvP, c("cond_type","acq_time","is_valid"))
TC  <- set_sum_contrasts(TC,  c("acq_time","test_time"))

# ── 8. Outlier trimming helper ─────────────────────────────────────────────────
trim_by_resid <- function(data, model, z_thresh = 2.5) {
  data[abs(scale(resid(model))) < z_thresh, ]
}
# ALWAYS trim from the model's own dataset.
# In Exp 3, use residuals(model) not resid(model) — identical but explicit.`;

// ─── Wrangling: RT analyses ───────────────────────────────────────────────────
export const wrangling3RTCode = `# ══════════════════════════════════════════════════════════════════════════════
# Experiment 3 — RT analysis wrangling (IC + IP only; TC excluded)
# KEY DIFFERENCES FROM EXP 2:
#   1. is_valid × cond_type interaction IS significant in Exp 3 (80/20 split)
#   2. Three-way interaction cond_type × acq_time × is_valid IS significant
#   3. RT exclusion done here in code (not pre-cleaned in Excel)
#   4. my_random(trialsLoop) > 0.8 → 80% valid, 20% invalid trials
# ══════════════════════════════════════════════════════════════════════════════

# ── Build RT dataset (IC + IP only) ──────────────────────────────────────────
exp3_RT <- exp3_dat |>
  select(-RATIO, -ABS.ERROR, -Avg.underest..percentage.) |>
  filter(!condition %in% c("0-Control-RR","2-Control-FR",
                            "5-Control-RF","7-Control-FF")) |>
  mutate(across(c(wait_duration_before_circle, space_pressed_duration,
                  space_RT, DIFFERENCE), ~ s_to_ms(as.numeric(.)))) |>
  mutate(space_RT = rt_excluded(space_RT)) |>
  trial_excluded() |>
  mutate(
    cond_type = case_when(
      condition %in% c("1-Motor-FF","4-Motor-RF")            ~ "IC",
      condition %in% c("3-Prediction-FF","6-Prediction-RF")  ~ "IP"
    ),
    acq_time = ifelse(
      condition %in% c("4-Motor-RF","6-Prediction-RF"),
      "random", "fixed"
    ),
    log_space_RT = log(space_RT)
  ) |>
  mutate(across(c(is_valid, cond_type, acq_time), as.factor))

# Missing RT: ~434 observations
sum(is.na(exp3_RT$space_RT))

exp3_RT <- set_sum_contrasts(exp3_RT, c("cond_type","acq_time","is_valid"))

# NOTE on my_random() Exp 3 vs Exp 2:
#   Exp 2: is_valid = my_random(trialsLoop) > 0.5  → ~50% valid
#   Exp 3: is_valid = my_random(trialsLoop) > 0.8  → ~80% valid, 20% invalid
# The 80/20 split means validity effects are STRONGER in Exp 3 —
# this is why cond_type × is_valid becomes significant in the RT analysis.`;

// ─── Analyses ─────────────────────────────────────────────────────────────────
export const analyses3: AnalysisBlock3[] = [

  // ── RATIO Analysis 1: IC vs. TC ──────────────────────────────────────────
  {
    id: "mc3",
    title: "IC vs. TC — log(RATIO)",
    subtitle: "Identity Control (Motor) vs. Temporal Control · log(Reproduced / Target)",
    color: "violet",
    badge: "RATIO Analysis 1",
    description:
      "Compares Identity Control (IC) against Temporal Control (TC) blocks. log_RATIO is used throughout Exp 3 — RATIO residuals fail normality. Key result mirrors Exp 2: cond_type × acq_time interaction significant; acq_time main effect not significant.",
    design: "2 × 2 (Condition Type × Acquisition Timing)",
    dv: "log_RATIO = log(space_pressed_duration / wait_duration_before_circle)",
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
          { label: "m2 → m3: add cond_type × acq_time",  result: "✅ Significant" },
        ],
      },
      {
        heading: "Random-effects selection (REML = TRUE, refit = FALSE)",
        items: [
          { label: "Intercept only → + cond_type slope",  result: "✅ Needed" },
          { label: "+ cond_type → + acq_time slope",      result: "✅ Needed" },
        ],
      },
    ],
    winningModel: "log_RATIO ~ cond_type * acq_time + (1 + cond_type + acq_time | participant)",
    snippets: [
      {
        label: "Forward selection",
        code: `# ── Fixed-effects forward selection ─────────────────────────────────────────
m0_mc3 <- lmer(log_RATIO ~ 1 +
                 (1 + cond_type + acq_time | participant),
               data = MC, REML = FALSE, na.action = na.exclude)

m1_mc3 <- lmer(log_RATIO ~ cond_type +
                 (1 + cond_type + acq_time | participant),
               data = MC, REML = FALSE, na.action = na.exclude)

m2_mc3 <- lmer(log_RATIO ~ cond_type + acq_time +
                 (1 + cond_type + acq_time | participant),
               data = MC, REML = FALSE, na.action = na.exclude)

m3_mc3 <- lmer(log_RATIO ~ cond_type * acq_time +
                 (1 + cond_type + acq_time | participant),
               data = MC, REML = FALSE, na.action = na.exclude,
               control = lmerControl(optimizer = "bobyqa"))

anova(m0_mc3, m1_mc3)   # cond_type sig ✅
anova(m1_mc3, m2_mc3)   # acq_time  NOT sig ❌
anova(m2_mc3, m3_mc3)   # interaction sig ✅

# ── Random-effects selection ──────────────────────────────────────────────────
r1_mc3 <- lmer(log_RATIO ~ cond_type * acq_time +
                 (1 | participant),
               data = MC, REML = TRUE, na.action = na.exclude)

r2_mc3 <- lmer(log_RATIO ~ cond_type * acq_time +
                 (1 + cond_type | participant),
               data = MC, REML = TRUE, na.action = na.exclude)

r3_mc3 <- lmer(log_RATIO ~ cond_type * acq_time +
                 (1 + cond_type + acq_time | participant),
               data = MC, REML = TRUE, na.action = na.exclude)

anova(r1_mc3, r2_mc3, refit = FALSE)   # cond_type slope needed ✅
anova(r2_mc3, r3_mc3, refit = FALSE)   # acq_time  slope needed ✅

mc3_final <- r3_mc3
summary(mc3_final)$coef`,
        note: "log_RATIO is the DV throughout Exp 3 — RATIO residuals were non-normal. bobyqa optimizer sometimes needed for the interaction model.",
      },
      {
        label: "Outlier trim & robustness",
        code: `# Trim using the best FIXED-effects model residuals
# (m3_mc3 is used for trimming, not the random-effects final)
MC_trimmed <- trim_by_resid(MC, m3_mc3)

mc3_trimmed <- lmer(log_RATIO ~ cond_type * acq_time +
                      (1 + cond_type + acq_time | participant),
                    data = MC_trimmed, REML = TRUE, na.action = na.exclude)
summary(mc3_trimmed)$coef   # estimates should be stable vs. mc3_final`,
      },
      {
        label: "afex confirmation",
        code: `# With full random structure
afex_mc3 <- mixed(
  log_RATIO ~ cond_type * acq_time +
    (1 + cond_type + acq_time | participant),
  data      = MC,
  method    = "LRT",
  na.action = na.exclude
)
afex_mc3

# Simple (intercept only) random structure for comparison
afex_mc3_simple <- mixed(
  log_RATIO ~ cond_type * acq_time + (1 | participant),
  data      = CP,    # cross-check with CP dataset
  method    = "LRT",
  na.action = na.exclude
)
afex_mc3_simple`,
      },
      {
        label: "Assumption diagnostics",
        code: `summary(mc3_final)
car::vif(mc3_final)
acf(resid(mc3_final))

hist(resid(m3_mc3))           # check trimming model residuals
qqnorm(resid(m3_mc3)); qqline(resid(m3_mc3))
plot(density(resid(mc3_final)))
plot(fitted(mc3_final), resid(mc3_final))`,
      },
    ],
    notes: [
      "log_RATIO replaces raw RATIO as DV in Exp 3. RATIO and other measures (RRE, AV_und) all violated normality; log_RATIO passed.",
      "Pattern mirrors Exp 2: cond_type × acq_time significant; acq_time main effect not significant as standalone predictor.",
      "Trimming uses fixed-effects model residuals (m3_mc3) not the final random-effects model, to avoid circularity.",
      "bobyqa optimizer may be needed — check with all_fit(model) if convergence fails.",
    ],
  },

  // ── RATIO Analysis 2: TC vs. IP ──────────────────────────────────────────
  {
    id: "cp3",
    title: "TC vs. IP — log(RATIO)",
    subtitle: "Temporal Control vs. Identity Prediction · log(Reproduced / Target)",
    color: "sky",
    badge: "RATIO Analysis 2",
    description:
      "Tests whether learned tone-colour prediction (IP) shifts temporal binding relative to TC. log_RATIO DV. Key finding consistent with Exp 2: cond_type × acq_time interaction significant; acq_time becomes significant main effect.",
    design: "2 × 2 (Condition Type × Acquisition Timing)",
    dv: "log_RATIO",
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
    winningModel: "log_RATIO ~ cond_type * acq_time + (1 + cond_type + acq_time | participant)",
    snippets: [
      {
        label: "Forward selection",
        code: `m0_cp3 <- lmer(log_RATIO ~ 1 +
                 (1 + cond_type + acq_time | participant),
               data = CP, REML = FALSE, na.action = na.exclude)

m1_cp3 <- lmer(log_RATIO ~ cond_type +
                 (1 + cond_type + acq_time | participant),
               data = CP, REML = FALSE, na.action = na.exclude)

m2_cp3 <- lmer(log_RATIO ~ cond_type + acq_time +
                 (1 + cond_type + acq_time | participant),
               data = CP, REML = FALSE, na.action = na.exclude)

m3_cp3 <- lmer(log_RATIO ~ cond_type * acq_time +
                 (1 + cond_type + acq_time | participant),
               data = CP, REML = FALSE, na.action = na.exclude)

anova(m0_cp3, m1_cp3)   # cond_type sig ✅
anova(m1_cp3, m2_cp3)   # acq_time  sig ✅
anova(m2_cp3, m3_cp3)   # interaction sig ✅

# Random-effects selection
r1_cp3 <- lmer(log_RATIO ~ cond_type * acq_time +
                 (1 | participant),
               data = CP, REML = TRUE, na.action = na.exclude)
r2_cp3 <- update(r1_cp3, . ~ . + (0 + cond_type | participant))
r3_cp3 <- lmer(log_RATIO ~ cond_type * acq_time +
                 (1 + cond_type + acq_time | participant),
               data = CP, REML = TRUE, na.action = na.exclude)

anova(r1_cp3, r2_cp3, refit = FALSE)
anova(r2_cp3, r3_cp3, refit = FALSE)

cp3_final <- r3_cp3
summary(cp3_final)$coef`,
      },
      {
        label: "Backward selection cross-check",
        code: `full_cp3 <- lmer(log_RATIO ~ cond_type + acq_time + cond_type:acq_time +
                   (1 + cond_type + acq_time | participant),
                 data = CP, REML = FALSE, na.action = na.exclude)

red1_cp3 <- lmer(log_RATIO ~ cond_type + acq_time +
                   (1 + cond_type + acq_time | participant),
                 data = CP, REML = FALSE, na.action = na.exclude)

anova(full_cp3, red1_cp3)    # interaction sig ✅

# Main effects
red2_cp3 <- update(red1_cp3, . ~ . - acq_time)
red3_cp3 <- update(red1_cp3, . ~ . - cond_type)
anova(red1_cp3, red2_cp3)    # cond_type sig ✅
anova(red1_cp3, red3_cp3)    # acq_time  sig ✅

# Trimming
CP_trimmed <- trim_by_resid(CP, m3_cp3)`,
      },
      {
        label: "afex confirmation",
        code: `afex_cp3 <- mixed(
  log_RATIO ~ cond_type * acq_time +
    (1 + cond_type + acq_time | participant),
  data      = CP,
  method    = "LRT",
  na.action = na.exclude
)
afex_cp3

afex_cp3_simple <- mixed(
  log_RATIO ~ cond_type * acq_time + (1 | participant),
  data      = CP,
  method    = "LRT",
  na.action = na.exclude
)
afex_cp3_simple`,
      },
    ],
    notes: [
      "acq_time is significant as a main effect in Exp 3 TC vs. IP — same pattern as Exp 2, unlike Exp 1 where it was not significant.",
      "CP dataset trims using m3_cp3 (fixed-effects model) residuals — do not use cp3_final (random-effects) for trimming.",
    ],
  },

  // ── RATIO Analysis 3: IC vs. IP ──────────────────────────────────────────
  {
    id: "mvp3",
    title: "IC vs. IP — log(RATIO)",
    subtitle: "Identity Control vs. Identity Prediction · 2 × 2 × 2",
    color: "emerald",
    badge: "RATIO Analysis 3",
    description:
      "Tests whether voluntary action (IC) vs. passive tone-prediction (IP) differs in temporal binding. 2×2×2 design: cond_type × acq_time × is_valid. Key Exp 3 result: cond_type × acq_time interaction significant; is_valid still not significant as main effect or in interactions.",
    design: "2 × 2 × 2 (Condition Type × Acquisition Timing × Trial Validity)",
    dv: "log_RATIO",
    predictors: ["cond_type (IC vs. IP)", "acq_time (fixed vs. random)", "is_valid (TRUE/FALSE)"],
    randomStructure: "(1 + cond_type + acq_time | participant)",
    contrastCoding: "Sum contrasts",
    naAction: "na.action = na.exclude",
    steps: [
      {
        heading: "Fixed-effects forward selection",
        items: [
          { label: "add cond_type",                  result: "✅ Significant" },
          { label: "add acq_time",                   result: "❌ Not significant (as main)" },
          { label: "add cond_type × acq_time",       result: "✅ Significant" },
          { label: "add is_valid",                   result: "❌ Not significant" },
          { label: "all two-way interactions w/ is_valid", result: "❌ Not significant" },
          { label: "three-way interaction",          result: "❌ Not significant" },
        ],
      },
      {
        heading: "Random-effects selection (REML = TRUE)",
        items: [
          { label: "Intercept → + cond_type slope",  result: "✅ Needed" },
          { label: "+ cond_type → + acq_time slope", result: "✅ Needed" },
          { label: "+ acq_time → + is_valid slope",  result: "⚠️ Singular — excluded" },
        ],
      },
    ],
    winningModel: "log_RATIO ~ cond_type * acq_time + (1 + cond_type + acq_time | participant)",
    snippets: [
      {
        label: "Forward selection",
        code: `ma0 <- lmer(log_RATIO ~ 1 +
              (1 + cond_type + acq_time | participant),
            data = MvP, REML = FALSE, na.action = na.exclude)

ma1 <- lmer(log_RATIO ~ cond_type +
              (1 + cond_type + acq_time | participant),
            data = MvP, REML = FALSE, na.action = na.exclude)

ma2 <- lmer(log_RATIO ~ cond_type + acq_time +
              (1 + cond_type + acq_time | participant),
            data = MvP, REML = FALSE, na.action = na.exclude)

ma3 <- lmer(log_RATIO ~ cond_type * acq_time +
              (1 + cond_type + acq_time | participant),
            data = MvP, REML = FALSE, na.action = na.exclude)

anova(ma0, ma1)   # cond_type sig ✅
anova(ma1, ma2)   # acq_time  NOT sig (standalone) — proceed to interaction
anova(ma1, ma3)   # cond_type × acq_time sig ✅

# Add is_valid
ma4 <- lmer(log_RATIO ~ cond_type * acq_time + is_valid +
              (1 + cond_type + acq_time | participant),
            data = MvP, REML = FALSE, na.action = na.exclude)
anova(ma3, ma4)   # is_valid NOT sig ❌

# Two-way interactions with is_valid
ma6 <- lmer(log_RATIO ~ cond_type * is_valid +
              (1 + cond_type + acq_time | participant),
            data = MvP, REML = FALSE, na.action = na.exclude)
ma8 <- lmer(log_RATIO ~ acq_time * is_valid +
              (1 + cond_type + acq_time | participant),
            data = MvP, REML = FALSE, na.action = na.exclude)
ma10 <- lmer(log_RATIO ~ cond_type * acq_time * is_valid +
               (1 + cond_type + acq_time | participant),
             data = MvP, REML = FALSE, na.action = na.exclude)

anova(ma1, ma6)    # cond_type × is_valid NOT sig ❌
anova(ma1, ma8)    # acq_time  × is_valid NOT sig ❌
anova(ma1, ma10)   # three-way NOT sig ❌

# → Winning fixed structure: cond_type * acq_time`,
        note: "is_valid consistently non-significant in RATIO analysis even with 80/20 split. Validity effects show up in RT (Exp 3) not RATIO.",
      },
      {
        label: "Random-effects selection",
        code: `ra1 <- lmer(log_RATIO ~ cond_type * acq_time +
              (1 | participant),
            data = MvP, REML = TRUE, na.action = na.exclude)

ra2 <- lmer(log_RATIO ~ cond_type * acq_time +
              (1 + cond_type | participant),
            data = MvP, REML = TRUE, na.action = na.exclude)

ra3 <- lmer(log_RATIO ~ cond_type * acq_time +
              (1 + cond_type + acq_time | participant),
            data = MvP, REML = TRUE, na.action = na.exclude)

ra4 <- lmer(log_RATIO ~ cond_type * acq_time +
              (1 + cond_type + acq_time + is_valid | participant),
            data = MvP, REML = TRUE, na.action = na.exclude)
# ⚠️ Singular — is_valid slope excluded

anova(ra1, ra2, refit = FALSE)   # cond_type slope ✅
anova(ra2, ra3, refit = FALSE)   # acq_time  slope ✅
anova(ra3, ra4, refit = FALSE)   # is_valid  slope → singular ⚠️

mvp3_final <- ra3
summary(mvp3_final)$coef

# Outlier robustness check
MvP_trimmed <- trim_by_resid(MvP, ma3)   # use fixed-effects model

mvp3_trimmed <- lmer(log_RATIO ~ cond_type * acq_time +
                       (1 + cond_type + acq_time | participant),
                     data = MvP_trimmed, REML = TRUE, na.action = na.exclude)
summary(mvp3_trimmed)$coef`,
      },
      {
        label: "afex confirmation",
        code: `# Simple random structure
afex_mvp3_simple <- mixed(
  log_RATIO ~ cond_type * acq_time * is_valid + (1 | participant),
  data      = MvP,
  method    = "LRT",
  na.action = na.exclude
)
afex_mvp3_simple

# Complex random structure (trimmed data)
afex_mvp3_complex <- mixed(
  log_RATIO ~ cond_type * acq_time * is_valid +
    (1 + cond_type + acq_time | participant),
  data      = MvP_trimmed,
  method    = "LRT",
  na.action = na.exclude
)
afex_mvp3_complex
# Expected: cond_type ✅, cond_type × acq_time ✅; is_valid NOT sig`,
      },
      {
        label: "Assumption diagnostics",
        code: `summary(mvp3_final)
car::vif(mvp3_final)
acf(resid(mvp3_final))

hist(resid(ma3))           # fixed-effects model residuals
qqnorm(resid(ma3)); qqline(resid(ma3))
plot(density(resid(mvp3_final)))
plot(fitted(mvp3_final), resid(mvp3_final))`,
      },
    ],
    notes: [
      "is_valid not significant in log_RATIO analysis — validity effects are captured better by RT in Exp 3.",
      "is_valid random slope causes singularity — consistent with Exp 1 and Exp 2.",
      "Winning model same as Exp 2 IC vs. IP despite 80/20 split — the temporal reproduction DV is less sensitive to validity than RT.",
      "cond_type × acq_time interaction is the theoretically key result: IC shows binding only when acquisition was fixed (predictable).",
    ],
  },

  // ── RATIO Analysis 4: Temporal Control ───────────────────────────────────
  {
    id: "tc3",
    title: "Temporal Control — log(RATIO)",
    subtitle: "Acquisition Timing × Test Timing · All four TC blocks",
    color: "amber",
    badge: "RATIO Analysis 4",
    description:
      "Examines whether acquisition timing and test timing affect reproduction in TC (passive, random colour) blocks. log_RATIO used. Key result: test_time significant; acq_time not significant; interaction NOT significant. Consistent with Exp 2.",
    design: "2 × 2 (Acquisition Timing × Test Timing)",
    dv: "log_RATIO",
    predictors: ["acq_time (fixed vs. random)", "test_time (fixed vs. random)"],
    randomStructure: "(1 + acq_time + test_time | participant)",
    contrastCoding: "Sum contrasts",
    naAction: "na.action = na.exclude",
    steps: [
      {
        heading: "Fixed-effects forward selection",
        items: [
          { label: "add test_time",             result: "✅ Significant" },
          { label: "add acq_time",              result: "❌ Not significant" },
          { label: "add acq_time × test_time",  result: "❌ Not significant" },
        ],
      },
      {
        heading: "Random-effects selection",
        items: [
          { label: "Intercept → + acq_time slope",   result: "✅ Needed" },
          { label: "+ acq_time → + test_time slope",  result: "✅ Needed" },
        ],
      },
    ],
    winningModel: "log_RATIO ~ test_time + (1 + acq_time + test_time | participant)",
    snippets: [
      {
        label: "Forward selection",
        code: `mb0 <- lmer(log_RATIO ~ 1 +
              (1 + acq_time + test_time | participant),
            data = TC, REML = FALSE, na.action = na.exclude)

mb1 <- lmer(log_RATIO ~ test_time +
              (1 + acq_time + test_time | participant),
            data = TC, REML = FALSE, na.action = na.exclude)

mb2 <- lmer(log_RATIO ~ acq_time + test_time +
              (1 + acq_time + test_time | participant),
            data = TC, REML = FALSE, na.action = na.exclude)

mb3 <- lmer(log_RATIO ~ acq_time * test_time +
              (1 + acq_time + test_time | participant),
            data = TC, REML = FALSE, na.action = na.exclude)

anova(mb0, mb1)   # test_time sig ✅
anova(mb1, mb2)   # acq_time  NOT sig ❌
anova(mb1, mb3)   # interaction NOT sig ❌

summary(mb1)$coef

# Random-effects selection
rb1 <- lmer(log_RATIO ~ test_time + (1 | participant),
            data = TC, REML = TRUE, na.action = na.exclude)
rb2 <- lmer(log_RATIO ~ test_time + (1 + acq_time | participant),
            data = TC, REML = TRUE, na.action = na.exclude)
rb3 <- lmer(log_RATIO ~ test_time + (1 + acq_time + test_time | participant),
            data = TC, REML = TRUE, na.action = na.exclude)

anova(rb1, rb2, refit = FALSE)   # acq_time  slope needed ✅
anova(rb2, rb3, refit = FALSE)   # test_time slope needed ✅

tc3_final <- rb3
summary(tc3_final)$coef`,
        note: "TC blocks have no is_valid column — never add is_valid to this model.",
      },
      {
        label: "Outlier trim & robustness",
        code: `TC_trimmed <- trim_by_resid(TC, mb1)   # trim using mb1 residuals

tc3_trimmed <- lmer(log_RATIO ~ acq_time + test_time +
                      (1 + acq_time + test_time | participant),
                    data = TC_trimmed, REML = TRUE, na.action = na.exclude)
summary(tc3_trimmed)$coef`,
      },
      {
        label: "afex confirmation",
        code: `# Simple random structure
afex_tc3 <- mixed(
  log_RATIO ~ acq_time * test_time + (1 | participant),
  data      = TC,
  method    = "LRT",
  na.action = na.exclude
)
afex_tc3

# Complex random structure (trimmed data)
afex_tc3_complex <- mixed(
  log_RATIO ~ acq_time * test_time +
    (1 + acq_time + test_time | participant),
  data      = TC_trimmed,
  method    = "LRT",
  na.action = na.exclude
)
afex_tc3_complex
# Expected: only test_time significant`,
      },
      {
        label: "Exploratory: condition as single factor",
        code: `# Optional exploratory model — all four TC conditions as a factor
tc3_cond0 <- lmer(log_RATIO ~ 1 + (1 | participant),
                  data = TC, REML = FALSE, na.action = na.exclude)
tc3_cond1 <- lmer(log_RATIO ~ condition + (1 | participant),
                  data = TC, REML = FALSE, na.action = na.exclude)
tc3_cond2 <- lmer(log_RATIO ~ condition + (1 + condition | participant),
                  data = TC, REML = TRUE,
                  control = lmerControl(optimizer = "bobyqa"),
                  na.action = na.exclude)

anova(tc3_cond0, tc3_cond1)          # condition sig ✅
anova(tc3_cond1, tc3_cond2, refit = FALSE)   # random slope needed ✅

# This is commented out in the original script — kept for completeness
# afex_cond3 <- mixed(log_RATIO ~ condition + (1+condition|participant),
#   data = TC, control = lmerControl(optimizer="bobyqa"), method="LRT")`,
      },
    ],
    notes: [
      "No is_valid column in TC blocks — colour outcome is always random. Never include is_valid here.",
      "SK participant has 6 missing trials in 2-Control-FR block — na.action = na.exclude handles this.",
      "313 missing values in TC log_RATIO (RT exclusions). na.exclude critical.",
      "Results consistent across Exp 2 and Exp 3: only test_time matters; whether acquisition was fixed or random does not affect TC reproduction.",
    ],
  },

  // ── RATIO Analysis 5: Validity Split (NEW in Exp 3) ──────────────────────
  {
    id: "val3",
    title: "IC vs. IP — Validity Analysis (NEW)",
    subtitle: "log(RATIO) split by trial validity · 80/20 congruency manipulation",
    color: "teal",
    badge: "RATIO Analysis 5 — NEW",
    description:
      "NEW in Experiment 3. The 80/20 congruency split creates a meaningful validity manipulation worth examining directly. This analysis isolates valid vs. invalid trials within IC and IP conditions to ask whether the binding effect depends on trial-by-trial congruency. is_valid remains non-significant in RATIO — the validity effect is primarily captured in the RT analysis.",
    design: "2 × 2 × 2 (Condition Type × Acquisition Timing × Trial Validity)",
    dv: "log_RATIO",
    predictors: ["cond_type (IC vs. IP)", "acq_time", "is_valid (80% valid, 20% invalid)"],
    randomStructure: "(1 + cond_type + acq_time | participant)",
    contrastCoding: "Sum contrasts — 80/20 split means is_valid is NOT balanced; sum coding is particularly important here",
    naAction: "na.action = na.exclude",
    steps: [
      {
        heading: "Why a 5th analysis in Exp 3?",
        items: [
          { label: "Exp 2 congruency (50/50)", detail: "Balanced validity — is_valid had equal power to detect effect", result: "❌ Not significant" },
          { label: "Exp 3 congruency (80/20)", detail: "80% valid → validity manipulation is stronger and theoretically meaningful", result: "Worth testing explicitly" },
          { label: "is_valid in RATIO (Exp 3)", result: "❌ Still not significant" },
          { label: "is_valid in RT (Exp 3)",    result: "✅ cond_type × is_valid significant!" },
        ],
      },
      {
        heading: "Fixed-effects stepwise — same structure as Analysis 3",
        items: [
          { label: "add cond_type",                      result: "✅ Significant" },
          { label: "add cond_type × acq_time",           result: "✅ Significant" },
          { label: "add is_valid",                       result: "❌ Not significant" },
          { label: "add cond_type × is_valid",           result: "❌ Not significant" },
          { label: "add acq_time × is_valid",            result: "❌ Not significant" },
          { label: "three-way",                          result: "❌ Not significant" },
        ],
      },
    ],
    winningModel: "log_RATIO ~ cond_type * acq_time + (1 + cond_type + acq_time | participant)",
    snippets: [
      {
        label: "Full validity analysis",
        code: `# ── Analysis 5: Validity split — new in Exp 3 ───────────────────────────────
# MvP already filtered to IC + IP only (see wrangling)
# is_valid contrasts already set to sum coding

# Forward selection with is_valid added explicitly
ma_v1 <- lmer(log_RATIO ~ cond_type +
                (1 + cond_type + acq_time | participant),
              data = MvP, REML = FALSE, na.action = na.exclude)

ma_v2 <- lmer(log_RATIO ~ cond_type * acq_time +
                (1 + cond_type + acq_time | participant),
              data = MvP, REML = FALSE, na.action = na.exclude)

ma_v3 <- lmer(log_RATIO ~ cond_type * acq_time + is_valid +
                (1 + cond_type + acq_time | participant),
              data = MvP, REML = FALSE, na.action = na.exclude)

ma_v4 <- lmer(log_RATIO ~ cond_type * is_valid +
                (1 + cond_type + acq_time | participant),
              data = MvP, REML = FALSE, na.action = na.exclude)

ma_v5 <- lmer(log_RATIO ~ acq_time * is_valid +
                (1 + cond_type + acq_time | participant),
              data = MvP, REML = FALSE, na.action = na.exclude)

ma_v6 <- lmer(log_RATIO ~ cond_type * acq_time * is_valid +
                (1 + cond_type + acq_time | participant),
              data = MvP, REML = FALSE, na.action = na.exclude)

anova(ma_v2, ma_v3)   # is_valid NOT sig ❌
anova(ma_v1, ma_v4)   # cond_type × is_valid NOT sig ❌
anova(ma_v1, ma_v5)   # acq_time  × is_valid NOT sig ❌
anova(ma_v1, ma_v6)   # three-way NOT sig ❌

# → Validity manipulation does not affect RATIO
# → Check RT analysis (Analysis rt3) for validity effects`,
        note: "This analysis exists to formally document that is_valid is non-significant in log_RATIO. The validity effect in Exp 3 manifests in RT, not reproduction accuracy.",
      },
      {
        label: "Backward selection cross-check",
        code: `full_val <- lmer(log_RATIO ~ cond_type * acq_time * is_valid +
                   (1 + cond_type + acq_time | participant),
                 data = MvP, REML = FALSE, na.action = na.exclude)

red_val1 <- lmer(log_RATIO ~ cond_type + acq_time + is_valid +
                   cond_type:acq_time + cond_type:is_valid + acq_time:is_valid +
                   (1 + cond_type + acq_time | participant),
                 data = MvP, REML = FALSE, na.action = na.exclude)

anova(full_val, red_val1)   # three-way NOT sig ❌

# Drop two-way interactions
red_val2 <- update(red_val1, . ~ . - acq_time:is_valid)
red_val3 <- update(red_val1, . ~ . - cond_type:is_valid)
red_val4 <- update(red_val1, . ~ . - cond_type:acq_time)

anova(red_val1, red_val2)   # acq_time  × is_valid NOT sig ❌
anova(red_val1, red_val3)   # cond_type × is_valid NOT sig ❌  (RATIO)
anova(red_val1, red_val4)   # cond_type × acq_time sig ✅

# Main effects
full_add <- lmer(log_RATIO ~ cond_type + acq_time + is_valid +
                   (1 + cond_type + acq_time | participant),
                 data = MvP, REML = FALSE, na.action = na.exclude)

anova(full_add, update(full_add, . ~ . - cond_type))   # cond_type sig ✅
anova(full_add, update(full_add, . ~ . - acq_time))    # acq_time  sig ✅
anova(full_add, update(full_add, . ~ . - is_valid))    # is_valid  NOT sig ❌`,
      },
      {
        label: "afex confirmation",
        code: `afex_val_simple <- mixed(
  log_RATIO ~ cond_type * acq_time * is_valid + (1 | participant),
  data      = MvP,
  method    = "LRT",
  na.action = na.exclude
)
afex_val_simple

afex_val_complex <- mixed(
  log_RATIO ~ cond_type * acq_time * is_valid +
    (1 + cond_type + acq_time | participant),
  data      = MvP,
  method    = "LRT",
  na.action = na.exclude
)
afex_val_complex`,
      },
    ],
    notes: [
      "Analysis 5 is new in Exp 3 — Exp 2's 50/50 split did not warrant a dedicated validity analysis.",
      "is_valid remains non-significant in log_RATIO even with the stronger 80/20 manipulation.",
      "The validity effect (cond_type × is_valid) IS significant in the RT analysis (Analysis rt3) — reproduction and reaction time capture different aspects of binding.",
      "80/20 split → ~80% of trials are valid, so invalid trials (20%) are rarer — the is_valid factor has unequal cell sizes. Sum contrast coding is especially important here.",
    ],
  },

  // ── RT Analysis: IC vs. IP ────────────────────────────────────────────────
  {
    id: "rt3",
    title: "IC vs. IP — log(RT) · Exp 3",
    subtitle: "Reaction Time · 80/20 validity · cond_type × is_valid significant",
    color: "rose",
    badge: "RT Analysis",
    description:
      "RT analysis in Exp 3 differs critically from Exp 2: the cond_type × is_valid interaction IS significant, and the three-way cond_type × acq_time × is_valid interaction IS significant. This is the key added value of the 80/20 congruency manipulation — validity effects on reaction time are revealed. TC excluded as in Exp 2.",
    design: "2 × 2 × 2 (Condition Type × Acquisition Timing × Trial Validity)",
    dv: "log_space_RT = log(space_RT in ms)",
    predictors: ["cond_type (IC vs. IP)", "acq_time (fixed vs. random)", "is_valid (80% TRUE, 20% FALSE)"],
    randomStructure: "(1 + cond_type + acq_time | participant)",
    contrastCoding: "Sum contrasts",
    naAction: "na.action = na.exclude",
    steps: [
      {
        heading: "Fixed-effects forward selection",
        items: [
          { label: "add cond_type",                          result: "✅ Significant" },
          { label: "add is_valid (after cond_type)",         result: "✅ Significant" },
          { label: "add cond_type × acq_time",               result: "❌ Not significant" },
          { label: "add acq_time + is_valid (both)",         result: "✅ is_valid sig" },
          { label: "add cond_type × is_valid",               result: "✅ Significant ← KEY EXP 3 RESULT" },
          { label: "add acq_time × is_valid",                result: "❌ Not significant" },
          { label: "three-way cond × acq × is_valid",        result: "✅ Significant ← KEY EXP 3 RESULT" },
        ],
      },
      {
        heading: "Random-effects selection",
        items: [
          { label: "Intercept → + cond_type slope",  result: "✅ Needed" },
          { label: "+ cond_type → + acq_time slope", result: "✅ Needed" },
          { label: "+ acq_time → + is_valid slope",  result: "❌ Singular — excluded" },
        ],
      },
    ],
    winningModel: "log_space_RT ~ cond_type * acq_time * is_valid + (1 + cond_type + acq_time | participant)",
    snippets: [
      {
        label: "Forward selection",
        code: `# ── Build trimmed dataset for forward selection ──────────────────────────────
# (use full exp3_RT for random-effects comparison)
prelim_rt3 <- lmer(log_space_RT ~ cond_type * acq_time * is_valid +
                     (1 + cond_type + acq_time | participant),
                   data = exp3_RT, REML = FALSE, na.action = na.exclude)

exp3_RT_trimmed <- trim_by_resid(exp3_RT, prelim_rt3)

# ── Forward selection on trimmed data ────────────────────────────────────────
m0_rt3 <- lmer(log_space_RT ~ 1 +
                 (1 + cond_type + acq_time | participant),
               data = exp3_RT_trimmed, REML = FALSE, na.action = na.exclude)

m1_rt3 <- lmer(log_space_RT ~ cond_type +
                 (1 + cond_type + acq_time | participant),
               data = exp3_RT_trimmed, REML = FALSE, na.action = na.exclude)

m2_rt3 <- lmer(log_space_RT ~ cond_type + is_valid +
                 (1 + cond_type + acq_time | participant),
               data = exp3_RT_trimmed, REML = FALSE, na.action = na.exclude)

m3_rt3 <- lmer(log_space_RT ~ cond_type * acq_time +
                 (1 + cond_type + acq_time | participant),
               data = exp3_RT_trimmed, REML = FALSE, na.action = na.exclude)

m4_rt3 <- lmer(log_space_RT ~ cond_type + acq_time + is_valid +
                 (1 + cond_type + acq_time | participant),
               data = exp3_RT_trimmed, REML = FALSE, na.action = na.exclude)

anova(m0_rt3, m1_rt3)   # cond_type sig ✅
anova(m1_rt3, m2_rt3)   # is_valid  sig ✅ (after cond_type)
anova(m1_rt3, m3_rt3)   # cond × acq NOT sig ❌
anova(m2_rt3, m4_rt3)   # acq_time  sig ✅ (after cond + is_valid)

# Interactions with is_valid
m5_rt3 <- lmer(log_space_RT ~ cond_type + is_valid +
                 (1 + cond_type + acq_time | participant),
               data = exp3_RT_trimmed, REML = FALSE, na.action = na.exclude)

m6_rt3 <- lmer(log_space_RT ~ cond_type * is_valid +
                 (1 + cond_type + acq_time | participant),
               data = exp3_RT_trimmed, REML = FALSE, na.action = na.exclude)

m7_rt3 <- lmer(log_space_RT ~ acq_time + is_valid +
                 (1 + cond_type + acq_time | participant),
               data = exp3_RT_trimmed, REML = FALSE, na.action = na.exclude)

m8_rt3 <- lmer(log_space_RT ~ acq_time * is_valid +
                 (1 + cond_type + acq_time | participant),
               data = exp3_RT_trimmed, REML = FALSE, na.action = na.exclude,
               control = lmerControl(optimizer = "bobyqa"))

m10_rt3 <- lmer(log_space_RT ~ cond_type * acq_time * is_valid +
                  (1 + cond_type + acq_time | participant),
                data = exp3_RT_trimmed, REML = FALSE, na.action = na.exclude)

anova(m5_rt3, m6_rt3)    # cond_type × is_valid SIG ✅ ← KEY EXP 3 RESULT
anova(m7_rt3, m8_rt3)    # acq_time  × is_valid NOT sig ❌
anova(m1_rt3, m10_rt3)   # three-way SIG ✅ ← KEY EXP 3 RESULT

summary(m6_rt3)$coef    # check cond_type × is_valid estimates
summary(m10_rt3)$coef   # three-way model

# → m10_rt3 wins fixed structure`,
        note: "Critical Exp 3 finding: cond_type × is_valid AND three-way interaction are significant in RT — not seen in Exp 2. The 80/20 split powers these effects.",
      },
      {
        label: "Random-effects selection",
        code: `# Use FULL (untrimmed) dataset for random-effects comparison
rr1 <- lmer(log_space_RT ~ cond_type * acq_time * is_valid +
              (1 | participant),
            data = exp3_RT, REML = TRUE, na.action = na.exclude)

rr2 <- lmer(log_space_RT ~ cond_type * acq_time * is_valid +
              (1 + cond_type | participant),
            data = exp3_RT, REML = TRUE, na.action = na.exclude)

rr3 <- lmer(log_space_RT ~ cond_type * acq_time * is_valid +
              (1 + cond_type + acq_time | participant),
            data = exp3_RT, REML = TRUE, na.action = na.exclude)

rr4 <- lmer(log_space_RT ~ cond_type * acq_time * is_valid +
              (1 + cond_type + acq_time + is_valid | participant),
            data = exp3_RT, REML = TRUE, na.action = na.exclude)
# ⚠️ Singular — is_valid slope excluded

anova(rr1, rr2, refit = FALSE)   # cond_type slope needed ✅
anova(rr2, rr3, refit = FALSE)   # acq_time  slope needed ✅
anova(rr3, rr4, refit = FALSE)   # is_valid  slope → singular ⚠️

rt3_final <- rr3
summary(rt3_final)$coef`,
      },
      {
        label: "Backward selection cross-check",
        code: `full_rt3 <- lmer(log_space_RT ~ cond_type * acq_time * is_valid +
                   (1 + cond_type + acq_time | participant),
                 data = exp3_RT, REML = FALSE, na.action = na.exclude)

red1_rt3 <- lmer(log_space_RT ~ cond_type + acq_time + is_valid +
                   cond_type:acq_time + cond_type:is_valid + acq_time:is_valid +
                   (1 + cond_type + acq_time | participant),
                 data = exp3_RT, REML = FALSE, na.action = na.exclude)

anova(full_rt3, red1_rt3)   # three-way SIG ✅

# Drop two-way interactions one at a time from red1_rt3
red2_rt3 <- update(red1_rt3, . ~ . - acq_time:is_valid)
red3_rt3 <- update(red1_rt3, . ~ . - cond_type:is_valid)
red4_rt3 <- update(red1_rt3, . ~ . - cond_type:acq_time)

anova(red1_rt3, red2_rt3)   # acq_time  × is_valid NOT sig ❌
anova(red1_rt3, red3_rt3)   # cond_type × is_valid sig ✅ (after trimming: also sig)
                             # NOTE: becomes sig after trimming in original script
anova(red1_rt3, red4_rt3)   # cond_type × acq_time NOT sig ❌

# Main effects
full_add_rt3 <- lmer(log_space_RT ~ cond_type + acq_time + is_valid +
                       (1 + cond_type + acq_time | participant),
                     data = exp3_RT, REML = FALSE, na.action = na.exclude)

anova(full_add_rt3, update(full_add_rt3, . ~ . - cond_type))   # cond_type sig ✅
anova(full_add_rt3, update(full_add_rt3, . ~ . - acq_time))    # acq_time  NOT sig ❌
anova(full_add_rt3, update(full_add_rt3, . ~ . - is_valid))    # is_valid  sig ✅

summary(full_rt3)$coef
exp(summary(full_rt3)$coef)   # exponentiate to get RT ratio

# Trimming
exp3_RT_trimmed_back <- trim_by_resid(exp3_RT, full_rt3)`,
        note: "cond_type × is_valid becomes significant after trimming in backward selection too. This is a robust finding unique to Exp 3.",
      },
      {
        label: "afex confirmation",
        code: `# Simple random structure
afex_rt3_simple <- mixed(
  log_space_RT ~ cond_type * acq_time * is_valid + (1 | participant),
  data      = exp3_RT,
  method    = "LRT",
  na.action = na.exclude
)
afex_rt3_simple

# Complex random structure
afex_rt3_complex <- mixed(
  log_space_RT ~ cond_type * acq_time * is_valid +
    (1 + cond_type + acq_time | participant),
  data      = exp3_RT,
  method    = "LRT",
  na.action = na.exclude
)
afex_rt3_complex
# Expected: cond_type ✅, is_valid ✅, cond_type × is_valid ✅, three-way ✅`,
      },
      {
        label: "Assumption diagnostics",
        code: `summary(rt3_final)

car::vif(rt3_final)     # should be < 5; watch for is_valid inflation
acf(resid(rt3_final))

hist(resid(full_rt3))   # check full model
qqnorm(resid(full_rt3)); qqline(resid(full_rt3))
plot(density(resid(rt3_final)))
plot(fitted(rt3_final), resid(rt3_final))`,
      },
    ],
    notes: [
      "KEY EXP 3 FINDING: cond_type × is_valid significant in RT — not seen in Exp 2. The 80/20 split reveals that IC and IP differ in HOW they respond to invalid trials.",
      "Three-way cond_type × acq_time × is_valid also significant — the effect of validity depends on both condition type and whether acquisition was fixed or random.",
      "cond_type × is_valid becomes significant after outlier trimming even in backward selection — effect is robust.",
      "is_valid random slope causes singularity — consistent across all experiments. Excluded from random structure.",
      "Exp 3 vs Exp 2 RT comparison: Exp 2 shows only cond_type significant; Exp 3 shows cond_type + is_valid + their interaction. The validity manipulation (80/20) is what drives the new effects.",
      "RT exclusion is done in code here (not Excel as in Exp 2) — the rt_excluded() helper handles this.",
    ],
  },
];

// ─── Condition table (Exp 3) ──────────────────────────────────────────────────
export const conditionTable3 = [
  { id: "1-Motor-FF",      type: "IC", acq: "fixed",  test: "fixed",  label: "IC-FF", block: 1 },
  { id: "4-Motor-RF",      type: "IC", acq: "random", test: "fixed",  label: "IC-RF", block: 2 },
  { id: "3-Prediction-FF", type: "IP", acq: "fixed",  test: "fixed",  label: "IP-FF", block: 3 },
  { id: "6-Prediction-RF", type: "IP", acq: "random", test: "fixed",  label: "IP-RF", block: 4 },
  { id: "7-Control-FF",    type: "TC", acq: "fixed",  test: "fixed",  label: "TC-FF", block: 5 },
  { id: "5-Control-RF",    type: "TC", acq: "random", test: "fixed",  label: "TC-RF", block: 6 },
  { id: "0-Control-RR",    type: "TC", acq: "random", test: "random", label: "TC-RR", block: 7 },
  { id: "2-Control-FR",    type: "TC", acq: "fixed",  test: "random", label: "TC-FR", block: 8 },
];

export const analysisMatrix3 = [
  { analysis: "IC vs. TC — log(RATIO)",        id: "mc3",  conditions: ["1-Motor-FF","4-Motor-RF","7-Control-FF","5-Control-RF"],     color: "violet" },
  { analysis: "TC vs. IP — log(RATIO)",        id: "cp3",  conditions: ["3-Prediction-FF","6-Prediction-RF","7-Control-FF","5-Control-RF"], color: "sky" },
  { analysis: "IC vs. IP — log(RATIO)",        id: "mvp3", conditions: ["1-Motor-FF","4-Motor-RF","3-Prediction-FF","6-Prediction-RF"], color: "emerald" },
  { analysis: "TC — Temporal Control",         id: "tc3",  conditions: ["0-Control-RR","2-Control-FR","7-Control-FF","5-Control-RF"],  color: "amber" },
  { analysis: "Validity Split — log(RATIO)",   id: "val3", conditions: ["1-Motor-FF","4-Motor-RF","3-Prediction-FF","6-Prediction-RF"], color: "teal" },
  { analysis: "IC vs. IP — log(RT)",           id: "rt3",  conditions: ["1-Motor-FF","4-Motor-RF","3-Prediction-FF","6-Prediction-RF"], color: "rose" },
];
