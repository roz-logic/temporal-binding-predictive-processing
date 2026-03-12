# =============================================================================
# Experiment 1: Temporal Binding — RATIO Analysis
# =============================================================================
# Author      : Oz
# Project     : MA Thesis — Temporal Binding & Predictive Processing
# Description : Linear Mixed Model (LMM) analyses of the RATIO measure
#               for Experiment 1 (n = 10 participants, pilot).
#
#               Four analyses:
#                 A. Identity Control vs Temporal Control         (IC_vs_TC)   [2 × 2]
#                 B. Temporal Control vs Identity Prediction      (TC_vs_IP)   [2 × 2]
#                 C. Identity Control vs Identity Prediction      (IC_vs_IP)   [2 × 2 × 2]
#                 D. Temporal Control only                        (TC_only)    [2 × 2, log-RATIO]
#
# Statistical approach:
#   - Forward and backward model selection via likelihood-ratio tests (LRT)
#   - Type III tests via afex::mixed() for confirmatory check
#   - Sum (effect) coding for all categorical predictors
#   - Outlier trimming: ±2.5 SD on model residuals (per-model, not global)
#   - Random slopes included where supported by data
#
# NOTE on contrast coding: Sum coding is used throughout. Because LRT model
# comparison drives significance testing, contrast choice makes much less
# difference than for Wald/Type I tests. Type III tests (afex) confirm.
# See: Brehm & Alday (2022); Barr et al. (2013).
#
# To reproduce: place exp1_data_n10.csv in a /data subfolder and run from
# the project root. Install {here} and {renv} for fully reproducible paths.
# =============================================================================

# =============================================================================
# SECTION 0: Libraries & Reproducibility
# =============================================================================

library(here)         # reproducible cross-platform file paths
library(tidyverse)    # data wrangling + ggplot2
library(lme4)         # linear mixed models
library(car)          # multicollinearity check (vif)
library(afex)         # Type III LRT via mixed()
library(jtools)       # model summary helpers
library(kableExtra)   # table formatting

# Run once to snapshot package versions for reproducibility:
# renv::snapshot()

sessionInfo()   # log session for reproducibility

# =============================================================================
# SECTION 1: Data Loading
# =============================================================================

dat_raw <- read.csv(
  here("data", "exp1_data_n10.csv"),
  header = TRUE
)
dat_raw <- as_tibble(dat_raw)

# =============================================================================
# SECTION 2: Data Wrangling & Feature Engineering
# =============================================================================

# --- 2.1 Unit conversion: seconds → milliseconds ----------------------------
s_to_ms <- function(x) x * 1000

dat_exp1 <- dat_raw %>%
  select(-RATIO, -ABS.ERROR, -Avg.underest..percentage.) %>%   # drop pre-computed cols (recalculated below)
  mutate(across(
    c(wait_duration_before_circle, space_pressed_duration, DIFF),
    as.numeric
  )) %>%
  mutate(across(
    c(wait_duration_before_circle, space_pressed_duration, DIFF),
    s_to_ms
  ))

# --- 2.2 Condition labels & timing factors ----------------------------------
# condition_type : Identity Control (IC) | Temporal Control (TC) | Identity Prediction (IP)
# acquisition_time: timing regime during acquisition phase (fixed / random)
# test_time       : timing regime during test phase (fixed / random) — TC blocks only

dat_exp1 <- dat_exp1 %>%
  mutate(
    condition_type = case_when(
      condition %in% c("1-Motor-FF", "4-Motor-RF")              ~ "IC",   # Identity Control
      condition %in% c("3-Prediction-FF", "6-Prediction-RF")    ~ "IP",   # Identity Prediction
      condition %in% c("0-Control-RR", "2-Control-FR",
                       "5-Control-RF", "7-Control- FF")         ~ "TC",   # Temporal Control
    ),
    acquisition_time = if_else(
      condition %in% c("0-Control-RR", "4-Motor-RF",
                       "5-Control-RF", "6-Prediction-RF"),
      "random", "fixed"
    ),
    test_time = if_else(
      condition %in% c("0-Control-RR", "2-Control-FR"),
      "random", "fixed"
    )
  )

# --- 2.3 Dependent variables -------------------------------------------------
dat_exp1 <- dat_exp1 %>%
  mutate_at(
    vars(condition, is_valid, condition_type, acquisition_time, test_time),
    as.factor
  ) %>%
  mutate(
    ratio                      = space_pressed_duration / wait_duration_before_circle,
    log_ratio                  = log(ratio),           # natural log; log_ratio ~ 0 = no binding
    relative_reproduction_error = (space_pressed_duration - wait_duration_before_circle) /
                                   wait_duration_before_circle,
    difference_ms              = space_pressed_duration - wait_duration_before_circle
  )

# --- 2.4 Sanity check -------------------------------------------------------
stopifnot(sum(is.na(dat_exp1$log_ratio)) == 0)
cat("✓ No missing values in key columns.\n")
cat("  Missing in ratio    :", sum(is.na(dat_exp1$ratio)), "\n")
cat("  Missing in is_valid :", sum(is.na(dat_exp1$is_valid)), "\n")

