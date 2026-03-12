# =============================================================================
# Experiment 3: Temporal Binding — REACTION TIME Analysis
# =============================================================================
# Author      : Oz
# Project     : MA Thesis — Temporal Binding & Predictive Mechanisms
# Department  : Cognitive Science
# Description : Linear Mixed Model (LMM) analysis of log-transformed reaction
#               times (RT) for Experiment 3 (n = 41; 3 excluded from 44 for non-completion).
#               Analysis subset: IC vs IP (Identity Control vs Identity Prediction)
#               Predictors     : cond.type × acq.time × is_valid
#               DV             : log(space_RT)
#
# Rationale:
#   RT is collected as a manipulation check — it captures forward action model
#   effects (faster responses to congruent outcomes) that do not generalise to
#   binding magnitude. Exp 3 uses 80% congruent / 20% incongruent test trials.
#   Finding: cond.type main effect significant (faster RT in IC than IP);
#            validity IS significant: faster RT for congruent trials (three-way interaction)
#
# Statistical approach:
#   - Forward and backward model selection via LRT (ML estimation)
#   - Type III LRT via afex::mixed()
#   - Sum contrast coding throughout
#   - Outlier trimming: ±2.5 SD on winning model residuals
# =============================================================================

# =============================================================================
# SECTION 0: Libraries & Setup
# =============================================================================

library(here)
library(tidyverse)
library(lme4)
library(car)
library(afex)

set.seed(42)
sessionInfo()

# =============================================================================
# SECTION 1: Data Loading
# =============================================================================

dat_raw <- read.csv(
  here("data", "exp3_data_n41.csv"),
  header = TRUE
)
dat_raw <- as_tibble(dat_raw)

# =============================================================================
# SECTION 2: Data Wrangling
# =============================================================================

dat_exp3 <- dat_raw %>%
  mutate(
    cond.type = case_when(
      condition %in% c("IC-FF", "IC-RF") ~ "IC",
      condition %in% c("IP-FF", "IP-RF") ~ "IP",
      condition %in% c("TC-RR", "TC-FR", "TC-RF", "TC-FF") ~ "TC"
    ),
    acq.time = case_when(
      condition %in% c("IC-FF", "IP-FF", "TC-FF", "TC-FR") ~ "fixed",
      condition %in% c("IC-RF", "IP-RF", "TC-RR", "TC-RF") ~ "random"
    )
  ) %>%
  mutate_at(
    vars(condition, is_valid, cond.type, acq.time, participant),
    as.factor
  ) %>%
  # RT outlier exclusion: < 100 ms or > 2000 ms
  filter(!is.na(space_RT)) %>%
  filter(space_RT >= 100, space_RT <= 2000) %>%
  mutate(log_space_RT = log(space_RT))

# Sanity check
stopifnot(n_distinct(dat_exp3$participant) == 41)
message("✓ n = ", n_distinct(dat_exp3$participant), " participants.")
message("✓ RT outliers removed (< 100 ms or > 2000 ms).")

# =============================================================================
# SECTION 3: Subset — IC vs IP only
# =============================================================================

dat_rt <- dat_exp3 %>%
  filter(cond.type %in% c("IC", "IP"))

# Apply sum contrasts
apply_sum_contrasts <- function(df, vars) {
  for (v in vars) {
    contrasts(df[[v]]) <- contr.sum(nlevels(df[[v]]))
  }
  df
}

dat_rt <- apply_sum_contrasts(dat_rt, c("cond.type", "acq.time", "is_valid"))

# Confirm contrasts
print(contrasts(dat_rt$cond.type))
print(contrasts(dat_rt$acq.time))
print(contrasts(dat_rt$is_valid))

# =============================================================================
# SECTION 4: RT Analysis — cond.type × acq.time × is_valid
# DV: log_space_RT
# =============================================================================

message("\n--- RT Analysis: IC vs IP ---")

# Forward selection
rt_null <- lmer(log_space_RT ~ 1 + (1 + cond.type + acq.time | participant),
                dat_rt, REML = FALSE, na.action = na.exclude)

rt_m1 <- update(rt_null, . ~ . + cond.type)
anova(rt_null, rt_m1)

rt_m2 <- update(rt_m1, . ~ . + acq.time)
anova(rt_m1, rt_m2)

