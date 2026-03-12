# =============================================================================
# Experiment 2: Temporal Binding — RATIO Analysis
# =============================================================================
# Author      : Oz
# Project     : MA Thesis — Temporal Binding & Predictive Mechanisms
# Department : Cognitive Science
# Description : Linear Mixed Model (LMM) analyses of the RATIO measure
#               for Experiment 2 (n = 41; 1 excluded from 42 for catch accuracy).
#               Four analyses:
#                 MC   : Identity Control vs Temporal Control  [2 × 2]
#                 CP   : Identity Prediction vs Temporal Control [2 × 2]
#                 mvsp : Identity Control vs Identity Prediction [2 × 2 × 2]
#                 TC   : Temporal Control blocks only [2 × 2, log-RATIO]
#
# Key design differences from Exp 1:
#   - Fixed IEI: 650 ms (was 550 ms)
#   - Random IEI: 150–1150 ms (was 0–1100 ms)
#   - Acquisition: 30 trials + 20% catch (was 50 trials, no catch)
#   - Test: 50 trials, 50% congruent / 50% incongruent (was uncontrolled)
#   - RT recorded as manipulation check
#   - 1 participant excluded (catch accuracy < 80%)
#
# DV note:
#   MC, CP, mvsp : RATIO (raw) — normality acceptable
#   TC           : log(RATIO)  — normality required log-transform
#
# Statistical approach:
#   - Forward and backward model selection via likelihood-ratio tests (LRT)
#   - Type III tests via afex::mixed() for confirmatory check
#   - Sum (effect) coding for all categorical predictors
#   - Outlier trimming: ±2.5 SD on winning model residuals
#   - Random slopes included where supported by data
#
# References:
#   Barr et al. (2013) — keep maximal random effects
#   Brehm & Alday (2022) — sum coding rationale
# =============================================================================

# =============================================================================
# SECTION 0: Libraries & Setup
# =============================================================================

library(here)
library(tidyverse)
library(lme4)
library(car)
library(afex)
library(jtools)
library(kableExtra)

set.seed(42)          # reproducibility
sessionInfo()

# =============================================================================
# SECTION 1: Data Loading
# =============================================================================

dat_raw <- read.csv(
  here("data", "exp2_data_n41.csv"),
  header = TRUE
)
dat_raw <- as_tibble(dat_raw)

# =============================================================================
# SECTION 2: Data Wrangling & Feature Engineering
# =============================================================================

s_to_ms <- function(x) x * 1000

dat_clean <- dat_raw %>%
  mutate(across(
    c(wait_duration_before_circle, space_pressed_duration, DIFF),
    as.numeric
  )) %>%
  mutate(across(
    c(wait_duration_before_circle, space_pressed_duration, DIFF),
    s_to_ms
  ))

# --- 2.1 Condition factors ---------------------------------------------------
# cond.type : IC (Identity Control) | TC (Temporal Control) | IP (Identity Prediction)
# acq.time  : fixed | random  (acquisition phase IEI)
# test.time : fixed | random  (test phase IEI — relevant for TC blocks only)
# is_valid  : TRUE | FALSE    (congruent vs incongruent test trial)

dat_exp2 <- dat_clean %>%
  mutate(
    cond.type = case_when(
      condition %in% c("IC-FF", "IC-RF") ~ "IC",
      condition %in% c("IP-FF", "IP-RF") ~ "IP",
      condition %in% c("TC-RR", "TC-FR", "TC-RF", "TC-FF") ~ "TC"
    ),
    acq.time = case_when(
      condition %in% c("IC-FF", "IP-FF", "TC-FF", "TC-FR") ~ "fixed",
      condition %in% c("IC-RF", "IP-RF", "TC-RR", "TC-RF") ~ "random"
    ),
    test.time = case_when(
      condition %in% c("TC-FF", "TC-RF", "IC-FF", "IC-RF",
                       "IP-FF", "IP-RF") ~ "fixed",
      condition %in% c("TC-RR", "TC-FR") ~ "random"
    )
  ) %>%
  mutate_at(
    vars(condition, is_valid, cond.type, acq.time, test.time, participant),
    as.factor
  ) %>%
  mutate(
    RATIO     = space_pressed_duration / wait_duration_before_circle,
    log_RATIO = log(RATIO)
  ) %>%
  # Exclude RT outliers (< 100 ms or > 2000 ms) as per pre-registration
  filter(space_RT >= 100 | is.na(space_RT)) %>%
  filter(space_RT <= 2000 | is.na(space_RT))