# =============================================================================
# SECTION 3: Condition Subsets
# =============================================================================

# A. Identity Control vs Temporal Control  [2 × 2: condition_type × acquisition_time]
identity_vs_temporal_control <- dat_exp1 %>%
  filter(condition %in% c("1-Motor-FF", "4-Motor-RF",
                           "7-Control- FF", "5-Control-RF"))

# B. Temporal Control vs Identity Prediction  [2 × 2: condition_type × acquisition_time]
temporal_control_vs_identity_prediction <- dat_exp1 %>%
  filter(condition %in% c("3-Prediction-FF", "6-Prediction-RF",
                           "7-Control- FF", "5-Control-RF"))

# C. Identity Control vs Identity Prediction  [2 × 2 × 2: condition_type × acquisition_time × is_valid]
identity_control_vs_identity_prediction <- dat_exp1 %>%
  filter(condition %in% c("1-Motor-FF", "4-Motor-RF",
                           "3-Prediction-FF", "6-Prediction-RF"))

# D. Temporal Control only  [2 × 2: acquisition_time × test_time]
temporal_control_only <- dat_exp1 %>%
  filter(condition %in% c("0-Control-RR", "2-Control-FR",
                           "5-Control-RF", "7-Control- FF"))

# =============================================================================
# SECTION 4: Contrast Coding (Sum / Effect Coding)
# =============================================================================
# Sum coding: each level coded relative to the grand mean.
# Ensures main effects are interpretable in the presence of interactions,
# and is invariant to the highest-order interaction under LRT.

set_sum_contrasts <- function(df, vars) {
  for (v in vars) {
    contrasts(df[[v]]) <- contr.Sum(levels(df[[v]]))
  }
  df
}

identity_vs_temporal_control <- set_sum_contrasts(
  identity_vs_temporal_control, c("condition_type", "acquisition_time"))

temporal_control_vs_identity_prediction <- set_sum_contrasts(
  temporal_control_vs_identity_prediction, c("condition_type", "acquisition_time"))

identity_control_vs_identity_prediction <- set_sum_contrasts(
  identity_control_vs_identity_prediction, c("condition_type", "acquisition_time", "is_valid"))

temporal_control_only <- set_sum_contrasts(
  temporal_control_only, c("acquisition_time", "test_time"))

# Helper: print outlier removal counts
report_outlier_removal <- function(original_df, trimmed_df, label) {
  n_removed <- nrow(original_df) - nrow(trimmed_df)
  pct <- round(100 * n_removed / nrow(original_df), 2)
  cat(sprintf("  [%s] Outliers removed: %d (%.2f%% of trials)\n", label, n_removed, pct))
}

# =============================================================================
# SECTION 5: ANALYSIS A — Identity Control vs Temporal Control (IC vs TC)
# Predictors: condition_type (IC vs TC) × acquisition_time (fixed vs random)
# DV: ratio
# Research question: Does voluntary action (IC) produce more binding than
#   temporal control alone (TC)?
# =============================================================================

cat("\n--- Analysis A: Identity Control vs Temporal Control (IC vs TC) ---\n")

# --- 5.1 Forward selection: fixed effects (REML = FALSE for LRT) -------------

ic_tc_null <- lmer(ratio ~ 1 + (1 + condition_type + acquisition_time | participant),
                   identity_vs_temporal_control, REML = FALSE)

ic_tc_m1   <- lmer(ratio ~ condition_type + (1 + condition_type + acquisition_time | participant),
                   identity_vs_temporal_control, REML = FALSE)
anova(ic_tc_null, ic_tc_m1)   # condition_type significant?
summary(ic_tc_m1)$coef

ic_tc_m2   <- lmer(ratio ~ condition_type + acquisition_time +
                     (1 + condition_type + acquisition_time | participant),
                   identity_vs_temporal_control, REML = FALSE)
anova(ic_tc_m1, ic_tc_m2)     # acquisition_time significant?

ic_tc_m3   <- lmer(ratio ~ condition_type * acquisition_time +
                     (1 + condition_type + acquisition_time | participant),
                   identity_vs_temporal_control, REML = FALSE)
anova(ic_tc_m2, ic_tc_m3)     # interaction significant?
summary(ic_tc_m3)$coef

# --- 5.2 Random effects (REML = TRUE for comparison) ------------------------

ic_tc_rand1 <- lmer(ratio ~ condition_type * acquisition_time +
                      (1 + condition_type | participant),
                    identity_vs_temporal_control)
anova(ic_tc_m3, ic_tc_rand1, refit = FALSE)   # condition_type slope needed?

ic_tc_rand2 <- lmer(ratio ~ condition_type * acquisition_time +
                      (1 + condition_type + acquisition_time | participant),
                    identity_vs_temporal_control)
anova(ic_tc_rand1, ic_tc_rand2, refit = FALSE)   # acquisition_time slope also needed?

ic_tc_best <- ic_tc_rand2   # maximal supported random structure

