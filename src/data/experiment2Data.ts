// ─────────────────────────────────────────────────────────────────────────────
// Experiment 2 — PsychoPy Design Reference Data
// Three condition scripts: IC (Identity Control / "motor"),
//                          TC (Temporal Control),
//                          IP (Identity Prediction / "prediction_block")
//
// KEY DIFFERENCES FROM EXPERIMENT 1
// ──────────────────────────────────
//  • Fixed IEI changed: 550 ms → 650 ms
//  • Random IEI range:  0–1100 ms (Exp 1) → 150–1150 ms (Exp 2 & 3)
//    Thesis section 3.2.1.3: "the random interval to between 150 and 1150ms"
//    The CSV file name "csv--Cond (0- 1.1).csv" refers to the Exp 1 range;
//    Exp 2 uses a different CSV with the updated 150–1150 ms range.
//  • Acquisition trials: 50 → 30  (CSV: 'acq. 30.csv.csv')
//  • Test trials:        50 → 50  (CSV: 'test 50.csv.csv')
//  • Reaction time (space_RT) NOW COLLECTED in IC and TC test phases
//  • Catch trials NOW PRESENT in IC and TC acquisition phases
//    – 6 catch trials per 30 acquisition trials (3 red, 3 green)
//    – Participant asked to recall circle colour (up=red, down=green)
//    – get_catch_trial_perm(totalCount=30, catchCount=6) generates order
//  • Congruency in test: 50/50 (my_random() > 0.5) — still uncontrolled
//    but implemented via a deterministic pseudo-random function
//  • get_color() helper replaces raw random() for IC — maps key→colour
//    and accepts a `consistent` bool flag
//  • IP uses get_color(tone_name, consistent) with tone as first arg
//  • IP uses PTB audio backend + psychtoolbox (ptb.GetSecs()) for precise
//    sound scheduling; tone onset delay is 2.0 s (not 1.3 s as in Exp 1)
//  • IC/TC acquisition: core.wait(); test: time.sleep() — as in Exp 1
//  • Instructions in Turkish (lab language)
//
// EXPERIMENT 3 NOTE
// ─────────────────
//  Experiment 3 is identical to Experiment 2 with ONE change:
//    • Test-phase congruency changes from 50/50 to 80/20
//    • In IC:  is_valid = my_random(trialsLoop) > 0.8  (was > 0.5)
//    • In TC:  same threshold change (> 0.8)
//    • In IP:  is_valid = my_random(trialsLoop) < 0.2  (was < 0.5)
//    • This means 80% of test trials are congruent (valid) in Exp 3
//    • Everything else — trial counts, IEI, catch trials, RT — is identical
//
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant2 {
  code: string;
  acqTiming: "fixed" | "random";
  testTiming: "fixed" | "random";
  isCurrent: boolean;
  switchInstruction: string;
}

export interface TrialPhase2 {
  name: string;
  trials: number;
  timing: string;
  colourRule: string;
  hasReproduction: boolean;
  hasCatchTrials: boolean;
  hasRT: boolean;
  notes: string;
}

export interface ConditionScript2 {
  id: "IC2" | "TC2" | "IP2";
  shortId: "IC" | "TC" | "IP";
  fullName: string;
  tagline: string;
  color: string;
  hasAction: boolean;
  hasMapping: boolean;
  hasTemporalControl: boolean;
  firstEvent: string;
  mappingRule: string | null;
  currentBlock: string;
  newInExp2: string[];
  constants: { name: string; value: string; note: string }[];
  helperFunctions: { name: string; purpose: string; body: string }[];
  blockVariants: BlockVariant2[];
  phases: TrialPhase2[];
  keyDifferences: string[];
  dataColumns: { col: string; phase: string; description: string }[];
  snippets: { label: string; code: string; note?: string }[];
}

// ─── Shared Exp2 parameters ──────────────────────────────────────────────────
export const SHARED_PARAMS_2 = {
  fixedIEI: "650 ms",
  randomRange: "150–1150 ms (uniform) — changed from 0–1100 ms in Exp 1",
  outcomeDuration: "200 ms",
  acquisitionTrials: 30,
  testTrials: 50,
  practiceTrials: 10,
  catchTrialsPerAcq: 6,
  reactionTime: true,
  catchTrials: true,
  testCongruency: "50 / 50 (Exp 2) → 80 / 20 (Exp 3)",
  psychopyVersion: "2021.1.4",
  acqCSV: "acq. 30.csv.csv",
  testCSV: "test 50.csv.csv",
  practiceCSV: "csv--practiceRun2.csv",
};

// ─── Full 6-block structure for Exp2 ─────────────────────────────────────────
export const BLOCK_STRUCTURE_2 = [
  { code: "IC-FF",  condition: "Identity Control",    acq: "Fixed",  test: "Fixed",  script: "IC" },
  { code: "IC-RF",  condition: "Identity Control",    acq: "Random", test: "Fixed",  script: "IC" },
  { code: "IP-FF",  condition: "Identity Prediction", acq: "Fixed",  test: "Fixed",  script: "IP" },
  { code: "IP-RF",  condition: "Identity Prediction", acq: "Random", test: "Fixed",  script: "IP" },
  { code: "TC-RF",  condition: "Temporal Control",    acq: "Random", test: "Fixed",  script: "TC" },
  { code: "TC-FF",  condition: "Temporal Control",    acq: "Fixed",  test: "Fixed",  script: "TC" },
];