# --- 2.2 Sanity checks -------------------------------------------------------
stopifnot(sum(is.na(dat_exp2$RATIO)) == 0)
stopifnot(n_distinct(dat_exp2$participant) == 41)
message("✓ n = ", n_distinct(dat_exp2$participant), " participants after exclusion.")

# Print contrast coding confirmation
print(contrasts(dat_exp2$cond.type))
print(contrasts(dat_exp2$acq.time))

# =============================================================================
# SECTION 3: Condition Subsets
# =============================================================================

dat_mc   <- dat_exp2 %>% filter(condition %in% c("IC-FF", "IC-RF", "TC-RF", "TC-FF"))
dat_cp   <- dat_exp2 %>% filter(condition %in% c("IP-FF", "IP-RF", "TC-RF", "TC-FF"))
dat_mvsp <- dat_exp2 %>% filter(condition %in% c("IC-FF", "IC-RF", "IP-FF", "IP-RF"))
dat_tc   <- dat_exp2 %>% filter(cond.type == "TC")

# =============================================================================
# SECTION 4: Contrast Coding (Sum / Effect Coding)
# =============================================================================

apply_sum_contrasts <- function(df, vars) {
  for (v in vars) {
    contrasts(df[[v]]) <- contr.sum(nlevels(df[[v]]))
  }
  df
}

dat_mc   <- apply_sum_contrasts(dat_mc,   c("cond.type", "acq.time"))
dat_cp   <- apply_sum_contrasts(dat_cp,   c("cond.type", "acq.time"))
dat_mvsp <- apply_sum_contrasts(dat_mvsp, c("cond.type", "acq.time", "is_valid"))
dat_tc   <- apply_sum_contrasts(dat_tc,   c("acq.time", "test.time"))

# Confirm contrasts applied
print(contrasts(dat_mc$cond.type))
print(contrasts(dat_mc$acq.time))

# =============================================================================
# SECTION 5: ANALYSIS MC — Identity Control vs Temporal Control [2 × 2]
# DV: RATIO
# =============================================================================

message("\n--- Analysis MC: Identity Control vs Temporal Control ---")

# Forward selection — fixed effects
mc_null <- lmer(RATIO ~ 1 + (1 + cond.type + acq.time | participant),
                dat_mc, REML = FALSE, na.action = na.exclude)
mc_m1   <- update(mc_null, . ~ . + cond.type)
anova(mc_null, mc_m1)

mc_m2   <- update(mc_m1, . ~ . + acq.time)
anova(mc_m1, mc_m2)

mc_m3   <- update(mc_m2, . ~ . + cond.type:acq.time)
anova(mc_m2, mc_m3)
summary(mc_m3)$coef

# Backward selection (confirmatory)
mc_full <- lmer(RATIO ~ cond.type * acq.time + (1 + cond.type + acq.time | participant),
                dat_mc, REML = FALSE, na.action = na.exclude)
mc_bk1  <- update(mc_full, . ~ . - cond.type:acq.time)
anova(mc_full, mc_bk1)

mc_bk2  <- update(mc_bk1, . ~ . - acq.time)
anova(mc_bk1, mc_bk2)

mc_bk3  <- update(mc_bk1, . ~ . - cond.type)
anova(mc_bk1, mc_bk3)

# Random effects selection
mc_rand1 <- lmer(RATIO ~ cond.type * acq.time + (1 + cond.type | participant),
                 dat_mc, REML = TRUE, na.action = na.exclude)
mc_rand2 <- lmer(RATIO ~ cond.type * acq.time + (1 + cond.type + acq.time | participant),
                 dat_mc, REML = TRUE, na.action = na.exclude)
anova(mc_rand1, mc_rand2, refit = FALSE)

mc_best <- mc_rand2

# Outlier trimming on winning model
dat_mc_trim <- dat_mc[abs(scale(resid(mc_best))) < 2.5, ]
mc_trim <- update(mc_best, data = dat_mc_trim)
summary(mc_trim)$coef

# Type III LRT via afex
mc_afex <- mixed(
  RATIO ~ cond.type * acq.time + (1 + cond.type + acq.time | participant),
  data = dat_mc, method = "LRT"
)
mc_afex