# --- 5.3 Backward selection (confirmatory) -----------------------------------

ic_tc_full <- lmer(ratio ~ condition_type * acquisition_time +
                     (1 + condition_type + acquisition_time | participant),
                   identity_vs_temporal_control, REML = FALSE)
ic_tc_bk1  <- lmer(ratio ~ condition_type + acquisition_time +
                     (1 + condition_type + acquisition_time | participant),
                   identity_vs_temporal_control, REML = FALSE)
anova(ic_tc_full, ic_tc_bk1)    # interaction significant?

ic_tc_bk2  <- lmer(ratio ~ acquisition_time +
                     (1 + condition_type + acquisition_time | participant),
                   identity_vs_temporal_control, REML = FALSE)
anova(ic_tc_bk1, ic_tc_bk2)     # condition_type main effect?

ic_tc_bk3  <- lmer(ratio ~ condition_type +
                     (1 + condition_type + acquisition_time | participant),
                   identity_vs_temporal_control, REML = FALSE)
anova(ic_tc_bk1, ic_tc_bk3)     # acquisition_time main effect?

# --- 5.4 Outlier trimming (±2.5 SD on ic_tc_full residuals) -----------------
identity_vs_temporal_control_trim <- identity_vs_temporal_control[
  abs(scale(resid(ic_tc_full))) < 2.5, ]
report_outlier_removal(identity_vs_temporal_control, identity_vs_temporal_control_trim, "IC vs TC")

ic_tc_best_trim <- lmer(
  ratio ~ condition_type * acquisition_time +
    (1 + condition_type + acquisition_time | participant),
  identity_vs_temporal_control_trim)
summary(ic_tc_best_trim)$coef

# --- 5.5 Type III LRT via afex (confirmatory) --------------------------------
ic_tc_afex <- mixed(
  ratio ~ condition_type * acquisition_time +
    (1 + condition_type + acquisition_time | participant),
  data   = identity_vs_temporal_control,
  method = "LRT"
)
ic_tc_afex

ic_tc_afex_simple <- mixed(
  ratio ~ condition_type * acquisition_time + (1 | participant),
  data   = identity_vs_temporal_control,
  method = "LRT"
)
ic_tc_afex_simple

# --- 5.6 Assumption checks ---------------------------------------------------
vif(ic_tc_full)                         # multicollinearity: all should be < 5
acf(resid(ic_tc_full))                  # autocorrelation in residuals
hist(resid(ic_tc_full), breaks = 30, main = "IC vs TC: Residuals")
plot(density(resid(ic_tc_full)), main = "IC vs TC: Residual density")
qqnorm(resid(ic_tc_full)); qqline(resid(ic_tc_full))
plot(fitted(ic_tc_full), resid(ic_tc_full),
     xlab = "Fitted", ylab = "Residuals", main = "IC vs TC: Fitted vs Residuals")
abline(h = 0, col = "red", lty = 2)

# =============================================================================
# SECTION 6: ANALYSIS B — Temporal Control vs Identity Prediction (TC vs IP)
# Predictors: condition_type (TC vs IP) × acquisition_time (fixed vs random)
# DV: ratio
# Research question: Does identity prediction (learned tone/action-outcome
#   mapping, without temporal control) produce binding?
# =============================================================================

cat("\n--- Analysis B: Temporal Control vs Identity Prediction (TC vs IP) ---\n")

# --- 6.1 Forward selection ---------------------------------------------------

tc_ip_null <- lmer(ratio ~ 1 + (1 + condition_type + acquisition_time | participant),
                   temporal_control_vs_identity_prediction, REML = FALSE)

tc_ip_m1   <- lmer(ratio ~ condition_type +
                     (1 + condition_type + acquisition_time | participant),
                   temporal_control_vs_identity_prediction, REML = FALSE)
anova(tc_ip_null, tc_ip_m1)
summary(tc_ip_m1)$coef

tc_ip_m2   <- lmer(ratio ~ condition_type + acquisition_time +
                     (1 + condition_type + acquisition_time | participant),
                   temporal_control_vs_identity_prediction, REML = FALSE)
anova(tc_ip_m1, tc_ip_m2)

tc_ip_m3   <- lmer(ratio ~ condition_type * acquisition_time +
                     (1 + condition_type + acquisition_time | participant),
                   temporal_control_vs_identity_prediction, REML = FALSE)
anova(tc_ip_m2, tc_ip_m3)
summary(tc_ip_m3)$coef

# --- 6.2 Random effects ------------------------------------------------------

tc_ip_rand1 <- lmer(ratio ~ condition_type * acquisition_time +
                      (1 + condition_type | participant),
                    temporal_control_vs_identity_prediction)
anova(tc_ip_m3, tc_ip_rand1, refit = FALSE)

tc_ip_rand2 <- lmer(ratio ~ condition_type * acquisition_time +
                      (1 + condition_type + acquisition_time | participant),
                    temporal_control_vs_identity_prediction)
anova(tc_ip_rand1, tc_ip_rand2, refit = FALSE)

tc_ip_best <- tc_ip_rand2