rt_m3 <- update(rt_m2, . ~ . + is_valid)
anova(rt_m2, rt_m3)

rt_m4 <- update(rt_m3, . ~ . + cond.type:acq.time)
anova(rt_m3, rt_m4)

rt_m5 <- update(rt_m4, . ~ . + cond.type:is_valid)
anova(rt_m4, rt_m5)

rt_m6 <- update(rt_m5, . ~ . + acq.time:is_valid)
anova(rt_m5, rt_m6)

rt_m7 <- update(rt_m6, . ~ . + cond.type:acq.time:is_valid)
anova(rt_m6, rt_m7)
summary(rt_m7)$coef

# Backward selection (confirmatory)
rt_full <- lmer(log_space_RT ~ cond.type * acq.time * is_valid +
                  (1 + cond.type + acq.time | participant),
                dat_rt, REML = FALSE, na.action = na.exclude)

rt_bk1 <- update(rt_full, . ~ . - cond.type:acq.time:is_valid)
anova(rt_full, rt_bk1)

rt_bk2 <- update(rt_bk1, . ~ . - cond.type:acq.time)
anova(rt_bk1, rt_bk2)

rt_bk3 <- update(rt_bk1, . ~ . - cond.type:is_valid)
anova(rt_bk1, rt_bk3)

rt_bk4 <- update(rt_bk1, . ~ . - acq.time:is_valid)
anova(rt_bk1, rt_bk4)

# Random effects selection
rt_rand1 <- lmer(log_space_RT ~ cond.type * acq.time * is_valid +
                   (1 + cond.type | participant),
                 dat_rt, REML = TRUE, na.action = na.exclude)
rt_rand2 <- lmer(log_space_RT ~ cond.type * acq.time * is_valid +
                   (1 + cond.type + acq.time | participant),
                 dat_rt, REML = TRUE, na.action = na.exclude)
anova(rt_rand1, rt_rand2, refit = FALSE)

rt_best <- rt_rand2

# Outlier trimming
dat_rt_trim <- dat_rt[abs(scale(resid(rt_best))) < 2.5, ]
rt_trim <- update(rt_best, data = dat_rt_trim)
summary(rt_trim)$coef

# Type III LRT via afex
rt_afex <- mixed(
  log_space_RT ~ cond.type * acq.time * is_valid +
    (1 + cond.type + acq.time | participant),
  data = dat_rt, method = "LRT"
)
rt_afex

# Assumption checks
qqnorm(resid(rt_full)); qqline(resid(rt_full))
plot(fitted(rt_full), resid(rt_full),
     xlab = "Fitted", ylab = "Residuals", main = "RT Exp2: Fitted vs Residuals")

# =============================================================================
# SECTION 5: Visualisation
# =============================================================================

palette_acq <- c("fixed" = "peachpuff", "random" = "maroon")

dat_rt$block_label <- paste(dat_rt$cond.type, "|", dat_rt$acq.time)

rt_summary <- dat_rt %>%
  group_by(block_label, cond.type, acq.time, is_valid) %>%
  summarise(
    mean_rt = mean(log_space_RT, na.rm = TRUE),
    se_rt   = sd(log_space_RT, na.rm = TRUE) / sqrt(n()),
    ymin    = mean_rt - se_rt,
    ymax    = mean_rt + se_rt,
    .groups = "drop"
  )

p_rt <- ggplot(rt_summary,
               aes(x = block_label, y = mean_rt, fill = is_valid,
                   ymin = ymin, ymax = ymax)) +
  geom_col(width = 0.7, position = position_dodge(0.8), color = "black") +
  geom_errorbar(width = 0.15, linewidth = 0.8,
                position = position_dodge(0.8), alpha = 0.7) +
  scale_fill_manual(values = c("TRUE" = "peachpuff", "FALSE" = "maroon")) +
  labs(x = "Block", y = "Mean log(RT) in ms",
       fill = "Congruent Trial",
       title = "Exp 3: Reaction Time — IC vs IP") +
  theme_classic(base_size = 13) +
  theme(legend.position = "top")
p_rt
ggsave(here("figures", "exp3_RT_IC_vs_IP.png"), p_rt, width = 8, height = 6, dpi = 300)

# =============================================================================
# END OF SCRIPT
# =============================================================================