// ─── IC2 — Identity Control (Experiment 2) ───────────────────────────────────
const IC2: ConditionScript2 = {
  id: "IC2",
  shortId: "IC",
  fullName: "Identity Control",
  tagline: "Voluntary keypress → get_color() mapping · catch trials · RT now collected",
  color: "violet",
  hasAction: true,
  hasMapping: true,
  hasTemporalControl: true,
  firstEvent: "Voluntary keypress (left / right)",
  mappingRule: "Left → Red · Right → Green via get_color(key, consistent=True)",
  currentBlock: "IC-FF (Block 1)",
  newInExp2: [
    "get_color(pressed_key, consistent) helper replaces raw random() — maps key→colour deterministically",
    "get_catch_trial_perm(30, 6) generates catch trial schedule before acquisition loop",
    "Catch trials: 6 per 30 acquisition trials (3R + 3G) — participant recalls colour (up=red / down=green)",
    "space_RT (reaction time) now recorded in test phase via my_key.rt",
    "Acquisition CSV changed: 'csv--Cond (0- 1.1).csv' → 'acq. 30.csv.csv' (30 trials)",
    "Test CSV: 'csv--Cond (0- 1.1).csv' → 'test 50.csv.csv' (50 trials)",
    "Fixed IEI: 550 ms → 650 ms",
    "Test validity: my_random(trialsLoop) > 0.5 determines is_valid each trial",
    "Warning text in Turkish: 'Dikkat! Bu bölümde sadece sağ ve sol tuşa basmalısınız.'",
    "custom_keyboard.clock.reset() called after test keypress to anchor RT measurement",
  ],
  constants: [
    { name: "stimulus_appearing_time", value: "0.650 s", note: "Fixed IEI (set by get_acquisition/test_stimulus_appearing_time)" },
    { name: "inter_stimulus_interval", value: "0.200 s", note: "Circle display duration (200 ms) — named differently from Exp 1" },
    { name: "quarterToFrame",          value: "(frameDur * 3) / 4", note: "Frame compensation for precise timing" },
    { name: "acq_catch_permutation",   value: "get_catch_trial_perm(30, 6)", note: "Pre-generated catch trial order for acquisition" },
  ],
  helperFunctions: [
    {
      name: "get_color(pressed_key, consistent=True)",
      purpose: "Maps keypress to colour. If consistent=False, flips the mapping (incongruent trial).",
      body: `def get_color(pressed_key, consistent=True):
    isLeft = pressed_key == 'left'
    if not consistent:
        isLeft = not isLeft   # flip for incongruent
    if isLeft:
        return 'red', '#bf4040'
    else:
        return 'green', '#55bf40'

# Usage in acquisition (always congruent):
next_circle_color, fillColor = get_color(key_pressed, is_valid=True)

# Usage in test (50/50 congruency):
is_valid = my_random(trialsLoop) > 0.5
circle_color_name, fillColor = get_color(key_pressed, is_valid)`,
    },
    {
      name: "my_random(trialLoop)",
      purpose: "Deterministic pseudo-random from trial index — ensures balanced congruency across participants.",
      body: `def my_random(trialLoop):
    curr_num = trialLoop.thisTrial['trials']  # trial number column in CSV
    tot_num  = trialLoop.nTotal
    rand_num = (curr_num - 0.5) / tot_num    # maps to (0, 1) uniformly
    return rand_num

# In test phase:
is_valid = my_random(trialsLoop) > 0.5   # 50/50 split
# Exp 3 equivalent:
is_valid = my_random(trialsLoop) > 0.8   # 80/20 split (80% congruent)`,
    },
    {
      name: "get_catch_trial_perm(totalCount, catchCount)",
      purpose: "Generates pre-shuffled catch trial schedule. 3R + 3G interleaved randomly in first 20 trials; last 10 are always non-catch.",
      body: `def get_catch_trial_perm(totalCount, catchCount):
    import numpy as np
    my_list = []
    catchPerColor = int(catchCount / 2)        # 3 red, 3 green
    assert catchPerColor * 2 == catchCount
    for i in range(catchPerColor):
        my_list.append('R')
        my_list.append('G')
    for i in range(totalCount - catchCount - 10):
        my_list.append('0')               # non-catch trials
    my_list = list(np.random.permutation(my_list))  # shuffle first 20
    for i in range(10):
        my_list.append('0')               # last 10 always non-catch
    return my_list

# Initialised before acquisition loop:
acq_catch_permutation = get_catch_trial_perm(30, 6)
acq_red_catch_count   = 0
acq_green_catch_count = 0`,
    },
    {
      name: "get_acquisition_stimulus_appearing_time(trialDict)",
      purpose: "Returns IEI for acquisition. Comment/uncomment to switch blocks.",
      body: `def get_acquisition_stimulus_appearing_time(trialDict):
    # return trialDict['wait_duration_before_circle']  # ← IC-RF (random)
    return 0.650                                        # ← IC-FF (fixed)

def get_test_stimulus_appearing_time(trialDict):
    # return trialDict['wait_duration_before_circle']  # ← not used in IC
    return 0.650                                        # ← always fixed for IC`,
    },
  ],
  blockVariants: [
    {
      code: "IC-FF",
      acqTiming: "fixed",
      testTiming: "fixed",
      isCurrent: true,
      switchInstruction: "Current script — no changes needed.",
    },
    {
      code: "IC-RF",
      acqTiming: "random",
      testTiming: "fixed",
      isCurrent: false,
      switchInstruction:
        "In get_acquisition_stimulus_appearing_time(): UNCOMMENT trialDict line, COMMENT OUT return 0.650.",
    },
  ],
  phases: [
    {
      name: "Practice",
      trials: 10,
      timing: "Random (from CSV)",
      colourRule: "Random — raw random() > 0.5, no get_color() mapping",
      hasReproduction: true,
      hasCatchTrials: false,
      hasRT: false,
      notes: "Familiarisation only. Uses time.sleep() for timing. No catch trials.",
    },
    {
      name: "Acquisition",
      trials: 30,
      timing: "Fixed 650 ms (IC-FF) or Random (IC-RF)",
      colourRule: "100% congruent via get_color(key, consistent=True)",
      hasReproduction: false,
      hasCatchTrials: true,
      hasRT: false,
      notes: "6 catch trials embedded. Space-bar press triggers Turkish warning. core.wait() for timing.",
    },
    {
      name: "Test",
      trials: 50,
      timing: "Fixed 650 ms",
      colourRule: "50/50 congruency via get_color(key, my_random()>0.5) — Exp 3: 80/20",
      hasReproduction: true,
      hasCatchTrials: false,
      hasRT: true,
      notes: "DV: space_pressed_duration (hold). RT: space_RT (onset from after IEI). time.sleep() for timing.",
    },
  ],
  keyDifferences: [
    "get_color() replaces raw random() — congruency is now deterministic and logged as is_valid.",
    "Catch trials in acquisition: 6 of 30 trials ask 'what colour did you see?' (up=red, down=green).",
    "space_RT now collected in test alongside space_pressed_duration.",
    "Acquisition reduced from 50 to 30 trials.",
    "custom_keyboard.clock.reset() after keypress anchors RT measurement correctly.",
    "event.getKeys() flush at start of acquisition loop clears residual presses.",
    "Turkish instruction strings (lab language).",
  ],
  dataColumns: [
    { col: "key_pressed",          phase: "Acq / Test",       description: "'left' or 'right'" },
    { col: "circle_color",         phase: "Acq / Test",       description: "'red' or 'green'" },
    { col: "is_valid",             phase: "Acq / Test",       description: "True if key-colour pair is congruent" },
    { col: "stimulus_appearing_time", phase: "All",           description: "Measured IEI duration (seconds)" },
    { col: "inter_stimulus_interval", phase: "All",           description: "Measured circle display duration (seconds)" },
    { col: "space_pressed_duration", phase: "Practice / Test", description: "Space-bar hold duration = DV (seconds)" },
    { col: "space_RT",             phase: "Test",              description: "Space-bar reaction time from IEI end (seconds)" },
    { col: "catch_trials",         phase: "Acquisition",       description: "True if participant correctly recalled catch colour" },
  ],
  snippets: [
    {
      label: "Acquisition — catch trial logic",
      code: `# Before acquisition loop — generate catch schedule
acq_catch_permutation = get_catch_trial_perm(30, 6)
acq_red_catch_count   = 0
acq_green_catch_count = 0

# Inside each acquisition trial — update catch counters
next_catch_trial_item = acq_catch_permutation[trialsLoop1.thisN]
if next_catch_trial_item == 'R':
    acq_red_catch_count += 1
elif next_catch_trial_item == 'G':
    acq_green_catch_count += 1

should_catch_trial = False

# After keypress & colour assignment:
if next_circle_color == 'red' and acq_red_catch_count > 0:
    acq_red_catch_count -= 1
    should_catch_trial = True
elif next_circle_color == 'green' and acq_green_catch_count > 0:
    acq_green_catch_count -= 1
    should_catch_trial = True

# Show catch question if needed:
if should_catch_trial:
    question = visual.TextStim(win,
        'Az önce gördüğünüz daire hangi renkti?'
        'Kırmızı ise "yukarı"  yeşil ise "aşağı" tuşuna basınız.',
        ...)
    question.draw()
    win.flip()
    core.wait(3.0)
else:
    continueRoutine = False

# Catch response collection:
if should_catch_trial and ('up' in keys or 'down' in keys):
    if next_circle_color == 'red':
        catch_resp = True if 'up' in keys else False
    else:
        catch_resp = True if 'down' in keys else False
    trialsLoop1.addData('catch_trials', catch_resp)
    continueRoutine = False`,
      note: "catch_resp = True means the participant correctly identified the colour. The permutation ensures 3 red + 3 green catch trials spread across the first 20 acquisition trials.",
    },
    {
      label: "Test — RT + space-bar hold collection",
      code: `# In test trial setup:
is_valid = my_random(trialsLoop) > 0.5          # 50/50 — Exp3: > 0.8
circle_color_name, fillColor = get_color(key_pressed, is_valid)
circles.fillColor = fillColor
trialsLoop.addData('circle_color', circle_color_name)
trialsLoop.addData('is_valid', is_valid)

# After IEI + display, reset keyboard clock for RT measurement:
wait_for_space = True
custom_keyboard.clock.reset()    # ← anchors RT from this point

# Space-bar collection:
my_keys = custom_keyboard.getKeys(['space'], waitRelease=True)
if wait_for_space and 'space' in my_keys:
    my_key = my_keys[-1]
    space_pressed_duration = my_key.duration   # hold duration = DV
    space_rt               = my_key.rt         # RT from clock.reset() ← NEW in Exp2
    trialsLoop.addData('space_pressed_duration', space_pressed_duration)
    trialsLoop.addData('space_RT', space_rt)
    continueRoutine = False`,
      note: "space_RT is the time from custom_keyboard.clock.reset() to space press. This was not collected in Exp 1. Exp 3 is identical — only the is_valid threshold changes.",
    },
    {
      label: "get_color() — full logic",
      code: `def get_color(pressed_key, consistent=True):
    isLeft = pressed_key == 'left'
    if not consistent:
        isLeft = not isLeft       # incongruent: flip which side maps to red
    if isLeft:
        return 'red', '#bf4040'
    else:
        return 'green', '#55bf40'

# NOTE: per-participant counterbalancing can flip the mapping by swapping
# the return values:
#     return 'green', '#55bf40'   ← uncomment for counterbalanced mapping
#     return 'red', '#bf4040'     ← comment out

# Acquisition always uses consistent=True (100% valid):
next_circle_color, fillColor = get_color(key_pressed, True)

# Test uses my_random() to determine congruency:
is_valid = my_random(trialsLoop) > 0.5   # Exp 2 — 50/50
# is_valid = my_random(trialsLoop) > 0.8  # Exp 3 — 80/20
circle_color_name, fillColor = get_color(key_pressed, is_valid)`,
    },
  ],
};