# --- 6.3 Backward selection (confirmatory) -----------------------------------

tc_ip_full <- lmer(ratio ~ condition_type * acquisition_time +
                     (1 + condition_type + acquisition_time | participant),
                   temporal_control_vs_identity_prediction, REML = FALSE)
tc_ip_bk1  <- lmer(ratio ~ condition_type + acquisition_time +
                     (1 + condition_type + acquisition_time | participant),
                   temporal_control_vs_identity_prediction, REML = FALSE)
anova(tc_ip_full, tc_ip_bk1)

tc_ip_bk2  <- lmer(ratio ~ acquisition_time +
                     (1 + condition_type + acquisition_time | participant),
                   temporal_control_vs_identity_prediction, REML = FALSE)
anova(tc_ip_bk1, tc_ip_bk2)

tc_ip_bk3  <- lmer(ratio ~ condition_type +
                     (1 + condition_type + acquisition_time | participant),
                   temporal_control_vs_identity_prediction, REML = FALSE)
anova(tc_ip_bk1, tc_ip_bk3)

# --- 6.4 Outlier trimming ---------------------------------------------------
# BUG FIX vs original: trimming now uses residuals from tc_ip_full (fit on this
# subset), NOT residuals from a model fit on a different subset.
temporal_control_vs_identity_prediction_trim <- temporal_control_vs_identity_prediction[
  abs(scale(resid(tc_ip_full))) < 2.5, ]
report_outlier_removal(temporal_control_vs_identity_prediction,
                       temporal_control_vs_identity_prediction_trim, "TC vs IP")

tc_ip_best_trim <- lmer(
  ratio ~ condition_type * acquisition_time +
    (1 + condition_type + acquisition_time | participant),
  temporal_control_vs_identity_prediction_trim)
summary(tc_ip_best_trim)$coef

# --- 6.5 Type III LRT via afex ----------------------------------------------
tc_ip_afex <- mixed(
  ratio ~ condition_type * acquisition_time +
    (1 + condition_type + acquisition_time | participant),
  data   = temporal_control_vs_identity_prediction,
  method = "LRT"
)
tc_ip_afex

tc_ip_afex_simple <- mixed(
  ratio ~ condition_type * acquisition_time + (1 | participant),
  data   = temporal_control_vs_identity_prediction,
  method = "LRT"
)
tc_ip_afex_simple

# --- 6.6 Assumption checks --------------------------------------------------
vif(tc_ip_full)
acf(resid(tc_ip_full))
hist(resid(tc_ip_full), breaks = 30, main = "TC vs IP: Residuals")
plot(density(resid(tc_ip_full)), main = "TC vs IP: Residual density")
qqnorm(resid(tc_ip_full)); qqline(resid(tc_ip_full))
plot(fitted(tc_ip_full), resid(tc_ip_full),
     xlab = "Fitted", ylab = "Residuals", main = "TC vs IP: Fitted vs Residuals")
abline(h = 0, col = "red", lty = 2)

# =============================================================================
# SECTION 7: ANALYSIS C — Identity Control vs Identity Prediction (IC vs IP)
# Predictors: condition_type (IC vs IP) × acquisition_time × is_valid
# DV: ratio
# Research question: Does validity (congruent vs incongruent identity
#   mapping) modulate binding, and does it interact with condition or timing?
# NOTE: Exploratory given the 3-way structure; afex serves as primary check.
# =============================================================================

cat("\n--- Analysis C: Identity Control vs Identity Prediction (IC vs IP) ---\n")

# --- 7.1 Forward selection ---------------------------------------------------

ic_ip_null <- lmer(ratio ~ 1 + (1 + condition_type + acquisition_time | participant),
                   identity_control_vs_identity_prediction, REML = FALSE)

ic_ip_m1   <- lmer(ratio ~ condition_type +
                     (1 + condition_type + acquisition_time | participant),
                   identity_control_vs_identity_prediction, REML = FALSE)
anova(ic_ip_null, ic_ip_m1)   # condition_type significant?
summary(ic_ip_m1)$coef

ic_ip_m2   <- lmer(ratio ~ condition_type + acquisition_time +
                     (1 + condition_type + acquisition_time | participant),
                   identity_control_vs_identity_prediction, REML = FALSE)
anova(ic_ip_m1, ic_ip_m2)     # acquisition_time?

ic_ip_m3   <- lmer(ratio ~ condition_type + acquisition_time + is_valid +
                     (1 + condition_type + acquisition_time | participant),
                   identity_control_vs_identity_prediction, REML = FALSE)
anova(ic_ip_m2, ic_ip_m3)     # is_valid significant?
summary(ic_ip_m3)$coef

# Two-way interactions
ic_ip_m4   <- lmer(ratio ~ condition_type + acquisition_time + is_valid +
                     condition_type:acquisition_time +
                     (1 + condition_type + acquisition_time | participant),
                   identity_control_vs_identity_prediction, REML = FALSE)
anova(ic_ip_m3, ic_ip_m4)     # condition_type × acquisition_time?

