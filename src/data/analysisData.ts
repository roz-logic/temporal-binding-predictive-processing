// ─────────────────────────────────────────────────────────────────────────────
// Experiment 1 — LMM Analysis Reference Data
// n = 10 participants
// DV: RATIO (reproduced_duration / target_duration)
// Fixed time = 550 ms | Varied time = 0–1100 ms
// ─────────────────────────────────────────────────────────────────────────────

export interface CodeSnippet {
  label: string;
  code: string;
  note?: string;
}

export interface AnalysisBlock {
  id: string;
  title: string;
  subtitle: string;
  color: string; // tailwind bg class for accent
  badge: string;
  description: string;
  design: string;
  dv: string;
  predictors: string[];
  randomStructure: string;
  contrastCoding: string;
  steps: {
    heading: string;
    items: { label: string; detail?: string; result: string }[];
  }[];
  winningModel: string;
  snippets: CodeSnippet[];
  notes: string[];
}

// ─── Shared library block ────────────────────────────────────────────────────
export const librariesCode = `library(tidyverse)
library(lme4)
library(car)
library(afex)
library(jtools)
library(kableExtra)`;

// ─── Wrangling block ─────────────────────────────────────────────────────────
export const wranglingCode = `# ── 1. Read & tidy raw data ──────────────────────────────────────────────────
exp1_dat <- read.csv("exp1_data_n10.csv", header = TRUE) |> tibble()

# ── 2. Unit conversion: s → ms ────────────────────────────────────────────────
s_to_ms <- function(x) x * 1000

exp1_clean <- exp1_dat |>
  select(-RATIO, -ABS.ERROR, -Avg.underest..percentage.) |>
  mutate(across(c(wait_duration_before_circle,
                  space_pressed_duration, DIFF),
                ~ s_to_ms(as.numeric(.))))

# ── 3. Derive condition labels ────────────────────────────────────────────────
exp1_clean <- exp1_clean |>
  mutate(
    # Condition type: Identity Control / Motor (IC), Temporal Control (TC),
    #                 Identity Prediction (IP)
    cond_type = case_when(
      condition %in% c("1-Motor-FF","4-Motor-RF")         ~ "IC",
      condition %in% c("0-Control-RR","2-Control-FR",
                       "5-Control-RF","7-Control-FF")     ~ "TC",
      condition %in% c("3-Prediction-FF","6-Prediction-RF") ~ "IP"
    ),
    # Acquisition timing
    acq_time  = ifelse(condition %in% c("5-Control-RF","4-Motor-RF",
                                        "6-Prediction-RF","0-Control-RR"),
                       "random", "fixed"),
    # Test/reproduction timing
    test_time = ifelse(condition %in% c("2-Control-FR","0-Control-RR"),
                       "random", "fixed")
  ) |>
  mutate(across(c(condition, is_valid, cond_type,
                  acq_time, test_time), as.factor))

# ── 4. Derived DV columns ─────────────────────────────────────────────────────
exp1_clean <- exp1_clean |>
  mutate(
    RATIO     = space_pressed_duration / wait_duration_before_circle,
    log_RATIO = log(RATIO),                        # natural log
    RRE       = (space_pressed_duration - wait_duration_before_circle) /
                  wait_duration_before_circle,
    AV_und    = (wait_duration_before_circle - space_pressed_duration) /
                  wait_duration_before_circle,
    Diff      = space_pressed_duration - wait_duration_before_circle
  )

# ── 5. Subset datasets ────────────────────────────────────────────────────────
MC   <- exp1_clean |> filter(cond_type %in% c("IC","TC") &
                              condition %in% c("1-Motor-FF","4-Motor-RF",
                                               "7-Control-FF","5-Control-RF"))

CP   <- exp1_clean |> filter(cond_type %in% c("IP","TC") &
                              condition %in% c("3-Prediction-FF","6-Prediction-RF",
                                               "7-Control-FF","5-Control-RF"))

MvP  <- exp1_clean |> filter(cond_type %in% c("IC","IP"))

TC   <- exp1_clean |> filter(cond_type == "TC")

# ── 6. Sum contrast coding (invariant to Type-II LRT; see Brehm & Alday) ──────
set_sum_contrasts <- function(df, vars) {
  for (v in vars) {
    contrasts(df[[v]]) <- contr.sum(nlevels(df[[v]]))
  }
  df
}

MC  <- set_sum_contrasts(MC,  c("cond_type","acq_time"))
CP  <- set_sum_contrasts(CP,  c("cond_type","acq_time"))
MvP <- set_sum_contrasts(MvP, c("cond_type","acq_time","is_valid"))
TC  <- set_sum_contrasts(TC,  c("acq_time","test_time"))`;