// ─── TC2 — Temporal Control (Experiment 2) ───────────────────────────────────
const TC2: ConditionScript2 = {
  id: "TC2",
  shortId: "TC",
  fullName: "Temporal Control",
  tagline: "Voluntary keypress → random colour · catch trials · RT collected · no identity mapping",
  color: "amber",
  hasAction: true,
  hasMapping: false,
  hasTemporalControl: true,
  firstEvent: "Voluntary keypress (left / right)",
  mappingRule: null,
  currentBlock: "TC-RF (Block 2) — Acq: Random, Test: Fixed",
  newInExp2: [
    "Acquisition IEI changed to RANDOM from CSV (TC-RF is the primary Exp 2 block)",
    "get_catch_trial_perm(30, 6) catch trial schedule — same mechanism as IC2",
    "space_RT now recorded in test phase",
    "Acquisition CSV: 'acq. 30.csv.csv' (30 trials)",
    "Test CSV: 'test 50.csv.csv' (50 trials)",
    "Fixed IEI: 550 ms → 650 ms (test phase stays fixed)",
    "my_random() still used for colour in test (purely random, no mapping)",
    "fake_text invisible component added to test routine (Builder artefact)",
    "Turkish instruction strings",
    "get_acquisition_stimulus_appearing_time() returns trialDict['wait_duration_before_circle'] for TC-RF",
  ],
  constants: [
    { name: "stimulus_appearing_time (test)", value: "0.650 s", note: "Fixed test IEI" },
    { name: "stimulus_appearing_time (acq)",  value: "from CSV", note: "Random acq IEI for TC-RF" },
    { name: "inter_stimulus_interval",         value: "0.200 s", note: "Circle display duration" },
    { name: "quarterToFrame",                  value: "(frameDur * 3) / 4", note: "Frame compensation" },
    { name: "acq_catch_permutation",           value: "get_catch_trial_perm(30, 6)", note: "Catch schedule" },
  ],
  helperFunctions: [
    {
      name: "get_acquisition_stimulus_appearing_time(trialDict) — TC-RF",
      purpose: "Returns random IEI from CSV for TC-RF (primary Exp 2 block). Swap comments for TC-FF.",
      body: `def get_acquisition_stimulus_appearing_time(trialDict):
    return trialDict['wait_duration_before_circle']   # ← TC-RF (random) ← CURRENT
    # return 0.650                                     # ← TC-FF (fixed)

def get_test_stimulus_appearing_time(trialDict):
    # return trialDict['wait_duration_before_circle']  # ← not used in TC Exp2
    return 0.650                                        # ← always fixed`,
    },
    {
      name: "my_random(trialLoop) — random colour in TC",
      purpose: "Used for colour assignment in both acquisition AND test (no mapping in TC).",
      body: `def my_random(trialLoop):
    curr_num = trialLoop.thisTrial['trials']
    tot_num  = trialLoop.nTotal
    rand_num = (curr_num - 0.5) / tot_num
    return rand_num

# In acquisition:
if my_random(trialsLoop) > 0.5:
    circle.fillColor = '#bf4040'    # red
    next_circle_color = 'red'
else:
    circle.fillColor = '#55bf40'    # green
    next_circle_color = 'green'

# In test:
if my_random(trialsLoop1) > 0.5:
    circles.fillColor = '#bf4040'
else:
    circles.fillColor = '#55bf40'
# NOTE: no is_valid logged in TC — colour is never 'congruent' with anything`,
    },
    {
      name: "get_catch_trial_perm(totalCount=30, catchCount=6)",
      purpose: "Identical to IC2 implementation — 3R + 3G in first 20 trials, last 10 non-catch.",
      body: `# Same function as IC2 — see IC section for full code
acq_catch_permutation = get_catch_trial_perm(30, 6)
acq_red_catch_count   = 0
acq_green_catch_count = 0

# Catch question (Turkish):
# 'Az önce gördüğünüz daire hangi renkti?'
# 'Kırmızı ise "yukarı"  yeşil ise "aşağı" tuşuna basınız.'
# up = red correct, down = green correct`,
    },
  ],
  blockVariants: [
    {
      code: "TC-RF",
      acqTiming: "random",
      testTiming: "fixed",
      isCurrent: true,
      switchInstruction: "Current script (primary Exp 2 TC block) — no changes needed.",
    },
    {
      code: "TC-FF",
      acqTiming: "fixed",
      testTiming: "fixed",
      isCurrent: false,
      switchInstruction:
        "In get_acquisition_stimulus_appearing_time(): COMMENT OUT trialDict line, UNCOMMENT return 0.650.",
    },
  ],
  phases: [
    {
      name: "Practice",
      trials: 10,
      timing: "Random (from CSV)",
      colourRule: "Random — raw random() > 0.5",
      hasReproduction: true,
      hasCatchTrials: false,
      hasRT: false,
      notes: "Same as IC2 practice. time.sleep() for timing. No catch trials.",
    },
    {
      name: "Acquisition",
      trials: 30,
      timing: "Random from CSV (TC-RF) or Fixed 650 ms (TC-FF)",
      colourRule: "Always random — my_random() > 0.5, NO mapping",
      hasReproduction: false,
      hasCatchTrials: true,
      hasRT: false,
      notes: "6 catch trials. Space warning in Turkish. core.wait() for timing. No is_valid logged.",
    },
    {
      name: "Test",
      trials: 50,
      timing: "Fixed 650 ms",
      colourRule: "Always random — my_random() > 0.5, NO mapping",
      hasReproduction: true,
      hasCatchTrials: false,
      hasRT: true,
      notes: "DV: space_pressed_duration. RT: space_RT. fake_text invisible component present (Builder artefact).",
    },
  ],
  keyDifferences: [
    "No identity mapping — colour is ALWAYS random in both phases.",
    "Acquisition uses RANDOM IEI from CSV (TC-RF is primary Exp 2 block).",
    "my_random() used for colour (not get_color()) — no congruency concept.",
    "Catch trials present in acquisition (same mechanism as IC2).",
    "space_RT collected in test.",
    "fake_text invisible TextStim in test routine — Builder artefact, no functional purpose.",
    "No event.getKeys() flush before test loop (present in Exp1 TC, removed here).",
  ],
  dataColumns: [
    { col: "key_pressed",             phase: "Acq / Test",       description: "'left' or 'right'" },
    { col: "circle_color",            phase: "Acq / Test",       description: "'red' or 'green' (always random)" },
    { col: "stimulus_appearing_time", phase: "All",               description: "Measured IEI duration (seconds)" },
    { col: "inter_stimulus_interval", phase: "All",               description: "Measured circle display duration (seconds)" },
    { col: "space_pressed_duration",  phase: "Practice / Test",  description: "Space-bar hold duration = DV (seconds)" },
    { col: "space_RT",                phase: "Test",              description: "Space-bar reaction time (seconds)" },
    { col: "catch_trials",            phase: "Acquisition",       description: "True if participant correctly recalled catch colour" },
  ],
  snippets: [
    {
      label: "Acquisition — random colour + catch (no mapping)",
      code: `# TC has NO get_color() — colour is always random via my_random()
if not should_catch_trial and ('left' in keys or 'right' in keys):
    key_pressed = 'left' if 'left' in keys else 'right'
    trialsLoop.addData('key_pressed', key_pressed)

    # Random colour — NO congruency mapping in temporal control
    if my_random(trialsLoop) > 0.5:
        circle.fillColor = '#bf4040'
        next_circle_color = 'red'
    else:
        circle.fillColor = '#55bf40'
        next_circle_color = 'green'
    trialsLoop.addData('circle_color', next_circle_color)
    # NOTE: no is_valid logged in TC

    should_catch_trial = False
    if next_circle_color == 'red' and acq_red_catch_count > 0:
        acq_red_catch_count -= 1
        should_catch_trial = True
    elif next_circle_color == 'green' and acq_green_catch_count > 0:
        acq_green_catch_count -= 1
        should_catch_trial = True

    prevTime = timer.getTime()
    core.wait(stimulus_appearing_time - quarterToFrame)
    win.flip()
    trialsLoop.addData('stimulus_appearing_time', timer.getTime() - prevTime)

    circle.fillColor = ''
    prevTime = timer.getTime()
    core.wait(inter_stimulus_interval - quarterToFrame)
    win.flip()
    trialsLoop.addData('inter_stimulus_interval', timer.getTime() - prevTime)

    if should_catch_trial:
        question.draw(); win.flip(); core.wait(3.0)
    else:
        continueRoutine = False`,
      note: "Key difference from IC2: no get_color() call. Colour is fully random. is_valid is not recorded because there is no mapping to be congruent with.",
    },
    {
      label: "Test — random colour + RT + space hold",
      code: `# Test — TC: colour always random, no mapping, RT collected
if wait_for_space == False and ('left' in keys or 'right' in keys):
    key_pressed = 'left' if 'left' in keys else 'right'
    trialsLoop1.addData('key_pressed', key_pressed)

    if my_random(trialsLoop1) > 0.5:
        circles.fillColor = '#bf4040'
        trialsLoop1.addData('circle_color', 'red')
    else:
        circles.fillColor = '#55bf40'
        trialsLoop1.addData('circle_color', 'green')

    prevTime = timer.getTime()
    time.sleep(stimulus_appearing_time - quarterToFrame)
    win.flip()
    trialsLoop1.addData('stimulus_appearing_time', timer.getTime() - prevTime)

    circles.fillColor = ''
    prevTime = timer.getTime()
    time.sleep(inter_stimulus_interval - quarterToFrame)
    win.flip()
    trialsLoop1.addData('inter_stimulus_interval', timer.getTime() - prevTime)

    wait_for_space = True
    custom_keyboard.clock.reset()   # anchor for RT

my_keys = custom_keyboard.getKeys(['space'], waitRelease=True)
if wait_for_space and 'space' in my_keys:
    my_key = my_keys[-1]
    trialsLoop1.addData('space_pressed_duration', my_key.duration)
    trialsLoop1.addData('space_RT', my_key.rt)    # ← NEW in Exp 2
    continueRoutine = False`,
    },
  ],
};