ic_ip_m5   <- lmer(ratio ~ condition_type + acquisition_time + is_valid +
                     condition_type:is_valid +
                     (1 + condition_type + acquisition_time | participant),
                   identity_control_vs_identity_prediction, REML = FALSE)
anova(ic_ip_m3, ic_ip_m5)     # condition_type × is_valid?

ic_ip_m6   <- lmer(ratio ~ condition_type + acquisition_time + is_valid +
                     acquisition_time:is_valid +
                     (1 + condition_type + acquisition_time | participant),
                   identity_control_vs_identity_prediction, REML = FALSE)
anova(ic_ip_m3, ic_ip_m6)     # acquisition_time × is_valid?

# Three-way interaction
ic_ip_m7   <- lmer(ratio ~ condition_type + acquisition_time + is_valid +
                     condition_type:acquisition_time + condition_type:is_valid +
                     acquisition_time:is_valid +
                     (1 + condition_type + acquisition_time | participant),
                   identity_control_vs_identity_prediction, REML = FALSE)
ic_ip_m8   <- lmer(ratio ~ condition_type * acquisition_time * is_valid +
                     (1 + condition_type + acquisition_time | participant),
                   identity_control_vs_identity_prediction, REML = FALSE)
anova(ic_ip_m7, ic_ip_m8)     # three-way interaction?

# --- 7.2 Random effects ------------------------------------------------------

ic_ip_rand1 <- lmer(ratio ~ acquisition_time * is_valid +
                      (1 + condition_type | participant),
                    identity_control_vs_identity_prediction)
anova(ic_ip_m6, ic_ip_rand1, refit = FALSE)

ic_ip_rand2 <- lmer(ratio ~ acquisition_time * is_valid +
                      (1 + condition_type + acquisition_time | participant),
                    identity_control_vs_identity_prediction)
anova(ic_ip_rand1, ic_ip_rand2, refit = FALSE)

ic_ip_rand3 <- lmer(ratio ~ acquisition_time * is_valid +
                      (1 + condition_type + acquisition_time + is_valid | participant),
                    identity_control_vs_identity_prediction)
# Note: singularity warning expected — is_valid random slope not theoretically
# motivated; removing it gives a more parsimonious model (Barr et al., 2013).
anova(ic_ip_rand2, ic_ip_rand3, refit = FALSE)

ic_ip_best <- ic_ip_rand2

# --- 7.3 Backward selection (confirmatory) -----------------------------------

ic_ip_full  <- lmer(ratio ~ condition_type * acquisition_time * is_valid +
                      (1 + condition_type + acquisition_time | participant),
                    identity_control_vs_identity_prediction, REML = FALSE)
ic_ip_bk1   <- lmer(ratio ~ condition_type + acquisition_time + is_valid +
                       condition_type:acquisition_time + condition_type:is_valid +
                       acquisition_time:is_valid +
                       (1 + condition_type + acquisition_time | participant),
                     identity_control_vs_identity_prediction, REML = FALSE)
anova(ic_ip_full, ic_ip_bk1)    # three-way interaction?

ic_ip_bk2   <- lmer(ratio ~ condition_type + acquisition_time + is_valid +
                       condition_type:acquisition_time + condition_type:is_valid +
                       (1 + condition_type + acquisition_time | participant),
                     identity_control_vs_identity_prediction, REML = FALSE)
anova(ic_ip_bk1, ic_ip_bk2)     # acquisition_time × is_valid?

ic_ip_bk3   <- lmer(ratio ~ condition_type + acquisition_time + is_valid +
                       condition_type:acquisition_time + acquisition_time:is_valid +
                       (1 + condition_type + acquisition_time | participant),
                     identity_control_vs_identity_prediction, REML = FALSE)
anova(ic_ip_bk1, ic_ip_bk3)     # condition_type × is_valid?

ic_ip_bk4   <- lmer(ratio ~ condition_type + acquisition_time + is_valid +
                       condition_type:is_valid + acquisition_time:is_valid +
                       (1 + condition_type + acquisition_time | participant),
                     identity_control_vs_identity_prediction, REML = FALSE)
anova(ic_ip_bk1, ic_ip_bk4)     # condition_type × acquisition_time?

# Main effects only
ic_ip_main     <- lmer(ratio ~ condition_type + acquisition_time + is_valid +
                         (1 + condition_type + acquisition_time | participant),
                       identity_control_vs_identity_prediction, REML = FALSE)
ic_ip_main_noCT <- lmer(ratio ~ acquisition_time + is_valid +
                           (1 + condition_type + acquisition_time | participant),
                         identity_control_vs_identity_prediction, REML = FALSE)
anova(ic_ip_main, ic_ip_main_noCT)    # condition_type main effect?

ic_ip_main_noAQ <- lmer(ratio ~ condition_type + is_valid +
                           (1 + condition_type + acquisition_time | participant),
                         identity_control_vs_identity_prediction, REML = FALSE)
anova(ic_ip_main, ic_ip_main_noAQ)    # acquisition_time main effect?