# Assumption checks
vif(mc_full)
qqnorm(resid(mc_full)); qqline(resid(mc_full))
plot(fitted(mc_full), resid(mc_full),
     xlab = "Fitted", ylab = "Residuals", main = "MC: Fitted vs Residuals")

# =============================================================================
# SECTION 6: ANALYSIS CP — Identity Prediction vs Temporal Control [2 × 2]
# DV: RATIO
# =============================================================================

message("\n--- Analysis CP: Identity Prediction vs Temporal Control ---")

cp_null <- lmer(RATIO ~ 1 + (1 + cond.type + acq.time | participant),
                dat_cp, REML = FALSE, na.action = na.exclude)
cp_m1   <- update(cp_null, . ~ . + cond.type)
anova(cp_null, cp_m1)

cp_m2   <- update(cp_m1, . ~ . + acq.time)
anova(cp_m1, cp_m2)

cp_m3   <- update(cp_m2, . ~ . + cond.type:acq.time)
anova(cp_m2, cp_m3)
summary(cp_m3)$coef

# Backward
cp_full <- lmer(RATIO ~ cond.type * acq.time + (1 + cond.type + acq.time | participant),
                dat_cp, REML = FALSE, na.action = na.exclude)
cp_bk1  <- update(cp_full, . ~ . - cond.type:acq.time)
anova(cp_full, cp_bk1)

cp_bk2  <- update(cp_bk1, . ~ . - acq.time)
anova(cp_bk1, cp_bk2)

cp_bk3  <- update(cp_bk1, . ~ . - cond.type)
anova(cp_bk1, cp_bk3)

# Random effects
cp_rand1 <- lmer(RATIO ~ cond.type * acq.time + (1 + cond.type | participant),
                 dat_cp, REML = TRUE, na.action = na.exclude)
cp_rand2 <- lmer(RATIO ~ cond.type * acq.time + (1 + cond.type + acq.time | participant),
                 dat_cp, REML = TRUE, na.action = na.exclude)
anova(cp_rand1, cp_rand2, refit = FALSE)

cp_best <- cp_rand2

dat_cp_trim <- dat_cp[abs(scale(resid(cp_best))) < 2.5, ]
cp_trim <- update(cp_best, data = dat_cp_trim)
summary(cp_trim)$coef

cp_afex <- mixed(
  RATIO ~ cond.type * acq.time + (1 + cond.type + acq.time | participant),
  data = dat_cp, method = "LRT"
)
cp_afex

qqnorm(resid(cp_full)); qqline(resid(cp_full))
plot(fitted(cp_full), resid(cp_full),
     xlab = "Fitted", ylab = "Residuals", main = "CP: Fitted vs Residuals")

# =============================================================================
# SECTION 7: ANALYSIS mvsp — IC vs IP [2 × 2 × 2]
# DV: RATIO
# Predictors: cond.type × acq.time × is_valid
# =============================================================================

message("\n--- Analysis mvsp: IC vs IP (validity comparison) ---")

mvsp_null <- lmer(RATIO ~ 1 + (1 + cond.type + acq.time | participant),
                  dat_mvsp, REML = FALSE, na.action = na.exclude)
mvsp_m1   <- update(mvsp_null, . ~ . + cond.type)
anova(mvsp_null, mvsp_m1)

mvsp_m2   <- update(mvsp_m1, . ~ . + acq.time)
anova(mvsp_m1, mvsp_m2)

mvsp_m3   <- update(mvsp_m2, . ~ . + is_valid)
anova(mvsp_m2, mvsp_m3)

mvsp_m4   <- update(mvsp_m3, . ~ . + cond.type:acq.time)
anova(mvsp_m3, mvsp_m4)

mvsp_m5   <- update(mvsp_m4, . ~ . + cond.type:is_valid)
anova(mvsp_m4, mvsp_m5)

mvsp_m6   <- update(mvsp_m5, . ~ . + acq.time:is_valid)
anova(mvsp_m5, mvsp_m6)

mvsp_m7   <- update(mvsp_m6, . ~ . + cond.type:acq.time:is_valid)
anova(mvsp_m6, mvsp_m7)
summary(mvsp_m7)$coef

# Backward
mvsp_full <- lmer(RATIO ~ cond.type * acq.time * is_valid +
                    (1 + cond.type + acq.time | participant),
                  dat_mvsp, REML = FALSE, na.action = na.exclude)