// ─── Analysis blocks ─────────────────────────────────────────────────────────
export const analyses: AnalysisBlock[] = [
  // ── Analysis 1: Motor vs Control ─────────────────────────────────────────
  {
    id: "mc",
    title: "IC vs. TC",
    subtitle: "Identity Control (Motor) vs. Temporal Control",
    color: "violet",
    badge: "Analysis 1",
    description:
      "Compares blocks where participants actively control timing (Identity Control, IC) against passive temporal control (TC). Tests whether motor timing experience affects reproduction ratio.",
    design: "2 × 2 (Condition Type × Acquisition Timing)",
    dv: "RATIO = reproduced / target duration",
    predictors: ["cond_type (IC vs. TC)", "acq_time (fixed vs. random)"],
    randomStructure: "(1 + cond_type + acq_time | participant)",
    contrastCoding: "Sum contrasts — both predictors deviation-coded ±1",
    steps: [
      {
        heading: "Fixed-effects forward selection (LRT)",
        items: [
          { label: "m0 → m1: add cond_type",          result: "✅ Significant" },
          { label: "m1 → m2: add acq_time",           result: "❌ Not significant" },
          { label: "m2 → m3: add cond_type × acq_time", result: "✅ Significant" },
        ],
      },
      {
        heading: "Random-effects forward selection (refit = FALSE)",
        items: [
          { label: "Intercept only → + cond_type slope",           result: "✅ Needed" },
          { label: "+ cond_type slope → + acq_time slope",         result: "✅ Needed" },
        ],
      },
    ],
    winningModel: "RATIO ~ cond_type * acq_time + (1 + cond_type + acq_time | participant)",
    snippets: [
      {
        label: "Model fitting — Motor vs. Control",
        code: `# ── Fixed-effects forward selection ──────────────────────────────────────────
m0_mc <- lmer(RATIO ~ 1 +
                (1 + cond_type + acq_time | participant),
              data = MC, REML = FALSE)

m1_mc <- lmer(RATIO ~ cond_type +
                (1 + cond_type + acq_time | participant),
              data = MC, REML = FALSE)

m2_mc <- lmer(RATIO ~ cond_type + acq_time +
                (1 + cond_type + acq_time | participant),
              data = MC, REML = FALSE)

m3_mc <- lmer(RATIO ~ cond_type * acq_time +
                (1 + cond_type + acq_time | participant),
              data = MC, REML = FALSE)

# Likelihood-ratio tests
anova(m0_mc, m1_mc)   # cond_type    → sig ✅
anova(m1_mc, m2_mc)   # acq_time     → not sig ❌
anova(m2_mc, m3_mc)   # interaction  → sig ✅

# ── Random-effects selection (REML, refit = FALSE) ────────────────────────────
r1_mc <- lmer(RATIO ~ cond_type * acq_time +
                (1 | participant),
              data = MC, REML = TRUE)

r2_mc <- lmer(RATIO ~ cond_type * acq_time +
                (1 + cond_type | participant),
              data = MC, REML = TRUE)

r3_mc <- lmer(RATIO ~ cond_type * acq_time +
                (1 + cond_type + acq_time | participant),
              data = MC, REML = TRUE)

anova(r1_mc, r2_mc, refit = FALSE)   # cond_type slope → needed ✅
anova(r2_mc, r3_mc, refit = FALSE)   # acq_time  slope → needed ✅

# ── Winning model ─────────────────────────────────────────────────────────────
mc_final <- r3_mc
summary(mc_final)$coef`,
        note: "Use REML = FALSE for fixed-effects LRT; switch to REML = TRUE (refit = FALSE) when comparing random structures.",
      },
      {
        label: "Outlier trimming & robustness check",
        code: `# Trim observations where |standardised residual| > 2.5
MC_trimmed <- MC[abs(scale(resid(mc_final))) < 2.5, ]

mc_trimmed_final <- lmer(
  RATIO ~ cond_type * acq_time +
    (1 + cond_type + acq_time | participant),
  data = MC_trimmed, REML = TRUE
)
summary(mc_trimmed_final)$coef`,
      },
      {
        label: "Confirmation with afex::mixed (Type III LRT)",
        code: `afex_mc <- mixed(
  RATIO ~ cond_type * acq_time +
    (1 + cond_type + acq_time | participant),
  data   = MC,
  method = "LRT"
)
afex_mc`,
      },
      {
        label: "Assumption diagnostics",
        code: `# Multicollinearity
car::vif(mc_final)                        # target: all VIF < 5

# Autocorrelation of residuals
acf(resid(mc_final))

# Normality of residuals
hist(resid(mc_final))
plot(density(resid(mc_final)))
qqnorm(resid(mc_final)); qqline(resid(mc_final))

# Homoscedasticity
plot(fitted(mc_final), resid(mc_final))`,
      },
    ],
    notes: [
      "acq_time is not significant as a main effect but its interaction with cond_type is — retain both terms per marginality principle.",
      "Random slopes for both predictors are supported by the data (n = 10); check for singularity if the model fails to converge.",
      "afex::mixed uses Type III LRT by default; conclusions should match the forward-selection approach when using sum contrasts.",
    ],
  },

  // ── Analysis 2: Control vs. Prediction ───────────────────────────────────
  {
    id: "cp",
    title: "TC vs. IP",
    subtitle: "Temporal Control vs. Identity Prediction",
    color: "sky",
    badge: "Analysis 2",
    description:
      "Tests whether predictive timing (Identity Prediction, IP) differs from matched temporal control (TC) blocks, isolating the contribution of learned temporal prediction beyond passive exposure.",
    design: "2 × 2 (Condition Type × Acquisition Timing)",
    dv: "RATIO = reproduced / target duration",
    predictors: ["cond_type (IP vs. TC)", "acq_time (fixed vs. random)"],
    randomStructure: "(1 + cond_type + acq_time | participant)",
    contrastCoding: "Sum contrasts",
    steps: [
      {
        heading: "Fixed-effects (forward selection)",
        items: [
          { label: "m0 → m1: add cond_type",          result: "✅ Significant" },
          { label: "m1 → m2: add acq_time",           result: "❌ Not significant" },
          { label: "m2 → m3: add cond_type × acq_time", result: "✅ Significant" },
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
        label: "Model fitting — Control vs. Prediction",
        code: `# ── Fixed-effects forward selection ──────────────────────────────────────────
m0_cp <- lmer(RATIO ~ 1 +
                (1 + cond_type + acq_time | participant),
              data = CP, REML = FALSE)

m1_cp <- lmer(RATIO ~ cond_type +
                (1 + cond_type + acq_time | participant),
              data = CP, REML = FALSE)

m2_cp <- lmer(RATIO ~ cond_type + acq_time +
                (1 + cond_type + acq_time | participant),
              data = CP, REML = FALSE)

m3_cp <- lmer(RATIO ~ cond_type * acq_time +
                (1 + cond_type + acq_time | participant),
              data = CP, REML = FALSE)

anova(m0_cp, m1_cp)   # cond_type   → sig ✅
anova(m1_cp, m2_cp)   # acq_time    → not sig ❌
anova(m2_cp, m3_cp)   # interaction → sig ✅

# ── Random-effects selection ──────────────────────────────────────────────────
r1_cp <- lmer(RATIO ~ cond_type * acq_time +
                (1 | participant),
              data = CP, REML = TRUE)

r2_cp <- lmer(RATIO ~ cond_type * acq_time +
                (1 + cond_type | participant),
              data = CP, REML = TRUE)

r3_cp <- lmer(RATIO ~ cond_type * acq_time +
                (1 + cond_type + acq_time | participant),
              data = CP, REML = TRUE)

anova(r1_cp, r2_cp, refit = FALSE)
anova(r2_cp, r3_cp, refit = FALSE)

cp_final <- r3_cp
summary(cp_final)$coef`,
        note: "If convergence fails, try control = lmerControl(optimizer = 'bobyqa') before simplifying the random structure.",
      },
      {
        label: "Backward selection cross-check",
        code: `# Start from the maximal fixed-effects model
full_cp <- lmer(
  RATIO ~ cond_type * acq_time +
    (1 + cond_type + acq_time | participant),
  data = CP, REML = FALSE
)

# Drop interaction
red1_cp <- lmer(
  RATIO ~ cond_type + acq_time +
    (1 + cond_type + acq_time | participant),
  data = CP, REML = FALSE
)
anova(full_cp, red1_cp)   # interaction sig? ✅

# Drop main effects from additive model
red2_cp <- update(red1_cp, . ~ . - acq_time)
red3_cp <- update(red1_cp, . ~ . - cond_type)
anova(red1_cp, red2_cp)   # acq_time not sig ❌
anova(red1_cp, red3_cp)   # cond_type sig   ✅`,
      },
    ],
    notes: [
      "Backward and forward selection converge on the same winning model — a good sign for stability.",
      "acq_time is not significant alone but is part of the significant interaction; keep it in the model.",
      "Convergence warnings may appear with small n (10); bobyqa optimiser resolves most cases.",
    ],
  },

  // ── Analysis 3: Motor vs. Prediction ─────────────────────────────────────
  {
    id: "mvp",
    title: "IC vs. IP",
    subtitle: "Identity Control (Motor) vs. Identity Prediction",
    color: "emerald",
    badge: "Analysis 3",
    description:
      "Directly contrasts IC and IP blocks, with trial validity (is_valid) as an additional predictor. This is the only analysis in Exp 1 that includes a validity factor.",
    design: "2 × 2 × 2 (Condition Type × Acquisition Timing × Trial Validity)",
    dv: "RATIO",
    predictors: [
      "cond_type (IC vs. IP)",
      "acq_time (fixed vs. random)",
      "is_valid (valid vs. invalid trial)",
    ],
    randomStructure: "(1 + cond_type + acq_time | participant)",
    contrastCoding: "Sum contrasts on all three predictors",
    steps: [
      {
        heading: "Fixed-effects forward selection",
        items: [
          { label: "add cond_type",                   result: "✅ Significant" },
          { label: "add acq_time",                    result: "❌ Not significant" },
          { label: "add cond_type × acq_time",        result: "❌ Not significant" },
          { label: "add is_valid",                    result: "✅ Significant" },
          { label: "add cond_type × is_valid",        result: "❌ Not significant" },
          { label: "add acq_time × is_valid",         result: "✅ Significant (untrimmed only)" },
          { label: "add three-way interaction",       result: "❌ Not significant" },
        ],
      },
      {
        heading: "Random-effects selection",
        items: [
          { label: "Intercept → + cond_type slope",             result: "✅ Needed" },
          { label: "+ cond_type → + acq_time slope",            result: "✅ Needed" },
          { label: "+ acq_time → + is_valid slope",             result: "⚠️ Singular fit — excluded" },
        ],
      },
    ],
    winningModel:
      "RATIO ~ cond_type + is_valid + (acq_time × is_valid) + (1 + cond_type + acq_time | participant)",
    snippets: [
      {
        label: "Model fitting — Motor vs. Prediction",
        code: `# ── Fixed-effects forward selection ──────────────────────────────────────────
ma0 <- lmer(RATIO ~ 1 +
              (1 + cond_type + acq_time | participant),
            data = MvP, REML = FALSE)

ma1 <- lmer(RATIO ~ cond_type +
              (1 + cond_type + acq_time | participant),
            data = MvP, REML = FALSE)

ma2 <- lmer(RATIO ~ cond_type + acq_time +
              (1 + cond_type + acq_time | participant),
            data = MvP, REML = FALSE)

ma3 <- lmer(RATIO ~ cond_type * acq_time +
              (1 + cond_type + acq_time | participant),
            data = MvP, REML = FALSE)

ma4 <- lmer(RATIO ~ cond_type + acq_time + is_valid +
              (1 + cond_type + acq_time | participant),
            data = MvP, REML = FALSE)

anova(ma0, ma1)   # cond_type sig ✅
anova(ma1, ma2)   # acq_time  not sig ❌
anova(ma2, ma3)   # interaction not sig ❌
anova(ma2, ma4)   # is_valid sig ✅

# Two-way interactions with is_valid
ma5 <- update(ma4, . ~ cond_type + is_valid + .)
ma6 <- lmer(RATIO ~ cond_type * is_valid +
              (1 + cond_type + acq_time | participant),
            data = MvP, REML = FALSE)
anova(ma5, ma6)   # cond_type × is_valid not sig ❌

ma7 <- lmer(RATIO ~ acq_time + is_valid +
              (1 + cond_type + acq_time | participant),
            data = MvP, REML = FALSE)
ma8 <- lmer(RATIO ~ acq_time * is_valid +
              (1 + cond_type + acq_time | participant),
            data = MvP, REML = FALSE)
anova(ma7, ma8)   # acq_time × is_valid sig (untrimmed) ✅

# Three-way
ma9  <- lmer(RATIO ~ cond_type + acq_time + is_valid +
               cond_type:acq_time + cond_type:is_valid + acq_time:is_valid +
               (1 + cond_type + acq_time | participant),
             data = MvP, REML = FALSE)
ma10 <- lmer(RATIO ~ cond_type * acq_time * is_valid +
               (1 + cond_type + acq_time | participant),
             data = MvP, REML = FALSE)
anova(ma9, ma10)   # three-way not sig ❌`,
        note: "is_valid random slope causes singularity — conceptually and empirically justified to exclude it from the random structure.",
      },
      {
        label: "Random-effects selection",
        code: `# Build up from random-intercept model
ra1 <- lmer(RATIO ~ acq_time * is_valid +
              (1 | participant),
            data = MvP, REML = TRUE)

ra2 <- lmer(RATIO ~ acq_time * is_valid +
              (1 + cond_type | participant),
            data = MvP, REML = TRUE)

ra3 <- lmer(RATIO ~ acq_time * is_valid +
              (1 + cond_type + acq_time | participant),
            data = MvP, REML = TRUE)

ra4 <- lmer(RATIO ~ acq_time * is_valid +
              (1 + cond_type + acq_time + is_valid | participant),
            data = MvP, REML = TRUE)   # ⚠️ singular

anova(ra1, ra2, refit = FALSE)   # cond_type slope needed ✅
anova(ra2, ra3, refit = FALSE)   # acq_time  slope needed ✅
anova(ra3, ra4, refit = FALSE)   # is_valid  slope → singular, exclude

mvp_final <- ra3
summary(mvp_final)$coef`,
      },
      {
        label: "Backward selection cross-check",
        code: `# Full model with all main effects
full_mvp <- lmer(
  RATIO ~ cond_type + acq_time + is_valid +
    (1 + cond_type + acq_time | participant),
  data = MvP, REML = FALSE
)

# Drop each main effect in turn
red_no_cond <- update(full_mvp, . ~ . - cond_type)
red_no_acq  <- update(full_mvp, . ~ . - acq_time)
red_no_val  <- update(full_mvp, . ~ . - is_valid)

anova(full_mvp, red_no_cond)   # cond_type sig ✅
anova(full_mvp, red_no_acq)    # acq_time  not sig ❌
anova(full_mvp, red_no_val)    # is_valid  sig ✅`,
      },
    ],
    notes: [
      "acq_time × is_valid interaction becomes non-significant after outlier trimming — treat with caution.",
      "Excluding the is_valid random slope is justified: singularity signals over-parametrisation with n = 10.",
      "afex::mixed with the maximal random structure shows only cond_type as significant — most conservative result.",
    ],
  },

  // ── Analysis 4: Temporal Control ─────────────────────────────────────────
  {
    id: "tc",
    title: "Temporal Control",
    subtitle: "Acquisition Timing × Test Timing — log(RATIO)",
    color: "amber",
    badge: "Analysis 4",
    description:
      "Examines whether the timing of the acquisition phase (fixed/random) and the timing of the test/reproduction phase (fixed/random) affect log(RATIO) in purely passive temporal control blocks. log transform is applied because raw RATIO residuals are non-normal.",
    design: "2 × 2 (Acquisition Timing × Test Timing)",
    dv: "log_RATIO = log(reproduced / target)",
    predictors: ["acq_time (fixed vs. random)", "test_time (fixed vs. random)"],
    randomStructure: "(1 + acq_time + test_time | participant)",
    contrastCoding: "Sum contrasts",
    steps: [
      {
        heading: "Fixed-effects forward selection",
        items: [
          { label: "add acq_time",                    result: "❌ Not significant" },
          { label: "add test_time",                   result: "✅ Significant" },
          { label: "add acq_time × test_time",        result: "✅ Significant" },
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
    winningModel:
      "log_RATIO ~ acq_time * test_time + (1 + acq_time + test_time | participant)",
    snippets: [
      {
        label: "Model fitting — Temporal Control",
        code: `# ── Fixed-effects forward selection ──────────────────────────────────────────
mb0 <- lmer(log_RATIO ~ 1 +
              (1 + acq_time + test_time | participant),
            data = TC, REML = FALSE)

mb1 <- lmer(log_RATIO ~ acq_time +
              (1 + acq_time + test_time | participant),
            data = TC, REML = FALSE)

mb2 <- lmer(log_RATIO ~ acq_time + test_time +
              (1 + acq_time + test_time | participant),
            data = TC, REML = FALSE)

mb3 <- lmer(log_RATIO ~ acq_time * test_time +
              (1 + acq_time + test_time | participant),
            data = TC, REML = FALSE)

anova(mb0, mb1)   # acq_time   not sig ❌
anova(mb1, mb2)   # test_time  sig ✅
anova(mb2, mb3)   # interaction sig ✅   (note: test from mb1 per marginality)

# ── Random-effects selection ──────────────────────────────────────────────────
rb1 <- lmer(log_RATIO ~ acq_time * test_time +
              (1 | participant),
            data = TC, REML = TRUE)

rb2 <- lmer(log_RATIO ~ acq_time * test_time +
              (1 + acq_time | participant),
            data = TC, REML = TRUE)

rb3 <- lmer(log_RATIO ~ acq_time * test_time +
              (1 + acq_time + test_time | participant),
            data = TC, REML = TRUE)

anova(rb1, rb2, refit = FALSE)   # acq_time  slope needed ✅
anova(rb2, rb3, refit = FALSE)   # test_time slope needed ✅

tc_final <- rb3
summary(tc_final)$coef`,
        note: "log_RATIO is used here because RATIO residuals were non-normal in TC blocks (see QQ plot). Interpret coefficients on the log scale.",
      },
      {
        label: "Backward selection cross-check",
        code: `full_tc <- lmer(
  log_RATIO ~ acq_time * test_time +
    (1 + acq_time + test_time | participant),
  data = TC, REML = FALSE
)

red_no_int  <- update(full_tc, . ~ acq_time + test_time + .)
red_no_acq  <- update(red_no_int, . ~ . - acq_time)
red_no_test <- update(red_no_int, . ~ . - test_time)

anova(full_tc,   red_no_int)    # interaction sig ✅
anova(red_no_int, red_no_acq)   # acq_time   not sig ❌
anova(red_no_int, red_no_test)  # test_time  sig ✅`,
      },
      {
        label: "afex confirmation + by-condition model",
        code: `# Confirm with afex (Type III LRT)
afex_tc <- mixed(
  log_RATIO ~ acq_time * test_time +
    (1 + acq_time + test_time | participant),
  data   = TC,
  method = "LRT"
)
afex_tc
# Expected: acq_time not sig, test_time sig, interaction sig

# Exploratory: all four TC conditions as a single factor
tc_cond <- lmer(log_RATIO ~ condition + (1 | participant), data = TC, REML = FALSE)
tc_cond_rs <- lmer(log_RATIO ~ condition + (1 + condition | participant),
                   data = TC, REML = TRUE)
anova(tc_cond, update(tc_cond, . ~ 1 + .))   # condition sig ✅
anova(tc_cond, tc_cond_rs, refit = FALSE)    # random slope needed ✅`,
      },
      {
        label: "Assumption diagnostics",
        code: `# Run on the winning model
summary(tc_final)

# Multicollinearity (should be < 5)
car::vif(tc_final)

# Autocorrelation
acf(resid(tc_final))

# Normality
hist(resid(tc_final))
plot(density(resid(tc_final)))
qqnorm(resid(tc_final)); qqline(resid(tc_final))

# Homoscedasticity
plot(fitted(tc_final), resid(tc_final))`,
      },
    ],
    notes: [
      "log transform was chosen empirically after checking QQ plots on raw RATIO; re-check residuals after transformation.",
      "acq_time is not significant alone but participates in the interaction — retain by marginality principle.",
      "With only 4 conditions × n = 10, the maximal random structure is ambitious; check for singularity warnings.",
    ],
  },
];

// ─── Contrast coding rationale ────────────────────────────────────────────────
export const contrastRationale = {
  heading: "Why sum contrasts?",
  body: [
    "Sum (deviation) coding centres predictors at zero, making the intercept the grand mean rather than a reference-cell mean — easier to interpret with multiple factors.",
    "For likelihood-ratio tests (LRT) comparing nested models, contrast coding makes very little difference — the LRT statistic is invariant to the choice of contrasts (Brehm & Alday, 2022).",
    "The highest-level interaction and Type-II tests (where the tested term and all terms it participates in are dropped) are fully invariant to contrast choice.",
    "Type-III tests (where only the focal term is dropped, leaving higher-order terms in the model) are sensitive to contrast choice — another reason to prefer sum coding when using afex::mixed, which implements Type-III LRT.",
  ],
};

// ─── Experiment design overview ───────────────────────────────────────────────
export const conditionTable = [
  { id: "0-Control-RR",   type: "TC", acq: "random", test: "random",  label: "Control RR" },
  { id: "1-Motor-FF",     type: "IC", acq: "fixed",  test: "fixed",   label: "Motor FF" },
  { id: "2-Control-FR",   type: "TC", acq: "fixed",  test: "random",  label: "Control FR" },
  { id: "3-Prediction-FF",type: "IP", acq: "fixed",  test: "fixed",   label: "Prediction FF" },
  { id: "4-Motor-RF",     type: "IC", acq: "random", test: "fixed",   label: "Motor RF" },
  { id: "5-Control-RF",   type: "TC", acq: "random", test: "fixed",   label: "Control RF" },
  { id: "6-Prediction-RF",type: "IP", acq: "random", test: "fixed",   label: "Prediction RF" },
  { id: "7-Control-FF",   type: "TC", acq: "fixed",  test: "fixed",   label: "Control FF" },
];

export const analysisMatrix = [
  { analysis: "IC vs. TC — Identity Control vs. Temporal Control",      conditions: ["1-Motor-FF","4-Motor-RF","7-Control-FF","5-Control-RF"] },
  { analysis: "TC vs. IP — Temporal Control vs. Identity Prediction",   conditions: ["3-Prediction-FF","6-Prediction-RF","7-Control-FF","5-Control-RF"] },
  { analysis: "IC vs. IP — Identity Control vs. Identity Prediction",   conditions: ["1-Motor-FF","4-Motor-RF","3-Prediction-FF","6-Prediction-RF"] },
  { analysis: "TC — Temporal Control (all four blocks)",                conditions: ["0-Control-RR","2-Control-FR","5-Control-RF","7-Control-FF"] },
];