ic_ip_main_noIV <- lmer(ratio ~ condition_type + acquisition_time +
                           (1 + condition_type + acquisition_time | participant),
                         identity_control_vs_identity_prediction, REML = FALSE)
anova(ic_ip_main, ic_ip_main_noIV)    # is_valid main effect?

# --- 7.4 Outlier trimming ---------------------------------------------------
identity_control_vs_identity_prediction_trim <- identity_control_vs_identity_prediction[
  abs(scale(resid(ic_ip_main))) < 2.5, ]
report_outlier_removal(identity_control_vs_identity_prediction,
                       identity_control_vs_identity_prediction_trim, "IC vs IP")

ic_ip_best_trim <- lmer(
  ratio ~ condition_type + acquisition_time + is_valid +
    (1 + condition_type + acquisition_time | participant),
  identity_control_vs_identity_prediction_trim)
summary(ic_ip_best_trim)$coef

# --- 7.5 Type III LRT via afex ----------------------------------------------
ic_ip_afex <- mixed(
  ratio ~ condition_type * acquisition_time * is_valid +
    (1 + condition_type + acquisition_time | participant),
  data    = identity_control_vs_identity_prediction,
  method  = "LRT",
  control = lmerControl(optimizer = "bobyqa")
)
ic_ip_afex

ic_ip_afex_simple <- mixed(
  ratio ~ condition_type * acquisition_time * is_valid + (1 | participant),
  data   = identity_control_vs_identity_prediction,
  method = "LRT"
)
ic_ip_afex_simple

# --- 7.6 Assumption checks --------------------------------------------------
vif(ic_ip_main)
acf(resid(ic_ip_main))
hist(resid(ic_ip_main), breaks = 30, main = "IC vs IP: Residuals")
plot(density(resid(ic_ip_main)), main = "IC vs IP: Residual density")
qqnorm(resid(ic_ip_main)); qqline(resid(ic_ip_main))
plot(fitted(ic_ip_main), resid(ic_ip_main),
     xlab = "Fitted", ylab = "Residuals", main = "IC vs IP: Fitted vs Residuals")
abline(h = 0, col = "red", lty = 2)

# =============================================================================
# SECTION 8: ANALYSIS D — Temporal Control Only (TC)
# Predictors: acquisition_time × test_time
# DV: log_ratio (RATIO residuals non-normal; log-transform applied)
# Research question: Does the timing regime (fixed/random) at acquisition
#   or test affect the reproduced interval in purely passive blocks?
# NOTE: Gamma GLMM is an alternative sensitivity check (commented out).
# =============================================================================

cat("\n--- Analysis D: Temporal Control Only (TC) ---\n")

# --- 8.1 Forward selection ---------------------------------------------------

tc_null <- lmer(log_ratio ~ 1 + (1 + acquisition_time + test_time | participant),
                temporal_control_only, REML = FALSE)

tc_m1   <- lmer(log_ratio ~ acquisition_time +
                  (1 + acquisition_time + test_time | participant),
                temporal_control_only, REML = FALSE)
anova(tc_null, tc_m1)     # acquisition_time significant?
summary(tc_m1)$coef

tc_m2   <- lmer(log_ratio ~ acquisition_time + test_time +
                  (1 + acquisition_time + test_time | participant),
                temporal_control_only, REML = FALSE)
anova(tc_m1, tc_m2)       # test_time significant?
summary(tc_m2)$coef

tc_m3   <- lmer(log_ratio ~ acquisition_time * test_time +
                  (1 + acquisition_time + test_time | participant),
                temporal_control_only, REML = FALSE)
anova(tc_m2, tc_m3)       # interaction significant?
summary(tc_m3)$coef

# --- 8.2 Random effects ------------------------------------------------------

tc_rand1 <- lmer(log_ratio ~ acquisition_time * test_time +
                   (1 + acquisition_time | participant),
                 temporal_control_only)
anova(tc_m3, tc_rand1, refit = FALSE)   # acquisition_time slope needed?

tc_rand2 <- lmer(log_ratio ~ acquisition_time * test_time +
                   (1 + acquisition_time + test_time | participant),
                 temporal_control_only)
anova(tc_rand1, tc_rand2, refit = FALSE)   # test_time slope also needed?

tc_best <- tc_rand2

# --- 8.3 Backward selection (confirmatory) -----------------------------------
# BUG FIX vs original: original mixed RATIO and log_ratio within this section.
# All TC backward-selection models consistently use log_ratio.

tc_full <- lmer(log_ratio ~ acquisition_time * test_time +
                  (1 + acquisition_time + test_time | participant),
                temporal_control_only, REML = FALSE)
tc_bk1  <- lmer(log_ratio ~ acquisition_time + test_time +
                  (1 + acquisition_time + test_time | participant),
                temporal_control_only, REML = FALSE)
anova(tc_full, tc_bk1)    # interaction significant?
summary(tc_full)$coef

tc_bk2  <- lmer(log_ratio ~ test_time +
                  (1 + acquisition_time + test_time | participant),
                temporal_control_only, REML = FALSE)
anova(tc_bk1, tc_bk2)     # acquisition_time significant?