mvsp_bk1  <- update(mvsp_full, . ~ . - cond.type:acq.time:is_valid)
anova(mvsp_full, mvsp_bk1)

# Random effects
mvsp_rand1 <- lmer(RATIO ~ cond.type * acq.time * is_valid +
                     (1 + cond.type | participant),
                   dat_mvsp, REML = TRUE, na.action = na.exclude)
mvsp_rand2 <- lmer(RATIO ~ cond.type * acq.time * is_valid +
                     (1 + cond.type + acq.time | participant),
                   dat_mvsp, REML = TRUE, na.action = na.exclude)
anova(mvsp_rand1, mvsp_rand2, refit = FALSE)

mvsp_best <- mvsp_rand2

dat_mvsp_trim <- dat_mvsp[abs(scale(resid(mvsp_best))) < 2.5, ]
mvsp_trim <- update(mvsp_best, data = dat_mvsp_trim)
summary(mvsp_trim)$coef

mvsp_afex <- mixed(
  RATIO ~ cond.type * acq.time * is_valid + (1 + cond.type + acq.time | participant),
  data = dat_mvsp, method = "LRT"
)
mvsp_afex

qqnorm(resid(mvsp_full)); qqline(resid(mvsp_full))
plot(fitted(mvsp_full), resid(mvsp_full),
     xlab = "Fitted", ylab = "Residuals", main = "mvsp: Fitted vs Residuals")

# =============================================================================
# SECTION 8: ANALYSIS TC — Temporal Control blocks [2 × 2]
# DV: log(RATIO)  ← log-transform required; raw RATIO violated normality
# Predictors: acq.time × test.time
# =============================================================================

message("\n--- Analysis TC: Temporal Control blocks ---")

tc_null <- lmer(log_RATIO ~ 1 + (1 + acq.time + test.time | participant),
                dat_tc, REML = FALSE, na.action = na.exclude)
tc_m1   <- update(tc_null, . ~ . + acq.time)
anova(tc_null, tc_m1)

tc_m2   <- update(tc_m1, . ~ . + test.time)
anova(tc_m1, tc_m2)

tc_m3   <- update(tc_m2, . ~ . + acq.time:test.time)
anova(tc_m2, tc_m3)
summary(tc_m3)$coef

# Backward
tc_full <- lmer(log_RATIO ~ acq.time * test.time + (1 + acq.time + test.time | participant),
                dat_tc, REML = FALSE, na.action = na.exclude)
tc_bk1  <- update(tc_full, . ~ . - acq.time:test.time)
anova(tc_full, tc_bk1)

tc_bk2  <- update(tc_bk1, . ~ . - test.time)
anova(tc_bk1, tc_bk2)

tc_bk3  <- update(tc_bk1, . ~ . - acq.time)
anova(tc_bk1, tc_bk3)

# Random effects
tc_rand1 <- lmer(log_RATIO ~ acq.time * test.time + (1 + acq.time | participant),
                 dat_tc, REML = TRUE, na.action = na.exclude)
tc_rand2 <- lmer(log_RATIO ~ acq.time * test.time + (1 + acq.time + test.time | participant),
                 dat_tc, REML = TRUE, na.action = na.exclude)
anova(tc_rand1, tc_rand2, refit = FALSE)

tc_best <- tc_rand2

dat_tc_trim <- dat_tc[abs(scale(resid(tc_best))) < 2.5, ]
tc_trim <- update(tc_best, data = dat_tc_trim)
summary(tc_trim)$coef

tc_afex <- mixed(
  log_RATIO ~ acq.time * test.time + (1 + acq.time + test.time | participant),
  data = dat_tc, method = "LRT"
)
tc_afex

qqnorm(resid(tc_full)); qqline(resid(tc_full))
plot(fitted(tc_full), resid(tc_full),
     xlab = "Fitted", ylab = "Residuals", main = "TC: Fitted vs Residuals")

# =============================================================================
# SECTION 9: Visualisation
# =============================================================================

palette_acq <- c("fixed" = "peachpuff", "random" = "maroon")

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

# --- MC plot (RATIO) ----------------------------------------------------------
dat_mc$block_label <- paste(dat_mc$cond.type, "|", dat_mc$acq.time)
mc_summary <- summarise_dv(dat_mc, c("block_label", "cond.type", "acq.time"), "RATIO")