// ─── IP2 — Identity Prediction (Experiment 2) ────────────────────────────────
const IP2: ConditionScript2 = {
  id: "IP2",
  shortId: "IP",
  fullName: "Identity Prediction",
  tagline: "Auditory tone → get_color() mapping · PTB scheduling · catch trials · RT collected",
  color: "emerald",
  hasAction: false,
  hasMapping: true,
  hasTemporalControl: false,
  firstEvent: "Auditory tone (500 Hz low / 1000 Hz high) — passive, auto after 2.0s fixation",
  mappingRule: "Low tone (500 Hz) → Red · High tone (1000 Hz) → Green via get_color(tone_name, consistent)",
  currentBlock: "IP-FF (Block 3) or IP-RF (Block 6)",
  newInExp2: [
    "Tone onset delay increased: 1.3s → 2.0s (sound_start_time = 2.0)",
    "get_color(tone_name, consistent) now takes TONE as first arg (not key) for IP",
    "PTB scheduling: chosen.play(when=ptbNow + sound_start_time - tt) for precise audio onset",
    "import psychtoolbox as ptb; ptb.GetSecs() used for audio scheduling",
    "acquisition_circle_color_random = False; test_circle_color_random = True (module-level flags)",
    "Catch trials present in acquisition (same 6/30 mechanism)",
    "space_rt (lowercase) collected in test phase",
    "IP-RF (Block 6): acquisition IEI = random from CSV",
    "IP-FF (Block 3): acquisition IEI = fixed 650 ms",
    "Fixed IEI: 550 ms → 650 ms",
    "Acquisition CSV: 30 trials; Test CSV: 50 trials",
    "get_tone_and_color() from Exp 1 replaced by get_color(tone_name, consistent) shared helper",
  ],
  constants: [
    { name: "FIXED_IEI_S (stimulus_appearing_time)", value: "0.650 s", note: "Tone offset → circle onset" },
    { name: "inter_stimulus_interval",               value: "0.200 s", note: "Circle display duration" },
    { name: "sound_start_time",                      value: "2.0 s",   note: "Delay from trial start to tone onset (was 1.3s in Exp1)" },
    { name: "sound_finish_time",                     value: "2.2 s",   note: "sound_start_time + 0.2s tone duration" },
    { name: "low_tone",                              value: "500 Hz, 0.2s", note: "Low tone → Red (congruent)" },
    { name: "high_tone",                             value: "1000 Hz, 0.2s", note: "High tone → Green (congruent)" },
    { name: "acquisition_circle_color_random",       value: "False",   note: "Acquisition: congruent (100% valid)" },
    { name: "test_circle_color_random",              value: "True",    note: "Test: randomised (50/50 Exp2, 80/20 Exp3)" },
    { name: "keyboard_wait_start_time",              value: "sound_finish_time + IEI + ISI", note: "Gates reproduction window" },
  ],
  helperFunctions: [
    {
      name: "get_color(tone_name, consistent=True) — IP version",
      purpose: "Maps tone to colour. High→Green, Low→Red when consistent=True.",
      body: `def get_color(tone_name, consistent=True):
    isHigh = tone_name == 'high_tone'
    if not consistent:
        isHigh = not isHigh       # flip for incongruent
    if isHigh:
        return 'green', '#55bf40'
    else:
        return 'red', '#bf4040'

# NOTE: get_color() signature is the SAME as IC2 but first arg is tone not key.
# Counterbalancing: swap the return values for alternate participants.

# Acquisition (always congruent):
is_valid = True
circle_color_name, circle_color = get_color(tone_name, is_valid)

# Test (50/50 congruency — Exp 2):
is_valid = my_random(trialsLoop) < 0.5     # < 0.5 means incongruent
circle_color_name, circle_color = get_color(tone_name, is_valid)
# Exp 3: is_valid = my_random(trialsLoop) < 0.2  → 80% congruent`,
    },
    {
      name: "PTB audio scheduling",
      purpose: "Uses psychtoolbox GetSecs() for sample-accurate tone onset timing.",
      body: `import psychtoolbox as ptb

# Sound objects initialised before experiment:
low_tone  = sound.Sound(500,  sampleRate=44100, secs=0.2, stereo=True)
low_tone.setVolume(1)
high_tone = sound.Sound(1000, sampleRate=44100, secs=0.2, stereo=True)
high_tone.setVolume(1)

# In acquisition/test frame loop — fires once when tt enters tone window:
if (tt + 0.5 >= sound_start_time and tt < sound_finish_time and not sound_playing
        and not catch_trial_response):
    ptbNow = ptb.GetSecs()
    chosen.play(when=ptbNow + sound_start_time - tt)   # scheduled onset
    core.wait(sound_finish_time - tt)                    # wait for finish
    chosen.stop()
    sound_playing = False
    tt = clock.getTime()
    prevTime = tt`,
    },
    {
      name: "get_acquisition_stimulus_appearing_time() — IP-FF / IP-RF",
      purpose: "Switches between fixed and random acquisition IEI.",
      body: `def get_acquisition_stimulus_appearing_time(trialDict):
    return trialDict['wait_duration_before_circle']   # ← IP-RF (random) ← Exp2 Block 6
    # return 0.650                                     # ← IP-FF (fixed)  ← Exp2 Block 3

def get_test_stimulus_appearing_time(trialDict):
    # return trialDict['wait_duration_before_circle']  # ← not used in IP
    return 0.650                                        # ← always fixed`,
    },
    {
      name: "get_catch_trial_perm(30, 6) — same as IC2/TC2",
      purpose: "Generates catch trial schedule. Identical function across all Exp2 conditions.",
      body: `acq_catch_permutation = get_catch_trial_perm(30, 6)
acq_red_catch_count   = 0
acq_green_catch_count = 0

# In acquisition, after colour is determined:
should_catch_trial = False
if circle_color_name == 'red' and acq_red_catch_count > 0:
    acq_red_catch_count -= 1
    should_catch_trial = True
elif circle_color_name == 'green' and acq_green_catch_count > 0:
    acq_green_catch_count -= 1
    should_catch_trial = True

# catch_trial_response flag prevents re-triggering in frame loop`,
    },
  ],
  blockVariants: [
    {
      code: "IP-FF",
      acqTiming: "fixed",
      testTiming: "fixed",
      isCurrent: false,
      switchInstruction:
        "In get_acquisition_stimulus_appearing_time(): COMMENT OUT trialDict line, UNCOMMENT return 0.650.",
    },
    {
      code: "IP-RF",
      acqTiming: "random",
      testTiming: "fixed",
      isCurrent: true,
      switchInstruction: "Current script (Block 6) — get_acquisition returns trialDict[...]. No changes needed.",
    },
  ],
  phases: [
    {
      name: "Practice",
      trials: 10,
      timing: "Random (from CSV)",
      colourRule: "test_circle_color_random=True → random; tone also random",
      hasReproduction: true,
      hasCatchTrials: false,
      hasRT: false,
      notes: "Tone after 2.0s fixation. PTB scheduling. keyboard_wait_start_time gates reproduction. No catch trials.",
    },
    {
      name: "Acquisition",
      trials: 30,
      timing: "Fixed 650 ms (IP-FF) or Random from CSV (IP-RF)",
      colourRule: "acquisition_circle_color_random=False → 100% congruent via get_color()",
      hasReproduction: false,
      hasCatchTrials: true,
      hasRT: false,
      notes: "6 catch trials. catch_trial_response flag prevents double-trigger. Tone triggers automatically.",
    },
    {
      name: "Test",
      trials: 50,
      timing: "Fixed 650 ms",
      colourRule: "test_circle_color_random=True → 50/50 via get_color(tone, my_random()<0.5) — Exp 3: 80/20",
      hasReproduction: true,
      hasCatchTrials: false,
      hasRT: true,
      notes: "DV: space_pressed_duration. RT: space_rt. keyboard_wait_start_time gates acceptance. PTB scheduling.",
    },
  ],
  keyDifferences: [
    "NO voluntary action — tone triggers automatically after 2.0s fixation (was 1.3s in Exp1).",
    "PTB backend + ptb.GetSecs() for sample-accurate audio scheduling.",
    "get_color(tone_name, consistent) — same function name as IC2 but first arg is tone_name.",
    "acquisition_circle_color_random and test_circle_color_random flags control phase behaviour.",
    "catch_trial_response flag prevents the tone-trigger block re-entering after a catch.",
    "space_rt (lowercase) logged in test — note naming differs from IC2's space_RT.",
    "keyboard_wait_start_time = sound_finish_time + IEI + ISI gates the reproduction window.",
    "Exp 3: only threshold changes: my_random() < 0.2 (was < 0.5) for 80% congruency.",
  ],
  dataColumns: [
    { col: "tone_name",               phase: "All",               description: "'high_tone' or 'low_tone'" },
    { col: "circle_color_name",       phase: "All",               description: "'red' or 'green'" },
    { col: "is_valid",                phase: "Acq / Test",       description: "True if tone-colour pair is congruent" },
    { col: "stimulus_appearing_time_onset", phase: "Acq / Test", description: "trial clock at tone offset (IEI start)" },
    { col: "stimulus_appearing_time", phase: "All",               description: "Measured IEI duration (seconds)" },
    { col: "inter_stimulus_interval", phase: "All",               description: "Measured circle display duration (seconds)" },
    { col: "space_pressed_duration",  phase: "Practice / Test",  description: "Space-bar hold duration = DV (seconds)" },
    { col: "space_rt",                phase: "Test",              description: "Space-bar RT from keyboard clock reset (seconds)" },
    { col: "catch_trials",            phase: "Acquisition",       description: "True if participant correctly recalled catch colour" },
  ],
  snippets: [
    {
      label: "Sound setup — PTB backend + psychtoolbox",
      code: `from psychopy import locale_setup, prefs
from psychopy import sound, gui, visual, core, data, event, logging, clock, colors
# NOTE: in Exp2 IP, prefs is set AFTER import (different from Exp1 IP where it was before)
# This works because PTB is set before sound objects are created.

import psychtoolbox as ptb   # ← NEW in Exp 2

low_tone  = sound.Sound(500,  sampleRate=44100, secs=0.2, stereo=True)
low_tone.setVolume(1)
high_tone = sound.Sound(1000, sampleRate=44100, secs=0.2, stereo=True)
high_tone.setVolume(1)
custom_keyboard = keyboard.Keyboard()

# Module-level flags:
acquisition_circle_color_random = False   # 100% congruent in acq
test_circle_color_random         = True    # 50/50 random in test (Exp 2)

sound_start_time  = 2.0    # tone onset delay (seconds from trial start)
sound_finish_time = 2.2    # = sound_start_time + tone_duration`,
      note: "PTB scheduling uses ptb.GetSecs() to get the current system time in PTB units, then schedules the tone onset precisely.",
    },
    {
      label: "Acquisition — congruent tone→colour + catch",
      code: `# Tone name chosen randomly, colour determined by get_color() (congruent)
tone_name = 'high_tone' if my_random(trialsLoop1) > 0.5 else 'low_tone'

if acquisition_circle_color_random:
    # Not used in Exp 2 acquisition (flag = False)
    circle_color = '#bf4040' if random() > 0.5 else '#55bf40'
    is_valid = (tone_name == 'high_tone' and circle_color_name == 'green') or \
               (tone_name == 'low_tone'  and circle_color_name == 'red')
else:
    is_valid = True
    circle_color_name, circle_color = get_color(tone_name, is_valid)

trialsLoop1.addData('tone_name',         tone_name)
trialsLoop1.addData('circle_color_name', circle_color_name)
trialsLoop1.addData('is_valid',          is_valid)

# PTB-scheduled tone → IEI → circle → (catch?) sequence:
if (tt + 0.5 >= sound_start_time and tt < sound_finish_time
        and not sound_playing and not catch_trial_response):
    ptbNow = ptb.GetSecs()
    chosen.play(when=ptbNow + sound_start_time - tt)
    core.wait(sound_finish_time - tt)
    chosen.stop()
    sound_playing = False

    circle.fillColor = circle_color
    core.wait(stimulus_appearing_time - quarterToFrame)
    win.flip()
    # ... catch trial logic, then continueRoutine = False`,
      note: "catch_trial_response flag is set to True after a catch response, preventing the sound block from re-triggering in the same trial.",
    },
    {
      label: "Test — 50/50 congruency + RT + space hold",
      code: `# Test — IP: tone triggers, congruency randomised
tone_name = 'high_tone' if random() > 0.5 else 'low_tone'
is_valid  = my_random(trialsLoop) < 0.5     # 50/50 → Exp3: < 0.2 for 80/20
circle_color_name, circle_color = get_color(tone_name, is_valid)

trialsLoop.addData('tone_name',         tone_name)
trialsLoop.addData('circle_color_name', circle_color_name)
trialsLoop.addData('is_valid',          is_valid)
trialsLoop.addData('stimulus_appearing_time', stimulus_appearing_time)

keyboard_wait_start_time = sound_finish_time + stimulus_appearing_time + inter_stimulus_interval

# Inside frame loop — after tone+IEI+display:
my_keys = custom_keyboard.getKeys(['space'], waitRelease=True)
if tt > keyboard_wait_start_time and 'space' in my_keys:
    my_key = my_keys[-1]
    trialsLoop.addData('space_pressed_duration', my_key.duration)
    trialsLoop.addData('space_rt',               my_key.rt)   # lowercase in IP2
    continueRoutine = False`,
      note: "Note: IP2 uses space_rt (lowercase) while IC2/TC2 use space_RT (uppercase). Check column names when merging datasets.",
    },
    {
      label: "Block switching — IP-FF ↔ IP-RF",
      code: `# ── get_acquisition_stimulus_appearing_time() ───────────────────────────────
#
# IP-RF / Block 6 (current script — random acquisition):
def get_acquisition_stimulus_appearing_time(trialDict):
    return trialDict['wait_duration_before_circle']   # ← CURRENT for IP-RF
    # return 0.650                                     # ← COMMENT OUT for IP-RF

# IP-FF / Block 3 (fixed acquisition):
def get_acquisition_stimulus_appearing_time(trialDict):
    # return trialDict['wait_duration_before_circle']  # ← UNCOMMENT for IP-RF
    return 0.650                                        # ← IP-FF fixed`,
    },
  ],
};