tc_bk3  <- lmer(log_ratio ~ acquisition_time +
                  (1 + acquisition_time + test_time | participant),
                temporal_control_only, REML = FALSE)
anova(tc_bk1, tc_bk3)     # test_time significant?

# Random slopes (backward)
tc_brand1 <- lmer(log_ratio ~ acquisition_time * test_time +
                    (1 + acquisition_time | participant), temporal_control_only)
anova(tc_full, tc_brand1, refit = FALSE)

tc_brand2 <- lmer(log_ratio ~ acquisition_time * test_time +
                    (1 + acquisition_time + test_time | participant), temporal_control_only)
anova(tc_brand1, tc_brand2, refit = FALSE)

# --- 8.4 Condition-level model (sanity check — all 4 TC blocks) -------------
tc_cond_null <- lmer(log_ratio ~ 1 + (1 | participant),
                     temporal_control_only, REML = FALSE)
tc_cond_m1   <- lmer(log_ratio ~ condition + (1 | participant),
                     temporal_control_only, REML = FALSE)
tc_cond_m2   <- lmer(log_ratio ~ condition + (1 + condition | participant),
                     temporal_control_only)
anova(tc_cond_null, tc_cond_m1)
anova(tc_cond_m1, tc_cond_m2, refit = FALSE)
summary(tc_cond_m2)

# --- 8.5 Outlier trimming ---------------------------------------------------
temporal_control_only_trim <- temporal_control_only[
  abs(scale(resid(tc_full))) < 2.5, ]
report_outlier_removal(temporal_control_only, temporal_control_only_trim, "TC only")

tc_best_trim <- lmer(
  log_ratio ~ acquisition_time * test_time +
    (1 + acquisition_time + test_time | participant),
  temporal_control_only_trim)
summary(tc_best_trim)$coef

# --- 8.6 Type III LRT via afex ----------------------------------------------
tc_afex <- mixed(
  log_ratio ~ acquisition_time * test_time + (1 | participant),
  data   = temporal_control_only,
  method = "LRT"
)
tc_afex

tc_afex_complex <- mixed(
  log_ratio ~ acquisition_time * test_time +
    (1 + acquisition_time + test_time | participant),
  data   = temporal_control_only,
  method = "LRT"
)
tc_afex_complex

# --- 8.7 Assumption checks --------------------------------------------------
vif(tc_full)
acf(resid(tc_full))
hist(resid(tc_full), breaks = 30, main = "TC: Residuals")
plot(density(resid(tc_full)), main = "TC: Residual density")
qqnorm(resid(tc_full)); qqline(resid(tc_full))
plot(fitted(tc_full), resid(tc_full),
     xlab = "Fitted", ylab = "Residuals", main = "TC: Fitted vs Residuals")
abline(h = 0, col = "red", lty = 2)

# =============================================================================
# SECTION 9: Visualisation
# =============================================================================

# Colour palette (colourblind-friendly)
palette_acq  <- c("fixed" = "#800000", "random" = "#FFDAB9")
palette_test <- c("fixed" = "#C1666B", "random" = "#4281A4")

# Helper: compute group mean ± SE
summarise_dv <- function(df, group_vars, dv) {
  df %>%
    group_by(across(all_of(group_vars))) %>%
    summarise(
      mean_dv = mean(.data[[dv]], na.rm = TRUE),
      se_dv   = sd(.data[[dv]], na.rm = TRUE) / sqrt(n()),
      ymin    = mean_dv - se_dv,
      ymax    = mean_dv + se_dv,
      .groups = "drop"
    )
}

# --- Plot A: Identity Control vs Temporal Control ---------------------------
identity_vs_temporal_control$block_label <-
  paste(identity_vs_temporal_control$condition_type, "|",
        identity_vs_temporal_control$acquisition_time)

ic_tc_summary <- summarise_dv(
  identity_vs_temporal_control,
  c("block_label", "condition_type", "acquisition_time"), "ratio")

p_ic_tc <- ggplot(ic_tc_summary,
                  aes(x = block_label, y = mean_dv,
                      fill = acquisition_time, ymin = ymin, ymax = ymax)) +
  geom_col(width = 0.7, position = position_dodge(0.8), color = "black") +
  geom_errorbar(width = 0.2, linewidth = 0.8, position = position_dodge(0.8)) +
  geom_hline(yintercept = 1.0, linetype = "dashed", color = "gray50") +
  scale_fill_manual(values = palette_acq, name = "Acquisition Time",
                    labels = c("Fixed", "Random")) +
  scale_y_continuous(expand = expansion(mult = c(0, 0.1))) +
  labs(title    = "Experiment 1: Identity Control vs Temporal Control",
       subtitle = "Ratio < 1.0 = time compression (binding)",
       x = "Experimental Block",
       y = "Reproduction Ratio (Reproduced / Physical)") +
  theme_classic(base_size = 13) +
  theme(plot.title = element_text(face = "bold"), legend.position = "top")

p_ic_tc
ggsave(here("figures", "exp1_ic_vs_tc.png"), p_ic_tc, width = 8, height = 6, dpi = 300)