p_mc <- ggplot(mc_summary,
               aes(x = block_label, y = mean_dv, fill = acq.time,
                   ymin = ymin, ymax = ymax)) +
  geom_col(width = 0.7, position = position_dodge(0.8), color = "black") +
  geom_errorbar(width = 0.15, linewidth = 0.8,
                position = position_dodge(0.8), alpha = 0.7) +
  scale_fill_manual(values = palette_acq) +
  labs(x = "Block", y = "Mean RATIO",
       fill = "Acquisition Timing",
       title = "Exp 2: Identity Control vs Temporal Control") +
  theme_classic(base_size = 13) +
  theme(legend.position = "top")
p_mc
ggsave(here("figures", "exp2_MC_RATIO.png"), p_mc, width = 8, height = 6, dpi = 300)

# --- CP plot (RATIO) ----------------------------------------------------------
dat_cp$block_label <- paste(dat_cp$cond.type, "|", dat_cp$acq.time)
cp_summary <- summarise_dv(dat_cp, c("block_label", "cond.type", "acq.time"), "RATIO")

p_cp <- ggplot(cp_summary,
               aes(x = block_label, y = mean_dv, fill = acq.time,
                   ymin = ymin, ymax = ymax)) +
  geom_col(width = 0.7, position = position_dodge(0.8), color = "black") +
  geom_errorbar(width = 0.15, linewidth = 0.8,
                position = position_dodge(0.8), alpha = 0.7) +
  scale_fill_manual(values = palette_acq) +
  labs(x = "Block", y = "Mean RATIO",
       fill = "Acquisition Timing",
       title = "Exp 2: Identity Prediction vs Temporal Control") +
  theme_classic(base_size = 13) +
  theme(legend.position = "top")
p_cp
ggsave(here("figures", "exp2_CP_RATIO.png"), p_cp, width = 8, height = 6, dpi = 300)

# --- mvsp plot (RATIO × validity) --------------------------------------------
dat_mvsp$block_label <- paste(dat_mvsp$cond.type, "|", dat_mvsp$acq.time)
mvsp_summary <- summarise_dv(dat_mvsp,
                              c("block_label", "cond.type", "acq.time", "is_valid"),
                              "RATIO")

p_mvsp <- ggplot(mvsp_summary,
                 aes(x = block_label, y = mean_dv, fill = is_valid,
                     ymin = ymin, ymax = ymax)) +
  geom_col(width = 0.7, position = position_dodge(0.8), color = "black") +
  geom_errorbar(width = 0.15, linewidth = 0.8,
                position = position_dodge(0.8), alpha = 0.7) +
  scale_fill_manual(values = c("TRUE" = "peachpuff", "FALSE" = "maroon")) +
  labs(x = "Block", y = "Mean RATIO",
       fill = "Congruent Trial",
       title = "Exp 2: IC vs IP — Validity Effect") +
  theme_classic(base_size = 13) +
  theme(legend.position = "top")
p_mvsp
ggsave(here("figures", "exp2_mvsp_RATIO.png"), p_mvsp, width = 8, height = 6, dpi = 300)

# --- TC plot (log_RATIO) -----------------------------------------------------
dat_tc$block_label <- paste(dat_tc$acq.time, "|", dat_tc$test.time)
tc_summary <- summarise_dv(dat_tc, c("block_label", "acq.time", "test.time"), "log_RATIO")

p_tc <- ggplot(tc_summary,
               aes(x = block_label, y = mean_dv, fill = test.time,
                   ymin = ymin, ymax = ymax)) +
  geom_col(width = 0.7, position = position_dodge(0.8), color = "black") +
  geom_errorbar(width = 0.15, linewidth = 0.8,
                position = position_dodge(0.8), alpha = 0.7) +
  scale_fill_manual(values = palette_acq) +
  labs(x = "Block (Acq | Test)", y = "Mean log(RATIO)",
       fill = "Test Phase Timing",
       title = "Exp 2: Temporal Control — log(RATIO)") +
  theme_classic(base_size = 13) +
  theme(legend.position = "top")
p_tc
ggsave(here("figures", "exp2_TC_logRATIO.png"), p_tc, width = 8, height = 6, dpi = 300)

# =============================================================================
# END OF SCRIPT
# =============================================================================