export const conditions2: ConditionScript2[] = [IC2, TC2, IP2];

// ─── Cross-condition comparison (Exp 2) ──────────────────────────────────────
export const comparisonTable2 = [
  {
    feature: "First event",
    IC: "Voluntary keypress",
    TC: "Voluntary keypress",
    IP: "Auditory tone (auto, 2.0s delay)",
  },
  {
    feature: "Identity mapping",
    IC: "✅ get_color(key, consistent)",
    TC: "❌ No (always random)",
    IP: "✅ get_color(tone, consistent)",
  },
  {
    feature: "Temporal control",
    IC: "✅ Yes (action-triggered)",
    TC: "✅ Yes (action-triggered)",
    IP: "❌ No (passive)",
  },
  {
    feature: "Acq IEI",
    IC: "Fixed 650 ms (FF) / Random (RF)",
    TC: "Random from CSV (RF) / Fixed (FF)",
    IP: "Fixed 650 ms (FF) / Random (RF)",
  },
  {
    feature: "Test IEI",
    IC: "Fixed 650 ms",
    TC: "Fixed 650 ms",
    IP: "Fixed 650 ms",
  },
  {
    feature: "Acq validity",
    IC: "100% congruent",
    TC: "N/A (always random)",
    IP: "100% congruent",
  },
  {
    feature: "Test validity (Exp 2)",
    IC: "50/50 via my_random()>0.5",
    TC: "N/A (always random)",
    IP: "50/50 via my_random()<0.5",
  },
  {
    feature: "Test validity (Exp 3)",
    IC: "80/20 via my_random()>0.8",
    TC: "N/A",
    IP: "80/20 via my_random()<0.2",
  },
  {
    feature: "Acquisition trials",
    IC: "30",
    TC: "30",
    IP: "30",
  },
  {
    feature: "Test trials",
    IC: "50",
    TC: "50",
    IP: "50",
  },
  {
    feature: "Catch trials (acq)",
    IC: "✅ 6 / 30",
    TC: "✅ 6 / 30",
    IP: "✅ 6 / 30",
  },
  {
    feature: "RT collected",
    IC: "✅ space_RT",
    TC: "✅ space_RT",
    IP: "✅ space_rt",
  },
  {
    feature: "Audio required",
    IC: "❌ No",
    TC: "❌ No",
    IP: "✅ PTB backend + psychtoolbox",
  },
  {
    feature: "Tone onset delay",
    IC: "N/A",
    TC: "N/A",
    IP: "2.0 s (was 1.3 s in Exp 1)",
  },
  {
    feature: "Block variants",
    IC: "2 (FF, RF)",
    TC: "2 (RF primary, FF secondary)",
    IP: "2 (FF=Block3, RF=Block6)",
  },
];