# --- Plot B: Temporal Control vs Identity Prediction ------------------------
temporal_control_vs_identity_prediction$block_label <-
  paste(temporal_control_vs_identity_prediction$condition_type, "|",
        temporal_control_vs_identity_prediction$acquisition_time)

tc_ip_summary <- summarise_dv(
  temporal_control_vs_identity_prediction,
  c("block_label", "condition_type", "acquisition_time"), "ratio")

p_tc_ip <- ggplot(tc_ip_summary,
                  aes(x = block_label, y = mean_dv,
                      fill = acquisition_time, ymin = ymin, ymax = ymax)) +
  geom_col(width = 0.7, position = position_dodge(0.8), color = "black") +
  geom_errorbar(width = 0.2, linewidth = 0.8, position = position_dodge(0.8)) +
  geom_hline(yintercept = 1.0, linetype = "dashed", color = "gray50") +
  scale_fill_manual(values = palette_acq, name = "Acquisition Time") +
  scale_y_continuous(expand = expansion(mult = c(0, 0.1))) +
  labs(title = "Experiment 1: Temporal Control vs Identity Prediction",
       x = "Experimental Block", y = "Reproduction Ratio") +
  theme_classic(base_size = 13) +
  theme(plot.title = element_text(face = "bold"), legend.position = "top")

p_tc_ip
ggsave(here("figures", "exp1_tc_vs_ip.png"), p_tc_ip, width = 8, height = 6, dpi = 300)

# --- Plot C: Identity Control vs Identity Prediction (by validity) ----------
identity_control_vs_identity_prediction$block_label <-
  paste(identity_control_vs_identity_prediction$condition_type, "|",
        identity_control_vs_identity_prediction$acquisition_time)

ic_ip_summary <- identity_control_vs_identity_prediction %>%
  group_by(block_label, condition_type, acquisition_time, is_valid) %>%
  summarise(
    mean_dv = mean(ratio, na.rm = TRUE),
    se_dv   = sd(ratio, na.rm = TRUE) / sqrt(n()),
    ymin    = mean_dv - se_dv,
    ymax    = mean_dv + se_dv,
    .groups = "drop"
  )

p_ic_ip <- ggplot(ic_ip_summary,
                  aes(x = block_label, y = mean_dv,
                      fill = is_valid, ymin = ymin, ymax = ymax)) +
  geom_col(width = 0.7, position = position_dodge(0.8), color = "black") +
  geom_errorbar(width = 0.2, linewidth = 0.8, position = position_dodge(0.8)) +
  geom_hline(yintercept = 1.0, linetype = "dashed", color = "gray50") +
  scale_fill_manual(values = c("TRUE" = "#800000", "FALSE" = "#FFDAB9"),
                    name = "Validity",
                    labels = c("Incongruent", "Congruent")) +
  scale_y_continuous(expand = expansion(mult = c(0, 0.1))) +
  labs(title = "Experiment 1: Identity Control vs Identity Prediction (Validity)",
       x = "Experimental Block", y = "Reproduction Ratio") +
  theme_classic(base_size = 13) +
  theme(plot.title = element_text(face = "bold"), legend.position = "top")

p_ic_ip
ggsave(here("figures", "exp1_ic_vs_ip_validity.png"), p_ic_ip, width = 8, height = 6, dpi = 300)

# --- Plot D: Temporal Control blocks (log_ratio) ----------------------------
temporal_control_only$block_label <-
  paste("TC |", temporal_control_only$acquisition_time)

tc_summary <- temporal_control_only %>%
  group_by(block_label, acquisition_time, test_time) %>%
  summarise(
    mean_dv = mean(log_ratio, na.rm = TRUE),
    se_dv   = sd(log_ratio, na.rm = TRUE) / sqrt(n()),
    ymin    = mean_dv - se_dv,
    ymax    = mean_dv + se_dv,
    .groups = "drop"
  )

p_tc <- ggplot(tc_summary,
               aes(x = block_label, y = mean_dv,
                   fill = test_time, ymin = ymin, ymax = ymax)) +
  geom_col(width = 0.7, position = position_dodge(0.8), color = "black") +
  geom_errorbar(width = 0.2, linewidth = 0.8, position = position_dodge(0.8)) +
  scale_fill_manual(values = palette_test, name = "Test Time") +
  scale_y_continuous(expand = expansion(mult = c(0.1, 0.1))) +
  labs(title    = "Experiment 1: Temporal Control Blocks",
       subtitle = "log(Ratio) used — RATIO residuals were non-normal",
       x = "Experimental Block", y = "Mean log(Reproduction Ratio)") +
  theme_classic(base_size = 13) +
  theme(plot.title = element_text(face = "bold"), legend.position = "top")

p_tc
ggsave(here("figures", "exp1_temporal_control.png"), p_tc, width = 8, height = 6, dpi = 300)

# =============================================================================
# END OF ANALYSIS SCRIPT
# To reproduce: place exp1_data_n10.csv in /data and run from project root.
# =============================================================================
